import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  ArrowUpIcon,
  ShoppingCartIcon,
  UsersIcon,
  PackageIcon,
  StarIcon,
  DollarSignIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  BoxIcon,
  TruckIcon,
} from 'lucide-react';

// ── count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1300): number {
  const [cur, setCur] = useState(0);
  const raf = useRef<number | null>(null);
  const t0  = useRef<number | null>(null);
  useEffect(() => {
    t0.current = null;
    setCur(0);
    const tick = (ts: number) => {
      if (!t0.current) t0.current = ts;
      const p     = Math.min((ts - t0.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCur(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return cur;
}

// ── SVG Analytics Illustration ───────────────────────────────────────────────
function AnalyticsIllustration() {
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden="true">
      <ellipse cx="260" cy="190" rx="54" ry="22" fill="rgba(139,92,246,0.10)" />
      <ellipse cx="60"  cy="200" rx="38" ry="14" fill="rgba(99,102,241,0.08)" />
      <rect x="48" y="158" width="224" height="10" rx="5" fill="#c7d2fe" />
      <rect x="80" y="168" width="10"  height="30" rx="4" fill="#a5b4fc" />
      <rect x="230" y="168" width="10" height="30" rx="4" fill="#a5b4fc" />
      <rect x="136" y="148" width="6"  height="14" rx="2" fill="#818cf8" />
      <rect x="118" y="154" width="42" height="6"  rx="2" fill="#818cf8" />
      <rect x="108" y="68"  width="104" height="84" rx="10" fill="#1e1b4b" />
      <rect x="112" y="72"  width="96"  height="76" rx="7"  fill="#0f172a" />
      <rect x="124" y="118" width="10" height="20" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="139" y="108" width="10" height="30" rx="2" fill="#818cf8" />
      <rect x="154" y="100" width="10" height="38" rx="2" fill="#a5b4fc" />
      <rect x="169" y="112" width="10" height="26" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="184" y="95"  width="10" height="43" rx="2" fill="#c7d2fe" />
      <polyline points="122,117 137,107 152,99 167,111 182,94 197,104"
        fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="122" cy="117" r="2.5" fill="#38bdf8" />
      <circle cx="137" cy="107" r="2.5" fill="#38bdf8" />
      <circle cx="152" cy="99"  r="2.5" fill="#38bdf8" />
      <circle cx="167" cy="111" r="2.5" fill="#38bdf8" />
      <circle cx="182" cy="94"  r="2.5" fill="#38bdf8" />
      <circle cx="197" cy="104" r="2.5" fill="#38bdf8" />
      <rect x="74"  y="128" width="14" height="36" rx="6" fill="#6366f1" />
      <rect x="92"  y="128" width="14" height="36" rx="6" fill="#6366f1" />
      <ellipse cx="81"  cy="164" rx="10" ry="5" fill="#3730a3" />
      <ellipse cx="99"  cy="164" rx="10" ry="5" fill="#3730a3" />
      <rect x="68" y="88" width="54" height="46" rx="14" fill="#818cf8" />
      <path d="M85 88 Q95 98 105 88" fill="none" stroke="#6366f1" strokeWidth="1.5" />
      <path d="M122 102 Q138 96 148 88" fill="none" stroke="#818cf8" strokeWidth="10" strokeLinecap="round" />
      <path d="M68 108 Q52 120 46 132" fill="none" stroke="#818cf8" strokeWidth="10" strokeLinecap="round" />
      <circle cx="44" cy="135" r="6" fill="#fde68a" />
      <circle cx="95" cy="72" r="22" fill="#fde68a" />
      <path d="M73 66 Q75 46 95 44 Q115 46 117 66" fill="#1e293b" />
      <rect x="80" y="68" width="12" height="8"  rx="4" fill="none" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="98" y="68" width="12" height="8"  rx="4" fill="none" stroke="#1e293b" strokeWidth="1.5" />
      <line x1="92" y1="72" x2="98" y2="72" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M87 80 Q95 86 103 80" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="218" y="72" width="72" height="40" rx="8" fill="white" opacity="0.92" />
      <rect x="226" y="80" width="20" height="6"  rx="3" fill="#e0e7ff" />
      <rect x="226" y="91" width="36" height="8"  rx="3" fill="#6366f1" />
      <circle cx="272" cy="85" r="6" fill="#a5b4fc" />
      <rect x="228" y="120" width="64" height="32" rx="7" fill="white" opacity="0.88" />
      <rect x="235" y="127" width="24" height="5" rx="2" fill="#e0e7ff" />
      <rect x="235" y="136" width="16" height="5" rx="2" fill="#34d399" />
      <polyline points="262,141 268,133 274,137 280,129" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="32"  cy="52"  r="2" fill="#a5b4fc" opacity="0.7" />
      <circle cx="290" cy="42"  r="3" fill="#c7d2fe" opacity="0.8" />
      <circle cx="308" cy="90"  r="2" fill="#818cf8" opacity="0.6" />
      <circle cx="22"  cy="150" r="2" fill="#a5b4fc" opacity="0.5" />
    </svg>
  );
}

// ── Mini donut ────────────────────────────────────────────────────────────────
function MiniDonut({ percent, color }: { percent: number; color: string }) {
  const r = 26, cx = 34, cy = 34;
  const circ = 2 * Math.PI * r;
  const dash  = (percent / 100) * circ;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="7" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
        {percent}%
      </text>
    </svg>
  );
}

// ── Mini bar ──────────────────────────────────────────────────────────────────
function MiniBar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const W = 72, H = 40, bw = 8;
  const gap = (W - data.length * bw) / (data.length + 1);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {data.map((v, i) => {
        const h = Math.max(4, (v / max) * (H - 4));
        return <rect key={i} x={gap + i * (bw + gap)} y={H - h} width={bw} height={h} rx="3"
          fill={color} opacity={i === data.length - 1 ? 1 : 0.45} />;
      })}
    </svg>
  );
}

// ── Mini area ─────────────────────────────────────────────────────────────────
function MiniArea({ data, color, width = 88, height = 44 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data);
  const W = width, H = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * (H - 4) - 2;
    return [x, y] as [number, number];
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;
  const gid  = `mg-${color.replace('#', '')}-${W}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line}  fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color} />
    </svg>
  );
}

// ── StatMiniCard ─────────────────────────────────────────────────────────────
interface MiniCardProps {
  label: string; value: number; prefix?: string; suffix?: string;
  change: number; icon: React.ReactNode; iconColor: string; iconBg: string; chart: React.ReactNode;
}
function StatMiniCard({ label='', value=0, prefix='', suffix='', change=0,
  icon=null, iconColor='#6366f1', iconBg='rgba(99,102,241,0.12)', chart=null }: MiniCardProps) {
  const animated = useCountUp(value, 1200);
  const display  = value >= 10000 ? (animated / 10000).toFixed(1) + 'w' : animated.toLocaleString();
  return (
    <div data-cmp="StatMiniCard" style={{
      background:'var(--card)', border:'1px solid var(--border)', borderRadius:18,
      padding:'18px 20px', display:'flex', flexDirection:'column', gap:12, flex:'1 1 0', minWidth:0,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:iconBg, color:iconColor,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
          <span style={{ fontSize:12, color:'var(--muted-foreground)', fontWeight:600 }}>{label}</span>
        </div>
        <span style={{ display:'inline-flex', alignItems:'center', gap:2, fontSize:11, fontWeight:700,
          color:'#10b981', background:'rgba(16,185,129,0.11)', padding:'3px 8px', borderRadius:20 }}>
          <ArrowUpIcon size={9}/>{change}%
        </span>
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8 }}>
        <div style={{ fontSize:28, fontWeight:800, color:'var(--foreground)',
          letterSpacing:'-0.5px', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>
          {prefix}{display}{suffix}
        </div>
        <div style={{ flexShrink:0 }}>{chart}</div>
      </div>
    </div>
  );
}

// ── Bidirectional bar chart (SVG) ─────────────────────────────────────────────
const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const SALES_A = [42, 58, 35, 67, 80, 55, 72, 90, 63, 74, 88, 95]; // 本年
const SALES_B = [30, 45, 52, 48, 60, 72, 50, 65, 80, 55, 70, 82]; // 去年

function BidirectionalBarChart() {
  const W = 560, H = 220;
  const midY   = H / 2;
  const maxVal = 100;
  const barW   = 10;
  const cols   = MONTHS.length;
  const colW   = W / cols;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'100%', display:'block', overflow:'visible' }}>
      <defs>
        {MONTHS.map((_, i) => (
          <linearGradient key={`ga-${i}`} id={`ga-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="1" />
            <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.5" />
          </linearGradient>
        ))}
        {MONTHS.map((_, i) => (
          <linearGradient key={`gb-${i}`} id={`gb-${i}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="#f97316" stopOpacity="1" />
            <stop offset="100%" stopColor="#fcd34d" stopOpacity="0.5" />
          </linearGradient>
        ))}
      </defs>

      {/* center axis */}
      <line x1="0" y1={midY} x2={W} y2={midY} stroke="var(--border)" strokeWidth="1" />

      {/* y-axis labels */}
      {[100, 50, 0, 50, 100].map((v, i) => {
        const y = (i / 4) * H;
        return (
          <text key={v + '-' + i} x={-6} y={y + 4} textAnchor="end" fontSize="9"
            fill="var(--muted-foreground)">{v === 0 ? '' : v}</text>
        );
      })}

      {MONTHS.map((m, i) => {
        const x    = i * colW + colW / 2;
        const hA   = (SALES_A[i] / maxVal) * (midY - 16);
        const hB   = (SALES_B[i] / maxVal) * (midY - 16);
        const xA   = x - barW - 2;
        const xB   = x + 2;
        return (
          <g key={m}>
            {/* upward bar (本年) */}
            <rect x={xA} y={midY - hA} width={barW} height={hA} rx="3"
              fill={`url(#ga-${i})`} />
            {/* downward bar (去年) */}
            <rect x={xB} y={midY} width={barW} height={hB} rx="3"
              fill={`url(#gb-${i})`} />
            {/* month label */}
            <text x={x} y={H + 14} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">{m}</text>
          </g>
        );
      })}

      {/* legend */}
      <rect x={W - 130} y={4} width="10" height="10" rx="2" fill="#6366f1" />
      <text x={W - 116} y={13} fontSize="9" fill="var(--muted-foreground)">本年</text>
      <rect x={W - 80}  y={4} width="10" height="10" rx="2" fill="#f97316" />
      <text x={W - 66}  y={13} fontSize="9" fill="var(--muted-foreground)">去年</text>
    </svg>
  );
}

