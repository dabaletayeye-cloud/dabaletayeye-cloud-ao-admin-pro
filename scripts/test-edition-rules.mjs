import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveEditionModules, validateEditionRules } from '../src/core/editionRules.mjs';
import { planEdition, applyPlan } from './edition-prune-lib.mjs';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const defaults=JSON.parse(await readFile(new URL('../src/config/edition-rules.json',import.meta.url),'utf8'));
const preset={erp:{label:'ERP',modules:['erp']},minimal:{label:'Minimal',modules:[]},full:{label:'Full',modules:'*'}};
const policy=()=>({...structuredClone(defaults),enabled:true,preserveCustomModules:true,editions:{}});
async function fixture(t,rules=policy()){
  const root=await mkdtemp(path.join(project,'.edition-rules-test-'));
  t.after(async()=>{if(path.dirname(root)!==project||!path.basename(root).startsWith('.edition-rules-test-'))throw new Error('Unsafe cleanup');await rm(root,{recursive:true,force:true});});
  await mkdir(path.join(root,'src/config'),{recursive:true});
  await writeFile(path.join(root,'src/config/edition-rules.json'),JSON.stringify(rules));
  for(const name of ['erp','media','device']){
    const dir=path.join(root,'src/modules',name);await mkdir(dir,{recursive:true});
    await writeFile(path.join(dir,'module.json'),JSON.stringify({name,dependencies:[],routes:[],menus:[]}));
  }
  return root;
}
test('custom modules survive every preset by default, including minimal',()=>{
  const rules=policy();const installed=['erp','media','device'];
  assert.deepEqual(resolveEditionModules('minimal',[],installed,rules),['device']);
  assert.deepEqual(resolveEditionModules('erp',['erp'],installed,rules),['erp','device']);
  assert.deepEqual(resolveEditionModules('full','*',installed,rules),installed);
  rules.enabled=false;assert.deepEqual(resolveEditionModules('erp',['erp'],installed,rules),['erp']);
});
test('global and per-edition switches, include and exclude have deterministic precedence',()=>{
  const rules=policy();rules.preserveCustomModules=false;
  assert.deepEqual(resolveEditionModules('erp',['erp'],['erp','device'],rules),['erp']);
  rules.editions.erp={preserveCustomModules:true,exclude:['erp']};
  assert.deepEqual(resolveEditionModules('erp',['erp'],['erp','device'],rules),['device']);
  rules.editions.erp={include:['device','missing'],exclude:['device']};
  assert.deepEqual(resolveEditionModules('erp',['erp'],['erp','device'],rules),['erp']);
  rules.editions.full={exclude:['device']};
  assert.deepEqual(resolveEditionModules('full','*',['erp','device'],rules),['erp']);
  rules.editions.erp={exclude:['core']};assert.throws(()=>validateEditionRules(rules));
  assert.throws(()=>validateEditionRules({...policy(),preserveCustomModules:'true'}));
  assert.throws(()=>validateEditionRules({...policy(),editions:{saass:{}}}));
});
test('physical prune uses the same custom-module policy and explicit exclusion',async t=>{
  const root=await fixture(t);let plan=await planEdition(root,'erp',preset);
  assert.deepEqual(plan.keep,['device','erp']);assert.deepEqual(plan.remove,['media']);
  const rules=policy();rules.editions.erp={exclude:['device']};
  await writeFile(path.join(root,'src/config/edition-rules.json'),JSON.stringify(rules));
  await assert.rejects(applyPlan(plan,async()=>{}),/rules changed/);
  plan=await planEdition(root,'erp',preset);assert.deepEqual(plan.keep,['erp']);assert.deepEqual(plan.remove,['device','media']);
  await applyPlan(plan,async()=>{});
  assert.deepEqual(JSON.parse(await readFile(path.join(root,'src/config/build-edition.json'),'utf8')).enabledModules,['erp']);
});
test('excluded required dependencies abort before any deletion',async t=>{
  const rules=policy();rules.editions.erp={exclude:['media']};const root=await fixture(t,rules);
  await writeFile(path.join(root,'src/modules/device/module.json'),JSON.stringify({name:'device',dependencies:['media']}));
  await assert.rejects(planEdition(root,'erp',preset),/excluded/);
  assert.equal(JSON.parse(await readFile(path.join(root,'src/modules/media/module.json'),'utf8')).name,'media');
});
