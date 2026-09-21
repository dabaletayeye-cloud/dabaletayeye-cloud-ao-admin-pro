import { access, cp, mkdir, readFile, readdir, lstat, realpath, rm, rmdir, writeFile, rename } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';

const backupFolder = '.edition-backups';
const validId = /^[a-z][a-z0-9_-]*$/;
const exists = async file => { try { await access(file); return true; } catch (e) { if (e.code === 'ENOENT') return false; throw e; } };

// All destructive paths must be direct module children in this exact workspace.
async function checkedModule(root, id) {
  if (!validId.test(id)) throw new Error(`非法模块名称：${id}`);
  const base = path.join(root, 'src', 'modules');
  const target = path.resolve(base, id);
  if (path.dirname(target) !== base) throw new Error(`模块路径越界：${target}`);
  await rejectLinks(root, base);
  await rejectLinks(root, target);
  return target;
}

async function rejectLinks(root, target) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`路径越界：${target}`);
  let current = root;
  for (const part of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (await exists(current) && (await lstat(current)).isSymbolicLink()) throw new Error(`不处理符号链接或目录联接：${current}`);
  }
}

async function fingerprints(directory) {
  const result = {};
  async function walk(dir, prefix = '') {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      const key = prefix + entry.name;
      const stat = await lstat(file);
      if (stat.isSymbolicLink()) throw new Error(`不处理符号链接：${file}`);
      if (stat.isDirectory()) { result[key + '/'] = 'directory'; await walk(file, key + '/'); }
      else if (stat.isFile()) result[key] = createHash('sha256').update(await readFile(file)).digest('hex');
      else throw new Error(`不支持的文件类型：${file}`);
    }
  }
  await walk(directory);
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
}

async function save(file, value) {
  const temp = file + '.tmp';
  await writeFile(temp, JSON.stringify(value, null, 2) + '\n');
  await rename(temp, file);
}

export async function planEdition(projectRoot, edition, presets) {
  const root = await realpath(projectRoot);
  const preset = presets[edition];
  if (!preset) throw new Error(`未知版本：${edition}`);
  const modules = new Map();
  const base = path.join(root, 'src/modules');
  await rejectLinks(root, base);
  for (const entry of await readdir(base, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`不处理符号链接：${entry.name}`);
    if (!entry.isDirectory()) continue;
    const directory = await checkedModule(root, entry.name);
    const file = path.join(directory, 'module.json');
    if (!await exists(file)) continue;
    const manifest = JSON.parse(await readFile(file, 'utf8'));
    if (manifest.name !== entry.name) throw new Error(`模块名称与目录不一致：${entry.name}`);
    modules.set(entry.name, manifest);
  }
  const wanted = preset.modules === '*' ? [...modules.keys()] : preset.modules;
  const keep = new Set(wanted.filter(id => modules.has(id)));
  // Server is an entry inside operations in the current project. Keep its owner;
  // runtime edition filtering exposes only the server entry for devplatform.
  if (wanted.includes('server') && !modules.has('server')) {
    for (const [id, manifest] of modules) if (manifest.routes?.some(route => route.path === '/system/servers')) keep.add(id);
  }
  const requested = [...keep];
  const visit = id => {
    for (const dependency of modules.get(id)?.dependencies ?? []) {
      if (dependency === 'core') continue;
      if (!modules.has(dependency)) throw new Error(`模块 ${id} 缺少依赖 ${dependency}`);
      if (!keep.has(dependency)) { keep.add(dependency); visit(dependency); }
    }
  };
  for (const id of [...keep]) visit(id);
  if (edition !== 'minimal' && edition !== 'full' && keep.size === 0) throw new Error(`当前目录没有 ${preset.label} 所需模块，请先回退之前的裁剪。`);
  const remove = [...modules.keys()].filter(id => !keep.has(id)).sort();
  const hashes = {};
  for (const id of remove) hashes[id] = await fingerprints(await checkedModule(root, id));
  return { root, edition, label: preset.label, keep: [...keep].sort(), autoKept: [...keep].filter(id => !requested.includes(id)), remove, hashes };
}

export async function listBackups(projectRoot) {
  const root = await realpath(projectRoot);
  const base = path.join(root, backupFolder);
  await rejectLinks(root, base);
  if (!await exists(base)) return [];
  const backups = [];
  for (const entry of await readdir(base, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'lock') continue;
    const dir = path.join(base, entry.name);
    await rejectLinks(root, dir);
    if (await exists(path.join(dir, 'snapshot.json'))) backups.push(JSON.parse(await readFile(path.join(dir, 'snapshot.json'), 'utf8')));
  }
  return backups.sort((a, b) => b.id.localeCompare(a.id));
}

