import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const confirmed = args.includes('--yes');
const interactive = args.includes('--interactive');
const execFileAsync = promisify(execFile);

const MODULES = [
  {
    label: '扩展业务模块',
    targets: [
      'src/pages/ArticleListPage.tsx', 'src/pages/CategoryPage.tsx', 'src/pages/TagPage.tsx',
      'src/pages/VisitStatsPage.tsx', 'src/pages/UserPortraitPage.tsx', 'src/pages/FunnelPage.tsx',
      'src/pages/CouponPage.tsx', 'src/pages/ActivityPage.tsx', 'src/pages/PushPage.tsx',
      'src/pages/PermissionPage.tsx', 'src/pages/SettingsPage.tsx', 'src/pages/ProfilePage.tsx',
      'src/pages/AccountSecurityPage.tsx', 'src/pages/lowcode', 'src/pages/ai',
      'src/pages/article', 'src/pages/dashboard',
    ],
    blocks: [
      block('src/App.tsx', 'extras:content-imports', "import MediaPage from './pages/MediaPage';"),
      block('src/App.tsx', 'extras:marketing-imports', "import UsersPage from './pages/UsersPage';"),
      block('src/App.tsx', 'extras:account-imports', '/* CLEAN_DEMO_START: components:imports */', "import SuccessPage from './pages/result/SuccessPage';"),
      block('src/App.tsx', 'extras:platform-imports', '/* CLEAN_DEMO_START: components:imports */', "import SuccessPage from './pages/result/SuccessPage';"),
      block('src/App.tsx', 'extras:secondary-imports', "import SuccessPage from './pages/result/SuccessPage';"),
      block('src/App.tsx', 'extras:content-routes', '<Route path="/media" element={<MediaPage />} />'),
      block('src/App.tsx', 'extras:marketing-routes', '<Route path="/users" element={<UsersPage />} />'),
      block('src/App.tsx', 'extras:account-routes', '{/* CLEAN_DEMO_START: components:routes */}', '<Route path="/result/success" element={<ResultPage />} />'),
      block('src/App.tsx', 'extras:platform-routes', '{/* CLEAN_DEMO_START: components:routes */}', '<Route path="/result/success" element={<ResultPage />} />'),
      block('src/components/Sidebar.tsx', 'extras:dashboard-navigation', '/* CLEAN_DEMO_START: components:navigation */', "{ type: 'group', icon: <CheckCircle2Icon size={16} />, label: '结果页面',"),
      block('src/components/Sidebar.tsx', 'extras:platform-content-navigation', "label: '结果页面'"),
      block('src/components/Sidebar.tsx', 'extras:analysis-navigation', "{ type: 'link', icon: <ImageIcon size={16} />, label: '媒体库', path: '/media' },"),
      block('src/components/Sidebar.tsx', 'extras:marketing-navigation', "{ type: 'link', icon: <ShoppingCartIcon size={16} />, label: '订单管理', path: '/orders' },"),
      block('src/components/HorizontalNav.tsx', 'extras:content-analytics-navigation', "{ type: 'link', id: 'media', icon: <ImageIcon size={14} />, label: '媒体库', path: '/media' },"),
      block('src/components/HorizontalNav.tsx', 'extras:marketing-users-navigation', "{ type: 'link', id: 'orders', icon: <ShoppingCartIcon size={14} />, label: '订单管理', path: '/orders' },"),
      block('src/components/HorizontalNav.tsx', 'extras:permissions-navigation', "{ type: 'link', id: 'messages', icon: <MessageSquareIcon size={14} />, label: '消息中心', path: '/messages' },"),
      block('src/components/HorizontalNav.tsx', 'extras:settings-navigation', "{\n    type: 'group', id: 'system',"),
    ],
  },
  {
    label: '功能示例',
    targets: ['src/pages/examples'],
    blocks: [
      block('src/App.tsx', 'examples:imports', 'export default function App()'),
      block('src/App.tsx', 'examples:routes', '<Route path="/result/success" element={<ResultPage />} />'),
      block('src/components/Sidebar.tsx', 'examples:navigation', "{ type: 'link', icon: <ImageIcon size={16} />, label: '媒体库', path: '/media' },"),
    ],
  },
  {
    label: '模板中心',
    targets: ['src/pages/tmpl', 'src/data/geo', 'src/data/mapData.ts'],
    blocks: [
      block('src/App.tsx', 'templates:imports', "import SuccessPage from './pages/result/SuccessPage';"),
      block('src/App.tsx', 'templates:routes', '<Route path="/result/success" element={<ResultPage />} />'),
      block('src/components/Sidebar.tsx', 'templates:navigation', "{ type: 'link', icon: <ImageIcon size={16} />, label: '媒体库', path: '/media' },"),
    ],
  },
];

