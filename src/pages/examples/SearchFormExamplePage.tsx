import { useMemo, useState } from 'react';
import { SearchIcon, RotateCcwIcon, SlidersHorizontalIcon, CalendarIcon } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';

const ORDERS = [
  { id: 'ORD-20240601', customer: '杭州云图科技', department: '华东区', status: '已完成', amount: 12800, date: '2024-06-10' },
  { id: 'ORD-20240602', customer: '深圳星海网络', department: '华南区', status: '处理中', amount: 8600, date: '2024-06-11' },
  { id: 'ORD-20240603', customer: '成都西岭商贸', department: '西南区', status: '待付款', amount: 4300, date: '2024-06-12' },
  { id: 'ORD-20240604', customer: '北京北辰咨询', department: '华北区', status: '已完成', amount: 18600, date: '2024-06-13' },
  { id: 'ORD-20240605', customer: '上海澄明设计', department: '华东区', status: '已取消', amount: 2700, date: '2024-06-14' },
  { id: 'ORD-20240606', customer: '武汉远航物流', department: '华中区', status: '处理中', amount: 9600, date: '2024-06-15' },
];

export default function SearchFormExamplePage() {
  const { themeState } = useTheme();
  const primary = themeState.themeId === 'manga' ? '#E91E8C' : 'var(--primary)';
  const [keyword, setKeyword] = useState('');
  const [department, setDepartment] = useState('__all__');
  const [status, setStatus] = useState('__all__');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filters, setFilters] = useState({ keyword: '', department: '__all__', status: '__all__', startDate: '', endDate: '' });

  const results = useMemo(() => ORDERS.filter(order => {
    const text = `${order.id}${order.customer}`.toLowerCase();
    return (!filters.keyword || text.includes(filters.keyword.toLowerCase()))
      && (filters.department === '__all__' || order.department === filters.department)
      && (filters.status === '__all__' || order.status === filters.status)
      && (!filters.startDate || order.date >= filters.startDate)
      && (!filters.endDate || order.date <= filters.endDate);
  }), [filters]);

  const search = () => setFilters({ keyword, department, status, startDate, endDate });
  const reset = () => {
    setKeyword(''); setDepartment('__all__'); setStatus('__all__'); setStartDate(''); setEndDate('');
    setFilters({ keyword: '', department: '__all__', status: '__all__', startDate: '', endDate: '' });
  };
  const inputStyle = { height: 36, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--input)', color: 'var(--foreground)', padding: '0 10px', fontSize: 13, outline: 'none' };

  return (
    <AdminLayout>
      <div data-cmp="SearchFormExamplePage" style={{ padding: 24, minHeight: '100%', background: 'var(--background)' }}>
        <div className="mb-6"><h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>搜索表单</h1><p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>组合关键字、枚举条件与时间范围，提交后更新查询结果</p></div>
        <section className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-1.5 text-sm" style={{ color: 'var(--foreground)' }}><span>订单关键词</span><input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="订单号或客户名称" style={inputStyle} /></label>
            <label className="grid gap-1.5 text-sm" style={{ color: 'var(--foreground)' }}><span>所属区域</span><select value={department} onChange={event => setDepartment(event.target.value)} style={inputStyle}><option value="__all__">全部区域</option><option>华东区</option><option>华南区</option><option>华北区</option><option>华中区</option><option>西南区</option></select></label>
            <label className="grid gap-1.5 text-sm" style={{ color: 'var(--foreground)' }}><span>订单状态</span><select value={status} onChange={event => setStatus(event.target.value)} style={inputStyle}><option value="__all__">全部状态</option><option>待付款</option><option>处理中</option><option>已完成</option><option>已取消</option></select></label>
          </div>
          {showAdvanced && <div className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-3" style={{ borderColor: 'var(--border)' }}><label className="grid gap-1.5 text-sm" style={{ color: 'var(--foreground)' }}><span>开始日期</span><input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} style={inputStyle} /></label><label className="grid gap-1.5 text-sm" style={{ color: 'var(--foreground)' }}><span>结束日期</span><input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} style={inputStyle} /></label><div className="flex items-end pb-0.5 text-sm" style={{ color: 'var(--muted-foreground)' }}><CalendarIcon size={14} className="mr-1.5" />按订单创建日期筛选</div></div>}
          <div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setShowAdvanced(value => !value)} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}><SlidersHorizontalIcon size={14} />{showAdvanced ? '收起条件' : '高级条件'}</button><button type="button" onClick={reset} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}><RotateCcwIcon size={14} />重置</button><button type="button" onClick={search} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: primary }}><SearchIcon size={14} />查询</button></div>
        </section>
        <section className="mt-4 overflow-hidden rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}><div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}><span className="font-semibold" style={{ color: 'var(--foreground)' }}>查询结果</span><span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{results.length} 条记录</span></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead style={{ background: 'var(--muted)' }}><tr>{['订单号', '客户名称', '所属区域', '金额', '状态', '创建日期'].map(item => <th key={item} className="px-5 py-3 text-left text-xs" style={{ color: 'var(--muted-foreground)' }}>{item}</th>)}</tr></thead><tbody>{results.map(order => <tr key={order.id} style={{ borderTop: '1px solid var(--border)' }}><td className="px-5 py-3 font-mono text-xs" style={{ color: primary }}>{order.id}</td><td className="px-5 py-3" style={{ color: 'var(--foreground)' }}>{order.customer}</td><td className="px-5 py-3" style={{ color: 'var(--muted-foreground)' }}>{order.department}</td><td className="px-5 py-3" style={{ color: 'var(--foreground)' }}>¥{order.amount.toLocaleString()}</td><td className="px-5 py-3"><span className="rounded-full px-2 py-1 text-xs" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>{order.status}</span></td><td className="px-5 py-3" style={{ color: 'var(--muted-foreground)' }}>{order.date}</td></tr>)}{results.length === 0 && <tr><td colSpan={6} className="px-5 py-14 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>没有符合条件的订单</td></tr>}</tbody></table></div></section>
      </div>
    </AdminLayout>
  );
}
