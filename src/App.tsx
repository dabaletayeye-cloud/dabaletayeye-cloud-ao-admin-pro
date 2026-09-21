import { Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './hooks/useTheme';
import ThemeBackground from './components/ThemeBackground';
import { LocaleProvider } from './hooks/useLocale';
import LegacyTextLocalizer from './components/LegacyTextLocalizer';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import RolePage from './pages/RolePage';
import MenuPage from './pages/MenuPage';
import LogPage from './pages/LogPage';
import DictPage from './pages/DictPage';
import SystemConfigPage from './pages/SystemConfigPage';
import PermissionPage from './pages/PermissionPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AccountSecurityPage from './pages/AccountSecurityPage';
import ResultPage from './pages/ResultPage';
import ErrorPage from './pages/ErrorPage';
import SuccessPage from './pages/result/SuccessPage';
import FailPage from './pages/result/FailPage';
import Page403 from './pages/error/Page403';
import Page404 from './pages/error/Page404';
import Page500 from './pages/error/Page500';
import { moduleRoutes } from './generated/registry';
import { EditionProvider, useEdition } from './core/EditionProvider';
import { isEntryEnabled, isNewPreset, showDemoPages } from './core/edition';
import { toast } from './lib/localizedToast';

function AuthenticationExpiryRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const redirectToLogin = () => navigate('/login', { replace: true });
    window.addEventListener('ao-auth-required', redirectToLogin);
    return () => window.removeEventListener('ao-auth-required', redirectToLogin);
  }, [navigate]);
  return null;
}

function EditionRouteGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { config, loading } = useEdition();
  useEffect(() => {
    if (loading) return;
    const blocked = moduleRoutes.find(route => location.pathname === route.path || location.pathname.startsWith(`${route.path}/`));
    const hiddenDemo = isNewPreset(config.edition) && !showDemoPages(config)
      && /^\/(result|error)\//.test(location.pathname);
    if (hiddenDemo || blocked && !isEntryEnabled(blocked, config)) {
        toast.error('该模块在当前版本未启用');
        navigate('/', { replace: true });
    }
  }, [location.pathname, config, loading, navigate]);
  return null;
}

function AppRoutes() {
  const { filterRoutes } = useEdition();
  return (
        <BrowserRouter>
          <AuthenticationExpiryRedirect />
          <EditionRouteGuard />
          <Toaster position="top-right" richColors />
          <LegacyTextLocalizer />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/forgot-password" element={<LoginPage />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/system/users" element={<UsersPage />} />
            <Route path="/system/roles" element={<RolePage />} />
            <Route path="/system/menus" element={<MenuPage />} />
            <Route path="/system/logs" element={<LogPage />} />
            <Route path="/system/dict" element={<DictPage />} />
            <Route path="/system/config" element={<SystemConfigPage />} />
            <Route path="/permissions" element={<PermissionPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/account-security" element={<AccountSecurityPage />} />
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
            {filterRoutes(moduleRoutes).map(({ module, path, component: Component }) => (
              <Route key={`${module}:${path}`} path={path} element={<Suspense fallback={null}><Component /></Suspense>} />
            ))}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <ThemeBackground />
        <EditionProvider>
          <AppRoutes />
        </EditionProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
