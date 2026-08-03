import { access, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceRoot = path.join(projectRoot, 'src');
const dryRun = process.argv.includes('--dry-run');
const confirmed = process.argv.includes('--yes');

const targets = [
  'src/pages/comp',
  'src/pages/examples',
  'src/pages/tmpl',
  'src/data/geo',
  'src/data/mapData.ts',
];

const sourcePatches = [
  {
    file: 'src/App.tsx',
    blocks: [
      { start: '/* CLEAN_DEMO_START: imports */', end: '/* CLEAN_DEMO_END: imports */' },
      { start: '{/* CLEAN_DEMO_START: routes */}', end: '{/* CLEAN_DEMO_END: routes */}' },
    ],
  },
];

const demoNavigationPaths = [
  '/comp/overview',
  '/examples/permissions',
  '/tmpl/cards',
];

function toAbsolutePath(relativePath) {
  const absolutePath = path.resolve(projectRoot, relativePath);
  const allowedPrefix = sourceRoot + path.sep;

  if (!absolutePath.startsWith(allowedPrefix)) {
    throw new Error('Refusing to remove a path outside src: ' + relativePath);
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

function removeMarkedBlock(source, block, file) {
  const startIndex = source.indexOf(block.start);
  const endIndex = source.indexOf(block.end);

  if (startIndex === -1 && endIndex === -1) return source;
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error('Cleanup markers are invalid in ' + file);
  }

  const before = source.slice(0, startIndex).replace(/[ \t]*$/, '');
  const after = source.slice(endIndex + block.end.length).replace(/^\r?\n/, '');
  return before + '\n' + after;
}

function removeNavigationGroup(source, pathName) {
  const anchor = source.indexOf("path: '" + pathName + "'");
  const start = source.lastIndexOf('\n  {', anchor) + 1;
  const end = source.indexOf('\n  },', anchor);

  if (anchor === -1 || start === 0 || end === -1) {
    throw new Error('Could not find the navigation group for ' + pathName);
  }

  const after = source.slice(end + '\n  },'.length).replace(/^\r?\n/, '');
  return source.slice(0, start) + after;
}

async function buildSourceChanges() {
  const changes = [];

  for (const patch of sourcePatches) {
    const filePath = path.join(projectRoot, patch.file);
    let content = await readFile(filePath, 'utf8');
    for (const block of patch.blocks) {
      content = removeMarkedBlock(content, block, patch.file);
    }
    changes.push({ filePath, content });
  }

  const sidebarPath = path.join(projectRoot, 'src/components/Sidebar.tsx');
  let sidebar = await readFile(sidebarPath, 'utf8');
  for (const pathName of demoNavigationPaths) {
    sidebar = removeNavigationGroup(sidebar, pathName);
  }
  changes.push({ filePath: sidebarPath, content: sidebar });

  return changes;
}

async function main() {
  const existingTargets = [];

  for (const target of targets) {
    const absolutePath = toAbsolutePath(target);
    if (await exists(absolutePath)) existingTargets.push(target);
  }
  const sourceChanges = await buildSourceChanges();

  console.log('Demo cleanup will remove:');
  for (const target of existingTargets) console.log('  - ' + target);
  console.log('It will also remove matching routes and sidebar navigation entries.');

  if (dryRun) {
    console.log('\nDry run only. No files were changed.');
    return;
  }

  if (!confirmed) {
    console.error('\nPass --yes to apply this cleanup, or use --dry-run to preview it.');
    process.exitCode = 1;
    return;
  }

  for (const change of sourceChanges) {
    await writeFile(change.filePath, change.content, 'utf8');
  }

  for (const target of existingTargets) {
    await rm(toAbsolutePath(target), { recursive: true, force: true });
  }

  console.log('\nDemo cleanup completed. Run npm run build to verify the streamlined project.');
}

main().catch((error) => {
  console.error('\nDemo cleanup failed: ' + error.message);
  process.exitCode = 1;
});
