import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { build } from 'esbuild';

const manifests = await Promise.all((await readdir('src/modules')).map(async name => JSON.parse(await readFile(`src/modules/${name}/module.json`, 'utf8'))));
const menus = manifests.flatMap(module => module.menus.map(menu => ({ module: module.name, path: menu.path, group: module.title, label: menu.title })));
let requests = 0;
globalThis.fetch = async () => { requests++; throw new Error('Mock mode must not call the backend'); };
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
const compiled = await build({
  stdin: { contents: "export { apiAdapter as api, apiMode } from './src/api/adapter'; export { erpApi } from './src/api/erp'; export { oaApi } from './src/api/oa';", resolveDir: process.cwd() },
  bundle: true, write: false, format: 'esm', define: { 'import.meta.env': JSON.stringify({ VITE_API_MODE: 'mock' }) },
  plugins: [{ name: 'registry-data', setup(plugin) {
    plugin.onResolve({ filter: /generated\/registry$/ }, () => ({ path: 'registry', namespace: 'data' }));
    plugin.onLoad({ filter: /.*/, namespace: 'data' }, () => ({ contents: `export const moduleMenus = ${JSON.stringify(menus)};` }));
  } }],
});
const { api, apiMode, erpApi, oaApi } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
assert.equal(apiMode, 'mock');
const auth = JSON.parse(await readFile('src/config/mock-auth.json', 'utf8'));
assert.equal((await api.login(auth)).accessToken, 'mock-token');
await assert.rejects(api.login({ ...auth, username: auth.username + '-wrong' }), /账号或密码不正确/);
await assert.rejects(api.login({ ...auth, password: auth.password + '-wrong' }), /账号或密码不正确/);
assert.equal((await api.getCurrentProfile()).username, auth.username.trim());
for (const resource of ['products', 'orders', 'purchases', 'suppliers', 'inventory', 'customers', 'finance']) assert((await erpApi.list(resource)).length > 0, resource);
for (const resource of ['approval', 'attendance', 'notices', 'schedule', 'org']) assert((await oaApi.list(resource)).length > 0, resource);
const product = await erpApi.create('products', { sku: 'TEST-CSV-001', name: 'CSV 模拟商品', category: '办公', stock: 5, unit_price: 12.5 });
assert.equal((await erpApi.list('inventory')).find(row => row.product_id === product.id).stock, 5);
await erpApi.moveInventory(product.id, { type: 'out', quantity: 2 });
assert.equal((await erpApi.get('products', product.id)).stock, 3);
await assert.rejects(erpApi.moveInventory(product.id, { type: 'out', quantity: 999 }), /库存不足/);
assert.equal((await erpApi.get('products', product.id)).stock, 3);
await assert.rejects(erpApi.create('products', { sku: 'TEST-CSV-001', name: '重复', category: '办公' }), /SKU/);
const beforeFlows = (await erpApi.flows(product.id)).length;
await assert.rejects(erpApi.create('orders', { customer: '测试客户', amount: 20, item_count: 2, status: 'completed', items: [{ product_id: product.id, quantity: 1 }, { product_id: 3, quantity: 1 }] }), /库存不足/);
assert.equal((await erpApi.get('products', product.id)).stock, 3);
assert.equal((await erpApi.flows(product.id)).length, beforeFlows);
const beforeFinance = (await erpApi.list('finance')).length;
await erpApi.approvePurchase(1, {});
assert.equal((await erpApi.get('products', 2)).stock, 22);
await erpApi.approvePurchase(1, {});
assert.equal((await erpApi.list('finance')).length, beforeFinance + 1);
assert((await erpApi.reports()).salesTrend.length > 0);
assert((await erpApi.inventoryAlerts()).length > 0);
const cloned = await erpApi.get('products', product.id); cloned.name = 'not saved';
assert.notEqual((await erpApi.get('products', product.id)).name, cloned.name);
await erpApi.update('products', product.id, { name: '已修改' });
assert.equal((await erpApi.get('products', product.id)).name, '已修改');
await erpApi.remove('products', product.id); await assert.rejects(erpApi.get('products', product.id));
for (const [resource, input] of Object.entries({ orders: { customer: '导入客户', amount: 20, item_count: 1 }, purchases: { supplier: '供应商', amount: 30, item_count: 2 }, suppliers: { name: '新供应商' }, customers: { name: '新客户' }, finance: { record_type: 'income', amount: 10, category: '演示收入' } })) {
  const row = await erpApi.create(resource, input);
  assert.equal((await erpApi.get(resource, row.id)).id, row.id);
  await erpApi.remove(resource, row.id); await assert.rejects(erpApi.get(resource, row.id));
}
const approval = await oaApi.create('approval', { title: '测试审批', approval_type: 'leave' });
assert((await oaApi.list('approval', { tab: 'pending' })).some(row => row.id === approval.id));
await oaApi.update('approval', approval.id, { action: 'approve' });
assert.equal((await oaApi.get('approval', approval.id)).status, 'approved');
await assert.rejects(oaApi.update('approval', approval.id, { action: 'reject' }), /结束/);
const punch = await oaApi.create('attendance', { type: 'in' });
await assert.rejects(oaApi.create('attendance', { type: 'in' }), /已经/);
await oaApi.create('attendance', { type: 'out' });
assert((await oaApi.get('attendance', punch.id)).check_out);
await assert.rejects(oaApi.remove('org', 1), /成员或子部门/);
for (const resource of ['notices', 'schedule', 'org']) {
  const row = await oaApi.create(resource, resource === 'org' ? { name: '演示部门' } : { title: '演示记录' });
  await oaApi.update(resource, row.id, { remark: '已更新' });
  assert.equal((await oaApi.get(resource, row.id)).remark, '已更新');
  await oaApi.remove(resource, row.id); await assert.rejects(oaApi.get(resource, row.id));
}
const config = await api.getSystemEdition();
for (const edition of Object.keys(config.presets)) {
  const result = await api.updateSystemEdition({ edition, enabledModules: ['forged'] });
  assert.equal(result.edition, edition); assert.deepEqual(result.enabledModules, config.presets[edition]);
}
const files = await api.listFiles(); assert(files.length > 0);
assert.equal((await api.downloadFile(files.find(file => file.kind === 'image').id)).type, 'image/svg+xml');
const file = new File(['actual CSV bytes'], 'test.csv', { type: 'text/csv' });
const uploaded = await api.uploadFiles([file]);
assert.equal(await (await api.downloadFile(uploaded[0].id)).text(), 'actual CSV bytes');
await api.deleteFile(uploaded[0].id); await assert.rejects(api.downloadFile(uploaded[0].id));
await api.getDashboardAnalytics(7); await api.getEcommerceDashboard(7); await api.listServers(); await api.getSystemConfig();
assert.equal(requests, 0);
console.log('Mock login, ERP/OA CRUD, stock rollback, approval, reports, all editions and file preview/upload/download passed with zero network requests.');
