import React, { useState, useRef, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  HomeIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
  XIcon,
  CheckIcon,
  MinusIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  ImageIcon,
  SettingsIcon,
  UsersIcon,
  BarChart2Icon,
  ShoppingCartIcon,
  BookOpenIcon,
  CheckSquareIcon,
} from 'lucide-react';

// ─── accent helper ─────────────────────────────────────────────────────────────
function useAccent() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  return isManga ? '#E91E8C' : 'var(--primary)';
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-cmp="Section"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow:
          'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,8px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.06))',
      }}
    >
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. TABS — basic / card / closable
// ═══════════════════════════════════════════════════════════════

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  closable?: boolean;
  content: React.ReactNode;
}

// --- Basic Tabs ---
const BASIC_TABS: TabItem[] = [
  {
    key: 'overview',
    label: '概览',
    icon: <BarChart2Icon size={13} />,
    content: (
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
        <strong style={{ color: 'var(--foreground)' }}>概览面板</strong>
        <br />
        这里展示系统整体数据概览：DAU 12,840、MAU 384,200、新增注册 2,340、
        订单总量 98,432。可在各子标签中查看更详细的模块数据。
      </div>
    ),
  },
  {
    key: 'users',
    label: '用户',
    icon: <UsersIcon size={13} />,
    content: (
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
        <strong style={{ color: 'var(--foreground)' }}>用户管理</strong>
        <br />
        当前注册用户 128,540 人，活跃用户 34,210 人，本月新增 2,340 人。
        用户留存率 68.4%，7日留存 42.1%。
      </div>
    ),
  },
  {
    key: 'orders',
    label: '订单',
    icon: <ShoppingCartIcon size={13} />,
    content: (
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
        <strong style={{ color: 'var(--foreground)' }}>订单中心</strong>
        <br />
        本月订单 34,921 笔，完成率 91.2%，退款率 2.8%，
        客单价均值 ¥384，GMV 合计 ¥13,409,664。
      </div>
    ),
  },
  {
    key: 'content',
    label: '内容',
    icon: <BookOpenIcon size={13} />,
    content: (
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
        <strong style={{ color: 'var(--foreground)' }}>内容管理</strong>
        <br />
        已发布文章 4,320 篇，待审核 128 篇，草稿 560 篇。
        本月 PV 2,140,000，UV 384,200，平均停留时长 3m42s。
      </div>
    ),
  },
];

