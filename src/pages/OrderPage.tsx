import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2Icon, ChevronDownIcon, ClockIcon, DownloadIcon, LoaderCircleIcon, MoreHorizontalIcon, PackageIcon, SearchIcon, TruckIcon, XCircleIcon } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getOrderStats, listOrders, orderAction } from '../api/orders';
import type { OrderInfo, OrderStats, OrderStatus } from '../api/types';
import { useTheme } from '../hooks/useTheme';
import { toast } from '../lib/localizedToast';

const PINK = '#E91E8C';
const EMPTY_STATS: OrderStats = { total: 0, pending: 0, shipping: 0, completed: 0, cancelled: 0, revenue: 0 };

const STATUS: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: '待处理', color: '#b45309', bg: '#fef3c7', icon: <ClockIcon size={12} /> },
  shipping: { label: '配送中', color: '#2563eb', bg: '#dbeafe', icon: <TruckIcon size={12} /> },
  completed: { label: '已完成', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle2Icon size={12} /> },
  cancelled: { label: '已取消', color: '#dc2626', bg: '#fee2e2', icon: <XCircleIcon size={12} /> },
};
const FILTERS: { key: 'all' | OrderStatus; label: string }[] = [{ key: 'all', label: '全部' }, { key: 'pending', label: '待处理' }, { key: 'shipping', label: '配送中' }, { key: 'completed', label: '已完成' }, { key: 'cancelled', label: '已取消' }];

