import { apiAdapter } from './adapter';
import type { DashboardData } from './types';
export const getDashboard = (): Promise<DashboardData> => apiAdapter.getDashboard();
export const getDashboardStats = async () => (await apiAdapter.getDashboard()).statCards;
export const getDashboardCharts = async () => { const data = await apiAdapter.getDashboard(); return { monthly: data.monthly, yearly: data.yearly }; };
export const getDashboardActivities = async () => (await apiAdapter.getDashboard()).activities;
export const getDashboardNewUsers = async () => (await apiAdapter.getDashboard()).newUsers;
export const getDashboardTodos = async () => (await apiAdapter.getDashboard()).todos;
