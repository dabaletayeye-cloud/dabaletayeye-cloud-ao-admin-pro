import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import {
  UsersIcon, EyeIcon, MousePointerClickIcon, TrendingUpIcon,
  ArrowUpIcon, ArrowDownIcon, MonitorIcon, SmartphoneIcon, TabletIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

// ─── mock data ───────────────────────────────────────────────────────────────

const DAILY_30 = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2025, 4, 1);
  d.setDate(d.getDate() + i);
  const label = `${d.getMonth() + 1}/${d.getDate()}`;
  const pv = Math.round(8000 + Math.random() * 6000);
  const uv = Math.round(pv * (0.35 + Math.random() * 0.2));
  const ip = Math.round(uv * (0.6 + Math.random() * 0.2));
  return { date: label, pv, uv, ip };
});

const HOURLY = Array.from({ length: 24 }, (_, i) => {
  const h = i < 10 ? `0${i}:00` : `${i}:00`;
  let base = 200;
  if (i >= 8 && i <= 12) base = 1200;
  else if (i >= 14 && i <= 18) base = 1500;
  else if (i >= 20 && i <= 23) base = 900;
  else if (i >= 0 && i <= 5) base = 80;
  return { hour: h, pv: Math.round(base + Math.random() * 300), uv: Math.round(base * 0.45 + Math.random() * 120) };
});

const SOURCE_DATA = [
  { name: '直接访问', value: 38, color: '#6366f1' },
  { name: '搜索引擎', value: 27, color: '#f59e0b' },
  { name: '社交媒体', value: 18, color: '#22c55e' },
  { name: '外部链接', value: 11, color: '#ec4899' },
  { name: '邮件推广', value: 6,  color: '#14b8a6' },
];

const DEVICE_DATA = [
  { name: '桌面端', value: 51 },
  { name: '移动端', value: 38 },
  { name: '平板端', value: 11 },
];

const TOP_PAGES = [
  { path: '/home',           title: '首页',         pv: 24530, uv: 11280, bounce: '32.4%', avgTime: '3:24' },
  { path: '/articles',       title: '文章列表',     pv: 18920, uv: 9340,  bounce: '41.2%', avgTime: '2:51' },
  { path: '/articles/1234',  title: '文章详情·CSS', pv: 12450, uv: 7620,  bounce: '28.7%', avgTime: '4:12' },
  { path: '/user/profile',   title: '个人中心',     pv: 9870,  uv: 6110,  bounce: '55.3%', avgTime: '1:45' },
  { path: '/dashboard',      title: '控制台',       pv: 8730,  uv: 4220,  bounce: '19.8%', avgTime: '5:37' },
  { path: '/analytics',      title: '数据分析',     pv: 7560,  uv: 3890,  bounce: '22.1%', avgTime: '4:58' },
  { path: '/settings',       title: '系统设置',     pv: 5430,  uv: 2740,  bounce: '60.4%', avgTime: '1:12' },
  { path: '/content/tags',   title: '标签管理',     pv: 4210,  uv: 2160,  bounce: '48.9%', avgTime: '2:05' },
];

const REGION_DATA = [
  { region: '广东', pv: 32140, pct: 18.2 },
  { region: '北京', pv: 28730, pct: 16.3 },
  { region: '上海', pv: 24510, pct: 13.9 },
  { region: '浙江', pv: 19870, pct: 11.3 },
  { region: '江苏', pv: 15340, pct: 8.7  },
  { region: '四川', pv: 11250, pct: 6.4  },
  { region: '湖北', pv: 9870,  pct: 5.6  },
  { region: '其他', pv: 34880, pct: 19.6 },
];

type Range = '7d' | '30d' | '90d';