function exportCsv(orders: OrderInfo[]) {
  const safe = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [['订单号', '用户', '商品', '渠道', '金额', '日期', '状态'], ...orders.map(order => [order.orderNo, order.customer, order.product, order.channel, order.amount, order.date, STATUS[order.status].label])];
  const blob = new Blob([`\ufeff${rows.map(row => row.map(safe).join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `订单导出-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function OrderPage() {
  const { themeState } = useTheme();
  const primary = themeState.themeId === 'manga' ? PINK : 'var(--primary)';
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [stats, setStats] = useState<OrderStats>(EMPTY_STATS);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [items, summary] = await Promise.all([listOrders(), getOrderStats()]);
      setOrders(items); setStats(summary); setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : '订单加载失败'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return orders.filter(order => (!search || `${order.orderNo}${order.customer}${order.product}`.toLowerCase().includes(search)) && (filter === 'all' || order.status === filter));
  }, [orders, keyword, filter]);

  const mutate = async (order: OrderInfo, action: 'process' | 'complete' | 'cancel' | 'restore') => {
    const actionText = action === 'process' ? '确认将订单更新为配送中？' : action === 'complete' ? '确认完成该订单？' : action === 'cancel' ? '确认取消该订单？' : '确认恢复为待处理订单？';
    if (!window.confirm(actionText)) return;
    setBusyId(order.id); setOpenMenu(null);
    try {
      const updated = await orderAction(order.id, action);
      setOrders(current => current.map(item => item.id === order.id ? updated : item));
      setStats(await getOrderStats());
      toast.success(`订单 ${updated.orderNo} 已更新为${STATUS[updated.status].label}`);
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : '订单操作失败'); }
    finally { setBusyId(null); }
  };

  const cards = [{ label: '总订单', value: stats.total, color: primary, icon: <PackageIcon size={18} /> }, { label: '待处理', value: stats.pending, color: '#f59e0b', icon: <ClockIcon size={18} /> }, { label: '已完成', value: stats.completed, color: '#22c55e', icon: <CheckCircle2Icon size={18} /> }, { label: '累计营收', value: `¥${Number(stats.revenue).toFixed(0)}`, color: '#6366f1', icon: <PackageIcon size={18} /> }];

  return <AdminLayout><main data-cmp="OrderPage" style={{ padding: 24, minHeight: '100%', background: 'var(--background)' }} onClick={() => openMenu !== null && setOpenMenu(null)}>
    <div style={{ marginBottom: 22 }}><h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>订单管理</h1><p style={{ margin: '7px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>跟踪和管理所有用户订单</p></div>
    <div className="order-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>{cards.map(card => <div key={card.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 19px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}><span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{card.label}</span><span style={{ color: card.color }}>{card.icon}</span></div><strong style={{ color: 'var(--foreground)', fontSize: 25 }}>{card.value}</strong></div>)}</div>
    <section style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'visible' }} onClick={event => event.stopPropagation()}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><div style={{ position: 'relative', flex: '1 1 270px', maxWidth: 360 }}><SearchIcon size={15} style={{ position: 'absolute', left: 11, top: 10, color: 'var(--muted-foreground)' }} /><input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="搜索订单号 / 用户 / 商品…" style={{ width: '100%', height: 35, boxSizing: 'border-box', padding: '0 10px 0 33px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--muted)', color: 'var(--foreground)', outline: 0 }} /></div>{FILTERS.map(item => <button key={item.key} type="button" onClick={() => setFilter(item.key)} style={{ height: 32, padding: '0 12px', border: 0, borderRadius: 7, background: filter === item.key ? primary : 'var(--muted)', color: filter === item.key ? '#fff' : 'var(--muted-foreground)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{item.label}</button>)}<span style={{ flex: 1 }} /><button type="button" onClick={() => { exportCsv(visible); toast.success(`已导出 ${visible.length} 条订单`); }} style={{ height: 32, padding: '0 11px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--card)', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><DownloadIcon size={14} />导出</button></div>
      {error && <div role="alert" style={{ margin: 16, padding: '10px 12px', borderRadius: 7, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13 }}>{error}</div>}
      <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 13 }}><thead><tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>{['订单号', '用户', '商品', '渠道', '金额', '日期', '状态', '操作'].map(label => <th key={label} style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: 12, whiteSpace: 'nowrap' }}>{label}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center', color: 'var(--muted-foreground)' }}><LoaderCircleIcon size={22} className="animate-spin" style={{ margin: 'auto' }} /></td></tr> : visible.map(order => { const state = STATUS[order.status]; const actions = order.status === 'pending' ? [['process', '开始配送'], ['cancel', '取消订单']] : order.status === 'shipping' ? [['complete', '确认完成'], ['cancel', '取消订单']] : order.status === 'cancelled' ? [['restore', '恢复待处理']] : []; return <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: '13px 18px', fontFamily: 'monospace', fontSize: 12, color: 'var(--muted-foreground)' }}>{order.orderNo}</td><td style={{ padding: '13px 18px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 27, height: 27, borderRadius: '50%', background: primary, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{order.avatar}</span><span style={{ color: 'var(--foreground)' }}>{order.customer}</span></div></td><td style={{ padding: '13px 18px', color: 'var(--foreground)' }}>{order.product}</td><td style={{ padding: '13px 18px' }}><span style={{ padding: '3px 8px', borderRadius: 10, background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 12 }}>{order.channel}</span></td><td style={{ padding: '13px 18px', color: primary, fontWeight: 700 }}>¥{order.amount}</td><td style={{ padding: '13px 18px', color: 'var(--muted-foreground)', fontSize: 12 }}>{order.date}</td><td style={{ padding: '13px 18px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 10, color: state.color, background: state.bg, fontSize: 12, fontWeight: 700 }}>{state.icon}{state.label}</span></td><td style={{ padding: '13px 18px', position: 'relative' }}>{busyId === order.id ? <LoaderCircleIcon size={16} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} /> : actions.length ? <><button type="button" aria-label={`${order.orderNo} 操作`} onClick={event => { event.stopPropagation(); setOpenMenu(current => current === order.id ? null : order.id); }} style={{ width: 28, height: 28, border: 0, background: 'transparent', color: 'var(--muted-foreground)', cursor: 'pointer' }}><MoreHorizontalIcon size={17} /></button>{openMenu === order.id && <div style={{ position: 'absolute', zIndex: 5, top: 42, right: 16, minWidth: 118, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.12)', padding: 4 }}>{actions.map(([action, label]) => <button key={action} type="button" onClick={() => void mutate(order, action as 'process' | 'complete' | 'cancel' | 'restore')} style={{ display: 'block', width: '100%', padding: '8px 9px', border: 0, borderRadius: 5, background: 'transparent', color: action === 'cancel' ? '#dc2626' : 'var(--foreground)', textAlign: 'left', cursor: 'pointer', fontSize: 12 }}>{label}</button>)}</div>}</> : <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>—</span>}</td></tr>; })}</tbody></table></div>
      {!loading && visible.length === 0 && <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>暂无匹配订单</div>}<div style={{ padding: '12px 18px', color: 'var(--muted-foreground)', fontSize: 12 }}>共 {visible.length} 条记录</div>
    </section><style>{`@media (max-width: 900px) {.order-summary { grid-template-columns: repeat(2, minmax(150px, 1fr)) !important; }} @media (max-width: 480px) {.order-summary { grid-template-columns: 1fr !important; }}`}</style>
  </main></AdminLayout>;
}
