import { useMemo, useState, type ReactNode, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { getMapData } from '../../api';
import type { RegionData } from '../../api';
import { ApiState, useApiResource } from '../../hooks/useApiResource';
import { localizeText } from '../../i18n/localizeText';
import {
  CircleDotIcon,
  EyeIcon,
  Globe2Icon,
  LayersIcon,
  MapIcon,
  MapPinIcon,
  TrendingUpIcon,
} from 'lucide-react';
import chinaGeoJson from '../../data/geo/china.json';
import worldGeoJson from '../../data/geo/world.json';
import {
  MAP_DARK_COLORS,
  MAP_LIGHT_COLORS,
  MAP_MANGA_COLORS,
  MAP_MANGA_DARK_COLORS,
} from '../../api/analytics';

type MapScope = 'china' | 'world';
type MapMode = 'heat' | 'bubble';
type MapPoint = [number, number];

const CHINA_MAP_NAME = 'ao-admin-china';
const WORLD_MAP_NAME = 'ao-admin-world';

const CHINA_GEO_NAMES: Record<string, string> = {
  北京: '北京市', 天津: '天津市', 河北: '河北省', 山西: '山西省', 内蒙古: '内蒙古自治区', 辽宁: '辽宁省', 吉林: '吉林省', 黑龙江: '黑龙江省', 上海: '上海市', 江苏: '江苏省', 浙江: '浙江省', 安徽: '安徽省', 福建: '福建省', 江西: '江西省', 山东: '山东省', 河南: '河南省', 湖北: '湖北省', 湖南: '湖南省', 广东: '广东省', 广西: '广西壮族自治区', 海南: '海南省', 重庆: '重庆市', 四川: '四川省', 贵州: '贵州省', 云南: '云南省', 西藏: '西藏自治区', 陕西: '陕西省', 甘肃: '甘肃省', 青海: '青海省', 宁夏: '宁夏回族自治区', 新疆: '新疆维吾尔自治区', 台湾: '台湾省', 香港: '香港特别行政区', 澳门: '澳门特别行政区',
};

const WORLD_GEO_NAMES: Record<string, string> = {
  'South Korea': 'Korea',
  'Czech Republic': 'Czech Rep.',
  UAE: 'United Arab Emirates',
};

const CHINA_SHORT_NAMES = new Map(Object.entries(CHINA_GEO_NAMES).map(([name, geoName]) => [geoName, name]));

function geoNameFor(region: RegionData, scope: MapScope) {
  return scope === 'china' ? (CHINA_GEO_NAMES[region.name] ?? region.name) : (WORLD_GEO_NAMES[region.name] ?? region.name);
}

function formatValue(value: number, language = 'zh-CN') {
  return new Intl.NumberFormat(language, {
    notation: value >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

function getColor(value: number, data: RegionData[], colors: string[]) {
  const values = data.map(item => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const ratio = max === min ? 1 : (value - min) / (max - min);
  return colors[Math.round(ratio * (colors.length - 1))] ?? '#2563eb';
}

function getCenters(geoJson: { features: Array<{ properties?: { name?: string; centroid?: number[]; center?: number[] } }> }) {
  return new Map<string, MapPoint>(geoJson.features.flatMap(feature => {
    const name = feature.properties?.name;
    const center = feature.properties?.centroid ?? feature.properties?.center;
    return name && center?.length === 2 ? [[name, [center[0], center[1]] as MapPoint]] : [];
  }));
}

const CHINA_CENTERS = getCenters(chinaGeoJson);
const WORLD_CENTERS = getCenters(worldGeoJson);

echarts.registerMap(CHINA_MAP_NAME, chinaGeoJson as never);
echarts.registerMap(WORLD_MAP_NAME, worldGeoJson as never);

function MetricCard({ icon, label, value, detail, color }: { icon: ReactNode; label: string; value: string; detail: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0, padding: '16px 18px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)', flex: '1 1 190px' }}>
      <span style={{ width: 42, height: 42, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color, borderRadius: 10, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ marginBottom: 3, fontSize: 12, color: 'var(--muted-foreground)' }}>{label}</div>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 20, fontWeight: 750, lineHeight: 1.15, color: 'var(--foreground)' }}>{value}</div>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3, fontSize: 11, color: 'var(--muted-foreground)' }}>{detail}</div>
      </div>
    </div>
  );
}

