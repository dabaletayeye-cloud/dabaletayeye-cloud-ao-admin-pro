import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useEdition, moduleMenus } from '../core/EditionProvider';
import { localizeNavLabel, useLocale } from '../hooks/useLocale';
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
  ShieldIcon,
  MessageSquareIcon,
  SettingsIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  MenuIcon,
  ListIcon,
  ScrollTextIcon,
  BookOpenIcon,
  SlidersIcon,
  SparklesIcon,
} from 'lucide-react';

interface NavChild { label: string; path: string; icon: React.ReactNode; }
interface NavGroup { type: 'group'; id: string; icon: React.ReactNode; label: string; children: NavChild[]; }
interface NavLinkItem { type: 'link'; id: string; icon: React.ReactNode; label: string; path: string; }
type NavItem = NavGroup | NavLinkItem;

const NAV_ITEMS: NavItem[] = [
  { type: 'link', id: 'dashboard', icon: <LayoutDashboardIcon size={14} />, label: '工作台', path: '/' },




/* CLEAN_DEMO_START: extras:content-analytics-navigation */
  {
    type: 'group', id: 'content', icon: <FileTextIcon size={14} />, label: '内容管理',
    children: [
      { label: '文章列表', path: '/content/articles', icon: <FileTextIcon size={13} /> },
      { label: '分类管理', path: '/content/categories', icon: <FolderIcon size={13} /> },
      { label: '标签管理', path: '/content/tags', icon: <TagIcon size={13} /> },
    ],
  },
  {
    type: 'group', id: 'analytics', icon: <BarChart2Icon size={14} />, label: '数据分析',
    children: [
      { label: '访问统计', path: '/analytics/traffic', icon: <TrendingUpIcon size={13} /> },
      { label: '用户画像', path: '/analytics/portrait', icon: <UsersIcon size={13} /> },
      { label: '转化漏斗', path: '/analytics/funnel', icon: <FunnelIcon size={13} /> },
    ],
  },
  /* CLEAN_DEMO_END: extras:content-analytics-navigation */
{ type: 'link', id: 'media', icon: <ImageIcon size={14} />, label: '媒体库', path: '/media' },




/* CLEAN_DEMO_START: extras:marketing-users-navigation */
  {
    type: 'group', id: 'marketing', icon: <SparklesIcon size={14} />, label: '营销工具',
    children: [
      { label: '优惠券', path: '/marketing/coupons', icon: <TicketIcon size={13} /> },
      { label: '活动管理', path: '/marketing/events', icon: <ZapIcon size={13} /> },
      { label: '推送通知', path: '/marketing/push', icon: <BellIcon size={13} /> },
    ],
  },
  { type: 'link', id: 'users', icon: <UsersIcon size={14} />, label: '用户管理', path: '/users' },
  /* CLEAN_DEMO_END: extras:marketing-users-navigation */
{ type: 'link', id: 'orders', icon: <ShoppingCartIcon size={14} />, label: '订单管理', path: '/orders' },




/* CLEAN_DEMO_START: extras:permissions-navigation */
  { type: 'link', id: 'permissions', icon: <ShieldIcon size={14} />, label: '权限管理', path: '/permissions' },
  /* CLEAN_DEMO_END: extras:permissions-navigation */
{ type: 'link', id: 'messages', icon: <MessageSquareIcon size={14} />, label: '消息中心', path: '/messages' },
{ type: 'link', id: 'generation-quotas', icon: <SparklesIcon size={14} />, label: '生成配额', path: '/generation-quotas' },




/* CLEAN_DEMO_START: extras:settings-navigation */
  { type: 'link', id: 'settings', icon: <SettingsIcon size={14} />, label: '系统设置', path: '/settings' },
  /* CLEAN_DEMO_END: extras:settings-navigation */
{
    type: 'group', id: 'system', icon: <SlidersIcon size={14} />, label: '系统管理',
    children: [
      { label: '用户管理', path: '/users', icon: <UsersIcon size={13} /> },
      { label: '角色管理', path: '/system/roles', icon: <ShieldCheckIcon size={13} /> },
      { label: '菜单管理', path: '/system/menus', icon: <MenuIcon size={13} /> },
      { label: '日志管理', path: '/system/logs', icon: <ScrollTextIcon size={13} /> },
      { label: '字典管理', path: '/system/dict', icon: <BookOpenIcon size={13} /> },
      { label: '系统配置', path: '/system/config', icon: <ListIcon size={13} /> },
      { label: '文件管理', path: '/system/files', icon: <FolderOpenIcon size={13} /> },
    ],
  },
];

