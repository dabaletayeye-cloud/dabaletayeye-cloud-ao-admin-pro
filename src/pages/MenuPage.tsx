import ViewportPortal from '../components/ViewportPortal';
import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import { listMenus } from '../api';
import { ApiState, useApiResource } from '../hooks/useApiResource';
import {
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  EditIcon,
  TrashIcon,
  FolderIcon,
  FileTextIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusSquareIcon,
  MousePointerClickIcon,
} from 'lucide-react';

const MANGA_PINK = '#E91E8C';

type MenuType = 'catalog' | 'menu' | 'button' | 'external';

interface MenuItem {
  id: number;
  name: string;
  type: MenuType;
  route: string;
  permission: string;
  icon: string;
  sort: number;
  status: 'enabled' | 'disabled';
  children?: MenuItem[];
}

const createButtonChildren = (parentId: number, scope: string, actions: Array<[string, string]>): MenuItem[] =>
  actions.map(([key, name], index) => ({
    id: parentId * 100 + index + 1,
    name,
    type: 'button',
    route: '',
    permission: `${scope}:${key}`,
    icon: '🔘',
    sort: index + 1,
    status: 'enabled',
  }));

const createMenu = (
  id: number,
  name: string,
  route: string,
  permission: string,
  icon: string,
  sort: number,
  scope: string,
  actions: Array<[string, string]>,
): MenuItem => ({
  id, name, type: 'menu', route, permission, icon, sort, status: 'enabled',
  children: createButtonChildren(id, scope, actions),
});

const MOCK_MENUS: MenuItem[] = [
  createMenu(1, '工作台', '/', 'dashboard:view', '🖥️', 1, 'dashboard', [['refresh', '刷新']]),
  {
    id: 2, name: '系统管理', type: 'catalog', route: '/system', permission: '', icon: '⚙️', sort: 2, status: 'enabled',
    children: [
      createMenu(21, '用户管理', '/users', 'user:list', '👥', 1, 'user', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['status', '启用/禁用'], ['delete', '删除'], ['export', '导出']]),
      createMenu(22, '角色管理', '/system/roles', 'role:list', '🔐', 2, 'role', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['permission', '分配菜单权限'], ['delete', '删除']]),
      createMenu(23, '菜单管理', '/system/menus', 'menu:list', '🗂️', 3, 'menu', [['add', '新增'], ['edit', '编辑'], ['delete', '删除']]),
      createMenu(24, '日志管理', '/system/logs', 'log:list', '📋', 4, 'log', [['search', '搜索'], ['export', '导出'], ['delete', '删除']]),
      createMenu(25, '字典管理', '/system/dict', 'dict:list', '📚', 5, 'dict', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['delete', '删除']]),
      createMenu(26, '系统设置', '/system/config', 'config:view', '🔧', 6, 'config', [['edit', '保存设置']]),
    ],
  },
  {
    id: 3, name: '内容管理', type: 'catalog', route: '/content', permission: '', icon: '📝', sort: 3, status: 'enabled',
    children: [
      createMenu(31, '文章列表', '/content/articles', 'article:list', '📄', 1, 'article', [['search', '搜索'], ['add', '新建'], ['edit', '编辑'], ['publish', '发布'], ['delete', '删除']]),
      createMenu(32, '分类管理', '/content/categories', 'category:list', '📁', 2, 'category', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['delete', '删除']]),
      createMenu(33, '标签管理', '/content/tags', 'tag:list', '🏷️', 3, 'tag', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['delete', '删除']]),
    ],
  },
  {
    id: 4, name: '数据分析', type: 'catalog', route: '/analytics', permission: '', icon: '📊', sort: 4, status: 'enabled',
    children: [
      createMenu(41, '访问统计', '/analytics/traffic', 'analytics:traffic', '📈', 1, 'analytics:traffic', [['export', '导出报表']]),
      createMenu(42, '用户画像', '/analytics/portrait', 'analytics:portrait', '👤', 2, 'analytics:portrait', [['export', '导出报表']]),
      createMenu(43, '转化漏斗', '/analytics/funnel', 'analytics:funnel', '🔽', 3, 'analytics:funnel', [['export', '导出报表']]),
    ],
  },
  {
    id: 5, name: '营销工具', type: 'catalog', route: '/marketing', permission: '', icon: '🎯', sort: 5, status: 'enabled',
    children: [
      createMenu(51, '优惠券', '/marketing/coupons', 'coupon:list', '🎟️', 1, 'coupon', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['delete', '删除']]),
      createMenu(52, '活动管理', '/marketing/events', 'event:list', '🎪', 2, 'event', [['search', '搜索'], ['add', '新建'], ['edit', '编辑'], ['delete', '删除']]),
      createMenu(53, '推送通知', '/marketing/push', 'push:send', '🔔', 3, 'push', [['create', '新建推送'], ['send', '发送'], ['delete', '删除']]),
    ],
  },
  createMenu(6, '媒体库', '/media', 'media:list', '🖼️', 6, 'media', [['upload', '上传'], ['download', '下载'], ['delete', '删除']]),
  createMenu(7, '订单管理', '/orders', 'order:list', '📦', 7, 'order', [['search', '搜索'], ['edit', '处理订单'], ['export', '导出']]),
  createMenu(8, '权限管理', '/permissions', 'perm:list', '🛡️', 8, 'perm', [['search', '搜索'], ['edit', '编辑权限']]),
  createMenu(9, '消息中心', '/messages', 'message:list', '💬', 9, 'message', [['search', '搜索'], ['reply', '回复'], ['delete', '删除']]),
  { id: 10, name: '帮助文档', type: 'external', route: 'https://docs.example.com', permission: '', icon: '📖', sort: 10, status: 'enabled' },
];

