import { apiAdapter } from './adapter';
import type { ApiListQuery, PageResult, Role } from './types';
export const listRoles = (query?: ApiListQuery): Promise<PageResult<Role>> => apiAdapter.listRoles(query);
export const createRole = (input: Partial<Role>): Promise<Role> => apiAdapter.createRole(input);
export const updateRole = (id: number, input: Partial<Role>): Promise<Role> => apiAdapter.updateRole(id, input);
export const deleteRole = (id: number): Promise<void> => apiAdapter.deleteRole(id);
export const updateRolePermissions = (id: number, permissions: string[]): Promise<Role> => apiAdapter.updateRolePermissions(id, permissions);
