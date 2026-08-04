import { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import AdminLayout from '../../components/AdminLayout';
import { toast } from '../../lib/localizedToast';
import {
  DownloadIcon,
  UploadCloudIcon,
  RefreshCwIcon,
  QrCodeIcon,
  ImageIcon,
  XIcon,
  CheckIcon,
} from 'lucide-react';

// ─── preset sizes ─────────────────────────────────────────────────────────────
const SIZE_PRESETS = [
  { label: 'S', value: 128 },
  { label: 'M', value: 200 },
  { label: 'L', value: 300 },
  { label: 'XL', value: 400 },
];

// ─── preset color pairs ───────────────────────────────────────────────────────
const COLOR_PRESETS: { fg: string; bg: string; label: string }[] = [
  { fg: '#000000', bg: '#ffffff', label: '经典黑白' },
  { fg: '#6366f1', bg: '#eef2ff', label: '靛紫' },
  { fg: '#E91E8C', bg: '#fff0f8', label: '粉红' },
  { fg: '#0ea5e9', bg: '#f0f9ff', label: '天蓝' },
  { fg: '#10b981', bg: '#f0fdf4', label: '翠绿' },
  { fg: '#f59e0b', bg: '#fffbeb', label: '琥珀' },
  { fg: '#ef4444', bg: '#fef2f2', label: '朱红' },
  { fg: '#ffffff', bg: '#1e293b', label: '深夜' },
];

// ─── label ────────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--muted-foreground)',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {children}
    </div>
  );
}

