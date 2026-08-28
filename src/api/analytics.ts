import { apiAdapter } from './adapter';
import type { DashboardAnalyticsRange } from './types';
export { MAP_DARK_COLORS, MAP_LIGHT_COLORS, MAP_MANGA_COLORS, MAP_MANGA_DARK_COLORS } from '../data/mapData';
export const getVisitStats = () => apiAdapter.getVisitStats();
export const getUserPortrait = () => apiAdapter.getUserPortrait();
export const getFunnel = () => apiAdapter.getFunnel();
export const getDashboardAnalytics = (days?: DashboardAnalyticsRange) => apiAdapter.getDashboardAnalytics(days);
export const getEcommerceDashboard = (days?: DashboardAnalyticsRange) => apiAdapter.getEcommerceDashboard(days);
export const getMapData = (scope?: 'china' | 'world') => apiAdapter.getMapData(scope);
