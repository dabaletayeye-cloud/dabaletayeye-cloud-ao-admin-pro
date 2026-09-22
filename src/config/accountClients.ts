import raw from './account-clients.json';
export interface DemoClientConfig {
  enabled: boolean;
  defaultClientId: string;
  userTypes: Record<string, { label: string; enabled: boolean; store: string; permissionMode: string }>;
  clients: Record<string, { enabled: boolean; userTypes: string[]; defaultUserType: string; apiPrefixes: string[] }>;
  demoAccounts: Array<{ userType: string; username: string; password: string; name: string; role?: string }>;
}
export const accountClients = raw as DemoClientConfig;
