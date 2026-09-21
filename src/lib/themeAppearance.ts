import { THEMES, type ThemeState } from '../types';

export function updateThemeAppearance(previous: ThemeState, patch: Partial<ThemeState>): ThemeState {
  const next = { ...previous, ...patch };
  const oldTheme = THEMES.find(theme => theme.id === previous.themeId) ?? THEMES[0];
  const newTheme = THEMES.find(theme => theme.id === next.themeId) ?? THEMES[0];
  const followsTheme = [oldTheme.lightPrimary, oldTheme.darkPrimary].some(color => color.toLowerCase() === previous.accentColor.toLowerCase());
  if (patch.accentColor === undefined && (next.themeId !== previous.themeId || followsTheme)) {
    next.accentColor = next.mode === 'dark' ? newTheme.darkPrimary : newTheme.lightPrimary;
  }
  return next;
}

export function primaryForeground(background: string): string {
  const hex = background.replace('#', '');
  if (!/^[\da-f]{6}$/i.test(hex)) return '#FFFFFF';
  const channels = [0, 2, 4].map(offset => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? '#000000' : '#FFFFFF';
}
