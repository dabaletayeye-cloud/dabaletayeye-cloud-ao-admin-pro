import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useEdition, moduleMenus } from '../core/EditionProvider';
export default function MerchantHome(){
  const {config,filterMenus}=useEdition();const context=config.tenancy;
  const merchant=context?.merchants.find(m=>m.id===context.merchantId);
  return <AdminLayout><h1 className="mb-3 text-2xl font-bold">{merchant?.name??'商户工作台'}</h1>
    <p className="mb-6 text-muted-foreground">{merchant?`经营地区：${context?.regions.filter(r=>merchant.regionIds.includes(r.id)).map(r=>r.name).join('、')}`:'此账号尚未绑定商户，请联系平台管理员。'}</p>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{merchant&&filterMenus(moduleMenus).map(menu=><Link key={menu.path} to={menu.path} className="rounded-xl border border-border bg-card p-5 text-foreground hover:border-primary">{menu.label}</Link>)}</div>
  </AdminLayout>;
}
