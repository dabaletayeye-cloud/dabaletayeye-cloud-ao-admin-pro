import { apiAdapter } from './adapter';
import type { SystemConfig } from './types';

export const getSystemConfig = () => apiAdapter.getSystemConfig();
export const updateSystemConfig = (input: Omit<SystemConfig, 'storage'>) => apiAdapter.updateSystemConfig(input);

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl = (configuredApiBaseUrl || 'http://localhost:8989').replace(/\/+$/, '');
const apiMode = (import.meta.env.VITE_API_MODE || 'mock').toLowerCase();
const TOKEN_STORAGE_KEY = 'manga_workshop_tokens';

export interface GenerationQuotas {
  proScriptGenerateLimit: number;
  proRewriteLimit: number;
  proAdaptCardsLimit: number;
}

let mockQuotas: GenerationQuotas = {
  proScriptGenerateLimit: 100,
  proRewriteLimit: 200,
  proAdaptCardsLimit: 100,
};

interface ApiEnvelope<T> { code?: number; message?: string; data?: T; }

function storedTokens(): { storage: Storage; accessToken: string; refreshToken: string | null } | null {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = storage.getItem(TOKEN_STORAGE_KEY);
      if (!raw) continue;
      const token = JSON.parse(raw) as { accessToken?: unknown; refreshToken?: unknown };
      if (typeof token.accessToken === 'string' && token.accessToken) {
        return {
          storage,
          accessToken: token.accessToken,
          refreshToken: typeof token.refreshToken === 'string' && token.refreshToken ? token.refreshToken : null,
        };
      }
    } catch { /* Ignore malformed browser storage. */ }
  }
  return null;
}

async function refreshToken(current: NonNullable<ReturnType<typeof storedTokens>>): Promise<string | null> {
  if (!current.refreshToken) return null;
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: current.refreshToken }),
    });
    const result = await response.json().catch(() => null) as ApiEnvelope<{ accessToken?: unknown; refreshToken?: unknown }> | null;
    const accessToken = typeof result?.data?.accessToken === 'string' ? result.data.accessToken : null;
    const nextRefreshToken = typeof result?.data?.refreshToken === 'string' ? result.data.refreshToken : null;
    if (!response.ok || result?.code !== 0 || !accessToken || !nextRefreshToken) return null;
    current.storage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken: nextRefreshToken }));
    return accessToken;
  } catch {
    return null;
  }
}

async function sendQuota(method: 'GET' | 'PUT', token: string, body?: unknown): Promise<Response> {
  return fetch(`${apiBaseUrl}/api/v1/admin/generation-quotas`, {
    method,
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function quotaRequest<T>(method: 'GET' | 'PUT', body?: unknown): Promise<T> {
  const current = storedTokens();
  if (!current) throw new Error('请先使用具有系统配置权限的账号登录。');
  let response: Response;
  try {
    response = await sendQuota(method, current.accessToken, body);
    if (response.status === 401) {
      const refreshed = await refreshToken(current);
      if (refreshed) response = await sendQuota(method, refreshed, body);
    }
  } catch {
    throw new Error('无法连接后端服务，请确认服务已启动。');
  }
  const result = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || !result || result.code !== 0 || !result.data) throw new Error(result?.message || `请求失败（${response.status}）`);
  return result.data;
}

export async function getGenerationQuotas(): Promise<GenerationQuotas> {
  if (apiMode !== 'http') {
    await new Promise(resolve => window.setTimeout(resolve, 250));
    return { ...mockQuotas };
  }
  return quotaRequest<GenerationQuotas>('GET');
}

export async function updateGenerationQuotas(quotas: GenerationQuotas): Promise<GenerationQuotas> {
  if (apiMode !== 'http') {
    await new Promise(resolve => window.setTimeout(resolve, 250));
    mockQuotas = { ...quotas };
    return { ...mockQuotas };
  }
  return quotaRequest<GenerationQuotas>('PUT', quotas);
}
