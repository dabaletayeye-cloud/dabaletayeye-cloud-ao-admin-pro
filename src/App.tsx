import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { LocaleProvider } from './hooks/useLocale';
import { Toaster } from 'sonner';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ArticleListPage from './pages/ArticleListPage';
import CategoryPage from './pages/CategoryPage';
import TagPage from './pages/TagPage';
import VisitStatsPage from './pages/VisitStatsPage';
import UserPortraitPage from './pages/UserPortraitPage';
import FunnelPage from './pages/FunnelPage';
import MediaPage from './pages/MediaPage';
import CouponPage from './pages/CouponPage';
import ActivityPage from './pages/ActivityPage';
import PushPage from './pages/PushPage';
import UsersPage from './pages/UsersPage';
import OrderPage from './pages/OrderPage';
import MessagePage from './pages/MessagePage';
import RolePage from './pages/RolePage';
import MenuPage from './pages/MenuPage';
import LogPage from './pages/LogPage';
import DictPage from './pages/DictPage';
import SystemConfigPage from './pages/SystemConfigPage';
import ResultPage from './pages/ResultPage';
import ErrorPage from './pages/ErrorPage';
import ServerPage from './pages/ServerPage';
import PermissionPage from './pages/PermissionPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AccountSecurityPage from './pages/AccountSecurityPage';
/* CLEAN_DEMO_START: components:imports */
import OverviewPage from './pages/comp/OverviewPage';
import ButtonsPage from './pages/comp/ButtonsPage';
import FormsPage from './pages/comp/FormsPage';
import DataTablePage from './pages/comp/DataTablePage';
import FeedbackPage from './pages/comp/FeedbackPage';
import DisplayPage from './pages/comp/DisplayPage';
import NavPage from './pages/comp/NavPage';
import IconsPage from './pages/comp/IconsPage';
import NumberRollPage from './pages/comp/NumberRollPage';
import RichEditorPage from './pages/comp/RichEditorPage';
import ImageCropPage from './pages/comp/ImageCropPage';
import QrCodePage from './pages/comp/QrCodePage';
import VideoPlayerPage from './pages/comp/VideoPlayerPage';
import DragPage from './pages/comp/DragPage';
import ContextMenuPage from './pages/comp/ContextMenuPage';
import WatermarkPage from './pages/comp/WatermarkPage';
import TextScrollPage from './pages/comp/TextScrollPage';
import ConfettiPage from './pages/comp/ConfettiPage';
import ExcelPage from './pages/comp/ExcelPage';
import WordCloudPage from './pages/comp/WordCloudPage';
/* CLEAN_DEMO_END: components:imports */
/* CLEAN_DEMO_START: templates:imports */
import CardPage from './pages/tmpl/CardPage';
import BannerPage from './pages/tmpl/BannerPage';
import ChartPage from './pages/tmpl/ChartPage';
import CalendarPage from './pages/tmpl/CalendarPage';
import ChatPage from './pages/tmpl/ChatPage';
import PricingPage from './pages/tmpl/PricingPage';
import MapPage from './pages/tmpl/MapPage';
/* CLEAN_DEMO_END: templates:imports */
import ArticleGridPage from './pages/article/ArticleGridPage';
import ArticlePublishPage from './pages/article/ArticlePublishPage';
import DashboardAnalyticsPage from './pages/dashboard/DashboardAnalyticsPage';
import EcommercePage from './pages/dashboard/EcommercePage';
import SuccessPage from './pages/result/SuccessPage';
import FailPage from './pages/result/FailPage';
import Page403 from './pages/error/Page403';
import Page404 from './pages/error/Page404';
import Page500 from './pages/error/Page500';
/* CLEAN_DEMO_START: examples:imports */
import BasicTableExamplePage from './pages/examples/BasicTableExamplePage';
import FrontendPermissionExamplePage from './pages/examples/FrontendPermissionExamplePage';
import SearchFormExamplePage from './pages/examples/SearchFormExamplePage';
import SplitTableExamplePage from './pages/examples/SplitTableExamplePage';
import SocketExamplePage from './pages/examples/SocketExamplePage';
/* CLEAN_DEMO_END: examples:imports */

