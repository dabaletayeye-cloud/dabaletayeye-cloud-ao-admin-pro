import { apiAdapter } from './adapter';
import type { User } from './types';
export type LoginInput = { username: string; password: string };
export type LoginResult = {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
  user: User;
};
export const login = (input: LoginInput): Promise<LoginResult> => apiAdapter.login(input);
export const logout = (): Promise<void> => apiAdapter.logout();
export const getCurrentUser = (): Promise<User | null> => apiAdapter.getCurrentUser();
