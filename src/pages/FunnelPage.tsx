import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { BarChartSvg, FunnelChartSvg, LineChartSvg } from '../components/AnalyticsSvgCharts';

import {
  ArrowDownIcon, ArrowUpIcon, TrendingUpIcon, UsersIcon,
  ShoppingCartIcon, CreditCardIcon, CheckCircle2Icon, MousePointerClickIcon,
} from 'lucide-react';



// ─── mock data ────────────────────────────────────────────────────────────────

const FUNNEL_MAIN = [
  { name: '访问首页',  value: 86420, fill: 'color-mix(in srgb, var(--primary) 95%, var(--card))' },
  { name: '浏览内容',  value: 62340, fill: 'color-mix(in srgb, var(--primary) 89%, var(--card))' },
  { name: '注册/登录', value: 28750, fill: 'color-mix(in srgb, var(--primary) 83%, var(--card))' },
  { name: '加入收藏',  value: 14230, fill: 'color-mix(in srgb, var(--primary) 77%, var(--card))' },
  { name: '分享传播',  value: 6870,  fill: 'color-mix(in srgb, var(--primary) 71%, var(--card))' },
  { name: '付费转化',  value: 2140,  fill: 'color-mix(in srgb, var(--primary) 65%, var(--card))' },
];

const FUNNEL_MOBILE = [
  { name: '访问首页',  value: 42810, fill: 'color-mix(in srgb, var(--primary) 95%, var(--card))' },
  { name: '浏览内容',  value: 29460, fill: 'color-mix(in srgb, var(--primary) 89%, var(--card))' },
  { name: '注册/登录', value: 11830, fill: 'color-mix(in srgb, var(--primary) 83%, var(--card))' },
  { name: '加入收藏',  value: 5210,  fill: 'color-mix(in srgb, var(--primary) 77%, var(--card))' },
  { name: '分享传播',  value: 2380,  fill: 'color-mix(in srgb, var(--primary) 71%, var(--card))' },
  { name: '付费转化',  value: 640,   fill: 'color-mix(in srgb, var(--primary) 65%, var(--card))' },
];

const STEP_DETAILS = FUNNEL_MAIN.map((step, i) => {
  const prev = i === 0 ? step.value : FUNNEL_MAIN[i - 1].value;
  const convRate = i === 0 ? 100 : ((step.value / prev) * 100).toFixed(1);
  const overallRate = ((step.value / FUNNEL_MAIN[0].value) * 100).toFixed(1);
  return {
    ...step,
    convRate: i === 0 ? '100%' : `${convRate}%`,
    overallRate: `${overallRate}%`,
    drop: i === 0 ? 0 : FUNNEL_MAIN[i - 1].value - step.value,
  };
});

const WEEKLY_TREND = Array.from({ length: 12 }, (_, i) => {
  const wk = `第${i + 1}周`;
  return {
    week: wk,
    convRate: +(1.8 + Math.random() * 1.8).toFixed(2),
    visitConv: +(65 + Math.random() * 15).toFixed(1),
  };
});

const CHANNEL_FUNNEL = [
  { channel: '搜索引擎', visit: 28400, register: 8230, pay: 680,  conv: '2.39%' },
  { channel: '直接访问', visit: 22100, register: 9840, pay: 780,  conv: '3.53%' },
  { channel: '社交媒体', visit: 18600, register: 5320, pay: 310,  conv: '1.67%' },
  { channel: '邮件推广', visit: 9400,  register: 3960, pay: 240,  conv: '2.55%' },
  { channel: '付费广告', visit: 7920,  register: 1820, pay: 130,  conv: '1.64%' },
];

const DROP_REASONS = [
  { reason: '页面加载慢', pct: 28 },
  { reason: '内容不感兴趣', pct: 24 },
  { reason: '注册流程复杂', pct: 18 },
  { reason: '价格偏高',    pct: 16 },
  { reason: '信任度不足',  pct: 9  },
  { reason: '其他',        pct: 5  },
];

type FunnelView = 'pc' | 'mobile';

