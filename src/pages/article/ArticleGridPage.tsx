import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { listArticles } from '../../api';
import type { Article, ArticleStatus } from '../../api';
import { ApiState, useApiResource } from '../../hooks/useApiResource';
import {
  SearchIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  XIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  FileIcon,
  MinusCircleIcon,
} from 'lucide-react';

const STATUS_MAP: Record<ArticleStatus, { label: string; bg: string; color: string }> = {
  published: { label: '已发布', bg: 'rgba(34,197,94,0.15)',   color: '#16a34a' },
  pending:   { label: '待审核', bg: 'rgba(245,158,11,0.15)',  color: '#d97706' },
  draft:     { label: '草稿',   bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
  offline:   { label: '已下架', bg: 'rgba(239,68,68,0.15)',   color: '#dc2626' },
};

const YEAR_OPTIONS = ['__all__', '2024', '2023', '2022', '2021'];
const PAGE_SIZE = 10;

function getYear(publishTime: string) {
  return publishTime.slice(0, 4);
}

export default function ArticleGridPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? '#E91E8C' : 'var(--primary)';
  const navigate = useNavigate();
  const articlesResource = useApiResource(() => listArticles({ pageSize: 1000 }));
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => { if (articlesResource.data) setArticles(articlesResource.data.list); }, [articlesResource.data]);

  const [search, setSearch] = useState('');
  const [year, setYear] = useState('__all__');
  const [page, setPage] = useState(1);
  const [detailArticle, setDetailArticle] = useState<Article | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const filtered = articles.filter(a => {
    const matchSearch = search === '' || a.title.includes(search) || a.author.includes(search);
    const matchYear   = year === '__all__' || getYear(a.publishTime) === year;
    return matchSearch && matchYear;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (articlesResource.loading || articlesResource.error) return <AdminLayout><ApiState loading={articlesResource.loading} error={articlesResource.error} /></AdminLayout>;

  const openDetail = (a: Article) => {
    setDetailArticle(a);
    setDrawerOpen(true);
  };

  const closeDetail = () => {
    setDrawerOpen(false);
    setTimeout(() => setDetailArticle(null), 300);
  };

  // Close drawer on overlay click
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeDetail();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [drawerOpen]);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const handleYear = (y: string) => {
    setYear(y);
    setPage(1);
  };

  // Pagination helper
  const getPageNums = () => {
    const nums: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else {
      nums.push(1);
      if (page > 3) nums.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) nums.push(i);
      if (page < totalPages - 2) nums.push('...');
      nums.push(totalPages);
    }
    return nums;
  };

  const d = detailArticle;

  return (
    <AdminLayout>
      <div data-cmp="ArticleGridPage" style={{ minHeight: '100%', background: 'var(--background)', padding: '24px' }}>

        {/* ─── Header ─── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>文章管理</h1>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>
              共 {filtered.length} 篇文章
            </p>
          </div>
          <button
            onClick={() => navigate('/article/publish')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 12, border: 'none',
              background: primary, color: '#fff',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <PlusIcon size={15} />
            新增文章
          </button>
        </div>

        {/* ─── Toolbar ─── */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            marginBottom: 24, padding: '14px 16px',
            background: 'var(--card)', borderRadius: 14,
            border: '1px solid var(--border)',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
            <SearchIcon
              size={15}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }}
            />
            <input
              style={{
                width: '100%', padding: '8px 12px 8px 34px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--background)',
                color: 'var(--foreground)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
              placeholder="搜索标题或作者..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          {/* Year filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {YEAR_OPTIONS.map(y => (
              <button
                key={y}
                onClick={() => handleYear(y)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: '1px solid',
                  fontSize: 13, fontWeight: year === y ? 600 : 400, cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: year === y ? primary : 'var(--muted)',
                  color: year === y ? '#fff' : 'var(--muted-foreground)',
                  borderColor: year === y ? primary : 'var(--border)',
                }}
              >
                {y === '__all__' ? '全部' : y}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Card Grid ─── */}
        <div
          style={{
            display: 'flex', flexWrap: 'wrap', gap: 20,
            marginBottom: 28,
          }}
        >
          {paged.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              primary={primary}
              onOpen={() => openDetail(article)}
            />
          ))}
          {paged.length === 0 && (
            <div
              style={{
                flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--muted-foreground)', fontSize: 14,
              }}
            >
              <BookOpenIcon size={40} style={{ marginBottom: 10, opacity: 0.3 }} />
              暂无匹配文章
            </div>
          )}
        </div>

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
              第 {page} / {totalPages} 页，共 {filtered.length} 篇
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <PaginationBtn
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                primary={primary}
              >
                <ChevronLeftIcon size={15} />
              </PaginationBtn>

              {getPageNums().map((n, i) =>
                n === '...'
                  ? <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--muted-foreground)', fontSize: 13 }}>…</span>
                  : (
                    <PaginationBtn
                      key={n}
                      active={page === n}
                      onClick={() => setPage(n as number)}
                      primary={primary}
                    >
                      {n}
                    </PaginationBtn>
                  )
              )}

              <PaginationBtn
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                primary={primary}
              >
                <ChevronRightIcon size={15} />
              </PaginationBtn>
            </div>
          </div>
        )}

        {/* ─── Detail Drawer Overlay ─── */}
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.4)',
            opacity: drawerOpen ? 1 : 0,
            pointerEvents: drawerOpen ? 'auto' : 'none',
            transition: 'opacity 0.25s',
          }}
        />
        {/* Drawer Panel */}
        <div
          ref={drawerRef}
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: 440, zIndex: 201,
            background: 'var(--card)',
            borderLeft: '1px solid var(--border)',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
            transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.28s cubic-bezier(.4,0,.2,1)',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {d && <DrawerContent article={d} primary={primary} onClose={closeDetail} onEdit={() => navigate(`/article/publish?edit=${d.id}`)} />}
        </div>
      </div>
    </AdminLayout>
  );
}

