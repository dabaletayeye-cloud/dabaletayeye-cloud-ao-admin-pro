import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import {
  BellIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  XIcon,
  SearchIcon,
  MailIcon,
  MailOpenIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

interface Message {
  id: number;
  title: string;
  content: string;
  type: 'system' | 'alert' | 'info' | 'success';
  time: string;
  read: boolean;
  from: string;
}

const MESSAGES: Message[] = [
  { id: 1, title: '系统升级通知', content: '系统将于 2024-06-15 凌晨 2:00 进行升级维护，预计持续 2 小时，期间服务将暂停。', type: 'system', time: '2024-06-10 09:00', read: false, from: '系统' },
  { id: 2, title: '新用户注册激增提醒', content: '今日新增注册用户 245 人，比昨日增长 32%，请注意服务器负载情况。', type: 'alert', time: '2024-06-10 08:30', read: false, from: '监控系统' },
  { id: 3, title: '内容审核待处理', content: '有 12 篇新投稿内容等待审核，请及时处理以确保发布质量。', type: 'info', time: '2024-06-10 08:00', read: false, from: '内容系统' },
  { id: 4, title: '月度营收达标', content: '本月营收已达 ¥128,450，超出目标 15%，恭喜运营团队完成目标！', type: 'success', time: '2024-06-09 18:00', read: true, from: '财务系统' },
  { id: 5, title: '服务器磁盘空间预警', content: '服务器磁盘使用率已达 85%，建议尽快清理日志文件或扩容存储空间。', type: 'alert', time: '2024-06-09 14:20', read: true, from: '运维系统' },
  { id: 6, title: '新版本发布成功', content: '前端版本 v2.1.0 已成功部署，新增漫画夜间模式及评论点赞功能。', type: 'success', time: '2024-06-09 11:00', read: true, from: '研发团队' },
  { id: 7, title: '用户反馈汇总', content: '本周累计收到用户反馈 87 条，其中功能建议 52 条、Bug 报告 21 条、投诉 14 条。', type: 'info', time: '2024-06-08 17:00', read: true, from: '客服系统' },
  { id: 8, title: '活动上线通知', content: '「夏日追漫节」活动已成功上线，优惠券发放量达 1,240 张。', type: 'success', time: '2024-06-08 10:00', read: true, from: '运营系统' },
  { id: 9, title: '异常登录检测', content: '检测到账号 admin@example.com 在陌生 IP（192.168.1.100）登录，请核实是否本人操作。', type: 'alert', time: '2024-06-07 23:15', read: true, from: '安全系统' },
  { id: 10, title: '数据备份完成', content: '每日自动数据备份已于 03:00 完成，备份文件大小 2.3 GB，存储至云端备份节点。', type: 'system', time: '2024-06-07 03:00', read: true, from: '备份系统' },
];

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  system: { label: '系统', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: <BellIcon size={14} /> },
  alert: { label: '预警', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: <AlertCircleIcon size={14} /> },
  info: { label: '通知', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: <InfoIcon size={14} /> },
  success: { label: '成功', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: <CheckCircleIcon size={14} /> },
};

const TYPE_FILTERS = [
  { label: '全部', value: '__all__' },
  { label: '系统', value: 'system' },
  { label: '预警', value: 'alert' },
  { label: '通知', value: 'info' },
  { label: '成功', value: 'success' },
];

export default function MessagePage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const [messages, setMessages] = useState(MESSAGES);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('__all__');
  const [selectedId, setSelectedId] = useState<number | null>(1);

  const markRead = (id: number) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const markAllRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
  };

  const filtered = messages.filter(m => {
    const matchSearch = search === '' || m.title.includes(search) || m.content.includes(search);
    const matchType = typeFilter === '__all__' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const selectedMsg = messages.find(m => m.id === selectedId) ?? null;
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <AdminLayout>
      <div data-cmp="MessagePage" className="p-6 min-h-full" style={{ background: 'var(--background)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              消息中心
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: isManga ? PINK : '#ef4444' }}>
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>系统通知与提醒消息</p>
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:bg-accent"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <MailOpenIcon size={14} />
            全部已读
          </button>
        </div>

        <div className="flex gap-5 h-[calc(100vh-220px)]">
          {/* Left: message list */}
          <div className="w-80 flex-shrink-0 flex flex-col rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            {/* Search + filter */}
            <div className="p-3 border-b flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm"
                style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
              >
                <SearchIcon size={13} style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索消息…"
                  className="bg-transparent outline-none flex-1 text-xs"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>
              <div className="flex gap-1 overflow-x-auto">
                {TYPE_FILTERS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setTypeFilter(f.value)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 transition-all"
                    style={{
                      background: typeFilter === f.value ? primary : 'var(--muted)',
                      color: typeFilter === f.value ? '#fff' : 'var(--muted-foreground)',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.map(m => {
                const meta = TYPE_META[m.type];
                const isSelected = selectedId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedId(m.id); markRead(m.id); }}
                    className="w-full text-left px-4 py-3 border-b transition-colors hover:bg-accent"
                    style={{
                      borderColor: 'var(--border)',
                      background: isSelected ? (isManga ? 'rgba(233,30,140,0.06)' : 'var(--accent)') : 'transparent',
                      borderLeft: isSelected ? `3px solid ${primary}` : '3px solid transparent',
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {!m.read && (
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isManga ? PINK : '#ef4444' }} />
                          )}
                          <span className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{m.title}</span>
                        </div>
                        <p className="text-xs truncate mb-1" style={{ color: 'var(--muted-foreground)' }}>{m.content}</p>
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{m.time}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <MailIcon size={24} className="mx-auto mb-2 opacity-40" />
                  暂无消息
                </div>
              )}
            </div>
          </div>

          {/* Right: message detail */}
          <div className="flex-1 rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            {selectedMsg ? (
              <>
                <div className="flex items-start justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: TYPE_META[selectedMsg.type].bg, color: TYPE_META[selectedMsg.type].color }}
                    >
                      {TYPE_META[selectedMsg.type].icon}
                    </div>
                    <div>
                      <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{selectedMsg.title}</h2>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <span>来自：{selectedMsg.from}</span>
                        <span>·</span>
                        <span>{selectedMsg.time}</span>
                        <span
                          className="px-2 py-0.5 rounded-full font-medium"
                          style={{ background: TYPE_META[selectedMsg.type].bg, color: TYPE_META[selectedMsg.type].color }}
                        >
                          {TYPE_META[selectedMsg.type].label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <XIcon size={14} />
                  </button>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{selectedMsg.content}</p>
                  <div
                    className="mt-6 p-4 rounded-xl border"
                    style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
                  >
                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>操作建议</div>
                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                      {selectedMsg.type === 'alert' && '请立即检查相关模块，必要时通知技术团队进行处理。'}
                      {selectedMsg.type === 'system' && '系统消息仅供知悉，无需额外操作。'}
                      {selectedMsg.type === 'info' && '请在工作时间内及时跟进相关事项。'}
                      {selectedMsg.type === 'success' && '任务已完成，可在对应模块查看详细数据。'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
                <MailIcon size={48} className="mb-4 opacity-20" />
                <p className="text-sm">选择一条消息查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
