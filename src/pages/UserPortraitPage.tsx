import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  UsersIcon, UserCheckIcon, UserXIcon, TrendingUpIcon,
  ArrowUpIcon, ArrowDownIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

// ─── mock data ────────────────────────────────────────────────────────────────

const GENDER_DATA = [
  { name: '男性', value: 54, color: '#6366f1' },
  { name: '女性', value: 46, color: '#ec4899' },
];

const AGE_DATA = [
  { group: '18岁以下', male: 4,  female: 5  },
  { group: '18–24',    male: 18, female: 22 },
  { group: '25–34',    male: 28, female: 24 },
  { group: '35–44',    male: 22, female: 18 },
  { group: '45–54',    male: 14, female: 12 },
  { group: '55岁以上', male: 8,  female: 6  },
];

const REGION_TOP = [
  { region: '广东', count: 24830 },
  { region: '北京', count: 21450 },
  { region: '上海', count: 19820 },
  { region: '浙江', count: 15670 },
  { region: '江苏', count: 12340 },
  { region: '四川', count: 9870  },
  { region: '湖北', count: 8430  },
  { region: '山东', count: 7560  },
];

const INTEREST_DATA = [
  { subject: '技术/开发',  A: 88 },
  { subject: '设计/创意',  A: 72 },
  { subject: '产品/运营',  A: 65 },
  { subject: '数据/AI',    A: 80 },
  { subject: '职场/成长',  A: 58 },
  { subject: '娱乐/生活',  A: 45 },
];

const ACTIVE_HOUR = Array.from({ length: 24 }, (_, i) => {
  const h = i < 10 ? `${i}时` : `${i}时`;
  let v = 20;
  if (i >= 9 && i <= 11) v = 85 + Math.round(Math.random() * 10);
  else if (i >= 14 && i <= 17) v = 92 + Math.round(Math.random() * 8);
  else if (i >= 20 && i <= 22) v = 78 + Math.round(Math.random() * 12);
  else if (i >= 0 && i <= 5) v = 8 + Math.round(Math.random() * 6);
  else v = 30 + Math.round(Math.random() * 25);
  return { hour: h, active: v };
});

const LOYALTY_DATA = [
  { name: '新用户',   value: 32, color: '#6366f1' },
  { name: '回访用户', value: 41, color: '#22c55e' },
  { name: '忠实用户', value: 18, color: '#f59e0b' },
  { name: '沉睡用户', value: 9,  color: '#9ca3af' },
];

const DEVICE_PREF = [
  { name: '仅移动端',  value: 38 },
  { name: '仅桌面端',  value: 34 },
  { name: '跨设备使用', value: 21 },
  { name: '仅平板端',  value: 7  },
];

const CHANNEL_DATA = [
  { channel: '有机搜索', new: 8420, returning: 6830 },
  { channel: '直接访问', new: 5310, returning: 9240 },
  { channel: '社交媒体', new: 6780, returning: 3210 },
  { channel: '邮件',    new: 2140, returning: 4560 },
  { channel: '付费广告', new: 4920, returning: 1870 },
];

const USER_SEGMENTS = [
  { name: '高活跃创作者', count: 1240, pct: 8.4,  avgVisit: '18.3', retention: '91%', badge: '#6366f1' },
  { name: '中度阅读用户', count: 4870, pct: 33.1, avgVisit: '6.7',  retention: '72%', badge: '#22c55e' },
  { name: '轻度浏览用户', count: 5630, pct: 38.3, avgVisit: '2.1',  retention: '41%', badge: '#f59e0b' },
  { name: '沉睡流失用户', count: 2970, pct: 20.2, avgVisit: '0.3',  retention: '8%',  badge: '#9ca3af' },
];

