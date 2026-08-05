import { access, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = path.resolve(projectRoot, 'dist');
const dryRun = process.argv.slice(2).includes('--dry-run');

if (path.dirname(outputDir) !== projectRoot) {
  throw new Error('拒绝清理项目根目录外的构建产物。');
}

try {
  await access(outputDir);
} catch {
  console.log('dist/ 不存在，无需清理。');
  process.exit(0);
}

if (dryRun) {
  console.log('将删除构建产物：dist/（预览模式，未修改文件）');
  process.exit(0);
}

await rm(outputDir, { recursive: true, force: true });
console.log('已删除构建产物：dist/');
