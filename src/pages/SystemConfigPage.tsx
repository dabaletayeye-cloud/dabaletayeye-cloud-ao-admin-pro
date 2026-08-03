import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import {
  SaveIcon,
  GlobeIcon,
  MailIcon,
  HardDriveIcon,
  ShieldIcon,
  BellIcon,
  PaletteIcon,
  CheckCircleIcon,
} from 'lucide-react';

const MANGA_PINK = '#E91E8C';

type ConfigTab = 'site' | 'mail' | 'storage' | 'security' | 'notification' | 'theme';

interface SiteConfig {
  siteName: string;
  siteSubtitle: string;
  siteUrl: string;
  icp: string;
  copyright: string;
  logo: string;
  favicon: string;
  keywords: string;
  description: string;
}

interface MailConfig {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
  fromEmail: string;
  enableSsl: boolean;
}

interface StorageConfig {
  type: 'local' | 'oss' | 's3';
  endpoint: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  region: string;
  maxFileSizeMb: string;
}

interface SecurityConfig {
  loginCaptcha: boolean;
  loginMaxAttempts: string;
  lockMinutes: string;
  tokenExpireHours: string;
  passwordMinLength: string;
  passwordComplexity: boolean;
  allowedIps: string;
}

interface NotificationConfig {
  enableEmail: boolean;
  enableSms: boolean;
  enableWebPush: boolean;
  adminEmail: string;
  alertOnLogin: boolean;
  alertOnException: boolean;
}

