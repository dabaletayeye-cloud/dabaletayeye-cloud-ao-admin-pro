import { useMemo, useState } from 'react';
import { toast } from '../../lib/localizedToast';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { EyeIcon, LockKeyholeIcon, PencilIcon, ShieldCheckIcon, TrashIcon, UsersIcon } from 'lucide-react';

const ROLES = [
  { id: 'admin', name: '超级管理员', description: '可访问全部模块与操作', permissions: ['dashboard', 'content', 'analytics', 'marketing', 'system', 'view', 'edit', 'delete', 'export'] },
  { id: 'editor', name: '内容编辑', description: '可管理内容并查看基础数据', permissions: ['dashboard', 'content', 'view', 'edit'] },
  { id: 'analyst', name: '数据分析师', description: '可查看数据分析和导出报表', permissions: ['dashboard', 'analytics', 'view', 'export'] },
];

const MENUS = [
  { key: 'dashboard', label: '工作台' },
  { key: 'content', label: '内容管理' },
  { key: 'analytics', label: '数据分析' },
  { key: 'marketing', label: '营销工具' },
  { key: 'system', label: '系统管理' },
];

const ACTIONS = [
  { key: 'view', label: '查看', icon: <EyeIcon size={15} /> },
  { key: 'edit', label: '编辑', icon: <PencilIcon size={15} /> },
  { key: 'delete', label: '删除', icon: <TrashIcon size={15} /> },
  { key: 'export', label: '导出', icon: <UsersIcon size={15} /> },
];

export default function FrontendPermissionExamplePage() {
  const { themeState } = useTheme();
  const primary = themeState.themeId === 'manga' ? '#E91E8C' : 'var(--primary)';
  const [roleId, setRoleId] = useState('editor');
  const currentRole = useMemo(() => ROLES.find(role => role.id === roleId) ?? ROLES[0], [roleId]);
  const can = (permission: string) => currentRole.permissions.includes(permission);

  return (
    <AdminLayout>
      <div data-cmp="FrontendPermissionExamplePage" style={{ padding: 24, minHeight: '100%', background: 'var(--background)' }}>
        <div className="mb-6"><h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>前端权限</h1><p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>切换模拟角色，观察菜单、按钮与数据范围的前端权限呈现</p></div>
        <section className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}><ShieldCheckIcon size={16} style={{ color: primary }} />当前模拟角色</div>
          <div className="flex flex-wrap gap-2">{ROLES.map(role => <button key={role.id} type="button" onClick={() => setRoleId(role.id)} className="rounded-lg px-4 py-2 text-sm transition-colors" style={{ background: role.id === currentRole.id ? primary : 'var(--accent)', color: role.id === currentRole.id ? '#fff' : 'var(--accent-foreground)', fontWeight: role.id === currentRole.id ? 700 : 500 }}>{role.name}</button>)}</div>
          <p className="mt-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{currentRole.description}</p>
        </section>
        <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>可访问菜单</h2>
            <div className="mt-4 grid gap-2">{MENUS.map(menu => <div key={menu.key} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: can(menu.key) ? 'var(--accent)' : 'var(--muted)', color: can(menu.key) ? 'var(--accent-foreground)' : 'var(--muted-foreground)' }}><span className="text-sm font-medium">{menu.label}</span>{can(menu.key) ? <span className="text-xs">已授权</span> : <LockKeyholeIcon size={14} />}</div>)}</div>
          </section>
          <section className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>按钮权限演示</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>无权限按钮保持可见但不可操作，便于展示权限边界。</p>
            <div className="mt-5 flex flex-wrap gap-3">{ACTIONS.map(action => <button key={action.key} type="button" disabled={!can(action.key)} onClick={() => toast.success(`${currentRole.name}已执行${action.label}操作`)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40" style={{ background: can(action.key) ? primary : 'var(--muted)', color: can(action.key) ? '#fff' : 'var(--muted-foreground)' }}>{action.icon}{action.label}</button>)}</div>
            <div className="mt-6 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}><div className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>当前授权标识</div><div className="mt-3 flex flex-wrap gap-2">{currentRole.permissions.map(permission => <code key={permission} className="rounded-md px-2 py-1 text-xs" style={{ background: 'var(--card)', color: primary }}>{permission}</code>)}</div></div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
