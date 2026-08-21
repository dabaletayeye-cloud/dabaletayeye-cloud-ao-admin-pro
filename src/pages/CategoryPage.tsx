import { useEffect, useState } from 'react';
import { toast } from '../lib/localizedToast';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import { listCategories } from '../api';
import type { Category } from '../api';
import { ApiState, useApiResource } from '../hooks/useApiResource';
import {
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  EditIcon,
  Trash2Icon,
  FolderPlusIcon,
  FolderIcon,
  FolderOpenIcon,
  SaveIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

// Build tree from flat list
function buildTree(flat: Category[]): Category[] {
  const roots: Category[] = [];
  const map: Record<number, Category> = {};
  flat.forEach(c => { map[c.id] = { ...c, children: [] }; });
  flat.forEach(c => {
    if (c.parentId === null) {
      roots.push(map[c.id]);
    } else {
      const parent = map[c.parentId];
      if (parent) (parent.children ??= []).push(map[c.id]);
    }
  });
  return roots;
}

interface TreeNodeProps {
  node: Category;
  level: number;
  selected: number | null;
  onSelect: (id: number) => void;
  primary: string;
}

function TreeNode({ node, level, selected, onSelect, primary }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = (node.children ?? []).length > 0;
  const isSelected = selected === node.id;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: `7px ${8 + level * 16}px 7px ${8 + level * 16}px`,
          borderRadius: 8,
          cursor: 'pointer',
          background: isSelected ? `${primary}18` : 'transparent',
          color: isSelected ? primary : 'var(--foreground)',
          transition: 'background 0.15s',
          marginBottom: 2,
          userSelect: 'none',
        }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--muted)'; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
        onClick={() => { onSelect(node.id); if (hasChildren) setExpanded(v => !v); }}
      >
        {hasChildren ? (
          <span onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}>
            {expanded ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
          </span>
        ) : (
          <span style={{ width: 14, display: 'inline-block' }} />
        )}
        {hasChildren
          ? (expanded ? <FolderOpenIcon size={15} style={{ color: primary, flexShrink: 0 }} /> : <FolderIcon size={15} style={{ color: primary, flexShrink: 0 }} />)
          : <FolderIcon size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        }
        <span style={{ fontSize: 13, fontWeight: hasChildren ? 600 : 400, flex: 1 }}>{node.name}</span>
        <span
          style={{
            fontSize: 11,
            padding: '1px 7px',
            borderRadius: 20,
            background: 'var(--muted)',
            color: 'var(--muted-foreground)',
          }}
        >
          {node.articleCount}
        </span>
      </div>
      {hasChildren && expanded && (node.children ?? []).map(child => (
        <TreeNode
          key={child.id}
          node={child}
          level={level + 1}
          selected={selected}
          onSelect={onSelect}
          primary={primary}
        />
      ))}
    </div>
  );
}

