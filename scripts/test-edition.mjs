import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { build, transform } from 'esbuild';

const manifests = await Promise.all((await readdir(new URL('../src/modules/', import.meta.url))).map(async name =>
  JSON.parse(await readFile(new URL(`../src/modules/${name}/module.json`, import.meta.url), 'utf8'))));
const menus = manifests.flatMap(m => m.menus.map(menu => ({ module: m.name, group: menu.group ?? m.title, path: menu.path, label: menu.title, perms: menu.perms ?? [] })));
const groups = manifests.map(m => ({ label: m.title, items: m.menus.map(menu => ({ key: menu.perms?.[0] ?? `${m.name}:${menu.path}` })) }));
const compiled = await build({ entryPoints: ['src/core/edition.ts'], bundle: true, write: false, format: 'esm', plugins: [{
  name: 'registry-fixture', setup(plugin) {
    plugin.onResolve({ filter: /generated\/registry$/ }, () => ({ path: 'registry', namespace: 'fixture' }));
    plugin.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `export const moduleMenus = ${JSON.stringify(menus)};` }));
  },
}] });
const { isModuleEnabled, isEntryEnabled, filterByEdition, filterPermissionGroups, availableEditions, showDemoPages } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const enabledModules = ['content', 'media', 'marketing', 'analytics', 'operations', 'ai'];
const saas = { edition: 'saas', enabledModules, presets: { saas: enabledModules } };
assert.deepEqual(availableEditions(menus, saas), ['minimal', 'erp', 'oa', 'saas', 'full']);
assert.deepEqual(availableEditions([{ module: 'erp' }], saas), ['minimal', 'erp', 'full']);
assert.deepEqual(availableEditions([], saas), ['minimal', 'full']);
assert.equal(isModuleEnabled('core', saas), true);
for (const name of ['erp', 'oa', 'examples', 'components', 'templates', 'lowcode']) assert.equal(isModuleEnabled(name, saas), false);
assert.equal(isModuleEnabled('erp', { edition: 'saas', enabledModules: [] }), false);
assert.deepEqual(new Set(filterByEdition(menus, saas).map(m => m.module)), new Set(enabledModules));
assert.deepEqual(new Set(filterPermissionGroups(groups, saas).map(g => g.label)), new Set(manifests.filter(m => enabledModules.includes(m.name)).map(m => m.title)));
for (const edition of ['saas', 'full', 'erp', 'oa', 'saas', 'full']) {
  const config = { ...saas, edition, enabledModules: edition === 'saas' ? enabledModules : [] };
  assert.equal(isModuleEnabled('erp', config), edition === 'erp' || edition === 'full');
  assert.equal(isModuleEnabled('oa', config), edition === 'oa' || edition === 'full');
}
const sidebar = await readFile(new URL('../src/components/Sidebar.tsx', import.meta.url), 'utf8');
const legacy = sidebar.slice(sidebar.indexOf('const LEGACY_NAV_ITEMS:'), sidebar.indexOf('const moduleIconMap:'));
const builder = sidebar.slice(sidebar.indexOf('const buildNavItems ='), sidebar.indexOf('export const NAV_ITEMS:'));
const icons = [...new Set([...legacy.matchAll(/<([A-Z]\w*)/g)].map(match => match[1]))];
const { code } = await transform(`${icons.map(name => `const ${name} = null;`).join('\n')}
const React = { createElement: () => null }; const icon = () => null;
${legacy}\n${builder}\nreturn buildNavItems;`, { loader: 'tsx' });
const buildNavItems = new Function('moduleMenus', 'filterModuleMenus', 'showDemoPages', code)(menus, filterByEdition, showDemoPages);
const nav = buildNavItems(saas);
assert.equal(nav[0].path, '/');
assert.equal(nav.at(-1).label, '系统管理');
assert(nav.slice(1, -1).every(item => item.type === 'link'));
assert.deepEqual(new Set(nav.slice(1, -1).map(item => item.path)), new Set(menus.filter(menu => enabledModules.includes(menu.module)).map(menu => menu.path)));
assert(buildNavItems({ edition: 'full', enabledModules: [] }).some(item => item.label === 'ERP 中心'));
const presets = {
  saas: enabledModules,
  ecommerce: ['commerce', 'erp', 'marketing', 'media', 'analytics'],
  devplatform: ['lowcode', 'server'],
  bi: ['analytics', 'operations', 'lowcode'],
  demo: ['examples', 'components', 'templates'],
  ai: ['ai', 'lowcode', 'media'],
  cms: ['content', 'media', 'marketing'],
  crm: ['erp', 'marketing', 'analytics', 'operations', 'media'],
};
assert.deepEqual(availableEditions(menus, { presets }), ['minimal', 'erp', 'oa', ...Object.keys(presets), 'full']);
assert.deepEqual(availableEditions([], { presets }), ['minimal', 'full']);
assert.deepEqual(availableEditions([{ module: 'erp' }], { presets }), ['minimal', 'erp', 'ecommerce', 'crm', 'full']);
assert(!availableEditions(menus.filter(item => !presets.demo.includes(item.module)), { presets }).includes('demo'));
for (let repeat = 0; repeat < 4; repeat++) for (const [edition, included] of Object.entries(presets)) {
  const config = { edition, enabledModules: included, presets };
  const expected = menus.filter(menu => included.includes(menu.module) || included.includes('server') && menu.path === '/system/servers');
  assert.deepEqual(filterByEdition(menus, config), expected);
  const nav = buildNavItems(config);
  assert.equal(nav[0].path, '/');
  assert.equal(nav.at(-1).label, '系统管理');
  assert(nav.slice(1, -1).every(item => item.type === 'link'), edition);
  const demoLinks = edition === 'demo' ? nav.filter(item => /^\/(result|error)\//.test(item.path ?? '')) : [];
  assert.deepEqual(new Set(nav.slice(1, -1).map(item => item.path)), new Set([...expected.map(menu => menu.path), ...demoLinks.map(item => item.path)]));
  if (edition === 'demo') assert(demoLinks.length > 0);
  for (const menu of menus) assert.equal(isEntryEnabled(menu, config), expected.includes(menu));
  assert.equal(filterByEdition(menus, { edition, enabledModules: [] }).length, 0);
  assert.equal(showDemoPages(config), edition === 'demo');
}
const developer = { edition: 'devplatform', enabledModules: ['lowcode', 'server'] };
const visiblePermissions = filterPermissionGroups(groups, developer).flatMap(group => group.items.map(item => item.key));
assert(visiblePermissions.includes('server:list'));
assert(!visiblePermissions.includes('message:list'));
assert(!visiblePermissions.includes('generation:manage'));
console.log('All presets: filtering, permissions, prune availability, repeated switches and first-level sidebar order passed.');
const full = { edition: 'full', enabledModules: ['erp'], presets: { erp: ['erp'], oa: ['oa'], ...presets } };
const fullNav = buildNavItems(full);
assert(fullNav.some(item => item.label === 'SaaS' && item.children.some(child => child.path === '/media')));
assert.equal(fullNav.at(-1).label, '系统管理');
const fullPaths = new Set(fullNav.flatMap(item => item.type === 'group' ? item.children.map(child => child.path) : [item.path]));
for (const menu of menus) assert(fullPaths.has(menu.path), `Full edition lost ${menu.path}`);
assert.equal(filterByEdition(menus, full).length, menus.length);
assert(fullNav.find(item => item.label === '演示').children.some(child => child.path.startsWith('/tmpl/')));
console.log('Full edition categories and complete route coverage passed.');
