import { MOCK_ACTIVITIES } from '../data/mockData';
import { CheckCircleIcon, InfoIcon, AlertTriangleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TYPE_CONFIG = {
  success: { icon: <CheckCircleIcon size={14} />, color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  info: { icon: <InfoIcon size={14} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  warning: { icon: <AlertTriangleIcon size={14} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
};

export default function ActivityFeed() {
  const { t } = useTranslation();
  return (
    <div data-cmp="ActivityFeed" className="flex flex-col gap-0">
      {MOCK_ACTIVITIES.map((activity, idx) => {
        const cfg = TYPE_CONFIG[activity.type];
        return (
          <div
            key={activity.id}
            className={`flex items-start gap-3 py-3 ${idx < MOCK_ACTIVITIES.length - 1 ? 'border-b' : ''}`}
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                {cfg.icon}
              </div>
              {idx < MOCK_ACTIVITIES.length - 1 && (
                <div className="w-px flex-1 mt-1" style={{ background: 'var(--border)', minHeight: 8 }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  {activity.avatar}
                </div>
                <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                  {t(`dashboard.activityUser${activity.id}`, { defaultValue: activity.id === 3 ? t('dashboard.systemUser') : activity.user })}
                </span>
              </div>
              <div className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                {t(`dashboard.activity${activity.id}`, { defaultValue: activity.action })}
              </div>
            </div>

            <div className="text-xs flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
              {t(`dashboard.activityTime${activity.id}`, { defaultValue: activity.time })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
