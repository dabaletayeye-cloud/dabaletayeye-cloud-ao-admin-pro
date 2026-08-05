import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import {
  LayoutDashboardIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  TagIcon,
  BarChart2Icon,
  UsersIcon,
  FunnelIcon,
  ImageIcon,
  TicketIcon,
  ZapIcon,
  BellIcon,
  ShoppingCartIcon,
  MessageSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  MenuIcon,
  ListIcon,
  ScrollTextIcon,
  BookOpenIcon,
  SlidersIcon,
  SparklesIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ServerIcon,
  PuzzleIcon,
  MousePointerClickIcon,
  FormInputIcon,
  TableIcon,
  MessageSquareWarningIcon,
  LayoutGridIcon,
  NavigationIcon,
  LayoutTemplateIcon,
  CreditCardIcon,
  PanelTopIcon,
  LineChartIcon,
  CalendarIcon,
  MessageCircleIcon,
  BadgeDollarSignIcon,
  MapIcon,
  SmileIcon,
  HashIcon,
  TypeIcon,
  CropIcon,
  QrCodeIcon,
  PlayCircleIcon,
  GripVerticalIcon,
  MousePointer2Icon,
  DropletsIcon,
  GalleryVerticalIcon,
  PartyPopperIcon,
  FileSpreadsheetIcon,
  LayersIcon,
  CheckCircle2Icon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  ShieldOffIcon,
  SearchXIcon,
  ServerCrashIcon,
  CloudIcon,
  SearchIcon,
  WorkflowIcon,
  PanelsTopLeftIcon,
  DatabaseIcon,
  SendIcon,
  BotIcon,
  Settings2Icon,
  ClipboardListIcon,
  ChartNoAxesCombinedIcon,
  PrinterIcon,
  FileCode2Icon,
} from 'lucide-react';
import type { CollapseButtonPosition } from '../types';
import { localizeNavLabel, useLocale } from '../hooks/useLocale';

interface NavChild { label: string; path: string; icon: React.ReactNode; }
interface NavGroup { type: 'group'; icon: React.ReactNode; label: string; children: NavChild[]; }
interface NavLinkItem { type: 'link'; icon: React.ReactNode; label: string; path: string; }
type NavItem = NavGroup | NavLinkItem;

