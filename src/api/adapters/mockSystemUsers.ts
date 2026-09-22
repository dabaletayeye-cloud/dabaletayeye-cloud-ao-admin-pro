import type { ApiAdapter } from './types';
import type { SystemUser, SystemUserInput, User } from '../types';

export interface MockAccountSettings { sysUserEnabled?: boolean; sysuser?: { username: string; password: string }; }
export function createMockSystemUsers(config: MockAccountSettings, template: User) {
  let nextId = 2;
  let currentId = 1;
  let users: SystemUser[] = [{ id: 1, username: config.sysuser?.username ?? 'SysAdmin', name: '系统管理员', email: 'sysadmin@example.com', role: 'super_admin', status: 'active' }];
  const passwords = new Map<number, string>([[1, config.sysuser?.password ?? 'admin123']]);
  const enabled = () => { if (!config.sysUserEnabled) throw new Error('独立系统用户未启用'); };
  const get = (id: number) => { enabled(); const user = users.find(user => user.id === id); if (!user) throw new Error('系统用户不存在'); return user; };
  const validate = (row: SystemUser, password?: string) => {
    if (!row.username.trim() || !row.name.trim()) throw new Error('账号和姓名不能为空');
    if (password !== undefined && password.length < 6) throw new Error('密码至少 6 位');
    if (users.some(user => user.id !== row.id && (user.username.toLowerCase() === row.username.toLowerCase() || row.email && user.email.toLowerCase() === row.email.toLowerCase()))) throw new Error('系统账号或邮箱已存在');
    if (!['active', 'inactive', 'banned'].includes(row.status)) throw new Error('状态无效');
  };
  const protect = (id: number, next?: SystemUser) => {
    const admins = users.filter(user => user.role === 'super_admin' && user.status === 'active');
    if (admins.length === 1 && admins[0].id === id && !(next?.role === 'super_admin' && next.status === 'active')) throw new Error('不能删除、停用或降级最后一个系统管理员');
  };
  const methods: Pick<ApiAdapter, 'listSystemUsers' | 'createSystemUser' | 'updateSystemUser' | 'deleteSystemUser'> = {
    async listSystemUsers(query = {}) {
      enabled(); const rows = users.filter(user => (!query.keyword || `${user.username} ${user.name} ${user.email}`.includes(query.keyword)) && (!query.status || user.status === query.status));
      const page = Math.max(1, query.page ?? 1); const pageSize = Math.max(1, query.pageSize ?? 20);
      return structuredClone({ list: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize });
    },
    async createSystemUser(input) {
      enabled(); if (!input.password) throw new Error('请输入初始密码');
      const row: SystemUser = { id: nextId++, username: input.username ?? '', name: input.name ?? '', email: input.email ?? '', role: input.role ?? 'sys_admin', status: input.status ?? 'active' };
      validate(row, input.password); passwords.set(row.id, input.password); users.push(row); return structuredClone(row);
    },
    async updateSystemUser(id, input: SystemUserInput) {
      const row = { ...get(id), ...Object.fromEntries(Object.entries(input).filter(([key, value]) => key !== 'password' && value !== undefined)), id } as SystemUser;
      validate(row, input.password); protect(id, row);
      if (input.password !== undefined) passwords.set(id, input.password);
      users = users.map(user => user.id === id ? row : user); return structuredClone(row);
    },
    async deleteSystemUser(id) { get(id); protect(id); users = users.filter(user => user.id !== id); passwords.delete(id); },
  };
  const current = (): User & SystemUser => {
    const user = get(currentId);
    if (user.status !== 'active') throw new Error('系统账号已停用');
    return structuredClone({ ...template, ...user, gender: user.gender === '男' || user.gender === '女' ? user.gender : template.gender, roles: [user.role], accountType: 'sysuser' });
  };
  return {
    methods, current,
    login(input: { username: string; password: string }) {
      enabled(); const user = users.find(user => user.username.toLowerCase() === input.username.trim().toLowerCase() && user.status === 'active' && passwords.get(user.id) === input.password);
      if (!user) throw new Error('系统账号或密码不正确'); currentId = user.id; return current();
    },
    async updateProfile(input: Record<string, unknown>) {
      const safe = Object.fromEntries(Object.entries(input).filter(([key]) => ['name', 'email'].includes(key)));
      await methods.updateSystemUser(currentId, safe); return current();
    },
    async changePassword(currentPassword: string, newPassword: string) {
      if (passwords.get(currentId) !== currentPassword) throw new Error('当前密码不正确');
      await methods.updateSystemUser(currentId, { password: newPassword });
    },
  };
}
