import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCards from '../components/StatCards';
import { BarChartComponent, AreaChartComponent } from '../components/Charts';
import ActivityFeed from '../components/ActivityFeed';
import NewUserList from '../components/NewUserList';
import TodoList from '../components/TodoList';
import { useTheme } from '../hooks/useTheme';
import { BarChart2Icon, TrendingUpIcon } from 'lucide-react';

export default function Dashboard() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const [activeChart, setActiveChart] = useState<'bar' | 'area'>('bar');

  return (
    <AdminLayout>
      <div data-cmp="Dashboard" className="p-6 flex flex-col gap-5 min-h-full">
        {/* Welcome */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              {isManga ? '✨ 欢迎回来，管理员' : '欢迎回来，管理员'}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
          >
            {isManga ? '🌸 数据总览' : '数据总览'}
          </div>
        </div>

        {/* Stat Cards */}
        <StatCards />

        {/* Charts row */}
        <div className="flex gap-4 flex-wrap" style={{ minHeight: 280 }}>
          {/* Main Chart */}
          <div
            className={`admin-card flex-1 min-w-[300px] p-4 border ${isManga ? 'manga-card-float' : ''}`}
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {activeChart === 'bar' ? '月度新增用户' : '年度访问趋势'}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveChart('bar')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: activeChart === 'bar' ? 'var(--primary)' : 'var(--muted)',
                    color: activeChart === 'bar' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  <BarChart2Icon size={12} /> 月度
                </button>
                <button
                  onClick={() => setActiveChart('area')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: activeChart === 'area' ? 'var(--primary)' : 'var(--muted)',
                    color: activeChart === 'area' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  <TrendingUpIcon size={12} /> 年度
                </button>
              </div>
            </div>
            <div style={{ height: 200 }}>
              <div className={activeChart === 'bar' ? 'block h-full' : 'hidden'}>
                <BarChartComponent />
              </div>
              <div className={activeChart === 'area' ? 'block h-full' : 'hidden'}>
                <AreaChartComponent />
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div
            className={`admin-card p-4 border ${isManga ? 'manga-card-float' : ''}`}
            style={{ background: 'var(--card)', borderColor: 'var(--border)', width: 280, flexShrink: 0 }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              {isManga ? '✨ 最新动态' : '最新动态'}
            </h2>
            <ActivityFeed />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex gap-4 flex-wrap">
          {/* New Users */}
          <div
            className={`admin-card flex-1 min-w-[280px] p-4 border ${isManga ? 'manga-card-float' : ''}`}
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {isManga ? '🌸 新增用户' : '新增用户'}
              </h2>
              <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>本周</span>
            </div>
            <NewUserList />
          </div>

          {/* Todo */}
          <div
            className={`admin-card flex-1 min-w-[280px] p-4 border ${isManga ? 'manga-card-float' : ''}`}
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {isManga ? '💫 待办事项' : '待办事项'}
              </h2>
            </div>
            <TodoList />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
