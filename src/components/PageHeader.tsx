import type { CSSProperties, ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  titleSize?: number;
}

/** Shared heading block for admin pages. Page-specific actions stay composable. */
export default function PageHeader({ title, description, actions, titleSize = 22 }: PageHeaderProps) {
  const style: CSSProperties = {
    marginBottom: 24,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: actions ? 'space-between' : undefined,
    gap: 16,
  };

  return (
    <div style={style}>
      <div>
        <h1 style={{ fontSize: titleSize, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>{title}</h1>
        {description && <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>{description}</p>}
      </div>
      {actions}
    </div>
  );
}
