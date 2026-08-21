import { MOCK_ACTIVITIES, MOCK_NEW_USERS, MOCK_TODOS, MONTHLY_DATA, MOCK_USERS, STAT_CARDS, YEARLY_TREND, type User } from '../../data/mockData';
import { MOCK_ARTICLES, MOCK_CATEGORIES_FLAT, MOCK_TAGS } from '../../data/contentData';
import { MOCK_EVENTS } from '../../data/calendarData';
import { CHINA_DATA, WORLD_DATA } from '../../data/mapData';
import type { ApiAdapter } from './types';
import type { Article, Category, DictItem, DictType, ExceptionLog, LoginLog, MenuItem, OperationLog, Role, Tag } from '../types';

const wait = (ms = 300) => new Promise<void>(resolve => setTimeout(resolve, ms));
const clone = <T>(value: T): T => (typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)) as T);

let users = clone(MOCK_USERS);
let articles = clone(MOCK_ARTICLES);
let categories = clone(MOCK_CATEGORIES_FLAT);
let tags = clone(MOCK_TAGS);

const roleActions = (scope: string, actions: Array<[string, string]>) => actions.map(([key, label]) => ({ key: `${scope}:${key}`, label }));
const permissionKeys = ['dashboard:view', 'user:list', 'role:list', 'menu:list', 'log:list', 'dict:list', 'config:view', 'article:list', 'category:list', 'tag:list', 'analytics:traffic', 'analytics:portrait', 'analytics:funnel', 'coupon:list', 'event:list', 'push:send', 'media:list', 'order:list', 'message:list', 'perm:list'];
let roles: Role[] = [
  { id: 1, name: '瓒呯骇绠＄悊鍛?', code: 'super_admin', description: '鎷ユ湁绯荤粺鎵€鏈夋潈闄愶紝涓嶅彈浠讳綍闄愬埗', userCount: 2, status: 'enabled', createdAt: '2024-01-01', permissions: permissionKeys },
  { id: 2, name: '绯荤粺绠＄悊鍛?', code: 'sys_admin', description: '绠＄悊绯荤粺閰嶇疆銆佺敤鎴峰拰鏉冮檺', userCount: 5, status: 'enabled', createdAt: '2024-01-10', permissions: ['dashboard:view', 'user:list', 'role:list', 'menu:list', 'log:list', 'dict:list', 'config:view', 'perm:list'] },
  { id: 3, name: '鍐呭缂栬緫', code: 'content_editor', description: '璐熻矗鍐呭鐨勫垱寤恒€佺紪杈戝拰鍙戝竷', userCount: 18, status: 'enabled', createdAt: '2024-01-15', permissions: ['dashboard:view', 'article:list', 'category:list', 'tag:list', 'media:list'] },
  { id: 4, name: '鏁版嵁鍒嗘瀽甯?', code: 'data_analyst', description: '鍙煡鐪嬫墍鏈夋暟鎹姤琛ㄥ拰鍒嗘瀽', userCount: 7, status: 'enabled', createdAt: '2024-02-01', permissions: ['dashboard:view', 'analytics:traffic', 'analytics:portrait', 'analytics:funnel'] },
  { id: 5, name: '杩愯惀涓撳憳', code: 'operator', description: '璐熻矗钀ラ攢娲诲姩銆佷紭鎯犲埜绛夎繍钀ュ伐浣?', userCount: 12, status: 'enabled', createdAt: '2024-02-10', permissions: ['dashboard:view', 'coupon:list', 'event:list', 'push:send', 'message:list'] },
  { id: 6, name: '瀹㈡湇浜哄憳', code: 'customer_service', description: '澶勭悊鐢ㄦ埛鍙嶉鍜屾秷鎭?', userCount: 9, status: 'enabled', createdAt: '2024-03-01', permissions: ['dashboard:view', 'user:list', 'message:list'] },
  { id: 7, name: '璐㈠姟浜哄憳', code: 'finance', description: '鏌ョ湅璁㈠崟鍜岃储鍔℃暟鎹?', userCount: 3, status: 'enabled', createdAt: '2024-03-15', permissions: ['dashboard:view', 'order:list'] },
  { id: 8, name: '璁垮', code: 'guest', description: '鍙鏉冮檺，無法进行任何修改', userCount: 0, status: 'disabled', createdAt: '2024-04-01', permissions: ['dashboard:view'] },
];

