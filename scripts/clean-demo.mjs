import { access, readFile, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { emitKeypressEvents } from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCleanDemoConfig } from './load-clean-demo-config.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceRoot = path.join(projectRoot, 'src');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const confirmed = args.includes('--yes');
const interactive = args.includes('--interactive');
const allowDirty = args.includes('--allow-dirty');
const execFileAsync = promisify(execFile);

const { modules: DEMO_MODULES, core: CORE_CONFIG, dependencies: MODULE_DEPENDENCIES } = await loadCleanDemoConfig();

function optionValue(name) {
  const prefix = `${name}=`;
  const item = args.find((arg) => arg.startsWith(prefix));
  return item ? item.slice(prefix.length) : undefined;
}

function printUsage() {
  console.log(`\n用法：
  npm run clean                              # 打开交互式精简向导
  npm run clean:demo                         # 打开交互式精简向导
  npm run clean:core                         # 交互确认后仅保留核心页面和固定组件
  npm run clean:core:dry                     # 预览核心版清理范围
  npm run clean:basic                        # 与 clean:core 相同，但跳过交互确认
  npm run clean:basic:dry                    # 预览核心版清理范围
  npm run clean:demo -- --keep=templates --yes
                                              # 保留指定模块并立即清理其他模块
  npm run clean:demo                         # 方向键移动，空格勾选保留模块，回车确认
  npm run clean:demo -- --preset=basic --dry-run
                                              # 非交互预览核心版模式

可保留模块：${DEMO_MODULES.map((module) => module.id).join('、')}
参数：--keep=<模块列表>  --remove=<模块列表>  --preset=basic  --dry-run  --yes  --interactive  --allow-dirty  --help
配置：scripts/clean-demo.config.json（核心版保留范围和模块清理范围）\n`);
}

function parseModuleList(value) {
  if (value === undefined) return undefined;
  if (value === 'all') return DEMO_MODULES.map((module) => module.id);
  if (value === 'none' || value.trim() === '') return [];

  const ids = [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
  const invalid = ids.filter((id) => !DEMO_MODULES.some((module) => module.id === id));
  if (invalid.length > 0) {
    throw new Error(`未知模块：${invalid.join('、')}。可选值为：${DEMO_MODULES.map((module) => module.id).join('、')}`);
  }
  return ids;
}

function resolveKeepDependencies(ids) {
  const keep = new Set(ids);
  const autoKept = [];
  const alwaysKept = DEMO_MODULES.filter((module) => module.alwaysKeep);

  for (const module of alwaysKept) keep.add(module.id);

  for (const dependency of MODULE_DEPENDENCIES) {
    if (keep.has(dependency.module) && !keep.has(dependency.dependency)) {
      keep.add(dependency.dependency);
      autoKept.push(dependency);
    }
  }

  return { ids: [...keep], autoKept, alwaysKept };
}

function resolveRemoveDependencies(ids) {
  const remove = new Set(ids);
  const autoRemoved = [];
  let changed = true;

  while (changed) {
    changed = false;
    for (const dependency of MODULE_DEPENDENCIES) {
      if (remove.has(dependency.dependency) && !remove.has(dependency.module)) {
        remove.add(dependency.module);
        autoRemoved.push(dependency);
        changed = true;
      }
    }
  }

  return { ids: [...remove], autoRemoved };
}

function removeMarkedBlock(source, block) {
  const startIndex = source.indexOf(block.start);
  const endIndex = source.indexOf(block.end);

  if (startIndex === -1 && endIndex === -1) return source;
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`清理标记不完整：${block.file}（${block.start}）`);
  }

  const before = source.slice(0, startIndex).replace(/[ \t]*$/, '');
  const after = source.slice(endIndex + block.end.length).replace(/^\r?\n/, '');
  return `${before}\n${after}`;
}

function toAbsolutePath(relativePath) {
  const absolutePath = path.resolve(projectRoot, relativePath);
  const allowedPrefix = sourceRoot + path.sep;

  if (!absolutePath.startsWith(allowedPrefix)) {
    throw new Error(`拒绝删除 src 目录外的路径：${relativePath}`);
  }

  return absolutePath;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function verifyGitCheckpoint() {
  try {
    const { stdout: insideWorkTree } = await execFileAsync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: projectRoot });
    if (insideWorkTree.trim() !== 'true') throw new Error('当前目录不是 Git 仓库。');

    const [{ stdout: revision }, { stdout: status }] = await Promise.all([
      execFileAsync('git', ['rev-parse', '--short', 'HEAD'], { cwd: projectRoot }),
      execFileAsync('git', ['status', '--short', '--untracked-files=all'], { cwd: projectRoot }),
    ]);
    const dirty = status.trim().length > 0;

    if (dirty && !allowDirty) {
      throw new Error('检测到未提交的 Git 修改，已取消清理。请先提交或暂存修改；如已确认风险，可显式添加 --allow-dirty。');
    }

    return { revision: revision.trim(), dirty };
  } catch (error) {
    throw new Error(`无法通过 Git 安全检查：${error.message}`);
  }
}

