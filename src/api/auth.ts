import { apiAdapter } from './adapter';
import type { User } from './types';
export type LoginInput = { username: string; password: string };
export const login = (input: LoginInput): Promise<{ token: string; user: User }> => apiAdapter.login(input);
export const logout = (): Promise<void> => apiAdapter.logout();
export const getCurrentUser = (): Promise<User | null> => apiAdapter.getCurrentUser();
