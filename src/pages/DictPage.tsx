import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import { listDict } from '../api';
import { ApiState, useApiResource } from '../hooks/useApiResource';
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
  TagIcon,
} from 'lucide-react';

const MANGA_PINK = '#E91E8C';

interface DictType {
  id: number;
  name: string;
  code: string;
  remark: string;
  status: 'enabled' | 'disabled';
}

interface DictItem {
  id: number;
  typeId: number;
  label: string;
  value: string;
  sort: number;
  status: 'enabled' | 'disabled';
  remark: string;
}

const MOCK_DICT_TYPES: DictType[] = [
  { id: 1, name: '用户状态', code: 'user_status', remark: '用户账号的启用禁用状态', status: 'enabled' },
  { id: 2, name: '性别', code: 'gender', remark: '用户性别字典', status: 'enabled' },
  { id: 3, name: '角色类型', code: 'role_type', remark: '系统角色分类', status: 'enabled' },
  { id: 4, name: '订单状态', code: 'order_status', remark: '订单流转状态', status: 'enabled' },
  { id: 5, name: '通知类型', code: 'notice_type', remark: '消息通知的分类', status: 'enabled' },
  { id: 6, name: '文章状态', code: 'article_status', remark: '内容发布状态', status: 'enabled' },
  { id: 7, name: '系统是否', code: 'sys_yes_no', remark: '通用是/否枚举', status: 'enabled' },
  { id: 8, name: '优先级', code: 'priority', remark: '任务或工单优先级', status: 'disabled' },
];

const MOCK_DICT_ITEMS: DictItem[] = [
  // user_status
  { id: 1, typeId: 1, label: '正常', value: 'active', sort: 1, status: 'enabled', remark: '账户正常使用' },
  { id: 2, typeId: 1, label: '禁用', value: 'inactive', sort: 2, status: 'enabled', remark: '管理员手动禁用' },
  { id: 3, typeId: 1, label: '封禁', value: 'banned', sort: 3, status: 'enabled', remark: '违规封禁' },
  // gender
  { id: 4, typeId: 2, label: '男', value: 'male', sort: 1, status: 'enabled', remark: '' },
  { id: 5, typeId: 2, label: '女', value: 'female', sort: 2, status: 'enabled', remark: '' },
  { id: 6, typeId: 2, label: '保密', value: 'unknown', sort: 3, status: 'enabled', remark: '' },
  // role_type
  { id: 7, typeId: 3, label: '超级管理员', value: 'super', sort: 1, status: 'enabled', remark: '最高权限' },
  { id: 8, typeId: 3, label: '普通管理员', value: 'admin', sort: 2, status: 'enabled', remark: '' },
  { id: 9, typeId: 3, label: '普通用户', value: 'user', sort: 3, status: 'enabled', remark: '' },
  // order_status
  { id: 10, typeId: 4, label: '待支付', value: 'pending', sort: 1, status: 'enabled', remark: '' },
  { id: 11, typeId: 4, label: '已支付', value: 'paid', sort: 2, status: 'enabled', remark: '' },
  { id: 12, typeId: 4, label: '已发货', value: 'shipped', sort: 3, status: 'enabled', remark: '' },
  { id: 13, typeId: 4, label: '已完成', value: 'completed', sort: 4, status: 'enabled', remark: '' },
  { id: 14, typeId: 4, label: '已取消', value: 'cancelled', sort: 5, status: 'enabled', remark: '' },
  // notice_type
  { id: 15, typeId: 5, label: '系统通知', value: 'system', sort: 1, status: 'enabled', remark: '' },
  { id: 16, typeId: 5, label: '活动通知', value: 'activity', sort: 2, status: 'enabled', remark: '' },
  { id: 17, typeId: 5, label: '订单通知', value: 'order', sort: 3, status: 'enabled', remark: '' },
  // article_status
  { id: 18, typeId: 6, label: '草稿', value: 'draft', sort: 1, status: 'enabled', remark: '' },
  { id: 19, typeId: 6, label: '已发布', value: 'published', sort: 2, status: 'enabled', remark: '' },
  { id: 20, typeId: 6, label: '已下架', value: 'archived', sort: 3, status: 'enabled', remark: '' },
  // sys_yes_no
  { id: 21, typeId: 7, label: '是', value: '1', sort: 1, status: 'enabled', remark: '' },
  { id: 22, typeId: 7, label: '否', value: '0', sort: 2, status: 'enabled', remark: '' },
  // priority
  { id: 23, typeId: 8, label: '低', value: 'low', sort: 1, status: 'enabled', remark: '' },
  { id: 24, typeId: 8, label: '中', value: 'medium', sort: 2, status: 'enabled', remark: '' },
  { id: 25, typeId: 8, label: '高', value: 'high', sort: 3, status: 'enabled', remark: '' },
];

