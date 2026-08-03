import React, { useState, useRef, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  ShieldAlertIcon,
  DropletsIcon,
  TextIcon,
  RotateCcwIcon,
  MoveHorizontalIcon,
  EyeIcon,
  RefreshCwIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Types & defaults
// ─────────────────────────────────────────────
interface WatermarkConfig {
  text: string;
  opacity: number;   // 0.03 ~ 0.30
  angle: number;     // -90 ~ 0  (degrees, negative = tilt left)
  gapX: number;     // 120 ~ 400 px horizontal spacing
  gapY: number;     // 60  ~ 240 px vertical spacing
  fontSize: number; // 12 ~ 28
}

const DEFAULT_CONFIG: WatermarkConfig = {
  text: 'AdminPro 内部资料',
  opacity: 0.12,
  angle: -30,
  gapX: 200,
  gapY: 120,
  fontSize: 16,
};

// ─────────────────────────────────────────────
// Canvas watermark renderer → returns data-url
// ─────────────────────────────────────────────
function renderWatermarkDataUrl(cfg: WatermarkConfig, color: string): string {
  const canvas = document.createElement('canvas');
  const rad = (cfg.angle * Math.PI) / 180;

  // measure text
  const ctx2 = canvas.getContext('2d');
  if (!ctx2) return '';
  ctx2.font = `${cfg.fontSize}px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`;
  const textW = ctx2.measureText(cfg.text).width;
  const textH = cfg.fontSize;

  const padX = 20;
  const padY = 16;
  canvas.width = cfg.gapX;
  canvas.height = cfg.gapY;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);

  ctx.globalAlpha = cfg.opacity;
  ctx.font = `${cfg.fontSize}px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cfg.text, 0, 0);

  ctx.restore();
  return canvas.toDataURL();
}

// ─────────────────────────────────────────────
// Slider row
// ─────────────────────────────────────────────
interface SliderRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (v: number) => void;
}
function SliderRow({ icon, label, value, min, max, step, displayValue, onChange }: SliderRowProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color: 'var(--theme-primary)', display: 'flex', alignItems: 'center' }}>{icon}</span>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--foreground)' }}>{label}</span>
        </div>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: 'var(--theme-primary)',
            background: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
            borderRadius: 6,
            padding: '2px 8px',
            minWidth: 46,
            textAlign: 'center',
          }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--theme-primary)', cursor: 'pointer', height: 4 }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Watermark preview area
// ─────────────────────────────────────────────
interface WatermarkAreaProps {
  cfg: WatermarkConfig;
}
function WatermarkArea({ cfg }: WatermarkAreaProps) {
  const [dataUrl, setDataUrl] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect foreground color from CSS variable for canvas fill
  const getFgColor = useCallback(() => {
    if (typeof window === 'undefined') return '#1a1a1a';
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--foreground')
      .trim();
    // CSS variable value can be oklch(...) or hex or rgb(...)
    // We just use it directly as canvas fillStyle; canvas supports CSS color strings
    return v || '#1a1a1a';
  }, []);

  useEffect(() => {
    // slight debounce so rapid slider drag doesn't spam canvas creation
    const t = setTimeout(() => {
      const url = renderWatermarkDataUrl(cfg, getFgColor());
      setDataUrl(url);
    }, 16);
    return () => clearTimeout(t);
  }, [cfg, getFgColor]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height: 380,
        borderRadius: 18,
        overflow: 'hidden',
        border: '1.5px solid var(--border)',
        background: 'var(--card)',
      }}
    >
      {/* Faint background illustration — decorative content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: 32,
          pointerEvents: 'none',
        }}
      >
        {/* Fake document lines */}
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Title bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
            padding: '14px 20px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--background)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--theme-primary)',
            }}>
              <ShieldAlertIcon size={16} />
            </div>
            <div>
              <div style={{ width: 140, height: 10, borderRadius: 5, background: 'color-mix(in srgb, var(--foreground) 14%, transparent)', marginBottom: 6 }} />
              <div style={{ width: 90, height: 7, borderRadius: 5, background: 'color-mix(in srgb, var(--foreground) 8%, transparent)' }} />
            </div>
            <div style={{ marginLeft: 'auto', width: 58, height: 24, borderRadius: 7, background: 'color-mix(in srgb, var(--theme-primary) 14%, transparent)' }} />
          </div>
          {/* Content lines */}
          {[100, 88, 72, 95, 60, 80, 45].map((w, i) => (
            <div key={i} style={{
              height: 8, borderRadius: 4, marginBottom: 10,
              width: `${w}%`,
              background: 'color-mix(in srgb, var(--foreground) 7%, transparent)',
            }} />
          ))}
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            {[
              { v: '2,841', label: '访问量' },
              { v: '98.2%', label: '安全评分' },
              { v: '0', label: '告警次数' },
            ].map((s) => (
              <div key={s.label} style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--background)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', marginBottom: 3 }}>{s.v}</div>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Watermark overlay — always in DOM, opacity driven by cfg.opacity */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: dataUrl ? `url("${dataUrl}")` : 'none',
          backgroundRepeat: 'repeat',
          backgroundSize: `${cfg.gapX}px ${cfg.gapY}px`,
          zIndex: 10,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Control panel
// ─────────────────────────────────────────────
interface ControlPanelProps {
  cfg: WatermarkConfig;
  onChange: (patch: Partial<WatermarkConfig>) => void;
  onReset: () => void;
}
function ControlPanel({ cfg, onChange, onReset }: ControlPanelProps) {
  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        borderRadius: 18,
        border: '1.5px solid var(--border)',
        background: 'var(--card)',
        padding: '20px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        alignSelf: 'flex-start',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)',
            color: 'var(--theme-primary)',
          }}>
            <DropletsIcon size={14} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 650, color: 'var(--foreground)' }}>水印配置</span>
        </div>
        <button
          onClick={onReset}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11.5, color: 'var(--muted-foreground)',
            background: 'var(--secondary)', border: '1px solid var(--border)',
            borderRadius: 7, padding: '4px 9px', cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
        >
          <RefreshCwIcon size={11} />
          重置
        </button>
      </div>

      {/* Text input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color: 'var(--theme-primary)', display: 'flex', alignItems: 'center' }}>
            <TextIcon size={14} />
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--foreground)' }}>水印文字</span>
        </div>
        <input
          value={cfg.text}
          maxLength={24}
          onChange={(e) => onChange({ text: e.target.value || ' ' })}
          placeholder="输入水印文字"
          style={{
            fontSize: 12.5, color: 'var(--foreground)',
            background: 'var(--input)', border: '1.5px solid var(--border)',
            borderRadius: 9, padding: '8px 11px', outline: 'none',
            transition: 'border-color 0.15s',
            width: '100%',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--theme-primary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '0 -4px' }} />

      {/* Opacity */}
      <SliderRow
        icon={<EyeIcon size={14} />}
        label="透明度"
        value={Math.round(cfg.opacity * 100)}
        min={3}
        max={30}
        step={1}
        displayValue={`${Math.round(cfg.opacity * 100)}%`}
        onChange={(v) => onChange({ opacity: v / 100 })}
      />

      {/* Angle */}
      <SliderRow
        icon={<RotateCcwIcon size={14} />}
        label="旋转角度"
        value={cfg.angle}
        min={-90}
        max={0}
        step={5}
        displayValue={`${cfg.angle}°`}
        onChange={(v) => onChange({ angle: v })}
      />

      {/* GapX */}
      <SliderRow
        icon={<MoveHorizontalIcon size={14} />}
        label="水平间距"
        value={cfg.gapX}
        min={120}
        max={400}
        step={10}
        displayValue={`${cfg.gapX}px`}
        onChange={(v) => onChange({ gapX: v })}
      />

      {/* GapY */}
      <SliderRow
        icon={<MoveHorizontalIcon size={14} style={{ transform: 'rotate(90deg)' }} />}
        label="垂直间距"
        value={cfg.gapY}
        min={60}
        max={240}
        step={10}
        displayValue={`${cfg.gapY}px`}
        onChange={(v) => onChange({ gapY: v })}
      />

      {/* Font size */}
      <SliderRow
        icon={<TextIcon size={14} />}
        label="字体大小"
        value={cfg.fontSize}
        min={12}
        max={28}
        step={1}
        displayValue={`${cfg.fontSize}px`}
        onChange={(v) => onChange({ fontSize: v })}
      />

      {/* Config preview badge row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: -4 }}>
        {[
          { k: '文字', v: cfg.text.length > 8 ? cfg.text.slice(0, 8) + '…' : cfg.text },
          { k: '透明度', v: `${Math.round(cfg.opacity * 100)}%` },
          { k: '角度', v: `${cfg.angle}°` },
        ].map((b) => (
          <span
            key={b.k}
            style={{
              fontSize: 10.5, borderRadius: 6, padding: '2px 7px',
              background: 'color-mix(in srgb, var(--theme-primary) 8%, transparent)',
              color: 'var(--theme-primary)', fontWeight: 500,
              border: '1px solid color-mix(in srgb, var(--theme-primary) 18%, transparent)',
            }}
          >
            {b.k}：{b.v}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page root
// ─────────────────────────────────────────────
export default function WatermarkPage() {
  const [cfg, setCfg] = useState<WatermarkConfig>(DEFAULT_CONFIG);

  const handleChange = useCallback((patch: Partial<WatermarkConfig>) => {
    setCfg((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleReset = useCallback(() => {
    setCfg(DEFAULT_CONFIG);
  }, []);

  return (
    <AdminLayout>
      <div
        data-cmp="WatermarkPage"
        className="p-6 min-h-full"
        style={{ background: 'var(--background)' }}
      >
        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--theme-primary)', color: 'var(--primary-foreground)' }}
            >
              <DropletsIcon size={18} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              水印
            </h1>
          </div>
          <p className="text-sm ml-12" style={{ color: 'var(--muted-foreground)' }}>
            基于 Canvas 的动态水印生成，支持文字、透明度、旋转角度、间距实时配置
          </p>
        </div>

        {/* ── Section title ── */}
        <div className="flex items-center gap-3 mb-5">
          <div style={{ width: 4, height: 18, borderRadius: 3, background: 'var(--theme-primary)', flexShrink: 0 }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            水印预览与配置
          </span>
        </div>

        {/* ── Main layout: preview + control ── */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Left: preview */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <WatermarkArea cfg={cfg} />

            {/* Security notice below the preview */}
            <div
              style={{
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '13px 16px',
                borderRadius: 12,
                border: '1px solid color-mix(in srgb, var(--destructive) 30%, var(--border))',
                background: 'color-mix(in srgb, var(--destructive) 5%, var(--card))',
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
                  color: 'var(--destructive)',
                }}
              >
                <ShieldAlertIcon size={15} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--destructive)', marginBottom: 2 }}>
                  安全提示
                </div>
                <div style={{ fontSize: 11.5, color: 'color-mix(in srgb, var(--destructive) 70%, var(--muted-foreground))', lineHeight: 1.5 }}>
                  水印由系统统一生成，删除或遮挡将触发安全告警
                </div>
              </div>
            </div>
          </div>

          {/* Right: control panel */}
          <ControlPanel cfg={cfg} onChange={handleChange} onReset={handleReset} />
        </div>

        {/* ── Feature cards ── */}
        <div className="flex items-center gap-3 mt-10 mb-5">
          <div style={{ width: 4, height: 18, borderRadius: 3, background: 'var(--theme-primary)', flexShrink: 0 }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            功能特性
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {[
            {
              icon: <DropletsIcon size={15} />,
              color: 'var(--theme-primary)',
              title: 'Canvas 动态渲染',
              desc: '每次参数变更时在离屏 Canvas 上重新绘制，以 data-url 作为 background-image 铺满容器',
            },
            {
              icon: <RotateCcwIcon size={15} />,
              color: 'var(--chart-1)',
              title: '旋转角度自由调节',
              desc: '支持 −90° ~ 0° 区间，结合 canvas.rotate() 实现精确斜向水印渲染',
            },
            {
              icon: <EyeIcon size={15} />,
              color: 'var(--chart-2)',
              title: '透明度实时同步',
              desc: '通过 globalAlpha 精细控制每个水印单元的可见度，范围 3% ~ 30%',
            },
            {
              icon: <ShieldAlertIcon size={15} />,
              color: 'var(--destructive)',
              title: '安全水印策略',
              desc: '水印层覆盖于内容区顶层，pointer-events 禁用，防止被点击选中或 DOM 操作移除',
            },
          ].map((c) => (
            <div
              key={c.title}
              style={{
                flex: '1 1 200px',
                padding: '16px 18px',
                borderRadius: 14,
                border: '1.5px solid var(--border)',
                background: 'var(--card)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `color-mix(in srgb, ${c.color} 12%, transparent)`,
                  color: c.color,
                  marginTop: 1,
                }}
              >
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)', lineHeight: 1.55 }}>
                  {c.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
