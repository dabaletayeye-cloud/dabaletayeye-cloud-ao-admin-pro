import { useState, useRef, useCallback, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'sonner';
import {
  UploadCloudIcon,
  RotateCwIcon,
  RotateCcwIcon,
  ZoomInIcon,
  ZoomOutIcon,
  LockIcon,
  UnlockIcon,
  DownloadIcon,
  RefreshCwIcon,
  CheckIcon,
  ImageIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type AspectRatio = 'free' | '1:1' | '16:9' | '4:3' | '3:2';

interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '自由', value: 'free' },
  { label: '1 : 1', value: '1:1' },
  { label: '16 : 9', value: '16:9' },
  { label: '4 : 3', value: '4:3' },
  { label: '3 : 2', value: '3:2' },
];

function getRatioNum(r: AspectRatio): number | null {
  if (r === 'free') return null;
  const [a, b] = r.split(':').map(Number);
  return a / b;
}

// ─── Canvas crop util ─────────────────────────────────────────────────────────
function cropToCanvas(
  img: HTMLImageElement,
  cropBox: CropBox,
  displayW: number,
  displayH: number,
  rotation: number,
  scale: number,
): HTMLCanvasElement {
  // cropBox is in display coordinates; map back to natural image coords
  const scaleX = img.naturalWidth / displayW;
  const scaleY = img.naturalHeight / displayH;

  const canvas = document.createElement('canvas');
  const cropW = cropBox.w * scaleX;
  const cropH = cropBox.h * scaleY;
  canvas.width  = Math.round(cropW);
  canvas.height = Math.round(cropH);

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.drawImage(
    img,
    cropBox.x * scaleX,
    cropBox.y * scaleY,
    cropW,
    cropH,
    -cropW / 2,
    -cropH / 2,
    cropW,
    cropH,
  );
  ctx.restore();
  return canvas;
}

// ─── Draggable crop overlay ────────────────────────────────────────────────────
type DragHandle =
  | 'move'
  | 'nw' | 'ne' | 'sw' | 'se'
  | 'n'  | 's'  | 'w'  | 'e';

