import { useState } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import {
  SendIcon, FileTextIcon, SmartphoneIcon, BellIcon,
  ClockIcon, CheckCircleIcon, AlertCircleIcon, EditIcon, Trash2Icon,
  UsersIcon, MailIcon, TrendingUpIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

type PushStatus = '已发送' | '定时中' | '草稿' | '失败';
type SendMethod = '立即发送' | '定时发送';
type TargetGroup = '全部用户' | '新用户' | 'VIP用户' | '活跃用户' | '沉默用户';

interface PushRecord {
  id: string;
  title: string;
  summary: string;
  target: TargetGroup;
  method: SendMethod;
  time: string;
  status: PushStatus;
  reachRate: string;
  openRate: string;
}

const PUSH_RECORDS: PushRecord[] = [
  { id: 'PH20250716', title: '夏日促销活动开始啦！', summary: '全场满200减50，速来抢购...', target: '全部用户', method: '立即发送', time: '2025-07-16 10:00', status: '已发送', reachRate: '99.2%', openRate: '43.8%' },
  { id: 'PH20250715', title: '您有一张优惠券即将过期', summary: '您的夏日大礼包券将于明日过期...', target: '活跃用户', method: '定时发送', time: '2025-07-15 18:30', status: '已发送', reachRate: '98.7%', openRate: '61.4%' },
  { id: 'PH20250720', title: '周末双倍积分提醒', summary: '本周末消费享受双倍积分奖励...', target: 'VIP用户', method: '定时发送', time: '2025-07-20 09:00', status: '定时中', reachRate: '-', openRate: '-' },
  { id: 'PH20250801', title: '八月新品抢先看', summary: '精心准备了一批精选新品即将上架...', target: '全部用户', method: '定时发送', time: '2025-08-01 10:00', status: '定时中', reachRate: '-', openRate: '-' },
  { id: 'PH20250710', title: '召唤久违的你回来', summary: '好久不见，我们为您准备了专属礼品...', target: '沉默用户', method: '立即发送', time: '2025-07-10 14:00', status: '已发送', reachRate: '95.3%', openRate: '38.2%' },
  { id: 'PHDRAFT01', title: '国庆节专属活动预告', summary: '十月黄金周，全场买一送一...', target: '全部用户', method: '立即发送', time: '-', status: '草稿', reachRate: '-', openRate: '-' },
  { id: 'PHDRAFT02', title: '新用户专属欢迎礼包', summary: '感谢您的注册，送您精美礼包一份...', target: '新用户', method: '立即发送', time: '-', status: '草稿', reachRate: '-', openRate: '-' },
  { id: 'PH20250708', title: '限时秒杀提醒', summary: '明日12:00限时秒杀活动...', target: '活跃用户', method: '立即发送', time: '2025-07-08 20:00', status: '失败', reachRate: '0%', openRate: '-' },
];

const STATUS_CONFIG: Record<PushStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  '已发送': { label: '已发送', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircleIcon size={12} /> },
  '定时中': { label: '定时中', color: '#2563eb', bg: '#dbeafe', icon: <ClockIcon size={12} /> },
  '草稿':   { label: '草稿',   color: '#6b7280', bg: '#f3f4f6', icon: <FileTextIcon size={12} /> },
  '失败':   { label: '失败',   color: '#dc2626', bg: '#fee2e2', icon: <AlertCircleIcon size={12} /> },
};

const TAB_LABELS: { key: PushStatus | '全部'; label: string }[] = [
  { key: '全部', label: '全部' },
  { key: '已发送', label: '已发送' },
  { key: '草稿', label: '草稿' },
  { key: '定时中', label: '定时中' },
];

