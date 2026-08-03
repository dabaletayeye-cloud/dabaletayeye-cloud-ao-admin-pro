import { useState } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import {
  SaveIcon,
  GlobeIcon,
  BellIcon,
  ShieldIcon,
  PaletteIcon,
  DatabaseIcon,
  MailIcon,
  SmartphoneIcon,
  ChevronRightIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

interface SettingsSection {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: SettingsSection[] = [
  { key: 'general', label: '基本设置', icon: <GlobeIcon size={16} /> },
  { key: 'notification', label: '通知设置', icon: <BellIcon size={16} /> },
  { key: 'security', label: '安全设置', icon: <ShieldIcon size={16} /> },
  { key: 'appearance', label: '外观设置', icon: <PaletteIcon size={16} /> },
  { key: 'storage', label: '存储设置', icon: <DatabaseIcon size={16} /> },
  { key: 'email', label: '邮件配置', icon: <MailIcon size={16} /> },
  { key: 'mobile', label: '移动端设置', icon: <SmartphoneIcon size={16} /> },
];

function Toggle({ value, onChange = () => {} }: { value: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: value ? '#E91E8C' : 'var(--muted)' }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: value ? '24px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
      />
    </button>
  );
}

function SettingRow({ label, desc = '', children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{desc}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5 mb-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{title}</h3>
      {children}
    </div>
  );
}

const inputStyle = (isManga: boolean) => ({
  background: 'var(--muted)',
  border: '1px solid var(--border)',
  color: 'var(--foreground)',
  borderRadius: '10px',
  padding: '6px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '220px',
} as React.CSSProperties);

export default function SettingsPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const [activeSection, setActiveSection] = useState('general');

  const handleSave = () => {
    toast.success('系统设置已保存');
  };

  // General
  const [siteName, setSiteName] = useState('漫剧工坊');
  const [siteUrl, setSiteUrl] = useState('https://manga.example.com');
  const [language, setLanguage] = useState('zh-CN');
  const [timezone, setTimezone] = useState('Asia/Shanghai');

  // Notification
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [marketingNotif, setMarketingNotif] = useState(true);
  const [securityNotif, setSecurityNotif] = useState(true);

  // Security
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginLog, setLoginLog] = useState(true);
  const [autoLogout, setAutoLogout] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState(false);

  // Appearance
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [sidebarDefault, setSidebarDefault] = useState('expanded');

  // Storage
  const [autoClean, setAutoClean] = useState(true);
  const [cdnEnabled, setCdnEnabled] = useState(true);
  const [imageCompress, setImageCompress] = useState(true);

  // Email
  const [smtpHost, setSmtpHost] = useState('smtp.example.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [smtpUser, setSmtpUser] = useState('no-reply@example.com');

  // Mobile
  const [mobileEnabled, setMobileEnabled] = useState(true);
  const [deepLink, setDeepLink] = useState(true);

  const renderContent = () => {
    if (activeSection === 'general') return (
      <>
        <SectionCard title="站点信息">
          <SettingRow label="站点名称" desc="显示在浏览器标题和分享卡片中">
            <input value={siteName} onChange={e => setSiteName(e.target.value)} style={inputStyle(isManga)} />
          </SettingRow>
          <SettingRow label="站点地址" desc="系统对外访问的根 URL">
            <input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} style={inputStyle(isManga)} />
          </SettingRow>
          <SettingRow label="默认语言" desc="后台管理界面显示语言">
            <select value={language} onChange={e => setLanguage(e.target.value)} style={inputStyle(isManga)}>
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en-US">English (US)</option>
              <option value="ja-JP">日本語</option>
            </select>
          </SettingRow>
          <SettingRow label="时区设置" desc="系统时间显示及定时任务基准">
            <select value={timezone} onChange={e => setTimezone(e.target.value)} style={inputStyle(isManga)}>
              <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
            </select>
          </SettingRow>
        </SectionCard>
        <SectionCard title="SEO 设置">
          <SettingRow label="搜索引擎收录" desc="允许搜索引擎索引本站内容">
            <Toggle value={true} />
          </SettingRow>
          <SettingRow label="站点地图自动更新" desc="每日自动生成并提交 sitemap.xml">
            <Toggle value={true} />
          </SettingRow>
        </SectionCard>
      </>
    );

    if (activeSection === 'notification') return (
      <SectionCard title="通知渠道">
        <SettingRow label="邮件通知" desc="通过邮件发送系统事件提醒">
          <Toggle value={emailNotif} onChange={setEmailNotif} />
        </SettingRow>
        <SettingRow label="Push 推送" desc="向已安装 App 的用户推送通知">
          <Toggle value={pushNotif} onChange={setPushNotif} />
        </SettingRow>
        <SettingRow label="短信通知" desc="通过短信发送重要安全提醒（按量计费）">
          <Toggle value={smsNotif} onChange={setSmsNotif} />
        </SettingRow>
        <SettingRow label="营销消息" desc="活动、优惠券等营销内容推送">
          <Toggle value={marketingNotif} onChange={setMarketingNotif} />
        </SettingRow>
        <SettingRow label="安全告警" desc="异常登录、权限变更等安全事件实时通知">
          <Toggle value={securityNotif} onChange={setSecurityNotif} />
        </SettingRow>
      </SectionCard>
    );

    if (activeSection === 'security') return (
      <>
        <SectionCard title="登录安全">
          <SettingRow label="双因素认证" desc="登录时需通过 TOTP App 验证">
            <Toggle value={twoFactor} onChange={setTwoFactor} />
          </SettingRow>
          <SettingRow label="登录日志" desc="记录所有管理员登录行为">
            <Toggle value={loginLog} onChange={setLoginLog} />
          </SettingRow>
          <SettingRow label="自动登出" desc="30 分钟无操作自动退出登录">
            <Toggle value={autoLogout} onChange={setAutoLogout} />
          </SettingRow>
          <SettingRow label="IP 白名单" desc="只允许白名单 IP 地址访问管理后台">
            <Toggle value={ipWhitelist} onChange={setIpWhitelist} />
          </SettingRow>
        </SectionCard>
        <SectionCard title="密码策略">
          <SettingRow label="最短密码长度" desc="用户密码最少需包含的字符数">
            <select style={inputStyle(isManga)} defaultValue="8">
              <option value="6">6 位</option>
              <option value="8">8 位</option>
              <option value="12">12 位</option>
            </select>
          </SettingRow>
          <SettingRow label="密码有效期" desc="强制用户定期修改密码">
            <select style={inputStyle(isManga)} defaultValue="90">
              <option value="0">永不过期</option>
              <option value="30">30 天</option>
              <option value="90">90 天</option>
              <option value="180">180 天</option>
            </select>
          </SettingRow>
        </SectionCard>
      </>
    );

    if (activeSection === 'appearance') return (
      <SectionCard title="界面偏好">
        <SettingRow label="紧凑模式" desc="减小元素间距，显示更多内容">
          <Toggle value={compactMode} onChange={setCompactMode} />
        </SettingRow>
        <SettingRow label="动画效果" desc="开启页面切换与组件过渡动画">
          <Toggle value={animationsEnabled} onChange={setAnimationsEnabled} />
        </SettingRow>
        <SettingRow label="侧边栏默认状态" desc="进入后台时侧边栏的默认展开状态">
          <select value={sidebarDefault} onChange={e => setSidebarDefault(e.target.value)} style={inputStyle(isManga)}>
            <option value="expanded">展开</option>
            <option value="collapsed">收起（图标模式）</option>
          </select>
        </SettingRow>
      </SectionCard>
    );

    if (activeSection === 'storage') return (
      <SectionCard title="存储与 CDN">
        <SettingRow label="自动清理" desc="定期删除 30 天前的临时文件">
          <Toggle value={autoClean} onChange={setAutoClean} />
        </SettingRow>
        <SettingRow label="CDN 加速" desc="通过 CDN 节点分发静态资源">
          <Toggle value={cdnEnabled} onChange={setCdnEnabled} />
        </SettingRow>
        <SettingRow label="图片自动压缩" desc="上传图片时自动进行无损压缩">
          <Toggle value={imageCompress} onChange={setImageCompress} />
        </SettingRow>
        <SettingRow label="存储驱动" desc="媒体文件存储后端">
          <select style={inputStyle(isManga)} defaultValue="s3">
            <option value="local">本地存储</option>
            <option value="s3">Amazon S3</option>
            <option value="oss">阿里云 OSS</option>
            <option value="cos">腾讯云 COS</option>
          </select>
        </SettingRow>
      </SectionCard>
    );

    if (activeSection === 'email') return (
      <SectionCard title="SMTP 邮件服务器">
        <SettingRow label="SMTP 主机" desc="邮件服务器地址">
          <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} style={inputStyle(isManga)} />
        </SettingRow>
        <SettingRow label="SMTP 端口" desc="通常为 465（SSL）或 587（TLS）">
          <input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} style={inputStyle(isManga)} />
        </SettingRow>
        <SettingRow label="发件人邮箱" desc="系统邮件的发送账号">
          <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} style={inputStyle(isManga)} />
        </SettingRow>
        <SettingRow label="SSL/TLS 加密" desc="启用加密传输以保障邮件安全">
          <Toggle value={true} />
        </SettingRow>
      </SectionCard>
    );

    if (activeSection === 'mobile') return (
      <SectionCard title="移动端配置">
        <SettingRow label="移动端适配" desc="启用响应式布局与移动端 API">
          <Toggle value={mobileEnabled} onChange={setMobileEnabled} />
        </SettingRow>
        <SettingRow label="Deep Link" desc="支持 App 内链接跳转">
          <Toggle value={deepLink} onChange={setDeepLink} />
        </SettingRow>
        <SettingRow label="移动端强制登录" desc="访问内容前必须完成登录">
          <Toggle value={false} />
        </SettingRow>
      </SectionCard>
    );

    return null;
  };

  return (
    <AdminLayout>
      <div data-cmp="SettingsPage" className="p-6 min-h-full" style={{ background: 'var(--background)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>系统设置</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>管理系统全局配置项</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: primary }}
          >
            <SaveIcon size={15} />
            保存设置
          </button>
        </div>

        <div className="flex gap-5">
          {/* Left nav */}
          <div className="w-52 flex-shrink-0">
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              {SECTIONS.map(s => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm border-b last:border-b-0 transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    background: activeSection === s.key ? (isManga ? 'rgba(233,30,140,0.08)' : 'var(--accent)') : 'transparent',
                    color: activeSection === s.key ? primary : 'var(--foreground)',
                    borderLeft: activeSection === s.key ? `3px solid ${primary}` : '3px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span style={{ color: activeSection === s.key ? primary : 'var(--muted-foreground)' }}>{s.icon}</span>
                    <span className="font-medium">{s.label}</span>
                  </div>
                  <ChevronRightIcon size={14} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
