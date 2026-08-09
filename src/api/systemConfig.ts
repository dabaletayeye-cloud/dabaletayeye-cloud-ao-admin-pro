const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl = (configuredApiBaseUrl || "http://localhost:8080").replace(/\/+$/, "");

interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export interface GenerationQuotas {
  proScriptGenerateLimit: number;
  proRewriteLimit: number;
  proAdaptCardsLimit: number;
}

function getAccessToken(): string | null {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const value = storage.getItem("manga_workshop_tokens");
      if (!value) continue;
      const tokens = JSON.parse(value) as { accessToken?: unknown };
      if (typeof tokens.accessToken === "string" && tokens.accessToken) return tokens.accessToken;
    } catch {
      // Ignore unavailable or malformed browser storage.
    }
  }
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error("请先使用具有系统配置权限的账号登录主站");

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...init?.headers,
      },
    });
  } catch {
    throw new Error("无法连接后端服务，请确认服务已启动");
  }

  const envelope = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || !envelope || envelope.code !== 0) {
    throw new Error(envelope?.message || `请求失败（${response.status}）`);
  }
  return envelope.data;
}

export async function getGenerationQuotas(): Promise<GenerationQuotas> {
  return request<GenerationQuotas>("/api/v1/admin/generation-quotas");
}

export async function updateGenerationQuotas(quotas: GenerationQuotas): Promise<GenerationQuotas> {
  return request<GenerationQuotas>("/api/v1/admin/generation-quotas", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quotas),
  });
}
