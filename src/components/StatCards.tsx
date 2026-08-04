import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { TrendingUpIcon, TrendingDownIcon, UsersIcon, ActivityIcon, DollarSignIcon, FileTextIcon } from 'lucide-react';
import { STAT_CARDS } from '../data/mockData';

const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <UsersIcon size={20} />,
  Activity: <ActivityIcon size={20} />,
  DollarSign: <DollarSignIcon size={20} />,
  FileText: <FileTextIcon size={20} />,
};

export default function StatCards() {
  const { themeState } = useTheme();
  const { t } = useTranslation();
  const isManga = themeState.themeId === 'manga';
  const titleKeys: Record<string, string> = {
    '总用户数': 'dashboard.totalUsers',
    '月活跃用户': 'dashboard.monthlyActiveUsers',
    '本月收入': 'dashboard.monthlyRevenue',
    '新增内容': 'dashboard.newContent',
  };

  return (
    <div data-cmp="StatCards" className="flex gap-4 flex-wrap">
      {STAT_CARDS.map((card, idx) => (
        <div
          key={card.title}
          className={`admin-card flex-1 min-w-[200px] p-4 border ${isManga ? 'manga-card-float' : ''}`}
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            animationDelay: `${idx * 0.3}s`,
            boxShadow: isManga
              ? themeState.mode === 'light'
                ? '0 2px 16px rgba(233,30,140,0.12), 0 1px 4px rgba(0,0,0,0.05)'
                : '0 2px 16px rgba(192,132,252,0.15), 0 1px 4px rgba(0,0,0,0.3)'
              : '0 1px 6px rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                {t(titleKeys[card.title] ?? card.title)}
              </div>
              <div className="text-2xl font-bold mb-1.5" style={{ color: 'var(--foreground)' }}>
                {card.value}
              </div>
              <div className="flex items-center gap-1">
                {card.positive
                  ? <TrendingUpIcon size={13} color="#22C55E" />
                  : <TrendingDownIcon size={13} color="#EF4444" />
                }
                <span
                  className="text-xs font-semibold"
                  style={{ color: card.positive ? '#22C55E' : '#EF4444' }}
                >
                  {card.change}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t('dashboard.monthOverMonth')}</span>
              </div>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                color: 'var(--primary)',
              }}
            >
              {ICON_MAP[card.icon]}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
