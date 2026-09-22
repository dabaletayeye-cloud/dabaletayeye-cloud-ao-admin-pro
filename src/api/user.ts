import { apiAdapter } from './adapter';
import type { ApiListQuery, PageResult, User } from './types';
export const listUsers = (query?: ApiListQuery): Promise<PageResult<User>> => apiAdapter.listUsers(query);
export type UserInput = Partial<User> & { password?: string };
export const createUser = (input: UserInput): Promise<User> => apiAdapter.createUser(input);
export const updateUser = (id: number, input: UserInput): Promise<User> => apiAdapter.updateUser(id, input);
export const deleteUser = (id: number): Promise<void> => apiAdapter.deleteUser(id);
