import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from '../../../components/AdminLayout';
import PageHeader from '../../../components/PageHeader';
import { toast } from '../../../lib/localizedToast';
import { erpApi } from '../api';
import { useLocale } from '../../../hooks/useLocale';
import ErpCsvImport from '../components/ErpCsvImport';

type Row = Record<string, unknown> & { id?: number };
const config: Record<string, { title: string; fields: string[]; statuses?: Array<[string, string]> }> = {
  products: { title: '商品管理', fields: ['sku', 'name', 'category', 'unit_price', 'stock', 'status'], statuses: [['on_sale', '上架'], ['off_sale', '下架']] },
  orders: { title: '订单管理', fields: ['order_no', 'customer', 'amount', 'item_count', 'status', 'order_date'], statuses: [['pending_payment', '待付款'], ['pending_shipping', '待发货'], ['completed', '已完成'], ['cancelled', '已取消']] },
  purchases: { title: '采购管理', fields: ['purchase_no', 'supplier', 'amount', 'item_count', 'status', 'order_date'], statuses: [['draft', '草稿'], ['pending_approval', '待审批'], ['approving', '审批中'], ['received', '已入库'], ['rejected', '已驳回']] },
  suppliers: { title: '供应商管理', fields: ['name', 'contact', 'phone', 'address', 'status'], statuses: [['active', '启用'], ['inactive', '停用']] },
  inventory: { title: '库存管理', fields: ['product_name', 'stock', 'safe_stock', 'status', 'updated_at'] },
  customers: { title: '客户管理', fields: ['name', 'contact', 'phone', 'address', 'level', 'total_spent'] },
  finance: { title: '财务管理', fields: ['record_type', 'amount', 'category', 'related_no', 'operator', 'record_time'], statuses: [['income', '收入'], ['expense', '支出']] },
};
const labels: Record<string, string> = { sku: 'SKU', name: '名称', category: '分类', unit_price: '单价', stock: '库存', status: '状态', order_no: '订单号', purchase_no: '采购单号', customer: '客户', supplier: '供应商', amount: '金额', item_count: '件数', order_date: '时间', product_name: '商品', safe_stock: '安全库存', updated_at: '更新时间', contact: '联系人', phone: '电话', address: '地址', level: '等级', total_spent: '累计消费', record_type: '类型', related_no: '关联单据', operator: '经办人', record_time: '时间' };
const label = (key: string) => labels[key] ?? key;
const statusNames: Record<string, Record<string, string>> = {
  'zh-CN': { pending_payment: '待付款', pending_shipping: '待发货', completed: '已完成', cancelled: '已取消', draft: '草稿', pending_approval: '待审批', approving: '审批中', received: '已入库', rejected: '已驳回', on_sale: '上架', off_sale: '下架', active: '启用', inactive: '停用', shortage: '缺货', warning: '库存预警', normal: '正常' },
  'en-US': { pending_payment: 'Pending payment', pending_shipping: 'Pending shipment', completed: 'Completed', cancelled: 'Cancelled', draft: 'Draft', pending_approval: 'Pending approval', approving: 'Approving', received: 'Received', rejected: 'Rejected', on_sale: 'On sale', off_sale: 'Off sale', active: 'Active', inactive: 'Inactive', shortage: 'Shortage', warning: 'Warning' },
  'ja-JP': { pending_payment: '支払待ち', pending_shipping: '発送待ち', completed: '完了', cancelled: 'キャンセル', draft: '下書き', pending_approval: '承認待ち', approving: '承認中', received: '入庫済み', rejected: '却下', on_sale: '販売中', off_sale: '販売停止', active: '有効', inactive: '無効' },
  'ko-KR': { pending_payment: '결제 대기', pending_shipping: '배송 대기', completed: '완료', cancelled: '취소됨', draft: '초안', pending_approval: '승인 대기', approving: '승인 중', received: '입고 완료', rejected: '거부됨', on_sale: '판매 중', off_sale: '판매 중지', active: '활성', inactive: '비활성' },
  'fr-FR': { pending_payment: 'Paiement en attente', pending_shipping: 'Expédition en attente', completed: 'Terminé', cancelled: 'Annulé', draft: 'Brouillon', pending_approval: 'Approbation en attente', approving: 'En approbation', received: 'Réceptionné', rejected: 'Rejeté', on_sale: 'En vente', off_sale: 'Hors vente', active: 'Actif', inactive: 'Inactif' },
  'de-DE': { pending_payment: 'Zahlung ausstehend', pending_shipping: 'Versand ausstehend', completed: 'Abgeschlossen', cancelled: 'Storniert', draft: 'Entwurf', pending_approval: 'Genehmigung ausstehend', approving: 'Wird genehmigt', received: 'Eingegangen', rejected: 'Abgelehnt', on_sale: 'Im Verkauf', off_sale: 'Nicht im Verkauf', active: 'Aktiv', inactive: 'Inaktiv' },
  'zh-TW': { pending_payment: '待付款', pending_shipping: '待出貨', completed: '已完成', cancelled: '已取消', draft: '草稿', pending_approval: '待審批', approving: '審批中', received: '已入庫', rejected: '已駁回', on_sale: '上架', off_sale: '下架', active: '啟用', inactive: '停用' },
};

