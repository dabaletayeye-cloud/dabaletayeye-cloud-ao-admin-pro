import { useMemo, useState } from 'react';
import { toast } from '../../lib/localizedToast';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { ChevronRightIcon, EyeIcon, UsersIcon } from 'lucide-react';

const DEPARTMENTS = [
  { id: 'product', name: '产品部', description: '产品规划与项目协同', count: 4 },
  { id: 'design', name: '设计部', description: '品牌与体验设计', count: 3 },
  { id: 'engineering', name: '研发部', description: '前后端与平台研发', count: 5 },
  { id: 'operations', name: '运营部', description: '内容运营与客户成功', count: 3 },
];

const MEMBERS = [
  { id: 1, department: 'product', name: '李明', title: '产品经理', level: 'P6', status: '在职', joined: '2021-05-12' },
  { id: 2, department: 'product', name: '周宁', title: '产品运营', level: 'P5', status: '在职', joined: '2022-01-08' },
  { id: 3, department: 'product', name: '宋佳', title: '项目经理', level: 'P6', status: '在职', joined: '2021-09-16' },
  { id: 4, department: 'product', name: '田雨', title: '产品助理', level: 'P4', status: '试用', joined: '2024-04-22' },
  { id: 5, department: 'design', name: '王珊', title: '视觉设计师', level: 'P5', status: '在职', joined: '2022-03-03' },
  { id: 6, department: 'design', name: '许诺', title: '交互设计师', level: 'P5', status: '在职', joined: '2023-02-15' },
  { id: 7, department: 'design', name: '林可', title: '设计实习生', level: 'P3', status: '试用', joined: '2024-05-06' },
  { id: 8, department: 'engineering', name: '陈卓', title: '前端工程师', level: 'P6', status: '在职', joined: '2021-07-20' },
  { id: 9, department: 'engineering', name: '孙伟', title: '后端工程师', level: 'P6', status: '在职', joined: '2022-06-28' },
  { id: 10, department: 'engineering', name: '高阳', title: '测试工程师', level: 'P5', status: '在职', joined: '2023-01-17' },
  { id: 11, department: 'engineering', name: '郭诚', title: '平台工程师', level: 'P7', status: '在职', joined: '2020-11-09' },
  { id: 12, department: 'engineering', name: '陆川', title: '运维工程师', level: 'P5', status: '在职', joined: '2023-09-13' },
  { id: 13, department: 'operations', name: '吴婷', title: '内容运营', level: 'P5', status: '在职', joined: '2022-10-01' },
  { id: 14, department: 'operations', name: '马博', title: '客户成功', level: 'P5', status: '在职', joined: '2023-04-11' },
  { id: 15, department: 'operations', name: '罗欣', title: '活动运营', level: 'P4', status: '试用', joined: '2024-03-07' },
];

export default function SplitTableExamplePage() {
  const { themeState } = useTheme();
  const primary = themeState.themeId === 'manga' ? '#E91E8C' : 'var(--primary)';
  const [departmentId, setDepartmentId] = useState('product');
  const currentDepartment = DEPARTMENTS.find(item => item.id === departmentId) ?? DEPARTMENTS[0];
  const members = useMemo(() => MEMBERS.filter(member => member.department === departmentId), [departmentId]);

  return (
    <AdminLayout>
      <div data-cmp="SplitTableExamplePage" style={{ padding: 24, minHeight: '100%', background: 'var(--background)' }}>
        <div className="mb-6"><h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>左右布局表格</h1><p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>左侧维护分类上下文，右侧表格随选择项联动更新</p></div>
        <div className="grid min-h-[560px] overflow-hidden rounded-xl border lg:grid-cols-[280px_minmax(0,1fr)]" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <aside className="border-b p-3 lg:border-r lg:border-b-0" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
            <div className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}><UsersIcon size={15} style={{ color: primary }} />部门列表</div>
            <div className="grid gap-1.5">{DEPARTMENTS.map(department => <button key={department.id} type="button" onClick={() => setDepartmentId(department.id)} className="flex items-center gap-3 rounded-lg p-3 text-left transition-colors" style={{ background: department.id === departmentId ? primary : 'transparent', color: department.id === departmentId ? '#fff' : 'var(--foreground)' }}><span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold" style={{ background: department.id === departmentId ? 'rgba(255,255,255,0.18)' : 'var(--card)', color: department.id === departmentId ? '#fff' : primary }}>{department.count}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{department.name}</span><span className="mt-0.5 block truncate text-xs" style={{ opacity: 0.72 }}>{department.description}</span></span><ChevronRightIcon size={15} style={{ opacity: 0.7 }} /></button>)}</div>
          </aside>
          <section className="min-w-0"><div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}><div><h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>{currentDepartment.name}</h2><p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>{currentDepartment.description}</p></div><span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>{members.length} 名成员</span></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead style={{ background: 'var(--muted)' }}><tr>{['姓名', '岗位', '职级', '状态', '入职日期', '操作'].map(item => <th key={item} className="px-5 py-3 text-left text-xs" style={{ color: 'var(--muted-foreground)' }}>{item}</th>)}</tr></thead><tbody>{members.map(member => <tr key={member.id} className="hover:bg-accent" style={{ borderTop: '1px solid var(--border)' }}><td className="px-5 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{member.name}</td><td className="px-5 py-3" style={{ color: 'var(--muted-foreground)' }}>{member.title}</td><td className="px-5 py-3"><code className="rounded px-2 py-1 text-xs" style={{ background: 'var(--muted)', color: primary }}>{member.level}</code></td><td className="px-5 py-3"><span className="text-xs font-medium" style={{ color: member.status === '在职' ? '#16A34A' : '#F59E0B' }}>{member.status}</span></td><td className="px-5 py-3" style={{ color: 'var(--muted-foreground)' }}>{member.joined}</td><td className="px-5 py-3"><button type="button" onClick={() => toast.success(`已查看 ${member.name} 的成员信息`)} className="flex items-center gap-1 text-xs font-medium" style={{ color: primary }}><EyeIcon size={13} />查看</button></td></tr>)}</tbody></table></div></section>
        </div>
      </div>
    </AdminLayout>
  );
}