interface SidebarProps {
  collapsed?: boolean;
  doubleColumn?: boolean;
  collapseButtonPosition?: CollapseButtonPosition;
  onToggle?: () => void;
  showToggle?: boolean;
  sidebarWidth?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { type: 'link', icon: <LayoutGridIcon size={16} />, label: '工作台', path: '/' },
  {
    type: 'group', icon: <LayoutDashboardIcon size={16} />, label: '仪表盘',
    children: [
      { label: '分析页', path: '/dashboard/analytics', icon: <LineChartIcon size={13} /> },
      { label: '电子商务', path: '/dashboard/ecommerce', icon: <ShoppingCartIcon size={13} /> },
    ],
  },
  /* CLEAN_DEMO_START: components:navigation */
  {
    type: 'group', icon: <PuzzleIcon size={16} />, label: '组件中心',
    children: [
      { label: '组件总览', path: '/comp/overview', icon: <LayersIcon size={13} /> },
      { label: '按钮组件', path: '/comp/buttons', icon: <MousePointerClickIcon size={13} /> },
      { label: '表单组件', path: '/comp/forms', icon: <FormInputIcon size={13} /> },
      { label: '数据表格', path: '/comp/table', icon: <TableIcon size={13} /> },
      { label: '弹窗反馈', path: '/comp/feedback', icon: <MessageSquareWarningIcon size={13} /> },
      { label: '数据展示', path: '/comp/display', icon: <LayoutGridIcon size={13} /> },
      { label: '导航组件', path: '/comp/nav',         icon: <NavigationIcon size={13} /> },
      { label: '图标库',   path: '/comp/icons',        icon: <SmileIcon size={13} /> },
      { label: '数字滚动', path: '/comp/number-roll',  icon: <HashIcon size={13} /> },
      { label: '富文本编辑器', path: '/comp/rich-editor', icon: <TypeIcon size={13} /> },
      { label: '图像裁剪',  path: '/comp/image-crop',   icon: <CropIcon size={13} /> },
      { label: '二维码',    path: '/comp/qrcode',        icon: <QrCodeIcon size={13} /> },
      { label: '视频播放器', path: '/comp/video-player',  icon: <PlayCircleIcon size={13} /> },
      { label: '拖拽',      path: '/comp/drag',           icon: <GripVerticalIcon size={13} /> },
      { label: '右键菜单',  path: '/comp/context-menu',   icon: <MousePointer2Icon size={13} /> },
      { label: '水印',      path: '/comp/watermark',       icon: <DropletsIcon size={13} /> },
      { label: '文字滚动',  path: '/comp/text-scroll',     icon: <GalleryVerticalIcon size={13} /> },
      { label: '礼花',      path: '/comp/confetti',         icon: <PartyPopperIcon size={13} /> },
      { label: 'Excel 导入导出', path: '/comp/excel',        icon: <FileSpreadsheetIcon size={13} /> },
      { label: '词云图', path: '/comp/word-cloud', icon: <CloudIcon size={13} /> },
    ],
  },
  /* CLEAN_DEMO_END: components:navigation */
  /* CLEAN_DEMO_START: examples:navigation */
  {
    type: 'group', icon: <SparklesIcon size={16} />, label: '功能示例',
    children: [
      { label: '前端权限', path: '/examples/permissions', icon: <ShieldCheckIcon size={13} /> },
      /* CLEAN_DEMO_START: components:example-navigation */
      { label: '标签页', path: '/examples/tabs', icon: <NavigationIcon size={13} /> },
      { label: '高级表格', path: '/examples/advanced-table', icon: <TableIcon size={13} /> },
      { label: '表单', path: '/examples/forms', icon: <FormInputIcon size={13} /> },
      /* CLEAN_DEMO_END: components:example-navigation */
      { label: '基础表格', path: '/examples/basic-table', icon: <TableIcon size={13} /> },
      { label: '搜索表单', path: '/examples/search-form', icon: <SearchIcon size={13} /> },
      { label: '左右布局表格', path: '/examples/split-table', icon: <PanelTopIcon size={13} /> },
      { label: 'Socket 连接', path: '/examples/socket', icon: <ServerIcon size={13} /> },
    ],
  },
  /* CLEAN_DEMO_END: examples:navigation */
  /* CLEAN_DEMO_START: templates:navigation */
  {
    type: 'group', icon: <LayoutTemplateIcon size={16} />, label: '模板中心',
    children: [
      { label: '卡片', path: '/tmpl/cards', icon: <CreditCardIcon size={13} /> },
      { label: '横幅', path: '/tmpl/banners', icon: <PanelTopIcon size={13} /> },
      { label: '图表', path: '/tmpl/charts', icon: <LineChartIcon size={13} /> },
      { label: '日历', path: '/tmpl/calendar', icon: <CalendarIcon size={13} /> },
      { label: '聊天', path: '/tmpl/chat', icon: <MessageCircleIcon size={13} /> },
      { label: '定价', path: '/tmpl/pricing', icon: <BadgeDollarSignIcon size={13} /> },
      { label: '地图', path: '/tmpl/map', icon: <MapIcon size={13} /> },
    ],
  },
  /* CLEAN_DEMO_END: templates:navigation */
  {
    type: 'group', icon: <WorkflowIcon size={16} />, label: '低代码中心',
    children: [
      { label: '接口编排', path: '/lowcode/api', icon: <WorkflowIcon size={13} /> },
      { label: '页面设计器', path: '/lowcode/page', icon: <PanelsTopLeftIcon size={13} /> },
      { label: '表单引擎', path: '/lowcode/form', icon: <ClipboardListIcon size={13} /> },
      { label: '报表引擎', path: '/lowcode/report', icon: <ChartNoAxesCombinedIcon size={13} /> },
      { label: '打印模板', path: '/lowcode/print', icon: <PrinterIcon size={13} /> },
      { label: '代码生成器', path: '/lowcode/generator', icon: <FileCode2Icon size={13} /> },
      { label: '数据源管理', path: '/lowcode/datasource', icon: <DatabaseIcon size={13} /> },
      { label: '发布管理', path: '/lowcode/release', icon: <SendIcon size={13} /> },
    ],
  },
  {
    type: 'group', icon: <BotIcon size={16} />, label: 'AI中心',
    children: [
      { label: 'AI对话', path: '/ai/chat', icon: <MessageCircleIcon size={13} /> },
      { label: 'AI助手', path: '/ai/agent', icon: <BotIcon size={13} /> },
      { label: 'AI客服', path: '/ai/customer-service', icon: <MessageSquareIcon size={13} /> },
      { label: '知识库', path: '/ai/knowledge', icon: <DatabaseIcon size={13} /> },
      { label: '提示词模板', path: '/ai/prompt', icon: <FileTextIcon size={13} /> },
      { label: '模型管理', path: '/ai/model', icon: <Settings2Icon size={13} /> },
      { label: 'AI工作流', path: '/ai/workflow', icon: <WorkflowIcon size={13} /> },
    ],
  },
  {
    type: 'group', icon: <FileTextIcon size={16} />, label: '内容管理',
    children: [
      { label: '文章卡片', path: '/article/list', icon: <LayoutGridIcon size={13} /> },
      { label: '文章发布', path: '/article/publish', icon: <SparklesIcon size={13} /> },
      { label: '文章列表', path: '/content/articles', icon: <FileTextIcon size={13} /> },
      { label: '分类管理', path: '/content/categories', icon: <FolderIcon size={13} /> },
      { label: '标签管理', path: '/content/tags', icon: <TagIcon size={13} /> },
    ],
  },
  {
    type: 'group', icon: <CheckCircle2Icon size={16} />, label: '结果页面',
    children: [
      { label: '成功页', path: '/result/success-page', icon: <CheckCircleIcon size={13} /> },
      { label: '失败页', path: '/result/fail-page', icon: <XCircleIcon size={13} /> },
    ],
  },
  {
    type: 'group', icon: <AlertTriangleIcon size={16} />, label: '异常页面',
    children: [
      { label: '403 无权限', path: '/error/403-page', icon: <ShieldOffIcon size={13} /> },
      { label: '404 不存在', path: '/error/404-page', icon: <SearchXIcon size={13} /> },
      { label: '500 服务异常', path: '/error/500-page', icon: <ServerCrashIcon size={13} /> },
    ],
  },
  {
    type: 'group', icon: <BarChart2Icon size={16} />, label: '数据分析',
    children: [
      { label: '访问统计', path: '/analytics/traffic', icon: <TrendingUpIcon size={13} /> },
      { label: '用户画像', path: '/analytics/portrait', icon: <UsersIcon size={13} /> },
      { label: '转化漏斗', path: '/analytics/funnel', icon: <FunnelIcon size={13} /> },
    ],
  },
  { type: 'link', icon: <ImageIcon size={16} />, label: '媒体库', path: '/media' },
  {
    type: 'group', icon: <SparklesIcon size={16} />, label: '营销工具',
    children: [
      { label: '优惠券', path: '/marketing/coupons', icon: <TicketIcon size={13} /> },
      { label: '活动管理', path: '/marketing/events', icon: <ZapIcon size={13} /> },
      { label: '推送通知', path: '/marketing/push', icon: <BellIcon size={13} /> },
    ],
  },
  { type: 'link', icon: <ShoppingCartIcon size={16} />, label: '订单管理', path: '/orders' },
  { type: 'link', icon: <MessageSquareIcon size={16} />, label: '消息中心', path: '/messages' },
  {
    type: 'group', icon: <SlidersIcon size={16} />, label: '系统管理',
    children: [
      { label: '用户管理', path: '/system/users', icon: <UsersIcon size={13} /> },
      { label: '角色管理', path: '/system/roles', icon: <ShieldCheckIcon size={13} /> },
      { label: '菜单管理', path: '/system/menus', icon: <MenuIcon size={13} /> },
      { label: '日志管理', path: '/system/logs', icon: <ScrollTextIcon size={13} /> },
      { label: '字典管理', path: '/system/dict', icon: <BookOpenIcon size={13} /> },
      { label: '系统配置', path: '/system/config', icon: <ListIcon size={13} /> },
      { label: '服务器管理', path: '/system/servers', icon: <ServerIcon size={13} /> },
      { label: '文件管理', path: '/system/files', icon: <FolderOpenIcon size={13} /> },
    ],
  }
];

