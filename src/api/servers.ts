import { apiAdapter } from './adapter';

export const listServers = () => apiAdapter.listServers();
export const serverAction = (id: number, action: 'start' | 'stop' | 'restart') => apiAdapter.serverAction(id, action);
