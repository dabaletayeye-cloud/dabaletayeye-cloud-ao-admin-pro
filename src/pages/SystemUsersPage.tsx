import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import PageHeader from '../components/PageHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { sysuserApi } from '../api/sysuser';
import { accountUsersApi } from '../api/accounts';
import { listRoles } from '../api/role';
import type { SystemUser, SystemUserInput, Role } from '../api/types';
import { useEdition } from '../core/EditionProvider';
import { toast } from '../lib/localizedToast';

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground';
const buttonClass = 'rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50';
export default function SystemUsersPage({ accountType = 'sysuser' }: { accountType?: string }) {
  const { config, loading } = useEdition();
  const typeInfo = config.accountTypes?.find(type => type.id === accountType);
  const enabled = accountType === 'sysuser' ? config.sysUserEnabled : typeInfo?.store === 'generic';
  const withRoles = accountType === 'sysuser' || typeInfo?.permissionMode === 'rbac';
  const title = typeInfo?.label ?? (accountType === 'sysuser' ? '系统用户' : accountType);
  const service = useMemo(() => accountType === 'sysuser' ? sysuserApi : accountUsersApi(accountType), [accountType]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<SystemUser | 'new' | null>(null);
  const [form, setForm] = useState<SystemUserInput>({});
  const load = useCallback(async () => {
    if (!enabled) return;
    setError('');
    try { const [data, available] = await Promise.all([service.list({ page, pageSize: 20, keyword }), withRoles ? listRoles({ pageSize: 100 }) : Promise.resolve({ list: [] })]); setUsers(data.list); setTotal(data.total); setRoles(available.list); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '加载失败'); }
  }, [enabled, page, keyword, service, withRoles]);
  useEffect(() => { void load(); }, [load]);
  const open = (user: SystemUser | 'new') => {
    setEditing(user);
    setForm(user === 'new' ? { username: '', name: '', email: '', role: withRoles ? 'sys_admin' : accountType, status: 'active', password: '' } : { ...user, password: '' });
  };
  const save = async () => {
    if (!form.username?.trim() || !form.name?.trim() || editing === 'new' && !form.password) return toast.error('请填写账号、姓名和初始密码');
    setBusy(true);
    try {
      const { username, name, email, role, status, password } = form;
      const input = { username, name, email, role, status, ...(password ? { password } : {}) };
      if (editing === 'new') await service.create(input); else if (editing) await service.update(editing.id, input);
      setEditing(null); await load(); toast.success(`${title}已保存`);
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : '保存失败'); }
    finally { setBusy(false); }
  };
  const remove = async (user: SystemUser) => {
    if (!window.confirm(`确认删除${title}账号 ${user.username}？其他类型用户不受影响。`)) return;
    try { await service.remove(user.id); await load(); toast.success(`${title}已删除`); }
    catch (reason) { toast.error(reason instanceof Error ? reason.message : '删除失败'); }
  };
  return <AdminLayout><PageHeader title={title} description="按用户类型隔离的账号管理，登录客户端由服务端配置决定。" actions={enabled && <button className={buttonClass} onClick={() => open('new')}>新增{title}</button>} />
    {loading ? <p>加载中…</p> : !enabled ? <p>该用户类型未启用，请检查账号 JSON 配置或独立系统用户开关。</p> : <>
      <div className="mb-4 flex gap-3"><input className={inputClass} aria-label="搜索系统用户" placeholder="搜索账号、姓名或邮箱" value={keyword} onChange={event => { setKeyword(event.target.value); setPage(1); }} /><button className={buttonClass} onClick={() => void load()}>刷新</button></div>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <div className="overflow-auto rounded-xl border border-border bg-card"><table className="w-full text-left text-sm"><thead><tr>{['账号', '姓名', '邮箱', '角色', '状态', '操作'].map(label => <th key={label} className="border-b border-border p-3">{label}</th>)}</tr></thead><tbody>{users.filter(user => `${user.username} ${user.name} ${user.email}`.toLowerCase().includes(keyword.toLowerCase())).map(user => <tr key={user.id}>
        <td className="p-3">{user.username}<span className="ml-2 text-xs text-muted-foreground">ID: {user.id}</span></td><td className="p-3">{user.name}</td><td className="p-3">{user.email || '-'}</td><td className="p-3">{withRoles ? roles.find(role => role.code === user.role)?.name ?? user.role : title}</td><td className="p-3">{{ active: '正常', inactive: '停用', banned: '封禁' }[user.status]}</td>
        <td className="p-3"><button className="mr-3 text-primary" onClick={() => open(user)}>编辑</button><button className="text-destructive" onClick={() => void remove(user)}>删除</button></td>
      </tr>)}</tbody></table>{!users.length && !error && <p className="p-6 text-center text-muted-foreground">暂无系统用户</p>}</div>
      <div className="mt-4 flex items-center justify-end gap-3"><span>共 {total} 条 · 第 {page} 页</span><button className={buttonClass} disabled={page <= 1} onClick={() => setPage(value => value - 1)}>上一页</button><button className={buttonClass} disabled={page * 20 >= total} onClick={() => setPage(value => value + 1)}>下一页</button></div>
    </>}
    <Dialog open={editing !== null} onOpenChange={open => { if (!open && !busy) setEditing(null); }}><DialogContent aria-describedby={undefined}><DialogHeader><DialogTitle>{editing === 'new' ? `新增${title}` : `编辑${title}`}</DialogTitle></DialogHeader>
      {(['username', 'name', 'email', 'password'] as const).map(key => <label key={key} className="grid gap-2 text-sm">{{ username: '登录账号', name: '姓名', email: '邮箱', password: editing === 'new' ? '初始密码' : '重置密码（留空不修改）' }[key]}<input className={inputClass} type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'} value={form[key] ?? ''} autoComplete={key === 'password' ? 'new-password' : 'off'} onChange={event => setForm(previous => ({ ...previous, [key]: event.target.value }))} /></label>)}
      {withRoles && <label className="grid gap-2 text-sm">角色<select className={inputClass} value={form.role ?? ''} onChange={event => setForm(previous => ({ ...previous, role: event.target.value }))}>{roles.filter(role => role.status === 'enabled').map(role => <option key={role.id} value={role.code}>{role.name}</option>)}</select></label>}
      <label className="grid gap-2 text-sm">状态<select className={inputClass} value={form.status ?? 'active'} onChange={event => setForm(previous => ({ ...previous, status: event.target.value as SystemUser['status'] }))}><option value="active">正常</option><option value="inactive">停用</option><option value="banned">封禁</option></select></label>
      <DialogFooter><button disabled={busy} className={buttonClass} onClick={() => void save()}>{busy ? '保存中…' : '保存'}</button></DialogFooter>
    </DialogContent></Dialog>
  </AdminLayout>;
}