export default function PushPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const [activeTab, setActiveTab] = useState<PushStatus | '全部'>('全部');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTarget, setFormTarget] = useState<TargetGroup>('全部用户');
  const [formMethod, setFormMethod] = useState<SendMethod>('立即发送');
  const [formTime, setFormTime] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handlePushAction = (action: string, id: string) => toast.success(`${action} ${id}`);

  const handleSend = () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormTitle('');
    setFormContent('');
  };

  const filtered = PUSH_RECORDS.filter(r => activeTab === '全部' || r.status === activeTab);

  // Stats
  const totalSent = PUSH_RECORDS.filter(r => r.status === '已发送').length;
  const reachRateAvg = '98.5%';
  const openRateAvg = '42.3%';
  const todayCount = 128;

  const statCards = [
    { label: '总发送次数', value: totalSent, suffix: '次', icon: <SendIcon size={18} />, color: primary },
    { label: '平均送达率', value: reachRateAvg, icon: <TrendingUpIcon size={18} />, color: '#16a34a' },
    { label: '平均打开率', value: openRateAvg, icon: <BellIcon size={18} />, color: '#7c3aed' },
    { label: '今日发送', value: todayCount, suffix: '条', icon: <MailIcon size={18} />, color: '#d97706' },
  ];

  return (
    <AdminLayout>
      <div data-cmp="PushPage" style={{ padding: '24px', minHeight: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>消息推送</h1>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>向用户发送精准推送通知，提升运营效果</p>
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
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `color-mix(in srgb, ${card.color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}>
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  {card.suffix && <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 2 }}>{card.suffix}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content: form + table side by side */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left: Send Form */}
          <div style={{ flex: '0 0 340px', minWidth: 300, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <SendIcon size={15} style={{ color: primary }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>新建推送</span>
            </div>
            <div style={{ padding: '20px' }}>
              {/* Title */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>推送标题 <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="请输入推送标题（最多30字）"
                  maxLength={30}
                  style={{ width: '100%', height: 36, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textAlign: 'right', marginTop: 3 }}>{formTitle.length}/30</div>
              </div>

              {/* Content */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>推送内容 <span style={{ color: '#dc2626' }}>*</span></label>
                <textarea
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  placeholder="请输入推送内容（最多100字）"
                  maxLength={100}
                  rows={4}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textAlign: 'right', marginTop: 3 }}>{formContent.length}/100</div>
              </div>

              {/* Target */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
                  <UsersIcon size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />目标用户
                </label>
                <select
                  value={formTarget}
                  onChange={e => setFormTarget(e.target.value as TargetGroup)}
                  style={{ width: '100%', height: 36, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                >
                  <option value="全部用户">全部用户</option>
                  <option value="新用户">新用户</option>
                  <option value="VIP用户">VIP用户</option>
                  <option value="活跃用户">活跃用户</option>
                  <option value="沉默用户">沉默用户</option>
                </select>
              </div>

              {/* Method */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>
                  <ClockIcon size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />发送方式
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['立即发送', '定时发送'] as SendMethod[]).map(m => (
                    <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--foreground)' }}>
                      <input
                        type="radio"
                        name="method"
                        value={m}
                        checked={formMethod === m}
                        onChange={() => setFormMethod(m)}
                        style={{ accentColor: primary, cursor: 'pointer' }}
                      />
                      {m}
                    </label>
                  ))}
                </div>
              </div>

              {/* Schedule time - always in DOM, hidden when not needed */}
              <div style={{ marginBottom: 20, display: formMethod === '定时发送' ? 'block' : 'none' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>发送时间</label>
                <input
                  type="datetime-local"
                  value={formTime}
                  onChange={e => setFormTime(e.target.value)}
                  style={{ width: '100%', height: 36, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Preview card */}
              <div style={{ marginBottom: 20, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <SmartphoneIcon size={11} />预览效果
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `color-mix(in srgb, ${primary} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BellIcon size={14} style={{ color: primary }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formTitle || '推送标题'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {formContent || '推送内容将在这里显示...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Success tip - always in DOM */}
              <div style={{ marginBottom: 12, padding: '8px 12px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, display: submitted ? 'flex' : 'none', alignItems: 'center', gap: 6 }}>
                <CheckCircleIcon size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#16a34a' }}>推送任务已成功创建！</span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  style={{ flex: 1, height: 38, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--muted-foreground)', fontSize: 13, cursor: 'pointer' }}
                  onClick={() => { setFormTitle(''); setFormContent(''); }}
                >
                  保存草稿
                </button>
                <button
                  onClick={handleSend}
                  style={{ flex: 1, height: 38, border: 'none', borderRadius: 8, background: primary, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <SendIcon size={13} />发送推送
                </button>
              </div>
            </div>
          </div>

          {/* Right: History Table */}
          <div style={{ flex: '1 1 400px', minWidth: 360, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
              {TAB_LABELS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    height: 44,
                    padding: '0 16px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: activeTab === tab.key ? 700 : 400,
                    color: activeTab === tab.key ? primary : 'var(--muted-foreground)',
                    borderBottom: activeTab === tab.key ? `2px solid ${primary}` : '2px solid transparent',
                    transition: 'color 0.2s, border-color 0.2s',
                    marginBottom: -1,
                  }}
                >
                  {tab.label}
                  <span style={{
                    marginLeft: 6,
                    padding: '1px 6px',
                    borderRadius: 10,
                    fontSize: 11,
                    background: activeTab === tab.key ? `color-mix(in srgb, ${primary} 12%, transparent)` : 'var(--muted)',
                    color: activeTab === tab.key ? primary : 'var(--muted-foreground)',
                    fontWeight: 600,
                  }}>
                    {tab.key === '全部' ? PUSH_RECORDS.length : PUSH_RECORDS.filter(r => r.status === tab.key).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr style={{ background: 'var(--muted)' }}>
                    {['推送ID', '标题', '目标', '方式', '发送时间', '送达率', '打开率', '状态', '操作'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const st = STATUS_CONFIG[r.status];
                    return (
                      <tr
                        key={r.id}
                        onMouseEnter={() => setHoveredRow(r.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{ borderBottom: '1px solid var(--border)', background: hoveredRow === r.id ? 'var(--muted)' : 'transparent', transition: 'background 0.15s' }}
                      >
                        <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.id}</td>
                        <td style={{ padding: '11px 12px', maxWidth: 160 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.summary}</div>
                        </td>
                        <td style={{ padding: '11px 12px', fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{r.target}</td>
                        <td style={{ padding: '11px 12px', fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{r.method}</td>
                        <td style={{ padding: '11px 12px', fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{r.time}</td>
                        <td style={{ padding: '11px 12px', fontSize: 12, color: 'var(--foreground)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.reachRate}</td>
                        <td style={{ padding: '11px 12px', fontSize: 12, color: 'var(--foreground)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.openRate}</td>
                        <td style={{ padding: '11px 12px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: '3px 8px', borderRadius: 20 }}>
                            {st.icon}{st.label}
                          </span>
                        </td>
                        <td style={{ padding: '11px 12px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => handlePushAction('编辑推送', r.id)} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }} title="编辑"><EditIcon size={12} /></button>
                            <button onClick={() => handlePushAction('已删除推送', r.id)} style={{ width: 26, height: 26, border: '1px solid #fee2e2', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }} title="删除"><Trash2Icon size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 14 }}>暂无推送记录</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
