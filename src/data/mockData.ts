import type { BaseUser } from '../api/baseUser';
// Mock data for the admin dashboard

export interface User extends BaseUser {
  avatar: string;
  region: string;
  gender: '男' | '女';
  role: string;
  roles?: string[];
  status: 'active' | 'inactive' | 'banned';
  joinDate: string;
  progress: number;
}

export interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
  avatar: string;
  type: 'success' | 'info' | 'warning';
}

export interface TodoItem {
  id: number;
  text: string;
  done: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const MOCK_USERS: User[] = [
  { id: 1, name: '林晓薇', email: 'lin@example.com', avatar: 'https://i.pravatar.cc/96?img=47', region: '上海', gender: '女', role: '管理员', status: 'active', joinDate: '2024-01-15', progress: 85 },
  { id: 2, name: '陈建国', email: 'chen@example.com', avatar: 'https://i.pravatar.cc/96?img=12', region: '北京', gender: '男', role: '编辑', status: 'active', joinDate: '2024-02-20', progress: 72 },
  { id: 3, name: '张雨欣', email: 'zhang@example.com', avatar: 'https://i.pravatar.cc/96?img=45', region: '广州', gender: '女', role: '用户', status: 'inactive', joinDate: '2024-03-10', progress: 45 },
  { id: 4, name: '王浩然', email: 'wang@example.com', avatar: 'https://i.pravatar.cc/96?img=11', region: '深圳', gender: '男', role: '运营', status: 'active', joinDate: '2024-01-28', progress: 91 },
  { id: 5, name: '刘梦琪', email: 'liu@example.com', avatar: 'https://i.pravatar.cc/96?img=44', region: '杭州', gender: '女', role: '用户', status: 'active', joinDate: '2024-04-05', progress: 63 },
  { id: 6, name: '赵天宇', email: 'zhao@example.com', avatar: 'https://i.pravatar.cc/96?img=13', region: '成都', gender: '男', role: '设计师', status: 'banned', joinDate: '2023-12-01', progress: 30 },
  { id: 7, name: '孙悦', email: 'sun@example.com', avatar: 'https://i.pravatar.cc/96?img=49', region: '武汉', gender: '女', role: '编辑', status: 'active', joinDate: '2024-03-22', progress: 78 },
  { id: 8, name: '周晨曦', email: 'zhou@example.com', avatar: 'https://i.pravatar.cc/96?img=14', region: '西安', gender: '男', role: '用户', status: 'active', joinDate: '2024-05-01', progress: 55 },
  { id: 9, name: '吴佳怡', email: 'wu@example.com', avatar: 'https://i.pravatar.cc/96?img=48', region: '南京', gender: '女', role: '运营', status: 'inactive', joinDate: '2024-02-14', progress: 41 },
  { id: 10, name: '郑子轩', email: 'zheng@example.com', avatar: 'https://i.pravatar.cc/96?img=15', region: '天津', gender: '男', role: '用户', status: 'active', joinDate: '2024-04-18', progress: 67 },
  { id: 11, name: '冯诗雨', email: 'feng@example.com', avatar: 'https://i.pravatar.cc/96?img=46', region: '重庆', gender: '女', role: '设计师', status: 'active', joinDate: '2024-01-30', progress: 89 },
  { id: 12, name: '蒋明轩', email: 'jiang@example.com', avatar: 'https://i.pravatar.cc/96?img=16', region: '苏州', gender: '男', role: '编辑', status: 'active', joinDate: '2024-03-08', progress: 74 },
];

export const MOCK_NEW_USERS: Array<{ name: string; region: string; gender: '男' | '女'; progress: number; avatar: string }> = [
  { name: '林晓薇', region: '上海', gender: '女', progress: 85, avatar: '林' },
  { name: '陈建国', region: '北京', gender: '男', progress: 72, avatar: '陈' },
  { name: '张雨欣', region: '广州', gender: '女', progress: 45, avatar: '张' },
  { name: '王浩然', region: '深圳', gender: '男', progress: 91, avatar: '王' },
  { name: '刘梦琪', region: '杭州', gender: '女', progress: 63, avatar: '刘' },
];

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 1, user: '林晓薇', action: '发布了新文章《漫剧创作技巧》', time: '2分钟前', avatar: '林', type: 'success' },
  { id: 2, user: '陈建国', action: '上传了 12 张插图素材', time: '18分钟前', avatar: '陈', type: 'info' },
  { id: 3, user: '系统', action: '完成了数据库备份', time: '1小时前', avatar: '系', type: 'success' },
  { id: 4, user: '张雨欣', action: '修改了个人资料', time: '2小时前', avatar: '张', type: 'info' },
  { id: 5, user: '王浩然', action: '登录异常，已发送验证邮件', time: '3小时前', avatar: '王', type: 'warning' },
];

export const MOCK_TODOS: TodoItem[] = [
  { id: 1, text: '审核新注册用户资料 (12人待审)', done: false, priority: 'high' },
  { id: 2, text: '更新系统安全补丁', done: false, priority: 'high' },
  { id: 3, text: '整理本月运营数据报告', done: true, priority: 'medium' },
  { id: 4, text: '设计新版用户引导流程', done: false, priority: 'medium' },
  { id: 5, text: '清理过期缓存文件', done: true, priority: 'low' },
];

export const MONTHLY_DATA = [
  { month: '1月', value: 4200 },
  { month: '2月', value: 3800 },
  { month: '3月', value: 5100 },
  { month: '4月', value: 4700 },
  { month: '5月', value: 6200 },
  { month: '6月', value: 5800 },
  { month: '7月', value: 7100 },
  { month: '8月', value: 6900 },
  { month: '9月', value: 8200 },
];

export const YEARLY_TREND = [
  { month: 'Jan', visits: 3200 },
  { month: 'Feb', visits: 4100 },
  { month: 'Mar', visits: 3800 },
  { month: 'Apr', visits: 5200 },
  { month: 'May', visits: 4900 },
  { month: 'Jun', visits: 6100 },
  { month: 'Jul', visits: 5800 },
  { month: 'Aug', visits: 7200 },
  { month: 'Sep', visits: 6900 },
  { month: 'Oct', visits: 8100 },
  { month: 'Nov', visits: 7600 },
  { month: 'Dec', visits: 9120 },
];

export const STAT_CARDS = [
  {
    title: '总用户数',
    value: '9,120',
    change: '+20%',
    positive: true,
    icon: 'Users',
  },
  {
    title: '月活跃用户',
    value: '3,842',
    change: '+12%',
    positive: true,
    icon: 'Activity',
  },
  {
    title: '本月收入',
    value: '¥128,000',
    change: '-3%',
    positive: false,
    icon: 'DollarSign',
  },
  {
    title: '新增内容',
    value: '1,247',
    change: '+35%',
    positive: true,
    icon: 'FileText',
  },
];