/* ═══════════════ Article Card ═══════════════ */
interface CardProps {
  article: Article;
  primary: string;
  onOpen: () => void;
}

function ArticleCard({ article, primary, onOpen }: CardProps) {
  const [hovered, setHovered] = useState(false);
  const st = STATUS_MAP[article.status];

  const coverSrc = `https://picsum.photos/seed/${article.id}/400/240`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      style={{
        flex: '0 0 calc(20% - 16px)',
        minWidth: 180,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.13)' : '0 2px 8px rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      {/* Cover */}
      <div style={{ position: 'relative', paddingTop: '60%', overflow: 'hidden' }}>
        <img
          src={coverSrc}
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.3s',
          }}
        />
        {/* Status badge */}
        <span
          style={{
            position: 'absolute', top: 8, left: 8,
            padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: st.bg, color: st.color,
            backdropFilter: 'blur(4px)',
          }}
        >
          {st.label}
        </span>
        {/* Edit button on hover */}
        <button
          onClick={e => { e.stopPropagation(); onOpen(); }}
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(0,0,0,0.55)', border: 'none',
            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <EditIcon size={13} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div
          style={{
            fontSize: 13, fontWeight: 600, color: 'var(--foreground)',
            lineHeight: '1.5', marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.title}
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <UserIcon size={11} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{article.author}</span>
          <span style={{ fontSize: 11, color: 'var(--border)' }}>·</span>
          <span
            style={{
              fontSize: 11, padding: '1px 7px', borderRadius: 20,
              background: 'var(--accent)', color: 'var(--accent-foreground)',
            }}
          >
            {article.category}
          </span>
        </div>

        {/* Views + Date */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <EyeIcon size={11} style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
              {article.views.toLocaleString()}
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
            {article.publishTime.slice(0, 10)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Pagination Button ═══════════════ */
interface PBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  primary: string;
}

function PaginationBtn({ children, onClick, disabled = false, active = false, primary }: PBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: `1px solid ${active ? primary : 'var(--border)'}`,
        background: active ? primary : 'var(--card)',
        color: active ? '#fff' : disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
        fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1, transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

/* ═══════════════ Drawer Content ═══════════════ */
interface DrawerProps {
  article: Article;
  primary: string;
  onClose: () => void;
  onEdit: () => void;
}

function DrawerContent({ article, primary, onClose, onEdit }: DrawerProps) {
  const st = STATUS_MAP[article.status];
  const coverSrc = `https://picsum.photos/seed/${article.id}/800/480`;

  const StatusIcon = article.status === 'published' ? CheckCircleIcon
    : article.status === 'pending'   ? ClockIcon
    : article.status === 'draft'     ? FileIcon
    : MinusCircleIcon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>文章详情</span>
        <button
          onClick={onClose}
          style={{
            width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted-foreground)',
          }}
        >
          <XIcon size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Cover */}
        <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          <img src={coverSrc} alt="" style={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'cover' }} />
        </div>

        {/* Status badge */}
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: st.bg, color: st.color,
            }}
          >
            <StatusIcon size={12} />
            {st.label}
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', lineHeight: '1.6', marginBottom: 16 }}>
          {article.title}
        </h2>

        {/* Meta grid */}
        <div
          style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            padding: '14px 16px', borderRadius: 12,
            background: 'var(--muted)', marginBottom: 18,
          }}
        >
          <MetaRow icon={<UserIcon size={13} />} label="作者" value={article.author} />
          <MetaRow icon={<BookOpenIcon size={13} />} label="分类" value={article.category} />
          <MetaRow
            icon={<EyeIcon size={13} />}
            label="阅读量"
            value={article.views.toLocaleString() + ' 次'}
          />
          <MetaRow icon={<CalendarIcon size={13} />} label="发布时间" value={article.publishTime} />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
              fontSize: 13, color: 'var(--muted-foreground)', fontWeight: 500,
            }}
          >
            <TagIcon size={13} />
            标签
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {article.tags.map(t => (
              <span
                key={t}
                style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--background)', color: 'var(--foreground)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Mock content preview */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 10 }}>内容摘要</div>
          <div
            style={{
              fontSize: 13, color: 'var(--muted-foreground)', lineHeight: '1.8',
              padding: '12px 14px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--background)',
            }}
          >
            本文深入探讨了{article.category}领域的核心知识体系，结合实际项目案例，系统讲解了相关技术原理与最佳实践。文章适合有一定基础的开发者阅读，内容涵盖从基础概念到高级应用的完整学习路径，助力读者在实际工作中高效落地。
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div
        style={{
          display: 'flex', gap: 10, padding: '14px 20px',
          borderTop: '1px solid var(--border)', flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--muted)', color: 'var(--foreground)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          预览文章
        </button>
        <button
          onClick={onEdit}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none',
            background: primary, color: '#fff',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          编辑文章
        </button>
      </div>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span style={{ fontSize: 12, color: 'var(--muted-foreground)', width: 56, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