export default function ErpResourcePage({ resource }: { resource: string }) {
  const { locale } = useLocale();
  const meta = config[resource] ?? config.products;
  const [rows, setRows] = useState<Row[]>([]);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});
  const [detail, setDetail] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await erpApi.list(resource, { keyword: keyword || undefined, status: status || undefined });
      setRows(alertsOnly && resource === 'inventory' ? data.filter(row => row.status === 'shortage' || row.status === 'warning') : data);
    }
    catch (error) { toast.error(error instanceof Error ? error.message : '加载失败'); }
  }, [resource, keyword, status, alertsOnly]);
  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      if (editing?.id) await erpApi.update(resource, editing.id, form); else await erpApi.create(resource, form);
      setEditing(null); setForm({}); await load(); toast.success('保存成功');
    } catch (error) { toast.error(error instanceof Error ? error.message : '保存失败'); }
    finally { setBusy(false); }
  };
  const remove = async (id: number) => {
    if (!window.confirm('确认删除这条记录？删除后不可恢复。')) return;
    try { await erpApi.remove(resource, id); await load(); toast.success('删除成功'); }
    catch (error) { toast.error(error instanceof Error ? error.message : '删除失败'); }
  };
  const exportCsv = () => {
    const csv = ['\ufeff' + meta.fields.map(label).join(','), ...rows.map(row => meta.fields.map(column => `"${String(row[column] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
    const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); anchor.download = `erp-${resource}.csv`; anchor.click();
  };
  const move = async (row: Row, type: 'in' | 'out') => {
    const quantity = Number(window.prompt(type === 'in' ? '入库数量' : '出库数量', '1'));
    if (!Number.isInteger(quantity) || quantity <= 0 || row.product_id === undefined) return;
    try { await erpApi.moveInventory(Number(row.product_id), { type, quantity, operator: '当前管理员' }); await load(); toast.success('库存已更新'); }
    catch (error) { toast.error(error instanceof Error ? error.message : '库存操作失败'); }
  };
  const approve = async (row: Row) => {
    if (row.id === undefined || !window.confirm('确认审批并入库？这将增加库存并生成财务支出流水。')) return;
    try { await erpApi.approvePurchase(Number(row.id), { status: 'received', operator: '当前管理员' }); await load(); toast.success('采购单已审批入库'); }
    catch (error) { toast.error(error instanceof Error ? error.message : '审批失败'); }
  };
  const copyProduct = async (row: Row) => {
    try {
      const stamp = Date.now().toString().slice(-6);
      await erpApi.create('products', { ...row, sku: `${String(row.sku ?? 'SKU')}-${stamp}`, name: `${String(row.name ?? '商品')}（副本）`, status: 'off_sale' });
      await load(); toast.success('商品副本已创建');
    } catch (error) { toast.error(error instanceof Error ? error.message : '复制失败'); }
  };

  const fields = useMemo(() => meta.fields.filter(field => !['id', 'created_at', 'updated_at', 'status'].includes(field)), [meta.fields]);
  const displayValue = (column: string, value: unknown) => {
    if (column === 'status') return statusNames[locale]?.[String(value)] ?? String(value ?? '-');
    if (column === 'amount' || column === 'unit_price' || column === 'total_spent') return `¥${Number(value ?? 0).toLocaleString()}`;
    return String(value ?? '-');
  };
  return <AdminLayout><style>{`.erp-card{background:var(--card);border:1px solid var(--border);border-radius:12px}.erp-input{height:36px;border:1px solid var(--input);border-radius:8px;padding:0 10px;background:var(--background);color:var(--foreground);box-sizing:border-box}.erp-btn{height:36px;border:0;border-radius:8px;padding:0 14px;background:var(--primary);color:var(--primary-foreground);cursor:pointer}.erp-btn.secondary{background:var(--secondary);color:var(--secondary-foreground)}.erp-link{border:0;background:none;color:var(--primary);cursor:pointer;margin-right:9px;padding:0}.erp-link.danger{color:var(--destructive)}.erp-table{width:100%;border-collapse:collapse}.erp-table th,.erp-table td{padding:11px 10px;border-bottom:1px solid var(--border);text-align:left;font-size:13px;white-space:nowrap}.erp-table th{color:var(--muted-foreground);font-weight:600}.erp-empty{padding:40px;text-align:center;color:var(--muted-foreground)}.erp-modal{position:fixed;inset:0;background:#0006;display:grid;place-items:center;z-index:1000;padding:16px;box-sizing:border-box}.erp-dialog{width:min(620px,calc(100vw - 32px));max-height:calc(100dvh - 32px);overflow:auto;background:var(--card);border-radius:14px;padding:22px;box-shadow:0 20px 60px #0004}`}</style>
    <PageHeader title={meta.title} description="数据来自 ERP 后端数据库，支持查询、增删改、导出和权限控制" actions={<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}><button className="erp-btn secondary" onClick={() => setImportOpen(true)}>导入 CSV</button><button className="erp-btn secondary" onClick={exportCsv}>导出 CSV</button>{resource === 'inventory' && <button className={`erp-btn ${alertsOnly ? '' : 'secondary'}`} onClick={() => setAlertsOnly(value => !value)}>{alertsOnly ? '显示全部库存' : '库存预警'}</button>}<button className="erp-btn" onClick={() => { setEditing({}); setForm({}); }}>新增</button></div>} />
    <div className="erp-card" style={{ padding: 16 }}><div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}><input className="erp-input" style={{ width: 260 }} placeholder="关键字搜索" value={keyword} onChange={event => setKeyword(event.target.value)} />{meta.statuses && <select className="erp-input" value={status} onChange={event => setStatus(event.target.value)}><option value="">全部状态</option>{meta.statuses.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>}<button className="erp-btn secondary" onClick={() => void load()}>刷新</button></div>
      <div style={{ overflowX: 'auto' }}><table className="erp-table"><thead><tr>{meta.fields.map(column => <th key={column}>{label(column)}</th>)}<th>操作</th></tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)}>{meta.fields.map(column => <td key={column}>{displayValue(column, row[column])}</td>)}<td><button className="erp-link" onClick={async () => { try { setDetail(await erpApi.get(resource, Number(row.id))); } catch { setDetail(row); } }}>详情</button><button className="erp-link" onClick={() => { setEditing(row); setForm({ ...row }); }}>编辑</button>{resource === 'products' && <><button className="erp-link" onClick={() => void copyProduct(row)}>复制</button><button className="erp-link" onClick={() => void erpApi.update(resource, Number(row.id), { status: row.status === 'on_sale' ? 'off_sale' : 'on_sale' }).then(load)}>切换上下架</button></>}{resource === 'inventory' && <><button className="erp-link" onClick={() => void move(row, 'in')}>入库</button><button className="erp-link" onClick={() => void move(row, 'out')}>出库</button></>}{resource === 'purchases' && row.status !== 'received' && <button className="erp-link" onClick={() => void approve(row)}>审批入库</button>}{row.id !== undefined && <button className="erp-link danger" onClick={() => void remove(Number(row.id))}>删除</button>}</td></tr>)}</tbody></table>{!rows.length && <div className="erp-empty">暂无数据</div>}</div>
    </div>
    {importOpen && <ErpCsvImport key={resource} resource={resource} title={meta.title} onClose={() => setImportOpen(false)} onImported={load} />}
    {editing && createPortal(<div className="erp-modal"><div className="erp-dialog" role="dialog" aria-modal="true" aria-labelledby="erp-edit-title"><h3 id="erp-edit-title" style={{ marginTop: 0 }}>{editing.id ? '编辑' : '新增'}{meta.title}</h3>{fields.map(field => <label key={field} style={{ display: 'block', marginBottom: 12 }}><span>{label(field)}</span><input className="erp-input" style={{ width: '100%', marginTop: 5 }} type={['amount', 'unit_price', 'stock', 'safe_stock', 'item_count', 'total_spent'].includes(field) ? 'number' : field.includes('date') || field.includes('time') ? 'datetime-local' : 'text'} value={String(form[field] ?? '')} onChange={event => setForm(previous => ({ ...previous, [field]: event.target.value }))} /></label>)}{meta.statuses && <label style={{ display: 'block', marginBottom: 12 }}><span>状态</span><select className="erp-input" style={{ width: '100%', marginTop: 5 }} value={String(form.status ?? meta.statuses[0][0])} onChange={event => setForm(previous => ({ ...previous, status: event.target.value }))}>{meta.statuses.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>}<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}><button className="erp-btn secondary" onClick={() => setEditing(null)}>取消</button><button className="erp-btn" disabled={busy} onClick={() => void save()}>{busy ? '保存中…' : '保存'}</button></div></div></div>, document.body)}
    {detail && createPortal(<div className="erp-modal"><div className="erp-dialog" role="dialog" aria-modal="true" aria-labelledby="erp-detail-title"><h3 id="erp-detail-title" style={{ marginTop: 0 }}>单据详情</h3><pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: 'var(--muted)', padding: 12, borderRadius: 8 }}>{JSON.stringify(detail, null, 2)}</pre><button className="erp-btn" onClick={() => setDetail(null)}>关闭</button></div></div>, document.body)}
  </AdminLayout>;
}
