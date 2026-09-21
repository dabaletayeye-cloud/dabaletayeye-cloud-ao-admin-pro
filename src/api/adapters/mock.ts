import { createMockBusiness } from './mockBusiness';
import mockAuth from '../../config/mock-auth.json';
import { mockEditionConfig, setMockEdition } from './mockEdition';
import { MOCK_ACTIVITIES, MOCK_NEW_USERS, MOCK_TODOS, MONTHLY_DATA, MOCK_USERS, STAT_CARDS, YEARLY_TREND, type User } from '../../data/mockData';
import { MOCK_ARTICLES, MOCK_CATEGORIES_FLAT, MOCK_TAGS } from '../../data/contentData';
import { MOCK_EVENTS } from '../../data/calendarData';
import { CHINA_DATA, WORLD_DATA } from '../../data/mapData';
import type { ApiAdapter, CurrentProfile, LowcodeDataSource, LowcodeDataSourceInput, LowcodeRelease, LowcodeResource, LowcodeResourceInput } from './types';

import type { Article, Category, DashboardAnalyticsData, DashboardAnalyticsRange, DictItem, DictType, EcommerceDashboardData, ExceptionLog, FileStorageInfo, LoginLog, ManagedFile, MenuItem, OperationLog, OrderInfo, OrderStats, Role, ServerInfo, SystemConfig, Tag } from '../types';

const wait = (ms = 300) => new Promise<void>(resolve => setTimeout(resolve, ms));
const clone = <T>(value: T): T => (typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)) as T);

let users = clone(MOCK_USERS);
let articles = clone(MOCK_ARTICLES);
let categories = clone(MOCK_CATEGORIES_FLAT);
let tags = clone(MOCK_TAGS);
const demoImage = new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#ede9fe"/><circle cx="620" cy="100" r="80" fill="#c4b5fd"/><text x="65" y="225" font-size="52" fill="#6d28d9">ao-admin-pro Demo</text></svg>'], { type: 'image/svg+xml' });
const fileBlobs = new Map<number, Blob>([[1, demoImage], [2, new Blob(['纯前端演示文件：上传和下载在当前浏览器内完成。'], { type: 'text/plain;charset=utf-8' })]]);
let managedFiles: ManagedFile[] = [
  { id: 1, name: 'demo-banner.svg', kind: 'image', size: demoImage.size, folder: 'images', path: '/mock/demo-banner.svg', provider: 'local', uploader: '演示管理员', updatedAt: new Date().toISOString() },
  { id: 2, name: '演示说明.txt', kind: 'document', size: fileBlobs.get(2)!.size, folder: 'documents', path: '/mock/演示说明.txt', provider: 'local', uploader: '演示管理员', updatedAt: new Date().toISOString() },
];
let systemConfig: SystemConfig = {
  site: {
    siteName: 'ao-admin-pro', siteSubtitle: '现代化企业管理后台', siteUrl: '', icp: '',
    copyright: '© 2026 ao-admin-pro. All rights reserved.', keywords: '后台管理,管理系统,ao-admin-pro',
    description: '高效、美观、可扩展的现代化管理后台系统',
  },
  mail: { smtpHost: '', smtpPort: '465', smtpUser: '', fromName: 'ao-admin-pro', fromEmail: '', enableSsl: true },
  security: { loginCaptcha: true, loginMaxAttempts: '5', lockMinutes: '30', tokenExpireHours: '24', passwordMinLength: '8', passwordComplexity: true, allowedIps: '' },
  notification: { enableEmail: true, enableSms: false, enableWebPush: true, adminEmail: '', alertOnLogin: true, alertOnException: true },
  theme: { defaultTheme: 'classic', defaultMode: 'light', sidebarWidth: '220', cornerRadius: '0.75' },
  storage: { provider: 'local', maxFileSizeMb: 50, localDirectory: './data/uploads', region: '', bucket: '', prefix: 'ao-admin-pro', cosConfigured: false },
};

