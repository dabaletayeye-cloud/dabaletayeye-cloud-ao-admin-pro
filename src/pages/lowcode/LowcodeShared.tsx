import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { XIcon } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/AdminLayout';
import './lowcode.css';

export type LowcodeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
  danger?: boolean;
  children: ReactNode;
};

export function LowcodeButton({ primary, danger, className = '', children, ...props }: LowcodeButtonProps) {
  return <button type="button" className={`lc-btn${primary ? ' primary' : ''}${danger ? ' danger' : ''} ${className}`} {...props}>{children}</button>;
}

export function PageShell({ title, description, actions, children }: { title: string; description: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <AdminLayout>
      <div className="lowcode-page">
        <div className="lc-page-heading">
          <div><h1>{title}</h1><p>{description}</p></div>
          {actions && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{actions}</div>}
        </div>
        {children}
      </div>
    </AdminLayout>
  );
}

export function Modal({ title, open, onClose, children, footer, wide = false }: { title: string; open: boolean; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="lc-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`lc-modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={event => event.stopPropagation()}>
        <div className="lc-modal-header"><span>{title}</span><button type="button" className="lc-icon-btn" onClick={onClose} aria-label="关闭"><XIcon size={16} /></button></div>
        <div className="lc-modal-content">{children}</div>
        {footer && <div className="lc-modal-footer">{footer}</div>}
      </section>
    </div>
  );
}

export function confirmToast(message: string) { toast.success(message); }
export function warningToast(message: string) { toast.warning(message); }
export function errorToast(message: string) { toast.error(message); }

export function formatTime(date = new Date()) {
  return date.toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
}