export default function VisitStatsPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';
  const primaryHex = isManga ? PINK : '#6366f1';
  const [range, setRange] = useState<Range>('30d');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const chartData = range === '7d' ? DAILY_30.slice(-7) : range === '30d' ? DAILY_30 : DAILY_30;

  const totalPV = chartData.reduce((s, d) => s + d.pv, 0);
  const totalUV = chartData.reduce((s, d) => s + d.uv, 0);
  const totalIP = chartData.reduce((s, d) => s + d.ip, 0);
  const avgBounce = 38.4;

  const statCards = [
    { label: '总浏览量 (PV)',   value: totalPV.toLocaleString(), change: '+12.4%', up: true,  icon: <EyeIcon size={20} /> },
    { label: '独立访客 (UV)',   value: totalUV.toLocaleString(), change: '+8.7%',  up: true,  icon: <UsersIcon size={20} /> },
    { label: '独立 IP',         value: totalIP.toLocaleString(), change: '+6.1%',  up: true,  icon: <MousePointerClickIcon size={20} /> },
    { label: '跳出率',          value: `${avgBounce}%`,          change: '-2.3%',  up: false, icon: <TrendingUpIcon size={20} /> },
  ];

  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '20px 24px',
  };

  const CHART_COLORS = [primaryHex, '#22c55e', '#f59e0b', '#ec4899', '#14b8a6'];

  return (
    <AdminLayout>
      <div data-cmp="VisitStatsPage" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>访问统计</h1>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '4px 0 0' }}>全站流量数据总览与趋势分析</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['7d', '30d', '90d'] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  border: range === r ? 'none' : '1px solid var(--border)',
                  background: range === r ? primary : 'var(--card)',
                  color: range === r ? '#fff' : 'var(--foreground)',
                  transition: 'all 0.15s',
                }}
              >
                {r === '7d' ? '近7天' : r === '30d' ? '近30天' : '近90天'}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {statCards.map((c, i) => (
            <div key={i} style={{ ...card, flex: '1 1 200px', minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{c.label}</span>
                <span style={{ color: primary, opacity: 0.85 }}>{c.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>{c.value}</div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                {c.up ? <ArrowUpIcon size={13} color="#22c55e" /> : <ArrowDownIcon size={13} color="#ef4444" />}
                <span style={{ fontSize: 12, color: c.up ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{c.change}</span>
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>较上期</span>
              </div>
            </div>
          ))}
        </div>

        {/* PV/UV Trend */}
        <div style={{ ...card }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 20 }}>PV / UV 趋势</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryHex} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={primaryHex} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="uvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="pv" name="PV" stroke={primaryHex} fill="url(#pvGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="uv" name="UV" stroke="#22c55e" fill="url(#uvGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly + Source */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ ...card, flex: '2 1 400px', minWidth: 300 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 20 }}>今日小时分布</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={HOURLY} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="pv" name="PV" fill={primaryHex} radius={[3, 3, 0, 0]} />
                <Bar dataKey="uv" name="UV" fill="#22c55e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...card, flex: '1 1 260px', minWidth: 240 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 16 }}>流量来源</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={SOURCE_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={3}>
                    {SOURCE_DATA.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, '占比']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {SOURCE_DATA.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--foreground)' }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)' }}>{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Device + Region */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* Device Distribution */}
          <div style={{ ...card, flex: '1 1 260px', minWidth: 240 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 20 }}>设备分布</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: <MonitorIcon size={18} />, label: '桌面端', value: 51, color: primaryHex },
                { icon: <SmartphoneIcon size={18} />, label: '移动端', value: 38, color: '#f59e0b' },
                { icon: <TabletIcon size={18} />, label: '平板端', value: 11, color: '#22c55e' },
              ].map((d, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--foreground)', fontSize: 13 }}>
                      <span style={{ color: d.color }}>{d.icon}</span>
                      {d.label}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{d.value}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--muted)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${d.value}%`, height: '100%', background: d.color, borderRadius: 999, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Region */}
          <div style={{ ...card, flex: '2 1 380px', minWidth: 300 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 16 }}>地区分布 Top 8</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {REGION_DATA.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 20, fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ width: 36, fontSize: 13, color: 'var(--foreground)', flexShrink: 0 }}>{r.region}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--muted)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${(r.pct / 20) * 100}%`, height: '100%', background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 999 }} />
                  </div>
                  <span style={{ width: 60, fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'right', flexShrink: 0 }}>{r.pv.toLocaleString()}</span>
                  <span style={{ width: 42, fontSize: 12, fontWeight: 600, color: 'var(--foreground)', textAlign: 'right', flexShrink: 0 }}>{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Pages Table */}
        <div style={{ ...card }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 20 }}>热门页面 Top 8</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', '页面路径', '标题', '浏览量', '独立访客', '跳出率', '平均时长'].map((h, i) => (
                    <th key={i} style={{ padding: '8px 12px', textAlign: i > 2 ? 'right' : 'left', color: 'var(--muted-foreground)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_PAGES.map((p, i) => (
                  <tr
                    key={i}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ borderBottom: '1px solid var(--border)', background: hoveredRow === i ? 'var(--muted)' : 'transparent', transition: 'background 0.12s' }}
                  >
                    <td style={{ padding: '10px 12px', color: 'var(--muted-foreground)', width: 32 }}>{i + 1}</td>
                    <td style={{ padding: '10px 12px', color: primary, fontFamily: 'monospace', fontSize: 12 }}>{p.path}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--foreground)' }}>{p.title}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--foreground)' }}>{p.pv.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--foreground)' }}>{p.uv.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: parseFloat(p.bounce) > 50 ? '#ef4444' : '#22c55e' }}>{p.bounce}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted-foreground)' }}>{p.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
