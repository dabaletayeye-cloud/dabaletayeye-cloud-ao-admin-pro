import { useEffect, useState } from 'react';

export function colorWithAlpha(color: string, opacity: number): string {
  const hex = color.replace('#', '');
  if (/^[\da-f]{6}$/i.test(hex)) {
    return `rgba(${parseInt(hex.slice(0, 2), 16)},${parseInt(hex.slice(2, 4), 16)},${parseInt(hex.slice(4, 6), 16)},${opacity})`;
  }
  const rgb = color.match(/[\d.]+/g);
  return rgb && rgb.length >= 3 ? `rgba(${rgb.slice(0, 3).join(',')},${opacity})` : color;
}

function readPalette() {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    colors: Array.from({ length: 5 }, (_, index) => read(`--chart-${index + 1}`, '#737373')),
    primary: read('--primary', '#1a1a1a'),
    foreground: read('--foreground', '#1a1a1a'),
    muted: read('--muted-foreground', '#737373'),
    border: read('--border', '#dddddd'),
    card: read('--card', '#ffffff'),
  };
}

/** Canvas charts need resolved colors; CSS var() strings cannot be passed to Canvas gradients. */
export function useChartPalette() {
  const [palette, setPalette] = useState(readPalette);
  useEffect(() => {
    const refresh = () => setPalette(previous => {
      const next = readPalette();
      return JSON.stringify(previous) === JSON.stringify(next) ? previous : next;
    });
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-theme', 'data-mode'] });
    refresh();
    return () => observer.disconnect();
  }, []);
  return palette;
}
