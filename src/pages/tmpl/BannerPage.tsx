import React, { useState } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  ArrowRightIcon,
  SparklesIcon,
  RocketIcon,
  InfoIcon,
  AlertTriangleIcon,
  XIcon,
  StarIcon,
  GiftIcon,
  TrendingUpIcon,
  PlayCircleIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  ZapIcon,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Section wrapper
───────────────────────────────────────────────────────────── */
function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-cmp="Section"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow:
          'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,10px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.06))',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   1. 渐变背景营销横幅
───────────────────────────────────────────────────────────── */
interface GradientBannerProps {
  gradient: string;
  eyebrow?: string;
  title: string;
  desc: string;
  primaryBtn: string;
  secondaryBtn?: string;
  accentColor?: string;
  decorIcon?: React.ReactNode;
}

function GradientBanner({
  gradient,
  eyebrow,
  title,
  desc,
  primaryBtn,
  secondaryBtn,
  accentColor = '#fff',
  decorIcon,
}: GradientBannerProps) {
  return (
    <div
      data-cmp="GradientBanner"
      style={{
        borderRadius: 14,
        background: gradient,
        padding: '36px 40px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}
    >
      {/* decorative blobs */}
      <div style={{
        position: 'absolute', right: -40, top: -40,
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(255,255,255,.06)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 80, bottom: -60,
        width: 140, height: 140, borderRadius: '50%',
        background: 'rgba(255,255,255,.04)', pointerEvents: 'none',
      }} />

      {/* content */}
      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        {eyebrow && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,.18)', borderRadius: 99,
            padding: '3px 12px', marginBottom: 10,
            fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: '.5px',
            backdropFilter: 'blur(4px)',
          }}>
            <SparklesIcon size={11} />
            {eyebrow}
          </div>
        )}
        <h2 style={{
          margin: 0, fontSize: 26, fontWeight: 800, color: '#fff',
          lineHeight: 1.25, letterSpacing: '-.5px',
        }}>
          {title}
        </h2>
        <p style={{
          margin: '10px 0 20px', fontSize: 14, color: 'rgba(255,255,255,.8)',
          lineHeight: 1.6, maxWidth: 480,
        }}>
          {desc}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 22px', borderRadius: 10,
            background: '#fff', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, color: accentColor,
            boxShadow: '0 4px 14px rgba(0,0,0,.15)',
            transition: 'transform .18s, box-shadow .18s',
          }}
            onClick={() => toast.success(`${primaryBtn}操作已提交`)}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,.15)'; }}
          >
            {primaryBtn}
            <ArrowRightIcon size={13} />
          </button>
          {secondaryBtn && (
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 22px', borderRadius: 10,
              background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff',
              backdropFilter: 'blur(4px)', transition: 'background .18s',
            }}
              onClick={() => toast.info(`${secondaryBtn}操作已打开`)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.22)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.15)'; }}
            >
              {secondaryBtn}
            </button>
          )}
        </div>
      </div>

      {/* deco icon */}
      {decorIcon && (
        <div style={{
          position: 'relative', flexShrink: 0,
          color: 'rgba(255,255,255,.25)', display: 'flex',
        }}>
          {decorIcon}
        </div>
      )}
    </div>
  );
}

const GRADIENT_BANNERS: GradientBannerProps[] = [
  {
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)',
    eyebrow: '限时特惠',
    title: '会员专属年终大促，全场低至 3 折',
    desc: '首次开通年度会员立享 30 天免费试用，海量优质内容随意畅享，随时可取消，无任何隐藏费用。',
    primaryBtn: '立即开通',
    secondaryBtn: '了解更多',
    accentColor: '#6366f1',
    decorIcon: <RocketIcon size={96} strokeWidth={1} />,
  },
  {
    gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)',
    eyebrow: '新功能上线',
    title: '全新 AI 数据分析助手正式发布',
    desc: '一键生成多维度数据洞察报告，自动识别趋势与异常，让决策更快更准，效率提升 300%。',
    primaryBtn: '免费体验',
    secondaryBtn: '查看演示',
    accentColor: '#f97316',
    decorIcon: <ZapIcon size={96} strokeWidth={1} />,
  },
  {
    gradient: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
    eyebrow: '邀请好友',
    title: '推荐好友加入，双方各得 200 积分',
    desc: '专属推荐码分享给朋友，每成功邀请一人即可获得奖励积分，可兑换会员时长或现金红包。',
    primaryBtn: '获取邀请码',
    accentColor: '#0f766e',
    decorIcon: <GiftIcon size={96} strokeWidth={1} />,
  },
];

