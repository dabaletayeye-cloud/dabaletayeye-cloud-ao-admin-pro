import rulesConfig from '../../config/edition-rules.json';
import { resolveEditionModules, isCustomModule } from '../../core/editionRules.mjs';
import definitions from '../../../scripts/edition-presets.json';
import mockAuth from '../../config/mockAuth';
import { accountClients } from '../../config/accountClients';
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
    const modules = resolveEditionModules(id, definition.modules, [...installed], rulesConfig);
    if (modules.length || id === 'minimal' || id === 'full') presets[id as Edition] = modules;
  }

  if (!presets[edition]) edition = 'full';
  return { moduleSelectionResolved: true, customModules: [...installed].filter(id => isCustomModule(id, rulesConfig)), edition, enabledModules: [...(presets[edition] ?? [])], presets,
    sysUserEnabled: accountClients.enabled ? !!accountClients.userTypes.sysuser?.enabled : mockAuth.sysUserEnabled,
    accountTypes: accountClients.enabled ? Object.entries(accountClients.userTypes).filter(([, value]) => value.enabled).map(([id, value]) => ({ id, ...value })) : [],
  };
}

export function setMockEdition(input: EditionConfig): EditionConfig {
  const available = mockEditionConfig().presets!;
  if (!Object.hasOwn(available, input.edition)) throw new Error('此版本所需模块未安装');
  edition = input.edition;
  try { localStorage.setItem(key, edition); } catch { /* Optional browser storage. */ }
  return mockEditionConfig();
}