export default function FunnelPage() {


  const primary = 'var(--primary)';
  const primaryHex = 'var(--primary)';

  const [view, setView] = useState<FunnelView>('pc');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const activeFunnel = view === 'pc' ? FUNNEL_MAIN : FUNNEL_MOBILE;
  const totalVisit = activeFunnel[0].value;
  const totalPay = activeFunnel[activeFunnel.length - 1].value;
  const overallConv = ((totalPay / totalVisit) * 100).toFixed(2);

  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '20px 24px',
  };

  const statCards = [
    { label: '漏斗顶部（访问）', value: totalVisit.toLocaleString(), change: '+9.3%',  up: true,  icon: <UsersIcon size={20} /> },
    { label: '注册/登录',        value: activeFunnel[2].value.toLocaleString(), change: '+6.7%', up: true, icon: <MousePointerClickIcon size={20} /> },
    { label: '加入收藏',         value: activeFunnel[3].value.toLocaleString(), change: '+4.1%', up: true, icon: <ShoppingCartIcon size={20} /> },
    { label: '付费转化',         value: totalPay.toLocaleString(),    change: '+11.2%', up: true,  icon: <CreditCardIcon size={20} /> },
    { label: '整体转化率',       value: `${overallConv}%`,            change: '+0.18%', up: true,  icon: <CheckCircle2Icon size={20} /> },
  ];

  return (
    <AdminLayout>
      <div data-cmp="FunnelPage" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>转化漏斗</h1>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '4px 0 0' }}>用户从访问到付费的全链路转化路径分析</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['pc', 'mobile'] as FunnelView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  border: view === v ? 'none' : '1px solid var(--border)',
                  background: view === v ? primary : 'var(--card)',
                  color: view === v ? 'var(--primary-foreground)' : 'var(--foreground)',
                  transition: 'all 0.15s',
                }}
              >
                {v === 'pc' ? '桌面端' : '移动端'}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {statCards.map((c, i) => (
            <div key={i} style={{ ...card, flex: '1 1 160px', minWidth: 150 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{c.label}</span>
                <span style={{ color: primary, opacity: 0.85 }}>{c.icon}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>{c.value}</div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                {c.up ? <ArrowUpIcon size={12} color="#22c55e" /> : <ArrowDownIcon size={12} color="#ef4444" />}
                <span style={{ fontSize: 12, color: c.up ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{c.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Funnel + Step Table */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* Recharts Funnel */}
          <div style={{ ...card, flex: '1 1 300px', minWidth: 280 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>
              转化漏斗图 · {view === 'pc' ? '桌面端' : '移动端'}
            </div>
            <FunnelChartSvg height={340} data={activeFunnel.map((item) => ({ name: item.name, value: item.value, color: item.fill }))} />
          </div>

          {/* Custom visual funnel */}
          <div style={{ ...card, flex: '2 1 400px', minWidth: 320 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 16 }}>各环节转化详情</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {STEP_DETAILS.map((s, i) => {
                const barPct = (s.value / FUNNEL_MAIN[0].value) * 100;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: s.fill,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary-foreground)', fontSize: 13, fontWeight: 700, flexShrink: 0,
                      }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{s.name}</span>
                          <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                            <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>总转化 <b style={{ color: 'var(--foreground)' }}>{s.overallRate}</b></span>
                            {i > 0 && (
                              <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>步骤转化 <b style={{ color: 'var(--chart-2)' }}>{s.convRate}</b></span>
                            )}
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{s.value.toLocaleString()}</span>
                          </div>
                        </div>
                        <div style={{ height: 8, background: 'var(--muted)', borderRadius: 999 }}>
                          <div style={{ width: `${barPct}%`, height: '100%', background: s.fill, borderRadius: 999, transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    </div>
                    {i < STEP_DETAILS.length - 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 40, gap: 8, marginBottom: 2 }}>
                        <ArrowDownIcon size={14} color="var(--muted-foreground)" />
                        <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                          流失 {(FUNNEL_MAIN[i].value - FUNNEL_MAIN[i + 1].value).toLocaleString()} 人
                          （{(((FUNNEL_MAIN[i].value - FUNNEL_MAIN[i + 1].value) / FUNNEL_MAIN[i].value) * 100).toFixed(1)}%）
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Trend + Drop Reasons */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ ...card, flex: '2 1 380px', minWidth: 300 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>转化率趋势（近12周）</div>
            <LineChartSvg height={220} data={WEEKLY_TREND} xKey="week" series={[{ key: 'convRate', name: '付费转化率', color: primaryHex }, { key: 'visitConv', name: '访问→内容率', color: 'var(--chart-4)' }]} />
          </div>

          <div style={{ ...card, flex: '1 1 240px', minWidth: 220 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUpIcon size={16} style={{ transform: 'rotate(180deg)' }} />
                流失原因分布
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DROP_REASONS.map((r, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                    <span style={{ color: 'var(--foreground)' }}>{r.reason}</span>
                    <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{r.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--muted)', borderRadius: 999 }}>
                    <div style={{ width: `${r.pct * 3}%`, height: '100%', background: `color-mix(in srgb, var(--primary) ${95 - i * 6}%, var(--card))`, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Comparison */}
        <div style={{ ...card }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 16 }}>各渠道漏斗对比</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 400px', minWidth: 300 }}>
              <BarChartSvg height={220} data={CHANNEL_FUNNEL} xKey="channel" series={[{ key: 'visit', name: '访问', color: primaryHex }, { key: 'register', name: '注册', color: 'var(--chart-4)' }, { key: 'pay', name: '付费', color: 'var(--chart-2)' }]} />
            </div>
            <div style={{ flex: '1 1 220px', minWidth: 200 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['渠道', '访问', '注册', '付费', '转化率'].map((h, i) => (
                        <th key={i} style={{ padding: '7px 10px', textAlign: i > 0 ? 'right' : 'left', color: 'var(--muted-foreground)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CHANNEL_FUNNEL.map((c, i) => (
                      <tr
                        key={i}
                        onMouseEnter={() => setHoveredRow(i)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{ borderBottom: '1px solid var(--border)', background: hoveredRow === i ? 'var(--muted)' : 'transparent', transition: 'background 0.12s' }}
                      >
                        <td style={{ padding: '9px 10px', color: 'var(--foreground)' }}>{c.channel}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', color: 'var(--muted-foreground)' }}>{c.visit.toLocaleString()}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', color: 'var(--muted-foreground)' }}>{c.register.toLocaleString()}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--foreground)' }}>{c.pay.toLocaleString()}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                          <span style={{
                            padding: '2px 7px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                            background: parseFloat(c.conv) > 2.5 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                            color: parseFloat(c.conv) > 2.5 ? '#16a34a' : '#d97706',
                          }}>{c.conv}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