async function askYesNo(question, defaultValue = true) {
  const hint = defaultValue ? 'Y/n' : 'y/N';
  const readline = createInterface({ input, output });
  try {
    const answer = (await readline.question(`${question} (${hint}) `)).trim().toLowerCase();
    return answer ? ['y', 'yes', '是'].includes(answer) : defaultValue;
  } finally {
    readline.close();
  }
}

function clearInteractiveScreen() {
  output.write('\x1B[2J\x1B[H');
}

function renderSelection(title, lines, footer) {
  clearInteractiveScreen();
  output.write(`演示内容精简 · ${title}\n\n`);
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

async function selectCleanupMode() {
  const choices = [
    { id: 'core', label: `仅保留${CORE_CONFIG.name}`, description: CORE_CONFIG.retained.map((item) => item.label).join('、') },
    { id: 'custom', label: '自定义保留模块', description: '进入模块多选列表' },
    { id: 'all', label: '保留全部模块', description: '不删除任何演示内容' },
    { id: 'cancel', label: '取消', description: '退出且不修改文件' },
  ];
  let cursor = 0;

  const render = () => renderSelection(
    '选择清理方式',
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
    }
    else return;
    redraw();
  });
}

async function selectKeepModules() {
  const alwaysKeptIds = new Set(DEMO_MODULES.filter((module) => module.alwaysKeep).map((module) => module.id));
  const selected = new Set([...CORE_CONFIG.keepModuleIds, ...alwaysKeptIds]);
  const actions = ['确认保留选择', '全选模块', '取消全选', '返回上一步'];
  const itemCount = DEMO_MODULES.length + actions.length;
  let cursor = 0;

  const render = () => {
    const lines = DEMO_MODULES.map((module, index) => {
      const checked = module.alwaysKeep ? '🔒' : (selected.has(module.id) ? '●' : '○');
      return `${index === cursor ? '❯' : ' '} [${checked}] ${module.label}\n    ${module.description}`;
    });
    lines.push('');
    actions.forEach((action, index) => {
      const actionIndex = DEMO_MODULES.length + index;
      lines.push(`${actionIndex === cursor ? '❯' : ' '} ${action}`);
    });
    renderSelection('选择要保留的模块', lines, '↑/↓ 移动   空格 勾选/操作   Enter 确认   🔒 固定保留   Esc 取消');
  };

  return runKeypressSession(render, ({ key, finish, render: redraw }) => {
    if (key?.name === 'up') {
      cursor = (cursor - 1 + itemCount) % itemCount;
    } else if (key?.name === 'down') {
      cursor = (cursor + 1) % itemCount;
    } else if (key?.name === 'escape' || (key?.ctrl && key.name === 'c')) {
      finish(null);
      return;
    } else if (cursor < DEMO_MODULES.length && key?.name === 'space') {
      const module = DEMO_MODULES[cursor];
      if (!module.alwaysKeep) {
        if (selected.has(module.id)) selected.delete(module.id);
        else selected.add(module.id);
      }
    } else if (cursor === DEMO_MODULES.length && (key?.name === 'space' || key?.name === 'return')) {
      finish([...selected]);
      return;
    } else if (cursor === DEMO_MODULES.length + 1 && key?.name === 'space') {
      DEMO_MODULES.forEach((module) => selected.add(module.id));
    } else if (cursor === DEMO_MODULES.length + 2 && key?.name === 'space') {
      selected.clear();
      alwaysKeptIds.forEach((id) => selected.add(id));
    } else if (cursor === DEMO_MODULES.length + 3 && (key?.name === 'space' || key?.name === 'return')) {
      finish('back');
      return;
    } else {
      return;
    }
    redraw();
  });
}

async function promptForKeepModules() {
  while (true) {
    const mode = await selectCleanupMode();
    if (mode === 'core') return CORE_CONFIG.keepModuleIds;
    if (mode === 'all') return DEMO_MODULES.map((module) => module.id);
    if (mode === 'cancel') return null;

    const selected = await selectKeepModules();
    if (selected === 'back') continue;
    return selected;
  }
}

async function chooseKeepModules() {
  const keepValue = optionValue('--keep');
  const removeValue = optionValue('--remove');
  const preset = optionValue('--preset');

  const selectedOptions = [keepValue, removeValue, preset].filter((value) => value !== undefined);
  if (selectedOptions.length > 1) {
    throw new Error('--keep、--remove 与 --preset 不能同时使用。');
  }
  if (preset !== undefined) {
    if (preset !== 'basic') throw new Error('当前只支持 --preset=basic。');
    return { ids: CORE_CONFIG.keepModuleIds, autoRemoved: [] };
  }
  if (keepValue !== undefined) return { ids: parseModuleList(keepValue), autoRemoved: [] };
  if (removeValue !== undefined) {
    const { ids: removeIds, autoRemoved } = resolveRemoveDependencies(parseModuleList(removeValue));
    return {
      ids: DEMO_MODULES.filter((module) => !removeIds.includes(module.id)).map((module) => module.id),
      autoRemoved,
    };
  }
  if (interactive || input.isTTY) {
    if (!input.isTTY || !output.isTTY) {
      throw new Error('当前终端不支持键盘选择，请使用 --preset=basic 或 --keep=<模块列表> 指定清理范围。');
    }
    const ids = await promptForKeepModules();
    return ids === null ? null : { ids, autoRemoved: [] };
  }

  throw new Error('当前环境不支持交互输入，请使用 --preset=basic 或 --keep=<模块列表> 指定清理范围。');
}

