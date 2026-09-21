import { apiAdapter } from './adapter';

export const oaApi = {
  list: (resource: string, query?: Record<string, string>) => apiAdapter.oaList(resource, query),
  get: (resource: string, id: number) => apiAdapter.oaGet(resource, id),
  create: (resource: string, input: Record<string, unknown>) => apiAdapter.oaCreate(resource, input),
  update: (resource: string, id: number, input: Record<string, unknown>) => apiAdapter.oaUpdate(resource, id, input),
  remove: (resource: string, id: number) => apiAdapter.oaDelete(resource, id),
};
