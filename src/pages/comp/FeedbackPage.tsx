import React, { useState, useRef, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  XIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  InfoIcon,
  BellIcon,
  Trash2Icon,
  SaveIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  ChevronRightIcon,
  PanelRightCloseIcon,
  MessageSquareWarningIcon,
  LayersIcon,
  BellDotIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'warning' | 'error' | 'info';
interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  desc?: string;
}
interface NotifCard {
  id: number;
  type: ToastType;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

// ─── Toast config ─────────────────────────────────────────────────────────────

const TOAST_CFG: Record<ToastType, { icon: React.ReactNode; bg: string; border: string; iconColor: string; barColor: string }> = {
  success: {
    icon: <CheckCircleIcon size={18} />,
    bg: 'var(--card)',
    border: 'rgba(34,197,94,.35)',
    iconColor: '#16a34a',
    barColor: '#22c55e',
  },
  warning: {
    icon: <AlertTriangleIcon size={18} />,
    bg: 'var(--card)',
    border: 'rgba(245,158,11,.35)',
    iconColor: '#d97706',
    barColor: '#f59e0b',
  },
  error: {
    icon: <XCircleIcon size={18} />,
    bg: 'var(--card)',
    border: 'rgba(239,68,68,.35)',
    iconColor: '#dc2626',
    barColor: '#ef4444',
  },
  info: {
    icon: <InfoIcon size={18} />,
    bg: 'var(--card)',
    border: 'rgba(59,130,246,.35)',
    iconColor: '#2563eb',
    barColor: '#3b82f6',
  },
};

const TOAST_LABELS: Record<ToastType, string> = {
  success: '操作成功',
  warning: '警告提示',
  error: '操作失败',
  info: '消息通知',
};

const TOAST_DESCS: Record<ToastType, string> = {
  success: '数据已成功保存，所有变更均已同步至服务器。',
  warning: '该操作存在风险，请仔细确认后再继续执行。',
  error: '服务器请求超时，请检查网络后重试。',
  info: '系统将于今晚 22:00 进行例行维护，预计持续 30 分钟。',
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div data-cmp="Section" style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
      boxShadow: 'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,8px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.06))',
      overflow: 'visible',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 3 }}>{desc}</div>
      </div>
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Button primitives ────────────────────────────────────────────────────────

function useBtn(accentPrimary: string) {
  const base: React.CSSProperties = {
    height: 34, padding: '0 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none',
    transition: 'opacity .15s, background .15s',
  };
  return {
    primary: { ...base, background: accentPrimary, color: '#fff' } as React.CSSProperties,
    ghost: { ...base, background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' } as React.CSSProperties,
    danger: { ...base, background: 'transparent', border: '1px solid rgba(239,68,68,.4)', color: '#ef4444' } as React.CSSProperties,
    success: { ...base, background: '#22c55e', color: '#fff' } as React.CSSProperties,
    warning: { ...base, background: '#f59e0b', color: '#fff' } as React.CSSProperties,
    info: { ...base, background: '#3b82f6', color: '#fff' } as React.CSSProperties,
    error: { ...base, background: '#ef4444', color: '#fff' } as React.CSSProperties,
  };
}

// ─── Overlay ──────────────────────────────────────────────────────────────────

function Overlay({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(2px)',
        opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity .2s',
      }}
    />
  );
}

// ─── Generic Modal ────────────────────────────────────────────────────────────

