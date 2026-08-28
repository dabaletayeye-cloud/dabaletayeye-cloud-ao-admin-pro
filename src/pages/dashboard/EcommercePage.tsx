import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { useLocale } from '../../hooks/useLocale';
import { getEcommerceDashboard } from '../../api';
import type { DashboardAnalyticsRange, EcommerceDashboardData } from '../../api';
import { toast } from '../../lib/localizedToast';
import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  LoaderCircleIcon,
  PackageIcon,
  RefreshCwIcon,
  ShoppingCartIcon,
  StarIcon,
  TrendingUpIcon,
  TruckIcon,
  UsersIcon,
} from 'lucide-react';

const CATEGORY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#e879f9', '#38bdf8'];

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
  }, [target, duration]);

  return value;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <section style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', ...style }}>{children}</section>;
}

function CardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <div style={{ padding: '20px 22px 0' }}><div style={{ fontSize: 15, fontWeight: 800, color: 'var(--foreground)' }}>{title}</div><div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 3 }}>{subtitle}</div></div>;
}

function StatCard({ label, value, prefix = '', suffix = '', change, icon, color, chart }: { label: string; value: number; prefix?: string; suffix?: string; change: number; icon: React.ReactNode; color: string; chart: React.ReactNode }) {
  const animated = useCountUp(value);
  const up = change >= 0;
  return <Card style={{ padding: '17px 18px', flex: '1 1 0', minWidth: 170 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span><span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 650 }}>{label}</span></div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '3px 7px', borderRadius: 99, fontSize: 10, fontWeight: 750, color: up ? '#059669' : '#dc2626', background: up ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)' }}>{up ? <ArrowUpIcon size={10} /> : <ArrowDownIcon size={10} />}{Math.abs(change)}%</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, marginTop: 14 }}><strong style={{ fontSize: 27, lineHeight: 1, color: 'var(--foreground)', letterSpacing: '-.5px', fontVariantNumeric: 'tabular-nums' }}>{prefix}{animated.toLocaleString()}{suffix}</strong>{chart}</div>
  </Card>;
}

function ProgressDonut({ value, color }: { value: number; color: string }) {
  const radius = 25; const circumference = 2 * Math.PI * radius; const percent = Math.max(0, Math.min(100, value));
  return <svg width="62" height="62" viewBox="0 0 62 62" aria-label={`${percent}%`}><circle cx="31" cy="31" r={radius} fill="none" stroke="var(--muted)" strokeWidth="7" /><circle cx="31" cy="31" r={radius} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${circumference * percent / 100} ${circumference}`} transform="rotate(-90 31 31)" /><text x="31" y="35" textAnchor="middle" fontSize="11" fontWeight="750" fill={color}>{percent}%</text></svg>;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 88; const height = 42; const values = data.length > 1 ? data : [0, 0]; const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${(index / (values.length - 1) * width).toFixed(1)},${(height - value / max * (height - 6) - 3).toFixed(1)}`).join(' ');
  return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}><polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx={width} cy={Number(points.split(' ').at(-1)?.split(',')[1] ?? height / 2)} r="3" fill={color} /></svg>;
}