function GeographicMap({
  scope,
  mode,
  data,
  colors,
  isDark,
  language,
  tx,
  selected,
  onSelect,
  onHover,
}: {
  scope: MapScope;
  mode: MapMode;
  data: RegionData[];
  colors: string[];
  isDark: boolean;
  language: string;
  tx: (value: string) => string;
  selected: RegionData;
  onSelect: (region: RegionData) => void;
  onHover: (region: RegionData | null) => void;
}) {
  const mapName = scope === 'china' ? CHINA_MAP_NAME : WORLD_MAP_NAME;
  const centers = scope === 'china' ? CHINA_CENTERS : WORLD_CENTERS;
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#ffffff';
  const neutralArea = isDark ? '#243247' : '#edf3fb';
  const regionByGeoName = useMemo(() => new Map(data.map(region => [geoNameFor(region, scope), region])), [data, scope]);
  const maxValue = Math.max(...data.map(region => region.value));
  const mapData = useMemo(() => data.map(region => ({ name: geoNameFor(region, scope), value: region.value, selected: region.name === selected.name })), [data, scope, selected.name]);

  const option = useMemo(() => {
    const tooltip = {
      trigger: 'item',
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      padding: [9, 12],
      textStyle: { color: textColor, fontSize: 12 },
      formatter: (params: { name: string }) => {
        const region = regionByGeoName.get(params.name);
        if (!region) return params.name;
        const growthColor = (region.growth ?? 0) >= 0 ? '#10b981' : '#ef4444';
        return `<div style="font-weight:700;margin-bottom:5px">${tx(region.name)}</div><div>${tx('访问量')}：<b>${formatValue(region.value, language)}</b></div><div style="margin-top:3px;color:${growthColor}">${tx('同比')}：${region.growth ?? 0}%</div>`;
      },
    };
    const label = {
      show: scope === 'china',
      color: mutedColor,
      fontSize: 10,
      formatter: (params: { name: string }) => tx(CHINA_SHORT_NAMES.get(params.name) ?? params.name),
    };
    const mapStyle = {
      borderColor,
      borderWidth: scope === 'china' ? 0.9 : 0.55,
      areaColor: neutralArea,
    };

    if (mode === 'heat') {
      return {
        tooltip,
        visualMap: { show: false, min: Math.min(...data.map(region => region.value)), max: maxValue, inRange: { color: colors } },
        series: [{
          name: tx('访问量'),
          type: 'map',
          map: mapName,
          roam: true,
          zoom: scope === 'china' ? 1.08 : 1.12,
          selectedMode: 'single',
          data: mapData,
          label,
          itemStyle: { borderColor, borderWidth: scope === 'china' ? 0.9 : 0.55 },
          emphasis: { label: { ...label, color: '#ffffff', fontWeight: 700 }, itemStyle: { areaColor: '#f59e0b', borderColor: textColor, borderWidth: 1.4 } },
          select: { label: { ...label, color: '#ffffff', fontWeight: 800 }, itemStyle: { areaColor: '#1d4ed8', borderColor: textColor, borderWidth: 1.6 } },
        }],
      };
    }

    const bubbleData = data.flatMap(region => {
      const center = centers.get(geoNameFor(region, scope));
      return center ? [{ name: geoNameFor(region, scope), value: [center[0], center[1], region.value] }] : [];
    });

    return {
      tooltip,
      geo: {
        map: mapName,
        roam: true,
        zoom: scope === 'china' ? 1.08 : 1.12,
        label,
        itemStyle: mapStyle,
        emphasis: { label: { ...label, color: '#ffffff', fontWeight: 700 }, itemStyle: { areaColor: isDark ? '#334155' : '#dbeafe', borderColor: textColor, borderWidth: 1.3 } },
      },
      series: [{
        name: tx('访问量'),
        type: 'scatter',
        coordinateSystem: 'geo',
        data: bubbleData,
        symbolSize: (value: number[]) => Math.max(9, Math.sqrt(value[2] / maxValue) * (scope === 'china' ? 36 : 31)),
        itemStyle: { color: (params: { value: number[] }) => getColor(params.value[2], data, colors), borderColor, borderWidth: 1.4, opacity: 0.88 },
        emphasis: { scale: 1.25, itemStyle: { borderColor: textColor, borderWidth: 2 } },
      }],
    };
  }, [borderColor, centers, colors, data, isDark, language, mapData, mapName, maxValue, mode, mutedColor, neutralArea, regionByGeoName, scope, textColor, tx]);

  const onEvents = {
    click: (params: { name?: string }) => {
      const region = params.name ? regionByGeoName.get(params.name) : undefined;
      if (region) onSelect(region);
    },
    mouseover: (params: { name?: string }) => {
      const region = params.name ? regionByGeoName.get(params.name) : undefined;
      if (region) onHover(region);
    },
    mouseout: () => onHover(null),
    globalout: () => onHover(null),
  };

  return <ReactECharts option={option} onEvents={onEvents} notMerge lazyUpdate style={{ width: '100%', height: 476 }} opts={{ renderer: 'svg' }} />;
}

