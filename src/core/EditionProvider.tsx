import { setMerchantScope } from '../api/merchantScope';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiAdapter } from '../api/adapter';
import { moduleMenus, moduleRoutes, modulePermissionGroups } from '../generated/registry';
import { DEFAULT_EDITION, filterByEdition, filterPermissionGroups, isModuleEnabled, type Edition, type EditionConfig } from './edition';
import type { ModuleMenuEntry, ModuleRoute } from '../generated/registry';
import { BUILD_EDITION } from '../generated/buildEdition';
import { applyBuildEdition, BUILD_OVERRIDE_KEY, type BuildEdition } from './buildEdition';

const buildEdition = BUILD_EDITION as BuildEdition | null;
function resolveEdition(config: EditionConfig): EditionConfig {
  let override: string | null = null;
  try { override = localStorage.getItem(BUILD_OVERRIDE_KEY); } catch { /* Storage is optional. */ }
  return applyBuildEdition(config, buildEdition, override);
}

interface EditionContextValue {
  config: EditionConfig;
  loading: boolean;
  refreshEdition: () => Promise<void>;
  setEdition: (edition: Edition) => Promise<EditionConfig>;
  filterMenus: (items: ModuleMenuEntry[]) => ModuleMenuEntry[];
  filterRoutes: (items: ModuleRoute[]) => ModuleRoute[];
  filterPermissions: typeof filterPermissionGroups;
  isModuleEnabled: (module: string) => boolean;
}
const Context = createContext<EditionContextValue | null>(null);

export function EditionProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<EditionConfig>(() => resolveEdition(DEFAULT_EDITION));
  const [loading, setLoading] = useState(true);
  const refreshEdition = useCallback(async () => {
    try {
      const next = await apiAdapter.getSystemEdition();
      if (next?.edition) setConfig(resolveEdition({ ...next, enabledModules: Array.isArray(next.enabledModules) ? next.enabledModules : [] }));
    } catch {
      // Users without configuration permission can still identify their own account domain.
      try { const profile = await apiAdapter.getCurrentProfile(); setConfig(current => ({ ...current, sysUserEnabled: profile.accountType === 'sysuser' })); }
      catch { /* Anonymous pages keep the default state. */ }
    }
    finally {
      try { const tenancy = await apiAdapter.getTenancyContext(); if(!tenancy.available)setMerchantScope(0); setConfig(current => ({...current,...(!tenancy.platform&&tenancy.editionConfig?resolveEdition(tenancy.editionConfig):{}),tenancy:{...tenancy,available:tenancy.available&&['saas','ecommerce','crm','full'].includes(current.edition)}})); } catch { setConfig(current=>({...current,tenancy:undefined})); }
      setLoading(false);
    }
  }, []);
  useEffect(() => { void refreshEdition(); }, [refreshEdition]);
  const setEdition = useCallback(async (edition: Edition) => {
    const next = await apiAdapter.updateSystemEdition({ edition, enabledModules: [] });
    if (buildEdition) {
      try { localStorage.setItem(BUILD_OVERRIDE_KEY, buildEdition.revision); } catch { /* Storage is optional. */ }
    }
    const tenancy = await apiAdapter.getTenancyContext().catch(()=>undefined);
    if(!tenancy?.available)setMerchantScope(0);
    const normalized = { ...next, enabledModules: next.enabledModules || [], tenancy: tenancy ? {...tenancy,available:tenancy.available&&['saas','ecommerce','crm','full'].includes(next.edition)} : undefined };
    setConfig(normalized);
    window.dispatchEvent(new CustomEvent('ao-edition-changed', { detail: normalized }));
    return normalized;
  }, []);
  const value = useMemo<EditionContextValue>(() => ({
    config, loading, refreshEdition, setEdition,
    filterMenus: items => filterByEdition(items, config),
    filterRoutes: items => filterByEdition(items, config),
    filterPermissions: items => filterPermissionGroups(items, config),
    isModuleEnabled: module => isModuleEnabled(module, config),
  }), [config, loading, refreshEdition, setEdition]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useEdition() {
  const value = useContext(Context);
  if (!value) throw new Error('useEdition must be used within EditionProvider');
  return value;
}
export { moduleMenus, moduleRoutes, modulePermissionGroups };