const buttonChildren = (parentId: number, scope: string, actions: Array<[string, string]>): MenuItem[] => actions.map(([key, name], index) => ({ id: parentId * 100 + index + 1, name, type: 'button', route: '', permission: `${scope}:${key}`, icon: '馃敇', sort: index + 1, status: 'enabled' }));
const menu = (id: number, name: string, route: string, permission: string, icon: string, sort: number, scope: string, actions: Array<[string, string]>): MenuItem => ({ id, name, type: 'menu', route, permission, icon, sort, status: 'enabled', children: buttonChildren(id, scope, actions) });
let menus: MenuItem[] = [
  menu(1, '宸ヤ綔鍙?', '/', 'dashboard:view', '馃枼锔?', 1, 'dashboard', [['refresh', '鍒锋柊']]),
  { id: 2, name: '绯荤粺绠＄悊', type: 'catalog', route: '/system', permission: '', icon: '鈿欙笍', sort: 2, status: 'enabled', children: [menu(21, '鐢ㄦ埛绠＄悊', '/users', 'user:list', '馃懃', 1, 'user', [['search', '鎼滅储'], ['add', '鏂板'], ['edit', '缂栬緫'], ['status', '鍚敤/绂佺敤'], ['delete', '鍒犻櫎'], ['export', '瀵煎嚭']]), menu(22, '瑙掕壊绠＄悊', '/system/roles', 'role:list', '馃攼', 2, 'role', [['search', '鎼滅储'], ['add', '鏂板'], ['edit', '缂栬緫'], ['permission', '鍒嗛厤鑿滃崟鏉冮檺'], ['delete', '鍒犻櫎']]), menu(23, '鑿滃崟绠＄悊', '/system/menus', 'menu:list', '馃梻锔?', 3, 'menu', [['add', '鏂板'], ['edit', '缂栬緫'], ['delete', '鍒犻櫎']]), menu(24, '鏃ュ織绠＄悊', '/system/logs', 'log:list', '馃搵', 4, 'log', [['search', '鎼滅储'], ['export', '瀵煎嚭'], ['delete', '鍒犻櫎']]), menu(25, '瀛楀吀绠＄悊', '/system/dict', 'dict:list', '馃摎', 5, 'dict', [['search', '鎼滅储'], ['add', '鏂板'], ['edit', '缂栬緫'], ['delete', '鍒犻櫎']]), menu(26, '绯荤粺璁剧疆', '/system/config', 'config:view', '馃敡', 6, 'config', [['edit', '淇濆瓨璁剧疆']])] },
  { id: 3, name: '鍐呭绠＄悊', type: 'catalog', route: '/content', permission: '', icon: '馃摑', sort: 3, status: 'enabled', children: [menu(31, '鏂囩珷鍒楄〃', '/content/articles', 'article:list', '馃搫', 1, 'article', [['search', '鎼滅储'], ['add', '鏂板缓'], ['edit', '缂栬緫'], ['publish', '鍙戝竷'], ['delete', '鍒犻櫎']]), menu(32, '鍒嗙被绠＄悊', '/content/categories', 'category:list', '馃搧', 2, 'category', [['add', '鏂板'], ['edit', '缂栬緫'], ['delete', '鍒犻櫎']]), menu(33, '鏍囩绠＄悊', '/content/tags', 'tag:list', '馃彿锔?', 3, 'tag', [['search', '鎼滅储'], ['add', '鏂板'], ['edit', '缂栬緫'], ['delete', '鍒犻櫎']])] },
  menu(6, '濯掍綋搴?', '/media', 'media:list', '馃柤锔?', 6, 'media', [['upload', '涓婁紶'], ['download', '涓嬭浇'], ['delete', '鍒犻櫎']]),
  menu(7, '璁㈠崟绠＄悊', '/orders', 'order:list', '馃摝', 7, 'order', [['search', '鎼滅储'], ['edit', '澶勭悊璁㈠崟'], ['export', '瀵煎嚭']]),
  menu(9, '娑堟伅涓績', '/messages', 'message:list', '馃挰', 9, 'message', [['search', '鎼滅储'], ['reply', '鍥炲'], ['delete', '鍒犻櫎']]),
];

