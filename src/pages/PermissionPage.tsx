import { useState } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import {
  ShieldIcon,
  PlusIcon,
  CheckIcon,
  XIcon,
  EditIcon,
  UsersIcon,
  LockIcon,
  UnlockIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

interface Role {
  id: number;
  name: string;
  desc: string;
  userCount: number;
  color: string;
  permissions: string[];
}

interface Permission {
  module: string;
  perms: Array<{ name: string; key: string }>;
}

const ROLES: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    desc: '拥有所有系统权限，可管理所有模块',
    userCount: 2,
    color: '#E91E8C',
    permissions: ['user:read', 'user:write', 'user:delete', 'content:read', 'content:write', 'content:delete', 'order:read', 'order:write', 'system:manage'],
  },
  {
    id: 2,
    name: '内容编辑',
    desc: '负责内容审核与发布管理',
    userCount: 5,
    color: '#6366f1',
    permissions: ['content:read', 'content:write', 'media:read', 'media:write'],
  },
  {
    id: 3,
    name: '运营人员',
    desc: '负责活动、优惠券及推送管理',
    userCount: 3,
    color: '#f59e0b',
    permissions: ['order:read', 'marketing:read', 'marketing:write', 'user:read'],
  },
  {
    id: 4,
    name: '数据分析师',
    desc: '只读访问数据分析模块',
    userCount: 2,
    color: '#22c55e',
    permissions: ['analytics:read', 'user:read'],
  },
  {
    id: 5,
    name: '普通用户',
    desc: '默认注册用户权限',
    userCount: 120,
    color: '#94a3b8',
    permissions: ['content:read'],
  },
];

const PERMISSION_MATRIX: Permission[] = [
  {
    module: '用户管理',
    perms: [
      { name: '查看用户', key: 'user:read' },
      { name: '编辑用户', key: 'user:write' },
      { name: '删除用户', key: 'user:delete' },
    ],
  },
  {
    module: '内容管理',
    perms: [
      { name: '查看内容', key: 'content:read' },
      { name: '编辑内容', key: 'content:write' },
      { name: '删除内容', key: 'content:delete' },
    ],
  },
  {
    module: '订单管理',
    perms: [
      { name: '查看订单', key: 'order:read' },
      { name: '处理订单', key: 'order:write' },
    ],
  },
  {
    module: '营销工具',
    perms: [
      { name: '查看营销', key: 'marketing:read' },
      { name: '编辑营销', key: 'marketing:write' },
    ],
  },
  {
    module: '媒体库',
    perms: [
      { name: '查看媒体', key: 'media:read' },
      { name: '上传媒体', key: 'media:write' },
    ],
  },
  {
    module: '数据分析',
    perms: [
      { name: '查看分析', key: 'analytics:read' },
    ],
  },
  {
    module: '系统管理',
    perms: [
      { name: '系统设置', key: 'system:manage' },
    ],
  },
];

export default function PermissionPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';
  const [selectedRole, setSelectedRole] = useState<Role>(ROLES[0]);

  const handleCreateRole = () => toast.success('已打开新建角色操作');
  const handleEditRole = () => toast.success(`已打开角色“${selectedRole.name}”的编辑操作`);

  return (
    <AdminLayout>
      <div data-cmp="PermissionPage" className="p-6 min-h-full" style={{ background: 'var(--background)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>权限管理</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>管理角色与功能权限分配</p>
          </div>
          <button
            onClick={handleCreateRole}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: primary }}
          >
            <PlusIcon size={15} />
            新建角色
          </button>
        </div>

        <div className="flex gap-5">
          {/* Left: Role list */}
          <div className="w-64 flex-shrink-0 flex flex-col gap-2">
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className="w-full text-left rounded-2xl p-4 border transition-all"
                style={{
                  background: selectedRole.id === role.id ? `${role.color}14` : 'var(--card)',
                  borderColor: selectedRole.id === role.id ? role.color : 'var(--border)',
                  borderWidth: selectedRole.id === role.id ? '1.5px' : '1px',
                }}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${role.color}22`, color: role.color }}
                  >
                    <ShieldIcon size={14} />
                  </div>
                  <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{role.name}</span>
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{role.desc}</p>
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <UsersIcon size={11} />
                  <span>{role.userCount} 名成员</span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Permission matrix */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              {/* Role header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${selectedRole.color}22`, color: selectedRole.color }}
                  >
                    <ShieldIcon size={18} />
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--foreground)' }}>{selectedRole.name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{selectedRole.permissions.length} 项权限 · {selectedRole.userCount} 名成员</div>
                  </div>
                </div>
                <button onClick={handleEditRole} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors hover:bg-accent" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  <EditIcon size={12} />
                  编辑角色
                </button>
              </div>

              {/* Permission table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--muted-foreground)', width: '140px' }}>模块</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>权限名称</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--muted-foreground)', width: '120px' }}>权限标识</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--muted-foreground)', width: '80px' }}>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_MATRIX.map(({ module, perms }) =>
                      perms.map((perm, pi) => {
                        const hasPermission = selectedRole.permissions.includes(perm.key);
                        return (
                          <tr
                            key={perm.key}
                            className="transition-colors hover:bg-accent"
                            style={{ borderBottom: '1px solid var(--border)' }}
                          >
                            {pi === 0 && (
                              <td
                                className="px-6 py-3 text-xs font-semibold"
                                rowSpan={perms.length}
                                style={{
                                  color: 'var(--foreground)',
                                  borderRight: '1px solid var(--border)',
                                  verticalAlign: 'top',
                                  paddingTop: '12px',
                                  background: 'var(--muted)',
                                }}
                              >
                                {module}
                              </td>
                            )}
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground)' }}>{perm.name}</td>
                            <td className="px-4 py-3 text-center">
                              <code className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                                {perm.key}
                              </code>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center">
                                {hasPermission ? (
                                  <span
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}
                                  >
                                    <CheckIcon size={11} />
                                    已授权
                                  </span>
                                ) : (
                                  <span
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                                  >
                                    <XIcon size={11} />
                                    未授权
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer tips */}
              <div
                className="flex items-center gap-4 px-6 py-3 border-t text-xs"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
              >
                <div className="flex items-center gap-1.5">
                  <UnlockIcon size={12} style={{ color: '#16a34a' }} />
                  <span>已授权 {selectedRole.permissions.length} 项</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LockIcon size={12} style={{ color: '#ef4444' }} />
                  <span>未授权 {PERMISSION_MATRIX.flatMap(p => p.perms).length - selectedRole.permissions.length} 项</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
