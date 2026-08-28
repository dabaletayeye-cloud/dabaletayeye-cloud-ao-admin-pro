import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import {
  AreaChartIcon, BarChart3Icon, BringToFrontIcon, CalendarDaysIcon, ChevronDownIcon, CircleUserRoundIcon,
  ClipboardCopyIcon, ComponentIcon, EyeIcon, FormInputIcon, ImageIcon, Layers2Icon, LayoutPanelLeftIcon,
  ListIcon, MonitorIcon, MousePointerClickIcon, PaintbrushIcon, PieChartIcon, PlusIcon, Redo2Icon, RotateCcwIcon,
  SaveIcon, SendIcon, SmartphoneIcon, Table2Icon, TabletIcon, Trash2Icon, Undo2Icon, UsersIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { createLowcodeResource, listLowcodeResources, publishLowcodeResource, updateLowcodeResource } from '../../api/lowcode';
import { LowcodeButton, Modal, PageShell } from './LowcodeShared';

type Device = 'pc' | 'tablet' | 'mobile';
type PanelTab = 'props' | 'style' | 'event';
type ComponentKind = 'text' | 'image' | 'button' | 'input' | 'select' | 'date' | 'switch' | 'container' | 'columns' | 'card' | 'tabs' | 'table' | 'list' | 'bar' | 'line' | 'pie' | 'avatar' | 'status' | 'metric';
type DesignComponent = { id: string; kind: ComponentKind; x: number; y: number; width: number; height: number; props: Record<string, string>; style: Record<string, string>; events: Record<string, string> };
type Snapshot = DesignComponent[];

const componentMeta: Record<ComponentKind, { label: string; icon: typeof ComponentIcon; group: string; width: number; height: number; defaultProps: Record<string, string> }> = {
  text: { label: '文本', icon: ComponentIcon, group: '基础组件', width: 180, height: 36, defaultProps: { text: '这里是一段文本内容' } },
  image: { label: '图片', icon: ImageIcon, group: '基础组件', width: 180, height: 110, defaultProps: { src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=480&q=80' } },
  button: { label: '按钮', icon: MousePointerClickIcon, group: '基础组件', width: 96, height: 34, defaultProps: { text: '立即提交', type: 'primary' } },
  input: { label: '输入框', icon: FormInputIcon, group: '基础组件', width: 190, height: 34, defaultProps: { placeholder: '请输入内容' } },
  select: { label: '选择器', icon: ChevronDownIcon, group: '基础组件', width: 190, height: 34, defaultProps: { placeholder: '请选择选项' } },
  date: { label: '日期', icon: CalendarDaysIcon, group: '基础组件', width: 170, height: 34, defaultProps: { placeholder: '请选择日期' } },
  switch: { label: '开关', icon: RotateCcwIcon, group: '基础组件', width: 50, height: 30, defaultProps: { checked: 'true' } },
  container: { label: '容器', icon: LayoutPanelLeftIcon, group: '布局组件', width: 280, height: 150, defaultProps: { title: '内容容器' } },
  columns: { label: '分栏', icon: LayoutPanelLeftIcon, group: '布局组件', width: 300, height: 100, defaultProps: { columns: '2' } },
  card: { label: '卡片', icon: Layers2Icon, group: '布局组件', width: 250, height: 130, defaultProps: { title: '卡片标题', content: '卡片内容区域' } },
  tabs: { label: '标签页', icon: Table2Icon, group: '布局组件', width: 260, height: 90, defaultProps: { tabs: '概览,明细,设置' } },
  table: { label: '表格', icon: Table2Icon, group: '布局组件', width: 360, height: 160, defaultProps: { columns: '姓名,角色,状态' } },
  list: { label: '列表', icon: ListIcon, group: '布局组件', width: 270, height: 130, defaultProps: { items: '待处理事项,最新动态,系统通知' } },
  bar: { label: '柱状图', icon: BarChart3Icon, group: '图表组件', width: 290, height: 180, defaultProps: { title: '销售趋势' } },
  line: { label: '折线图', icon: AreaChartIcon, group: '图表组件', width: 290, height: 180, defaultProps: { title: '访问趋势' } },
  pie: { label: '饼图', icon: PieChartIcon, group: '图表组件', width: 230, height: 180, defaultProps: { title: '渠道占比' } },
  avatar: { label: '用户头像', icon: CircleUserRoundIcon, group: '业务组件', width: 160, height: 48, defaultProps: { name: '林晓', role: '运营管理员' } },
  status: { label: '状态标签', icon: UsersIcon, group: '业务组件', width: 90, height: 28, defaultProps: { text: '运行中', status: 'success' } },
  metric: { label: '指标卡片', icon: BarChart3Icon, group: '业务组件', width: 190, height: 102, defaultProps: { title: '今日订单', value: '2,846', trend: '+12.6%' } },
};

const initialComponents: DesignComponent[] = [
  { id: 'title', kind: 'text', x: 36, y: 36, width: 240, height: 40, props: { text: '订单运营工作台' }, style: { fontSize: '22', color: '#1d2939', fontWeight: '700', background: 'transparent', borderRadius: '0', padding: '0', boxShadow: 'none', className: '' }, events: { click: '', dblclick: '', load: '' } },
  { id: 'metric', kind: 'metric', x: 36, y: 100, width: 190, height: 102, props: { title: '今日订单', value: '2,846', trend: '+12.6%' }, style: { fontSize: '14', color: '#1d2939', fontWeight: '400', background: '#ffffff', borderRadius: '8', padding: '14', boxShadow: '0 4px 10px rgba(0,0,0,.05)', className: '' }, events: { click: '', dblclick: '', load: '' } },
  { id: 'button', kind: 'button', x: 250, y: 126, width: 108, height: 34, props: { text: '创建订单', type: 'primary' }, style: { fontSize: '14', color: '#ffffff', fontWeight: '500', background: '#165DFF', borderRadius: '6', padding: '0', boxShadow: 'none', className: '' }, events: { click: '创建订单', dblclick: '', load: '' } },
  { id: 'chart', kind: 'bar', x: 36, y: 234, width: 420, height: 210, props: { title: '近 7 日订单趋势' }, style: { fontSize: '14', color: '#1d2939', fontWeight: '400', background: '#ffffff', borderRadius: '8', padding: '14', boxShadow: '0 4px 10px rgba(0,0,0,.05)', className: '' }, events: { click: '', dblclick: '', load: '获取订单统计' } },
];

const groupOrder = ['基础组件', '布局组件', '图表组件', '业务组件'];
const apiOptions = ['创建订单', '获取订单统计', '获取用户详情', '服务健康检查'];
const snap = (value: number) => Math.max(0, Math.round(value / 10) * 10);

function ChartStub({ kind, title }: { kind: ComponentKind; title: string }) {
  const bars = [40, 68, 54, 88, 62, 96, 78];
  if (kind === 'pie') return <div style={{ display: 'flex', height: '100%', alignItems: 'center', gap: 12 }}><div style={{ width: 74, height: 74, borderRadius: '50%', background: 'conic-gradient(#165DFF 0 42%, #14C9C9 42% 69%, #FF7D00 69% 100%)' }} /><div style={{ fontSize: 11, lineHeight: 1.7 }}><div>{title}</div><div style={{ color: '#165DFF' }}>● 线上 42%</div><div style={{ color: '#14C9C9' }}>● 门店 27%</div><div style={{ color: '#FF7D00' }}>● 其他 31%</div></div></div>;
  return <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{title}</div><div style={{ flex: 1, display: 'flex', alignItems: 'end', justifyContent: 'space-around', gap: 7, borderBottom: '1px solid #edf0f5', padding: '0 8px 8px' }}>{bars.map((bar, index) => kind === 'line' ? <span key={index} style={{ width: 9, height: 9, borderRadius: 50, background: '#165DFF', transform: `translateY(${-bar / 2}px)`, boxShadow: '0 0 0 2px #e8f3ff' }} /> : <span key={index} style={{ flex: 1, maxWidth: 24, height: `${bar}%`, borderRadius: '4px 4px 0 0', background: 'linear-gradient(180deg,#3b82f6,#165DFF)' }} />)}</div></div>;
}

function ComponentView({ component }: { component: DesignComponent }) {
  const { kind, props } = component;
  if (kind === 'text') return <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>{props.text}</div>;
  if (kind === 'image') return <img src={props.src} alt="页面图片" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />;
  if (kind === 'button') return <button type="button" className="lc-preview-component" style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'inherit', color: 'inherit', background: 'inherit', font: 'inherit' }}>{props.text}</button>;
  if (kind === 'input' || kind === 'select' || kind === 'date') return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '0 9px', border: '1px solid #d9e2f0', borderRadius: 'inherit', color: '#86909c', background: '#fff' }}><span>{props.placeholder}</span>{kind === 'select' ? <ChevronDownIcon size={14} /> : kind === 'date' ? <CalendarDaysIcon size={14} /> : null}</div>;
  if (kind === 'switch') return <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}><span style={{ width: 40, height: 21, borderRadius: 12, padding: 2, background: props.checked === 'true' ? '#165DFF' : '#c9cdd4' }}><i style={{ display: 'block', width: 17, height: 17, borderRadius: '50%', transform: props.checked === 'true' ? 'translateX(19px)' : 'none', background: '#fff', transition: '.2s' }} /></span></div>;
  if (kind === 'container') return <div style={{ boxSizing: 'border-box', width: '100%', height: '100%', padding: 12, border: '1px dashed #9ec1ff', borderRadius: 'inherit', color: '#86909c' }}>{props.title}</div>;
  if (kind === 'columns') return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Number(props.columns) || 2},1fr)`, gap: 8, width: '100%', height: '100%' }}>{Array.from({ length: Number(props.columns) || 2 }, (_, index) => <span key={index} style={{ border: '1px dashed #9ec1ff', background: '#f7fbff' }} />)}</div>;
  if (kind === 'card') return <div style={{ boxSizing: 'border-box', width: '100%', height: '100%', padding: 13, border: '1px solid #edf0f5', borderRadius: 'inherit', background: 'inherit' }}><b>{props.title}</b><p style={{ margin: '10px 0', color: '#86909c', fontSize: 12 }}>{props.content}</p></div>;
  if (kind === 'tabs') return <div style={{ width: '100%', height: '100%' }}><div style={{ display: 'flex', gap: 20, height: 30, borderBottom: '1px solid #edf0f5' }}>{props.tabs.split(',').map((tab, index) => <span key={tab} style={{ color: index ? '#86909c' : '#165DFF', borderBottom: index ? 'none' : '2px solid #165DFF', paddingTop: 5, fontSize: 12 }}>{tab}</span>)}</div><div style={{ paddingTop: 12, color: '#86909c', fontSize: 12 }}>标签页内容区域</div></div>;
  if (kind === 'table') return <div style={{ width: '100%', height: '100%', overflow: 'hidden', border: '1px solid #edf0f5', borderRadius: 'inherit' }}><div style={{ display: 'grid', gridTemplateColumns: `repeat(${props.columns.split(',').length},1fr)`, padding: '7px 8px', background: '#f7f8fa', fontSize: 11, fontWeight: 700 }}>{props.columns.split(',').map(column => <span key={column}>{column}</span>)}</div>{['林晓 / 管理员 / 正常', '周远 / 编辑 / 正常', '陈默 / 访客 / 禁用'].map(row => <div key={row} style={{ display: 'grid', gridTemplateColumns: `repeat(${props.columns.split(',').length},1fr)`, padding: '7px 8px', borderTop: '1px solid #f2f3f5', fontSize: 11 }}>{row.split(' / ').map(cell => <span key={cell}>{cell}</span>)}</div>)}</div>;
  if (kind === 'list') return <div style={{ padding: '6px 10px', border: '1px solid #edf0f5', borderRadius: 'inherit', background: 'inherit' }}>{props.items.split(',').map((item, index) => <div key={item} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: index === props.items.split(',').length - 1 ? 'none' : '1px solid #f2f3f5', fontSize: 12 }}><span>{item}</span><span style={{ color: '#86909c' }}>›</span></div>)}</div>;
  if (kind === 'bar' || kind === 'line' || kind === 'pie') return <ChartStub kind={kind} title={props.title} />;
  if (kind === 'avatar') return <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: '100%' }}><span style={{ display: 'grid', width: 38, height: 38, placeItems: 'center', borderRadius: '50%', color: '#fff', background: '#165DFF', fontWeight: 700 }}>{props.name.slice(0, 1)}</span><span><b style={{ display: 'block', fontSize: 13 }}>{props.name}</b><small style={{ color: '#86909c' }}>{props.role}</small></span></div>;
  if (kind === 'status') return <span style={{ display: 'inline-flex', height: '100%', alignItems: 'center', padding: '0 9px', borderRadius: 14, color: props.status === 'success' ? '#00b42a' : '#ff7d00', background: props.status === 'success' ? '#e8ffea' : '#fff7e8', fontSize: 12 }}>●&nbsp; {props.text}</span>;
  return <div style={{ boxSizing: 'border-box', width: '100%', height: '100%', padding: 14, border: '1px solid #edf0f5', borderRadius: 'inherit', background: 'inherit' }}><div style={{ color: '#86909c', fontSize: 12 }}>{props.title}</div><b style={{ display: 'block', marginTop: 8, fontSize: 26 }}>{props.value}</b><small style={{ color: '#00b42a' }}>{props.trend} 较昨日</small></div>;
}

export default function PageDesignerPage() {
  const [components, setComponents] = useState<DesignComponent[]>(initialComponents);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>('pc');
  const [selectedIds, setSelectedIds] = useState<string[]>(['button']);
  const [panelTab, setPanelTab] = useState<PanelTab>('props');
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [redoStack, setRedoStack] = useState<Snapshot[]>([]);
  const [preview, setPreview] = useState(false);
  const [published, setPublished] = useState(false);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const selected = components.find(component => component.id === selectedIds.at(-1)) ?? null;
  const selectedMeta = selected ? componentMeta[selected.kind] : null;
  const pageInput = () => ({ resourceType: 'page' as const, resourceKey: 'order-workbench', name: '订单运营工作台', definition: { components, device } });
  const savePage = async (silent = false) => {
    try { const resource = resourceId ? await updateLowcodeResource(resourceId, pageInput()) : await createLowcodeResource(pageInput()); setResourceId(resource.id); if (!silent) toast.success('页面草稿已保存到浏览器内存'); return resource.id; }
    catch (error) { toast.error(error instanceof Error ? error.message : '保存页面草稿失败'); return null; }
  };
  const publishPage = async () => {
    const id = resourceId ?? await savePage(true); if (!id) return;
    try { const release = await publishLowcodeResource(id, '从页面设计器发布'); setPublished(true); toast.success(`页面已发布，版本号 ${release.version}`); }
    catch (error) { toast.error(error instanceof Error ? error.message : '发布页面失败'); }
  };
  useEffect(() => { let active = true; void listLowcodeResources('page').then(resources => { const resource = resources.find(item => item.resourceKey === 'order-workbench') ?? resources[0]; const definition = resource?.definition as { components?: DesignComponent[]; device?: Device } | undefined; if (active && resource) { setResourceId(resource.id); if (Array.isArray(definition?.components)) setComponents(definition.components); if (definition?.device) setDevice(definition.device); } }).catch(() => {}); return () => { active = false; }; }, []);
  const grouped = useMemo(() => groupOrder.map(group => ({ group, items: (Object.keys(componentMeta) as ComponentKind[]).filter(key => componentMeta[key].group === group) })), []);
  const snapshot = () => setUndoStack(previous => [...previous.slice(-29), JSON.parse(JSON.stringify(components))]);
  const updateComponents = (next: DesignComponent[]) => { snapshot(); setComponents(next); setRedoStack([]); };
  const addComponent = (kind: ComponentKind) => {
    const meta = componentMeta[kind]; const id = `${kind}-${Date.now()}`;
    const next: DesignComponent = { id, kind, x: 40 + (components.length % 4) * 42, y: 56 + (components.length % 5) * 36, width: meta.width, height: meta.height, props: { ...meta.defaultProps }, style: { fontSize: '14', color: '#1d2939', fontWeight: '400', background: kind === 'button' ? '#165DFF' : kind === 'container' || kind === 'columns' ? 'transparent' : '#ffffff', borderRadius: '6', padding: kind === 'text' ? '0' : '8', boxShadow: kind === 'metric' || kind === 'card' ? '0 4px 10px rgba(0,0,0,.05)' : 'none', className: '' }, events: { click: '', dblclick: '', load: '' } };
    updateComponents([...components, next]); setSelectedIds([id]); toast.success(`已添加${meta.label}组件`);
  };
  const undo = () => { const last = undoStack.at(-1); if (!last) return; setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(components))]); setComponents(last); setUndoStack(prev => prev.slice(0, -1)); };
  const redo = () => { const last = redoStack.at(-1); if (!last) return; setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(components))]); setComponents(last); setRedoStack(prev => prev.slice(0, -1)); };
  const startDrag = (event: PointerEvent<HTMLDivElement>, component: DesignComponent) => {
    event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); const rect = deviceRef.current?.getBoundingClientRect(); if (!rect) return;
    if (event.shiftKey) setSelectedIds(prev => prev.includes(component.id) ? prev.filter(id => id !== component.id) : [...prev, component.id]); else setSelectedIds([component.id]); snapshot(); dragRef.current = { id: component.id, dx: event.clientX - rect.left - component.x, dy: event.clientY - rect.top - component.y };
  };
  const moveComponent = (event: PointerEvent<HTMLDivElement>) => { if (!dragRef.current) return; const rect = deviceRef.current?.getBoundingClientRect(); if (!rect) return; const { id, dx, dy } = dragRef.current; setComponents(prev => prev.map(component => component.id === id ? { ...component, x: snap(event.clientX - rect.left - dx), y: snap(event.clientY - rect.top - dy) } : component)); };
  const finishDrag = () => { if (dragRef.current) { dragRef.current = null; setRedoStack([]); } };
  const updateSelected = (section: 'props' | 'style' | 'events', key: string, value: string) => { if (!selected) return; setComponents(previous => previous.map(component => component.id === selected.id ? { ...component, [section]: { ...component[section], [key]: value } } : component)); };
  const duplicate = () => { if (!selected) return; const id = `${selected.kind}-${Date.now()}`; updateComponents([...components, { ...JSON.parse(JSON.stringify(selected)), id, x: selected.x + 20, y: selected.y + 20 }]); setSelectedIds([id]); toast.success('组件已复制'); };
  const deleteSelected = () => { if (!selectedIds.length) return; updateComponents(components.filter(component => !selectedIds.includes(component.id))); setSelectedIds([]); toast.success('已删除选中组件'); };
  const layer = (direction: 'up' | 'down') => { if (!selected) return; const index = components.findIndex(item => item.id === selected.id); const target = direction === 'up' ? Math.min(components.length - 1, index + 1) : Math.max(0, index - 1); if (index === target) return; const next = [...components]; [next[index], next[target]] = [next[target], next[index]]; updateComponents(next); };
  const renderPanel = () => {
    if (!selected || !selectedMeta) return <div className="lc-panel-body lc-tip">从画布选择一个组件以配置属性、样式和事件。</div>;
    if (panelTab === 'props') return <div className="lc-panel-body"><div className="lc-tip" style={{ marginBottom: 14 }}>{selectedMeta.label} · ID：{selected.id}</div>{Object.entries(selected.props).map(([key, value]) => <div className="lc-field" key={key}><label className="lc-label">{({ text: '文本内容', src: '图片地址', type: '按钮类型', placeholder: '占位提示', checked: '默认状态', title: '标题', content: '内容', columns: '栏数', tabs: '标签（逗号分隔）', items: '列表项（逗号分隔）', name: '姓名', role: '角色', status: '状态', value: '指标数值', trend: '变化趋势' } as Record<string, string>)[key] ?? key}</label>{key === 'type' || key === 'status' || key === 'checked' ? <select className="lc-select" value={value} onChange={event => updateSelected('props', key, event.target.value)}>{key === 'type' && <><option value="primary">主要按钮</option><option value="default">次要按钮</option></>}{key === 'status' && <><option value="success">成功</option><option value="warning">警告</option></>}{key === 'checked' && <><option value="true">开启</option><option value="false">关闭</option></>}</select> : <input className="lc-input" value={value} onChange={event => updateSelected('props', key, event.target.value)} />}</div>)}<div className="lc-field"><label className="lc-label">数据源绑定</label><select className="lc-select" onChange={event => updateSelected('props', 'binding', event.target.value)} value={selected.props.binding ?? ''}><option value="">未绑定</option>{apiOptions.map(option => <option key={option}>{option}</option>)}</select></div><div className="lc-field"><label className="lc-label">变量映射</label><input className="lc-input" value={selected.props.mapping ?? ''} placeholder="{{data.user.name}}" onChange={event => updateSelected('props', 'mapping', event.target.value)} /></div></div>;
    if (panelTab === 'style') return <div className="lc-panel-body">{[['fontSize', '字号（px）'], ['fontWeight', '字重'], ['color', '文字颜色'], ['background', '背景色'], ['borderRadius', '圆角（px）'], ['padding', '内边距（px）'], ['boxShadow', '阴影']].map(([key, label]) => <div className="lc-field" key={key}><label className="lc-label">{label}</label><input className="lc-input" value={selected.style[key] ?? ''} onChange={event => updateSelected('style', key, event.target.value)} /></div>)}<div className="lc-field"><label className="lc-label">CSS 类名</label><input className="lc-input" value={selected.style.className ?? ''} placeholder="custom-card" onChange={event => updateSelected('style', 'className', event.target.value)} /></div></div>;
    return <div className="lc-panel-body"><p className="lc-tip" style={{ marginTop: 0 }}>事件可绑定已发布接口或自定义脚本。</p>{[['click', '点击时'], ['dblclick', '双击时'], ['load', '加载时']].map(([event, label]) => <div className="lc-event-row" key={event}><span>{label}</span><select className="lc-select" style={{ width: 150, height: 28 }} value={selected.events[event] ?? ''} onChange={item => updateSelected('events', event, item.target.value)}><option value="">不触发</option>{apiOptions.map(api => <option key={api}>{api}</option>)}<option value="custom">自定义脚本</option></select></div>)}{Object.values(selected.events).includes('custom') && <div className="lc-field" style={{ marginTop: 12 }}><label className="lc-label">自定义脚本</label><textarea className="lc-code-editor" defaultValue={'console.log("component event", data);'} /></div>}</div>;
  };

  return (
    <PageShell title="页面设计器" description="以自由拖拽方式构建页面，组件可直接绑定已发布接口与 {{data.xxx}} 变量。" actions={<><LowcodeButton onClick={() => setPreview(true)}><EyeIcon size={14} />预览</LowcodeButton><LowcodeButton onClick={() => void savePage()}><SaveIcon size={14} />保存</LowcodeButton><LowcodeButton primary onClick={() => void publishPage()}><SendIcon size={14} />发布</LowcodeButton></>}>
      <section className="lc-card lc-designer">
        <aside className="lc-side-panel left"><div className="lc-panel-title"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ComponentIcon size={15} />组件库</span><span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>点击添加</span></div>{grouped.map(({ group, items }) => <div className="lc-library-group" key={group}><h3>{group}</h3><div className="lc-library-items">{items.map(kind => { const meta = componentMeta[kind]; const Icon = meta.icon; return <button className="lc-library-item" key={kind} onClick={() => addComponent(kind)}><Icon size={13} color="#165DFF" />{meta.label}</button>; })}</div></div>)}</aside>
        <div className="lc-canvas-column"><div className="lc-toolbar"><LowcodeButton onClick={undo} disabled={!undoStack.length}><Undo2Icon size={14} />撤销</LowcodeButton><LowcodeButton onClick={redo} disabled={!redoStack.length}><Redo2Icon size={14} />重做</LowcodeButton><LowcodeButton onClick={duplicate} disabled={!selected}><ClipboardCopyIcon size={14} />复制</LowcodeButton><LowcodeButton onClick={deleteSelected} danger disabled={!selectedIds.length}><Trash2Icon size={14} />删除</LowcodeButton><span className="lc-tool-divider" />{([{ id: 'pc', icon: MonitorIcon, label: 'PC' }, { id: 'tablet', icon: TabletIcon, label: '平板' }, { id: 'mobile', icon: SmartphoneIcon, label: '手机' }] as const).map(item => <LowcodeButton key={item.id} primary={device === item.id} onClick={() => setDevice(item.id)}><item.icon size={14} />{item.label}</LowcodeButton>)}<span style={{ marginLeft: 'auto' }} /><LowcodeButton danger onClick={() => { if (window.confirm('确定清空画布中的全部组件吗？')) { updateComponents([]); setSelectedIds([]); toast.success('画布已清空'); } }}><Trash2Icon size={14} />清空画布</LowcodeButton></div>
          <div className="lc-device-wrap"><div ref={deviceRef} className={`lc-device ${device}`} onPointerMove={moveComponent} onPointerUp={finishDrag} onPointerLeave={finishDrag} onClick={() => setSelectedIds([])}>{components.map(component => <div key={component.id} className={`lc-device-component ${selectedIds.includes(component.id) ? 'selected' : ''} ${selectedIds.length > 1 && selectedIds.includes(component.id) ? 'multi-selected' : ''} ${component.style.className ?? ''}`} style={{ left: component.x, top: component.y, width: component.width, height: component.height, color: component.style.color, background: component.style.background, borderRadius: `${component.style.borderRadius}px`.replace('pxpx', 'px'), padding: `${component.style.padding}px`.replace('pxpx', 'px'), boxShadow: component.style.boxShadow, fontSize: `${component.style.fontSize}px`.replace('pxpx', 'px'), fontWeight: component.style.fontWeight, zIndex: components.findIndex(item => item.id === component.id) + 1, boxSizing: 'border-box' }} onPointerDown={event => startDrag(event, component)} onClick={event => { event.stopPropagation(); if (event.shiftKey) setSelectedIds(prev => prev.includes(component.id) ? prev.filter(id => id !== component.id) : [...prev, component.id]); else setSelectedIds([component.id]); }}><ComponentView component={component} />{selectedIds.includes(component.id) && <span className="lc-component-handle" />}</div>)}</div></div>
          <div className="lc-statusbar"><span>画布：{device === 'pc' ? 'PC 1440px' : device === 'tablet' ? '平板 768px' : '手机 375px'}</span><span>已选 {selectedIds.length} 个组件</span><span>网格吸附：10px</span><span style={{ marginLeft: 'auto' }}>Shift + 点击多选 · 组件可自由拖拽</span></div>
        </div>
        <aside className="lc-side-panel right"><div className="lc-tabs"><button className={panelTab === 'props' ? 'active' : ''} onClick={() => setPanelTab('props')}>属性</button><button className={panelTab === 'style' ? 'active' : ''} onClick={() => setPanelTab('style')}>样式</button><button className={panelTab === 'event' ? 'active' : ''} onClick={() => setPanelTab('event')}>事件</button></div><div className="lc-panel-title"><span>{selectedMeta?.label ?? '未选择组件'}</span>{selected && <span style={{ display: 'flex', gap: 4 }}><button className="lc-tiny-btn" title="下移图层" onClick={() => layer('down')}><Layers2Icon size={14} /></button><button className="lc-tiny-btn" title="上移图层" onClick={() => layer('up')}><BringToFrontIcon size={14} /></button></span>}</div>{renderPanel()}</aside>
      </section>
      <Modal title="页面预览 · 订单运营工作台" open={preview} onClose={() => setPreview(false)} wide footer={<LowcodeButton primary onClick={() => setPreview(false)}>关闭预览</LowcodeButton>}><div style={{ display: 'flex', justifyContent: 'center', maxHeight: '66vh', overflow: 'auto', padding: 14, background: '#f2f3f5' }}><div className={`lc-device ${device}`} style={{ minHeight: 510, transform: 'scale(.78)', transformOrigin: 'top center', marginBottom: device === 'pc' ? -100 : -55 }}>{components.map(component => <div key={component.id} className="lc-device-component" style={{ left: component.x, top: component.y, width: component.width, height: component.height, color: component.style.color, background: component.style.background, borderRadius: `${component.style.borderRadius}px`.replace('pxpx', 'px'), padding: `${component.style.padding}px`.replace('pxpx', 'px'), boxShadow: component.style.boxShadow, fontSize: `${component.style.fontSize}px`.replace('pxpx', 'px'), fontWeight: component.style.fontWeight, boxSizing: 'border-box' }}><ComponentView component={component} /></div>)}</div></div></Modal>
      {published && <span style={{ display: 'none' }} aria-hidden="true">published</span>}
    </PageShell>
  );
}
