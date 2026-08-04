import { FormEvent, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  CheckIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
  FolderCheckIcon,
  Globe2Icon,
  LockKeyholeIcon,
  MailIcon,
  MoonIcon,
  ShieldCheckIcon,
  SlidersIcon,
  SparklesIcon,
  SunIcon,
  UserRoundIcon,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { LANGUAGE_OPTIONS, useLocale } from '../hooks/useLocale';
import ThemePanel from '../components/ThemePanel';
import LocalizedText from '../components/LocalizedText';
import { getCurrentAccount, saveCurrentAccount } from '../lib/currentAccount';
import './AuthPage.css';

type AuthMode = 'login' | 'register';

type RegistrationResult = {
  name: string;
  email: string;
};

const ROLE_OPTIONS = [
  { value: 'super-admin', label: '超级管理员' },
  { value: 'editor', label: '内容运营' },
  { value: 'analyst', label: '数据分析师' },
];

const REMEMBERED_ACCOUNT_KEY = 'ao-admin-pro.remembered-account';

function getRememberedAccount() {
  if (typeof window === 'undefined') return 'Super';
  return window.localStorage.getItem(REMEMBERED_ACCOUNT_KEY) || 'Super';
}

function AuthVisual() {
  return (
    <aside className="auth-showcase" aria-label="ao-admin-pro 产品展示">
      <Link className="auth-brand" to="/" aria-label="返回 ao-admin-pro 首页">
        <span className="auth-brand-mark">
          <span />
          <span />
          <span />
        </span>
        <span>ao-admin-pro</span>
      </Link>

      <div className="auth-display" aria-hidden="true">
        <div className="auth-display-orbit" />
        <div className="auth-display-spark auth-display-spark-one" />
        <div className="auth-display-spark auth-display-spark-two" />
        <div className="auth-monitor">
          <div className="auth-monitor-bar">
            <span />
            <span />
            <span />
          </div>
          <div className="auth-monitor-content">
            <div className="auth-monitor-rail">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="auth-monitor-main">
              <div className="auth-monitor-line auth-monitor-line-short" />
              <div className="auth-monitor-line" />
              <div className="auth-monitor-chart">
                <span className="chart-column-one" />
                <span className="chart-column-two" />
                <span className="chart-column-three" />
                <span className="chart-column-four" />
                <span className="chart-column-five" />
              </div>
            </div>
          </div>
        </div>

        <div className="auth-folder">
          <div className="auth-folder-tab" />
          <div className="auth-folder-body">
            <FolderCheckIcon size={52} strokeWidth={1.55} />
            <div className="auth-folder-check">
              <CheckIcon size={15} strokeWidth={3} />
            </div>
          </div>
        </div>

        <div className="auth-security-badge">
          <ShieldCheckIcon size={20} />
          <span>受保护</span>
        </div>
      </div>

      <div className="auth-showcase-copy">
        <p>面向高效团队的管理工作台</p>
        <span>让数据、内容与协作保持在同一节奏</span>
      </div>
    </aside>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeState, toggleMode } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [mode, setMode] = useState<AuthMode>(location.pathname === '/register' ? 'register' : 'login');
  const [recovery, setRecovery] = useState(false);
  const [role, setRole] = useState('super-admin');
  const [account, setAccount] = useState(getRememberedAccount);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [verification, setVerification] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);

  const isRegister = mode === 'register';
  const isVerified = verification >= 92;
  const passwordScore = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const passwordStrength = passwordScore <= 1
    ? { label: '弱', level: 'weak' }
    : passwordScore <= 3
      ? { label: '中', level: 'medium' }
      : { label: '强', level: 'strong' };

  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login');
    setRecovery(false);
    setRegistrationResult(null);
  }, [location.pathname]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setRecovery(false);
    setPassword('');
    setConfirmPassword('');
    setVerification(0);
    setRegistrationResult(null);
    navigate(nextMode === 'login' ? '/login' : '/register');
  };

  const completeVerification = (value: number) => {
    setVerification(value >= 92 ? 100 : value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (recovery) {
      if (!email.trim()) {
        toast.error('请输入用于找回账号的邮箱');
        return;
      }
      toast.success('重置链接已发送，请查看邮箱');
      setRecovery(false);
      return;
    }

    if (isRegister) {
      if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
        toast.error('请完整填写注册信息');
        return;
      }
      if (password.length < 6) {
        toast.error('密码至少需要 6 位');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('两次输入的密码不一致');
        return;
      }
      if (!agreed) {
        toast.error('请先同意服务条款与隐私政策');
        return;
      }

      setSubmitting(true);
      window.setTimeout(() => {
        const registeredAccount = displayName.trim();
        saveCurrentAccount({
          ...getCurrentAccount(),
          name: registeredAccount,
          account: registeredAccount,
          email: email.trim(),
          role: '普通用户',
          department: '产品体验组',
          avatar: '',
        });
        window.localStorage.setItem(REMEMBERED_ACCOUNT_KEY, registeredAccount);
        setAccount(registeredAccount);
        setRemember(true);
        setSubmitting(false);
        setRegistrationResult({ name: registeredAccount, email: email.trim() });
        toast.success('账号创建成功');
      }, 700);
      return;
    }

    if (!account.trim() || !password) {
      toast.error('请输入账号和密码');
      return;
    }
    if (!isVerified) {
      toast.error('请先完成安全验证');
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      const selectedRole = ROLE_OPTIONS.find((option) => option.value === role)?.label ?? '普通用户';
      const savedAccount = getCurrentAccount();
      saveCurrentAccount({
        ...savedAccount,
        account: account.trim(),
        name: account.trim() === 'Super' ? savedAccount.name : account.trim(),
        role: selectedRole,
      });
      if (remember) {
        window.localStorage.setItem(REMEMBERED_ACCOUNT_KEY, account.trim());
      } else {
        window.localStorage.removeItem(REMEMBERED_ACCOUNT_KEY);
      }
      setSubmitting(false);
      toast.success(remember ? '登录成功，已记住本次登录' : '登录成功');
      navigate('/');
    }, 700);
  };

  const pageTitle = registrationResult ? '账号创建完成' : recovery ? '找回密码' : isRegister ? '创建账号' : '欢迎回来';
  const pageDescription = registrationResult
    ? '账号已保存，现在可以使用新账号登录'
    : recovery
    ? '输入注册邮箱，我们将发送重置链接'
    : isRegister
      ? '填写信息，开始使用 ao-admin-pro'
      : '输入您的账号和密码登录';

  return (
    <main className="auth-page">
      <LocalizedText><div className="auth-frame">
        <AuthVisual />

        <section className="auth-main" aria-labelledby="auth-title">
          <header className="auth-toolbar">
            <Link className="auth-back" to="/" title={t('backHome')}>
              <ArrowLeftIcon size={16} />
              <span>{t('backHome')}</span>
            </Link>
            <div className="auth-toolbar-actions">
              <button
                type="button"
                className="auth-icon-button"
                title={t('themeSettings')}
                onClick={() => setThemePanelOpen(true)}
              >
                <SlidersIcon size={17} />
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="auth-icon-button"
                  title={t('languagePreference')}
                  aria-label={t('languagePreference')}
                  aria-expanded={languageMenuOpen}
                  onClick={() => setLanguageMenuOpen((open) => !open)}
                >
                  <Globe2Icon size={17} />
                </button>
                {languageMenuOpen && (
                  <div role="menu" aria-label={t('languagePreference')} style={{ position: 'absolute', right: 0, top: 38, zIndex: 30, minWidth: 180, padding: 6, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--popover)', boxShadow: '0 10px 28px rgba(0,0,0,.14)' }}>
                    {LANGUAGE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={locale === option.value}
                        onClick={() => {
                          setLocale(option.value);
                          setLanguageMenuOpen(false);
                          toast.success(`${t('languageChanged')}：${option.nativeLabel}`);
                        }}
                        style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 9px', color: locale === option.value ? 'var(--primary)' : 'var(--foreground)', background: 'transparent', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: locale === option.value ? 700 : 400, textAlign: 'left' }}
                        onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--accent)'; }}
                        onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{option.nativeLabel}</span>
                        <small style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{option.label}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="auth-icon-button"
                title={themeState.mode === 'dark' ? '切换到亮色' : '切换到暗色'}
                onClick={toggleMode}
              >
                {themeState.mode === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
              </button>
            </div>
          </header>

          <div className="auth-form-wrap">
            <div className="auth-heading">
              <h1 id="auth-title">{pageTitle}</h1>
              <p>{pageDescription}</p>
            </div>

            {!recovery && !registrationResult && (
              <div className="auth-mode-tabs" role="tablist" aria-label="认证方式">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isRegister}
                  className={!isRegister ? 'is-active' : ''}
                  onClick={() => switchMode('login')}
                >
                  登录
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isRegister}
                  className={isRegister ? 'is-active' : ''}
                  onClick={() => switchMode('register')}
                >
                  注册
                </button>
              </div>
            )}

            {registrationResult ? (
              <section className="auth-registration-result" aria-live="polite">
                <div className="auth-result-icon"><CheckCircle2Icon size={25} /></div>
                <div className="auth-result-copy">
                  <strong>{registrationResult.name}</strong>
                  <span>已加入 ao-admin-pro</span>
                </div>
                <dl className="auth-result-details">
                  <div>
                    <dt>账号</dt>
                    <dd>{registrationResult.name}</dd>
                  </div>
                  <div>
                    <dt>邮箱</dt>
                    <dd><MailIcon size={15} />{registrationResult.email}</dd>
                  </div>
                </dl>
                <button className="auth-submit" type="button" onClick={() => switchMode('login')}>
                  立即登录
                </button>
              </section>
            ) : <form className="auth-form" onSubmit={handleSubmit}>
              {recovery ? (
                <label className="auth-field">
                  <span>邮箱地址</span>
                  <div className="auth-input-wrap">
                    <UserRoundIcon size={17} />
                    <input
                      autoFocus
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </div>
                </label>
              ) : isRegister ? (
                <>
                  <label className="auth-field">
                    <span>姓名</span>
                    <div className="auth-input-wrap">
                      <UserRoundIcon size={17} />
                      <input
                        autoFocus
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="请输入姓名"
                        autoComplete="name"
                      />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>邮箱地址</span>
                    <div className="auth-input-wrap">
                      <UserRoundIcon size={17} />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="name@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </label>
                </>
              ) : (
                <>
                  <label className="auth-field">
                    <span>登录角色</span>
                    <div className="auth-select-wrap">
                      <select value={role} onChange={(event) => setRole(event.target.value)}>
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <ChevronDownIcon size={17} />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>账号</span>
                    <div className="auth-input-wrap">
                      <UserRoundIcon size={17} />
                      <input
                        autoFocus
                        value={account}
                        onChange={(event) => setAccount(event.target.value)}
                        placeholder="请输入账号"
                        autoComplete="username"
                      />
                    </div>
                  </label>
                </>
              )}

              {!recovery && (
                <>
                  <label className="auth-field">
                    <span>密码</span>
                    <div className="auth-input-wrap">
                      <LockKeyholeIcon size={17} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={isRegister ? '至少 6 位字符' : '请输入密码'}
                        autoComplete={isRegister ? 'new-password' : 'current-password'}
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowPassword((visible) => !visible)}
                        title={showPassword ? '隐藏密码' : '显示密码'}
                      >
                        {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                      </button>
                    </div>
                  </label>

                  {isRegister && password && (
                    <div className={'auth-password-strength level-' + passwordStrength.level} aria-live="polite">
                      <span>密码强度</span>
                      <div aria-hidden="true"><i /><i /><i /></div>
                      <em>{passwordStrength.label}</em>
                    </div>
                  )}

                  {isRegister && (
                    <label className="auth-field">
                      <span>确认密码</span>
                      <div className="auth-input-wrap">
                        <LockKeyholeIcon size={17} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="再次输入密码"
                          autoComplete="new-password"
                        />
                      </div>
                    </label>
                  )}
                </>
              )}

              {!isRegister && !recovery && (
                <div
                  className={'auth-verification ' + (isVerified ? 'is-verified' : '')}
                  style={{ '--auth-verification-progress': verification + '%' } as CSSProperties}
                >
                  <span className="auth-verification-handle">
                    {isVerified ? <CheckIcon size={16} strokeWidth={3} /> : <SparklesIcon size={15} />}
                  </span>
                  <span>{isVerified ? '验证通过' : '拖动滑块完成验证'}</span>
                  <input
                    aria-label="安全验证滑块"
                    type="range"
                    min="0"
                    max="100"
                    value={verification}
                    onChange={(event) => completeVerification(Number(event.target.value))}
                  />
                </div>
              )}

              {!isRegister && !recovery && (
                <div className="auth-form-options">
                  <label className="auth-check">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                    />
                    <span><CheckIcon size={12} strokeWidth={3} /></span>
                    <em>记住密码</em>
                  </label>
                  <button type="button" onClick={() => setRecovery(true)}>忘记密码</button>
                </div>
              )}

              {isRegister && (
                <label className="auth-check auth-terms">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                  />
                  <span><CheckIcon size={12} strokeWidth={3} /></span>
                  <em>我已阅读并同意服务条款与隐私政策</em>
                </label>
              )}

              <button className="auth-submit" type="submit" disabled={submitting}>
                {submitting ? <i /> : null}
                {submitting ? '处理中...' : recovery ? '发送重置链接' : isRegister ? '创建账号' : '登录'}
              </button>
            </form>}

            {!registrationResult && <div className="auth-footer">
              {recovery ? (
                <button type="button" onClick={() => setRecovery(false)}>返回登录</button>
              ) : isRegister ? (
                <p>已有账号？<button type="button" onClick={() => switchMode('login')}>立即登录</button></p>
              ) : (
                <p>还没有账号？<button type="button" onClick={() => switchMode('register')}>注册</button></p>
              )}
            </div>}
          </div>

          <footer className="auth-copyright">© 2026 ao-admin-pro</footer>
        </section>
      </div></LocalizedText>
      <ThemePanel open={themePanelOpen} onClose={() => setThemePanelOpen(false)} />
    </main>
  );
}
