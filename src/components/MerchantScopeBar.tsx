import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEdition } from '../core/EditionProvider';
import { merchantScope, setMerchantScope } from '../api/merchantScope';
export default function MerchantScopeBar(){
  const {config}=useEdition();const context=config.tenancy;const [region,setRegion]=useState('');
  const {pathname}=useLocation();
  if(!context?.available)return null;
  if(context.platform&&!/^\/(erp|article|content|media|orders|tenancy)(\/|$)/.test(pathname)&&pathname!=='/system/files')return null;
  const selected=context.platform?merchantScope():context.merchantId;
  const merchants=context.merchants.filter(m=>m.enabled&&(!region||m.regionIds.includes(Number(region))));
  return <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-card px-6 py-2 text-sm">
    <span className="text-muted-foreground">业务范围</span>
    {context.platform?<>
      <select aria-label="地区范围" className="rounded border border-border bg-background p-1 text-foreground" value={region} onChange={e=>setRegion(e.target.value)}><option value="">全部地区</option>{context.regions.filter(r=>r.enabled).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>
      <select aria-label="当前商户" className="rounded border border-border bg-background p-1 text-foreground" value={selected??0} onChange={e=>{setMerchantScope(Number(e.target.value));window.dispatchEvent(new Event('ao-merchant-changed'));}}><option value="0">平台数据（原有数据）</option>{merchants.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}{selected!==0&&!merchants.some(m=>m.id===selected)&&<option value={selected??0} disabled>{context.merchants.find(m=>m.id===selected)?.name??'商户不可用'}</option>}</select>
    </>:<span>{context.merchants.find(m=>m.id===selected)?.name??'未绑定商户，请联系平台管理员'}</span>}
    <span className="text-muted-foreground">{context.regionMode==='SINGLE_REGION'?'单地区归属':'跨地区经营'}</span>
  </div>;
}
