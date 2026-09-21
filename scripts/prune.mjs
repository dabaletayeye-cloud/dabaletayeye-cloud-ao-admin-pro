import { access, readdir, readFile, rm, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceModules = path.join(projectRoot, 'src', 'modules');
const backendCandidates = [
  path.resolve(projectRoot, '..', '..', 'JavaProject', 'ao-admin-pro-springboot'),
  path.resolve(projectRoot, '..', 'ao-admin-pro-springboot'),
];
let backendModules = path.join(backendCandidates[0], 'src', 'main', 'resources', 'modules');
for (const candidate of backendCandidates) {
  try { await access(candidate); backendModules = path.join(candidate, 'src', 'main', 'resources', 'modules'); break; } catch { /* optional backend workspace */ }
}
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyCore = args.includes('--only-core');
const allowDirty = args.includes('--allow-dirty');

function option(name) {
  const directIndex = args.findIndex((arg) => arg === name);
  if (directIndex >= 0) return args[directIndex + 1] && !args[directIndex + 1].startsWith('--') ? args[directIndex + 1] : '';
  const prefix = `${name}=`;
  const item = args.find((arg) => arg.startsWith(prefix));
  return item ? item.slice(prefix.length) : undefined;
}

function parseIds(value) {
  if (value === undefined) return undefined;
  return [...new Set(value.split(/[\s,]+/).map((item) => item.trim()).filter(Boolean))];
}

async function moduleIds() {
  let entries;
  try { entries = await readdir(sourceModules, { withFileTypes: true }); } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const ids = [];
  for (const entry of entries.filter((item) => item.isDirectory())) {
    try { await access(path.join(sourceModules, entry.name, 'module.json')); ids.push(entry.name); } catch { /* ignore incomplete folders */ }
  }
  return ids.sort();
}

async function checkDirty() {
  try {
    const { stdout } = await execFileAsync('git', ['status', '--short', '--untracked-files=all'], { cwd: projectRoot });
    const dirty = stdout.trim().length > 0;
    if (dirty) console.warn('检测到未提交的 Git 修改，裁剪操作可能影响这些文件。');
    if (dirty && !allowDirty && !dryRun) throw new Error('请先提交/备份修改，或显式传入 --allow-dirty。');
  } catch (error) {
    if (error.code === 'ENOENT') return;
    if (error.message?.includes('请先提交')) throw error;
    console.warn(`Git 状态检查失败：${error.message}`);
  }
}

const ids = await moduleIds();
if (!ids.length) {
  console.log('未发现可裁剪模块。');
  process.exit(0);
}

let keep = parseIds(option('--keep'));
if (onlyCore) keep = [];
if (keep === undefined) {
  if (args.includes('--yes')) keep = ids;
  else {
    const readline = createInterface({ input: process.stdin, output: process.stdout });
    try {
      const answer = await readline.question(`可保留模块（逗号或空格分隔；直接回车表示仅 core）：${ids.join(', ')}\n> `);
      keep = parseIds(answer) ?? [];
    } finally { readline.close(); }
  }
}

const unknown = keep.filter((id) => !ids.includes(id));
if (unknown.length) throw new Error(`未知模块：${unknown.join(', ')}。可选：${ids.join(', ')}`);
await checkDirty();
const remove = ids.filter((id) => !keep.includes(id));
console.log(`保留：core${keep.length ? ` + ${keep.join(' + ')}` : ''}`);
console.log(`删除：${remove.length ? remove.join(', ') : '无'}`);
if (dryRun) {
  console.log('预览模式：未修改任何文件。');
  process.exit(0);
}

for (const id of remove) {
  const target = path.resolve(sourceModules, id);
  if (path.dirname(target) !== sourceModules) throw new Error(`拒绝删除异常路径：${target}`);
  await rm(target, { recursive: true, force: true });
  const backendTarget = path.resolve(backendModules, id);
  if (backendTarget.startsWith(`${backendModules}${path.sep}`)) {
    try { if ((await stat(backendTarget)).isDirectory()) await rm(backendTarget, { recursive: true, force: true }); } catch { /* optional backend manifests */ }
  }
}
await execFileAsync(process.platform === 'win32' ? 'node.exe' : 'node', ['scripts/gen-registry.mjs'], { cwd: projectRoot });
console.log('已重新生成 src/generated/registry.ts。');
console.log('后端模块通过 APP_ENABLED_MODULES 控制；例如仅 ERP：APP_ENABLED_MODULES=commerce。');
