import { useState } from 'react';
import { toast } from '../lib/localizedToast';
import { useTheme } from '../hooks/useTheme';
import { MOCK_USERS, type User } from '../data/mockData';
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  XIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldOffIcon,
} from 'lucide-react';

const STATUS_CONFIG = {
  active: { label: '活跃', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  inactive: { label: '未激活', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  banned: { label: '已封禁', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

const PAGE_SIZE = 8;

interface ModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

function ViewModal({ open, user, onClose }: ModalProps) {
  if (!user) return null;
  const statusCfg = STATUS_CONFIG[user.status];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ display: open ? 'flex' : 'none', background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl border shadow-custom p-6 w-full max-w-sm mx-4"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>用户详情</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-accent">
            <XIcon size={14} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-3 mb-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {user.avatar}
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>{user.name}</div>
            <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{user.email}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {[
            ['地区', user.region],
            ['性别', user.gender],
            ['角色', user.role],
            ['加入日期', user.joinDate],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-sm py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
              <span style={{ color: 'var(--foreground)' }}>{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm py-1.5">
            <span style={{ color: 'var(--muted-foreground)' }}>状态</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: statusCfg.bg, color: statusCfg.color }}>
              {statusCfg.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AddModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
}

function AddUserModal({ open, onClose, onSave }: AddModalProps) {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const [form, setForm] = useState({
    name: '', email: '', region: '北京', gender: '男' as '男' | '女',
    role: '普通用户', status: 'active' as 'active' | 'inactive' | 'banned',
  });

  const handleSave = () => {
    if (!form.name || !form.email) return;
    onSave(form);
    setForm({ name: '', email: '', region: '北京', gender: '男', role: '普通用户', status: 'active' });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ display: open ? 'flex' : 'none', background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl border shadow-custom p-6 w-full max-w-sm mx-4"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>新增用户</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-accent">
            <XIcon size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { label: '姓名', key: 'name', type: 'text', placeholder: '请输入姓名' },
            { label: '邮箱', key: 'email', type: 'email', placeholder: '请输入邮箱' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key as keyof typeof form] as string}
                onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          ))}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>性别</label>
              <select
                value={form.gender}
                onChange={e => setForm(prev => ({ ...prev, gender: e.target.value as '男' | '女' }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>状态</label>
              <select
                value={form.status}
                onChange={e => setForm(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'banned' }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="active">活跃</option>
                <option value="inactive">未激活</option>
                <option value="banned">已封禁</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>地区</label>
            <input
              type="text"
              placeholder="请输入地区"
              value={form.region}
              onChange={e => setForm(prev => ({ ...prev, region: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-accent"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isManga ? 'manga-glow-btn' : ''}`}
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserOverview() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';

  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('__all__');
  const [page, setPage] = useState(1);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.includes(search) || u.email.includes(search);
    const matchStatus = statusFilter === '__all__' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleAddUser = (data: Partial<User>) => {
    setUsers(prev => [
      ...prev,
      {
        id: Date.now(),
        name: data.name ?? '',
        email: data.email ?? '',
        avatar: (data.name ?? '?')[0],
        region: data.region ?? '',
        gender: data.gender ?? '男',
        role: data.role ?? '普通用户',
        status: data.status ?? 'active',
        joinDate: new Date().toISOString().slice(0, 10),
        progress: 0,
      },
    ]);
  };

  const handleDelete = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div data-cmp="UserOverview">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[160px]"
          style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
        >
          <SearchIcon size={14} style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="搜索用户名 / 邮箱..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon size={14} style={{ color: 'var(--muted-foreground)' }} />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <option value="__all__">全部状态</option>
            <option value="active">活跃</option>
            <option value="inactive">未激活</option>
            <option value="banned">已封禁</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isManga ? 'manga-glow-btn' : ''}`}
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <PlusIcon size={14} />
          新增用户
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--muted)' }}>
              {['用户', '邮箱', '地区', '角色', '状态', '进度', '操作'].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-semibold whitespace-nowrap"
                  style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, idx) => {
              const statusCfg = STATUS_CONFIG[user.status];
              return (
                <tr
                  key={user.id}
                  className="table-row-hover transition-colors"
                  style={{
                    borderBottom: idx < paginatedUsers.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                      >
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-medium whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{user.name}</div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user.joinDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                    {user.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                    {user.region}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                    {user.role}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                      style={{ background: statusCfg.bg, color: statusCfg.color }}
                    >
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ minWidth: 100 }}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${user.progress}%`, background: 'var(--primary)' }}
                        />
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                        {user.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setViewUser(user); setShowViewModal(true); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                        title="查看"
                      >
                        <EyeIcon size={13} style={{ color: 'var(--muted-foreground)' }} />
                      </button>
                      <button
                        onClick={() => toast.info(`已打开 ${user.name} 的编辑操作`)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                        title="编辑"
                      >
                        <EditIcon size={13} style={{ color: 'var(--muted-foreground)' }} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                        title="删除"
                      >
                        <TrashIcon size={13} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
                  暂无用户数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          共 {filtered.length} 条记录
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--border)' }}
          >
            <ChevronLeftIcon size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
              style={{
                background: p === currentPage ? 'var(--primary)' : 'transparent',
                color: p === currentPage ? 'var(--primary-foreground)' : 'var(--foreground)',
                border: p === currentPage ? 'none' : '1px solid var(--border)',
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--border)' }}
          >
            <ChevronRightIcon size={14} />
          </button>
        </div>
      </div>

      {/* Modals */}
      <ViewModal open={showViewModal} user={viewUser} onClose={() => setShowViewModal(false)} />
      <AddUserModal open={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAddUser} />
    </div>
  );
}
