import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { build } from 'esbuild';
const accounts=JSON.parse(await readFile('src/config/account-clients.json','utf8'));accounts.enabled=true;
const manifests=await Promise.all((await readdir('src/modules')).map(async name=>JSON.parse(await readFile(`src/modules/${name}/module.json`,'utf8'))));
const menus=manifests.flatMap(module=>module.menus.map(menu=>({module:module.name,path:menu.path,group:module.title,label:menu.title})));
globalThis.sessionStorage={values:new Map(),getItem(key){return this.values.get(key)??null;},setItem(key,value){this.values.set(key,value);}};
globalThis.fetch=()=>{throw new Error('Mock must not fetch');};
async function load(mode='SINGLE_REGION',type='sysuser'){
  const result=await build({stdin:{contents:"export {apiAdapter as api} from './src/api/adapter'; export {setMerchantScope as select} from './src/api/merchantScope';",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',define:{'import.meta.env':JSON.stringify({VITE_API_MODE:'mock',VITE_AUTH_CLIENT_ID:type==='merchant'?'merchant-web':'admin-web',VITE_AUTH_USER_TYPE:type})},plugins:[{name:'fixtures',setup(plugin){
    plugin.onResolve({filter:/account-clients\.json$/},()=>({path:'accounts',namespace:'fixtures'}));
    plugin.onResolve({filter:/tenancy\.json$/},()=>({path:'tenancy',namespace:'fixtures'}));
    plugin.onResolve({filter:/generated\/registry$/},()=>({path:'registry',namespace:'fixtures'}));
    plugin.onLoad({filter:/.*/,namespace:'fixtures'},args=>args.path==='registry'?{contents:`export const moduleMenus=${JSON.stringify(menus)};`}:{contents:JSON.stringify(args.path==='accounts'?accounts:{enabled:true,regionMode:mode}),loader:'json'});
  }}]});
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}#${Math.random()}`);
}
const {api,select}=await load();await api.login(accounts.demoAccounts.find(a=>a.userType==='sysuser'));
assert.equal((await api.getTenancyContext()).available,true);
await assert.rejects(api.saveTenantMerchant({code:'cross',name:'Cross',enabled:true,regionIds:[1,2]}));
select(1);assert.equal((await api.listErp('products')).length,0);
const product=await api.createErp('products',{sku:'same-sku',name:'Merchant A product',category:'office',stock:3,unit_price:1,status:'on_sale'});
const article=await api.createArticle({title:'A only'});
const [file]=await api.uploadFiles([new File(['private A'],'a.txt',{type:'text/plain'})]);
select(2);assert.equal((await api.listErp('products')).length,0);assert.equal((await api.listArticles()).total,0);assert.equal((await api.listFiles()).length,0);
await assert.rejects(api.updateErp('products',product.id,{name:'attack'}));await assert.rejects(api.downloadFile(file.id));
await api.createErp('products',{sku:'same-sku',name:'Merchant B product',category:'office',stock:1,unit_price:2,status:'on_sale'});
select(1);assert.equal((await api.getErp('products',product.id)).name,'Merchant A product');assert.equal((await api.listArticles()).list[0].id,article.id);assert.equal(await (await api.downloadFile(file.id)).text(),'private A');
await api.saveTenantMerchant({code:'merchant-a',name:'Disabled',regionIds:[1],enabled:false},1);await assert.rejects(api.listErp('products'));
const cross=await load('MULTI_REGION');await cross.api.login(accounts.demoAccounts.find(a=>a.userType==='sysuser'));await cross.api.saveTenantMerchant({code:'cross',name:'Cross',enabled:true,regionIds:[1,2]});assert.equal((await cross.api.getTenancyContext()).merchants.at(-1).regionIds.length,2);
const merchant=await load('SINGLE_REGION','merchant');await merchant.api.login(accounts.demoAccounts.find(a=>a.userType==='merchant'));merchant.select(0);assert.equal((await merchant.api.getTenancyContext()).platform,false);await merchant.api.listErp('products');merchant.select(2);await assert.rejects(merchant.api.listErp('products'));await assert.rejects(merchant.api.saveTenantRegion({code:'x',name:'x',enabled:true}));
console.log('Merchant stores, duplicate SKU isolation, private files, ownership checks, disable switch and both region modes passed.');