let managedServers: ServerInfo[] = [
  { id: 1, key: 's1', name: '开发服务器', ip: '192.168.1.100', cpu: 40, ram: 69, swap: 18, disk: 69, status: 'online', os: 'CentOS 8.4', uptime: '12d 6h 24m' },
  { id: 2, key: 's2', name: '测试服务器', ip: '192.168.1.101', cpu: 33, ram: 18, swap: 37, disk: 13, status: 'online', os: 'Ubuntu 22.04', uptime: '5d 11h 02m' },
  { id: 3, key: 's3', name: '预发布服务器', ip: '192.168.1.102', cpu: 63, ram: 0, swap: 100, disk: 7, status: 'online', os: 'Debian 11', uptime: '30d 0h 00m' },
  { id: 4, key: 's4', name: '线上服务器', ip: '192.168.1.103', cpu: 24, ram: 15, swap: 79, disk: 55, status: 'online', os: 'CentOS 8.4', uptime: '88d 3h 47m' },
];
let managedOrders: OrderInfo[] = [
  { id: 1, orderNo: 'ORD-20240001', customer: '林晓薇', avatar: '林', product: '漫剧年会员 · 1年', channel: '微信支付', amount: 198, status: 'completed', date: '2024-06-01' },
  { id: 2, orderNo: 'ORD-20240002', customer: '陈建国', avatar: '陈', product: '漫剧季会员 · 3月', channel: '支付宝', amount: 68, status: 'shipping', date: '2024-06-02' },
  { id: 3, orderNo: 'ORD-20240003', customer: '张雨欣', avatar: '张', product: '单话解锁 × 5', channel: '微信支付', amount: 25, status: 'pending', date: '2024-06-03' },
  { id: 4, orderNo: 'ORD-20240004', customer: '王浩然', avatar: '王', product: '漫剧月会员 · 1月', channel: '银行卡', amount: 28, status: 'completed', date: '2024-06-04' },
  { id: 5, orderNo: 'ORD-20240005', customer: '刘梦琪', avatar: '刘', product: '漫剧年会员 · 1年', channel: '支付宝', amount: 198, status: 'cancelled', date: '2024-06-05' },
  { id: 6, orderNo: 'ORD-20240006', customer: '赵天宇', avatar: '赵', product: '单话解锁 × 10', channel: '微信支付', amount: 50, status: 'completed', date: '2024-06-06' },
  { id: 7, orderNo: 'ORD-20240007', customer: '孙悦', avatar: '孙', product: '漫剧季会员 · 3月', channel: '支付宝', amount: 68, status: 'pending', date: '2024-06-07' },
  { id: 8, orderNo: 'ORD-20240008', customer: '周晨曦', avatar: '周', product: '漫剧年会员 · 1年', channel: '微信支付', amount: 198, status: 'completed', date: '2024-06-08' },
  { id: 9, orderNo: 'ORD-20240009', customer: '吴佳怡', avatar: '吴', product: '单话解锁 × 3', channel: '银行卡', amount: 15, status: 'shipping', date: '2024-06-09' },
  { id: 10, orderNo: 'ORD-20240010', customer: '郑子轩', avatar: '郑', product: '漫剧月会员 · 1月', channel: '微信支付', amount: 28, status: 'completed', date: '2024-06-10' },
];
let lowcodeResources: LowcodeResource[] = [];
let lowcodeDataSources: LowcodeDataSource[] = [];
let lowcodeReleases: LowcodeRelease[] = [];
const lowcodeNow = () => new Date().toISOString();
const lowcodeResource = (input: LowcodeResourceInput, id = `lc-${Date.now()}`): LowcodeResource => ({
  id, ...clone(input), status: 'draft', currentVersion: null, createdBy: '当前管理员', createdAt: lowcodeNow(), updatedAt: lowcodeNow(),
});
const lowcodeDataSource = (input: LowcodeDataSourceInput, id = `ds-${Date.now()}`): LowcodeDataSource => ({
  id, name: input.name, sourceType: input.sourceType.toLowerCase(), host: input.host ?? null, port: input.port ?? null,
  username: input.username ?? null, secretRef: input.secretRef ?? null, secretConfigured: Boolean(input.secretRef), databaseName: input.databaseName ?? null,
  baseUrl: input.baseUrl ?? null, headersJson: input.headersJson ?? null, status: input.secretRef || input.sourceType.toLowerCase() === 'http' ? 'ready' : 'incomplete',
  createdBy: '当前管理员', createdAt: lowcodeNow(), updatedAt: lowcodeNow(),
});

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

