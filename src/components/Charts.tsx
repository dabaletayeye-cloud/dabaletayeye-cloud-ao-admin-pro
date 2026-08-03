import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useTheme } from '../hooks/useTheme';
import { MONTHLY_DATA, YEARLY_TREND } from '../data/mockData';
import { THEMES } from '../types';

function getThemePrimary(themeId: string, mode: string) {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return '#3B82F6';
  return mode === 'light' ? theme.lightPrimary : theme.darkPrimary;
}

function getThemeAccent(themeId: string, mode: string) {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return '#60A5FA';
  return mode === 'light' ? theme.darkPrimary : theme.lightPrimary;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl border shadow-lg text-sm"
      style={{
        background: 'var(--popover)',
        borderColor: 'var(--border)',
        color: 'var(--foreground)',
      }}
    >
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: 'var(--primary)' }}>
          {p.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
}

export function Charts() {
  return (
    <div data-cmp="Charts" className="h-full flex flex-col gap-4">
      <BarChartComponent />
      <AreaChartComponent />
    </div>
  );
}

export default Charts;

export function BarChartComponent() {
  const { themeState } = useTheme();
  const primary = getThemePrimary(themeState.themeId, themeState.mode);
  const accent = getThemeAccent(themeState.themeId, themeState.mode);

  return (
    <div data-cmp="BarChartComponent" className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primary} stopOpacity={0.9} />
              <stop offset="100%" stopColor={accent} stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'color-mix(in srgb, var(--primary) 6%, transparent)' }} />
          <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AreaChartComponent() {
  const { themeState } = useTheme();
  const primary = getThemePrimary(themeState.themeId, themeState.mode);

  return (
    <div data-cmp="AreaChartComponent" className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={YEARLY_TREND} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primary} stopOpacity={0.35} />
              <stop offset="100%" stopColor={primary} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="visits"
            stroke={primary}
            strokeWidth={2.5}
            fill="url(#areaGradient)"
            dot={false}
            activeDot={{ r: 5, fill: primary, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
