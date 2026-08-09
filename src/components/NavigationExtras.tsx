import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, CircleXIcon, HomeIcon, LayersIcon, XIcon } from 'lucide-react';
import type { TabsStyle } from '../types';
import { localizeNavLabel, useLocale } from '../hooks/useLocale';

interface PageTab {
  path: string;
  label: string;
}

interface TabContextMenu {
  tab: PageTab;
  x: number;
  y: number;
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
  '/generation-quotas': '生成配额',
  '/permissions': '权限管理',
  '/settings': '系统设置',
  '/profile': '个人中心',
  '/account-security': '账号安全',
  '/messages': '消息中心',
  '/orders': '订单管理',
  '/media': '媒体库',
  '/analytics/traffic': '访问统计',
  '/analytics/portrait': '用户画像',
  '/analytics/funnel': '转化漏斗',
  '/examples/permissions': '前端权限',


/* CLEAN_DEMO_START: components:example-route-labels */
  '/examples/tabs': '标签页',
  '/examples/advanced-table': '高级表格',
  '/examples/forms': '表单',
  /* CLEAN_DEMO_END: components:example-route-labels */
'/examples/basic-table': '基础表格',
  '/examples/search-form': '搜索表单',
  '/examples/split-table': '左右布局表格',
  '/examples/socket': 'Socket 连接',
  '/dashboard/analytics': '分析页',
  '/dashboard/ecommerce': '电子商务',
  '/content/articles': '文章列表',
  '/content/categories': '分类管理',
  '/content/tags': '标签管理',
  '/article/list': '文章卡片',
  '/article/publish': '文章发布',
  '/tmpl/cards': '卡片',
  '/tmpl/banners': '横幅',
  '/tmpl/charts': '图表',
  '/tmpl/calendar': '日历',
  '/tmpl/chat': '聊天',
  '/tmpl/pricing': '定价',
  '/marketing/coupons': '优惠券',
  '/marketing/events': '活动管理',
  '/marketing/push': '推送通知',
  '/system/dict': '字典管理',
  '/system/servers': '服务器管理',
  '/system/files': '文件管理',
  '/result/success': '成功页',
  '/result/success-page': '成功页',
  '/result/fail': '失败页',
  '/result/fail-page': '失败页',
  '/error/403': '403 无权限',
  '/error/403-page': '403 无权限',
  '/error/404': '404 不存在',
  '/error/404-page': '404 不存在',
  '/error/500': '500 服务异常',
  '/error/500-page': '500 服务异常',
  '/tmpl/map': '地图模板',
  '/comp/overview': '组件总览',
  '/comp/buttons': '按钮组件',
  '/comp/forms': '表单组件',
  '/comp/table': '数据表格',
  '/comp/feedback': '弹窗反馈',
  '/comp/display': '数据展示',
  '/comp/nav': '导航组件',
  '/comp/icons': '图标库',
  '/comp/number-roll': '数字滚动',
  '/comp/rich-editor': '富文本编辑器',
  '/comp/image-crop': '图像裁剪',
  '/comp/qrcode': '二维码',
  '/comp/video-player': '视频播放器',
  '/comp/drag': '拖拽',
  '/comp/context-menu': '右键菜单',
  '/comp/watermark': '水印',
  '/comp/text-scroll': '文字滚动',
  '/comp/confetti': '礼花',
  '/comp/excel': 'Excel 导入导出',
  '/comp/word-cloud': '词云图',
  '/lowcode/api': '接口编排',
  '/lowcode/page': '页面设计器',
  '/lowcode/form': '表单引擎',
  '/lowcode/report': '报表引擎',
  '/lowcode/print': '打印模板',
  '/lowcode/generator': '代码生成器',
  '/lowcode/datasource': '数据源管理',
  '/lowcode/release': '发布管理',
  '/ai/chat': 'AI对话',
  '/ai/agent': 'AI助手',
  '/ai/customer-service': 'AI客服',
  '/ai/knowledge': '知识库',
  '/ai/prompt': '提示词模板',
  '/ai/model': '模型管理',
  '/ai/workflow': 'AI工作流',
};

function labelFor(path: string) {
  return ROUTE_LABELS[path] ?? path.split('/').filter(Boolean).pop() ?? '页面';
}

function loadTabs(current: PageTab): PageTab[] {
  try {
    const raw = sessionStorage.getItem(TAB_STORAGE_KEY);
    const saved = raw
      ? (JSON.parse(raw) as PageTab[]).map(tab => ({ ...tab, label: labelFor(tab.path) }))
      : [{ path: '/', label: '工作台' }];
    const tabs = saved.some(tab => tab.path === current.path) ? saved : [...saved, current];
    sessionStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(tabs.slice(-10)));
    return tabs.slice(-10);
  } catch {
    return [{ path: '/', label: '工作台' }, current].filter((tab, index, list) => list.findIndex(item => item.path === tab.path) === index);
  }
}

