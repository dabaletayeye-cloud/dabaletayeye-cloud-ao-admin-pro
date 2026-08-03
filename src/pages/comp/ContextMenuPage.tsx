import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  MousePointer2Icon,
  CopyIcon,
  ClipboardPasteIcon,
  PencilLineIcon,
  Trash2Icon,
  CheckIcon,
  FileIcon,
  FolderIcon,
  ImageIcon,
  FileTextIcon,
  FileCodeIcon,
  StarIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface MenuState {
  visible: boolean;
  x: number;
  y: number;
  targetId: number | null;
}

interface FileItem {
  id: number;
  name: string;
  type: 'folder' | 'image' | 'text' | 'code' | 'star';
  size: string;
  modified: string;
}

// ─────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────
const FILE_ITEMS: FileItem[] = [
  { id: 1, name: '项目文档', type: 'folder', size: '—', modified: '2025-03-10' },
  { id: 2, name: '设计稿.png', type: 'image', size: '2.4 MB', modified: '2025-04-01' },
  { id: 3, name: 'README.md', type: 'text', size: '12 KB', modified: '2025-04-15' },
  { id: 4, name: 'index.tsx', type: 'code', size: '8 KB', modified: '2025-05-02' },
  { id: 5, name: '收藏夹', type: 'star', size: '—', modified: '2025-02-28' },
  { id: 6, name: 'report.md', type: 'text', size: '34 KB', modified: '2025-05-10' },
];

const ICON_MAP: Record<FileItem['type'], React.ReactNode> = {
  folder: <FolderIcon size={18} />,
  image: <ImageIcon size={18} />,
  text: <FileTextIcon size={18} />,
  code: <FileCodeIcon size={18} />,
  star: <StarIcon size={18} />,
};

const ICON_COLOR: Record<FileItem['type'], string> = {
  folder: 'var(--chart-3)',
  image: 'var(--chart-2)',
  text: 'var(--chart-1)',
  code: 'var(--theme-primary)',
  star: 'var(--chart-5)',
};

// ─────────────────────────────────────────────
// Menu items definition
// ─────────────────────────────────────────────
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  dividerBefore?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'copy',    label: '复制',   icon: <CopyIcon size={14} />,          shortcut: '⌘C' },
  { id: 'paste',   label: '粘贴',   icon: <ClipboardPasteIcon size={14} />, shortcut: '⌘V' },
  { id: 'rename',  label: '重命名', icon: <PencilLineIcon size={14} />,     shortcut: 'F2' },
  { id: 'delete',  label: '删除',   icon: <Trash2Icon size={14} />,         shortcut: '⌫', danger: true, dividerBefore: true },
];

const MENU_WIDTH = 196;
const MENU_HEIGHT = 176; // approximate max height

// ─────────────────────────────────────────────
// Toast notification (inline, no external dep beyond sonner already in App)
// ─────────────────────────────────────────────
interface ToastItem {
  id: number;
  label: string;
  action: string;
  danger: boolean;
}

// ─────────────────────────────────────────────
// ContextMenu Component
// ─────────────────────────────────────────────
interface ContextMenuProps {
  menu: MenuState;
  onClose: () => void;
  onAction: (actionId: string, targetId: number | null) => void;
}

