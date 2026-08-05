import { useMemo, useState } from 'react';
import { ArrowLeftRightIcon, HistoryIcon, PlusIcon, RotateCcwIcon, SearchIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import { LowcodeButton, Modal, PageShell, formatTime } from './LowcodeShared';

type ReleaseType = '接口' | '页面';
type ReleaseStatus = '已发布' | '已回滚';
type Release = { id: string; version: string; name: string; type: ReleaseType; publisher: string; time: string; status: ReleaseStatus; note: string; content: string };

const initialReleases: Release[] = [
  { id: 'r1', version: 'v1.2.0', name: '创建订单', type: '接口', publisher: '林晓', time: '2026-08-05 10:42:16', status: '已发布', note: '新增库存服务调用与失败重试', content: '{\n  "api": "create-order",\n  "method": "POST",\n  "steps": ["validate", "insertOrder", "deductStock"],\n  "retry": 2\n}' },
  { id: 'r2', version: 'v1.1.0', name: '创建订单', type: '接口', publisher: '周远', time: '2026-08-04 17:20:08', status: '已回滚', note: '增加订单参数标准化', content: '{\n  "api": "create-order",\n  "method": "POST",\n  "steps": ["validate", "insertOrder"],\n  "retry": 0\n}' },
  { id: 'r3', version: 'v1.0.0', name: '订单运营工作台', type: '页面', publisher: '林晓', time: '2026-08-04 15:14:33', status: '已发布', note: '首次发布运营工作台页面', content: '{\n  "page": "order-workbench",\n  "device": "pc",\n  "components": ["metric", "button", "barChart"],\n  "dataSource": "获取订单统计"\n}' },
  { id: 'r4', version: 'v0.9.0', name: '用户画像页面', type: '页面', publisher: '陈默', time: '2026-08-03 09:58:41', status: '已发布', note: '内测版本', content: '{\n  "page": "user-profile",\n  "device": "pc",\n  "components": ["avatar", "pieChart"]\n}' },
];

export default function ReleasePage() {
  const [releases, setReleases] = useState<Release[]>(initialReleases);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState<'全部' | ReleaseType>('全部');
  const [compare, setCompare] = useState<Release | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [releaseType, setReleaseType] = useState<ReleaseType>('接口');
  const [releaseTarget, setReleaseTarget] = useState('创建订单');
  const [releaseNote, setReleaseNote] = useState('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => releases.filter(item => (type === '全部' || item.type === type) && `${item.name} ${item.version} ${item.publisher}`.includes(keyword)), [releases, keyword, type]);
  const publish = () => {
    if (!releaseNote.trim()) return toast.error('请填写本次发布说明');
    const version = `v1.${releases.filter(item => item.type === releaseType).length}.0`;
    const item: Release = { id: `r-${Date.now()}`, version, name: releaseTarget, type: releaseType, publisher: '当前管理员', time: formatTime(), status: '已发布', note: releaseNote, content: JSON.stringify({ name: releaseTarget, type: releaseType, version, publishedAt: new Date().toISOString(), note: releaseNote }, null, 2) };
    setReleases(previous => [item, ...previous]); setPublishing(false); setReleaseNote(''); toast.success(`${releaseType}「${releaseTarget}」已发布为 ${version}`);
  };
  const rollback = (release: Release) => {
    if (!window.confirm(`确定回滚到 ${release.version} 吗？当前线上版本将被替换。`)) return;
    setReleases(previous => previous.map(item => item.name === release.name && item.type === release.type ? { ...item, status: item.id === release.id ? '已发布' : '已回滚' } : item));
    toast.success(`已回滚到 ${release.version}`);
  };
  const comparison = compare ? releases.find(item => item.name === compare.name && item.type === compare.type && item.id !== compare.id) : null;
  return <PageShell title="发布管理" description="追踪接口与页面版本，支持版本对比、发布审计和一键回滚。" actions={<LowcodeButton primary onClick={() => setPublishing(true)}><PlusIcon size={14} />发布</LowcodeButton>}>
    <section className="lc-card lc-table-card"><div className="lc-table-tools"><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span style={{ position: 'relative' }}><SearchIcon size={14} style={{ position: 'absolute', left: 9, top: 9, color: 'var(--muted-foreground)' }} /><input className="lc-input" style={{ width: 224, paddingLeft: 29 }} placeholder="搜索版本、名称或发布人" value={keyword} onChange={event => { setKeyword(event.target.value); setPage(1); }} /></span><select className="lc-select" style={{ width: 120 }} value={type} onChange={event => setType(event.target.value as '全部' | ReleaseType)}><option>全部</option><option>接口</option><option>页面</option></select></div><span className="lc-tip">每次发布均保存可回溯的快照</span></div><div className="lc-table-wrap"><table className="lc-table"><thead><tr><th>版本号</th><th>名称</th><th>类型</th><th>发布人</th><th>发布时间</th><th>发布说明</th><th>状态</th><th>操作</th></tr></thead><tbody>{filtered.map(release => <tr key={release.id}><td style={{ color: '#165DFF', fontWeight: 700 }}>{release.version}</td><td>{release.name}</td><td><span className="lc-badge muted">{release.type}</span></td><td>{release.publisher}</td><td>{release.time}</td><td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{release.note}</td><td><span className={`lc-badge ${release.status === '已发布' ? 'success' : 'warning'}`}>● {release.status}</span></td><td><button className="lc-link-btn" onClick={() => setCompare(release)}><ArrowLeftRightIcon size={13} /> 对比</button><button className="lc-link-btn" onClick={() => rollback(release)} disabled={release.status === '已发布'}><RotateCcwIcon size={13} /> 回滚</button></td></tr>)}{!filtered.length && <tr><td colSpan={8} style={{ height: 180, textAlign: 'center', color: 'var(--muted-foreground)' }}>暂无发布记录，点击右上角“发布”创建首个版本。</td></tr>}</tbody></table></div><div className="lc-pagination"><span>共 {filtered.length} 条</span><LowcodeButton disabled={page === 1} onClick={() => setPage(value => Math.max(1, value - 1))}>上一页</LowcodeButton><span>第 {page} 页</span><LowcodeButton disabled={filtered.length < 10} onClick={() => setPage(value => value + 1)}>下一页</LowcodeButton></div></section>
    <Modal title="发布接口或页面" open={publishing} onClose={() => setPublishing(false)} footer={<><LowcodeButton onClick={() => setPublishing(false)}>取消</LowcodeButton><LowcodeButton primary onClick={publish}><SendIcon size={14} />确认发布</LowcodeButton></>}><div className="lc-field"><label className="lc-label">发布类型</label><select className="lc-select" value={releaseType} onChange={event => { const next = event.target.value as ReleaseType; setReleaseType(next); setReleaseTarget(next === '接口' ? '创建订单' : '订单运营工作台'); }}><option>接口</option><option>页面</option></select></div><div className="lc-field"><label className="lc-label">发布对象</label><select className="lc-select" value={releaseTarget} onChange={event => setReleaseTarget(event.target.value)}>{(releaseType === '接口' ? ['创建订单', '订单列表', '用户详情'] : ['订单运营工作台', '用户画像页面']).map(item => <option key={item}>{item}</option>)}</select></div><div className="lc-field"><label className="lc-label">版本说明 <span style={{ color: '#F53F3F' }}>*</span></label><textarea className="lc-textarea" value={releaseNote} placeholder="例如：新增库存服务调用与失败重试" onChange={event => setReleaseNote(event.target.value)} /></div><p className="lc-tip">发布后会自动生成可回滚的版本快照，并可在此页面与历史版本对比。</p></Modal>
    <Modal title={`版本对比 · ${compare?.name ?? ''}`} open={Boolean(compare)} onClose={() => setCompare(null)} wide footer={<><LowcodeButton onClick={() => setCompare(null)}>关闭</LowcodeButton>{compare && <LowcodeButton primary onClick={() => rollback(compare)} disabled={compare.status === '已发布'}><HistoryIcon size={14} />回滚到此版本</LowcodeButton>}</>}><div className="lc-tip" style={{ marginBottom: 12 }}>左侧为当前选择版本 {compare?.version}，右侧为同对象相邻版本 {comparison?.version ?? '—'}。不同字段以 JSON 快照直观呈现。</div><div className="lc-diff"><div><div className="lc-diff-title">{compare?.version} · {compare?.note}</div><pre>{compare?.content}</pre></div><div><div className="lc-diff-title">{comparison?.version ?? '暂无可对比版本'} · {comparison?.note ?? ''}</div><pre>{comparison?.content ?? '{}'}</pre></div></div></Modal>
  </PageShell>;
}
