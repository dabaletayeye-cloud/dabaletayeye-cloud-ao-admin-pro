import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import PageHeader from '../components/PageHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { tenancyApi } from '../api/tenancy';
import type { Merchant, Region, MerchantMember, TenancyContext } from '../api/tenancyTypes';
import { useEdition } from '../core/EditionProvider';
import { toast } from '../lib/localizedToast';

const inputClass='h-10 rounded-lg border border-border bg-background px-3 text-foreground';
const buttonClass='rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50';
export default function TenancyPage({ kind }: { kind: 'regions' | 'merchants' }) {
  const { refreshEdition, config }=useEdition();
  const [context,setContext]=useState<TenancyContext>(); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const [editing,setEditing]=useState<Region|Merchant|'new'|null>(null);
  const [form,setForm]=useState({code:'',name:'',enabled:true,regionIds:[] as number[]});
  const [keyword,setKeyword]=useState(''); const [regionFilter,setRegionFilter]=useState('');
  const [memberMerchant,setMemberMerchant]=useState<Merchant>(); const [members,setMembers]=useState<MerchantMember[]>([]);
  const [accountType,setAccountType]=useState(config.accountTypes?.some(t=>t.id==='merchant')?'merchant':'user'); const [userId,setUserId]=useState('');
  const title=kind==='regions'?'地区管理':'商户管理';
  const load=useCallback(async()=>{try{setContext(await tenancyApi.context());setError('');}catch(e){setError((e as Error).message);}},[]);
  useEffect(()=>{void load();},[load]);
  function open(row:Region|Merchant|'new'){setEditing(row);setForm(row==='new'?{code:'',name:'',enabled:true,regionIds:[]}:{...row,regionIds:'regionIds' in row?[...row.regionIds]:[]});}
  async function save(){setBusy(true);try{
    const id=editing&&editing!=='new'?editing.id:undefined;
    if(kind==='merchants')await tenancyApi.saveMerchant(form,id);else await tenancyApi.saveRegion({code:form.code,name:form.name,enabled:form.enabled},id);
    setEditing(null);await load();await refreshEdition();toast.success('保存成功');
  }catch(e){toast.error((e as Error).message);}finally{setBusy(false);}}
  async function showMembers(row:Merchant){try{setMembers(await tenancyApi.members(row.id));setMemberMerchant(row);}catch(e){toast.error((e as Error).message);}}
  async function bind(){if(!memberMerchant)return;setBusy(true);try{const id=Number(userId);if(!Number.isSafeInteger(id)||id<=0)throw new Error('请输入有效账号 ID');await tenancyApi.bind(memberMerchant.id,accountType,id);setMembers(await tenancyApi.members(memberMerchant.id));setUserId('');toast.success('已绑定，请该账号重新登录');}catch(e){toast.error((e as Error).message);}finally{setBusy(false);}}
  async function unbind(member:MerchantMember){if(!confirm('解除该账号的商户归属？该账号需要重新登录。'))return;try{await tenancyApi.unbind(member.merchantId,member.accountType,member.userId);setMembers(await tenancyApi.members(member.merchantId));}catch(e){toast.error((e as Error).message);}}
  const rows=(kind==='regions'?context?.regions:context?.merchants)?.filter(row=>(!keyword||`${row.code} ${row.name}`.includes(keyword))&&(!regionFilter||'regionIds' in row&&(row as Merchant).regionIds.includes(Number(regionFilter))))??[];
  return <AdminLayout><PageHeader title={title} description={context?.regionMode==='MULTI_REGION'?'跨地区经营：一个商户可关联多个地区，商户之间的数据独立。':'地区归属：一个商户对应一个地区，同一地区可有多个商户。'} />
    {error&&<p role="alert" className="my-4 text-destructive">{error}</p>}
    {!context?<p>加载中…</p>:!context.available?<p className="my-5 text-muted-foreground">此功能需要开启多地区、多商户配置，适用于 SaaS、电商、CRM 和全部版。</p>:<>
      <div className="my-5 flex flex-wrap gap-3"><input className={inputClass} placeholder="搜索名称或编码" value={keyword} onChange={e=>setKeyword(e.target.value)} />
        {kind==='merchants'&&<select aria-label="按地区筛选商户" className={inputClass} value={regionFilter} onChange={e=>setRegionFilter(e.target.value)}><option value="">全部地区</option>{context.regions.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>}
        <button className={buttonClass} onClick={()=>void load()}>刷新</button>{context.platform&&<button className={`${buttonClass} ml-auto`} onClick={()=>open('new')}>新增{kind==='regions'?'地区':'商户'}</button>}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="p-3">编码</th><th>名称</th>{kind==='merchants'&&<th>经营地区</th>}<th>状态</th><th>操作</th></tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-b border-border last:border-0"><td className="p-3">{row.code}</td><td>{row.name}</td>{kind==='merchants'&&<td>{('regionIds' in row?(row as Merchant).regionIds:[]).map(id=>context.regions.find(r=>r.id===id)?.name??id).join('、')}</td>}<td>{row.enabled?'启用':'停用'}</td><td>{context.platform&&<><button className="mr-4 text-primary" onClick={()=>open(row)}>编辑</button>{kind==='merchants'&&<button className="text-primary" onClick={()=>void showMembers(row as Merchant)}>账号绑定</button>}</>}</td></tr>)}</tbody></table>{!rows.length&&<p className="p-8 text-center text-muted-foreground">暂无数据</p>}</div>
    </>}
    <Dialog open={editing!==null} onOpenChange={v=>{if(!v&&!busy)setEditing(null);}}><DialogContent aria-describedby={undefined}><DialogHeader><DialogTitle>{editing==='new'?'新增':'编辑'}{kind==='regions'?'地区':'商户'}</DialogTitle></DialogHeader>
      <label className="grid gap-2">编码<input className={inputClass} maxLength={64} value={form.code} onChange={e=>setForm({...form,code:e.target.value})} /></label>
      <label className="grid gap-2">名称<input className={inputClass} maxLength={128} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
      {kind==='merchants'&&<fieldset className="grid gap-2"><legend className="mb-2">经营地区{context?.regionMode==='MULTI_REGION'?'（可多选）':'（单选）'}</legend>{context?.regions.filter(r=>r.enabled||form.regionIds.includes(r.id)).map(r=><label key={r.id} className="flex gap-2"><input type={context.regionMode==='SINGLE_REGION'?'radio':'checkbox'} name="region" checked={form.regionIds.includes(r.id)} onChange={e=>setForm({...form,regionIds:context.regionMode==='SINGLE_REGION'?[r.id]:e.target.checked?[...form.regionIds,r.id]:form.regionIds.filter(id=>id!==r.id)})}/>{r.name}{!r.enabled&&'（已停用）'}</label>)}</fieldset>}
      <label className="flex gap-2"><input type="checkbox" checked={form.enabled} onChange={e=>setForm({...form,enabled:e.target.checked})}/>启用</label>
      <DialogFooter><button className={buttonClass} disabled={busy} onClick={()=>void save()}>{busy?'保存中…':'保存'}</button></DialogFooter>
    </DialogContent></Dialog>
    <Dialog open={!!memberMerchant} onOpenChange={v=>{if(!v)setMemberMerchant(undefined);}}><DialogContent aria-describedby={undefined}><DialogHeader><DialogTitle>{memberMerchant?.name} · 账号绑定</DialogTitle></DialogHeader>
      <p className="text-sm text-muted-foreground">先在用户管理中创建账号，再绑定对应类型和 ID。一个账号归属一个商户，解除绑定后才能更换归属。</p>
      <div className="flex flex-wrap gap-2"><select aria-label="账号类型" className={inputClass} value={accountType} onChange={e=>setAccountType(e.target.value)}>{(config.accountTypes?.length?config.accountTypes:[{id:'user',label:'业务用户'}]).map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select><input aria-label="账号 ID" className={`${inputClass} min-w-0 flex-1`} placeholder="账号 ID" value={userId} onChange={e=>setUserId(e.target.value)}/><button className={buttonClass} disabled={busy} onClick={()=>void bind()}>绑定</button></div>
      {members.map(member=><div key={`${member.accountType}:${member.userId}`} className="flex justify-between border-b border-border py-2"><span>{member.accountType} / {member.userId}</span><button className="text-destructive" onClick={()=>void unbind(member)}>解除绑定</button></div>)}
    </DialogContent></Dialog>
  </AdminLayout>;
}
