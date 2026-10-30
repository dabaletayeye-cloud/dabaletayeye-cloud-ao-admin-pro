import { moduleMenus } from '../generated/registry';

const CORE_ROUTE_PERMISSIONS: Record<string, string> = {
  '/': 'dashboard:view',
  '/users': 'user:list',
  '/system/users': 'user:list',
  '/system/sys-users': 'config:view',
  '/system/roles': 'role:list',
  '/system/menus': 'menu:list',
  '/system/logs': 'log:list',
  '/system/dict': 'dict:list',
  '/system/config': 'config:view',
  '/permissions': 'perm:list',
  '/settings': 'config:view',
  '/orders': 'order:list',
  '/messages': 'message:list',
  '/generation-quotas': 'config:view',
  '/tenancy/regions': 'config:view',
  '/tenancy/merchants': 'config:view',
};

export function requiredRoutePermission(path: string): string | null {
  if (path.startsWith('/system/account-users/')) return 'config:view';
  const menu = moduleMenus.find(item => item.path === path);
  if (menu) return menu.perms.find(permission => /:(list|view)$/.test(permission)) ?? menu.perms[0] ?? null;
  return CORE_ROUTE_PERMISSIONS[path] ?? null;
}

export function hasRoutePermission(path: string, permissions: ReadonlySet<string>): boolean {
  if (permissions.has('admin:all')) return true;
  const required = requiredRoutePermission(path);
  return required !== null && permissions.has(required);
}
