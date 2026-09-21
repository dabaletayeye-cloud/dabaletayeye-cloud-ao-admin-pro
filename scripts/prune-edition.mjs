import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createInterface } from 'node:readline/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { planEdition, applyPlan, listBackups, restoreEdition } from './edition-prune-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const presets = JSON.parse(await readFile(new URL('./edition-presets.json', import.meta.url), 'utf8'));
const exec = promisify(execFile);
const args = process.argv.slice(2);
const flags = new Set(['--dry-run', '--yes', '--allow-dirty', '--restore', '--list', '--help']);
const options = {};
for (let i = 0; i < args.length; i++) {
  const [name, inline] = args[i].split('=', 2);
  if (['--edition', '--backup'].includes(name)) {
    const value = inline ?? args[++i];
    if (!value || value.startsWith('--')) throw new Error(`${name} 缺少值`);
    options[name] = value;
  } else if (!flags.has(args[i])) throw new Error(`未知参数：${args[i]}`);
}
const dryRun = args.includes('--dry-run');
const generate = () => exec(process.execPath, ['scripts/gen-registry.mjs'], { cwd: root });

async function confirm(message) {
  if (args.includes('--yes')) return true;
  if (!process.stdin.isTTY) throw new Error('非交互环境请先 --dry-run 预览，确认后添加 --yes。');
  const reader = createInterface({ input: process.stdin, output: process.stdout });
  try { return (await reader.question(message + ' [y/N] ')).trim().toLowerCase() === 'y'; }
  finally { reader.close(); }
}

async function main() {
  if (args.includes('--help')) {
    console.log(`按版本裁剪（自动备份、支持回退）：
  npm run clean:edition -- --edition=saas --dry-run
  npm run clean:edition -- --edition=saas --yes [--allow-dirty]
  npm run restore:edition -- --dry-run
  npm run restore:edition -- --yes
  npm run restore:edition -- --backup=<备份ID> --yes
  npm run edition:backups
版本：${Object.entries(presets).map(([id, item]) => `${id}（${item.label}）`).join('、')}
无 --edition 时交互选择。full 只保留当前已有模块；恢复被删除模块请使用 restore:edition。
只裁剪前端 src/modules；自动保留声明依赖，不改数据库、后端或共享历史源码。
备份位于 .edition-backups，按后进先出逐次回退，恢复不会覆盖已有模块。`);
    return;
  }
  if (args.includes('--list')) {
    const snapshots = await listBackups(root);
    console.table(snapshots.map(item => ({ id: item.id, edition: item.edition, status: item.status, modules: item.remove.join(', ') })));
    return;
  }
  if (args.includes('--restore')) {
    if (options['--edition']) throw new Error('恢复时不能指定 --edition。');
    const plan = await restoreEdition(root, options['--backup'], generate, true);
    console.log(`恢复备份：${plan.id}\n恢复模块：${plan.restoring.join(', ') || '无'}\n保留模块的后续修改不会被覆盖。`);
    if (dryRun) return console.log('预览模式：未修改文件。');
    if (!await confirm('确认回退这次版本裁剪？')) return;
    await restoreEdition(root, plan.id, generate);
    console.log('回退完成，已恢复模块及裁剪前的本地版本（首次回退为全部版）。重启前端后自动生效。');
    return;
  }
  if (options['--backup']) throw new Error('--backup 仅用于 --restore。');
  let edition = options['--edition'];
  if (!edition) {
    if (!process.stdin.isTTY) throw new Error('请指定 --edition，例如 --edition=saas --dry-run。');
    console.table(Object.entries(presets).map(([id, item]) => ({ id, name: item.label })));
    const reader = createInterface({ input: process.stdin, output: process.stdout });
    try { edition = (await reader.question('输入版本标识（回车取消）：')).trim(); }
    finally { reader.close(); }
    if (!edition) return;
  }
  const plan = await planEdition(root, edition, presets);
  console.log(`目标：${plan.label}\n保留：core${plan.keep.length ? ' + ' + plan.keep.join(', ') : ''}\n移除：${plan.remove.join(', ') || '无'}`);
  if (plan.autoKept.length) console.log(`自动保留依赖：${plan.autoKept.join(', ')}`);
  if (edition === 'devplatform' && plan.keep.includes('operations')) console.log('服务器管理属于 operations，物理裁剪保留该模块；界面选择开发者平台版后只开放服务器入口。');
  if (dryRun) return console.log('预览模式：未修改文件，也未创建备份。');
  if (!args.includes('--allow-dirty')) {
    const { stdout } = await exec('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root });
    if (stdout.trim()) throw new Error('工作区有未提交修改，请先提交，或添加 --allow-dirty 使用文件快照备份后裁剪。');
  }
  if (!await confirm('确认备份并移除上述模块？')) return;
  const snapshot = await applyPlan(plan, generate);
  console.log(`裁剪完成，已自动设置为 ${plan.label}。备份：${snapshot.id}\n回退：npm run restore:edition -- --yes\n请重启前端开发服务，无需在页面手动切换；服务器上的系统版本配置不会被脚本修改。`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
