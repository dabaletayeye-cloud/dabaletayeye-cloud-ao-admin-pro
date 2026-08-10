type Datum = Record<string, string | number>;

export type ChartSeries = { key: string; name: string; color: string };
export type DonutSegment = { name: string; value: number; color: string };

const TEXT = '#64748b';
const GRID = '#e2e8f0';

function numeric(value: string | number | undefined) {
  return typeof value === 'number' ? value : Number(value ?? 0);
}

function compact(value: number) {
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(Math.round(value));
}

export function LineChartSvg({ data, xKey, series, height = 240 }: { data: Datum[]; xKey: string; series: ChartSeries[]; height?: number }) {
  const width = 1000;
  const left = 48;
  const right = 22;
  const top = 18;
  const bottom = 38;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const max = Math.max(1, ...series.flatMap((item) => data.map((row) => numeric(row[item.key]))));
  const tickCount = 4;
  const point = (value: number, index: number) => ({
    x: left + (data.length < 2 ? plotWidth / 2 : (plotWidth * index) / (data.length - 1)),
    y: top + plotHeight - (value / max) * plotHeight,
  });
  const every = Math.max(1, Math.ceil(data.length / 8));

  return <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }} role="img" aria-label="趋势图">
    {Array.from({ length: tickCount + 1 }, (_, index) => {
      const value = (max * (tickCount - index)) / tickCount;
      const y = top + (plotHeight * index) / tickCount;
      return <g key={index}><line x1={left} x2={width - right} y1={y} y2={y} stroke={GRID} strokeDasharray="4 4" /><text x={left - 9} y={y + 4} textAnchor="end" fill={TEXT} fontSize="11">{compact(value)}</text></g>;
    })}
    {series.map((seriesItem) => {
      const points = data.map((row, index) => point(numeric(row[seriesItem.key]), index));
      const path = points.map((item, index) => `${index === 0 ? 'M' : 'L'} ${item.x} ${item.y}`).join(' ');
      const area = `${path} L ${points[points.length - 1]?.x ?? left} ${top + plotHeight} L ${points[0]?.x ?? left} ${top + plotHeight} Z`;
      return <g key={seriesItem.key}><path d={area} fill={seriesItem.color} opacity="0.09" /><path d={path} fill="none" stroke={seriesItem.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />{points.length <= 12 && points.map((pointItem, index) => <circle key={index} cx={pointItem.x} cy={pointItem.y} r="3" fill="#fff" stroke={seriesItem.color} />)}</g>;
    })}
    {data.map((row, index) => index % every === 0 || index === data.length - 1 ? <text key={index} x={point(0, index).x} y={height - 12} textAnchor="middle" fill={TEXT} fontSize="11">{String(row[xKey] ?? '')}</text> : null)}
    <g transform={`translate(${left}, ${top - 2})`}>{series.map((item, index) => <g key={item.key} transform={`translate(${index * 92}, 0)`}><circle cx="4" cy="5" r="4" fill={item.color} /><text x="13" y="9" fill={TEXT} fontSize="11">{item.name}</text></g>)}</g>
  </svg>;
}

export function BarChartSvg({ data, xKey, series, height = 220 }: { data: Datum[]; xKey: string; series: ChartSeries[]; height?: number }) {
  const width = 1000;
  const left = 48;
  const right = 22;
  const top = 18;
  const bottom = 38;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const max = Math.max(1, ...series.flatMap((item) => data.map((row) => numeric(row[item.key]))));
  const step = plotWidth / Math.max(data.length, 1);
  const groupWidth = Math.min(step * 0.72, 56);
  const barWidth = Math.max(3, groupWidth / Math.max(series.length, 1));
  const every = Math.max(1, Math.ceil(data.length / 8));

  return <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }} role="img" aria-label="柱状图">
    {Array.from({ length: 5 }, (_, index) => {
      const y = top + (plotHeight * index) / 4;
      const value = (max * (4 - index)) / 4;
      return <g key={index}><line x1={left} x2={width - right} y1={y} y2={y} stroke={GRID} strokeDasharray="4 4" /><text x={left - 9} y={y + 4} textAnchor="end" fill={TEXT} fontSize="11">{compact(value)}</text></g>;
    })}
    {data.map((row, rowIndex) => series.map((item, seriesIndex) => {
      const value = numeric(row[item.key]);
      const barHeight = (value / max) * plotHeight;
      const x = left + rowIndex * step + (step - groupWidth) / 2 + seriesIndex * barWidth;
      const y = top + plotHeight - barHeight;
      return <rect key={`${rowIndex}-${item.key}`} x={x} y={y} width={Math.max(2, barWidth - 2)} height={barHeight} rx="3" fill={item.color} opacity="0.92" />;
    }))}
    {data.map((row, index) => index % every === 0 || index === data.length - 1 ? <text key={index} x={left + index * step + step / 2} y={height - 12} textAnchor="middle" fill={TEXT} fontSize="11">{String(row[xKey] ?? '')}</text> : null)}
    <g transform={`translate(${left}, ${top - 2})`}>{series.map((item, index) => <g key={item.key} transform={`translate(${index * 92}, 0)`}><circle cx="4" cy="5" r="4" fill={item.color} /><text x="13" y="9" fill={TEXT} fontSize="11">{item.name}</text></g>)}</g>
  </svg>;
}