// ── Donut chart (SVG) for 销售分类 ────────────────────────────────────────────
interface DonutSlice { label: string; value: number; color: string; }
const DONUT_DATA: DonutSlice[] = [
  { label: '服装',   value: 35, color: '#6366f1' },
  { label: '数码',   value: 25, color: '#10b981' },
  { label: '食品',   value: 20, color: '#f59e0b' },
  { label: '家居',   value: 12, color: '#e879f9' },
  { label: '其他',   value:  8, color: '#38bdf8' },
];

function SalesDonut() {
  const cx = 90, cy = 90, R = 68, r = 44;
  const total = DONUT_DATA.reduce((s, d) => s + d.value, 0);
  let angle = -Math.PI / 2;
  const slices = DONUT_DATA.map(d => {
    const a0  = angle;
    const a1  = angle + (d.value / total) * 2 * Math.PI;
    angle     = a1;
    const gap = 0.03;
    const sa  = a0 + gap, ea = a1 - gap;
    const x0  = cx + R * Math.cos(sa), y0 = cy + R * Math.sin(sa);
    const x1  = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa);
    const x2  = cx + R * Math.cos(ea), y2 = cy + R * Math.sin(ea);
    const x3  = cx + r * Math.cos(ea), y3 = cy + r * Math.sin(ea);
    const lg  = (a1 - a0) > Math.PI ? 1 : 0;
    const path = [
      `M ${x0.toFixed(2)} ${y0.toFixed(2)}`,
      `A ${R} ${R} 0 ${lg} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
      `A ${r} ${r} 0 ${lg} 0 ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      'Z',
    ].join(' ');
    return { ...d, path };
  });

  return (
    <svg viewBox="0 0 180 180" style={{ width: '100%', maxWidth: 180, display: 'block', margin: '0 auto' }}>
      {slices.map(s => (
        <path key={s.label} d={s.path} fill={s.color} opacity="0.9" />
      ))}
      {/* center label */}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">总销售额</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--foreground)">¥300,458</text>
    </svg>
  );
}

