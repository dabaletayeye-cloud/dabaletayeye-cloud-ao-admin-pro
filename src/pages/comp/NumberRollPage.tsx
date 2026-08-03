import { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { RefreshCwIcon, TrendingUpIcon, HashIcon, DollarSignIcon } from 'lucide-react';

// ─── CountUp Hook ─────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, running: boolean) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!running) { setValue(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, running]);

  return value;
}

// ─── Odometer digit ──────────────────────────────────────────────────────────
function OdometerDigit({ digit, delay = 0 }: { digit: number; delay?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimating(true);
      const t2 = setTimeout(() => {
        setDisplayed(digit);
        setAnimating(false);
      }, 350);
      return () => clearTimeout(t2);
    }, delay);
    return () => clearTimeout(t);
  }, [digit, delay]);

  return (
    <div style={{
      width: 36, height: 52, overflow: 'hidden',
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        transform: animating ? 'translateY(-100%)' : 'translateY(0%)',
        transition: animating ? 'transform 0.3s ease-in' : 'none',
        fontSize: 24, fontWeight: 800, lineHeight: 1,
        color: 'var(--primary)', fontVariantNumeric: 'tabular-nums',
        position: 'absolute', top: '50%', marginTop: '-12px',
      }}>
        {displayed}
      </div>
      <div style={{
        transform: animating ? 'translateY(0%)' : 'translateY(100%)',
        transition: animating ? 'transform 0.3s ease-in' : 'none',
        fontSize: 24, fontWeight: 800, lineHeight: 1,
        color: 'var(--primary)', fontVariantNumeric: 'tabular-nums',
        position: 'absolute', top: '50%', marginTop: '-12px',
      }}>
        {digit}
      </div>
      {/* center groove lines */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '50%',
        height: 1, background: 'var(--border)', opacity: 0.6, zIndex: 2,
      }} />
    </div>
  );
}

function OdometerDisplay({ value, prefix = '' }: { value: number; prefix?: string }) {
  const digits = String(value).split('').map(Number);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {prefix && (
        <span style={{
          fontSize: 20, fontWeight: 700, color: 'var(--muted-foreground)',
          alignSelf: 'center',
        }}>{prefix}</span>
      )}
      {digits.map((d, i) => (
        <OdometerDigit key={i} digit={d} delay={i * 80} />
      ))}
    </div>
  );
}

// ─── Flip card digit ─────────────────────────────────────────────────────────
function FlipDigit({ digit }: { digit: number }) {
  const [prev, setPrev] = useState(digit);
  const [cur,  setCur]  = useState(digit);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (digit === cur) return;
    setFlipping(true);
    const t = setTimeout(() => {
      setPrev(cur);
      setCur(digit);
      setFlipping(false);
    }, 300);
    return () => clearTimeout(t);
  }, [digit, cur]);

  return (
    <div style={{
      width: 44, height: 60,
      position: 'relative',
      borderRadius: 8,
      perspective: '200px',
    }}>
      {/* static bottom half */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, var(--card) 50%, color-mix(in srgb, var(--card) 85%, black) 50%)',
        borderRadius: 8, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 900, color: 'var(--primary)',
        fontVariantNumeric: 'tabular-nums',
        border: '1px solid var(--border)',
      }}>
        {cur}
      </div>
      {/* flap */}
      <div style={{
        position: 'absolute', inset: 0,
        transformOrigin: 'center bottom',
        transform: flipping ? 'rotateX(90deg)' : 'rotateX(0deg)',
        transition: 'transform 0.28s ease-in',
        background: 'var(--card)',
        borderRadius: 8, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 900, color: 'var(--primary)',
        fontVariantNumeric: 'tabular-nums',
        border: '1px solid var(--border)',
        clipPath: 'inset(0 0 50% 0)',
        zIndex: 1,
      }}>
        {prev}
      </div>
    </div>
  );
}

