import { useEffect, useState, type ReactNode } from 'react';
import { toast } from '../lib/localizedToast';
import AdminLayout from '../components/AdminLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { listUsers, listRoles, createUser, updateUser, deleteUser as removeUser } from '../api';
import { useEdition } from '../core/EditionProvider';
import type { User } from '../api';
import { ApiState, useApiResource } from '../hooks/useApiResource';
import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  SearchIcon,
  ShieldAlertIcon,
  Trash2Icon,
  TrendingUpIcon,
  UserCheckIcon,
  UserXIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

const STATUS_STYLE: Record<User['status'], { bg: string; color: string; label: string }> = {
  active: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a', label: '正常' },
  inactive: { bg: 'rgba(234,179,8,0.12)', color: '#b45309', label: '未激活' },
  banned: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626', label: '已封禁' },
};

const STATUS_FILTERS: Array<{ label: string; value: User['status'] | '__all__' }> = [
  { label: '全部', value: '__all__' },
  { label: '正常', value: 'active' },
  { label: '未激活', value: 'inactive' },
  { label: '已封禁', value: 'banned' },
];

type DialogMode = 'create' | 'view' | 'edit' | null;
type UserForm = Pick<User, 'name' | 'email' | 'region' | 'gender' | 'role' | 'status' | 'avatar'> & { roles: string[]; username: string; password: string };

const EMPTY_FORM: UserForm = {
  name: '',
  username: '',
  password: '',
  email: '',
  region: '',
  gender: '男',
  role: '',
  avatar: '',
  status: 'active',
  roles: [],
};

const INPUT_CLASS = 'h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60';

function toUserForm(user: User): UserForm {
  const { name, email, region, gender, role, status, avatar } = user;
  return { name, email, region, gender, role, status, avatar, username: user.username ?? '', password: '', roles: [role] };
}

function getUserRoles(user: User): string[] {
  return user.roles?.length ? user.roles : [user.role];
}

