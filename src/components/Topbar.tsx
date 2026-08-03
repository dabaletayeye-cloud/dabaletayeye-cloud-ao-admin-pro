import React, { useState, useCallback, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
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
} from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';
import NotificationPanel from './NotificationPanel';
import AppLauncher from './AppLauncher';
import ChatAssistantPanel from './ChatAssistantPanel';

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
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = themeState.mode === 'dark';
  const primaryColor = 'var(--primary)';

  // Refresh button spin state
  const [spinning, setSpinning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'zh-CN' | 'en-US'>('zh-CN');
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
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

  const chooseLanguage = (nextLanguage: 'zh-CN' | 'en-US') => {
    setLanguage(nextLanguage);
    setLanguageMenuOpen(false);
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
            title="切换侧边栏"
          >
            <MenuIcon size={18} />
          </button>
        )}

        {/* ── Horizontal mode: brand mark ─────────────────── */}
        {showHorizontalNav && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginRight: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--primary-foreground)', fontWeight: 800 }}>
              AO
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>ao-admin-pro</span>
          </div>
        )}

        {/* ── Mixed mode: group tabs ───────────────────────── */}
        {showMixedNav && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, overflow: 'hidden', height: '100%' }}>
            {activeGroup ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: '100%', overflowX: 'auto' }}>
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)', paddingRight: 6, flexShrink: 0 }}>
                  {activeGroup.label}：
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
                      <span>{child.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>ao-admin-pro 管理系统</span>
            )}
          </div>
        )}

        {/* ── Search (middle filler) ───────────────────────── */}
        {!showMixedNav && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, maxWidth: showHorizontalNav ? 300 : 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', height: 34, flex: 1, cursor: 'pointer' }}>
              <SearchIcon size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--foreground)' }}>搜索…</span>
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
            title="刷新页面"
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
            title={isFullscreen ? '退出全屏' : '全屏显示'}
          >
            {isFullscreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
          </button>

          {/* Language preference */}
          {showLanguageSelector && <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLanguageMenuOpen(open => !open)}
              style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: languageMenuOpen ? 'var(--accent)' : 'transparent', border: 'none', cursor: 'pointer', color: languageMenuOpen ? 'var(--accent-foreground)' : 'var(--foreground)' }}
              title="语言偏好"
              aria-expanded={languageMenuOpen}
            >
              <LanguagesIcon size={16} />
            </button>
            {languageMenuOpen && (
              <div style={{ position: 'absolute', right: 0, top: 42, zIndex: 120, minWidth: 148, padding: 6, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--popover)', boxShadow: '0 10px 28px rgba(0,0,0,0.14)' }}>
                {([
                  ['zh-CN', '简体中文'],
                  ['en-US', 'English'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => chooseLanguage(value)}
                    className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    style={{ color: language === value ? 'var(--primary)' : 'var(--foreground)', fontWeight: language === value ? 700 : 400 }}
                  >
                    {label}
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
            title="系统设置"
          >
            <SettingsIcon size={16} />
          </button>

          {/* Theme panel */}
          <button
            onClick={onOpenThemePanel}
            style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--input)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--primary)', transition: 'background 0.2s' }}
            title="主题设置"
          >
            <SlidersIcon size={16} />
          </button>

          {/* Avatar */}
          <button
            onClick={() => navigate('/login')}
            title="切换账号"
            aria-label="切换账号"
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary-foreground)', cursor: 'pointer', marginLeft: 4, flexShrink: 0, border: 'none' }}
          >
            管
          </button>
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
