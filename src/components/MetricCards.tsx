import type { ReactNode } from 'react';

export interface MetricCardItem {
  label: ReactNode;
  value: ReactNode;
  color: string;
  icon?: ReactNode;
}

interface MetricCardsProps {
  items: MetricCardItem[];
  variant?: 'center' | 'icon';
  minWidth?: number;
}

const cardShadow = 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))';

/** Summary metrics used by list and campaign management pages. */
export default function MetricCards({ items, variant = 'icon', minWidth = 180 }: MetricCardsProps) {
  return (
    <div data-cmp="MetricCards" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
      {items.map((item) => (
        <div
          key={String(item.label)}
          style={{
            flex: `1 1 ${minWidth}px`,
            minWidth,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '18px 20px',
            display: variant === 'icon' ? 'flex' : undefined,
            alignItems: variant === 'icon' ? 'center' : undefined,
            gap: variant === 'icon' ? 14 : undefined,
            textAlign: variant === 'center' ? 'center' : undefined,
            boxShadow: cardShadow,
          }}
        >
          {variant === 'icon' && item.icon && (
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `color-mix(in srgb, ${item.color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
              {item.icon}
            </div>
          )}
          <div style={{ flex: variant === 'icon' ? 1 : undefined }}>
            <div style={{ fontSize: variant === 'center' ? 28 : 22, fontWeight: variant === 'center' ? 800 : 700, color: variant === 'center' ? item.color : 'var(--foreground)', lineHeight: 1.2 }}>{item.value}</div>
            <div style={{ fontSize: variant === 'center' ? 13 : 12, color: 'var(--muted-foreground)', marginTop: variant === 'center' ? 4 : 2 }}>{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