// ── Large area chart for 转化率 ───────────────────────────────────────────────
const CONV_DATA = [38, 52, 45, 68, 55, 72, 65, 80, 74, 90, 83, 95];

function ConversionArea() {
  const W = 340, H = 130;
  const max = Math.max(...CONV_DATA);
  const pts = CONV_DATA.map((v, i) => {
    const x = (i / (CONV_DATA.length - 1)) * W;
    const y = H - (v / max) * (H - 16) - 4;
    return [x, y] as [number, number];
  });

  // smooth cubic bezier
  const smooth = (ps: [number, number][]) => {
    let d = `M ${ps[0][0].toFixed(1)} ${ps[0][1].toFixed(1)}`;
    for (let i = 1; i < ps.length; i++) {
      const [px, py] = ps[i - 1];
      const [cx2, cy2] = ps[i];
      const cpx1 = px + (cx2 - px) * 0.5;
      const cpy1 = py;
      const cpx2 = cx2 - (cx2 - px) * 0.5;
      const cpy2 = cy2;
      d += ` C ${cpx1.toFixed(1)} ${cpy1.toFixed(1)}, ${cpx2.toFixed(1)} ${cpy2.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}`;
    }
    return d;
  };

  const linePath = smooth(pts);
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'100%', display:'block' }}>
      <defs>
        <linearGradient id="conv-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#conv-grad)" />
      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* month ticks */}
      {['1月','3月','5月','7月','9月','11月'].map((m, i) => {
        const xi = i * 2;
        const x  = (xi / (CONV_DATA.length - 1)) * W;
        return <text key={m} x={x} y={H + 14} textAnchor="middle" fontSize="9"
          fill="var(--muted-foreground)">{m}</text>;
      })}
      {/* last dot */}
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill="#6366f1" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="7" fill="#6366f1" opacity="0.2" />
    </svg>
  );
}

