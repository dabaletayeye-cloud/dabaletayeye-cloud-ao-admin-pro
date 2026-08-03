import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  ThemeState,
  DEFAULT_THEME,
  THEMES,
  ThemeId,
  ThemeMode,
  MenuLayout,
  MenuStyle,
  BoxStyle,
  ContainerWidth,
  CollapseButtonPosition,
} from '../types';

const STORAGE_KEY = 'admin-theme';

interface ThemeContextValue {
  themeState: ThemeState;
  setThemeId: (id: ThemeId) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setTheme: (partial: Partial<ThemeState>) => void;
  resetTheme: () => void;
  setMenuLayout: (layout: MenuLayout) => void;
  setMenuStyle: (style: MenuStyle) => void;
  setAccentColor: (color: string) => void;
  setBoxStyle: (style: BoxStyle) => void;
  setContainerWidth: (width: ContainerWidth) => void;
  setCollapseButtonPosition: (pos: CollapseButtonPosition) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function loadTheme(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ThemeState>;
      const merged = { ...DEFAULT_THEME, ...parsed };
      if (!raw.includes('"menuStyle"')) {
        merged.menuStyle = 'system';
      }
      return merged;
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_THEME };
}

function saveTheme(state: ThemeState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/** Get the current theme config for themeId + mode */
function getThemeConfig(themeId: ThemeId, mode: ThemeMode) {
  const cfg = THEMES.find(t => t.id === themeId) ?? THEMES[0];
  return {
    primary: mode === 'dark' ? cfg.darkPrimary : cfg.lightPrimary,
    bg: mode === 'dark' ? cfg.darkBg : cfg.lightBg,
    card: mode === 'dark' ? cfg.darkCard : cfg.lightCard,
  };
}

function applyThemeToDom(state: ThemeState): void {
  const root = document.documentElement;
  const { themeId, mode, menuLayout, menuStyle, accentColor, boxStyle, containerWidth, contentLayout, pageTransition, cornerRadius, colorWeakMode } = state;

  root.setAttribute('data-theme', themeId);
  root.setAttribute('data-mode', mode);
  root.setAttribute('data-menu-layout', menuLayout);
  root.setAttribute('data-menu-style', menuStyle);
  root.setAttribute('data-box-style', boxStyle);
  root.setAttribute('data-container-width', containerWidth);
  root.setAttribute('data-content-layout', contentLayout);
  root.setAttribute('data-page-transition', pageTransition);
  root.setAttribute('data-color-weak', String(colorWeakMode));
  root.style.setProperty('--radius', `${cornerRadius}rem`);

  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  const clearProps = [
    '--primary',
    '--ring',
    '--accent',
    '--theme-primary',
    '--theme-accent',
    '--sidebar-primary',
    '--sidebar-ring',
    '--chart-1',
    '--shadow-color',
    '--sidebar',
    '--sidebar-foreground',
    '--sidebar-border',
    '--sidebar-accent',
    '--sidebar-accent-foreground',
  ];
  clearProps.forEach(p => root.style.removeProperty(p));

  const defaultPrimary = getThemeConfig(themeId, mode).primary;
  const accentDiffers = accentColor.toLowerCase() !== defaultPrimary.toLowerCase();

  if (accentDiffers) {
    root.style.setProperty('--primary', accentColor);
    root.style.setProperty('--ring', accentColor + '80');
    root.style.setProperty('--sidebar-primary', accentColor);
    root.style.setProperty('--sidebar-ring', accentColor);
    root.style.setProperty('--chart-1', accentColor);
    root.style.setProperty('--theme-primary', accentColor);
    root.style.setProperty('--shadow-color', accentColor + '26');
  }

  if (menuStyle === 'light') {
    root.style.setProperty('--sidebar-override-bg', '#FFFFFF');
    root.style.setProperty('--sidebar-override-fg', '#1F2937');
    root.style.setProperty('--sidebar-override-border', '#E5E7EB');
    root.style.setProperty('--sidebar-override-accent', '#F3F4F6');
  } else if (menuStyle === 'dark') {
    root.style.setProperty('--sidebar-override-bg', '#1F2937');
    root.style.setProperty('--sidebar-override-fg', '#F9FAFB');
    root.style.setProperty('--sidebar-override-border', 'rgba(255,255,255,0.08)');
    root.style.setProperty('--sidebar-override-accent', 'rgba(255,255,255,0.07)');
  } else {
    root.style.removeProperty('--sidebar-override-bg');
    root.style.removeProperty('--sidebar-override-fg');
    root.style.removeProperty('--sidebar-override-border');
    root.style.removeProperty('--sidebar-override-accent');
  }

  console.log('[useTheme] Applied theme:', { themeId, mode, accentColor, accentDiffers, defaultPrimary });
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null;
function triggerThemeTransition(): void {
  const root = document.documentElement;
  if (transitionTimer) {
    clearTimeout(transitionTimer);
  }
  root.classList.add('theme-transitioning');
  transitionTimer = setTimeout(() => {
    root.classList.remove('theme-transitioning');
    transitionTimer = null;
  }, 420);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeState, setThemeStateRaw] = useState<ThemeState>(() => loadTheme());
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (!isFirstMount.current) {
      triggerThemeTransition();
    }
    applyThemeToDom(themeState);
    saveTheme(themeState);
    if (isFirstMount.current) {
      isFirstMount.current = false;
    }
  }, [themeState]);

  const setThemeState = useCallback((updater: (prev: ThemeState) => ThemeState) => {
    setThemeStateRaw(updater);
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeState(prev => ({ ...prev, themeId: id }));
  }, [setThemeState]);

  const setMode = useCallback((mode: ThemeMode) => {
    setThemeState(prev => ({ ...prev, mode }));
  }, [setThemeState]);

  const toggleMode = useCallback(() => {
    setThemeState(prev => ({ ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' }));
  }, [setThemeState]);

  const setTheme = useCallback((partial: Partial<ThemeState>) => {
    setThemeState(prev => ({ ...prev, ...partial }));
  }, [setThemeState]);

  const resetTheme = useCallback(() => {
    setThemeState(() => ({ ...DEFAULT_THEME }));
  }, [setThemeState]);

  const setMenuLayout = useCallback((menuLayout: MenuLayout) => {
    setThemeState(prev => ({ ...prev, menuLayout }));
  }, [setThemeState]);

  const setMenuStyle = useCallback((menuStyle: MenuStyle) => {
    setThemeState(prev => ({ ...prev, menuStyle }));
  }, [setThemeState]);

  const setAccentColor = useCallback((accentColor: string) => {
    setThemeState(prev => ({ ...prev, accentColor }));
  }, [setThemeState]);

  const setBoxStyle = useCallback((boxStyle: BoxStyle) => {
    setThemeState(prev => ({ ...prev, boxStyle }));
  }, [setThemeState]);

  const setContainerWidth = useCallback((containerWidth: ContainerWidth) => {
    setThemeState(prev => ({ ...prev, containerWidth }));
  }, [setThemeState]);

  const setCollapseButtonPosition = useCallback((collapseButtonPosition: CollapseButtonPosition) => {
    setThemeState(prev => ({ ...prev, collapseButtonPosition }));
  }, [setThemeState]);

  return (
    <ThemeContext.Provider
      value={{
        themeState,
        setThemeId,
        setMode,
        toggleMode,
        setTheme,
        resetTheme,
        setMenuLayout,
        setMenuStyle,
        setAccentColor,
        setBoxStyle,
        setContainerWidth,
        setCollapseButtonPosition,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
