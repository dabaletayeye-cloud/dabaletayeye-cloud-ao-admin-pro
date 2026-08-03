import React, { useState } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  CheckIcon,
  XIcon,
  SparklesIcon,
  ZapIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
} from 'lucide-react';

/* ─── types ───────────────────────────────────────────────── */
type BillingCycle = 'monthly' | 'yearly';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  desc: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: React.ReactNode;
  features: PricingFeature[];
  ctaLabel: string;
  highlighted: boolean;
  badge: string;
}

/* ─── data ────────────────────────────────────────────────── */
const PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: '基础版',
    desc: '适合个人和小型团队起步使用',
    monthlyPrice: 29,
    yearlyPrice: 19,
    icon: <ZapIcon size={22} />,
    highlighted: false,
    badge: '',
    ctaLabel: '免费试用 14 天',
    features: [
      { text: '最多 3 名成员', included: true },
      { text: '5 GB 存储空间', included: true },
      { text: '基础数据分析', included: true },
      { text: '邮件支持', included: true },
      { text: 'API 访问权限', included: false },
      { text: '自定义域名', included: false },
      { text: '高级安全控制', included: false },
      { text: '专属客户经理', included: false },
    ],
  },
  {
    id: 'pro',
    name: '专业版',
    desc: '为成长中的团队提供全面功能',
    monthlyPrice: 99,
    yearlyPrice: 69,
    icon: <SparklesIcon size={22} />,
    highlighted: true,
    badge: '推荐',
    ctaLabel: '立即升级',
    features: [
      { text: '最多 20 名成员', included: true },
      { text: '50 GB 存储空间', included: true },
      { text: '高级数据分析', included: true },
      { text: '优先邮件 + 在线支持', included: true },
      { text: 'API 访问权限', included: true },
      { text: '自定义域名', included: true },
      { text: '高级安全控制', included: false },
      { text: '专属客户经理', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: '旗舰版',
    desc: '面向大型企业的完整解决方案',
    monthlyPrice: 299,
    yearlyPrice: 199,
    icon: <ShieldCheckIcon size={22} />,
    highlighted: false,
    badge: '',
    ctaLabel: '联系销售',
    features: [
      { text: '无限成员', included: true },
      { text: '无限存储空间', included: true },
      { text: '全量数据分析 + 导出', included: true },
      { text: '7×24 专线支持', included: true },
      { text: 'API 访问权限', included: true },
      { text: '自定义域名', included: true },
      { text: '高级安全控制', included: true },
      { text: '专属客户经理', included: true },
    ],
  },
];

/* ─── helper ──────────────────────────────────────────────── */
function fmtPrice(n: number): string {
  return n.toLocaleString('zh-CN');
}

/* ─── FeatureRow ──────────────────────────────────────────── */
function FeatureRow({
  feature,
  accentHex,
  highlighted,
}: {
  feature: PricingFeature;
  accentHex: string;
  highlighted: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '7px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: feature.included
          ? (highlighted ? accentHex + '22' : 'rgba(34,197,94,.12)')
          : 'var(--muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {feature.included
          ? <CheckIcon size={11} style={{ color: highlighted ? accentHex : '#22c55e' }} />
          : <XIcon size={10} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
        }
      </div>
      <span style={{
        fontSize: 13,
        color: feature.included ? 'var(--foreground)' : 'var(--muted-foreground)',
        opacity: feature.included ? 1 : 0.55,
        textDecoration: feature.included ? 'none' : 'none',
      }}>
        {feature.text}
      </span>
    </div>
  );
}