export default function MapPage() {
  const { themeState } = useTheme();
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const tx = (value: string) => localizeText(value, language);
  const isDark = themeState.mode === 'dark';
  const isManga = themeState.themeId === 'manga';
  const colors = isManga
    ? (isDark ? MAP_MANGA_DARK_COLORS : MAP_MANGA_COLORS)
    : (isDark ? MAP_DARK_COLORS : MAP_LIGHT_COLORS);
  const [scope, setScope] = useState<MapScope>('china');
  const [mode, setMode] = useState<MapMode>('heat');
  const mapResource = useApiResource(() => getMapData(scope));
  const [selected, setSelected] = useState<RegionData | null>(null);
  const [hovered, setHovered] = useState<RegionData | null>(null);

  const data = mapResource.data ?? [];
  useEffect(() => { if (data.length) setSelected(data[0]); }, [data]);
  if (mapResource.loading || mapResource.error || !selected) return <AdminLayout><ApiState loading={mapResource.loading} error={mapResource.error} /></AdminLayout>;
  const sortedData = useMemo(() => [...data].sort((a, b) => b.value - a.value), [data]);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const average = Math.round(total / data.length);
  const fastest = [...data].sort((a, b) => (b.growth ?? 0) - (a.growth ?? 0))[0];
  const activeRegion = hovered ?? selected;
  const activeColor = getColor(activeRegion.value, data, colors);

  const changeScope = (nextScope: MapScope) => {
    setScope(nextScope);
    setSelected(null);
    setHovered(null);
  };

  return (
    <AdminLayout>
      <style>{`
        @keyframes map-template-enter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .map-template-page { animation: map-template-enter .35s ease both; }
        .map-template-grid { display: grid; grid-template-columns: minmax(0, 1fr) 292px; gap: 16px; align-items: start; }
        .map-segment { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 11px; border: 1px solid var(--border); background: var(--card); color: var(--muted-foreground); font-size: 12px; font-weight: 650; cursor: pointer; }
        .map-segment:first-child { border-radius: 8px 0 0 8px; }
        .map-segment:last-child { margin-left: -1px; border-radius: 0 8px 8px 0; }
        .map-segment.active { position: relative; z-index: 1; color: #fff; border-color: var(--theme-primary, #6366f1); background: var(--theme-primary, #6366f1); }
        .map-segment:not(.active):hover { background: var(--accent); color: var(--foreground); }
        @media (max-width: 1080px) { .map-template-grid { grid-template-columns: 1fr; } }
        @media (max-width: 640px) { .map-toolbar { align-items: flex-start !important; flex-direction: column; } }
      `}</style>

      <div className="map-template-page" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, color: '#fff', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', boxShadow: '0 7px 16px rgba(37,99,235,.22)' }}><MapIcon size={19} /></span>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, lineHeight: 1.3, color: 'var(--foreground)', fontWeight: 750 }}>{tx('地图模板')}</h1>
                <p style={{ margin: '3px 0 0', color: 'var(--muted-foreground)', fontSize: 13 }}>{tx('基于真实地理边界的中国省份与世界国家访问分布')}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className={`map-segment${scope === 'china' ? ' active' : ''}`} type="button" onClick={() => changeScope('china')}><MapPinIcon size={14} />{tx('中国地图')}</button>
            <button className={`map-segment${scope === 'world' ? ' active' : ''}`} type="button" onClick={() => changeScope('world')}><Globe2Icon size={14} />{tx('世界地图')}</button>
          </div>
        </header>

        <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <MetricCard icon={<EyeIcon size={20} />} label={tx('总访问量')} value={formatValue(total, language)} detail={tx(scope === 'china' ? '覆盖 34 个省级地区' : '覆盖 50 个国家 / 地区')} color="#6366f1" />
          <MetricCard icon={<MapPinIcon size={20} />} label={tx('最高地区')} value={tx(sortedData[0]?.name ?? '-')} detail={`${formatValue(sortedData[0]?.value ?? 0, language)} ${tx('次访问')}`} color="#8b5cf6" />
          <MetricCard icon={<LayersIcon size={20} />} label={tx('平均访问')} value={formatValue(average, language)} detail={tx('按区域均值统计')} color="#0ea5e9" />
          <MetricCard icon={<TrendingUpIcon size={20} />} label={tx('增长最快')} value={tx(fastest?.name ?? '-')} detail={`${tx('同比增长')} ${fastest?.growth ?? 0}%`} color="#10b981" />
        </section>

        <div className="map-template-grid">
          <section style={{ overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--card)' }}>
            <div className="map-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>{scope === 'china' ? <MapPinIcon size={16} /> : <Globe2Icon size={16} />}{tx(scope === 'china' ? '中国省份访问分布' : '世界国家访问分布')}</div>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--muted-foreground)' }}>{tx(mode === 'heat' ? '颜色越深，访问热度越高' : '圆点越大，访问量越高。可拖拽、缩放地图')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button className={`map-segment${mode === 'heat' ? ' active' : ''}`} type="button" onClick={() => setMode('heat')}><LayersIcon size={14} />{tx('热力地图')}</button>
                <button className={`map-segment${mode === 'bubble' ? ' active' : ''}`} type="button" onClick={() => setMode('bubble')}><CircleDotIcon size={14} />{tx('气泡地图')}</button>
              </div>
            </div>

            <GeographicMap scope={scope} mode={mode} data={data} colors={colors} isDark={isDark} language={language} tx={tx} selected={selected} onSelect={setSelected} onHover={setHovered} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 18px 14px', borderTop: '1px solid var(--border)' }}>
              <span style={{ flexShrink: 0, fontSize: 12, color: 'var(--muted-foreground)' }}>{tx('访问热度')}</span>
              <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 8, borderRadius: 999 }}>{colors.map(color => <span key={color} style={{ flex: 1, background: color }} />)}</div>
              <span style={{ flexShrink: 0, fontSize: 11, color: 'var(--muted-foreground)' }}>{tx('低')}</span>
              <span style={{ flexShrink: 0, fontSize: 11, color: 'var(--muted-foreground)' }}>{tx('高')}</span>
            </div>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <section style={{ padding: 17, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: activeColor, boxShadow: `0 0 0 4px color-mix(in srgb, ${activeColor} 14%, transparent)` }} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{tx(hovered ? '悬停地区' : '当前地区')}</span></div>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--foreground)', fontSize: 25, fontWeight: 800 }}>{tx(activeRegion.name)}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 7 }}><span style={{ fontSize: 23, fontWeight: 800, color: 'var(--foreground)' }}>{formatValue(activeRegion.value, language)}</span><span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{tx('访问量')}</span></div>
              <div style={{ height: 7, overflow: 'hidden', marginTop: 14, borderRadius: 999, background: 'var(--muted)' }}><div style={{ width: `${Math.max(5, activeRegion.value / sortedData[0].value * 100)}%`, height: '100%', borderRadius: 'inherit', background: activeColor, transition: 'width .22s ease' }} /></div>
              <div style={{ marginTop: 10, fontSize: 12, color: (activeRegion.growth ?? 0) >= 0 ? '#10b981' : '#ef4444' }}><TrendingUpIcon size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />{tx('同比')} {activeRegion.growth ?? 0}%</div>
            </section>

            <section style={{ padding: 17, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{tx('访问量排行')}</span><span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>TOP 10</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {sortedData.slice(0, 10).map((region, index) => {
                  const active = selected.name === region.name;
                  return <button key={region.name} type="button" onClick={() => setSelected(region)} style={{ display: 'grid', gridTemplateColumns: '21px minmax(0, 1fr) 39px', gap: 8, alignItems: 'center', width: '100%', padding: '5px 6px', margin: '0 -6px', border: 0, borderRadius: 7, background: active ? 'color-mix(in srgb, var(--primary) 9%, transparent)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 5, color: index < 3 ? '#fff' : 'var(--muted-foreground)', background: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#c08457' : 'var(--muted)', fontSize: 11, fontWeight: 800 }}>{index + 1}</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{tx(region.name)}</span><span style={{ textAlign: 'right', color: getColor(region.value, data, colors), fontSize: 12, fontWeight: 750 }}>{formatValue(region.value, language)}</span></button>;
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
