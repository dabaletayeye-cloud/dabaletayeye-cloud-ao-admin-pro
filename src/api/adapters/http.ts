import type { ApiAdapter } from './types';
import { merchantHeaders } from '../merchantScope';
import { AUTH_CLIENT_ID, AUTH_USER_TYPE, TOKEN_STORAGE_KEY } from '../authConfig';
import type { ApiListQuery } from '../types';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const baseUrl = (configuredBaseUrl || 'http://localhost:8989').replace(/\/+$/, '');

interface ApiEnvelope<T> { code?: number; message?: string; data?: T; }
interface StoredTokens { accessToken?: unknown; refreshToken?: unknown; }
interface TokenPayload { token?: unknown; accessToken?: unknown; refreshToken?: unknown; }
let refreshPromise: Promise<string | null> | null = null;

function storedTokens(): { storage: Storage; accessToken: string; refreshToken: string | null } | null {
  if (typeof window === 'undefined') return null;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = storage.getItem(TOKEN_STORAGE_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as StoredTokens;
      if (typeof parsed.accessToken === 'string' && parsed.accessToken) {
        return { storage, accessToken: parsed.accessToken, refreshToken: typeof parsed.refreshToken === 'string' && parsed.refreshToken ? parsed.refreshToken : null };
      }
    } catch { /* ignore malformed storage */ }
  }
  return null;
}

function clearTokens(storage?: Storage) {
  if (typeof window === 'undefined') return;
  if (storage) storage.removeItem(TOKEN_STORAGE_KEY);
  else { window.localStorage.removeItem(TOKEN_STORAGE_KEY); window.sessionStorage.removeItem(TOKEN_STORAGE_KEY); }
}

function notifyAuthenticationRequired() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('ao-auth-required'));
}

function isEnvelope<T>(body: ApiEnvelope<T> | T | null): body is ApiEnvelope<T> {
  return Boolean(body && typeof body === 'object' && 'data' in body && ('code' in body || 'message' in body));
}

async function send(path: string, init: RequestInit, token?: string, scope = merchantHeaders()): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers, 'X-Client-Id': AUTH_CLIENT_ID, ...scope },
  });
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const current = storedTokens();
    if (!current?.refreshToken) { clearTokens(current?.storage); return null; }
    try {
      const response = await send('/api/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: current.refreshToken, clientId: AUTH_CLIENT_ID }) });
      const body = await response.json().catch(() => null) as ApiEnvelope<TokenPayload> | TokenPayload | null;
      const payload = isEnvelope(body) ? body.data : body;
      const accessToken = typeof payload?.accessToken === 'string' && payload.accessToken ? payload.accessToken : typeof payload?.token === 'string' && payload.token ? payload.token : null;
      const refreshToken = typeof payload?.refreshToken === 'string' && payload.refreshToken ? payload.refreshToken : null;
      if (!response.ok || (isEnvelope(body) && body.code !== undefined && body.code !== 0) || !accessToken || !refreshToken) { clearTokens(current.storage); return null; }
      current.storage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }));
      return accessToken;
    } catch { clearTokens(current.storage); return null; }
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const scope = merchantHeaders();
  const initialTokens = storedTokens();
  let response: Response;
  try {
    response = await send(path, init, initialTokens?.accessToken, scope);
  } catch {
    throw new Error('无法连接后端服务，请确认服务已启动');
  }
  if (response.status === 401 && path !== '/api/auth/login' && path !== '/api/auth/refresh') {
    const refreshedAccessToken = await refreshAccessToken();
    if (refreshedAccessToken) {
      try { response = await send(path, init, refreshedAccessToken, scope); }
      catch { throw new Error('无法连接后端服务，请确认服务已启动'); }
    }
  }
  const body = await response.json().catch(() => null) as ApiEnvelope<T> | T | null;
  if (!response.ok) {
    if (response.status === 401) {
      clearTokens();
      if (path !== '/api/auth/login' && path !== '/api/auth/refresh') notifyAuthenticationRequired();
    }
    throw new Error((body as ApiEnvelope<T> | null)?.message || `请求失败（${response.status}）`);
  }
  if (isEnvelope(body)) {
    const envelope = body;
    if (envelope.code !== undefined && envelope.code !== 0) throw new Error(envelope.message || '请求失败');
    return envelope.data as T;
  }
  return body as T;
}

async function requestBlob(path: string): Promise<Blob> {
  const scope = merchantHeaders();
  const initialTokens = storedTokens();
  let response = await send(path, { method: 'GET' }, initialTokens?.accessToken, scope);
  if (response.status === 401) {
    const refreshedAccessToken = await refreshAccessToken();
    if (refreshedAccessToken) response = await send(path, { method: 'GET' }, refreshedAccessToken, scope);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null) as ApiEnvelope<unknown> | null;
    if (response.status === 401) {
      clearTokens();
      notifyAuthenticationRequired();
    }
    throw new Error(body?.message || `下载失败（${response.status}）`);
  }
  return response.blob();
}

