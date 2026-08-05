import { useMemo, useRef, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { toast } from '../lib/localizedToast';
import { useLocale } from '../hooks/useLocale';
import {
  ArchiveIcon,
  CheckIcon,
  DownloadIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  ImageIcon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react';

type FileKind = 'document' | 'spreadsheet' | 'image' | 'archive';
type FolderId = 'all' | 'uploads' | 'documents' | 'images' | 'archives';

interface ManagedFile {
  id: string;
  name: string;
  kind: FileKind;
  size: number;
  folder: Exclude<FolderId, 'all'>;
  path: string;
  uploader: string;
  updatedAt: string;
  source?: File;
}

const INITIAL_FILES: ManagedFile[] = [
  { id: '1', name: 'product-catalog-2025.pdf', kind: 'document', size: 4_928_716, folder: 'documents', path: '/uploads/documents/product-catalog-2025.pdf', uploader: '张管理员', updatedAt: '2025-07-14 10:32' },
  { id: '2', name: 'quarterly-sales.xlsx', kind: 'spreadsheet', size: 1_153_433, folder: 'documents', path: '/uploads/documents/quarterly-sales.xlsx', uploader: '李运营', updatedAt: '2025-07-13 15:20' },
  { id: '3', name: 'brand-banner.png', kind: 'image', size: 2_516_582, folder: 'images', path: '/uploads/images/brand-banner.png', uploader: '王设计', updatedAt: '2025-07-12 09:15' },
  { id: '4', name: 'release-assets.zip', kind: 'archive', size: 10_276_044, folder: 'archives', path: '/uploads/archives/release-assets.zip', uploader: '张管理员', updatedAt: '2025-07-11 14:08' },
  { id: '5', name: 'user-import-template.csv', kind: 'spreadsheet', size: 35_778, folder: 'uploads', path: '/uploads/user-import-template.csv', uploader: '陈编辑', updatedAt: '2025-07-10 16:45' },
];

const FILE_KINDS: FileKind[] = ['document', 'spreadsheet', 'image', 'archive'];

function formatSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${size} B`;
}

function detectKind(file: File): FileKind {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (file.type.startsWith('image/')) return 'image';
  if (['xlsx', 'xls', 'csv'].includes(extension ?? '')) return 'spreadsheet';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension ?? '')) return 'archive';
  return 'document';
}

function FileTypeIcon({ kind, size = 17 }: { kind: FileKind; size?: number }) {
  const iconProps = { size, strokeWidth: 1.8 };
  if (kind === 'image') return <ImageIcon {...iconProps} />;
  if (kind === 'spreadsheet') return <FileSpreadsheetIcon {...iconProps} />;
  if (kind === 'archive') return <ArchiveIcon {...iconProps} />;
  return <FileTextIcon {...iconProps} />;
}

export default function FileManagementPage() {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ManagedFile[]>(INITIAL_FILES);
  const [activeFolder, setActiveFolder] = useState<FolderId>('all');
  const [activeKind, setActiveKind] = useState<FileKind | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const folders: { id: FolderId; label: string }[] = [
    { id: 'all', label: t('systemPages.fileManager.allFiles') },
    { id: 'uploads', label: t('systemPages.fileManager.uploads') },
    { id: 'documents', label: t('systemPages.fileManager.documents') },
    { id: 'images', label: t('systemPages.fileManager.images') },
    { id: 'archives', label: t('systemPages.fileManager.archives') },
  ];

  const visibleFiles = useMemo(() => files.filter((file) => {
    const folderMatches = activeFolder === 'all' || file.folder === activeFolder;
    const kindMatches = activeKind === 'all' || file.kind === activeKind;
    return folderMatches && kindMatches && file.name.toLowerCase().includes(query.trim().toLowerCase());
  }), [activeFolder, activeKind, files, query]);

  const selectedVisibleCount = visibleFiles.filter((file) => selected.has(file.id)).length;
  const allVisibleSelected = visibleFiles.length > 0 && selectedVisibleCount === visibleFiles.length;

  const getFolderCount = (folder: FolderId) => folder === 'all'
    ? files.length
    : files.filter((file) => file.folder === folder).length;

  const toggleSelected = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleFiles.forEach((file) => next.delete(file.id));
      else visibleFiles.forEach((file) => next.add(file.id));
      return next;
    });
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploads = Array.from(event.target.files ?? []);
    if (!uploads.length) return;

    const timestamp = new Date().toLocaleString('sv-SE').slice(0, 16);
    const newFiles = uploads.map((file, index): ManagedFile => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      kind: detectKind(file),
      size: file.size,
      folder: 'uploads',
      path: `/uploads/${file.name}`,
      uploader: 'admin',
      updatedAt: timestamp,
      source: file,
    }));
    setFiles((current) => [...newFiles, ...current]);
    event.target.value = '';
    toast.success(uploads.length === 1
      ? t('systemPages.fileManager.fileAdded', { name: uploads[0].name })
      : t('systemPages.fileManager.filesAdded', { count: uploads.length }));
  };

  const handleDownload = (file: ManagedFile) => {
    const source = file.source ?? new Blob([`Demo file: ${file.name}`], { type: 'text/plain' });
    const url = URL.createObjectURL(source);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    toast.success(t('systemPages.fileManager.downloadStarted', { name: file.name }));
  };

  const deleteFiles = (ids: Set<string>) => {
    if (!ids.size) return;
    setFiles((current) => current.filter((file) => !ids.has(file.id)));
    setSelected(new Set());
    toast.success(ids.size === 1
      ? t('systemPages.fileManager.fileDeleted')
      : t('systemPages.fileManager.filesDeleted', { count: ids.size }));
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))',
  };

  const iconButtonStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    border: '1px solid var(--border)',
    borderRadius: 6,
    background: 'transparent',
    color: 'var(--muted-foreground)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  return (
    <AdminLayout>
      <div data-cmp="FileManagementPage" style={{ minHeight: '100%' }}>
        <style>{`
          @media (max-width: 700px) {
            .file-manager-layout { grid-template-columns: minmax(0, 1fr) !important; }
          }
        `}</style>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--foreground)', fontSize: 20, fontWeight: 700 }}>{t('systemPages.fileManager.title')}</h1>
            <p style={{ margin: '5px 0 0', color: 'var(--muted-foreground)', fontSize: 13 }}>{t('systemPages.fileManager.description')}</p>
          </div>
          <button onClick={() => inputRef.current?.click()} style={{ height: 34, padding: '0 14px', border: 'none', borderRadius: 6, background: 'var(--primary)', color: 'var(--primary-foreground)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600 }}>
            <UploadIcon size={15} />
            {t('systemPages.fileManager.upload')}
          </button>
          <input ref={inputRef} type="file" multiple hidden onChange={handleUpload} />
        </div>

        <div className="file-manager-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(170px, 220px) minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
          <aside style={{ ...cardStyle, padding: 8 }}>
            <div style={{ padding: '8px 10px 6px', color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{t('systemPages.fileManager.folders')}</div>
            {folders.map((folder) => {
              const isActive = activeFolder === folder.id;
              return (
                <button key={folder.id} onClick={() => { setActiveFolder(folder.id); setSelected(new Set()); }} style={{ width: '100%', height: 34, padding: '0 10px', border: 'none', borderRadius: 6, background: isActive ? 'var(--accent)' : 'transparent', color: isActive ? 'var(--primary)' : 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', fontSize: 13 }}>
                  {isActive ? <FolderOpenIcon size={15} /> : <FolderIcon size={15} />}
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.label}</span>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{getFolderCount(folder.id)}</span>
                </button>
              );
            })}
          </aside>

          <section style={{ minWidth: 0 }}>
            <div style={{ ...cardStyle, padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
                <SearchIcon size={14} style={{ position: 'absolute', top: 10, left: 10, color: 'var(--muted-foreground)' }} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('systemPages.fileManager.searchPlaceholder')} style={{ boxSizing: 'border-box', width: '100%', height: 34, padding: '0 10px 0 31px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none' }} />
              </div>
              <select value={activeKind} onChange={(event) => { setActiveKind(event.target.value as FileKind | 'all'); setSelected(new Set()); }} aria-label={t('systemPages.fileManager.type')} style={{ height: 34, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, cursor: 'pointer' }}>
                <option value="all">{t('systemPages.fileManager.allTypes')}</option>
                {FILE_KINDS.map((kind) => <option key={kind} value={kind}>{t(`systemPages.fileManager.types.${kind}`)}</option>)}
              </select>
            </div>

            {selected.size > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', marginBottom: 12, border: '1px solid color-mix(in srgb, var(--primary) 28%, transparent)', borderRadius: 7, background: 'color-mix(in srgb, var(--primary) 7%, var(--card))', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>{t('systemPages.fileManager.selected', { count: selected.size })}</span>
                <button onClick={() => setSelected(new Set())} style={{ padding: 0, border: 'none', background: 'transparent', color: 'var(--muted-foreground)', fontSize: 12, cursor: 'pointer' }}>{t('systemPages.fileManager.clearSelection')}</button>
                <span style={{ flex: 1 }} />
                <button onClick={() => deleteFiles(selected)} style={{ height: 28, padding: '0 9px', border: '1px solid #fecaca', borderRadius: 6, background: 'transparent', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                  <Trash2Icon size={13} />
                  {t('systemPages.fileManager.batchDelete')}
                </button>
              </div>
            )}

            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--muted)' }}>
                      <th style={{ width: 42, padding: '10px 12px' }}>
                        <button aria-label={t('systemPages.fileManager.selectAll')} onClick={toggleAllVisible} style={{ width: 17, height: 17, padding: 0, border: `1px solid ${allVisibleSelected ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 4, background: allVisibleSelected ? 'var(--primary)' : 'var(--card)', color: 'var(--primary-foreground)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          {allVisibleSelected && <CheckIcon size={12} />}
                        </button>
                      </th>
                      {[t('systemPages.fileManager.name'), t('systemPages.fileManager.type'), t('systemPages.fileManager.size'), t('systemPages.fileManager.path'), t('systemPages.fileManager.uploader'), t('systemPages.fileManager.updatedAt'), t('systemPages.fileManager.actions')].map((label) => <th key={label} style={{ padding: '10px 12px', color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleFiles.map((file) => {
                      const isSelected = selected.has(file.id);
                      return (
                        <tr key={file.id} style={{ background: isSelected ? 'color-mix(in srgb, var(--primary) 5%, var(--card))' : 'transparent', borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <button aria-label={t('systemPages.fileManager.selectFile', { name: file.name })} onClick={() => toggleSelected(file.id)} style={{ width: 17, height: 17, padding: 0, border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 4, background: isSelected ? 'var(--primary)' : 'var(--card)', color: 'var(--primary-foreground)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              {isSelected && <CheckIcon size={12} />}
                            </button>
                          </td>
                          <td style={{ padding: '10px 12px', maxWidth: 230 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileTypeIcon kind={file.kind} /></span>
                              <span title={file.name} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{file.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--muted-foreground)', fontSize: 12, whiteSpace: 'nowrap' }}>{t(`systemPages.fileManager.types.${file.kind}`)}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--muted-foreground)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatSize(file.size)}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--muted-foreground)', fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.path}>{file.path}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--muted-foreground)', fontSize: 12, whiteSpace: 'nowrap' }}>{file.uploader}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--muted-foreground)', fontSize: 12, whiteSpace: 'nowrap' }}>{file.updatedAt}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button title={t('systemPages.fileManager.download')} aria-label={t('systemPages.fileManager.download')} onClick={() => handleDownload(file)} style={iconButtonStyle}><DownloadIcon size={14} /></button>
                              <button title={t('systemPages.fileManager.delete')} aria-label={t('systemPages.fileManager.delete')} onClick={() => deleteFiles(new Set([file.id]))} style={{ ...iconButtonStyle, color: '#dc2626', borderColor: '#fecaca' }}><Trash2Icon size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {visibleFiles.length === 0 && (
                <div style={{ padding: '52px 20px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>
                  <FileIcon size={28} style={{ display: 'block', margin: '0 auto 10px' }} />
                  {t('systemPages.fileManager.noResults')}
                </div>
              )}
            </div>
            <p style={{ margin: '10px 0 0', color: 'var(--muted-foreground)', fontSize: 12 }}>{t('systemPages.fileManager.showing', { count: visibleFiles.length, total: files.length })}</p>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
