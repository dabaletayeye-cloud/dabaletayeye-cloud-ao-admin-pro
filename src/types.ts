export type ThemeId = 'classic' | 'mono' | 'purple' | 'manga' | 'forest' | 'sunset' | 'glacier' | 'rose';
export type ThemeMode = 'light' | 'dark';
export type MenuLayout = 'vertical' | 'horizontal' | 'mixed' | 'double';
export type MenuStyle = 'light' | 'dark' | 'system';
export type BoxStyle = 'border' | 'shadow';
export type ContainerWidth = 'compact' | 'default' | 'loose';
export type CollapseButtonPosition = 'topbar' | 'sidebar-bottom' | 'sidebar-top';
export type ContentLayout = 'fluid' | 'fixed';
export type TabsStyle = 'default' | 'card' | 'chrome';
export type PageTransition = 'fade' | 'slide-left' | 'slide-up';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameEn: string;
  lightPrimary: string;
  darkPrimary: string;
  lightBg: string;
  darkBg: string;
  lightCard: string;
  darkCard: string;
  emoji: string;
  panelLightBg: string;
  panelDarkBg: string;
}

export const THEMES: ThemeConfig[] = [
  { id: 'classic', name: '经典蓝', nameEn: 'Classic Blue', lightPrimary: '#3B82F6', darkPrimary: '#60A5FA', lightBg: '#FFFFFF', darkBg: '#111827', lightCard: '#F9FAFB', darkCard: '#1F2937', emoji: '🔵', panelLightBg: '#FFFFFF', panelDarkBg: '#0F172A' },
  { id: 'mono', name: '极简黑白', nameEn: 'Minimal Mono', lightPrimary: '#1A1A1A', darkPrimary: '#FFFFFF', lightBg: '#FFFFFF', darkBg: '#000000', lightCard: '#FAFAFA', darkCard: '#1A1A1A', emoji: '⚫', panelLightBg: '#FFFFFF', panelDarkBg: '#000000' },
  { id: 'purple', name: '活力紫', nameEn: 'Vibrant Purple', lightPrimary: '#8B5CF6', darkPrimary: '#A78BFA', lightBg: '#F5F3FF', darkBg: '#0F0720', lightCard: '#FFFFFF', darkCard: '#1E1B4B', emoji: '💜', panelLightBg: '#FAF5FF', panelDarkBg: '#0F0720' },
  { id: 'manga', name: '漫剧工坊粉', nameEn: 'Manga Workshop', lightPrimary: '#E91E8C', darkPrimary: '#C084FC', lightBg: '#FFF0F5', darkBg: '#0D0B1A', lightCard: 'rgba(255,255,255,0.85)', darkCard: 'rgba(30,20,60,0.8)', emoji: '🌸', panelLightBg: '#FFF0F5', panelDarkBg: '#0D0B1A' },
  { id: 'forest', name: '森林绿', nameEn: 'Forest Green', lightPrimary: '#16A34A', darkPrimary: '#4ADE80', lightBg: '#F0FDF4', darkBg: '#052E16', lightCard: '#FFFFFF', darkCard: '#14532D', emoji: '🌿', panelLightBg: '#F0FDF4', panelDarkBg: '#052E16' },
  { id: 'sunset', name: '日落橙', nameEn: 'Sunset Orange', lightPrimary: '#F97316', darkPrimary: '#FB923C', lightBg: '#FFF7ED', darkBg: '#1C1208', lightCard: '#FFFFFF', darkCard: '#431407', emoji: '🌅', panelLightBg: '#FFF7ED', panelDarkBg: '#1C1208' },
  { id: 'glacier', name: '冰川蓝', nameEn: 'Glacier Blue', lightPrimary: '#06B6D4', darkPrimary: '#22D3EE', lightBg: '#ECFEFF', darkBg: '#082F49', lightCard: '#FFFFFF', darkCard: '#0C4A6E', emoji: '🧊', panelLightBg: '#ECFEFF', panelDarkBg: '#082F49' },
  { id: 'rose', name: '玫瑰金', nameEn: 'Rose Gold', lightPrimary: '#E11D48', darkPrimary: '#FB7185', lightBg: '#FFF1F2', darkBg: '#1A0A0E', lightCard: '#FFFFFF', darkCard: '#4C0519', emoji: '🌹', panelLightBg: '#FFF1F2', panelDarkBg: '#1A0A0E' },
];

export const ACCENT_COLORS = [
  { label: '蓝色', value: '#3B82F6' },
  { label: '黑色', value: '#1A1A1A' },
  { label: '紫色', value: '#8B5CF6' },
  { label: '粉色', value: '#E91E8C' },
  { label: '绿色', value: '#16A34A' },
  { label: '橙色', value: '#F97316' },
  { label: '青色', value: '#06B6D4' },
  { label: '红色', value: '#E11D48' },
];

export interface ThemeState {
  themeId: ThemeId;
  mode: ThemeMode;
  menuLayout: MenuLayout;
  menuStyle: MenuStyle;
  accentColor: string;
  boxStyle: BoxStyle;
  containerWidth: ContainerWidth;
  collapseButtonPosition: CollapseButtonPosition;
  contentLayout: ContentLayout;
  multiTabs: boolean;
  sidebarAccordion: boolean;
  showSidebarToggle: boolean;
  showQuickEntry: boolean;
  showReloadButton: boolean;
  showBreadcrumb: boolean;
  showLanguageSelector: boolean;
  showTopProgress: boolean;
  colorWeakMode: boolean;
  globalWatermark: boolean;
  sidebarWidth: number;
  tabsStyle: TabsStyle;
  pageTransition: PageTransition;
  cornerRadius: number;
}

export const DEFAULT_THEME: ThemeState = {
  themeId: 'classic',
  mode: 'light',
  menuLayout: 'vertical',
  menuStyle: 'system',
  accentColor: '#3B82F6',
  boxStyle: 'shadow',
  containerWidth: 'default',
  collapseButtonPosition: 'topbar',
  contentLayout: 'fluid',
  multiTabs: true,
  sidebarAccordion: true,
  showSidebarToggle: true,
  showQuickEntry: true,
  showReloadButton: true,
  showBreadcrumb: true,
  showLanguageSelector: true,
  showTopProgress: false,
  colorWeakMode: false,
  globalWatermark: false,
  sidebarWidth: 230,
  tabsStyle: 'default',
  pageTransition: 'slide-left',
  cornerRadius: 0.75,
};
