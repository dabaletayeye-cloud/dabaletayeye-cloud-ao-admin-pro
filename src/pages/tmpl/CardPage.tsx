import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  UsersIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  BarChart2Icon,
  HeartIcon,
  StarIcon,
  ZapIcon,
  DollarSignIcon,
  ActivityIcon,
  EyeIcon,
  MessageSquareIcon,
  CheckCircleIcon,
} from 'lucide-react';

// ─── accent helper ─────────────────────────────────────────────
function useAccent() {
  const { themeState } = useTheme();
  return themeState.themeId === 'manga' ? '#E91E8C' : 'var(--primary)';
}

// ─── Section wrapper ───────────────────────────────────────────
function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-cmp="Section"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        boxShadow:
          'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,10px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.06))',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{desc}</div>
        </div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

// ─── Responsive 4-col grid ─────────────────────────────────────
function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 14,
      }}
    >
      {React.Children.map(children, (child) => (
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>{child}</div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 1. 统计卡片（文字型）
// ══════════════════════════════════════════════════════════════════

interface TextStatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  badge?: string;
  badgeColor?: string;
}

function TextStatCard({
  icon,
  iconBg,
  iconColor,
  title,
  desc,
  badge,
  badgeColor,
}: TextStatCardProps) {
  return (
    <div
      data-cmp="TextStatCard"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow:
          'var(--shadow-x,0px) var(--shadow-y,1px) var(--shadow-blur,6px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.05))',
        transition: 'box-shadow .2s, transform .2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          'var(--shadow-x,0px) var(--shadow-y,6px) var(--shadow-blur,20px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.10))';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          'var(--shadow-x,0px) var(--shadow-y,1px) var(--shadow-blur,6px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.05))';
      }}
    >
      {/* icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      {/* text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--foreground)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--muted-foreground)',
            marginTop: 3,
            lineHeight: 1.5,
          }}
        >
          {desc}
        </div>
      </div>
      {badge && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: badgeColor ?? '#22c55e',
            background: `color-mix(in srgb, ${badgeColor ?? '#22c55e'} 12%, transparent)`,
            padding: '2px 8px',
            borderRadius: 20,
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

const TEXT_CARDS: TextStatCardProps[] = [
  {
    icon: <UsersIcon size={20} />,
    iconBg: 'rgba(99,102,241,.12)',
    iconColor: '#6366f1',
    title: '注册用户总量',
    desc: '全平台累计注册用户，覆盖 32 个城市',
    badge: '↑ 12.4%',
    badgeColor: '#22c55e',
  },
  {
    icon: <ShoppingCartIcon size={20} />,
    iconBg: 'rgba(249,115,22,.12)',
    iconColor: '#f97316',
    title: '本月订单量',
    desc: '含待支付、已完成及退款订单',
    badge: '↑ 8.6%',
    badgeColor: '#22c55e',
  },
  {
    icon: <TrendingUpIcon size={20} />,
    iconBg: 'rgba(34,197,94,.12)',
    iconColor: '#22c55e',
    title: '月度 GMV',
    desc: '含线上 + 线下全渠道销售额合计',
    badge: '↑ 23.1%',
    badgeColor: '#22c55e',
  },
  {
    icon: <BarChart2Icon size={20} />,
    iconBg: 'rgba(239,68,68,.12)',
    iconColor: '#ef4444',
    title: '客诉率',
    desc: '本月用户投诉工单 / 总订单占比',
    badge: '↓ 0.3%',
    badgeColor: '#ef4444',
  },
];

// ══════════════════════════════════════════════════════════════════
// 2. 统计卡片（数字滚动）
// ══════════════════════════════════════════════════════════════════

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

function formatNum(n: number, isDecimal = false): string {
  if (isDecimal) return (n / 100).toFixed(2);
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toLocaleString();
}

interface NumStatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  target: number;
  unit?: string;
  prefix?: string;
  isDecimal?: boolean;
  trend: string;
  trendUp: boolean;
}

function NumStatCard({
  icon,
  iconBg,
  iconColor,
  label,
  target,
  unit,
  prefix,
  isDecimal,
  trend,
  trendUp,
}: NumStatCardProps) {
  const raw = useCountUp(target);
  const display = formatNum(raw, isDecimal);

  return (
    <div
      data-cmp="NumStatCard"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '18px 18px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow:
          'var(--shadow-x,0px) var(--shadow-y,1px) var(--shadow-blur,6px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.05))',
        transition: 'box-shadow .2s, transform .2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          'var(--shadow-x,0px) var(--shadow-y,6px) var(--shadow-blur,20px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.10))';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          'var(--shadow-x,0px) var(--shadow-y,1px) var(--shadow-blur,6px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.05))';
      }}
    >
      {/* icon row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: trendUp ? '#22c55e' : '#ef4444',
            background: trendUp
              ? 'rgba(34,197,94,.1)'
              : 'rgba(239,68,68,.1)',
            padding: '3px 8px',
            borderRadius: 20,
          }}
        >
          {trend}
        </span>
      </div>
      {/* number */}
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1, letterSpacing: '-0.5px' }}>
          {prefix && <span style={{ fontSize: 15, fontWeight: 600, marginRight: 2, opacity: 0.7 }}>{prefix}</span>}
          {display}
          {unit && <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 3, opacity: 0.6 }}>{unit}</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 6 }}>{label}</div>
      </div>
    </div>
  );
}

