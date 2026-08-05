import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import {
  BracesIcon, ChevronDownIcon, ChevronRightIcon, CirclePlayIcon, Code2Icon, DatabaseIcon, FileCode2Icon,
  FolderIcon, GitBranchIcon, Globe2Icon, ListPlusIcon, Maximize2Icon, MinusIcon, MousePointer2Icon,
  NetworkIcon, PlayIcon, PlusIcon, Redo2Icon, SaveIcon, SearchIcon, SendIcon, Settings2Icon, Trash2Icon,
  Undo2Icon, WorkflowIcon, XIcon, KeyboardIcon, ShieldCheckIcon, HardDriveIcon, MailIcon, FolderUpIcon, BugIcon, Clock3Icon,
} from 'lucide-react';
import { toast } from 'sonner';
import { LowcodeButton, Modal, PageShell, formatTime } from './LowcodeShared';

type NodeKind = 'start' | 'script' | 'database' | 'branch' | 'loop' | 'request' | 'auth' | 'cache' | 'message' | 'file' | 'aggregate' | 'exception' | 'schedule' | 'end';
type KV = { key: string; value: string };
type NodeConfig = Record<string, string | KV[]>;
type FlowNode = { id: string; kind: NodeKind; label: string; x: number; y: number; config: NodeConfig };
type FlowEdge = { id: string; source: string; target: string };
type HistoryItem = { nodes: FlowNode[]; edges: FlowEdge[] };
type TreeItem = { id: string; name: string; folder?: boolean; method?: string; children?: TreeItem[] };

const nodeMeta: Record<NodeKind, { label: string; color: string; icon: typeof PlayIcon; hint: string }> = {
  start: { label: '开始节点', color: '#165DFF', icon: PlayIcon, hint: 'HTTP 触发：POST /api/orders' },
  script: { label: '脚本节点', color: '#722ED1', icon: Code2Icon, hint: 'JavaScript 数据处理' },
  database: { label: '数据库节点', color: '#00B42A', icon: DatabaseIcon, hint: '查询用户订单数据' },
  branch: { label: '分支节点', color: '#FF7D00', icon: GitBranchIcon, hint: '判断是否为 VIP 用户' },
  loop: { label: '循环节点', color: '#14C9C9', icon: WorkflowIcon, hint: '遍历订单列表' },
  request: { label: '接口调用', color: '#F77234', icon: Globe2Icon, hint: '调用外部 HTTP API' },
  auth: { label: '认证节点', color: '#165DFF', icon: ShieldCheckIcon, hint: 'JWT / OAuth2 / API Key 校验' },
  cache: { label: '缓存节点', color: '#00B42A', icon: HardDriveIcon, hint: 'Redis 读写与本地缓存' },
  message: { label: '消息节点', color: '#722ED1', icon: MailIcon, hint: '邮件、短信、WebSocket、MQ 投递' },
  file: { label: '文件节点', color: '#14C9C9', icon: FolderUpIcon, hint: '上传、下载与 OSS 操作' },
  aggregate: { label: '聚合节点', color: '#FF7D00', icon: WorkflowIcon, hint: '并行调用后聚合结果' },
  exception: { label: '异常节点', color: '#F53F3F', icon: BugIcon, hint: '全局捕获与重试策略' },
  schedule: { label: '定时节点', color: '#86909C', icon: Clock3Icon, hint: 'Cron 触发与延迟执行' },
  end: { label: '结束节点', color: '#86909C', icon: SendIcon, hint: '返回 JSON 响应数据' },
};