const loginLogs: LoginLog[] = [
  { id: 1, username: 'admin', ip: '192.168.1.1', location: '涓婃捣甯?', browser: 'Chrome 121', os: 'Windows 11', status: 'success', msg: '鐧诲綍鎴愬姛', time: '2024-05-20 09:23:11' },
  { id: 2, username: 'lin@example.com', ip: '114.22.33.44', location: '鍖椾含甯?', browser: 'Safari 17', os: 'macOS Sonoma', status: 'success', msg: '鐧诲綍鎴愬姛', time: '2024-05-20 08:55:02' },
  { id: 3, username: 'test_user', ip: '10.0.0.5', location: '鍐呯綉', browser: 'Firefox 124', os: 'Ubuntu', status: 'fail', msg: '瀵嗙爜閿欒', time: '2024-05-20 08:40:17' },
];
const operationLogs: OperationLog[] = [
  { id: 1, username: 'admin', module: '鐢ㄦ埛绠＄悊', type: '鏂板', method: 'POST', requestUri: '/api/users', ip: '192.168.1.1', status: 'success', costTime: 123, time: '2024-05-20 09:30:01' },
  { id: 2, username: 'lin@example.com', module: '鏂囩珷绠＄悊', type: '鍙戝竷', method: 'PUT', requestUri: '/api/articles/42', ip: '114.22.33.44', status: 'success', costTime: 87, time: '2024-05-20 09:15:22' },
];
const exceptionLogs: ExceptionLog[] = [
  { id: 1, username: 'admin', requestUri: '/api/config/site', errorMsg: 'Connection refused: database unavailable', exceptionClass: 'java.sql.SQLException', ip: '192.168.1.1', time: '2024-05-19 15:05:33' },
  { id: 2, username: 'system', requestUri: '/api/scheduler/run', errorMsg: 'Task execution timeout after 30000ms', exceptionClass: 'java.util.concurrent.TimeoutException', ip: '127.0.0.1', time: '2024-05-18 03:00:01' },
];
const dictTypes: DictType[] = [{ id: 1, name: '鐢ㄦ埛鐘舵€?', code: 'user_status', remark: '鐢ㄦ埛璐﹀彿鐨勫惎鐢ㄧ鐢ㄧ姸鎬?', status: 'enabled' }, { id: 2, name: '鎬у埆', code: 'gender', remark: '鐢ㄦ埛鎬у埆瀛楀吀', status: 'enabled' }];
const dictItems: DictItem[] = [{ id: 1, typeId: 1, label: '姝ｅ父', value: 'active', sort: 1, status: 'enabled', remark: '' }, { id: 2, typeId: 1, label: '绂佺敤', value: 'inactive', sort: 2, status: 'enabled', remark: '' }, { id: 3, typeId: 1, label: '灏佺', value: 'banned', sort: 3, status: 'enabled', remark: '' }, { id: 4, typeId: 2, label: '鐢?', value: 'male', sort: 1, status: 'enabled', remark: '' }, { id: 5, typeId: 2, label: '濂?', value: 'female', sort: 2, status: 'enabled', remark: '' }];

const page = <T,>(items: T[], query: { page?: number; pageSize?: number; keyword?: string; status?: string } = {}): { list: T[]; total: number; page: number; pageSize: number } => {
  const current = query.page ?? 1;
  const size = query.pageSize ?? items.length;
  const start = (current - 1) * size;
  return { list: clone(items.slice(start, start + size)), total: items.length, page: current, pageSize: size };
};

