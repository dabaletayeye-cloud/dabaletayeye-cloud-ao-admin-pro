import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import ReactECharts from 'echarts-for-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import {
  DollarSignIcon,
  ShoppingBagIcon,
  TargetIcon,
  UserPlusIcon,
  DownloadIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  FlagIcon,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface StatItem {
  key: string;
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const RETURNING   = [820,  932,  701, 1034, 1290, 1180,  960];
const NEW_USER    = [420,  530,  480,  620,  780,  890,  640];

// 总收入分组柱
const ONLINE_REV  = [4200, 5800, 3900, 6700, 8100, 7300, 5500];
const OFFLINE_REV = [2100, 3200, 2700, 4100, 3800, 5100, 3300];

// 客户满意度
const SAT_LAST    = [72, 68, 75, 71, 78, 74, 80];
const SAT_THIS    = [76, 74, 79, 83, 85, 88, 87];

// 目标与实际
const TARGET_ACT  = [1100, 1350, 980, 1520, 1680, 1320, 870];

// ── Animated counter ───────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1300): number {
  const [cur, setCur] = useState(0);
  const raf = useRef<number | null>(null);
  const t0  = useRef<number | null>(null);

  useEffect(() => {
    t0.current = null;
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

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmt(n: number, suffix: string, locale: string): string {
  if (suffix === '%') return n.toFixed(1);
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  return n.toLocaleString(locale);
}

// ── Animated big number ────────────────────────────────────────────────────────
function AnimatedNum({ value, prefix = '' }: { value: number; prefix?: string }) {
  const { i18n } = useTranslation();
  const anim = useCountUp(value, 1400);
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{anim.toLocaleString(i18n.language)}
    </span>
  );
}

// ── Top stat card ──────────────────────────────────────────────────────────────
function StatCard({ item }: { item: StatItem }) {
  const { t, i18n } = useTranslation();
  const animated = useCountUp(item.value);
  const isUp     = item.change >= 0;

  return (
    <div
      data-cmp="StatCard"
      style={{
        flex: '1 1 0',
        minWidth: 0,
        background: 'var(--background)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 13,
            background: item.iconBg, color: item.iconColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {item.icon}
        </div>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '4px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: isUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color:      isUp ? '#10b981'                : '#ef4444',
          }}
        >
          {isUp ? <ArrowUpIcon size={10} /> : <ArrowDownIcon size={10} />}
          {Math.abs(item.change)}%
        </span>
      </div>

      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
          {item.prefix}{fmt(animated, item.suffix, i18n.language)}{item.suffix !== '%' && item.prefix !== '¥' ? item.suffix : ''}
          {item.suffix === '%' ? '%' : ''}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 6, fontWeight: 500 }}>
          {item.label}
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        {t('analytics.comparedYesterday')}&nbsp;
        <span style={{ fontWeight: 700, color: isUp ? '#10b981' : '#ef4444' }}>
          {isUp ? '+' : ''}{item.change}%
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardAnalyticsPage() {
  const { themeState } = useTheme();
  const { t, i18n } = useTranslation();
  const isManga    = themeState.themeId === 'manga';
  const isDark     = themeState.mode === 'dark';
  const primaryHex = isManga ? '#E91E8C' : '#6366f1';
  const primaryAlpha = isManga ? 'rgba(233,30,140,0.12)' : 'rgba(99,102,241,0.12)';

  // ── Shared chart style tokens ──────────────────────────────────────────────
  const gridLine    = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const axisLabel   = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
  const tipBg       = isDark ? '#1e2130' : '#ffffff';
  const tipBorder   = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const tipText     = isDark ? '#e2e8f0' : '#1e293b';
  const barRadius   = [6, 6, 0, 0] as [number, number, number, number];
  const weekDays = Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(new Date(2024, 0, index + 1)));

  const tooltipBase = {
    trigger: 'axis' as const,
    backgroundColor: tipBg,
    borderColor: tipBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: [12, 16],
    textStyle: { color: tipText, fontSize: 12 },
    axisPointer: {
      type: 'shadow' as const,
      shadowStyle: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
    },
  };

  const xAxisBase = (data: string[]) => ({
    type: 'category' as const,
    data,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: axisLabel, fontSize: 11 },
    splitLine: { show: false },
  });

  const yAxisBase = {
    type: 'value' as const,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: axisLabel, fontSize: 10 },
    splitLine: { lineStyle: { color: gridLine, type: 'dashed' as const } },
  };

  // ── Stat items ─────────────────────────────────────────────────────────────
  const STATS: StatItem[] = [
    { key: 'revenue',    label: t('analytics.todayRevenue'), value: 128640, prefix: '¥', suffix: '',  change: 12.5,  icon: <DollarSignIcon size={20} />, iconBg: primaryAlpha,               iconColor: primaryHex   },
    { key: 'orders',     label: t('analytics.todayOrders'), value: 3842,   prefix: '',  suffix: i18n.language.startsWith('zh') ? '单' : '', change: 8.3,   icon: <ShoppingBagIcon size={20} />, iconBg: 'rgba(16,185,129,0.12)',   iconColor: '#10b981'    },
    { key: 'conversion', label: t('analytics.conversion'), value: 68,     prefix: '',  suffix: '%',  change: -2.1,  icon: <TargetIcon size={20} />,     iconBg: 'rgba(245,158,11,0.12)',   iconColor: '#f59e0b'    },
    { key: 'newUsers',   label: t('analytics.newCustomers'), value: 1247,   prefix: '',  suffix: i18n.language.startsWith('zh') ? '人' : '', change: 15.8,  icon: <UserPlusIcon size={20} />,   iconBg: 'rgba(59,130,246,0.12)',   iconColor: '#3b82f6'    },
  ];

  // ── Chart 1: 访客洞察 双折线 ───────────────────────────────────────────────
  const visitorOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 16, right: 12, bottom: 56, left: 44 },
    tooltip: { ...tooltipBase, axisPointer: { type: 'line' as const, lineStyle: { color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)', width: 1, type: 'dashed' as const } } },
    legend: { bottom: 4, left: 'center', itemWidth: 10, itemHeight: 10, textStyle: { color: axisLabel, fontSize: 12 }, icon: 'circle' },
    xAxis: { ...xAxisBase(weekDays), boundaryGap: false },
    yAxis: yAxisBase,
    series: [
      {
        name: t('analytics.returningCustomers'), type: 'line', data: RETURNING, smooth: true, symbol: 'none',
        lineStyle: { color: primaryHex, width: 2.5 }, itemStyle: { color: primaryHex },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: isManga ? 'rgba(233,30,140,0.22)' : 'rgba(99,102,241,0.22)' }, { offset: 1, color: 'rgba(0,0,0,0)' }] } },
      },
      {
        name: t('analytics.newCustomers'), type: 'line', data: NEW_USER, smooth: true, symbol: 'none',
        lineStyle: { color: '#10b981', width: 2.5 }, itemStyle: { color: '#10b981' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.18)' }, { offset: 1, color: 'rgba(0,0,0,0)' }] } },
      },
    ],
  }), [isManga, isDark, primaryHex, tipBg, tipBorder, tipText, axisLabel, gridLine, i18n.language, t]);

  // ── Chart 2: 总收入 分组柱 ─────────────────────────────────────────────────
  const revenueOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 16, right: 12, bottom: 56, left: 48 },
    tooltip: tooltipBase,
    legend: { bottom: 4, left: 'center', itemWidth: 10, itemHeight: 10, textStyle: { color: axisLabel, fontSize: 12 }, icon: 'circle' },
    xAxis: xAxisBase(weekDays),
    yAxis: { ...yAxisBase, axisLabel: { color: axisLabel, fontSize: 10, formatter: (v: number) => v >= 1000 ? `${v / 1000}k` : String(v) } },
    series: [
      {
        name: t('analytics.onlineSales'), type: 'bar', data: ONLINE_REV, barMaxWidth: 14,
        itemStyle: { color: primaryHex, borderRadius: barRadius },
      },
      {
        name: t('analytics.offlineSales'), type: 'bar', data: OFFLINE_REV, barMaxWidth: 14,
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#38bdf8' }, { offset: 1, color: '#0ea5e9' }] },
          borderRadius: barRadius,
        },
      },
    ],
  }), [isManga, isDark, primaryHex, tipBg, tipBorder, tipText, axisLabel, gridLine, i18n.language, t]);

  // ── Chart 3: 客户满意度 双折线面积 ────────────────────────────────────────
  const satOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 16, right: 12, bottom: 56, left: 40 },
    tooltip: { ...tooltipBase, axisPointer: { type: 'line' as const, lineStyle: { color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)', width: 1, type: 'dashed' as const } } },
    legend: { bottom: 4, left: 'center', itemWidth: 10, itemHeight: 10, textStyle: { color: axisLabel, fontSize: 12 }, icon: 'circle' },
    xAxis: { ...xAxisBase(weekDays), boundaryGap: false },
    yAxis: { ...yAxisBase, min: 60, max: 100, axisLabel: { color: axisLabel, fontSize: 10, formatter: (v: number) => `${v}%` } },
    series: [
      {
        name: t('analytics.lastMonth'), type: 'line', data: SAT_LAST, smooth: true, symbol: 'none',
        lineStyle: { color: '#f59e0b', width: 2 }, itemStyle: { color: '#f59e0b' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,158,11,0.18)' }, { offset: 1, color: 'rgba(245,158,11,0)' }] } },
      },
      {
        name: t('analytics.thisMonth'), type: 'line', data: SAT_THIS, smooth: true, symbol: 'none',
        lineStyle: { color: '#3b82f6', width: 2.5 }, itemStyle: { color: '#3b82f6' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.22)' }, { offset: 1, color: 'rgba(59,130,246,0)' }] } },
      },
    ],
  }), [isDark, tipBg, tipBorder, tipText, axisLabel, gridLine, i18n.language, t]);

  // ── Chart 4: 目标与实际 单柱 ───────────────────────────────────────────────
  const targetOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 12, right: 12, bottom: 40, left: 44 },
    tooltip: tooltipBase,
    xAxis: xAxisBase(weekDays),
    yAxis: { ...yAxisBase, axisLabel: { color: axisLabel, fontSize: 10, formatter: (v: number) => v >= 1000 ? `${v / 1000}k` : String(v) } },
    series: [
      {
        name: t('analytics.actualSales'), type: 'bar', data: TARGET_ACT, barMaxWidth: 18,
        itemStyle: {
          borderRadius: barRadius,
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: isManga ? '#E91E8C' : '#818cf8' },
              { offset: 1, color: isManga ? 'rgba(233,30,140,0.35)' : 'rgba(99,102,241,0.35)' },
            ],
          },
        },
      },
    ],
  }), [isManga, isDark, tipBg, tipBorder, tipText, axisLabel, gridLine, i18n.language, t]);

  // ── Local states ───────────────────────────────────────────────────────────
  const [exportHover, setExportHover] = useState(false);
  const handleExport = () => toast.success(t('analytics.reportExported'));

  // ── Section card wrapper style ────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '22px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  };

  const cardTitle = (title: string, sub: string) => (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.2px' }}>{title}</div>
      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 3, fontWeight: 500 }}>{sub}</div>
    </div>
  );

  return (
    <AdminLayout>
      <div
        data-cmp="DashboardAnalyticsPage"
        style={{ minHeight: '100%', background: 'var(--background)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {/* ── 页头 ─────────────────────────────────────────────────────────── */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>{t('analytics.title')}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>{t('analytics.subtitle')}</p>
        </div>

        {/* ── 上半区 ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>

          {/* 今日销售 */}
          <div style={{ ...cardStyle, flex: '6 1 0', minWidth: 0, gap: 22 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.2px' }}>{t('analytics.todaySales')}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 3, fontWeight: 500 }}>{t('analytics.salesSummary')}</div>
              </div>
              <button
                onClick={handleExport}
                onMouseEnter={() => setExportHover(true)}
                onMouseLeave={() => setExportHover(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 15px', borderRadius: 10, cursor: 'pointer', flexShrink: 0,
                  border: `1.5px solid ${exportHover ? primaryHex : 'var(--border)'}`,
                  background: exportHover ? (isManga ? 'rgba(233,30,140,0.06)' : 'rgba(99,102,241,0.06)') : 'transparent',
                  color: exportHover ? primaryHex : 'var(--foreground)',
                  fontSize: 12, fontWeight: 600,
                  transition: 'border-color 0.18s, background 0.18s, color 0.18s',
                }}
              >
                <DownloadIcon size={13} />{t('analytics.exportReport')}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              {STATS.map(item => <StatCard key={item.key} item={item} />)}
            </div>
          </div>

          {/* 访客洞察 */}
          <div style={{ ...cardStyle, flex: '4 1 0', minWidth: 0 }}>
            {cardTitle(t('analytics.visitorInsights'), t('analytics.visitorSubtitle'))}
            <div style={{ flex: 1, minHeight: 220 }}>
              <ReactECharts option={visitorOption} style={{ height: '100%', width: '100%' }} notMerge />
            </div>
          </div>

        </div>

        {/* ── 下半区三列 ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>

          {/* ① 总收入 — 分组柱状图 */}
          <div style={{ ...cardStyle, flex: '1 1 0', minWidth: 0 }}>
            {cardTitle(t('analytics.totalRevenue'), t('analytics.totalRevenueSubtitle'))}
            <div style={{ height: 220 }}>
              <ReactECharts option={revenueOption} style={{ height: '100%', width: '100%' }} notMerge />
            </div>
          </div>

          {/* ② 客户满意度 — 双折线面积 */}
          <div style={{ ...cardStyle, flex: '1 1 0', minWidth: 0 }}>
            {cardTitle(t('analytics.satisfaction'), t('analytics.satisfactionSubtitle'))}
            <div style={{ height: 220 }}>
              <ReactECharts option={satOption} style={{ height: '100%', width: '100%' }} notMerge />
            </div>
          </div>

          {/* ③ 目标与实际 — 单柱 + 两行统计 */}
          <div style={{ ...cardStyle, flex: '1 1 0', minWidth: 0 }}>
            {cardTitle(t('analytics.targetActual'), t('analytics.targetActualSubtitle'))}

            <div style={{ height: 160 }}>
              <ReactECharts option={targetOption} style={{ height: '100%', width: '100%' }} notMerge />
            </div>

            {/* 分割线 */}
            <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />

            {/* 两行统计 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* 实际销售额 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: primaryAlpha, color: primaryHex, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingUpIcon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>{t('analytics.actualSales')}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted-foreground)', marginTop: 1 }}>{t('analytics.weeklyAccumulated')}</div>
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
                  <AnimatedNum value={8823} />
                </div>
              </div>

              {/* 目标销售额 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FlagIcon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>{t('analytics.targetSales')}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted-foreground)', marginTop: 1 }}>{t('analytics.weeklyTarget')}</div>
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
                  <AnimatedNum value={12122} />
                </div>
              </div>

              {/* 进度条 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 10, color: 'var(--muted-foreground)' }}>
                  <span>{t('analytics.progress')}</span>
                  <span style={{ fontWeight: 700, color: primaryHex }}>72.8%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%', width: '72.8%', borderRadius: 99,
                      background: `linear-gradient(90deg, ${primaryHex}, ${isManga ? '#ff6eb4' : '#818cf8'})`,
                    }}
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
