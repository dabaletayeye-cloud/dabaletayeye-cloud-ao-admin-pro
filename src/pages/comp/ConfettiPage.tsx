import { useRef, useCallback, useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  SparklesIcon,
  ZapIcon,
  StarIcon,
  TrophyIcon,
  CheckCircleIcon,
  XIcon,
  PartyPopperIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;       // px from left
  y: number;       // px from top
  vx: number;
  vy: number;
  color: string;
  shape: 'rect' | 'circle' | 'star';
  size: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  gravity: number;
  drag: number;
  life: number;    // 0~1, decreasing
  lifeDecay: number;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const COLORS = [
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4',
  '#10b981', '#a855f7',
];
const GOLD_COLORS = ['#fbbf24', '#f59e0b', '#fcd34d', '#fef08a', '#fffbeb', '#fde68a'];

let pidCounter = 0;

function makeParticle(
  x: number, y: number,
  vx: number, vy: number,
  colors: string[],
  size = 7,
  gravity = 0.18,
  lifeDecay = 0.008,
  shape: Particle['shape'] = 'rect',
): Particle {
  return {
    id: pidCounter++,
    x, y, vx, vy,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape,
    size: size + Math.random() * 4 - 2,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 12,
    opacity: 1,
    gravity,
    drag: 0.97,
    life: 1,
    lifeDecay: lifeDecay + Math.random() * 0.003,
  };
}

// ─────────────────────────────────────────────
// Canvas Confetti Engine
// ─────────────────────────────────────────────
function useConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const running = useRef(false);

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    const spikes = 5;
    const inner = r * 0.4;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const ang = (i * Math.PI) / spikes - Math.PI / 2;
      const rad = i % 2 === 0 ? r : inner;
      ctx.lineTo(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
    }
    ctx.closePath();
  };

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.current = particles.current.filter(p => p.life > 0 && p.opacity > 0);

    for (const p of particles.current) {
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.life -= p.lifeDecay;
      p.opacity = Math.max(0, p.life);

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawStar(ctx, 0, 0, p.size / 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (particles.current.length > 0 || running.current) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      rafRef.current = 0;
    }
  }, []);

  const ensureLoop = useCallback(() => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(loop);
    }
  }, [loop]);

  const addParticles = useCallback((newOnes: Particle[]) => {
    particles.current.push(...newOnes);
    ensureLoop();
  }, [ensureLoop]);

  // Resize canvas to fill window
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { canvasRef, addParticles, running };
}

// ─────────────────────────────────────────────
// Effect launchers
// ─────────────────────────────────────────────
function fireBurst(
  addParticles: (p: Particle[]) => void,
  cx: number, cy: number,
  count: number,
  colors: string[],
  speed = 14,
  shape: Particle['shape'] = 'rect',
) {
  const list: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * Math.PI * 2);
    const s = speed * (0.4 + Math.random() * 0.6);
    list.push(makeParticle(cx, cy, Math.cos(angle) * s, Math.sin(angle) * s, colors, 8, 0.22, 0.007, shape));
  }
  addParticles(list);
}

function fireSide(
  addParticles: (p: Particle[]) => void,
  fromLeft: boolean,
  count: number,
) {
  const list: Particle[] = [];
  const x = fromLeft ? 0 : window.innerWidth;
  const y = window.innerHeight;
  const baseAngle = fromLeft ? -Math.PI * 0.7 : -Math.PI * 0.3;
  const spread = Math.PI * 0.5;
  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (Math.random() - 0.5) * spread;
    const s = 14 + Math.random() * 10;
    const shape: Particle['shape'] = Math.random() < 0.4 ? 'circle' : 'rect';
    list.push(makeParticle(x, y, Math.cos(angle) * s, Math.sin(angle) * s, COLORS, 9, 0.3, 0.006, shape));
  }
  addParticles(list);
}

function rainStars(
  addParticles: (p: Particle[]) => void,
  count: number,
) {
  const list: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * window.innerWidth;
    const vy = 2 + Math.random() * 3;
    list.push(makeParticle(x, -10, (Math.random() - 0.5) * 1.5, vy, GOLD_COLORS, 10, 0.05, 0.004, 'star'));
  }
  addParticles(list);
}