async function lock(root, action) {
  const base = path.join(root, backupFolder);
  await rejectLinks(root, base);
  await mkdir(base, { recursive: true });
  const target = path.join(base, 'lock');
  try { await mkdir(target); } catch (e) { if (e.code === 'EEXIST') throw new Error('另一个裁剪/恢复任务正在运行；若上次进程被中断，请确认后移除 .edition-backups/lock 再回退。'); throw e; }
  try { return await action(); } finally { await rmdir(target); }
}

export async function applyPlan(plan, generate) {
  if (!plan.remove.length) return null;
  return lock(plan.root, async () => {
    for (const id of plan.remove) {
      const actual = await fingerprints(await checkedModule(plan.root, id));
      if (JSON.stringify(actual) !== JSON.stringify(plan.hashes[id])) throw new Error(`预览后模块已修改：${id}，请重新执行。`);
    }
    const id = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomUUID().slice(0, 8);
    const directory = path.join(plan.root, backupFolder, id);
    await mkdir(path.join(directory, 'modules'), { recursive: true });
    const snapshot = { ...plan, id, status: 'backing-up', removed: [], createdAt: new Date().toISOString() };
    const metadata = path.join(directory, 'snapshot.json');
    await save(metadata, snapshot);
    // Complete and verify every backup before removing the first module.
    for (const module of plan.remove) {
      const source = await checkedModule(plan.root, module);
      const backup = path.join(directory, 'modules', module);
      await cp(source, backup, { recursive: true, errorOnExist: true, force: false });
      if (JSON.stringify(await fingerprints(backup)) !== JSON.stringify(plan.hashes[module])) throw new Error(`备份校验失败：${module}`);
    }
    snapshot.status = 'applying';
    await save(metadata, snapshot);
    try {
      for (const module of plan.remove) {
        const target = await checkedModule(plan.root, module);
        if (JSON.stringify(await fingerprints(target)) !== JSON.stringify(plan.hashes[module])) throw new Error(`备份后模块已修改：${module}`);
        snapshot.removed.push(module);
        await save(metadata, snapshot);
        await rm(target, { recursive: true });
      }
      await generate();
      snapshot.status = 'complete';
      await save(metadata, snapshot);
      return snapshot;
    } catch (error) {
      snapshot.status = 'failed';
      await save(metadata, snapshot);
      // Leave verified backups intact and report the recovery command.
      throw new Error(`裁剪未完成：${error.message}。备份 ${id} 已保留，请执行 restore:edition（如目录部分残留，先移走残留目录）。`);
    }
  });
}

export async function restoreEdition(projectRoot, requestedId, generate, dryRun = false) {
  const root = await realpath(projectRoot);
  const backups = (await listBackups(root)).filter(item => ['complete', 'applying', 'failed', 'restoring'].includes(item.status));
  const latest = backups[0];
  if (!latest) throw new Error('没有可回退的版本裁剪备份。');
  if (requestedId && requestedId !== latest.id) throw new Error(`请按逆序回退，当前应先恢复：${latest.id}`);
  const snapshot = latest;
  if (snapshot.root !== root || !/^[\w-]+$/.test(snapshot.id)) throw new Error('备份不属于当前工作目录。');
  async function restore() {
    const pending = (await listBackups(root)).filter(item => ['complete', 'applying', 'failed', 'restoring'].includes(item.status));
    if (pending[0]?.id !== snapshot.id) throw new Error('备份状态已改变，请重新预览恢复。');
    const directory = path.join(root, backupFolder, snapshot.id);
    await rejectLinks(root, directory);
    const modules = snapshot.status === 'complete' ? snapshot.remove : snapshot.removed;
    for (const id of modules) {
      const target = await checkedModule(root, id);
      if (await exists(target) && !(snapshot.status === 'restoring' && JSON.stringify(await fingerprints(target)) === JSON.stringify(snapshot.hashes[id]))) throw new Error(`恢复冲突：${target} 已存在；为保护修改，请先将该目录移到其他位置。`);
      const backup = path.join(directory, 'modules', id);
      await rejectLinks(root, backup);
      if (JSON.stringify(await fingerprints(backup)) !== JSON.stringify(snapshot.hashes[id])) throw new Error(`备份损坏或被修改：${id}`);
    }
    if (dryRun) return { ...snapshot, restoring: modules };
    snapshot.status = 'restoring';
    await save(path.join(directory, 'snapshot.json'), snapshot);
    for (const id of modules) {
      const target = await checkedModule(root, id);
      if (!await exists(target)) await cp(path.join(directory, 'modules', id), target, { recursive: true, errorOnExist: true, force: false });
    }
    await generate();
    snapshot.status = 'restored';
    snapshot.restoredAt = new Date().toISOString();
    await save(path.join(directory, 'snapshot.json'), snapshot);
    return { ...snapshot, restoring: modules };
  }
  return dryRun ? restore() : lock(root, restore);
}
