import type { ApiAdapter } from './types';
import type { ApiListQuery } from '../types';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const baseUrl = (configuredBaseUrl || 'http://localhost:8080').replace(/\/+$/, '');

interface ApiEnvelope<T> { code?: number; message?: string; data?: T; }

function accessToken(): string | null {
  if (typeof window === 'undefined') return null;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = storage.getItem('manga_workshop_tokens');
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { accessToken?: unknown };
      if (typeof parsed.accessToken === 'string' && parsed.accessToken) return parsed.accessToken;
    } catch { /* ignore malformed storage */ }
  }
  return null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(accessToken() ? { Authorization: `Bearer ${accessToken()}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new Error('无法连接后端服务，请确认服务已启动');
  }
  const body = await response.json().catch(() => null) as ApiEnvelope<T> | T | null;
  if (!response.ok) throw new Error((body as ApiEnvelope<T> | null)?.message || `请求失败（${response.status}）`);
  if (body && typeof body === 'object' && 'data' in body && ('code' in body || 'message' in body)) {
    const envelope = body as ApiEnvelope<T>;
    if (envelope.code !== undefined && envelope.code !== 0) throw new Error(envelope.message || '请求失败');
    return envelope.data as T;
  }
  return body as T;
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
  logout: () => request('/api/auth/logout', { method: 'POST' }),
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
};