export default function CategoryPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';
  const categoriesResource = useApiResource(listCategories);
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => { if (categoriesResource.data) setCategories(categoriesResource.data); }, [categoriesResource.data]);
  const treeData = buildTree(categories);
  const parentOptions = categories.filter(c => c.parentId === null);

  const [selectedId, setSelectedId] = useState<number | null>(2);
  const [formData, setFormData] = useState({
    name: '前端',
    slug: 'frontend',
    parentId: '1',
    sort: '1',
    description: 'HTML/CSS/JavaScript 前端开发',
    cover: '',
  });
  const [saved, setSaved] = useState(false);

  const selectedCat = categories.find(c => c.id === selectedId);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    const cat = categories.find(c => c.id === id);
    if (cat) {
      setFormData({
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId !== null ? String(cat.parentId) : '__none__',
        sort: String(cat.sort),
        description: cat.description,
        cover: '',
      });
    }
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddChild = () => {
    setSelectedId(null);
    setFormData(current => ({ ...current, name: '', slug: '', parentId: selectedId ? String(selectedId) : '__none__' }));
    setSaved(false);
  };

  const handleCategoryAction = (action: string) => toast.success(`${action}操作已提交`);

  if (categoriesResource.loading || categoriesResource.error) return <AdminLayout><ApiState loading={categoriesResource.loading} error={categoriesResource.error} /></AdminLayout>;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--muted)',
    color: 'var(--foreground)',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--muted-foreground)',
    marginBottom: 5,
    display: 'block',
  };

  return (
    <AdminLayout>
      <div data-cmp="CategoryPage" className="p-6 min-h-full" style={{ background: 'var(--background)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>分类管理</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>管理文章分类树形结构</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: primary }}
            onClick={() => {
              setSelectedId(null);
              setFormData({ name: '', slug: '', parentId: '__none__', sort: '1', description: '', cover: '' });
              setSaved(false);
            }}
          >
            <PlusIcon size={15} />
            新增分类
          </button>
        </div>

        <div className="flex gap-5" style={{ alignItems: 'flex-start' }}>
          {/* Left: Tree */}
          <div
            className="rounded-2xl border"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--border)',
              width: 280,
              flexShrink: 0,
              minHeight: 480,
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>分类树</span>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>共 {categories.length} 个</span>
            </div>
            <div style={{ padding: '10px 8px' }}>
              {treeData.map(node => (
                <TreeNode
                  key={node.id}
                  node={node}
                  level={0}
                  selected={selectedId}
                  onSelect={handleSelect}
                  primary={primary}
                />
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div
            className="flex-1 rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            {/* Form Header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
                {selectedId === null ? '新增分类' : `编辑：${selectedCat?.name ?? ''}`}
              </span>
              <div className="flex gap-2">
                {selectedId !== null && (
                  <>
                    <button
                      onClick={handleAddChild}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-opacity hover:opacity-80"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--muted)' }}
                    >
                      <FolderPlusIcon size={13} />
                      添加子分类
                    </button>
                    <button
                      onClick={() => handleCategoryAction('编辑分类')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-opacity hover:opacity-80"
                      style={{ borderColor: 'var(--border)', color: '#d97706', background: 'rgba(245,158,11,0.1)' }}
                    >
                      <EditIcon size={13} />
                      编辑
                    </button>
                    <button
                      onClick={() => handleCategoryAction('删除分类')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-opacity hover:opacity-80"
                      style={{ borderColor: 'transparent', color: '#dc2626', background: 'rgba(239,68,68,0.1)' }}
                    >
                      <Trash2Icon size={13} />
                      删除
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Form Body */}
            <div style={{ padding: '20px 24px' }}>
              <div className="flex gap-5 mb-4">
                {/* Name */}
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>分类名称 <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    style={inputStyle}
                    placeholder="输入分类名称"
                    value={formData.name}
                    onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                  />
                </div>
                {/* Slug */}
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>别名（Slug）</label>
                  <input
                    style={inputStyle}
                    placeholder="URL 友好格式，如 frontend"
                    value={formData.slug}
                    onChange={e => setFormData(d => ({ ...d, slug: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-5 mb-4">
                {/* Parent */}
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>父分类</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={formData.parentId}
                    onChange={e => setFormData(d => ({ ...d, parentId: e.target.value }))}
                  >
                    <option value="__none__">— 无（顶级分类）</option>
                    {parentOptions.map(p => (
                      <option key={p.id} value={String(p.id)}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {/* Sort */}
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>排序</label>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="数字越小越靠前"
                    value={formData.sort}
                    onChange={e => setFormData(d => ({ ...d, sort: e.target.value }))}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label style={labelStyle}>描述</label>
                <textarea
                  style={{ ...inputStyle, height: 80, resize: 'none' }}
                  placeholder="分类描述（可选）"
                  value={formData.description}
                  onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                />
              </div>

              {/* Cover Upload */}
              <div className="mb-6">
                <label style={labelStyle}>封面图片</label>
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 12,
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                    background: 'var(--muted)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = primary)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <UploadIcon size={24} style={{ color: 'var(--muted-foreground)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>点击或拖拽上传封面图片</p>
                  <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: '4px 0 0' }}>支持 JPG、PNG、WEBP，建议尺寸 800×400</p>
                </div>
              </div>

              {/* Stats (if editing) */}
              {selectedCat && (
                <div
                  className="rounded-xl p-4 mb-5 flex gap-6"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>文章数量</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)' }}>{selectedCat.articleCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>子分类</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)' }}>
                      {(categories.filter(c => c.parentId === selectedCat.id)).length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>分类 ID</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)' }}>#{selectedCat.id}</div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: saved ? '#22c55e' : primary }}
                >
                  <SaveIcon size={15} />
                  {saved ? '已保存 ✓' : '保存分类'}
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-opacity hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--muted)' }}
                  onClick={() => setFormData({ name: '', slug: '', parentId: '__none__', sort: '1', description: '', cover: '' })}
                >
                  <XIcon size={14} />
                  清空
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