function BasicTabs({ accent }: { accent: string }) {
  const [active, setActive] = useState('overview');
  const cur = BASIC_TABS.find((t) => t.key === active) ?? BASIC_TABS[0];
  return (
    <div data-cmp="BasicTabs">
      {/* tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '2px solid var(--border)',
          marginBottom: 16,
        }}
      >
        {BASIC_TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? accent : 'var(--muted-foreground)',
                borderBottom: isActive ? `2px solid ${accent}` : '2px solid transparent',
                marginBottom: -2,
                transition: 'all .15s',
                whiteSpace: 'nowrap',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>
      <div style={{ minHeight: 72 }}>{cur.content}</div>
    </div>
  );
}

// --- Card Tabs ---
const CARD_TABS: TabItem[] = [
  {
    key: 'design',
    label: '设计规范',
    content: (
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
        定义组件颜色、间距、圆角、字体规范，统一全局视觉语言。
        色板采用 HSL 变量体系，支持亮色/暗色双模式切换。
      </div>
    ),
  },
  {
    key: 'component',
    label: '组件文档',
    content: (
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
        每个组件包含 Props 说明、示例代码、交互规范与可访问性指南。
        组件库当前共 48 个基础组件，12 个业务组件。
      </div>
    ),
  },
  {
    key: 'pattern',
    label: '设计模式',
    content: (
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
        收录空状态、加载态、错误页、表单校验、权限控制等常见交互模式，
        提供标准解决方案与使用场景说明。
      </div>
    ),
  },
  {
    key: 'resource',
    label: '资源下载',
    content: (
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
        提供 Figma 设计源文件、图标库 SVG 包、主题 Token JSON 导出，
        持续更新维护，支持 Design Token 同步。
      </div>
    ),
  },
];

function CardTabs({ accent }: { accent: string }) {
  const [active, setActive] = useState('design');
  const cur = CARD_TABS.find((t) => t.key === active) ?? CARD_TABS[0];
  return (
    <div data-cmp="CardTabs">
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {CARD_TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              style={{
                padding: '6px 16px',
                border: `1px solid ${isActive ? accent : 'var(--border)'}`,
                borderRadius: 8,
                background: isActive
                  ? `color-mix(in srgb, ${accent} 10%, transparent)`
                  : 'var(--muted)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? accent : 'var(--muted-foreground)',
                transition: 'all .15s',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div
        style={{
          minHeight: 60,
          padding: '12px 16px',
          background: 'var(--muted)',
          borderRadius: 8,
        }}
      >
        {cur.content}
      </div>
    </div>
  );
}

// --- Closable Tabs ---
let _closableId = 5;
const CLOSABLE_INIT: (TabItem & { id: number })[] = [
  { id: 1, key: 'tab1', label: '工作台', closable: false, content: <span style={{fontSize:13,color:'var(--muted-foreground)'}}>工作台内容区域，该标签不可关闭。</span> },
  { id: 2, key: 'tab2', label: '数据分析', closable: true, content: <span style={{fontSize:13,color:'var(--muted-foreground)'}}>数据分析面板，可关闭此标签。</span> },
  { id: 3, key: 'tab3', label: '内容管理', closable: true, content: <span style={{fontSize:13,color:'var(--muted-foreground)'}}>内容管理面板，可关闭此标签。</span> },
  { id: 4, key: 'tab4', label: '营销中心', closable: true, content: <span style={{fontSize:13,color:'var(--muted-foreground)'}}>营销中心面板，可关闭此标签。</span> },
];

function ClosableTabs({ accent }: { accent: string }) {
  const [tabs, setTabs] = useState(CLOSABLE_INIT);
  const [active, setActive] = useState('tab1');

  const close = (key: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.key !== key);
      if (active === key && next.length > 0) {
        setActive(next[next.length - 1].key);
      }
      return next;
    });
  };

  const addTab = () => {
    const id = ++_closableId;
    const key = `tab${id}`;
    setTabs((prev) => [
      ...prev,
      { id, key, label: `新标签 ${id}`, closable: true, content: <span style={{fontSize:13,color:'var(--muted-foreground)'}}>新标签 {id} 内容区域。</span> },
    ]);
    setActive(key);
  };

  const cur = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div data-cmp="ClosableTabs">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 0,
          borderBottom: '2px solid var(--border)',
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <div
              key={t.key}
              onClick={() => setActive(t.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px 7px 14px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? accent : 'var(--muted-foreground)',
                borderBottom: isActive ? `2px solid ${accent}` : '2px solid transparent',
                marginBottom: -2,
                transition: 'color .15s',
                userSelect: 'none',
                background: isActive ? `color-mix(in srgb, ${accent} 6%, transparent)` : 'transparent',
                borderRadius: '6px 6px 0 0',
              }}
            >
              {t.label}
              {t.closable && (
                <button
                  onClick={(e) => { e.stopPropagation(); close(t.key); }}
                  style={{
                    width: 16, height: 16, borderRadius: '50%', border: 'none',
                    background: isActive ? `color-mix(in srgb, ${accent} 20%, transparent)` : 'var(--muted)',
                    color: isActive ? accent : 'var(--muted-foreground)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                    transition: 'background .15s',
                  }}
                >
                  <XIcon size={9} />
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={addTab}
          style={{
            padding: '7px 12px', border: 'none', background: 'transparent',
            cursor: 'pointer', fontSize: 18, color: 'var(--muted-foreground)',
            lineHeight: 1, marginBottom: -2,
          }}
          title="新增标签"
        >
          +
        </button>
      </div>
      <div style={{ minHeight: 48 }}>{cur?.content}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. BREADCRUMB
// ═══════════════════════════════════════════════════════════════

interface Crumb { label: string; icon?: React.ReactNode; }

const BREADCRUMB_SETS: Crumb[][] = [
  [
    { label: '首页', icon: <HomeIcon size={12} /> },
    { label: '组件中心' },
    { label: '导航组件' },
  ],
  [
    { label: '首页', icon: <HomeIcon size={12} /> },
    { label: '内容管理', icon: <FileTextIcon size={12} /> },
    { label: '文章列表', icon: <BookOpenIcon size={12} /> },
    { label: '编辑文章' },
  ],
  [
    { label: '首页', icon: <HomeIcon size={12} /> },
    { label: '系统设置', icon: <SettingsIcon size={12} /> },
    { label: '权限管理', icon: <UsersIcon size={12} /> },
    { label: '角色配置' },
    { label: '新增角色' },
  ],
];

function Breadcrumb({ items, accent, separator = 'slash' }: {
  items: Crumb[];
  accent: string;
  separator?: 'slash' | 'chevron' | 'dot';
}) {
  const sepEl = separator === 'chevron'
    ? <ChevronRightIcon size={12} style={{ color: 'var(--muted-foreground)' }} />
    : separator === 'dot'
    ? <span style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1 }}>·</span>
    : <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>/</span>;

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 13,
                color: isLast ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: isLast ? 600 : 400,
                cursor: isLast ? 'default' : 'pointer',
                padding: '2px 4px',
                borderRadius: 4,
                transition: 'color .15s, background .15s',
              }}
              onMouseEnter={(e) => {
                if (!isLast) (e.currentTarget as HTMLSpanElement).style.color = accent;
              }}
              onMouseLeave={(e) => {
                if (!isLast) (e.currentTarget as HTMLSpanElement).style.color = 'var(--muted-foreground)';
              }}
            >
              {item.icon}{item.label}
            </span>
            {!isLast && sepEl}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. PAGINATION
// ═══════════════════════════════════════════════════════════════

function usePagination(total: number, initPage = 1, initPageSize = 10) {
  const [page, setPage] = useState(initPage);
  const [pageSize, setPageSize] = useState(initPageSize);
  const totalPages = Math.ceil(total / pageSize);
  const safeGo = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));
  return { page, pageSize, totalPages, safeGo, setPageSize };
}

function getPagerRange(page: number, total: number, delta = 2): (number | '...')[] {
  const range: (number | '...')[] = [];
  const left = Math.max(2, page - delta);
  const right = Math.min(total - 1, page + delta);
  range.push(1);
  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('...');
  if (total > 1) range.push(total);
  return range;
}

// Basic pagination
function BasicPagination({ accent, total = 256, label = '基础分页' }: {
  accent: string; total?: number; label?: string;
}) {
  const { page, pageSize, totalPages, safeGo } = usePagination(total, 1, 10);
  const pages = getPagerRange(page, totalPages);

  const btnBase: React.CSSProperties = {
    minWidth: 32, height: 32, padding: '0 6px', borderRadius: 7,
    border: '1px solid var(--border)', background: 'transparent',
    cursor: 'pointer', fontSize: 13, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
    color: 'var(--foreground)', transition: 'all .15s',
  };
  const activeStyle: React.CSSProperties = {
    ...btnBase, background: accent, color: '#fff', borderColor: accent, fontWeight: 700,
  };
  const disabledStyle: React.CSSProperties = {
    ...btnBase, opacity: 0.35, cursor: 'not-allowed',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
        <button
          onClick={() => safeGo(page - 1)}
          disabled={page === 1}
          style={page === 1 ? disabledStyle : btnBase}
        >
          <ChevronLeftIcon size={14} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} style={{ width: 32, textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>…</span>
          ) : (
            <button key={p} onClick={() => safeGo(p as number)} style={p === page ? activeStyle : btnBase}>
              {p}
            </button>
          )
        )}
        <button
          onClick={() => safeGo(page + 1)}
          disabled={page === totalPages}
          style={page === totalPages ? disabledStyle : btnBase}
        >
          <ChevronRightIcon size={14} />
        </button>
      </div>
    </div>
  );
}

// Mini pagination with page-size selector + jumper
function FullPagination({ accent, total = 1024 }: { accent: string; total?: number }) {
  const { page, pageSize, totalPages, safeGo, setPageSize } = usePagination(total, 3, 20);
  const pages = getPagerRange(page, totalPages, 1);
  const [jumpVal, setJumpVal] = useState('');

  const btnBase: React.CSSProperties = {
    minWidth: 32, height: 32, padding: '0 6px', borderRadius: 7,
    border: '1px solid var(--border)', background: 'transparent',
    cursor: 'pointer', fontSize: 13, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
    color: 'var(--foreground)', transition: 'all .15s',
  };
  const activeStyle: React.CSSProperties = {
    ...btnBase, background: accent, color: '#fff', borderColor: accent, fontWeight: 700,
  };
  const disabledStyle: React.CSSProperties = { ...btnBase, opacity: 0.35, cursor: 'not-allowed' };

  const handleJump = () => {
    const n = parseInt(jumpVal, 10);
    if (!isNaN(n)) safeGo(n);
    setJumpVal('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>完整分页（含页码跳转 + 每页条数）</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {/* total */}
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginRight: 4 }}>共 {total} 条</span>
        {/* page size */}
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); safeGo(1); }}
          style={{ height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--card)', color: 'var(--foreground)', fontSize: 12, cursor: 'pointer' }}
        >
          {[10, 20, 50, 100].map((s) => <option key={s} value={s}>{s} 条/页</option>)}
        </select>
        {/* prev */}
        <button onClick={() => safeGo(page - 1)} disabled={page === 1} style={page === 1 ? disabledStyle : btnBase}>
          <ChevronLeftIcon size={14} />
        </button>
        {/* pages */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} style={{ width: 32, textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>…</span>
          ) : (
            <button key={p} onClick={() => safeGo(p as number)} style={p === page ? activeStyle : btnBase}>{p}</button>
          )
        )}
        {/* next */}
        <button onClick={() => safeGo(page + 1)} disabled={page === totalPages} style={page === totalPages ? disabledStyle : btnBase}>
          <ChevronRightIcon size={14} />
        </button>
        {/* jumper */}
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>跳至</span>
        <input
          value={jumpVal}
          onChange={(e) => setJumpVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJump()}
          placeholder={String(page)}
          style={{ width: 48, height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--card)', color: 'var(--foreground)', fontSize: 13, outline: 'none' }}
        />
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>页</span>
        <button
          onClick={handleJump}
          style={{ height: 32, padding: '0 12px', border: `1px solid ${accent}`, borderRadius: 7, background: 'transparent', color: accent, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          确定
        </button>
      </div>
    </div>
  );
}

// Simple "prev/next" pagination
function SimplePagination({ accent, total = 256 }: { accent: string; total?: number }) {
  const { page, totalPages, safeGo } = usePagination(total, 1, 10);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>简洁分页</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => safeGo(page - 1)}
          disabled={page === 1}
          style={{
            height: 32, padding: '0 14px', borderRadius: 7, border: '1px solid var(--border)',
            background: 'transparent', color: page === 1 ? 'var(--muted-foreground)' : 'var(--foreground)',
            fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          <ChevronLeftIcon size={13} /> 上一页
        </button>
        <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
          <span style={{ fontWeight: 700, color: accent }}>{page}</span> / {totalPages}
        </span>
        <button
          onClick={() => safeGo(page + 1)}
          disabled={page === totalPages}
          style={{
            height: 32, padding: '0 14px', borderRadius: 7, border: 'none',
            background: page === totalPages ? 'var(--muted)' : accent,
            color: page === totalPages ? 'var(--muted-foreground)' : '#fff',
            fontSize: 13, cursor: page === totalPages ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500,
          }}
        >
          下一页 <ChevronRightIcon size={13} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. DROPDOWN MENU
// ═══════════════════════════════════════════════════════════════

interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  divider?: boolean;
  danger?: boolean;
  disabled?: boolean;
  children?: DropdownItem[];
}

const DROPDOWN_ITEMS: DropdownItem[] = [
  { key: 'profile', label: '个人信息', icon: <UsersIcon size={13} /> },
  { key: 'settings', label: '账号设置', icon: <SettingsIcon size={13} /> },
  { key: 'analytics', label: '数据报告', icon: <BarChart2Icon size={13} /> },
  { key: 'div1', label: '', divider: true },
  { key: 'help', label: '帮助中心', icon: <BookOpenIcon size={13} /> },
  { key: 'disabled', label: '受限功能', icon: <CheckSquareIcon size={13} />, disabled: true },
  { key: 'div2', label: '', divider: true },
  { key: 'logout', label: '退出登录', icon: <XIcon size={13} />, danger: true },
];

const DROPDOWN_NESTED: DropdownItem[] = [
  {
    key: 'file', label: '文件操作', icon: <FileTextIcon size={13} />,
    children: [
      { key: 'new', label: '新建文件', icon: <FileTextIcon size={13} /> },
      { key: 'open', label: '打开文件', icon: <FolderOpenIcon size={13} /> },
      { key: 'save', label: '保存', icon: <CheckIcon size={13} /> },
    ],
  },
  {
    key: 'view', label: '视图设置', icon: <ImageIcon size={13} />,
    children: [
      { key: 'zoom-in', label: '放大', icon: <ChevronUpIcon size={13} /> },
      { key: 'zoom-out', label: '缩小', icon: <ChevronDownIcon size={13} /> },
    ],
  },
  { key: 'div', label: '', divider: true },
  { key: 'export', label: '导出', icon: <BarChart2Icon size={13} /> },
];

function DropdownMenu({
  trigger,
  items,
  accent,
  placement = 'bottom-start',
}: {
  trigger: React.ReactNode;
  items: DropdownItem[];
  accent: string;
  placement?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [subOpen, setSubOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSubOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen((o) => !o)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: placement === 'bottom-end' ? 'auto' : 0,
          right: placement === 'bottom-end' ? 0 : 'auto',
          minWidth: 168,
          background: 'var(--popover)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          zIndex: 999,
          padding: '4px 0',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(.97)',
          transition: 'all .15s cubic-bezier(.4,0,.2,1)',
          transformOrigin: 'top left',
        }}
      >
        {items.map((item) => {
          if (item.divider) {
            return <div key={item.key} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />;
          }
          const isHov = hovered === item.key;
          const hasSub = (item.children?.length ?? 0) > 0;
          const isSubOpen = subOpen === item.key;
          return (
            <div key={item.key} style={{ position: 'relative' }}>
              <div
                onMouseEnter={() => { if (!item.disabled) { setHovered(item.key); if (hasSub) setSubOpen(item.key); else setSubOpen(null); } }}
                onMouseLeave={() => { setHovered(null); if (!hasSub) setSubOpen(null); }}
                onClick={() => { if (!item.disabled && !hasSub) setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 14px', fontSize: 13,
                  color: item.disabled ? 'var(--muted-foreground)' : item.danger ? '#ef4444' : 'var(--foreground)',
                  background: isHov && !item.disabled ? (item.danger ? 'rgba(239,68,68,.07)' : `color-mix(in srgb, ${accent} 8%, transparent)`) : 'transparent',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  opacity: item.disabled ? 0.45 : 1,
                  transition: 'background .12s',
                  borderRadius: 6, margin: '0 4px',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{item.icon}{item.label}</span>
                {hasSub && <ChevronRightIcon size={12} style={{ opacity: 0.5 }} />}
              </div>
              {/* submenu */}
              {hasSub && (
                <div
                  onMouseEnter={() => { setSubOpen(item.key); setHovered(item.key); }}
                  onMouseLeave={() => { setSubOpen(null); setHovered(null); }}
                  style={{
                    position: 'absolute', left: '100%', top: 0,
                    minWidth: 140, background: 'var(--popover)',
                    border: '1px solid var(--border)', borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    padding: '4px 0', zIndex: 1000,
                    opacity: isSubOpen ? 1 : 0,
                    pointerEvents: isSubOpen ? 'all' : 'none',
                    transform: isSubOpen ? 'translateX(0)' : 'translateX(-6px)',
                    transition: 'all .15s',
                  }}
                >
                  {(item.children ?? []).map((sub) => (
                    <div
                      key={sub.key}
                      onClick={() => setOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 14px', fontSize: 13, color: 'var(--foreground)',
                        cursor: 'pointer', borderRadius: 6, margin: '0 4px',
                        transition: 'background .12s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = `color-mix(in srgb, ${accent} 8%, transparent)`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      {sub.icon}{sub.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TriggerBtn({ label, accent }: { label: string; accent: string }) {
  return (
    <button
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 34, padding: '0 14px', borderRadius: 8,
        border: `1px solid var(--border)`, background: 'var(--card)',
        color: 'var(--foreground)', fontSize: 13, cursor: 'pointer',
        fontWeight: 500, transition: 'border-color .15s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = accent; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
    >
      {label} <ChevronDownIcon size={13} />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. TREE — checkable + searchable
// ═══════════════════════════════════════════════════════════════

interface TreeNode {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
}

const TREE_DATA: TreeNode[] = [
  {
    key: 'root1', label: '内容管理', icon: <FileTextIcon size={13} />,
    children: [
      { key: 'r1c1', label: '文章列表', icon: <FileTextIcon size={12} /> },
      { key: 'r1c2', label: '分类管理', icon: <FolderIcon size={12} /> },
      {
        key: 'r1c3', label: '媒体库', icon: <ImageIcon size={12} />,
        children: [
          { key: 'r1c3a', label: '图片资源', icon: <ImageIcon size={11} /> },
          { key: 'r1c3b', label: '视频资源', icon: <ImageIcon size={11} /> },
          { key: 'r1c3c', label: '文档资源', icon: <FileTextIcon size={11} /> },
        ],
      },
    ],
  },
  {
    key: 'root2', label: '用户体系', icon: <UsersIcon size={13} />,
    children: [
      { key: 'r2c1', label: '用户列表', icon: <UsersIcon size={12} /> },
      { key: 'r2c2', label: '角色管理', icon: <UsersIcon size={12} /> },
      { key: 'r2c3', label: '权限配置', icon: <SettingsIcon size={12} /> },
    ],
  },
  {
    key: 'root3', label: '数据分析', icon: <BarChart2Icon size={13} />,
    children: [
      { key: 'r3c1', label: '访问统计', icon: <BarChart2Icon size={12} /> },
      { key: 'r3c2', label: '转化漏斗', icon: <BarChart2Icon size={12} /> },
      {
        key: 'r3c3', label: '报表中心', icon: <BarChart2Icon size={12} />,
        children: [
          { key: 'r3c3a', label: '日报', icon: <FileTextIcon size={11} /> },
          { key: 'r3c3b', label: '周报', icon: <FileTextIcon size={11} /> },
          { key: 'r3c3c', label: '月报', icon: <FileTextIcon size={11} /> },
        ],
      },
    ],
  },
  {
    key: 'root4', label: '系统设置', icon: <SettingsIcon size={13} />,
    children: [
      { key: 'r4c1', label: '基础配置', icon: <SettingsIcon size={12} /> },
      { key: 'r4c2', label: '日志管理', icon: <FileTextIcon size={12} /> },
    ],
  },
];

// Flatten tree for search
function flattenTree(nodes: TreeNode[]): TreeNode[] {
  return nodes.flatMap((n) => [n, ...flattenTree(n.children ?? [])]);
}

// Collect all descendant keys
function collectKeys(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => [n.key, ...collectKeys(n.children ?? [])]);
}

// Does node match query (itself or any descendant)
function nodeMatches(node: TreeNode, q: string): boolean {
  if (node.label.includes(q)) return true;
  return (node.children ?? []).some((c) => nodeMatches(c, q));
}

// Check state: 'checked' | 'indeterminate' | 'unchecked'
function getCheckState(node: TreeNode, checked: Set<string>): 'checked' | 'indeterminate' | 'unchecked' {
  const allKeys = collectKeys([node]);
  const leafKeys = allKeys.filter((k) => {
    const found = flattenTree(TREE_DATA).find((n) => n.key === k);
    return !found?.children?.length;
  });
  if (leafKeys.length === 0) {
    // node itself is leaf
    return checked.has(node.key) ? 'checked' : 'unchecked';
  }
  const checkedCount = leafKeys.filter((k) => checked.has(k)).length;
  if (checkedCount === 0) return 'unchecked';
  if (checkedCount === leafKeys.length) return 'checked';
  return 'indeterminate';
}

function CheckBox({
  state,
  onChange,
  accent,
}: {
  state: 'checked' | 'indeterminate' | 'unchecked';
  onChange: () => void;
  accent: string;
}) {
  const checked = state === 'checked';
  const indet = state === 'indeterminate';
  return (
    <div
      onClick={onChange}
      style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        border: `1.5px solid ${checked || indet ? accent : 'var(--border)'}`,
        background: checked ? accent : indet ? `color-mix(in srgb, ${accent} 15%, transparent)` : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all .15s',
      }}
    >
      {checked && <CheckIcon size={10} color="#fff" strokeWidth={3} />}
      {indet && <MinusIcon size={10} color={accent} strokeWidth={3} />}
    </div>
  );
}

function TreeNodeRow({
  node,
  depth,
  checked,
  expanded,
  onCheck,
  onExpand,
  accent,
  query,
}: {
  node: TreeNode;
  depth: number;
  checked: Set<string>;
  expanded: Set<string>;
  onCheck: (node: TreeNode) => void;
  onExpand: (key: string) => void;
  accent: string;
  query: string;
}) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isExpanded = expanded.has(node.key);
  const checkState = getCheckState(node, checked);
  const isLeaf = !hasChildren;

  // highlight match
  const highlight = useCallback((text: string, q: string): React.ReactNode => {
    if (!q) return text;
    const idx = text.indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: `color-mix(in srgb, ${accent} 30%, transparent)`, color: accent, borderRadius: 2, padding: '0 1px' }}>
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  }, [accent]);

  return (
    <div>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 6px', borderRadius: 6, cursor: 'pointer',
          paddingLeft: 6 + depth * 18,
          transition: 'background .12s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = `color-mix(in srgb, ${accent} 6%, transparent)`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        {/* expand toggle */}
        <div
          onClick={() => hasChildren && onExpand(node.key)}
          style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', flexShrink: 0 }}
        >
          {hasChildren
            ? isExpanded
              ? <ChevronDownIcon size={13} />
              : <ChevronRightIcon size={13} />
            : null}
        </div>
        <CheckBox state={checkState} onChange={() => onCheck(node)} accent={accent} />
        <span style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}>
          {hasChildren
            ? isExpanded ? <FolderOpenIcon size={13} /> : <FolderIcon size={13} />
            : node.icon}
        </span>
        <span style={{ fontSize: 13, color: 'var(--foreground)', flex: 1, lineHeight: 1.4 }}>
          {highlight(node.label, query)}
        </span>
        {isLeaf && checked.has(node.key) && (
          <span style={{ fontSize: 10, fontWeight: 600, color: accent, background: `color-mix(in srgb, ${accent} 12%, transparent)`, padding: '1px 6px', borderRadius: 4 }}>已选</span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeRow
              key={child.key}
              node={child}
              depth={depth + 1}
              checked={checked}
              expanded={expanded}
              onCheck={onCheck}
              onExpand={onExpand}
              accent={accent}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeControl({ accent }: { accent: string }) {
  const [checked, setChecked] = useState<Set<string>>(new Set(['r1c1', 'r1c3a', 'r2c1']));
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root1', 'root2', 'root3', 'r1c3', 'r3c3']));
  const [query, setQuery] = useState('');

  const allLeaves = flattenTree(TREE_DATA).filter((n) => !n.children?.length).map((n) => n.key);
  const checkedLeaves = allLeaves.filter((k) => checked.has(k));

  const handleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleCheck = (node: TreeNode) => {
    const allKeys = collectKeys([node]);
    const leafKeys = allKeys.filter((k) => {
      const found = flattenTree(TREE_DATA).find((n) => n.key === k);
      return !found?.children?.length;
    });
    const keysToToggle = leafKeys.length > 0 ? leafKeys : [node.key];
    const state = getCheckState(node, checked);
    setChecked((prev) => {
      const next = new Set(prev);
      if (state === 'checked') {
        keysToToggle.forEach((k) => next.delete(k));
      } else {
        keysToToggle.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const handleCheckAll = () => {
    if (checkedLeaves.length === allLeaves.length) {
      setChecked(new Set());
    } else {
      setChecked(new Set(allLeaves));
    }
  };

  const expandAll = () => {
    const allParents = flattenTree(TREE_DATA).filter((n) => n.children?.length).map((n) => n.key);
    setExpanded(new Set(allParents));
  };
  const collapseAll = () => setExpanded(new Set());

  // Filtered display
  const filteredNodes = query
    ? TREE_DATA.filter((n) => nodeMatches(n, query))
    : TREE_DATA;

  return (
    <div data-cmp="TreeControl" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      {/* tree panel */}
      <div style={{ flex: '1 1 280px', minWidth: 240, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {/* toolbar */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* search */}
          <div style={{ position: 'relative' }}>
            <SearchIcon size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索节点…"
              style={{
                width: '100%', height: 32, paddingLeft: 28, paddingRight: 28,
                border: '1px solid var(--border)', borderRadius: 7,
                background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', opacity: query ? 1 : 0, pointerEvents: query ? 'all' : 'none' }}>
              <button
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', padding: 0 }}
              >
                <XIcon size={13} />
              </button>
            </div>
          </div>
          {/* action bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }} onClick={handleCheckAll}>
              <div style={{
                width: 15, height: 15, borderRadius: 3,
                border: `1.5px solid ${checkedLeaves.length > 0 ? accent : 'var(--border)'}`,
                background: checkedLeaves.length === allLeaves.length ? accent : checkedLeaves.length > 0 ? `color-mix(in srgb, ${accent} 15%, transparent)` : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {checkedLeaves.length === allLeaves.length && <CheckIcon size={9} color="#fff" strokeWidth={3} />}
                {checkedLeaves.length > 0 && checkedLeaves.length < allLeaves.length && <MinusIcon size={9} color={accent} strokeWidth={3} />}
              </div>
              <span style={{ fontSize: 12, color: 'var(--foreground)' }}>全选</span>
            </div>
            <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
            <button onClick={expandAll} style={{ border: 'none', background: 'none', fontSize: 12, color: 'var(--muted-foreground)', cursor: 'pointer', padding: '0 2px' }}>展开全部</button>
            <button onClick={collapseAll} style={{ border: 'none', background: 'none', fontSize: 12, color: 'var(--muted-foreground)', cursor: 'pointer', padding: '0 2px' }}>收起全部</button>
          </div>
        </div>
        {/* tree body */}
        <div style={{ padding: '6px 4px', maxHeight: 320, overflowY: 'auto' }}>
          {filteredNodes.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'var(--muted-foreground)' }}>
              未找到匹配节点
            </div>
          ) : (
            filteredNodes.map((node) => (
              <TreeNodeRow
                key={node.key}
                node={node}
                depth={0}
                checked={checked}
                expanded={expanded}
                onCheck={handleCheck}
                onExpand={handleExpand}
                accent={accent}
                query={query}
              />
            ))
          )}
        </div>
      </div>

      {/* result panel */}
      <div style={{ flex: '0 0 200px', minWidth: 160, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)' }}>
          已选项目
          <span style={{
            marginLeft: 6, fontSize: 11, fontWeight: 700, color: accent,
            background: `color-mix(in srgb, ${accent} 12%, transparent)`,
            padding: '1px 7px', borderRadius: 10,
          }}>
            {checkedLeaves.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 280, overflowY: 'auto' }}>
          {checkedLeaves.length === 0 ? (
            <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>暂无选中项</span>
          ) : (
            checkedLeaves.map((k) => {
              const node = flattenTree(TREE_DATA).find((n) => n.key === k);
              return (
                <div
                  key={k}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '5px 8px', borderRadius: 6,
                    background: `color-mix(in srgb, ${accent} 6%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${accent} 15%, transparent)`,
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--foreground)' }}>{node?.label ?? k}</span>
                  <button
                    onClick={() => {
                      setChecked((prev) => {
                        const next = new Set(prev);
                        next.delete(k);
                        return next;
                      });
                    }}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', padding: 0 }}
                  >
                    <XIcon size={11} />
                  </button>
                </div>
              );
            })
          )}
        </div>
        {checkedLeaves.length > 0 && (
          <button
            onClick={() => setChecked(new Set())}
            style={{ height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', fontSize: 12, color: 'var(--muted-foreground)', cursor: 'pointer' }}
          >
            清空选中
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════

export default function NavPage() {
  const accent = useAccent();

  return (
    <AdminLayout>
      <style>{`
        @keyframes nav-fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ animation: 'nav-fade-in .4s ease', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>导航组件</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            标签页 · 面包屑 · 分页器 · 下拉菜单 · 树形控件
          </p>
        </div>

        {/* ① Tabs */}
        <Section title="标签页 Tabs" desc="基础下划线、卡片式、可关闭新增三种形态">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>基础标签页</div>
              <BasicTabs accent={accent} />
            </div>

            <div style={{ height: 1, background: 'var(--border)' }} />

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>卡片式标签页</div>
              <CardTabs accent={accent} />
            </div>

            <div style={{ height: 1, background: 'var(--border)' }} />

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>可关闭标签页（点击 + 新增）</div>
              <ClosableTabs accent={accent} />
            </div>

          </div>
        </Section>

        {/* ② Breadcrumb */}
        <Section title="面包屑 Breadcrumb" desc="斜杠、箭头、圆点三种分隔符，节点支持图标，当前页加粗高亮">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { set: BREADCRUMB_SETS[0], sep: 'slash' as const, label: '斜杠分隔符' },
              { set: BREADCRUMB_SETS[1], sep: 'chevron' as const, label: '箭头分隔符' },
              { set: BREADCRUMB_SETS[2], sep: 'dot' as const, label: '圆点分隔符（深层路径）' },
            ].map(({ set, sep, label }) => (
              <div key={sep} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)', width: 110, flexShrink: 0 }}>{label}</span>
                <div style={{ padding: '8px 14px', background: 'var(--muted)', borderRadius: 8, flex: 1 }}>
                  <Breadcrumb items={set} accent={accent} separator={sep} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ③ Pagination */}
        <Section title="分页器 Pagination" desc="基础分页、简洁翻页、完整分页（含页码跳转与每页条数）">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <BasicPagination accent={accent} total={256} label="基础分页（共 256 条）" />
            <div style={{ height: 1, background: 'var(--border)' }} />
            <SimplePagination accent={accent} total={128} />
            <div style={{ height: 1, background: 'var(--border)' }} />
            <FullPagination accent={accent} total={1024} />
          </div>
        </Section>

        {/* ④ Dropdown */}
        <Section title="下拉菜单 Dropdown" desc="基础菜单、带分割线与危险项、嵌套子菜单三种形态，点击外部自动关闭">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>基础菜单（含禁用/危险项）</span>
              <DropdownMenu
                trigger={<TriggerBtn label="用户操作" accent={accent} />}
                items={DROPDOWN_ITEMS}
                accent={accent}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>嵌套子菜单（悬停展开）</span>
              <DropdownMenu
                trigger={<TriggerBtn label="操作菜单" accent={accent} />}
                items={DROPDOWN_NESTED}
                accent={accent}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>右对齐弹出</span>
              <DropdownMenu
                trigger={<TriggerBtn label="更多选项 ···" accent={accent} />}
                items={DROPDOWN_ITEMS.slice(0, 4)}
                accent={accent}
                placement="bottom-end"
              />
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted-foreground)' }}>
            * 点击触发按钮展开菜单；嵌套菜单悬停箭头项自动展开子菜单；点击外部区域关闭
          </div>
        </Section>

        {/* ⑤ Tree */}
        <Section title="树形控件 Tree" desc="可勾选（父子联动 / 半选态）、关键词搜索高亮、展开/收起全部、已选项实时同步">
          <TreeControl accent={accent} />
        </Section>

      </div>
    </AdminLayout>
  );
}
