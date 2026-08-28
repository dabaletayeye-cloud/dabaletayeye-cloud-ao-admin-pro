import { apiAdapter } from './adapter';

export const listOrders = (query?: { keyword?: string; status?: string }) => apiAdapter.listOrders(query);
export const getOrderStats = () => apiAdapter.getOrderStats();
export const orderAction = (id: number, action: 'process' | 'ship' | 'complete' | 'cancel' | 'restore') => apiAdapter.orderAction(id, action);
