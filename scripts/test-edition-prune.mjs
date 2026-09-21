import assert from 'node:assert/strict';
import { test } from 'node:test';
import { access, cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPlan, listBackups, planEdition, restoreEdition } from './edition-prune-lib.mjs';

const project = await realpath(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
const exec = promisify(execFile);
const presets = JSON.parse(await readFile(new URL('./edition-presets.json', import.meta.url), 'utf8'));
const noop = async () => {};
async function fixture(t) {
  const root = await mkdtemp(path.join(project, '.edition-test-'));
  t.after(async () => {
    // Never recursively remove anything except this test's own direct child directory.
    if (path.dirname(root) !== project || !path.basename(root).startsWith('.edition-test-')) throw new Error('Unsafe fixture cleanup');
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(path.join(root, 'src/modules'), { recursive: true });
  return root;
}
async function module(root, name, dependencies = []) {
  const dir = path.join(root, 'src/modules', name);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'module.json'), JSON.stringify({ name, dependencies, routes: [], menus: [] }));
  await writeFile(path.join(dir, 'page.tsx'), `// ${name}: uncommitted content\n`);
}

test('preview does not write, dependencies are retained, restore preserves later edits', async t => {
  const root = await fixture(t);
  await module(root, 'content', ['media']); await module(root, 'media'); await module(root, 'erp');
  const plan = await planEdition(root, 'cms', { cms: { label: 'CMS', modules: ['content'] } });
  assert.deepEqual(plan.keep, ['content', 'media']); assert.deepEqual(plan.autoKept, ['media']);
  assert.deepEqual(await listBackups(root), []);
  const original = await readFile(path.join(root, 'src/modules/erp/page.tsx'));
  await applyPlan(plan, noop);
  await assert.rejects(access(path.join(root, 'src/modules/erp')));
  await writeFile(path.join(root, 'src/modules/content/page.tsx'), '// later changes');
  await restoreEdition(root, undefined, noop, true);
  await assert.rejects(access(path.join(root, 'src/modules/erp')));
  await restoreEdition(root, undefined, noop);
  assert.deepEqual(await readFile(path.join(root, 'src/modules/erp/page.tsx')), original);
  assert.equal(await readFile(path.join(root, 'src/modules/content/page.tsx'), 'utf8'), '// later changes');
});

test('stale plans, unknown presets and missing dependencies are rejected before deletion', async t => {
  const root = await fixture(t);
  await module(root, 'content'); await module(root, 'erp');
  await assert.rejects(planEdition(root, 'unknown', presets));
  const plan = await planEdition(root, 'saas', presets);
  await writeFile(path.join(root, 'src/modules/erp/page.tsx'), '// changed since preview');
  await assert.rejects(applyPlan(plan, noop), /预览后模块已修改/);
  await module(root, 'content', ['missing']);
  await assert.rejects(planEdition(root, 'saas', presets), /缺少依赖/);
  assert.deepEqual(await listBackups(root), []);
});

test('restoration refuses conflicts and damaged backups; stacked pruning restores in reverse order', async t => {
  const root = await fixture(t);
  await module(root, 'content'); await module(root, 'media'); await module(root, 'erp');
  const first = await applyPlan(await planEdition(root, 'saas', presets), noop);
  const second = await applyPlan(await planEdition(root, 'minimal', presets), noop);
  await assert.rejects(restoreEdition(root, first.id, noop), /逆序/);
  await restoreEdition(root, second.id, noop);
  await module(root, 'erp');
  await assert.rejects(restoreEdition(root, first.id, noop), /恢复冲突/);
  const conflict = path.join(root, 'src/modules/erp');
  assert.equal(path.dirname(conflict), path.join(root, 'src/modules'));
  await rm(conflict, { recursive: true });
  const file = path.join(root, '.edition-backups', first.id, 'modules/erp/page.tsx');
  const original = await readFile(file);
  await writeFile(file, 'damaged');
  await assert.rejects(restoreEdition(root, first.id, noop), /备份损坏/);
  await writeFile(file, original);
  await restoreEdition(root, first.id, noop);
  assert.deepEqual((await readdir(path.join(root, 'src/modules'))).sort(), ['content', 'erp', 'media']);
});

test('generator failures leave recoverable snapshots and interrupted restores can resume', async t => {
  const root = await fixture(t);
  await module(root, 'content'); await module(root, 'erp');
  const fail = async () => { throw new Error('generator failed'); };
  await assert.rejects(applyPlan(await planEdition(root, 'saas', presets), fail), /备份/);
  await assert.rejects(restoreEdition(root, undefined, fail), /generator failed/);
  await restoreEdition(root, undefined, noop);
  await access(path.join(root, 'src/modules/erp/page.tsx'));
  assert.equal((await listBackups(root))[0].status, 'restored');
});

test('directory junctions cannot be pruned', async t => {
  const root = await fixture(t);
  const outside = path.join(root, 'protected');
  await mkdir(outside);
  await writeFile(path.join(outside, 'keep.txt'), 'protected');
  await symlink(outside, path.join(root, 'src/modules/linked'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(planEdition(root, 'minimal', presets), /符号链接/);
  assert.equal(await readFile(path.join(outside, 'keep.txt'), 'utf8'), 'protected');
});

if (process.argv.includes('--build')) test('real source copy builds as SaaS and restores all original modules', async t => {
  const root = await fixture(t);
  await cp(path.join(project, 'src'), path.join(root, 'src'), { recursive: true });
  await mkdir(path.join(root, 'scripts'));
  await cp(path.join(project, 'scripts/gen-registry.mjs'), path.join(root, 'scripts/gen-registry.mjs'));
  for (const name of ['package.json', 'index.html', 'vite.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'auto-imports.d.ts']) {
    await cp(path.join(project, name), path.join(root, name));
  }
  await symlink(path.join(project, 'node_modules'), path.join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  // Remove the dependency link explicitly before recursive fixture cleanup.
  t.after(async () => { /* rm on junctions unlinks the junction itself, never its target. */ });
  const before = (await readdir(path.join(root, 'src/modules'))).sort();
  const generate = () => exec(process.execPath, ['scripts/gen-registry.mjs'], { cwd: root });
  await applyPlan(await planEdition(root, 'saas', presets), generate);
  assert.deepEqual((await readdir(path.join(root, 'src/modules'))).sort(), ['ai', 'analytics', 'content', 'marketing', 'media', 'operations']);
  await exec(process.execPath, [path.join(project, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: root, maxBuffer: 4 * 1024 * 1024 });
  await restoreEdition(root, undefined, generate);
  assert.deepEqual((await readdir(path.join(root, 'src/modules'))).sort(), before);
});
