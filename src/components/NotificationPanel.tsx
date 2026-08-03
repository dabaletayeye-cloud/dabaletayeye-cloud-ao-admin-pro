import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import {
  BellIcon, XIcon, CheckCheckIcon, SettingsIcon,
  WrenchIcon, UserIcon, ShieldAlertIcon, ClipboardListIcon,
  ChevronRightIcon, InboxIcon, ToggleLeftIcon, ToggleRightIcon,
  VolumeXIcon, Volume2Icon, MonitorIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotifType = 'system' | 'user' | 'security' | 'task';
type TabKey = 'all' | 'unread' | 'read';

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  summary: string;
  time: string;
  read: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_NOTIFS: Notification[] = [
  { id: 'n1', type: 'system',   title: '系统维护通知',       summary: '今晚23:00将进行系统升级维护',     time: '2分钟前',  read: false },
  { id: 'n2', type: 'user',     title: '林晓薇关注了你',     summary: '点击查看她的主页详情',             time: '18分钟前', read: false },
  { id: 'n3', type: 'security', title: '登录异常提醒',        summary: '检测到异地登录 IP: 192.168.1.1',  time: '1小时前',  read: false },
  { id: 'n4', type: 'task',     title: '待办事项提醒',        summary: '您有3个事项即将到期，请及时处理',  time: '2小时前',  read: true  },
  { id: 'n5', type: 'system',   title: '数据库备份完成',     summary: '备份文件大小 2.3GB，已存储至OSS', time: '昨天',     read: true  },
  { id: 'n6', type: 'user',     title: '陈建国评论了你的文章', summary: '"写得很好，期待下一篇！"',         time: '昨天',     read: true  },
  { id: 'n7', type: 'task',     title: '审核任务提醒',        summary: '有12个用户注册申请待审核',        time: '2天前',    read: true  },
  { id: 'n8', type: 'system',   title: '版本更新通知',        summary: 'AdminPro v2.6.1 已发布，点击查看更新日志', time: '3天前', read: true },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotifType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  system:   { label: '系统', color: '#2563eb', bg: '#dbeafe', icon: <WrenchIcon       size={14} /> },
  user:     { label: '用户', color: '#16a34a', bg: '#dcfce7', icon: <UserIcon          size={14} /> },
  security: { label: '安全', color: '#d97706', bg: '#fef3c7', icon: <ShieldAlertIcon   size={14} /> },
  task:     { label: '任务', color: '#7c3aed', bg: '#ede9fe', icon: <ClipboardListIcon size={14} /> },
};

// ─── Settings panel ───────────────────────────────────────────────────────────

interface SettingsSwitchRow {
  key: string;
  label: string;
  desc: string;
}

const NOTIF_TYPE_ROWS: SettingsSwitchRow[] = [
  { key: 'system',   label: '系统通知',   desc: '维护、更新、备份等系统事件' },
  { key: 'user',     label: '用户通知',   desc: '关注、评论、点赞等互动消息' },
  { key: 'security', label: '安全通知',   desc: '异常登录、密码变更等安全警报' },
  { key: 'task',     label: '任务通知',   desc: '待办提醒、审核任务、到期提醒' },
  { key: 'marketing',label: '营销通知',   desc: '活动推送、优惠券、促销消息' },
];

function SwitchBtn({ k, on, primary, onToggle }: { k: string; on: boolean; primary: string; onToggle: (key: string) => void }) {
  return (
    <button
      onClick={() => onToggle(k)}
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: on ? primary : 'var(--muted-foreground)', flexShrink: 0 }}
    >
      {on ? <ToggleRightIcon size={26} /> : <ToggleLeftIcon size={26} />}
    </button>
  );
}