export default function HorizontalNav() {
  const { config, filterMenus } = useEdition();
  const filesAvailable = filterMenus(moduleMenus).some(menu => menu.path === '/system/files');
  const extraUsers = (config.accountTypes ?? []).filter(type => type.store === 'generic').map(type => ({ label: type.label, path: `/system/account-users/${type.id}`, icon: <UsersIcon size={13} /> }));
  const items: NavItem[] = NAV_ITEMS.map(item => item.type === 'group' && item.id === 'system' && (config.sysUserEnabled || extraUsers.length)
    ? { ...item, children: [...(config.sysUserEnabled ? [{ label: '系统用户', path: '/system/sys-users', icon: <ShieldCheckIcon size={13} /> }] : []), ...extraUsers, ...item.children.map(child => child.path === '/users' && config.sysUserEnabled ? { ...child, label: '业务用户' } : child)] }
    : item.type === 'link' && item.path === '/users' && config.sysUserEnabled ? { ...item, label: '业务用户' } : item)
    .map(item => item.type === 'group' ? { ...item, children: item.children.filter(child => child.path !== '/system/files' || filesAvailable) } : item);
  if(config.tenancy?.available){const index=items.findIndex(item=>item.type==='group'&&item.id==='system');items.splice(index<0?items.length:index,0,
    {type:'link',id:'tenant-regions',label:'地区管理',path:'/tenancy/regions',icon:<UsersIcon size={14}/>},
    {type:'link',id:'tenant-merchants',label:'商户管理',path:'/tenancy/merchants',icon:<UsersIcon size={14}/>});}
  const { themeState } = useTheme();
  const { locale } = useLocale();
  const location = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);

  const primaryColor = 'var(--primary)';

  const groupHasActive = (children: NavChild[]) =>
    children.some(c => location.pathname === c.path);

  return (
    <div data-cmp="HorizontalNav" style={{ display: 'flex', alignItems: 'center', gap: '2px', overflowX: 'auto', overflowY: 'visible', height: '100%', position: 'relative', zIndex: 200 }}>
      {items.map(item => {
        if (item.type === 'link') {
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0 10px',
                height: '40px',
                borderRadius: '0',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? primaryColor : 'var(--foreground)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderBottom: isActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                transition: 'all 0.2s',
                flexShrink: 0,
                background: 'transparent',
              }}
            >
              {item.icon}
              <span>{localizeNavLabel(item.label, locale)}</span>
            </NavLink>
          );
        }

        // Group
        const hasActive = groupHasActive(item.children);
        const isOpen = openId === item.id;

        return (
          <div
            key={item.id}
            style={{ position: 'relative', height: '40px', flexShrink: 0 }}
            onMouseEnter={() => setOpenId(item.id)}
            onMouseLeave={() => setOpenId(null)}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0 10px',
                height: '40px',
                fontSize: '12px',
                fontWeight: hasActive ? 700 : 400,
                color: hasActive ? primaryColor : 'var(--foreground)',
                background: 'transparent',
                border: 'none',
                borderBottom: hasActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {item.icon}
              <span>{localizeNavLabel(item.label, locale)}</span>
              <span style={{ fontSize: '9px', marginLeft: '1px', opacity: 0.5 }}>▼</span>
            </button>

            {/* Dropdown */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '0',
                minWidth: '140px',
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 300,
                padding: '4px 0',
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
                transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
              }}
            >
              {item.children.map(child => {
                const childActive = location.pathname === child.path;
                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      color: childActive ? primaryColor : 'var(--foreground)',
                      fontWeight: childActive ? 600 : 400,
                      background: childActive ? 'var(--accent)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => setOpenId(null)}
                  >
                    {child.icon}
                    <span>{localizeNavLabel(child.label, locale)}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
