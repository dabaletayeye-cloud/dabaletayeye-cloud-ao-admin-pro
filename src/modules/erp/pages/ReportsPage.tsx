import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import PageHeader from '../../../components/PageHeader';
import { toast } from '../../../lib/localizedToast';
import { erpApi } from '../api';

type Point = Record<string, unknown>;
export default function ReportsPage() {
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [range, setRange] = useState<'day' | 'month'>('day');
  useEffect(() => { erpApi.reports().then(setReport).catch(error => toast.error(error instanceof Error ? error.message : '报表加载失败')); }, []);
  const sourceTrend = Array.isArray(report?.salesTrend) ? report.salesTrend as Point[] : [];
  const trend = useMemo(() => {
    if (range === 'day') return sourceTrend;
    const grouped = new Map<string, number>();
    sourceTrend.forEach(item => { const label = String(item.label ?? '').slice(0, 7); grouped.set(label, (grouped.get(label) ?? 0) + Number(item.value ?? 0)); });
    return [...grouped].map(([label, value]) => ({ label, value }));
  }, [range, sourceTrend]);
  const status = Array.isArray(report?.orderStatus) ? report.orderStatus as Point[] : [];
  const top = Array.isArray(report?.topProducts) ? report.topProducts as Point[] : [];
  const metrics = (report?.metrics ?? {}) as Record<string, unknown>;
  const maxTrend = Math.max(1, ...trend.map(item => Number(item.value ?? 0)));
  const exportReport = () => {
    const rows = [['周期', '销售额'], ...trend.map(item => [String(item.label ?? ''), String(item.value ?? 0)]), [], ['商品', '销量'], ...top.map(item => [String(item.label ?? ''), String(item.value ?? 0)])];
    const csv = '\ufeff' + rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'ERP报表.csv'; a.click();
  };
  const cashflow = Number(metrics.netCashFlow ?? 0);
  return <AdminLayout><style>{`.erp-card{background:var(--card);border:1px solid var(--border);border-radius:12px}.erp-empty{padding:40px;text-align:center;color:var(--muted-foreground)}.erp-btn{height:34px;border:0;border-radius:8px;padding:0 12px;background:var(--primary);color:var(--primary-foreground);cursor:pointer}.erp-btn.secondary{background:var(--secondary);color:var(--secondary-foreground)}`}</style><PageHeader title="报表中心" description="销售趋势、订单状态、商品销量与现金流均由真实业务数据聚合" actions={<><button className={`erp-btn ${range === 'day' ? '' : 'secondary'}`} onClick={() => setRange('day')}>按日</button><button className={`erp-btn ${range === 'month' ? '' : 'secondary'}`} onClick={() => setRange('month')}>按月</button><button className="erp-btn secondary" onClick={exportReport}>导出报表</button></>} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 16 }}><Metric title="总收入" value={Number(metrics.totalIncome ?? 0)} /><Metric title="总支出" value={Number(metrics.totalExpense ?? 0)} negative /><Metric title="净现金流" value={cashflow} negative={cashflow < 0} /><Metric title="有效订单" value={Number(metrics.totalOrders ?? 0)} plain /></div>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}><div className="erp-card" style={{ padding: 20 }}><h3>销售趋势</h3>{trend.length ? trend.map(item => <div key={String(item.label)} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 90px', gap: 10, alignItems: 'center', margin: '12px 0' }}><span>{String(item.label)}</span><div style={{ height: 10, background: 'var(--muted)', borderRadius: 8 }}><div style={{ width: `${Math.round(Number(item.value ?? 0) / maxTrend * 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: 8 }} /></div><strong>¥{Number(item.value ?? 0).toLocaleString()}</strong></div>) : <div className="erp-empty">暂无销售数据</div>}</div><div className="erp-card" style={{ padding: 20 }}><h3>订单状态分布</h3>{status.map(item => <div key={String(item.label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}><span>{String(item.label)}</span><strong>{String(item.value)}</strong></div>)}</div></div>
    <div className="erp-card" style={{ padding: 20, marginTop: 16 }}><h3>商品销量 TOP10</h3>{top.map((item, index) => <div key={String(item.label)} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 80px', gap: 8, padding: '9px 0', borderBottom: '1px solid var(--border)' }}><span>{index + 1}</span><span>{String(item.label)}</span><strong>{String(item.value)} 件</strong></div>)}</div>
  </AdminLayout>;
}
function Metric({ title, value, negative, plain }: { title: string; value: number; negative?: boolean; plain?: boolean }) { return <div className="erp-card" style={{ padding: 18 }}><small>{title}</small><h2 style={{ margin: '8px 0 0', color: negative ? 'var(--destructive)' : undefined }}>{plain ? value.toLocaleString() : `¥${value.toLocaleString()}`}</h2></div>; }
