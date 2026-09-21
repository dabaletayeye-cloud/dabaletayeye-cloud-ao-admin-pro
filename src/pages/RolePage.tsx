import ViewportPortal from '../components/ViewportPortal';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import { listRoles } from '../api';
import { ApiState, useApiResource } from '../hooks/useApiResource';
import { toast } from '../lib/localizedToast';
import { modulePermissionGroups } from '../generated/registry';
import { useEdition } from '../core/EditionProvider';
import { filterPermissionGroups } from '../core/edition';
import {
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  CopyIcon,
  ListChecksIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from 'lucide-react';

const MANGA_PINK = '#E91E8C';

interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  userCount: number;
  status: 'enabled' | 'disabled';
  createdAt: string;
  permissions: string[];
}

interface ButtonPermission {
  key: string;
  label: string;
}

interface MenuPermissionItem {
  key: string;
  label: string;
  actions?: ButtonPermission[];
}

interface MenuPermissionGroup {
  label: string;
  items: MenuPermissionItem[];
}

const actionsFor = (scope: string, actions: Array<[string, string]>): ButtonPermission[] =>
  actions.map(([key, label]) => ({ key: `${scope}:${key}`, label }));

const CORE_MENU_PERMISSION_GROUPS: MenuPermissionGroup[] = [
  {
    label: '工作台',
    items: [{ key: 'dashboard:view', label: '工作台', actions: actionsFor('dashboard', [['refresh', '刷新']]) }],
  },
  {
    label: '系统管理',
    items: [
      { key: 'user:list', label: '用户管理', actions: actionsFor('user', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['status', '启用/禁用'], ['delete', '删除'], ['export', '导出']]) },
      { key: 'role:list', label: '角色管理', actions: actionsFor('role', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['permission', '分配菜单权限'], ['delete', '删除']]) },
      { key: 'menu:list', label: '菜单管理', actions: actionsFor('menu', [['add', '新增'], ['edit', '编辑'], ['delete', '删除']]) },
      { key: 'log:list', label: '日志管理', actions: actionsFor('log', [['search', '搜索'], ['export', '导出'], ['delete', '删除']]) },
      { key: 'dict:list', label: '字典管理', actions: actionsFor('dict', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['delete', '删除']]) },
      { key: 'config:view', label: '系统设置', actions: actionsFor('config', [['edit', '保存设置']]) },
    ],
  },
  {
    label: '内容管理',
    items: [
      { key: 'article:list', label: '文章列表', actions: actionsFor('article', [['search', '搜索'], ['add', '新建'], ['edit', '编辑'], ['publish', '发布'], ['delete', '删除']]) },
      { key: 'category:list', label: '分类管理', actions: actionsFor('category', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['delete', '删除']]) },
      { key: 'tag:list', label: '标签管理', actions: actionsFor('tag', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['delete', '删除']]) },
    ],
  },
  {
    label: '数据分析',
    items: [
      { key: 'analytics:traffic', label: '访问统计', actions: actionsFor('analytics:traffic', [['export', '导出报表']]) },
      { key: 'analytics:portrait', label: '用户画像', actions: actionsFor('analytics:portrait', [['export', '导出报表']]) },
      { key: 'analytics:funnel', label: '转化漏斗', actions: actionsFor('analytics:funnel', [['export', '导出报表']]) },
    ],
  },
  {
    label: '营销工具',
    items: [
      { key: 'coupon:list', label: '优惠券', actions: actionsFor('coupon', [['search', '搜索'], ['add', '新增'], ['edit', '编辑'], ['delete', '删除']]) },
      { key: 'event:list', label: '活动管理', actions: actionsFor('event', [['search', '搜索'], ['add', '新建'], ['edit', '编辑'], ['delete', '删除']]) },
      { key: 'push:send', label: '推送通知', actions: actionsFor('push', [['create', '新建推送'], ['send', '发送'], ['delete', '删除']]) },
    ],
  },
  {
    label: '业务中心',
    items: [
      { key: 'media:list', label: '媒体库', actions: actionsFor('media', [['upload', '上传'], ['download', '下载'], ['delete', '删除']]) },
      { key: 'order:list', label: '订单管理', actions: actionsFor('order', [['search', '搜索'], ['edit', '处理订单'], ['export', '导出']]) },
      { key: 'message:list', label: '消息中心', actions: actionsFor('message', [['search', '搜索'], ['reply', '回复'], ['delete', '删除']]) },
      { key: 'perm:list', label: '权限管理', actions: actionsFor('perm', [['search', '搜索'], ['edit', '编辑权限']]) },
    ],
  },
];

