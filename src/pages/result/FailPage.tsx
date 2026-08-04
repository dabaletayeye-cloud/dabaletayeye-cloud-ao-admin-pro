import React from 'react';
import { toast } from '../../lib/localizedToast';
import { useNavigate } from 'react-router-dom';
import { XIcon, ArrowLeftIcon, RefreshCwIcon } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

export default function FailPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <style>{`
        @keyframes failScaleIn {
          0%   { opacity: 0; transform: scale(0.4); }
          65%  { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes failFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fail-icon-wrap {
          animation: failScaleIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .fail-title {
          animation: failFadeUp 0.4s ease 0.3s both;
        }
        .fail-desc {
          animation: failFadeUp 0.4s ease 0.42s both;
        }
        .fail-info-bar {
          animation: failFadeUp 0.4s ease 0.52s both;
        }
        .fail-actions {
          animation: failFadeUp 0.4s ease 0.62s both;
        }
        .fail-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 28px; border-radius: 9px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: none;
          background: var(--theme-primary, #6366f1); color: #fff;
          transition: opacity 180ms, transform 120ms;
        }
        .fail-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .fail-btn-primary:active { transform: scale(0.97); }
        .fail-btn-secondary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 9px; font-size: 14px; font-weight: 500;
          cursor: pointer;
          background: var(--secondary); color: var(--secondary-foreground);
          border: 1px solid var(--border);
          transition: background 180ms, transform 120ms;
        }
        .fail-btn-secondary:hover { background: var(--accent); transform: translateY(-1px); }
        .fail-btn-secondary:active { transform: scale(0.97); }
        .fail-theme-link {
          color: var(--theme-primary, #6366f1);
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 150ms;
        }
        .fail-theme-link:hover { opacity: 0.72; text-decoration: underline; }
      `}</style>

      <div
        data-cmp="FailPage"
        style={{
          minHeight: '100%',
          background: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        {/* Card */}
        <div
          style={{
            width: '100%',
            maxWidth: 520,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            padding: '52px 48px 44px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: 'var(--shadow-x, 0px) var(--shadow-y, 4px) var(--shadow-blur, 16px) var(--shadow-spread, 0px) var(--shadow-color, rgba(0,0,0,.08))',
          }}
        >
          {/* Red X icon */}
          <div
            className="fail-icon-wrap"
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 28,
              boxShadow: '0 8px 28px rgba(220,38,38,.30)',
            }}
          >
            <XIcon size={46} color="#fff" strokeWidth={3} />
          </div>

          {/* Title */}
          <h1
            className="fail-title"
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--foreground)',
              margin: '0 0 10px',
              letterSpacing: '-0.3px',
            }}
          >
            提交失败
          </h1>

          {/* Description */}
          <p
            className="fail-desc"
            style={{
              fontSize: 15,
              color: 'var(--muted-foreground)',
              margin: '0 0 24px',
              lineHeight: 1.65,
              maxWidth: 340,
            }}
          >
            您的申请未能成功提交，请检查以下问题并完成处理后重新提交。
          </p>

          {/* Info bar — failure reasons */}
          <div
            className="fail-info-bar"
            style={{
              width: '100%',
              background: 'color-mix(in srgb, #ef4444 8%, var(--card))',
              border: '1px solid color-mix(in srgb, #ef4444 22%, transparent)',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 32,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              textAlign: 'left',
            }}
          >
            {/* Reason 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'color-mix(in srgb, #ef4444 18%, var(--card))',
                  border: '1.5px solid #ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', lineHeight: 1 }}>1</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--foreground)', lineHeight: 1.6 }}>
                您的账户已被冻结
                （<a className="fail-theme-link" onClick={() => toast.info('已打开解冻申请')}>立即解冻</a>）
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'color-mix(in srgb, #ef4444 15%, transparent)' }} />

            {/* Reason 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'color-mix(in srgb, #ef4444 18%, var(--card))',
                  border: '1.5px solid #ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', lineHeight: 1 }}>2</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--foreground)', lineHeight: 1.6 }}>
                您的账户还不具备申请资格
                （<a className="fail-theme-link" onClick={() => toast.info('已打开升级申请')}>立即升级</a>）
              </span>
            </div>
          </div>

          {/* Actions */}
          <div
            className="fail-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              className="fail-btn-primary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon size={15} />
              返回修改
            </button>
            <button
              className="fail-btn-secondary"
              onClick={() => toast.success('已重新提交申请')}
            >
              <RefreshCwIcon size={15} />
              重新提交
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
