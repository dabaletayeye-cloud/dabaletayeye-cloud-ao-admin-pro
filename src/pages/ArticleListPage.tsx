import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import { MOCK_ARTICLES } from '../data/contentData';
import type { ArticleStatus } from '../data/contentData';
import {
  SearchIcon,
  PlusIcon,
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
  FileIcon,
  EyeIcon,
  EditIcon,
  Trash2Icon,
  MoreHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

const STATUS_MAP: Record<ArticleStatus, { label: string; bg: string; color: string }> = {
  published: { label: '已发布', bg: 'rgba(34,197,94,0.12)',  color: '#16a34a' },
  pending:   { label: '待审核', bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
  draft:     { label: '草稿',   bg: 'rgba(107,114,128,0.12)',color: '#6b7280' },
  offline:   { label: '已下架', bg: 'rgba(239,68,68,0.12)',  color: '#dc2626' },
};

const CATEGORIES = ['__all__', '前端', '后端', '数据库', 'DevOps', 'UI', 'UX', '平面', '产品', '运营', '其他'];
const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: '全部状态', value: '__all__' },
  { label: '已发布',   value: 'published' },
  { label: '待审核',   value: 'pending' },
  { label: '草稿',     value: 'draft' },
  { label: '已下架',   value: 'offline' },
];