const initialNodes: FlowNode[] = [
  { id: 'start', kind: 'start', label: '订单创建入口', x: 64, y: 244, config: { method: 'POST', path: '/api/v1/orders' } },
  { id: 'script', kind: 'script', label: '参数标准化', x: 278, y: 244, config: { language: 'JavaScript', code: 'const order = { ...input, createdAt: Date.now() };\nreturn { order };', params: '["input", "user"]' } },
  { id: 'database', kind: 'database', label: '写入订单数据', x: 495, y: 244, config: { datasource: '商城 MySQL', sql: 'INSERT INTO orders (user_id, amount) VALUES (:userId, :amount)' } },
  { id: 'branch', kind: 'branch', label: '判断库存', x: 706, y: 244, config: { condition: '{{data.stock}} > 0' } },
  { id: 'request', kind: 'request', label: '扣减库存', x: 706, y: 396, config: { method: 'POST', url: 'https://inventory.example.com/v1/deduct', headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }], body: '{\n  "skuId": "{{data.skuId}}",\n  "count": "{{data.count}}"\n}' } },
  { id: 'end', kind: 'end', label: '返回创建结果', x: 920, y: 300, config: { response: '{\n  "code": 0,\n  "data": {{data.order}}\n}' } },
];
const initialEdges: FlowEdge[] = [
  { id: 'e1', source: 'start', target: 'script' }, { id: 'e2', source: 'script', target: 'database' },
  { id: 'e3', source: 'database', target: 'branch' }, { id: 'e4', source: 'branch', target: 'request' }, { id: 'e5', source: 'request', target: 'end' },
];

const treeData: TreeItem[] = [
  { id: 'folder-order', name: '订单服务', folder: true, children: [{ id: 'order-create', name: '创建订单', method: 'POST' }, { id: 'order-list', name: '订单列表', method: 'GET' }] },
  { id: 'folder-user', name: '用户服务', folder: true, children: [{ id: 'user-profile', name: '用户详情', method: 'GET' }] },
  { id: 'health', name: '服务健康检查', method: 'GET' },
];

function clone(nodes: FlowNode[], edges: FlowEdge[]): HistoryItem { return { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }; }
function curvePath(source: FlowNode, target: FlowNode) {
  const sx = source.x + 154; const sy = source.y + 31; const tx = target.x; const ty = target.y + 31;
  const offset = Math.max(55, Math.abs(tx - sx) * .48);
  return `M ${sx} ${sy} C ${sx + offset} ${sy}, ${tx - offset} ${ty}, ${tx} ${ty}`;
}