async function buildSourceChanges(removeModules) {
  const blocksByFile = new Map();
  for (const module of removeModules) {
    for (const block of module.blocks) {
      const blocks = blocksByFile.get(block.file) ?? [];
      blocks.push(block);
      blocksByFile.set(block.file, blocks);
    }
  }

  const changes = [];
  for (const [relativePath, blocks] of blocksByFile) {
    const filePath = path.join(projectRoot, relativePath);
    let content = await readFile(filePath, 'utf8');
    for (const block of blocks) content = removeMarkedBlock(content, block);
    changes.push({ filePath, content });
  }
  return changes;
}

function printPlan(removeModules, existingTargets, sourceChanges) {
  const keepModules = DEMO_MODULES.filter((module) => !removeModules.includes(module));
  console.log(`\n${CORE_CONFIG.name}保留：`);
  for (const item of CORE_CONFIG.retained) console.log(`  - ${item.label}`);
  console.log('\n将保留：');
  console.log(keepModules.length > 0 ? `  - ${keepModules.map((module) => module.label).join('、')}` : '  - 仅保留基础业务页面');
  console.log('\n将移除：');
  for (const module of removeModules) console.log(`  - ${module.label}：${module.description}`);
  if (existingTargets.length > 0) {
    console.log('\n将删除的目录或文件：');
    for (const target of existingTargets) console.log(`  - ${target}`);
  }
  if (sourceChanges.length > 0) {
    console.log('\n将更新的路由、导航或页签文件：');
    for (const change of sourceChanges) console.log(`  - ${path.relative(projectRoot, change.filePath)}`);
  }
}

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  const selection = await chooseKeepModules();
  if (selection === null) {
    console.log('\n已取消，未修改任何文件。');
    return;
  }

  const { ids: keepModuleIds, autoKept, alwaysKept } = resolveKeepDependencies(selection.ids);
  if (alwaysKept.length > 0) {
    console.log('\n固定保留：');
    for (const module of alwaysKept) console.log(`  - ${module.label}`);
  }
  for (const dependency of autoKept) {
    const module = DEMO_MODULES.find((item) => item.id === dependency.module);
    const required = DEMO_MODULES.find((item) => item.id === dependency.dependency);
    console.log(`\n已自动保留「${required.label}」：${module.label}依赖该模块。${dependency.reason}`);
  }
  for (const dependency of selection.autoRemoved) {
    const module = DEMO_MODULES.find((item) => item.id === dependency.module);
    const required = DEMO_MODULES.find((item) => item.id === dependency.dependency);
    console.log(`\n已自动清理「${module.label}」：它依赖即将移除的「${required.label}」。${dependency.reason}`);
  }

  const removeModules = DEMO_MODULES.filter((module) => !keepModuleIds.includes(module.id));
  if (removeModules.length === 0) {
    console.log('\n已选择保留全部演示模块，未修改任何文件。');
    return;
  }

  const existingTargets = [];
  for (const module of removeModules) {
    for (const target of module.targets) {
      const absolutePath = toAbsolutePath(target);
      if (await exists(absolutePath)) existingTargets.push(target);
    }
  }

  const sourceChanges = await buildSourceChanges(removeModules);
  printPlan(removeModules, existingTargets, sourceChanges);

  if (dryRun) {
    console.log('\n预览结束，未修改任何文件。');
    return;
  }

  const gitCheckpoint = await verifyGitCheckpoint();
  console.log(
    gitCheckpoint.dirty
      ? `\nGit 保护已被 --allow-dirty 显式绕过；当前提交：${gitCheckpoint.revision}`
      : `\nGit 保护：工作区干净，当前提交：${gitCheckpoint.revision}`,
  );

  let approved = confirmed;
  if (!approved) {
    if (!input.isTTY) {
      throw new Error('当前环境不支持确认输入，请添加 --yes 执行，或先使用 --dry-run 预览。');
    }
    approved = await askYesNo('\n以上清理会删除文件，确认继续吗？', false);
  }
  if (!approved) {
    console.log('\n已取消，未修改任何文件。');
    return;
  }

  for (const change of sourceChanges) await writeFile(change.filePath, change.content, 'utf8');
  for (const target of existingTargets) await rm(toAbsolutePath(target), { recursive: true, force: true });

  console.log('\n演示内容已清理完成。请运行 npm run build 验证精简后的项目。');
}

main().catch((error) => {
  console.error(`\n清理失败：${error.message}`);
  process.exitCode = 1;
});
