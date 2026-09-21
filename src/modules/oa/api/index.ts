import { httpAdapter } from '../../../api/adapters/http';
const api = httpAdapter;
export const oaApi = {
  list: (resource:string, query?:Record<string,string>) => api.oaList!(resource, query),
  get: (resource:string,id:number) => api.oaGet!(resource,id),
  create: (resource:string,input:Record<string,unknown>) => api.oaCreate!(resource,input),
  update: (resource:string,id:number,input:Record<string,unknown>) => api.oaUpdate!(resource,id,input),
  remove: (resource:string,id:number) => api.oaDelete!(resource,id),
};
