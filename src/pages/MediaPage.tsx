import ViewportPortal from '../components/ViewportPortal';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  ArchiveIcon, CheckIcon, DownloadIcon, FileIcon, FileSpreadsheetIcon, FileTextIcon,
  Grid2X2Icon, ImageIcon, ListIcon, LoaderCircleIcon, Music2Icon, PlayCircleIcon,
  RefreshCwIcon, SearchIcon, Trash2Icon, UploadCloudIcon, VideoIcon, XIcon,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { deleteFile, downloadFile, getFileStorageInfo, listFiles, uploadFiles } from '../api/files';
import type { ManagedFile, ManagedFileKind } from '../api/types';
import { useTheme } from '../hooks/useTheme';
import { toast } from '../lib/localizedToast';

type MediaType = 'all' | 'image' | 'video' | 'document' | 'audio' | 'other';
type SortKey = 'newest' | 'oldest' | 'name' | 'size';
type ViewMode = 'grid' | 'list';

const PINK = '#E91E8C';

function mediaType(file: ManagedFile): Exclude<MediaType, 'all'> {
  if (file.kind === 'image' || file.kind === 'video' || file.kind === 'audio') return file.kind;
  return file.kind === 'archive' ? 'other' : 'document';
}

function extension(name: string) {
  const value = name.split('.').pop()?.toUpperCase();
  return value && value.length <= 7 ? value : 'FILE';
}

