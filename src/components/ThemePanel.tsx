import React from 'react';
import { toast } from '../lib/localizedToast';
import { XIcon, SunIcon, MoonIcon, CheckIcon, MenuIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useLocale } from '../hooks/useLocale';
import { THEMES, ACCENT_COLORS, CollapseButtonPosition } from '../types';

interface ThemePanelProps {
  open?: boolean;
  onClose?: () => void;
}

const THEME_NAME_KEYS: Record<string, string> = {
  classic: 'theme.themeClassic',
  mono: 'theme.themeMono',
  purple: 'theme.themePurple',
  manga: 'theme.themeManga',
  forest: 'theme.themeForest',
  sunset: 'theme.themeSunset',
  glacier: 'theme.themeGlacier',
  rose: 'theme.themeRose',
};

const ACCENT_COLOR_KEYS: Record<string, string> = {
  '#3B82F6': 'theme.colorBlue',
  '#1A1A1A': 'theme.colorBlack',
  '#8B5CF6': 'theme.colorPurple',
  '#E91E8C': 'theme.colorPink',
  '#16A34A': 'theme.colorGreen',
  '#F97316': 'theme.colorOrange',
  '#06B6D4': 'theme.colorCyan',
  '#E11D48': 'theme.colorRed',
};

// ─── Derive panel palette from current theme + mode ───────────────────────────
interface PanelPalette {
  panelBg: string;
  headerBg: string;
  headerText: string;
  divider: string;
  sectionLabel: string;
  btnUnselectedBg: string;
  btnUnselectedText: string;
  btnSelectedBg: string;
  btnSelectedText: string;
  btnBorder: string;
  configAreaBg: string;
  configLabelText: string;
  configValueBg: string;
  configValueText: string;
  closeBtn: string;
  closeBtnText: string;
  accentHex: string;
  scrollThumb: string;
}

function derivePalette(themeId: string, mode: string, accentColor: string): PanelPalette {
  const cfg = THEMES.find(t => t.id === themeId) ?? THEMES[0];
  const isDark = mode === 'dark';
  const primary = isDark ? cfg.darkPrimary : cfg.lightPrimary;
  const panelBg = isDark ? cfg.panelDarkBg : cfg.panelLightBg;
  const isPanelDark = isDark;

  if (isPanelDark) {
    return {
      panelBg,
      headerBg: `linear-gradient(135deg, ${primary}55 0%, ${panelBg} 100%)`,
      headerText: '#FFFFFF',
      divider: `${primary}33`,
      sectionLabel: 'rgba(255,255,255,0.38)',
      btnUnselectedBg: '#374151',
      btnUnselectedText: 'rgba(255,255,255,0.7)',
      btnSelectedBg: accentColor,
      btnSelectedText: '#FFFFFF',
      btnBorder: 'rgba(255,255,255,0.12)',
      configAreaBg: `${primary}18`,
      configLabelText: 'rgba(255,255,255,0.45)',
      configValueBg: 'rgba(255,255,255,0.1)',
      configValueText: '#FFFFFF',
      closeBtn: 'rgba(255,255,255,0.08)',
      closeBtnText: 'rgba(255,255,255,0.6)',
      accentHex: accentColor,
      scrollThumb: `${accentColor}44`,
    };
  } else {
    return {
      panelBg,
      headerBg: `linear-gradient(135deg, ${accentColor}22 0%, ${panelBg} 100%)`,
      headerText: '#1F2937',
      divider: `${accentColor}30`,
      sectionLabel: '#9CA3AF',
      btnUnselectedBg: `${accentColor}12`,
      btnUnselectedText: '#374151',
      btnSelectedBg: accentColor,
      btnSelectedText: '#FFFFFF',
      btnBorder: `${accentColor}28`,
      configAreaBg: `${accentColor}10`,
      configLabelText: '#6B7280',
      configValueBg: `${accentColor}18`,
      configValueText: '#1F2937',
      closeBtn: `${accentColor}14`,
      closeBtnText: '#6B7280',
      accentHex: accentColor,
      scrollThumb: `${accentColor}44`,
    };
  }
}