/** Resolve sidebar CSS inline styles based on menuStyle + mode */
function resolveSidebarStyles(menuStyle: string, mode: string): React.CSSProperties {
  if (menuStyle === 'light' && mode === 'light') {
    return {
      background: '#FFFFFF',
      '--sidebar-foreground': '#1F2937',
      '--sidebar-border': '#E5E7EB',
      '--sidebar-accent': '#F3F4F6',
      '--sidebar-accent-foreground': '#1F2937',
    } as React.CSSProperties;
  }
  if (menuStyle === 'dark') {
    return {
      background: '#1F2937',
      '--sidebar-foreground': '#F9FAFB',
      '--sidebar-border': 'rgba(255,255,255,0.08)',
      '--sidebar-accent': 'rgba(255,255,255,0.07)',
      '--sidebar-accent-foreground': '#F9FAFB',
    } as React.CSSProperties;
  }
  return {};
}

// ─── Icon-only column (64px) for double layout ────────────────────────────────
function IconColumn({
  sidebarStyles,
  selectedGroup,
  onSelectGroup,
  menuStyle,
}: {
  sidebarStyles: React.CSSProperties;
  selectedGroup: string | null;
  onSelectGroup: (label: string | null) => void;
  menuStyle: string;
}) {
  const location = useLocation();
  const { locale } = useLocale();
  const bgStyle: React.CSSProperties = {
    width: '64px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--sidebar-border)',
    overflow: 'hidden',
    flexShrink: 0,
    background: 'var(--sidebar)',
    ...sidebarStyles,
  };

  const isGroupActive = (item: NavItem) => {
    if (item.type === 'group') {
      return item.children.some(c => location.pathname === c.path);
    }
    return false;
  };

  return (
    <div style={{ ...bgStyle, background: bgStyle.background ?? 'var(--sidebar)' }}>
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sidebar-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--sidebar-primary-foreground)', fontWeight: 800, boxShadow: '0 2px 8px color-mix(in srgb, var(--sidebar-primary) 40%, transparent)' }}>
          A
        </div>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 6px' }}>
        {NAV_ITEMS.map(item => {
          if (item.type === 'link') {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                title={localizeNavLabel(item.label, locale)}
                className={({ isActive }) => 'sidebar-l2-icon ' + (isActive ? 'is-active' : '')}
                style={{ width: '100%', justifyContent: 'center', marginBottom: 4 }}
                onClick={() => onSelectGroup(null)}
              >
                {item.icon}
              </NavLink>
            );
          }
          const hasActive = isGroupActive(item);
          const isSelected = selectedGroup === item.label;
          return (
            <button
              key={item.label}
              title={localizeNavLabel(item.label, locale)}
              onClick={() => onSelectGroup(isSelected ? null : item.label)}
              className={'sidebar-l2-icon ' + (hasActive || isSelected ? 'is-active' : '')}
              style={{ width: '100%', justifyContent: 'center', marginBottom: 4, cursor: 'pointer' }}
            >
              {item.icon}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Sub-menu column (176px) for double layout ────────────────────────────────
function SubMenuColumn({
  selectedGroup,
  sidebarStyles,
  menuStyle,
}: {
  selectedGroup: string | null;
  sidebarStyles: React.CSSProperties;
  menuStyle: string;
}) {
  const location = useLocation();
  const { locale } = useLocale();
  const activeItem = NAV_ITEMS.find(
    item => item.type === 'group' && item.label === selectedGroup,
  ) as NavGroup | undefined;

  const subBg: React.CSSProperties = {
    width: '176px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--sidebar-border)',
    overflow: 'hidden',
    flexShrink: 0,
    transition: 'opacity 0.25s ease, transform 0.25s ease',
    opacity: activeItem ? 1 : 0,
    pointerEvents: activeItem ? 'auto' : 'none',
    transform: activeItem ? 'translateX(0)' : 'translateX(-8px)',
    background: 'var(--sidebar)',
    ...sidebarStyles,
  };

  return (
    <div style={{ ...subBg, background: subBg.background ?? 'var(--sidebar)' }}>
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sidebar-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {activeItem ? localizeNavLabel(activeItem.label, locale) : ''}
        </span>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        {(activeItem?.children ?? []).map(child => {
          const isActive = location.pathname === child.path;
          return (
            <NavLink
              key={child.path}
              to={child.path}
              className={'sidebar-l2 ' + (isActive ? 'is-active' : '')}
              style={{ marginBottom: 2 }}
            >
              <span style={{ flexShrink: 0 }}>{child.icon}</span>
              <span style={{ flex: 1 }}>{localizeNavLabel(child.label, locale)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Logo row with inline collapse button (sidebar-top variant) ───────────────
// The collapse control appears before the brand. In the narrow state it is the
// sole header control, leaving a dependable target for expanding the sidebar.
function LogoRowWithCollapseTop({
  collapsed,
  onToggle,
  showToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
  showToggle: boolean;
}) {
  return (
    <div
      style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0' : '0 14px',
        borderBottom: '1px solid var(--sidebar-border)',
        flexShrink: 0,
        gap: '8px',
        overflow: 'hidden',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
    >
      {/* Collapse toggle — before the logo and title */}
      {showToggle && <button
        onClick={onToggle}
        title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: '1px solid var(--sidebar-border)',
          cursor: 'pointer',
          color: 'var(--sidebar-foreground)',
          opacity: collapsed ? 0.55 : 0.65,
          transition: 'opacity 0.15s, background 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--sidebar-accent)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = collapsed ? '0.55' : '0.65'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        <MenuIcon size={17} />
      </button>}

      {(!collapsed || !showToggle) && (
        <>
          {/* Logo icon */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'var(--sidebar-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 11,
              color: 'var(--sidebar-primary-foreground)',
              fontWeight: 800,
              boxShadow: '0 2px 8px color-mix(in srgb, var(--sidebar-primary) 40%, transparent)',
            }}
          >
            AO
          </div>

          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--sidebar-foreground)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            ao-admin-pro
          </span>
        </>
      )}
    </div>
  );
}

// ─── Collapse toggle button row (sidebar-bottom variant) ──────────────────────
function CollapseBarBottom({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={collapsed ? '展开侧边栏' : '收起侧边栏'}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: 'transparent',
        border: 'none',
        borderTop: '1px solid var(--sidebar-border)',
        cursor: 'pointer',
        color: 'var(--sidebar-foreground)',
        opacity: 0.6,
        transition: 'opacity 0.15s',
        flexShrink: 0,
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      {collapsed ? <ChevronsRightIcon size={14} /> : <ChevronsLeftIcon size={14} />}
      {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>收起侧边栏</span>}
    </button>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({
  collapsed = false,
  doubleColumn = false,
  collapseButtonPosition = 'topbar',
  onToggle = () => {},
  showToggle = true,
  sidebarWidth = 230,
}: SidebarProps) {
  const { themeState } = useTheme();
  const { locale } = useLocale();
  const { menuStyle, mode, sidebarAccordion } = themeState;
  const location = useLocation();

  // Compute which group label contains the current path
  const activeGroupLabel = (() => {
    for (const item of NAV_ITEMS) {
      if (item.type === 'group' && item.children.some(c => c.path === location.pathname)) {
        return item.label;
      }
    }
    return null;
  })();

  // Initialize openGroups: only the group containing the current route is open
  const buildInitialOpen = () => {
    const state: Record<string, boolean> = {};
    for (const item of NAV_ITEMS) {
      if (item.type === 'group') {
        state[item.label] = item.children.some(c => c.path === location.pathname);
      }
    }
    return state;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(buildInitialOpen);
  const [lastPathname, setLastPathname] = useState(location.pathname);

  // Keep the active section open when navigation changes routes. The guard makes
  // this a one-time state adjustment for each new path and preserves manual
  // expand/collapse choices while remaining on the current page.
  if (lastPathname !== location.pathname) {
    setLastPathname(location.pathname);
    if (activeGroupLabel) {
      setOpenGroups(prev => {
        if (prev[activeGroupLabel]) return prev; // already open, no update needed
        return { ...prev, [activeGroupLabel]: true };
      });
    }
  }

  // Toggle a group: clicking the active-path group toggles it; clicking another group
  // opens it and closes all others (mutual exclusion).
  const toggleGroup = (label: string) => {
    setOpenGroups(prev => {
      const isCurrentlyOpen = prev[label] ?? false;
      if (!sidebarAccordion) return { ...prev, [label]: !isCurrentlyOpen };
      const next: Record<string, boolean> = {};
      for (const key of Object.keys(prev)) {
        next[key] = false;
      }
      next[label] = !isCurrentlyOpen;
      return next;
    });
  };

  const [selectedGroup, setSelectedGroup] = useState<string | null>(activeGroupLabel);

  const groupHasActive = (children: NavChild[]) =>
    children.some(c => location.pathname === c.path);

  const sidebarInlineStyles = resolveSidebarStyles(menuStyle, mode);

  // ── Double column layout ─────────────────────────────────────────────────
  if (doubleColumn) {
    return (
      <div
        className="sidebar-root"
        data-cmp="Sidebar"
        style={{ display: 'flex', height: '100%', flexShrink: 0 }}
      >
        <IconColumn
          sidebarStyles={sidebarInlineStyles}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
          menuStyle={menuStyle}
        />
        <SubMenuColumn
          selectedGroup={selectedGroup}
          sidebarStyles={sidebarInlineStyles}
          menuStyle={menuStyle}
        />
      </div>
    );
  }

  // ── Icon-only (mixed / collapsed vertical) ───────────────────────────────
  if (collapsed) {
    return (
      <div className="sidebar-root h-full flex-shrink-0" data-cmp="Sidebar" style={{ display: 'flex' }}>
        <aside
          style={{
            width: '64px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--sidebar-border)',
            transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
            overflow: 'hidden',
            background: 'var(--sidebar)',
            ...sidebarInlineStyles,
          }}
        >
          {/* Logo — sidebar-top shows integrated collapse button in logo row, others show plain icon */}
          {collapseButtonPosition === 'sidebar-top' ? (
            <LogoRowWithCollapseTop collapsed={true} onToggle={onToggle} showToggle={showToggle} />
          ) : (
            <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sidebar-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--sidebar-primary-foreground)', fontWeight: 800, boxShadow: '0 2px 8px color-mix(in srgb, var(--sidebar-primary) 40%, transparent)' }}>
                A
              </div>
            </div>
          )}

          <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 6px' }}>
            {NAV_ITEMS.map(item => {
              if (item.type === 'link') {
                return (
                  <div key={item.path} style={{ marginBottom: 4 }}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      title={localizeNavLabel(item.label, locale)}
                      className={({ isActive }) => 'sidebar-l2-icon ' + (isActive ? 'is-active' : '')}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {item.icon}
                    </NavLink>
                  </div>
                );
              }
              return (
                <div key={item.label} style={{ marginBottom: 4 }}>
                  {item.children.map(child => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      title={localizeNavLabel(child.label, locale)}
                      className={({ isActive }) => 'sidebar-l2-icon ' + (isActive ? 'is-active' : '')}
                      style={{ width: '100%', justifyContent: 'center', marginBottom: 2 }}
                    >
                      {child.icon}
                    </NavLink>
                  ))}
                </div>
              );
            })}
          </nav>

          {/* sidebar-bottom: collapse bar above user footer */}
          {showToggle && collapseButtonPosition === 'sidebar-bottom' && (
            <CollapseBarBottom collapsed={true} onToggle={onToggle} />
          )}
        </aside>
      </div>
    );
  }

  // ── Full vertical sidebar ─────────────────────────────────────────────────
  return (
    <div className="sidebar-root h-full flex-shrink-0" data-cmp="Sidebar" style={{ display: 'flex' }}>
      <aside
        style={{
          width: `${sidebarWidth}px`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--sidebar-border)',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          background: 'var(--sidebar)',
          ...sidebarInlineStyles,
        }}
      >
        {/* Logo area — sidebar-top integrates collapse button in same row */}
        {collapseButtonPosition === 'sidebar-top' ? (
          <LogoRowWithCollapseTop collapsed={false} onToggle={onToggle} showToggle={showToggle} />
        ) : (
          <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 18px', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0, gap: '10px', overflow: 'hidden' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sidebar-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, color: 'var(--sidebar-primary-foreground)', fontWeight: 800, boxShadow: '0 2px 8px color-mix(in srgb, var(--sidebar-primary) 40%, transparent)' }}>
              AO
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--sidebar-foreground)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              ao-admin-pro
            </span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 10px' }}>
          {NAV_ITEMS.map(item => {
            if (item.type === 'link') {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => 'sidebar-l1 ' + (isActive ? 'is-active' : '')}
                  style={{ marginBottom: 2 }}
                >
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{localizeNavLabel(item.label, locale)}</span>
                </NavLink>
              );
            }

            const isOpen = openGroups[item.label] ?? false;
            const hasActive = groupHasActive(item.children);

            return (
              <div key={item.label} style={{ marginBottom: 2 }}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={'sidebar-l1 ' + (hasActive ? 'has-active-child' : '')}
                  style={{ marginBottom: 2 }}
                >
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{localizeNavLabel(item.label, locale)}</span>
                  <span style={{ flexShrink: 0, color: 'var(--sidebar-foreground)', opacity: 0.5 }}>
                    {isOpen ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? `${item.children.length * 42}px` : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.22s ease',
                    paddingLeft: 12,
                  }}
                >
                  {item.children.map(child => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) => 'sidebar-l2 ' + (isActive ? 'is-active' : '')}
                    >
                      <span style={{ flexShrink: 0 }}>{child.icon}</span>
                      <span style={{ flex: 1 }}>{localizeNavLabel(child.label, locale)}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* sidebar-bottom: collapse bar above user info */}
        {showToggle && collapseButtonPosition === 'sidebar-bottom' && (
          <CollapseBarBottom collapsed={false} onToggle={onToggle} />
        )}

        {/* User info footer */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sidebar-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--sidebar-primary-foreground)', flexShrink: 0 }}>
              管
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sidebar-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>超级管理员</div>
              <div style={{ fontSize: 11, color: 'var(--sidebar-foreground)', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>admin@example.com</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