const queryString = (query: ApiListQuery = {}) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => value !== undefined && params.set(key, String(value)));
  const result = params.toString();
  return result ? `?${result}` : '';
};
const json = (body: unknown): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const httpAdapter: ApiAdapter = {
  getTenancyContext: () => request('/api/tenancy/context'),
  saveTenantRegion: (input, id) => request(`/api/tenancy/regions${id ? `/${id}` : ''}`, { ...json(input), method: id ? 'PUT' : 'POST' }),
  saveTenantMerchant: (input, id) => request(`/api/tenancy/merchants${id ? `/${id}` : ''}`, { ...json(input), method: id ? 'PUT' : 'POST' }),
  listMerchantMembers: id => request(`/api/tenancy/merchants/${id}/members`),
  bindMerchantMember: (id, accountType, userId) => request(`/api/tenancy/merchants/${id}/members`, json({ accountType, userId })),
  unbindMerchantMember: (id, type, user) => request(`/api/tenancy/merchants/${id}/members/${encodeURIComponent(type)}/${user}`, { method: 'DELETE' }),
  listTypedUsers: (type, query) => request(`/api/account-users/${encodeURIComponent(type)}${queryString(query)}`),
  createTypedUser: (type, input) => request(`/api/account-users/${encodeURIComponent(type)}`, json(input)),
  updateTypedUser: (type, id, input) => request(`/api/account-users/${encodeURIComponent(type)}/${id}`, { ...json(input), method: 'PUT' }),
  deleteTypedUser: (type, id) => request(`/api/account-users/${encodeURIComponent(type)}/${id}`, { method: 'DELETE' }),
  listSystemUsers: query => request(`/api/sys-users${queryString(query)}`),
  createSystemUser: input => request('/api/sys-users', json(input)),
  updateSystemUser: (id, input) => request(`/api/sys-users/${id}`, { ...json(input), method: 'PUT' }),
  deleteSystemUser: id => request(`/api/sys-users/${id}`, { method: 'DELETE' }),
  oaList: (resource, query) => request(`/api/oa/${resource}${queryString(query)}`),
  oaGet: (resource, id) => request(`/api/oa/${resource}/${id}`),
  oaCreate: (resource, input) => request(`/api/oa/${resource}`, json(input)),
  oaUpdate: (resource, id, input) => request(`/api/oa/${resource}/${id}`, { ...json(input), method: 'PUT' }),
  oaDelete: (resource, id) => request(`/api/oa/${resource}/${id}`, { method: 'DELETE' }),
  login: input => request('/api/auth/login', json({ ...input, clientId: AUTH_CLIENT_ID, userType: AUTH_USER_TYPE })),
  logout: async () => { await request('/api/auth/logout', { method: 'POST' }); clearTokens(); },
  getCurrentUser: () => request('/api/auth/me'),
  getCurrentProfile: () => request('/api/auth/me'),
  updateCurrentProfile: input => request('/api/auth/me/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }),
  changeCurrentPassword: input => request('/api/auth/me/password', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }),
  listUsers: query => request(`/api/users${queryString(query)}`),
  createUser: input => request('/api/users', json(input)),
  updateUser: (id, input) => request(`/api/users/${id}`, { ...json(input), method: 'PUT' }),
  deleteUser: id => request(`/api/users/${id}`, { method: 'DELETE' }),
  listRoles: query => request(`/api/roles${queryString(query)}`),
  createRole: input => request('/api/roles', json(input)),
  updateRole: (id, input) => request(`/api/roles/${id}`, { ...json(input), method: 'PUT' }),
  deleteRole: id => request(`/api/roles/${id}`, { method: 'DELETE' }),
  updateRolePermissions: (id, permissions) => request(`/api/roles/${id}/permissions`, json({ permissions })),
  listMenus: () => request('/api/menus'),
  createMenu: input => request('/api/menus', json(input)),
  updateMenu: (id, input) => request(`/api/menus/${id}`, { ...json(input), method: 'PUT' }),
  deleteMenu: id => request(`/api/menus/${id}`, { method: 'DELETE' }),
  getDashboard: () => request('/api/dashboard'),
  getDashboardAnalytics: days => request(`/api/dashboard/analytics${days ? `?days=${days}` : ''}`),
  getEcommerceDashboard: days => request(`/api/dashboard/ecommerce${days ? `?days=${days}` : ''}`),
  listArticles: query => request(`/api/articles${queryString(query)}`),
  createArticle: input => request('/api/articles', json(input)),
  updateArticle: (id, input) => request(`/api/articles/${id}`, { ...json(input), method: 'PUT' }),
  deleteArticle: id => request(`/api/articles/${id}`, { method: 'DELETE' }),
  listCategories: () => request('/api/categories'),
  createCategory: input => request('/api/categories', json(input)),
  updateCategory: (id, input) => request(`/api/categories/${id}`, { ...json(input), method: 'PUT' }),
  deleteCategory: id => request(`/api/categories/${id}`, { method: 'DELETE' }),
  listTags: () => request('/api/tags'),
  createTag: input => request('/api/tags', json(input)),
  updateTag: (id, input) => request(`/api/tags/${id}`, { ...json(input), method: 'PUT' }),
  deleteTag: id => request(`/api/tags/${id}`, { method: 'DELETE' }),
  getVisitStats: () => request('/api/analytics/visits'),
  getUserPortrait: () => request('/api/analytics/portrait'),
  getFunnel: () => request('/api/analytics/funnel'),
  getCalendarEvents: query => request(`/api/calendar/events${queryString(query as ApiListQuery)}`),
  getChatData: () => request('/api/chat'),
  getMapData: scope => request(`/api/analytics/map${scope ? `?scope=${scope}` : ''}`),
  listLogs: () => request('/api/logs'),
  listDict: () => request('/api/dict'),
  listFiles: query => {
    const params = new URLSearchParams();
    if (query?.keyword) params.set('keyword', query.keyword);
    if (query?.folder) params.set('folder', query.folder);
    if (query?.kind) params.set('kind', query.kind);
    const suffix = params.size ? `?${params.toString()}` : '';
    return request(`/api/files${suffix}`);
  },
  uploadFiles: (files, folder) => {
    const form = new FormData();
    files.forEach(file => form.append('files', file));
    if (folder) form.append('folder', folder);
    return request('/api/files', { method: 'POST', body: form });
  },
  downloadFile: id => requestBlob(`/api/files/${id}/download`),
  deleteFile: id => request(`/api/files/${id}`, { method: 'DELETE' }),
  getFileStorageInfo: () => request('/api/files/storage'),
  getSystemConfig: () => request('/api/system-config'),
  updateSystemConfig: input => request('/api/system-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }),
  getSystemEdition: () => request('/api/system/config/edition'),
  updateSystemEdition: input => request('/api/system/config/edition', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }),
  listServers: () => request('/api/servers'),
  serverAction: (id, action) => request(`/api/servers/${id}/actions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }),
  listOrders: query => request(`/api/orders${queryString(query)}`),
  getOrderStats: () => request('/api/orders/stats'),
  orderAction: (id, action) => request(`/api/orders/${id}/actions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }),
  listLowcodeResources: type => request(`/api/lowcode/resources${type ? `?type=${encodeURIComponent(type)}` : ''}`),
  getLowcodeResource: id => request(`/api/lowcode/resources/${encodeURIComponent(id)}`),
  createLowcodeResource: input => request('/api/lowcode/resources', json(input)),
  updateLowcodeResource: (id, input) => request(`/api/lowcode/resources/${encodeURIComponent(id)}`, { ...json(input), method: 'PUT' }),
  deleteLowcodeResource: id => request(`/api/lowcode/resources/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  validateLowcodeResource: id => request(`/api/lowcode/resources/${encodeURIComponent(id)}/validate`, { method: 'POST' }),
  testLowcodeResource: id => request(`/api/lowcode/resources/${encodeURIComponent(id)}/test`, { method: 'POST' }),
  listLowcodeDataSources: () => request('/api/lowcode/data-sources'),
  createLowcodeDataSource: input => request('/api/lowcode/data-sources', json(input)),
  updateLowcodeDataSource: (id, input) => request(`/api/lowcode/data-sources/${encodeURIComponent(id)}`, { ...json(input), method: 'PUT' }),
  deleteLowcodeDataSource: id => request(`/api/lowcode/data-sources/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  testLowcodeDataSource: id => request(`/api/lowcode/data-sources/${encodeURIComponent(id)}/test`, { method: 'POST' }),
  listLowcodeReleases: query => request(`/api/lowcode/releases${queryString(query as ApiListQuery)}`),
  publishLowcodeResource: (id, releaseNote) => request(`/api/lowcode/resources/${encodeURIComponent(id)}/publish`, json({ releaseNote })),
  rollbackLowcodeRelease: id => request(`/api/lowcode/releases/${encodeURIComponent(id)}/rollback`, { method: 'POST' }),
  listErp: (resource, query) => request(`/api/erp/${resource}${queryString(query)}`),
  getErp: (resource, id) => request(`/api/erp/${resource}/${id}`),
  createErp: (resource, input) => request(`/api/erp/${resource}`, json(input)),
  updateErp: (resource, id, input) => request(`/api/erp/${resource}/${id}`, { ...json(input), method: 'PUT' }),
  deleteErp: (resource, id) => request(`/api/erp/${resource}/${id}`, { method: 'DELETE' }),
  moveErpInventory: (productId, input) => request(`/api/erp/inventory/${productId}/move`, json(input)),
  listErpInventoryFlows: productId => request(`/api/erp/inventory/${productId}/flows`),
  getErpReports: () => request('/api/erp/reports/summary'),
  approveErpPurchase: (id, input) => request(`/api/erp/purchases/${id}/approve`, json(input)),
  listErpInventoryAlerts: () => request('/api/erp/inventory/alerts'),
  getErpStats: resource => request(`/api/erp/${resource}/stats`),
};
