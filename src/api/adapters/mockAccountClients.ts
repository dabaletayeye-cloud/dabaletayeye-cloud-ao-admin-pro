import type { DemoClientConfig } from '../../config/accountClients';
import type { ApiListQuery, SystemUserInput, User } from '../types';

type Account = User & { username: string; accountType: string };
export function createMockAccountClients(config: DemoClientConfig, template: User) {
  const groups = new Map<string, Map<number, { account: Account; password: string }>>();
  let identity: { type: string; id: number; client: string } | null = null;
  const typeConfig = (type: string) => {
    const value = config.userTypes[type]; if (!config.enabled || !value?.enabled) throw new Error('用户类型未启用'); return value;
  };
  const table = (type: string) => { typeConfig(type); if (!groups.has(type)) groups.set(type, new Map()); return groups.get(type)!; };
  const get = (type: string, id: number) => { const value = table(type).get(id); if (!value) throw new Error('此用户类型下账号不存在'); return value; };
  // Demo fixtures are stored by type and can intentionally use overlapping numeric ids.
  for (const seed of config.demoAccounts) {
    if (!groups.has(seed.userType)) groups.set(seed.userType, new Map());
    const group = groups.get(seed.userType)!; const id = group.size + 1;
    group.set(id, { password: seed.password, account: { ...template, id, username: seed.username, name: seed.name, email: `${seed.username}@example.com`, role: seed.role ?? seed.userType, roles: seed.role ? [seed.role] : [], status: 'active', accountType: seed.userType } });
  }
  const nextIds = new Map([...groups].map(([type, rows]) => [type, Math.max(0, ...rows.keys()) + 1]));
  function current() {
    if (!identity) throw new Error('请先登录');
    const row = get(identity.type, identity.id).account;
    if (row.status !== 'active') throw new Error('账号已停用');
    return structuredClone({ ...row, clientId: identity.client });
  }
  const manage = () => {
    const user = current();
    if (typeConfig(user.accountType).permissionMode !== 'rbac' || !['super_admin', 'sys_admin'].includes(user.role) || !config.clients[user.clientId].apiPrefixes.includes('/api')) throw new Error('此客户端或账号无用户管理权限');
  };
  const validate = (type: string, row: Account, password?: string) => {
    if (!row.username.trim() || !row.name.trim()) throw new Error('账号和姓名不能为空');
    if (password !== undefined && password.length < 6) throw new Error('密码至少 6 位');
    if ([...table(type).values()].some(value => value.account.id !== row.id && value.account.username.toLowerCase() === row.username.toLowerCase())) throw new Error('此用户类型下账号已存在');
    if (!['active', 'inactive', 'banned'].includes(row.status)) throw new Error('状态无效');
  };
  const protect = (type: string, id: number, next?: Account) => {
    if (typeConfig(type).store !== 'system') return;
    const active = [...table(type).values()].map(row => row.account).filter(row => row.role === 'super_admin' && row.status === 'active');
    if (active.length === 1 && active[0].id === id && !(next?.role === 'super_admin' && next.status === 'active')) throw new Error('不能删除、停用或降级最后一个系统管理员');
  };
  const patch = (type: string, id: number, input: SystemUserInput) => {
    const existing = get(type, id);
    const { password, ...fields } = input;
    const row: Account = { ...existing.account, ...fields, id, accountType: type };
    if (typeConfig(type).permissionMode === 'none') { row.role = type; row.roles = []; } else row.roles = [row.role];
    validate(type, row, password); protect(type, id, row);
    table(type).set(id, { account: row, password: password ?? existing.password }); return structuredClone(row);
  };
  return {
    manage,
    logout() { identity = null; },
    restoreSession(token: string, clientId: string, requestedType?: string) {
      const client = config.clients[clientId];
      if (!config.enabled || !client?.enabled) return false;
      const type = requestedType || client.defaultUserType;
      if (!client.userTypes.includes(type) || !config.userTypes[type]?.enabled) return false;
      const prefix = `mock-${type}-${clientId}-`;
      if (!token.startsWith(prefix) || !/^\d+$/.test(token.slice(prefix.length))) return false;
      const id = Number(token.slice(prefix.length));
      const row = table(type).get(id);
      if (!row || row.account.status !== 'active') return false;
      identity = { type, id, client: clientId }; return true;
    },

    login(input: { username: string; password: string }, clientId: string, requestedType?: string) {
      const client = config.clients[clientId]; if (!client?.enabled) throw new Error('客户端未启用');
      const type = requestedType || client.defaultUserType;
      if (!client.userTypes.includes(type)) throw new Error('此客户端不允许该用户类型登录');
      const row = [...table(type).values()].find(value => value.account.username.toLowerCase() === input.username.trim().toLowerCase() && value.password === input.password && value.account.status === 'active');
      if (!row) throw new Error('账号或密码不正确');
      identity = { type, id: row.account.id, client: clientId }; return current();
    },
    current,
    async list(type: string, query: ApiListQuery = {}) {
      manage(); const rows = [...table(type).values()].map(row => row.account).filter(row => (!query.keyword || `${row.username} ${row.name} ${row.email}`.includes(query.keyword)) && (!query.status || row.status === query.status));
      const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
      return structuredClone({ list: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize });
    },
    async create(type: string, input: SystemUserInput) {
      manage(); if (!input.password) throw new Error('请输入初始密码');
      table(type); const id = nextIds.get(type) ?? 1; nextIds.set(type, id + 1);
      const row: Account = { ...template, ...input, id, username: input.username ?? '', name: input.name ?? '', email: input.email ?? '', role: input.role ?? type, status: input.status ?? 'active', accountType: type };
      delete (row as unknown as Record<string, unknown>).password;
      if (typeConfig(type).permissionMode === 'none') { row.role = type; row.roles = []; } else row.roles = [row.role];
      validate(type, row, input.password); table(type).set(id, { account: row, password: input.password }); return structuredClone(row);
    },
    async update(type: string, id: number, input: SystemUserInput) { manage(); return patch(type, id, input); },
    async remove(type: string, id: number) { manage(); get(type, id); protect(type, id); table(type).delete(id); },
    async updateProfile(input: Record<string, unknown>) {
      const row = current(); const safe = Object.fromEntries(Object.entries(input).filter(([key]) => ['name', 'email', 'phone', 'avatar', 'department', 'position', 'bio', 'region', 'gender'].includes(key)));
      patch(row.accountType, row.id, safe); return current();
    },
    async changePassword(oldPassword: string, password: string) {
      const user = current(); if (get(user.accountType, user.id).password !== oldPassword) throw new Error('当前密码不正确');
      patch(user.accountType, user.id, { password });
    },
  };
}
