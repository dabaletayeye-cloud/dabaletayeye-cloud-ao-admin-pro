type NavigationItem = { type: string; label: string; children?: Array<{ path: string }> };

export function resolveNavigationGroup(items: NavigationItem[], pathname: string, preferred?: unknown): string | null {
  const candidates = items.filter(item => item.type === 'group' && item.children?.some(child => child.path === pathname));
  return candidates.find(item => item.label === preferred)?.label ?? candidates[0]?.label ?? null;
}
