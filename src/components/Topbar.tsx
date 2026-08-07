import React, { useState, useCallback, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { toast } from '../lib/localizedToast';
import { useTheme } from '../hooks/useTheme';
import { LANGUAGE_OPTIONS, localizeNavLabel, type AppLocale, useLocale } from '../hooks/useLocale';
import {
  MenuIcon,
  SunIcon,
  MoonIcon,
  SlidersIcon,
  SearchIcon,
  RefreshCwIcon,
  LanguagesIcon,
  MaximizeIcon,
  MinimizeIcon,
  MessageSquareIcon,
  SettingsIcon,
  UserRoundIcon,
  LogOutIcon,
  ShieldCheckIcon,
  BellIcon,
  CircleHelpIcon,
} from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';
import NotificationPanel from './NotificationPanel';
import AppLauncher from './AppLauncher';
import ChatAssistantPanel from './ChatAssistantPanel';
import { getCurrentAccount } from '../lib/currentAccount';
import appConfig from '../config/app.json';

interface TopbarProps {
  onOpenThemePanel?: () => void;
  onToggleSidebar?: () => void;
  showHorizontalNav?: boolean;
  showMixedNav?: boolean;
  showToggle?: boolean;
  showQuickEntry?: boolean;
  showReloadButton?: boolean;
  showLanguageSelector?: boolean;
  showTopProgress?: boolean;
}

export default function Topbar({
  onOpenThemePanel  = () => {},
  onToggleSidebar   = () => {},
  showHorizontalNav = false,
  showMixedNav      = false,
  showToggle        = true,
  showQuickEntry = true,
  showReloadButton = true,
  showLanguageSelector = true,
  showTopProgress = false,
}: TopbarProps) {
  const { themeState, setMode } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = themeState.mode === 'dark';
  const primaryColor = 'var(--primary)';

  // Refresh button spin state
  const [spinning, setSpinning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(getCurrentAccount);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  useEffect(() => {
    const syncCurrentAccount = () => {
      setCurrentAccount(getCurrentAccount());
      setAvatarFailed(false);
    };
    window.addEventListener('ao-current-account-change', syncCurrentAccount);
    return () => window.removeEventListener('ao-current-account-change', syncCurrentAccount);
  }, []);

  const handleRefresh = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    // Simple page data refresh simulation — reload after 600ms spin
    setTimeout(() => {
      window.location.reload();
    }, 600);
  }, [spinning]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Browsers can reject fullscreen when it is blocked by page settings.
    }
  };

  const chooseLanguage = (nextLanguage: AppLocale) => {
    setLocale(nextLanguage);
    setLanguageMenuOpen(false);
    const selected = LANGUAGE_OPTIONS.find((option) => option.value === nextLanguage);
    toast.success(`${t('languageChanged')}：${selected?.nativeLabel ?? nextLanguage}`);
  };

  type NavGroup = { type: 'group'; icon: React.ReactNode; label: string; children: { label: string; path: string; icon: React.ReactNode }[] };

  const activeGroup = NAV_ITEMS.find(
    item =>
      item.type === 'group' &&
      (item as NavGroup).children.some(c => location.pathname === c.path),
  ) as NavGroup | undefined;

  return (
    <>
      {/* Inject spin keyframes into <head> once */}
      <style>{`
        @keyframes topbar-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .topbar-refresh-icon.spinning {
          animation: topbar-spin 0.6s linear;
        }
        @keyframes topbar-progress {
          0% { transform: translateX(-100%); }
          45% { transform: translateX(35%); }
          100% { transform: translateX(180%); }
        }
        .topbar-progress-indicator {
          animation: topbar-progress 1.6s ease-in-out infinite;
        }
      `}</style>

      <header
        data-cmp="Topbar"
        style={{
          height:       '64px',
          flexShrink:   0,
          display:      'flex',
          alignItems:   'center',
          padding:      '0 16px',
          borderBottom: '1px solid var(--border)',
          background:   'var(--card)',
          transition:   'background 0.4s, border-color 0.4s',
          zIndex:       100,
          gap:          '8px',
          position:     'relative',
        }}
      >
        {/* ── Hamburger: only when showToggle === true ─── */}
        {showToggle && !showHorizontalNav && (
          <button
            onClick={onToggleSidebar}
            style={{
              width:           38,
              height:          38,
              borderRadius:    8,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              background:      'transparent',
              border:          'none',
              cursor:          'pointer',
              color:           'var(--foreground)',
              flexShrink:      0,
              transition:      'background 0.2s',
            }}
            title={t('sidebarCollapse')}
          >
            <MenuIcon size={18} />
          </button>
        )}

        {/* ── Horizontal mode: brand mark ─────────────────── */}
        {showHorizontalNav && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginRight: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--primary-foreground)', fontWeight: 800 }}>
              {appConfig.brand.shortName}
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>{appConfig.brand.name}</span>
          </div>
        )}

        {/* ── Mixed mode: group tabs ───────────────────────── */}
        {showMixedNav && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, overflow: 'hidden', height: '100%' }}>
            {activeGroup ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: '100%', overflowX: 'auto' }}>
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)', paddingRight: 6, flexShrink: 0 }}>
                  {localizeNavLabel(activeGroup.label, locale)}：
                </span>
                {activeGroup.children.map(child => {
                  const isActive = location.pathname === child.path;
                  return (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      style={{
                        display:     'flex',
                        alignItems:  'center',
                        gap:         5,
                        padding:     '0 10px',
                        height:      '100%',
                        fontSize:    12,
                        fontWeight:  isActive ? 700 : 400,
                        color:       isActive ? primaryColor : 'var(--foreground)',
                        textDecoration: 'none',
                        borderBottom: isActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                        borderTop:    '2px solid transparent',
                        transition:   'all 0.2s',
                        whiteSpace:   'nowrap',
                        flexShrink:   0,
                        background:   'transparent',
                      }}
                    >
                      {child.icon}
                      <span>{localizeNavLabel(child.label, locale)}</span>
                    </NavLink>
                  );
                })}
              </div>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{appConfig.brand.name} {t('systemSettings')}</span>
            )}
          </div>
        )}

        {/* ── Search (middle filler) ───────────────────────── */}
        {!showMixedNav && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, maxWidth: showHorizontalNav ? 300 : 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', height: 34, flex: 1, cursor: 'pointer' }}>
              <SearchIcon size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--foreground)' }}>{t('search')}</span>
            </div>
          </div>
        )}

        {/* ── Right actions ────────────────────────────────── */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>

          {/* Refresh button */}
          {showReloadButton && <button
            onClick={handleRefresh}
            onAnimationEnd={() => setSpinning(false)}
            style={{
              width: 36, height: 36, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none',
              cursor: spinning ? 'not-allowed' : 'pointer',
              color: 'var(--foreground)',
              transition: 'background 0.2s',
            }}
            title={t('refreshPage')}
          >
            <RefreshCwIcon
              size={15}
              className={`topbar-refresh-icon${spinning ? ' spinning' : ''}`}
            />
          </button>}

          {/* App Launcher (九宫格) */}
          {showQuickEntry && <AppLauncher />}

          {/* Fullscreen */}
          <button
            onClick={() => { void toggleFullscreen(); }}
            style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}
            title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
          >
            {isFullscreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
          </button>

          {/* Language preference */}
          {showLanguageSelector && <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLanguageMenuOpen(open => !open)}
              style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: languageMenuOpen ? 'var(--accent)' : 'transparent', border: 'none', cursor: 'pointer', color: languageMenuOpen ? 'var(--accent-foreground)' : 'var(--foreground)' }}
              title={t('languagePreference')}
              aria-label={t('languagePreference')}
              aria-expanded={languageMenuOpen}
            >
              <LanguagesIcon size={16} />
            </button>
            {languageMenuOpen && (
              <div role="menu" aria-label={t('languagePreference')} style={{ position: 'absolute', right: 0, top: 42, zIndex: 120, minWidth: 184, padding: 6, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--popover)', boxShadow: '0 10px 28px rgba(0,0,0,0.14)' }}>
                {LANGUAGE_OPTIONS.map(({ value, label, nativeLabel }) => (
                  <button
                    key={value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={locale === value}
                    onClick={() => chooseLanguage(value)}
                    className="flex w-full items-center justify-between gap-4 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    style={{ color: locale === value ? 'var(--primary)' : 'var(--foreground)', fontWeight: locale === value ? 700 : 400 }}
                  >
                    <span>{nativeLabel}</span>
                    <small style={{ color: locale === value ? 'var(--primary)' : 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}>{label}</small>
                  </button>
                ))}
              </div>
            )}
          </div>}

          {/* Dark mode toggle */}
          <button
            onClick={() => setMode(isDark ? 'light' : 'dark')}
            style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}
            title={isDark ? '切换亮色' : '切换暗色'}
          >
            {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>

          {/* Bell / Notification Panel */}
          <NotificationPanel />

          {/* Chat assistant */}
          <button
            onClick={() => setAssistantOpen(true)}
            style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: assistantOpen ? 'var(--accent)' : 'transparent', border: 'none', cursor: 'pointer', color: assistantOpen ? 'var(--primary)' : 'var(--foreground)' }}
            title="AO 助手"
          >
            <MessageSquareIcon size={16} />
          </button>

          {/* System settings shortcut */}
          <button
            onClick={() => navigate('/settings')}
            style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: location.pathname === '/settings' ? 'var(--accent)' : 'transparent', border: 'none', cursor: 'pointer', color: location.pathname === '/settings' ? 'var(--primary)' : 'var(--foreground)' }}
            title={t('systemSettings')}
          >
            <SettingsIcon size={16} />
          </button>

          {/* Theme panel */}
          <button
            onClick={onOpenThemePanel}
            style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--input)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--primary)', transition: 'background 0.2s' }}
            title={t('themeSettings')}
          >
            <SlidersIcon size={16} />
          </button>

          {/* Account menu */}
          <div style={{ position: 'relative', marginLeft: 4 }}>
            <button
              type="button"
              onClick={() => {
                setAccountMenuOpen(open => !open);
                setLanguageMenuOpen(false);
              }}
              title={t('accountMenu')}
              aria-label={t('accountMenu')}
              aria-expanded={accountMenuOpen}
              style={{ width: 36, height: 36, borderRadius: 10, background: accountMenuOpen ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, border: accountMenuOpen ? '1px solid var(--primary)' : '1px solid transparent', overflow: 'hidden', padding: 0 }}
            >
              {!avatarFailed && currentAccount.avatar ? (
                <img
                  src={currentAccount.avatar}
                  alt={currentAccount.name + '的头像'}
                  onError={() => setAvatarFailed(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary-foreground)' }}>
                  {currentAccount.name.trim().charAt(0) || '管'}
                </span>
              )}
            </button>

            {accountMenuOpen && (
              <div
                role="menu"
                aria-label={t('accountMenu')}
                style={{ position: 'absolute', right: 0, top: 44, zIndex: 150, width: 250, padding: 8, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--popover)', boxShadow: '0 14px 32px rgba(0,0,0,0.16)' }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    navigate('/profile');
                  }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 11, padding: 10, color: 'var(--foreground)', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: 42, height: 42, flexShrink: 0, overflow: 'hidden', borderRadius: '50%', background: 'var(--primary)', color: 'var(--primary-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {!avatarFailed && currentAccount.avatar ? (
                      <img src={currentAccount.avatar} alt="" onError={() => setAvatarFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : currentAccount.name.trim().charAt(0) || '管'}
                  </div>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <strong style={{ display: 'block', overflow: 'hidden', fontSize: 14, fontWeight: 700, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentAccount.name}</strong>
                    <small style={{ display: 'block', marginTop: 3, overflow: 'hidden', color: 'var(--muted-foreground)', fontSize: 12, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentAccount.email}</small>
                  </span>
                </button>
                <div style={{ height: 1, margin: '4px 2px', background: 'var(--border)' }} />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    navigate('/profile');
                  }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '10px 11px', color: 'var(--foreground)', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13 }}
                  onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--accent)'; }}
                  onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
                >
                  <UserRoundIcon size={16} color="var(--primary)" />
                  {t('profile')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    navigate('/account-security');
                  }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '10px 11px', color: 'var(--foreground)', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13 }}
                  onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--accent)'; }}
                  onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
                >
                  <ShieldCheckIcon size={16} color="var(--primary)" />
                  {t('accountSecurity')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    navigate('/messages');
                  }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '10px 11px', color: 'var(--foreground)', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13 }}
                  onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--accent)'; }}
                  onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
                >
                  <BellIcon size={16} color="var(--primary)" />
                  {t('messageCenter')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setAssistantOpen(true);
                  }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '10px 11px', color: 'var(--foreground)', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13 }}
                  onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--accent)'; }}
                  onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
                >
                  <CircleHelpIcon size={16} color="var(--primary)" />
                  {t('helpFeedback')}
                </button>
                <div style={{ height: 1, margin: '4px 2px', background: 'var(--border)' }} />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    toast.success(t('signOut'));
                    navigate('/login');
                  }}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 3, padding: '9px 11px', color: 'var(--foreground)', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                  <LogOutIcon size={15} />
                  {t('signOut')}
                </button>
              </div>
            )}
          </div>
        </div>
        {showTopProgress && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, overflow: 'hidden', pointerEvents: 'none' }}>
            <div className="topbar-progress-indicator" style={{ width: '42%', height: '100%', background: 'var(--primary)' }} />
          </div>
        )}
      </header>
      <ChatAssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}
