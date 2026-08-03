// ─────────────────────────────────────────────────────────────
//  mapData.ts  — mock regional data for China / World map pages
// ─────────────────────────────────────────────────────────────

export interface RegionData {
  name: string;
  value: number;
  /** optional second metric (e.g. growth rate %) */
  growth?: number;
}

// China province data (value = 访问量, unit: 万次)
export const CHINA_DATA: RegionData[] = [
  { name: '广东', value: 9820, growth: 12.4 },
  { name: '北京', value: 8540, growth: 8.1 },
  { name: '上海', value: 7890, growth: 9.6 },
  { name: '浙江', value: 6730, growth: 14.2 },
  { name: '江苏', value: 6250, growth: 7.8 },
  { name: '四川', value: 4380, growth: 18.3 },
  { name: '湖北', value: 3920, growth: 11.7 },
  { name: '湖南', value: 3510, growth: 10.2 },
  { name: '山东', value: 3290, growth: 6.5 },
  { name: '福建', value: 3100, growth: 15.8 },
  { name: '河南', value: 2870, growth: 5.3 },
  { name: '陕西', value: 2640, growth: 13.1 },
  { name: '重庆', value: 2530, growth: 16.4 },
  { name: '安徽', value: 2210, growth: 9.0 },
  { name: '河北', value: 2040, growth: 4.7 },
  { name: '辽宁', value: 1890, growth: 3.2 },
  { name: '云南', value: 1750, growth: 20.5 },
  { name: '江西', value: 1620, growth: 8.8 },
  { name: '山西', value: 1470, growth: 2.1 },
  { name: '广西', value: 1390, growth: 11.0 },
  { name: '黑龙江', value: 1240, growth: 1.5 },
  { name: '贵州', value: 1180, growth: 22.7 },
  { name: '吉林', value: 1050, growth: 2.8 },
  { name: '天津', value: 980, growth: 5.1 },
  { name: '内蒙古', value: 870, growth: 7.6 },
  { name: '新疆', value: 760, growth: 14.9 },
  { name: '海南', value: 720, growth: 25.3 },
  { name: '甘肃', value: 680, growth: 6.2 },
  { name: '宁夏', value: 520, growth: 9.4 },
  { name: '西藏', value: 340, growth: 30.1 },
  { name: '青海', value: 290, growth: 12.8 },
  { name: '台湾', value: 1540, growth: 8.3 },
  { name: '香港', value: 960, growth: 4.6 },
  { name: '澳门', value: 410, growth: 3.9 },
];

// World country data (value = 访问量, unit: 万次)
export const WORLD_DATA: RegionData[] = [
  { name: 'China', value: 98200, growth: 12.4 },
  { name: 'United States', value: 72400, growth: 6.8 },
  { name: 'Japan', value: 31500, growth: 4.2 },
  { name: 'Germany', value: 24800, growth: 5.1 },
  { name: 'United Kingdom', value: 22100, growth: 4.7 },
  { name: 'France', value: 19300, growth: 3.9 },
  { name: 'South Korea', value: 18700, growth: 9.1 },
  { name: 'India', value: 17900, growth: 28.4 },
  { name: 'Brazil', value: 14200, growth: 15.7 },
  { name: 'Canada', value: 12800, growth: 5.3 },
  { name: 'Australia', value: 11500, growth: 7.2 },
  { name: 'Russia', value: 10200, growth: 2.1 },
  { name: 'Italy', value: 9800, growth: 3.4 },
  { name: 'Spain', value: 8700, growth: 4.1 },
  { name: 'Netherlands', value: 7900, growth: 6.5 },
  { name: 'Singapore', value: 7200, growth: 11.8 },
  { name: 'Mexico', value: 6800, growth: 12.3 },
  { name: 'Sweden', value: 5400, growth: 4.9 },
  { name: 'Switzerland', value: 5100, growth: 5.7 },
  { name: 'Belgium', value: 4800, growth: 3.8 },
  { name: 'Poland', value: 4500, growth: 9.6 },
  { name: 'Argentina', value: 4200, growth: 14.2 },
  { name: 'Indonesia', value: 3900, growth: 22.1 },
  { name: 'Thailand', value: 3600, growth: 18.5 },
  { name: 'Malaysia', value: 3300, growth: 16.7 },
  { name: 'Vietnam', value: 3000, growth: 25.3 },
  { name: 'Turkey', value: 2800, growth: 8.4 },
  { name: 'Saudi Arabia', value: 2600, growth: 11.2 },
  { name: 'South Africa', value: 2300, growth: 7.8 },
  { name: 'Egypt', value: 2100, growth: 9.3 },
  { name: 'Nigeria', value: 1900, growth: 18.6 },
  { name: 'Pakistan', value: 1700, growth: 14.1 },
  { name: 'Ukraine', value: 1500, growth: 2.3 },
  { name: 'Romania', value: 1300, growth: 7.4 },
  { name: 'Czech Republic', value: 1100, growth: 5.2 },
  { name: 'Portugal', value: 980, growth: 6.8 },
  { name: 'Norway', value: 870, growth: 4.6 },
  { name: 'Denmark', value: 810, growth: 4.1 },
  { name: 'Finland', value: 750, growth: 3.9 },
  { name: 'New Zealand', value: 690, growth: 6.3 },
  { name: 'Chile', value: 620, growth: 10.5 },
  { name: 'Colombia', value: 580, growth: 13.7 },
  { name: 'Philippines', value: 540, growth: 21.4 },
  { name: 'Bangladesh', value: 490, growth: 16.8 },
  { name: 'Greece', value: 450, growth: 3.2 },
  { name: 'Israel', value: 420, growth: 7.9 },
  { name: 'UAE', value: 390, growth: 13.4 },
  { name: 'Morocco', value: 310, growth: 9.8 },
  { name: 'Peru', value: 280, growth: 11.6 },
  { name: 'Iraq', value: 240, growth: 5.4 },
];

// Color gradient stops for choropleth — light theme
export const MAP_LIGHT_COLORS = ['#EFF6FF', '#93C5FD', '#3B82F6', '#1D4ED8', '#1E3A8A'];
// Dark theme
export const MAP_DARK_COLORS  = ['#1E293B', '#1D4ED8', '#3B82F6', '#60A5FA', '#BFDBFE'];

// Manga theme (pink-rose gradient)
export const MAP_MANGA_COLORS = ['#FDF2F8', '#F9A8D4', '#EC4899', '#BE185D', '#831843'];
// Manga dark
export const MAP_MANGA_DARK_COLORS = ['#1C1015', '#831843', '#BE185D', '#EC4899', '#F9A8D4'];
