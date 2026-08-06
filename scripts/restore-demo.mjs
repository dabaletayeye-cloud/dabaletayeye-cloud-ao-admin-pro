import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { emitKeypressEvents } from 'node:readline';
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
const invokedFromCoreShortcut = path.basename(process.argv[1]) === 'restore-core.mjs';

function optionValue(name) {
  const prefix = `${name}=`;
  const item = args.find((arg) => arg.startsWith(prefix));
  return item ? item.slice(prefix.length) : undefined;
}

function printUsage() {
  console.log(`\n用法：
  npm run restore:demo                         # 键盘选择要恢复的模块
  npm run restore:demo:dry                     # 预览默认核心恢复范围
  npm run restore:demo -- --modules=extras     # 仅恢复指定模块
  npm run restore:demo -- --modules=all --yes  # 恢复全部可恢复模块
  npm run restore:core                         # 恢复核心版清理内容的快捷命令
\n键盘操作：方向键移动，空格勾选，回车确认，Esc 取消。\n`);
}

function parseModuleList(value) {
  if (value === 'all') return modules.map((module) => module.id);
  if (value === 'none' || value.trim() === '') return [];

  const ids = [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
  const invalid = ids.filter((id) => !modules.some((module) => module.id === id));
  if (invalid.length > 0) throw new Error(`未知模块：${invalid.join('、')}。`);
  return ids;
}

function clearInteractiveScreen() {
  output.write('\x1B[2J\x1B[H');
}

function renderSelection(title, lines, footer) {
  clearInteractiveScreen();
  output.write(`演示内容恢复 · ${title}\n\n`);
  output.write(`${lines.join('\n')}\n\n`);
  output.write(`${footer}\n`);
}

function runKeypressSession(render, handleKeypress) {
  return new Promise((resolve) => {
    let finished = false;
    const finish = (value) => {
      if (finished) return;
      finished = true;
      input.off('keypress', onKeypress);
      input.setRawMode(false);
      output.write('\x1B[?25h\n');
      resolve(value);
    };
    const onKeypress = (character, key) => handleKeypress({ character, key, finish, render });

    emitKeypressEvents(input);
    input.setRawMode(true);
    input.resume();
    output.write('\x1B[?25l');
    input.on('keypress', onKeypress);
    render();
  });
}

async function selectRestoreMode() {
  const choices = [
    { id: 'core', label: `恢复${core.name}清理内容`, description: core.restoreModuleIds.map((id) => modules.find((module) => module.id === id).label).join('、') },
    { id: 'custom', label: '自定义恢复模块', description: '进入模块多选列表' },
    { id: 'all', label: '恢复全部模块', description: '恢复所有已清理的模块' },
    { id: 'cancel', label: '取消', description: '退出且不修改文件' },
  ];
  let cursor = 0;
  const render = () => renderSelection(
    '选择恢复方式',
    choices.map((choice, index) => `${index === cursor ? '❯' : ' '} ${choice.label}\n    ${choice.description}`),
    '↑/↓ 移动   空格 / Enter 选择   Esc 取消',
  );

  return runKeypressSession(render, ({ key, finish, render: redraw }) => {
    if (key?.name === 'up') cursor = (cursor - 1 + choices.length) % choices.length;
    else if (key?.name === 'down') cursor = (cursor + 1) % choices.length;
    else if (key?.name === 'escape' || (key?.ctrl && key.name === 'c')) {
      finish('cancel');
      return;
    } else if (key?.name === 'space' || key?.name === 'return') {
      finish(choices[cursor].id);
      return;
    } else return;
    redraw();
  });
}

async function selectRestoreModules() {
  const selected = new Set(core.restoreModuleIds);
  const actions = ['确认恢复选择', '全选模块', '取消全选', '返回上一步'];
  const itemCount = modules.length + actions.length;
  let cursor = 0;
  const render = () => {
    const lines = modules.map((module, index) => {
      const checked = selected.has(module.id) ? '●' : '○';
      return `${index === cursor ? '❯' : ' '} [${checked}] ${module.label}\n    ${module.description}`;
    });
    lines.push('');
    actions.forEach((action, index) => {
      const actionIndex = modules.length + index;
      lines.push(`${actionIndex === cursor ? '❯' : ' '} ${action}`);
    });
    renderSelection('选择要恢复的模块', lines, '↑/↓ 移动   空格 勾选/操作   Enter 确认   Esc 取消');
  };

  return runKeypressSession(render, ({ key, finish, render: redraw }) => {
    if (key?.name === 'up') {
      cursor = (cursor - 1 + itemCount) % itemCount;
    } else if (key?.name === 'down') {
      cursor = (cursor + 1) % itemCount;
    } else if (key?.name === 'escape' || (key?.ctrl && key.name === 'c')) {
      finish(null);
      return;
    } else if (cursor < modules.length && key?.name === 'space') {
      const module = modules[cursor];
      if (selected.has(module.id)) selected.delete(module.id);
      else selected.add(module.id);
    } else if (cursor === modules.length && (key?.name === 'space' || key?.name === 'return')) {
      finish([...selected]);
      return;
    } else if (cursor === modules.length + 1 && key?.name === 'space') {
      modules.forEach((module) => selected.add(module.id));
    } else if (cursor === modules.length + 2 && key?.name === 'space') {
      selected.clear();
    } else if (cursor === modules.length + 3 && (key?.name === 'space' || key?.name === 'return')) {
      finish('back');
      return;
    } else {
      return;
    }
    redraw();
  });
}

async function chooseRestoreModuleIds() {
  const moduleValue = optionValue('--modules');
  const preset = optionValue('--preset');
  if (moduleValue !== undefined && preset !== undefined) {
    throw new Error('--modules 与 --preset 不能同时使用。');
  }
  if (moduleValue !== undefined) return parseModuleList(moduleValue);
  if (preset !== undefined || invokedFromCoreShortcut) {
    if (preset !== undefined && preset !== 'core') throw new Error('当前只支持 --preset=core。');
    return core.restoreModuleIds;
  }
  if (!interactive && !input.isTTY) return core.restoreModuleIds;
  if (!input.isTTY || !output.isTTY) {
    throw new Error('当前终端不支持键盘选择，请使用 --modules=<模块列表> 或 --preset=core。');
  }

  while (true) {
    const mode = await selectRestoreMode();
    if (mode === 'core') return core.restoreModuleIds;
    if (mode === 'all') return modules.map((module) => module.id);
    if (mode === 'cancel') return null;

    const selected = await selectRestoreModules();
    if (selected === 'back') continue;
    return selected;
  }
}

function selectedModules(moduleIds) {
  const selected = new Set(moduleIds);
  return modules.filter((module) => selected.has(module.id));
}

function restoreBlocks(moduleIds) {
  const includeComponentMenu = moduleIds.includes('component-navigation');
  const unique = new Map();
  selectedModules(moduleIds).flatMap((module) => module.blocks).forEach((block, index) => {
    if (block.restoreShowMenuOnly && !includeComponentMenu) return;
    const key = `${block.file}\n${block.start}`;
    if (!unique.has(key)) unique.set(key, { ...block, index });
  });
  return [...unique.values()].sort((left, right) => (left.restoreOrder ?? left.index) - (right.restoreOrder ?? right.index));
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
    if (block.restoreOptional) return { content: current, changed: false };
    throw new Error(`找不到安全插入位置，已停止恢复：${block.file}（${block.start}）`);
  }
  const anchorIndex = current.indexOf(anchor);
  const restored = extractBlock(baseline, block).trimEnd();
  return {
    content: `${current.slice(0, anchorIndex)}${restored}\n${current.slice(anchorIndex)}`,
    changed: true,
  };
}

