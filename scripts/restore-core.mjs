import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCleanDemoConfig } from './load-clean-demo-config.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const confirmed = args.includes('--yes');
const interactive = args.includes('--interactive');
const execFileAsync = promisify(execFile);
const { core, modules } = await loadCleanDemoConfig();

const modulesById = new Map(modules.map((module) => [module.id, module]));
const restoreModules = core.restoreModuleIds.map((id) => modulesById.get(id));
const targets = restoreModules.flatMap((module) => module.targets);
const blocks = restoreModules
  .flatMap((module) => module.blocks)
  .map((block, index) => ({ ...block, index }))
  .sort((left, right) => (left.restoreOrder ?? left.index) - (right.restoreOrder ?? right.index));

function printUsage() {
  console.log(`\n用法：
  npm run restore:core:dry        # 预览恢复核心版清理内容的范围
  npm run restore:core            # 交互确认后恢复
  npm run restore:core -- --yes   # 跳过确认并恢复
\n恢复内容由 scripts/clean-demo.config.json 的 core.restoreModuleIds 管理。\n`);
}

async function runGit(gitArgs) {
  return execFileAsync('git', gitArgs, { cwd: projectRoot });
}

function extractBlock(source, block) {
  const startIndex = source.indexOf(block.start);
  const endIndex = source.indexOf(block.end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`当前 HEAD 中缺少恢复标记：${block.file}（${block.start}）`);
  }
  return source.slice(startIndex, endIndex + block.end.length);
}

function restoreBlock(current, baseline, block) {
  const startIndex = current.indexOf(block.start);
  const endIndex = current.indexOf(block.end);
  if (startIndex !== -1 && endIndex !== -1) return { content: current, changed: false };
  if (startIndex !== -1 || endIndex !== -1) {
    throw new Error(`恢复标记不完整，已停止恢复：${block.file}（${block.start}）`);
  }

  const anchor = block.restoreAnchors?.find((candidate) => current.includes(candidate));
  if (!anchor) {
    throw new Error(`找不到安全插入位置，已停止恢复：${block.file}（${block.start}）`);
  }

  const anchorIndex = current.indexOf(anchor);
  const restored = extractBlock(baseline, block).trimEnd();
  return {
    content: `${current.slice(0, anchorIndex)}${restored}\n${current.slice(anchorIndex)}`,
    changed: true,
  };
}

async function collectDeletedFiles() {
  const [{ stdout: diff }, { stdout: untracked }] = await Promise.all([
    runGit(['diff', '--name-status', 'HEAD', '--', ...targets]),
    runGit(['ls-files', '--others', '--exclude-standard', '--', ...targets]),
  ]);

  const changes = diff.trim().split(/\r?\n/).filter(Boolean).map((line) => {
    const [status, file] = line.split(/\t+/, 2);
    return { status, file };
  });
  const unexpected = changes.filter((change) => change.status !== 'D');
  if (unexpected.length > 0 || untracked.trim()) {
    throw new Error('待恢复目录中存在非删除的本地改动或未跟踪文件；为避免覆盖内容，已停止恢复。请先备份这些文件。');
  }
  return changes.map((change) => change.file);
}

async function askYesNo(question) {
  const readline = createInterface({ input, output });
  try {
    const answer = (await readline.question(`${question} (y/N) `)).trim().toLowerCase();
    return ['y', 'yes', '是'].includes(answer);
  } finally {
    readline.close();
  }
}

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  await runGit(['rev-parse', '--is-inside-work-tree']);
  const deletedFiles = await collectDeletedFiles();
  const blocksByFile = new Map();
  for (const block of blocks) {
    const fileBlocks = blocksByFile.get(block.file) ?? [];
    fileBlocks.push(block);
    blocksByFile.set(block.file, fileBlocks);
  }

  const filesToWrite = new Map();
  for (const [relativePath, fileBlocks] of blocksByFile) {
    const absolutePath = path.join(projectRoot, relativePath);
    const [current, baseline] = await Promise.all([
      readFile(absolutePath, 'utf8'),
      runGit(['show', `HEAD:${relativePath}`]).then(({ stdout }) => stdout),
    ]);
    let content = current;
    let changed = false;
    for (const block of fileBlocks) {
      const result = restoreBlock(content, baseline, block);
      content = result.content;
      changed ||= result.changed;
    }
    if (changed) filesToWrite.set(absolutePath, content);
  }

  console.log('\n将恢复：');
  console.log(deletedFiles.length > 0
    ? `  - ${deletedFiles.length} 个被${core.name}清理删除的页面或数据文件（从当前 HEAD 恢复）`
    : '  - 页面和数据文件已存在');
  console.log(filesToWrite.size > 0
    ? `  - ${[...filesToWrite.keys()].map((file) => path.relative(projectRoot, file)).join('、')} 中的路由和导航入口`
    : '  - 路由和导航入口标记已完整，无需补写');

  if (dryRun) {
    console.log('\n预览结束，未修改任何文件。');
    return;
  }

  let approved = confirmed;
  if (!approved) {
    if (!interactive && !input.isTTY) throw new Error('当前环境不支持确认输入，请使用 --yes，或先运行 --dry-run。');
    approved = await askYesNo(`\n将恢复以上${core.name}清理内容，确认继续吗？`);
  }
  if (!approved) {
    console.log('\n已取消，未修改任何文件。');
    return;
  }

  if (deletedFiles.length > 0) {
    await runGit(['restore', '--source=HEAD', '--staged', '--worktree', '--', ...targets]);
  }
  for (const [filePath, content] of filesToWrite) await writeFile(filePath, content, 'utf8');

  console.log(`\n${core.name}清理内容已恢复。请运行 npm run build 验证。`);
}

main().catch((error) => {
  console.error(`\n恢复失败：${error.message}`);
  process.exitCode = 1;
});
