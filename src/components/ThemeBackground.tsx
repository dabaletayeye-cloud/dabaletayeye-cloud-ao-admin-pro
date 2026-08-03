import { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

// Sakura petals for manga light mode
function SakuraPetals() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const petals = ['🌸', '🌺', '✿', '❀', '🌷'];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      petal.textContent = petals[i % petals.length];
      const left = Math.random() * 100;
      const delay = Math.random() * 12;
      const duration = 8 + Math.random() * 8;
      const size = 12 + Math.random() * 10;
      petal.style.cssText = `
        left: ${left}%;
        top: -40px;
        font-size: ${size}px;
        opacity: 0.7;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
      `;
      container.appendChild(petal);
    }

    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0" />;
}

// Star particles for manga dark mode
function StarParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const count = 80;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star-particle';
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 2 + Math.random() * 4;
      const size = 1 + Math.random() * 3;
      const opacity = 0.3 + Math.random() * 0.7;
      const hue = Math.random() > 0.5 ? '192,132,252' : '244,114,182';
      star.style.cssText = `
        left: ${left}%;
        top: ${top}%;
        width: ${size}px;
        height: ${size}px;
        background: rgb(${hue});
        opacity: ${opacity};
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
      `;
      container.appendChild(star);
    }

    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0" />;
}

export default function ThemeBackground() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const isLight = themeState.mode === 'light';
  const isDark = themeState.mode === 'dark';

  if (!isManga) return null;

  return (
    <>
      <div className={isLight ? 'block' : 'hidden'}>
        <SakuraPetals />
      </div>
      <div className={isDark ? 'block' : 'hidden'}>
        <StarParticles />
      </div>
    </>
  );
}
