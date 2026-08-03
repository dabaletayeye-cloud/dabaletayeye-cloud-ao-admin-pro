import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import { MOCK_TAGS } from '../data/contentData';
import type { Tag } from '../data/contentData';
import {
  PlusIcon,
  SearchIcon,
  TagIcon,
  EditIcon,
  Trash2Icon,
  CheckCircleIcon,
  XCircleIcon,
  SaveIcon,
  XIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

// Tag cloud colors – cycle through a set
const CLOUD_COLORS = [
  { text: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { text: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { text: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { text: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { text: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { text: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
];

function tagFontSize(count: number, max: number, min: number): number {
  const minFont = 11;
  const maxFont = 22;
  if (max === min) return 15;
  return Math.round(minFont + ((count - min) / (max - min)) * (maxFont - minFont));
}

export default function TagPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [saved, setSaved] = useState(false);

  const filtered = tags.filter(t =>
    search === '' || t.name.includes(search)
  );

  const maxCount = Math.max(...tags.map(t => t.articleCount));
  const minCount = Math.min(...tags.map(t => t.articleCount));

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setFormName(tag.name);
    setFormStatus(tag.status);
    setShowForm(true);
    setSaved(false);
  };

  const handleDelete = (id: number) => {
    setTags(prev => prev.filter(t => t.id !== id));
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (editingId !== null) {
      setTags(prev => prev.map(t => t.id === editingId ? { ...t, name: formName.trim(), status: formStatus } : t));
    } else {
      const newTag: Tag = {
        id: Date.now(),
        name: formName.trim(),
        articleCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
        status: formStatus,
      };
      setTags(prev => [...prev, newTag]);
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowForm(false);
      setEditingId(null);
      setFormName('');
      setFormStatus('active');
    }, 1000);
  };

  const handleToggleStatus = (id: number) => {
    setTags(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t
    ));
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--muted)',
    color: 'var(--foreground)',
    fontSize: 13,
    outline: 'none',
  };

  return (
    <AdminLayout>
      <div data-cmp="TagPage" className="p-6 min-h-full" style={{ background: 'var(--background)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>标签管理</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>管理文章标签，共 {tags.length} 个标签</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <SearchIcon
                size={14}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }}
              />
              <input
                style={{ ...inputStyle, paddingLeft: 32, width: 200 }}
                placeholder="搜索标签..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: primary }}
              onClick={() => {
                setEditingId(null);
                setFormName('');
                setFormStatus('active');
                setShowForm(true);
                setSaved(false);
              }}
            >
              <PlusIcon size={15} />
              新增标签
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        <div
          style={{
            maxHeight: showForm ? 120 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
            marginBottom: showForm ? 16 : 0,
          }}
        >
          <div
            className="rounded-2xl border p-4 flex items-end gap-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 5 }}>
                标签名称 <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                placeholder="输入标签名称"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>
            <div style={{ width: 140 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: 5 }}>
                状态
              </label>
              <select
                style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                value={formStatus}
                onChange={e => setFormStatus(e.target.value as 'active' | 'inactive')}
              >
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: saved ? '#22c55e' : primary }}
              >
                <SaveIcon size={14} />
                {saved ? '已保存' : (editingId !== null ? '更新' : '添加')}
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--muted)' }}
                onClick={() => { setShowForm(false); setEditingId(null); setFormName(''); }}
              >
                <XIcon size={14} />
                取消
              </button>
            </div>
          </div>
        </div>

        {/* Tag Cloud */}
        <div
          className="rounded-2xl border p-5 mb-5"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TagIcon size={15} style={{ color: primary }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>标签云</span>
            <span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginLeft: 4 }}>— 标签大小反映文章数量</span>
          </div>
          <div className="flex flex-wrap gap-2 items-baseline">
            {[...tags]
              .sort((a, b) => b.articleCount - a.articleCount)
              .map((tag, idx) => {
                const color = CLOUD_COLORS[idx % CLOUD_COLORS.length];
                const fontSize = tagFontSize(tag.articleCount, maxCount, minCount);
                return (
                  <span
                    key={tag.id}
                    style={{
                      fontSize,
                      fontWeight: fontSize > 16 ? 700 : fontSize > 13 ? 600 : 400,
                      color: color.text,
                      background: color.bg,
                      padding: `${Math.round(fontSize * 0.2)}px ${Math.round(fontSize * 0.5)}px`,
                      borderRadius: 20,
                      cursor: 'pointer',
                      transition: 'transform 0.15s, opacity 0.15s',
                      display: 'inline-flex',
                      alignItems: 'baseline',
                      gap: 3,
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                    title={`${tag.name}：${tag.articleCount} 篇文章`}
                  >
                    {tag.name}
                    <sup style={{ fontSize: Math.max(9, fontSize - 5), opacity: 0.8 }}>{tag.articleCount}</sup>
                  </span>
                );
              })}
          </div>
        </div>

        {/* Tags Table */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
              标签列表 · {filtered.length} 条
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['标签名', '文章数', '创建时间', '状态', '操作'].map(col => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tag, idx) => {
                const colorIdx = MOCK_TAGS.findIndex(t => t.id === tag.id) % CLOUD_COLORS.length;
                const color = CLOUD_COLORS[colorIdx < 0 ? 0 : colorIdx];
                return (
                  <tr
                    key={tag.id}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Name */}
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 12px',
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 500,
                          background: color.bg,
                          color: color.text,
                        }}
                      >
                        <TagIcon size={11} />
                        {tag.name}
                      </span>
                    </td>
                    {/* Count */}
                    <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--foreground)' }}>
                      <div className="flex items-center gap-1.5">
                        <div
                          style={{
                            height: 6,
                            width: Math.round((tag.articleCount / maxCount) * 80),
                            borderRadius: 3,
                            background: color.text,
                            opacity: 0.6,
                          }}
                        />
                        <span>{tag.articleCount}</span>
                      </div>
                    </td>
                    {/* Created At */}
                    <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--muted-foreground)' }}>
                      {tag.createdAt}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '10px 16px' }}>
                      <button
                        onClick={() => handleToggleStatus(tag.id)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border-0 transition-opacity hover:opacity-75"
                        style={{
                          background: tag.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)',
                          color: tag.status === 'active' ? '#16a34a' : '#6b7280',
                          cursor: 'pointer',
                        }}
                      >
                        {tag.status === 'active'
                          ? <><CheckCircleIcon size={12} /> 启用</>
                          : <><XCircleIcon size={12} /> 停用</>
                        }
                      </button>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '10px 16px' }}>
                      <div className="flex items-center gap-1.5">
                        <button
                          title="编辑"
                          onClick={() => handleEdit(tag)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                          style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                        >
                          <EditIcon size={13} />
                        </button>
                        <button
                          title="删除"
                          onClick={() => handleDelete(tag.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}
                        >
                          <Trash2Icon size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13 }}>
                    没有匹配的标签
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