function SalesTrendChart({ labels, current, previous }: { labels: string[]; current: number[]; previous: number[] }) {
  const width = 660; const height = 235; const mid = 104; const max = Math.max(...current, ...previous, 1); const column = width / Math.max(labels.length, 1); const bar = Math.max(4, Math.min(11, 100 / Math.max(labels.length, 1)));
  return <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
    <line x1="0" y1={mid} x2={width} y2={mid} stroke="var(--border)" />
    {[0, .5, 1].map((fraction, index) => <line key={index} x1="0" y1={mid - fraction * 82} x2={width} y2={mid - fraction * 82} stroke="var(--border)" strokeDasharray="3 4" opacity={fraction ? .55 : 1} />)}
    {labels.map((label, index) => { const x = index * column + column / 2; const up = ((current[index] ?? 0) / max) * 82; const down = ((previous[index] ?? 0) / max) * 82; return <g key={`${label}-${index}`}><rect x={x - bar - 2} y={mid - up} width={bar} height={up} rx="3" fill="#6366f1" /><rect x={x + 2} y={mid} width={bar} height={down} rx="3" fill="#f59e0b" opacity=".85" /><text x={x} y="211" textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">{label}</text></g>; })}
    <g transform="translate(510 12)"><rect width="9" height="9" rx="2" fill="#6366f1" /><text x="14" y="8" fontSize="10" fill="var(--muted-foreground)">本周期</text><rect x="70" width="9" height="9" rx="2" fill="#f59e0b" /><text x="84" y="8" fontSize="10" fill="var(--muted-foreground)">上一周期</text></g>
  </svg>;
}

interface CategorySlice { name: string; value: number; color: string; }
function CategoryDonut({ data, total }: { data: CategorySlice[]; total: number }) {
  const cx = 90; const cy = 90; const outer = 66; const inner = 43; const safeTotal = Math.max(total, 1); let angle = -Math.PI / 2;
  const slices = data.map(item => { const start = angle + .025; angle += item.value / safeTotal * 2 * Math.PI; const end = angle - .025; const large = end - start > Math.PI ? 1 : 0; const point = (radius: number, a: number) => [cx + radius * Math.cos(a), cy + radius * Math.sin(a)]; const [x0, y0] = point(outer, start); const [x1, y1] = point(inner, start); const [x2, y2] = point(outer, end); const [x3, y3] = point(inner, end); return { ...item, path: `M ${x0} ${y0} A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x1} ${y1} Z` }; });
  return <svg viewBox="0 0 180 180" style={{ width: '100%', maxWidth: 180, display: 'block', margin: '0 auto' }}>{slices.length ? slices.map(item => <path key={item.name} d={item.path} fill={item.color} />) : <circle cx={cx} cy={cy} r={(outer + inner) / 2} fill="none" stroke="var(--muted)" strokeWidth={outer - inner} />}<text x={cx} y={cy - 7} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">销售收入</text><text x={cx} y={cy + 12} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--foreground)">¥{total.toLocaleString()}</text></svg>;
}

function ConversionChart({ labels, data }: { labels: string[]; data: number[] }) {
  const width = 360; const height = 135; const values = data.length > 1 ? data : [0, 0]; const points = values.map((value, index) => [index / (values.length - 1) * width, height - Math.min(100, Math.max(0, value)) / 100 * (height - 16) - 5] as const); const line = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' '); const area = `${line} L${width} ${height} L0 ${height} Z`;
  return <svg viewBox={`0 0 ${width} ${height + 18}`} style={{ width: '100%', height: '100%', display: 'block' }}><defs><linearGradient id="ecommerce-conversion" x1="0" x2="0" y2="1"><stop stopColor="#6366f1" stopOpacity=".28" /><stop offset="1" stopColor="#6366f1" stopOpacity="0" /></linearGradient></defs><path d={area} fill="url(#ecommerce-conversion)" /><path d={line} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{labels.filter((_, index) => index === 0 || index === labels.length - 1 || index % Math.ceil(labels.length / 4) === 0).map(label => { const index = labels.indexOf(label); return <text key={label} x={index / Math.max(labels.length - 1, 1) * width} y={height + 14} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">{label}</text>; })}</svg>;
}

const emptyDashboard = (days: DashboardAnalyticsRange): EcommerceDashboardData => ({ days, rangeStart: '', rangeEnd: '', labels: Array.from({ length: days }, (_, index) => String(index + 1)), metrics: { todaySales: 0, todaySalesChange: 0, totalOrders: 0, ordersChange: 0, activeUsers: 0, activeUsersChange: 0, totalProducts: 0, productsChange: 0, fulfillmentRate: 0, fulfillmentChange: 0, conversionCount: 0, conversionChange: 0, revenue: 0, netProfit: 0 }, salesTrend: { current: Array(days).fill(0), previous: Array(days).fill(0) }, categories: [], conversionTrend: Array(days).fill(0), recentOrders: [] });

function exportCsv(data: EcommerceDashboardData) {
  const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows: Array<Array<string | number>> = [['日期', '本周期已完成收入', '上一周期已完成收入', '订单完成率'], ...data.labels.map((label, index) => [label, data.salesTrend.current[index] ?? 0, data.salesTrend.previous[index] ?? 0, data.conversionTrend[index] ?? 0])];
  const blob = new Blob([`\ufeff${rows.map(row => row.map(quote).join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `电商报表-${data.rangeStart || 'latest'}-${data.rangeEnd || 'latest'}.csv`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: '待处理', color: '#b45309', bg: '#fef3c7', icon: <ClockIcon size={14} /> },
  shipping: { label: '配送中', color: '#2563eb', bg: '#dbeafe', icon: <TruckIcon size={14} /> },
  completed: { label: '已完成', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircleIcon size={14} /> },
  cancelled: { label: '已取消', color: '#64748b', bg: '#e2e8f0', icon: <AlertCircleIcon size={14} /> },
};

export default function EcommercePage() {
  const { themeState } = useTheme();
  const { t } = useLocale();
  const primary = themeState.themeId === 'manga' ? '#E91E8C' : '#6366f1';
  const [range, setRange] = useState<DashboardAnalyticsRange>(7);
  const [data, setData] = useState<EcommerceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void getEcommerceDashboard(range).then(result => { if (active) { setData(result); setError(''); } }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : '电商数据加载失败'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [range, reloadKey]);

  const dashboard = data ?? emptyDashboard(range);
  const categoryTotal = dashboard.categories.reduce((sum, item) => sum + item.value, 0);
  const categories: CategorySlice[] = dashboard.categories.map((item, index) => ({ ...item, color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }));
  const todaySales = useCountUp(dashboard.metrics.todaySales);
  const conversionCount = useCountUp(dashboard.metrics.conversionCount);
  const period = dashboard.rangeStart && dashboard.rangeEnd ? `${dashboard.rangeStart} 至 ${dashboard.rangeEnd}` : `近 ${range} 天`;

  return <AdminLayout><main data-cmp="EcommercePage" style={{ minHeight: '100%', padding: 24, background: 'var(--background)', display: 'flex', flexDirection: 'column', gap: 20 }}>
    <header className="ecommerce-heading" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <div><h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>{t('ecommerce.title')}</h1><p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>{t('ecommerce.subtitle')} · {period}</p></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><div style={{ display: 'flex', padding: 3, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)' }}>{([7, 30, 90] as DashboardAnalyticsRange[]).map(days => <button key={days} type="button" onClick={() => setRange(days)} style={{ height: 28, padding: '0 10px', border: 0, borderRadius: 7, background: range === days ? primary : 'transparent', color: range === days ? '#fff' : 'var(--muted-foreground)', cursor: 'pointer', fontWeight: 650, fontSize: 12 }}>近{days}天</button>)}</div><button type="button" onClick={() => setReloadKey(value => value + 1)} disabled={loading} title="刷新数据" style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)', color: 'var(--muted-foreground)', cursor: loading ? 'wait' : 'pointer' }}><RefreshCwIcon size={15} className={loading ? 'animate-spin' : undefined} /></button><button type="button" onClick={() => { exportCsv(dashboard); toast.success('电商报表已导出'); }} style={{ height: 36, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)', color: 'var(--foreground)', cursor: 'pointer', fontSize: 12, fontWeight: 650 }}><DownloadIcon size={14} />导出</button></div>
    </header>
    {error && <div role="alert" style={{ padding: '10px 13px', border: '1px solid #fecaca', borderRadius: 10, background: '#fef2f2', color: '#b91c1c', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}><span>{error}</span><button type="button" onClick={() => setReloadKey(value => value + 1)} style={{ border: 0, background: 'transparent', color: '#b91c1c', fontWeight: 700, cursor: 'pointer' }}>重试</button></div>}
    <div className="ecommerce-top" style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1.1fr) minmax(450px, .9fr)', gap: 18 }}>
      <section style={{ position: 'relative', minHeight: 224, overflow: 'hidden', borderRadius: 20, padding: '30px 34px', color: '#1e1b4b', background: 'linear-gradient(135deg,#dbeafe 0%,#ede9fe 52%,#c7d2fe 100%)' }}><div style={{ position: 'absolute', width: 190, height: 190, borderRadius: '50%', right: 55, top: -60, background: 'rgba(139,92,246,.12)' }} /><div style={{ position: 'absolute', right: 44, bottom: 35, width: 180, height: 105, borderRadius: 16, transform: 'skew(-8deg)', background: 'rgba(99,102,241,.14)' }} /><div style={{ position: 'relative', zIndex: 1 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,.68)', border: '1px solid rgba(99,102,241,.18)', color: '#4f46e5', fontSize: 11, fontWeight: 750 }}><StarIcon size={10} fill="#f59e0b" color="#f59e0b" />实时订单数据</span><h2 style={{ margin: '15px 0 6px', fontSize: 24, fontWeight: 900 }}>欢迎回来 Admin 👋</h2><p style={{ margin: 0, color: '#4f46e5', fontSize: 13 }}>销售额、订单和完成率均来自订单管理。</p><div style={{ marginTop: 22, display: 'inline-flex', flexDirection: 'column', gap: 5, padding: '14px 18px', minWidth: 190, borderRadius: 15, background: 'rgba(255,255,255,.72)', border: '1px solid rgba(255,255,255,.9)' }}><span style={{ fontSize: 11, color: '#6366f1', fontWeight: 750 }}>最近交易日销售额</span><strong style={{ fontSize: 31, fontVariantNumeric: 'tabular-nums' }}>¥{todaySales.toLocaleString()}</strong><span style={{ color: dashboard.metrics.todaySalesChange >= 0 ? '#059669' : '#dc2626', fontSize: 12, fontWeight: 750 }}>{dashboard.metrics.todaySalesChange >= 0 ? <ArrowUpIcon size={11} /> : <ArrowDownIcon size={11} />} 较上一周期同日 {Math.abs(dashboard.metrics.todaySalesChange)}%</span></div></div></section>
      <div className="ecommerce-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}><StatCard label="总订单量" value={dashboard.metrics.totalOrders} change={dashboard.metrics.ordersChange} icon={<ShoppingCartIcon size={17} />} color="#6366f1" chart={<ProgressDonut value={dashboard.metrics.fulfillmentRate} color="#6366f1" />} /><StatCard label="活跃用户" value={dashboard.metrics.activeUsers} change={dashboard.metrics.activeUsersChange} icon={<UsersIcon size={17} />} color="#10b981" chart={<Sparkline data={dashboard.conversionTrend} color="#10b981" />} /><StatCard label="商品总数" value={dashboard.metrics.totalProducts} change={dashboard.metrics.productsChange} icon={<PackageIcon size={17} />} color="#f59e0b" chart={<Sparkline data={dashboard.salesTrend.current} color="#f59e0b" />} /><StatCard label="订单完成率" value={dashboard.metrics.fulfillmentRate} suffix="%" change={dashboard.metrics.fulfillmentChange} icon={<CheckCircleIcon size={17} />} color="#e879f9" chart={<ProgressDonut value={dashboard.metrics.fulfillmentRate} color="#e879f9" />} /></div>
    </div>
    <div className="ecommerce-charts" style={{ display: 'grid', gridTemplateColumns: '1.2fr .9fr .85fr', gap: 18 }}>
      <Card><CardHeader title="销售趋势" subtitle="按订单完成状态统计的销售收入" /><div style={{ height: 235, padding: '12px 22px 20px' }}><SalesTrendChart labels={dashboard.labels} current={dashboard.salesTrend.current} previous={dashboard.salesTrend.previous} /></div></Card>
      <Card><CardHeader title="销售分类" subtitle="按已完成订单中的商品类型统计" /><div style={{ padding: '10px 20px 19px' }}><CategoryDonut data={categories} total={categoryTotal} /><div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '7px 12px' }}>{categories.length ? categories.map(item => <span key={item.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted-foreground)' }}><i style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />{item.name} {categoryTotal ? Math.round(item.value / categoryTotal * 100) : 0}%</span>) : <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>暂无已完成订单</span>}</div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 15, paddingTop: 14, borderTop: '1px solid var(--border)' }}><div><div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>营业收入</div><strong style={{ fontSize: 17, color: 'var(--foreground)' }}>¥{dashboard.metrics.revenue.toLocaleString()}</strong></div><div><div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>预估净利润</div><strong style={{ fontSize: 17, color: 'var(--foreground)' }}>¥{dashboard.metrics.netProfit.toLocaleString()}</strong></div></div></div></Card>
      <Card><CardHeader title="订单转化" subtitle="当前周期内每日订单完成率" /><div style={{ padding: '17px 22px 8px' }}><div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}><strong style={{ fontSize: 39, color: 'var(--foreground)', letterSpacing: '-1px' }}>{conversionCount.toLocaleString()}</strong><span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '3px 8px', borderRadius: 99, background: dashboard.metrics.conversionChange >= 0 ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)', color: dashboard.metrics.conversionChange >= 0 ? '#059669' : '#dc2626', fontSize: 11, fontWeight: 750 }}>{dashboard.metrics.conversionChange >= 0 ? <ArrowUpIcon size={10} /> : <ArrowDownIcon size={10} />}{Math.abs(dashboard.metrics.conversionChange)}%</span></div><p style={{ margin: '5px 0 8px', fontSize: 11, color: 'var(--muted-foreground)' }}>本周期完成订单数</p></div><div style={{ height: 153, padding: '0 12px 4px' }}><ConversionChart labels={dashboard.labels} data={dashboard.conversionTrend} /></div></Card>
    </div>
    <Card><CardHeader title="最近订单活动" subtitle="当前筛选周期内最新的订单记录" /><div style={{ padding: '13px 0 7px' }}>{dashboard.recentOrders.length ? dashboard.recentOrders.map((order, index) => { const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.cancelled; return <div key={order.id} style={{ display: 'grid', gridTemplateColumns: '38px minmax(0,1fr) auto auto', gap: 12, alignItems: 'center', padding: '12px 22px', borderTop: index ? '1px solid var(--border)' : 0 }}><span style={{ width: 36, height: 36, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: status.bg, color: status.color }}>{status.icon}</span><div style={{ minWidth: 0 }}><strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--foreground)', fontSize: 13 }}>{order.orderNo} · {order.customer}</strong><span style={{ display: 'block', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--muted-foreground)', fontSize: 11 }}>{order.product}</span></div><span style={{ color: primary, fontSize: 13, fontWeight: 750 }}>¥{order.amount.toLocaleString()}</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 99, background: status.bg, color: status.color, fontSize: 11, fontWeight: 700 }}>{status.label} · {order.date}</span></div>; }) : <div style={{ padding: 38, textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>当前周期暂无订单</div>}</div></Card>
    {loading && <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 300, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)', boxShadow: '0 8px 24px rgba(0,0,0,.12)', color: 'var(--muted-foreground)', fontSize: 12 }}><LoaderCircleIcon size={14} className="animate-spin" />电商数据加载中</div>}
    <style>{`@media (max-width: 1160px) { .ecommerce-top, .ecommerce-charts { grid-template-columns: 1fr !important; } } @media (max-width: 650px) { .ecommerce-heading { flex-direction: column; } .ecommerce-stats { grid-template-columns: 1fr !important; } [data-cmp="EcommercePage"] { padding: 16px !important; } }`}</style>
  </main></AdminLayout>;
}
