import { useState } from 'react';
import { toast } from '../lib/localizedToast';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import AdminLayout from '../components/AdminLayout';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  EyeIcon,
  PrinterIcon,
  RefreshCwIcon,
  FileTextIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ width: 140, flexShrink: 0, fontSize: 13, color: 'var(--muted-foreground)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function ActionBtn({
  label,
  icon,
  onClick,
  variant = 'outline',
  primary,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  primary: string;
}) {
  const [hovered, setHovered] = useState(false);
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  return (
    <button
      onClick={onClick ?? (() => {})}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 20px', height: 40, borderRadius: 8,
        border: isPrimary ? 'none' : isOutline ? `1.5px solid ${primary}` : '1.5px solid var(--border)',
        background: isPrimary
          ? primary
          : hovered
            ? isOutline ? `color-mix(in srgb, ${primary} 8%, transparent)` : 'var(--accent)'
            : 'transparent',
        color: isPrimary ? '#fff' : isOutline ? primary : 'var(--foreground)',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        transition: 'background 0.18s, color 0.18s',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Success Card ────────────────────────────────────────────────────────────

function SuccessCard({ primary }: { primary: string }) {
  const navigate = useNavigate();
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '48px 40px 40px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      {/* Icon */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'color-mix(in srgb, #22c55e 12%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircleIcon size={52} style={{ color: '#22c55e' }} />
        </div>
        <div style={{
          position: 'absolute', inset: -6, borderRadius: '50%',
          border: '2px solid color-mix(in srgb, #22c55e 20%, transparent)',
        }} />
      </div>

      {/* Title & desc */}
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', margin: '0 0 8px' }}>提交成功</h2>
      <p style={{ fontSize: 14, color: 'var(--muted-foreground)', margin: '0 0 32px', textAlign: 'center', maxWidth: 340 }}>
        您的申请已成功提交，预计 <strong style={{ color: '#22c55e' }}>1–3 个工作日</strong>内完成审核，结果将通过邮件通知您。
      </p>

      {/* Info area */}
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'var(--muted)',
        borderRadius: 10, padding: '4px 20px 4px',
        marginBottom: 32,
      }}>
        <InfoRow label="订单编号" value="ORD-20240601-00892" />
        <InfoRow label="提交时间" value="2024-06-01  14:32:08" />
        <InfoRow label="申请类型" value="企业账号认证" />
        <InfoRow label="受理部门" value="商务合规中心" />
        <InfoRow label="预计完成" value="2024-06-04  18:00 前" />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ActionBtn
          label="返回修改" icon={<ArrowLeftIcon size={15} />}
          onClick={() => navigate(-1)}
          variant="ghost" primary={primary}
        />
        <ActionBtn
          label="查看详情" icon={<EyeIcon size={15} />}
          onClick={() => toast.info('详情功能已打开')}
          variant="outline" primary={primary}
        />
        <ActionBtn
          label="打印凭证" icon={<PrinterIcon size={15} />}
          onClick={() => window.print()}
          variant="primary" primary={primary}
        />
      </div>
    </div>
  );
}

// ─── Failure Card ────────────────────────────────────────────────────────────

function FailureCard({ primary }: { primary: string }) {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleResubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '48px 40px 40px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      {/* Icon */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'color-mix(in srgb, #ef4444 12%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <XCircleIcon size={52} style={{ color: '#ef4444' }} />
        </div>
        <div style={{
          position: 'absolute', inset: -6, borderRadius: '50%',
          border: '2px solid color-mix(in srgb, #ef4444 20%, transparent)',
        }} />
      </div>

      {/* Title & desc */}
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', margin: '0 0 8px' }}>提交失败</h2>
      <p style={{ fontSize: 14, color: 'var(--muted-foreground)', margin: '0 0 6px', textAlign: 'center', maxWidth: 360 }}>
        很抱歉，您的申请未能成功提交，请根据以下原因进行修正后重新提交。
      </p>

      {/* Reason banner */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        background: 'color-mix(in srgb, #ef4444 8%, var(--background))',
        border: '1px solid color-mix(in srgb, #ef4444 28%, transparent)',
        borderRadius: 8, padding: '10px 16px',
        marginBottom: 28, maxWidth: 440, width: '100%',
      }}>
        <XCircleIcon size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>失败原因</div>
          <div style={{ fontSize: 12, color: 'var(--foreground)', lineHeight: 1.6 }}>
            上传的营业执照文件格式不支持（仅支持 JPG / PNG / PDF），且文件大小超过限制（最大 5MB）。请重新上传后提交。
          </div>
        </div>
      </div>

      {/* Info area */}
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'var(--muted)',
        borderRadius: 10, padding: '4px 20px 4px',
        marginBottom: 32,
      }}>
        <InfoRow label="失败编号" value="ERR-20240601-00302" />
        <InfoRow label="发生时间" value="2024-06-01  14:31:55" />
        <InfoRow label="申请类型" value="企业账号认证" />
        <InfoRow label="错误代码" value="UPLOAD_FORMAT_INVALID" />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ActionBtn
          label="返回修改" icon={<ArrowLeftIcon size={15} />}
          onClick={() => navigate(-1)}
          variant="outline" primary={primary}
        />
        <ActionBtn
          label={submitted ? '已重新提交…' : '重新提交'}
          icon={<RefreshCwIcon size={15} />}
          onClick={handleResubmit}
          variant="primary" primary={primary}
        />
      </div>
    </div>
  );
}

// ─── ResultPage ──────────────────────────────────────────────────────────────

export default function ResultPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  return (
    <AdminLayout>
      <div data-cmp="ResultPage" style={{ padding: '28px 28px 40px', minHeight: '100%' }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <FileTextIcon size={18} style={{ color: primary }} />
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>结果页面</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>
            展示提交成功与提交失败的结果页面样式
          </p>
        </div>

        {/* Two cards side by side */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px', minWidth: 360 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 2 }}>
              ✅ 成功页
            </div>
            <SuccessCard primary={primary} />
          </div>
          <div style={{ flex: '1 1 400px', minWidth: 360 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 2 }}>
              ❌ 失败页
            </div>
            <FailureCard primary={primary} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
