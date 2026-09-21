import assert from 'node:assert/strict';
import { build } from 'esbuild';
const result = await build({ stdin: { contents: "export * from './src/lib/themeAppearance'; export { THEMES, DEFAULT_THEME } from './src/types';", resolveDir: process.cwd() }, bundle: true, write: false, format: 'esm' });
const { updateThemeAppearance, primaryForeground, THEMES, DEFAULT_THEME } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
for (const theme of THEMES) {
  let state = updateThemeAppearance(DEFAULT_THEME, { themeId: theme.id });
  for (const mode of ['dark', 'light', 'dark', 'light']) {
    state = updateThemeAppearance(state, { mode });
    assert.equal(state.accentColor, mode === 'dark' ? theme.darkPrimary : theme.lightPrimary);
  }
}
const stale = { ...DEFAULT_THEME, themeId: 'mono', mode: 'dark', accentColor: '#1A1A1A' };
assert.equal(updateThemeAppearance(stale, {}).accentColor, '#FFFFFF');
assert.equal(primaryForeground('#FFFFFF'), '#000000');
assert.equal(primaryForeground('#1A1A1A'), '#FFFFFF');
const custom = { ...DEFAULT_THEME, accentColor: '#123456' };
assert.equal(updateThemeAppearance(custom, { mode: 'dark' }).accentColor, '#123456');
assert.equal(primaryForeground('#123456'), '#FFFFFF');
console.log('All 8 themes: repeated mode switching, stale preferences and custom accent contrast passed.');