// ─── Generic pill-button option group ─────────────────────────────────────────
function OptionGroup<T extends string>({
  options,
  value,
  onChange,
  palette,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  palette: PanelPalette;
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: isSelected
                ? `1.5px solid ${palette.accentHex}`
                : `1.5px solid ${palette.btnBorder}`,
              background: isSelected ? palette.btnSelectedBg : palette.btnUnselectedBg,
              color: isSelected ? palette.btnSelectedText : palette.btnUnselectedText,
              fontSize: '12px',
              fontWeight: isSelected ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────
function PanelSection({
  title,
  palette,
  children,
}: {
  title: string;
  palette: PanelPalette;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: palette.sectionLabel,
          marginBottom: '10px',
        }}
      >
        {title}
      </div>
      <div data-px-slot>{children}</div>
    </div>
  );
}

function SettingSwitch({
  label,
  checked,
  onChange,
  palette,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  palette: PanelPalette;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between py-2 text-left"
      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: palette.headerText }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      <span style={{ width: 34, height: 20, borderRadius: 999, background: checked ? palette.accentHex : '#D1D5DB', padding: 2, display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start', transition: 'background 0.16s, justify-content 0.16s' }}>
        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.18)' }} />
      </span>
    </button>
  );
}

// ─── Collapse button position mini-diagram previews ──────────────────────────
// Each card shows a tiny layout thumbnail + a highlighted "button dot" that
// marks exactly where the collapse toggle lives.

