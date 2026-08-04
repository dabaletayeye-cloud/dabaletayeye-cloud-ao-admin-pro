import { MOCK_NEW_USERS } from '../data/mockData';
import { useTranslation } from 'react-i18next';

export default function NewUserList() {
  const { t } = useTranslation();
  return (
    <div data-cmp="NewUserList" className="flex flex-col gap-0">
      {MOCK_NEW_USERS.map((user, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-3 py-3 ${idx < MOCK_NEW_USERS.length - 1 ? 'border-b' : ''}`}
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {user.avatar}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                {t(`dashboard.newUserName${idx + 1}`, { defaultValue: user.name })}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: user.gender === '女'
                    ? 'rgba(236,72,153,0.12)'
                    : 'rgba(59,130,246,0.12)',
                  color: user.gender === '女' ? '#EC4899' : '#3B82F6',
                  fontWeight: 600,
                }}
              >
                {user.gender === '女' ? t('dashboard.female') : t('dashboard.male')}
              </span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {t(`dashboard.newUserRegion${idx + 1}`, { defaultValue: user.region })}
            </div>
          </div>

          {/* Progress */}
          <div className="flex-shrink-0" style={{ width: 72 }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                {user.progress}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${user.progress}%`, background: 'var(--primary)' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
