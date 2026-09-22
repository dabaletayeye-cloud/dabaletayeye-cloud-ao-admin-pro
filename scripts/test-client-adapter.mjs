import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { build } from 'esbuild';
const settings = JSON.parse(await readFile('src/config/account-clients.json', 'utf8')); settings.enabled = true;
const manifests = await Promise.all((await readdir('src/modules')).map(async name => JSON.parse(await readFile(`src/modules/${name}/module.json`, 'utf8'))));
const menus = manifests.flatMap(module => module.menus.map(menu => ({ module: module.name, path: menu.path, group: module.title, label: menu.title })));
let requests = 0;
globalThis.fetch = async () => { requests++; throw new Error('Unexpected backend request'); };
async function load(clientId, type) {
  const result = await build({ stdin: { contents: "export { apiAdapter } from './src/api/adapter';", resolveDir: process.cwd() }, bundle: true, write: false, format: 'esm', define: { 'import.meta.env': JSON.stringify({ VITE_API_MODE: 'mock', VITE_AUTH_CLIENT_ID: clientId, VITE_AUTH_USER_TYPE: type }) }, plugins: [{ name: 'demo-config', setup(plugin) {
    plugin.onResolve({ filter: /tenancy\.json$/ }, () => ({ path: 'tenancy', namespace: 'fixture' }));
    plugin.onResolve({ filter: /account-clients\.json$/ }, () => ({ path: 'config', namespace: 'fixture' }));
    plugin.onResolve({ filter: /generated\/registry$/ }, () => ({ path: 'registry', namespace: 'fixture' }));
    plugin.onLoad({ filter: /.*/, namespace: 'fixture' }, args => args.path === 'tenancy' ? { contents: JSON.stringify({ enabled: false, regionMode: 'SINGLE_REGION' }), loader: 'json' } : args.path === 'config' ? { contents: JSON.stringify(settings), loader: 'json' } : { contents: `export const moduleMenus = ${JSON.stringify(menus)};` });
  } }] });
  return (await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)).apiAdapter;
}
const admin = await load('admin-web', 'sysuser');
const systemCredentials = settings.demoAccounts.find(row => row.userType === 'sysuser');
await admin.login(systemCredentials);
assert((await admin.getSystemEdition()).accountTypes.some(type => type.id === 'member'));
const merchant = await admin.listTypedUsers('merchant');
await admin.updateTypedUser('member', 1, { name: 'Changed member' });
assert.deepEqual(await admin.listTypedUsers('merchant'), merchant);
await assert.rejects(admin.deleteSystemUser(1), /最后一个/);
const member = await load('user-web', 'member');
await member.login(settings.demoAccounts.find(row => row.userType === 'member'));
assert.equal((await member.getCurrentProfile()).accountType, 'member');
await assert.rejects(member.listSystemUsers(), /无用户管理权限/);
await assert.rejects(member.getSystemEdition(), /无用户管理权限/);
await member.updateCurrentProfile({ name: '会员本人' });
assert.equal((await member.getCurrentProfile()).name, '会员本人');
assert.equal(requests, 0);
console.log('Enabled JSON client mode: actual adapter login, account metadata, scoped CRUD and non-admin restrictions passed without backend requests.');
