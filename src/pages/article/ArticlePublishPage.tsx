import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { toast } from '../../lib/localizedToast';
import {
  UploadCloudIcon,
  XIcon,
  ImageIcon,
  ChevronDownIcon,
  CalendarIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  SaveIcon,
  SendIcon,
  ArrowLeftIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  ImagePlusIcon,
  CodeIcon,
  Undo2Icon,
  Redo2Icon,
  TagIcon,
  PlusIcon,
} from 'lucide-react';

// ── 分类选项 ──────────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = ['前端', '后端', '数据库', 'UI', '移动端', '运维', '算法', '产品', '职场'];

// ── 预置标签库 ────────────────────────────────────────────────────────────────
const PRESET_TAGS = [
  'React', 'Vue', 'TypeScript', 'Node.js', 'Python', 'Docker',
  'MySQL', 'Redis', 'Git', '性能优化', '架构设计', '微前端',
  'CI/CD', 'Webpack', 'Vite', '测试', '安全', 'API设计',
];

// ── 今天 yyyy-MM-ddTHH:mm 格式 ───────────────────────────────────────────────
function nowDatetime() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── index.css 注入一次（editor 专用样式）──────────────────────────────────────
const EDITOR_STYLE_ID = 'rich-editor-styles';
function injectEditorStyles() {
  if (document.getElementById(EDITOR_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = EDITOR_STYLE_ID;
  el.textContent = `
    .rich-editor-area:empty:before {
      content: attr(data-placeholder);
      color: var(--muted-foreground);
      pointer-events: none;
      position: absolute;
      top: 14px; left: 16px;
      font-size: 14px; line-height: 1.8; opacity: 0.6;
    }
    .rich-editor-area { position: relative; }
    .rich-editor-area:focus { outline: none; }
    .rich-editor-area b, .rich-editor-area strong { font-weight: 700; }
    .rich-editor-area i, .rich-editor-area em { font-style: italic; }
    .rich-editor-area u { text-decoration: underline; }
    .rich-editor-area h1 { font-size: 1.6em; font-weight: 700; margin: 0.6em 0 0.3em; line-height:1.3; }
    .rich-editor-area h2 { font-size: 1.35em; font-weight: 700; margin: 0.6em 0 0.3em; line-height:1.3; }
    .rich-editor-area h3 { font-size: 1.15em; font-weight: 700; margin: 0.5em 0 0.25em; line-height:1.3; }
    .rich-editor-area ul { list-style: disc; padding-left: 1.4em; margin: 0.4em 0; }
    .rich-editor-area ol { list-style: decimal; padding-left: 1.4em; margin: 0.4em 0; }
    .rich-editor-area li { margin: 0.2em 0; }
    .rich-editor-area pre {
      background: var(--muted); border: 1px solid var(--border);
      border-left: 3px solid var(--primary); border-radius: 8px;
      padding: 12px 14px; margin: 0.6em 0;
      font-family: 'JetBrains Mono','Fira Code',Consolas,monospace;
      font-size: 13px; line-height: 1.6; color: var(--foreground);
      overflow-x: auto; white-space: pre-wrap;
    }
    .rich-editor-area p { margin: 0.2em 0; min-height: 1.4em; }
    .rich-editor-area img { max-width: 100%; border-radius: 8px; margin: 4px 0; }
    .toolbar-btn-hover:hover { background: var(--accent) !important; }
    .toolbar-btn-active { background: var(--primary) !important; color: #fff !important; }
  `;
  document.head.appendChild(el);
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function ArticlePublishPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const isDark   = themeState.mode === 'dark';
  const primary      = isManga ? '#E91E8C' : 'var(--primary)';
  const primaryHover = isManga ? '#c41579' : 'var(--primary)';
  const navigate = useNavigate();

  useEffect(() => { injectEditorStyles(); }, []);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [title, setTitle]             = useState('');
  const [coverUrl, setCoverUrl]       = useState('');
  const [coverDrag, setCoverDrag]     = useState(false);
  const [category, setCategory]       = useState('');
  const [catOpen, setCatOpen]         = useState(false);
  const [publishTime, setPublishTime] = useState(nowDatetime());
  const [pinned, setPinned]           = useState(false);
  const [saving, setSaving]           = useState(false);
  const [publishing, setPublishing]   = useState(false);
  const [wordCount, setWordCount]     = useState(0);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // ── Tag state ──────────────────────────────────────────────────────────────
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagDropOpen, setTagDropOpen]   = useState(false);
  const [tagInput, setTagInput]         = useState('');
  const [customTags, setCustomTags]     = useState<string[]>([]);
  const tagRef = useRef<HTMLDivElement>(null);

  // Close tag dropdown on outside click
  useEffect(() => {
    if (!tagDropOpen) return;
    const handler = (e: MouseEvent) => {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setTagDropOpen(false);
        setTagInput('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [tagDropOpen]);

  const allTags = [...PRESET_TAGS, ...customTags];

  const toggleTag = (t: string) => {
    setSelectedTags(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const removeTag = (t: string) => setSelectedTags(prev => prev.filter(x => x !== t));

  const handleTagInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (!val) return;
      if (!allTags.includes(val)) {
        setCustomTags(prev => [...prev, val]);
      }
      if (!selectedTags.includes(val)) {
        setSelectedTags(prev => [...prev, val]);
      }
      setTagInput('');
    }
  };

  const filteredTagOptions = allTags.filter(t =>
    t.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.includes(t)
  );

  // ── Refs ───────────────────────────────────────────────────────────────────
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const imgInputRef   = useRef<HTMLInputElement>(null);
  const editorRef     = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // ── Editor helpers ─────────────────────────────────────────────────────────
  const detectFormats = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !editorRef.current?.contains(sel.anchorNode)) return;
    const fmts = new Set<string>();
    if (document.queryCommandState('bold'))               fmts.add('bold');
    if (document.queryCommandState('italic'))             fmts.add('italic');
    if (document.queryCommandState('underline'))          fmts.add('underline');
    if (document.queryCommandState('insertOrderedList'))  fmts.add('ol');
    if (document.queryCommandState('insertUnorderedList'))fmts.add('ul');
    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === 1) {
        const tag = (node as Element).tagName;
        if (tag === 'H1') fmts.add('h1');
        if (tag === 'H2') fmts.add('h2');
        if (tag === 'H3') fmts.add('h3');
        if (tag === 'PRE') fmts.add('code');
      }
      node = node.parentNode;
    }
    setActiveFormats(fmts);
  }, []);

  const saveRange = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreRange = useCallback(() => {
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  }, []);

  const updateWordCount = useCallback(() => {
    setWordCount((editorRef.current?.innerText ?? '').replace(/\s/g, '').length);
  }, []);

  const exec = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    restoreRange();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).execCommand(cmd, false, value ?? undefined);
    updateWordCount();
    detectFormats();
  }, [restoreRange, updateWordCount, detectFormats]);

  const execHeading = useCallback((tag: string) => {
    editorRef.current?.focus();
    restoreRange();
    const sel = window.getSelection();
    let alreadyTag = false;
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeType === 1 && (node as Element).tagName === tag.toUpperCase()) {
          alreadyTag = true; break;
        }
        node = node.parentNode;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).execCommand('formatBlock', false, alreadyTag ? 'p' : tag);
    updateWordCount();
    detectFormats();
  }, [restoreRange, updateWordCount, detectFormats]);

  const insertCodeBlock = useCallback(() => {
    editorRef.current?.focus();
    restoreRange();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const pre = document.createElement('pre');
    pre.textContent = range.toString() || '// 在此输入代码';
    range.deleteContents();
    range.insertNode(pre);
    const after = document.createElement('p');
    after.innerHTML = '<br>';
    pre.after(after);
    const nr = document.createRange();
    nr.setStart(after, 0); nr.collapse(true);
    sel.removeAllRanges(); sel.addRange(nr);
    updateWordCount(); detectFormats();
  }, [restoreRange, updateWordCount, detectFormats]);

  const handleImgFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('请选择图片文件'); return; }
    const url = URL.createObjectURL(file);
    editorRef.current?.focus();
    restoreRange();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).execCommand('insertImage', false, url);
    updateWordCount();
  }, [restoreRange, updateWordCount]);

  // ── Cover helpers ─────────────────────────────────────────────────────────
  const handleCoverFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('请上传图片格式文件'); return; }
    setCoverUrl(URL.createObjectURL(file));
  }, []);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) handleCoverFile(file); e.target.value = '';
  };
  const onImgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) handleImgFile(file); e.target.value = '';
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setCoverDrag(false);
    const file = e.dataTransfer.files?.[0]; if (file) handleCoverFile(file);
  };
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setCoverDrag(true); };
  const onDragLeave = () => setCoverDrag(false);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleSaveDraft = () => {
    if (!title.trim()) { toast.error('请填写文章标题'); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('已保存草稿');
    }, 700);
  };

  const handlePublish = () => {
    if (!title.trim()) { toast.error('请填写文章标题'); return; }
    if (!category)     { toast.error('请选择文章分类'); return; }
    setPublishing(true);
    toast.success('发布成功 🎉');
    setTimeout(() => {
      setPublishing(false);
      navigate('/article/list');
    }, 1000);
  };

  // ── Shared input style ─────────────────────────────────────────────────────
  const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid var(--border)', background: 'var(--background)',
    color: 'var(--foreground)', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
  };

  // ── Toolbar button renderer ────────────────────────────────────────────────
  const renderToolBtn = (
    id: string, title: string, icon: React.ReactNode, onClick: () => void,
  ) => {
    const isActive = activeFormats.has(id);
    return (
      <button
        key={id} title={title}
        onMouseDown={e => { e.preventDefault(); saveRange(); onClick(); }}
        className={`toolbar-btn-hover${isActive ? ' toolbar-btn-active' : ''}`}
        style={{
          width: 30, height: 28, borderRadius: 6, border: 'none',
          background: isActive ? primary : 'transparent',
          color: isActive ? '#fff' : 'var(--foreground)',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
          transition: 'background 0.13s, color 0.13s',
        }}
      >
        {icon}
      </button>
    );
  };

  const sep = (key: string) => (
    <div key={key} style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
  );

  // ── Tag chip color by index ───────────────────────────────────────────────
  const TAG_PALETTES = [
    { bg: isManga ? 'rgba(233,30,140,0.12)' : 'rgba(99,102,241,0.12)', color: isManga ? '#E91E8C' : 'var(--primary)' },
    { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
    { bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
    { bg: 'rgba(59,130,246,0.12)', color: '#2563eb' },
    { bg: 'rgba(168,85,247,0.12)', color: '#7c3aed' },
    { bg: 'rgba(236,72,153,0.12)', color: '#db2777' },
  ];
  const tagPalette = (t: string) => TAG_PALETTES[t.charCodeAt(0) % TAG_PALETTES.length];

  return (
    <AdminLayout>
      <div
        data-cmp="ArticlePublishPage"
        style={{ minHeight: '100%', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}
      >
        {/* ── Page Header ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px 0', flexShrink: 0 }}>
          <button
            onClick={() => navigate('/article/list')}
            style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeftIcon size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>发布文章</h1>
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: '2px 0 0' }}>填写文章信息后点击发布</p>
          </div>
        </div>

        {/* ── Main Body ──────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', gap: 20, padding: '20px 24px 100px', alignItems: 'flex-start' }}>

          {/* ════════ LEFT MAIN ════════ */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Title */}
            <Card>
              <SectionLabel>文章标题</SectionLabel>
              <input
                style={{ ...inputBase, fontSize: 16, fontWeight: 500, padding: '12px 16px', borderRadius: 12 }}
                placeholder="请输入文章标题..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={100}
              />
              <div style={{ textAlign: 'right', fontSize: 12, color: title.length > 80 ? '#f59e0b' : 'var(--muted-foreground)', marginTop: 6 }}>
                {title.length} / 100
              </div>
            </Card>

            {/* Cover Upload */}
            <Card>
              <SectionLabel>封面图片</SectionLabel>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
              {coverUrl ? (
                <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
                  <img src={coverUrl} alt="封面预览" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
                  <div
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                  >
                    <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.9)', color: '#111', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UploadCloudIcon size={14} />重新上传
                    </button>
                    <button onClick={() => setCoverUrl('')} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(239,68,68,0.85)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <XIcon size={16} />
                    </button>
                  </div>
                  <button onClick={() => setCoverUrl('')} style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
                  style={{ border: `2px dashed ${coverDrag ? primary : 'var(--border)'}`, borderRadius: 14, background: coverDrag ? (isManga ? 'rgba(233,30,140,0.06)' : 'rgba(99,102,241,0.05)') : 'var(--muted)', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s' }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: coverDrag ? primary : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    {coverDrag ? <UploadCloudIcon size={24} color="#fff" /> : <ImageIcon size={24} style={{ color: 'var(--muted-foreground)' }} />}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{coverDrag ? '松开即可上传' : '点击或拖拽图片至此处'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>支持 JPG、PNG、WebP，建议比例 16:9</div>
                  </div>
                </div>
              )}
            </Card>

            {/* ════ Rich Text Editor ════ */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onImgFileChange} />
              {/* Editor header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 0' }}>
                <SectionLabel>文章内容</SectionLabel>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)', paddingBottom: 12 }}>富文本编辑器</span>
              </div>
              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, padding: '6px 12px 8px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: isDark ? 'rgba(255,255,255,0.03)' : 'var(--muted)' }}>
                {renderToolBtn('bold',      '加粗 (Ctrl+B)',    <BoldIcon size={14} />,        () => exec('bold'))}
                {renderToolBtn('italic',    '斜体 (Ctrl+I)',    <ItalicIcon size={14} />,      () => exec('italic'))}
                {renderToolBtn('underline', '下划线 (Ctrl+U)',  <UnderlineIcon size={14} />,   () => exec('underline'))}
                {sep('s1')}
                {renderToolBtn('h1', '一级标题', <Heading1Icon size={14} />, () => execHeading('h1'))}
                {renderToolBtn('h2', '二级标题', <Heading2Icon size={14} />, () => execHeading('h2'))}
                {renderToolBtn('h3', '三级标题', <Heading3Icon size={14} />, () => execHeading('h3'))}
                {sep('s2')}
                {renderToolBtn('ul', '无序列表', <ListIcon size={14} />,        () => exec('insertUnorderedList'))}
                {renderToolBtn('ol', '有序列表', <ListOrderedIcon size={14} />, () => exec('insertOrderedList'))}
                {sep('s3')}
                {renderToolBtn('img',  '插入图片', <ImagePlusIcon size={14} />, () => { saveRange(); imgInputRef.current?.click(); })}
                {renderToolBtn('code', '代码块',   <CodeIcon size={14} />,      insertCodeBlock)}
                {sep('s4')}
                {renderToolBtn('undo', '撤销 (Ctrl+Z)', <Undo2Icon size={14} />, () => exec('undo'))}
                {renderToolBtn('redo', '重做 (Ctrl+Y)', <Redo2Icon size={14} />, () => exec('redo'))}
              </div>
              {/* Editable Area */}
              <div
                ref={editorRef}
                contentEditable suppressContentEditableWarning
                data-placeholder="开始撰写正文..."
                className="rich-editor-area"
                onInput={updateWordCount}
                onKeyUp={detectFormats}
                onMouseUp={detectFormats}
                onFocus={detectFormats}
                style={{ minHeight: 380, padding: '14px 16px 16px', color: 'var(--foreground)', fontSize: 14, lineHeight: '1.85', fontFamily: 'inherit', outline: 'none', overflowY: 'auto' }}
              />
              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 14px', borderTop: '1px solid var(--border)', background: isDark ? 'rgba(255,255,255,0.03)' : 'var(--muted)' }}>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                  支持 <strong style={{ color: 'var(--foreground)' }}>Ctrl+B/I/U</strong> 快捷键
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{wordCount} 字</span>
              </div>
            </Card>
          </div>

          {/* ════════ RIGHT SIDEBAR ════════ */}
          <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Category */}
            <Card>
              <SectionLabel>文章分类</SectionLabel>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setCatOpen(o => !o)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${catOpen ? primary : 'var(--border)'}`, background: 'var(--background)', color: category ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', transition: 'border-color 0.15s' }}
                >
                  <span>{category || '请选择分类'}</span>
                  <ChevronDownIcon size={15} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--muted-foreground)' }} />
                </button>
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden', maxHeight: catOpen ? 280 : 0, opacity: catOpen ? 1 : 0, transition: 'max-height 0.2s, opacity 0.15s' }}>
                  {CATEGORY_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => { setCategory(opt); setCatOpen(false); }} style={{ width: '100%', padding: '10px 14px', border: 'none', background: category === opt ? (isManga ? 'rgba(233,30,140,0.1)' : 'var(--accent)') : 'transparent', color: category === opt ? primary : 'var(--foreground)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontWeight: category === opt ? 600 : 400 }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* ════ Tags ════ */}
            <Card>
              <SectionLabel>
                <TagIcon size={13} style={{ color: 'var(--muted-foreground)' }} />
                文章标签
              </SectionLabel>

              {/* Selected tags chips */}
              {selectedTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {selectedTags.map(t => {
                    const pal = tagPalette(t);
                    return (
                      <span
                        key={t}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px 3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: pal.bg, color: pal.color, border: `1px solid ${pal.color}33` }}
                      >
                        {t}
                        <button
                          onClick={() => removeTag(t)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', border: 'none', background: pal.color, color: '#fff', cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0 }}
                        >
                          <XIcon size={9} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Input + dropdown */}
              <div ref={tagRef} style={{ position: 'relative' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 10, border: `1.5px solid ${tagDropOpen ? primary : 'var(--border)'}`, background: 'var(--background)', transition: 'border-color 0.15s', cursor: 'text' }}
                  onClick={() => setTagDropOpen(true)}
                >
                  <PlusIcon size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                  <input
                    value={tagInput}
                    onChange={e => { setTagInput(e.target.value); setTagDropOpen(true); }}
                    onKeyDown={handleTagInputKey}
                    onFocus={() => setTagDropOpen(true)}
                    placeholder="搜索或输入标签名，回车创建…"
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--foreground)', fontSize: 13 }}
                  />
                </div>

                {/* Dropdown list */}
                <div
                  style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 60, overflow: 'hidden', maxHeight: tagDropOpen ? 240 : 0, opacity: tagDropOpen ? 1 : 0, transition: 'max-height 0.2s, opacity 0.15s' }}
                >
                  {/* Create new tag hint */}
                  {tagInput.trim() && !allTags.includes(tagInput.trim()) && (
                    <button
                      onMouseDown={e => {
                        e.preventDefault();
                        const val = tagInput.trim();
                        setCustomTags(prev => [...prev, val]);
                        setSelectedTags(prev => [...prev, val]);
                        setTagInput('');
                      }}
                      style={{ width: '100%', padding: '9px 14px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, color: primary, fontWeight: 500, borderBottom: filteredTagOptions.length ? '1px solid var(--border)' : 'none' }}
                    >
                      <PlusIcon size={13} />
                      创建标签「{tagInput.trim()}」
                    </button>
                  )}
                  {/* Existing tag options */}
                  <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                    {filteredTagOptions.length === 0 && !tagInput.trim() && (
                      <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--muted-foreground)' }}>
                        所有标签已全部选中
                      </div>
                    )}
                    {filteredTagOptions.map(t => (
                      <button
                        key={t}
                        onMouseDown={e => { e.preventDefault(); toggleTag(t); setTagInput(''); }}
                        style={{ width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', color: 'var(--foreground)', fontSize: 13, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: tagPalette(t).color, flexShrink: 0 }} />
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 8 }}>
                最多可选 10 个标签
              </p>
            </Card>

            {/* Publish Time */}
            <Card>
              <SectionLabel>发布时间</SectionLabel>
              <div style={{ position: 'relative' }}>
                <CalendarIcon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
                <input type="datetime-local" value={publishTime} onChange={e => setPublishTime(e.target.value)} style={{ ...inputBase, paddingLeft: 36, colorScheme: isDark ? 'dark' : 'light' }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 6 }}>设置未来时间可定时发布</p>
            </Card>

            {/* Pinned toggle */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>置顶文章</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>置顶后显示在列表首位</div>
                </div>
                <button onClick={() => setPinned(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: pinned ? primary : 'var(--muted-foreground)', transition: 'color 0.2s' }}>
                  {pinned ? <ToggleRightIcon size={36} /> : <ToggleLeftIcon size={36} />}
                </button>
              </div>
            </Card>

            {/* Tips */}
            <Card style={{ background: isManga ? 'rgba(233,30,140,0.06)' : 'var(--accent)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: '1.7' }}>
                <div style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: 6, fontSize: 13 }}>📋 发布须知</div>
                <div>• 文章发布后将进入审核流程</div>
                <div>• 草稿可随时继续编辑</div>
                <div>• 建议上传 16:9 封面图片</div>
                <div>• 定时发布精确到分钟</div>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Fixed Bottom Action Bar ─────────────────────────────────────────── */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'var(--card)', borderTop: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, boxShadow: '0 -4px 20px rgba(0,0,0,0.07)' }}>
          <span style={{ fontSize: 13, color: 'var(--muted-foreground)', marginRight: 'auto' }}>
            {title ? `《${title.slice(0, 20)}${title.length > 20 ? '…' : ''}》` : '未命名文章'}
          </span>
          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: 14, fontWeight: 500, cursor: saving || publishing ? 'not-allowed' : 'pointer', opacity: saving || publishing ? 0.6 : 1, transition: 'opacity 0.15s' }}
          >
            <SaveIcon size={15} />{saving ? '保存中…' : '存草稿'}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || publishing}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 26px', borderRadius: 11, border: 'none', background: primary, color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving || publishing ? 'not-allowed' : 'pointer', opacity: saving || publishing ? 0.7 : 1, boxShadow: `0 4px 14px ${isManga ? 'rgba(233,30,140,0.35)' : 'rgba(99,102,241,0.3)'}`, transition: 'opacity 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { if (!saving && !publishing) (e.currentTarget as HTMLButtonElement).style.background = primaryHover; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = primary; }}
          >
            <SendIcon size={15} />{publishing ? '发布中…' : '发布文章'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ═══════════════ Sub-components ════════════════════════════════════════════ */

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      data-px-slot
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', ...style }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
      {children}
    </div>
  );
}
