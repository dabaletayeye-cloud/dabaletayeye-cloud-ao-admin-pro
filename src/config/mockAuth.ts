import stored from './mock-auth.json';

interface MockAuthConfig {
  username: string;
  password: string;
  sysUserEnabled: boolean;
  sysuser: { username: string; password: string };
}
const source = stored as Partial<MockAuthConfig>;
// Older two-field demo configurations remain valid.
const mockAuth: MockAuthConfig = {
  username: source.username ?? 'demo', password: source.password ?? 'demo123',
  sysUserEnabled: source.sysUserEnabled ?? false,
  sysuser: { username: source.sysuser?.username ?? 'SysAdmin', password: source.sysuser?.password ?? 'admin123' },
};
export default mockAuth;
