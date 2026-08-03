import React, { useState, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  PencilIcon,
  CheckIcon,
  XIcon,
  FilterIcon,
  RotateCcwIcon,
  DatabaseIcon,
  RefreshCwIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserStatus = 'active' | 'inactive' | 'pending' | 'banned';
type UserRole = 'admin' | 'editor' | 'viewer' | 'guest';
type SortDir = 'asc' | 'desc' | null;

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  city: string;
  joinDate: string;
  lastLogin: string;
  score: number;
}

interface ColDef {
  key: keyof User;
  label: string;
  visible: boolean;
  sortable: boolean;
  width: number;
  icon?: React.ReactNode;
}

interface SearchForm {
  keyword: string;
  status: string;
  role: string;
  department: string;
  dateFrom: string;
  dateTo: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const DEPARTMENTS = ['产品部', '研发部', '运营部', '市场部', '设计部', '财务部', '人事部'];
const CITIES = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉'];

const ALL_USERS: User[] = Array.from({ length: 87 }, (_, i) => {
  const roles: UserRole[] = ['admin', 'editor', 'viewer', 'guest'];
  const statuses: UserStatus[] = ['active', 'inactive', 'pending', 'banned'];
  const names = ['张伟', '李娜', '王芳', '刘洋', '陈静', '赵磊', '孙悦', '周敏', '吴鑫', '郑浩',
    '钱琳', '冯超', '江涛', '蒋婷', '何勇', '林慧', '潘飞', '朱雪', '罗宇', '宋玲'];
  return {
    id: 1000 + i,
    name: names[i % names.length] + (i >= names.length ? String(Math.floor(i / names.length)) : ''),
    email: `user${1000 + i}@example.com`,
    phone: `138${String(10000000 + i * 7919).slice(0, 8)}`,
    role: roles[i % 4],
    status: statuses[i % 4],
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    city: CITIES[i % CITIES.length],
    joinDate: `202${Math.floor(i / 30) % 4}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    lastLogin: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    score: 50 + (i * 31) % 51,
  };
});

const INIT_COLS: ColDef[] = [
  { key: 'id',        label: 'ID',   visible: true,  sortable: true,  width: 70,  icon: <ShieldIcon size={12} /> },
  { key: 'name',      label: '姓名', visible: true,  sortable: true,  width: 100, icon: <UserIcon size={12} /> },
  { key: 'email',     label: '邮箱', visible: true,  sortable: false, width: 190, icon: <MailIcon size={12} /> },
  { key: 'phone',     label: '手机', visible: false, sortable: false, width: 135, icon: <PhoneIcon size={12} /> },
  { key: 'role',      label: '角色', visible: true,  sortable: true,  width: 90  },
  { key: 'status',    label: '状态', visible: true,  sortable: true,  width: 90  },
  { key: 'department',label: '部门', visible: true,  sortable: true,  width: 90, icon: <MapPinIcon size={12} /> },
  { key: 'city',      label: '城市', visible: false, sortable: false, width: 80  },
  { key: 'joinDate',  label: '入职日期', visible: true,  sortable: true,  width: 110, icon: <CalendarIcon size={12} /> },
  { key: 'lastLogin', label: '最后登录', visible: false, sortable: true,  width: 110, icon: <CalendarIcon size={12} /> },
  { key: 'score',     label: '评分', visible: true,  sortable: true,  width: 70  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const STATUS_CFG: Record<UserStatus, { label: string; bg: string; color: string; dot: string }> = {
  active:   { label: '正常',   bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', dot: '#22c55e' },
  inactive: { label: '禁用',   bg: 'rgba(107,114,128,0.12)', color: '#6b7280', dot: '#9ca3af' },
  pending:  { label: '待审核', bg: 'rgba(245,158,11,0.12)',  color: '#d97706', dot: '#f59e0b' },
  banned:   { label: '封禁',   bg: 'rgba(239,68,68,0.12)',   color: '#dc2626', dot: '#ef4444' },
};

const ROLE_CFG: Record<UserRole, { label: string; bg: string; color: string }> = {
  admin:  { label: '管理员', bg: 'rgba(139,92,246,0.12)',  color: '#7c3aed' },
  editor: { label: '编辑者', bg: 'rgba(59,130,246,0.12)',  color: '#2563eb' },
  viewer: { label: '查看者', bg: 'rgba(16,185,129,0.12)',  color: '#059669' },
  guest:  { label: '访客',   bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
};

function StatusBadge({ status }: { status: UserStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px',
      borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 500 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_CFG[role];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px',
      borderRadius: 4, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 500 }}>
      {cfg.label}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round((score / 100) * 100);
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 44, height: 5, borderRadius: 3, background: 'var(--border)', display: 'inline-block', overflow: 'hidden' }}>
        <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </span>
      <span style={{ fontSize: 12, color: 'var(--foreground)', fontWeight: 600 }}>{score}</span>
    </span>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td style={{ padding: '12px 16px' }}><span style={{ display: 'block', height: 14, width: 20, borderRadius: 3, background: 'var(--muted)' }} /></td>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <span style={{ display: 'block', height: 14, width: `${50 + (i * 37) % 40}%`, borderRadius: 3, background: 'var(--muted)',
            animation: 'dt-shimmer 1.4s ease-in-out infinite', animationDelay: `${i * 0.07}s` }} />
        </td>
      ))}
      <td style={{ padding: '12px 16px' }}><span style={{ display: 'block', height: 14, width: 60, borderRadius: 3, background: 'var(--muted)' }} /></td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DataTablePage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const accentPrimary = isManga ? '#E91E8C' : 'var(--primary)';

  // Search form state
  const [search, setSearch] = useState<SearchForm>({
    keyword: '', status: '', role: '', department: '', dateFrom: '', dateTo: ''
  });
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSearch, setActiveSearch] = useState<SearchForm>({
    keyword: '', status: '', role: '', department: '', dateFrom: '', dateTo: ''
  });

  // Table state
  const [cols, setCols] = useState<ColDef[]>(INIT_COLS);
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const [sortKey, setSortKey] = useState<keyof User | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editModal, setEditModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; ids: number[] }>({ open: false, ids: [] });
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });

  const visibleCols = useMemo(() => cols.filter(c => c.visible), [cols]);

  // Filter + sort
  const filtered = useMemo(() => {
    let data = [...ALL_USERS];
    const { keyword, status, role, department, dateFrom, dateTo } = activeSearch;
    if (keyword) data = data.filter(u => u.name.includes(keyword) || u.email.includes(keyword) || String(u.id).includes(keyword));
    if (status) data = data.filter(u => u.status === status);
    if (role)   data = data.filter(u => u.role === role);
    if (department) data = data.filter(u => u.department === department);
    if (dateFrom) data = data.filter(u => u.joinDate >= dateFrom);
    if (dateTo)   data = data.filter(u => u.joinDate <= dateTo);
    if (sortKey && sortDir) {
      data.sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey];
        const cmp = String(av).localeCompare(String(bv), 'zh-CN', { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [activeSearch, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  }, []);

  const handleSearch = () => {
    setLoading(true);
    setPage(1);
    setTimeout(() => { setActiveSearch({ ...search }); setLoading(false); }, 700);
  };

  const handleReset = () => {
    const empty: SearchForm = { keyword: '', status: '', role: '', department: '', dateFrom: '', dateTo: '' };
    setSearch(empty);
    setActiveSearch(empty);
    setSortKey(null); setSortDir(null);
    setSelected(new Set());
    setPage(1);
  };

  const handleSort = (key: keyof User) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortKey(null); setSortDir(null); }
  };

  const toggleRow = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const pageIds = pageData.map(u => u.id);
    const allSelected = pageIds.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach(id => next.delete(id));
      else pageIds.forEach(id => next.add(id));
      return next;
    });
  };

  const handleBatchDelete = () => {
    setDeleteModal({ open: true, ids: Array.from(selected) });
  };

  const confirmDelete = () => {
    setDeleteModal({ open: false, ids: [] });
    setSelected(new Set());
    showToast(`已删除 ${deleteModal.ids.length} 条记录`, 'success');
  };

  const handleColToggle = (key: keyof User) => {
    setCols(prev => prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c));
  };

  const pageNums = useMemo(() => {
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    const nums: (number | '...')[] = [];
    if (left > 1) { nums.push(1); if (left > 2) nums.push('...'); }
    for (let n = left; n <= right; n++) nums.push(n);
    if (right < totalPages) { if (right < totalPages - 1) nums.push('...'); nums.push(totalPages); }
    return nums;
  }, [page, totalPages]);

  const card: React.CSSProperties = {
    background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-x, 0px) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0px) var(--shadow-color, rgba(0,0,0,.06))',
  };

  const inputStyle: React.CSSProperties = {
    height: 32, padding: '0 10px', borderRadius: 7, border: '1px solid var(--border)',
    background: 'var(--input)', color: 'var(--foreground)', fontSize: 13, outline: 'none',
    width: '100%', boxSizing: 'border-box',
  };

  const selStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

  const btnPrimary: React.CSSProperties = {
    height: 32, padding: '0 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
    background: accentPrimary, color: '#fff', fontSize: 13, fontWeight: 500,
    display: 'inline-flex', alignItems: 'center', gap: 5,
  };

  const btnGhost: React.CSSProperties = {
    height: 32, padding: '0 14px', borderRadius: 7, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--foreground)', fontSize: 13, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 5,
  };

  const btnDanger: React.CSSProperties = {
    ...btnGhost, borderColor: 'rgba(239,68,68,.35)', color: '#ef4444',
  };

  const pageAllSelected = pageData.length > 0 && pageData.every(u => selected.has(u.id));
  const pagePartial = pageData.some(u => selected.has(u.id)) && !pageAllSelected;

  return (
    <AdminLayout>
      <style>{`
        @keyframes dt-fade-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dt-shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes dt-toast-in { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        .dt-tr:hover { background: color-mix(in srgb, var(--primary) 4%, transparent) !important; }
        .dt-th-sort:hover { color: var(--foreground) !important; cursor: pointer; }
        .dt-action-btn { opacity:0; transition:opacity .15s; }
        .dt-tr:hover .dt-action-btn { opacity:1; }
        .dt-col-item:hover { background: color-mix(in srgb, var(--primary) 6%, transparent); }
        .dt-page-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--primary) 10%, transparent); border-color: var(--primary); color: var(--primary); }
        .dt-page-btn:disabled { opacity:.35; cursor:not-allowed; }
        .dt-search-input:focus { border-color: var(--primary) !important; }
      `}</style>

      <div style={{ animation: 'dt-fade-in .4s ease', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>数据表格</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
              多条件搜索 · 列控制 · 多选操作 · 分页器演示
            </p>
          </div>
          <button style={{ ...btnGhost, gap: 6 }} onClick={handleReset}>
            <RefreshCwIcon size={13} />重置视图
          </button>
        </div>

        {/* ── Search Panel ─────────────────────────────────────────────────── */}
        <div style={{ ...card, padding: 16 }}>
          {/* Row 1: always visible */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* keyword */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 220px', minWidth: 160 }}>
              <label style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>关键词</label>
              <div style={{ position: 'relative' }}>
                <SearchIcon size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                <input className="dt-search-input" style={{ ...inputStyle, paddingLeft: 28 }}
                  placeholder="姓名 / 邮箱 / ID"
                  value={search.keyword}
                  onChange={e => setSearch(s => ({ ...s, keyword: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            {/* status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 0 120px' }}>
              <label style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>状态</label>
              <select className="dt-search-input" style={selStyle} value={search.status}
                onChange={e => setSearch(s => ({ ...s, status: e.target.value }))}>
                <option value="">全部</option>
                <option value="active">正常</option>
                <option value="inactive">禁用</option>
                <option value="pending">待审核</option>
                <option value="banned">封禁</option>
              </select>
            </div>
            {/* role */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 0 120px' }}>
              <label style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>角色</label>
              <select className="dt-search-input" style={selStyle} value={search.role}
                onChange={e => setSearch(s => ({ ...s, role: e.target.value }))}>
                <option value="">全部</option>
                <option value="admin">管理员</option>
                <option value="editor">编辑者</option>
                <option value="viewer">查看者</option>
                <option value="guest">访客</option>
              </select>
            </div>
            {/* Buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', paddingBottom: 1, marginLeft: 'auto' }}>
              <button style={btnPrimary} onClick={handleSearch}>
                <SearchIcon size={13} />搜索
              </button>
              <button style={btnGhost} onClick={handleReset}>
                <RotateCcwIcon size={13} />重置
              </button>
              <button style={{ ...btnGhost, minWidth: 72 }} onClick={() => setExpanded(e => !e)}>
                {expanded ? <ChevronUpIcon size={13} /> : <ChevronDownIcon size={13} />}
                {expanded ? '收起' : '展开'}
              </button>
            </div>
          </div>

          {/* Row 2: expandable */}
          <div style={{ overflow: 'hidden', maxHeight: expanded ? 120 : 0, transition: 'max-height .3s ease', marginTop: expanded ? 12 : 0 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {/* department */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 0 140px' }}>
                <label style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>部门</label>
                <select className="dt-search-input" style={selStyle} value={search.department}
                  onChange={e => setSearch(s => ({ ...s, department: e.target.value }))}>
                  <option value="">全部</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {/* dateFrom */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 0 150px' }}>
                <label style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>入职日期（起）</label>
                <input type="date" className="dt-search-input" style={inputStyle} value={search.dateFrom}
                  onChange={e => setSearch(s => ({ ...s, dateFrom: e.target.value }))} />
              </div>
              {/* dateTo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 0 150px' }}>
                <label style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>入职日期（止）</label>
                <input type="date" className="dt-search-input" style={inputStyle} value={search.dateTo}
                  onChange={e => setSearch(s => ({ ...s, dateTo: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ───────────────────────────────────────────────────────── */}
        <div style={{ ...card, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* result count */}
            <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
              共 <b style={{ color: 'var(--foreground)' }}>{filtered.length}</b> 条记录
              {selected.size > 0 && <>，已选 <b style={{ color: accentPrimary }}>{selected.size}</b> 条</>}
            </span>
            {/* batch delete */}
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            <button style={{ ...btnDanger, opacity: selected.size === 0 ? 0.4 : 1, cursor: selected.size === 0 ? 'not-allowed' : 'pointer' }}
              onClick={() => selected.size > 0 && handleBatchDelete()}>
              <Trash2Icon size={13} />批量删除
            </button>
          </div>

          {/* Column settings */}
          <div style={{ position: 'relative' }}>
            <button style={{ ...btnGhost }} onClick={() => setColPanelOpen(o => !o)}>
              <SlidersHorizontalIcon size={13} />列设置
              <ChevronDownIcon size={12} style={{ marginLeft: 2 }} />
            </button>
            {/* Col panel */}
            <div style={{
              position: 'absolute', right: 0, top: 38, zIndex: 99,
              background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,.12)', padding: '8px 0', minWidth: 160,
              opacity: colPanelOpen ? 1 : 0, pointerEvents: colPanelOpen ? 'auto' : 'none',
              transform: colPanelOpen ? 'translateY(0)' : 'translateY(-6px)', transition: 'all .18s ease',
            }}>
              <div style={{ padding: '4px 14px 8px', fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase' }}>显示列</div>
              {cols.map(col => (
                <div key={col.key} className="dt-col-item"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', cursor: 'pointer', borderRadius: 6, margin: '0 4px' }}
                  onClick={() => handleColToggle(col.key)}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${col.visible ? accentPrimary : 'var(--border)'}`,
                    background: col.visible ? accentPrimary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                    {col.visible && <CheckIcon size={10} color="#fff" />}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{col.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640, tableLayout: 'auto' }}>
              <thead>
                <tr style={{ background: 'color-mix(in srgb, var(--muted) 60%, transparent)', borderBottom: '1px solid var(--border)' }}>
                  {/* checkbox */}
                  <th style={{ width: 44, padding: '10px 16px', textAlign: 'center' }}>
                    <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${pageAllSelected ? accentPrimary : pagePartial ? accentPrimary : 'var(--border)'}`,
                      background: pageAllSelected ? accentPrimary : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      position: 'relative', flexShrink: 0 }}
                      onClick={toggleAll}>
                      {pageAllSelected && <CheckIcon size={10} color="#fff" />}
                      {pagePartial && !pageAllSelected && <span style={{ width: 8, height: 2, background: accentPrimary, borderRadius: 1 }} />}
                    </span>
                  </th>
                  {visibleCols.map(col => (
                    <th key={col.key}
                      className={col.sortable ? 'dt-th-sort' : ''}
                      style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600,
                        color: sortKey === col.key ? accentPrimary : 'var(--muted-foreground)',
                        whiteSpace: 'nowrap', userSelect: 'none', minWidth: col.width }}
                      onClick={() => col.sortable && handleSort(col.key)}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {col.icon && <span style={{ opacity: .7 }}>{col.icon}</span>}
                        {col.label}
                        {col.sortable && (
                          <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1, marginLeft: 2 }}>
                            <ChevronUpIcon size={10} style={{ opacity: sortKey === col.key && sortDir === 'asc' ? 1 : 0.3 }} />
                            <ChevronDownIcon size={10} style={{ opacity: sortKey === col.key && sortDir === 'desc' ? 1 : 0.3, marginTop: -3 }} />
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', textAlign: 'center', minWidth: 90 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} cols={visibleCols.length} />)}
                {!loading && pageData.length === 0 && (
                  <tr>
                    <td colSpan={visibleCols.length + 2} style={{ padding: '64px 0', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                        <DatabaseIcon size={40} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
                        <span style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>暂无匹配数据</span>
                        <button style={{ ...btnGhost, fontSize: 12, height: 28 }} onClick={handleReset}>清空筛选条件</button>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && pageData.map((user, idx) => (
                  <tr key={user.id} className="dt-tr"
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s',
                      background: selected.has(user.id) ? `color-mix(in srgb, ${accentPrimary} 5%, transparent)` : idx % 2 === 1 ? 'color-mix(in srgb, var(--muted) 20%, transparent)' : 'transparent' }}>
                    {/* checkbox */}
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${selected.has(user.id) ? accentPrimary : 'var(--border)'}`,
                        background: selected.has(user.id) ? accentPrimary : 'transparent',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => toggleRow(user.id)}>
                        {selected.has(user.id) && <CheckIcon size={10} color="#fff" />}
                      </span>
                    </td>
                    {visibleCols.map(col => (
                      <td key={col.key} style={{ padding: '10px 12px', fontSize: 13, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                        {col.key === 'status' ? <StatusBadge status={user.status} />
                          : col.key === 'role' ? <RoleBadge role={user.role} />
                          : col.key === 'score' ? <ScoreBar score={user.score} />
                          : col.key === 'id' ? <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted-foreground)' }}>#{user[col.key]}</span>
                          : col.key === 'email' ? <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{user[col.key]}</span>
                          : String(user[col.key])
                        }
                      </td>
                    ))}
                    {/* Actions */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="dt-action-btn"
                          onClick={() => setEditModal({ open: true, user })}
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)',
                            transition: 'all .15s' }}
                          title="编辑">
                          <PencilIcon size={13} />
                        </button>
                        <button className="dt-action-btn"
                          onClick={() => setDeleteModal({ open: true, ids: [user.id] })}
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(239,68,68,.3)', background: 'transparent', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444',
                            transition: 'all .15s' }}
                          title="删除">
                          <Trash2Icon size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 10 }}>
            {/* left: page size + info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>每页</span>
              <select style={{ ...selStyle, width: 64, height: 28, fontSize: 12 }} value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>条</span>
              <span style={{ width: 1, height: 14, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                第 {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} 条 / 共 {filtered.length} 条
              </span>
            </div>
            {/* right: page buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button className="dt-page-btn" disabled={page === 1}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', transition: 'all .15s' }}
                onClick={() => setPage(1)}>
                <ChevronsLeftIcon size={14} />
              </button>
              <button className="dt-page-btn" disabled={page === 1}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', transition: 'all .15s' }}
                onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeftIcon size={14} />
              </button>

              {pageNums.map((n, i) => (
                <button key={i} className={n !== '...' ? 'dt-page-btn' : ''}
                  disabled={n === '...'}
                  style={{ minWidth: 28, height: 28, borderRadius: 6, border: `1px solid ${n === page ? accentPrimary : 'var(--border)'}`,
                    background: n === page ? accentPrimary : 'transparent',
                    color: n === page ? '#fff' : n === '...' ? 'var(--muted-foreground)' : 'var(--foreground)',
                    cursor: n === '...' ? 'default' : 'pointer', fontSize: 13, fontWeight: n === page ? 600 : 400,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', transition: 'all .15s' }}
                  onClick={() => typeof n === 'number' && setPage(n)}>
                  {n}
                </button>
              ))}

              <button className="dt-page-btn" disabled={page === totalPages}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', transition: 'all .15s' }}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRightIcon size={14} />
              </button>
              <button className="dt-page-btn" disabled={page === totalPages}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', transition: 'all .15s' }}
                onClick={() => setPage(totalPages)}>
                <ChevronsRightIcon size={14} />
              </button>

              {/* jump to page */}
              <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted-foreground)' }}>跳至</span>
              <input type="number" min={1} max={totalPages}
                style={{ ...inputStyle, width: 50, height: 28, textAlign: 'center', fontSize: 12 }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const v = Number((e.target as HTMLInputElement).value);
                    if (v >= 1 && v <= totalPages) setPage(v);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                placeholder={String(page)}
              />
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>页</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(2px)',
        opacity: editModal.open ? 1 : 0, pointerEvents: editModal.open ? 'auto' : 'none', transition: 'opacity .2s' }}>
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: 24, width: 460, maxWidth: '90vw',
          transform: editModal.open ? 'scale(1)' : 'scale(.95)', transition: 'transform .2s',
          boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}>
          {editModal.user && (<>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>编辑用户 — {editModal.user.name}</h3>
              <button onClick={() => setEditModal({ open: false, user: null })}
                style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
                <XIcon size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: '姓名', key: 'name', type: 'text' },
                { label: '邮箱', key: 'email', type: 'email' },
                { label: '手机', key: 'phone', type: 'text' },
              ].map(f => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 500 }}>{f.label}</label>
                  <input type={f.type} style={inputStyle} defaultValue={String(editModal.user?.[f.key as keyof User] ?? '')} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 500 }}>角色</label>
                  <select style={selStyle} defaultValue={editModal.user.role}>
                    {(['admin', 'editor', 'viewer', 'guest'] as UserRole[]).map(r => (
                      <option key={r} value={r}>{ROLE_CFG[r].label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 500 }}>状态</label>
                  <select style={selStyle} defaultValue={editModal.user.status}>
                    {(['active', 'inactive', 'pending', 'banned'] as UserStatus[]).map(s => (
                      <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button style={btnGhost} onClick={() => setEditModal({ open: false, user: null })}>取消</button>
              <button style={btnPrimary} onClick={() => { setEditModal({ open: false, user: null }); showToast('用户信息已更新'); }}>
                <CheckIcon size={13} />保存修改
              </button>
            </div>
          </>)}
        </div>
      </div>

      {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(2px)',
        opacity: deleteModal.open ? 1 : 0, pointerEvents: deleteModal.open ? 'auto' : 'none', transition: 'opacity .2s' }}>
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: 24, width: 360, maxWidth: '90vw',
          transform: deleteModal.open ? 'scale(1)' : 'scale(.95)', transition: 'transform .2s',
          boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2Icon size={22} color="#ef4444" />
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>确认删除</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              即将删除 <b style={{ color: '#ef4444' }}>{deleteModal.ids.length}</b> 条记录，此操作不可撤销，确认继续？
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
            <button style={btnGhost} onClick={() => setDeleteModal({ open: false, ids: [] })}>取消</button>
            <button style={{ ...btnPrimary, background: '#ef4444' }} onClick={confirmDelete}>
              <Trash2Icon size={13} />确认删除
            </button>
          </div>
        </div>
      </div>

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 300,
        opacity: toast.show ? 1 : 0, pointerEvents: 'none',
        transform: toast.show ? 'translateX(0)' : 'translateX(40px)', transition: 'all .25s ease',
        background: toast.type === 'success' ? '#16a34a' : '#dc2626',
        color: '#fff', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,.18)' }}>
        {toast.type === 'success' ? <CheckIcon size={15} /> : <XIcon size={15} />}
        {toast.msg}
      </div>

      {/* Overlay to close col panel */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 98, display: colPanelOpen ? 'block' : 'none' }}
        onClick={() => setColPanelOpen(false)} />
    </AdminLayout>
  );
}
