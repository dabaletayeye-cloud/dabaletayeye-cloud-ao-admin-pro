import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import AdminLayout from '../components/AdminLayout';
import {
  HomeIcon,
  ArrowLeftIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  ShieldOffIcon,
  FileQuestionIcon,
  ServerCrashIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

// ─── Illustration components (pure SVG, no external images) ─────────────────

function IllustrationLock() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Monitor body */}
      <rect x="20" y="30" width="120" height="82" rx="8" fill="var(--muted)" stroke="var(--border)" strokeWidth="2"/>
      <rect x="28" y="38" width="104" height="60" rx="4" fill="var(--background)" stroke="var(--border)" strokeWidth="1"/>
      {/* Stand */}
      <rect x="66" y="112" width="28" height="8" rx="3" fill="var(--border)"/>
      <rect x="54" y="120" width="52" height="6" rx="3" fill="var(--border)"/>
      {/* Lock icon center */}
      <rect x="68" y="54" width="24" height="18" rx="4" fill="#f97316"/>
      <path d="M74 54v-5a6 6 0 0 1 12 0v5" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="80" cy="63" r="3" fill="white"/>
      <rect x="79" y="64" width="2" height="4" rx="1" fill="white"/>
      {/* Warning icon top-right */}
      <circle cx="126" cy="36" r="12" fill="#f97316" opacity="0.15"/>
      <ShieldOffIcon x={119} y={29} size={14} color="#f97316" />
    </svg>
  );
}

function IllustrationLost() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground */}
      <ellipse cx="80" cy="128" rx="60" ry="6" fill="var(--border)" opacity="0.5"/>
      {/* Person body */}
      <circle cx="80" cy="42" r="18" fill="var(--muted)" stroke="var(--border)" strokeWidth="2"/>
      {/* Face question */}
      <text x="73" y="48" fontSize="18" fill="var(--muted-foreground)">?</text>
      {/* Body */}
      <rect x="66" y="60" width="28" height="32" rx="8" fill="var(--muted)" stroke="var(--border)" strokeWidth="2"/>
      {/* Left arm up (confused) */}
      <path d="M66 68 L48 52" stroke="var(--border)" strokeWidth="5" strokeLinecap="round"/>
      {/* Right arm */}
      <path d="M94 72 L112 64" stroke="var(--border)" strokeWidth="5" strokeLinecap="round"/>
      {/* Legs */}
      <path d="M72 92 L68 122" stroke="var(--border)" strokeWidth="5" strokeLinecap="round"/>
      <path d="M88 92 L92 122" stroke="var(--border)" strokeWidth="5" strokeLinecap="round"/>
      {/* Floating signs */}
      <rect x="104" y="28" width="32" height="22" rx="5" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5"/>
      <text x="110" y="43" fontSize="13" fill="var(--muted-foreground)">404</text>
      {/* Stars around */}
      <text x="24" y="48" fontSize="14" opacity="0.5">✦</text>
      <text x="130" y="80" fontSize="10" opacity="0.4">✦</text>
      <text x="40" y="90" fontSize="8" opacity="0.3">✦</text>
    </svg>
  );
}

function IllustrationServer() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Server rack */}
      <rect x="30" y="20" width="100" height="80" rx="6" fill="var(--muted)" stroke="var(--border)" strokeWidth="2"/>
      {/* Server slots */}
      <rect x="38" y="30" width="84" height="16" rx="3" fill="var(--background)" stroke="var(--border)" strokeWidth="1"/>
      <rect x="38" y="52" width="84" height="16" rx="3" fill="var(--background)" stroke="var(--border)" strokeWidth="1"/>
      <rect x="38" y="74" width="84" height="16" rx="3" fill="var(--background)" stroke="var(--border)" strokeWidth="1"/>
      {/* Status lights */}
      <circle cx="112" cy="38" r="3" fill="#22c55e"/>
      <circle cx="112" cy="60" r="3" fill="#ef4444"/>
      <circle cx="112" cy="82" r="3" fill="#f59e0b"/>
      {/* Error crosses on second slot */}
      <text x="50" y="64" fontSize="11" fill="#ef4444">ERROR</text>
      {/* Lightning bolt */}
      <circle cx="126" cy="24" r="14" fill="#ef4444" opacity="0.12"/>
      <path d="M129 14 L123 24 L127 24 L121 34 L131 21 L127 21 Z" fill="#ef4444"/>
      {/* Stand */}
      <rect x="60" y="100" width="40" height="8" rx="3" fill="var(--border)"/>
      <rect x="50" y="108" width="60" height="6" rx="3" fill="var(--border)"/>
    </svg>
  );
}