export default function UserPortraitPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';
  const primaryHex = isManga ? PINK : '#6366f1';

  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '20px 24px',
  };

  const statCards = [
    { label: '注册用户总数', value: '14,710', change: '+8.4%',  up: true,  icon: <UsersIcon size={20} /> },
    { label: '活跃用户 (MAU)', value: '9,830',  change: '+12.1%', up: true,  icon: <UserCheckIcon size={20} /> },
    { label: '新增用户 (本月)', value: '2,140',  change: '+5.7%',  up: true,  icon: <TrendingUpIcon size={20} /> },
    { label: '流失用户 (本月)', value: '870',    change: '-3.2%',  up: false, icon: <UserXIcon size={20} /> },
  ];

  return (
    <AdminLayout>
      <div data-cmp="UserPortraitPage" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>用户画像</h1>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '4px 0 0' }}>用户人口属性、兴趣偏好与行为特征分析</p>
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
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>较上月</span>
              </div>
            </div>
          ))}
        </div>

        {/* Gender + Age */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* Gender */}
          <div style={{ ...card, flex: '1 1 220px', minWidth: 200 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>性别分布</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={GENDER_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={76} dataKey="value" paddingAngle={4}>
                  {GENDER_DATA.map((g, i) => <Cell key={i} fill={g.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '占比']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4 }}>
              {GENDER_DATA.map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: g.color }} />
                  <span style={{ color: 'var(--foreground)' }}>{g.name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{g.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Age */}
          <div style={{ ...card, flex: '2 1 380px', minWidth: 300 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>年龄分布（男 / 女）</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={AGE_DATA} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="group" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="male" name="男性" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="female" name="女性" fill="#ec4899" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interest Radar + Active Hour */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* Interest Radar */}
          <div style={{ ...card, flex: '1 1 280px', minWidth: 260 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>兴趣偏好雷达</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart cx="50%" cy="50%" outerRadius={90} data={INTEREST_DATA}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                <Radar name="兴趣指数" dataKey="A" stroke={primaryHex} fill={primaryHex} fillOpacity={0.22} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Active Hours */}
          <div style={{ ...card, flex: '2 1 360px', minWidth: 300 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>活跃时间分布</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ACTIVE_HOUR} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="active" name="活跃度" fill={primaryHex} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loyalty + Device + Channel */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* Loyalty */}
          <div style={{ ...card, flex: '1 1 220px', minWidth: 200 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 12 }}>用户忠诚度</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LOYALTY_DATA.map((l, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{l.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{l.value}%</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--muted)', borderRadius: 999 }}>
                    <div style={{ width: `${l.value}%`, height: '100%', background: l.color, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Pref */}
          <div style={{ ...card, flex: '1 1 220px', minWidth: 200 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>设备偏好</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={DEVICE_PREF} cx="50%" cy="50%" outerRadius={76} dataKey="value" paddingAngle={3} label={({ name, value }: { name: string; value: number }) => `${name} ${value}%`} labelLine={false}>
                  {DEVICE_PREF.map((_, i) => <Cell key={i} fill={['#6366f1', '#f59e0b', '#22c55e', '#9ca3af'][i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '占比']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Channel */}
          <div style={{ ...card, flex: '2 1 340px', minWidth: 280 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>获客渠道对比</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CHANNEL_DATA} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="channel" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} width={60} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="new" name="新用户" fill={primaryHex} radius={[0, 3, 3, 0]} stackId="a" />
                <Bar dataKey="returning" name="回访用户" fill="#22c55e" radius={[0, 3, 3, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Region Top */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ ...card, flex: '1 1 260px', minWidth: 240 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 16 }}>地区用户 Top 8</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {REGION_TOP.map((r, i) => {
                const max = REGION_TOP[0].count;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 20, textAlign: 'right', fontSize: 12, color: 'var(--muted-foreground)', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ width: 36, fontSize: 13, color: 'var(--foreground)', flexShrink: 0 }}>{r.region}</span>
                    <div style={{ flex: 1, height: 6, background: 'var(--muted)', borderRadius: 999 }}>
                      <div style={{ width: `${(r.count / max) * 100}%`, height: '100%', background: primaryHex, borderRadius: 999, opacity: 0.75 + (max - r.count) / max * -0.4 }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted-foreground)', flexShrink: 0 }}>{r.count.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Segments */}
          <div style={{ ...card, flex: '2 1 400px', minWidth: 320 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 16 }}>用户分层</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['用户层级', '用户数', '占比', '周均访问', '留存率'].map((h, i) => (
                      <th key={i} style={{ padding: '8px 12px', textAlign: i > 0 ? 'right' : 'left', color: 'var(--muted-foreground)', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {USER_SEGMENTS.map((s, i) => (
                    <tr
                      key={i}
                      onMouseEnter={() => setHoveredRow(i)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{ borderBottom: '1px solid var(--border)', background: hoveredRow === i ? 'var(--muted)' : 'transparent', transition: 'background 0.12s' }}
                    >
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.badge, flexShrink: 0 }} />
                          <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--foreground)' }}>{s.count.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted-foreground)' }}>{s.pct}%</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--foreground)' }}>{s.avgVisit}次</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                          background: parseFloat(s.retention) > 50 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                          color: parseFloat(s.retention) > 50 ? '#16a34a' : '#dc2626',
                        }}>{s.retention}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
