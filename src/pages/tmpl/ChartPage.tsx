import React, { useCallback, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { localizeText } from '../../i18n/localizeText';

function useTemplateText() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  return useCallback((value: string) => localizeText(value, language), [language]);
}

/* ─────────────────────────────────────────────────────────────
   Theme palette helper
───────────────────────────────────────────────────────────── */
function usePalette() {
  const { themeState } = useTheme();
  const isDark = themeState.mode === 'dark';
  const isManga = themeState.themeId === 'manga';

  // Accent sequence: primary → secondary tones
  const primary = isManga ? '#E91E8C' : '#6366f1';
  const teal    = '#14b8a6';
  const amber   = '#f59e0b';
  const rose    = '#f43f5e';
  const sky     = '#38bdf8';
  const violet  = '#a78bfa';
  const emerald = '#34d399';

  const textMain   = isDark ? '#e2e8f0' : '#1e293b';
  const textMuted  = isDark ? '#94a3b8' : '#64748b';
  const splitLine  = isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)';
  const axisLine   = isDark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)';
  const tooltipBg  = isDark ? '#1e293b' : '#ffffff';
  const tooltipBdr = isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)';
  const cardBg     = isDark ? 'transparent' : 'transparent';

  return {
    isDark, primary, teal, amber, rose, sky, violet, emerald,
    textMain, textMuted, splitLine, axisLine,
    tooltipBg, tooltipBdr, cardBg,
    palette: [primary, teal, amber, rose, sky, violet, emerald],
  };
}