export default function UsersPage() {
  const { config: editionConfig } = useEdition();
  const { themeState } = useTheme();
  const { i18n } = useTranslation();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';
  const isJapanese = (i18n.resolvedLanguage ?? i18n.language) === 'ja-JP';
  const genderLabel = (gender: User['gender']) => {
    if (!isJapanese) return gender;
    return gender === '男' ? '男性' : '女性';
  };

  const usersResource = useApiResource(() => listUsers({ pageSize: 100 }));
  const rolesResource = useApiResource(() => listRoles({pageSize:100}));
  const [busy, setBusy] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => { if (usersResource.data) setUsers(usersResource.data.list); }, [usersResource.data]);
  const [searchText, setSearchText] = useState('');
  const [activeStatus, setActiveStatus] = useState<User['status'] | '__all__'>('__all__');
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  if (usersResource.loading || usersResource.error) return <AdminLayout><ApiState loading={usersResource.loading} error={usersResource.error} /></AdminLayout>;

  const filtered = users.filter((user) => {
    const matchSearch =
      searchText === '' ||
      user.name.includes(searchText) ||
      user.email.includes(searchText) ||
      user.region.includes(searchText);
    const matchStatus = activeStatus === '__all__' || user.status === activeStatus;
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: '总用户数', value: users.length, icon: <UserCheckIcon size={18} />, color: primary },
    { label: '活跃用户', value: users.filter((user) => user.status === 'active').length, icon: <TrendingUpIcon size={18} />, color: '#22c55e' },
    { label: '未激活', value: users.filter((user) => user.status === 'inactive').length, icon: <UserXIcon size={18} />, color: '#f59e0b' },
    { label: '已封禁', value: users.filter((user) => user.status === 'banned').length, icon: <ShieldAlertIcon size={18} />, color: '#ef4444' },
  ];

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedUser(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = () => {
    setSelectedUser(null);
    setForm(EMPTY_FORM);
    setDialogMode('create');
  };

  const openUserDialog = (user: User, mode: Exclude<DialogMode, 'create' | null>) => {
    setSelectedUser(user);
    setForm(toUserForm(user));
    setDialogMode(mode);
  };

  const updateForm = <K extends keyof UserForm>(key: K, value: UserForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleRole = (role: string) => setForm(current => ({...current,role,roles:[role]}));

  const uploadAvatar = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    if(file.size>256*1024){toast.error('头像请使用 256KB 以内的图片');return;}
    const reader = new FileReader();
    reader.onload = () => updateForm('avatar', String(reader.result));
    reader.readAsDataURL(file);
  };

  const saveUser = async () => {
    if(busy)return;
    const name=form.name.trim(), email=form.email.trim();
    if(!name||!email||!form.region.trim()){toast.error('请填写姓名、邮箱和地区');return;}
    if(!form.roles.length){toast.error('请选择角色');return;}
    if(dialogMode==='create'&&(!form.username.trim()||form.password.length<6)){toast.error('请填写登录账号和至少 6 位密码');return;}
    setBusy(true);
    try{
      const payload={name,email,region:form.region.trim(),gender:form.gender,status:form.status,avatar:form.avatar,role:form.roles[0],roles:[form.roles[0]],...(form.password?{password:form.password}:{})};
      if(dialogMode==='create')await createUser({...payload,username:form.username.trim()});
      else if(selectedUser)await updateUser(selectedUser.id,payload);
      closeDialog();await usersResource.reload();toast.success('用户已保存');
    }catch(error){toast.error(error instanceof Error?error.message:'保存失败');}finally{setBusy(false);}
  };
  const toggleUserStatus = async (user:User) => {
    if(busy)return;setBusy(true);
    try{await updateUser(user.id,{status:user.status==='active'?'inactive':'active'});await usersResource.reload();toast.success('用户状态已更新');}
    catch(error){toast.error((error as Error).message);}finally{setBusy(false);}
  };
  const deleteUser = async (user:User) => {
    if(busy||!window.confirm('确认删除用户 '+user.name+'？'))return;setBusy(true);
    try{await removeUser(user.id);await usersResource.reload();toast.success('用户已删除');}
    catch(error){toast.error((error as Error).message);}finally{setBusy(false);}
  };

  const isDialogOpen = dialogMode !== null;
  const isReadOnly = dialogMode === 'view';
  const dialogTitle = dialogMode === 'create' ? '添加用户' : dialogMode === 'edit' ? '编辑用户' : '用户详情';

  return (
    <AdminLayout>
      <div data-cmp="UsersPage" className="min-h-full p-6" style={{ background: 'var(--background)' }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{editionConfig.sysUserEnabled ? '业务用户' : '用户管理'}</h1>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>管理所有注册用户</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: primary }}
          >
            <PlusIcon size={15} />
            添加用户
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border p-4"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</span>
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
            <div
              className="flex max-w-xs flex-1 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
              style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
            >
              <SearchIcon size={14} style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="搜索用户、邮箱或地区"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--foreground)' }}
              />
            </div>
            <div className="flex items-center gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveStatus(filter.value)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: activeStatus === filter.value ? primary : 'var(--muted)',
                    color: activeStatus === filter.value ? '#fff' : 'var(--muted-foreground)',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['用户', '地区', '性别', '角色', '进度', '注册日期', '状态', '操作'].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left text-xs font-semibold"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, index) => {
                  const status = STATUS_STYLE[user.status];
                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-accent"
                      style={{ borderBottom: index < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar avatar={user.avatar} name={user.name} primary={primary} />
                          <div>
                            <div className="font-medium" style={{ color: 'var(--foreground)' }}>{user.name}</div>
                            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--foreground)' }}>{user.region}</td>
                      <td className="px-5 py-3" style={{ color: 'var(--foreground)' }}>{genderLabel(user.gender)}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {getUserRoles(user).map((role) => (
                            <span key={role} className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--muted)', maxWidth: '80px' }}>
                            <div className="h-full rounded-full" style={{ width: `${user.progress}%`, background: primary }} />
                          </div>
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--muted-foreground)' }}>{user.joinDate}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label={`操作 ${user.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-accent"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              <MoreHorizontalIcon size={15} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openUserDialog(user, 'view')}>
                              <EyeIcon size={15} />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openUserDialog(user, 'edit')}>
                              <PencilIcon size={15} />
                              编辑用户
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => toggleUserStatus(user)}>
                              <PowerIcon size={15} />
                              {user.status === 'active' ? '停用用户' : '启用用户'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => deleteUser(user)}>
                              <Trash2Icon size={15} />
                              删除用户
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center" style={{ color: 'var(--muted-foreground)' }}>
                暂无匹配用户
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t px-5 py-3 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            <span>共 {filtered.length} 条记录</span>
            <span>第 1 页</span>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && !busy && closeDialog()}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {isReadOnly ? '查看用户账户信息。' : '填写用户账户信息后保存。'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 sm:col-span-2">
              <UserAvatar avatar={form.avatar} name={form.name} primary={primary} size={52} />
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>用户头像</div>
                {!isReadOnly && (
                  <label className="mt-1.5 inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    上传头像
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadAvatar(event.target.files?.[0])} />
                  </label>
                )}
              </div>
            </div>
            <FormField label="登录账号" required><input className={INPUT_CLASS} value={form.username} disabled={dialogMode!=='create'} onChange={event=>updateForm('username',event.target.value)} /></FormField>
            {!isReadOnly&&<FormField label={dialogMode==='create'?'初始密码':'重置密码（留空不修改）'} required={dialogMode==='create'}><input className={INPUT_CLASS} type="password" autoComplete="new-password" value={form.password} onChange={event=>updateForm('password',event.target.value)}/></FormField>}
            <FormField label="姓名" required>
              <input value={form.name} disabled={isReadOnly} onChange={(event) => updateForm('name', event.target.value)} className={INPUT_CLASS} placeholder="请输入姓名" />
            </FormField>
            <FormField label="邮箱" required>
              <input type="email" value={form.email} disabled={isReadOnly} onChange={(event) => updateForm('email', event.target.value)} className={INPUT_CLASS} placeholder="name@example.com" />
            </FormField>
            <FormField label="地区" required>
              <input value={form.region} disabled={isReadOnly} onChange={(event) => updateForm('region', event.target.value)} className={INPUT_CLASS} placeholder="如：上海" />
            </FormField>
            <FormField label="性别">
              <select value={form.gender} disabled={isReadOnly} onChange={(event) => updateForm('gender', event.target.value as User['gender'])} className={INPUT_CLASS}>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </FormField>
            <FormField label="状态">
              <select value={form.status} disabled={isReadOnly} onChange={(event) => updateForm('status', event.target.value as User['status'])} className={INPUT_CLASS}>
                <option value="active">正常</option>
                <option value="inactive">未激活</option>
                <option value="banned">已封禁</option>
              </select>
            </FormField>
          </div>
          <RoleSelector options={[...new Set([...(rolesResource.data?.list??[]).map(role=>role.name),...users.map(user=>user.role)])]} roles={form.roles} disabled={isReadOnly || busy} onToggle={toggleRole} />
          <DialogFooter>
            <button type="button" onClick={closeDialog} className="rounded-lg border px-4 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              {isReadOnly ? '关闭' : '取消'}
            </button>
            {!isReadOnly && (
              <button type="button" disabled={busy} onClick={() => void saveUser()} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: primary }}>
                保存
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function UserAvatar({
  avatar,
  name,
  primary,
  size = 32,
}: {
  avatar: string;
  name: string;
  primary: string;
  size?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const isImage = /^(https?:\/\/|data:image\/)/.test(avatar);
  const fallback = name.trim().charAt(0) || avatar || '用';

  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold"
      style={{ width: size, height: size, background: primary, color: '#fff' }}
    >
      {isImage && !imageFailed ? (
        <img src={avatar} alt={`${name}的头像`} className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
      ) : fallback}
    </div>
  );
}

function RoleSelector({ options, roles, disabled, onToggle }: { options: string[]; roles: string[]; disabled: boolean; onToggle: (role: string) => void }) {
  return (
    <div className="grid gap-1.5 text-sm sm:col-span-2" style={{ color: 'var(--foreground)' }}>
      <span>角色</span>
      <div className="grid grid-cols-2 gap-2 rounded-lg border p-2 sm:grid-cols-3" style={{ borderColor: 'var(--border)' }}>
        {options.map((role) => (
          <label key={role} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent">
            <input
              type="radio" name="user-role"
              checked={roles.includes(role)}
              disabled={disabled}
              onChange={() => onToggle(role)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <span>{role}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm" style={{ color: 'var(--foreground)' }}>
      <span>{label}{required && <span className="ml-1 text-red-500">*</span>}</span>
      {children}
    </label>
  );
}
