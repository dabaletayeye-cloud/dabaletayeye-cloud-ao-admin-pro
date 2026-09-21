import definitions from '../../../scripts/edition-presets.json';
import { moduleMenus } from '../../generated/registry';
import type { Edition, EditionConfig } from '../../core/edition';

const key = 'ao-demo-edition';
let edition: Edition = 'full';
try { const saved = localStorage.getItem(key); if (saved && Object.hasOwn(definitions, saved)) edition = saved as Edition; } catch { /* Optional browser storage. */ }

export function mockEditionConfig(): EditionConfig {
  const installed = new Set(moduleMenus.map(menu => menu.module));
  if (moduleMenus.some(menu => menu.path === '/system/servers')) installed.add('server');
  const presets: Partial<Record<Edition, string[]>> = { minimal: [] };
  for (const [id, definition] of Object.entries(definitions)) {
    if (id === 'minimal' || id === 'full') continue;
    const modules = (definition.modules as string[]).filter(module => installed.has(module));
    if (modules.length) presets[id as Edition] = modules;
  }
  presets.full = [];
  if (!presets[edition]) edition = 'full';
  return { edition, enabledModules: [...(presets[edition] ?? [])], presets };
}

export function setMockEdition(input: EditionConfig): EditionConfig {
  const available = mockEditionConfig().presets!;
  if (!Object.hasOwn(available, input.edition)) throw new Error('此版本所需模块未安装');
  edition = input.edition;
  try { localStorage.setItem(key, edition); } catch { /* Optional browser storage. */ }
  return mockEditionConfig();
}