/* ─────────────────────────────────────────────────────────────
   Shared card wrapper
───────────────────────────────────────────────────────────── */
interface ChartCardProps {
  title: string;
  desc: string;
  children: React.ReactNode;
}
function ChartCard({ title, desc, children }: ChartCardProps) {
  return (
    <div
      data-cmp="ChartCard"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow:
          'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,10px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.06))',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ flex: 1, padding: '8px 4px 4px' }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   1. 折线图 — 面积渐变
───────────────────────────────────────────────────────────── */
function LineAreaChart() {
  const p = usePalette();
  const tx = useTemplateText();

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 24, right: 20, bottom: 36, left: 48, containLabel: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: p.tooltipBg,
      borderColor: p.tooltipBdr,
      borderWidth: 1,
      textStyle: { color: p.textMain, fontSize: 12 },
      axisPointer: { lineStyle: { color: p.splitLine, width: 1.5 } },
    },
    legend: {
      top: 0, right: 0,
      textStyle: { color: p.textMuted, fontSize: 11 },
      itemWidth: 12, itemHeight: 8,
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'].map(tx),
      axisLine: { lineStyle: { color: p.axisLine } },
      axisTick: { show: false },
      axisLabel: { color: p.textMuted, fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: p.textMuted, fontSize: 11 },
      splitLine: { lineStyle: { color: p.splitLine, type: 'dashed' } },
    },
    series: [
      {
        name: tx('访问量'),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: p.primary, width: 2.5 },
        itemStyle: { color: p.primary, borderWidth: 2, borderColor: p.isDark ? '#1e293b' : '#fff' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: p.primary + (p.isDark ? '55' : '33') },
              { offset: 1, color: p.primary + '00' },
            ],
          },
        },
        data: [3200, 4100, 3800, 5200, 4900, 6300, 5800, 7100, 6600, 7800, 8200, 9100],
      },
      {
        name: tx('转化数'),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: p.teal, width: 2.5 },
        itemStyle: { color: p.teal, borderWidth: 2, borderColor: p.isDark ? '#1e293b' : '#fff' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: p.teal + (p.isDark ? '44' : '28') },
              { offset: 1, color: p.teal + '00' },
            ],
          },
        },
        data: [1200, 1600, 1400, 2100, 1900, 2600, 2400, 2900, 2700, 3200, 3500, 3900],
      },
    ],
  }), [p, tx]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 260 }}
      opts={{ renderer: 'svg' }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   2. 柱状图
───────────────────────────────────────────────────────────── */
function BarChart() {
  const p = usePalette();
  const tx = useTemplateText();

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 24, right: 20, bottom: 36, left: 48, containLabel: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: p.tooltipBg,
      borderColor: p.tooltipBdr,
      borderWidth: 1,
      textStyle: { color: p.textMain, fontSize: 12 },
      axisPointer: { type: 'shadow', shadowStyle: { color: p.isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)' } },
    },
    legend: {
      top: 0, right: 0,
      textStyle: { color: p.textMuted, fontSize: 11 },
      itemWidth: 12, itemHeight: 8,
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(tx),
      axisLine: { lineStyle: { color: p.axisLine } },
      axisTick: { show: false },
      axisLabel: { color: p.textMuted, fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: p.textMuted, fontSize: 11 },
      splitLine: { lineStyle: { color: p.splitLine, type: 'dashed' } },
    },
    series: [
      {
        name: tx('新增用户'),
        type: 'bar',
        barWidth: '30%',
        barMaxWidth: 28,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: p.primary },
              { offset: 1, color: p.primary + 'aa' },
            ],
          },
          borderRadius: [5, 5, 0, 0],
        },
        data: [420, 380, 510, 460, 590, 340, 280],
      },
      {
        name: tx('活跃用户'),
        type: 'bar',
        barWidth: '30%',
        barMaxWidth: 28,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: p.teal },
              { offset: 1, color: p.teal + 'aa' },
            ],
          },
          borderRadius: [5, 5, 0, 0],
        },
        data: [320, 290, 410, 370, 480, 260, 200],
      },
    ],
  }), [p, tx]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 260 }}
      opts={{ renderer: 'svg' }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   3. 环形饼图
───────────────────────────────────────────────────────────── */
function DonutChart() {
  const p = usePalette();
  const tx = useTemplateText();

  const data = [
    { value: 38, name: tx('直接访问') },
    { value: 26, name: tx('搜索引擎') },
    { value: 19, name: tx('社交媒体') },
    { value: 11, name: tx('邮件营销') },
    { value: 6,  name: tx('其他渠道') },
  ];

  const colors = [p.primary, p.teal, p.amber, p.rose, p.sky];

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    color: colors,
    tooltip: {
      trigger: 'item',
      backgroundColor: p.tooltipBg,
      borderColor: p.tooltipBdr,
      borderWidth: 1,
      textStyle: { color: p.textMain, fontSize: 12 },
      formatter: '{b}: {c}% ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 16,
      top: 'middle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
      textStyle: { color: p.textMuted, fontSize: 11 },
      formatter: (name: string) => {
        const item = data.find(d => d.name === name);
        return `{name|${name}}  {val|${item?.value ?? 0}%}`;
      },
      rich: {
        name: { color: p.textMuted, fontSize: 11, width: 64 },
        val: { color: p.textMain, fontSize: 12, fontWeight: 700 },
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['46%', '70%'],
        center: ['36%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: p.isDark ? '#1e293b' : '#ffffff', borderWidth: 2 },
        label: {
          show: true,
          position: 'center',
          formatter: () => `{title|${tx('流量来源')}}\n{sub|${tx('本月')}}`,
          rich: {
            title: { color: p.textMuted, fontSize: 11, lineHeight: 20 },
            sub: { color: p.textMuted, fontSize: 10 },
          },
        },
        emphasis: {
          label: { show: true },
          itemStyle: { shadowBlur: 12, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,.2)' },
        },
        data,
      },
    ],
  }), [p, tx]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 260 }}
      opts={{ renderer: 'svg' }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   4. 雷达图
───────────────────────────────────────────────────────────── */
function RadarChart() {
  const p = usePalette();
  const tx = useTemplateText();

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    color: [p.primary, p.teal],
    tooltip: {
      trigger: 'item',
      backgroundColor: p.tooltipBg,
      borderColor: p.tooltipBdr,
      borderWidth: 1,
      textStyle: { color: p.textMain, fontSize: 12 },
    },
    legend: {
      bottom: 6,
      textStyle: { color: p.textMuted, fontSize: 11 },
      itemWidth: 12, itemHeight: 8,
    },
    radar: {
      center: ['50%', '48%'],
      radius: '62%',
      nameGap: 8,
      axisName: {
        color: p.textMuted,
        fontSize: 11,
      },
      splitLine: { lineStyle: { color: p.splitLine, width: 1 } },
      splitArea: {
        show: true,
        areaStyle: {
          color: p.isDark
            ? ['rgba(255,255,255,.02)', 'rgba(255,255,255,.04)']
            : ['rgba(0,0,0,.015)', 'rgba(0,0,0,.03)'],
        },
      },
      axisLine: { lineStyle: { color: p.axisLine } },
      indicator: [
        { name: tx('产品质量'), max: 100 },
        { name: tx('用户体验'), max: 100 },
        { name: tx('交付速度'), max: 100 },
        { name: tx('市场覆盖'), max: 100 },
        { name: tx('客户满意'), max: 100 },
        { name: tx('技术能力'), max: 100 },
      ],
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            name: tx('本季度'),
            value: [88, 75, 82, 70, 91, 85],
            lineStyle: { color: p.primary, width: 2 },
            itemStyle: { color: p.primary },
            areaStyle: { color: p.primary + (p.isDark ? '33' : '22') },
            symbol: 'circle',
            symbolSize: 5,
          },
          {
            name: tx('上季度'),
            value: [72, 68, 74, 62, 80, 76],
            lineStyle: { color: p.teal, width: 2 },
            itemStyle: { color: p.teal },
            areaStyle: { color: p.teal + (p.isDark ? '28' : '18') },
            symbol: 'circle',
            symbolSize: 5,
          },
        ],
      },
    ],
  }), [p, tx]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 260 }}
      opts={{ renderer: 'svg' }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   5. 散点图
───────────────────────────────────────────────────────────── */
function ScatterChart() {
  const p = usePalette();
  const tx = useTemplateText();

  // [x: 消费金额, y: 满意度评分, z: 购买次数(bubble size)]
  const genData = (n: number, xBase: number, yBase: number, seed: number) =>
    Array.from({ length: n }, (_, i) => {
      const r = Math.sin(seed + i * 2.3) * 0.5 + 0.5;
      const r2 = Math.sin(seed + i * 1.7 + 1) * 0.5 + 0.5;
      return [
        Math.round(xBase + r * 3000),
        Math.round((yBase + r2 * 2) * 10) / 10,
        Math.round(r * 20 + 3),
      ];
    });

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 28, right: 28, bottom: 40, left: 54, containLabel: false },
    tooltip: {
      trigger: 'item',
      backgroundColor: p.tooltipBg,
      borderColor: p.tooltipBdr,
      borderWidth: 1,
      textStyle: { color: p.textMain, fontSize: 12 },
      formatter: (params: { seriesName: string; value: number[] }) =>
        `${params.seriesName}<br/>${tx('消费')}：¥${params.value[0]}<br/>${tx('评分')}：${params.value[1]}<br/>${tx('次数')}：${params.value[2]}`,
    },
    legend: {
      top: 2, right: 0,
      textStyle: { color: p.textMuted, fontSize: 11 },
      itemWidth: 10, itemHeight: 10,
    },
    xAxis: {
      type: 'value',
      name: tx('消费金额(¥)'),
      nameLocation: 'end',
      nameTextStyle: { color: p.textMuted, fontSize: 10, padding: [0, 0, 0, -10] },
      axisLine: { lineStyle: { color: p.axisLine } },
      axisTick: { show: false },
      axisLabel: {
        color: p.textMuted, fontSize: 10,
        formatter: (v: number) => v >= 1000 ? `${v / 1000}k` : `${v}`,
      },
      splitLine: { lineStyle: { color: p.splitLine, type: 'dashed' } },
    },
    yAxis: {
      type: 'value',
      name: tx('满意度'),
      nameLocation: 'end',
      nameTextStyle: { color: p.textMuted, fontSize: 10 },
      min: 1, max: 10,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: p.textMuted, fontSize: 10 },
      splitLine: { lineStyle: { color: p.splitLine, type: 'dashed' } },
    },
    series: [
      {
        name: tx('高价值用户'),
        type: 'scatter',
        data: genData(30, 4000, 7, 1),
        symbolSize: (d: number[]) => Math.max(d[2] * 1.6, 6),
        itemStyle: { color: p.primary, opacity: 0.75, borderColor: p.primary + '44', borderWidth: 1 },
      },
      {
        name: tx('普通用户'),
        type: 'scatter',
        data: genData(40, 800, 4.5, 42),
        symbolSize: (d: number[]) => Math.max(d[2] * 1.2, 5),
        itemStyle: { color: p.teal, opacity: 0.65, borderColor: p.teal + '44', borderWidth: 1 },
      },
    ],
  }), [p, tx]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 260 }}
      opts={{ renderer: 'svg' }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   6. 横向条形图
───────────────────────────────────────────────────────────── */
function HBarChart() {
  const p = usePalette();
  const tx = useTemplateText();

  const categories = ['微信生态', '抖音渠道', '百度 SEO', '知乎内容', '微博推广', '线下活动', '邮件营销'].map(tx);
  const values     = [8420, 7350, 6180, 4920, 3870, 2940, 1820];
  const maxVal     = Math.max(...values);

  const colorStops = [p.primary, p.violet, p.teal, p.sky, p.emerald, p.amber, p.rose];

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 12, right: 60, bottom: 16, left: 84, containLabel: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: p.tooltipBg,
      borderColor: p.tooltipBdr,
      borderWidth: 1,
      textStyle: { color: p.textMain, fontSize: 12 },
      axisPointer: { type: 'shadow', shadowStyle: { color: p.isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)' } },
      formatter: (params: { name: string; value: number }[]) =>
        `${params[0].name}：${params[0].value.toLocaleString()}`,
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: p.textMuted, fontSize: 10,
        formatter: (v: number) => v >= 1000 ? `${v / 1000}k` : `${v}`,
      },
      splitLine: { lineStyle: { color: p.splitLine, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: p.textMuted, fontSize: 11 },
      splitLine: { show: false },
      inverse: true,
    },
    series: [
      {
        type: 'bar',
        barWidth: 14,
        barMaxWidth: 18,
        label: {
          show: true,
          position: 'right',
          distance: 6,
          color: p.textMuted,
          fontSize: 10,
          formatter: ({ value }: { value: number }) => value.toLocaleString(),
        },
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: ({ dataIndex }: { dataIndex: number }) => ({
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: colorStops[dataIndex % colorStops.length] },
              { offset: 1, color: colorStops[dataIndex % colorStops.length] + (p.isDark ? 'bb' : 'cc') },
            ],
          }),
        },
        data: values,
        showBackground: true,
        backgroundStyle: {
          color: p.isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)',
          borderRadius: [0, 6, 6, 0],
        },
      },
    ],
  }), [p, tx]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 260 }}
      opts={{ renderer: 'svg' }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function ChartPage() {
  const tx = useTemplateText();
  return (
    <AdminLayout>
      <style>{`
        @keyframes chart-fade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .chart-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
        }
        .chart-grid > * {
          flex: 1 1 calc(50% - 9px);
          min-width: 320px;
        }
      `}</style>

      <div style={{ animation: 'chart-fade .4s ease', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>{tx('图表模板')}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            {tx('基于 ECharts · 折线图 · 柱状图 · 环形饼图 · 雷达图 · 散点图 · 横向条形图 · 暗色自动适配')}
          </p>
        </div>

        {/* 两列网格 */}
        <div className="chart-grid">

          <ChartCard
            title={tx('折线图 — 面积渐变')}
            desc={tx('访问量与转化数年度趋势，渐变填充区域增强视觉层次')}
          >
            <LineAreaChart />
          </ChartCard>

          <ChartCard
            title={tx('柱状图')}
            desc={tx('本周每日新增与活跃用户对比，渐变色柱体 + 圆角顶部')}
          >
            <BarChart />
          </ChartCard>

          <ChartCard
            title={tx('环形饼图')}
            desc={tx('流量来源渠道分布，环形中心保留标题区域，右侧图例带数值')}
          >
            <DonutChart />
          </ChartCard>

          <ChartCard
            title={tx('雷达图')}
            desc={tx('本季度与上季度六维能力对比，填充面积显示差距')}
          >
            <RadarChart />
          </ChartCard>

          <ChartCard
            title={tx('散点图')}
            desc={tx('用户消费金额 vs 满意度评分分布，气泡大小代表购买次数')}
          >
            <ScatterChart />
          </ChartCard>

          <ChartCard
            title={tx('横向条形图')}
            desc={tx('各渠道获客数量排名，渐变色彩条 + 背景衬底 + 行内标签')}
          >
            <HBarChart />
          </ChartCard>

        </div>
      </div>
    </AdminLayout>
  );
}
