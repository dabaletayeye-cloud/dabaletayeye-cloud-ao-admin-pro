import type { Activity, TodoItem, User } from '../data/mockData';
import type { Article, ArticleStatus, Category, Tag } from '../data/contentData';
import type { CalEvent } from '../data/calendarData';
import type { RegionData } from '../data/mapData';

export type { Activity, TodoItem, User, Article, ArticleStatus, Category, Tag, CalEvent, RegionData };

export interface ApiListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardStatCard {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
}

export interface DashboardData {
  statCards: DashboardStatCard[];
  monthly: Array<{ month: string; value: number }>;
  yearly: Array<{ month: string; visits: number }>;
  activities: Activity[];
  newUsers: Array<{ name: string; region: string; gender: string; progress: number; avatar: string }>;
  todos: TodoItem[];
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  userCount: number;
  status: 'enabled' | 'disabled';
  createdAt: string;
  permissions: string[];
}

export type MenuType = 'catalog' | 'menu' | 'button' | 'external';

export interface MenuItem {
  id: number;
  name: string;
  type: MenuType;
  route: string;
  permission: string;
  icon: string;
  sort: number;
  status: 'enabled' | 'disabled';
  children?: MenuItem[];
}

export interface LoginLog {
  id: number;
  username: string;
  ip: string;
  location: string;
  browser: string;
  os: string;
  status: 'success' | 'fail';
  msg: string;
  time: string;
}

export interface OperationLog {
  id: number;
  username: string;
  module: string;
  type: string;
  method: string;
  requestUri: string;
  ip: string;
  status: 'success' | 'fail';
  costTime: number;
  time: string;
}

export interface ExceptionLog {
  id: number;
  username: string;
  requestUri: string;
  errorMsg: string;
  exceptionClass: string;
  ip: string;
  time: string;
}

export interface DictType {
  id: number;
  name: string;
  code: string;
  remark: string;
  status: 'enabled' | 'disabled';
}

export interface DictItem {
  id: number;
  typeId: number;
  label: string;
  value: string;
  sort: number;
  status: 'enabled' | 'disabled';
  remark: string;
}

export interface VisitStatsData {
  daily: Array<{ date: string; pv: number; uv: number; ip: number }>;
  sources: Array<{ name: string; value: number; color: string }>;
  devices: Array<{ name: string; value: number; color: string }>;
  regions: Array<{ name: string; value: number; growth: number }>;
}

export interface UserPortraitData {
  gender: Array<{ name: string; value: number }>;
  age: Array<{ name: string; value: number }>;
  interests: Array<{ name: string; value: number }>;
  loyalty: Array<{ name: string; value: number }>;
  channels: Array<{ name: string; value: number }>;
}

export interface FunnelData {
  steps: Array<{ name: string; value: number; rate?: number }>;
}