const OPTIONAL_PERMISSION_PREFIXES = ['article:', 'category:', 'tag:', 'analytics:', 'coupon:', 'event:', 'push:', 'media:', 'order:', 'message:', 'perm:', 'lowcode:', 'ai:', 'components:', 'templates:', 'examples:', 'commerce:', 'generation:', 'server:', 'file:'];
const isOptionalPermission = (key: string) => OPTIONAL_PERMISSION_PREFIXES.some((prefix) => key.startsWith(prefix));
const MENU_PERMISSION_GROUPS: MenuPermissionGroup[] = [
  ...CORE_MENU_PERMISSION_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item, actions: item.actions?.filter((action) => !isOptionalPermission(action.key)) }))
      .filter((item) => !isOptionalPermission(item.key) || (item.actions?.length ?? 0) > 0),
  })).filter((group) => group.items.length > 0),
  ...modulePermissionGroups.map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({ key: item.key, label: item.label, actions: item.actions })),
  })),
];

const getMenuPermissionKeys = (item: MenuPermissionItem) => [item.key, ...(item.actions?.map(action => action.key) ?? [])];
const getGroupPermissionKeys = (group: MenuPermissionGroup) => group.items.flatMap(getMenuPermissionKeys);
const ALL_MENU_PERMISSION_KEYS = MENU_PERMISSION_GROUPS.flatMap(getGroupPermissionKeys);
const buildVisiblePermissionGroups = (config: Parameters<typeof filterPermissionGroups>[1]) => {
  const visible = new Map(filterPermissionGroups(modulePermissionGroups, config).map(group => [group.label, new Set(group.items.map(item => item.key))]));
  const moduleLabels = new Set(modulePermissionGroups.map(group => group.label));
  return MENU_PERMISSION_GROUPS.filter(group => !moduleLabels.has(group.label) || visible.has(group.label))
    .map(group => moduleLabels.has(group.label)
      ? { ...group, items: group.items.filter(item => visible.get(group.label)?.has(item.key)) } : group);
};
let ACTIVE_MENU_PERMISSION_GROUPS = MENU_PERMISSION_GROUPS;

const permissionsFor = (...keys: string[]) => keys;

const MOCK_ROLES: Role[] = [
  { id: 1, name: '超级管理员', code: 'super_admin', description: '拥有系统所有权限，不受任何限制', userCount: 2, status: 'enabled', createdAt: '2024-01-01', permissions: ALL_MENU_PERMISSION_KEYS },
  { id: 2, name: '系统管理员', code: 'sys_admin', description: '管理系统配置、用户和权限', userCount: 5, status: 'enabled', createdAt: '2024-01-10', permissions: permissionsFor('dashboard:view', 'user:list', 'role:list', 'menu:list', 'log:list', 'dict:list', 'config:view', 'perm:list') },
  { id: 3, name: '内容编辑', code: 'content_editor', description: '负责内容的创建、编辑和发布', userCount: 18, status: 'enabled', createdAt: '2024-01-15', permissions: permissionsFor('dashboard:view', 'article:list', 'category:list', 'tag:list', 'media:list') },
  { id: 4, name: '数据分析师', code: 'data_analyst', description: '可查看所有数据报表和分析', userCount: 7, status: 'enabled', createdAt: '2024-02-01', permissions: permissionsFor('dashboard:view', 'analytics:traffic', 'analytics:portrait', 'analytics:funnel') },
  { id: 5, name: '运营专员', code: 'operator', description: '负责营销活动、优惠券等运营工作', userCount: 12, status: 'enabled', createdAt: '2024-02-10', permissions: permissionsFor('dashboard:view', 'coupon:list', 'event:list', 'push:send', 'message:list') },
  { id: 6, name: '客服人员', code: 'customer_service', description: '处理用户反馈和消息', userCount: 9, status: 'enabled', createdAt: '2024-03-01', permissions: permissionsFor('dashboard:view', 'user:list', 'message:list') },
  { id: 7, name: '财务人员', code: 'finance', description: '查看订单和财务数据', userCount: 3, status: 'enabled', createdAt: '2024-03-15', permissions: permissionsFor('dashboard:view', 'order:list') },
  { id: 8, name: '访客', code: 'guest', description: '只读权限，无法进行任何修改', userCount: 0, status: 'disabled', createdAt: '2024-04-01', permissions: permissionsFor('dashboard:view') },
];

