import { apiAdapter } from './adapter';
import type { ApiListQuery, SystemUserInput } from './types';

export const accountUsersApi = (type: string) => ({
  list: (query?: ApiListQuery) => apiAdapter.listTypedUsers(type, query),
  create: (input: SystemUserInput) => apiAdapter.createTypedUser(type, input),
  update: (id: number, input: SystemUserInput) => apiAdapter.updateTypedUser(type, id, input),
  remove: (id: number) => apiAdapter.deleteTypedUser(type, id),
});