export default function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/content/articles" element={<ArticleListPage />} />
          <Route path="/content/categories" element={<CategoryPage />} />
          <Route path="/content/tags" element={<TagPage />} />
          <Route path="/analytics/traffic" element={<VisitStatsPage />} />
          <Route path="/analytics/portrait" element={<UserPortraitPage />} />
          <Route path="/analytics/funnel" element={<FunnelPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/marketing/coupons" element={<CouponPage />} />
          <Route path="/marketing/events" element={<ActivityPage />} />
          <Route path="/marketing/push" element={<PushPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/system/users" element={<UsersPage />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/messages" element={<MessagePage />} />
          <Route path="/system/roles" element={<RolePage />} />
          <Route path="/system/menus" element={<MenuPage />} />
          <Route path="/system/logs" element={<LogPage />} />
          <Route path="/system/dict" element={<DictPage />} />
          <Route path="/system/config" element={<SystemConfigPage />} />
          <Route path="/system/servers" element={<ServerPage />} />
          <Route path="/permissions" element={<PermissionPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/account-security" element={<AccountSecurityPage />} />
          {/* CLEAN_DEMO_START: components:routes */}
          <Route path="/comp/overview" element={<OverviewPage />} />
          <Route path="/comp/buttons" element={<ButtonsPage />} />
          <Route path="/comp/forms" element={<FormsPage />} />
          <Route path="/comp/table" element={<DataTablePage />} />
          <Route path="/comp/feedback" element={<FeedbackPage />} />
          <Route path="/comp/display" element={<DisplayPage />} />
          <Route path="/comp/nav" element={<NavPage />} />
          <Route path="/comp/icons" element={<IconsPage />} />
          <Route path="/comp/number-roll" element={<NumberRollPage />} />
          <Route path="/comp/rich-editor" element={<RichEditorPage />} />
          <Route path="/comp/image-crop" element={<ImageCropPage />} />
          <Route path="/comp/qrcode" element={<QrCodePage />} />
          <Route path="/comp/video-player" element={<VideoPlayerPage />} />
          <Route path="/comp/drag" element={<DragPage />} />
          <Route path="/comp/context-menu" element={<ContextMenuPage />} />
          <Route path="/comp/watermark" element={<WatermarkPage />} />
          <Route path="/comp/text-scroll" element={<TextScrollPage />} />
          <Route path="/comp/confetti" element={<ConfettiPage />} />
          <Route path="/comp/excel" element={<ExcelPage />} />
          <Route path="/comp/word-cloud" element={<WordCloudPage />} />
          {/* CLEAN_DEMO_END: components:routes */}
          {/* CLEAN_DEMO_START: examples:routes */}
          <Route path="/examples/permissions" element={<FrontendPermissionExamplePage />} />
          <Route path="/examples/tabs" element={<NavPage />} />
          <Route path="/examples/basic-table" element={<BasicTableExamplePage />} />
          <Route path="/examples/advanced-table" element={<DataTablePage />} />
          <Route path="/examples/forms" element={<FormsPage />} />
          <Route path="/examples/search-form" element={<SearchFormExamplePage />} />
          <Route path="/examples/split-table" element={<SplitTableExamplePage />} />
          <Route path="/examples/socket" element={<SocketExamplePage />} />
          {/* CLEAN_DEMO_END: examples:routes */}
          {/* CLEAN_DEMO_START: templates:routes */}
          <Route path="/tmpl/cards" element={<CardPage />} />
          <Route path="/tmpl/banners" element={<BannerPage />} />
          <Route path="/tmpl/charts" element={<ChartPage />} />
          <Route path="/tmpl/calendar" element={<CalendarPage />} />
          <Route path="/tmpl/chat" element={<ChatPage />} />
          <Route path="/tmpl/pricing" element={<PricingPage />} />
          <Route path="/tmpl/map" element={<MapPage />} />
          {/* CLEAN_DEMO_END: templates:routes */}
          <Route path="/article/list" element={<ArticleGridPage />} />
          <Route path="/article/publish" element={<ArticlePublishPage />} />
          <Route path="/dashboard/analytics" element={<DashboardAnalyticsPage />} />
          <Route path="/dashboard/ecommerce" element={<EcommercePage />} />
          <Route path="/result/success" element={<ResultPage />} />
          <Route path="/result/success-page" element={<SuccessPage />} />
          <Route path="/result/fail-page" element={<FailPage />} />
          <Route path="/result/fail" element={<ResultPage />} />
          <Route path="/error/403" element={<ErrorPage />} />
          <Route path="/error/403-page" element={<Page403 />} />
          <Route path="/error/404" element={<ErrorPage />} />
          <Route path="/error/404-page" element={<Page404 />} />
          <Route path="/error/500" element={<ErrorPage />} />
          <Route path="/error/500-page" element={<Page500 />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </LocaleProvider>
  );
}