function ContextMenu({ menu, onClose, onAction }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Compute flipped position to avoid viewport overflow
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const adjustedX = menu.x + MENU_WIDTH > vw - 8 ? menu.x - MENU_WIDTH : menu.x;
  const adjustedY = menu.y + MENU_HEIGHT > vh - 8 ? menu.y - MENU_HEIGHT : menu.y;

  const handleItemClick = (item: MenuItem) => {
    onAction(item.id, menu.targetId);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      data-cmp="ContextMenu"
      style={{
        position: 'fixed',
        top: adjustedY,
        left: adjustedX,
        width: MENU_WIDTH,
        zIndex: 9999,
        background: 'var(--popover)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '6px 0',
        boxShadow:
          '0 4px 6px -1px color-mix(in srgb, var(--foreground) 8%, transparent), 0 16px 40px -4px color-mix(in srgb, var(--foreground) 14%, transparent)',
        opacity: menu.visible ? 1 : 0,
        transform: menu.visible ? 'scale(1)' : 'scale(0.94)',
        transformOrigin: `${adjustedX < menu.x ? 'right' : 'left'} ${adjustedY < menu.y ? 'bottom' : 'top'}`,
        transition: 'opacity 0.15s ease, transform 0.15s cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: menu.visible ? 'auto' : 'none',
        userSelect: 'none',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {MENU_ITEMS.map((item) => (
        <React.Fragment key={item.id}>
          {item.dividerBefore && (
            <div
              style={{
                height: 1,
                margin: '5px 10px',
                background: 'var(--border)',
              }}
            />
          )}
          <div
            onClick={() => handleItemClick(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 14px',
              cursor: 'pointer',
              borderRadius: 7,
              margin: '0 4px',
              color: item.danger ? 'var(--destructive)' : 'var(--popover-foreground)',
              fontSize: 13,
              fontWeight: 450,
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = item.danger
                ? 'color-mix(in srgb, var(--destructive) 9%, transparent)'
                : 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <span
              style={{
                flexShrink: 0,
                opacity: item.danger ? 1 : 0.75,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {item.icon}
            </span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
              <span
                style={{
                  fontSize: 11,
                  color: item.danger ? 'color-mix(in srgb, var(--destructive) 60%, transparent)' : 'var(--muted-foreground)',
                  fontFamily: 'monospace',
                  letterSpacing: '0.02em',
                }}
              >
                {item.shortcut}
              </span>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Demo Zone
// ─────────────────────────────────────────────
function DemoZone() {
  const [menu, setMenu] = useState<MenuState>({ visible: false, x: 0, y: 0, targetId: null });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>(FILE_ITEMS);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const zoneRef = useRef<HTMLDivElement>(null);
  const toastCounterRef = useRef(0);

  const pushToast = useCallback((label: string, action: string, danger = false) => {
    const id = ++toastCounterRef.current;
    setToasts((prev) => [...prev.slice(-3), { id, label, action, danger }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const closeMenu = useCallback(() => {
    setMenu((m) => ({ ...m, visible: false }));
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, targetId: number | null) => {
      e.preventDefault();
      e.stopPropagation();
      setMenu({ visible: true, x: e.clientX, y: e.clientY, targetId });
    },
    [],
  );

  const handleAction = useCallback(
    (actionId: string, targetId: number | null) => {
      const file = files.find((f) => f.id === targetId);
      const name = file?.name ?? '该项目';

      if (actionId === 'copy') {
        pushToast(name, '已复制');
      } else if (actionId === 'paste') {
        pushToast(name, '已粘贴');
      } else if (actionId === 'rename' && targetId !== null) {
        setRenamingId(targetId);
        setRenameValue(file?.name ?? '');
      } else if (actionId === 'delete' && targetId !== null) {
        setFiles((prev) => prev.filter((f) => f.id !== targetId));
        pushToast(name, '已删除', true);
      }
    },
    [files, pushToast],
  );

  // Close menu on click outside
  useEffect(() => {
    const handler = () => closeMenu();
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeMenu]);

  // Close menu on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeMenu]);

  const confirmRename = (id: number) => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      setFiles((prev) => prev.map((f) => f.id === id ? { ...f, name: trimmed } : f));
      pushToast(trimmed, '已重命名');
    }
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Demo area */}
      <div
        ref={zoneRef}
        onContextMenu={(e) => handleContextMenu(e, null)}
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 20,
          padding: '28px 24px',
          background: 'var(--card)',
          cursor: 'context-menu',
          minHeight: 340,
        }}
      >
        {/* Zone label */}
        <div
          className="flex items-center gap-2 mb-6"
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)',
              color: 'var(--theme-primary)',
            }}
          >
            <MousePointer2Icon size={15} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
              右键菜单演示区域
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 1 }}>
              在文件行或空白处单击右键触发菜单
            </div>
          </div>
        </div>

        {/* File list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {files.map((file) => {
            const isRenaming = renamingId === file.id;
            return (
              <div
                key={file.id}
                onContextMenu={(e) => handleContextMenu(e, file.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'var(--background)',
                  cursor: 'context-menu',
                  transition: 'border-color 0.15s, background 0.15s',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'color-mix(in srgb, var(--theme-primary) 40%, var(--border))';
                  (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--theme-primary) 3%, var(--background))';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--background)';
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `color-mix(in srgb, ${ICON_COLOR[file.type]} 12%, transparent)`,
                    color: ICON_COLOR[file.type],
                  }}
                >
                  {ICON_MAP[file.type]}
                </div>

                {/* Name / rename input */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isRenaming ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmRename(file.id);
                        if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                      }}
                      onBlur={() => confirmRename(file.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--foreground)',
                        background: 'var(--input)',
                        border: '1.5px solid var(--theme-primary)',
                        borderRadius: 7,
                        padding: '3px 8px',
                        outline: 'none',
                        width: '100%',
                        maxWidth: 240,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--foreground)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {file.name}
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    fontSize: 11,
                    color: 'var(--muted-foreground)',
                  }}
                >
                  <span style={{ width: 52, textAlign: 'right' }}>{file.size}</span>
                  <span style={{ width: 80, textAlign: 'right' }}>{file.modified}</span>
                </div>
              </div>
            );
          })}

          {files.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-10 gap-3"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <FileIcon size={32} strokeWidth={1.2} />
              <span style={{ fontSize: 13 }}>所有文件已删除，右键空白处仍可触发菜单</span>
            </div>
          )}
        </div>

        {/* Zone hint */}
        <div
          className="flex items-center justify-center mt-6 gap-2"
          style={{
            borderTop: '1px dashed var(--border)',
            paddingTop: 14,
            color: 'var(--muted-foreground)',
            fontSize: 11,
            pointerEvents: 'none',
          }}
        >
          <MousePointer2Icon size={11} />
          <span>在此区域任意位置点击右键即可触发菜单 · 菜单会自动避开窗口边缘</span>
        </div>
      </div>

      {/* Context menu overlay (always in DOM, toggled by opacity/pointer-events) */}
      <ContextMenu menu={menu} onClose={closeMenu} onAction={handleAction} />

      {/* Toast stack */}
      <div
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderRadius: 12,
              background: t.danger
                ? 'color-mix(in srgb, var(--destructive) 10%, var(--card))'
                : 'var(--card)',
              border: t.danger
                ? '1px solid color-mix(in srgb, var(--destructive) 30%, var(--border))'
                : '1px solid var(--border)',
              boxShadow: '0 4px 20px color-mix(in srgb, var(--foreground) 12%, transparent)',
              fontSize: 13,
              color: t.danger ? 'var(--destructive)' : 'var(--foreground)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              animation: 'slideUpFade 0.25s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: t.danger
                  ? 'color-mix(in srgb, var(--destructive) 18%, transparent)'
                  : 'color-mix(in srgb, var(--theme-primary) 14%, transparent)',
                color: t.danger ? 'var(--destructive)' : 'var(--theme-primary)',
                flexShrink: 0,
              }}
            >
              <CheckIcon size={11} strokeWidth={2.5} />
            </span>
            <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>
              <strong style={{ color: t.danger ? 'var(--destructive)' : 'var(--foreground)', marginRight: 4 }}>
                {t.label}
              </strong>
              {t.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Feature description cards
// ─────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  desc: string;
}