function SettingsPanel({ primary, onBack }: { primary: string; onBack: () => void }) {
  const [switches, setSwitches] = useState<Record<string, boolean>>({
    system: true, user: true, security: true, task: true, marketing: false,
    sound: true, desktop: false,
  });

  const toggle = (key: string) => setSwitches(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
          <ChevronRightIcon size={13} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>通知设置</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {/* Type switches */}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>通知类型</div>
        {NOTIF_TYPE_ROWS.map(row => (
          <div key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{row.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>{row.desc}</div>
            </div>
          <SwitchBtn k={row.key} on={switches[row.key] ?? false} primary={primary} onToggle={toggle} />
          </div>
        ))}

        {/* Sound & Desktop */}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 16, marginBottom: 10 }}>其他设置</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {switches.sound ? <Volume2Icon size={15} style={{ color: primary }} /> : <VolumeXIcon size={15} style={{ color: 'var(--muted-foreground)' }} />}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>通知声音</div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>收到通知时播放提示音</div>
            </div>
          </div>
          <SwitchBtn k="sound" on={switches.sound ?? false} primary={primary} onToggle={toggle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MonitorIcon size={15} style={{ color: switches.desktop ? primary : 'var(--muted-foreground)' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>桌面通知</div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>浏览器桌面弹窗提醒</div>
            </div>
          </div>
          <SwitchBtn k="desktop" on={switches.desktop ?? false} primary={primary} onToggle={toggle} />
        </div>
      </div>
    </div>
  );
}

// ─── Notification Item ────────────────────────────────────────────────────────

function NotifItem({
  notif, primary,
  onMarkRead, onDelete,
}: {
  notif: Notification;
  primary: string;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cfg = TYPE_CONFIG[notif.type];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onMarkRead(notif.id)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        background: !notif.read
          ? `color-mix(in srgb, ${primary} 4%, var(--card))`
          : hovered ? 'var(--accent)' : 'var(--card)',
        cursor: 'pointer',
        transition: 'background 0.15s',
        position: 'relative',
      }}
    >
      {/* Type icon */}
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: cfg.bg, color: cfg.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: notif.read ? 500 : 700, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {notif.title}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '1px 5px', borderRadius: 10, flexShrink: 0, whiteSpace: 'nowrap' }}>
            {cfg.label}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
          {notif.summary}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{notif.time}</div>
      </div>

      {/* Right: unread dot + delete */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* Unread dot — always in DOM, hidden when read */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#EF4444',
          opacity: notif.read ? 0 : 1,
          transition: 'opacity 0.2s',
          flexShrink: 0,
        }} />
        {/* Delete button — visible on hover */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(notif.id); }}
          style={{
            width: 22, height: 22, borderRadius: 5,
            border: '1px solid var(--border)',
            background: 'var(--background)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted-foreground)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
          title="删除"
        >
          <XIcon size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Main NotificationPanel Component ────────────────────────────────────────

export default function NotificationPanel() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const [open, setOpen]           = useState(false);
  const [tab, setTab]             = useState<TabKey>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notifs, setNotifs]       = useState<Notification[]>(INITIAL_NOTIFS);

  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef   = useRef<HTMLButtonElement>(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setShowSettings(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const filtered = notifs.filter(n => {
    if (tab === 'unread') return !n.read;
    if (tab === 'read')   return n.read;
    return true;
  });

  const tabCount = (k: TabKey) => {
    if (k === 'all')    return notifs.length;
    if (k === 'unread') return notifs.filter(n => !n.read).length;
    return notifs.filter(n => n.read).length;
  };

  const TAB_LIST: { key: TabKey; label: string }[] = [
    { key: 'all',    label: '全部' },
    { key: 'unread', label: '未读' },
    { key: 'read',   label: '已读' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        ref={btnRef}
        onClick={() => { setOpen(v => !v); setShowSettings(false); }}
        style={{
          width: 36, height: 36, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: open ? 'var(--accent)' : 'transparent',
          border: 'none', cursor: 'pointer',
          color: 'var(--foreground)',
          position: 'relative',
          transition: 'background 0.2s',
        }}
        title="通知"
      >
        <BellIcon size={16} />
        {/* Badge — always in DOM, opacity transition */}
        <span style={{
          position: 'absolute', top: 5, right: 5,
          minWidth: 16, height: 16,
          borderRadius: 8, fontSize: 10, fontWeight: 700,
          background: '#EF4444', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid var(--card)',
          padding: '0 3px',
          opacity: unreadCount > 0 ? 1 : 0,
          transform: unreadCount > 0 ? 'scale(1)' : 'scale(0.5)',
          transition: 'opacity 0.2s, transform 0.2s',
          pointerEvents: 'none',
        }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      </button>

      {/* Dropdown panel */}
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: 360,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: '0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 999,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: 560,
          // visibility toggle — panel is always in DOM
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transform: open ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 0.2s, transform 0.2s',
        }}
      >
        {/* Settings view */}
        <div style={{ display: showSettings ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden', maxHeight: 560 }}>
          <SettingsPanel primary={primary} onBack={() => setShowSettings(false)} />
        </div>

        {/* Main notification view */}
        <div style={{ display: showSettings ? 'none' : 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>通知中心</span>
                {unreadCount > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: '#fff', background: '#EF4444',
                    padding: '1px 7px', borderRadius: 20,
                  }}>
                    {unreadCount}条未读
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={markAllRead}
                  style={{
                    height: 28, padding: '0 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    background: 'transparent',
                    color: unreadCount > 0 ? primary : 'var(--muted-foreground)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    whiteSpace: 'nowrap',
                  }}
                  title="全部已读"
                >
                  <CheckCheckIcon size={13} />全部已读
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}
                  title="通知设置"
                >
                  <SettingsIcon size={13} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}
                >
                  <XIcon size={13} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)' }}>
              {TAB_LIST.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    height: 36, padding: '0 12px',
                    border: 'none', background: 'transparent',
                    cursor: 'pointer', fontSize: 13,
                    fontWeight: tab === t.key ? 700 : 400,
                    color: tab === t.key ? primary : 'var(--muted-foreground)',
                    borderBottom: tab === t.key ? `2px solid ${primary}` : '2px solid transparent',
                    marginBottom: -1,
                    display: 'flex', alignItems: 'center', gap: 5,
                    transition: 'color 0.15s',
                  }}
                >
                  {t.label}
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: '1px 5px', borderRadius: 10,
                    background: tab === t.key ? `color-mix(in srgb, ${primary} 12%, transparent)` : 'var(--muted)',
                    color: tab === t.key ? primary : 'var(--muted-foreground)',
                  }}>
                    {tabCount(t.key)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notification list */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 400 }}>
            {/* Empty state — always in DOM */}
            <div style={{
              display: filtered.length === 0 ? 'flex' : 'none',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '40px 20px', gap: 10,
            }}>
              <InboxIcon size={36} style={{ color: 'var(--muted-foreground)' }} />
              <div style={{ fontSize: 14, color: 'var(--muted-foreground)', fontWeight: 500 }}>
                {tab === 'unread' ? '没有未读通知' : tab === 'read' ? '没有已读通知' : '暂无通知'}
              </div>
            </div>

            {/* Items */}
            <div style={{ display: filtered.length > 0 ? 'block' : 'none' }}>
              {filtered.map(notif => (
                <NotifItem
                  key={notif.id}
                  notif={notif}
                  primary={primary}
                  onMarkRead={markRead}
                  onDelete={deleteNotif}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid var(--border)',
            padding: '10px 16px',
            flexShrink: 0,
          }}>
            <button
              onClick={() => setTab('all')}
              style={{
                width: '100%', height: 34,
                border: `1px solid color-mix(in srgb, ${primary} 30%, transparent)`,
                borderRadius: 8,
                background: `color-mix(in srgb, ${primary} 6%, transparent)`,
                color: primary,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'background 0.2s',
              }}
            >
              查看全部通知
              <ChevronRightIcon size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