/* ─── PricingCard ─────────────────────────────────────────── */
function PricingCard({
  plan,
  billing,
  accentHex,
  isDark,
  animIdx,
}: {
  plan: PricingPlan;
  billing: BillingCycle;
  accentHex: string;
  isDark: boolean;
  animIdx: number;
}) {
  const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const h = plan.highlighted;

  return (
    <div
      data-cmp="PricingCard"
      style={{
        flex: '1 1 0',
        minWidth: 260,
        maxWidth: 360,
        borderRadius: 18,
        border: h ? `2px solid ${accentHex}` : '1.5px solid var(--border)',
        background: h
          ? (isDark
            ? `linear-gradient(160deg, ${accentHex}18 0%, var(--card) 55%)`
            : `linear-gradient(160deg, ${accentHex}0d 0%, var(--card) 55%)`)
          : 'var(--card)',
        boxShadow: h
          ? `0 8px 40px ${accentHex}33, 0 2px 10px rgba(0,0,0,.06)`
          : 'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,10px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.06))',
        transform: h ? 'scale(1.045)' : 'scale(1)',
        transformOrigin: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 26px 26px',
        transition: 'box-shadow .2s, transform .2s',
        animation: `pricing-rise .35s ${animIdx * 0.07}s both ease`,
        zIndex: h ? 2 : 1,
      }}
    >
      {/* badge */}
      {plan.badge && (
        <div style={{
          position: 'absolute',
          top: -13,
          left: '50%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(90deg, ${accentHex}, ${accentHex}cc)`,
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 14px',
          borderRadius: 20,
          letterSpacing: 1,
          boxShadow: `0 2px 10px ${accentHex}55`,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <StarIcon size={10} />
          {plan.badge}
        </div>
      )}

      {/* icon + title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        marginBottom: 10,
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: h ? accentHex + '22' : 'var(--muted)',
          color: h ? accentHex : 'var(--muted-foreground)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {plan.icon}
        </div>
        <div>
          <div style={{
            fontSize: 17,
            fontWeight: 800,
            color: h ? accentHex : 'var(--foreground)',
            letterSpacing: -.3,
          }}>
            {plan.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 1 }}>
            {plan.desc}
          </div>
        </div>
      </div>

      {/* price */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 3,
        padding: '14px 0 16px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        marginBottom: 18,
      }}>
        <span style={{
          fontSize: 13,
          color: 'var(--muted-foreground)',
          marginBottom: 6,
          fontWeight: 500,
        }}>¥</span>
        <span style={{
          fontSize: 46,
          fontWeight: 900,
          color: h ? accentHex : 'var(--foreground)',
          lineHeight: 1,
          letterSpacing: -2,
          transition: 'all .3s cubic-bezier(.34,1.3,.64,1)',
          animation: 'price-pop .28s ease',
        }}>
          {fmtPrice(price)}
        </span>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 4,
          gap: 1,
        }}>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 500 }}>/ 月</span>
          {billing === 'yearly' && (
            <span style={{
              fontSize: 10,
              color: '#22c55e',
              fontWeight: 600,
              background: 'rgba(34,197,94,.1)',
              borderRadius: 4,
              padding: '1px 5px',
              whiteSpace: 'nowrap',
            }}>
              省 {fmtPrice((plan.monthlyPrice - plan.yearlyPrice) * 12)} 元/年
            </span>
          )}
        </div>
      </div>

      {/* features */}
      <div style={{ flex: 1, marginBottom: 20 }}>
        {plan.features.map((f, i) => (
          <FeatureRow key={i} feature={f} accentHex={accentHex} highlighted={h} />
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => toast.success(`${plan.name} 方案选择已提交`)}
        style={{
          width: '100%',
          padding: '12px 0',
          borderRadius: 12,
          border: h ? 'none' : `1.5px solid ${accentHex}66`,
          background: h
            ? `linear-gradient(135deg, ${accentHex} 0%, ${accentHex}cc 100%)`
            : 'transparent',
          color: h ? '#fff' : accentHex,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          transition: 'all .18s',
          boxShadow: h ? `0 4px 18px ${accentHex}44` : 'none',
          letterSpacing: .2,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          if (h) {
            el.style.opacity = '0.88';
            el.style.transform = 'translateY(-1px)';
            el.style.boxShadow = `0 7px 24px ${accentHex}55`;
          } else {
            el.style.background = accentHex + '12';
          }
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = h ? `0 4px 18px ${accentHex}44` : 'none';
          el.style.background = h
            ? `linear-gradient(135deg, ${accentHex} 0%, ${accentHex}cc 100%)`
            : 'transparent';
        }}
      >
        {plan.ctaLabel}
        <ArrowRightIcon size={15} />
      </button>
    </div>
  );
}

