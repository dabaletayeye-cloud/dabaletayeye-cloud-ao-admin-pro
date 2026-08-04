import React from 'react';
import { toast } from '../../lib/localizedToast';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, PrinterIcon, EyeIcon, ArrowLeftIcon } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <style>{`
        @keyframes successScaleIn {
          0%   { opacity: 0; transform: scale(0.4); }
          65%  { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes successFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .success-icon-wrap {
          animation: successScaleIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .success-title {
          animation: successFadeUp 0.4s ease 0.3s both;
        }
        .success-desc {
          animation: successFadeUp 0.4s ease 0.42s both;
        }
        .success-info-bar {
          animation: successFadeUp 0.4s ease 0.52s both;
        }
        .success-actions {
          animation: successFadeUp 0.4s ease 0.62s both;
        }
        .success-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 28px; border-radius: 9px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: none;
          background: var(--theme-primary, #6366f1); color: #fff;
          transition: opacity 180ms, transform 120ms;
        }
        .success-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .success-btn-primary:active { transform: scale(0.97); }
        .success-btn-secondary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 9px; font-size: 14px; font-weight: 500;
          cursor: pointer;
          background: var(--secondary); color: var(--secondary-foreground);
          border: 1px solid var(--border);
          transition: background 180ms, transform 120ms;
        }
        .success-btn-secondary:hover { background: var(--accent); transform: translateY(-1px); }
        .success-btn-secondary:active { transform: scale(0.97); }
      `}</style>

      <div
        data-cmp="SuccessPage"
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
          {/* Green check icon */}
          <div
            className="success-icon-wrap"
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 28,
              boxShadow: '0 8px 28px rgba(34,197,94,.32)',
            }}
          >
            <CheckIcon size={44} color="#fff" strokeWidth={3} />
          </div>

          {/* Title */}
          <h1
            className="success-title"
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--foreground)',
              margin: '0 0 10px',
              letterSpacing: '-0.3px',
            }}
          >
            提交成功
          </h1>

          {/* Description */}
          <p
            className="success-desc"
            style={{
              fontSize: 15,
              color: 'var(--muted-foreground)',
              margin: '0 0 24px',
              lineHeight: 1.65,
              maxWidth: 340,
            }}
          >
            您的申请已成功提交，我们将在 1-3 个工作日内完成审核，审核结果将通过站内信通知您。
          </p>

          {/* Info bar */}
          <div
            className="success-info-bar"
            style={{
              width: '100%',
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '12px 18px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: 'var(--foreground)',
                lineHeight: 1.5,
                textAlign: 'left',
              }}
            >
              已提交申请，等待部门审核。
            </span>
          </div>

          {/* Actions */}
          <div
            className="success-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              className="success-btn-primary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon size={15} />
              返回修改
            </button>
            <button
              className="success-btn-secondary"
              onClick={() => toast.info('详情功能已打开')}
            >
              <EyeIcon size={15} />
              查看
            </button>
            <button
              className="success-btn-secondary"
              onClick={() => window.print()}
            >
              <PrinterIcon size={15} />
              打印
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