/* ─────────────────────────────────────────────────────────────
   2. 带右侧插画的欢迎横幅
───────────────────────────────────────────────────────────── */
interface WelcomeBannerProps {
  greeting: string;
  name: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  bg: string;
  accentColor: string;
  illustrationColor: string;
}

function IllustrationSvg({ color }: { color: string }) {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* monitor */}
      <rect x="20" y="18" width="96" height="62" rx="8" fill={color} opacity=".18" />
      <rect x="26" y="24" width="84" height="50" rx="5" fill={color} opacity=".25" />
      {/* screen content lines */}
      <rect x="34" y="32" width="40" height="5" rx="2.5" fill={color} opacity=".6" />
      <rect x="34" y="41" width="60" height="3.5" rx="1.75" fill={color} opacity=".35" />
      <rect x="34" y="49" width="50" height="3.5" rx="1.75" fill={color} opacity=".35" />
      {/* chart bar */}
      <rect x="34" y="58" width="8" height="10" rx="2" fill={color} opacity=".5" />
      <rect x="46" y="52" width="8" height="16" rx="2" fill={color} opacity=".65" />
      <rect x="58" y="55" width="8" height="13" rx="2" fill={color} opacity=".5" />
      <rect x="70" y="48" width="8" height="20" rx="2" fill={color} opacity=".75" />
      {/* stand */}
      <rect x="59" y="80" width="18" height="6" rx="3" fill={color} opacity=".2" />
      <rect x="64" y="80" width="8" height="14" rx="2" fill={color} opacity=".15" />
      <rect x="52" y="92" width="32" height="5" rx="2.5" fill={color} opacity=".18" />
      {/* floating star */}
      <circle cx="130" cy="28" r="10" fill={color} opacity=".12" />
      <circle cx="130" cy="28" r="5" fill={color} opacity=".25" />
      {/* small dots */}
      <circle cx="140" cy="70" r="4" fill={color} opacity=".2" />
      <circle cx="148" cy="55" r="3" fill={color} opacity=".15" />
      <circle cx="135" cy="85" r="5" fill={color} opacity=".1" />
    </svg>
  );
}

function WelcomeBanner({
  greeting,
  name,
  subtitle,
  stats,
  bg,
  accentColor,
  illustrationColor,
}: WelcomeBannerProps) {
  const { themeState } = useTheme();
  const isDark = themeState.mode === 'dark';

  return (
    <div
      data-cmp="WelcomeBanner"
      style={{
        borderRadius: 14,
        background: isDark
          ? `color-mix(in srgb, ${accentColor} 10%, var(--card))`
          : bg,
        border: `1px solid color-mix(in srgb, ${accentColor} 20%, var(--border))`,
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* left */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: accentColor,
          marginBottom: 6, letterSpacing: '.4px', textTransform: 'uppercase',
        }}>
          {greeting}
        </div>
        <h2 style={{
          margin: 0, fontSize: 22, fontWeight: 800,
          color: 'var(--foreground)', letterSpacing: '-.3px',
        }}>
          {name} 👋
        </h2>
        <p style={{
          margin: '8px 0 22px', fontSize: 13,
          color: 'var(--muted-foreground)', lineHeight: 1.6,
        }}>
          {subtitle}
        </p>
        {/* stat pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: '6px 14px', borderRadius: 99,
              background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${accentColor} 20%, transparent)`,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: accentColor }}>{s.value}</span>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* illustration */}
      <div style={{ flexShrink: 0, opacity: 0.9 }}>
        <IllustrationSvg color={illustrationColor} />
      </div>
    </div>
  );
}

const WELCOME_BANNERS: WelcomeBannerProps[] = [
  {
    greeting: '早上好，欢迎回来',
    name: '超级管理员',
    subtitle: '今天是 2025 年 1 月的最后一天。你有 3 条待处理消息、5 个待审核任务，祝工作顺利！',
    stats: [
      { label: '待处理', value: '3' },
      { label: '已完成', value: '128' },
      { label: '本月新增', value: '↑12%' },
    ],
    bg: 'linear-gradient(135deg, rgba(99,102,241,.06) 0%, rgba(139,92,246,.04) 100%)',
    accentColor: '#6366f1',
    illustrationColor: '#6366f1',
  },
  {
    greeting: '账户状态良好',
    name: '欢迎使用 AdminPro',
    subtitle: '您的系统运行稳定，今日无异常告警。数据已实时同步，最后更新于 2 分钟前。',
    stats: [
      { label: '在线用户', value: '342' },
      { label: '服务可用率', value: '99.9%' },
      { label: '响应延迟', value: '28ms' },
    ],
    bg: 'linear-gradient(135deg, rgba(20,184,166,.06) 0%, rgba(6,182,212,.04) 100%)',
    accentColor: '#0d9488',
    illustrationColor: '#0d9488',
  },
];

