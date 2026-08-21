import { apiAdapter } from './adapter';
import type { ApiListQuery, PageResult, User } from './types';
export const listUsers = (query?: ApiListQuery): Promise<PageResult<User>> => apiAdapter.listUsers(query);
export const createUser = (input: Partial<User>): Promise<User> => apiAdapter.createUser(input);
export const updateUser = (id: number, input: Partial<User>): Promise<User> => apiAdapter.updateUser(id, input);
export const deleteUser = (id: number): Promise<void> => apiAdapter.deleteUser(id);