export default function DictPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? MANGA_PINK : 'var(--primary)';

  const dictResource = useApiResource(listDict);
  const [dictTypes, setDictTypes] = useState<DictType[]>([]);
  const [dictItems, setDictItems] = useState<DictItem[]>([]);
  useEffect(() => { if (dictResource.data) { setDictTypes(dictResource.data.types); setDictItems(dictResource.data.items); } }, [dictResource.data]);
  const [selectedTypeId, setSelectedTypeId] = useState<number>(1);
  const [typeSearch, setTypeSearch] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editType, setEditType] = useState<Partial<DictType> | null>(null);
  const [editItem, setEditItem] = useState<Partial<DictItem> | null>(null);
  if (dictResource.loading || dictResource.error) return <AdminLayout><ApiState loading={dictResource.loading} error={dictResource.error} /></AdminLayout>;

  const selectedType = dictTypes.find(t => t.id === selectedTypeId);
  const currentItems = dictItems.filter(i => i.typeId === selectedTypeId);
  const filteredTypes = dictTypes.filter(t => t.name.includes(typeSearch) || t.code.includes(typeSearch));

  const saveType = () => {
    if (!editType) return;
    if (editType.id) {
      setDictTypes(prev => prev.map(t => t.id === editType.id ? { ...t, ...editType } as DictType : t));
    } else {
      const newType: DictType = { id: Date.now(), name: editType.name ?? '', code: editType.code ?? '', remark: editType.remark ?? '', status: editType.status ?? 'enabled' };
      setDictTypes(prev => [...prev, newType]);
      setSelectedTypeId(newType.id);
    }
    setShowTypeModal(false);
    setEditType(null);
  };

  const saveItem = () => {
    if (!editItem) return;
    if (editItem.id) {
      setDictItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...editItem } as DictItem : i));
    } else {
      setDictItems(prev => [...prev, { id: Date.now(), typeId: selectedTypeId, label: editItem.label ?? '', value: editItem.value ?? '', sort: editItem.sort ?? 1, status: editItem.status ?? 'enabled', remark: editItem.remark ?? '' }]);
    }
    setShowItemModal(false);
    setEditItem(null);
  };

  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))',
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid var(--border)',
    background: 'var(--input)',
    color: 'var(--foreground)',
    borderRadius: '8px',
    padding: '8px 12px',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box',
  };

  const thStyle: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' };
  const tdStyle: React.CSSProperties = { padding: '11px 14px', fontSize: '13px', color: 'var(--foreground)' };

  return (
    <AdminLayout>
      <div data-cmp="DictPage" style={{ padding: '24px', minHeight: '100%', background: 'var(--background)' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>字典管理</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>维护系统枚举字典和业务标签</p>
        </div>

        <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>
          {/* Left: Dict Type List */}
          <div style={{ ...cardStyle, width: '260px', flexShrink: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>字典类型</span>
              <button
                onClick={() => { setEditType({ status: 'enabled', name: '', code: '', remark: '' }); setShowTypeModal(true); }}
                className="p-1.5 rounded-lg transition-colors hover:opacity-90"
                style={{ background: primary, color: '#fff' }}
                title="新增字典类型"
              >
                <PlusIcon size={13} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', background: 'var(--input)' }}>
                <SearchIcon size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                <input
                  value={typeSearch}
                  onChange={e => setTypeSearch(e.target.value)}
                  placeholder="搜索字典类型…"
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '12px', color: 'var(--foreground)', flex: 1 }}
                />
              </div>
            </div>

            {/* Type list */}
            <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
              {filteredTypes.map(type => {
                const isSelected = selectedTypeId === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedTypeId(type.id)}
                    className="cursor-pointer transition-all"
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      background: isSelected ? (isManga ? 'rgba(233,30,140,0.08)' : 'var(--accent)') : 'transparent',
                      borderLeft: isSelected ? `3px solid ${primary}` : '3px solid transparent',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium" style={{ color: isSelected ? primary : 'var(--foreground)' }}>{type.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{type.code}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {type.status === 'enabled'
                          ? <CheckCircleIcon size={12} style={{ color: '#22C55E' }} />
                          : <XCircleIcon size={12} style={{ color: '#9CA3AF' }} />
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredTypes.length === 0 && (
                <div className="flex items-center justify-center py-8" style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>暂无数据</div>
              )}
            </div>
          </div>

          {/* Right: Dict Items */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div style={{ ...cardStyle, padding: '14px 18px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isManga ? 'rgba(233,30,140,0.1)' : 'var(--accent)', color: primary }}>
                  <BookOpenIcon size={15} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    {selectedType?.name ?? '—'}
                    <code className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{selectedType?.code}</code>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{selectedType?.remark || '暂无备注'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditType(selectedType ? { ...selectedType } : null); setShowTypeModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors"
                  style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                >
                  <EditIcon size={13} />编辑类型
                </button>
                <button
                  onClick={() => { setEditItem({ status: 'enabled', sort: currentItems.length + 1, label: '', value: '', remark: '' }); setShowItemModal(true); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: primary }}
                >
                  <PlusIcon size={14} />新增字典项
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div style={cardStyle}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                    {['标签', '键值', '排序', '备注', '状态', '操作'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.sort((a, b) => a.sort - b.sort).map((item, idx) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: idx < currentItems.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={tdStyle}>
                        <span className="flex items-center gap-2">
                          <TagIcon size={13} style={{ color: primary }} />
                          <span className="font-medium">{item.label}</span>
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <code style={{ fontSize: '12px', background: 'var(--muted)', padding: '2px 8px', borderRadius: '5px', color: 'var(--muted-foreground)' }}>
                          {item.value}
                        </code>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--muted-foreground)' }}>{item.sort}</td>
                      <td style={{ ...tdStyle, color: 'var(--muted-foreground)', fontSize: '12px' }}>{item.remark || '—'}</td>
                      <td style={tdStyle}>
                        {item.status === 'enabled'
                          ? <span className="flex items-center gap-1 text-xs" style={{ color: '#22C55E' }}><CheckCircleIcon size={12} />启用</span>
                          : <span className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}><XCircleIcon size={12} />禁用</span>
                        }
                      </td>
                      <td style={{ ...tdStyle }}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditItem({ ...item }); setShowItemModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            <EditIcon size={13} />
                          </button>
                          <button
                            onClick={() => setDictItems(prev => prev.filter(i => i.id !== item.id))}
                            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                            style={{ color: '#EF4444' }}
                          >
                            <TrashIcon size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {currentItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14" style={{ color: 'var(--muted-foreground)' }}>
                  <BookOpenIcon size={36} style={{ opacity: 0.25, marginBottom: '10px' }} />
                  <p className="text-sm">暂无字典项，点击右上角新增</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Type Modal */}
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: showTypeModal ? 1 : 0,
            pointerEvents: showTypeModal ? 'all' : 'none',
            transition: 'opacity 0.2s ease',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setShowTypeModal(false); setEditType(null); } }}
        >
          <div style={{
            background: 'var(--card)', borderRadius: '16px', padding: '28px', width: '440px', maxWidth: '90vw',
            border: '1px solid var(--border)', transform: showTypeModal ? 'scale(1)' : 'scale(0.95)', transition: 'transform 0.2s ease',
          }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--foreground)' }}>{editType?.id ? '编辑字典类型' : '新增字典类型'}</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>类型名称 *</label>
                <input value={editType?.name ?? ''} onChange={e => setEditType(p => ({ ...p, name: e.target.value }))} placeholder="如: 用户状态" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>类型编码 *</label>
                <input value={editType?.code ?? ''} onChange={e => setEditType(p => ({ ...p, code: e.target.value }))} placeholder="如: user_status" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>备注</label>
                <input value={editType?.remark ?? ''} onChange={e => setEditType(p => ({ ...p, remark: e.target.value }))} placeholder="说明该字典的用途" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>状态</label>
                <select value={editType?.status ?? 'enabled'} onChange={e => setEditType(p => ({ ...p, status: e.target.value as 'enabled' | 'disabled' }))} style={inputStyle}>
                  <option value="enabled">启用</option>
                  <option value="disabled">禁用</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowTypeModal(false); setEditType(null); }} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>取消</button>
              <button onClick={saveType} className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: primary }}>保存</button>
            </div>
          </div>
        </div>

        {/* Item Modal */}
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: showItemModal ? 1 : 0,
            pointerEvents: showItemModal ? 'all' : 'none',
            transition: 'opacity 0.2s ease',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setShowItemModal(false); setEditItem(null); } }}
        >
          <div style={{
            background: 'var(--card)', borderRadius: '16px', padding: '28px', width: '440px', maxWidth: '90vw',
            border: '1px solid var(--border)', transform: showItemModal ? 'scale(1)' : 'scale(0.95)', transition: 'transform 0.2s ease',
          }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--foreground)' }}>{editItem?.id ? '编辑字典项' : '新增字典项'}</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>标签 *</label>
                <input value={editItem?.label ?? ''} onChange={e => setEditItem(p => ({ ...p, label: e.target.value }))} placeholder="如: 启用" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>键值 *</label>
                <input value={editItem?.value ?? ''} onChange={e => setEditItem(p => ({ ...p, value: e.target.value }))} placeholder="如: active 或 1" style={inputStyle} />
              </div>
              <div className="flex gap-3">
                <div style={{ flex: 1 }}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>排序</label>
                  <input type="number" value={editItem?.sort ?? 1} onChange={e => setEditItem(p => ({ ...p, sort: Number(e.target.value) }))} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>状态</label>
                  <select value={editItem?.status ?? 'enabled'} onChange={e => setEditItem(p => ({ ...p, status: e.target.value as 'enabled' | 'disabled' }))} style={inputStyle}>
                    <option value="enabled">启用</option>
                    <option value="disabled">禁用</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>备注</label>
                <input value={editItem?.remark ?? ''} onChange={e => setEditItem(p => ({ ...p, remark: e.target.value }))} placeholder="可选备注" style={inputStyle} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowItemModal(false); setEditItem(null); }} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>取消</button>
              <button onClick={saveItem} className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: primary }}>保存</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