const dashboardAnalytics = (days: DashboardAnalyticsRange = 7): DashboardAnalyticsData => {
  const end = new Date(2024, 5, 10);
  const labels = Array.from({ length: days }, (_, index) => {
    const value = new Date(end); value.setDate(end.getDate() - days + index + 1);
    return `${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  });
  const inRange = managedOrders.filter(order => labels.includes(order.date.slice(5)));
  const byDay = (date: string) => inRange.filter(order => order.date.slice(5) === date);
  const actual = labels.map(date => byDay(date).filter(order => order.status === 'completed').reduce((sum, order) => sum + order.amount, 0));
  const orders = labels.map(date => byDay(date).length);
  const newCustomers = labels.map(date => byDay(date).length);
  const previousCustomers = new Set<string>();
  const returningCustomers = labels.map(date => {
    const daily = byDay(date); const returning = daily.filter(order => previousCustomers.has(order.customer)).length;
    daily.forEach(order => previousCustomers.add(order.customer)); return returning;
  });
  const online = labels.map((date, index) => byDay(date).filter(order => order.status === 'completed' && !order.channel.includes('银行卡')).reduce((sum, order) => sum + order.amount, 0));
  const offline = labels.map((date, index) => actual[index] - online[index]);
  const completion = labels.map((date, index) => orders[index] ? Math.round(actual[index] > 0 ? byDay(date).filter(order => order.status === 'completed').length * 100 / orders[index] : 0) : 0);
  const totalRevenue = actual.reduce((sum, value) => sum + value, 0);
  const targetPerDay = totalRevenue ? Math.round(totalRevenue / days * 1.15 * 100) / 100 : 0;
  const change = (current: number, previous: number) => previous ? Math.round((current - previous) / Math.abs(previous) * 1000) / 10 : current ? 100 : 0;
  const last = days - 1; const previous = Math.max(0, last - 1);
  const totalOrders = orders.reduce((sum, value) => sum + value, 0);
  const totalCompleted = inRange.filter(order => order.status === 'completed').length;
  return {
    days, rangeStart: `2024-${labels[0]}`, rangeEnd: `2024-${labels[last]}`, labels,
    metrics: { revenue: actual[last], orders: orders[last], conversion: totalOrders ? Math.round(totalCompleted * 100 / totalOrders) : 0, newUsers: newCustomers.reduce((sum, value) => sum + value, 0), revenueChange: change(actual[last], actual[previous]), ordersChange: change(orders[last], orders[previous]), conversionChange: completion[last] - completion[previous], newUsersChange: change(newCustomers[last], newCustomers[previous]) },
    visitor: { returningCustomers, newCustomers }, revenue: { online, offline }, completion: { previous: completion.map((value, index) => index ? completion[index - 1] : 0), current: completion },
    target: { actual, target: labels.map(() => targetPerDay), actualTotal: totalRevenue, targetTotal: targetPerDay * days, progress: targetPerDay ? Math.round(totalRevenue / (targetPerDay * days) * 1000) / 10 : 0 },
  };
};

const ecommerceDashboard = (days: DashboardAnalyticsRange = 7): EcommerceDashboardData => {
  const end = new Date(2024, 5, 10);
  const dates = Array.from({ length: days }, (_, index) => {
    const value = new Date(end); value.setDate(end.getDate() - days + index + 1);
    return value.toISOString().slice(0, 10);
  });
  const previousDates = Array.from({ length: days }, (_, index) => {
    const value = new Date(end); value.setDate(end.getDate() - days * 2 + index + 1);
    return value.toISOString().slice(0, 10);
  });
  const current = managedOrders.filter(order => dates.includes(order.date));
  const previous = managedOrders.filter(order => previousDates.includes(order.date));
  const sumRevenue = (orders: OrderInfo[]) => orders.filter(order => order.status === 'completed').reduce((sum, order) => sum + order.amount, 0);
  const countCompleted = (orders: OrderInfo[]) => orders.filter(order => order.status === 'completed').length;
  const rate = (orders: OrderInfo[]) => orders.length ? Math.round(countCompleted(orders) / orders.length * 100) : 0;
  const change = (currentValue: number, previousValue: number) => previousValue ? Math.round((currentValue - previousValue) / Math.abs(previousValue) * 1000) / 10 : currentValue ? 100 : 0;
  const currentSales = dates.map(date => sumRevenue(current.filter(order => order.date === date)));
  const previousSales = previousDates.map(date => sumRevenue(previous.filter(order => order.date === date)));
  const categoryMap = new Map<string, number>();
  current.filter(order => order.status === 'completed').forEach(order => {
    const name = order.product.includes('会员') ? '会员订阅' : order.product.includes('解锁') ? '内容解锁' : '其他商品';
    categoryMap.set(name, (categoryMap.get(name) ?? 0) + order.amount);
  });
  const currentRevenue = sumRevenue(current);
  const previousRevenue = sumRevenue(previous);
  const latest = current.filter(order => order.date === dates[days - 1]);
  const previousLatest = previous.filter(order => order.date === previousDates[days - 1]);
  const users = new Set(current.map(order => order.customer));
  const previousUsers = new Set(previous.map(order => order.customer));
  const products = new Set(current.map(order => order.product));
  const previousProducts = new Set(previous.map(order => order.product));
  return {
    days, rangeStart: dates[0], rangeEnd: dates[days - 1], labels: dates.map(date => date.slice(5)),
    metrics: {
      todaySales: sumRevenue(latest), todaySalesChange: change(sumRevenue(latest), sumRevenue(previousLatest)),
      totalOrders: current.length, ordersChange: change(current.length, previous.length),
      activeUsers: users.size, activeUsersChange: change(users.size, previousUsers.size),
      totalProducts: products.size, productsChange: change(products.size, previousProducts.size),
      fulfillmentRate: rate(current), fulfillmentChange: rate(current) - rate(previous),
      conversionCount: countCompleted(current), conversionChange: change(countCompleted(current), countCompleted(previous)),
      revenue: currentRevenue, netProfit: Math.round(currentRevenue * 0.3 * 100) / 100,
    },
    salesTrend: { current: currentSales, previous: previousSales },
    categories: [...categoryMap.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })),
    conversionTrend: dates.map(date => rate(current.filter(order => order.date === date))),
    recentOrders: [...current].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, 8).map(order => ({ id: order.id, orderNo: order.orderNo, customer: order.customer, product: order.product, amount: order.amount, status: order.status, date: order.date })),
  };
};

export const mockAdapter: ApiAdapter = {
  async login(input) {
    await wait();
    if (!mockAuth.username.trim() || !mockAuth.password) throw new Error('请配置演示账号和密码');
    if (input.username.trim() !== mockAuth.username.trim() || input.password !== mockAuth.password) throw new Error('演示账号或密码不正确');
    return { token: 'mock-token', accessToken: 'mock-token', refreshToken: 'mock-refresh-token', user: clone(users[0]) };
  },
  async logout() { await wait(); },
  async getCurrentUser() { await wait(); return clone(users[0] ?? null); },
  async getCurrentProfile() { await wait(); return clone({ ...users[0], username: mockAuth.username.trim(), phone: '', department: '', position: '', bio: '' } as CurrentProfile); },
  async updateCurrentProfile(input) { await wait(); users[0] = { ...users[0], ...input } as typeof users[0]; return clone({ ...users[0], username: mockAuth.username.trim() } as CurrentProfile); },
  async changeCurrentPassword() { await wait(); },
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
  async getDashboardAnalytics(days = 7) { await wait(); return clone(dashboardAnalytics(days)); },
  async getEcommerceDashboard(days = 7) { await wait(); return clone(ecommerceDashboard(days)); },
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
  async listFiles() { await wait(); return clone(managedFiles); },
  async uploadFiles(files, folder = 'uploads') {
    await wait();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const uploaded = files.map((file, index) => {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      const kind: ManagedFile['kind'] = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio'
        : ['xlsx', 'xls', 'csv'].includes(extension) ? 'spreadsheet'
          : ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension) ? 'archive' : 'document';
      const id = Math.max(Date.now(), ...managedFiles.map(file => file.id + 1)) + index;
      fileBlobs.set(id, file);
      return {
        id,
        name: file.name,
        kind,
        size: file.size,
        folder,
        path: `/uploads/${folder}/${file.name}`,
        provider: 'local' as const,
        uploader: '超级管理员',
        updatedAt: now,
      };
    });
    managedFiles = [...uploaded, ...managedFiles];
    return clone(uploaded);
  },
  async downloadFile(id) {
    await wait();
    const file = managedFiles.find(item => item.id === id);
    if (!file) throw new Error('File not found');
    return fileBlobs.get(id) ?? new Blob([`Mock file: ${file.name}`], { type: 'text/plain' });
  },
  async deleteFile(id) { await wait(); managedFiles = managedFiles.filter(item => item.id !== id); fileBlobs.delete(id); },
  async getFileStorageInfo() { await wait(); return { provider: 'local', maxFileSize: 50 * 1024 * 1024 } satisfies FileStorageInfo; },
  async getSystemConfig() { await wait(); return clone(systemConfig); },
    async updateSystemConfig(input) {
    await wait();
    systemConfig = { ...systemConfig, ...clone(input), storage: systemConfig.storage };
      return clone(systemConfig);
    },
    async getSystemEdition() { await wait(120); return clone(mockEditionConfig()); },
    async updateSystemEdition(input) { await wait(180); return clone(setMockEdition(input)); },
  async listServers() {
    await wait(220);
    managedServers = managedServers.map(server => server.status === 'online' ? {
      ...server,
      cpu: Math.max(0, Math.min(100, server.cpu + Math.floor(Math.random() * 9) - 4)),
      ram: Math.max(0, Math.min(100, server.ram + Math.floor(Math.random() * 7) - 3)),
      swap: Math.max(0, Math.min(100, server.swap + Math.floor(Math.random() * 7) - 3)),
      disk: Math.max(0, Math.min(100, server.disk + Math.floor(Math.random() * 3) - 1)),
    } : server.status === 'restarting' ? { ...server, status: 'online' as const } : server);
    return clone(managedServers);
  },
  async serverAction(id, action) {
    await wait(180);
    const index = managedServers.findIndex(server => server.id === id);
    if (index < 0) throw new Error('服务器不存在');
    const status = action === 'start' ? 'online' : action === 'stop' ? 'offline' : 'restarting';
    managedServers[index] = { ...managedServers[index], status };
    return clone(managedServers[index]);
  },
  async listOrders(query = {}) {
    await wait(220);
    const keyword = query.keyword?.trim().toLowerCase() ?? '';
    return clone(managedOrders.filter(order => (!keyword || `${order.orderNo}${order.customer}${order.product}`.toLowerCase().includes(keyword)) && (!query.status || order.status === query.status)));
  },
  async getOrderStats() {
    await wait(180);
    const stats: OrderStats = { total: managedOrders.length, pending: managedOrders.filter(order => order.status === 'pending').length, shipping: managedOrders.filter(order => order.status === 'shipping').length, completed: managedOrders.filter(order => order.status === 'completed').length, cancelled: managedOrders.filter(order => order.status === 'cancelled').length, revenue: managedOrders.filter(order => order.status === 'completed').reduce((sum, order) => sum + order.amount, 0) };
    return clone(stats);
  },
  async orderAction(id, action) {
    await wait(180);
    const index = managedOrders.findIndex(order => order.id === id);
    if (index < 0) throw new Error('订单不存在');
    const status = action === 'process' || action === 'ship' ? 'shipping' : action === 'complete' ? 'completed' : action === 'cancel' ? 'cancelled' : 'pending';
    managedOrders[index] = { ...managedOrders[index], status };
    return clone(managedOrders[index]);
  },
  async listLowcodeResources(type) { await wait(); return clone(lowcodeResources.filter(resource => !type || resource.resourceType === type)); },
  async getLowcodeResource(id) { await wait(); const resource = lowcodeResources.find(item => item.id === id); if (!resource) throw new Error('低代码资源不存在'); return clone(resource); },
  async createLowcodeResource(input) { await wait(); const resource = lowcodeResource(input); lowcodeResources = [resource, ...lowcodeResources]; return clone(resource); },
  async updateLowcodeResource(id, input) { await wait(); const index = lowcodeResources.findIndex(item => item.id === id); if (index < 0) throw new Error('低代码资源不存在'); lowcodeResources[index] = { ...lowcodeResources[index], ...clone(input), updatedAt: lowcodeNow() }; return clone(lowcodeResources[index]); },
  async deleteLowcodeResource(id) { await wait(); lowcodeResources = lowcodeResources.filter(item => item.id !== id); lowcodeReleases = lowcodeReleases.filter(item => item.resourceId !== id); },
  async validateLowcodeResource(id) { await wait(); const resource = lowcodeResources.find(item => item.id === id); if (!resource) throw new Error('低代码资源不存在'); const definition = resource.definition as { nodes?: Array<{ id?: string; kind?: string }>; edges?: unknown[] }; const valid = resource.resourceType !== 'api' || (Array.isArray(definition.nodes) && definition.nodes.filter(node => node.kind === 'start').length === 1 && definition.nodes.filter(node => node.kind === 'end').length === 1 && Array.isArray(definition.edges)); return { valid, issues: valid ? [] : [{ code: 'FLOW_INVALID', message: '接口编排必须包含一个开始节点、一个结束节点以及连线。', nodeId: null }] }; },
  async testLowcodeResource(id) { const validation = await this.validateLowcodeResource(id); return { successful: validation.valid, dryRun: true, validation, trace: validation.valid ? ['INFO 安全 dry-run 已启动：不会执行脚本、SQL 或外部 HTTP 调用。', 'SUCCESS 流程结构有效，安全模拟完成。'] : ['ERROR 流程校验失败，请根据错误修正后重试。'] }; },
  async listLowcodeDataSources() { await wait(); return clone(lowcodeDataSources); },
  async createLowcodeDataSource(input) { await wait(); const source = lowcodeDataSource(input); lowcodeDataSources = [source, ...lowcodeDataSources]; return clone(source); },
  async updateLowcodeDataSource(id, input) { await wait(); const index = lowcodeDataSources.findIndex(item => item.id === id); if (index < 0) throw new Error('低代码数据源不存在'); lowcodeDataSources[index] = { ...lowcodeDataSource(input, id), createdAt: lowcodeDataSources[index].createdAt }; return clone(lowcodeDataSources[index]); },
  async deleteLowcodeDataSource(id) { await wait(); lowcodeDataSources = lowcodeDataSources.filter(item => item.id !== id); },
  async testLowcodeDataSource(id) { await wait(); const source = lowcodeDataSources.find(item => item.id === id); if (!source) throw new Error('低代码数据源不存在'); const ready = source.status === 'ready'; return { ready, status: source.status, messages: ready ? ['配置校验通过（Mock 模式不会发起真实网络或数据库连接）。'] : ['请配置密钥变量名或完整 HTTP 地址。'], checkedAt: lowcodeNow() }; },
  async listLowcodeReleases(query = {}) { await wait(); const resources = new Map(lowcodeResources.map(resource => [resource.id, resource])); return clone(lowcodeReleases.filter(item => (!query.type || item.resourceType === query.type) && (!query.resourceId || item.resourceId === query.resourceId)).map(item => ({ ...item, resourceName: resources.get(item.resourceId)?.name ?? item.resourceName }))); },
  async publishLowcodeResource(id, releaseNote) { await wait(); const resource = lowcodeResources.find(item => item.id === id); if (!resource) throw new Error('低代码资源不存在'); const version = `v1.0.${lowcodeReleases.filter(item => item.resourceId === id).length}`; lowcodeReleases = lowcodeReleases.map(item => item.resourceId === id ? { ...item, active: false } : item); const release: LowcodeRelease = { id: `release-${Date.now()}`, resourceId: id, resourceName: resource.name, resourceType: resource.resourceType, version, publisher: '当前管理员', releaseNote, snapshotJson: JSON.stringify(resource.definition, null, 2), active: true, createdAt: lowcodeNow() }; lowcodeReleases = [release, ...lowcodeReleases]; resource.status = 'published'; resource.currentVersion = version; resource.updatedAt = lowcodeNow(); return clone(release); },
  async rollbackLowcodeRelease(id) { await wait(); const release = lowcodeReleases.find(item => item.id === id); if (!release) throw new Error('低代码发布版本不存在'); lowcodeReleases = lowcodeReleases.map(item => item.resourceId === release.resourceId ? { ...item, active: item.id === id } : item); const resource = lowcodeResources.find(item => item.id === release.resourceId); if (resource) { resource.definition = JSON.parse(release.snapshotJson) as Record<string, unknown>; resource.status = 'published'; resource.currentVersion = release.version; resource.updatedAt = lowcodeNow(); } return clone({ ...release, active: true }); },
  ...createMockBusiness(),
};
