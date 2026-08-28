import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRightIcon, HistoryIcon, PlusIcon, RotateCcwIcon, SearchIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import { listLowcodeReleases, listLowcodeResources, publishLowcodeResource, rollbackLowcodeRelease, type LowcodeRelease, type LowcodeResource } from '../../api/lowcode';
import { LowcodeButton, Modal, PageShell } from './LowcodeShared';

type ReleaseType = '接口' | '页面';
type ReleaseStatus = '已发布' | '已回滚';
type Release = { id: string; resourceId: string; version: string; name: string; type: ReleaseType; publisher: string; time: string; status: ReleaseStatus; note: string; content: string };
const resourceTypeLabel = (type: string): ReleaseType => type === 'api' ? '接口' : '页面';
const fromApi = (release: LowcodeRelease): Release => ({ id: release.id, resourceId: release.resourceId, version: release.version, name: release.resourceName, type: resourceTypeLabel(release.resourceType), publisher: release.publisher, time: release.createdAt?.replace('T', ' ') ?? '', status: release.active ? '已发布' : '已回滚', note: release.releaseNote, content: release.snapshotJson });

export default function ReleasePage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [resources, setResources] = useState<LowcodeResource[]>([]);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState<'全部' | ReleaseType>('全部');
  const [compare, setCompare] = useState<Release | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [releaseType, setReleaseType] = useState<ReleaseType>('接口');
  const [releaseTarget, setReleaseTarget] = useState('');
  const [releaseNote, setReleaseNote] = useState('');
  const [page, setPage] = useState(1);
  const reload = async () => {
    try {
      const [history, allResources] = await Promise.all([listLowcodeReleases(), listLowcodeResources()]);
      setReleases(history.map(fromApi));
      setResources(allResources);
      if (!releaseTarget && allResources.length) setReleaseTarget(allResources.find(item => item.resourceType === 'api')?.id ?? allResources[0].id);
    } catch (error) { toast.error(error instanceof Error ? `读取发布数据失败：${error.message}` : '读取发布数据失败'); }
  };
  useEffect(() => { void reload(); }, []);
  const availableResources = resources.filter(item => resourceTypeLabel(item.resourceType) === releaseType);
  const filtered = useMemo(() => releases.filter(item => (type === '全部' || item.type === type) && `${item.name} ${item.version} ${item.publisher}`.includes(keyword)), [releases, keyword, type]);
  const publish = async () => {
    if (!releaseNote.trim()) return toast.error('请填写本次发布说明');
    if (!releaseTarget) return toast.error('请先在接口编排或页面设计器中保存一个资源');
    try { const release = await publishLowcodeResource(releaseTarget, releaseNote.trim()); setReleases(previous => [fromApi(release), ...previous.map(item => item.resourceId === release.resourceId ? { ...item, status: '已回滚' as ReleaseStatus } : item)]); setPublishing(false); setReleaseNote(''); toast.success(`${release.resourceName} 已发布为 ${release.version}`); } catch (error) { toast.error(error instanceof Error ? error.message : '发布失败'); }
  };
  const rollback = async (release: Release) => {
    if (!window.confirm(`确定回滚到 ${release.version} 吗？当前线上版本将被替换。`)) return;
    try { const rolled = await rollbackLowcodeRelease(release.id); setReleases(previous => previous.map(item => item.resourceId === rolled.resourceId ? { ...item, status: item.id === rolled.id ? '已发布' : '已回滚' } : item)); toast.success(`已回滚到 ${rolled.version}`); } catch (error) { toast.error(error instanceof Error ? error.message : '回滚失败'); }
  };
  const comparison = compare ? releases.find(item => item.name === compare.name && item.type === compare.type && item.id !== compare.id) : null;
  return <PageShell title="发布管理" description="追踪接口与页面版本，支持版本对比、发布审计和一键回滚。" actions={<LowcodeButton primary onClick={() => setPublishing(true)}><PlusIcon size={14} />发布</LowcodeButton>}>
    <section className="lc-card lc-table-card"><div className="lc-table-tools"><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span style={{ position: 'relative' }}><SearchIcon size={14} style={{ position: 'absolute', left: 9, top: 9, color: 'var(--muted-foreground)' }} /><input className="lc-input" style={{ width: 224, paddingLeft: 29 }} placeholder="搜索版本、名称或发布人" value={keyword} onChange={event => { setKeyword(event.target.value); setPage(1); }} /></span><select className="lc-select" style={{ width: 120 }} value={type} onChange={event => setType(event.target.value as '全部' | ReleaseType)}><option>全部</option><option>接口</option><option>页面</option></select></div><span className="lc-tip">每次发布均保存可回溯的快照</span></div><div className="lc-table-wrap"><table className="lc-table"><thead><tr><th>版本号</th><th>名称</th><th>类型</th><th>发布人</th><th>发布时间</th><th>发布说明</th><th>状态</th><th>操作</th></tr></thead><tbody>{filtered.map(release => <tr key={release.id}><td style={{ color: '#165DFF', fontWeight: 700 }}>{release.version}</td><td>{release.name}</td><td><span className="lc-badge muted">{release.type}</span></td><td>{release.publisher}</td><td>{release.time}</td><td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{release.note}</td><td><span className={`lc-badge ${release.status === '已发布' ? 'success' : 'warning'}`}>● {release.status}</span></td><td><button className="lc-link-btn" onClick={() => setCompare(release)}><ArrowLeftRightIcon size={13} /> 对比</button><button className="lc-link-btn" onClick={() => rollback(release)} disabled={release.status === '已发布'}><RotateCcwIcon size={13} /> 回滚</button></td></tr>)}{!filtered.length && <tr><td colSpan={8} style={{ height: 180, textAlign: 'center', color: 'var(--muted-foreground)' }}>暂无发布记录，点击右上角“发布”创建首个版本。</td></tr>}</tbody></table></div><div className="lc-pagination"><span>共 {filtered.length} 条</span><LowcodeButton disabled={page === 1} onClick={() => setPage(value => Math.max(1, value - 1))}>上一页</LowcodeButton><span>第 {page} 页</span><LowcodeButton disabled={filtered.length < 10} onClick={() => setPage(value => value + 1)}>下一页</LowcodeButton></div></section>
    <Modal title="发布接口或页面" open={publishing} onClose={() => setPublishing(false)} footer={<><LowcodeButton onClick={() => setPublishing(false)}>取消</LowcodeButton><LowcodeButton primary onClick={() => void publish()}><SendIcon size={14} />确认发布</LowcodeButton></>}><div className="lc-field"><label className="lc-label">发布类型</label><select className="lc-select" value={releaseType} onChange={event => { const next = event.target.value as ReleaseType; setReleaseType(next); setReleaseTarget(resources.find(item => resourceTypeLabel(item.resourceType) === next)?.id ?? ''); }}><option>接口</option><option>页面</option></select></div><div className="lc-field"><label className="lc-label">发布对象</label><select className="lc-select" value={releaseTarget} onChange={event => setReleaseTarget(event.target.value)}><option value="">请选择已保存的资源</option>{availableResources.map(item => <option key={item.id} value={item.id}>{item.name}{item.status === 'draft' ? '（草稿）' : ''}</option>)}</select>{!availableResources.length && <p className="lc-tip">当前类型没有已保存的资源，请先进入相应设计器点击保存。</p>}</div><div className="lc-field"><label className="lc-label">版本说明 <span style={{ color: '#F53F3F' }}>*</span></label><textarea className="lc-textarea" value={releaseNote} placeholder="例如：新增库存服务调用与失败重试" onChange={event => setReleaseNote(event.target.value)} /></div><p className="lc-tip">发布后会自动生成可回滚的版本快照，并可在此页面与历史版本对比。</p></Modal>
    <Modal title={`版本对比 · ${compare?.name ?? ''}`} open={Boolean(compare)} onClose={() => setCompare(null)} wide footer={<><LowcodeButton onClick={() => setCompare(null)}>关闭</LowcodeButton>{compare && <LowcodeButton primary onClick={() => rollback(compare)} disabled={compare.status === '已发布'}><HistoryIcon size={14} />回滚到此版本</LowcodeButton>}</>}><div className="lc-tip" style={{ marginBottom: 12 }}>左侧为当前选择版本 {compare?.version}，右侧为同对象相邻版本 {comparison?.version ?? '—'}。不同字段以 JSON 快照直观呈现。</div><div className="lc-diff"><div><div className="lc-diff-title">{compare?.version} · {compare?.note}</div><pre>{compare?.content}</pre></div><div><div className="lc-diff-title">{comparison?.version ?? '暂无可对比版本'} · {comparison?.note ?? ''}</div><pre>{comparison?.content ?? '{}'}</pre></div></div></Modal>
  </PageShell>;
}
