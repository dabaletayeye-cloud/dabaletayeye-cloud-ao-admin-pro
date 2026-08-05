import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../i18n';

export type AppLocale = 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'de-DE';

export type LanguageOption = {
  value: AppLocale;
  label: string;
  nativeLabel: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'zh-TW', label: '中文（繁體）', nativeLabel: '繁體中文' },
  { value: 'zh-CN', label: '中文（简体）', nativeLabel: '简体中文' },
  { value: 'en-US', label: '英语', nativeLabel: 'English' },
  { value: 'ja-JP', label: '日文', nativeLabel: '日本語' },
  { value: 'ko-KR', label: '韩文', nativeLabel: '한국어' },
  { value: 'fr-FR', label: '法语', nativeLabel: 'Français' },
  { value: 'de-DE', label: '德语', nativeLabel: 'Deutsch' },
];

const NAVIGATION_KEYS: Record<string, string> = {
  '工作台': 'workspace', '仪表盘': 'dashboard', '分析页': 'analyticsPage', '电子商务': 'ecommerce', '组件中心': 'components', '功能示例': 'examples', '模板中心': 'templates', '低代码中心': 'lowcode', 'AI中心': 'aiCenter', '内容管理': 'content', '结果页面': 'resultPages', '异常页面': 'errorPages', '数据分析': 'analytics', '媒体库': 'media', '营销工具': 'marketing', '订单管理': 'orders', '消息中心': 'messages', '系统管理': 'system', '用户管理': 'users', '角色管理': 'roles', '菜单管理': 'menus', '日志管理': 'logs', '字典管理': 'dictionaries', '系统配置': 'configuration', '服务器管理': 'servers', '文件管理': 'fileManager', '权限管理': 'permissions',
  '组件总览': 'componentOverview', '按钮组件': 'componentButtons', '表单组件': 'componentForms', '数据表格': 'componentTable', '弹窗反馈': 'componentFeedback', '数据展示': 'componentDisplay', '导航组件': 'componentNavigation', '图标库': 'componentIcons', '数字滚动': 'componentNumberRoll', '富文本编辑器': 'componentRichEditor', '图像裁剪': 'componentImageCrop', '二维码': 'componentQrCode', '视频播放器': 'componentVideoPlayer', '拖拽': 'componentDrag', '右键菜单': 'componentContextMenu', '水印': 'componentWatermark', '文字滚动': 'componentTextScroll', '礼花': 'componentConfetti', 'Excel 导入导出': 'componentExcel', '词云图': 'componentWordCloud', '前端权限': 'frontendPermissions', '标签页': 'tabsExample', '基础表格': 'basicTable', '高级表格': 'advancedTable', '搜索表单': 'searchForm', '左右布局表格': 'splitTable', 'Socket 连接': 'socket', '接口编排': 'lowcodeApi', '页面设计器': 'lowcodePage', '表单引擎': 'lowcodeForm', '报表引擎': 'lowcodeReport', '打印模板': 'lowcodePrint', '代码生成器': 'lowcodeGenerator', '数据源管理': 'lowcodeDatasource', '发布管理': 'lowcodeRelease', 'AI对话': 'aiChat', 'AI助手': 'aiAgent', 'AI客服': 'aiCustomerService', '知识库': 'knowledgeBase', '提示词模板': 'promptTemplates', '模型管理': 'modelManagement', 'AI工作流': 'aiWorkflow', '卡片': 'cardsTemplate', '横幅': 'bannersTemplate', '图表': 'chartsTemplate', '日历': 'calendarTemplate', '聊天': 'chatTemplate', '定价': 'pricingTemplate', '地图': 'mapTemplate', '访问统计': 'traffic', '用户画像': 'portrait', '转化漏斗': 'funnel',
};

function asLocale(language: string): AppLocale {
  return LANGUAGE_OPTIONS.some((option) => option.value === language) ? language as AppLocale : 'zh-CN';
}

const EXTRA_NAVIGATION_KEYS: Record<string, string> = {
  '表单': 'formsExample',
  '地图模板': 'mapTemplate',
  '成功页': 'successPage',
  '失败页': 'failurePage',
  '403 无权限': 'error403',
  '404 不存在': 'error404',
  '500 服务异常': 'error500',
  '优惠券': 'coupons',
  '活动管理': 'activities',
  '推送通知': 'pushNotifications',
  '文章卡片': 'articleCards',
  '文章发布': 'articlePublish',
  '文章列表': 'articleList',
  '分类管理': 'categoryManagement',
  '标签管理': 'tagManagement',
  '卡片': 'cardsTemplate',
  '横幅': 'bannersTemplate',
  '图表': 'chartsTemplate',
  '日历': 'calendarTemplate',
  '聊天': 'chatTemplate',
  '定价': 'pricingTemplate',
  '仪表盘': 'dashboard',
  '电子商务': 'ecommerce',
  '字典管理': 'dictionaries',
  '服务器管理': 'servers',
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export function useLocale() {
  const { t, i18n: instance } = useTranslation();
  const locale = asLocale(instance.resolvedLanguage ?? instance.language);

  return {
    locale,
    setLocale: (nextLocale: AppLocale) => void instance.changeLanguage(nextLocale),
    t,
    language: LANGUAGE_OPTIONS.find((option) => option.value === locale) ?? LANGUAGE_OPTIONS[1],
  };
}

export function localizeNavLabel(label: string, locale: AppLocale): string {
  const key = NAVIGATION_KEYS[label] ?? EXTRA_NAVIGATION_KEYS[label];
  return key ? i18n.t(`navigation.${key}`, { lng: locale, defaultValue: label }) : label;
}