/** topbar: hamburger dot in the TOP-LEFT of the topbar strip */
function CollapsePreviewTopbar({ accent, faint, bg }: { accent: string; faint: string; bg: string }) {
  return (
    <div style={{ width: 54, height: 38, borderRadius: 5, overflow: 'hidden', background: bg, border: `1px solid ${faint}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* topbar row */}
      <div style={{ height: 11, background: faint, display: 'flex', alignItems: 'center', paddingLeft: 3, gap: 2, flexShrink: 0 }}>
        {/* collapse button dot — LEFT of topbar */}
        <div style={{ width: 6, height: 6, borderRadius: 1, background: accent, flexShrink: 0 }} />
        <div style={{ flex: 1, height: 2, borderRadius: 1, background: faint, opacity: 0.5 }} />
      </div>
      {/* body row: sidebar + content */}
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ width: 13, background: faint, opacity: 0.6 }} />
        <div style={{ flex: 1, padding: '3px 3px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ height: 2, borderRadius: 1, background: faint, opacity: 0.4 }} />
          <div style={{ height: 2, borderRadius: 1, background: faint, opacity: 0.25, width: '70%' }} />
          <div style={{ height: 2, borderRadius: 1, background: faint, opacity: 0.25, width: '55%' }} />
        </div>
      </div>
    </div>
  );
}

/** sidebar-bottom: collapse dot at the BOTTOM of the sidebar */
function CollapsePreviewSidebarBottom({ accent, faint, bg }: { accent: string; faint: string; bg: string }) {
  return (
    <div style={{ width: 54, height: 38, borderRadius: 5, overflow: 'hidden', background: bg, border: `1px solid ${faint}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* topbar row */}
      <div style={{ height: 11, background: faint, display: 'flex', alignItems: 'center', paddingLeft: 4, gap: 2, flexShrink: 0, opacity: 0.7 }}>
        <div style={{ flex: 1, height: 2, borderRadius: 1, background: faint, opacity: 0.5 }} />
      </div>
      {/* body row */}
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ width: 13, background: faint, opacity: 0.55, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 2 }}>
          {/* collapse button dot — BOTTOM of sidebar */}
          <div style={{ width: 8, height: 4, borderRadius: 1, background: accent }} />
        </div>
        <div style={{ flex: 1, padding: '3px 3px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ height: 2, borderRadius: 1, background: faint, opacity: 0.4 }} />
          <div style={{ height: 2, borderRadius: 1, background: faint, opacity: 0.25, width: '70%' }} />
          <div style={{ height: 2, borderRadius: 1, background: faint, opacity: 0.25, width: '55%' }} />
        </div>
      </div>
    </div>
  );
}

/** sidebar-top: brand and toggle share the full top header; navigation starts below */
function CollapsePreviewSidebarTop({ accent, faint, bg }: { accent: string; faint: string; bg: string }) {
  return (
    <div style={{ width: 54, height: 38, borderRadius: 5, overflow: 'hidden', background: bg, border: `1px solid ${faint}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* One continuous top header: toggle + brand on the left, search on the right */}
      <div style={{ height: 11, borderBottom: `1px solid ${faint}`, display: 'flex', alignItems: 'center', gap: 2, padding: '0 3px', flexShrink: 0 }}>
        <div style={{ width: 4, height: 4, borderRadius: 1, background: accent, flexShrink: 0 }} />
        <div style={{ width: 11, height: 3, borderRadius: 1, background: faint, opacity: 0.9, flexShrink: 0 }} />
        <div style={{ width: 1, alignSelf: 'stretch', background: faint, opacity: 0.75, margin: '0 1px' }} />
        <div style={{ width: 12, height: 3, borderRadius: 1, background: faint, opacity: 0.45 }} />
      </div>
      {/* Sidebar navigation begins below the unified header */}
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ width: 18, background: faint, opacity: 0.55, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3, gap: 3 }}>
          <div style={{ width: 10, height: 2, borderRadius: 1, background: 'currentColor', opacity: 0.3 }} />
          <div style={{ width: 10, height: 2, borderRadius: 1, background: 'currentColor', opacity: 0.2 }} />
          <div style={{ width: 10, height: 2, borderRadius: 1, background: 'currentColor', opacity: 0.2 }} />
        </div>
        <div style={{ flex: 1, padding: '3px 3px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ height: 2, borderRadius: 1, background: faint, opacity: 0.4 }} />
          <div style={{ height: 2, borderRadius: 1, background: faint, opacity: 0.25, width: '70%' }} />
          <div style={{ height: 2, borderRadius: 1, background: faint, opacity: 0.25, width: '55%' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Collapse button position card group ──────────────────────────────────────
function CollapsePositionGroup({
  value,
  onChange,
  palette,
}: {
  value: CollapseButtonPosition;
  onChange: (v: CollapseButtonPosition) => void;
  palette: PanelPalette;
}) {
  const { t } = useLocale();
  const faint = palette.btnBorder;
  const bg = palette.btnUnselectedBg;

  const options: { value: CollapseButtonPosition; label: string; preview: React.ReactNode }[] = [
    {
      value: 'topbar',
      label: t('theme.topbarLeft'),
      preview: <CollapsePreviewTopbar accent={palette.accentHex} faint={faint} bg={bg} />,
    },
    {
      value: 'sidebar-bottom',
      label: t('theme.sidebarBottom'),
      preview: <CollapsePreviewSidebarBottom accent={palette.accentHex} faint={faint} bg={bg} />,
    },
    {
      value: 'sidebar-top',
      label: t('theme.sidebarTop'),
      preview: <CollapsePreviewSidebarTop accent={palette.accentHex} faint={faint} bg={bg} />,
    },
  ];

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {options.map(opt => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 6px 8px',
              borderRadius: '10px',
              border: isSelected
                ? `2px solid ${palette.accentHex}`
                : `1px solid ${palette.btnBorder}`,
              background: isSelected ? `${palette.accentHex}18` : palette.configAreaBg,
              color: isSelected ? palette.accentHex : palette.btnUnselectedText,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              position: 'relative',
              boxShadow: isSelected ? `0 0 0 3px ${palette.accentHex}18` : 'none',
            }}
          >
            {/* mini layout diagram */}
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {opt.preview}
            </span>
            {/* label */}
            <span style={{ fontSize: '10px', fontWeight: isSelected ? 700 : 400, whiteSpace: 'nowrap', lineHeight: 1.2, textAlign: 'center' }}>
              {opt.label}
            </span>
            {/* check badge */}
            <div
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: isSelected ? palette.accentHex : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              {isSelected && <CheckIcon size={9} color="#fff" strokeWidth={3} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── ThemeToggleButtons (exported for Topbar) ─────────────────────────────────
export function ThemeToggleButtons({ onOpenPanel = () => {} }: { onOpenPanel?: () => void }) {
  const { themeState, toggleMode } = useTheme();
  const { t } = useLocale();
  const isDark = themeState.mode === 'dark';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <button
        onClick={toggleMode}
        title={isDark ? t('theme.toggleToLight') : t('theme.toggleToDark')}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'var(--secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--foreground)',
          transition: 'all 0.15s',
        }}
      >
        {isDark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
      </button>
      <button
        onClick={onOpenPanel}
        title={t('theme.panelTitle')}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'var(--secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--foreground)',
          transition: 'all 0.15s',
          fontSize: '16px',
        }}
      >
        🎨
      </button>
    </div>
  );
}

// ─── Main ThemePanel ──────────────────────────────────────────────────────────
export default function ThemePanel({ open = false, onClose = () => {} }: ThemePanelProps) {
  const { t } = useLocale();
  const {
    themeState,
    setThemeId,
    setMode,
    setMenuLayout,
    setMenuStyle,
    setAccentColor,
    setBoxStyle,
    setContainerWidth,
    setCollapseButtonPosition,
    setTheme,
    resetTheme,
  } = useTheme();

  const p = derivePalette(themeState.themeId, themeState.mode, themeState.accentColor);

  const themeName = (themeId: string) => t(THEME_NAME_KEYS[themeId] ?? themeId);
  const colorName = (color: string) => t(ACCENT_COLOR_KEYS[color] ?? 'theme.custom');

  const containerWidthLabel: Record<string, string> = {
    compact: `${t('theme.compact')} 16px`,
    default: `${t('theme.default')} 24px`,
    loose: `${t('theme.loose')} 32px`,
  };
  const boxStyleLabel: Record<string, string> = {
    border: t('theme.border'),
    shadow: t('theme.shadow'),
  };
  const collapsePosLabel: Record<string, string> = {
    topbar: t('theme.topbarLeft'),
    'sidebar-bottom': t('theme.sidebarBottom'),
    'sidebar-top': t('theme.sidebarTop'),
  };
  const selectStyle: React.CSSProperties = {
    width: '100%',
    height: 36,
    borderRadius: 8,
    border: `1px solid ${p.btnBorder}`,
    background: p.btnUnselectedBg,
    color: p.headerText,
    fontSize: 12,
    padding: '0 10px',
    outline: 'none',
  };

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(themeState, null, 2));
      toast.success(t('theme.copied'));
    } catch {
      toast.error(t('theme.clipboardDenied'));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(2px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Panel */}
      <div
        data-cmp="ThemePanel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '320px',
          zIndex: 1000,
          background: p.panelBg,
          boxShadow: `-4px 0 40px ${p.accentHex}28, -1px 0 0 ${p.divider}`,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(.4,0,.2,1), background 0.25s ease, box-shadow 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            minHeight: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            background: p.headerBg,
            borderBottom: `1px solid ${p.divider}`,
            flexShrink: 0,
            transition: 'background 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${p.accentHex}, ${p.accentHex}88)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                boxShadow: `0 2px 8px ${p.accentHex}44`,
              }}
            >
              🎨
            </div>
            <div>
              <div style={{ color: p.headerText, fontWeight: 800, fontSize: '15px', letterSpacing: '-0.2px' }}>
                {t('theme.panelTitle')}
              </div>
              <div style={{ color: p.sectionLabel, fontSize: '11px', marginTop: '1px' }}>
                {themeName(themeState.themeId)}
                {' · '}
                {themeState.mode === 'dark' ? t('theme.dark') : t('theme.light')}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              border: `1px solid ${p.divider}`,
              background: p.closeBtn,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: p.closeBtnText,
              transition: 'background 0.15s',
            }}
          >
            <XIcon size={14} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '20px 20px 12px',
            scrollbarWidth: 'thin',
            scrollbarColor: `${p.scrollThumb} transparent`,
          }}
        >
          {/* 1. 明暗模式 */}
          <PanelSection title={t('theme.mode')} palette={p}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Light button */}
              <button
                onClick={() => setMode('light')}
                style={{
                  flex: 1,
                  height: '68px',
                  borderRadius: '12px',
                  border: themeState.mode === 'light'
                    ? `2px solid ${p.accentHex}`
                    : `2px solid ${p.btnBorder}`,
                  background: '#F8FAFC',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.15s',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: themeState.mode === 'light' ? `0 0 0 3px ${p.accentHex}22` : 'none',
                }}
              >
                <SunIcon size={18} color="#F59E0B" />
                <span style={{ fontSize: '11px', color: '#374151', fontWeight: 600 }}>{t('theme.light')}</span>
                {themeState.mode === 'light' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: p.accentHex,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon size={10} color="#fff" />
                  </div>
                )}
              </button>
              {/* Dark button */}
              <button
                onClick={() => setMode('dark')}
                style={{
                  flex: 1,
                  height: '68px',
                  borderRadius: '12px',
                  border: themeState.mode === 'dark'
                    ? `2px solid ${p.accentHex}`
                    : `2px solid ${p.btnBorder}`,
                  background: '#1A1A2E',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.15s',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: themeState.mode === 'dark' ? `0 0 0 3px ${p.accentHex}22` : 'none',
                }}
              >
                <MoonIcon size={18} color="#818CF8" />
                <span style={{ fontSize: '11px', color: '#C7D2FE', fontWeight: 600 }}>{t('theme.dark')}</span>
                {themeState.mode === 'dark' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: p.accentHex,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon size={10} color="#fff" />
                  </div>
                )}
              </button>
            </div>
          </PanelSection>

          {/* Divider */}
          <div style={{ height: '1px', background: p.divider, margin: '0 0 22px' }} />

          {/* 2. 选择主题 — 两列布局 */}
          <PanelSection title={t('theme.selectTheme')} palette={p}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {THEMES.map(theme => {
                const isActive = themeState.themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setThemeId(theme.id)}
                    style={{
                      width: 'calc(50% - 4px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 10px',
                      borderRadius: '10px',
                      border: isActive
                        ? `2px solid ${p.accentHex}`
                        : `2px solid ${p.btnBorder}`,
                      background: isActive ? p.btnUnselectedBg : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: isActive ? `0 0 0 3px ${p.accentHex}18` : 'none',
                      position: 'relative',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '18px', flexShrink: 0, lineHeight: 1 }}>{theme.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ color: p.headerText, fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {themeName(theme.id)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.lightPrimary, border: `1.5px solid ${p.divider}` }} />
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.darkPrimary, border: `1.5px solid ${p.divider}` }} />
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        background: isActive ? p.accentHex : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s',
                        flexShrink: 0,
                      }}
                    >
                      {isActive && <CheckIcon size={9} color="#fff" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </PanelSection>

          {/* Divider */}
          <div style={{ height: '1px', background: p.divider, margin: '0 0 22px' }} />

          {/* 3. 菜单布局 */}
          <PanelSection title={t('theme.menuLayout')} palette={p}>
            <OptionGroup
              options={[
                { label: t('theme.vertical'), value: 'vertical' as const },
                { label: t('theme.horizontal'), value: 'horizontal' as const },
                { label: t('theme.mixed'), value: 'mixed' as const },
                { label: t('theme.double'), value: 'double' as const },
              ]}
              value={themeState.menuLayout}
              onChange={setMenuLayout}
              palette={p}
            />
          </PanelSection>

          {/* 3b. 折叠按钮位置 — only meaningful for vertical layout */}
          <PanelSection title={t('theme.collapsePosition')} palette={p}>
            <CollapsePositionGroup
              value={themeState.collapseButtonPosition}
              onChange={setCollapseButtonPosition}
              palette={p}
            />
            {themeState.menuLayout !== 'vertical' && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: p.sectionLabel, fontStyle: 'italic' }}>
                {t('theme.verticalOnly')}
              </div>
            )}
          </PanelSection>

          {/* 4. 菜单风格 */}
          <PanelSection title={t('theme.menuStyle')} palette={p}>
            <OptionGroup
              options={[
                { label: t('theme.light'), value: 'light' as const },
                { label: t('theme.dark'), value: 'dark' as const },
                { label: t('theme.followSystem'), value: 'system' as const },
              ]}
              value={themeState.menuStyle}
              onChange={setMenuStyle}
              palette={p}
            />
          </PanelSection>

          {/* Divider */}
          <div style={{ height: '1px', background: p.divider, margin: '0 0 22px' }} />

          {/* 5. 系统主题色 */}
          <PanelSection title={t('theme.themeColor')} palette={p}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {ACCENT_COLORS.map(c => {
                const isSelected = themeState.accentColor === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setAccentColor(c.value)}
                    title={colorName(c.value)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: isSelected ? `3px solid #fff` : '3px solid transparent',
                      outline: isSelected ? `2.5px solid ${c.value}` : '2.5px solid transparent',
                      outlineOffset: '1px',
                      background: c.value,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                      padding: 0,
                      boxShadow: isSelected ? `0 2px 8px ${c.value}66` : 'none',
                    }}
                  >
                    {isSelected && <CheckIcon size={13} color="#fff" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: p.sectionLabel }}>
              {t('theme.current')}: {colorName(themeState.accentColor)}
            </div>
          </PanelSection>

          {/* 6. 盒子样式 */}
          <PanelSection title={t('theme.boxStyle')} palette={p}>
            <OptionGroup
              options={[
                { label: t('theme.border'), value: 'border' as const },
                { label: t('theme.shadow'), value: 'shadow' as const },
              ]}
              value={themeState.boxStyle}
              onChange={setBoxStyle}
              palette={p}
            />
          </PanelSection>

          {/* 7. 容器宽度 */}
          <PanelSection title={t('theme.contentLayout')} palette={p}>
            <OptionGroup
              options={[
                { label: `↔ ${t('theme.fluid')}`, value: 'fluid' as const },
                { label: `↔ ${t('theme.fixed')}`, value: 'fixed' as const },
              ]}
              value={themeState.contentLayout}
              onChange={(contentLayout) => setTheme({ contentLayout })}
              palette={p}
            />
          </PanelSection>

          <PanelSection title={t('theme.contentSpacing')} palette={p}>
            <OptionGroup
              options={[
                { label: t('theme.compact'), value: 'compact' as const },
                { label: t('theme.default'), value: 'default' as const },
                { label: t('theme.loose'), value: 'loose' as const },
              ]}
              value={themeState.containerWidth}
              onChange={setContainerWidth}
              palette={p}
            />
          </PanelSection>

          <div style={{ height: '1px', background: p.divider, margin: '0 0 22px' }} />

          <PanelSection title={t('theme.basicSettings')} palette={p}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <SettingSwitch label={t('theme.multiTabs')} checked={themeState.multiTabs} onChange={() => setTheme({ multiTabs: !themeState.multiTabs })} palette={p} />
              <SettingSwitch label={t('theme.sidebarAccordion')} checked={themeState.sidebarAccordion} onChange={() => setTheme({ sidebarAccordion: !themeState.sidebarAccordion })} palette={p} />
              <SettingSwitch label={t('theme.showSidebarToggle')} checked={themeState.showSidebarToggle} onChange={() => setTheme({ showSidebarToggle: !themeState.showSidebarToggle })} palette={p} />
              <SettingSwitch label={t('theme.showQuickEntry')} checked={themeState.showQuickEntry} onChange={() => setTheme({ showQuickEntry: !themeState.showQuickEntry })} palette={p} />
              <SettingSwitch label={t('theme.showReload')} checked={themeState.showReloadButton} onChange={() => setTheme({ showReloadButton: !themeState.showReloadButton })} palette={p} />
              <SettingSwitch label={t('theme.showBreadcrumb')} checked={themeState.showBreadcrumb} onChange={() => setTheme({ showBreadcrumb: !themeState.showBreadcrumb })} palette={p} />
              <SettingSwitch label={t('theme.showLanguage')} checked={themeState.showLanguageSelector} onChange={() => setTheme({ showLanguageSelector: !themeState.showLanguageSelector })} palette={p} />
              <SettingSwitch label={t('theme.showProgress')} checked={themeState.showTopProgress} onChange={() => setTheme({ showTopProgress: !themeState.showTopProgress })} palette={p} />
              <SettingSwitch label={t('theme.colorWeakMode')} checked={themeState.colorWeakMode} onChange={() => setTheme({ colorWeakMode: !themeState.colorWeakMode })} palette={p} />
              <SettingSwitch label={t('theme.globalWatermark')} checked={themeState.globalWatermark} onChange={() => setTheme({ globalWatermark: !themeState.globalWatermark })} palette={p} />
            </div>
          </PanelSection>

          <PanelSection title={t('theme.displayDetails')} palette={p}>
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6, fontSize: 12, color: p.configLabelText }}>
                {t('theme.sidebarWidth')}
                <input type="number" min={180} max={320} value={themeState.sidebarWidth} onChange={(event) => setTheme({ sidebarWidth: Math.max(180, Math.min(320, Number(event.target.value) || 230)) })} style={selectStyle} />
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 12, color: p.configLabelText }}>
                {t('theme.tabsStyle')}
                <select value={themeState.tabsStyle} onChange={(event) => setTheme({ tabsStyle: event.target.value as 'default' | 'card' | 'chrome' })} style={selectStyle}>
                  <option value="default">{t('theme.tabsDefault')}</option>
                  <option value="card">{t('theme.tabsCard')}</option>
                  <option value="chrome">{t('theme.tabsChrome')}</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 12, color: p.configLabelText }}>
                {t('theme.pageTransition')}
                <select value={themeState.pageTransition} onChange={(event) => setTheme({ pageTransition: event.target.value as 'fade' | 'slide-left' | 'slide-up' })} style={selectStyle}>
                  <option value="slide-left">{t('theme.slideLeft')}</option>
                  <option value="slide-up">{t('theme.slideUp')}</option>
                  <option value="fade">{t('theme.fade')}</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 12, color: p.configLabelText }}>
                {t('theme.cornerRadius')}
                <select value={themeState.cornerRadius} onChange={(event) => setTheme({ cornerRadius: Number(event.target.value) })} style={selectStyle}>
                  <option value={0.5}>0.5 rem</option>
                  <option value={0.75}>0.75 rem</option>
                  <option value={1}>1 rem</option>
                  <option value={1.25}>1.25 rem</option>
                </select>
              </label>
            </div>
          </PanelSection>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={() => { void copyConfig(); }} style={{ height: 36, borderRadius: 8, border: 'none', background: p.btnSelectedBg, color: p.btnSelectedText, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>{t('theme.copyConfig')}</button>
            <button type="button" onClick={() => { resetTheme(); toast.success(t('theme.resetSuccess')); }} style={{ height: 36, borderRadius: 8, border: `1px solid ${p.accentHex}`, background: 'transparent', color: p.accentHex, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>{t('theme.resetConfig')}</button>
          </div>
        </div>

        {/* ── 8. Footer status bar ── */}
        <div
          style={{
            padding: '12px 20px 16px',
            borderTop: `1px solid ${p.divider}`,
            flexShrink: 0,
            transition: 'border-color 0.25s ease',
          }}
        >
          <div
            style={{
              background: p.configAreaBg,
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
              border: `1px solid ${p.divider}`,
              transition: 'background 0.25s ease',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: p.sectionLabel,
                marginBottom: '2px',
              }}
            >
              {t('theme.currentConfig')}
            </div>

            {[
              {
                label: t('theme.theme'),
                value: `${themeName(themeState.themeId)} ${themeState.mode === 'dark' ? '🌙' : '☀️'}`,
              },
              {
                label: t('theme.boxStyle'),
                value: boxStyleLabel[themeState.boxStyle] ?? themeState.boxStyle,
              },
              {
                label: t('theme.contentSpacing'),
                value: containerWidthLabel[themeState.containerWidth] ?? themeState.containerWidth,
              },
              {
                label: t('theme.menuLayout'),
                value: ({
                  vertical: t('theme.vertical'),
                  horizontal: t('theme.horizontal'),
                  mixed: t('theme.mixed'),
                  double: t('theme.double'),
                } as Record<string, string>)[themeState.menuLayout] ?? themeState.menuLayout,
              },
              {
                label: t('theme.collapsePosition'),
                value: collapsePosLabel[themeState.collapseButtonPosition] ?? themeState.collapseButtonPosition,
              },
            ].map(row => (
              <div
                key={row.label}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '11px', color: p.configLabelText }}>{row.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: p.configValueText,
                    background: p.configValueBg,
                    padding: '2px 9px',
                    borderRadius: '6px',
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