// ─── Error Card ───────────────────────────────────────────────────────────────

interface ErrorCardProps {
  code: '403' | '404' | '500';
  primary: string;
}

function ErrorCard({ code, primary }: ErrorCardProps) {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const CONFIG = {
    '403': {
      illustration: <IllustrationLock />,
      accent: '#f97316',
      title: '无权访问',
      desc: '很抱歉，您没有权限访问此页面。如有疑问，请联系系统管理员进行授权。',
      icon: <ShieldOffIcon size={16} />,
      actions: [
        { label: '返回首页', icon: <HomeIcon size={14} />, variant: 'primary' as const, onClick: () => navigate('/') },
      ],
    },
    '404': {
      illustration: <IllustrationLost />,
      accent: '#8b5cf6',
      title: '页面不存在',
      desc: '哎呀，您访问的页面迷路了！请检查链接是否正确，或返回继续浏览。',
      icon: <FileQuestionIcon size={16} />,
      actions: [
        { label: '返回上一页', icon: <ArrowLeftIcon size={14} />, variant: 'outline' as const, onClick: () => navigate(-1) },
        { label: '返回首页',  icon: <HomeIcon size={14} />,       variant: 'primary' as const, onClick: () => navigate('/') },
      ],
    },
    '500': {
      illustration: <IllustrationServer />,
      accent: '#ef4444',
      title: '服务器出错',
      desc: '服务器遇到了一些问题，正在努力修复中。请稍候片刻再试，或联系技术支持。',
      icon: <ServerCrashIcon size={16} />,
      actions: [
        {
          label: refreshing ? '刷新中…' : '刷新页面',
          icon: <RefreshCwIcon size={14} style={{ animation: refreshing ? 'topbar-spin 0.8s linear infinite' : 'none' }} />,
          variant: 'outline' as const,
          onClick: () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1500); },
        },
        { label: '返回首页', icon: <HomeIcon size={14} />, variant: 'primary' as const, onClick: () => navigate('/') },
      ],
    },
  } as const;

  const cfg = CONFIG[code];

  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid var(--border)`,
      borderTop: `3px solid ${cfg.accent}`,
      borderRadius: 14,
      padding: '36px 28px 32px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      minWidth: 260,
    }}>
      {/* Code badge */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        background: `color-mix(in srgb, ${cfg.accent} 12%, transparent)`,
        color: cfg.accent,
        fontSize: 11, fontWeight: 800, letterSpacing: 1,
        padding: '3px 8px', borderRadius: 6,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {cfg.icon}
        {code}
      </div>

      {/* Illustration */}
      <div style={{ marginBottom: 20 }}>
        {cfg.illustration}
      </div>

      {/* Big code text (decorative) */}
      <div style={{
        fontSize: 56, fontWeight: 900,
        color: `color-mix(in srgb, ${cfg.accent} 18%, transparent)`,
        lineHeight: 1, marginBottom: 8,
        letterSpacing: -2,
        userSelect: 'none',
      }}>
        {code}
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--foreground)', margin: '0 0 8px' }}>
        {cfg.title}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '0 0 28px', textAlign: 'center', maxWidth: 260, lineHeight: 1.7 }}>
        {cfg.desc}
      </p>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {cfg.actions.map(act => {
          const isPrimary = act.variant === 'primary';
          return (
            <button
              key={act.label}
              onClick={act.onClick}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 18px', height: 38, borderRadius: 8,
                border: isPrimary ? 'none' : `1.5px solid ${cfg.accent}`,
                background: isPrimary ? cfg.accent : `color-mix(in srgb, ${cfg.accent} 8%, transparent)`,
                color: isPrimary ? '#fff' : cfg.accent,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              {act.icon}
              {act.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── ErrorPage ────────────────────────────────────────────────────────────────

export default function ErrorPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  return (
    <AdminLayout>
      <div data-cmp="ErrorPage" style={{ padding: '28px 28px 40px', minHeight: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <AlertTriangleIcon size={18} style={{ color: primary }} />
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>异常页面</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>
            403 无权访问 / 404 页面不存在 / 500 服务器错误 三种异常状态展示
          </p>
        </div>

        {/* Three cards */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {(['403', '404', '500'] as const).map(code => (
            <div key={code} style={{ flex: '1 1 260px', minWidth: 240 }}>
              <ErrorCard code={code} primary={primary} />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