function Modal({
  open, onClose, title, width = 440, children, footer,
}: {
  open: boolean; onClose: () => void; title: string; width?: number;
  children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <>
      <Overlay visible={open} onClick={onClose} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 310, display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <div style={{
          background: 'var(--card)', borderRadius: 14, width, maxWidth: '92vw',
          boxShadow: '0 24px 64px rgba(0,0,0,.22)',
          opacity: open ? 1 : 0, transform: open ? 'scale(1) translateY(0)' : 'scale(.94) translateY(12px)',
          transition: 'opacity .22s ease, transform .22s ease',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>{title}</span>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
              <XIcon size={14} />
            </button>
          </div>
          {/* body */}
          <div style={{ padding: '20px', color: 'var(--foreground)', fontSize: 14, lineHeight: 1.7 }}>
            {children}
          </div>
          {/* footer */}
          {footer && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function Drawer({
  open, onClose, title, children,
}: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <>
      <Overlay visible={open} onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 310, width: 400, maxWidth: '92vw',
        background: 'var(--card)', boxShadow: '-8px 0 40px rgba(0,0,0,.16)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>{title}</span>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
            <XIcon size={14} />
          </button>
        </div>
        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ─── Toast system ─────────────────────────────────────────────────────────────

function ToastList({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: number) => void }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 400, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      {toasts.map(t => {
        const cfg = TOAST_CFG[t.type];
        return (
          <div key={t.id} style={{
            background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 11,
            boxShadow: '0 6px 28px rgba(0,0,0,.14)', minWidth: 300, maxWidth: 360,
            pointerEvents: 'auto', overflow: 'hidden',
            animation: 'fb-toast-in .26s cubic-bezier(.34,1.56,.64,1) both',
          }}>
            {/* progress bar */}
            <div style={{ height: 3, background: cfg.barColor, animation: 'fb-bar 3s linear forwards' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px' }}>
              <span style={{ color: cfg.iconColor, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{t.title}</div>
                {t.desc && <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2, lineHeight: 1.5 }}>{t.desc}</div>}
              </div>
              <button onClick={() => onRemove(t.id)} style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
                <XIcon size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Notification cards ───────────────────────────────────────────────────────

const INIT_NOTIFS: NotifCard[] = [
  { id: 1, type: 'success', title: '部署成功', desc: '生产环境 v2.4.1 已成功部署，所有服务运行正常。', time: '刚刚', read: false },
  { id: 2, type: 'warning', title: '存储空间不足', desc: '服务器磁盘使用率已达 87%，请及时清理或扩容。', time: '5分钟前', read: false },
  { id: 3, type: 'error', title: '支付回调异常', desc: '订单 #20240523 支付回调失败，请排查第三方支付网关。', time: '12分钟前', read: true },
  { id: 4, type: 'info', title: '新用户注册', desc: '今日新增注册用户 128 人，较昨日增长 34%。', time: '1小时前', read: true },
];

function NotifCardItem({ notif, onRead, onDismiss, accent }: {
  notif: NotifCard; onRead: (id: number) => void; onDismiss: (id: number) => void; accent: string;
}) {
  const cfg = TOAST_CFG[notif.type];
  return (
    <div style={{
      border: `1px solid ${notif.read ? 'var(--border)' : cfg.border}`,
      borderRadius: 10, padding: '12px 14px', background: notif.read ? 'transparent' : `color-mix(in srgb, var(--card) 92%, ${cfg.barColor})`,
      display: 'flex', alignItems: 'flex-start', gap: 10, transition: 'all .18s',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* left accent bar */}
      {!notif.read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: cfg.barColor, borderRadius: '10px 0 0 10px' }} />}
      <span style={{ color: cfg.iconColor, flexShrink: 0, marginTop: 1, marginLeft: notif.read ? 0 : 6 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{notif.title}</span>
          {!notif.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.55 }}>{notif.desc}</div>
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 5, opacity: .7 }}>{notif.time}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        {!notif.read && (
          <button onClick={() => onRead(notif.id)} title="标为已读" style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
            <CheckCircleIcon size={13} />
          </button>
        )}
        <button onClick={() => onDismiss(notif.id)} title="移除" style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
          <XIcon size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Popconfirm ───────────────────────────────────────────────────────────────

function Popconfirm({
  trigger, title, desc, onConfirm, confirmText = '确认', cancelText = '取消',
  confirmColor = '#ef4444', placement = 'top',
}: {
  trigger: React.ReactNode; title: string; desc?: string;
  onConfirm: () => void; confirmText?: string; cancelText?: string;
  confirmColor?: string; placement?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const popStyle: React.CSSProperties = {
    position: 'absolute', zIndex: 200,
    background: 'var(--popover)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '12px 14px', width: 220,
    boxShadow: '0 8px 32px rgba(0,0,0,.14)',
    opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
    transform: open ? 'scale(1) translateY(0)' : 'scale(.94) translateY(4px)',
    transition: 'opacity .18s ease, transform .18s ease',
    ...(placement === 'top' ? { bottom: 'calc(100% + 8px)', left: '50%', transform: open ? 'translateX(-50%)' : 'translateX(-50%) translateY(6px)' }
      : placement === 'bottom' ? { top: 'calc(100% + 8px)', left: '50%', transform: open ? 'translateX(-50%)' : 'translateX(-50%) translateY(-6px)' }
      : placement === 'right' ? { left: 'calc(100% + 8px)', top: '50%', transform: open ? 'translateY(-50%)' : 'translateX(-6px) translateY(-50%)' }
      : { right: 'calc(100% + 8px)', top: '50%', transform: open ? 'translateY(-50%)' : 'translateX(6px) translateY(-50%)' }),
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'inline-flex' }}>{trigger}</div>
      <div style={popStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
          <AlertTriangleIcon size={15} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{title}</div>
            {desc && <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2, lineHeight: 1.5 }}>{desc}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <button onClick={() => setOpen(false)} style={{ height: 26, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', fontSize: 12, cursor: 'pointer', color: 'var(--foreground)' }}>
            {cancelText}
          </button>
          <button onClick={() => { onConfirm(); setOpen(false); }} style={{ height: 26, padding: '0 12px', borderRadius: 6, border: 'none', background: confirmColor, color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline message bar ───────────────────────────────────────────────────────

function AlertBar({ type, title, desc, closable = true }: { type: ToastType; title: string; desc?: string; closable?: boolean }) {
  const [closed, setClosed] = useState(false);
  const cfg = TOAST_CFG[type];
  if (closed) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: `color-mix(in srgb, ${cfg.barColor} 9%, var(--card))`,
      border: `1px solid ${cfg.border}`, borderRadius: 9,
      padding: '11px 14px', position: 'relative',
    }}>
      <span style={{ color: cfg.iconColor, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2, lineHeight: 1.5 }}>{desc}</div>}
      </div>
      {closable && (
        <button onClick={() => setClosed(true)} style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
          <XIcon size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const accentPrimary = isManga ? '#E91E8C' : 'var(--primary)';
  const btns = useBtn(accentPrimary);

  // — Modal state
  const [modalBasic, setModalBasic] = useState(false);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [modalForm, setModalForm] = useState(false);

  // — Drawer
  const [drawer, setDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'settings'>('profile');

  // — Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((type: ToastType) => {
    const id = ++toastIdRef.current;
    setToasts(t => [...t, { id, type, title: TOAST_LABELS[type], desc: TOAST_DESCS[type] }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  const removeToast = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);

  // — Notifications
  const [notifs, setNotifs] = useState<NotifCard[]>(INIT_NOTIFS);
  const markRead = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const dismissNotif = (id: number) => setNotifs(n => n.filter(x => x.id !== id));
  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const unreadCount = notifs.filter(n => !n.read).length;

  // — Form modal data
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  // — Popconfirm demos feedback
  const [pcResult, setPcResult] = useState('');

  const inputStyle: React.CSSProperties = {
    height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--input)', color: 'var(--foreground)', fontSize: 13, outline: 'none',
    width: '100%', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: 4, display: 'block' };

  return (
    <AdminLayout>
      <style>{`
        @keyframes fb-fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fb-toast-in { from{opacity:0;transform:translateX(40px) scale(.95)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes fb-bar { from{width:100%} to{width:0%} }
        .fb-trigger-btn:hover { opacity:.85; }
        .fb-notif-item { transition: background .15s, border-color .15s; }
        .fb-tab { transition: color .15s, border-color .15s; }
      `}</style>

      <ToastList toasts={toasts} onRemove={removeToast} />

      <div style={{ animation: 'fb-fade-in .4s ease', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>弹窗反馈</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            对话框 · 抽屉 · 消息提示 · 通知卡片 · 气泡确认
          </p>
        </div>

        {/* ── Row 1: Modal dialogs ─────────────────────────────────────────── */}
        <Section title="对话框 Dialog" desc="普通信息弹窗、操作确认弹窗、内嵌表单弹窗三种典型用法">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button className="fb-trigger-btn" style={btns.ghost} onClick={() => setModalBasic(true)}>
              <LayersIcon size={14} />普通对话框
            </button>
            <button className="fb-trigger-btn" style={btns.danger} onClick={() => setModalConfirm(true)}>
              <Trash2Icon size={14} />确认操作
            </button>
            <button className="fb-trigger-btn" style={btns.primary} onClick={() => setModalForm(true)}>
              <UserIcon size={14} />表单对话框
            </button>
          </div>
        </Section>

        {/* ── Row 2: Drawer + Inline alerts ────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

          {/* Drawer */}
          <div style={{ flex: '1 1 280px', minWidth: 240 }}>
            <Section title="右侧抽屉 Drawer" desc="从屏幕右侧滑入，适合编辑、详情、配置等场景">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <button className="fb-trigger-btn" style={btns.primary} onClick={() => { setDrawerTab('profile'); setDrawer(true); }}>
                  <PanelRightCloseIcon size={14} />用户详情抽屉
                </button>
                <button className="fb-trigger-btn" style={btns.ghost} onClick={() => { setDrawerTab('settings'); setDrawer(true); }}>
                  <PanelRightCloseIcon size={14} />系统设置抽屉
                </button>
              </div>
            </Section>
          </div>

          {/* Popconfirm */}
          <div style={{ flex: '1 1 280px', minWidth: 240 }}>
            <Section title="气泡确认 Popconfirm" desc="轻量二次确认，避免整页弹窗带来的打断感">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <Popconfirm
                  title="确认删除此条记录？"
                  desc="删除后数据无法恢复，请谨慎操作。"
                  confirmText="删除"
                  confirmColor="#ef4444"
                  placement="top"
                  onConfirm={() => setPcResult('已删除')}
                  trigger={<button className="fb-trigger-btn" style={btns.danger}><Trash2Icon size={14} />删除（顶部）</button>}
                />
                <Popconfirm
                  title="确认提交审核？"
                  desc="提交后将通知审核员处理，请确认内容无误。"
                  confirmText="提交"
                  confirmColor="#22c55e"
                  placement="bottom"
                  onConfirm={() => setPcResult('已提交')}
                  trigger={<button className="fb-trigger-btn" style={btns.success}>提交（底部）</button>}
                />
                <Popconfirm
                  title="确认发布？"
                  confirmText="发布"
                  confirmColor={accentPrimary}
                  placement="right"
                  onConfirm={() => setPcResult('已发布')}
                  trigger={<button className="fb-trigger-btn" style={btns.primary}><ChevronRightIcon size={14} />发布（右侧）</button>}
                />
                {pcResult && (
                  <span style={{ fontSize: 12, color: 'var(--muted-foreground)', padding: '4px 10px', borderRadius: 6, background: 'var(--muted)' }}>
                    操作反馈：<b style={{ color: 'var(--foreground)' }}>{pcResult}</b>
                  </span>
                )}
              </div>
            </Section>
          </div>
        </div>

        {/* ── Row 3: Toast messages ─────────────────────────────────────────── */}
        <Section title="消息提示 Message" desc="右上角弹出通知，带进度条自动消失，支持手动关闭">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {(['success', 'warning', 'error', 'info'] as ToastType[]).map(type => {
              const cfg = TOAST_CFG[type];
              const styleMap: Record<ToastType, React.CSSProperties> = {
                success: btns.success, warning: btns.warning, error: btns.error, info: btns.info,
              };
              return (
                <button key={type} className="fb-trigger-btn" style={styleMap[type]} onClick={() => pushToast(type)}>
                  <span style={{ color: '#fff' }}>{cfg.icon}</span>
                  {TOAST_LABELS[type]}
                </button>
              );
            })}
          </div>

          {/* Inline alert bars */}
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 2, fontWeight: 500 }}>内联消息条（AlertBar）</div>
            <AlertBar type="success" title="数据同步成功" desc="所有变更已同步至云端，上次同步时间：2024-05-23 14:32" />
            <AlertBar type="warning" title="磁盘空间不足" desc="剩余空间 13GB，建议清理无用文件或扩充存储。" />
            <AlertBar type="error" title="请求失败" desc="无法连接至服务器（Error 503），请检查网络后重试。" />
            <AlertBar type="info" title="功能公告" desc="新版数据导出功能已上线，支持 Excel / CSV / PDF 三种格式。" closable={false} />
          </div>
        </Section>

        {/* ── Row 4: Notification cards ─────────────────────────────────────── */}
        <Section title="通知卡片 Notification" desc="右上角卡片式通知，带已读状态、分类标签与批量操作">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BellDotIcon size={16} style={{ color: accentPrimary }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>消息中心</span>
              {unreadCount > 0 && (
                <span style={{ minWidth: 20, height: 20, borderRadius: 10, background: accentPrimary, color: '#fff', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...btns.ghost, height: 28, fontSize: 12, padding: '0 12px' }} onClick={markAllRead}>全部已读</button>
              <button style={{ ...btns.danger, height: 28, fontSize: 12, padding: '0 12px' }} onClick={() => setNotifs([])}>清空</button>
            </div>
          </div>
          {notifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-foreground)' }}>
              <BellIcon size={32} style={{ opacity: .3, marginBottom: 10 }} />
              <div style={{ fontSize: 13 }}>暂无消息</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifs.map(n => (
                <NotifCardItem key={n.id} notif={n} onRead={markRead} onDismiss={dismissNotif} accent={accentPrimary} />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* ══ Basic Modal ══════════════════════════════════════════════════════ */}
      <Modal open={modalBasic} onClose={() => setModalBasic(false)} title="关于 AdminPro"
        footer={<button style={btns.primary} onClick={() => setModalBasic(false)}>我知道了</button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: accentPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LayersIcon size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>AdminPro v2.4.1</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>企业级后台管理框架</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
            AdminPro 是一套基于 React 18 + TypeScript 构建的企业级后台解决方案，涵盖多主题、多布局、丰富组件与完善的权限体系，助力团队快速搭建高质量管理系统。
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['React 18', 'TypeScript', 'TailwindCSS', 'Recharts', 'Lucide Icons'].map(tag => (
              <span key={tag} style={{ padding: '3px 10px', borderRadius: 20, background: `color-mix(in srgb, ${accentPrimary} 10%, transparent)`, color: accentPrimary, fontSize: 12, fontWeight: 500 }}>{tag}</span>
            ))}
          </div>
        </div>
      </Modal>

      {/* ══ Confirm Modal ════════════════════════════════════════════════════ */}
      <Modal open={modalConfirm} onClose={() => setModalConfirm(false)} title="删除确认" width={380}
        footer={<>
          <button style={btns.ghost} onClick={() => setModalConfirm(false)}>取消</button>
          <button style={{ ...btns.error }} onClick={() => { setModalConfirm(false); pushToast('success'); }}>
            <Trash2Icon size={13} />确认删除
          </button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', padding: '8px 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2Icon size={26} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 6 }}>确定要删除这条记录吗？</div>
            <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.65 }}>
              删除后数据将永久移除，无法通过任何方式恢复，请谨慎操作。
            </div>
          </div>
        </div>
      </Modal>

      {/* ══ Form Modal ═══════════════════════════════════════════════════════ */}
      <Modal open={modalForm} onClose={() => setModalForm(false)} title="新建用户"
        footer={<>
          <button style={btns.ghost} onClick={() => setModalForm(false)}>取消</button>
          <button style={btns.primary} onClick={() => {
            setModalForm(false);
            setFormData({ name: '', email: '', password: '' });
            pushToast('success');
          }}>
            <SaveIcon size={13} />创建用户
          </button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>用户姓名 <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
              <input style={{ ...inputStyle, paddingLeft: 32 }} placeholder="请输入真实姓名"
                value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>邮箱地址 <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <MailIcon size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
              <input style={{ ...inputStyle, paddingLeft: 32 }} placeholder="user@example.com" type="email"
                value={formData.email} onChange={e => setFormData(d => ({ ...d, email: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>初始密码 <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <LockIcon size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
              <input style={{ ...inputStyle, paddingLeft: 32 }} placeholder="至少 8 位，含字母和数字" type="password"
                value={formData.password} onChange={e => setFormData(d => ({ ...d, password: e.target.value }))} />
            </div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'color-mix(in srgb, var(--primary) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)' }}>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
              <InfoIcon size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              创建后系统将自动发送激活邮件至用户邮箱，用户需激活后方可登录。
            </div>
          </div>
        </div>
      </Modal>

      {/* ══ Drawer ═══════════════════════════════════════════════════════════ */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title={drawerTab === 'profile' ? '用户详情' : '系统设置'}>
        {drawerTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${accentPrimary}, #a855f7)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>张</span>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>张伟</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>zhang.wei@adminpro.com</div>
                <div style={{ marginTop: 5 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(139,92,246,.12)', color: '#7c3aed', fontSize: 11, fontWeight: 600 }}>超级管理员</span>
                </div>
              </div>
            </div>
            {/* Info list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              {[
                { label: '用户 ID', value: '#1001' },
                { label: '所属部门', value: '产品研发部' },
                { label: '城市', value: '北京市' },
                { label: '注册时间', value: '2021-03-15' },
                { label: '最后登录', value: '2024-05-23 09:41' },
                { label: '账号状态', value: '正常' },
              ].map((item, i) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: i < 5 ? '1px solid var(--border)' : 'none', background: i % 2 === 1 ? 'color-mix(in srgb, var(--muted) 30%, transparent)' : 'transparent' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted-foreground)', width: 80, flexShrink: 0 }}>{item.label}</span>
                  <span style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...btns.primary, flex: 1, justifyContent: 'center' }} onClick={() => { setDrawer(false); pushToast('success'); }}>
                <SaveIcon size={13} />保存修改
              </button>
              <button style={{ ...btns.ghost, flex: 1, justifyContent: 'center' }} onClick={() => setDrawer(false)}>关闭</button>
            </div>
          </div>
        )}
        {drawerTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: '邮件通知', desc: '接收系统邮件提醒', defaultVal: true },
              { label: '站内消息', desc: '接收站内通知消息', defaultVal: true },
              { label: '双因素认证', desc: '登录时需要额外验证码', defaultVal: false },
              { label: '操作日志记录', desc: '记录所有账号操作行为', defaultVal: true },
              { label: '数据变更提醒', desc: '关键数据变更时推送通知', defaultVal: false },
            ].map(item => (
              <ToggleRow key={item.label} label={item.label} desc={item.desc} defaultVal={item.defaultVal} accent={accentPrimary} />
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', gap: 8 }}>
              <button style={{ ...btns.primary, flex: 1, justifyContent: 'center' }} onClick={() => { setDrawer(false); pushToast('success'); }}>
                <SaveIcon size={13} />保存设置
              </button>
              <button style={{ ...btns.ghost, flex: 1, justifyContent: 'center' }} onClick={() => setDrawer(false)}>取消</button>
            </div>
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
}

// ─── Toggle row helper ────────────────────────────────────────────────────────

function ToggleRow({ label, desc, defaultVal, accent }: { label: string; desc: string; defaultVal: boolean; accent: string }) {
  const [on, setOn] = useState(defaultVal);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{desc}</div>
      </div>
      <div onClick={() => setOn(v => !v)} style={{
        width: 40, height: 22, borderRadius: 11, cursor: 'pointer', flexShrink: 0,
        background: on ? accent : 'var(--muted)',
        transition: 'background .18s', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: on ? 21 : 3, width: 16, height: 16,
          borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,.2)',
          transition: 'left .18s',
        }} />
      </div>
    </div>
  );
}