// The final route block must be restored after examples and templates so that
// the original route order remains intact when all core-cleaned modules return.
const SECONDARY_ROUTE_BLOCK = block(
  'src/App.tsx',
  'extras:secondary-routes',
  '<Route path="/result/success" element={<ResultPage />} />',
);

function block(file, name, ...anchors) {
  const [, section] = name.split(':');
  return {
    file,
    start: file.endsWith('App.tsx') && section.includes('routes')
      ? `{/* CLEAN_DEMO_START: ${name} */}`
      : `/* CLEAN_DEMO_START: ${name} */`,
    end: file.endsWith('App.tsx') && section.includes('routes')
      ? `{/* CLEAN_DEMO_END: ${name} */}`
      : `/* CLEAN_DEMO_END: ${name} */`,
    anchors,
  };
}

function printUsage() {
  console.log(`\n用法：
  npm run restore:core:dry        # 预览恢复核心版清理内容的范围
  npm run restore:core            # 交互确认后恢复
  npm run restore:core -- --yes   # 跳过确认并恢复
\n恢复内容：扩展业务模块、功能示例、模板中心，以及它们对应的路由和导航入口。\n`);
}

async function runGit(gitArgs) {
  return execFileAsync('git', gitArgs, { cwd: projectRoot });
}

function extractBlock(source, item) {
  const startIndex = source.indexOf(item.start);
  const endIndex = source.indexOf(item.end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`当前 HEAD 中缺少恢复标记：${item.file}（${item.start}）`);
  }
  return source.slice(startIndex, endIndex + item.end.length);
}

function restoreBlock(current, baseline, item) {
  const startIndex = current.indexOf(item.start);
  const endIndex = current.indexOf(item.end);
  if (startIndex !== -1 && endIndex !== -1) return { content: current, changed: false };
  if (startIndex !== -1 || endIndex !== -1) {
    throw new Error(`恢复标记不完整，已停止恢复：${item.file}（${item.start}）`);
  }

  const anchor = item.anchors.find((candidate) => current.includes(candidate));
  if (!anchor) {
    throw new Error(`找不到安全插入位置，已停止恢复：${item.file}（${item.start}）`);
  }

  const anchorIndex = current.indexOf(anchor);
  const restored = extractBlock(baseline, item).trimEnd();
  return {
    content: `${current.slice(0, anchorIndex)}${restored}\n${current.slice(anchorIndex)}`,
    changed: true,
  };
}

async function collectDeletedFiles(targets) {
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
  const targets = MODULES.flatMap((module) => module.targets);
  const deletedFiles = await collectDeletedFiles(targets);
  const blocks = [...MODULES[0].blocks.filter((item) => !item.start.includes('secondary-routes')),
    ...MODULES[1].blocks, ...MODULES[2].blocks, SECONDARY_ROUTE_BLOCK];
  const blocksByFile = new Map();
  for (const item of blocks) {
    const fileBlocks = blocksByFile.get(item.file) ?? [];
    fileBlocks.push(item);
    blocksByFile.set(item.file, fileBlocks);
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
    for (const item of fileBlocks) {
      const result = restoreBlock(content, baseline, item);
      content = result.content;
      changed ||= result.changed;
    }
    if (changed) filesToWrite.set(absolutePath, content);
  }

  console.log('\n将恢复：');
  console.log(deletedFiles.length > 0
    ? `  - ${deletedFiles.length} 个被核心版清理删除的页面或数据文件（从当前 HEAD 恢复）`
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
    approved = await askYesNo('\n将恢复以上核心版清理内容，确认继续吗？');
  }
  if (!approved) {
    console.log('\n已取消，未修改任何文件。');
    return;
  }

  if (deletedFiles.length > 0) {
    await runGit(['restore', '--source=HEAD', '--staged', '--worktree', '--', ...targets]);
  }
  for (const [filePath, content] of filesToWrite) await writeFile(filePath, content, 'utf8');

  console.log('\n核心版清理内容已恢复。请运行 npm run build 验证。');
}

main().catch((error) => {
  console.error(`\n恢复失败：${error.message}`);
  process.exitCode = 1;
});
