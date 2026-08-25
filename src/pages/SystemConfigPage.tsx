import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  BellIcon, CheckCircle2Icon, Globe2Icon, HardDriveIcon, LoaderCircleIcon,
  MailIcon, PaletteIcon, RefreshCwIcon, SaveIcon, ShieldCheckIcon,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getSystemConfig, updateSystemConfig } from '../api/systemConfig';
import type { SystemConfig } from '../api/types';
import { useTheme } from '../hooks/useTheme';

type ConfigTab = 'site' | 'mail' | 'storage' | 'security' | 'notification' | 'theme';

const INITIAL_CONFIG: SystemConfig = {
  site: {
    siteName: 'ao-admin-pro', siteSubtitle: '现代化企业管理后台', siteUrl: '', icp: '',
    copyright: '© 2026 ao-admin-pro. All rights reserved.', keywords: '后台管理,管理系统,ao-admin-pro',
    description: '高效、美观、可扩展的现代化管理后台系统',
  },
  mail: { smtpHost: '', smtpPort: '465', smtpUser: '', fromName: 'ao-admin-pro', fromEmail: '', enableSsl: true },
  security: { loginCaptcha: true, loginMaxAttempts: '5', lockMinutes: '30', tokenExpireHours: '24', passwordMinLength: '8', passwordComplexity: true, allowedIps: '' },
  notification: { enableEmail: true, enableSms: false, enableWebPush: true, adminEmail: '', alertOnLogin: true, alertOnException: true },
  theme: { defaultTheme: 'classic', defaultMode: 'light', sidebarWidth: '220', cornerRadius: '0.75' },
  storage: { provider: 'local', maxFileSizeMb: 50, localDirectory: './data/uploads', region: '', bucket: '', prefix: 'ao-admin-pro', cosConfigured: false },
};

const MANGA_PINK = '#E91E8C';

