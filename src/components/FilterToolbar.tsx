import type { CSSProperties, ReactNode } from 'react';
import { SearchIcon } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  style?: CSSProperties;
}

export function SearchInput({ value, onChange, placeholder, onEnter, style }: SearchInputProps) {
  return (
    <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 160, ...style }}>
      <SearchIcon size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        style={{ width: '100%', height: 34, paddingLeft: 30, paddingRight: 10, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );
}

interface FilterToolbarProps {
  children: ReactNode;
  actions?: ReactNode;
  style?: CSSProperties;
}

export default function FilterToolbar({ children, actions, style }: FilterToolbarProps) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', ...style }}>
      {children}
      {actions && <div style={{ marginLeft: 'auto' }}>{actions}</div>}
    </div>
  );
}