function formatSize(size: number) {
  if (size >= 1024 * 1024 * 1024) return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${size} B`;
}

function kindIcon(kind: ManagedFileKind, size = 26) {
  if (kind === 'image') return <ImageIcon size={size} />;
  if (kind === 'video') return <VideoIcon size={size} />;
  if (kind === 'audio') return <Music2Icon size={size} />;
  if (kind === 'spreadsheet') return <FileSpreadsheetIcon size={size} />;
  if (kind === 'archive') return <ArchiveIcon size={size} />;
  return <FileTextIcon size={size} />;
}

function typeColor(type: Exclude<MediaType, 'all'>) {
  return type === 'image' ? 'var(--chart-1)' : type === 'video' ? 'var(--chart-2)' : type === 'audio' ? 'var(--chart-3)' : type === 'other' ? 'var(--muted-foreground)' : 'var(--chart-4)';
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function PreviewDialog({ file, onClose, onDownload, onDelete }: { file: ManagedFile | null; onClose: () => void; onDownload: (file: ManagedFile) => void; onDelete: (file: ManagedFile) => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const type = file ? mediaType(file) : 'document';

  useEffect(() => {
    if (!file || !['image', 'video', 'audio'].includes(type)) { setUrl(null); return; }
    let active = true;
    let objectUrl: string | null = null;
    setLoading(true); setError(''); setUrl(null);
    void downloadFile(file.id)
      .then(blob => { objectUrl = URL.createObjectURL(blob); if (active) setUrl(objectUrl); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : '预览加载失败'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [file, type]);

  if (!file) return null;
  return <ViewportPortal><div role="dialog" aria-modal="true" aria-label={`${file.name} 预览`} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(15,23,42,.52)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }} onMouseDown={onClose}>
    <div style={{ width: 'min(760px, 100%)', maxHeight: '90vh', overflow: 'auto', background: 'var(--card)', color: 'var(--foreground)', borderRadius: 14, boxShadow: '0 24px 70px rgba(0,0,0,.32)' }} onMouseDown={event => event.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ flex: 1, minWidth: 0 }}><div title={file.name} style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div><div style={{ marginTop: 3, color: 'var(--muted-foreground)', fontSize: 12 }}>{formatSize(file.size)} · {file.updatedAt}</div></div>
        <button type="button" onClick={onClose} aria-label="关闭预览" style={{ width: 32, height: 32, border: 0, borderRadius: 7, background: 'var(--muted)', color: 'var(--foreground)', cursor: 'pointer' }}><XIcon size={17} /></button>
      </div>
      <div style={{ minHeight: 250, padding: 22, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'color-mix(in srgb, var(--muted) 55%, var(--card))' }}>
        {loading && <LoaderCircleIcon size={28} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />}
        {error && <div style={{ color: '#dc2626', fontSize: 13 }}>{error}</div>}
        {!loading && !error && type === 'image' && url && <img src={url} alt={file.name} style={{ maxHeight: '58vh', maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }} />}
        {!loading && !error && type === 'video' && url && <video src={url} controls style={{ maxHeight: '58vh', maxWidth: '100%', borderRadius: 8 }} />}
        {!loading && !error && type === 'audio' && url && <div style={{ width: 'min(430px, 100%)', textAlign: 'center', color: 'var(--chart-3)' }}><Music2Icon size={56} style={{ marginBottom: 18 }} /><audio src={url} controls style={{ width: '100%' }} /></div>}
        {!loading && !error && !['image', 'video', 'audio'].includes(type) && <div style={{ textAlign: 'center', color: 'var(--muted-foreground)' }}>{kindIcon(file.kind, 54)}<div style={{ marginTop: 12, fontSize: 13 }}>此文件类型暂不支持预览</div></div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: 16, borderTop: '1px solid var(--border)' }}><button type="button" onClick={() => onDelete(file)} style={{ height: 34, padding: '0 12px', border: '1px solid #fecaca', borderRadius: 7, background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>删除</button><button type="button" onClick={() => onDownload(file)} style={{ height: 34, padding: '0 12px', border: 0, borderRadius: 7, background: 'var(--primary)', color: 'var(--primary-foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><DownloadIcon size={14} />下载</button></div>
    </div>
  </div></ViewportPortal>;
}

export default function MediaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { themeState } = useTheme();
  const primary = themeState.themeId === 'manga' ? PINK : 'var(--primary)';
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [type, setType] = useState<MediaType>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [view, setView] = useState<ViewMode>('grid');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [preview, setPreview] = useState<ManagedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [storage, setStorage] = useState<'local' | 'cos'>('local');

  const load = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const [items, info] = await Promise.all([listFiles(), getFileStorageInfo()]);
      setFiles(items); setStorage(info.provider);
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : '媒体文件加载失败'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { void load(); }, []);

  const counts = useMemo(() => ({
    all: files.length,
    image: files.filter(file => mediaType(file) === 'image').length,
    video: files.filter(file => mediaType(file) === 'video').length,
    document: files.filter(file => mediaType(file) === 'document').length,
    audio: files.filter(file => mediaType(file) === 'audio').length,
    other: files.filter(file => mediaType(file) === 'other').length,
  }), [files]);

  const visible = useMemo(() => files
    .filter(file => (type === 'all' || mediaType(file) === type) && file.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((left, right) => sort === 'name' ? left.name.localeCompare(right.name, 'zh-CN') : sort === 'size' ? right.size - left.size : sort === 'oldest' ? left.updatedAt.localeCompare(right.updatedAt) : right.updatedAt.localeCompare(left.updatedAt)), [files, type, query, sort]);

  const allSelected = visible.length > 0 && visible.every(file => selected.has(file.id));
  const toggleSelect = (id: number) => setSelected(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleAll = () => setSelected(current => { const next = new Set(current); if (allSelected) visible.forEach(file => next.delete(file.id)); else visible.forEach(file => next.add(file.id)); return next; });

  const handleUpload = async (input: File[]) => {
    if (!input.length) return;
    setUploading(true);
    try {
      const created = await uploadFiles(input);
      setFiles(current => [...created, ...current]);
      toast.success(input.length === 1 ? `已上传 ${input[0].name}` : `已上传 ${input.length} 个文件`);
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : '文件上传失败'); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  };

  const handleDownload = async (file: ManagedFile) => {
    try { downloadBlob(await downloadFile(file.id), file.name); toast.success(`开始下载 ${file.name}`); }
    catch (reason) { toast.error(reason instanceof Error ? reason.message : '文件下载失败'); }
  };

  const remove = async (ids: number[]) => {
    if (!ids.length || !window.confirm(ids.length === 1 ? '确定删除这个文件吗？' : `确定删除已选的 ${ids.length} 个文件吗？`)) return;
    try {
      await Promise.all(ids.map(id => deleteFile(id)));
      setFiles(current => current.filter(file => !ids.includes(file.id)));
      setSelected(current => { const next = new Set(current); ids.forEach(id => next.delete(id)); return next; });
      setPreview(current => current && ids.includes(current.id) ? null : current);
      toast.success(ids.length === 1 ? '文件已删除' : `已删除 ${ids.length} 个文件`);
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : '文件删除失败'); }
  };

  const downloadSelected = async () => {
    const items = files.filter(file => selected.has(file.id));
    for (const item of items) await handleDownload(item);
  };

  const tabs: { key: MediaType; label: string }[] = [{ key: 'all', label: '全部' }, { key: 'image', label: '图片' }, { key: 'video', label: '视频' }, { key: 'document', label: '文档' }, { key: 'audio', label: '音频' }, { key: 'other', label: '其他' }];
  const summary = [{ label: '总文件', value: counts.all, icon: <FileIcon size={20} />, color: 'var(--chart-1)' }, { label: '图片', value: counts.image, icon: <ImageIcon size={20} />, color: 'var(--chart-1)' }, { label: '视频', value: counts.video, icon: <VideoIcon size={20} />, color: 'var(--chart-2)' }, { label: '文档', value: counts.document, icon: <FileTextIcon size={20} />, color: 'var(--chart-4)' }];
  const panel: CSSProperties = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.05)' };

  return <AdminLayout><main data-cmp="MediaPage" style={{ padding: 24, minHeight: '100%', background: 'var(--background)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}><div><h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>媒体库</h1><p style={{ margin: '7px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>管理所有上传的图片、视频、文档和音频资源 · 当前使用{storage === 'cos' ? '腾讯云 COS' : '本地文件存储'}</p></div><button type="button" onClick={() => void load(true)} disabled={refreshing} style={{ height: 34, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--card)', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 7, cursor: refreshing ? 'not-allowed' : 'pointer' }}><RefreshCwIcon size={14} className={refreshing ? 'animate-spin' : ''} />刷新</button></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }} className="media-summary">{summary.map(item => <div key={item.label} style={{ ...panel, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 13 }}><span style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, background: `color-mix(in srgb, ${item.color} 12%, transparent)` }}>{item.icon}</span><div><strong style={{ display: 'block', color: 'var(--foreground)', fontSize: 24, lineHeight: 1.1 }}>{item.value}</strong><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{item.label}</span></div></div>)}</div>
    <section style={panel}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid var(--border)', padding: '0 16px', overflowX: 'auto' }}>{tabs.map(tab => <button key={tab.key} type="button" onClick={() => { setType(tab.key); setSelected(new Set()); }} style={{ height: 43, padding: '0 14px', border: 0, borderBottom: `2px solid ${type === tab.key ? primary : 'transparent'}`, background: 'transparent', color: type === tab.key ? primary : 'var(--muted-foreground)', fontWeight: type === tab.key ? 700 : 500, fontSize: 13, whiteSpace: 'nowrap', cursor: 'pointer' }}>{tab.label}<span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 10, fontSize: 11, background: type === tab.key ? `color-mix(in srgb, ${primary} 12%, transparent)` : 'var(--muted)' }}>{counts[tab.key]}</span></button>)}</div>
      <div style={{ padding: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}><SearchIcon size={15} style={{ position: 'absolute', top: 10, left: 11, color: 'var(--muted-foreground)' }} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索文件名称..." style={{ width: '100%', height: 35, boxSizing: 'border-box', padding: '0 12px 0 33px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--background)', color: 'var(--foreground)', outline: 'none' }} /></div>
        <select value={sort} onChange={event => setSort(event.target.value as SortKey)} style={{ height: 35, padding: '0 9px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--background)', color: 'var(--foreground)', cursor: 'pointer' }}><option value="newest">最新上传</option><option value="oldest">最早上传</option><option value="name">名称排序</option><option value="size">文件最大</option></select>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}><button type="button" aria-label="网格视图" onClick={() => setView('grid')} style={{ width: 34, border: 0, background: view === 'grid' ? primary : 'var(--card)', color: view === 'grid' ? '#fff' : 'var(--muted-foreground)', cursor: 'pointer' }}><Grid2X2Icon size={15} /></button><button type="button" aria-label="列表视图" onClick={() => setView('list')} style={{ width: 34, border: 0, background: view === 'list' ? primary : 'var(--card)', color: view === 'list' ? '#fff' : 'var(--muted-foreground)', cursor: 'pointer' }}><ListIcon size={15} /></button></div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} style={{ height: 35, padding: '0 13px', border: 0, borderRadius: 7, background: primary, color: 'var(--primary-foreground)', display: 'flex', alignItems: 'center', gap: 6, cursor: uploading ? 'wait' : 'pointer', fontWeight: 700 }}><UploadCloudIcon size={15} />{uploading ? '上传中…' : '上传文件'}</button><input ref={inputRef} hidden type="file" multiple onChange={event => void handleUpload(Array.from(event.target.files ?? []))} />
      </div>
      {selected.size > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 16px', borderBottom: '1px solid var(--border)', background: `color-mix(in srgb, ${primary} 6%, var(--card))` }}><strong style={{ fontSize: 13, color: primary }}>已选 {selected.size} 个文件</strong><button type="button" onClick={() => setSelected(new Set())} style={{ border: 0, background: 'transparent', color: 'var(--muted-foreground)', cursor: 'pointer' }}>取消选择</button><span style={{ flex: 1 }} /><button type="button" onClick={() => void downloadSelected()} style={{ height: 30, padding: '0 9px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card)', color: 'var(--foreground)', cursor: 'pointer' }}>批量下载</button><button type="button" onClick={() => void remove([...selected])} style={{ height: 30, padding: '0 9px', border: '1px solid #fecaca', borderRadius: 6, background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>批量删除</button></div>}
      <div onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); void handleUpload(Array.from(event.dataTransfer.files)); }} style={{ padding: 16, minHeight: 250, position: 'relative' }}>
        {dragging && <div style={{ position: 'absolute', inset: 12, zIndex: 3, border: `2px dashed ${primary}`, borderRadius: 10, background: `color-mix(in srgb, ${primary} 10%, transparent)`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: primary, fontWeight: 700 }}>释放以上传文件</div>}
        {loading ? <div style={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}><LoaderCircleIcon size={25} className="animate-spin" /></div> : visible.length === 0 ? <div style={{ minHeight: 260, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}><FileIcon size={34} /><span>暂无匹配的文件</span><button type="button" onClick={() => inputRef.current?.click()} style={{ border: 0, background: 'transparent', color: primary, cursor: 'pointer' }}>点击选择文件上传</button></div> : <><div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted-foreground)', fontSize: 12 }}><span>显示 {visible.length} / {files.length} 个文件</span><button type="button" onClick={toggleAll} style={{ border: 0, background: 'transparent', color: primary, cursor: 'pointer' }}>{allSelected ? '取消全选' : '全选'}</button></div><div style={{ display: 'grid', gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(180px, 1fr))' : '1fr', gap: 14 }}>{visible.map(file => { const fileType = mediaType(file); const color = typeColor(fileType); const chosen = selected.has(file.id); return <article key={file.id} style={{ minWidth: 0, display: view === 'list' ? 'flex' : 'block', alignItems: 'center', gap: 14, border: `1px solid ${chosen ? primary : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', background: chosen ? `color-mix(in srgb, ${primary} 4%, var(--card))` : 'var(--card)', position: 'relative' }}>
          <button type="button" aria-label={`选择 ${file.name}`} onClick={() => toggleSelect(file.id)} style={{ position: 'absolute', zIndex: 1, top: 8, left: 8, width: 19, height: 19, border: `1px solid ${chosen ? primary : 'rgba(255,255,255,.8)'}`, borderRadius: 4, background: chosen ? primary : 'rgba(255,255,255,.9)', color: 'var(--primary-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.16)' }}>{chosen && <CheckIcon size={13} />}</button>
          <button type="button" aria-label={`预览 ${file.name}`} onClick={() => setPreview(file)} style={{ width: view === 'list' ? 120 : '100%', height: view === 'list' ? 84 : 124, flexShrink: 0, border: 0, borderBottom: view === 'list' ? 0 : '1px solid var(--border)', background: `linear-gradient(135deg, color-mix(in srgb, ${color} 21%, var(--card)), color-mix(in srgb, ${color} 4%, var(--card)))`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{fileType === 'video' ? <PlayCircleIcon size={42} /> : kindIcon(file.kind, 38)}<span style={{ position: 'absolute', right: 8, top: view === 'list' ? 8 : 98, padding: '2px 6px', borderRadius: 8, color, background: 'var(--card)', fontSize: 10, fontWeight: 800 }}>{extension(file.name)}</span></button>
          <div style={{ padding: view === 'list' ? '12px 6px 12px 0' : '10px 11px', flex: 1, minWidth: 0 }}><div title={file.name} style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div><div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', gap: 6, color: 'var(--muted-foreground)', fontSize: 11 }}><span>{formatSize(file.size)}</span><span>{file.updatedAt.slice(0, 10)}</span></div></div>
          <div style={{ padding: view === 'list' ? '0 12px 0 0' : '0 10px 10px', display: 'flex', justifyContent: 'flex-end', gap: 6 }}><button type="button" title="下载" onClick={() => void handleDownload(file)} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--muted-foreground)', cursor: 'pointer' }}><DownloadIcon size={14} /></button><button type="button" title="删除" onClick={() => void remove([file.id])} style={{ width: 28, height: 28, border: '1px solid #fecaca', borderRadius: 6, background: 'transparent', color: '#dc2626', cursor: 'pointer' }}><Trash2Icon size={14} /></button></div>
        </article>; })}</div></>}
      </div>
    </section>
    <style>{`@media (max-width: 900px) {.media-summary { grid-template-columns: repeat(2, minmax(150px, 1fr)) !important; }} @media (max-width: 480px) {.media-summary { grid-template-columns: 1fr !important; }}`}</style>
    <PreviewDialog file={preview} onClose={() => setPreview(null)} onDownload={file => void handleDownload(file)} onDelete={file => void remove([file.id])} />
  </main></AdminLayout>;
}