export default function ApiOrchestrationPage() {
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [edges, setEdges] = useState<FlowEdge[]>(initialEdges);
  const [selectedId, setSelectedId] = useState('script');
  const [treeSearch, setTreeSearch] = useState('');
  const [treeItems, setTreeItems] = useState<TreeItem[]>(treeData);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ 'folder-order': true, 'folder-user': true });
  const [zoom, setZoom] = useState(0.82);
  const [lastSaved, setLastSaved] = useState('2026-08-05 10:24:36');
  const [undoStack, setUndoStack] = useState<HistoryItem[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryItem[]>([]);
  const [testOpen, setTestOpen] = useState(false);
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<FlowNode[]>([]);
  const [inspectorWidth, setInspectorWidth] = useState(286);
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const resizingInspector = useRef(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const selected = nodes.find(node => node.id === selectedId) ?? null;

  const filteredTree = useMemo(() => treeItems.map(item => ({ ...item, children: item.children?.filter(child => child.name.includes(treeSearch)) })).filter(item => !treeSearch || item.name.includes(treeSearch) || item.children?.length), [treeSearch, treeItems]);
  const snapshot = () => setUndoStack(previous => [...previous.slice(-29), clone(nodes, edges)]);
  const updateFlow = (nextNodes: FlowNode[], nextEdges = edges) => { snapshot(); setNodes(nextNodes); setEdges(nextEdges); setRedoStack([]); };
  const updateConfig = (key: string, value: string | KV[]) => setNodes(previous => previous.map(node => node.id === selectedId ? { ...node, config: { ...node.config, [key]: value } } : node));

  const addNode = (kind: NodeKind) => {
    const meta = nodeMeta[kind]; const id = `${kind}-${Date.now()}`;
    const next: FlowNode = { id, kind, label: meta.label, x: 185 + (nodes.length % 4) * 160, y: 100 + (nodes.length % 3) * 140, config: kind === 'script' ? { language: 'JavaScript', code: 'return data;', params: '[]' } : kind === 'request' ? { method: 'GET', url: '', headers: [], body: '{}' } : kind === 'database' ? { datasource: '商城 MySQL', sql: 'SELECT * FROM table_name LIMIT 20;' } : kind === 'branch' ? { condition: '{{data.success}} === true' } : {} };
    updateFlow([...nodes, next]); setSelectedId(id); toast.success(`已添加${meta.label}`);
  };
  const removeSelectedNode = () => {
    if (!selected || ['start', 'end'].includes(selected.kind)) return toast.error('开始与结束节点不可删除');
    updateFlow(nodes.filter(node => node.id !== selected.id), edges.filter(edge => edge.source !== selected.id && edge.target !== selected.id)); setSelectedId('start'); toast.success('节点已删除');
  };
  const undo = () => {
    const last = undoStack.at(-1); if (!last) return;
    setRedoStack(prev => [...prev, clone(nodes, edges)]); setNodes(last.nodes); setEdges(last.edges); setUndoStack(prev => prev.slice(0, -1)); toast.message('已撤销上一步操作');
  };
  const redo = () => {
    const last = redoStack.at(-1); if (!last) return;
    setUndoStack(prev => [...prev, clone(nodes, edges)]); setNodes(last.nodes); setEdges(last.edges); setRedoStack(prev => prev.slice(0, -1)); toast.message('已重做操作');
  };
  const startDrag = (event: PointerEvent<HTMLDivElement>, node: FlowNode) => {
    if ((event.target as HTMLElement).closest('.lc-port')) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.currentTarget.setPointerCapture(event.pointerId); snapshot(); dragRef.current = { id: node.id, x: (event.clientX - rect.left) / zoom - node.x, y: (event.clientY - rect.top) / zoom - node.y }; setSelectedId(node.id);
  };
  const moveCanvas = (event: PointerEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect(); if (rect) setCursor({ x: (event.clientX - rect.left) / zoom, y: (event.clientY - rect.top) / zoom });
    if (!dragRef.current || !rect) return;
    const { id, x, y } = dragRef.current;
    setNodes(previous => previous.map(node => node.id === id ? { ...node, x: Math.max(4, (event.clientX - rect.left) / zoom - x), y: Math.max(4, (event.clientY - rect.top) / zoom - y) } : node));
  };
  const finishDrag = () => { if (dragRef.current) { dragRef.current = null; setRedoStack([]); } };
  const connect = (target: string) => {
    if (!connectingFrom || connectingFrom === target) return setConnectingFrom(null);
    if (edges.some(edge => edge.source === connectingFrom && edge.target === target)) return setConnectingFrom(null);
    updateFlow(nodes, [...edges, { id: `e-${Date.now()}`, source: connectingFrom, target }]); setConnectingFrom(null); toast.success('节点连线已创建');
  };
  const deleteEdge = (edge: FlowEdge) => { updateFlow(nodes, edges.filter(item => item.id !== edge.id)); toast.success('连线已断开'); };
  const updateTreeItem = (items: TreeItem[], id: string, transform: (item: TreeItem) => TreeItem | null): TreeItem[] => items.flatMap(item => {
    if (item.id === id) { const changed = transform(item); return changed ? [changed] : []; }
    return [{ ...item, children: item.children ? updateTreeItem(item.children, id, transform) : undefined }];
  });
  const treeAction = (action: 'new' | 'folder' | 'rename' | 'delete', id = '', name = '') => {
    if (action === 'new') { const next = window.prompt('请输入接口名称', '未命名接口'); if (next?.trim()) { setTreeItems(prev => [...prev, { id: `api-${Date.now()}`, name: next.trim(), method: 'POST' }]); toast.success(`接口「${next.trim()}」已创建`); } return; }
    if (action === 'folder') { const next = window.prompt('请输入文件夹名称', '新建文件夹'); if (next?.trim()) { setTreeItems(prev => [...prev, { id: `folder-${Date.now()}`, name: next.trim(), folder: true, children: [] }]); toast.success(`文件夹「${next.trim()}」已创建`); } return; }
    if (action === 'rename') { const next = window.prompt('请输入新的接口名称', name); if (next?.trim()) { setTreeItems(prev => updateTreeItem(prev, id, item => ({ ...item, name: next.trim() }))); toast.success(`已重命名为「${next.trim()}」`); } return; }
    if (window.confirm(`确定删除「${name}」吗？`)) { setTreeItems(prev => updateTreeItem(prev, id, () => null)); toast.success('接口已删除'); }
  };
  const renameSelected = () => {
    if (!selected) return;
    const next = window.prompt('编辑节点名称', selected.label);
    if (!next?.trim()) return;
    snapshot(); setNodes(previous => previous.map(node => node.id === selected.id ? { ...node, label: next.trim() } : node)); setRedoStack([]); toast.success('节点名称已更新');
  };
  const copySelected = () => {
    if (!selected) return;
    setClipboard([JSON.parse(JSON.stringify(selected))]); toast.message(`已复制节点「${selected.label}」`);
  };
  const pasteNodes = () => {
    if (!clipboard.length) return toast.warning('剪贴板中没有可粘贴的节点');
    const copied = clipboard.map((node, index) => ({ ...node, id: `${node.kind}-${Date.now()}-${index}`, x: node.x + 32, y: node.y + 32, label: `${node.label} 副本` }));
    updateFlow([...nodes, ...copied]); setSelectedId(copied.at(-1)?.id ?? selectedId); toast.success(`已粘贴 ${copied.length} 个节点`);
  };
  const duplicateSelected = () => {
    if (!selected) return;
    const copied = { ...JSON.parse(JSON.stringify(selected)), id: `${selected.kind}-${Date.now()}`, x: selected.x + 32, y: selected.y + 32, label: `${selected.label} 副本` } as FlowNode;
    updateFlow([...nodes, copied]); setSelectedId(copied.id); toast.success('节点已快速复制');
  };
  const moveSelected = (x: number, y: number) => {
    if (!selected) return;
    updateFlow(nodes.map(node => node.id === selected.id ? { ...node, x: Math.max(4, node.x + x), y: Math.max(4, node.y + y) } : node));
  };
  useEffect(() => {
    const isEditingTarget = (target: EventTarget | null) => target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditingTarget(event.target)) return;
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === 's') { event.preventDefault(); setLastSaved(formatTime()); toast.success('接口编排已保存'); return; }
      if (event.key === 'Escape') { if (connectingFrom) { setConnectingFrom(null); toast.message('已取消正在创建的连线'); } return; }
      if (!selected) return;
      if (event.key === 'F2' || event.key.toLowerCase() === 'e') { event.preventDefault(); renameSelected(); return; }
      if (modifier && event.key.toLowerCase() === 'c') { event.preventDefault(); copySelected(); return; }
      if (modifier && event.key.toLowerCase() === 'v') { event.preventDefault(); pasteNodes(); return; }
      if (modifier && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicateSelected(); return; }
      if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); removeSelectedNode(); return; }
      const step = event.shiftKey ? 30 : 10;
      const shifts: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (shifts[event.key]) { event.preventDefault(); moveSelected(...shifts[event.key]); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });
  useEffect(() => {
    const move = (event: globalThis.PointerEvent) => {
      if (!resizingInspector.current) return;
      setInspectorWidth(Math.max(286, Math.min(620, window.innerWidth - event.clientX)));
    };
    const up = () => { resizingInspector.current = false; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, []);
  const renderPropertyPanel = () => {
    if (!selected) return <div className="lc-panel-body lc-tip">请从画布中选择一个节点以编辑配置。</div>;
    const config = selected.config;
    const meta = nodeMeta[selected.kind];
    const common = <><div className="lc-field"><label className="lc-label">节点名称</label><input className="lc-input" value={selected.label} onChange={event => setNodes(prev => prev.map(node => node.id === selected.id ? { ...node, label: event.target.value } : node))} /></div><div className="lc-tip">节点 ID：{selected.id}</div></>;
    if (selected.kind === 'script') return <div className="lc-panel-body"><div className="lc-field"><label className="lc-label">脚本语言</label><select className="lc-select" value={String(config.language ?? 'JavaScript')} onChange={event => updateConfig('language', event.target.value)}><option>Lua</option><option>JavaScript</option><option>JSON</option></select></div><div className="lc-field"><label className="lc-label">代码编辑器 <span style={{ color: 'var(--muted-foreground)' }}>（编辑模式）</span></label><textarea spellCheck={false} className="lc-code-editor" value={String(config.code ?? '')} onChange={event => updateConfig('code', event.target.value)} /></div><div className="lc-field"><label className="lc-label">输入参数（JSON 数组）</label><input className="lc-input" value={String(config.params ?? '[]')} onChange={event => updateConfig('params', event.target.value)} /></div>{common}</div>;
    if (selected.kind === 'start' || selected.kind === 'request') {
      const headers = (config.headers as KV[] | undefined) ?? [];
      return <div className="lc-panel-body"><div className="lc-field"><label className="lc-label">请求方法</label><select className="lc-select" value={String(config.method ?? 'GET')} onChange={event => updateConfig('method', event.target.value)}>{['GET', 'POST', 'PUT', 'DELETE'].map(value => <option key={value}>{value}</option>)}</select></div><div className="lc-field"><label className="lc-label">{selected.kind === 'start' ? '路由路径' : '请求 URL'}</label><input className="lc-input" value={String(config[selected.kind === 'start' ? 'path' : 'url'] ?? '')} placeholder={selected.kind === 'start' ? '/api/v1/example' : 'https://api.example.com'} onChange={event => updateConfig(selected.kind === 'start' ? 'path' : 'url', event.target.value)} /></div>{selected.kind === 'request' && <><div className="lc-field"><label className="lc-label">请求头 Headers</label>{headers.map((pair, index) => <div className="lc-kv-row" key={index}><input className="lc-input" value={pair.key} placeholder="Key" onChange={event => { const next = [...headers]; next[index] = { ...pair, key: event.target.value }; updateConfig('headers', next); }} /><input className="lc-input" value={pair.value} placeholder="Value" onChange={event => { const next = [...headers]; next[index] = { ...pair, value: event.target.value }; updateConfig('headers', next); }} /><button className="lc-tiny-btn" onClick={() => updateConfig('headers', headers.filter((_, itemIndex) => itemIndex !== index))}><XIcon size={13} /></button></div>)}<button className="lc-link-btn" onClick={() => updateConfig('headers', [...headers, { key: '', value: '' }])}>+ 添加 Header</button></div><div className="lc-field"><label className="lc-label">请求体 Body（JSON）</label><textarea className="lc-textarea" value={String(config.body ?? '{}')} onChange={event => updateConfig('body', event.target.value)} /></div></>}{common}</div>;
    }
    if (selected.kind === 'database') return <div className="lc-panel-body"><div className="lc-field"><label className="lc-label">数据源</label><select className="lc-select" value={String(config.datasource ?? '')} onChange={event => updateConfig('datasource', event.target.value)}><option>商城 MySQL</option><option>用户中心 PostgreSQL</option><option>缓存 Redis</option></select></div><div className="lc-field"><label className="lc-label">SQL 执行语句</label><textarea className="lc-code-editor" value={String(config.sql ?? '')} onChange={event => updateConfig('sql', event.target.value)} /></div>{common}</div>;
    if (selected.kind === 'branch') return <div className="lc-panel-body"><div className="lc-field"><label className="lc-label">条件表达式</label><input className="lc-input" value={String(config.condition ?? '')} onChange={event => updateConfig('condition', event.target.value)} /></div><LowcodeButton onClick={() => toast.message('变量选择器：data.user、data.order、data.stock')}>选择变量</LowcodeButton><div style={{ marginTop: 12 }} className="lc-tip">表达式示例：{'{{data.user.level}} === "vip"'}</div><div style={{ marginTop: 14 }}>{common}</div></div>;
    if (selected.kind === 'end') return <div className="lc-panel-body"><div className="lc-field"><label className="lc-label">返回数据拼装（JSON）</label><textarea className="lc-code-editor" value={String(config.response ?? '{}')} onChange={event => updateConfig('response', event.target.value)} /></div>{common}</div>;
    return <div className="lc-panel-body"><div className="lc-field"><label className="lc-label">循环类型</label><select className="lc-select"><option>for</option><option>while</option></select></div><div className="lc-field"><label className="lc-label">迭代表达式</label><input className="lc-input" defaultValue="{{data.items}}" /></div>{common}</div>;
  };

  return (
    <PageShell title="接口编排" description="通过可视化流程编排，将 HTTP、脚本、数据库与外部服务组合成可发布接口。" actions={<><LowcodeButton onClick={() => { setLastSaved(formatTime()); toast.success('接口编排已保存'); }}><SaveIcon size={14} />保存</LowcodeButton><LowcodeButton onClick={() => setTestOpen(true)}><CirclePlayIcon size={14} />测试运行</LowcodeButton><LowcodeButton primary onClick={() => toast.success('接口已发布为 v1.2.0，可在页面设计器中绑定') }><SendIcon size={14} />发布</LowcodeButton></>}>
      <section className="lc-card lc-workbench lc-workbench-resizable" style={{ '--lc-inspector-width': `${inspectorWidth}px` } as React.CSSProperties}>
        <aside className="lc-side-panel left">
          <div className="lc-panel-title"><span>接口目录</span><div style={{ display: 'flex', gap: 4 }}><button className="lc-tiny-btn" title="新建接口" onClick={() => treeAction('new')}><FileCode2Icon size={15} /></button><button className="lc-tiny-btn" title="新建文件夹" onClick={() => treeAction('folder')}><FolderIcon size={15} /></button></div></div>
          <div className="lc-tree-search"><SearchIcon size={14} /><input className="lc-input" placeholder="搜索接口" value={treeSearch} onChange={event => setTreeSearch(event.target.value)} /></div>
          <div className="lc-tree">{filteredTree.map(item => <div key={item.id}>{item.folder ? <><button className="lc-tree-row" onClick={() => setOpenFolders(prev => ({ ...prev, [item.id]: !prev[item.id] }))}>{openFolders[item.id] ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}<FolderIcon size={14} color="#FFB400" /><span>{item.name}</span><span className="tree-actions"><span className="lc-tiny-btn" onClick={event => { event.stopPropagation(); treeAction('rename', item.id, item.name); }}><Settings2Icon size={12} /></span><span className="lc-tiny-btn" onClick={event => { event.stopPropagation(); treeAction('delete', item.id, item.name); }}><Trash2Icon size={12} /></span></span></button>{openFolders[item.id] && item.children?.map(child => <button key={child.id} className={`lc-tree-row ${child.id === 'order-create' ? 'active' : ''}`} style={{ paddingLeft: 32 }} onClick={() => toast.message(`已打开接口：${child.name}`)}><FileCode2Icon size={13} /><span>{child.name}</span><small style={{ color: child.method === 'GET' ? 'var(--lc-success)' : 'var(--lc-warning)' }}>{child.method}</small><span className="tree-actions"><span className="lc-tiny-btn" onClick={event => { event.stopPropagation(); treeAction('rename', child.id, child.name); }}><Settings2Icon size={12} /></span><span className="lc-tiny-btn" onClick={event => { event.stopPropagation(); treeAction('delete', child.id, child.name); }}><Trash2Icon size={12} /></span></span></button>)}</> : <button className="lc-tree-row" onClick={() => toast.message(`已打开接口：${item.name}`)}><FileCode2Icon size={13} /><span>{item.name}</span><small style={{ color: 'var(--lc-success)' }}>{item.method}</small><span className="tree-actions"><span className="lc-tiny-btn" onClick={event => { event.stopPropagation(); treeAction('rename', item.id, item.name); }}><Settings2Icon size={12} /></span><span className="lc-tiny-btn" onClick={event => { event.stopPropagation(); treeAction('delete', item.id, item.name); }}><Trash2Icon size={12} /></span></span></button>}</div>)}</div>
          <div className="lc-node-palette"><p className="lc-node-palette-title">拖入 / 点击添加节点</p><div className="lc-node-palette-list">{(Object.keys(nodeMeta) as NodeKind[]).map(kind => { const Icon = nodeMeta[kind].icon; return <button key={kind} onClick={() => addNode(kind)}><Icon size={12} color={nodeMeta[kind].color} />{nodeMeta[kind].label.replace('节点', '')}</button>; })}</div></div>
        </aside>
        <div className="lc-canvas-column">
          <div className="lc-toolbar"><LowcodeButton onClick={undo} disabled={!undoStack.length}><Undo2Icon size={14} />撤销</LowcodeButton><LowcodeButton onClick={redo} disabled={!redoStack.length}><Redo2Icon size={14} />重做</LowcodeButton><span className="lc-tool-divider" /><LowcodeButton onClick={() => setZoom(value => Math.max(.55, value - .1))}><MinusIcon size={14} />缩小</LowcodeButton><LowcodeButton onClick={() => setZoom(value => Math.min(1.15, value + .1))}><PlusIcon size={14} />放大</LowcodeButton><LowcodeButton onClick={() => setZoom(.82)}><Maximize2Icon size={14} />自适应</LowcodeButton><LowcodeButton onClick={() => setShortcutOpen(true)} title="查看节点编辑快捷键"><KeyboardIcon size={14} />快捷键</LowcodeButton><span style={{ marginLeft: 'auto', color: 'var(--muted-foreground)', fontSize: 11 }}>{Math.round(zoom * 100)}%</span><LowcodeButton danger onClick={removeSelectedNode} disabled={!selected || selected.kind === 'start' || selected.kind === 'end'}><Trash2Icon size={14} />删除节点</LowcodeButton></div>
          <div ref={canvasRef} className="lc-flow-canvas" onPointerMove={moveCanvas} onPointerUp={finishDrag} onPointerLeave={finishDrag}>
            <div className="lc-flow-inner" style={{ transform: `scale(${zoom})`, width: 1180, height: 620 }}>
              <svg className="lc-flow-svg" viewBox="0 0 1180 620">{edges.map(edge => { const source = nodes.find(node => node.id === edge.source); const target = nodes.find(node => node.id === edge.target); return source && target ? <path key={edge.id} d={curvePath(source, target)} className="lc-flow-edge" style={{ pointerEvents: 'stroke' }} onClick={() => deleteEdge(edge)} /> : null; })}{connectingFrom && (() => { const source = nodes.find(node => node.id === connectingFrom); return source ? <path d={`M ${source.x + 154} ${source.y + 31} C ${source.x + 205} ${source.y + 31}, ${cursor.x - 60} ${cursor.y}, ${cursor.x} ${cursor.y}`} fill="none" stroke="#165DFF" strokeWidth="2" strokeDasharray="5 4" /> : null; })()}</svg>
              {nodes.map(node => { const meta = nodeMeta[node.kind]; const Icon = meta.icon; return <div key={node.id} className={`lc-flow-node ${node.id === selectedId ? 'selected' : ''}`} style={{ left: node.x, top: node.y }} onPointerDown={event => startDrag(event, node)} onClick={() => setSelectedId(node.id)}><span className="lc-port in" title="连接输入" onPointerUp={event => { event.stopPropagation(); connect(node.id); }} /><div className="lc-node-bar" style={{ background: meta.color }}><Icon size={13} /><span>{meta.label}</span></div><div className="lc-node-body">{node.label || meta.hint}</div><span className="lc-port out" title="拖拽连线" onPointerDown={event => { event.stopPropagation(); setConnectingFrom(node.id); }} /></div>; })}
            </div>
          </div>
          <div className="lc-statusbar"><span><b style={{ color: 'var(--foreground)' }}>创建订单</b></span><span>最后保存：{lastSaved}</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><i className="lc-status-dot" />运行状态：就绪</span><span style={{ marginLeft: 'auto' }}>F2/E 编辑 · 方向键移动 · 单击连线可断开</span></div>
        </div>
        <aside className="lc-side-panel right" style={{ position: 'relative' }}><div className="lc-resize-handle" title="拖动调整属性面板宽度" onPointerDown={event => { event.preventDefault(); resizingInspector.current = true; }} /><div className="lc-panel-title"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Settings2Icon size={15} />节点配置</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>{selected && <span style={{ color: nodeMeta[selected.kind].color, fontSize: 11 }}>{nodeMeta[selected.kind].label}</span>}{selected?.kind === 'script' && <button className="lc-tiny-btn" title="全屏编辑代码" onClick={() => setEditorFullscreen(true)}><Maximize2Icon size={14} /></button>}</span></div>{renderPropertyPanel()}</aside>
      </section>
      <Modal title="测试运行 · 创建订单" open={testOpen} onClose={() => setTestOpen(false)} footer={<><LowcodeButton onClick={() => setTestOpen(false)}>关闭</LowcodeButton><LowcodeButton primary onClick={() => toast.success('执行日志已下载')}>下载日志</LowcodeButton></>}><div className="lc-log"><div>[10:31:09.024] <span className="warning">INFO</span> HTTP POST /api/v1/orders 已触发</div><div>[10:31:09.086] <span className="success">PASS</span> 参数标准化执行完成，耗时 62ms</div><div>[10:31:09.163] <span className="success">PASS</span> MySQL 写入订单成功，orderId=20260805001</div><div>[10:31:09.234] <span className="success">PASS</span> 外部库存服务返回 200，扣减成功</div><div>[10:31:09.245] <span className="success">SUCCESS</span> 流程运行结束，总耗时 221ms</div></div></Modal>
      <Modal title="节点编辑快捷键" open={shortcutOpen} onClose={() => setShortcutOpen(false)} footer={<LowcodeButton primary onClick={() => setShortcutOpen(false)}>知道了</LowcodeButton>}><div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px 14px', fontSize: 13 }}><b>F2 / E</b><span>编辑当前选中节点名称</span><b>方向键</b><span>按 10px 移动选中节点（Shift + 方向键为 30px）</span><b>Delete / Backspace</b><span>删除选中节点（开始与结束节点受保护）</span><b>Ctrl/Cmd + C / V</b><span>复制并粘贴节点</span><b>Ctrl/Cmd + D</b><span>快速复制节点</span><b>Ctrl/Cmd + S</b><span>保存当前接口编排</span><b>Esc</b><span>取消正在创建的连线</span></div><p className="lc-tip" style={{ marginBottom: 0, marginTop: 16 }}>焦点位于输入框、下拉框或代码编辑器时，页面不会拦截这些快捷键。</p></Modal>
      {editorFullscreen && selected?.kind === 'script' && <div className="lc-code-fullscreen"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Code2Icon size={19} color="var(--theme-primary)" /><b style={{ fontSize: 16 }}>代码编辑器 · {selected.label}</b><select className="lc-select" style={{ width: 135, marginLeft: 12 }} value={String(selected.config.language ?? 'JavaScript')} onChange={event => updateConfig('language', event.target.value)}><option>Lua</option><option>JavaScript</option><option>JSON</option></select><span style={{ marginLeft: 'auto' }} /><LowcodeButton onClick={() => { setEditorFullscreen(false); toast.success('代码已保存'); }}><SaveIcon size={14} />保存并退出</LowcodeButton><button className="lc-icon-btn" title="退出全屏" onClick={() => setEditorFullscreen(false)}><XIcon size={16} /></button></div><textarea autoFocus spellCheck={false} className="lc-code-editor" value={String(selected.config.code ?? '')} onChange={event => updateConfig('code', event.target.value)} /></div>}
    </PageShell>
  );
}