export function DonutChartSvg({ data, height = 180 }: { data: DonutSegment[]; height?: number }) {
  const size = 220;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(1, data.reduce((sum, item) => sum + item.value, 0));
  let offset = 0;
  return <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height, display: 'block' }} role="img" aria-label="环形图">
    <circle cx="110" cy="110" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="24" />
    {data.map((item) => {
      const length = (item.value / total) * circumference;
      const node = <circle key={item.name} cx="110" cy="110" r={radius} fill="none" stroke={item.color} strokeWidth="24" strokeLinecap="butt" strokeDasharray={`${Math.max(0, length - 3)} ${circumference - length + 3}`} strokeDashoffset={-offset} transform="rotate(-90 110 110)" />;
      offset += length;
      return node;
    })}
    <text x="110" y="104" textAnchor="middle" fill="#1e293b" fontSize="22" fontWeight="700">{total}</text>
    <text x="110" y="126" textAnchor="middle" fill={TEXT} fontSize="12">总占比</text>
  </svg>;
}

export function RadarChartSvg({ data, height = 260, color = '#6366f1' }: { data: { label: string; value: number }[]; height?: number; color?: string }) {
  const width = 360;
  const cx = width / 2;
  const cy = height / 2 + 4;
  const radius = Math.min(86, height / 2 - 34);
  const coordinate = (value: number, index: number, factor = 1) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / data.length;
    const distance = radius * factor * (value / 100);
    return `${cx + Math.cos(angle) * distance},${cy + Math.sin(angle) * distance}`;
  };
  const grid = (factor: number) => data.map((_, index) => coordinate(100, index, factor)).join(' ');
  const shape = data.map((item, index) => coordinate(item.value, index)).join(' ');
  return <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height, display: 'block' }} role="img" aria-label="雷达图">
    {[0.25, 0.5, 0.75, 1].map((factor) => <polygon key={factor} points={grid(factor)} fill="none" stroke={GRID} />)}
    {data.map((item, index) => <g key={item.label}><line x1={cx} y1={cy} x2={coordinate(100, index).split(',')[0]} y2={coordinate(100, index).split(',')[1]} stroke={GRID} /><text x={coordinate(112, index).split(',')[0]} y={Number(coordinate(112, index).split(',')[1]) + 4} textAnchor="middle" fill={TEXT} fontSize="11">{item.label}</text></g>)}
    <polygon points={shape} fill={color} opacity="0.22" stroke={color} strokeWidth="2" />
    {data.map((item, index) => { const [x, y] = coordinate(item.value, index).split(','); return <circle key={item.label} cx={x} cy={y} r="3" fill={color} />; })}
  </svg>;
}

export function FunnelChartSvg({ data, height = 330 }: { data: DonutSegment[]; height?: number }) {
  const width = 600;
  const top = 14;
  const rowHeight = (height - top - 10) / data.length;
  const max = Math.max(1, ...data.map((item) => item.value));
  return <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height, display: 'block' }} role="img" aria-label="漏斗图">
    {data.map((item, index) => {
      const next = data[index + 1]?.value ?? item.value * 0.7;
      const currentWidth = 110 + (item.value / max) * 360;
      const nextWidth = 110 + (next / max) * 360;
      const y = top + index * rowHeight;
      const x1 = (width - currentWidth) / 2;
      const x2 = (width - nextWidth) / 2;
      return <g key={item.name}><polygon points={`${x1},${y} ${x1 + currentWidth},${y} ${x2 + nextWidth},${y + rowHeight - 6} ${x2},${y + rowHeight - 6}`} fill={item.color} opacity="0.9" /><text x={width / 2} y={y + rowHeight / 2 + 4} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">{item.name} · {item.value.toLocaleString()}</text></g>;
    })}
  </svg>;
}
