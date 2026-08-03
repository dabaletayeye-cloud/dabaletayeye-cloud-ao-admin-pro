import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOffIcon, HomeIcon } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

export default function Page403() {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <ErrorScene
        code="403"
        title="没有访问权限"
        desc="抱歉，您没有权限访问此页面。请联系管理员获取访问授权。"
        illustration={<Illus403 />}
        onHome={() => navigate('/')}
      />
    </AdminLayout>
  );
}

/* ── shared scene layout ── */
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
        @keyframes errFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes errFloatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .err-code {
          font-size: clamp(96px, 18vw, 160px);
          font-weight: 900;
          letter-spacing: -6px;
          line-height: 1;
          background: linear-gradient(135deg, var(--theme-primary, #6366f1) 0%, var(--theme-accent, #8b5cf6) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: errFadeUp 0.5s ease both;
        }
        .err-illus {
          animation: errFadeUp 0.5s ease 0.12s both;
        }
        .err-illus-float {
          animation: errFloatY 4s ease-in-out infinite;
        }
        .err-title {
          animation: errFadeUp 0.5s ease 0.22s both;
        }
        .err-desc {
          animation: errFadeUp 0.5s ease 0.32s both;
        }
        .err-btn {
          animation: errFadeUp 0.5s ease 0.42s both;
        }
        .err-home-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 32px; border-radius: 10px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: none;
          background: var(--theme-primary, #6366f1); color: #fff;
          transition: opacity 180ms, transform 120ms;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-primary, #6366f1) 35%, transparent);
        }
        .err-home-btn:hover { opacity: 0.88; transform: translateY(-2px); }
        .err-home-btn:active { transform: scale(0.97); }
      `}</style>
      <div
        data-cmp="ErrorScene"
        style={{
          minHeight: '100%',
          background: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: 520,
            width: '100%',
          }}
        >
          {/* Status code */}
          <div className="err-code">{code}</div>

          {/* Illustration */}
          <div className="err-illus" style={{ margin: '8px 0 28px' }}>
            <div className="err-illus-float">
              {illustration}
            </div>
          </div>

          {/* Title */}
          <h2
            className="err-title"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--foreground)',
              margin: '0 0 10px',
              letterSpacing: '-0.2px',
            }}
          >
            {title}
          </h2>

          {/* Desc */}
          <p
            className="err-desc"
            style={{
              fontSize: 14,
              color: 'var(--muted-foreground)',
              lineHeight: 1.7,
              margin: '0 0 32px',
              maxWidth: 360,
            }}
          >
            {desc}
          </p>

          {/* Button */}
          <div className="err-btn">
            <button className="err-home-btn" onClick={onHome}>
              <HomeIcon size={15} />
              返回首页
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 403 SVG illustration ── */
function Illus403() {
  return (
    <svg width="180" height="148" viewBox="0 0 180 148" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground shadow */}
      <ellipse cx="90" cy="138" rx="62" ry="8" fill="var(--muted)" opacity="0.6" />
      {/* Shield body */}
      <path d="M90 18 L130 36 L130 76 C130 100 110 118 90 126 C70 118 50 100 50 76 L50 36 Z"
        fill="color-mix(in srgb, var(--theme-primary,#6366f1) 12%, var(--card))"
        stroke="color-mix(in srgb, var(--theme-primary,#6366f1) 45%, transparent)"
        strokeWidth="2.5" strokeLinejoin="round" />
      {/* Lock body */}
      <rect x="76" y="72" width="28" height="22" rx="4"
        fill="color-mix(in srgb, var(--theme-primary,#6366f1) 55%, transparent)" />
      {/* Lock shackle */}
      <path d="M80 72 L80 64 C80 57.4 100 57.4 100 64 L100 72"
        stroke="color-mix(in srgb, var(--theme-primary,#6366f1) 70%, transparent)"
        strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Keyhole */}
      <circle cx="90" cy="81" r="3.5" fill="var(--card)" />
      <rect x="88.5" y="81" width="3" height="6" rx="1.5" fill="var(--card)" />
      {/* Sparkle top-right */}
      <circle cx="136" cy="26" r="4" fill="color-mix(in srgb, var(--theme-primary,#6366f1) 40%, transparent)" />
      <circle cx="148" cy="44" r="2.5" fill="color-mix(in srgb, var(--theme-primary,#6366f1) 28%, transparent)" />
      {/* Sparkle left */}
      <circle cx="42" cy="52" r="3" fill="color-mix(in srgb, var(--theme-primary,#6366f1) 30%, transparent)" />
      <circle cx="32" cy="70" r="2" fill="color-mix(in srgb, var(--theme-primary,#6366f1) 20%, transparent)" />
      {/* X mark overlay */}
      <circle cx="124" cy="112" r="16" fill="#ef4444" />
      <path d="M118 106 L130 118 M130 106 L118 118" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
