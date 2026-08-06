import { access, readFile, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceRoot = path.join(projectRoot, 'src');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const confirmed = args.includes('--yes');
const interactive = args.includes('--interactive');
const allowDirty = args.includes('--allow-dirty');
const execFileAsync = promisify(execFile);

const DEMO_MODULES = [
  {
    id: 'components',
    label: '组件中心',
    description: '表单、表格、词云图、二维码等组件演示页面（不会删除 src/components 下的通用组件）',
    targets: ['src/pages/comp'],
    blocks: [
      { file: 'src/App.tsx', start: '/* CLEAN_DEMO_START: components:imports */', end: '/* CLEAN_DEMO_END: components:imports */' },
      { file: 'src/App.tsx', start: '{/* CLEAN_DEMO_START: components:routes */}', end: '{/* CLEAN_DEMO_END: components:routes */}' },
      { file: 'src/App.tsx', start: '{/* CLEAN_DEMO_START: components:example-routes */}', end: '{/* CLEAN_DEMO_END: components:example-routes */}' },
      { file: 'src/components/Sidebar.tsx', start: '/* CLEAN_DEMO_START: components:navigation */', end: '/* CLEAN_DEMO_END: components:navigation */' },
      { file: 'src/components/Sidebar.tsx', start: '/* CLEAN_DEMO_START: components:example-navigation */', end: '/* CLEAN_DEMO_END: components:example-navigation */' },
      { file: 'src/components/NavigationExtras.tsx', start: '/* CLEAN_DEMO_START: components:example-route-labels */', end: '/* CLEAN_DEMO_END: components:example-route-labels */' },
    ],
  },
  {
    id: 'extras',
    label: '扩展业务模块',
    description: '内容、分析、营销、低代码、AI、个人中心等扩展页面（保留工作台、系统管理、结果、异常、媒体、订单、消息与组件页面）',
    targets: [
      'src/pages/ArticleListPage.tsx', 'src/pages/CategoryPage.tsx', 'src/pages/TagPage.tsx',
      'src/pages/VisitStatsPage.tsx', 'src/pages/UserPortraitPage.tsx', 'src/pages/FunnelPage.tsx',
      'src/pages/CouponPage.tsx', 'src/pages/ActivityPage.tsx', 'src/pages/PushPage.tsx',
      'src/pages/PermissionPage.tsx', 'src/pages/SettingsPage.tsx', 'src/pages/ProfilePage.tsx',
      'src/pages/AccountSecurityPage.tsx',
      'src/pages/lowcode', 'src/pages/ai', 'src/pages/article', 'src/pages/dashboard',
    ],
    blocks: [
      { file: 'src/App.tsx', start: '/* CLEAN_DEMO_START: extras:content-imports */', end: '/* CLEAN_DEMO_END: extras:content-imports */' },
      { file: 'src/App.tsx', start: '/* CLEAN_DEMO_START: extras:marketing-imports */', end: '/* CLEAN_DEMO_END: extras:marketing-imports */' },
      { file: 'src/App.tsx', start: '/* CLEAN_DEMO_START: extras:account-imports */', end: '/* CLEAN_DEMO_END: extras:account-imports */' },
      { file: 'src/App.tsx', start: '/* CLEAN_DEMO_START: extras:platform-imports */', end: '/* CLEAN_DEMO_END: extras:platform-imports */' },
      { file: 'src/App.tsx', start: '/* CLEAN_DEMO_START: extras:secondary-imports */', end: '/* CLEAN_DEMO_END: extras:secondary-imports */' },
      { file: 'src/App.tsx', start: '{/* CLEAN_DEMO_START: extras:content-routes */}', end: '{/* CLEAN_DEMO_END: extras:content-routes */}' },
      { file: 'src/App.tsx', start: '{/* CLEAN_DEMO_START: extras:marketing-routes */}', end: '{/* CLEAN_DEMO_END: extras:marketing-routes */}' },
      { file: 'src/App.tsx', start: '{/* CLEAN_DEMO_START: extras:account-routes */}', end: '{/* CLEAN_DEMO_END: extras:account-routes */}' },
      { file: 'src/App.tsx', start: '{/* CLEAN_DEMO_START: extras:platform-routes */}', end: '{/* CLEAN_DEMO_END: extras:platform-routes */}' },
      { file: 'src/App.tsx', start: '{/* CLEAN_DEMO_START: extras:secondary-routes */}', end: '{/* CLEAN_DEMO_END: extras:secondary-routes */}' },
      { file: 'src/components/Sidebar.tsx', start: '/* CLEAN_DEMO_START: extras:dashboard-navigation */', end: '/* CLEAN_DEMO_END: extras:dashboard-navigation */' },
      { file: 'src/components/Sidebar.tsx', start: '/* CLEAN_DEMO_START: extras:platform-content-navigation */', end: '/* CLEAN_DEMO_END: extras:platform-content-navigation */' },
      { file: 'src/components/Sidebar.tsx', start: '/* CLEAN_DEMO_START: extras:analysis-navigation */', end: '/* CLEAN_DEMO_END: extras:analysis-navigation */' },
      { file: 'src/components/Sidebar.tsx', start: '/* CLEAN_DEMO_START: extras:marketing-navigation */', end: '/* CLEAN_DEMO_END: extras:marketing-navigation */' },
      { file: 'src/components/HorizontalNav.tsx', start: '/* CLEAN_DEMO_START: extras:content-analytics-navigation */', end: '/* CLEAN_DEMO_END: extras:content-analytics-navigation */' },
      { file: 'src/components/HorizontalNav.tsx', start: '/* CLEAN_DEMO_START: extras:marketing-users-navigation */', end: '/* CLEAN_DEMO_END: extras:marketing-users-navigation */' },
      { file: 'src/components/HorizontalNav.tsx', start: '/* CLEAN_DEMO_START: extras:permissions-navigation */', end: '/* CLEAN_DEMO_END: extras:permissions-navigation */' },
      { file: 'src/components/HorizontalNav.tsx', start: '/* CLEAN_DEMO_START: extras:settings-navigation */', end: '/* CLEAN_DEMO_END: extras:settings-navigation */' },
    ],
  },
  {
    id: 'examples',
    label: '功能示例',
    description: '前端权限、表格、表单、Socket 等功能示例页面',
    targets: ['src/pages/examples'],
    blocks: [
      { file: 'src/App.tsx', start: '/* CLEAN_DEMO_START: examples:imports */', end: '/* CLEAN_DEMO_END: examples:imports */' },
      { file: 'src/App.tsx', start: '{/* CLEAN_DEMO_START: examples:routes */}', end: '{/* CLEAN_DEMO_END: examples:routes */}' },
      { file: 'src/components/Sidebar.tsx', start: '/* CLEAN_DEMO_START: examples:navigation */', end: '/* CLEAN_DEMO_END: examples:navigation */' },
    ],
  },
  {
    id: 'templates',
    label: '模板中心',
    description: '卡片、横幅、图表、日历、聊天、地图等模板页面',
    targets: ['src/pages/tmpl', 'src/data/geo', 'src/data/mapData.ts'],
    blocks: [
      { file: 'src/App.tsx', start: '/* CLEAN_DEMO_START: templates:imports */', end: '/* CLEAN_DEMO_END: templates:imports */' },
      { file: 'src/App.tsx', start: '{/* CLEAN_DEMO_START: templates:routes */}', end: '{/* CLEAN_DEMO_END: templates:routes */}' },
      { file: 'src/components/Sidebar.tsx', start: '/* CLEAN_DEMO_START: templates:navigation */', end: '/* CLEAN_DEMO_END: templates:navigation */' },
    ],
  },
];

// Component-page references from the examples module are removed by dedicated
// markers above, so deleting the component center never needs to delete all examples.
const MODULE_DEPENDENCIES = [];

function optionValue(name) {
  const prefix = `${name}=`;
  const item = args.find((arg) => arg.startsWith(prefix));
  return item ? item.slice(prefix.length) : undefined;
}

function printUsage() {
  console.log(`\n用法：
  npm run clean                              # 打开交互式精简向导
  npm run clean:demo                         # 打开交互式精简向导
  npm run clean:components                   # 交互确认后仅清理组件中心
  npm run clean:components:dry               # 预览组件中心清理范围
  npm run clean:core                         # 交互确认后保留核心页面与组件页面
  npm run clean:core:dry                     # 预览核心版清理范围
  npm run clean:basic                        # 与 clean:core 相同，但跳过交互确认
  npm run clean:basic:dry                    # 预览核心版清理范围
  npm run clean:demo -- --keep=components,templates --yes
                                              # 保留指定模块并立即清理其他模块
  npm run clean:demo -- --remove=components --yes
                                              # 仅清理组件中心
  npm run clean:demo                         # 交互选择：基础 / 编号多选 / 全部 / 取消
  npm run clean:demo -- --preset=basic --dry-run
                                              # 非交互预览核心版模式

可保留模块：${DEMO_MODULES.map((module) => module.id).join('、')}
参数：--keep=<模块列表>  --remove=<模块列表>  --preset=basic  --dry-run  --yes  --interactive  --allow-dirty  --help\n`);
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

  for (const dependency of MODULE_DEPENDENCIES) {
    if (keep.has(dependency.module) && !keep.has(dependency.dependency)) {
      keep.add(dependency.dependency);
      autoKept.push(dependency);
    }
  }

  return { ids: [...keep], autoKept };
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

async function promptForKeepModules() {
  const readline = createInterface({ input, output });
  try {
    console.log('\n请选择清理方式：');
    console.log('  1. 只保留最基础内容（移除所有演示模块）');
    console.log('  2. 按编号选择要保留的模块（支持逗号或空格多选）');
    console.log('  3. 保留全部演示模块（不执行清理）');
    console.log('  4. 取消');
    const mode = (await readline.question('请输入 1、2、3 或 4：')).trim();

    if (mode === '1') return [];
    if (mode === '3') return DEMO_MODULES.map((module) => module.id);
    if (mode === '4' || !mode) return null;
    if (mode !== '2') throw new Error('请输入 1、2、3 或 4。');

    console.log('\n可保留模块：');
    DEMO_MODULES.forEach((module, index) => console.log(`  ${index + 1}. ${module.label}：${module.description}`));
    const answer = (await readline.question('请输入要保留的编号（例如 1,3；输入 all 保留全部；输入 none 只保留基础内容）：')).trim().toLowerCase();
    if (answer === 'all') return DEMO_MODULES.map((module) => module.id);
    if (answer === 'none' || answer === '') return [];

    const values = [...new Set(answer.split(/[\s,，、]+/).filter(Boolean))];
    const indexes = values.map((value) => Number(value));
    if (indexes.some((index) => !Number.isInteger(index) || index < 1 || index > DEMO_MODULES.length)) {
      throw new Error(`模块编号无效，请输入 1-${DEMO_MODULES.length} 范围内的编号。`);
    }
    return indexes.map((index) => DEMO_MODULES[index - 1].id);
  } finally {
    readline.close();
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
    return { ids: ['components'], autoRemoved: [] };
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
  console.log('\n基础保留：');
  console.log('  - 登录、工作台、系统管理、结果页面、异常页面、媒体库、订单管理、消息中心');
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

  const { ids: keepModuleIds, autoKept } = resolveKeepDependencies(selection.ids);
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