/* ─────────────────────────────────────────────────────────────
   3. 提示条横幅
───────────────────────────────────────────────────────────── */
interface AlertBannerProps {
  type: 'info' | 'warning' | 'success' | 'error';
  icon: React.ReactNode;
  title: string;
  desc?: string;
  action?: string;
  dismissible?: boolean;
}

const ALERT_THEME = {
  info: {
    bg: 'rgba(59,130,246,.08)',
    border: 'rgba(59,130,246,.25)',
    iconColor: '#3b82f6',
    iconBg: 'rgba(59,130,246,.12)',
    titleColor: '#1d4ed8',
    descColor: '#3b82f6',
    darkTitleColor: '#93c5fd',
    darkDescColor: '#60a5fa',
  },
  warning: {
    bg: 'rgba(234,179,8,.08)',
    border: 'rgba(234,179,8,.3)',
    iconColor: '#ca8a04',
    iconBg: 'rgba(234,179,8,.14)',
    titleColor: '#92400e',
    descColor: '#b45309',
    darkTitleColor: '#fcd34d',
    darkDescColor: '#fbbf24',
  },
  success: {
    bg: 'rgba(34,197,94,.08)',
    border: 'rgba(34,197,94,.25)',
    iconColor: '#16a34a',
    iconBg: 'rgba(34,197,94,.12)',
    titleColor: '#14532d',
    descColor: '#166534',
    darkTitleColor: '#86efac',
    darkDescColor: '#4ade80',
  },
  error: {
    bg: 'rgba(239,68,68,.08)',
    border: 'rgba(239,68,68,.25)',
    iconColor: '#dc2626',
    iconBg: 'rgba(239,68,68,.12)',
    titleColor: '#7f1d1d',
    descColor: '#991b1b',
    darkTitleColor: '#fca5a5',
    darkDescColor: '#f87171',
  },
};

function AlertBanner({
  type,
  icon,
  title,
  desc,
  action,
  dismissible = true,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { themeState } = useTheme();
  const isDark = themeState.mode === 'dark';
  const t = ALERT_THEME[type];

  return (
    <div
      data-cmp="AlertBanner"
      style={{
        borderRadius: 12,
        background: t.bg,
        border: `1px solid ${t.border}`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        opacity: dismissed ? 0 : 1,
        maxHeight: dismissed ? 0 : 200,
        overflow: 'hidden',
        transition: 'opacity .3s, max-height .35s ease',
        pointerEvents: dismissed ? 'none' : 'auto',
      }}
    >
      {/* icon */}
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: t.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t.iconColor, flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700,
          color: isDark ? t.darkTitleColor : t.titleColor,
        }}>
          {title}
        </div>
        {desc && (
          <div style={{
            fontSize: 12, marginTop: 3, lineHeight: 1.6,
            color: isDark ? t.darkDescColor : t.descColor, opacity: 0.85,
          }}>
            {desc}
          </div>
        )}
      </div>

      {/* action + dismiss */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 2 }}>
        {action && (
          <button style={{
            fontSize: 12, fontWeight: 600,
            color: t.iconColor,
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '2px 8px', borderRadius: 6,
            textDecoration: 'underline', textUnderlineOffset: 2,
          }}
            onClick={() => toast.info(`${action}操作已打开`)}
          >
            {action}
          </button>
        )}
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            style={{
              width: 22, height: 22, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: t.iconColor, opacity: 0.6,
              transition: 'opacity .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
          >
            <XIcon size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. 全宽背景图横幅
───────────────────────────────────────────────────────────── */
interface PhotoBannerProps {
  overlayGradient: string;
  tag?: string;
  title: string;
  desc: string;
  primaryBtn: string;
  secondaryBtn?: string;
  accentColor: string;
  patternId: 'circuit' | 'dots' | 'wave' | 'grid';
  bgFrom: string;
  bgTo: string;
}

function PatternSvg({ id, color }: { id: PhotoBannerProps['patternId']; color: string }) {
  if (id === 'circuit') {
    return (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="circuit-p" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M10 10 L50 10 L50 30 L30 30 L30 50" stroke={color} strokeWidth="1" fill="none" opacity=".25" />
            <circle cx="10" cy="10" r="3" fill={color} opacity=".3" />
            <circle cx="50" cy="30" r="3" fill={color} opacity=".3" />
            <circle cx="30" cy="50" r="3" fill={color} opacity=".3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-p)" />
      </svg>
    );
  }
  if (id === 'dots') {
    return (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="dots-p" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.5" fill={color} opacity=".25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-p)" />
      </svg>
    );
  }
  if (id === 'wave') {
    return (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, opacity: .18 }}>
        <defs>
          <pattern id="wave-p" x="0" y="0" width="80" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 20 Q20 0 40 20 Q60 40 80 20" stroke={color} strokeWidth="1.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wave-p)" />
      </svg>
    );
  }
  // grid
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <pattern id="grid-p" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0 L0 0 L0 32" stroke={color} strokeWidth=".8" fill="none" opacity=".2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-p)" />
    </svg>
  );
}