// ─────────────────────────────────────────────
// Section card wrapper
// ─────────────────────────────────────────────
function DemoCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-px-slot
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '28px 32px',
        flex: 1,
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Celebration Modal
// ─────────────────────────────────────────────
interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
}
function CelebrationModal({ open, onClose }: CelebrationModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.25s',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 24,
          padding: '48px 56px',
          textAlign: 'center',
          position: 'relative',
          maxWidth: 420,
          width: '90%',
          transform: open ? 'scale(1)' : 'scale(0.85)',
          transition: 'transform 0.3s cubic-bezier(.34,1.56,.64,1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--muted)', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted-foreground)',
          }}
        >
          <XIcon size={16} />
        </button>

        {/* Trophy icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 40,
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 32px rgba(251,191,36,0.4)',
        }}>
          <TrophyIcon size={36} style={{ color: '#fff' }} />
        </div>

        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--foreground)', marginBottom: 8 }}>
          🎉 操作成功！
        </div>
        <div style={{ fontSize: 15, color: 'var(--muted-foreground)', lineHeight: 1.7, marginBottom: 32 }}>
          恭喜你完成了这次操作<br />
          所有数据已成功保存并生效
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 32px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
              color: '#fff', fontWeight: 700, fontSize: 14,
              boxShadow: '0 4px 16px rgba(var(--theme-primary-rgb, 99,102,241),0.35)',
            }}
          >
            太棒了 🎊
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 32px', borderRadius: 10, cursor: 'pointer',
              background: 'var(--muted)', border: '1px solid var(--border)',
              color: 'var(--foreground)', fontWeight: 600, fontSize: 14,
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function ConfettiPage() {
  const { canvasRef, addParticles, running } = useConfettiCanvas();
  const [modalOpen, setModalOpen] = useState(false);
  const sideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rainTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sideActive, setSideActive] = useState(false);
  const [rainActive, setRainActive] = useState(false);

  // ── 中心喷射 ──
  const handleCenterBurst = useCallback(() => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    fireBurst(addParticles, cx, cy, 180, COLORS, 18, 'rect');
    setTimeout(() => fireBurst(addParticles, cx, cy, 120, COLORS, 12, 'circle'), 120);
    setTimeout(() => fireBurst(addParticles, cx, cy, 80, COLORS, 20, 'star'), 240);
  }, [addParticles]);

  // ── 两侧连发 ──
  const handleSideVolley = useCallback(() => {
    if (sideActive) return;
    setSideActive(true);
    running.current = true;
    let turn = 0;
    fireSide(addParticles, true, 90);
    sideTimerRef.current = setInterval(() => {
      turn++;
      fireSide(addParticles, turn % 2 === 0, 90);
      if (turn >= 5) {
        clearInterval(sideTimerRef.current!);
        sideTimerRef.current = null;
        running.current = false;
        setSideActive(false);
      }
    }, 500);
  }, [addParticles, running, sideActive]);

  // ── 星星雨 ──
  const handleStarRain = useCallback(() => {
    if (rainActive) return;
    setRainActive(true);
    running.current = true;
    let ticks = 0;
    rainStars(addParticles, 40);
    rainTimerRef.current = setInterval(() => {
      ticks++;
      rainStars(addParticles, 30);
      if (ticks >= 10) {
        clearInterval(rainTimerRef.current!);
        rainTimerRef.current = null;
        running.current = false;
        setRainActive(false);
      }
    }, 300);
  }, [addParticles, running, rainActive]);

  // ── 组合演示 ──
  const handleCombo = useCallback(() => {
    setModalOpen(true);
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    // Burst from center
    fireBurst(addParticles, cx, cy, 160, COLORS, 20, 'rect');
    setTimeout(() => fireBurst(addParticles, cx, cy, 100, COLORS, 15, 'circle'), 100);
    // Side volleys
    setTimeout(() => fireSide(addParticles, true, 80), 200);
    setTimeout(() => fireSide(addParticles, false, 80), 500);
    setTimeout(() => fireSide(addParticles, true, 80), 800);
    setTimeout(() => fireSide(addParticles, false, 80), 1100);
    // Star rain
    running.current = true;
    let rainTicks = 0;
    rainStars(addParticles, 30);
    const ri = setInterval(() => {
      rainTicks++;
      rainStars(addParticles, 25);
      if (rainTicks >= 8) {
        clearInterval(ri);
        running.current = false;
      }
    }, 300);
  }, [addParticles, running]);

  useEffect(() => {
    return () => {
      if (sideTimerRef.current) clearInterval(sideTimerRef.current);
      if (rainTimerRef.current) clearInterval(rainTimerRef.current);
    };
  }, []);

  return (
    <AdminLayout>
      {/* Full-screen canvas overlay (pointer-events: none so it doesn't block clicks) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 8888,
          pointerEvents: 'none',
        }}
      />

      <CelebrationModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <div data-cmp="ConfettiPage" style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--background)' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #f43f5e, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PartyPopperIcon size={18} style={{ color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>
              礼花动画
            </h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)', margin: 0, paddingLeft: 46 }}>
            点击按钮触发各种礼花效果，使用 Canvas + RAF 渲染，零依赖纯原生实现
          </p>
        </div>

        {/* ── 三个独立效果卡 ── */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>

          {/* 1. 中心喷射 */}
          <DemoCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <SparklesIcon size={15} style={{ color: '#fff' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>中心喷射</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 20, lineHeight: 1.6 }}>
              彩色纸屑从屏幕正中心向四面八方炸开，矩形、圆形、星星三波齐发，视觉冲击最强。
            </p>
            <div style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))',
              border: '1px dashed rgba(139,92,246,0.3)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              minHeight: 80,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 4 }}>🎆</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>360° 全向爆炸</div>
              </div>
            </div>
            <button
              onClick={handleCenterBurst}
              style={{
                width: '100%', padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <SparklesIcon size={15} />
              触发中心爆炸
            </button>
          </DemoCard>

          {/* 2. 两侧连发 */}
          <DemoCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #f43f5e, #f97316)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ZapIcon size={15} style={{ color: '#fff' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>两侧连发</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 20, lineHeight: 1.6 }}>
              左右下角交替发射，共六波连续炮击，像烟火表演一样此起彼伏，持续约3秒。
            </p>
            <div style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(244,63,94,0.08), rgba(249,115,22,0.08))',
              border: '1px dashed rgba(244,63,94,0.3)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              minHeight: 80,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28 }}>🎇</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>左炮</div>
              </div>
              <div style={{ fontSize: 18, color: 'var(--muted-foreground)' }}>⟷</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28 }}>🎇</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>右炮</div>
              </div>
            </div>
            <button
              onClick={handleSideVolley}
              disabled={sideActive}
              style={{
                width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                cursor: sideActive ? 'not-allowed' : 'pointer',
                background: sideActive
                  ? 'var(--muted)'
                  : 'linear-gradient(135deg, #f43f5e, #f97316)',
                color: sideActive ? 'var(--muted-foreground)' : '#fff',
                fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'opacity 0.15s',
              }}
            >
              <ZapIcon size={15} />
              {sideActive ? '发射中…' : '触发两侧连发'}
            </button>
          </DemoCard>

          {/* 3. 星星雨 */}
          <DemoCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <StarIcon size={15} style={{ color: '#fff' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>星星雨</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 20, lineHeight: 1.6 }}>
              金色五角星从屏幕顶部随机飘落，轻盈旋转，持续约3秒，营造梦幻的降星氛围。
            </p>
            <div style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.08))',
              border: '1px dashed rgba(251,191,36,0.4)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              minHeight: 80,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, letterSpacing: 6 }}>✦ ✦ ✦</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>金色星星飘落</div>
              </div>
            </div>
            <button
              onClick={handleStarRain}
              disabled={rainActive}
              style={{
                width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                cursor: rainActive ? 'not-allowed' : 'pointer',
                background: rainActive
                  ? 'var(--muted)'
                  : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: rainActive ? 'var(--muted-foreground)' : '#fff',
                fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'opacity 0.15s',
              }}
            >
              <StarIcon size={15} />
              {rainActive ? '飘落中…' : '触发星星雨'}
            </button>
          </DemoCard>
        </div>

        {/* ── 组合演示卡 ── */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative gradient bg */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(251,191,36,0.05) 50%, rgba(244,63,94,0.05) 100%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <TrophyIcon size={22} style={{ color: '#f59e0b' }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>
                🎊 组合演示
              </h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted-foreground)', marginBottom: 28, lineHeight: 1.7 }}>
              点击下方按钮，将同时触发所有礼花效果（中心爆炸 + 两侧连发 + 星星雨），并弹出"操作成功"庆祝弹窗。
              适合用于重要操作完成后的庆祝反馈场景。
            </p>

            {/* Feature tags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
              {[
                { icon: '🎆', label: '中心爆炸' },
                { icon: '🎇', label: '左右连发' },
                { icon: '✦', label: '星星雨' },
                { icon: '🏆', label: '庆祝弹窗' },
                { icon: '⚡', label: '同步触发' },
              ].map(tag => (
                <span
                  key={tag.label}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 20,
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    fontSize: 13, color: 'var(--foreground)', fontWeight: 500,
                  }}
                >
                  {tag.icon} {tag.label}
                </span>
              ))}
            </div>

            <button
              onClick={handleCombo}
              style={{
                padding: '14px 48px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #f43f5e 0%, #f97316 35%, #fbbf24 65%, #8b5cf6 100%)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 16,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 24px rgba(244,63,94,0.35)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(244,63,94,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(244,63,94,0.35)';
              }}
            >
              <CheckCircleIcon size={18} />
              操作成功 — 点我庆祝！
            </button>

            {/* Implementation note */}
            <div style={{
              marginTop: 28,
              padding: '16px 20px',
              borderRadius: 10,
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 18, marginTop: 1 }}>💡</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)', marginBottom: 4 }}>
                  实现原理
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
                  使用单个全屏 <code style={{ background: 'var(--background)', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>canvas</code> 覆盖层（<code style={{ background: 'var(--background)', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>pointer-events: none</code>），
                  通过 <code style={{ background: 'var(--background)', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>requestAnimationFrame</code> 驱动粒子物理模拟（重力 + 空气阻力 + 旋转），
                  支持矩形纸屑、圆形气泡、五角星三种形状，粒子存活期间逐帧衰减透明度直至消亡。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
