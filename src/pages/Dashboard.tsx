import { useEdition } from '../core/EditionProvider';
import MerchantHome from '../components/MerchantHome';
import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCards from '../components/StatCards';
import { BarChartComponent, AreaChartComponent } from '../components/Charts';
import ActivityFeed from '../components/ActivityFeed';
import NewUserList from '../components/NewUserList';
import TodoList from '../components/TodoList';
import { useTheme } from '../hooks/useTheme';
import { useLocale } from '../hooks/useLocale';
import { BarChart2Icon, TrendingUpIcon } from 'lucide-react';

export default function Dashboard() {
  const {config,loading}=useEdition();
  if(loading)return <AdminLayout><p>Loading...</p></AdminLayout>;
  if(config.tenancy?.enabled&&!config.tenancy.platform)return <MerchantHome/>;
  return <PlatformDashboard/>;
}
function PlatformDashboard() {
  const { themeState } = useTheme();
  const { locale, t } = useLocale();
  const isManga = themeState.themeId === 'manga';
  const [activeChart, setActiveChart] = useState<'bar' | 'area'>('bar');

  return (
    <AdminLayout>
      <div data-cmp="Dashboard" className="p-6 flex flex-col gap-5 min-h-full">
        {/* Welcome */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              {isManga ? `✨ ${t('dashboard.welcomeBack')}` : t('dashboard.welcomeBack')}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
          >
            {isManga ? `🌸 ${t('dashboard.overview')}` : t('dashboard.overview')}
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
                {activeChart === 'bar' ? t('dashboard.monthlyNewUsers') : t('dashboard.annualVisitTrend')}
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
                  <BarChart2Icon size={12} /> {t('dashboard.monthly')}
                </button>
                <button
                  onClick={() => setActiveChart('area')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: activeChart === 'area' ? 'var(--primary)' : 'var(--muted)',
                    color: activeChart === 'area' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  <TrendingUpIcon size={12} /> {t('dashboard.annual')}
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
              {isManga ? `✨ ${t('dashboard.recentActivity')}` : t('dashboard.recentActivity')}
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
                {isManga ? `🌸 ${t('dashboard.newUsers')}` : t('dashboard.newUsers')}
              </h2>
              <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>{t('dashboard.thisWeek')}</span>
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
                {isManga ? `💫 ${t('dashboard.todos')}` : t('dashboard.todos')}
              </h2>
            </div>
            <TodoList />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
