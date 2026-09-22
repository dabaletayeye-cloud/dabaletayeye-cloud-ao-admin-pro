import config from '../../config/tenancy.json';
import { mockEditionConfig } from './mockEdition';
import { merchantScope } from '../merchantScope';
import type { ApiAdapter, CurrentProfile } from './types';
import type { Merchant, Region, MerchantMember, RegionMode, TenancyContext } from '../tenancyTypes';

export function createMockTenancy(profile:()=>Promise<CurrentProfile>, accountExists:(type:string,id:number)=>Promise<boolean>){
  const regions:Region[]=[{id:1,code:'east',name:'华东地区',enabled:true},{id:2,code:'north',name:'华北地区',enabled:true}];
  const merchants:Merchant[]=[{id:1,code:'merchant-a',name:'演示商户 A',enabled:true,regionIds:[1]},{id:2,code:'merchant-b',name:'演示商户 B',enabled:true,regionIds:[2]}];
  let members:MerchantMember[]=[{accountType:'merchant',userId:1,merchantId:1}];
  let regionId=3,merchantId=3;
  const mode=()=>{if(!['SINGLE_REGION','MULTI_REGION'].includes(config.regionMode))throw new Error('地区模式配置无效');return config.regionMode as RegionMode;};
  async function context():Promise<TenancyContext>{
    const enabled=config.enabled===true, available=enabled&&['saas','ecommerce','crm','full'].includes(mockEditionConfig().edition);
    if(!enabled)return{enabled,available,regionMode:mode(),platform:false,regions:[],merchants:[]};
    const user=await profile();const own=members.find(m=>m.accountType===(user.accountType??'user')&&m.userId===user.id)?.merchantId;
    const platform=!own&&['user','sysuser'].includes(user.accountType??'user')&&['super_admin','sys_admin','超级管理员','系统管理员','管理员'].includes(user.role??'');
    return structuredClone({enabled,available,regionMode:mode(),editionConfig:mockEditionConfig(),platform,merchantId:own,merchants:available?merchants.filter(m=>platform||m.id===own):[],regions:available?regions.filter(r=>platform||merchants.find(m=>m.id===own)?.regionIds.includes(r.id)):[]});
  }
  async function manage(){const c=await context();if(!c.available||!c.platform)throw new Error('仅已开启功能的平台管理员可管理地区和商户');}
  function active(id:number){const m=merchants.find(m=>m.id===id&&m.enabled);if(!m||!m.regionIds.some(id=>regions.some(r=>r.id===id&&r.enabled)))throw new Error('商户不存在、已停用或无有效地区');return m;}
  async function scope(selected=merchantScope()){const c=await context();if(!c.enabled)return 0;if(!c.available)throw new Error('当前版本未启用多商户业务');if(!c.platform){if(!c.merchantId||selected!==0&&selected!==c.merchantId)throw new Error('不能访问其他商户数据');active(c.merchantId);return c.merchantId;}if(selected)active(selected);return selected;}
  function validate(input:{code:string;name:string;enabled:boolean},rows:Region[],id?:number){if(!input.code?.trim()||!input.name?.trim()||input.code.length>64||input.name.length>128||typeof input.enabled!=='boolean')throw new Error('请填写有效编码、名称和状态');if(rows.some(r=>r.code===input.code&&r.id!==id))throw new Error('编码已存在');if(id&&!rows.some(r=>r.id===id))throw new Error('记录不存在');}
  const methods:Pick<ApiAdapter,'getTenancyContext'|'saveTenantRegion'|'saveTenantMerchant'|'listMerchantMembers'|'bindMerchantMember'|'unbindMerchantMember'>={
    getTenancyContext:context,
    async saveTenantRegion(input,id){await manage();validate(input,regions,id);if(id)Object.assign(regions.find(r=>r.id===id)!,input);else regions.push({...input,id:regionId++});},
    async saveTenantMerchant(input,id){await manage();validate(input,merchants,id);const ids=[...new Set(input.regionIds)];if(!ids.length||mode()==='SINGLE_REGION'&&ids.length!==1)throw new Error('当前模式要求选择'+(mode()==='SINGLE_REGION'?'一个':'至少一个')+'地区');if(ids.some(id=>!regions.some(r=>r.id===id&&r.enabled)))throw new Error('请选择已启用地区');const row={...input,regionIds:ids};if(id)Object.assign(merchants.find(m=>m.id===id)!,row);else merchants.push({...row,id:merchantId++});},
    async listMerchantMembers(id){await manage();return structuredClone(members.filter(m=>m.merchantId===id));},
    async bindMerchantMember(id,type,user){await manage();active(id);if(!await accountExists(type,user))throw new Error('此类型下账号不存在');if(members.some(m=>m.accountType===type&&m.userId===user))throw new Error('账号已经绑定商户，请先解除原绑定');members.push({accountType:type,userId:user,merchantId:id});},
    async unbindMerchantMember(id,type,user){await manage();members=members.filter(m=>!(m.merchantId===id&&m.accountType===type&&m.userId===user));},
  };
  return {methods,scope,context,enabled:()=>config.enabled===true};
}