function PhotoBanner({
  overlayGradient,
  tag,
  title,
  desc,
  primaryBtn,
  secondaryBtn,
  accentColor,
  patternId,
  bgFrom,
  bgTo,
}: PhotoBannerProps) {
  return (
    <div
      data-cmp="PhotoBanner"
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 200,
        background: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* SVG pattern layer */}
      <PatternSvg id={patternId} color="#ffffff" />

      {/* overlay gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: overlayGradient,
        pointerEvents: 'none',
      }} />

      {/* content */}
      <div style={{ position: 'relative', padding: '40px 44px', maxWidth: 620 }}>
        {tag && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,.15)', borderRadius: 99,
            padding: '4px 13px', marginBottom: 14,
            fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '.6px',
            textTransform: 'uppercase', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,.2)',
          }}>
            <StarIcon size={11} />
            {tag}
          </div>
        )}
        <h2 style={{
          margin: 0, fontSize: 28, fontWeight: 800, color: '#fff',
          lineHeight: 1.25, letterSpacing: '-.6px',
          textShadow: '0 2px 12px rgba(0,0,0,.2)',
        }}>
          {title}
        </h2>
        <p style={{
          margin: '12px 0 24px', fontSize: 14,
          color: 'rgba(255,255,255,.82)', lineHeight: 1.65,
        }}>
          {desc}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '11px 24px', borderRadius: 10,
            background: '#fff', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, color: accentColor,
            boxShadow: '0 4px 16px rgba(0,0,0,.18)',
            transition: 'transform .18s, box-shadow .18s',
          }}
            onClick={() => toast.success(`${primaryBtn}操作已提交`)}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,.22)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,.18)'; }}
          >
            {primaryBtn}
            <ChevronRightIcon size={14} />
          </button>
          {secondaryBtn && (
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '11px 24px', borderRadius: 10,
              background: 'rgba(255,255,255,.12)',
              border: '1px solid rgba(255,255,255,.28)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff',
              backdropFilter: 'blur(6px)', transition: 'background .18s',
            }}
              onClick={() => toast.info(`${secondaryBtn}操作已打开`)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.12)'; }}
            >
              <PlayCircleIcon size={14} />
              {secondaryBtn}
            </button>
          )}
        </div>
      </div>

      {/* right deco shape */}
      <div style={{
        position: 'absolute', right: -30, top: '50%',
        transform: 'translateY(-50%)',
        width: 220, height: 220, borderRadius: '50%',
        background: 'rgba(255,255,255,.05)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 60, bottom: -40,
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(255,255,255,.04)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

const PHOTO_BANNERS: PhotoBannerProps[] = [
  {
    bgFrom: '#1e1b4b',
    bgTo: '#312e81',
    overlayGradient: 'linear-gradient(100deg, rgba(99,102,241,.45) 0%, transparent 70%)',
    patternId: 'circuit',
    tag: '科技感',
    title: '下一代数据基础设施，为你而生',
    desc: '基于分布式架构设计，支持千亿级数据实时分析，99.99% 高可用，助力企业数字化转型加速落地。',
    primaryBtn: '申请试用',
    secondaryBtn: '观看演示',
    accentColor: '#312e81',
  },
  {
    bgFrom: '#052e16',
    bgTo: '#14532d',
    overlayGradient: 'linear-gradient(100deg, rgba(21,128,61,.5) 0%, transparent 65%)',
    patternId: 'dots',
    tag: '环保主题',
    title: '绿色计算，碳中和云服务平台',
    desc: '采用 100% 可再生能源驱动，PUE 值低至 1.12，与我们一起为地球减碳，享受高性能绿色云服务。',
    primaryBtn: '了解方案',
    accentColor: '#14532d',
  },
  {
    bgFrom: '#1c1917',
    bgTo: '#44403c',
    overlayGradient: 'linear-gradient(100deg, rgba(245,158,11,.3) 0%, transparent 70%)',
    patternId: 'wave',
    tag: '创意设计',
    title: '释放创意，让你的品牌与众不同',
    desc: '专业设计工具套件上线，超过 50,000 套模板、图标与字体，一键导出多端适配资源，设计效率提升 5 倍。',
    primaryBtn: '开始设计',
    secondaryBtn: '浏览模板',
    accentColor: '#78350f',
  },
  {
    bgFrom: '#0c1445',
    bgTo: '#1e3a8a',
    overlayGradient: 'linear-gradient(100deg, rgba(37,99,235,.5) 0%, transparent 65%)',
    patternId: 'grid',
    tag: '安全合规',
    title: '企业级零信任安全防护体系',
    desc: '通过 ISO 27001 及等保三级认证，多层身份验证、全链路加密传输，守护企业核心数据资产安全。',
    primaryBtn: '查看方案',
    secondaryBtn: '联系销售',
    accentColor: '#1e3a8a',
  },
];

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function BannerPage() {
  return (
    <AdminLayout>
      <style>{`
        @keyframes banner-fade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div style={{ animation: 'banner-fade .4s ease', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>横幅模板</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            渐变营销横幅 · 欢迎插画横幅 · 提示条横幅 · 全宽背景图横幅
          </p>
        </div>

        {/* 1. 渐变背景营销横幅 */}
        <Section
          title="渐变背景营销横幅"
          desc="全渐变色背景，标题 + 描述 + 双按钮 + 装饰图标，适合活动推广与功能上新"
        >
          {GRADIENT_BANNERS.map((b, i) => (
            <GradientBanner key={i} {...b} />
          ))}
        </Section>

        {/* 2. 欢迎横幅 */}
        <Section
          title="带右侧插画的欢迎横幅"
          desc="轻量浅色底，左侧文字信息 + 数据标签，右侧 SVG 插画装饰"
        >
          {WELCOME_BANNERS.map((b, i) => (
            <WelcomeBanner key={i} {...b} />
          ))}
        </Section>

        {/* 3. 提示条横幅 */}
        <Section
          title="提示条横幅"
          desc="信息 / 警告 / 成功 / 错误四种语义色，可点击右上角关闭，支持操作按钮"
        >
          <AlertBanner
            type="info"
            icon={<InfoIcon size={17} />}
            title="系统维护通知"
            desc="平台将于本周六 02:00–04:00 进行例行维护升级，届时部分功能将暂时不可用，请提前做好数据备份。"
            action="查看详情"
          />
          <AlertBanner
            type="warning"
            icon={<AlertTriangleIcon size={17} />}
            title="存储空间即将用尽"
            desc="您的云存储空间剩余不足 10%，建议尽快清理无用文件或升级存储套餐，避免上传失败影响工作流程。"
            action="立即扩容"
          />
          <AlertBanner
            type="success"
            icon={<ShieldCheckIcon size={17} />}
            title="安全验证通过"
            desc="您的账号已完成双因素认证配置，账户安全等级已提升至最高级别。"
          />
          <AlertBanner
            type="error"
            icon={<AlertTriangleIcon size={17} />}
            title="支付接口异常"
            desc="检测到支付宝通道出现连接超时，已自动切换至备用通道，技术团队正在处理中，预计 30 分钟内恢复。"
            action="查看状态"
          />
        </Section>

        {/* 4. 全宽背景图横幅 */}
        <Section
          title="全宽背景图横幅"
          desc="深色背景 + SVG 几何纹理 + 文字叠加，适合大图展示与品牌宣传场景"
        >
          {PHOTO_BANNERS.map((b, i) => (
            <PhotoBanner key={i} {...b} />
          ))}
        </Section>

      </div>
    </AdminLayout>
  );
}
