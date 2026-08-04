import { useState } from 'react';
import { toast } from '../lib/localizedToast';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import {
  SearchIcon, PlusIcon, RotateCcwIcon,
  CalendarIcon, UsersIcon, ZapIcon, TagIcon,
  EditIcon, Trash2Icon, EyeIcon, CopyIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

type ActivityType = '满减' | '折扣' | '秒杀' | '拼团' | '抽奖';
type ActivityStatus = '进行中' | '已结束' | '未开始';

interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  cover: string;
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants: number;
  status: ActivityStatus;
  description: string;
}

const ACTIVITIES: Activity[] = [
  {
    id: 'ACT001', name: '夏日狂欢节满减活动', type: '满减',
    cover: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop',
    startDate: '2025-07-01', endDate: '2025-07-31',
    participants: 3420, maxParticipants: 5000, status: '进行中',
    description: '全场满200减50，满500减150，满1000减300',
  },
  {
    id: 'ACT002', name: '新品发布七折促销', type: '折扣',
    cover: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=200&fit=crop',
    startDate: '2025-07-15', endDate: '2025-08-15',
    participants: 1820, maxParticipants: 3000, status: '进行中',
    description: '新品专区全场七折，限时一个月',
  },
  {
    id: 'ACT003', name: '周三秒杀限时抢购', type: '秒杀',
    cover: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
    startDate: '2025-07-09', endDate: '2025-07-09',
    participants: 998, maxParticipants: 1000, status: '已结束',
    description: '每周三12:00限时秒杀，爆品低至1折',
  },
  {
    id: 'ACT004', name: '好友拼团超低价', type: '拼团',
    cover: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
    startDate: '2025-08-01', endDate: '2025-08-31',
    participants: 0, maxParticipants: 2000, status: '未开始',
    description: '3人成团享受6折优惠，5人成团享受5折',
  },
  {
    id: 'ACT005', name: '幸运大转盘抽奖', type: '抽奖',
    cover: 'https://images.unsplash.com/photo-1612832021455-245704c6755a?w=400&h=200&fit=crop',
    startDate: '2025-06-01', endDate: '2025-06-30',
    participants: 8890, maxParticipants: 10000, status: '已结束',
    description: '每日签到抽奖，奖品丰厚，百分百中奖',
  },
  {
    id: 'ACT006', name: '双十一全场五折起', type: '折扣',
    cover: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=400&h=200&fit=crop',
    startDate: '2025-11-01', endDate: '2025-11-11',
    participants: 0, maxParticipants: 50000, status: '未开始',
    description: '年度最大促销活动，全场五折起，叠加满减',
  },
];

const STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string; bg: string }> = {
  '进行中': { label: '进行中', color: '#16a34a', bg: '#dcfce7' },
  '已结束': { label: '已结束', color: '#6b7280', bg: '#f3f4f6' },
  '未开始': { label: '未开始', color: '#2563eb', bg: '#dbeafe' },
};

const TYPE_CONFIG: Record<ActivityType, { color: string; bg: string }> = {
  '满减': { color: '#7c3aed', bg: '#ede9fe' },
  '折扣': { color: '#0891b2', bg: '#cffafe' },
  '秒杀': { color: '#e11d48', bg: '#ffe4e6' },
  '拼团': { color: '#d97706', bg: '#fef3c7' },
  '抽奖': { color: '#16a34a', bg: '#dcfce7' },
};

const TYPE_ICONS: Record<ActivityType, React.ReactNode> = {
  '满减': <TagIcon size={12} />,
  '折扣': <TagIcon size={12} />,
  '秒杀': <ZapIcon size={12} />,
  '拼团': <UsersIcon size={12} />,
  '抽奖': <ZapIcon size={12} />,
};

