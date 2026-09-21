import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { listBackups, rejectLinks } from './edition-prune-lib.mjs';

export async function readBuildEdition(root) {
  const file = path.join(root, 'src/config/build-edition.json');
  await rejectLinks(root, file);
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  // Upgrade snapshots created before automatic edition selection existed.
  const active = (await listBackups(root)).find(item => item.status === 'complete');
  if (!active) return null;
  const presets = JSON.parse(await readFile(path.join(root, 'scripts/edition-presets.json'), 'utf8'));
  const included = presets[active.edition]?.modules;
  const value = { edition: active.edition, enabledModules: included === '*' ? [] : (included ?? active.keep).filter(id => active.keep.includes(id) || id === 'server' && active.keep.includes('operations')), revision: active.id };
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value, null, 2) + '\n');
  return value;
}
