import { access, readFile, rm, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceRoot = path.join(projectRoot, 'src');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const confirmed = args.includes('--yes');
const interactive = args.includes('--interactive');

const DEMO_MODULES = [
  {
    id: 'components',
    label: '组件中心',
    description: '表单、表格、词云图、二维码等组件演示页面',
    targets: ['src/pages/comp'],
    blocks: [
      { file: 'src/App.tsx', start: '/* CLEAN_DEMO_START: components:imports */', end: '/* CLEAN_DEMO_END: components:imports */' },
      { file: 'src/App.tsx', start: '{/* CLEAN_DEMO_START: components:routes */}', end: '{/* CLEAN_DEMO_END: components:routes */}' },
      { file: 'src/components/Sidebar.tsx', start: '/* CLEAN_DEMO_START: components:navigation */', end: '/* CLEAN_DEMO_END: components:navigation */' },
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

const MODULE_DEPENDENCIES = [
  {
    module: 'examples',
    dependency: 'components',
    reason: '功能示例中的标签页、高级表格和表单会复用组件中心页面。',
  },
];

function optionValue(name) {
  const prefix = `${name}=`;
  const item = args.find((arg) => arg.startsWith(prefix));
  return item ? item.slice(prefix.length) : undefined;
}

function printUsage() {
  console.log(`\n用法：
  npm run clean:demo                         # 打开交互式精简向导
  npm run clean:basic                        # 仅保留基础业务页面
  npm run clean:basic:dry                    # 预览“仅保留基础业务”的清理范围
  npm run clean:demo -- --keep=components,templates --yes
                                              # 保留指定模块并立即清理其他模块
  npm run clean:demo -- --preset=basic --dry-run
                                              # 非交互预览基础业务模式

可保留模块：${DEMO_MODULES.map((module) => module.id).join('、')}
参数：--keep=<模块列表>  --preset=basic  --dry-run  --yes  --interactive  --help\n`);
}

function parseKeepList(value) {
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
    console.log('\n请选择精简模式：');
    console.log('  1. 仅保留基础业务页面（移除组件中心、功能示例和模板中心）');
    console.log('  2. 自定义选择需要保留的演示模块');
    console.log('  3. 取消');
    const mode = (await readline.question('请输入 1、2 或 3：')).trim();

    if (mode === '1') return [];
    if (mode === '3' || !mode) return null;
    if (mode !== '2') throw new Error('请输入 1、2 或 3。');

    const keep = [];
    for (const module of DEMO_MODULES) {
      const answer = (await readline.question(`保留「${module.label}」吗？（Y/n）`)).trim().toLowerCase();
      if (!answer || ['y', 'yes', '是'].includes(answer)) keep.push(module.id);
    }
    return keep;
  } finally {
    readline.close();
  }
}

async function chooseKeepModules() {
  const keepValue = optionValue('--keep');
  const preset = optionValue('--preset');

  if (keepValue !== undefined && preset !== undefined) {
    throw new Error('--keep 与 --preset 不能同时使用。');
  }
  if (preset !== undefined) {
    if (preset !== 'basic') throw new Error('当前只支持 --preset=basic。');
    return [];
  }
  if (keepValue !== undefined) return parseKeepList(keepValue);
  if (interactive || input.isTTY) return promptForKeepModules();

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

function printPlan(removeModules, existingTargets) {
  const keepModules = DEMO_MODULES.filter((module) => !removeModules.includes(module));
  console.log('\n将保留：');
  console.log(keepModules.length > 0 ? `  - ${keepModules.map((module) => module.label).join('、')}` : '  - 仅保留基础业务页面');
  console.log('\n将移除：');
  for (const module of removeModules) console.log(`  - ${module.label}：${module.description}`);
  if (existingTargets.length > 0) {
    console.log('\n将删除的目录或文件：');
    for (const target of existingTargets) console.log(`  - ${target}`);
  }
  console.log('\n同时会移除对应的路由、导入和侧边栏菜单项。');
}

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  const selectedModuleIds = await chooseKeepModules();
  if (selectedModuleIds === null) {
    console.log('\n已取消，未修改任何文件。');
    return;
  }

  const { ids: keepModuleIds, autoKept } = resolveKeepDependencies(selectedModuleIds);
  for (const dependency of autoKept) {
    const module = DEMO_MODULES.find((item) => item.id === dependency.module);
    const required = DEMO_MODULES.find((item) => item.id === dependency.dependency);
    console.log(`\n已自动保留「${required.label}」：${module.label}依赖该模块。${dependency.reason}`);
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
  printPlan(removeModules, existingTargets);

  if (dryRun) {
    console.log('\n预览结束，未修改任何文件。');
    return;
  }

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