export default function RolePage() {
  const { themeState } = useTheme();
  const { config } = useEdition();
  ACTIVE_MENU_PERMISSION_GROUPS = useMemo(() => buildVisiblePermissionGroups(config), [config]);
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? MANGA_PINK : 'var(--primary)';

  const rolesResource = useApiResource(() => listRoles({ pageSize: 100 }));
  const [roles, setRoles] = useState<Role[]>([]);
  useEffect(() => { if (rolesResource.data) setRoles(rolesResource.data.list as Role[]); }, [rolesResource.data]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('__all__');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState<Partial<Role> | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionRole, setPermissionRole] = useState<Role | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);
  const [expandedPermissionGroups, setExpandedPermissionGroups] = useState<Set<string>>(
    () => new Set(ACTIVE_MENU_PERMISSION_GROUPS.map(group => group.label)),
  );
  const [expandedPermissionMenus, setExpandedPermissionMenus] = useState<Set<string>>(() => new Set());
  if (rolesResource.loading || rolesResource.error) return <AdminLayout><ApiState loading={rolesResource.loading} error={rolesResource.error} /></AdminLayout>;

  const filtered = roles.filter(r => {
    const matchText = r.name.includes(searchText) || r.code.includes(searchText);
    const matchStatus = statusFilter === '__all__' || r.status === statusFilter;
    return matchText && matchStatus;
  });

  const toggleStatus = (id: number) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'enabled' ? 'disabled' : 'enabled' } : r));
    setOpenDropdown(null);
  };

  const deleteRole = (id: number) => {
    setRoles(prev => prev.filter(r => r.id !== id));
    setOpenDropdown(null);
  };

  const openEdit = (role: Role) => {
    setEditRole({ ...role });
    setShowModal(true);
    setOpenDropdown(null);
  };

  const openAdd = () => {
    setEditRole({ name: '', code: '', description: '', status: 'enabled', permissions: [] });
    setShowModal(true);
  };

  const openPermissionModal = (role: Role) => {
    setPermissionRole(role);
    setDraftPermissions([...role.permissions]);
    setShowPermissionModal(true);
    setOpenDropdown(null);
  };

  const closePermissionModal = () => {
    setShowPermissionModal(false);
    setPermissionRole(null);
    setDraftPermissions([]);
  };

  const togglePermission = (permissionKey: string) => {
    setDraftPermissions(prev => prev.includes(permissionKey)
      ? prev.filter(key => key !== permissionKey)
      : [...prev, permissionKey]);
  };

  const togglePermissionGroup = (group: MenuPermissionGroup) => {
    const keys = getGroupPermissionKeys(group);
    const hasAll = keys.every(key => draftPermissions.includes(key));
    setDraftPermissions(prev => hasAll
      ? prev.filter(key => !keys.includes(key))
      : [...new Set([...prev, ...keys])]);
  };

  const togglePermissionMenu = (item: MenuPermissionItem) => {
    const keys = getMenuPermissionKeys(item);
    const hasAll = keys.every(key => draftPermissions.includes(key));
    setDraftPermissions(prev => hasAll
      ? prev.filter(key => !keys.includes(key))
      : [...new Set([...prev, ...keys])]);
  };

  const togglePermissionGroupExpanded = (label: string) => {
    setExpandedPermissionGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const togglePermissionMenuExpanded = (key: string) => {
    setExpandedPermissionMenus(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const savePermissions = () => {
    if (!permissionRole) return;
    setRoles(prev => prev.map(role => role.id === permissionRole.id ? { ...role, permissions: draftPermissions } : role));
    toast.success(`已更新“${permissionRole.name}”的菜单权限`);
    closePermissionModal();
  };

  const saveRole = () => {
    if (!editRole) return;
    if (editRole.id) {
      setRoles(prev => prev.map(r => r.id === editRole.id ? { ...r, ...editRole } as Role : r));
    } else {
      setRoles(prev => [...prev, {
        id: Date.now(),
        name: editRole.name ?? '',
        code: editRole.code ?? '',
        description: editRole.description ?? '',
        userCount: 0,
        status: editRole.status ?? 'enabled',
        createdAt: new Date().toISOString().slice(0, 10),
        permissions: editRole.permissions ?? [],
      }]);
    }
    setShowModal(false);
    setEditRole(null);
  };

  const inputStyle = {
    border: '1px solid var(--border)',
    background: 'var(--input)',
    color: 'var(--foreground)',
    borderRadius: '8px',
    padding: '8px 12px',
    outline: 'none',
    fontSize: '13px',
  };

  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))',
  };

  return (
    <AdminLayout>
      <div data-cmp="RolePage" style={{ padding: '24px', minHeight: '100%', background: 'var(--background)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>角色管理</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>管理系统角色和权限配置</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: primary }}
          >
            <PlusIcon size={15} />
            新增角色
          </button>
        </div>

        {/* Filters */}
        <div style={{ ...cardStyle, padding: '16px', marginBottom: '16px' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1" style={{ minWidth: '200px', maxWidth: '320px' }}>
              <SearchIcon size={15} style={{ color: 'var(--muted-foreground)' }} />
              <input
                placeholder="搜索角色名称/编码…"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ ...inputStyle, flex: 1, background: 'transparent', border: 'none', padding: '4px 0' }}
              />
            </div>
            <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, paddingRight: '28px', cursor: 'pointer' }}
            >
              <option value="__all__">全部状态</option>
              <option value="enabled">启用</option>
              <option value="disabled">禁用</option>
            </select>
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>共 {filtered.length} 个角色</span>
          </div>
        </div>

        {/* Table */}
        <div style={cardStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['角色ID', '角色名称', '角色编码', '描述', '用户数', '菜单权限', '状态', '创建时间', '操作'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((role, idx) => (
                <tr
                  key={role.id}
                  style={{
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--muted-foreground)' }}>#{role.id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: isManga ? 'rgba(233,30,140,0.12)' : 'var(--accent)', color: primary }}
                      >
                        <ShieldCheckIcon size={13} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{role.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <code style={{ fontSize: '12px', background: 'var(--muted)', padding: '2px 8px', borderRadius: '6px', color: 'var(--muted-foreground)' }}>
                      {role.code}
                    </code>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--muted-foreground)', maxWidth: '200px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role.description}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--foreground)', textAlign: 'center' }}>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                    >
                      {role.userCount} 人
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      type="button"
                      onClick={() => openPermissionModal(role)}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors hover:bg-accent"
                      style={{ color: primary }}
                      title="分配菜单权限"
                    >
                      <ListChecksIcon size={13} />
                      <span>{role.permissions.length} 项</span>
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {role.status === 'enabled' ? (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#22C55E' }}>
                        <CheckCircleIcon size={12} /> 启用
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#9CA3AF' }}>
                        <XCircleIcon size={12} /> 禁用
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--muted-foreground)' }}>{role.createdAt}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-1" style={{ position: 'relative' }}>
                      <button
                        onClick={() => openEdit(role)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-accent"
                        style={{ color: 'var(--muted-foreground)' }}
                        title="编辑"
                      >
                        <EditIcon size={13} />
                      </button>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === role.id ? null : role.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-accent"
                        style={{ color: 'var(--muted-foreground)' }}
                        title="更多操作"
                      >
                        <MoreHorizontalIcon size={13} />
                      </button>
                      {/* Dropdown */}
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '100%',
                          zIndex: 50,
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          minWidth: '140px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          maxHeight: openDropdown === role.id ? '200px' : '0px',
                          overflow: 'hidden',
                          opacity: openDropdown === role.id ? 1 : 0,
                          transition: 'max-height 0.18s ease, opacity 0.15s ease',
                        }}
                      >
                        <button
                          onClick={() => { const r = roles.find(x => x.id === role.id); if (r) { setRoles(prev => [...prev, { ...r, id: Date.now(), name: r.name + ' (副本)', code: r.code + '_copy' }]); setOpenDropdown(null); } }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                          style={{ color: 'var(--foreground)' }}
                        >
                          <CopyIcon size={13} /> 复制角色
                        </button>
                        <button
                          onClick={() => openPermissionModal(role)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                          style={{ color: 'var(--foreground)' }}
                        >
                          <ListChecksIcon size={13} /> 分配菜单权限
                        </button>
                        <button
                          onClick={() => toggleStatus(role.id)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                          style={{ color: role.status === 'enabled' ? '#F59E0B' : '#22C55E' }}
                        >
                          {role.status === 'enabled' ? <XCircleIcon size={13} /> : <CheckCircleIcon size={13} />}
                          {role.status === 'enabled' ? '禁用' : '启用'}
                        </button>
                        <div style={{ borderTop: '1px solid var(--border)', margin: '2px 0' }} />
                        <button
                          onClick={() => deleteRole(role.id)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                          style={{ color: '#EF4444' }}
                        >
                          <TrashIcon size={13} /> 删除角色
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--muted-foreground)' }}>
              <ShieldCheckIcon size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p className="text-sm">暂无角色数据</p>
            </div>
          )}
        </div>

        {/* Add/Edit Modal — always in DOM, visibility by opacity/pointer-events */}
        <ViewportPortal><div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: showModal ? 1 : 0,
            pointerEvents: showModal ? 'all' : 'none',
            transition: 'opacity 0.2s ease',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setEditRole(null); } }}
        >
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '16px',
              padding: '28px',
              width: '520px',
              maxWidth: '90vw',
              height: '100%',
              maxHeight: '100%',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              transform: showModal ? 'scale(1)' : 'scale(0.95)',
              transition: 'transform 0.2s ease',
            }}
          >
            <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--foreground)' }}>
              {editRole?.id ? '编辑角色' : '新增角色'}
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>角色名称 *</label>
                <input
                  value={editRole?.name ?? ''}
                  onChange={e => setEditRole(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入角色名称"
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>角色编码 *</label>
                <input
                  value={editRole?.code ?? ''}
                  onChange={e => setEditRole(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="如: content_editor"
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>描述</label>
                <textarea
                  value={editRole?.description ?? ''}
                  onChange={e => setEditRole(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请输入角色描述"
                  rows={3}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', resize: 'none' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>状态</label>
                <div className="flex items-center gap-4">
                  {(['enabled', 'disabled'] as const).map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role-status"
                        value={s}
                        checked={editRole?.status === s}
                        onChange={() => setEditRole(prev => ({ ...prev, status: s }))}
                        style={{ accentColor: primary }}
                      />
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>{s === 'enabled' ? '启用' : '禁用'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-auto">
              <button
                onClick={() => { setShowModal(false); setEditRole(null); }}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                取消
              </button>
              <button
                onClick={saveRole}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: primary }}
              >
                保存
              </button>
            </div>
          </div>
        </div></ViewportPortal>

        {/* Menu permission modal */}
        <ViewportPortal><div
          style={{
            position: 'fixed', inset: 0, zIndex: 110,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: showPermissionModal ? 1 : 0,
            pointerEvents: showPermissionModal ? 'all' : 'none',
            transition: 'opacity 0.2s ease',
          }}
          onClick={e => { if (e.target === e.currentTarget) closePermissionModal(); }}
        >
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '16px',
              padding: '28px',
              width: '680px',
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: '86vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              transform: showPermissionModal ? 'scale(1)' : 'scale(0.95)',
              transition: 'transform 0.2s ease',
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>分配菜单权限</h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  为“{permissionRole?.name ?? ''}”选择可访问的菜单
                </p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                已选 {draftPermissions.length} / {ALL_MENU_PERMISSION_KEYS.length}
              </span>
            </div>

            <label className="mb-4 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <input
                type="checkbox"
                checked={draftPermissions.length === ALL_MENU_PERMISSION_KEYS.length}
                ref={input => { if (input) input.indeterminate = draftPermissions.length > 0 && draftPermissions.length < ALL_MENU_PERMISSION_KEYS.length; }}
                onChange={e => setDraftPermissions(e.target.checked ? [...ALL_MENU_PERMISSION_KEYS] : [])}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              全选菜单
            </label>

            <div role="tree" className="rounded-xl border p-2" style={{ borderColor: 'var(--border)' }}>
              {ACTIVE_MENU_PERMISSION_GROUPS.map(group => {
                const groupKeys = getGroupPermissionKeys(group);
                const selectedCount = groupKeys.filter(key => draftPermissions.includes(key)).length;
                const isExpanded = expandedPermissionGroups.has(group.label);
                return (
                  <section key={group.label} role="treeitem" aria-expanded={isExpanded}>
                    <div className="flex min-h-10 items-center gap-1 rounded-lg px-1.5 hover:bg-accent">
                      <button
                        type="button"
                        onClick={() => togglePermissionGroupExpanded(group.label)}
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors hover:bg-background"
                        style={{ color: 'var(--muted-foreground)' }}
                        title={isExpanded ? `折叠${group.label}` : `展开${group.label}`}
                        aria-label={isExpanded ? `折叠${group.label}` : `展开${group.label}`}
                      >
                        {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
                      </button>
                      <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        <input
                          type="checkbox"
                          checked={selectedCount === groupKeys.length}
                          ref={input => { if (input) input.indeterminate = selectedCount > 0 && selectedCount < groupKeys.length; }}
                          onChange={() => togglePermissionGroup(group)}
                          className="h-4 w-4 accent-[var(--primary)]"
                        />
                        <span>{group.label}</span>
                      </label>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{selectedCount}/{groupKeys.length}</span>
                    </div>
                    {isExpanded && (
                    <div role="group" className="ml-5 border-l pb-1 pl-3" style={{ borderColor: 'var(--border)' }}>
                      {group.items.map(item => {
                        const menuKeys = getMenuPermissionKeys(item);
                        const menuSelectedCount = menuKeys.filter(key => draftPermissions.includes(key)).length;
                        const isMenuExpanded = expandedPermissionMenus.has(item.key);
                        return (
                          <div key={item.key} role="treeitem" aria-expanded={isMenuExpanded}>
                            <div className="flex min-h-9 items-center gap-1 rounded-md px-1 hover:bg-accent">
                              <button
                                type="button"
                                onClick={() => togglePermissionMenuExpanded(item.key)}
                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-colors hover:bg-background"
                                style={{ color: 'var(--muted-foreground)' }}
                                title={isMenuExpanded ? `折叠${item.label}操作权限` : `展开${item.label}操作权限`}
                                aria-label={isMenuExpanded ? `折叠${item.label}操作权限` : `展开${item.label}操作权限`}
                              >
                                {isMenuExpanded ? <ChevronDownIcon size={15} /> : <ChevronRightIcon size={15} />}
                              </button>
                              <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
                                <input
                                  type="checkbox"
                                  checked={menuSelectedCount === menuKeys.length}
                                  ref={input => { if (input) input.indeterminate = menuSelectedCount > 0 && menuSelectedCount < menuKeys.length; }}
                                  onChange={() => togglePermissionMenu(item)}
                                  className="h-4 w-4 accent-[var(--primary)]"
                                />
                                <span>{item.label}</span>
                              </label>
                              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{menuSelectedCount}/{menuKeys.length}</span>
                            </div>
                            {isMenuExpanded && (
                              <div role="group" className="ml-5 border-l pb-1 pl-3" style={{ borderColor: 'var(--border)' }}>
                                {item.actions?.map(action => (
                                  <label key={action.key} role="treeitem" className="flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-xs transition-colors hover:bg-accent" style={{ color: 'var(--foreground)' }}>
                                    <input
                                      type="checkbox"
                                      checked={draftPermissions.includes(action.key)}
                                      onChange={() => togglePermission(action.key)}
                                      className="h-3.5 w-3.5 accent-[var(--primary)]"
                                    />
                                    <span>{action.label}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    )}
                  </section>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closePermissionModal}
                className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={savePermissions}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: primary }}
              >
                保存权限
              </button>
            </div>
          </div>
        </div></ViewportPortal>

        {/* Overlay for dropdowns */}
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            pointerEvents: openDropdown !== null ? 'all' : 'none',
            opacity: 0,
          }}
          onClick={() => setOpenDropdown(null)}
        />
      </div>
    </AdminLayout>
  );
}