// ── Recent activity data ──────────────────────────────────────────────────────
interface ActivityItem {
  id: number;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  sub: string;
  status: '待处理' | '已完成' | '处理中' | '已取消';
  time: string;
}

const ACTIVITIES: ActivityItem[] = [
  { id:1, icon:<ShoppingCartIcon size={14}/>, iconBg:'rgba(99,102,241,0.14)',
    title:'新订单 #20931 已提交', sub:'客户：张小明  ·  ¥1,280',
    status:'待处理', time:'2 分钟前' },
  { id:2, icon:<TruckIcon size={14}/>, iconBg:'rgba(16,185,129,0.14)',
    title:'订单 #20928 已发货', sub:'快递：顺丰  ·  运单 SF1234567',
    status:'已完成', time:'18 分钟前' },
  { id:3, icon:<BoxIcon size={14}/>, iconBg:'rgba(245,158,11,0.14)',
    title:'商品库存预警：AirPods Pro', sub:'剩余库存：3 件',
    status:'待处理', time:'45 分钟前' },
  { id:4, icon:<RefreshCwIcon size={14}/>, iconBg:'rgba(239,68,68,0.13)',
    title:'退款申请 #20919', sub:'客户：李雅婷  ·  原因：质量问题',
    status:'处理中', time:'1 小时前' },
  { id:5, icon:<CheckCircleIcon size={14}/>, iconBg:'rgba(16,185,129,0.14)',
    title:'订单 #20915 已完成', sub:'客户：王大力  ·  好评 ⭐⭐⭐⭐⭐',
    status:'已完成', time:'2 小时前' },
  { id:6, icon:<AlertCircleIcon size={14}/>, iconBg:'rgba(245,158,11,0.14)',
    title:'支付异常 #20910', sub:'金额：¥3,660  ·  银行卡支付失败',
    status:'待处理', time:'3 小时前' },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  '待处理': { bg:'rgba(245,158,11,0.14)', color:'#d97706' },
  '已完成': { bg:'rgba(16,185,129,0.13)', color:'#059669' },
  '处理中': { bg:'rgba(99,102,241,0.13)', color:'#6366f1' },
  '已取消': { bg:'rgba(148,163,184,0.15)', color:'#64748b' },
};

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 20, overflow: 'hidden', ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ padding:'20px 22px 0', display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
      <div>
        <div style={{ fontSize:15, fontWeight:800, color:'var(--foreground)' }}>{title}</div>
        {sub && <div style={{ fontSize:11, color:'var(--muted-foreground)', marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function EcommercePage() {
  const { themeState } = useTheme();
  const isManga    = themeState.themeId === 'manga';
  const _primary   = isManga ? '#E91E8C' : '#6366f1';

  const todaySales  = useCountUp(2340,  1500);
  const convCount   = useCountUp(2545,  1400);

  return (
    <AdminLayout>
      <div data-cmp="EcommercePage" style={{
        minHeight:'100%', background:'var(--background)',
        padding:'24px', display:'flex', flexDirection:'column', gap:24,
      }}>

        {/* page header */}
        <div>
          <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'var(--foreground)' }}>电子商务</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'var(--muted-foreground)' }}>
            店铺总览与实时销售数据
          </p>
        </div>

        {/* ══ 上半区 ═══════════════════════════════════════════════════════════ */}
        <div style={{ display:'flex', gap:20, alignItems:'stretch' }}>

          {/* ① 欢迎横幅 */}
          <div style={{
            flex:'5 1 0', minWidth:0, borderRadius:22, overflow:'hidden', position:'relative',
            background:'linear-gradient(135deg,#dbeafe 0%,#ede9fe 55%,#c7d2fe 100%)',
            padding:'32px 36px', display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:220,
          }}>
            <div style={{ position:'absolute', top:-40, right:120, width:180, height:180,
              borderRadius:'50%', background:'rgba(139,92,246,0.08)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-30, left:200, width:120, height:120,
              borderRadius:'50%', background:'rgba(99,102,241,0.07)', pointerEvents:'none' }} />

            <div style={{ position:'relative', zIndex:1, maxWidth:260 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6,
                background:'rgba(255,255,255,0.65)', border:'1px solid rgba(99,102,241,0.2)',
                borderRadius:99, padding:'4px 12px', fontSize:11, fontWeight:700, color:'#4f46e5',
                marginBottom:14, backdropFilter:'blur(4px)' }}>
                <StarIcon size={10} style={{ fill:'#f59e0b', color:'#f59e0b' }} />今日实时概览
              </div>
              <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:900, color:'#1e1b4b', lineHeight:1.2 }}>
                欢迎回来 Admin 👋
              </h2>
              <p style={{ margin:'0 0 22px', fontSize:13, color:'#4f46e5', opacity:0.75, fontWeight:500 }}>
                您的店铺今天表现优秀，继续加油！
              </p>
              <div style={{ background:'rgba(255,255,255,0.70)', backdropFilter:'blur(8px)',
                border:'1px solid rgba(255,255,255,0.9)', borderRadius:16, padding:'14px 20px',
                display:'inline-flex', flexDirection:'column', gap:4, minWidth:180 }}>
                <span style={{ fontSize:11, color:'#6366f1', fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase' }}>
                  今日销售额
                </span>
                <span style={{ fontSize:34, fontWeight:900, color:'#1e1b4b',
                  fontVariantNumeric:'tabular-nums', letterSpacing:'-1px' }}>
                  ¥{todaySales.toLocaleString()}
                </span>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:3,
                    background:'rgba(16,185,129,0.15)', color:'#059669', fontSize:12, fontWeight:800,
                    padding:'2px 8px', borderRadius:99 }}>
                    <ArrowUpIcon size={10}/>35%
                  </span>
                  <span style={{ fontSize:11, color:'#64748b' }}>较昨日</span>
                </div>
              </div>
            </div>

            <div style={{ flex:'0 0 320px', height:220, position:'relative', zIndex:1, display:'flex', alignItems:'flex-end' }}>
              <AnalyticsIllustration />
            </div>
          </div>

          {/* ② 2×2 mini stat cards */}
          <div style={{ flex:'4 1 0', minWidth:0, display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', gap:16, flex:'1 1 0' }}>
              <StatMiniCard label="总订单量" value={12849} change={18.2}
                icon={<ShoppingCartIcon size={17}/>} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)"
                chart={<MiniDonut percent={72} color="#6366f1"/>} />
              <StatMiniCard label="活跃用户" value={3682} change={9.4}
                icon={<UsersIcon size={17}/>} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)"
                chart={<MiniBar data={[55,72,61,88,76,95,83]} color="#10b981"/>} />
            </div>
            <div style={{ display:'flex', gap:16, flex:'1 1 0' }}>
              <StatMiniCard label="商品总数" value={847} change={5.6}
                icon={<PackageIcon size={17}/>} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)"
                chart={<MiniArea data={[40,55,48,67,59,78,72,85,91]} color="#f59e0b"/>} />
              <StatMiniCard label="好评率" value={96} suffix="%" change={2.1}
                icon={<StarIcon size={17}/>} iconColor="#e879f9" iconBg="rgba(232,121,249,0.12)"
                chart={<MiniDonut percent={96} color="#e879f9"/>} />
            </div>
          </div>
        </div>

        {/* ══ 下半区 Row 1 ═════════════════════════════════════════════════════ */}
        <div style={{ display:'flex', gap:20, alignItems:'stretch' }}>

          {/* ③ 销售趋势 — 双向柱状图 */}
          <Card style={{ flex:'4 1 0', minWidth:0 }}>
            <CardHeader title="销售趋势" sub="月度对比 · 本年 vs 去年" />
            <div style={{ padding:'16px 22px 24px', height:240, boxSizing:'border-box' }}>
              <BidirectionalBarChart />
            </div>
          </Card>

          {/* ④ 销售分类 — 环形图 */}
          <Card style={{ flex:'3 1 0', minWidth:0 }}>
            <CardHeader title="销售分类" sub="各品类占比" />
            <div style={{ padding:'12px 22px 20px', display:'flex', flexDirection:'column', gap:12 }}>
              <SalesDonut />
              {/* legend dots */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 14px', justifyContent:'center' }}>
                {DONUT_DATA.map(d => (
                  <div key={d.label} style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0 }} />
                    <span style={{ fontSize:11, color:'var(--muted-foreground)' }}>{d.label}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--foreground)' }}>{d.value}%</span>
                  </div>
                ))}
              </div>
              {/* 总收入 / 净利润 */}
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:14, display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:'rgba(99,102,241,0.12)',
                    color:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <DollarSignIcon size={15}/>
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:'var(--muted-foreground)', fontWeight:500 }}>总收入</div>
                    <div style={{ fontSize:16, fontWeight:800, color:'var(--foreground)', letterSpacing:'-0.3px' }}>¥500,458</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:'rgba(16,185,129,0.12)',
                    color:'#10b981', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <TrendingUpIcon size={15}/>
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:'var(--muted-foreground)', fontWeight:500 }}>净利润</div>
                    <div style={{ fontSize:16, fontWeight:800, color:'var(--foreground)', letterSpacing:'-0.3px' }}>¥130,580</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* ⑤ 购物车转化率 */}
          <Card style={{ flex:'3 1 0', minWidth:0 }}>
            <CardHeader title="购物车转化率" sub="近12个月转化趋势" />
            <div style={{ padding:'14px 22px 0' }}>
              {/* big number */}
              <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:14 }}>
                <span style={{ fontSize:44, fontWeight:900, color:'var(--foreground)',
                  letterSpacing:'-2px', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>
                  {convCount.toLocaleString()}
                </span>
                <span style={{ display:'inline-flex', alignItems:'center', gap:3,
                  background:'rgba(16,185,129,0.13)', color:'#059669',
                  fontSize:12, fontWeight:800, padding:'3px 9px', borderRadius:99 }}>
                  <ArrowUpIcon size={10}/>1.2%
                </span>
              </div>
              <p style={{ margin:'0 0 10px', fontSize:11, color:'var(--muted-foreground)' }}>
                较上月新增转化用户数
              </p>
            </div>
            {/* area chart */}
            <div style={{ padding:'0 10px', height:160, boxSizing:'border-box' }}>
              <ConversionArea />
            </div>
          </Card>
        </div>

        {/* ══ 下半区 Row 2 — 最近活动 ═════════════════════════════════════════ */}
        <Card>
          <CardHeader title="最近活动" sub="店铺实时动态" />
          <div style={{ padding:'14px 0 8px' }}>
            {ACTIVITIES.map((item, idx) => {
              const ss = STATUS_STYLE[item.status] ?? STATUS_STYLE['已取消'];
              return (
                <div key={item.id} style={{
                  display:'flex', alignItems:'center', gap:14,
                  padding:'13px 22px',
                  borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                }}>
                  {/* icon */}
                  <div style={{ width:36, height:36, borderRadius:11, background:item.iconBg,
                    color:'var(--foreground)', display:'flex', alignItems:'center',
                    justifyContent:'center', flexShrink:0 }}>
                    {item.icon}
                  </div>
                  {/* text */}
                  <div style={{ flex:'1 1 0', minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--foreground)',
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize:11, color:'var(--muted-foreground)', marginTop:2 }}>{item.sub}</div>
                  </div>
                  {/* status badge */}
                  <span style={{ flexShrink:0, display:'inline-flex', alignItems:'center', gap:5,
                    background:ss.bg, color:ss.color, fontSize:11, fontWeight:700,
                    padding:'4px 10px', borderRadius:99, whiteSpace:'nowrap' }}>
                    {item.status}
                  </span>
                  {/* time */}
                  <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:4,
                    fontSize:11, color:'var(--muted-foreground)', minWidth:72, justifyContent:'flex-end' }}>
                    <ClockIcon size={11}/>
                    {item.time}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </AdminLayout>
  );
}