// ─── section card ─────────────────────────────────────────────────────────────
function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── color swatch ─────────────────────────────────────────────────────────────
function ColorSwatch({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      <Label>{label}</Label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: value,
          border: '2px solid var(--border)',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--foreground)', fontWeight: 600 }}>
          {value.toUpperCase()}
        </span>
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: 0, height: 0, opacity: 0, position: 'absolute', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function QrCodePage() {
  const [text, setText] = useState('https://example.com');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20); // % of qr size
  const [generating, setGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── generate QR on canvas ──────────────────────────────────────────────────
  const generate = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!text.trim()) {
      // clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = size;
        canvas.height = size;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
      }
      return;
    }

    setGenerating(true);
    try {
      await QRCode.toCanvas(canvas, text.trim(), {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });

      // overlay logo
      if (logoSrc) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            const lSize = Math.round((size * logoSize) / 100);
            const lx = Math.round((size - lSize) / 2);
            const ly = Math.round((size - lSize) / 2);

            // white bg pad for logo
            const pad = 6;
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.roundRect(lx - pad, ly - pad, lSize + pad * 2, lSize + pad * 2, 8);
            ctx.fill();

            // draw logo
            ctx.drawImage(img, lx, ly, lSize, lSize);
          };
          img.src = logoSrc;
        }
      }
    } catch (err) {
      console.error('QR generate error', err);
      toast.error('二维码生成失败，请检查输入内容');
    } finally {
      setGenerating(false);
    }
  }, [text, size, fgColor, bgColor, errorLevel, logoSrc, logoSize]);

  useEffect(() => {
    generate();
  }, [generate]);

  // ── download ──────────────────────────────────────────────────────────────
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('二维码已下载为 PNG');
    }, 'image/png');
  };

  // ── logo upload ───────────────────────────────────────────────────────────
  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      setLogoSrc(ev.target?.result as string);
      // force H level when logo present
      setErrorLevel('H');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeLogo = () => {
    setLogoSrc(null);
    setErrorLevel('M');
  };

  // ── apply color preset ────────────────────────────────────────────────────
  const applyPreset = (p: typeof COLOR_PRESETS[0]) => {
    setFgColor(p.fg);
    setBgColor(p.bg);
  };

  const isEmpty = !text.trim();

  return (
    <AdminLayout>
      <div
        data-cmp="QrCodePage"
        style={{
          minHeight: '100%',
          background: 'var(--background)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>
            二维码生成器
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            输入文本或链接，实时生成二维码，支持自定义颜色、尺寸、嵌入 Logo 并下载 PNG
          </p>
        </div>

        {/* main layout: left controls + right preview */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── LEFT: controls ── */}
          <div style={{ flex: '1 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* content input */}
            <Section>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <QrCodeIcon size={15} style={{ color: 'var(--primary)' }} />
                二维码内容
              </div>
              <div>
                <Label>文本 / 链接 / 任意内容</Label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  rows={4}
                  placeholder="输入要编码的文本或网址…"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    background: 'var(--background)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 10,
                    fontSize: 14,
                    color: 'var(--foreground)',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 5, textAlign: 'right' }}>
                  {text.length} 字符
                </div>
              </div>
            </Section>

            {/* size */}
            <Section>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>尺寸设置</div>

              {/* presets */}
              <div>
                <Label>快速选择</Label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {SIZE_PRESETS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setSize(p.value)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        border: size === p.value ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: size === p.value
                          ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
                          : 'var(--background)',
                        color: size === p.value ? 'var(--primary)' : 'var(--muted-foreground)',
                        borderRadius: 9,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <span>{p.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 400 }}>{p.value}px</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* custom slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Label>自定义尺寸</Label>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{size} px</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={600}
                  step={4}
                  value={size}
                  onChange={e => setSize(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
                  <span>100</span><span>600</span>
                </div>
              </div>
            </Section>

            {/* colors */}
            <Section>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>颜色配置</div>

              {/* preset swatches */}
              <div>
                <Label>预设配色</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {COLOR_PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p)}
                      title={p.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '5px 10px',
                        borderRadius: 99,
                        border: fgColor === p.fg && bgColor === p.bg
                          ? '2px solid var(--primary)'
                          : '1.5px solid var(--border)',
                        background: p.bg,
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 3 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: p.fg }} />
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: p.bg, border: '1px solid rgba(0,0,0,0.1)' }} />
                      </div>
                      <span style={{ fontSize: 11, color: p.fg, fontWeight: 600 }}>{p.label}</span>
                      {fgColor === p.fg && bgColor === p.bg && (
                        <CheckIcon size={11} style={{ color: 'var(--primary)' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* manual color pickers */}
              <div style={{ display: 'flex', gap: 12 }}>
                <ColorSwatch value={fgColor} onChange={setFgColor} label="前景色（码点）" />
                <ColorSwatch value={bgColor} onChange={setBgColor} label="背景色" />
              </div>
            </Section>

            {/* error correction + logo */}
            <Section>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>高级选项</div>

              {/* error correction */}
              <div>
                <Label>纠错等级</Label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['L', 'M', 'Q', 'H'] as const).map(lv => (
                    <button
                      key={lv}
                      onClick={() => setErrorLevel(lv)}
                      style={{
                        flex: 1,
                        padding: '7px 0',
                        border: errorLevel === lv ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: errorLevel === lv
                          ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
                          : 'var(--background)',
                        color: errorLevel === lv ? 'var(--primary)' : 'var(--muted-foreground)',
                        borderRadius: 9,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                      }}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 6 }}>
                  {errorLevel === 'L' && '7% 纠错 — 最高密度，适合干净场景'}
                  {errorLevel === 'M' && '15% 纠错 — 推荐默认配置'}
                  {errorLevel === 'Q' && '25% 纠错 — 适合轻微遮挡场景'}
                  {errorLevel === 'H' && '30% 纠错 — 最强容错，嵌入 Logo 必选'}
                </div>
              </div>

              {/* logo upload */}
              <div>
                <Label>嵌入 Logo</Label>
                {logoSrc ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: 'var(--background)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 10,
                  }}>
                    <img
                      src={logoSrc}
                      alt="logo"
                      style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border)' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)' }}>Logo 已上传</div>
                      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
                        占二维码 {logoSize}%（已自动切换 H 级纠错）
                      </div>
                    </div>
                    <button
                      onClick={removeLogo}
                      style={{
                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--border)', background: 'var(--card)', borderRadius: 7,
                        cursor: 'pointer', color: 'var(--muted-foreground)',
                      }}
                      title="移除 Logo"
                    >
                      <XIcon size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 0',
                      border: '1.5px dashed var(--border)',
                      background: 'var(--background)',
                      borderRadius: 10,
                      cursor: 'pointer',
                      color: 'var(--muted-foreground)',
                      fontSize: 13,
                      fontWeight: 600,
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
                  >
                    <UploadCloudIcon size={15} />
                    点击上传 Logo 图片
                  </button>
                )}

                {/* logo size slider */}
                <div className={logoSrc ? '' : 'hidden'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
                    <Label>Logo 大小</Label>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{logoSize}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={35}
                    step={1}
                    value={logoSize}
                    onChange={e => setLogoSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
                    <span>10% 最小</span><span>35% 最大</span>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* ── RIGHT: preview ── */}
          <div style={{
            width: 320,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            position: 'sticky',
            top: 24,
          }}>
            {/* qr preview card */}
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 18,
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 7 }}>
                <QrCodeIcon size={15} style={{ color: 'var(--primary)' }} />
                实时预览
                {generating && (
                  <RefreshCwIcon size={13} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                )}
              </div>

              {/* canvas wrapper */}
              <div style={{
                padding: 12,
                background: bgColor,
                borderRadius: 16,
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                transition: 'background 0.2s',
                position: 'relative',
              }}>
                {isEmpty && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 8, borderRadius: 16,
                    background: 'color-mix(in srgb, var(--card) 90%, transparent)',
                  }}>
                    <ImageIcon size={32} style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
                    <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>请输入内容</span>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  style={{
                    display: 'block',
                    maxWidth: 260,
                    maxHeight: 260,
                    width: '100%',
                    height: 'auto',
                    borderRadius: 8,
                    opacity: isEmpty ? 0.1 : 1,
                    transition: 'opacity 0.2s',
                  }}
                />
              </div>

              {/* meta */}
              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                {[
                  { label: '输出尺寸', value: `${size} × ${size} px` },
                  { label: '纠错等级', value: `${errorLevel} 级` },
                  { label: '前景色', value: fgColor.toUpperCase() },
                  { label: '背景色', value: bgColor.toUpperCase() },
                  { label: 'Logo', value: logoSrc ? `已嵌入（${logoSize}%）` : '未设置' },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    padding: '5px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
                    <span style={{ color: 'var(--foreground)', fontWeight: 600, fontFamily: 'monospace' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* download button */}
              <button
                onClick={handleDownload}
                disabled={isEmpty}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: isEmpty ? 'var(--muted)' : 'var(--primary)',
                  color: isEmpty ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: isEmpty ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <DownloadIcon size={16} />
                下载 PNG
              </button>
            </div>

            {/* tips */}
            <div style={{
              background: 'color-mix(in srgb, var(--primary) 5%, var(--card))',
              border: '1px solid color-mix(in srgb, var(--primary) 18%, var(--border))',
              borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--primary)', marginBottom: 8 }}>
                💡 使用建议
              </div>
              {[
                '嵌入 Logo 时建议选择 H 级纠错（已自动切换）',
                'Logo 占比建议不超过二维码面积 30%',
                '前景色与背景色对比度越高扫描越稳定',
                '下载的 PNG 可直接用于印刷物料',
                '链接、名片、WiFi 密码等均可编码',
              ].map((tip, i) => (
                <div key={i} style={{
                  fontSize: 11,
                  color: 'var(--muted-foreground)',
                  lineHeight: 1.7,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 5,
                }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>·</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* hidden file input */}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onLogoChange}
        />

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </AdminLayout>
  );
}
