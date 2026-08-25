import type { ApiAdapter } from './types';
import type { ApiListQuery } from '../types';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const baseUrl = (configuredBaseUrl || 'http://localhost:8989').replace(/\/+$/, '');

interface ApiEnvelope<T> { code?: number; message?: string; data?: T; }
interface StoredTokens { accessToken?: unknown; refreshToken?: unknown; }
interface TokenPayload { token?: unknown; accessToken?: unknown; refreshToken?: unknown; }
const TOKEN_STORAGE_KEY = 'manga_workshop_tokens';
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

async function send(path: string, init: RequestInit, token?: string): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const current = storedTokens();
    if (!current?.refreshToken) { clearTokens(current?.storage); return null; }
    try {
      const response = await send('/api/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: current.refreshToken }) });
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
  const initialTokens = storedTokens();
  let response: Response;
  try {
    response = await send(path, init, initialTokens?.accessToken);
  } catch {
    throw new Error('无法连接后端服务，请确认服务已启动');
  }
  if (response.status === 401 && path !== '/api/auth/login' && path !== '/api/auth/refresh') {
    const refreshedAccessToken = await refreshAccessToken();
    if (refreshedAccessToken) {
      try { response = await send(path, init, refreshedAccessToken); }
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
  const initialTokens = storedTokens();
  let response = await send(path, { method: 'GET' }, initialTokens?.accessToken);
  if (response.status === 401) {
    const refreshedAccessToken = await refreshAccessToken();
    if (refreshedAccessToken) response = await send(path, { method: 'GET' }, refreshedAccessToken);
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
  login: input => request('/api/auth/login', json(input)),
  logout: async () => { await request('/api/auth/logout', { method: 'POST' }); clearTokens(); },
  getCurrentUser: () => request('/api/auth/me'),
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
};