const NUM_CARDS: NumStatCardProps[] = [
  {
    icon: <UsersIcon size={18} />,
    iconBg: 'rgba(99,102,241,.12)',
    iconColor: '#6366f1',
    label: '注册用户总数',
    target: 128540,
    trend: '↑ 12.4%',
    trendUp: true,
  },
  {
    icon: <DollarSignIcon size={18} />,
    iconBg: 'rgba(34,197,94,.12)',
    iconColor: '#22c55e',
    label: '本月营业额',
    target: 1340966,
    prefix: '¥',
    trend: '↑ 23.1%',
    trendUp: true,
  },
  {
    icon: <ShoppingCartIcon size={18} />,
    iconBg: 'rgba(249,115,22,.12)',
    iconColor: '#f97316',
    label: '本月订单量',
    target: 34921,
    unit: '笔',
    trend: '↑ 8.6%',
    trendUp: true,
  },
  {
    icon: <ActivityIcon size={18} />,
    iconBg: 'rgba(239,68,68,.12)',
    iconColor: '#ef4444',
    label: '退款率',
    target: 280,
    isDecimal: true,
    unit: '%',
    trend: '↓ 0.3%',
    trendUp: false,
  },
];

// ══════════════════════════════════════════════════════════════════
// 3. 统计卡片（自定义彩色底）
// ══════════════════════════════════════════════════════════════════

interface ColorCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  lightBg: string;       // light mode bg
  darkBg: string;        // dark mode bg
  accentColor: string;
  iconBoxBg: string;
}