function FlipClock({ value }: { value: number }) {
  const digits = String(value).padStart(6, '0').split('').map(Number);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {digits.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FlipDigit digit={d} />
          {(i === 1 || i === 3) && (
            <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', marginBottom: 2 }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Comma format ─────────────────────────────────────────────────────────────
function formatComma(n: number, decimals = 0) {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ─── Section card ─────────────────────────────────────────────────────────────
function DemoCard({
  title,
  description,
  icon,
  onRestart,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onRestart: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: 28,
      display: 'flex', flexDirection: 'column', gap: 20,
      flex: '1 1 360px', minWidth: 0,
    }}>
      {/* title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)',
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{description}</div>
          </div>
        </div>
        <button
          onClick={onRestart}
          title="重新播放"
          style={{
            border: '1px solid var(--border)', background: 'var(--background)',
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--muted-foreground)', fontSize: 12,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-foreground)';
          }}
        >
          <RefreshCwIcon size={13} />
          重播
        </button>
      </div>

      {/* demo area */}
      <div style={{
        background: 'var(--background)', borderRadius: 12,
        padding: '28px 24px',
        display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'center',
        minHeight: 120,
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Stat badge component ─────────────────────────────────────────────────────
function StatBadge({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <div style={{
        fontSize: 36, fontWeight: 900, color: 'var(--primary)',
        fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        letterSpacing: '-1px',
      }}>
        {formatComma(value)}{suffix}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NumberRollPage() {
  // each demo has its own running key — reset triggers re-mount
  const [runA, setRunA] = useState(true);
  const [runB, setRunB] = useState(true);
  const [runC, setRunC] = useState(true);
  const [runD, setRunD] = useState(true);
  const [clockTick, setClockTick] = useState(0);

  // CountUp values
  const v1 = useCountUp(1_234_567, 2000, runA);
  const v2 = useCountUp(98.76,     1600, runA);   // we'll use fraction manually
  const v3 = useCountUp(4280,      1800, runA);

  // decimals: interpolate 0→98.76
  const v2f = (v2 / 100).toFixed(2);   // map 0-9876 → 0.00-98.76... simpler: use v2 as 9876→divide
  const v2Actual = (useCountUp(9876, 1600, runA) / 100).toFixed(2);

  // Odometer
  const odomVal = useCountUp(654321, 2400, runB);

  // Flip clock tick effect
  useEffect(() => {
    if (!runD) return;
    const id = setInterval(() => setClockTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [runD]);

  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const ss = String((now.getSeconds() + clockTick) % 60).padStart(2,'0');
  const clockNum = Number(`${hh}${mm}${ss}`);

  const restartA = useCallback(() => { setRunA(false); setTimeout(() => setRunA(true), 50); }, []);
  const restartB = useCallback(() => { setRunB(false); setTimeout(() => setRunB(true), 50); }, []);
  const restartC = useCallback(() => { setRunC(false); setTimeout(() => setRunC(true), 50); }, []);
  const restartD = useCallback(() => { setRunD(false); setClockTick(0); setTimeout(() => setRunD(true), 100); }, []);

  // Formatted countup demo
  const fv1 = useCountUp(9_882_430, 2200, runC);
  const fv2 = useCountUp(72,        1400, runC);
  const fv3 = useCountUp(356780,    2000, runC);

  return (
    <AdminLayout>
      <div data-cmp="NumberRollPage" style={{
        minHeight: '100%', background: 'var(--background)', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>数字滚动</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            多种动态数字效果展示 · 数字跑马 / 里程计翻动 / 翻牌时钟
          </p>
        </div>

        {/* Demo row 1: CountUp */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <DemoCard
            title="数字递增 Count-Up"
            description="requestAnimationFrame + ease-out cubic 缓动，自然流畅"
            icon={<TrendingUpIcon size={18} />}
            onRestart={restartA}
          >
            <StatBadge label="总用户数" value={v1} />
            <StatBadge label="完成率" value={Number(v2Actual)} suffix="%" />
            <StatBadge label="今日订单" value={v3} />
          </DemoCard>

          <DemoCard
            title="格式化数字"
            description="千位分隔符、小数位、货币符号自动格式化"
            icon={<DollarSignIcon size={18} />}
            onRestart={restartC}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
              {[
                { label: '平台成交额', val: fv1, prefix: '¥', suffix: '' },
                { label: '转化率',    val: fv2, prefix: '',  suffix: '%' },
                { label: '活跃商品',  val: fv3, prefix: '',  suffix: ' SKU' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px',
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: 13, color: 'var(--muted-foreground)', fontWeight: 500 }}>
                    {row.label}
                  </span>
                  <span style={{
                    fontSize: 22, fontWeight: 900, color: 'var(--primary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {row.prefix}{formatComma(row.val)}{row.suffix}
                  </span>
                </div>
              ))}
            </div>
          </DemoCard>
        </div>

        {/* Demo row 2: Odometer + Flip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <DemoCard
            title="里程计 Odometer"
            description="逐位上滑翻动，带错落延迟，像真实里程表"
            icon={<HashIcon size={18} />}
            onRestart={restartB}
          >
            {runB ? (
              <OdometerDisplay value={odomVal} prefix="#" />
            ) : (
              <OdometerDisplay value={0} prefix="#" />
            )}
          </DemoCard>

          <DemoCard
            title="翻牌时钟 Flip Clock"
            description="CSS 3D 透视翻页动画，实时走秒"
            icon={<RefreshCwIcon size={18} />}
            onRestart={restartD}
          >
            {runD ? (
              <FlipClock value={clockNum} />
            ) : (
              <FlipClock value={0} />
            )}
            <p style={{ margin: 0, fontSize: 11, color: 'var(--muted-foreground)', width: '100%', textAlign: 'center' }}>
              HH : MM : SS  (每秒翻牌)
            </p>
          </DemoCard>
        </div>

        {/* usage code hints */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '20px 24px',
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)', marginBottom: 12 }}>
            📦 使用说明
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { tag: 'useCountUp(target, duration, running)', desc: '基础数字递增 Hook，返回当前插值' },
              { tag: '<OdometerDisplay value={n} prefix="¥" />', desc: '里程计组件，逐位错落动画' },
              { tag: '<FlipClock value={hhmmss} />', desc: '翻牌时钟，需传入 6 位数字' },
              { tag: 'formatComma(n, decimals)', desc: '千位分隔符 + 小数位格式化' },
            ].map(item => (
              <div key={item.tag} style={{
                background: 'var(--background)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 14px', flex: '1 1 260px',
              }}>
                <code style={{ fontSize: 12, color: 'var(--primary)', fontFamily: 'monospace' }}>
                  {item.tag}
                </code>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted-foreground)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
