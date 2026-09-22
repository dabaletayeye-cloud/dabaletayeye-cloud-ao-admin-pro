import { accountClients } from '../config/accountClients';
const configuredClient = import.meta.env.VITE_AUTH_CLIENT_ID?.trim();
const demoClients = import.meta.env.VITE_API_MODE !== 'http' && accountClients.enabled;
export const AUTH_CLIENT_ID = configuredClient || (demoClients ? accountClients.defaultClientId : 'admin-web');
export const AUTH_USER_TYPE = import.meta.env.VITE_AUTH_USER_TYPE?.trim() || undefined;
export function tokenStorageKey(clientId?: string, userType?: string): string {
  return clientId || userType ? `manga_workshop_tokens:${encodeURIComponent(clientId || 'admin-web')}:${encodeURIComponent(userType || 'default')}` : 'manga_workshop_tokens';
}
export const TOKEN_STORAGE_KEY = tokenStorageKey(configuredClient || (demoClients ? AUTH_CLIENT_ID : undefined), AUTH_USER_TYPE);
export const scopedStorageKey = (base: string) => base + TOKEN_STORAGE_KEY.slice('manga_workshop_tokens'.length);