export function BreadcrumbTrail() {
  const location = useLocation();
  const { locale } = useLocale();
  const label = labelFor(location.pathname);
  return (
    <div className="flex h-9 items-center gap-1.5 border-b px-5 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
      <HomeIcon size={13} />
      <ChevronRightIcon size={13} />
      <span style={{ color: 'var(--foreground)' }}>{localizeNavLabel(label, locale)}</span>
    </div>
  );
}

export function PageTabs({ style }: { style: TabsStyle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale, t } = useLocale();
  const current = { path: location.pathname, label: labelFor(location.pathname) };
  const [tabs, setTabs] = useState<PageTab[]>(() => loadTabs(current));
  const [contextMenu, setContextMenu] = useState<TabContextMenu | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const persist = (nextTabs: PageTab[]) => {
    setTabs(nextTabs);
    try { sessionStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(nextTabs)); } catch { /* storage is optional */ }
  };

  const closeTab = (event: MouseEvent, tab: PageTab) => {
    event.stopPropagation();
    if (tab.path === '/') return;
    closePaths([tab.path]);
  };

  const closePaths = (paths: string[]) => {
    const pathSet = new Set(paths.filter(path => path !== '/'));
    const nextTabs = tabs.filter(tab => !pathSet.has(tab.path));
    persist(nextTabs);
    if (!nextTabs.some(tab => tab.path === location.pathname)) navigate(nextTabs[nextTabs.length - 1]?.path ?? '/');
  };

  const showContextMenu = (event: MouseEvent<HTMLButtonElement>, tab: PageTab) => {
    event.preventDefault();
    const menuWidth = 190;
    const menuHeight = 220;
    setContextMenu({
      tab,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8)),
    });
  };

  useEffect(() => {
    if (!contextMenu) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!contextMenuRef.current?.contains(event.target as Node)) setContextMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setContextMenu(null);
    };
    const closeOnResize = () => setContextMenu(null);
    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnResize);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnResize);
    };
  }, [contextMenu]);

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
            onContextMenu={event => showContextMenu(event, tab)}
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
            <span>{localizeNavLabel(tab.label, locale)}</span>
            {tab.path !== '/' && <XIcon size={12} className="opacity-55 transition-opacity group-hover:opacity-100" onClick={event => closeTab(event, tab)} />}
          </button>
        );
      })}
      {contextMenu && (() => {
        const tabIndex = tabs.findIndex(tab => tab.path === contextMenu.tab.path);
        const closeLeft = tabs.slice(0, tabIndex).filter(tab => tab.path !== '/').map(tab => tab.path);
        const closeRight = tabs.slice(tabIndex + 1).filter(tab => tab.path !== '/').map(tab => tab.path);
        const closeOthers = tabs.filter(tab => tab.path !== '/' && tab.path !== contextMenu.tab.path).map(tab => tab.path);
        const menuItems = [
          { label: t('closeTab'), icon: <XIcon size={15} />, paths: contextMenu.tab.path === '/' ? [] : [contextMenu.tab.path] },
          { label: t('closeLeftTabs'), icon: <ChevronLeftIcon size={15} />, paths: closeLeft },
          { label: t('closeRightTabs'), icon: <ChevronRightIcon size={15} />, paths: closeRight },
          { label: t('closeOtherTabs'), icon: <LayersIcon size={15} />, paths: closeOthers },
          { label: t('closeAllTabs'), icon: <CircleXIcon size={15} />, paths: tabs.filter(tab => tab.path !== '/').map(tab => tab.path) },
        ];
        return (
          <div
            ref={contextMenuRef}
            role="menu"
            aria-label={t('tabActions')}
            style={{ position: 'fixed', zIndex: 80, left: contextMenu.x, top: contextMenu.y, width: 190, padding: 5, background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 7, boxShadow: '0 12px 30px rgba(0,0,0,.16)' }}
          >
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.paths.length === 0}
                onClick={() => {
                  setContextMenu(null);
                  closePaths(item.paths);
                }}
                style={{ display: 'flex', width: '100%', height: 34, alignItems: 'center', gap: 9, padding: '0 9px', color: index === menuItems.length - 1 ? 'var(--destructive)' : 'var(--foreground)', background: 'transparent', border: 'none', borderRadius: 5, cursor: item.paths.length ? 'pointer' : 'not-allowed', fontSize: 12, opacity: item.paths.length ? 1 : .42, textAlign: 'left' }}
                onMouseEnter={event => { if (item.paths.length) event.currentTarget.style.background = 'var(--accent)'; }}
                onMouseLeave={event => { event.currentTarget.style.background = 'transparent'; }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