const HANDLE_SIZE = 10;
const MIN_SIZE = 40;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ImageCropPage() {
  const [imgSrc, setImgSrc]       = useState<string | null>(null);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });

  const [cropBox, setCropBox]     = useState<CropBox>({ x: 20, y: 20, w: 200, h: 200 });
  const [rotation, setRotation]   = useState(0);
  const [scale, setScale]         = useState(1);
  const [ratio, setRatio]         = useState<AspectRatio>('free');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragState    = useRef<{
    handle: DragHandle;
    startX: number; startY: number;
    startBox: CropBox;
  } | null>(null);

  // ── load image ───────────────────────────────────────────────────────────────
  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    setRotation(0);
    setScale(1);
    setPreviewUrl(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  // ── once image loads, set display size & default cropBox ─────────────────────
  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
    const dw = img.offsetWidth;
    const dh = img.offsetHeight;
    setDisplaySize({ w: dw, h: dh });
    // default crop: 70% centered
    const cw = Math.round(dw * 0.7);
    const ch = Math.round(dh * 0.7);
    setCropBox({ x: Math.round((dw - cw) / 2), y: Math.round((dh - ch) / 2), w: cw, h: ch });
  };

  // ── enforce ratio ─────────────────────────────────────────────────────────────
  const applyRatio = useCallback((box: CropBox, ar: AspectRatio, maxW: number, maxH: number): CropBox => {
    const r = getRatioNum(ar);
    if (!r) return box;
    let w = box.w;
    let h = Math.round(w / r);
    if (h > maxH) { h = maxH; w = Math.round(h * r); }
    if (w > maxW) { w = maxW; h = Math.round(w / r); }
    return { ...box, w: Math.max(MIN_SIZE, w), h: Math.max(MIN_SIZE, h) };
  }, []);

  const setRatioAndUpdate = (ar: AspectRatio) => {
    setRatio(ar);
    setCropBox(prev => applyRatio(prev, ar, displaySize.w, displaySize.h));
  };

  // ── mouse drag ────────────────────────────────────────────────────────────────
  const onHandleMouseDown = (e: React.MouseEvent, handle: DragHandle) => {
    e.preventDefault();
    e.stopPropagation();
    dragState.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...cropBox },
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current) return;
      const { handle, startX, startY, startBox } = dragState.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dw = displaySize.w;
      const dh = displaySize.h;
      const r  = getRatioNum(ratio);

      let { x, y, w, h } = startBox;

      if (handle === 'move') {
        x = clamp(x + dx, 0, dw - w);
        y = clamp(y + dy, 0, dh - h);
      } else {
        // resize handles
        let newX = x, newY = y, newW = w, newH = h;

        if (handle.includes('e')) newW = clamp(w + dx, MIN_SIZE, dw - x);
        if (handle.includes('s')) newH = clamp(h + dy, MIN_SIZE, dh - y);
        if (handle.includes('w')) {
          const dxClamped = clamp(dx, x + w - dw, w - MIN_SIZE);
          // actually allow shrink from left
          const maxLeft = x + w - MIN_SIZE;
          newX = clamp(x + dx, 0, maxLeft);
          newW = x + w - newX;
        }
        if (handle.includes('n')) {
          const maxTop = y + h - MIN_SIZE;
          newY = clamp(y + dy, 0, maxTop);
          newH = y + h - newY;
        }

        // enforce ratio
        if (r) {
          if (handle.includes('e') || handle.includes('w')) {
            newH = Math.round(newW / r);
          } else {
            newW = Math.round(newH * r);
          }
          // clamp again after ratio
          if (newX + newW > dw) { newW = dw - newX; newH = Math.round(newW / r); }
          if (newY + newH > dh) { newH = dh - newY; newW = Math.round(newH * r); }
        }

        x = newX; y = newY; w = newW; h = newH;
      }

      setCropBox({ x, y, w, h });
    };

    const onUp = () => { dragState.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [displaySize, ratio]);

  // ── generate preview ──────────────────────────────────────────────────────────
  const generatePreview = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = cropToCanvas(img, cropBox, displaySize.w, displaySize.h, rotation, scale);
    setPreviewUrl(canvas.toDataURL('image/png'));
  }, [cropBox, displaySize, rotation, scale]);

  // auto-update preview
  useEffect(() => {
    if (imgSrc) generatePreview();
  }, [cropBox, rotation, scale, imgSrc, generatePreview]);

  // ── download ──────────────────────────────────────────────────────────────────
  const handleDownload = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = cropToCanvas(img, cropBox, displaySize.w, displaySize.h, rotation, scale);
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cropped.png';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('裁剪图片已下载');
    }, 'image/png');
  };

  // ── reset ─────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setRotation(0);
    setScale(1);
    setRatio('free');
    if (displaySize.w) {
      const cw = Math.round(displaySize.w * 0.7);
      const ch = Math.round(displaySize.h * 0.7);
      setCropBox({ x: Math.round((displaySize.w - cw) / 2), y: Math.round((displaySize.h - ch) / 2), w: cw, h: ch });
    }
  };

  // ── cursor map ────────────────────────────────────────────────────────────────
  const handleCursorMap: Record<DragHandle, string> = {
    move: 'move',
    nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
    n: 'n-resize',   s: 's-resize',   w: 'w-resize',   e: 'e-resize',
  };

  const cornerHandles: { pos: DragHandle; style: React.CSSProperties }[] = [
    { pos: 'nw', style: { top: -HANDLE_SIZE/2, left: -HANDLE_SIZE/2 } },
    { pos: 'ne', style: { top: -HANDLE_SIZE/2, right: -HANDLE_SIZE/2 } },
    { pos: 'sw', style: { bottom: -HANDLE_SIZE/2, left: -HANDLE_SIZE/2 } },
    { pos: 'se', style: { bottom: -HANDLE_SIZE/2, right: -HANDLE_SIZE/2 } },
  ];

  const edgeHandles: { pos: DragHandle; style: React.CSSProperties }[] = [
    { pos: 'n', style: { top: -HANDLE_SIZE/2, left: '50%', transform: 'translateX(-50%)' } },
    { pos: 's', style: { bottom: -HANDLE_SIZE/2, left: '50%', transform: 'translateX(-50%)' } },
    { pos: 'w', style: { top: '50%', left: -HANDLE_SIZE/2, transform: 'translateY(-50%)' } },
    { pos: 'e', style: { top: '50%', right: -HANDLE_SIZE/2, transform: 'translateY(-50%)' } },
  ];

  return (
    <AdminLayout>
      <div
        data-cmp="ImageCropPage"
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
            图像裁剪
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            上传图片，拖动裁剪框，支持旋转 / 缩放 / 比例锁定，右侧实时预览
          </p>
        </div>

        {/* main layout */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* ── LEFT: editor area ── */}
          <div style={{ flex: '1 1 500px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* toolbar */}
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '12px 16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
            }}>
              {/* ratio pills */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 600, marginRight: 2 }}>比例</span>
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRatioAndUpdate(r.value)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 99,
                      border: ratio === r.value ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      background: ratio === r.value ? 'var(--primary)' : 'var(--card)',
                      color: ratio === r.value ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                      fontSize: 12, fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

              {/* rotate */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 600 }}>旋转</span>
                <button
                  onClick={() => setRotation(r => r - 90)}
                  style={tbtnStyle}
                  title="逆时针 90°"
                >
                  <RotateCcwIcon size={14} />
                </button>
                <span style={{
                  fontSize: 12, fontWeight: 700, minWidth: 36, textAlign: 'center',
                  color: 'var(--foreground)',
                }}>
                  {rotation}°
                </span>
                <button
                  onClick={() => setRotation(r => r + 90)}
                  style={tbtnStyle}
                  title="顺时针 90°"
                >
                  <RotateCwIcon size={14} />
                </button>
              </div>

              <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

              {/* scale */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 600 }}>缩放</span>
                <button
                  onClick={() => setScale(s => Math.max(0.2, +(s - 0.1).toFixed(1)))}
                  style={tbtnStyle}
                  title="缩小"
                >
                  <ZoomOutIcon size={14} />
                </button>
                <span style={{
                  fontSize: 12, fontWeight: 700, minWidth: 36, textAlign: 'center',
                  color: 'var(--foreground)',
                }}>
                  {(scale * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() => setScale(s => Math.min(3, +(s + 0.1).toFixed(1)))}
                  style={tbtnStyle}
                  title="放大"
                >
                  <ZoomInIcon size={14} />
                </button>
              </div>

              <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

              {/* ratio lock indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted-foreground)', fontSize: 12 }}>
                {ratio !== 'free'
                  ? <><LockIcon size={12} style={{ color: 'var(--primary)' }} /><span style={{ color: 'var(--primary)', fontWeight: 600 }}>比例已锁</span></>
                  : <><UnlockIcon size={12} /><span>自由裁剪</span></>
                }
              </div>

              <button
                onClick={handleReset}
                style={{ ...tbtnStyle, marginLeft: 'auto', padding: '4px 12px', gap: 5, display: 'flex', alignItems: 'center', fontSize: 12 }}
                title="重置"
              >
                <RefreshCwIcon size={13} />
                重置
              </button>
            </div>

            {/* ── canvas container ── */}
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                overflow: 'hidden',
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
            >
              {!imgSrc ? (
                /* upload placeholder */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    padding: '60px 40px',
                    cursor: 'pointer',
                    color: 'var(--muted-foreground)',
                    userSelect: 'none',
                  }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)',
                  }}>
                    <UploadCloudIcon size={28} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>点击上传或拖拽图片</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12 }}>支持 JPG / PNG / WEBP / GIF</p>
                  </div>
                </div>
              ) : (
                /* crop editor */
                <div
                  ref={containerRef}
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    userSelect: 'none',
                  }}
                >
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    onLoad={onImgLoad}
                    alt="source"
                    style={{
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: 480,
                      transform: `rotate(${rotation}deg) scale(${scale})`,
                      transition: 'transform 0.2s',
                      pointerEvents: 'none',
                      objectFit: 'contain',
                    }}
                  />

                  {/* dark mask */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    pointerEvents: 'none',
                  }} />

                  {/* crop box */}
                  <div
                    onMouseDown={e => onHandleMouseDown(e, 'move')}
                    style={{
                      position: 'absolute',
                      left: cropBox.x,
                      top: cropBox.y,
                      width: cropBox.w,
                      height: cropBox.h,
                      boxSizing: 'border-box',
                      border: '2px solid var(--primary)',
                      background: 'transparent',
                      cursor: handleCursorMap['move'],
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
                    }}
                  >
                    {/* rule-of-thirds grid */}
                    {[1/3, 2/3].map(f => (
                      <div key={`v${f}`} style={{
                        position: 'absolute', top: 0, bottom: 0,
                        left: `${f * 100}%`,
                        width: 1,
                        background: 'rgba(255,255,255,0.25)',
                        pointerEvents: 'none',
                      }} />
                    ))}
                    {[1/3, 2/3].map(f => (
                      <div key={`h${f}`} style={{
                        position: 'absolute', left: 0, right: 0,
                        top: `${f * 100}%`,
                        height: 1,
                        background: 'rgba(255,255,255,0.25)',
                        pointerEvents: 'none',
                      }} />
                    ))}

                    {/* corner handles */}
                    {cornerHandles.map(h => (
                      <div
                        key={h.pos}
                        onMouseDown={e => onHandleMouseDown(e, h.pos)}
                        style={{
                          position: 'absolute',
                          width: HANDLE_SIZE,
                          height: HANDLE_SIZE,
                          background: 'var(--primary)',
                          border: '2px solid #fff',
                          borderRadius: 2,
                          cursor: handleCursorMap[h.pos],
                          zIndex: 10,
                          ...h.style,
                        }}
                      />
                    ))}

                    {/* edge handles */}
                    {edgeHandles.map(h => (
                      <div
                        key={h.pos}
                        onMouseDown={e => onHandleMouseDown(e, h.pos)}
                        style={{
                          position: 'absolute',
                          width: h.pos === 'n' || h.pos === 's' ? HANDLE_SIZE : HANDLE_SIZE * 0.8,
                          height: h.pos === 'w' || h.pos === 'e' ? HANDLE_SIZE : HANDLE_SIZE * 0.8,
                          background: 'var(--primary)',
                          border: '2px solid #fff',
                          borderRadius: 2,
                          cursor: handleCursorMap[h.pos],
                          zIndex: 9,
                          ...h.style,
                        }}
                      />
                    ))}
                  </div>

                  {/* size label */}
                  <div style={{
                    position: 'absolute',
                    top: cropBox.y + cropBox.h + 6,
                    left: cropBox.x,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    fontSize: 11,
                    padding: '2px 7px',
                    borderRadius: 5,
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                  }}>
                    {cropBox.w} × {cropBox.h}
                  </div>
                </div>
              )}
            </div>

            {/* re-upload */}
            {imgSrc && (
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  alignSelf: 'flex-start',
                  display: 'flex', alignItems: 'center', gap: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  borderRadius: 8, padding: '7px 14px',
                  fontSize: 13, cursor: 'pointer',
                  color: 'var(--muted-foreground)',
                }}
              >
                <ImageIcon size={13} />
                更换图片
              </button>
            )}
          </div>

          {/* ── RIGHT: preview + download ── */}
          <div style={{
            width: 260,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>实时预览</div>

              {/* preview image */}
              <div style={{
                width: '100%',
                aspectRatio: '1',
                background: 'var(--muted)',
                borderRadius: 10,
                border: '1px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    color: 'var(--muted-foreground)', fontSize: 12,
                  }}>
                    <ImageIcon size={28} style={{ opacity: 0.3 }} />
                    <span>上传图片后预览</span>
                  </div>
                )}
              </div>

              {/* info */}
              {imgSrc && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: '原始尺寸', value: `${imgNatural.w} × ${imgNatural.h} px` },
                    { label: '裁剪区域', value: `${cropBox.w} × ${cropBox.h} px` },
                    { label: '旋转角度', value: `${rotation}°` },
                    { label: '缩放比例', value: `${(scale * 100).toFixed(0)}%` },
                    { label: '宽高比例', value: ratio === 'free' ? '自由' : ratio },
                  ].map(row => (
                    <div key={row.label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 12,
                    }}>
                      <span style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
                      <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* download btn */}
              <button
                onClick={handleDownload}
                disabled={!previewUrl}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 0',
                  background: previewUrl ? 'var(--primary)' : 'var(--muted)',
                  color: previewUrl ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 700,
                  cursor: previewUrl ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
              >
                {previewUrl ? <CheckIcon size={15} /> : <DownloadIcon size={15} />}
                确认裁剪并下载
              </button>
            </div>

            {/* tips */}
            <div style={{
              background: 'color-mix(in srgb, var(--primary) 6%, var(--card))',
              border: '1px solid color-mix(in srgb, var(--primary) 20%, var(--border))',
              borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--primary)', marginBottom: 8 }}>
                💡 使用提示
              </div>
              {[
                '拖动裁剪框中央移动位置',
                '拖动边角/中点调整大小',
                '选择比例可锁定宽高比',
                '旋转按钮每次旋转 90°',
                '缩放仅影响下载结果',
              ].map((tip, i) => (
                <div key={i} style={{
                  fontSize: 11, color: 'var(--muted-foreground)',
                  lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 5,
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
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
      </div>
    </AdminLayout>
  );
}

// ─── shared toolbar button style ─────────────────────────────────────────────
const tbtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  borderRadius: 7,
  width: 28,
  height: 28,
  cursor: 'pointer',
  color: 'var(--foreground)',
  flexShrink: 0,
  padding: 0,
};
