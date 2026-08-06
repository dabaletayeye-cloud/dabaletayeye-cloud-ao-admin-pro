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
const showMenu = args.includes('--show-menu');
const execFileAsync = promisify(execFile);
const { modules } = await loadCleanDemoConfig();
const componentModule = modules.find((module) => module.id === 'components');
if (!componentModule || componentModule.targets.length !== 1) {
  throw new Error('清理配置中缺少组件中心模块，或组件目录配置无效。');
}

const [COMPONENT_DIRECTORY] = componentModule.targets;
const COMPONENT_RESTORE_OPTIONS = new Map([
  ['/* CLEAN_DEMO_START: components:imports */', {
    anchor: '/* CLEAN_DEMO_START: templates:imports */',
    fallbackAnchors: ["import FileManagementPage from './pages/FileManagementPage';"],
  }],
  ['{/* CLEAN_DEMO_START: components:routes */}', {
    anchor: '{/* CLEAN_DEMO_START: examples:routes */}',
    fallbackAnchors: ['<Route path="/result/success" element={<ResultPage />} />'],
  }],
  ['{/* CLEAN_DEMO_START: components:example-routes */}', {
    anchor: '<Route path="/examples/basic-table" element={<BasicTableExamplePage />} />',
    optional: true,
  }],
  ['/* CLEAN_DEMO_START: components:navigation */', {
    anchor: '/* CLEAN_DEMO_START: examples:navigation */',
    fallbackAnchors: ["{ type: 'link', icon: <ImageIcon size={16} />, label: '媒体库', path: '/media' },"],
    showMenuOnly: true,
    optional: true,
  }],
  ['/* CLEAN_DEMO_START: components:example-navigation */', {
    anchor: "{ label: '基础表格', path: '/examples/basic-table', icon: <TableIcon size={13} /> },",
    showMenuOnly: true,
    optional: true,
  }],
  ['/* CLEAN_DEMO_START: components:example-route-labels */', {
    anchor: "'/examples/basic-table': '基础表格',",
    optional: true,
  }],
]);
const BLOCKS = componentModule.blocks.map((block) => ({
  ...block,
  ...COMPONENT_RESTORE_OPTIONS.get(block.start),
}));

function printUsage() {
  console.log(`\n用法：
  npm run restore:components:dry            # 预览恢复范围，不修改文件
  npm run restore:components                # 交互确认后恢复组件中心
  npm run restore:components -- --yes       # 跳过确认并恢复
  npm run restore:components -- --show-menu # 同时恢复侧栏“组件中心”入口
\n恢复内容：${COMPONENT_DIRECTORY}、组件路由和页签标签；默认保持侧栏入口隐藏。\n`);
}

async function runGit(args) {
  return execFileAsync('git', args, { cwd: projectRoot });
}

function extractBlock(source, block) {
  const startIndex = source.indexOf(block.start);
  const endIndex = source.indexOf(block.end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`Git 基线中缺少组件标记：${block.file}（${block.start}）`);
  }
  return source.slice(startIndex, endIndex + block.end.length);
}

function restoreBlock(current, baseline, block) {
  const currentStart = current.indexOf(block.start);
  const currentEnd = current.indexOf(block.end);
  if (currentStart !== -1 && currentEnd !== -1) return { content: current, changed: false };
  if (currentStart !== -1 || currentEnd !== -1) {
    throw new Error(`组件标记不完整，已停止恢复：${block.file}（${block.start}）`);
  }

  const anchor = [block.anchor, ...(block.fallbackAnchors ?? [])]
    .find((candidate) => current.includes(candidate));
  const anchorIndex = anchor ? current.indexOf(anchor) : -1;
  if (anchorIndex === -1) {
    if (block.optional) return { content: current, changed: false };
    throw new Error(`找不到安全插入位置，已停止恢复：${block.file}（${block.anchor}）`);
  }

  const componentBlock = extractBlock(baseline, block).trimEnd();
  return {
    content: `${current.slice(0, anchorIndex)}${componentBlock}\n${current.slice(anchorIndex)}`,
    changed: true,
  };
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

async function getDeletedComponentFiles() {
  const [{ stdout: diff }, { stdout: untracked }] = await Promise.all([
    runGit(['diff', '--name-status', 'HEAD', '--', COMPONENT_DIRECTORY]),
    runGit(['ls-files', '--others', '--exclude-standard', '--', COMPONENT_DIRECTORY]),
  ]);

  const changes = diff.trim().split(/\r?\n/).filter(Boolean).map((line) => {
    const [status, file] = line.split(/\t+/, 2);
    return { status, file };
  });
  const unexpected = changes.filter((change) => change.status !== 'D');
  if (unexpected.length > 0 || untracked.trim()) {
    throw new Error('组件目录中存在非删除的本地改动或未跟踪文件；为避免覆盖内容，已停止恢复。请先备份这些文件。');
  }

  return changes.map((change) => change.file);
}

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  await runGit(['rev-parse', '--is-inside-work-tree']);
  const deletedFiles = await getDeletedComponentFiles();
  const filesToWrite = new Map();

  const blocksByFile = new Map();
  for (const block of BLOCKS.filter((item) => !item.showMenuOnly || showMenu)) {
    const blocks = blocksByFile.get(block.file) ?? [];
    blocks.push(block);
    blocksByFile.set(block.file, blocks);
  }

  for (const [relativePath, blocks] of blocksByFile) {
    const absolutePath = path.join(projectRoot, relativePath);
    const [current, baseline] = await Promise.all([
      readFile(absolutePath, 'utf8'),
      runGit(['show', `HEAD:${relativePath}`]).then(({ stdout }) => stdout),
    ]);
    let content = current;
    let changed = false;
    for (const block of blocks) {
      const restored = restoreBlock(content, baseline, block);
      content = restored.content;
      changed ||= restored.changed;
    }
    if (changed) filesToWrite.set(absolutePath, content);
  }

  console.log('\n将恢复：');
  console.log(deletedFiles.length > 0
    ? `  - ${COMPONENT_DIRECTORY} 中的 ${deletedFiles.length} 个组件页面（从当前 HEAD 恢复）`
    : `  - ${COMPONENT_DIRECTORY}（文件已存在）`);
  console.log(filesToWrite.size > 0
    ? `  - ${[...new Set(BLOCKS.filter((block) => filesToWrite.has(path.join(projectRoot, block.file))).map((block) => block.file))].join('、')} 中的组件入口标记`
    : '  - 组件入口标记已完整，无需补写');
  if (!showMenu) console.log('  - 侧栏组件中心入口保持隐藏（传入 --show-menu 才会恢复）');

  if (dryRun) {
    console.log('\n预览结束，未修改任何文件。');
    return;
  }

  let approved = confirmed;
  if (!approved) {
    if (!interactive && !input.isTTY) throw new Error('当前环境不支持确认输入，请使用 --yes，或先运行 --dry-run。');
    approved = await askYesNo('\n将恢复以上组件内容，确认继续吗？');
  }
  if (!approved) {
    console.log('\n已取消，未修改任何文件。');
    return;
  }

  if (deletedFiles.length > 0) {
    await runGit(['restore', '--source=HEAD', '--staged', '--worktree', '--', COMPONENT_DIRECTORY]);
  }
  for (const [filePath, content] of filesToWrite) await writeFile(filePath, content, 'utf8');

  console.log('\n组件中心已恢复。请运行 npm run build 验证。');
}

main().catch((error) => {
  console.error(`\n恢复失败：${error.message}`);
  process.exitCode = 1;
});
