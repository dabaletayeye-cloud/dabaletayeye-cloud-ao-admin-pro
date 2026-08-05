import { useState } from 'react';
import { toast } from '../lib/localizedToast';
import AdminLayout from '../components/AdminLayout';
import PageHeader from '../components/PageHeader';
import MetricCards from '../components/MetricCards';
import FilterToolbar, { SearchInput } from '../components/FilterToolbar';
import { useTheme } from '../hooks/useTheme';
import {
  PlusIcon, RotateCcwIcon, TicketIcon,
  CheckCircleIcon, ClockIcon, XCircleIcon, MinusCircleIcon,
  EditIcon, CopyIcon, Trash2Icon,
} from 'lucide-react';

const PINK = '#E91E8C';

type CouponType = '满减' | '折扣' | '兑换' | '免单';
type CouponStatus = '进行中' | '已结束' | '未开始' | '已作废';

interface Coupon {
  id: string;
  name: string;
  type: CouponType;
  faceValue: string;
  threshold: string;
  startDate: string;
  endDate: string;
  issued: number;
  used: number;
  status: CouponStatus;
}

const COUPONS: Coupon[] = [
  { id: 'CP20250701', name: '夏日满减大礼包', type: '满减', faceValue: '¥50', threshold: '满200可用', startDate: '2025-07-01', endDate: '2025-07-31', issued: 500, used: 342, status: '进行中' },
  { id: 'CP20250615', name: '新用户专属九折', type: '折扣', faceValue: '9折', threshold: '无门槛', startDate: '2025-06-15', endDate: '2025-09-15', issued: 280, used: 196, status: '进行中' },
  { id: 'CP20250601', name: '积分兑换券', type: '兑换', faceValue: '¥20', threshold: '100积分兑换', startDate: '2025-06-01', endDate: '2025-06-30', issued: 150, used: 150, status: '已结束' },
  { id: 'CP20250520', name: '品牌日免单券', type: '免单', faceValue: '全免', threshold: '订单满500', startDate: '2025-05-20', endDate: '2025-05-20', issued: 30, used: 28, status: '已结束' },
  { id: 'CP20250810', name: '八月折扣风暴', type: '折扣', faceValue: '8折', threshold: '无门槛', startDate: '2025-08-10', endDate: '2025-08-20', issued: 200, used: 0, status: '未开始' },
  { id: 'CP20250715', name: '会员专属满减', type: '满减', faceValue: '¥100', threshold: '满500可用', startDate: '2025-07-15', endDate: '2025-08-15', issued: 80, used: 62, status: '进行中' },
  { id: 'CP20250401', name: '春季促销折扣', type: '折扣', faceValue: '7.5折', threshold: '无门槛', startDate: '2025-04-01', endDate: '2025-04-30', issued: 400, used: 388, status: '已结束' },
  { id: 'CP20250601B', name: '违规测试券', type: '满减', faceValue: '¥30', threshold: '满100可用', startDate: '2025-06-01', endDate: '2025-07-01', issued: 40, used: 0, status: '已作废' },
];

const STATUS_CONFIG: Record<CouponStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  '进行中': { label: '进行中', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircleIcon size={12} /> },
  '已结束': { label: '已结束', color: '#6b7280', bg: '#f3f4f6', icon: <MinusCircleIcon size={12} /> },
  '未开始': { label: '未开始', color: '#2563eb', bg: '#dbeafe', icon: <ClockIcon size={12} /> },
  '已作废': { label: '已作废', color: '#dc2626', bg: '#fee2e2', icon: <XCircleIcon size={12} /> },
};

const TYPE_COLORS: Record<CouponType, { color: string; bg: string }> = {
  '满减': { color: '#7c3aed', bg: '#ede9fe' },
  '折扣': { color: '#0891b2', bg: '#cffafe' },
  '兑换': { color: '#d97706', bg: '#fef3c7' },
  '免单': { color: '#e11d48', bg: '#ffe4e6' },
};

