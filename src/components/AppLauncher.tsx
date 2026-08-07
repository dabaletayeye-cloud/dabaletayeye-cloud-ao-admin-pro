import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import LocalizedText from './LocalizedText';
import {
  LayoutGridIcon,
  XIcon,
  LayoutDashboardIcon,
  BarChart3Icon,
  SparklesIcon,
  MessageSquareIcon,
  BookOpenIcon,
  WrenchIcon,
  ScrollTextIcon,
  TagIcon,
  ChevronRightIcon,
} from 'lucide-react';
import appConfig from '../config/app.json';

const PINK = '#E91E8C';

// ─── App entries ──────────────────────────────────────────────────────────────

type AppEntry = {
  label: string;
  desc: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
} & (
  | { path: string; external?: never }
  | { external: string; path?: never }
);

interface QuickLink {
  label: string;
  path: string;
}

const APP_ENTRIES: AppEntry[] = [
  {
    label: '工作台',
    desc: '系统概览与数据统计',
    path: '/',
    color: '#2563eb',
    bg: '#dbeafe',
    icon: <LayoutDashboardIcon size={20} />,
  },
  {
    label: '分析页',
    desc: '数据分析与可视化',
    path: '/analytics/traffic',
    color: '#e11d48',
    bg: '#ffe4e6',
    icon: <BarChart3Icon size={20} />,
  },
  {
    label: '礼花效果',
    desc: '动画特效展示',
    path: '/comp/confetti',
    color: '#7c3aed',
    bg: '#ede9fe',
    icon: <SparklesIcon size={20} />,
  },
  {
    label: '聊天',
    desc: '即时通讯功能',
    path: '/tmpl/chat',
    color: '#16a34a',
    bg: '#dcfce7',
    icon: <MessageSquareIcon size={20} />,
  },
  {
    label: '官方文档',
    desc: '使用指南与开发文档',
    external: 'https://gitcode.com/BieJingChouXiangChongZai/ao-admin-pro',
    color: '#d97706',
    bg: '#fef3c7',
    icon: <BookOpenIcon size={20} />,
  },
  {
    label: '技术支持',
    desc: '技术支持与问题反馈',
    external: 'https://gitcode.com/BieJingChouXiangChongZai/ao-admin-pro/issues',
    color: '#0891b2',
    bg: '#cffafe',
    icon: <WrenchIcon size={20} />,
  },
  {
    label: '更新日志',
    desc: '版本更新与变更记录',
    external: 'https://gitcode.com/BieJingChouXiangChongZai/ao-admin-pro/commits',
    color: '#f59e0b',
    bg: '#fef9c3',
    icon: <ScrollTextIcon size={20} />,
  },
  {
    label: '哔哩哔哩',
    desc: '技术分享与交流',
    external: 'https://search.bilibili.com/all?keyword=ao-admin-pro',
    color: '#e879f9',
    bg: '#fae8ff',
    icon: <TagIcon size={20} />,
  },
];

const QUICK_LINKS: QuickLink[] = [
  { label: '登录', path: '/login' },
  { label: '注册', path: '/register' },
  { label: '忘记密码', path: '/forgot-password' },
  { label: '定价', path: '/tmpl/pricing' },
  { label: '个人中心', path: '/profile' },
  { label: '留言管理', path: '/messages' },
];

// ─── AppLauncher ─────────────────────────────────────────────────────────────

export default function AppLauncher() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef   = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleNavigation = (entry: { path?: string; external?: string }) => {
    if (entry.external) {
      window.open(entry.external, '_blank', 'noopener,noreferrer');
    } else if (entry.path) {
      navigate(entry.path);
    }
    setOpen(false);
  };

  return (
    <LocalizedText><div data-cmp="AppLauncher" style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        style={{
          width: 36, height: 36, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: open ? 'var(--accent)' : 'transparent',
          border: open ? `1.5px solid color-mix(in srgb, ${primary} 40%, transparent)` : '1.5px solid transparent',
          cursor: 'pointer',
          color: open ? primary : 'var(--foreground)',
          transition: 'background 0.2s, color 0.2s, border-color 0.2s',
        }}
        title="应用导航"
      >
        <LayoutGridIcon size={17} />
      </button>

      {/* Dropdown panel */}
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: 560,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: '0 16px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 999,
          overflow: 'hidden',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transform: open ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.2s, transform 0.2s',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px 10px',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>应用导航</span>
          <button
            onClick={() => setOpen(false)}
            style={{
              width: 26, height: 26, border: '1px solid var(--border)',
              borderRadius: 6, background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted-foreground)',
            }}
          >
            <XIcon size={13} />
          </button>
        </div>

        {/* Body: 2/3 apps + 1/3 quick links */}
        <div style={{ display: 'flex', gap: 0 }}>
          {/* App grid — left 2/3 */}
          <div style={{ flex: '1 1 0', padding: '14px 16px 16px' }}>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 4,
            }}>
              {APP_ENTRIES.map(app => (
                <button
                  key={app.label}
                  onClick={() => handleNavigation(app)}
                  onMouseEnter={() => setHoveredApp(app.label)}
                  onMouseLeave={() => setHoveredApp(null)}
                  style={{
                    width: 'calc(50% - 2px)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    border: hoveredApp === app.label ? `1.5px solid color-mix(in srgb, ${app.color} 30%, transparent)` : '1.5px solid transparent',
                    borderRadius: 10,
                    background: hoveredApp === app.label ? `color-mix(in srgb, ${app.color} 6%, var(--background))` : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: app.bg,
                    color: app.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {app.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 2 }}>
                      {app.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: 'var(--border)', flexShrink: 0, margin: '12px 0' }} />

          {/* Quick links — right ~160px */}
          <div style={{ width: 148, flexShrink: 0, padding: '14px 14px 16px' }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)',
              letterSpacing: 0.5, textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              快速链接
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {QUICK_LINKS.map(link => (
                <button
                  key={link.path}
                  onClick={() => handleNavigation(link)}
                  onMouseEnter={() => setHoveredLink(link.label)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 8px',
                    border: 'none',
                    borderRadius: 7,
                    background: hoveredLink === link.label ? 'var(--accent)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: 13, color: hoveredLink === link.label ? primary : 'var(--foreground)', transition: 'color 0.15s' }}>
                    {link.label}
                  </span>
                  <ChevronRightIcon size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '10px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{appConfig.brand.name} · {appConfig.brand.tagline}</span>
          <button
            onClick={() => setOpen(false)}
            style={{
              height: 28, padding: '0 12px',
              border: `1px solid color-mix(in srgb, ${primary} 35%, transparent)`,
              borderRadius: 6,
              background: `color-mix(in srgb, ${primary} 8%, transparent)`,
              color: primary,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div></LocalizedText>
  );
}
