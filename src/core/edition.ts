import type { ModuleMenuEntry, ModulePermissionGroup, ModuleRoute } from '../generated/registry';
import { moduleMenus } from '../generated/registry';

export type Edition = 'minimal' | 'erp' | 'oa' | 'saas' | 'ecommerce' | 'devplatform' | 'bi' | 'demo' | 'ai' | 'cms' | 'crm' | 'full';
export interface EditionConfig { edition: Edition; enabledModules: string[]; presets?: Partial<Record<Edition, string[]>>; }

export const DEFAULT_EDITION: EditionConfig = { edition: 'full', enabledModules: [] };

export function isModuleEnabled(module: string, config: EditionConfig): boolean {
  if (!module || module === 'core') return true;
  if (config.edition === 'minimal') return false;
  if (config.edition === 'erp') return module === 'erp';
  if (config.edition === 'oa') return module === 'oa';
  if (config.edition !== 'full') return config.enabledModules.includes(module);
  return true;
}

export function isEntryEnabled(item: { module: string; path?: string }, config: EditionConfig): boolean {
  return isModuleEnabled(item.module, config)
    || (isNewPreset(config.edition) && item.path === '/system/servers' && config.enabledModules.includes('server'));
}

export function filterByEdition<T extends { module: string; path?: string }>(items: T[], config: EditionConfig): T[] {
  return items.filter(item => isEntryEnabled(item, config));
}
export const filterModuleMenus = (items: ModuleMenuEntry[], config: EditionConfig) => filterByEdition(items, config);
export const filterModuleRoutes = (items: ModuleRoute[], config: EditionConfig) => filterByEdition(items, config);
export function filterPermissionGroups(groups: ModulePermissionGroup[], config: EditionConfig): ModulePermissionGroup[] {
  return groups.map(group => ({ ...group, items: group.items.filter(item => {
    const owner = moduleMenus.find(menu => menu.perms.includes(item.key));
    return owner ? isEntryEnabled(owner, config) : isModuleEnabled(item.key.split(':')[0], config);
  }) })).filter(group => group.items.length > 0);
}

export function availableEditions(modules: Array<{ module: string; path?: string }>, config?: EditionConfig): Edition[] {
  const result: Edition[] = ['minimal'];
  if (modules.some(item => item.module === 'erp')) result.push('erp');
  if (modules.some(item => item.module === 'oa')) result.push('oa');
  for (const [edition, included] of Object.entries(config?.presets ?? {})) {
    if (edition === 'minimal' || edition === 'full' || result.includes(edition as Edition)) continue;
    if (included?.some(module => modules.some(item => item.module === module || module === 'server' && item.path === '/system/servers'))) result.push(edition as Edition);
  }
  result.push('full');
  return result;
}

export function isNewPreset(edition: Edition): boolean {
  return !['minimal', 'erp', 'oa', 'saas', 'full'].includes(edition);
}

export function showDemoPages(config: EditionConfig): boolean {
  return config.edition !== 'saas' && (!isNewPreset(config.edition) || config.edition === 'demo');
}