export default function CouponPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CouponType | '全部'>('全部');
  const [statusFilter, setStatusFilter] = useState<CouponStatus | '全部'>('全部');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [tempSearch, setTempSearch] = useState('');
  const [tempType, setTempType] = useState<CouponType | '全部'>('全部');
  const [tempStatus, setTempStatus] = useState<CouponStatus | '全部'>('全部');

  const handleQuery = () => {
    setSearch(tempSearch);
    setTypeFilter(tempType);
    setStatusFilter(tempStatus);
  };

  const handleReset = () => {
    setTempSearch('');
    setTempType('全部');
    setTempStatus('全部');
    setSearch('');
    setTypeFilter('全部');
    setStatusFilter('全部');
  };

  const handleCouponAction = (action: string, couponId?: string) => {
    toast.success(couponId ? `${action} ${couponId}` : action);
  };

  const filtered = COUPONS.filter(c => {
    const matchSearch = !search || c.name.includes(search) || c.id.includes(search);
    const matchType = typeFilter === '全部' || c.type === typeFilter;
    const matchStatus = statusFilter === '全部' || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const total = COUPONS.reduce((s, c) => s + c.issued, 0);
  const used = COUPONS.reduce((s, c) => s + c.used, 0);
  const unused = total - used;
  const rate = total ? ((used / total) * 100).toFixed(1) : '0';

  const statCards = [
    { label: '总发放', value: total.toLocaleString(), icon: <TicketIcon size={20} />, color: primary },
    { label: '已使用', value: used.toLocaleString(), icon: <CheckCircleIcon size={20} />, color: '#16a34a' },
    { label: '未使用', value: unused.toLocaleString(), icon: <ClockIcon size={20} />, color: '#d97706' },
    { label: '核销率', value: `${rate}%`, icon: <MinusCircleIcon size={20} />, color: '#7c3aed' },
  ];

  return (
    <AdminLayout>
      <div data-cmp="CouponPage" style={{ padding: '24px', minHeight: '100%' }}>
        <PageHeader title="优惠券管理" description="管理所有优惠券的发放、使用及有效期" />

        <MetricCards items={statCards} />

        <FilterToolbar
          style={{ marginBottom: 16 }}
          actions={(
            <button
              onClick={() => handleCouponAction('新建优惠券')}
              style={{ height: 34, padding: '0 16px', border: 'none', borderRadius: 8, background: primary, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <PlusIcon size={14} />新建优惠券
            </button>
          )}
        >
          <SearchInput value={tempSearch} onChange={setTempSearch} onEnter={handleQuery} placeholder="搜索券名称/ID" />
          <select
            value={tempType}
            onChange={e => setTempType(e.target.value as CouponType | '全部')}
            style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            <option value="全部">全部类型</option>
            <option value="满减">满减</option>
            <option value="折扣">折扣</option>
            <option value="兑换">兑换</option>
            <option value="免单">免单</option>
          </select>
          <select
            value={tempStatus}
            onChange={e => setTempStatus(e.target.value as CouponStatus | '全部')}
            style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            <option value="全部">全部状态</option>
            <option value="进行中">进行中</option>
            <option value="已结束">已结束</option>
            <option value="未开始">未开始</option>
            <option value="已作废">已作废</option>
          </select>
          <button
            onClick={handleReset}
            style={{ height: 34, padding: '0 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--muted-foreground)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RotateCcwIcon size={13} />重置
          </button>
          <button
            onClick={handleQuery}
            style={{ height: 34, padding: '0 16px', border: 'none', borderRadius: 8, background: primary, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            查询
          </button>
        </FilterToolbar>

        {/* Table */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>优惠券列表</span>
            <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>共 {filtered.length} 条</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr style={{ background: 'var(--muted)' }}>
                  {['券ID', '名称', '类型', '面额', '使用门槛', '有效期', '发放量', '已使用', '状态', '操作'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const st = STATUS_CONFIG[c.status];
                  const ty = TYPE_COLORS[c.type];
                  const usedPct = c.issued ? Math.round((c.used / c.issued) * 100) : 0;
                  return (
                    <tr
                      key={c.id}
                      onMouseEnter={() => setHoveredRow(c.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{ borderBottom: '1px solid var(--border)', background: hoveredRow === c.id ? 'var(--muted)' : 'transparent', transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{c.id}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>{c.name}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: ty.color, background: ty.bg, padding: '2px 8px', borderRadius: 20 }}>{c.type}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>{c.faceValue}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{c.threshold}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{c.startDate} ~ {c.endDate}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--foreground)', textAlign: 'center' }}>{c.issued.toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${usedPct}%`, height: '100%', background: primary, borderRadius: 2, transition: 'width 0.3s' }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap', minWidth: 50 }}>{c.used.toLocaleString()} ({usedPct}%)</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: '3px 8px', borderRadius: 20 }}>
                          {st.icon}{st.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleCouponAction('编辑优惠券', c.id)} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }} title="编辑"><EditIcon size={13} /></button>
                          <button onClick={() => handleCouponAction('已复制优惠券', c.id)} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }} title="复制"><CopyIcon size={13} /></button>
                          <button onClick={() => handleCouponAction('已删除优惠券', c.id)} style={{ width: 28, height: 28, border: '1px solid #fee2e2', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }} title="删除"><Trash2Icon size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 14 }}>暂无匹配的优惠券</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
