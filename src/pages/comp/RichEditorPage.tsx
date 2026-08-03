import { useState, useRef, useCallback, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  CodeIcon,
  ImageIcon,
  Undo2Icon,
  Redo2Icon,
  SeparatorHorizontalIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  TypeIcon,
  EyeIcon,
  CodeXmlIcon,
} from 'lucide-react';

// ─── Toolbar button ──────────────────────────────────────────────────────────
function ToolBtn({
  icon,
  title,
  active = false,
  onMouseDown,
}: {
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      title={title}
      onMouseDown={onMouseDown}
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        border: active ? '1.5px solid var(--primary)' : '1px solid transparent',
        background: active
          ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
          : 'transparent',
        color: active ? 'var(--primary)' : 'var(--foreground)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.12s',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.background =
            'var(--accent)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }
      }}
    >
      {icon}
    </button>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function ToolDivider() {
  return (
    <div
      style={{
        width: 1,
        height: 20,
        background: 'var(--border)',
        margin: '0 4px',
        flexShrink: 0,
      }}
    />
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function exec(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  // count CJK + latin words
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const latin = (text.match(/[a-zA-Z0-9]+/g) || []).length;
  return cjk + latin;
}

function countChars(html: string): number {
  return html.replace(/<[^>]+>/g, '').replace(/\s/g, '').length;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RichEditorPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState('<p>在这里开始输入内容…</p>');
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [previewTab, setPreviewTab] = useState<'html' | 'preview'>('preview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // sync active formats
  const refreshFormats = useCallback(() => {
    const cmds = ['bold', 'italic', 'underline'];
    const active = new Set<string>();
    cmds.forEach(cmd => {
      if (document.queryCommandState(cmd)) active.add(cmd);
    });
    setActiveFormats(active);
  }, []);

  const syncHtml = useCallback(() => {
    if (editorRef.current) {
      setHtml(editorRef.current.innerHTML);
    }
    refreshFormats();
  }, [refreshFormats]);

  // initialise content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevent = (e: React.MouseEvent) => e.preventDefault();

  const cmd = (command: string, value?: string) => (e: React.MouseEvent) => {
    prevent(e);
    exec(command, value);
    editorRef.current?.focus();
    syncHtml();
  };

  const insertBlock = (tag: string) => (e: React.MouseEvent) => {
    prevent(e);
    exec('formatBlock', tag);
    editorRef.current?.focus();
    syncHtml();
  };

  const handleImage = (e: React.MouseEvent) => {
    prevent(e);
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      editorRef.current?.focus();
      exec('insertImage', src);
      syncHtml();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const words = countWords(html);
  const chars = countChars(html);

  // toolbar groups
  const toolbarGroups: Array<Array<{ icon: React.ReactNode; title: string; action: (e: React.MouseEvent) => void; key?: string }>> = [
    [
      { icon: <Undo2Icon size={15} />, title: '撤销 (Ctrl+Z)', action: cmd('undo') },
      { icon: <Redo2Icon size={15} />, title: '重做 (Ctrl+Y)', action: cmd('redo') },
    ],
    [
      { icon: <BoldIcon size={15} />, title: '加粗 (Ctrl+B)', action: cmd('bold'), key: 'bold' },
      { icon: <ItalicIcon size={15} />, title: '斜体 (Ctrl+I)', action: cmd('italic'), key: 'italic' },
      { icon: <UnderlineIcon size={15} />, title: '下划线 (Ctrl+U)', action: cmd('underline'), key: 'underline' },
    ],
    [
      { icon: <Heading1Icon size={15} />, title: '标题 H1', action: insertBlock('h1') },
      { icon: <Heading2Icon size={15} />, title: '标题 H2', action: insertBlock('h2') },
      { icon: <Heading3Icon size={15} />, title: '标题 H3', action: insertBlock('h3') },
      { icon: <TypeIcon size={15} />, title: '正文段落', action: insertBlock('p') },
    ],
    [
      { icon: <AlignLeftIcon size={15} />, title: '左对齐', action: cmd('justifyLeft') },
      { icon: <AlignCenterIcon size={15} />, title: '居中', action: cmd('justifyCenter') },
      { icon: <AlignRightIcon size={15} />, title: '右对齐', action: cmd('justifyRight') },
    ],
    [
      { icon: <ListIcon size={15} />, title: '无序列表', action: cmd('insertUnorderedList') },
      { icon: <ListOrderedIcon size={15} />, title: '有序列表', action: cmd('insertOrderedList') },
    ],
    [
      { icon: <QuoteIcon size={15} />, title: '引用块', action: insertBlock('blockquote') },
      { icon: <CodeIcon size={15} />, title: '代码块', action: insertBlock('pre') },
      { icon: <SeparatorHorizontalIcon size={15} />, title: '分隔线', action: (e) => { prevent(e); exec('insertHorizontalRule'); syncHtml(); } },
    ],
    [
      { icon: <ImageIcon size={15} />, title: '插入图片', action: handleImage },
    ],
  ];

  return (
    <AdminLayout>
      <div
        data-cmp="RichEditorPage"
        style={{
          minHeight: '100%',
          background: 'var(--background)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* page header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>
            富文本编辑器
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            基于 contentEditable 实现，支持格式化、图片插入、HTML 预览
          </p>
        </div>

        {/* editor card */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* ── Toolbar ── */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 2,
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--background)',
            }}
          >
            {toolbarGroups.map((group, gi) => (
              <div
                key={gi}
                style={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                {gi > 0 && <ToolDivider />}
                {group.map((item, ii) => (
                  <ToolBtn
                    key={ii}
                    icon={item.icon}
                    title={item.title}
                    active={item.key ? activeFormats.has(item.key) : false}
                    onMouseDown={item.action}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* ── Content editable area ── */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncHtml}
            onKeyUp={refreshFormats}
            onMouseUp={refreshFormats}
            style={{
              minHeight: 340,
              padding: '20px 24px',
              outline: 'none',
              fontSize: 15,
              lineHeight: 1.8,
              color: 'var(--foreground)',
              background: 'var(--card)',
            }}
            // inject editor styles via global class below
            className="rich-editor-content"
          />

          {/* ── Status bar ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              borderTop: '1px solid var(--border)',
              background: 'var(--background)',
              fontSize: 12,
              color: 'var(--muted-foreground)',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: 16 }}>
              <span>字数：<strong style={{ color: 'var(--foreground)' }}>{words}</strong></span>
              <span>字符：<strong style={{ color: 'var(--foreground)' }}>{chars}</strong></span>
            </div>
            <span style={{ fontSize: 11, opacity: 0.6 }}>
              支持 Ctrl+B / Ctrl+I / Ctrl+U / Ctrl+Z / Ctrl+Y
            </span>
          </div>
        </div>

        {/* ── HTML / Preview panel ── */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* tab bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              padding: '0 16px',
              background: 'var(--background)',
            }}
          >
            {([
              { key: 'preview', icon: <EyeIcon size={13} />, label: '渲染预览' },
              { key: 'html',    icon: <CodeXmlIcon size={13} />, label: 'HTML 源码' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setPreviewTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 14px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: previewTab === tab.key ? 700 : 400,
                  color:
                    previewTab === tab.key
                      ? 'var(--primary)'
                      : 'var(--muted-foreground)',
                  borderBottom:
                    previewTab === tab.key
                      ? '2px solid var(--primary)'
                      : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* preview content */}
          <div style={{ padding: '20px 24px', minHeight: 140 }}>
            <div className={previewTab === 'html' ? '' : 'hidden'}>
              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: 'var(--foreground)',
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                }}
              >
                {html || '<p></p>'}
              </pre>
            </div>
            <div
              className={previewTab === 'preview' ? 'rich-preview-content' : 'hidden rich-preview-content'}
              dangerouslySetInnerHTML={{ __html: html }}
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>

        {/* hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
      </div>

      {/* scoped editor styles */}
      <style>{`
        .rich-editor-content h1 { font-size: 2em; font-weight: 800; margin: 0.6em 0 0.3em; color: var(--foreground); }
        .rich-editor-content h2 { font-size: 1.5em; font-weight: 700; margin: 0.6em 0 0.3em; color: var(--foreground); }
        .rich-editor-content h3 { font-size: 1.2em; font-weight: 600; margin: 0.5em 0 0.2em; color: var(--foreground); }
        .rich-editor-content p  { margin: 0.4em 0; }
        .rich-editor-content ul { padding-left: 1.6em; margin: 0.4em 0; list-style: disc; }
        .rich-editor-content ol { padding-left: 1.6em; margin: 0.4em 0; list-style: decimal; }
        .rich-editor-content blockquote {
          border-left: 4px solid var(--primary);
          margin: 0.6em 0; padding: 8px 16px;
          background: color-mix(in srgb, var(--primary) 6%, transparent);
          border-radius: 0 8px 8px 0;
          color: var(--muted-foreground);
          font-style: italic;
        }
        .rich-editor-content pre {
          background: var(--muted);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 16px;
          font-family: monospace; font-size: 13px;
          margin: 0.5em 0; overflow-x: auto;
          white-space: pre-wrap;
        }
        .rich-editor-content hr { border: none; border-top: 1px solid var(--border); margin: 1em 0; }
        .rich-editor-content img { max-width: 100%; border-radius: 8px; margin: 4px 0; }

        .rich-preview-content h1 { font-size: 2em; font-weight: 800; margin: 0.6em 0 0.3em; color: var(--foreground); }
        .rich-preview-content h2 { font-size: 1.5em; font-weight: 700; margin: 0.6em 0 0.3em; color: var(--foreground); }
        .rich-preview-content h3 { font-size: 1.2em; font-weight: 600; margin: 0.5em 0 0.2em; color: var(--foreground); }
        .rich-preview-content p  { margin: 0.4em 0; }
        .rich-preview-content ul { padding-left: 1.6em; margin: 0.4em 0; list-style: disc; }
        .rich-preview-content ol { padding-left: 1.6em; margin: 0.4em 0; list-style: decimal; }
        .rich-preview-content blockquote {
          border-left: 4px solid var(--primary);
          margin: 0.6em 0; padding: 8px 16px;
          background: color-mix(in srgb, var(--primary) 6%, transparent);
          border-radius: 0 8px 8px 0;
          color: var(--muted-foreground);
          font-style: italic;
        }
        .rich-preview-content pre {
          background: var(--muted);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 16px;
          font-family: monospace; font-size: 13px;
          margin: 0.5em 0; overflow-x: auto;
          white-space: pre-wrap;
        }
        .rich-preview-content hr { border: none; border-top: 1px solid var(--border); margin: 1em 0; }
        .rich-preview-content img { max-width: 100%; border-radius: 8px; margin: 4px 0; }
      `}</style>
    </AdminLayout>
  );
}