async function collectDeletedFiles(targets) {
  if (targets.length === 0) return [];
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
  const moduleIds = await chooseRestoreModuleIds();
  if (moduleIds === null) {
    console.log('\n已取消，未修改任何文件。');
    return;
  }
  if (moduleIds.length === 0) {
    console.log('\n未选择任何恢复模块，未修改任何文件。');
    return;
  }

  const restoredModules = selectedModules(moduleIds);
  const targets = restoredModules.flatMap((module) => module.targets);
  const blocks = restoreBlocks(moduleIds);
  const deletedFiles = await collectDeletedFiles(targets);
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

  console.log('\n将恢复模块：');
  console.log(`  - ${restoredModules.map((module) => module.label).join('、')}`);
  console.log(deletedFiles.length > 0
    ? `  - ${deletedFiles.length} 个页面或数据文件（从当前 HEAD 恢复）`
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
    if (!input.isTTY) throw new Error('当前环境不支持确认输入，请使用 --yes，或先运行 --dry-run。');
    approved = await askYesNo('\n将恢复以上内容，确认继续吗？');
  }
  if (!approved) {
    console.log('\n已取消，未修改任何文件。');
    return;
  }

  if (deletedFiles.length > 0) {
    await runGit(['restore', '--source=HEAD', '--staged', '--worktree', '--', ...targets]);
  }
  for (const [filePath, content] of filesToWrite) await writeFile(filePath, content, 'utf8');

  console.log('\n已恢复所选模块。请运行 npm run build 验证。');
}

main().catch((error) => {
  console.error(`\n恢复失败：${error.message}`);
  process.exitCode = 1;
});
