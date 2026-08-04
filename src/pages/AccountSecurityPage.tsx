import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  LogOutIcon,
  MailCheckIcon,
  MonitorIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getCurrentAccount } from '../lib/currentAccount';

const inputStyle = {
  width: '100%',
  height: 40,
  padding: '0 40px 0 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--foreground)',
  outline: 'none',
  fontSize: 14,
};

const cardStyle = {
  borderColor: 'var(--border)',
  background: 'var(--card)',
  boxShadow: 'var(--shadow-x) var(--shadow-y) var(--shadow-blur) var(--shadow-spread) var(--shadow-color)',
};

function SecurityToggle({ enabled, onClick, label }: { enabled: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={enabled}
      className="relative h-6 w-11 shrink-0 rounded-full border-0 p-0 transition-colors"
      style={{ background: enabled ? 'var(--primary)' : 'var(--border)', cursor: 'pointer' }}
    >
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform" style={{ left: 2, transform: enabled ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  );
}

export default function AccountSecurityPage() {
  const navigate = useNavigate();
  const account = getCurrentAccount();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [otherDeviceActive, setOtherDeviceActive] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [trustedBrowser, setTrustedBrowser] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const updatePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('请完整填写密码信息');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('新密码至少需要 8 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('密码已更新，下次登录请使用新密码');
  };

  const toggleMfa = () => {
    setMfaEnabled((enabled) => {
      toast.success(enabled ? '已关闭双重验证' : '双重验证已开启');
      return !enabled;
    });
  };

  const signOutOtherDevices = () => {
    setOtherDeviceActive(false);
    toast.success('其他登录设备已退出');
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 6 }, (_, index) => 'AO-' + String(index + 1).padStart(2, '0') + '-' + Math.random().toString(36).slice(2, 8).toUpperCase());
    setBackupCodes(codes);
    toast.success('已生成 6 个备用验证码');
  };

  const copyBackupCodes = async () => {
    if (backupCodes.length === 0) {
      toast.error('请先生成备用验证码');
      return;
    }
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'));
      toast.success('备用验证码已复制');
    } catch {
      toast.error('复制失败，请手动保存验证码');
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="m-0 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>账号安全</h1>
            <p className="mb-0 mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>管理密码、验证方式和已登录设备</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: 'var(--accent)', color: 'var(--primary)' }}>
            <ShieldCheckIcon size={15} />
            安全状态良好
          </span>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ['安全评分', mfaEnabled ? '94 分' : '82 分', mfaEnabled ? '双重验证已开启' : '开启双重验证可提升评分'],
            ['保护项目', loginAlerts ? '5 / 6' : '4 / 6', '密码、邮箱、设备与登录保护'],
            ['上次密码更新', '2026-07-16', '建议每 90 天更新一次'],
          ].map(([label, value, note], index) => (
            <div key={label} className="rounded-xl border px-4 py-3.5" style={cardStyle}>
              <span className="flex items-center justify-between">
                <small style={{ color: 'var(--muted-foreground)' }}>{label}</small>
                {index === 0 ? <ShieldCheckIcon size={17} style={{ color: 'var(--primary)' }} /> : index === 1 ? <CheckCircle2Icon size={17} style={{ color: 'var(--primary)' }} /> : <KeyRoundIcon size={17} style={{ color: 'var(--primary)' }} />}
              </span>
              <strong className="mt-1 block text-lg" style={{ color: 'var(--foreground)' }}>{value}</strong>
              <em className="mt-1 block text-xs not-italic" style={{ color: 'var(--muted-foreground)' }}>{note}</em>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <form onSubmit={updatePassword} className="rounded-xl border p-6" style={cardStyle}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>修改登录密码</h2>
                  <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>建议使用包含字母、数字和符号的强密码</p>
                </div>
                <KeyRoundIcon size={21} style={{ color: 'var(--primary)' }} />
              </div>

              <div className="grid gap-4">
                {[
                  ['当前密码', oldPassword, setOldPassword, '请输入当前密码'],
                  ['新密码', newPassword, setNewPassword, '至少 8 位字符'],
                  ['确认新密码', confirmPassword, setConfirmPassword, '再次输入新密码'],
                ].map(([label, value, onChange, placeholder]) => (
                  <label key={label as string} className="grid gap-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {label as string}
                    <span className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={value as string}
                        onChange={(event) => (onChange as (next: string) => void)(event.target.value)}
                        placeholder={placeholder as string}
                        autoComplete="new-password"
                        style={inputStyle}
                      />
                      <button type="button" onClick={() => setShowPasswords((shown) => !shown)} title={showPasswords ? '隐藏密码' : '显示密码'} className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent" style={{ color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                        {showPasswords ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                      </button>
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-5 flex justify-end">
                <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: 'var(--primary)', borderColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  <LockKeyholeIcon size={16} />
                  更新密码
                </button>
              </div>
            </form>

            <section className="rounded-xl border p-6" style={cardStyle}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>登录设备</h2>
                  <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>可以查看并管理账号的登录设备</p>
                </div>
                <MonitorIcon size={21} style={{ color: 'var(--primary)' }} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--accent)', color: 'var(--primary)' }}><MonitorIcon size={18} /></span>
                    <span className="min-w-0">
                      <strong className="block text-sm" style={{ color: 'var(--foreground)' }}>当前设备 · Windows 系统浏览器</strong>
                      <small className="mt-1 block truncate" style={{ color: 'var(--muted-foreground)' }}>刚刚活跃 · 中国大陆</small>
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold" style={{ color: 'var(--primary)' }}>当前设备</span>
                </div>

                {otherDeviceActive ? (
                  <div className="flex items-center justify-between gap-4 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}><MonitorIcon size={18} /></span>
                      <span className="min-w-0">
                        <strong className="block text-sm" style={{ color: 'var(--foreground)' }}>谷歌浏览器 · 苹果电脑</strong>
                        <small className="mt-1 block truncate" style={{ color: 'var(--muted-foreground)' }}>今天 09:20 · 上海</small>
                      </span>
                    </span>
                    <button type="button" onClick={signOutOtherDevices} className="shrink-0 rounded-md border bg-transparent px-3 py-1.5 text-xs font-semibold hover:bg-accent" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', cursor: 'pointer' }}>退出设备</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--secondary)' }}>
                    <CheckCircle2Icon size={17} style={{ color: 'var(--primary)' }} />
                    当前没有其他活跃设备
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl border p-6" style={cardStyle}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>登录保护</h2>
                  <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>在异常情况发生时及时保护账号</p>
                </div>
                <AlertTriangleIcon size={21} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
                  <span>
                    <strong className="block text-sm" style={{ color: 'var(--foreground)' }}>异常登录提醒</strong>
                    <small style={{ color: 'var(--muted-foreground)' }}>新设备或异地登录时发送通知</small>
                  </span>
                  <SecurityToggle enabled={loginAlerts} label="切换异常登录提醒" onClick={() => { setLoginAlerts((value) => !value); toast.success(loginAlerts ? '已关闭异常登录提醒' : '已开启异常登录提醒'); }} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
                  <span>
                    <strong className="block text-sm" style={{ color: 'var(--foreground)' }}>信任当前浏览器</strong>
                    <small style={{ color: 'var(--muted-foreground)' }}>30 天内减少重复验证</small>
                  </span>
                  <SecurityToggle enabled={trustedBrowser} label="切换当前浏览器信任状态" onClick={() => { setTrustedBrowser((value) => !value); toast.success(trustedBrowser ? '已取消信任当前浏览器' : '已信任当前浏览器'); }} />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-xl border p-6" style={cardStyle}>
              <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>双重验证</h2>
              <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted-foreground)' }}>登录时需额外验证，可有效保护账户安全。</p>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
                <span>
                  <strong className="block text-sm" style={{ color: 'var(--foreground)' }}>{mfaEnabled ? '已开启' : '未开启'}</strong>
                  <small style={{ color: 'var(--muted-foreground)' }}>{mfaEnabled ? '登录需进行二次验证' : '建议开启以增强保护'}</small>
                </span>
                <button type="button" onClick={toggleMfa} aria-pressed={mfaEnabled} className="relative h-6 w-11 rounded-full border-0 p-0 transition-colors" style={{ background: mfaEnabled ? 'var(--primary)' : 'var(--border)', cursor: 'pointer' }}>
                  <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform" style={{ left: 2, transform: mfaEnabled ? 'translateX(20px)' : 'translateX(0)' }} />
                </button>
              </div>
            </section>

            <section className="rounded-xl border p-6" style={cardStyle}>
              <div className="flex items-center gap-2">
                <MailCheckIcon size={19} style={{ color: 'var(--primary)' }} />
                <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>验证邮箱</h2>
              </div>
              <p className="mb-3 mt-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{account.email}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                <CheckCircle2Icon size={14} />
                已完成验证
              </span>
            </section>

            <section className="rounded-xl border p-6" style={cardStyle}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>账户恢复</h2>
                  <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>备用验证码可在无法完成验证时使用</p>
                </div>
                <RefreshCwIcon size={19} style={{ color: 'var(--primary)' }} />
              </div>
              {backupCodes.length > 0 ? (
                <div className="mt-4 rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code) => <code key={code} className="rounded bg-[var(--card)] px-2 py-1 text-center text-[11px]" style={{ color: 'var(--foreground)' }}>{code}</code>)}
                  </div>
                  <button type="button" onClick={copyBackupCodes} className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border bg-transparent text-xs font-semibold hover:bg-accent" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    <CopyIcon size={14} />
                    复制备用验证码
                  </button>
                </div>
              ) : (
                <p className="mb-0 mt-4 rounded-lg border px-3 py-2.5 text-xs leading-5" style={{ borderColor: 'var(--border)', background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>生成后请保存到安全位置；每个验证码仅可使用一次。</p>
              )}
              <button type="button" onClick={generateBackupCodes} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold hover:bg-accent" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'transparent' }}>
                <KeyRoundIcon size={14} />
                {backupCodes.length > 0 ? '重新生成验证码' : '生成备用验证码'}
              </button>
            </section>

            <section className="rounded-xl border p-6" style={cardStyle}>
              <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>登录记录</h2>
              <div className="mt-4 space-y-3">
                {[
                  ['Windows 系统浏览器', '刚刚 · 中国大陆'],
                  ['谷歌浏览器 · 苹果电脑', '今天 09:20 · 上海'],
                  ['系统设置变更', '昨天 16:45 · 中国大陆'],
                ].map(([title, detail]) => (
                  <div key={title} className="border-b pb-3 last:border-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                    <strong className="block text-sm" style={{ color: 'var(--foreground)' }}>{title}</strong>
                    <small className="mt-1 block" style={{ color: 'var(--muted-foreground)' }}>{detail}</small>
                  </div>
                ))}
              </div>
            </section>

            <button type="button" onClick={() => { toast.success('已退出登录'); navigate('/login'); }} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border bg-transparent text-sm font-semibold transition-colors hover:bg-accent" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <LogOutIcon size={16} />
              退出当前账号
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