export default function SystemConfigPage() {
  const { themeState, setMode, setThemeId } = useTheme();
  const primary = themeState.themeId === 'manga' ? MANGA_PINK : 'var(--primary)';
  const [activeTab, setActiveTab] = useState<ConfigTab>('site');
  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<ConfigTab | null>(null);
  const [savedTab, setSavedTab] = useState<ConfigTab | null>(null);
  const [error, setError] = useState('');

  const loadConfig = async () => {
    setLoading(true);
    setError('');
    try {
      setConfig(await getSystemConfig());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '加载系统配置失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadConfig(); }, []);

  const save = async (tab: ConfigTab) => {
    if (tab === 'storage') return;
    setSaving(tab);
    setError('');
    try {
      const { storage: _storage, ...input } = config;
      const saved = await updateSystemConfig(input);
      setConfig(saved);
      setSavedTab(tab);
      window.setTimeout(() => setSavedTab(current => current === tab ? null : current), 2400);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '保存失败，请稍后重试。');
    } finally {
      setSaving(null);
    }
  };

  const cardStyle: CSSProperties = useMemo(() => ({
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px',
    boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))',
  }), []);
  const inputStyle: CSSProperties = {
    width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', background: 'var(--input)',
    color: 'var(--foreground)', borderRadius: '8px', padding: '9px 12px', outline: 'none', fontSize: '14px',
  };

  const tabs: { key: ConfigTab; label: string; icon: ReactNode }[] = [
    { key: 'site', label: '站点设置', icon: <Globe2Icon size={16} /> },
    { key: 'mail', label: '邮件配置', icon: <MailIcon size={16} /> },
    { key: 'storage', label: '存储配置', icon: <HardDriveIcon size={16} /> },
    { key: 'security', label: '安全配置', icon: <ShieldCheckIcon size={16} /> },
    { key: 'notification', label: '通知设置', icon: <BellIcon size={16} /> },
    { key: 'theme', label: '主题外观', icon: <PaletteIcon size={16} /> },
  ];

  const FormRow = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
    <div className="flex items-start gap-4 mb-5" style={{ maxWidth: '880px' }}>
      <div style={{ width: '160px', flexShrink: 0, paddingTop: '9px' }}>
        <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{label}</div>
        {hint && <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{hint}</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );

  const SectionTitle = ({ children }: { children: ReactNode }) => (
    <div className="text-sm font-semibold mb-4 pb-2" style={{ color: 'var(--foreground)', borderBottom: '1px solid var(--border)' }}>{children}</div>
  );

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (value: boolean) => void; label: string }) => (
    <button
      type="button" aria-label={label} aria-pressed={value} onClick={() => onChange(!value)}
      className="relative rounded-full transition-colors" style={{ width: 44, height: 24, background: value ? primary : 'var(--muted)', border: 0, cursor: 'pointer' }}
    >
      <span style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .18s ease', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </button>
  );

  const SaveBar = ({ tab, label }: { tab: ConfigTab; label: string }) => (
    <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
      {savedTab === tab && <span className="flex items-center gap-1.5 text-sm" style={{ color: '#16A34A' }}><CheckCircle2Icon size={16} />已保存</span>}
      <button
        type="button" onClick={() => void save(tab)} disabled={saving !== null || loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ background: primary, cursor: saving !== null || loading ? 'not-allowed' : 'pointer' }}
      >
        {saving === tab ? <LoaderCircleIcon size={15} className="animate-spin" /> : <SaveIcon size={15} />}
        {saving === tab ? '保存中…' : label}
      </button>
    </div>
  );

  const setSite = (key: keyof SystemConfig['site'], value: string) => setConfig(current => ({ ...current, site: { ...current.site, [key]: value } }));
  const setMail = <K extends keyof SystemConfig['mail']>(key: K, value: SystemConfig['mail'][K]) => setConfig(current => ({ ...current, mail: { ...current.mail, [key]: value } }));
  const setSecurity = <K extends keyof SystemConfig['security']>(key: K, value: SystemConfig['security'][K]) => setConfig(current => ({ ...current, security: { ...current.security, [key]: value } }));
  const setNotification = <K extends keyof SystemConfig['notification']>(key: K, value: SystemConfig['notification'][K]) => setConfig(current => ({ ...current, notification: { ...current.notification, [key]: value } }));
  const setTheme = <K extends keyof SystemConfig['theme']>(key: K, value: SystemConfig['theme'][K]) => setConfig(current => ({ ...current, theme: { ...current.theme, [key]: value } }));

  return (
    <AdminLayout>
      <main data-cmp="SystemConfigPage" style={{ padding: '24px', minHeight: '100%', background: 'var(--background)' }}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>系统设置</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>管理站点、邮件、安全、通知和主题等全局配置</p>
          </div>
          <button type="button" onClick={() => void loadConfig()} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ color: 'var(--foreground)', background: 'var(--card)', border: '1px solid var(--border)', cursor: loading ? 'not-allowed' : 'pointer' }}>
            <RefreshCwIcon size={15} className={loading ? 'animate-spin' : ''} />刷新
          </button>
        </div>

        {error && <div className="mb-5 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm" role="alert" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
          <span>{error}</span>
          <button type="button" onClick={() => void loadConfig()} className="underline" style={{ cursor: 'pointer' }}>重试</button>
        </div>}

        <div className="flex gap-5" style={{ alignItems: 'flex-start' }}>
          <aside style={{ ...cardStyle, width: 208, flexShrink: 0, padding: 8 }}>
            {tabs.map(tab => {
              const active = activeTab === tab.key;
              return <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 last:mb-0 transition-all text-left" style={{ background: active ? primary : 'transparent', color: active ? '#fff' : 'var(--muted-foreground)', cursor: 'pointer' }}>{tab.icon}{tab.label}</button>;
            })}
          </aside>

          <section style={{ ...cardStyle, padding: 24, flex: 1, minWidth: 0, opacity: loading ? .65 : 1 }}>
            {activeTab === 'site' && <>
              <SectionTitle>基本信息</SectionTitle>
              <FormRow label="站点名称" hint="显示在浏览器标题和导航中"><input value={config.site.siteName} onChange={event => setSite('siteName', event.target.value)} style={inputStyle} /></FormRow>
              <FormRow label="站点副标题"><input value={config.site.siteSubtitle} onChange={event => setSite('siteSubtitle', event.target.value)} style={inputStyle} /></FormRow>
              <FormRow label="站点地址"><input value={config.site.siteUrl} onChange={event => setSite('siteUrl', event.target.value)} placeholder="https://example.com" style={inputStyle} /></FormRow>
              <FormRow label="ICP备案号" hint="可选"><input value={config.site.icp} onChange={event => setSite('icp', event.target.value)} style={inputStyle} /></FormRow>
              <FormRow label="版权信息"><input value={config.site.copyright} onChange={event => setSite('copyright', event.target.value)} style={inputStyle} /></FormRow>
              <SectionTitle>SEO 配置</SectionTitle>
              <FormRow label="关键词" hint="使用英文逗号分隔"><input value={config.site.keywords} onChange={event => setSite('keywords', event.target.value)} style={inputStyle} /></FormRow>
              <FormRow label="站点描述"><textarea rows={3} value={config.site.description} onChange={event => setSite('description', event.target.value)} style={{ ...inputStyle, resize: 'vertical' }} /></FormRow>
              <SaveBar tab="site" label="保存站点设置" />
            </>}

            {activeTab === 'mail' && <>
              <SectionTitle>SMTP 服务器</SectionTitle>
              <FormRow label="SMTP 主机"><input value={config.mail.smtpHost} onChange={event => setMail('smtpHost', event.target.value)} placeholder="smtp.example.com" style={inputStyle} /></FormRow>
              <FormRow label="SMTP 端口"><input inputMode="numeric" value={config.mail.smtpPort} onChange={event => setMail('smtpPort', event.target.value)} placeholder="465 / 587" style={inputStyle} /></FormRow>
              <FormRow label="SMTP 用户名"><input value={config.mail.smtpUser} onChange={event => setMail('smtpUser', event.target.value)} style={inputStyle} /></FormRow>
              <FormRow label="SMTP 密码" hint="为避免泄露，请在后端 .env 中配置 SMTP_PASSWORD"><input type="password" value="" placeholder="不在管理后台保存或回显密码" readOnly style={{ ...inputStyle, color: 'var(--muted-foreground)' }} /></FormRow>
              <FormRow label="启用 SSL/TLS"><Toggle label="启用 SSL/TLS" value={config.mail.enableSsl} onChange={value => setMail('enableSsl', value)} /></FormRow>
              <SectionTitle>发件人信息</SectionTitle>
              <FormRow label="发件人名称"><input value={config.mail.fromName} onChange={event => setMail('fromName', event.target.value)} style={inputStyle} /></FormRow>
              <FormRow label="发件人邮箱"><input type="email" value={config.mail.fromEmail} onChange={event => setMail('fromEmail', event.target.value)} style={inputStyle} /></FormRow>
              <SaveBar tab="mail" label="保存邮件配置" />
            </>}

            {activeTab === 'storage' && <>
              <SectionTitle>当前文件存储</SectionTitle>
              <div className="mb-6 rounded-xl p-4" style={{ background: config.storage.provider === 'cos' ? '#EFF6FF' : '#F0FDF4', border: `1px solid ${config.storage.provider === 'cos' ? '#BFDBFE' : '#BBF7D0'}` }}>
                <div className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>当前模式：{config.storage.provider === 'cos' ? '腾讯云 COS' : '本地文件存储'}</div>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>存储服务由后端 .env 控制，修改后重启后端服务即可生效。密钥不会返回到浏览器。</p>
              </div>
              <FormRow label="存储提供方"><input value={config.storage.provider === 'cos' ? '腾讯云 COS' : '本地存储'} readOnly style={{ ...inputStyle, color: 'var(--muted-foreground)' }} /></FormRow>
              <FormRow label="最大上传大小"><input value={`${config.storage.maxFileSizeMb} MB`} readOnly style={{ ...inputStyle, color: 'var(--muted-foreground)' }} /></FormRow>
              {config.storage.provider === 'local' ? <FormRow label="本地上传目录"><input value={config.storage.localDirectory} readOnly style={{ ...inputStyle, color: 'var(--muted-foreground)' }} /></FormRow> : <>
                <FormRow label="COS 区域"><input value={config.storage.region || '未配置'} readOnly style={{ ...inputStyle, color: 'var(--muted-foreground)' }} /></FormRow>
                <FormRow label="存储桶"><input value={config.storage.bucket || '未配置'} readOnly style={{ ...inputStyle, color: 'var(--muted-foreground)' }} /></FormRow>
                <FormRow label="对象前缀"><input value={config.storage.prefix || '未配置'} readOnly style={{ ...inputStyle, color: 'var(--muted-foreground)' }} /></FormRow>
                <FormRow label="COS 密钥"><span className="text-sm" style={{ color: config.storage.cosConfigured ? '#16A34A' : '#DC2626' }}>{config.storage.cosConfigured ? '已在 .env 中配置（已隐藏）' : '尚未完整配置'}</span></FormRow>
              </>}
              <div className="pt-4 text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>示例：<code>FILE_STORAGE_PROVIDER=local</code>；启用 COS 时填写 <code>COS_SECRET_ID</code>、<code>COS_SECRET_KEY</code>、<code>COS_REGION</code> 和 <code>COS_BUCKET</code>。</div>
            </>}

            {activeTab === 'security' && <>
              <SectionTitle>登录安全</SectionTitle>
              <FormRow label="登录验证码"><Toggle label="登录验证码" value={config.security.loginCaptcha} onChange={value => setSecurity('loginCaptcha', value)} /></FormRow>
              <FormRow label="最大失败次数" hint="超过后锁定账户"><input type="number" min="1" value={config.security.loginMaxAttempts} onChange={event => setSecurity('loginMaxAttempts', event.target.value)} style={{ ...inputStyle, maxWidth: 160 }} /></FormRow>
              <FormRow label="锁定时长" hint="分钟"><input type="number" min="1" value={config.security.lockMinutes} onChange={event => setSecurity('lockMinutes', event.target.value)} style={{ ...inputStyle, maxWidth: 160 }} /></FormRow>
              <SectionTitle>令牌与密码策略</SectionTitle>
              <FormRow label="Token 有效期" hint="小时"><input type="number" min="1" value={config.security.tokenExpireHours} onChange={event => setSecurity('tokenExpireHours', event.target.value)} style={{ ...inputStyle, maxWidth: 160 }} /></FormRow>
              <FormRow label="密码最小长度"><input type="number" min="6" value={config.security.passwordMinLength} onChange={event => setSecurity('passwordMinLength', event.target.value)} style={{ ...inputStyle, maxWidth: 160 }} /></FormRow>
              <FormRow label="密码复杂度" hint="要求大小写、数字和符号"><Toggle label="密码复杂度" value={config.security.passwordComplexity} onChange={value => setSecurity('passwordComplexity', value)} /></FormRow>
              <FormRow label="IP 白名单" hint="留空则不限制；每行一个 IP 或 CIDR"><textarea rows={3} value={config.security.allowedIps} onChange={event => setSecurity('allowedIps', event.target.value)} placeholder={'192.168.1.0/24\n10.0.0.8'} style={{ ...inputStyle, resize: 'vertical' }} /></FormRow>
              <SaveBar tab="security" label="保存安全配置" />
            </>}

            {activeTab === 'notification' && <>
              <SectionTitle>通知渠道</SectionTitle>
              <FormRow label="邮件通知" hint="需先完成邮件配置"><Toggle label="邮件通知" value={config.notification.enableEmail} onChange={value => setNotification('enableEmail', value)} /></FormRow>
              <FormRow label="短信通知" hint="需接入短信服务"><Toggle label="短信通知" value={config.notification.enableSms} onChange={value => setNotification('enableSms', value)} /></FormRow>
              <FormRow label="Web 推送" hint="浏览器推送通知"><Toggle label="Web 推送" value={config.notification.enableWebPush} onChange={value => setNotification('enableWebPush', value)} /></FormRow>
              <SectionTitle>告警配置</SectionTitle>
              <FormRow label="管理员邮箱"><input type="email" value={config.notification.adminEmail} onChange={event => setNotification('adminEmail', event.target.value)} style={inputStyle} /></FormRow>
              <FormRow label="异常登录告警"><Toggle label="异常登录告警" value={config.notification.alertOnLogin} onChange={value => setNotification('alertOnLogin', value)} /></FormRow>
              <FormRow label="系统异常告警"><Toggle label="系统异常告警" value={config.notification.alertOnException} onChange={value => setNotification('alertOnException', value)} /></FormRow>
              <SaveBar tab="notification" label="保存通知设置" />
            </>}

            {activeTab === 'theme' && <>
              <SectionTitle>主题外观</SectionTitle>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>选择后会立即应用到当前浏览器；保存后将作为系统默认偏好保留。</p>
              <FormRow label="默认主题"><div className="flex flex-wrap gap-3">{[
                { id: 'classic', name: '经典蓝', color: '#3B82F6' }, { id: 'mono', name: '极简黑白', color: '#1A1A1A' },
                { id: 'purple', name: '活力紫', color: '#8B5CF6' }, { id: 'manga', name: '漫画工坊粉', color: '#E91E8C' },
              ].map(item => <button key={item.id} type="button" onClick={() => { setTheme('defaultTheme', item.id as SystemConfig['theme']['defaultTheme']); setThemeId(item.id as Parameters<typeof setThemeId>[0]); }} className="px-3 py-2 rounded-lg text-sm" style={{ border: `2px solid ${config.theme.defaultTheme === item.id ? item.color : 'var(--border)'}`, background: config.theme.defaultTheme === item.id ? `${item.color}18` : 'var(--card)', color: 'var(--foreground)', cursor: 'pointer' }}><span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: item.color }} />{item.name}</button>)}</div></FormRow>
              <FormRow label="默认模式"><div className="flex gap-4">{(['light', 'dark'] as const).map(mode => <label key={mode} className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)', cursor: 'pointer' }}><input type="radio" name="mode" checked={config.theme.defaultMode === mode} onChange={() => { setTheme('defaultMode', mode); setMode(mode); }} style={{ accentColor: primary }} />{mode === 'light' ? '浅色模式' : '深色模式'}</label>)}</div></FormRow>
              <FormRow label="侧边栏宽度" hint="展开状态，单位 px"><input type="number" min="180" max="360" value={config.theme.sidebarWidth} onChange={event => setTheme('sidebarWidth', event.target.value)} style={{ ...inputStyle, maxWidth: 160 }} /></FormRow>
              <FormRow label="全局圆角" hint="单位 rem"><select value={config.theme.cornerRadius} onChange={event => setTheme('cornerRadius', event.target.value)} style={{ ...inputStyle, maxWidth: 180 }}><option value="0">直角（0）</option><option value="0.375">小圆角</option><option value="0.75">中圆角</option><option value="1">大圆角</option></select></FormRow>
              <SaveBar tab="theme" label="保存主题设置" />
            </>}
          </section>
        </div>
      </main>
    </AdminLayout>
  );
}
