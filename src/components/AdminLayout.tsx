import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import Sidebar from './Sidebar';
import HorizontalNav from './HorizontalNav';
import Topbar from './Topbar';
import ThemePanel from './ThemePanel';
import { BreadcrumbTrail, PageTabs } from './NavigationExtras';
import LocalizedText from './LocalizedText';
import { useLocale } from '../hooks/useLocale';
import appConfig from '../config/app.json';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children = null }: AdminLayoutProps) {
  const { themeState } = useTheme();
  const { t } = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  const [themePanelOpen, setThemePanelOpen] = useState(false);

  const menuLayout = themeState.menuLayout;
  const collapseButtonPosition = themeState.collapseButtonPosition;
  const { contentLayout, multiTabs, showSidebarToggle, showQuickEntry, showReloadButton, showBreadcrumb, showLanguageSelector, showTopProgress, globalWatermark, sidebarWidth, tabsStyle, pageTransition } = themeState;

  const isVertical   = menuLayout === 'vertical';
  const isHorizontal = menuLayout === 'horizontal';
  const isMixed      = menuLayout === 'mixed';
  const isDouble     = menuLayout === 'double';

  const showSidebar = !isHorizontal;

  // In mixed / double: icon-only collapsed view; in vertical: honour toggle
  const effectiveCollapsed = isMixed ? true : (isDouble ? false : collapsed);
  // double uses its own internal double-column rendering

  const containerPaddingMap: Record<string, string> = {
    compact: '16px',
    default: '24px',
    loose:   '32px',
  };
  const mainPadding = containerPaddingMap[themeState.containerWidth] ?? '24px';

  // Hamburger in topbar only when: vertical layout AND collapseButtonPosition === 'topbar'
  const showTopbarToggle = isVertical && collapseButtonPosition === 'topbar' && showSidebarToggle;

  const handleToggleSidebar = () => {
    if (isVertical) setCollapsed(prev => !prev);
  };

  return (
    <div
      data-cmp="AdminLayout"
      style={{
        display:       'flex',
        flexDirection: 'row',
        height:        '100vh',
        width:         '100%',
        overflow:      'hidden',
        background:    'var(--background)',
        color:         'var(--foreground)',
      }}
    >
      {/* ── Left: Sidebar (all layouts except horizontal) ── */}
      <div
        style={{
          display:    showSidebar ? 'flex' : 'none',
          flexShrink: 0,
          height:     '100%',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          zIndex:     50,
        }}
      >
        <Sidebar
          collapsed={effectiveCollapsed}
          doubleColumn={isDouble}
          collapseButtonPosition={isVertical ? collapseButtonPosition : 'topbar'}
          onToggle={handleToggleSidebar}
          showToggle={showSidebarToggle}
          sidebarWidth={sidebarWidth}
        />
      </div>

      {/* ── Right: vertical stack (Topbar + [HorizontalNav?] + main content) ── */}
      <div
        style={{
          display:       'flex',
          flexDirection: 'column',
          flex:          1,
          overflow:      'hidden',
          minWidth:      0,
        }}
      >
        {/* Topbar */}
        <Topbar
          onOpenThemePanel={() => setThemePanelOpen(true)}
          onToggleSidebar={handleToggleSidebar}
          showHorizontalNav={isHorizontal}
          showMixedNav={isMixed}
          showToggle={showTopbarToggle}
          showQuickEntry={showQuickEntry}
          showReloadButton={showReloadButton}
          showLanguageSelector={showLanguageSelector}
          showTopProgress={showTopProgress}
        />

        {showBreadcrumb && <BreadcrumbTrail />}

        {multiTabs && <PageTabs style={tabsStyle} />}

        {/* Horizontal-only secondary nav row */}
        <div
          style={{
            display:      isHorizontal ? 'flex' : 'none',
            height:       '40px',
            flexShrink:   0,
            background:   'var(--card)',
            borderBottom: '1px solid var(--border)',
            alignItems:   'center',
            paddingLeft:  '16px',
          }}
        >
          <HorizontalNav />
        </div>

        {/* Main content area */}
        <main
          className="main-content"
          style={{
            flex:       1,
            overflowY:  'auto',
            overflowX:  'hidden',
            padding:    mainPadding,
            transition: 'padding 0.3s ease',
            background: 'var(--background)',
          }}
        >
          <div className={`page-transition-${pageTransition}`} style={{ width: '100%', maxWidth: contentLayout === 'fixed' ? '1440px' : 'none', margin: contentLayout === 'fixed' ? '0 auto' : undefined }}>
            <LocalizedText>{children}</LocalizedText>
          </div>
        </main>
      </div>

      {globalWatermark && (
        <div
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, zIndex: 80, pointerEvents: 'none', overflow: 'hidden', opacity: 0.11, backgroundImage: 'repeating-linear-gradient(-28deg, transparent 0 130px, transparent 130px 210px)' }}
        >
          {Array.from({ length: 24 }, (_, index) => <span key={index} style={{ position: 'absolute', top: `${(index % 6) * 19 + 8}%`, left: `${Math.floor(index / 6) * 27 - 5}%`, color: 'var(--primary)', fontSize: 15, fontWeight: 700, transform: 'rotate(-28deg)', whiteSpace: 'nowrap' }}>{appConfig.watermark} · {t('internalMaterial')}</span>)}
        </div>
      )}

      {/* ── Theme Settings Panel ── */}
      <ThemePanel open={themePanelOpen} onClose={() => setThemePanelOpen(false)} />
    </div>
  );
}