function FeatureCard({ icon, color, title, desc }: FeatureCardProps) {
  return (
    <div
      style={{
        flex: '1 1 200px',
        padding: '16px 18px',
        borderRadius: 14,
        border: '1.5px solid var(--border)',
        background: 'var(--card)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
          color,
          marginTop: 1,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)', lineHeight: 1.55 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page root
// ─────────────────────────────────────────────
export default function ContextMenuPage() {
  return (
    <AdminLayout>
      <div
        data-cmp="ContextMenuPage"
        className="p-6 min-h-full"
        style={{ background: 'var(--background)' }}
      >
        {/* ── Page Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--theme-primary)', color: 'var(--primary-foreground)' }}
            >
              <MousePointer2Icon size={18} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              右键菜单
            </h1>
          </div>
          <p className="text-sm ml-12" style={{ color: 'var(--muted-foreground)' }}>
            自定义 Context Menu 实现演示，支持窗口边缘自动翻转，零依赖
          </p>
        </div>

        {/* ── Section: Demo ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{
                width: 4,
                height: 18,
                borderRadius: 3,
                background: 'var(--theme-primary)',
              }}
            />
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              交互演示
            </span>
          </div>
          <DemoZone />
        </section>

        {/* ── Section: Feature descriptions ── */}
        <section className="mb-2">
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{
                width: 4,
                height: 18,
                borderRadius: 3,
                background: 'var(--theme-primary)',
              }}
            />
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              功能特性
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <FeatureCard
              icon={<MousePointer2Icon size={16} />}
              color="var(--theme-primary)"
              title="自定义菜单样式"
              desc="带图标、快捷键提示、分割线，删除项使用危险色强调，视觉层次清晰"
            />
            <FeatureCard
              icon={<CopyIcon size={16} />}
              color="var(--chart-1)"
              title="多种操作指令"
              desc="复制、粘贴、重命名、删除，支持内联重命名输入框，操作结果即时反馈"
            />
            <FeatureCard
              icon={<PencilLineIcon size={16} />}
              color="var(--chart-2)"
              title="边缘溢出检测"
              desc="计算菜单与视口边界距离，向右超出则向左翻转，向下超出则向上翻转"
            />
            <FeatureCard
              icon={<Trash2Icon size={16} />}
              color="var(--destructive)"
              title="点击消失逻辑"
              desc="在菜单外任意位置单击、按 Esc 键均可关闭，菜单内点击执行操作后自动关闭"
            />
          </div>
        </section>
      </div>

      {/* slideUpFade animation */}
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AdminLayout>
  );
}