function ColorCard({ icon, title, value, sub, lightBg, darkBg, accentColor, iconBoxBg }: ColorCardProps) {
  const { themeState } = useTheme();
  const isDark = themeState.mode === 'dark';
  const bg = isDark ? darkBg : lightBg;

  return (
    <div
      data-cmp="ColorCard"
      style={{
        borderRadius: 14,
        padding: '20px 20px 16px',
        background: bg,
        border: `1px solid color-mix(in srgb, ${accentColor} 20%, transparent)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: `0 2px 12px color-mix(in srgb, ${accentColor} 15%, transparent)`,
        transition: 'box-shadow .2s, transform .2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px color-mix(in srgb, ${accentColor} 22%, transparent)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 2px 12px color-mix(in srgb, ${accentColor} 15%, transparent)`;
      }}
    >
      {/* decorative circle */}
      <div style={{
        position: 'absolute', right: -18, top: -18,
        width: 80, height: 80, borderRadius: '50%',
        background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: -8, bottom: -24,
        width: 60, height: 60, borderRadius: '50%',
        background: `color-mix(in srgb, ${accentColor} 8%, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: iconBoxBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
        }}
      >
        {icon}
      </div>

      {/* value */}
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: accentColor, lineHeight: 1, letterSpacing: '-0.5px' }}>
          {value}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: accentColor, marginTop: 4, opacity: 0.8 }}>{title}</div>
      </div>

      {/* sub */}
      <div style={{ fontSize: 12, color: accentColor, opacity: 0.6, marginTop: -6 }}>{sub}</div>
    </div>
  );
}

const COLOR_CARDS: ColorCardProps[] = [
  {
    icon: <EyeIcon size={20} />,
    title: '今日 PV',
    value: '84,320',
    sub: '较昨日 +12,400 次访问',
    lightBg: 'rgba(96,165,250,.08)',
    darkBg: 'rgba(96,165,250,.1)',
    accentColor: '#3b82f6',
    iconBoxBg: 'rgba(59,130,246,.15)',
  },
  {
    icon: <StarIcon size={20} />,
    title: '好评率',
    value: '97.4%',
    sub: '本月收到 2,341 条正向评价',
    lightBg: 'rgba(234,179,8,.08)',
    darkBg: 'rgba(234,179,8,.1)',
    accentColor: '#ca8a04',
    iconBoxBg: 'rgba(234,179,8,.18)',
  },
  {
    icon: <MessageSquareIcon size={20} />,
    title: '待回复消息',
    value: '128',
    sub: '其中 24 条超 24h 未处理',
    lightBg: 'rgba(20,184,166,.08)',
    darkBg: 'rgba(20,184,166,.1)',
    accentColor: '#0d9488',
    iconBoxBg: 'rgba(20,184,166,.15)',
  },
  {
    icon: <HeartIcon size={20} />,
    title: '收藏量',
    value: '56,210',
    sub: '用户累计收藏商品数量',
    lightBg: 'rgba(244,114,182,.08)',
    darkBg: 'rgba(244,114,182,.1)',
    accentColor: '#db2777',
    iconBoxBg: 'rgba(244,114,182,.15)',
  },
];

// ══════════════════════════════════════════════════════════════════
// 4. 进度卡片
// ══════════════════════════════════════════════════════════════════

function useAnimatedWidth(target: number, delay = 200) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(target);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay]);
  return width;
}

interface ProgressCardProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  percent: number;
  barColor: string;
  barTrack?: string;
  current: string;
  total: string;
}

function ProgressCard({
  icon,
  iconColor,
  iconBg,
  title,
  desc,
  percent,
  barColor,
  barTrack,
  current,
  total,
}: ProgressCardProps) {
  const barWidth = useAnimatedWidth(percent, 400);

  return (
    <div
      data-cmp="ProgressCard"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow:
          'var(--shadow-x,0px) var(--shadow-y,1px) var(--shadow-blur,6px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.05))',
        transition: 'box-shadow .2s, transform .2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          'var(--shadow-x,0px) var(--shadow-y,6px) var(--shadow-blur,20px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.10))';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          'var(--shadow-x,0px) var(--shadow-y,1px) var(--shadow-blur,6px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.05))';
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{title}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>{desc}</div>
          </div>
        </div>
        {/* big percent */}
        <div
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: barColor,
            lineHeight: 1,
            letterSpacing: '-1px',
          }}
        >
          {percent}
          <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>%</span>
        </div>
      </div>

      {/* progress bar */}
      <div>
        <div
          style={{
            height: 8,
            borderRadius: 99,
            background: barTrack ?? 'var(--muted)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${barWidth}%`,
              borderRadius: 99,
              background: barColor,
              transition: 'width 1.2s cubic-bezier(.4,0,.2,1)',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 6,
            fontSize: 11,
            color: 'var(--muted-foreground)',
          }}
        >
          <span>
            已完成 <strong style={{ color: 'var(--foreground)' }}>{current}</strong>
          </span>
          <span>
            目标 <strong style={{ color: 'var(--foreground)' }}>{total}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

const PROGRESS_CARDS: ProgressCardProps[] = [
  {
    icon: <ShoppingCartIcon size={17} />,
    iconColor: '#6366f1',
    iconBg: 'rgba(99,102,241,.12)',
    title: '月度订单目标',
    desc: '本月销售订单达成进度',
    percent: 78,
    barColor: '#6366f1',
    current: '34,921',
    total: '45,000',
  },
  {
    icon: <DollarSignIcon size={17} />,
    iconColor: '#f97316',
    iconBg: 'rgba(249,115,22,.12)',
    title: '营收目标',
    desc: '本月 GMV 完成比例',
    percent: 91,
    barColor: '#f97316',
    current: '¥134 万',
    total: '¥147 万',
  },
  {
    icon: <UsersIcon size={17} />,
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,.12)',
    title: '新增用户目标',
    desc: '本月拉新用户达成情况',
    percent: 64,
    barColor: '#22c55e',
    current: '6,412',
    total: '10,000',
  },
  {
    icon: <CheckCircleIcon size={17} />,
    iconColor: '#0d9488',
    iconBg: 'rgba(20,184,166,.12)',
    title: '任务完成率',
    desc: '本季度迭代任务关闭率',
    percent: 87,
    barColor: '#0d9488',
    current: '217',
    total: '249',
  },
  {
    icon: <ZapIcon size={17} />,
    iconColor: '#db2777',
    iconBg: 'rgba(244,114,182,.12)',
    title: '活动参与目标',
    desc: '本期营销活动参与用户数',
    percent: 55,
    barColor: '#db2777',
    current: '27,500',
    total: '50,000',
  },
  {
    icon: <StarIcon size={17} />,
    iconColor: '#ca8a04',
    iconBg: 'rgba(234,179,8,.12)',
    title: '好评率目标',
    desc: '目标维持好评率 ≥ 96%',
    percent: 97,
    barColor: '#ca8a04',
    current: '97.4%',
    total: '96%',
  },
];

// ══════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════

export default function CardPage() {
  useAccent(); // keep accent reactive

  return (
    <AdminLayout>
      <style>{`
        @keyframes card-fade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ animation: 'card-fade .4s ease', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>卡片模板</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            统计卡片文字版 · 数字滚动版 · 自定义彩色底 · 进度卡片
          </p>
        </div>

        {/* 1. 文字型统计卡片 */}
        <Section
          title="统计卡片（文字型）"
          desc="左侧彩色圆角图标 + 标题 + 灰色描述文字 + 趋势标签，4 张一排"
        >
          <CardGrid>
            {TEXT_CARDS.map((c, i) => (
              <TextStatCard key={i} {...c} />
            ))}
          </CardGrid>
        </Section>

        {/* 2. 数字滚动统计卡片 */}
        <Section
          title="统计卡片（数字滚动）"
          desc="页面加载时数字从 0 动画滚动到目标值，ease-out 缓动效果"
        >
          <CardGrid>
            {NUM_CARDS.map((c, i) => (
              <NumStatCard key={i} {...c} />
            ))}
          </CardGrid>
        </Section>

        {/* 3. 彩色底统计卡片 */}
        <Section
          title="统计卡片（自定义彩色底）"
          desc="淡蓝 / 淡黄 / 淡青 / 淡粉四色底，自动适配亮色与暗色模式"
        >
          <CardGrid>
            {COLOR_CARDS.map((c, i) => (
              <ColorCard key={i} {...c} />
            ))}
          </CardGrid>
        </Section>

        {/* 4. 进度卡片 */}
        <Section
          title="进度卡片"
          desc="大号百分比数字 + 动画进度条 + 完成/目标数据对照，6 张 2 列展示"
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            {PROGRESS_CARDS.map((c, i) => (
              <div key={i} style={{ flex: '1 1 280px', minWidth: 0 }}>
                <ProgressCard {...c} />
              </div>
            ))}
          </div>
        </Section>

      </div>
    </AdminLayout>
  );
}
