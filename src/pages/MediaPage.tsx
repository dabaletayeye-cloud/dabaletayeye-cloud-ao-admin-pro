import { useState, useRef } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import {
  SearchIcon, UploadCloudIcon, GridIcon, ListIcon,
  ImageIcon, VideoIcon, FileTextIcon, MusicIcon, FileIcon,
  PlayCircleIcon, DownloadIcon, Trash2Icon, CopyIcon, EyeIcon,
  XIcon, CheckIcon, MoveIcon, ChevronDownIcon, LinkIcon,
  FolderIcon, AlertCircleIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaType = 'image' | 'video' | 'document' | 'audio' | 'other';
type SortKey = 'time_desc' | 'time_asc' | 'name_asc' | 'size_desc';
type ViewMode = 'grid' | 'list';
type TabKey = 'all' | MediaType;

interface MediaFile {
  id: string;
  name: string;
  type: MediaType;
  size: string;       // e.g. "2.4 MB"
  sizeBytes: number;
  dimensions: string; // e.g. "1920×1080" or "-"
  url: string;        // preview src
  thumb: string;      // thumbnail src (same as url for images)
  duration: string;   // video/audio duration or "-"
  uploader: string;
  uploadTime: string;
  ext: string;        // file extension label
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MEDIA_FILES: MediaFile[] = [
  {
    id: 'm01', name: 'hero-banner-summer.jpg', type: 'image', size: '2.4 MB', sizeBytes: 2516582,
    dimensions: '1920×600', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=240&h=160&fit=crop',
    duration: '-', uploader: '张管理', uploadTime: '2025-07-14 10:32', ext: 'JPG',
  },
  {
    id: 'm02', name: 'product-shoes-01.jpg', type: 'image', size: '1.8 MB', sizeBytes: 1887437,
    dimensions: '1200×1200', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=240&h=160&fit=crop',
    duration: '-', uploader: '李运营', uploadTime: '2025-07-13 15:20', ext: 'JPG',
  },
  {
    id: 'm03', name: 'team-photo-2025.jpg', type: 'image', size: '3.1 MB', sizeBytes: 3250585,
    dimensions: '2400×1600', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=533&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=240&h=160&fit=crop',
    duration: '-', uploader: '张管理', uploadTime: '2025-07-12 09:15', ext: 'JPG',
  },
  {
    id: 'm04', name: 'office-desk-setup.jpg', type: 'image', size: '1.2 MB', sizeBytes: 1258291,
    dimensions: '1600×1067', url: 'https://images.unsplash.com/photo-1593640408182-31c228e6acb1?w=800&h=534&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1593640408182-31c228e6acb1?w=240&h=160&fit=crop',
    duration: '-', uploader: '王设计', uploadTime: '2025-07-11 14:08', ext: 'JPG',
  },
  {
    id: 'm05', name: 'brand-logo-white.png', type: 'image', size: '0.3 MB', sizeBytes: 314573,
    dimensions: '800×800', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=800&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=240&h=160&fit=crop',
    duration: '-', uploader: '王设计', uploadTime: '2025-07-10 16:45', ext: 'PNG',
  },
  {
    id: 'm06', name: 'product-intro-video.mp4', type: 'video', size: '48.5 MB', sizeBytes: 50855936,
    dimensions: '1920×1080', url: 'https://images.unsplash.com/photo-1536240478700-b869ad10e2af?w=800&h=450&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1536240478700-b869ad10e2af?w=240&h=160&fit=crop',
    duration: '2:34', uploader: '李运营', uploadTime: '2025-07-10 11:00', ext: 'MP4',
  },
  {
    id: 'm07', name: 'tutorial-how-to-use.mp4', type: 'video', size: '62.3 MB', sizeBytes: 65330380,
    dimensions: '1280×720', url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=450&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=240&h=160&fit=crop',
    duration: '5:18', uploader: '张管理', uploadTime: '2025-07-09 09:40', ext: 'MP4',
  },
  {
    id: 'm08', name: 'annual-report-2025.pdf', type: 'document', size: '4.7 MB', sizeBytes: 4928716,
    dimensions: '-', url: '', thumb: '',
    duration: '-', uploader: '赵财务', uploadTime: '2025-07-08 17:22', ext: 'PDF',
  },
  {
    id: 'm09', name: 'product-catalog-Q3.xlsx', type: 'document', size: '1.1 MB', sizeBytes: 1153433,
    dimensions: '-', url: '', thumb: '',
    duration: '-', uploader: '李运营', uploadTime: '2025-07-07 10:05', ext: 'XLSX',
  },
  {
    id: 'm10', name: 'brand-guidelines-v2.docx', type: 'document', size: '2.6 MB', sizeBytes: 2726297,
    dimensions: '-', url: '', thumb: '',
    duration: '-', uploader: '王设计', uploadTime: '2025-07-06 14:50', ext: 'DOCX',
  },
  {
    id: 'm11', name: 'background-music.mp3', type: 'audio', size: '5.2 MB', sizeBytes: 5452595,
    dimensions: '-', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=800&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=240&h=160&fit=crop',
    duration: '3:42', uploader: '张管理', uploadTime: '2025-07-05 13:30', ext: 'MP3',
  },
  {
    id: 'm12', name: 'data-export-202507.zip', type: 'other', size: '9.8 MB', sizeBytes: 10276044,
    dimensions: '-', url: '', thumb: '',
    duration: '-', uploader: '赵财务', uploadTime: '2025-07-04 09:00', ext: 'ZIP',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<MediaType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  image:    { label: '图片', color: '#2563eb', bg: '#dbeafe', icon: <ImageIcon size={14} /> },
  video:    { label: '视频', color: '#7c3aed', bg: '#ede9fe', icon: <VideoIcon size={14} /> },
  document: { label: '文档', color: '#d97706', bg: '#fef3c7', icon: <FileTextIcon size={14} /> },
  audio:    { label: '音频', color: '#0891b2', bg: '#cffafe', icon: <MusicIcon size={14} /> },
  other:    { label: '其他', color: '#6b7280', bg: '#f3f4f6', icon: <FileIcon size={14} /> },
};

const EXT_COLORS: Record<string, string> = {
  PDF: '#dc2626', DOCX: '#2563eb', XLSX: '#16a34a', PPTX: '#d97706',
  MP4: '#7c3aed', MOV: '#7c3aed', MP3: '#0891b2', ZIP: '#6b7280', RAR: '#6b7280',
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'time_desc', label: '最新上传' },
  { value: 'time_asc',  label: '最早上传' },
  { value: 'name_asc',  label: '名称 A-Z' },
  { value: 'size_desc', label: '文件最大' },
];

const TAB_LIST: { key: TabKey; label: string }[] = [
  { key: 'all',      label: '全部' },
  { key: 'image',    label: '图片' },
  { key: 'video',    label: '视频' },
  { key: 'document', label: '文档' },
  { key: 'audio',    label: '音频' },
  { key: 'other',    label: '其他' },
];

function formatBytes(b: number) {
  if (b >= 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB';
  if (b >= 1024) return (b / 1024).toFixed(0) + ' KB';
  return b + ' B';
}

function sortFiles(files: MediaFile[], key: SortKey): MediaFile[] {
  return [...files].sort((a, b) => {
    if (key === 'time_desc') return b.uploadTime.localeCompare(a.uploadTime);
    if (key === 'time_asc')  return a.uploadTime.localeCompare(b.uploadTime);
    if (key === 'name_asc')  return a.name.localeCompare(b.name);
    if (key === 'size_desc') return b.sizeBytes - a.sizeBytes;
    return 0;
  });
}

// ─── Doc Icon ─────────────────────────────────────────────────────────────────
function DocIcon({ ext }: { ext: string }) {
  const bg = EXT_COLORS[ext] ?? '#6b7280';
  return (
    <div style={{
      width: 48, height: 56, borderRadius: 6, background: bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 14, height: 14,
        background: 'rgba(255,255,255,0.3)', borderBottomLeftRadius: 4,
        borderTopRightRadius: 6,
      }} />
      <span style={{ color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 0.5 }}>{ext}</span>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ visible, primary, onClose }: { visible: boolean; primary: string; onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploadList, setUploadList] = useState<{ name: string; progress: number; done: boolean }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (names: string[]) => {
    const initial = names.map(n => ({ name: n, progress: 0, done: false }));
    setUploadList(prev => [...prev, ...initial]);
    initial.forEach((_, idx) => {
      const startIdx = uploadList.length + idx;
      let p = 0;
      const tick = setInterval(() => {
        p = Math.min(p + Math.round(8 + Math.random() * 18), 100);
        setUploadList(prev => prev.map((item, i) =>
          i === startIdx ? { ...item, progress: p, done: p >= 100 } : item
        ));
        if (p >= 100) clearInterval(tick);
      }, 150);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).map(f => f.name);
    if (files.length) simulateUpload(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).map(f => f.name);
    if (files.length) simulateUpload(files);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: visible ? 'flex' : 'none',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 520, maxWidth: '90vw', background: 'var(--card)',
        border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UploadCloudIcon size={16} style={{ color: primary }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>上传文件</span>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
            <XIcon size={14} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? primary : 'var(--border)'}`,
              borderRadius: 12,
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? `color-mix(in srgb, ${primary} 6%, transparent)` : 'var(--background)',
              transition: 'border-color 0.2s, background 0.2s',
              marginBottom: 16,
            }}
          >
            <UploadCloudIcon size={36} style={{ color: dragging ? primary : 'var(--muted-foreground)', margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
              拖拽文件到此处，或<span style={{ color: primary }}> 点击选择</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>支持图片、视频、文档、音频等格式，单文件最大 500MB</div>
            <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileInput} />
          </div>

          {/* Upload list */}
          <div style={{ display: uploadList.length > 0 ? 'block' : 'none', maxHeight: 200, overflowY: 'auto' }}>
            {uploadList.map((item, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 340 }}>{item.name}</span>
                  <span style={{ fontSize: 11, color: item.done ? '#16a34a' : 'var(--muted-foreground)', flexShrink: 0, marginLeft: 8 }}>
                    {item.done ? <CheckIcon size={13} style={{ color: '#16a34a' }} /> : `${item.progress}%`}
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${item.progress}%`, height: '100%', background: item.done ? '#16a34a' : primary, borderRadius: 2, transition: 'width 0.2s' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button onClick={() => { onClose(); setUploadList([]); }}
              style={{ height: 36, padding: '0 20px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, cursor: 'pointer' }}>
              关闭
            </button>
            <button onClick={() => simulateUpload(['new-file-' + Date.now() + '.jpg'])}
              style={{ height: 36, padding: '0 20px', border: 'none', borderRadius: 8, background: primary, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <UploadCloudIcon size={13} />继续上传
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ file, primary, onClose, onDownload, onDelete }: { file: MediaFile | null; primary: string; onClose: () => void; onDownload: (file: MediaFile) => void; onDelete: (file: MediaFile) => void }) {
  const [copied, setCopied] = useState(false);
  const fakeUrl = file ? `https://cdn.example.com/media/${file.id}/${file.name}` : '';

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: file ? 'flex' : 'none',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {file && (
        <div style={{
          width: 820, maxWidth: '92vw', maxHeight: '90vh',
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: TYPE_META[file.type].color, background: TYPE_META[file.type].bg, padding: '2px 8px', borderRadius: 20 }}>{file.ext}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{file.name}</span>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
              <XIcon size={14} />
            </button>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {/* Preview area */}
            <div style={{ flex: 1, background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minWidth: 0 }}>
              {(file.type === 'image') && (
                <img src={file.url} alt={file.name} style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain', display: 'block' }} />
              )}
              {(file.type === 'video') && (
                <div style={{ position: 'relative', width: '100%' }}>
                  <img src={file.url} alt={file.name} style={{ width: '100%', maxHeight: 380, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <PlayCircleIcon size={32} style={{ color: '#fff' }} />
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 10, right: 14, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, padding: '2px 8px', borderRadius: 4 }}>{file.duration}</div>
                </div>
              )}
              {(file.type === 'audio') && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: `color-mix(in srgb, ${primary} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <MusicIcon size={36} style={{ color: primary }} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>时长：{file.duration}</div>
                  <div style={{ marginTop: 16, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', width: 220, margin: '12px auto 0' }}>
                    <div style={{ width: '35%', height: '100%', background: primary, borderRadius: 2 }} />
                  </div>
                </div>
              )}
              {(file.type === 'document' || file.type === 'other') && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <DocIcon ext={file.ext} />
                  <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 16 }}>此文件类型暂不支持预览</div>
                  <button onClick={() => onDownload(file)} style={{ marginTop: 12, height: 34, padding: '0 18px', border: 'none', borderRadius: 8, background: primary, color: '#fff', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <DownloadIcon size={13} />下载查看
                  </button>
                </div>
              )}
            </div>

            {/* Info panel */}
            <div style={{ width: 220, borderLeft: '1px solid var(--border)', padding: '16px', overflowY: 'auto', flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>文件信息</div>
              {[
                { label: '文件名', value: file.name },
                { label: '类型',   value: TYPE_META[file.type].label },
                { label: '大小',   value: file.size },
                { label: '尺寸',   value: file.dimensions },
                { label: '上传者', value: file.uploader },
                { label: '上传时间', value: file.uploadTime },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 2 }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--foreground)', wordBreak: 'break-all', lineHeight: 1.5 }}>{row.value}</div>
                </div>
              ))}

              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 6 }}>文件链接</div>
                <div style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 8px', fontSize: 11, color: 'var(--muted-foreground)', wordBreak: 'break-all', lineHeight: 1.5, marginBottom: 8 }}>
                  {fakeUrl}
                </div>
                <button onClick={handleCopy}
                  style={{ width: '100%', height: 32, border: `1px solid ${copied ? '#16a34a' : 'var(--border)'}`, borderRadius: 6, background: copied ? '#dcfce7' : 'var(--background)', color: copied ? '#16a34a' : 'var(--foreground)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.2s' }}>
                  {copied ? <CheckIcon size={12} /> : <LinkIcon size={12} />}
                  {copied ? '已复制!' : '复制链接'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => onDownload(file)} style={{ flex: 1, height: 32, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--background)', color: 'var(--muted-foreground)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <DownloadIcon size={12} />下载
                </button>
                <button onClick={() => onDelete(file)} style={{ flex: 1, height: 32, border: '1px solid #fee2e2', borderRadius: 6, background: 'transparent', color: '#dc2626', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Trash2Icon size={12} />删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function GridCard({
  file, primary, selected, onSelect, onPreview, onDownload, onDelete,
}: {
  file: MediaFile; primary: string; selected: boolean;
  onSelect: (id: string) => void; onPreview: (f: MediaFile) => void;
  onDownload: (f: MediaFile) => void; onDelete: (f: MediaFile) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card)',
        border: `1.5px solid ${selected ? primary : hovered ? 'var(--muted-foreground)' : 'var(--border)'}`,
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.18s, box-shadow 0.18s',
        boxShadow: selected
          ? `0 0 0 3px color-mix(in srgb, ${primary} 20%, transparent)`
          : hovered
            ? 'var(--shadow-x, 0) var(--shadow-y, 4px) var(--shadow-blur, 16px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.1))'
            : 'none',
      }}
    >
      {/* Thumbnail area */}
      <div
        style={{ position: 'relative', height: 140, background: 'var(--muted)', overflow: 'hidden' }}
        onClick={() => onPreview(file)}
      >
        {/* Select checkbox */}
        <div
          onClick={e => { e.stopPropagation(); onSelect(file.id); }}
          style={{
            position: 'absolute', top: 8, left: 8, zIndex: 2,
            width: 20, height: 20, borderRadius: 5,
            border: `2px solid ${selected ? primary : '#fff'}`,
            background: selected ? primary : 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: selected || hovered ? 1 : 0,
            transition: 'opacity 0.15s',
            cursor: 'pointer',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div style={{ display: selected ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}>
            <CheckIcon size={11} style={{ color: '#fff' }} />
          </div>
        </div>

        {/* Type badge */}
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 2,
          fontSize: 10, fontWeight: 700,
          color: TYPE_META[file.type].color,
          background: TYPE_META[file.type].bg,
          padding: '1px 6px', borderRadius: 10,
        }}>
          {file.ext}
        </div>

        {(file.type === 'image' || file.type === 'video' || file.type === 'audio') && file.thumb ? (
          <>
            <img
              src={file.thumb} alt={file.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.3s' }}
            />
            {file.type === 'video' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlayCircleIcon size={32} style={{ color: 'rgba(255,255,255,0.9)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
              </div>
            )}
            {file.duration !== '-' && (
              <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>{file.duration}</div>
            )}
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <DocIcon ext={file.ext} />
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
          display: hovered ? 'flex' : 'none',
          alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => onPreview(file)}>
            <EyeIcon size={14} style={{ color: '#1a1a1a' }} />
          </div>
          <div onClick={() => onDownload(file)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <DownloadIcon size={14} style={{ color: '#1a1a1a' }} />
          </div>
          <div onClick={() => onDelete(file)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Trash2Icon size={14} style={{ color: '#dc2626' }} />
          </div>
        </div>
      </div>

      {/* Meta */}
      <div style={{ padding: '10px 10px 10px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }} title={file.name}>
          {file.name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-foreground)' }}>
          <span>{file.size}</span>
          <span>{file.uploadTime.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MediaPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const [search, setSearch]         = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [tab, setTab]               = useState<TabKey>('all');
  const [sort, setSort]             = useState<SortKey>('time_desc');
  const [viewMode, setViewMode]     = useState<ViewMode>('grid');
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [hoveredRow, setHoveredRow]  = useState<string | null>(null);

  // Apply filters
  const filtered = sortFiles(
    MEDIA_FILES.filter(f => {
      const matchTab    = tab === 'all' || f.type === tab;
      const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    }),
    sort,
  );

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(f => f.id)));
    }
  };

  const clearSelect = () => setSelected(new Set());

  const handleSearch = () => setSearch(tempSearch);

  const handleDownload = (file: MediaFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    link.click();
    toast.success(`开始下载 ${file.name}`);
  };

  const handleDelete = (file: MediaFile) => {
    toast.success(`已提交删除 ${file.name}`);
  };

  // Stats
  const totalCount    = 1247;
  const imageCount    = 856;
  const videoCount    = 234;
  const documentCount = 157;

  const statCards = [
    { label: '总文件', value: totalCount.toLocaleString(), color: primary, icon: <FolderIcon size={18} /> },
    { label: '图片',   value: imageCount.toLocaleString(),    color: '#2563eb', icon: <ImageIcon size={18} /> },
    { label: '视频',   value: videoCount.toLocaleString(),    color: '#7c3aed', icon: <VideoIcon size={18} /> },
    { label: '文档',   value: documentCount.toLocaleString(), color: '#d97706', icon: <FileTextIcon size={18} /> },
  ];

  // Tab count
  const countByTab = (key: TabKey) =>
    key === 'all' ? MEDIA_FILES.length : MEDIA_FILES.filter(f => f.type === key).length;

  return (
    <AdminLayout>
      <div data-cmp="MediaPage" style={{ padding: '24px', minHeight: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>媒体库</h1>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>管理所有上传的图片、视频、文档和音频资源</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {statCards.map(card => (
            <div key={card.label} style={{
              flex: '1 1 160px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `color-mix(in srgb, ${card.color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1.2 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 16 }}>
          {/* Tab row */}
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '0 16px', overflowX: 'auto' }}>
            {TAB_LIST.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); clearSelect(); }}
                style={{
                  height: 44, padding: '0 14px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: 13, fontWeight: tab === t.key ? 700 : 400,
                  color: tab === t.key ? primary : 'var(--muted-foreground)',
                  borderBottom: tab === t.key ? `2px solid ${primary}` : '2px solid transparent',
                  marginBottom: -1, whiteSpace: 'nowrap', transition: 'color 0.15s',
                }}
              >
                {t.label}
                <span style={{ marginLeft: 5, padding: '1px 6px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: tab === t.key ? `color-mix(in srgb, ${primary} 12%, transparent)` : 'var(--muted)', color: tab === t.key ? primary : 'var(--muted-foreground)' }}>
                  {countByTab(t.key)}
                </span>
              </button>
            ))}
          </div>

          {/* Controls row */}
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
              <SearchIcon size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
              <input
                value={tempSearch}
                onChange={e => setTempSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="搜索文件名称..."
                style={{ width: '100%', height: 34, paddingLeft: 30, paddingRight: 10, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Sort */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                style={{ height: 34, padding: '0 28px 0 10px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--background)', color: 'var(--foreground)', fontSize: 13, outline: 'none', cursor: 'pointer', appearance: 'none' }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDownIcon size={13} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
            </div>

            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
              {([['grid', <GridIcon size={14} />], ['list', <ListIcon size={14} />]] as [ViewMode, React.ReactNode][]).map(([mode, icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    width: 34, height: 34, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: viewMode === mode ? primary : 'var(--background)',
                    color: viewMode === mode ? '#fff' : 'var(--muted-foreground)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Upload */}
            <button
              onClick={() => setUploadOpen(true)}
              style={{ height: 34, padding: '0 16px', border: 'none', borderRadius: 8, background: primary, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
            >
              <UploadCloudIcon size={14} />上传文件
            </button>
          </div>
        </div>

        {/* Batch ops bar — always in DOM */}
        <div style={{
          display: selected.size > 0 ? 'flex' : 'none',
          alignItems: 'center', gap: 12,
          background: `color-mix(in srgb, ${primary} 8%, var(--card))`,
          border: `1px solid color-mix(in srgb, ${primary} 30%, transparent)`,
          borderRadius: 10, padding: '10px 16px', marginBottom: 16,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: primary }}>已选 {selected.size} 个文件</span>
          <button onClick={clearSelect} style={{ height: 30, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--background)', color: 'var(--muted-foreground)', fontSize: 12, cursor: 'pointer' }}>取消选择</button>
          <button onClick={toggleSelectAll} style={{ height: 30, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--background)', color: 'var(--foreground)', fontSize: 12, cursor: 'pointer' }}>全选</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => toast.success(`已准备移动 ${selected.size} 个文件`)} style={{ height: 30, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--background)', color: 'var(--foreground)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <MoveIcon size={12} />移动
          </button>
          <button onClick={() => filtered.filter(file => selected.has(file.id)).forEach(handleDownload)} style={{ height: 30, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--background)', color: 'var(--foreground)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <DownloadIcon size={12} />批量下载
          </button>
          <button onClick={() => { filtered.filter(file => selected.has(file.id)).forEach(handleDelete); clearSelect(); }} style={{ height: 30, padding: '0 12px', border: '1px solid #fee2e2', borderRadius: 7, background: 'transparent', color: '#dc2626', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Trash2Icon size={12} />批量删除
          </button>
        </div>

        {/* Empty state */}
        <div style={{ display: filtered.length === 0 ? 'block' : 'none', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '60px', textAlign: 'center' }}>
          <AlertCircleIcon size={36} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontSize: 15, color: 'var(--muted-foreground)' }}>暂无匹配的文件</div>
        </div>

        {/* ── Grid View ── */}
        <div style={{ display: viewMode === 'grid' && filtered.length > 0 ? 'flex' : 'none', flexWrap: 'wrap', gap: 16 }}>
          {filtered.map(file => (
            <div key={file.id} style={{ flex: '1 1 170px', maxWidth: 210, minWidth: 155 }}>
              <GridCard
                file={file}
                primary={primary}
                selected={selected.has(file.id)}
                onSelect={toggleSelect}
                onPreview={setPreviewFile}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>

        {/* ── List View ── */}
        <div style={{ display: viewMode === 'list' && filtered.length > 0 ? 'block' : 'none', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ background: 'var(--muted)' }}>
                  <th style={{ padding: '10px 14px', width: 36 }}>
                    <div
                      onClick={toggleSelectAll}
                      style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: `2px solid ${selected.size === filtered.length && filtered.length > 0 ? primary : 'var(--border)'}`,
                        background: selected.size === filtered.length && filtered.length > 0 ? primary : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <div style={{ display: selected.size === filtered.length && filtered.length > 0 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckIcon size={10} style={{ color: '#fff' }} />
                      </div>
                    </div>
                  </th>
                  {['缩略图', '文件名', '类型', '大小', '尺寸', '上传者', '时间', '操作'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(file => {
                  const isSelected = selected.has(file.id);
                  const isHovered  = hoveredRow === file.id;
                  const meta = TYPE_META[file.type];
                  return (
                    <tr
                      key={file.id}
                      onMouseEnter={() => setHoveredRow(file.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{ borderBottom: '1px solid var(--border)', background: isSelected ? `color-mix(in srgb, ${primary} 5%, var(--card))` : isHovered ? 'var(--muted)' : 'transparent', transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '10px 14px' }}>
                        <div
                          onClick={() => toggleSelect(file.id)}
                          style={{
                            width: 18, height: 18, borderRadius: 4,
                            border: `2px solid ${isSelected ? primary : 'var(--border)'}`,
                            background: isSelected ? primary : 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <div style={{ display: isSelected ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckIcon size={10} style={{ color: '#fff' }} />
                          </div>
                        </div>
                      </td>
                      {/* Thumb */}
                      <td style={{ padding: '10px 12px' }}>
                        <div
                          style={{ width: 52, height: 40, borderRadius: 6, overflow: 'hidden', background: 'var(--muted)', cursor: 'pointer', flexShrink: 0 }}
                          onClick={() => setPreviewFile(file)}
                        >
                          {(file.type === 'image' || file.type === 'video' || file.type === 'audio') && file.thumb ? (
                            <img src={file.thumb} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <DocIcon ext={file.ext} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', maxWidth: 220 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.name}>{file.name}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: meta.color, background: meta.bg, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                          {meta.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{file.size}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{file.dimensions}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{file.uploader}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{file.uploadTime}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => setPreviewFile(file)} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }} title="预览"><EyeIcon size={13} /></button>
                          <button onClick={() => { void navigator.clipboard?.writeText(file.url); toast.success('链接已复制'); }} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }} title="复制链接"><CopyIcon size={13} /></button>
                          <button onClick={() => handleDownload(file)} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }} title="下载"><DownloadIcon size={13} /></button>
                          <button onClick={() => handleDelete(file)} style={{ width: 28, height: 28, border: '1px solid #fee2e2', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }} title="删除"><Trash2Icon size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* File count footer */}
        <div style={{ display: filtered.length > 0 ? 'flex' : 'none', justifyContent: 'flex-end', marginTop: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>显示 {filtered.length} / {MEDIA_FILES.length} 个文件</span>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal visible={uploadOpen} primary={primary} onClose={() => setUploadOpen(false)} />

      {/* Preview Modal */}
      <PreviewModal file={previewFile} primary={primary} onClose={() => setPreviewFile(null)} onDownload={handleDownload} onDelete={handleDelete} />
    </AdminLayout>
  );
}