export const mockAdapter: ApiAdapter = {
  async login() { await wait(); return { token: 'mock-token', user: clone(users[0]) }; },
  async logout() { await wait(); },
  async getCurrentUser() { await wait(); return clone(users[0] ?? null); },
  async listUsers(query = {}) { await wait(); const filtered = users.filter(item => (!query.keyword || `${item.name}${item.email}${item.region}`.includes(query.keyword)) && (!query.status || item.status === query.status)); return page(filtered, query); },
  async createUser(input) { await wait(); const user = { id: Date.now(), name: input.name ?? '', email: input.email ?? '', avatar: input.avatar ?? (input.name ?? '?')[0], region: input.region ?? '', gender: input.gender ?? '鐢?', role: input.role ?? '鐢ㄦ埛', roles: input.roles, status: input.status ?? 'active', joinDate: input.joinDate ?? new Date().toISOString().slice(0, 10), progress: input.progress ?? 0 } as User; users = [...users, user]; return clone(user); },
  async updateUser(id, input) { await wait(); const index = users.findIndex(item => item.id === id); if (index < 0) throw new Error('User not found'); users[index] = { ...users[index], ...input, id }; return clone(users[index]); },
  async deleteUser(id) { await wait(); users = users.filter(item => item.id !== id); },
  async listRoles(query = {}) { await wait(); return page(roles.filter(item => !query.keyword || `${item.name}${item.code}`.includes(query.keyword)), query); },
  async createRole(input) { await wait(); const role = { id: Date.now(), name: input.name ?? '', code: input.code ?? '', description: input.description ?? '', userCount: input.userCount ?? 0, status: input.status ?? 'enabled', createdAt: input.createdAt ?? new Date().toISOString().slice(0, 10), permissions: input.permissions ?? [] } as Role; roles = [...roles, role]; return clone(role); },
  async updateRole(id, input) { await wait(); const index = roles.findIndex(item => item.id === id); if (index < 0) throw new Error('Role not found'); roles[index] = { ...roles[index], ...input, id }; return clone(roles[index]); },
  async deleteRole(id) { await wait(); roles = roles.filter(item => item.id !== id); },
  async updateRolePermissions(id, permissions) { return this.updateRole(id, { permissions }); },
  async listMenus() { await wait(); return clone(menus); },
  async createMenu(input) { await wait(); const item = { id: Date.now(), name: input.name ?? '', type: input.type ?? 'menu', route: input.route ?? '', permission: input.permission ?? '', icon: input.icon ?? '', sort: input.sort ?? 1, status: input.status ?? 'enabled', children: input.children } as MenuItem; menus = [...menus, item]; return clone(item); },
  async updateMenu(id, input) { await wait(); const update = (items: MenuItem[]): MenuItem[] => items.map(item => item.id === id ? { ...item, ...input, id } as MenuItem : { ...item, children: item.children ? update(item.children) : item.children }); menus = update(menus); const found = update(menus).find(item => item.id === id); if (!found) throw new Error('Menu not found'); return clone(found); },
  async deleteMenu(id) { await wait(); const remove = (items: MenuItem[]) => items.filter(item => item.id !== id).map(item => ({ ...item, children: item.children ? remove(item.children) : item.children })); menus = remove(menus); },
  async getDashboard() { await wait(); return clone({ statCards: STAT_CARDS, monthly: MONTHLY_DATA, yearly: YEARLY_TREND, activities: MOCK_ACTIVITIES, newUsers: MOCK_NEW_USERS, todos: MOCK_TODOS }); },
  async listArticles(query = {}) { await wait(); const filtered = articles.filter(item => (!query.keyword || `${item.title}${item.author}${item.category}`.includes(query.keyword)) && (!query.status || item.status === query.status)); return page(filtered, query); },
  async createArticle(input) { await wait(); const item = { id: Date.now(), cover: input.cover ?? '', title: input.title ?? '', author: input.author ?? '', category: input.category ?? '', tags: input.tags ?? [], views: input.views ?? 0, status: input.status ?? 'draft', publishTime: input.publishTime ?? new Date().toISOString() } as Article; articles = [item, ...articles]; return clone(item); },
  async updateArticle(id, input) { await wait(); const index = articles.findIndex(item => item.id === id); if (index < 0) throw new Error('Article not found'); articles[index] = { ...articles[index], ...input, id }; return clone(articles[index]); },
  async deleteArticle(id) { await wait(); articles = articles.filter(item => item.id !== id); },
  async listCategories() { await wait(); return clone(categories); },
  async createCategory(input) { await wait(); const item = { id: Date.now(), name: input.name ?? '', slug: input.slug ?? '', parentId: input.parentId ?? null, sort: input.sort ?? 1, description: input.description ?? '', articleCount: input.articleCount ?? 0 }; categories = [...categories, item]; return clone(item); },
  async updateCategory(id, input) { await wait(); const index = categories.findIndex(item => item.id === id); if (index < 0) throw new Error('Category not found'); categories[index] = { ...categories[index], ...input, id }; return clone(categories[index]); },
  async deleteCategory(id) { await wait(); categories = categories.filter(item => item.id !== id); },
  async listTags() { await wait(); return clone(tags); },
  async createTag(input) { await wait(); const item = { id: Date.now(), name: input.name ?? '', articleCount: input.articleCount ?? 0, createdAt: input.createdAt ?? new Date().toISOString().slice(0, 10), status: input.status ?? 'active' } as Tag; tags = [...tags, item]; return clone(item); },
  async updateTag(id, input) { await wait(); const index = tags.findIndex(item => item.id === id); if (index < 0) throw new Error('Tag not found'); tags[index] = { ...tags[index], ...input, id }; return clone(tags[index]); },
  async deleteTag(id) { await wait(); tags = tags.filter(item => item.id !== id); },
  async getVisitStats() { await wait(); return clone({ daily: [], sources: [], devices: [], regions: [] }); },
  async getUserPortrait() { await wait(); return clone({ gender: [], age: [], interests: [], loyalty: [], channels: [] }); },
  async getFunnel() { await wait(); return clone({ steps: [] }); },
  async getCalendarEvents() { await wait(); return clone(MOCK_EVENTS); },
  async getChatData() { await wait(); const module = await import('../../data/chatData'); return clone(module.INIT_CONVERSATIONS); },
  async getMapData(scope = 'china') { await wait(); return clone(scope === 'china' ? CHINA_DATA : WORLD_DATA); },
  async listLogs() { await wait(); return clone({ login: loginLogs, operation: operationLogs, exception: exceptionLogs }); },
  async listDict() { await wait(); return clone({ types: dictTypes, items: dictItems }); },
};
