import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  ActivityIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  CircleIcon,
  StarIcon,
  XIcon,
  GithubIcon,
  LayersIcon,
  RocketIcon,
  HeartIcon,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────

function useAccent() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  return isManga ? '#E91E8C' : 'var(--primary)';
}

// Section wrapper
function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div data-cmp="Section" style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
      boxShadow: 'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,8px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.06))',
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

// ─── 1. 统计卡片（带环比）────────────────────────────────────────────────────

interface StatCardData {
  label: string;
  value: string;
  sub: string;
  change: number;   // percent, positive=up
  icon: React.ReactNode;
  color: string;    // accent hex/var
  sparkline: number[]; // 7 values 0-100
}

const STAT_CARDS: StatCardData[] = [
  { label: '总用户数', value: '128,540', sub: '较上月', change: 12.4, icon: <UsersIcon size={18} />, color: '#6366f1', sparkline: [40, 55, 48, 70, 62, 85, 91] },
  { label: '订单量', value: '34,921', sub: '较上月', change: -3.2, icon: <ShoppingCartIcon size={18} />, color: '#f59e0b', sparkline: [80, 72, 68, 74, 60, 55, 58] },
  { label: '营业额', value: '¥2,384,000', sub: '较上周', change: 8.7, icon: <DollarSignIcon size={18} />, color: '#10b981', sparkline: [30, 50, 44, 65, 72, 80, 95] },
  { label: '活跃会话', value: '4,207', sub: '较昨日', change: 21.0, icon: <ActivityIcon size={18} />, color: '#ef4444', sparkline: [20, 35, 50, 42, 68, 74, 88] },
];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 32, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const area = `${pts[0]} ${pts.slice(1).join(' ')} ${w - pad},${h} ${pad},${h}`;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polygon points={area} fill={color} opacity={0.12} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ data }: { data: StatCardData }) {
  const up = data.change >= 0;
  return (
    <div data-cmp="StatCard" style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 10,
      boxShadow: 'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,8px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.05))',
      transition: 'transform .18s, box-shadow .18s', cursor: 'default', flex: '1 1 180px', minWidth: 160,
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${data.color}18`, color: data.color }}>
          {data.icon}
        </div>
        <MiniSparkline data={data.sparkline} color={data.color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.5px' }}>{data.value}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 1 }}>{data.label}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 12, fontWeight: 600,
          color: up ? '#16a34a' : '#dc2626',
          background: up ? 'rgba(22,163,74,.10)' : 'rgba(220,38,38,.10)',
          padding: '2px 7px', borderRadius: 5,
        }}>
          {up ? <TrendingUpIcon size={11} /> : <TrendingDownIcon size={11} />}
          {up ? '+' : ''}{data.change}%
        </span>
        <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{data.sub}</span>
      </div>
    </div>
  );
}

// ─── 2. 多色标签 ──────────────────────────────────────────────────────────────

const TAG_PRESETS: { label: string; color: string; bg: string }[] = [
  { label: '主要', color: '#6366f1', bg: '#6366f118' },
  { label: '成功', color: '#16a34a', bg: '#16a34a18' },
  { label: '警告', color: '#d97706', bg: '#d9770618' },
  { label: '危险', color: '#dc2626', bg: '#dc262618' },
  { label: '信息', color: '#0284c7', bg: '#0284c718' },
  { label: '粉色', color: '#db2777', bg: '#db277718' },
  { label: '紫色', color: '#7c3aed', bg: '#7c3aed18' },
  { label: '橙色', color: '#ea580c', bg: '#ea580c18' },
  { label: '青色', color: '#0891b2', bg: '#0891b218' },
  { label: '中性', color: 'var(--muted-foreground)', bg: 'var(--muted)' },
];

// outline variant
const TAG_OUTLINE: { label: string; border: string; color: string }[] = [
  { label: 'React', border: '#6366f1', color: '#6366f1' },
  { label: 'TypeScript', border: '#0284c7', color: '#0284c7' },
  { label: 'Node.js', border: '#16a34a', color: '#16a34a' },
  { label: 'Docker', border: '#0891b2', color: '#0891b2' },
  { label: 'GraphQL', border: '#db2777', color: '#db2777' },
];

// icon tags
const TAG_ICON: { label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { label: '已发布', icon: <CheckCircleIcon size={11} />, color: '#16a34a', bg: '#16a34a18' },
  { label: '待审核', icon: <ClockIcon size={11} />, color: '#d97706', bg: '#d9770618' },
  { label: '已下线', icon: <AlertCircleIcon size={11} />, color: '#dc2626', bg: '#dc262618' },
  { label: '草稿', icon: <CircleIcon size={11} />, color: 'var(--muted-foreground)', bg: 'var(--muted)' },
];

function Tag({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, color, background: bg }}>
      {label}
    </span>
  );
}

// ─── 3. 可关闭标签 ────────────────────────────────────────────────────────────

const CLOSABLE_INIT = ['设计', 'UI/UX', '前端开发', '产品规划', '数据分析', '运营增长', 'A/B 测试', '用户调研'];

function ClosableTags({ accent }: { accent: string }) {
  const [tags, setTags] = useState(CLOSABLE_INIT);
  const [input, setInput] = useState('');
  const remove = (t: string) => setTags(ts => ts.filter(x => x !== t));
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) setTags(ts => [...ts, v]);
    setInput('');
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {tags.map(t => (
        <span key={t} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 8px 4px 11px', borderRadius: 20,
          fontSize: 12, fontWeight: 500,
          background: `color-mix(in srgb, ${accent} 10%, transparent)`,
          color: accent,
          border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
        }}>
          {t}
          <button onClick={() => remove(t)} style={{
            width: 16, height: 16, borderRadius: '50%', border: 'none',
            background: `color-mix(in srgb, ${accent} 20%, transparent)`,
            color: accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
          }}><XIcon size={10} /></button>
        </span>
      ))}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, border: '1px dashed var(--border)', borderRadius: 20, overflow: 'hidden', height: 28 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="新增标签…"
          style={{ border: 'none', background: 'transparent', fontSize: 12, padding: '0 10px', color: 'var(--foreground)', outline: 'none', width: 80 }}
        />
        <button onClick={add} style={{ padding: '0 10px', height: 28, border: 'none', background: accent, color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>+</button>
      </div>
    </div>
  );
}

// ─── 4. 徽标 Badge ────────────────────────────────────────────────────────────

interface BadgeItem { label: string; count: number | null; color: string; dot?: boolean }

const BADGE_ITEMS: BadgeItem[] = [
  { label: '消息', count: 5, color: '#ef4444' },
  { label: '通知', count: 12, color: '#6366f1' },
  { label: '任务', count: 99, color: '#f59e0b' },
  { label: '邮件', count: 128, color: '#0891b2' },
  { label: '红点', count: null, color: '#ef4444', dot: true },
];

function BadgeDemo({ item }: { item: BadgeItem }) {
  const dotSize = item.dot ? 8 : undefined;
  const badgeStyle: React.CSSProperties = item.dot
    ? { position: 'absolute', top: -3, right: -3, width: dotSize, height: dotSize, borderRadius: '50%', background: item.color, border: '2px solid var(--card)' }
    : {
        position: 'absolute', top: -6, right: -6,
        minWidth: 18, height: 18, borderRadius: 9,
        background: item.color, color: '#fff',
        fontSize: 10, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 4px', border: '2px solid var(--card)',
      };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
          <LayersIcon size={18} />
        </div>
        <div style={badgeStyle}>{!item.dot && (item.count ?? 0) > 99 ? '99+' : (!item.dot ? item.count : null)}</div>
      </div>
      <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{item.label}</span>
    </div>
  );
}

// Avatar badge
function AvatarBadge({ status }: { status: 'online' | 'offline' | 'busy' | 'away' }) {
  const colors = { online: '#22c55e', offline: 'var(--muted-foreground)', busy: '#ef4444', away: '#f59e0b' };
  const labels = { online: '在线', offline: '离线', busy: '忙碌', away: '离开' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, #6366f1, #a855f7)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UsersIcon size={16} color="#fff" />
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: colors[status], border: '2px solid var(--card)' }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{labels[status]}</span>
    </div>
  );
}

// ─── 5. 头像组 ────────────────────────────────────────────────────────────────

const AVATARS = [
  { name: '张伟', color: '#6366f1' },
  { name: '李娜', color: '#ec4899' },
  { name: '王芳', color: '#f59e0b' },
  { name: '刘洋', color: '#10b981' },
  { name: '陈磊', color: '#0891b2' },
  { name: '赵敏', color: '#ef4444' },
];

function AvatarGroup({ max = 4, size = 36, total = 128 }: { max?: number; size?: number; total?: number }) {
  const shown = AVATARS.slice(0, max);
  const extra = total - max;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {shown.map((a, i) => (
        <div key={a.name} title={a.name} style={{
          width: size, height: size, borderRadius: '50%',
          background: a.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.35, fontWeight: 700, color: '#fff',
          border: '2px solid var(--card)',
          marginLeft: i === 0 ? 0 : -(size * 0.28),
          zIndex: shown.length - i,
          position: 'relative',
          boxShadow: '0 1px 4px rgba(0,0,0,.18)',
        }}>
          {a.name[0]}
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: 'var(--muted)', color: 'var(--muted-foreground)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.28, fontWeight: 700,
          border: '2px solid var(--card)',
          marginLeft: -(size * 0.28),
          position: 'relative', zIndex: 0,
        }}>
          +{extra > 99 ? '99' : extra}
        </div>
      )}
    </div>
  );
}

// ─── 6. 进度条 ────────────────────────────────────────────────────────────────

interface ProgressItem { label: string; value: number; color: string; }

const PROGRESS_LINES: ProgressItem[] = [
  { label: '存储空间', value: 72, color: '#6366f1' },
  { label: 'CPU 使用率', value: 45, color: '#10b981' },
  { label: '内存占用', value: 88, color: '#ef4444' },
  { label: '带宽消耗', value: 31, color: '#f59e0b' },
];

function LinearProgress({ item }: { item: ProgressItem }) {
  const danger = item.value >= 80;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--foreground)', fontWeight: 500 }}>{item.label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: danger ? '#ef4444' : 'var(--foreground)' }}>{item.value}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--muted)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: `${item.value}%`,
          background: item.color,
          transition: 'width 1s cubic-bezier(.4,0,.2,1)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* shimmer */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.3) 50%, transparent 100%)', animation: 'dp-shimmer 2s linear infinite' }} />
        </div>
      </div>
    </div>
  );
}

// Ring progress
function RingProgress({ value, color, size = 80, label, sublabel }: {
  value: number; color: string; size?: number; label: string; sublabel?: string;
}) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={8} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={8} strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size * 0.2, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1 }}>{value}%</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{sublabel}</div>}
      </div>
    </div>
  );
}

const RING_DATA = [
  { value: 78, color: '#6366f1', label: '完成率', sublabel: '本季度' },
  { value: 55, color: '#10b981', label: '达成率', sublabel: '本月目标' },
  { value: 91, color: '#f59e0b', label: '覆盖率', sublabel: '全国市场' },
  { value: 33, color: '#ef4444', label: '异常率', sublabel: '系统监控' },
];

// ─── 7. 带封面卡片 ────────────────────────────────────────────────────────────

interface CoverCard { title: string; desc: string; tag: string; tagColor: string; tagBg: string; meta: string; gradient: string; icon: React.ReactNode; likes: number; }

const COVER_CARDS: CoverCard[] = [
  {
    title: '2024 设计趋势报告',
    desc: '深度解读玻璃拟态、新拟物化与极简主义三大设计流派在企业产品中的落地实践。',
    tag: '设计',
    tagColor: '#7c3aed', tagBg: '#7c3aed18',
    meta: '张设计师 · 2024-05-20',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: <StarIcon size={28} color="#fff" />,
    likes: 248,
  },
  {
    title: 'React 18 并发特性实战',
    desc: '从 Suspense、Transition 到 Server Components，全面解析 React 18 并发渲染的核心机制与最佳实践。',
    tag: '技术',
    tagColor: '#0891b2', tagBg: '#0891b218',
    meta: '李工程师 · 2024-05-18',
    gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
    icon: <GithubIcon size={28} color="#fff" />,
    likes: 512,
  },
  {
    title: '用户增长策略全解析',
    desc: '用 AARRR 模型拆解获客、激活、留存、变现、传播五大增长环节，附真实案例与数据验证。',
    tag: '运营',
    tagColor: '#ea580c', tagBg: '#ea580c18',
    meta: '王运营 · 2024-05-15',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: <RocketIcon size={28} color="#fff" />,
    likes: 381,
  },
];

function CoverCardItem({ card }: { card: CoverCard }) {
  const [liked, setLiked] = useState(false);
  const likeCount = card.likes + (liked ? 1 : 0);
  return (
    <div data-cmp="CoverCard" style={{
      border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
      background: 'var(--card)', flex: '1 1 220px', minWidth: 200,
      transition: 'transform .18s, box-shadow .18s', cursor: 'default',
      boxShadow: 'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,8px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.05))',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
    >
      {/* cover */}
      <div style={{ height: 110, background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          {card.icon}
        </div>
      </div>
      {/* body */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: card.tagColor, background: card.tagBg, padding: '2px 8px', borderRadius: 4 }}>{card.tag}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)', marginBottom: 6, lineHeight: 1.4 }}>{card.title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: 12 }}>{card.desc}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{card.meta}</span>
          <button
            onClick={() => setLiked(l => !l)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: liked ? '#ef4444' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 500, padding: '3px 6px', borderRadius: 6, transition: 'color .15s' }}
          >
            <HeartIcon size={13} style={{ fill: liked ? '#ef4444' : 'none', stroke: liked ? '#ef4444' : 'currentColor' }} />
            {likeCount}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 8. 时间线 ────────────────────────────────────────────────────────────────

interface TimelineEvent { time: string; title: string; desc: string; status: 'done' | 'active' | 'pending'; color: string; icon: React.ReactNode; }

const TIMELINE: TimelineEvent[] = [
  { time: '09:12', title: '项目立项', desc: '产品经理确认需求文档，正式创建项目看板。', status: 'done', color: '#16a34a', icon: <CheckCircleIcon size={13} /> },
  { time: '10:30', title: '设计评审', desc: 'UI 团队完成原型设计，通过设计评审会议。', status: 'done', color: '#6366f1', icon: <StarIcon size={13} /> },
  { time: '13:00', title: '开发启动', desc: '前后端同步开始开发，API 接口定义已对齐。', status: 'active', color: '#f59e0b', icon: <ActivityIcon size={13} /> },
  { time: '16:00', title: '提测上线', desc: '提交测试环境，等待 QA 全量回归测试。', status: 'pending', color: 'var(--muted-foreground)', icon: <ClockIcon size={13} /> },
  { time: '明日', title: '正式发布', desc: '灰度发布至 10% 用户，监控关键指标。', status: 'pending', color: 'var(--muted-foreground)', icon: <RocketIcon size={13} /> },
];

function Timeline() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {TIMELINE.map((ev, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, position: 'relative' }}>
          {/* connector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: ev.status === 'pending' ? 'var(--muted)' : `${ev.color}18`,
              border: `2px solid ${ev.status === 'pending' ? 'var(--border)' : ev.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: ev.status === 'pending' ? 'var(--muted-foreground)' : ev.color,
              zIndex: 1,
            }}>
              {ev.icon}
            </div>
            {i < TIMELINE.length - 1 && (
              <div style={{ width: 2, flex: 1, minHeight: 20, background: ev.status === 'done' ? '#16a34a40' : 'var(--border)', marginTop: 2 }} />
            )}
          </div>
          {/* content */}
          <div style={{ paddingBottom: i < TIMELINE.length - 1 ? 20 : 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: ev.status === 'pending' ? 'var(--muted-foreground)' : 'var(--foreground)' }}>{ev.title}</span>
              {ev.status === 'active' && (
                <span style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b', background: '#f59e0b18', padding: '1px 7px', borderRadius: 4 }}>进行中</span>
              )}
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', marginLeft: 'auto' }}>{ev.time}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{ev.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 9. 步骤条 ────────────────────────────────────────────────────────────────

interface Step { label: string; desc: string; }

const STEPS: Step[] = [
  { label: '填写基本信息', desc: '账号、密码' },
  { label: '邮箱验证', desc: '验证码确认' },
  { label: '完善资料', desc: '个人信息' },
  { label: '实名认证', desc: '身份核实' },
  { label: '完成', desc: '开始使用' },
];

function StepBar({ accent }: { accent: string }) {
  const [current, setCurrent] = useState(2); // 0-based
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* steps */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const pending = i > current;
          return (
            <React.Fragment key={i}>
              {/* step node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto', minWidth: 60, cursor: 'pointer' }} onClick={() => setCurrent(i)}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? accent : active ? `${accent}18` : 'var(--muted)',
                  border: `2px solid ${done ? accent : active ? accent : 'var(--border)'}`,
                  color: done ? '#fff' : active ? accent : 'var(--muted-foreground)',
                  fontSize: 13, fontWeight: 700,
                  transition: 'all .2s',
                }}>
                  {done ? <CheckCircleIcon size={15} color="#fff" /> : i + 1}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: done || active ? 600 : 400, color: pending ? 'var(--muted-foreground)' : 'var(--foreground)', whiteSpace: 'nowrap' }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{step.desc}</div>
                </div>
              </div>
              {/* connector */}
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, marginTop: 15, background: i < current ? accent : 'var(--border)', transition: 'background .3s' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* nav buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          disabled={current === 0}
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          style={{ height: 32, padding: '0 16px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', fontSize: 12, cursor: current === 0 ? 'not-allowed' : 'pointer', color: current === 0 ? 'var(--muted-foreground)' : 'var(--foreground)', opacity: current === 0 ? .5 : 1 }}
        >
          上一步
        </button>
        <button
          disabled={current === STEPS.length - 1}
          onClick={() => setCurrent(c => Math.min(STEPS.length - 1, c + 1))}
          style={{ height: 32, padding: '0 16px', borderRadius: 7, border: 'none', background: current === STEPS.length - 1 ? 'var(--muted)' : accent, color: current === STEPS.length - 1 ? 'var(--muted-foreground)' : '#fff', fontSize: 12, cursor: current === STEPS.length - 1 ? 'not-allowed' : 'pointer', fontWeight: 500 }}
        >
          {current === STEPS.length - 1 ? '已完成' : '下一步'}
        </button>
        <button
          onClick={() => setCurrent(0)}
          style={{ height: 32, padding: '0 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', fontSize: 12, cursor: 'pointer', color: 'var(--muted-foreground)' }}
        >
          重置
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DisplayPage() {
  const accent = useAccent();

  return (
    <AdminLayout>
      <style>{`
        @keyframes dp-fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dp-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>

      <div style={{ animation: 'dp-fade-in .4s ease', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>数据展示</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            统计卡片 · 标签 · 徽标 · 头像组 · 进度条 · 卡片 · 时间线 · 步骤条
          </p>
        </div>

        {/* ① 统计卡片 */}
        <Section title="统计卡片 Statistic" desc="带环比趋势、迷你折线图，支持正负涨跌标注">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {STAT_CARDS.map(d => <StatCard key={d.label} data={d} />)}
          </div>
        </Section>

        {/* ② 标签 + ③ 可关闭标签 */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

          <div style={{ flex: '1 1 300px', minWidth: 260 }}>
            <Section title="多色标签 Tag" desc="填充、描边、图标三种风格，覆盖状态与分类场景">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* filled */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: 6 }}>填充型</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {TAG_PRESETS.map(t => <Tag key={t.label} label={t.label} color={t.color} bg={t.bg} />)}
                  </div>
                </div>
                {/* outline */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: 6 }}>描边型</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {TAG_OUTLINE.map(t => (
                      <span key={t.label} style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: t.color, border: `1px solid ${t.border}`, background: 'transparent' }}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
                {/* icon */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: 6 }}>图标型</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {TAG_ICON.map(t => (
                      <span key={t.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: t.color, background: t.bg }}>
                        {t.icon}{t.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          </div>

          <div style={{ flex: '1 1 280px', minWidth: 240 }}>
            <Section title="可关闭标签 ClosableTag" desc="点击 × 移除，支持键盘回车新增自定义标签">
              <ClosableTags accent={accent} />
            </Section>
          </div>
        </div>

        {/* ④ 徽标 */}
        <Section title="小红点徽标 Badge" desc="数字徽标、纯红点、状态徽标三种变体">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: 10 }}>数字徽标 / 红点</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {BADGE_ITEMS.map(b => <BadgeDemo key={b.label} item={b} />)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: 10 }}>头像状态徽标</div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {(['online', 'busy', 'away', 'offline'] as const).map(s => (
                  <AvatarBadge key={s} status={s} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ⑤ 头像组 */}
        <Section title="头像组 AvatarGroup" desc="堆叠展示多个头像，超出数量折叠为 +N">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>小号 size=28</span>
              <AvatarGroup max={4} size={28} total={36} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>默认 size=36</span>
              <AvatarGroup max={4} size={36} total={128} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>大号 size=48</span>
              <AvatarGroup max={5} size={48} total={512} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>全显示 size=36</span>
              <AvatarGroup max={6} size={36} total={6} />
            </div>
          </div>
        </Section>

        {/* ⑥ 进度条 */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

          <div style={{ flex: '2 1 320px', minWidth: 280 }}>
            <Section title="线形进度条 Progress" desc="带动效与高占用警告标注，适合资源监控场景">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {PROGRESS_LINES.map(p => <LinearProgress key={p.label} item={p} />)}
              </div>
            </Section>
          </div>

          <div style={{ flex: '1 1 260px', minWidth: 240 }}>
            <Section title="环形进度条 RingProgress" desc="SVG 绘制，支持任意颜色与百分比">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
                {RING_DATA.map(r => (
                  <RingProgress key={r.label} value={r.value} color={r.color} size={88} label={r.label} sublabel={r.sublabel} />
                ))}
              </div>
            </Section>
          </div>
        </div>

        {/* ⑦ 带封面卡片 */}
        <Section title="封面卡片 CoverCard" desc="带渐变封面、标签、描述、点赞交互，适合文章/资源展示">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {COVER_CARDS.map(c => <CoverCardItem key={c.title} card={c} />)}
          </div>
        </Section>

        {/* ⑧⑨ 时间线 + 步骤条 */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

          <div style={{ flex: '1 1 280px', minWidth: 260 }}>
            <Section title="时间线 Timeline" desc="节点状态区分已完成、进行中、待处理，带竖轴连接线">
              <Timeline />
            </Section>
          </div>

          <div style={{ flex: '2 1 380px', minWidth: 300 }}>
            <Section title="步骤条 Steps" desc="可点击跳转，已完成步骤显示对勾，点击上下步或节点切换">
              <StepBar accent={accent} />
            </Section>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