export default function SystemConfigPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? MANGA_PINK : 'var(--primary)';

  const [activeTab, setActiveTab] = useState<ConfigTab>('site');
  const [savedTab, setSavedTab] = useState<ConfigTab | null>(null);

  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    siteName: 'ao-admin-pro',
    siteSubtitle: '现代化企业管理后台',
    siteUrl: 'https://admin.example.com',
    icp: '沪ICP备20240001号',
    copyright: '© 2024 ao-admin-pro. All rights reserved.',
    logo: '/favicon.svg',
    favicon: '/favicon.svg',
    keywords: '后台,管理系统,ao-admin-pro',
    description: '高效、美观、可扩展的现代化管理后台系统',
  });

  const [mailConfig, setMailConfig] = useState<MailConfig>({
    smtpHost: 'smtp.example.com',
    smtpPort: '465',
    smtpUser: 'noreply@example.com',
    smtpPass: '••••••••••',
    fromName: 'ao-admin-pro',
    fromEmail: 'noreply@example.com',
    enableSsl: true,
  });

  const [storageConfig, setStorageConfig] = useState<StorageConfig>({
    type: 'oss',
    endpoint: 'https://oss-cn-shanghai.aliyuncs.com',
    bucket: 'adminpro-media',
    accessKey: 'LTAI5t••••••••••••••',
    secretKey: '••••••••••••••••••••••••',
    region: 'cn-shanghai',
    maxFileSizeMb: '20',
  });

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    loginCaptcha: true,
    loginMaxAttempts: '5',
    lockMinutes: '30',
    tokenExpireHours: '24',
    passwordMinLength: '8',
    passwordComplexity: true,
    allowedIps: '',
  });

  const [notifConfig, setNotifConfig] = useState<NotificationConfig>({
    enableEmail: true,
    enableSms: false,
    enableWebPush: true,
    adminEmail: 'admin@example.com',
    alertOnLogin: true,
    alertOnException: true,
  });

  const handleSave = (tab: ConfigTab) => {
    console.log(`Saving ${tab} config`);
    setSavedTab(tab);
    setTimeout(() => setSavedTab(null), 2200);
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
    padding: '9px 12px',
    outline: 'none',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '6px',
    color: 'var(--foreground)',
  };

  const sectionTitle = (title: string) => (
    <div className="text-sm font-semibold mb-4 pb-2" style={{ color: 'var(--foreground)', borderBottom: '1px solid var(--border)' }}>
      {title}
    </div>
  );

  const FormRow = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div className="flex items-start gap-4 mb-5">
      <div style={{ width: '160px', flexShrink: 0, paddingTop: '10px' }}>
        <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{label}</div>
        {hint && <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{hint}</div>}
      </div>
      <div style={{ flex: 1 }} data-px-slot>{children}</div>
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="relative rounded-full transition-colors"
      style={{
        width: '44px', height: '24px', flexShrink: 0,
        background: value ? primary : 'var(--muted)',
        border: 'none', cursor: 'pointer', padding: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px',
        left: value ? '23px' : '3px',
        width: '18px', height: '18px',
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.18s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );

  const TABS: { key: ConfigTab; label: string; icon: React.ReactNode }[] = [
    { key: 'site', label: '站点设置', icon: <GlobeIcon size={15} /> },
    { key: 'mail', label: '邮件配置', icon: <MailIcon size={15} /> },
    { key: 'storage', label: '存储配置', icon: <HardDriveIcon size={15} /> },
    { key: 'security', label: '安全配置', icon: <ShieldIcon size={15} /> },
    { key: 'notification', label: '通知设置', icon: <BellIcon size={15} /> },
    { key: 'theme', label: '主题外观', icon: <PaletteIcon size={15} /> },
  ];

  return (
    <AdminLayout>
      <div data-cmp="SystemConfigPage" style={{ padding: '24px', minHeight: '100%', background: 'var(--background)' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>系统设置</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>管理站点、邮件、存储和安全等全局配置</p>
        </div>

        <div className="flex gap-5" style={{ alignItems: 'flex-start' }}>
          {/* Sidebar Tabs */}
          <div style={{ ...cardStyle, width: '200px', flexShrink: 0, padding: '8px' }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 last:mb-0 transition-all text-left"
                  style={{
                    background: isActive ? primary : 'transparent',
                    color: isActive ? '#fff' : 'var(--muted-foreground)',
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Config Form */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Site Config */}
            <div style={{ ...cardStyle, padding: '24px', display: activeTab === 'site' ? 'block' : 'none' }}>
              {sectionTitle('基本信息')}
              <FormRow label="站点名称" hint="显示在浏览器标题栏">
                <input value={siteConfig.siteName} onChange={e => setSiteConfig(p => ({ ...p, siteName: e.target.value }))} style={inputStyle} />
              </FormRow>
              <FormRow label="站点副标题">
                <input value={siteConfig.siteSubtitle} onChange={e => setSiteConfig(p => ({ ...p, siteSubtitle: e.target.value }))} style={inputStyle} />
              </FormRow>
              <FormRow label="站点地址">
                <input value={siteConfig.siteUrl} onChange={e => setSiteConfig(p => ({ ...p, siteUrl: e.target.value }))} placeholder="https://..." style={inputStyle} />
              </FormRow>
              <FormRow label="ICP备案号" hint="可选">
                <input value={siteConfig.icp} onChange={e => setSiteConfig(p => ({ ...p, icp: e.target.value }))} style={inputStyle} />
              </FormRow>
              <FormRow label="版权信息">
                <input value={siteConfig.copyright} onChange={e => setSiteConfig(p => ({ ...p, copyright: e.target.value }))} style={inputStyle} />
              </FormRow>
              {sectionTitle('SEO 配置')}
              <FormRow label="关键词">
                <input value={siteConfig.keywords} onChange={e => setSiteConfig(p => ({ ...p, keywords: e.target.value }))} placeholder="以逗号分隔" style={inputStyle} />
              </FormRow>
              <FormRow label="站点描述">
                <textarea
                  value={siteConfig.description}
                  onChange={e => setSiteConfig(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </FormRow>
              <div className="flex items-center justify-end gap-3 pt-2" style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '16px' }}>
                {savedTab === 'site' && <span className="flex items-center gap-1.5 text-sm" style={{ color: '#22C55E' }}><CheckCircleIcon size={15} />已保存</span>}
                <button onClick={() => handleSave('site')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: primary }}>
                  <SaveIcon size={14} />保存站点设置
                </button>
              </div>
            </div>

            {/* Mail Config */}
            <div style={{ ...cardStyle, padding: '24px', display: activeTab === 'mail' ? 'block' : 'none' }}>
              {sectionTitle('SMTP 服务器')}
              <FormRow label="SMTP 主机">
                <input value={mailConfig.smtpHost} onChange={e => setMailConfig(p => ({ ...p, smtpHost: e.target.value }))} placeholder="smtp.example.com" style={inputStyle} />
              </FormRow>
              <FormRow label="SMTP 端口">
                <input value={mailConfig.smtpPort} onChange={e => setMailConfig(p => ({ ...p, smtpPort: e.target.value }))} placeholder="465 / 587" style={inputStyle} />
              </FormRow>
              <FormRow label="SMTP 用户名">
                <input value={mailConfig.smtpUser} onChange={e => setMailConfig(p => ({ ...p, smtpUser: e.target.value }))} style={inputStyle} />
              </FormRow>
              <FormRow label="SMTP 密码">
                <input type="password" value={mailConfig.smtpPass} onChange={e => setMailConfig(p => ({ ...p, smtpPass: e.target.value }))} style={inputStyle} />
              </FormRow>
              <FormRow label="启用 SSL/TLS">
                <Toggle value={mailConfig.enableSsl} onChange={v => setMailConfig(p => ({ ...p, enableSsl: v }))} />
              </FormRow>
              {sectionTitle('发件人信息')}
              <FormRow label="发件人名称">
                <input value={mailConfig.fromName} onChange={e => setMailConfig(p => ({ ...p, fromName: e.target.value }))} style={inputStyle} />
              </FormRow>
              <FormRow label="发件人邮箱">
                <input value={mailConfig.fromEmail} onChange={e => setMailConfig(p => ({ ...p, fromEmail: e.target.value }))} style={inputStyle} />
              </FormRow>
              <div className="flex items-center justify-end gap-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                {savedTab === 'mail' && <span className="flex items-center gap-1.5 text-sm" style={{ color: '#22C55E' }}><CheckCircleIcon size={15} />已保存</span>}
                <button className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>发送测试邮件</button>
                <button onClick={() => handleSave('mail')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: primary }}>
                  <SaveIcon size={14} />保存邮件配置
                </button>
              </div>
            </div>

            {/* Storage Config */}
            <div style={{ ...cardStyle, padding: '24px', display: activeTab === 'storage' ? 'block' : 'none' }}>
              {sectionTitle('存储类型')}
              <FormRow label="存储方式">
                <div className="flex gap-5">
                  {([['local', '本地存储'], ['oss', '阿里云 OSS'], ['s3', 'Amazon S3']] as const).map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="storage-type" value={v} checked={storageConfig.type === v} onChange={() => setStorageConfig(p => ({ ...p, type: v }))} style={{ accentColor: primary }} />
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>{l}</span>
                    </label>
                  ))}
                </div>
              </FormRow>
              {storageConfig.type !== 'local' && (
                <>
                  <FormRow label="Endpoint">
                    <input value={storageConfig.endpoint} onChange={e => setStorageConfig(p => ({ ...p, endpoint: e.target.value }))} style={inputStyle} />
                  </FormRow>
                  <FormRow label="Bucket 名称">
                    <input value={storageConfig.bucket} onChange={e => setStorageConfig(p => ({ ...p, bucket: e.target.value }))} style={inputStyle} />
                  </FormRow>
                  <FormRow label="Access Key">
                    <input value={storageConfig.accessKey} onChange={e => setStorageConfig(p => ({ ...p, accessKey: e.target.value }))} style={inputStyle} />
                  </FormRow>
                  <FormRow label="Secret Key">
                    <input type="password" value={storageConfig.secretKey} onChange={e => setStorageConfig(p => ({ ...p, secretKey: e.target.value }))} style={inputStyle} />
                  </FormRow>
                  <FormRow label="Region">
                    <input value={storageConfig.region} onChange={e => setStorageConfig(p => ({ ...p, region: e.target.value }))} style={inputStyle} />
                  </FormRow>
                </>
              )}
              <FormRow label="最大上传大小" hint="单位 MB">
                <input type="number" value={storageConfig.maxFileSizeMb} onChange={e => setStorageConfig(p => ({ ...p, maxFileSizeMb: e.target.value }))} style={{ ...inputStyle, maxWidth: '120px' }} />
              </FormRow>
              <div className="flex items-center justify-end gap-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                {savedTab === 'storage' && <span className="flex items-center gap-1.5 text-sm" style={{ color: '#22C55E' }}><CheckCircleIcon size={15} />已保存</span>}
                <button onClick={() => handleSave('storage')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: primary }}>
                  <SaveIcon size={14} />保存存储配置
                </button>
              </div>
            </div>

            {/* Security Config */}
            <div style={{ ...cardStyle, padding: '24px', display: activeTab === 'security' ? 'block' : 'none' }}>
              {sectionTitle('登录安全')}
              <FormRow label="登录验证码">
                <Toggle value={securityConfig.loginCaptcha} onChange={v => setSecurityConfig(p => ({ ...p, loginCaptcha: v }))} />
              </FormRow>
              <FormRow label="最大失败次数" hint="超过后锁定账号">
                <input type="number" value={securityConfig.loginMaxAttempts} onChange={e => setSecurityConfig(p => ({ ...p, loginMaxAttempts: e.target.value }))} style={{ ...inputStyle, maxWidth: '120px' }} />
              </FormRow>
              <FormRow label="锁定时长" hint="分钟">
                <input type="number" value={securityConfig.lockMinutes} onChange={e => setSecurityConfig(p => ({ ...p, lockMinutes: e.target.value }))} style={{ ...inputStyle, maxWidth: '120px' }} />
              </FormRow>
              {sectionTitle('Token 配置')}
              <FormRow label="Token 有效期" hint="小时">
                <input type="number" value={securityConfig.tokenExpireHours} onChange={e => setSecurityConfig(p => ({ ...p, tokenExpireHours: e.target.value }))} style={{ ...inputStyle, maxWidth: '120px' }} />
              </FormRow>
              {sectionTitle('密码策略')}
              <FormRow label="最小长度">
                <input type="number" value={securityConfig.passwordMinLength} onChange={e => setSecurityConfig(p => ({ ...p, passwordMinLength: e.target.value }))} style={{ ...inputStyle, maxWidth: '120px' }} />
              </FormRow>
              <FormRow label="复杂度要求" hint="大小写+数字+符号">
                <Toggle value={securityConfig.passwordComplexity} onChange={v => setSecurityConfig(p => ({ ...p, passwordComplexity: v }))} />
              </FormRow>
              <FormRow label="IP 白名单" hint="留空则不限制">
                <textarea
                  value={securityConfig.allowedIps}
                  onChange={e => setSecurityConfig(p => ({ ...p, allowedIps: e.target.value }))}
                  rows={3}
                  placeholder="每行一个IP或CIDR，如：192.168.1.0/24"
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </FormRow>
              <div className="flex items-center justify-end gap-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                {savedTab === 'security' && <span className="flex items-center gap-1.5 text-sm" style={{ color: '#22C55E' }}><CheckCircleIcon size={15} />已保存</span>}
                <button onClick={() => handleSave('security')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: primary }}>
                  <SaveIcon size={14} />保存安全配置
                </button>
              </div>
            </div>

            {/* Notification Config */}
            <div style={{ ...cardStyle, padding: '24px', display: activeTab === 'notification' ? 'block' : 'none' }}>
              {sectionTitle('通知渠道')}
              <FormRow label="邮件通知" hint="需先配置邮件服务">
                <Toggle value={notifConfig.enableEmail} onChange={v => setNotifConfig(p => ({ ...p, enableEmail: v }))} />
              </FormRow>
              <FormRow label="短信通知" hint="需配置短信服务商">
                <Toggle value={notifConfig.enableSms} onChange={v => setNotifConfig(p => ({ ...p, enableSms: v }))} />
              </FormRow>
              <FormRow label="Web 推送" hint="浏览器推送通知">
                <Toggle value={notifConfig.enableWebPush} onChange={v => setNotifConfig(p => ({ ...p, enableWebPush: v }))} />
              </FormRow>
              {sectionTitle('告警配置')}
              <FormRow label="管理员邮箱">
                <input value={notifConfig.adminEmail} onChange={e => setNotifConfig(p => ({ ...p, adminEmail: e.target.value }))} style={inputStyle} />
              </FormRow>
              <FormRow label="登录告警" hint="检测到异常登录时">
                <Toggle value={notifConfig.alertOnLogin} onChange={v => setNotifConfig(p => ({ ...p, alertOnLogin: v }))} />
              </FormRow>
              <FormRow label="异常告警" hint="系统异常日志告警">
                <Toggle value={notifConfig.alertOnException} onChange={v => setNotifConfig(p => ({ ...p, alertOnException: v }))} />
              </FormRow>
              <div className="flex items-center justify-end gap-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                {savedTab === 'notification' && <span className="flex items-center gap-1.5 text-sm" style={{ color: '#22C55E' }}><CheckCircleIcon size={15} />已保存</span>}
                <button onClick={() => handleSave('notification')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: primary }}>
                  <SaveIcon size={14} />保存通知设置
                </button>
              </div>
            </div>

            {/* Theme Config */}
            <div style={{ ...cardStyle, padding: '24px', display: activeTab === 'theme' ? 'block' : 'none' }}>
              {sectionTitle('外观主题')}
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                主题设置通过右上角的 🎨 调色板按钮实时切换，支持明暗模式和多套配色方案。在此配置系统默认的主题偏好。
              </p>
              <FormRow label="默认主题">
                <div className="flex gap-3">
                  {[
                    { id: 'classic', name: '经典蓝', color: '#3B82F6', emoji: '🔵' },
                    { id: 'mono', name: '极简黑白', color: '#1A1A1A', emoji: '⚫' },
                    { id: 'purple', name: '活力紫', color: '#8B5CF6', emoji: '💜' },
                    { id: 'manga', name: '漫剧工坊粉', color: '#E91E8C', emoji: '🌸' },
                  ].map(t => (
                    <div
                      key={t.id}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        border: `2px solid ${themeState.themeId === t.id ? t.color : 'var(--border)'}`,
                        background: themeState.themeId === t.id ? `${t.color}15` : 'var(--card)',
                        minWidth: '80px',
                      }}
                    >
                      <div className="w-8 h-8 rounded-full" style={{ background: t.color }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{t.name}</span>
                      {themeState.themeId === t.id && (
                        <span className="text-xs" style={{ color: t.color }}>当前</span>
                      )}
                    </div>
                  ))}
                </div>
              </FormRow>
              <FormRow label="默认模式">
                <div className="flex gap-4">
                  {(['light', 'dark'] as const).map(m => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="mode" value={m} checked={themeState.mode === m} onChange={() => {}} style={{ accentColor: primary }} />
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>{m === 'light' ? '☀️ 浅色' : '🌙 深色'}</span>
                    </label>
                  ))}
                </div>
              </FormRow>
              <FormRow label="侧边栏宽度" hint="展开状态 (px)">
                <input type="number" defaultValue={220} style={{ ...inputStyle, maxWidth: '120px' }} />
              </FormRow>
              <FormRow label="圆角大小" hint="全局圆角基准值">
                <select defaultValue="0.75rem" style={{ ...inputStyle, maxWidth: '160px' }}>
                  <option value="0rem">直角 (0)</option>
                  <option value="0.375rem">小圆角</option>
                  <option value="0.75rem">中圆角</option>
                  <option value="1rem">大圆角</option>
                  <option value="9999px">全圆角</option>
                </select>
              </FormRow>
              <div className="flex items-center justify-end gap-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                {savedTab === 'theme' && <span className="flex items-center gap-1.5 text-sm" style={{ color: '#22C55E' }}><CheckCircleIcon size={15} />已保存</span>}
                <button onClick={() => handleSave('theme')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: primary }}>
                  <SaveIcon size={14} />保存外观设置
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