export default function ActivityPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const [tempSearch, setTempSearch] = useState('');
  const [tempType, setTempType] = useState<ActivityType | '全部'>('全部');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType | '全部'>('全部');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleQuery = () => {
    setSearch(tempSearch);
    setTypeFilter(tempType);
  };

  const handleReset = () => {
    setTempSearch(''); setTempType('全部');
    setTempStartDate(''); setTempEndDate('');
    setSearch(''); setTypeFilter('全部');
  };

  const handleActivityAction = (action: string, activityId: string) => {
    toast.success(`${action} ${activityId}`);
  };

  const filtered = ACTIVITIES.filter(a => {
    const matchSearch = !search || a.name.includes(search) || a.id.includes(search);
    const matchType = typeFilter === '全部' || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalCount = ACTIVITIES.length;
  const runningCount = ACTIVITIES.filter(a => a.status === '进行中').length;
  const endedCount = ACTIVITIES.filter(a => a.status === '已结束').length;
  const pendingCount = ACTIVITIES.filter(a => a.status === '未开始').length;

  const statCards = [
    { label: '总活动', value: totalCount, color: primary },
    { label: '进行中', value: runningCount, color: '#16a34a' },
    { label: '已结束', value: endedCount, color: '#6b7280' },
    { label: '未开始', value: pendingCount, color: '#2563eb' },
  ];

  return (
    <AdminLayout>
      <div data-cmp="ActivityPage" style={{ padding: '24px', minHeight: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>活动管理</h1>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>创建并管理各类营销活动，提升用户参与度</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {statCards.map(card => (
            <div
              key={card.label}
              style={{
                flex: '1 1 160px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '18px 20px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: card.color, lineHeight: 1.2 }}>{card.value}</div>
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 160 }}>
            <SearchIcon size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input
              value={tempSearch}
              onChange={e => setTempSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleQuery()}
              placeholder="搜索活动名称/ID"
              style={{ width: '100%', height: 34, paddingLeft: 30, paddingRight: 10, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={tempType}
            onChange={e => setTempType(e.target.value as ActivityType | '全部')}
            style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            <option value="全部">全部类型</option>
            <option value="满减">满减</option>
            <option value="折扣">折扣</option>
            <option value="秒杀">秒杀</option>
            <option value="拼团">拼团</option>
            <option value="抽奖">抽奖</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarIcon size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <input
              type="date"
              value={tempStartDate}
              onChange={e => setTempStartDate(e.target.value)}
              style={{ height: 34, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
            />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>至</span>
            <input
              type="date"
              value={tempEndDate}
              onChange={e => setTempEndDate(e.target.value)}
              style={{ height: 34, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
            />
          </div>
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
          <button
            onClick={() => toast.success('已打开新建活动操作')}
            style={{ height: 34, padding: '0 16px', border: 'none', borderRadius: 8, background: primary, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}
          >
            <PlusIcon size={14} />新建活动
          </button>
        </div>

        {/* Activity Cards Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          {filtered.map(act => {
            const st = STATUS_CONFIG[act.status];
            const ty = TYPE_CONFIG[act.type];
            const pct = act.maxParticipants ? Math.round((act.participants / act.maxParticipants) * 100) : 0;
            const isHovered = hoveredCard === act.id;

            return (
              <div
                key={act.id}
                onMouseEnter={() => setHoveredCard(act.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  flex: '1 1 300px',
                  maxWidth: 380,
                  background: 'var(--card)',
                  border: `1px solid ${isHovered ? primary : 'var(--border)'}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: isHovered
                    ? `0 4px 20px color-mix(in srgb, ${primary} 20%, transparent)`
                    : 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))',
                }}
              >
                {/* Cover */}
                <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
                  <img
                    src={act.cover}
                    alt={act.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: isHovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.3s' }}
                  />
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, padding: '3px 8px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                      {st.label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: ty.color, background: ty.bg, padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                      {TYPE_ICONS[act.type]}{act.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 12, lineHeight: 1.5 }}>{act.description}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <CalendarIcon size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{act.startDate} ~ {act.endDate}</span>
                  </div>

                  {/* Participants progress */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <UsersIcon size={11} />参与人数
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--foreground)', fontWeight: 600 }}>{act.participants.toLocaleString()} / {act.maxParticipants.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: primary, borderRadius: 3, transition: 'width 0.4s' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textAlign: 'right', marginTop: 3 }}>{pct}%</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => handleActivityAction('查看活动', act.id)} style={{ height: 30, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted-foreground)' }}>
                      <EyeIcon size={12} />查看
                    </button>
                    <button onClick={() => handleActivityAction('已复制活动', act.id)} style={{ height: 30, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted-foreground)' }}>
                      <CopyIcon size={12} />复制
                    </button>
                    <button onClick={() => handleActivityAction('编辑活动', act.id)} style={{ height: 30, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted-foreground)' }}>
                      <EditIcon size={12} />编辑
                    </button>
                    <button onClick={() => handleActivityAction('已删除活动', act.id)} style={{ height: 30, padding: '0 10px', border: '1px solid #fee2e2', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#dc2626' }}>
                      <Trash2Icon size={12} />删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 48, textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 14 }}>
            暂无匹配的活动
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
