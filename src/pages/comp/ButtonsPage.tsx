import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  SearchIcon,
  DownloadIcon,
  PlusIcon,
  HeartIcon,
  StarIcon,
  TrashIcon,
  EditIcon,
  SendIcon,
  RefreshCwIcon,
  CheckIcon,
  XIcon,
  ArrowRightIcon,
  BellIcon,
  ShareIcon,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
type BtnColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
type BtnVariant = 'solid' | 'outline' | 'ghost' | 'rounded' | 'link';
type BtnSize = 'lg' | 'md' | 'sm';

interface BtnProps {
  color?: BtnColor;
  variant?: BtnVariant;
  size?: BtnSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  block?: boolean;
}

const COLOR_SOLID: Record<BtnColor, { bg: string; hoverBg: string; text: string; border: string }> = {
  primary:   { bg: 'var(--primary)',   hoverBg: 'color-mix(in srgb, var(--primary) 85%, #000)',   text: 'var(--primary-foreground)',   border: 'var(--primary)' },
  secondary: { bg: 'var(--secondary)', hoverBg: 'color-mix(in srgb, var(--secondary) 85%, #000)', text: 'var(--secondary-foreground)', border: 'var(--secondary)' },
  success:   { bg: '#22c55e',          hoverBg: '#16a34a',                                         text: '#fff',                        border: '#22c55e' },
  warning:   { bg: '#f59e0b',          hoverBg: '#d97706',                                         text: '#fff',                        border: '#f59e0b' },
  danger:    { bg: '#ef4444',          hoverBg: '#dc2626',                                         text: '#fff',                        border: '#ef4444' },
};
const COLOR_TEXT: Record<BtnColor, string> = {
  primary: 'var(--primary)', secondary: 'var(--foreground)',
  success: '#22c55e', warning: '#f59e0b', danger: '#ef4444',
};
const SIZE_MAP: Record<BtnSize, { p: string; fontSize: number; h: number; iconSize: number; gap: number; radius: number }> = {
  lg: { p: '0 24px', fontSize: 15, h: 42, iconSize: 17, gap: 8, radius: 8 },
  md: { p: '0 18px', fontSize: 14, h: 34, iconSize: 15, gap: 6, radius: 7 },
  sm: { p: '0 12px', fontSize: 12, h: 26, iconSize: 13, gap: 5, radius: 5 },
};

function Btn({
  color = 'primary', variant = 'solid', size = 'md',
  disabled = false, loading = false,
  icon, iconRight, children, onClick, block = false,
}: BtnProps) {
  const [hov, setHov] = useState(false);
  const s = SIZE_MAP[size];
  const c = COLOR_SOLID[color];
  const textColor = COLOR_TEXT[color];

  let bg = 'transparent', bdr = '1.5px solid transparent', clr = textColor;
  let hovBg = `color-mix(in srgb, ${textColor} 10%, transparent)`;

  if (variant === 'solid' || variant === 'rounded') {
    bg = c.bg; bdr = `1.5px solid ${c.border}`; clr = c.text;
    hovBg = c.hoverBg;
  } else if (variant === 'outline') {
    bdr = `1.5px solid ${c.border}`;
  } else if (variant === 'link') {
    clr = textColor;
    hovBg = 'transparent';
  }

  const radius = variant === 'rounded' ? 999 : s.radius;
  const spinStyle: React.CSSProperties = {
    width: s.iconSize - 2, height: s.iconSize - 2,
    border: '2px solid currentColor', borderTopColor: 'transparent',
    borderRadius: '50%', display: 'inline-block', flexShrink: 0,
    animation: 'comp-btn-spin 0.65s linear infinite',
  };

  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, padding: s.p, height: s.h, fontSize: s.fontSize, fontWeight: 500,
        background: hov && !disabled ? hovBg : bg,
        color: clr,
        border: bdr, borderRadius: radius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.15s, opacity 0.15s, box-shadow 0.15s',
        outline: 'none', userSelect: 'none', whiteSpace: 'nowrap', flexShrink: 0,
        width: block ? '100%' : undefined,
        textDecoration: variant === 'link' && hov ? 'underline' : 'none',
        boxShadow: variant === 'solid' && hov && !disabled ? `0 4px 12px color-mix(in srgb, ${c.border} 35%, transparent)` : 'none',
      }}
    >
      {loading && <span style={spinStyle} />}
      {!loading && icon && <span style={{ display: 'flex', fontSize: s.iconSize, flexShrink: 0 }}>{icon}</span>}
      {children}
      {iconRight && !loading && <span style={{ display: 'flex', fontSize: s.iconSize, flexShrink: 0 }}>{iconRight}</span>}
    </button>
  );
}

