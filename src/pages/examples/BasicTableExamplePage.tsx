import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  SearchIcon,
  UserPlusIcon,
} from 'lucide-react';

type SortKey = 'name' | 'department' | 'score';

const USERS = [
  { id: 1001, name: '李明', email: 'li.ming@example.com', department: '产品部', score: 98, status: '启用' },
  { id: 1002, name: '王珊', email: 'wang.shan@example.com', department: '设计部', score: 92, status: '启用' },
  { id: 1003, name: '陈卓', email: 'chen.zhuo@example.com', department: '研发部', score: 88, status: '启用' },
  { id: 1004, name: '赵雨', email: 'zhao.yu@example.com', department: '市场部', score: 86, status: '停用' },
  { id: 1005, name: '孙伟', email: 'sun.wei@example.com', department: '研发部', score: 84, status: '启用' },
  { id: 1006, name: '周宁', email: 'zhou.ning@example.com', department: '产品部', score: 82, status: '启用' },
  { id: 1007, name: '吴婷', email: 'wu.ting@example.com', department: '运营部', score: 80, status: '启用' },
  { id: 1008, name: '徐峰', email: 'xu.feng@example.com', department: '市场部', score: 77, status: '停用' },
  { id: 1009, name: '高阳', email: 'gao.yang@example.com', department: '研发部', score: 75, status: '启用' },
  { id: 1010, name: '许诺', email: 'xu.nuo@example.com', department: '设计部', score: 73, status: '启用' },
  { id: 1011, name: '马博', email: 'ma.bo@example.com', department: '运营部', score: 68, status: '启用' },
  { id: 1012, name: '罗欣', email: 'luo.xin@example.com', department: '产品部', score: 65, status: '停用' },
];

const PAGE_SIZE = 6;

export default function BasicTableExamplePage() {
  const { themeState } = useTheme();
  const primary = themeState.themeId === 'manga' ? '#E91E8C' : 'var(--primary)';
  const [searchText, setSearchText] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return USERS
      .filter(user => !keyword || `${user.name}${user.email}${user.department}`.toLowerCase().includes(keyword))
      .sort((left, right) => {
        const leftValue = left[sortKey];
        const rightValue = right[sortKey];
        return (leftValue > rightValue ? 1 : leftValue < rightValue ? -1 : 0) * (ascending ? 1 : -1);
      });
  }, [ascending, searchText, sortKey]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changeSort = (key: SortKey) => {
    if (sortKey === key) setAscending(value => !value);
    else {
      setSortKey(key);
      setAscending(true);
    }
  };

  const sortHeader = (label: string, key: SortKey) => (
    <button type="button" onClick={() => changeSort(key)} className="flex items-center gap-1 font-semibold" style={{ color: 'var(--muted-foreground)' }}>
      {label}<ArrowUpDownIcon size={12} style={{ color: sortKey === key ? primary : 'currentColor' }} />
    </button>
  );

  return (
    <AdminLayout>
      <div data-cmp="BasicTableExamplePage" style={{ padding: 24, minHeight: '100%', background: 'var(--background)' }}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>基础表格</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>包含关键词过滤、列排序与分页的基础数据表格示例</p>
          </div>
          <button type="button" onClick={() => toast.success('已打开新增用户表单')} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: primary }}>
            <UserPlusIcon size={15} />新增用户
          </button>
        </div>

        <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <label className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-lg border px-3" style={{ maxWidth: 360, borderColor: 'var(--border)', background: 'var(--input)' }}>
            <SearchIcon size={14} style={{ color: primary }} />
            <input value={searchText} onChange={event => { setSearchText(event.target.value); setPage(1); }} placeholder="搜索姓名、邮箱或部门" className="min-w-0 flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--foreground)' }} />
          </label>
          <button type="button" onClick={() => toast.success(`已导出 ${rows.length} 条用户数据`)} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <DownloadIcon size={14} />导出
          </button>
        </section>

        <section className="overflow-hidden rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
            <div className="font-semibold" style={{ color: 'var(--foreground)' }}>用户数据</div>
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>共 {rows.length} 条</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead style={{ background: 'var(--muted)' }}>
                <tr>
                  {['编号', '用户信息', '部门', '评分', '状态', '操作'].map(header => <th key={header} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{header === '用户信息' ? sortHeader(header, 'name') : header === '部门' ? sortHeader(header, 'department') : header === '评分' ? sortHeader(header, 'score') : header}</th>)}
                </tr>
              </thead>
              <tbody>
                {pageRows.map(user => (
                  <tr key={user.id} className="transition-colors hover:bg-accent" style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-5 py-3" style={{ color: 'var(--muted-foreground)' }}>#{user.id}</td>
                    <td className="px-5 py-3"><div className="font-medium" style={{ color: 'var(--foreground)' }}>{user.name}</div><div className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>{user.email}</div></td>
                    <td className="px-5 py-3" style={{ color: 'var(--foreground)' }}>{user.department}</td>
                    <td className="px-5 py-3"><span className="rounded-full px-2 py-1 text-xs font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>{user.score}</span></td>
                    <td className="px-5 py-3"><span className="text-xs font-medium" style={{ color: user.status === '启用' ? '#16A34A' : '#9CA3AF' }}>{user.status}</span></td>
                    <td className="px-5 py-3"><button type="button" onClick={() => toast.success(`已查看 ${user.name} 的资料`)} className="text-xs font-medium" style={{ color: primary }}>查看</button></td>
                  </tr>
                ))}
                {pageRows.length === 0 && <tr><td colSpan={6} className="px-5 py-14 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>没有匹配的用户数据</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-3 border-t px-5 py-3" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{currentPage} / {pageCount} 页</span>
            <button type="button" onClick={() => setPage(value => Math.max(1, value - 1))} disabled={currentPage === 1} className="flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-40" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }} title="上一页"><ChevronLeftIcon size={15} /></button>
            <button type="button" onClick={() => setPage(value => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount} className="flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-40" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }} title="下一页"><ChevronRightIcon size={15} /></button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