/* ─── BillingToggle ───────────────────────────────────────── */
function BillingToggle({
  value,
  onChange,
  accentHex,
}: {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
  accentHex: string;
}) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: 'var(--muted)',
      borderRadius: 50,
      padding: 4,
      gap: 2,
      position: 'relative',
    }}>
      {(['monthly', 'yearly'] as BillingCycle[]).map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '8px 22px',
            borderRadius: 50,
            border: 'none',
            background: value === opt
              ? `linear-gradient(135deg, ${accentHex}, ${accentHex}cc)`
              : 'transparent',
            color: value === opt ? '#fff' : 'var(--muted-foreground)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all .2s',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: value === opt ? `0 2px 10px ${accentHex}44` : 'none',
          }}
        >
          {opt === 'monthly' ? '月付' : '年付'}
          {opt === 'yearly' && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              background: value === 'yearly' ? 'rgba(255,255,255,.22)' : 'rgba(34,197,94,.15)',
              color: value === 'yearly' ? '#fff' : '#22c55e',
              padding: '1px 6px',
              borderRadius: 10,
            }}>
              省 30%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── PricingPage ─────────────────────────────────────────── */
export default function PricingPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const isDark = themeState.mode === 'dark';
  const accentHex = isManga ? '#E91E8C' : '#6366f1';

  const [billing, setBilling] = useState<BillingCycle>('monthly');

  return (
    <AdminLayout>
      <style>{`
        @keyframes pricing-rise {
          from { opacity: 0; transform: translateY(22px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes price-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes header-fade {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div data-cmp="PricingPage" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── page header ── */}
        <div style={{ animation: 'header-fade .3s ease' }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>
            定价模板
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            三档定价卡片 · 月付/年付切换 · 功能对比清单
          </p>
        </div>

        {/* ── hero section ── */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: accentHex + '14',
            color: accentHex,
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 14px',
            borderRadius: 20,
            letterSpacing: .5,
            border: `1px solid ${accentHex}30`,
          }}>
            <SparklesIcon size={12} />
            透明定价，按需选择
          </div>

          <h2 style={{
            margin: 0,
            fontSize: 34,
            fontWeight: 900,
            color: 'var(--foreground)',
            letterSpacing: -1,
            lineHeight: 1.2,
          }}>
            选择适合你的
            <span style={{
              background: `linear-gradient(90deg, ${accentHex}, ${accentHex}88)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}> 方案</span>
          </h2>

          <p style={{
            margin: 0,
            fontSize: 15,
            color: 'var(--muted-foreground)',
            maxWidth: 460,
            lineHeight: 1.7,
          }}>
            所有方案均含 14 天免费试用，无需信用卡，随时可以取消订阅。
          </p>

          {/* billing toggle */}
          <div style={{ marginTop: 8 }}>
            <BillingToggle value={billing} onChange={setBilling} accentHex={accentHex} />
          </div>

          {billing === 'yearly' && (
            <div style={{
              fontSize: 12,
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              animation: 'header-fade .2s ease',
            }}>
              <CheckIcon size={13} />
              年付最高可节省 <strong>30%</strong>，已帮您自动计算折后价格
            </div>
          )}
        </div>

        {/* ── cards row ── */}
        <div style={{
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 4px 30px',
          flexWrap: 'wrap',
        }}>
          {PLANS.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billing={billing}
              accentHex={accentHex}
              isDark={isDark}
              animIdx={i}
            />
          ))}
        </div>

        {/* ── bottom note ── */}
        <div style={{
          textAlign: 'center',
          paddingBottom: 24,
          fontSize: 12,
          color: 'var(--muted-foreground)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}>
          <ShieldCheckIcon size={13} style={{ color: accentHex, opacity: .7 }} />
          所有价格均含增值税 · SSL 加密保护 · 数据随时可导出 · 无隐藏费用
        </div>
      </div>
    </AdminLayout>
  );
}
