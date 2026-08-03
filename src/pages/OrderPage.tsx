import { useState } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import {
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon,
  PackageIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

interface Order {
  id: string;
  customer: string;
  avatar: string;
  product: string;
  amount: number;
  status: 'pending' | 'shipping' | 'completed' | 'cancelled';
  date: string;
  channel: string;
}

const ORDERS: Order[] = [
  { id: 'ORD-20240001', customer: '林晓薇', avatar: '林', product: '漫剧年会员 · 1年', amount: 198, status: 'completed', date: '2024-06-01', channel: '微信支付' },
  { id: 'ORD-20240002', customer: '陈建国', avatar: '陈', product: '漫剧季会员 · 3月', amount: 68, status: 'shipping', date: '2024-06-02', channel: '支付宝' },
  { id: 'ORD-20240003', customer: '张雨欣', avatar: '张', product: '单话解锁 × 5', amount: 25, status: 'pending', date: '2024-06-03', channel: '微信支付' },
  { id: 'ORD-20240004', customer: '王浩然', avatar: '王', product: '漫剧月会员 · 1月', amount: 28, status: 'completed', date: '2024-06-04', channel: '银行卡' },
  { id: 'ORD-20240005', customer: '刘梦琪', avatar: '刘', product: '漫剧年会员 · 1年', amount: 198, status: 'cancelled', date: '2024-06-05', channel: '支付宝' },
  { id: 'ORD-20240006', customer: '赵天宇', avatar: '赵', product: '单话解锁 × 10', amount: 50, status: 'completed', date: '2024-06-06', channel: '微信支付' },
  { id: 'ORD-20240007', customer: '孙悦', avatar: '孙', product: '漫剧季会员 · 3月', amount: 68, status: 'pending', date: '2024-06-07', channel: '支付宝' },
  { id: 'ORD-20240008', customer: '周晨曦', avatar: '周', product: '漫剧年会员 · 1年', amount: 198, status: 'completed', date: '2024-06-08', channel: '微信支付' },
  { id: 'ORD-20240009', customer: '吴佳怡', avatar: '吴', product: '单话解锁 × 3', amount: 15, status: 'shipping', date: '2024-06-09', channel: '银行卡' },
  { id: 'ORD-20240010', customer: '郑子轩', avatar: '郑', product: '漫剧月会员 · 1月', amount: 28, status: 'completed', date: '2024-06-10', channel: '微信支付' },
];

const STATUS_META: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '待处理', bg: 'rgba(234,179,8,0.12)', color: '#b45309', icon: <ClockIcon size={11} /> },
  shipping: { label: '配送中', bg: 'rgba(59,130,246,0.12)', color: '#2563eb', icon: <TruckIcon size={11} /> },
  completed: { label: '已完成', bg: 'rgba(34,197,94,0.12)', color: '#16a34a', icon: <CheckCircleIcon size={11} /> },
  cancelled: { label: '已取消', bg: 'rgba(239,68,68,0.12)', color: '#dc2626', icon: <XCircleIcon size={11} /> },
};

const STAT_FILTERS = [
  { label: '全部', value: '__all__' },
  { label: '待处理', value: 'pending' },
  { label: '配送中', value: 'shipping' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

export default function OrderPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('__all__');
  const [page, setPage] = useState(1);

  const filtered = ORDERS.filter(o => {
    const matchSearch = search === '' || o.id.includes(search) || o.customer.includes(search) || o.product.includes(search);
    const matchStatus = statusFilter === '__all__' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = ORDERS.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.amount, 0);

  const handleExport = () => toast.success(`已导出 ${filtered.length} 条订单`);
  const handleOrderAction = (orderId: string) => toast.success(`已打开订单 ${orderId} 的操作菜单`);

  const summaryCards = [
    { label: '总订单', value: ORDERS.length, icon: <PackageIcon size={18} />, color: primary },
    { label: '待处理', value: ORDERS.filter(o => o.status === 'pending').length, icon: <ClockIcon size={18} />, color: '#f59e0b' },
    { label: '已完成', value: ORDERS.filter(o => o.status === 'completed').length, icon: <CheckCircleIcon size={18} />, color: '#22c55e' },
    { label: '累计营收', value: `¥${totalRevenue}`, icon: <PackageIcon size={18} />, color: '#6366f1' },
  ];

  return (
    <AdminLayout>
      <div data-cmp="OrderPage" className="p-6 min-h-full" style={{ background: 'var(--background)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>订单管理</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>跟踪和管理所有用户订单</p>
          </div>
        </div>

        {/* Summary */}
        <div className="flex gap-4 mb-6">
          {summaryCards.map(s => (
            <div key={s.label} className="flex-1 rounded-2xl p-4 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{s.label}</span>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm flex-1 max-w-xs"
              style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
            >
              <SearchIcon size={14} style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索订单号 / 用户 / 商品…"
                className="bg-transparent outline-none flex-1 text-sm"
                style={{ color: 'var(--foreground)' }}
              />
            </div>
            {STAT_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: statusFilter === f.value ? primary : 'var(--muted)',
                  color: statusFilter === f.value ? '#fff' : 'var(--muted-foreground)',
                }}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--muted)' }}
            >
              <FilterIcon size={13} />
              导出
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['订单号', '用户', '商品', '渠道', '金额', '日期', '状态', '操作'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, idx) => {
                  const meta = STATUS_META[o.status];
                  return (
                    <tr key={o.id} className="transition-colors hover:bg-accent" style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>{o.id}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: primary, color: '#fff' }}>
                            {o.avatar}
                          </div>
                          <span style={{ color: 'var(--foreground)' }}>{o.customer}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--foreground)' }}>{o.product}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{o.channel}</span>
                      </td>
                      <td className="px-5 py-3 font-semibold" style={{ color: isManga ? PINK : 'var(--primary)' }}>¥{o.amount}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{o.date}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit" style={{ background: meta.bg, color: meta.color }}>
                          {meta.icon}{meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleOrderAction(o.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                          <MoreHorizontalIcon size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center" style={{ color: 'var(--muted-foreground)' }}>暂无匹配订单</div>
            )}
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            <span>共 {filtered.length} 条记录</span>
            <div className="flex items-center gap-1">
              {[1, 2].map(p => (
                <button key={p} onClick={() => setPage(p)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ background: p === page ? primary : 'transparent', color: p === page ? '#fff' : 'var(--foreground)' }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
