import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

export default function Page404() {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <ErrorScene
        code="404"
        title="页面不存在"
        desc="您访问的页面已被删除、移动或从未存在过，请检查链接是否正确。"
        illustration={<Illus404 />}
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
        @keyframes errFadeUp404 {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes errFloatY404 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .err404-code {
          font-size: clamp(96px, 18vw, 160px);
          font-weight: 900;
          letter-spacing: -6px;
          line-height: 1;
          background: linear-gradient(135deg, var(--theme-primary, #6366f1) 0%, var(--theme-accent, #8b5cf6) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: errFadeUp404 0.5s ease both;
        }
        .err404-illus { animation: errFadeUp404 0.5s ease 0.12s both; }
        .err404-float { animation: errFloatY404 4s ease-in-out infinite; }
        .err404-title { animation: errFadeUp404 0.5s ease 0.22s both; }
        .err404-desc  { animation: errFadeUp404 0.5s ease 0.32s both; }
        .err404-btn   { animation: errFadeUp404 0.5s ease 0.42s both; }
        .err404-home-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 32px; border-radius: 10px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: none;
          background: var(--theme-primary, #6366f1); color: #fff;
          transition: opacity 180ms, transform 120ms;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-primary, #6366f1) 35%, transparent);
        }
        .err404-home-btn:hover { opacity: 0.88; transform: translateY(-2px); }
        .err404-home-btn:active { transform: scale(0.97); }
      `}</style>
      <div
        data-cmp="ErrorScene404"
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
          <div className="err404-code">{code}</div>
          <div className="err404-illus" style={{ margin: '8px 0 28px' }}>
            <div className="err404-float">{illustration}</div>
          </div>
          <h2 className="err404-title" style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)', margin: '0 0 10px', letterSpacing: '-0.2px' }}>
            {title}
          </h2>
          <p className="err404-desc" style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 360 }}>
            {desc}
          </p>
          <div className="err404-btn">
            <button className="err404-home-btn" onClick={onHome}>
              <HomeIcon size={15} />
              返回首页
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Illus404() {
  return (
    <svg width="200" height="152" viewBox="0 0 200 152" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground shadow */}
      <ellipse cx="100" cy="142" rx="72" ry="8" fill="var(--muted)" opacity="0.6" />
      {/* Telescope base */}
      <rect x="88" y="108" width="24" height="8" rx="3"
        fill="color-mix(in srgb, var(--theme-primary,#6366f1) 30%, var(--muted))" />
      <rect x="94" y="90" width="12" height="20" rx="2"
        fill="color-mix(in srgb, var(--theme-primary,#6366f1) 25%, var(--muted))" />
      {/* Telescope tube */}
      <rect x="52" y="68" width="86" height="22" rx="11"
        fill="color-mix(in srgb, var(--theme-primary,#6366f1) 20%, var(--card))"
        stroke="color-mix(in srgb, var(--theme-primary,#6366f1) 50%, transparent)"
        strokeWidth="2" />
      {/* Tube detail rings */}
      <line x1="90" y1="68" x2="90" y2="90" stroke="color-mix(in srgb, var(--theme-primary,#6366f1) 35%, transparent)" strokeWidth="1.5" />
      <line x1="110" y1="68" x2="110" y2="90" stroke="color-mix(in srgb, var(--theme-primary,#6366f1) 35%, transparent)" strokeWidth="1.5" />
      {/* Eyepiece */}
      <rect x="130" y="72" width="22" height="14" rx="4"
        fill="color-mix(in srgb, var(--theme-primary,#6366f1) 40%, transparent)" />
      {/* Stars scattered */}
      <circle cx="34" cy="28" r="3" fill="color-mix(in srgb, var(--theme-primary,#6366f1) 50%, transparent)" />
      <circle cx="160" cy="18" r="4" fill="color-mix(in srgb, var(--theme-primary,#6366f1) 40%, transparent)" />
      <circle cx="174" cy="42" r="2.5" fill="color-mix(in srgb, var(--theme-primary,#6366f1) 30%, transparent)" />
      <circle cx="22" cy="56" r="2" fill="color-mix(in srgb, var(--theme-primary,#6366f1) 25%, transparent)" />
      <circle cx="148" cy="54" r="2" fill="color-mix(in srgb, var(--theme-primary,#6366f1) 25%, transparent)" />
      {/* Target / question circle */}
      <circle cx="36" cy="46" r="20"
        fill="none"
        stroke="color-mix(in srgb, var(--theme-primary,#6366f1) 22%, transparent)"
        strokeWidth="2" strokeDasharray="4 3" />
      <circle cx="36" cy="46" r="12"
        fill="none"
        stroke="color-mix(in srgb, var(--theme-primary,#6366f1) 35%, transparent)"
        strokeWidth="2" />
      <circle cx="36" cy="46" r="5"
        fill="color-mix(in srgb, var(--theme-primary,#6366f1) 25%, transparent)" />
      {/* Question mark */}
      <text x="28" y="52" fontSize="18" fontWeight="800"
        fill="color-mix(in srgb, var(--theme-primary,#6366f1) 60%, transparent)"
        fontFamily="system-ui, sans-serif">?</text>
    </svg>
  );
}
