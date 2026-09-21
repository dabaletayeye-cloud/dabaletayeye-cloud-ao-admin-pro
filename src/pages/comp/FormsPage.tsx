import ViewportPortal from '../../components/ViewportPortal';
import React, { useState, useRef, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  SearchIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  ChevronDownIcon,
  XIcon,
  CheckIcon,
  CalendarIcon,
  UploadCloudIcon,
  FileIcon,
  Trash2Icon,
  AlertCircleIcon,
  InfoIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SelectOption { value: string; label: string; }

// ─── Shared Tokens ────────────────────────────────────────────────────────────
const INPUT_BASE: React.CSSProperties = {
  width: '100%',
  height: 36,
  padding: '0 12px',
  fontSize: 13,
  background: 'var(--background)',
  color: 'var(--foreground)',
  border: '1.5px solid var(--border)',
  borderRadius: 7,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--foreground)',
  marginBottom: 6,
};

const HELPER_STYLE: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--muted-foreground)',
  marginTop: 4,
};

const ERROR_STYLE: React.CSSProperties = {
  fontSize: 12,
  color: '#ef4444',
  marginTop: 4,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

// ─── DemoCard ─────────────────────────────────────────────────────────────────
function DemoCard({
  title,
  description = '',
  children,
  snippet = '',
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  snippet?: string;
}) {
  const [hov, setHov] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  return (
    <div
      data-cmp="DemoCard"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 20,
        transition: 'box-shadow 0.2s, transform 0.2s',
        boxShadow: hov
          ? '0 8px 28px color-mix(in srgb, var(--shadow-color,#000) 14%, transparent)'
          : '0 1px 4px color-mix(in srgb, var(--shadow-color,#000) 6%, transparent)',
        transform: hov ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: description ? 4 : 16 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 16 }}>{description}</div>
      )}
      <div style={{ padding: '8px 0' }}>{children}</div>
      {snippet && (
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 10 }}>
          <button
            onClick={() => setCodeOpen(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--muted-foreground)', padding: '2px 0',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <span style={{ fontSize: 10 }}>{codeOpen ? '▲' : '▼'}</span>
            {codeOpen ? '收起代码' : '查看示例代码'}
          </button>
          <div style={{ maxHeight: codeOpen ? '320px' : '0', overflow: 'hidden', transition: 'max-height 0.25s ease' }}>
            <pre style={{
              marginTop: 10, background: 'var(--muted)', borderRadius: 8,
              padding: '12px 16px', fontSize: 12, color: 'var(--foreground)',
              overflowX: 'auto', lineHeight: 1.7, margin: '8px 0 0',
            }}>
              <code>{snippet}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginBottom: 8, marginTop: 28, fontSize: 17, fontWeight: 700,
      color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {children}
    </div>
  );
}

// ─── FormRow: label + control wrapper ────────────────────────────────────────
function FormRow({
  label,
  required = false,
  helper = '',
  error = '',
  children,
  style,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ marginBottom: 18, ...style }}>
      <label style={LABEL_STYLE}>
        {required && <span style={{ color: '#ef4444', marginRight: 3 }}>*</span>}
        {label}
      </label>
      {children}
      {error && (
        <div style={ERROR_STYLE}>
          <AlertCircleIcon size={12} />
          {error}
        </div>
      )}
      {!error && helper && <div style={HELPER_STYLE}>{helper}</div>}
    </div>
  );
}

