import type { ReactNode } from 'react';
import { PageShell } from '../lowcode/LowcodeShared';
import './ai.css';

export function AiPageShell({ title, description, actions, children }: { title: string; description: string; actions?: ReactNode; children: ReactNode }) {
  return <PageShell title={title} description={description} actions={actions}>{children}</PageShell>;
}

export function AiSwitch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label?: string }) {
  return <span className="ai-toggle">{label && <span>{label}</span>}<button type="button" className={`ai-switch ${checked ? 'on' : ''}`} aria-pressed={checked} onClick={() => onChange(!checked)}><i /></button></span>;
}