export default function ArticleListPage() {
  const navigate = useNavigate();
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('__all__');
  const [status, setStatus] = useState('__all__');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const PAGE_SIZE = 8;
  const TOTAL = 128;

  const filtered = MOCK_ARTICLES.filter(a => {
    const matchSearch   = search === '' || a.title.includes(search) || a.author.includes(search);
    const matchCategory = category === '__all__' || a.category === category;
    const matchStatus   = status === '__all__' || a.status === status;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages = Math.ceil(TOTAL / PAGE_SIZE);

  const handleReset = () => {
    setSearch('');
    setCategory('__all__');
    setStatus('__all__');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleArticleAction = (articleId: number, action: string) => {
    if (action === '复制链接') {
      void navigator.clipboard?.writeText(`${window.location.origin}/article/${articleId}`);
      toast.success('文章链接已复制');
    } else {
      toast.success(`${action}操作已提交`);
    }
    setOpenMenuId(null);
  };

  const statCards = [
    { label: '总文章',  value: 128, icon: <FileTextIcon size={18} />,    color: primary },
    { label: '已发布',  value: 96,  icon: <CheckCircleIcon size={18} />,  color: '#22c55e' },
    { label: '待审核',  value: 18,  icon: <ClockIcon size={18} />,        color: '#f59e0b' },
    { label: '草稿',    value: 14,  icon: <FileIcon size={18} />,         color: '#9ca3af' },
  ];

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--foreground)',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px 8px 36px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--foreground)',
    fontSize: '13px',
    outline: 'none',
    width: '220px',
  };

  return (
    <AdminLayout>
      <div
        data-cmp="ArticleListPage"
        className="p-6 min-h-full"
        style={{ background: 'var(--background)' }}
        onClick={() => setOpenMenuId(null)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>文章列表</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>管理所有内容文章</p>
          </div>
          <button
            onClick={() => navigate('/article/publish')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: primary }}
          >
            <PlusIcon size={15} />
            新建文章
          </button>
        </div>

        {/* Stat Cards */}
        <div className="flex gap-4 mb-6">
          {statCards.map(s => (
            <div
              key={s.label}
              className="flex-1 rounded-2xl p-4 border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{s.label}</span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}18`, color: s.color }}
                >
                  {s.icon}
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div
          className="rounded-2xl border p-4 mb-5 flex flex-wrap items-center gap-3"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <SearchIcon
              size={15}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }}
            />
            <input
              style={inputStyle}
              placeholder="搜索标题 / 作者..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Category */}
          <select style={selectStyle} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="__all__">全部分类</option>
            {CATEGORIES.filter(c => c !== '__all__').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status */}
          <select style={selectStyle} value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            style={{ ...selectStyle, padding: '7px 10px' }}
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>至</span>
          <input
            type="date"
            style={{ ...selectStyle, padding: '7px 10px' }}
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-sm border transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--muted)' }}
            >
              重置
            </button>
            <button
              onClick={() => setPage(1)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: primary }}
            >
              查询
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['封面', '标题', '作者', '分类', '标签', '阅读量', '状态', '发布时间', '操作'].map(col => (
                  <th
                    key={col}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--muted-foreground)',
                      background: 'var(--muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      {col === '阅读量' && <ArrowDownIcon size={12} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((article, idx) => {
                const st = STATUS_MAP[article.status];
                return (
                  <tr
                    key={article.id}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Cover */}
                    <td style={{ padding: '12px 16px' }}>
                      <img
                        src={article.cover}
                        alt=""
                        style={{ width: 64, height: 44, borderRadius: 8, objectFit: 'cover', display: 'block' }}
                      />
                    </td>
                    {/* Title */}
                    <td style={{ padding: '12px 16px', maxWidth: 260 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--foreground)',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.5',
                        }}
                      >
                        {article.title}
                      </div>
                    </td>
                    {/* Author */}
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                      {article.author}
                    </td>
                    {/* Category */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          background: 'var(--accent)',
                          color: 'var(--accent-foreground)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {article.category}
                      </span>
                    </td>
                    {/* Tags */}
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex gap-1 flex-wrap">
                        {article.tags.map(t => (
                          <span
                            key={t}
                            style={{
                              padding: '2px 8px',
                              borderRadius: 20,
                              fontSize: 11,
                              border: '1px solid var(--border)',
                              color: 'var(--muted-foreground)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    {/* Views */}
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                      <div className="flex items-center gap-1">
                        <EyeIcon size={13} style={{ color: 'var(--muted-foreground)' }} />
                        {article.views.toLocaleString()}
                      </div>
                    </td>
                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                          background: st.bg,
                          color: st.color,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                    {/* Publish time */}
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                      {article.publishTime}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-1" style={{ position: 'relative' }}>
                        <button
                          title="编辑"
                          onClick={() => navigate(`/article/publish?edit=${article.id}`)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                          style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                        >
                          <EditIcon size={13} />
                        </button>
                        <button
                          title="删除"
                          onClick={() => toast.success(`已提交删除文章 ${article.id}`)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}
                        >
                          <Trash2Icon size={13} />
                        </button>
                        <button
                          title="更多"
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                          onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === article.id ? null : article.id); }}
                        >
                          <MoreHorizontalIcon size={13} />
                        </button>
                        {/* Dropdown */}
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 32,
                            zIndex: 50,
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                            minWidth: 120,
                            overflow: 'hidden',
                            opacity: openMenuId === article.id ? 1 : 0,
                            pointerEvents: openMenuId === article.id ? 'auto' : 'none',
                            transform: openMenuId === article.id ? 'translateY(0)' : 'translateY(-4px)',
                            transition: 'opacity 0.15s, transform 0.15s',
                          }}
                        >
                          {['预览文章', '复制链接', '下架文章', '移至回收站'].map(item => (
                            <div
                              key={item}
                              style={{
                                padding: '8px 14px',
                                fontSize: 13,
                                cursor: 'pointer',
                                color: item === '移至回收站' ? '#dc2626' : 'var(--foreground)',
                                transition: 'background 0.12s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              onClick={() => handleArticleAction(article.id, item)}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-5 py-3 border-t"
            style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
          >
            <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
              共 {TOTAL} 条，第 {page} / {totalPages} 页
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:opacity-80"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--card)',
                  color: page === 1 ? 'var(--muted-foreground)' : 'var(--foreground)',
                  opacity: page === 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeftIcon size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors hover:opacity-80"
                    style={{
                      background: isActive ? primary : 'var(--card)',
                      color: isActive ? '#fff' : 'var(--foreground)',
                      border: `1px solid ${isActive ? primary : 'var(--border)'}`,
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13, padding: '0 4px' }}>...</span>
              <button
                onClick={() => setPage(totalPages)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-colors hover:opacity-80"
                style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
              >
                {totalPages}
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:opacity-80"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--card)',
                  color: page === totalPages ? 'var(--muted-foreground)' : 'var(--foreground)',
                  opacity: page === totalPages ? 0.4 : 1,
                }}
              >
                <ChevronRightIcon size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