// ─── TextInput ────────────────────────────────────────────────────────────────
function TextInput({
  placeholder = '',
  value = '',
  onChange = () => {},
  prefix,
  suffix,
  error = false,
  disabled = false,
  type = 'text',
  style,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  type?: string;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? '#ef4444' : focused ? 'var(--primary)' : 'var(--border)';
  const shadow = focused && !error ? '0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)' : error && focused ? '0 0 0 3px rgba(239,68,68,0.18)' : 'none';

  if (!prefix && !suffix) {
    return (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...INPUT_BASE,
          borderColor,
          boxShadow: shadow,
          opacity: disabled ? 0.55 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          ...style,
        }}
      />
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'var(--background)', border: `1.5px solid ${borderColor}`,
      borderRadius: 7, overflow: 'hidden',
      boxShadow: shadow, transition: 'border-color 0.15s, box-shadow 0.15s',
      opacity: disabled ? 0.55 : 1,
      ...style,
    }}>
      {prefix && (
        <span style={{
          display: 'flex', alignItems: 'center', padding: '0 10px',
          color: 'var(--muted-foreground)', flexShrink: 0,
        }}>
          {prefix}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...INPUT_BASE,
          border: 'none', outline: 'none', borderRadius: 0,
          boxShadow: 'none', flex: 1, width: '100%',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
      {suffix && (
        <span style={{
          display: 'flex', alignItems: 'center', padding: '0 10px',
          color: 'var(--muted-foreground)', flexShrink: 0,
        }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

// ─── PasswordInput ────────────────────────────────────────────────────────────
function PasswordInput({
  placeholder = '请输入密码',
  value = '',
  onChange = () => {},
  error = false,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  error?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <TextInput
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={error}
      suffix={
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, color: 'var(--muted-foreground)' }}
        >
          {show ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
        </button>
      }
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
function Textarea({
  placeholder = '',
  value = '',
  onChange = () => {},
  rows = 4,
  error = false,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  rows?: number;
  error?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? '#ef4444' : focused ? 'var(--primary)' : 'var(--border)';
  const shadow = focused ? `0 0 0 3px color-mix(in srgb, ${error ? '#ef4444' : 'var(--primary)'} 18%, transparent)` : 'none';
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...INPUT_BASE,
        height: 'auto',
        padding: '8px 12px',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: 1.6,
        borderColor,
        boxShadow: shadow,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    />
  );
}

// ─── Select (single) ──────────────────────────────────────────────────────────
function Select({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = '请选择',
  searchable = false,
  error = false,
  disabled = false,
}: {
  options?: SelectOption[];
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  searchable?: boolean;
  error?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter(o =>
    !searchable || o.label.toLowerCase().includes(query.toLowerCase())
  );
  const selected = options.find(o => o.value === value);
  const borderColor = error ? '#ef4444' : open ? 'var(--primary)' : 'var(--border)';
  const shadow = open ? `0 0 0 3px color-mix(in srgb, ${error ? '#ef4444' : 'var(--primary)'} 18%, transparent)` : 'none';

  const close = useCallback(() => { setOpen(false); setQuery(''); }, []);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => { if (!disabled) setOpen(v => !v); }}
        style={{
          ...INPUT_BASE,
          display: 'flex', alignItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none', opacity: disabled ? 0.55 : 1,
          borderColor, boxShadow: shadow,
          paddingRight: 36,
        }}
      >
        {selected
          ? <span style={{ color: 'var(--foreground)', flex: 1 }}>{selected.label}</span>
          : <span style={{ color: 'var(--muted-foreground)', flex: 1 }}>{placeholder}</span>}
        <span style={{
          position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) ${open ? 'rotate(180deg)' : ''}`,
          transition: 'transform 0.15s', color: 'var(--muted-foreground)', display: 'flex',
        }}>
          <ChevronDownIcon size={14} />
        </span>
      </div>
      <div style={{
        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
        background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        maxHeight: open ? 240 : 0,
        opacity: open ? 1 : 0,
        transition: 'max-height 0.18s ease, opacity 0.15s ease',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        {searchable && (
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--muted)', borderRadius: 6, padding: '0 8px' }}>
              <SearchIcon size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
              <input
                autoFocus={open}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="搜索..."
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--foreground)', height: 30, flex: 1, width: '100%' }}
              />
            </div>
          </div>
        )}
        <div style={{ maxHeight: 180, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted-foreground)', textAlign: 'center' }}>暂无数据</div>
          )}
          {filtered.map(o => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); close(); }}
              style={{
                padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                color: o.value === value ? 'var(--primary)' : 'var(--foreground)',
                background: o.value === value ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (o.value !== value) (e.currentTarget as HTMLDivElement).style.background = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = o.value === value ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent'; }}
            >
              {o.label}
              {o.value === value && <CheckIcon size={13} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MultiSelect ──────────────────────────────────────────────────────────────
function MultiSelect({
  options = [],
  values = [],
  onChange = () => {},
  placeholder = '请选择（可多选）',
  error = false,
}: {
  options?: SelectOption[];
  values?: string[];
  onChange?: (v: string[]) => void;
  placeholder?: string;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  const borderColor = error ? '#ef4444' : open ? 'var(--primary)' : 'var(--border)';
  const shadow = open ? `0 0 0 3px color-mix(in srgb, ${error ? '#ef4444' : 'var(--primary)'} 18%, transparent)` : 'none';

  const toggle = (v: string) => {
    onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);
  };

  const close = useCallback(() => { setOpen(false); setQuery(''); }, []);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          ...INPUT_BASE, height: 'auto', minHeight: 36,
          display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap',
          gap: 4, paddingTop: 5, paddingBottom: 5, paddingRight: 36,
          cursor: 'pointer', userSelect: 'none', borderColor, boxShadow: shadow,
        }}
      >
        {values.length === 0 && (
          <span style={{ color: 'var(--muted-foreground)', lineHeight: '24px', flex: 1 }}>{placeholder}</span>
        )}
        {values.map(v => {
          const opt = options.find(o => o.value === v);
          return (
            <span key={v} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
              color: 'var(--primary)', borderRadius: 4, padding: '2px 8px 2px 8px',
              fontSize: 12, fontWeight: 500, lineHeight: '20px',
            }}>
              {opt?.label ?? v}
              <span
                onClick={e => { e.stopPropagation(); toggle(v); }}
                style={{ display: 'flex', cursor: 'pointer', opacity: 0.7 }}
              >
                <XIcon size={11} />
              </span>
            </span>
          );
        })}
        <span style={{
          position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) ${open ? 'rotate(180deg)' : ''}`,
          transition: 'transform 0.15s', color: 'var(--muted-foreground)', display: 'flex',
        }}>
          <ChevronDownIcon size={14} />
        </span>
      </div>
      <div style={{
        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
        background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
        maxHeight: open ? 240 : 0, opacity: open ? 1 : 0,
        transition: 'max-height 0.18s ease, opacity 0.15s ease',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--muted)', borderRadius: 6, padding: '0 8px' }}>
            <SearchIcon size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <input
              autoFocus={open}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索..."
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--foreground)', height: 30, flex: 1, width: '100%' }}
            />
          </div>
        </div>
        <div style={{ maxHeight: 180, overflowY: 'auto' }}>
          {filtered.map(o => {
            const checked = values.includes(o.value);
            return (
              <div
                key={o.value}
                onClick={() => toggle(o.value)}
                style={{
                  padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: checked ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!checked) (e.currentTarget as HTMLDivElement).style.background = 'var(--accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = checked ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'transparent'; }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: checked ? 'var(--primary)' : 'transparent',
                  border: checked ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  transition: 'background 0.15s, border-color 0.15s',
                }}>
                  {checked && <CheckIcon size={10} color="white" />}
                </span>
                <span style={{ color: 'var(--foreground)', flex: 1 }}>{o.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Radio Group ──────────────────────────────────────────────────────────────
function RadioGroup({
  options = [],
  value = '',
  onChange = () => {},
  layout = 'horizontal',
}: {
  options?: SelectOption[];
  value?: string;
  onChange?: (v: string) => void;
  layout?: 'horizontal' | 'vertical';
}) {
  return (
    <div style={{ display: 'flex', flexDirection: layout === 'vertical' ? 'column' : 'row', flexWrap: 'wrap', gap: layout === 'vertical' ? 10 : 20 }}>
      {options.map(o => {
        const checked = o.value === value;
        return (
          <label
            key={o.value}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: '50%', border: `2px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
              background: checked ? 'var(--primary)' : 'transparent', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.15s, background 0.15s', boxSizing: 'border-box',
              boxShadow: checked ? '0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)' : 'none',
            }}>
              {checked && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
            </span>
            <input
              type="radio"
              checked={checked}
              onChange={() => onChange(o.value)}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

// ─── Checkbox Group ───────────────────────────────────────────────────────────
function CheckboxGroup({
  options = [],
  values = [],
  onChange = () => {},
}: {
  options?: SelectOption[];
  values?: string[];
  onChange?: (v: string[]) => void;
}) {
  const toggle = (v: string) => {
    onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
      {options.map(o => {
        const checked = values.includes(o.value);
        return (
          <label
            key={o.value}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
          >
            <span
              onClick={() => toggle(o.value)}
              style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
                background: checked ? 'var(--primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, border-color 0.15s',
                boxShadow: checked ? '0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)' : 'none',
                cursor: 'pointer',
              }}
            >
              {checked && <CheckIcon size={11} color="white" />}
            </span>
            <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({
  checked = false,
  onChange = () => {},
  label = '',
  disabled = false,
  size = 'md',
}: {
  checked?: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dims = { sm: { w: 36, h: 20, r: 16 }, md: { w: 44, h: 24, r: 20 }, lg: { w: 52, h: 28, r: 24 } }[size];
  const thumbSize = dims.h - 4;
  const thumbOffset = checked ? dims.w - dims.h + 2 : 2;
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', userSelect: 'none', opacity: disabled ? 0.5 : 1 }}>
      <span
        onClick={() => { if (!disabled) onChange(!checked); }}
        style={{
          width: dims.w, height: dims.h, borderRadius: dims.r,
          background: checked ? 'var(--primary)' : 'var(--border)',
          position: 'relative', flexShrink: 0,
          transition: 'background 0.2s',
          boxShadow: checked ? '0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)' : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'inline-block',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: thumbOffset, width: thumbSize, height: thumbSize,
          borderRadius: '50%', background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
          display: 'block',
        }} />
      </span>
      {label && <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{label}</span>}
    </label>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────
function Slider({
  value = 50,
  onChange = () => {},
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  disabled = false,
}: {
  value?: number;
  onChange?: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  disabled?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1, position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3,
          background: 'var(--border)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 3,
            background: disabled ? 'var(--muted-foreground)' : 'var(--primary)',
            transition: 'width 0.05s',
          }} />
        </div>
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          disabled={disabled}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'absolute', left: 0, right: 0, width: '100%',
            opacity: 0, cursor: disabled ? 'not-allowed' : 'pointer', height: '100%', margin: 0,
          }}
        />
        <div style={{
          position: 'absolute', left: `calc(${pct}% - 9px)`, width: 18, height: 18,
          borderRadius: '50%', background: 'white',
          border: `2px solid ${disabled ? 'var(--muted-foreground)' : 'var(--primary)'}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          transition: 'left 0.05s',
        }} />
      </div>
      {showValue && (
        <span style={{
          fontSize: 13, fontWeight: 600, color: 'var(--primary)',
          minWidth: 36, textAlign: 'right',
        }}>
          {value}
        </span>
      )}
    </div>
  );
}

// ─── DatePicker ───────────────────────────────────────────────────────────────
function DatePicker({
  value = '',
  onChange = () => {},
  placeholder = '选择日期',
  error = false,
  disabled = false,
}: {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? '#ef4444' : focused ? 'var(--primary)' : 'var(--border)';
  const shadow = focused ? `0 0 0 3px color-mix(in srgb, ${error ? '#ef4444' : 'var(--primary)'} 18%, transparent)` : 'none';
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'var(--background)', border: `1.5px solid ${borderColor}`,
      borderRadius: 7, overflow: 'hidden', boxShadow: shadow,
      transition: 'border-color 0.15s, box-shadow 0.15s',
      opacity: disabled ? 0.55 : 1,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', color: 'var(--muted-foreground)', flexShrink: 0 }}>
        <CalendarIcon size={14} />
      </span>
      <input
        type="date"
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          ...INPUT_BASE,
          border: 'none', outline: 'none', borderRadius: 0, boxShadow: 'none',
          flex: 1, width: '100%', colorScheme: 'auto',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      />
    </div>
  );
}

// ─── DropZone ─────────────────────────────────────────────────────────────────
interface UploadFile { id: string; name: string; size: number; type: string; }

function DropZone({
  files = [],
  onFilesChange = () => {},
  accept = '*',
  multiple = true,
  maxSizeMB = 10,
  error = false,
}: {
  files?: UploadFile[];
  onFilesChange?: (v: UploadFile[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  error?: boolean;
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newItems: UploadFile[] = Array.from(incoming)
      .filter(f => f.size <= maxSizeMB * 1024 * 1024)
      .map(f => ({ id: Math.random().toString(36).slice(2), name: f.name, size: f.size, type: f.type }));
    onFilesChange(multiple ? [...files, ...newItems] : newItems.slice(0, 1));
  };

  const remove = (id: string) => onFilesChange(files.filter(f => f.id !== id));

  const fmtSize = (b: number) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b / 1024).toFixed(1)}KB` : `${(b / 1048576).toFixed(1)}MB`;

  const borderColor = error ? '#ef4444' : drag ? 'var(--primary)' : 'var(--border)';

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${borderColor}`,
          borderRadius: 10,
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: drag ? 'color-mix(in srgb, var(--primary) 6%, transparent)' : 'var(--muted)',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        <UploadCloudIcon size={32} style={{ color: drag ? 'var(--primary)' : 'var(--muted-foreground)', marginBottom: 8, display: 'block', margin: '0 auto 10px' }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)', marginBottom: 4 }}>
          {drag ? '松开即可上传' : '点击或拖拽文件到此区域'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
          支持单次上传多个文件，最大 {maxSizeMB}MB
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          style={{ display: 'none' }}
          onChange={e => addFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {files.map(f => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--muted)', borderRadius: 7, padding: '8px 12px',
            }}>
              <FileIcon size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--foreground)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)', flexShrink: 0 }}>{fmtSize(f.size)}</span>
              <button
                type="button"
                onClick={() => remove(f.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', padding: 0, flexShrink: 0 }}
              >
                <Trash2Icon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Full Demo Form ───────────────────────────────────────────────────────────
interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  city: string;
  skills: string[];
  hobbies: string[];
  newsletter: boolean;
  public: boolean;
  experience: number;
  birthday: string;
  files: UploadFile[];
  bio: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  gender?: string;
  city?: string;
  skills?: string;
  birthday?: string;
  bio?: string;
}

const EMPTY_FORM: FormData = {
  username: '', email: '', phone: '', password: '',
  gender: '', city: '', skills: [], hobbies: [],
  newsletter: false, public: true, experience: 3,
  birthday: '', files: [], bio: '',
};

const CITY_OPTIONS: SelectOption[] = [
  { value: 'beijing', label: '北京' }, { value: 'shanghai', label: '上海' },
  { value: 'guangzhou', label: '广州' }, { value: 'shenzhen', label: '深圳' },
  { value: 'chengdu', label: '成都' }, { value: 'hangzhou', label: '杭州' },
  { value: 'wuhan', label: '武汉' }, { value: 'xian', label: '西安' },
  { value: 'nanjing', label: '南京' }, { value: 'qingdao', label: '青岛' },
];

const SKILL_OPTIONS: SelectOption[] = [
  { value: 'react', label: 'React' }, { value: 'vue', label: 'Vue' },
  { value: 'ts', label: 'TypeScript' }, { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' }, { value: 'go', label: 'Go' },
];

const HOBBY_OPTIONS: SelectOption[] = [
  { value: 'reading', label: '阅读' }, { value: 'gaming', label: '游戏' },
  { value: 'music', label: '音乐' }, { value: 'sports', label: '运动' },
  { value: 'cooking', label: '烹饪' }, { value: 'travel', label: '旅行' },
];

function validate(data: FormData): FormErrors {
  const e: FormErrors = {};
  if (!data.username.trim()) e.username = '用户名不能为空';
  else if (data.username.trim().length < 2) e.username = '用户名至少 2 个字符';
  if (!data.email.trim()) e.email = '邮箱不能为空';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = '请输入有效的邮箱地址';
  if (data.phone && !/^1[3-9]\d{9}$/.test(data.phone)) e.phone = '手机号格式不正确（11位国内号码）';
  if (!data.password) e.password = '密码不能为空';
  else if (data.password.length < 6) e.password = '密码至少 6 位';
  if (!data.gender) e.gender = '请选择性别';
  if (!data.city) e.city = '请选择所在城市';
  if (data.skills.length === 0) e.skills = '请至少选择一项技能';
  if (!data.birthday) e.birthday = '请选择出生日期';
  if (!data.bio.trim()) e.bio = '个人简介不能为空';
  return e;
}

// ─── Toast Overlay ────────────────────────────────────────────────────────────
function ToastMsg({ msg, success, onClose }: { msg: string; success: boolean; onClose: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <ViewportPortal><div style={{
      position: 'fixed', top: 80, right: 24, zIndex: 9999,
      background: success ? '#22c55e' : '#ef4444',
      color: 'white', borderRadius: 10, padding: '12px 20px',
      fontSize: 14, fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'comp-fade-in 0.25s ease',
    }}>
      {success ? <CheckIcon size={16} /> : <XIcon size={16} />}
      {msg}
    </div></ViewportPortal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FormsPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const accentPrimary = isManga ? '#E91E8C' : 'var(--primary)';

  // ── Demo states ──────────────────────────────────────────────────────────
  const [basicInput, setBasicInput] = useState('');
  const [iconInput, setIconInput] = useState('');
  const [errInput, setErrInput] = useState('wrong@email');
  const [pwdInput, setPwdInput] = useState('');
  const [disInput] = useState('不可编辑内容');
  const [searchInput, setSearchInput] = useState('');

  const [single1, setSingle1] = useState('');
  const [single2, setSingle2] = useState('shanghai');
  const [searchSel, setSearchSel] = useState('');
  const [multi, setMulti] = useState<string[]>(['react', 'ts']);

  const [radio1, setRadio1] = useState('male');
  const [radio2, setRadio2] = useState('option2');
  const [checkboxes, setCheckboxes] = useState<string[]>(['reading', 'music']);

  const [tog1, setTog1] = useState(true);
  const [tog2, setTog2] = useState(false);
  const [tog3, setTog3] = useState(true);

  const [slider1, setSlider1] = useState(40);
  const [slider2, setSlider2] = useState(72);
  const [slider3, setSlider3] = useState(20);

  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('2024-06-15');

  const [dropFiles, setDropFiles] = useState<UploadFile[]>([]);

  // ── Full Form states ─────────────────────────────────────────────────────
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; success: boolean } | null>(null);

  const setF = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (submitted) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setToast({ msg: '表单提交成功！', success: true });
      console.log('Form submitted:', form);
    } else {
      setToast({ msg: `请修正 ${Object.keys(errs).length} 处错误后再提交`, success: false });
    }
  };

  const handleReset = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <AdminLayout>
      <style>{`
        @keyframes comp-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        input[type=range]::-webkit-slider-thumb { appearance: none; width: 1px; height: 1px; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      {toast && (
        <ToastMsg msg={toast.msg} success={toast.success} onClose={() => setToast(null)} />
      )}

      <div style={{ padding: '28px 32px', animation: 'comp-fade-in 0.3s ease', maxWidth: 960 }}>

        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: accentPrimary }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>表单组件 Form</h1>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, margin: '0 0 0 14px' }}>
            常用表单控件合集：输入框、下拉选择、单/多选、开关、滑块、日期选择、拖拽上传，配套完整示例表单。
          </p>
        </div>

        {/* ── 1. 输入框 ─────────────────────────────────────────────────────── */}
        <Section>① 输入框 Input</Section>
        <DemoCard
          title="基础输入框"
          description="文本输入，支持 placeholder、受控值、聚焦高亮环。"
          snippet={`<TextInput placeholder="请输入内容" value={val} onChange={setVal} />`}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px' }}>
              <FormRow label="普通输入">
                <TextInput placeholder="请输入内容" value={basicInput} onChange={setBasicInput} />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 280px' }}>
              <FormRow label="搜索框">
                <TextInput
                  prefix={<SearchIcon size={14} />}
                  placeholder="搜索关键词..."
                  value={searchInput}
                  onChange={setSearchInput}
                />
              </FormRow>
            </div>
          </div>
        </DemoCard>

        <DemoCard
          title="带图标输入框"
          description="前缀/后缀图标增强语义，常见于用户名、邮箱、手机号等场景。"
          snippet={`<TextInput prefix={<UserIcon size={14} />} placeholder="用户名" />`}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 260px' }}>
              <FormRow label="用户名（前缀图标）">
                <TextInput prefix={<UserIcon size={14} />} placeholder="请输入用户名" value={iconInput} onChange={setIconInput} />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 260px' }}>
              <FormRow label="邮箱地址（前缀图标）">
                <TextInput prefix={<MailIcon size={14} />} placeholder="example@mail.com" />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 260px' }}>
              <FormRow label="手机号（前缀图标）">
                <TextInput prefix={<PhoneIcon size={14} />} placeholder="请输入手机号" />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 260px' }}>
              <FormRow label="带清除后缀">
                <TextInput
                  prefix={<SearchIcon size={14} />}
                  placeholder="输入后出现清除按钮"
                  value={searchInput}
                  onChange={setSearchInput}
                  suffix={searchInput
                    ? <button type="button" onClick={() => setSearchInput('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, color: 'var(--muted-foreground)' }}><XIcon size={13} /></button>
                    : undefined}
                />
              </FormRow>
            </div>
          </div>
        </DemoCard>

        <DemoCard
          title="密码输入框"
          description="内置可见切换按钮（眼睛图标），点击在明文/密文之间切换。"
          snippet={`<PasswordInput placeholder="请输入密码" value={pwd} onChange={setPwd} />`}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px' }}>
              <FormRow label="密码" helper="点击右侧图标切换显示/隐藏">
                <PasswordInput value={pwdInput} onChange={setPwdInput} />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 280px' }}>
              <FormRow label="确认密码">
                <PasswordInput placeholder="再次输入密码" />
              </FormRow>
            </div>
          </div>
        </DemoCard>

        <DemoCard
          title="错误态 & 禁用态"
          description="error 属性触发红色边框 + 错误提示；disabled 属性降低透明度并禁止交互。"
          snippet={`<TextInput error value="wrong@email" />\n<TextInput disabled value="不可编辑" />`}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px' }}>
              <FormRow label="错误状态" error="请输入有效的邮箱地址">
                <TextInput prefix={<MailIcon size={14} />} error value={errInput} onChange={setErrInput} />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 280px' }}>
              <FormRow label="禁用状态" helper="该字段当前不可编辑">
                <TextInput disabled value={disInput} />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 280px' }}>
              <FormRow label="密码错误态" error="密码至少 8 位，须包含字母和数字">
                <PasswordInput error value="123" onChange={() => {}} />
              </FormRow>
            </div>
          </div>
        </DemoCard>

        {/* ── 2. 下拉选择 ───────────────────────────────────────────────────── */}
        <Section>② 下拉选择 Select</Section>
        <DemoCard
          title="单选下拉"
          description="点击展开选项列表，选中高亮 + 勾选图标，再次点击收起。"
          snippet={`<Select options={CITY_OPTIONS} value={city} onChange={setCity} placeholder="请选择城市" />`}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="空选（默认 placeholder）">
                <Select options={CITY_OPTIONS} value={single1} onChange={setSingle1} placeholder="请选择城市" />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="已有默认值">
                <Select options={CITY_OPTIONS} value={single2} onChange={setSingle2} />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="禁用状态">
                <Select options={CITY_OPTIONS} value="beijing" onChange={() => {}} disabled />
              </FormRow>
            </div>
          </div>
        </DemoCard>

        <DemoCard
          title="可搜索单选"
          description="顶部内嵌搜索框，实时过滤选项，适合选项较多的场景。"
          snippet={`<Select options={CITY_OPTIONS} searchable value={city} onChange={setCity} />`}
        >
          <div style={{ flex: '1 1 280px', maxWidth: 360 }}>
            <FormRow label={'可搜索下拉（试试输入 "深"）'}>
              <Select options={CITY_OPTIONS} searchable value={searchSel} onChange={setSearchSel} placeholder="搜索城市..." />
            </FormRow>
          </div>
        </DemoCard>

        <DemoCard
          title="多选下拉"
          description="支持多选，已选项以标签形式展示，点击标签 × 取消，内置搜索过滤。"
          snippet={`<MultiSelect options={SKILL_OPTIONS} values={skills} onChange={setSkills} />`}
        >
          <div style={{ maxWidth: 480 }}>
            <FormRow label="技术栈（可多选）" helper="已选项显示为标签，可点击 × 移除">
              <MultiSelect options={SKILL_OPTIONS} values={multi} onChange={setMulti} />
            </FormRow>
          </div>
        </DemoCard>

        {/* ── 3. 单选 / 复选 ────────────────────────────────────────────────── */}
        <Section>③ 单选 & 复选</Section>
        <DemoCard
          title="单选组 Radio"
          description="同组内互斥选择，支持水平/垂直排列。"
          snippet={`<RadioGroup options={genderOpts} value={gender} onChange={setGender} />`}
        >
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <FormRow label="性别（水平）">
                <RadioGroup
                  options={[{ value: 'male', label: '男' }, { value: 'female', label: '女' }, { value: 'other', label: '保密' }]}
                  value={radio1}
                  onChange={setRadio1}
                />
              </FormRow>
            </div>
            <div>
              <FormRow label="评级（垂直）">
                <RadioGroup
                  options={[
                    { value: 'option1', label: '选项 A —— 基础版' },
                    { value: 'option2', label: '选项 B —— 专业版（推荐）' },
                    { value: 'option3', label: '选项 C —— 企业版' },
                  ]}
                  value={radio2}
                  onChange={setRadio2}
                  layout="vertical"
                />
              </FormRow>
            </div>
          </div>
        </DemoCard>

        <DemoCard
          title="复选组 Checkbox"
          description="允许同时选择多项，支持全选/反选场景。"
          snippet={`<CheckboxGroup options={hobbyOpts} values={hobbies} onChange={setHobbies} />`}
        >
          <FormRow label="兴趣爱好（可多选）">
            <CheckboxGroup options={HOBBY_OPTIONS} values={checkboxes} onChange={setCheckboxes} />
          </FormRow>
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--muted-foreground)' }}>
            已选：{checkboxes.length === 0 ? '无' : checkboxes.map(v => HOBBY_OPTIONS.find(o => o.value === v)?.label).join('、')}
          </div>
        </DemoCard>

        {/* ── 4. 开关 ───────────────────────────────────────────────────────── */}
        <Section>④ 开关 Switch</Section>
        <DemoCard
          title="三种尺寸开关"
          description="sm / md / lg 三档，开启状态使用主题色，切换时有平滑过渡动画。"
          snippet={`<Toggle checked={val} onChange={setVal} label="开启通知" />`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <Toggle size="sm" checked={tog1} onChange={setTog1} label="小号 (sm)" />
              <Toggle size="md" checked={tog2} onChange={setTog2} label="中号 (md，默认)" />
              <Toggle size="lg" checked={tog3} onChange={setTog3} label="大号 (lg)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <Toggle checked={true} onChange={() => {}} label="接收系统通知" />
              <Toggle checked={false} onChange={() => {}} label="自动同步数据" />
              <Toggle checked={true} onChange={() => {}} disabled label="已锁定（禁用）" />
            </div>
          </div>
        </DemoCard>

        {/* ── 5. 滑块 ───────────────────────────────────────────────────────── */}
        <Section>⑤ 滑块 Slider</Section>
        <DemoCard
          title="范围滑块"
          description="拖动滑块选取数值，右侧实时显示当前值，支持自定义 min/max/step。"
          snippet={`<Slider value={val} onChange={setVal} min={0} max={100} />`}
        >
          <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 8 }}>音量（0–100，step=1）</div>
              <Slider value={slider1} onChange={setSlider1} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 8 }}>亮度（0–100，当前 {slider2}%）</div>
              <Slider value={slider2} onChange={setSlider2} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 8 }}>精度步进（step=5）</div>
              <Slider value={slider3} onChange={setSlider3} step={5} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 8 }}>禁用状态</div>
              <Slider value={65} onChange={() => {}} disabled />
            </div>
          </div>
        </DemoCard>

        {/* ── 6. 日期选择 ───────────────────────────────────────────────────── */}
        <Section>⑥ 日期选择 DatePicker</Section>
        <DemoCard
          title="日期选择器"
          description="原生 date 输入包装，带日历图标前缀，聚焦时显示主题色高亮环。"
          snippet={`<DatePicker value={date} onChange={setDate} />`}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="出生日期">
                <DatePicker value={date1} onChange={setDate1} placeholder="请选择日期" />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="已选日期">
                <DatePicker value={date2} onChange={setDate2} />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="禁用日期选择">
                <DatePicker value="2024-01-01" onChange={() => {}} disabled />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="错误态" error="请选择有效日期">
                <DatePicker value="" onChange={() => {}} error />
              </FormRow>
            </div>
          </div>
        </DemoCard>

        {/* ── 7. 拖拽上传 ───────────────────────────────────────────────────── */}
        <Section>⑦ 拖拽上传 Upload</Section>
        <DemoCard
          title="拖拽 / 点击上传"
          description="支持拖拽文件至区域或点击选择文件，可批量添加，文件列表显示名称/大小，点击垃圾桶删除。"
          snippet={`<DropZone files={files} onFilesChange={setFiles} accept="image/*" multiple />`}
        >
          <DropZone files={dropFiles} onFilesChange={setDropFiles} />
          {dropFiles.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: 'var(--muted-foreground)' }}>
              <InfoIcon size={13} />
              <span>试试将本地文件拖到上方区域，或直接点击选择</span>
            </div>
          )}
        </DemoCard>

        {/* ── 8. 完整示例表单 ───────────────────────────────────────────────── */}
        <Section>⑧ 完整示例表单（带必填校验）</Section>
        <div
          data-cmp="FullExampleForm"
          style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '28px 32px', marginBottom: 40,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--foreground)', marginBottom: 4 }}>用户注册表单</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 24 }}>
            带 <span style={{ color: '#ef4444' }}>*</span> 为必填项，点击提交触发完整校验。
          </div>

          {/* Row 1: username + email */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="用户名" required error={errors.username}>
                <TextInput
                  prefix={<UserIcon size={14} />}
                  placeholder="请输入用户名（至少2位）"
                  value={form.username}
                  onChange={v => setF('username', v)}
                  error={!!errors.username}
                />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="电子邮箱" required error={errors.email}>
                <TextInput
                  prefix={<MailIcon size={14} />}
                  placeholder="example@mail.com"
                  value={form.email}
                  onChange={v => setF('email', v)}
                  error={!!errors.email}
                />
              </FormRow>
            </div>
          </div>

          {/* Row 2: phone + password */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="手机号" helper="选填，国内11位手机号" error={errors.phone}>
                <TextInput
                  prefix={<PhoneIcon size={14} />}
                  placeholder="请输入手机号"
                  value={form.phone}
                  onChange={v => setF('phone', v)}
                  error={!!errors.phone}
                />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="登录密码" required error={errors.password}>
                <PasswordInput
                  value={form.password}
                  onChange={v => setF('password', v)}
                  error={!!errors.password}
                />
              </FormRow>
            </div>
          </div>

          {/* Row 3: gender + city */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="性别" required error={errors.gender}>
                <RadioGroup
                  options={[{ value: 'male', label: '男' }, { value: 'female', label: '女' }, { value: 'secret', label: '保密' }]}
                  value={form.gender}
                  onChange={v => setF('gender', v)}
                />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="所在城市" required error={errors.city}>
                <Select
                  options={CITY_OPTIONS}
                  value={form.city}
                  onChange={v => setF('city', v)}
                  searchable
                  placeholder="搜索城市..."
                  error={!!errors.city}
                />
              </FormRow>
            </div>
          </div>

          {/* Row 4: skills + hobbies */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="技术栈" required error={errors.skills}>
                <MultiSelect
                  options={SKILL_OPTIONS}
                  values={form.skills}
                  onChange={v => setF('skills', v)}
                  placeholder="选择擅长技术..."
                  error={!!errors.skills}
                />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="兴趣爱好" helper="可选，选择你的业余爱好">
                <CheckboxGroup
                  options={HOBBY_OPTIONS.slice(0, 5)}
                  values={form.hobbies}
                  onChange={v => setF('hobbies', v)}
                />
              </FormRow>
            </div>
          </div>

          {/* Row 5: birthday + experience */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label="出生日期" required error={errors.birthday}>
                <DatePicker value={form.birthday} onChange={v => setF('birthday', v)} error={!!errors.birthday} />
              </FormRow>
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <FormRow label={`工作年限：${form.experience} 年`} helper="拖动滑块选择工作年限（0–20年）">
                <Slider value={form.experience} onChange={v => setF('experience', v)} min={0} max={20} step={1} />
              </FormRow>
            </div>
          </div>

          {/* Bio */}
          <FormRow label="个人简介" required error={errors.bio} helper="简单介绍你自己，方便团队了解">
            <Textarea
              rows={4}
              placeholder="请输入个人简介..."
              value={form.bio}
              onChange={v => setF('bio', v)}
              error={!!errors.bio}
            />
          </FormRow>

          {/* Uploads */}
          <FormRow label="头像 / 资料附件" helper="支持图片、PDF 等格式，单文件最大 10MB">
            <DropZone
              files={form.files}
              onFilesChange={v => setF('files', v)}
              accept="image/*,.pdf"
            />
          </FormRow>

          {/* Switches */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            <Toggle
              checked={form.newsletter}
              onChange={v => setF('newsletter', v)}
              label="订阅邮件通知"
            />
            <Toggle
              checked={form.public}
              onChange={v => setF('public', v)}
              label="公开个人主页"
            />
          </div>

          {/* Error summary */}
          {submitted && Object.keys(errors).length > 0 && (
            <div style={{
              background: 'color-mix(in srgb, #ef4444 10%, transparent)',
              border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
              borderRadius: 8, padding: '12px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <AlertCircleIcon size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 500 }}>
                共 {Object.keys(errors).length} 处必填项未通过校验，请检查后重新提交。
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                height: 38, padding: '0 24px', fontSize: 14, fontWeight: 500,
                background: 'transparent',
                color: 'var(--foreground)',
                border: '1.5px solid var(--border)', borderRadius: 8,
                cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              重置表单
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                height: 38, padding: '0 28px', fontSize: 14, fontWeight: 600,
                background: accentPrimary,
                color: 'white',
                border: 'none', borderRadius: 8,
                cursor: 'pointer', transition: 'opacity 0.15s, box-shadow 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              <CheckIcon size={15} />
              提交表单
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