const TYPE_LABELS: Record<MenuType, { label: string; color: string; bg: string }> = {
  catalog: { label: '目录', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  menu: { label: '菜单', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  button: { label: '按钮', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  external: { label: '外链', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
};

export default function MenuPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? MANGA_PINK : 'var(--primary)';

  const menusResource = useApiResource(listMenus);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  useEffect(() => { if (menusResource.data) setMenus(menusResource.data); }, [menusResource.data]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set([2, 3, 4, 5]));
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Partial<MenuItem & { parentId?: number }> | null>(null);
  if (menusResource.loading || menusResource.error) return <AdminLayout><ApiState loading={menusResource.loading} error={menusResource.error} /></AdminLayout>;

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const ids = new Set<number>();
    const collect = (items: MenuItem[]) => {
      items.forEach(item => {
        if (item.children?.length) {
          ids.add(item.id);
          collect(item.children);
        }
      });
    };
    collect(menus);
    setExpandedIds(ids);
  };

  const collapseAll = () => setExpandedIds(new Set());

  const deleteItem = (id: number, parentId?: number) => {
    if (parentId) {
      setMenus(prev => prev.map(m => m.id === parentId ? { ...m, children: (m.children ?? []).filter(c => c.id !== id) } : m));
    } else {
      setMenus(prev => prev.filter(m => m.id !== id));
    }
  };

  const openAdd = (parentId?: number, type: MenuType = 'menu') => {
    setEditItem({ type, status: 'enabled', sort: 1, name: '', route: '', permission: '', icon: '', parentId });
    setShowModal(true);
  };

  const openEdit = (item: MenuItem, parentId?: number) => {
    setEditItem({ ...item, parentId });
    setShowModal(true);
  };

  const saveItem = () => {
    if (!editItem) return;
    const item: MenuItem = {
      id: editItem.id ?? Date.now(),
      name: editItem.name ?? '',
      type: editItem.type ?? 'menu',
      route: editItem.route ?? '',
      permission: editItem.permission ?? '',
      icon: editItem.icon ?? '',
      sort: editItem.sort ?? 1,
      status: editItem.status ?? 'enabled',
    };
    if (editItem.parentId) {
      setMenus(prev => prev.map(m => {
        if (m.id !== editItem.parentId) return m;
        const children = m.children ?? [];
        if (editItem.id) {
          return {
            ...m,
            children: children.map(c => c.id === item.id ? { ...item, children: c.children } : c),
          };
        }
        return { ...m, children: [...children, item] };
      }));
    } else if (editItem.id) {
      setMenus(prev => prev.map(m => m.id === item.id ? { ...item, children: m.children } : m));
    } else {
      setMenus(prev => [...prev, item]);
    }
    setShowModal(false);
    setEditItem(null);
  };

  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))',
  };

  const inputStyle = {
    border: '1px solid var(--border)',
    background: 'var(--input)',
    color: 'var(--foreground)',
    borderRadius: '8px',
    padding: '8px 12px',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  const renderRow = (item: MenuItem, depth: number = 0, parentId?: number) => {
    const isExpanded = expandedIds.has(item.id);
    const hasChildren = (item.children?.length ?? 0) > 0;
    const typeInfo = TYPE_LABELS[item.type];
    const typeIcon = item.type === 'catalog'
      ? <FolderIcon size={13} />
      : item.type === 'external'
        ? <LinkIcon size={13} />
        : item.type === 'button'
          ? <MousePointerClickIcon size={13} />
          : <FileTextIcon size={13} />;

    return (
      <div key={item.id}>
        <div
          style={{
            display: 'flex', alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            paddingLeft: `${depth * 24 + 16}px`,
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {/* Expand toggle */}
          <div style={{ width: '24px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(item.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '4px' }}
              >
                {isExpanded ? <ChevronDownIcon size={13} /> : <ChevronRightIcon size={13} />}
              </button>
            ) : <span style={{ width: '21px' }} />}
          </div>

          {/* Name */}
          <div style={{ flex: '0 0 200px', padding: '12px 8px 12px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{item.icon}</span>
            <span style={{ fontSize: '13px', fontWeight: depth === 0 ? 600 : 400, color: 'var(--foreground)' }}>{item.name}</span>
          </div>

          {/* Type */}
          <div style={{ flex: '0 0 80px', padding: '12px 8px' }}>
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit"
              style={{ background: typeInfo.bg, color: typeInfo.color }}
            >
              {typeIcon}{typeInfo.label}
            </span>
          </div>

          {/* Route */}
          <div style={{ flex: '1', padding: '12px 8px', fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
            {item.route || '—'}
          </div>

          {/* Permission */}
          <div style={{ flex: '0 0 160px', padding: '12px 8px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
            {item.permission ? (
              <code style={{ background: 'var(--muted)', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>{item.permission}</code>
            ) : '—'}
          </div>

          {/* Status */}
          <div style={{ flex: '0 0 80px', padding: '12px 8px' }}>
            {item.status === 'enabled' ? (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#22C55E' }}><CheckCircleIcon size={12} />启用</span>
            ) : (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}><XCircleIcon size={12} />禁用</span>
            )}
          </div>

          {/* Actions */}
          <div style={{ flex: '0 0 160px', padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {(item.type === 'catalog' || item.type === 'menu') && (
              <button
                onClick={() => openAdd(item.id, item.type === 'menu' ? 'button' : 'menu')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors"
                style={{ color: primary, background: isManga ? 'rgba(233,30,140,0.08)' : 'var(--accent)' }}
                title={item.type === 'catalog' ? '添加子菜单' : '添加按钮权限'}
              >
                <PlusSquareIcon size={11} />{item.type === 'catalog' ? '添加子菜单' : '添加按钮'}
              </button>
            )}
            <button
              onClick={() => openEdit(item, parentId)}
              className="p-1.5 rounded-lg transition-colors hover:bg-accent"
              style={{ color: 'var(--muted-foreground)' }}
              title="编辑"
            >
              <EditIcon size={13} />
            </button>
            <button
              onClick={() => deleteItem(item.id, parentId)}
              className="p-1.5 rounded-lg transition-colors hover:bg-accent"
              style={{ color: '#EF4444' }}
              title="删除"
            >
              <TrashIcon size={13} />
            </button>
          </div>
        </div>

        {/* Children */}
        <div
          style={{
            maxHeight: isExpanded ? '10000px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.22s cubic-bezier(.4,0,.2,1)',
          }}
        >
          {(item.children ?? []).map(child => renderRow(child, depth + 1, item.id))}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div data-cmp="MenuPage" style={{ padding: '24px', minHeight: '100%', background: 'var(--background)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>菜单管理</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>管理系统菜单结构和路由配置</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
            >
              全部展开
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
            >
              全部收起
            </button>
            <button
              onClick={() => openAdd()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: primary }}
            >
              <PlusIcon size={15} />添加菜单
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          {/* Table header */}
          <div
            style={{
              display: 'flex', alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              background: 'var(--muted)',
              borderRadius: '12px 12px 0 0',
              paddingLeft: '40px',
            }}
          >
            {[
              { label: '菜单名称', flex: '0 0 200px' },
              { label: '类型', flex: '0 0 80px' },
              { label: '路由', flex: '1' },
              { label: '权限标识', flex: '0 0 160px' },
              { label: '状态', flex: '0 0 80px' },
              { label: '操作', flex: '0 0 160px' },
            ].map(h => (
              <div key={h.label} style={{ flex: h.flex, padding: '10px 8px', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                {h.label}
              </div>
            ))}
          </div>

          {menus.map(item => renderRow(item))}
        </div>

        {/* Modal */}
        <ViewportPortal><div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: showModal ? 1 : 0,
            pointerEvents: showModal ? 'all' : 'none',
            transition: 'opacity 0.2s ease',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setEditItem(null); } }}
        >
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '16px',
              padding: '28px',
              width: '520px',
              maxWidth: '90vw',
              border: '1px solid var(--border)',
              transform: showModal ? 'scale(1)' : 'scale(0.95)',
              transition: 'transform 0.2s ease',
            }}
          >
            <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--foreground)' }}>
              {editItem?.id ? '编辑菜单' : '添加菜单'}
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div style={{ flex: 1 }}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>菜单名称 *</label>
                  <input value={editItem?.name ?? ''} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))} placeholder="请输入菜单名称" style={inputStyle} />
                </div>
                <div style={{ flex: '0 0 80px' }}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>图标</label>
                  <input value={editItem?.icon ?? ''} onChange={e => setEditItem(p => ({ ...p, icon: e.target.value }))} placeholder="🔧" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>菜单类型 *</label>
                <div className="flex gap-4">
                  {(['catalog', 'menu', 'button', 'external'] as MenuType[]).map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="menu-type" value={t} checked={editItem?.type === t} onChange={() => setEditItem(p => ({ ...p, type: t }))} style={{ accentColor: primary }} />
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>{TYPE_LABELS[t].label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>路由地址</label>
                <input value={editItem?.route ?? ''} onChange={e => setEditItem(p => ({ ...p, route: e.target.value }))} placeholder="/path 或 https://..." style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>权限标识</label>
                <input value={editItem?.permission ?? ''} onChange={e => setEditItem(p => ({ ...p, permission: e.target.value }))} placeholder="module:action" style={inputStyle} />
              </div>
              <div className="flex gap-3">
                <div style={{ flex: 1 }}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>排序</label>
                  <input type="number" value={editItem?.sort ?? 1} onChange={e => setEditItem(p => ({ ...p, sort: Number(e.target.value) }))} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>状态</label>
                  <select value={editItem?.status ?? 'enabled'} onChange={e => setEditItem(p => ({ ...p, status: e.target.value as 'enabled' | 'disabled' }))} style={inputStyle}>
                    <option value="enabled">启用</option>
                    <option value="disabled">禁用</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditItem(null); }} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>取消</button>
              <button onClick={saveItem} className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: primary }}>保存</button>
            </div>
          </div>
        </div></ViewportPortal>
      </div>
    </AdminLayout>
  );
}
