import { useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon, XIcon } from 'lucide-react';
import type { TabsStyle } from '../types';

interface PageTab {
  path: string;
  label: string;
}

const TAB_STORAGE_KEY = 'admin-page-tabs';

const ROUTE_LABELS: Record<string, string> = {
  '/': '工作台',
  '/system/users': '用户管理',
  '/users': '用户管理',
  '/system/roles': '角色管理',
  '/system/menus': '菜单管理',
  '/system/logs': '日志管理',
  '/system/config': '系统配置',
  '/permissions': '权限管理',
  '/settings': '系统设置',
  '/messages': '消息中心',
  '/orders': '订单管理',
  '/media': '媒体库',
  '/analytics/traffic': '访问统计',
  '/analytics/portrait': '用户画像',
  '/analytics/funnel': '转化漏斗',
  '/examples/permissions': '前端权限',
  '/examples/tabs': '标签页',
  '/examples/basic-table': '基础表格',
  '/examples/advanced-table': '高级表格',
  '/examples/forms': '表单',
  '/examples/search-form': '搜索表单',
  '/examples/split-table': '左右布局表格',
  '/examples/socket': 'Socket 连接',
};

function labelFor(path: string) {
  return ROUTE_LABELS[path] ?? path.split('/').filter(Boolean).pop() ?? '页面';
}

function loadTabs(current: PageTab): PageTab[] {
  try {
    const raw = sessionStorage.getItem(TAB_STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) as PageTab[] : [{ path: '/', label: '工作台' }];
    const tabs = saved.some(tab => tab.path === current.path) ? saved : [...saved, current];
    sessionStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(tabs.slice(-10)));
    return tabs.slice(-10);
  } catch {
    return [{ path: '/', label: '工作台' }, current].filter((tab, index, list) => list.findIndex(item => item.path === tab.path) === index);
  }
}

export function BreadcrumbTrail() {
  const location = useLocation();
  const label = labelFor(location.pathname);
  return (
    <div className="flex h-9 items-center gap-1.5 border-b px-5 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
      <HomeIcon size={13} />
      <ChevronRightIcon size={13} />
      <span style={{ color: 'var(--foreground)' }}>{label}</span>
    </div>
  );
}

export function PageTabs({ style }: { style: TabsStyle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const current = { path: location.pathname, label: labelFor(location.pathname) };
  const [tabs, setTabs] = useState<PageTab[]>(() => loadTabs(current));

  const persist = (nextTabs: PageTab[]) => {
    setTabs(nextTabs);
    try { sessionStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(nextTabs)); } catch { /* storage is optional */ }
  };

  const closeTab = (event: MouseEvent, tab: PageTab) => {
    event.stopPropagation();
    if (tab.path === '/') return;
    const nextTabs = tabs.filter(item => item.path !== tab.path);
    persist(nextTabs);
    if (tab.path === location.pathname) navigate(nextTabs[nextTabs.length - 1]?.path ?? '/');
  };

  const isCard = style === 'card';
  const isChrome = style === 'chrome';
  return (
    <div className="flex min-h-10 items-end gap-1 overflow-x-auto border-b px-3 pt-1" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      {tabs.map(tab => {
        const active = tab.path === location.pathname;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            className="group flex h-8 shrink-0 items-center gap-1.5 px-3 text-xs transition-colors"
            style={{
              background: active ? (isCard || isChrome ? 'var(--accent)' : 'transparent') : 'transparent',
              color: active ? (isCard || isChrome ? 'var(--accent-foreground)' : 'var(--primary)') : 'var(--muted-foreground)',
              border: isCard ? `1px solid ${active ? 'var(--primary)' : 'var(--border)'}` : isChrome ? '1px solid transparent' : 'none',
              borderBottom: !isCard && !isChrome ? (active ? '2px solid var(--primary)' : '2px solid transparent') : 'none',
              borderRadius: isCard ? '7px 7px 0 0' : isChrome ? '999px' : '0',
              fontWeight: active ? 700 : 500,
            }}
          >
            <span>{tab.label}</span>
            {tab.path !== '/' && <XIcon size={12} className="opacity-55 transition-opacity group-hover:opacity-100" onClick={event => closeTab(event, tab)} />}
          </button>
        );
      })}
    </div>
  );
}