// ─── Demo Card ────────────────────────────────────────────────────────────────
interface DemoCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  snippet?: string;
  horizontal?: boolean;
}

function DemoCard({ title, description, children, snippet, horizontal = true }: DemoCardProps) {
  const [hov, setHov] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <div
      data-cmp="DemoCard"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '20px 24px', marginBottom: 20,
        transition: 'box-shadow 0.2s, transform 0.2s',
        boxShadow: hov ? '0 8px 28px color-mix(in srgb, var(--shadow-color, #000) 14%, transparent)' : '0 1px 4px color-mix(in srgb, var(--shadow-color, #000) 6%, transparent)',
        transform: hov ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: description ? 4 : 16 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 16 }}>{description}</div>
      )}
      <div style={{
        display: 'flex', flexWrap: horizontal ? 'wrap' : undefined,
        flexDirection: horizontal ? 'row' : 'column',
        gap: 12, alignItems: 'center',
        padding: '14px 0',
      }}>
        {children}
      </div>
      {snippet && (
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 10 }}>
          <button
            onClick={() => setOpen(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--muted-foreground)', padding: '2px 0',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <span style={{ fontSize: 10 }}>{open ? '▲' : '▼'}</span>
            {open ? '收起代码' : '查看示例代码'}
          </button>
          <div
            style={{
              maxHeight: open ? '300px' : '0', overflow: 'hidden',
              transition: 'max-height 0.25s ease',
            }}
          >
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
    <div style={{ marginBottom: 8, marginTop: 28, fontSize: 17, fontWeight: 700, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 8 }}>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ButtonsPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const accentPrimary = isManga ? '#E91E8C' : 'var(--primary)';

  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const triggerLoading = (key: string) => {
    setLoadingMap(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setLoadingMap(prev => ({ ...prev, [key]: false })), 2000);
  };

  const COLORS: BtnColor[] = ['primary', 'secondary', 'success', 'warning', 'danger'];
  const LABELS: Record<BtnColor, string> = { primary: '主要', secondary: '次要', success: '成功', warning: '警告', danger: '危险' };

  return (
    <AdminLayout>
      <style>{`
        @keyframes comp-btn-spin { to { transform: rotate(360deg); } }
        @keyframes comp-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>

      <div style={{ padding: '28px 32px', animation: 'comp-fade-in 0.3s ease', maxWidth: 960 }}>

        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 4, height: 22, borderRadius: 2,
              background: accentPrimary,
            }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>按钮 Button</h1>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, margin: '0 0 0 14px' }}>
            常用操作按钮，支持多种类型、尺寸、状态与变体，适配亮色/暗色多主题。
          </p>
        </div>

        {/* ── 1. Button Types ──────────────────────────────────────────────── */}
        <Section>① 按钮类型</Section>
        <DemoCard
          title="语义类型"
          description="五种语义颜色：主要 / 次要 / 成功 / 警告 / 危险，满足不同操作场景。"
          snippet={`<Btn color="primary">主要</Btn>\n<Btn color="success">成功</Btn>\n<Btn color="warning">警告</Btn>\n<Btn color="danger">危险</Btn>`}
        >
          {COLORS.map(c => <Btn key={c} color={c}>{LABELS[c]}</Btn>)}
        </DemoCard>

        {/* ── 2. Variants ──────────────────────────────────────────────────── */}
        <Section>② 按钮变体</Section>
        <DemoCard title="实心（Solid）" description="默认填充样式，适用于主操作。"
          snippet={`<Btn variant="solid" color="primary">主要</Btn>`}>
          {COLORS.map(c => <Btn key={c} variant="solid" color={c}>{LABELS[c]}</Btn>)}
        </DemoCard>

        <DemoCard title="描边（Outline）" description="透明背景 + 颜色边框，适用于次要操作。"
          snippet={`<Btn variant="outline" color="primary">主要</Btn>`}>
          {COLORS.map(c => <Btn key={c} variant="outline" color={c}>{LABELS[c]}</Btn>)}
        </DemoCard>

        <DemoCard title="幽灵（Ghost）" description="无边框透明，鼠标悬停显示淡色背景。"
          snippet={`<Btn variant="ghost" color="primary">主要</Btn>`}>
          {COLORS.map(c => <Btn key={c} variant="ghost" color={c}>{LABELS[c]}</Btn>)}
        </DemoCard>

        <DemoCard title="大圆角（Rounded）" description="胶囊形圆角按钮，视觉更柔和。"
          snippet={`<Btn variant="rounded" color="primary">主要</Btn>`}>
          {COLORS.map(c => <Btn key={c} variant="rounded" color={c}>{LABELS[c]}</Btn>)}
        </DemoCard>

        <DemoCard title="链接（Link）" description="无背景纯文字样式，悬停添加下划线。"
          snippet={`<Btn variant="link" color="primary">主要链接</Btn>`}>
          {COLORS.map(c => <Btn key={c} variant="link" color={c}>{LABELS[c]}链接</Btn>)}
        </DemoCard>

        {/* ── 3. Sizes ─────────────────────────────────────────────────────── */}
        <Section>③ 尺寸规格</Section>
        <DemoCard title="三种尺寸对比" description="大 (lg) / 中 (md, 默认) / 小 (sm) 三档。"
          snippet={`<Btn size="lg">大号</Btn>\n<Btn size="md">中号</Btn>\n<Btn size="sm">小号</Btn>`}>
          <Btn size="lg" color="primary">大号按钮 (lg)</Btn>
          <Btn size="md" color="primary">中号按钮 (md)</Btn>
          <Btn size="sm" color="primary">小号按钮 (sm)</Btn>
        </DemoCard>

        <DemoCard title="描边 × 尺寸" description="描边变体 + 三种尺寸组合。">
          {(['lg','md','sm'] as BtnSize[]).map(sz => (
            <React.Fragment key={sz}>
              {COLORS.map(c => (
                <Btn key={c} size={sz} variant="outline" color={c}>{LABELS[c]}</Btn>
              ))}
            </React.Fragment>
          ))}
        </DemoCard>

        {/* ── 4. State ─────────────────────────────────────────────────────── */}
        <Section>④ 状态变体</Section>
        <DemoCard title="禁用状态" description="disabled 时按钮变灰、不可点击、cursor 为 not-allowed。"
          snippet={`<Btn disabled>禁用主要</Btn>\n<Btn variant="outline" disabled>禁用描边</Btn>`}>
          {COLORS.map(c => <Btn key={c} color={c} disabled>{LABELS[c]}</Btn>)}
          {COLORS.map(c => <Btn key={c + 'o'} variant="outline" color={c} disabled>{LABELS[c]}</Btn>)}
        </DemoCard>

        <DemoCard title="加载中状态" description="loading 时显示旋转圆圈，按钮不可再次点击。点击下方按钮体验 2 秒加载。"
          snippet={`<Btn loading>提交中...</Btn>`}>
          {COLORS.map(c => (
            <Btn
              key={c} color={c}
              loading={loadingMap[c] ?? false}
              onClick={() => triggerLoading(c)}
            >
              {loadingMap[c] ? '处理中...' : `点击加载 (${LABELS[c]})`}
            </Btn>
          ))}
        </DemoCard>

        {/* ── 5. Icon Buttons ──────────────────────────────────────────────── */}
        <Section>⑤ 图标按钮</Section>
        <DemoCard title="左侧图标" description="icon 属性传入图标节点，显示在文字左侧。"
          snippet={`<Btn icon={<PlusIcon />} color="primary">新建</Btn>`}>
          <Btn color="primary" icon={<PlusIcon size={15} />}>新建</Btn>
          <Btn color="success" icon={<DownloadIcon size={15} />}>下载</Btn>
          <Btn color="warning" icon={<EditIcon size={15} />}>编辑</Btn>
          <Btn color="danger" icon={<TrashIcon size={15} />}>删除</Btn>
          <Btn color="secondary" icon={<ShareIcon size={15} />}>分享</Btn>
          <Btn variant="outline" color="primary" icon={<SearchIcon size={15} />}>搜索</Btn>
          <Btn variant="outline" color="secondary" icon={<BellIcon size={15} />}>通知</Btn>
        </DemoCard>

        <DemoCard title="右侧图标" description="iconRight 属性将图标显示在文字右侧，适合导航型按钮。"
          snippet={`<Btn iconRight={<ArrowRightIcon />} color="primary">查看详情</Btn>`}>
          <Btn color="primary" iconRight={<ArrowRightIcon size={14} />}>查看详情</Btn>
          <Btn variant="outline" color="primary" iconRight={<ArrowRightIcon size={14} />}>继续</Btn>
          <Btn color="success" iconRight={<CheckIcon size={14} />}>确认</Btn>
          <Btn color="danger" iconRight={<XIcon size={14} />}>取消</Btn>
          <Btn variant="rounded" color="primary" iconRight={<SendIcon size={14} />}>发送</Btn>
        </DemoCard>

        <DemoCard title="纯图标按钮" description="仅 icon 无文字，配合圆角/圆形变体呈现工具栏风格。"
          snippet={`<Btn variant="rounded" icon={<PlusIcon />} color="primary" />`}>
          {([
            { icon: <PlusIcon size={15} />, color: 'primary' },
            { icon: <SearchIcon size={15} />, color: 'secondary' },
            { icon: <EditIcon size={15} />, color: 'warning' },
            { icon: <TrashIcon size={15} />, color: 'danger' },
            { icon: <StarIcon size={15} />, color: 'success' },
            { icon: <RefreshCwIcon size={15} />, color: 'primary' },
            { icon: <HeartIcon size={15} />, color: 'danger' },
            { icon: <BellIcon size={15} />, color: 'warning' },
          ] as { icon: React.ReactNode; color: BtnColor }[]).map((item, i) => (
            <Btn key={i} variant="rounded" color={item.color} icon={item.icon} size="md" />
          ))}
          {/* Outline icon only */}
          {([
            { icon: <PlusIcon size={15} />, color: 'primary' },
            { icon: <DownloadIcon size={15} />, color: 'success' },
            { icon: <ShareIcon size={15} />, color: 'secondary' },
            { icon: <SendIcon size={15} />, color: 'warning' },
          ] as { icon: React.ReactNode; color: BtnColor }[]).map((item, i) => (
            <Btn key={'o' + i} variant="outline" color={item.color} icon={item.icon} size="md" />
          ))}
        </DemoCard>

        {/* ── 6. Combinations ──────────────────────────────────────────────── */}
        <Section>⑥ 综合组合</Section>
        <DemoCard title="按钮组合示例" description="在实际产品中常见的按钮搭配方式。">
          {/* Action bar */}
          <div style={{ display: 'flex', gap: 8, width: '100%', flexWrap: 'wrap' }}>
            <Btn color="primary" icon={<PlusIcon size={14} />}>新建文章</Btn>
            <Btn variant="outline" color="primary" icon={<DownloadIcon size={14} />}>导出数据</Btn>
            <Btn variant="ghost" color="secondary" icon={<RefreshCwIcon size={14} />}>刷新</Btn>
            <div style={{ flex: 1 }} />
            <Btn variant="outline" color="danger" size="sm" icon={<TrashIcon size={12} />}>批量删除</Btn>
          </div>
        </DemoCard>

        <DemoCard title="块级按钮" description="block 属性使按钮撑满父容器宽度，适合表单提交区域。"
          snippet={`<Btn block color="primary">登录</Btn>`}
          horizontal={false}
        >
          <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Btn color="primary" block icon={<SendIcon size={14} />}>提交表单</Btn>
            <Btn variant="outline" color="secondary" block>取消</Btn>
          </div>
        </DemoCard>

        {/* ── 7. Size × Color Full Matrix ──────────────────────────────────── */}
        <Section>⑦ 尺寸 × 类型 完整矩阵</Section>
        <DemoCard title="大号 × 所有类型" description="lg 尺寸 × 5 种颜色 × Solid / Outline / Ghost 三种变体">
          {(['solid','outline','ghost'] as BtnVariant[]).flatMap(v =>
            COLORS.map(c => (
              <Btn key={v + c} size="lg" variant={v} color={c}>{LABELS[c]}</Btn>
            ))
          )}
        </DemoCard>
        <DemoCard title="中号 × 所有类型" description="md 尺寸 × 5 种颜色 × Solid / Outline / Ghost 三种变体">
          {(['solid','outline','ghost'] as BtnVariant[]).flatMap(v =>
            COLORS.map(c => (
              <Btn key={v + c} size="md" variant={v} color={c}>{LABELS[c]}</Btn>
            ))
          )}
        </DemoCard>
        <DemoCard title="小号 × 所有类型" description="sm 尺寸 × 5 种颜色 × Solid / Outline / Ghost 三种变体">
          {(['solid','outline','ghost'] as BtnVariant[]).flatMap(v =>
            COLORS.map(c => (
              <Btn key={v + c} size="sm" variant={v} color={c}>{LABELS[c]}</Btn>
            ))
          )}
        </DemoCard>

      </div>
    </AdminLayout>
  );
}
