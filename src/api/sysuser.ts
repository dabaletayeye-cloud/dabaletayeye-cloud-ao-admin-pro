import { apiAdapter } from './adapter';
import type { ApiListQuery, SystemUserInput } from './types';

export const sysuserApi = {
  list: (query?: ApiListQuery) => apiAdapter.listSystemUsers(query),
  create: (input: SystemUserInput) => apiAdapter.createSystemUser(input),
  update: (id: number, input: SystemUserInput) => apiAdapter.updateSystemUser(id, input),
  remove: (id: number) => apiAdapter.deleteSystemUser(id),
};
