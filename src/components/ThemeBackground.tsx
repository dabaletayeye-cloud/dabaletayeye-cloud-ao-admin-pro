import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../hooks/useTheme';
import './theme-background.css';

// Stable positions keep particles from jumping on ordinary page rerenders.
const particles = Array.from({ length: 28 }, (_, index) => ({
  left: (index * 37 + 7) % 100,
  top: (index * 23 + 11) % 100,
  size: 26 + (index * 7) % 18,
  duration: 18 + (index * 3) % 17,
  delay: -((index * 13 + 5) % 35),
  drift: ((index * 31) % 160) - 80,
}));

function Sakura() {
  return <svg viewBox="-24 -24 48 48" className="manga-sakura" focusable="false">
    {[0, 72, 144, 216, 288].map(angle => <path key={angle} transform={`rotate(${angle})`}
      d="M 0 3 C -12 -2 -13 -13 -5 -19 L 0 -15 L 5 -19 C 13 -13 12 -2 0 3 Z"
      fill="currentColor" fillOpacity=".78" />)}
    <circle r="3.2" fill="#fff2d9" />
    {[0, 72, 144, 216, 288].map(angle => <circle key={angle} cx="0" cy="-5" r="1.15" transform={`rotate(${angle})`} fill="#fff7ed" />)}
  </svg>;
}

export default function ThemeBackground() {
  const { themeState } = useTheme();
  const [paused, setPaused] = useState(() => document.hidden);
  const enabled = themeState.themeId === 'manga' && themeState.particleEffects;
  useEffect(() => {
    if (!enabled) return;
    const update = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', update);
    update();
    return () => document.removeEventListener('visibilitychange', update);
  }, [enabled]);
  if (!enabled) return null;

  const dark = themeState.mode === 'dark';
  const scale = { small: 0.65, medium: 1, large: 1.45 }[themeState.particleSize] ?? 1;
  return createPortal(
    <div className={`manga-atmosphere ${dark ? 'manga-atmosphere-night' : 'manga-atmosphere-day'}`}
      aria-hidden="true" data-paused={paused} style={{ '--particle-scale': scale } as CSSProperties}>
      {particles.slice(0, dark ? 28 : 20).map((particle, index) => (
        <span key={`${themeState.mode}-${index}`} className={dark ? 'manga-firefly-track' : 'manga-petal-track'}
          style={{
            left: `${particle.left}%`, top: dark ? `${particle.top}%` : undefined,
            '--particle-size': `${(dark ? 6 + index % 4 : particle.size) * scale}px`,
            '--particle-duration': `${particle.duration}s`,
            '--particle-delay': `${particle.delay}s`,
            '--particle-drift': `${particle.drift}px`,
            '--particle-sway': `${5 + index % 5}s`,
            '--particle-glow': index % 4 === 0 ? '#ee8ddd' : '#c084fc',
          } as CSSProperties}>
          {dark ? <i className="manga-firefly" /> : <i className="manga-petal-sway"><Sakura /></i>}
        </span>
      ))}
    </div>, document.body,
  );
}
