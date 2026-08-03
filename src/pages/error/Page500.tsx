import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

export default function Page500() {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <ErrorScene
        code="500"
        title="服务器开小差了"
        desc="服务器遇到了一些问题，我们正在紧急修复。请稍后再试，或联系技术支持。"
        illustration={<Illus500 />}
        onHome={() => navigate('/')}
      />
    </AdminLayout>
  );
}

function ErrorScene({
  code,
  title,
  desc,
  illustration,
  onHome,
}: {
  code: string;
  title: string;
  desc: string;
  illustration: React.ReactNode;
  onHome: () => void;
}) {
  return (
    <>
      <style>{`
        @keyframes errFadeUp500 {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes errFloatY500 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes errWobble {
          0%, 100% { transform: rotate(0deg); }
          20%       { transform: rotate(-6deg); }
          40%       { transform: rotate(5deg); }
          60%       { transform: rotate(-4deg); }
          80%       { transform: rotate(3deg); }
        }
        .err500-code {
          font-size: clamp(96px, 18vw, 160px);
          font-weight: 900;
          letter-spacing: -6px;
          line-height: 1;
          background: linear-gradient(135deg, var(--theme-primary, #6366f1) 0%, var(--theme-accent, #8b5cf6) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: errFadeUp500 0.5s ease both;
        }
        .err500-illus { animation: errFadeUp500 0.5s ease 0.12s both; }
        .err500-float { animation: errFloatY500 4s ease-in-out infinite; }
        .err500-gear  { animation: errWobble 2.4s ease-in-out infinite; transform-origin: center; }
        .err500-title { animation: errFadeUp500 0.5s ease 0.22s both; }
        .err500-desc  { animation: errFadeUp500 0.5s ease 0.32s both; }
        .err500-btn   { animation: errFadeUp500 0.5s ease 0.42s both; }
        .err500-home-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 32px; border-radius: 10px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: none;
          background: var(--theme-primary, #6366f1); color: #fff;
          transition: opacity 180ms, transform 120ms;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-primary, #6366f1) 35%, transparent);
        }
        .err500-home-btn:hover { opacity: 0.88; transform: translateY(-2px); }
        .err500-home-btn:active { transform: scale(0.97); }
      `}</style>
      <div
        data-cmp="ErrorScene500"
        style={{
          minHeight: '100%',
          background: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 520, width: '100%' }}>
          <div className="err500-code">{code}</div>
          <div className="err500-illus" style={{ margin: '8px 0 28px' }}>
            <div className="err500-float">{illustration}</div>
          </div>
          <h2 className="err500-title" style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)', margin: '0 0 10px', letterSpacing: '-0.2px' }}>
            {title}
          </h2>
          <p className="err500-desc" style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 360 }}>
            {desc}
          </p>
          <div className="err500-btn">
            <button className="err500-home-btn" onClick={onHome}>
              <HomeIcon size={15} />
              返回首页
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Illus500() {
  return (
    <svg width="196" height="156" viewBox="0 0 196 156" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground shadow */}
      <ellipse cx="98" cy="146" rx="68" ry="8" fill="var(--muted)" opacity="0.6" />
      {/* Server rack */}
      <rect x="54" y="54" width="88" height="78" rx="8"
        fill="color-mix(in srgb, var(--theme-primary,#6366f1) 10%, var(--card))"
        stroke="color-mix(in srgb, var(--theme-primary,#6366f1) 35%, transparent)"
        strokeWidth="2" />
      {/* Server row 1 */}
      <rect x="64" y="64" width="68" height="16" rx="4"
        fill="color-mix(in srgb, var(--theme-primary,#6366f1) 18%, var(--muted))" />
      <circle cx="120" cy="72" r="4" fill="#22c55e" />
      <circle cx="108" cy="72" r="3" fill="color-mix(in srgb, var(--theme-primary,#6366f1) 45%, transparent)" />
      {/* Server row 2 — error state */}
      <rect x="64" y="86" width="68" height="16" rx="4"
        fill="color-mix(in srgb, #ef4444 12%, var(--muted))"
        stroke="color-mix(in srgb, #ef4444 30%, transparent)" strokeWidth="1" />
      <circle cx="120" cy="94" r="4" fill="#ef4444" />
      {/* Blinking dot animation */}
      <circle cx="108" cy="94" r="3" fill="color-mix(in srgb, #ef4444 50%, transparent)" />
      {/* Warning text lines */}
      <rect x="70" y="91" width="28" height="3" rx="1.5"
        fill="color-mix(in srgb, #ef4444 40%, transparent)" />
      {/* Server row 3 */}
      <rect x="64" y="108" width="68" height="14" rx="4"
        fill="color-mix(in srgb, var(--theme-primary,#6366f1) 14%, var(--muted))" />
      <circle cx="120" cy="115" r="3.5" fill="#f59e0b" />
      {/* Gear wobble (top right) */}
      <g className="err500-gear" style={{ transformOrigin: '154px 38px' }}>
        <circle cx="154" cy="38" r="14"
          fill="color-mix(in srgb, var(--theme-primary,#6366f1) 15%, var(--card))"
          stroke="color-mix(in srgb, var(--theme-primary,#6366f1) 50%, transparent)"
          strokeWidth="2.5" />
        <circle cx="154" cy="38" r="6"
          fill="color-mix(in srgb, var(--theme-primary,#6366f1) 22%, var(--muted))" />
        {/* Gear teeth */}
        <rect x="151" y="20" width="6" height="7" rx="2"
          fill="color-mix(in srgb, var(--theme-primary,#6366f1) 45%, transparent)" />
        <rect x="151" y="49" width="6" height="7" rx="2"
          fill="color-mix(in srgb, var(--theme-primary,#6366f1) 45%, transparent)" />
        <rect x="136" y="35" width="7" height="6" rx="2"
          fill="color-mix(in srgb, var(--theme-primary,#6366f1) 45%, transparent)" />
        <rect x="165" y="35" width="7" height="6" rx="2"
          fill="color-mix(in srgb, var(--theme-primary,#6366f1) 45%, transparent)" />
      </g>
      {/* Small smoke puffs */}
      <circle cx="92" cy="44" r="8"
        fill="color-mix(in srgb, var(--muted-foreground) 18%, transparent)" />
      <circle cx="104" cy="36" r="10"
        fill="color-mix(in srgb, var(--muted-foreground) 14%, transparent)" />
      <circle cx="116" cy="42" r="7"
        fill="color-mix(in srgb, var(--muted-foreground) 12%, transparent)" />
      {/* Error badge */}
      <circle cx="54" cy="54" r="14" fill="#ef4444" />
      <path d="M48 48 L60 60 M60 48 L48 60" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
