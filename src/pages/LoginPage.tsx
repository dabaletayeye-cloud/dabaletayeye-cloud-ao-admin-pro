import { FormEvent, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from '../lib/localizedToast';
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
import { login } from '../api';
import { apiMode } from '../api/adapter';
import { AUTH_CLIENT_ID, AUTH_USER_TYPE, TOKEN_STORAGE_KEY, scopedStorageKey } from '../api/authConfig';
import { accountClients } from '../config/accountClients';
import mockAuth from '../config/mockAuth';
import { useEdition } from '../core/EditionProvider';
import LocalizedText from '../components/LocalizedText';
import { getCurrentAccount, saveCurrentAccount, accountFromProfile } from '../lib/currentAccount';
import appConfig from '../config/app.json';
import './AuthPage.css';

type RegistrationResult = {
  name: string;
  email: string;
};

const ROLE_OPTIONS = [
  { value: 'super-admin', sourceLabel: '超级管理员', labelKey: 'auth.roleSuperAdmin' },
  { value: 'editor', sourceLabel: '内容运营', labelKey: 'auth.roleContentOperator' },
  { value: 'analyst', sourceLabel: '数据分析师', labelKey: 'auth.roleAnalyst' },
];

const REMEMBERED_ACCOUNT_KEY = scopedStorageKey('ao-admin-pro.remembered-account');

function getRememberedAccount() {
  if (apiMode === 'mock' && accountClients.enabled) {
    const type = AUTH_USER_TYPE || accountClients.clients[AUTH_CLIENT_ID]?.defaultUserType;
    return accountClients.demoAccounts.find(account => account.userType === type)?.username ?? '';
  }
  if (apiMode === 'mock') return (mockAuth.sysUserEnabled ? mockAuth.sysuser.username : mockAuth.username).trim();
  const configuredAccount = import.meta.env.VITE_DEFAULT_LOGIN_ACCOUNT?.trim() || '';
  if (typeof window === 'undefined') return configuredAccount;
  return window.localStorage.getItem(REMEMBERED_ACCOUNT_KEY) || configuredAccount;
}

function AuthVisual() {
  const { t } = useLocale();

  return (
    <aside className="auth-showcase" aria-label={t('auth.showcaseAria')}>
      <Link className="auth-brand" to="/" aria-label={t('auth.showcaseHomeAria')}>
        <span className="auth-brand-mark">
          <span />
          <span />
          <span />
        </span>
        <span>{appConfig.brand.name}</span>
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
          <span>{t('auth.protected')}</span>
        </div>
      </div>

      <div className="auth-showcase-copy">
        <p>{t('auth.showcaseTitle')}</p>
        <span>{t('auth.showcaseSubtitle')}</span>
      </div>
    </aside>
  );
}

export default function LoginPage() {
  const { refreshEdition } = useEdition();
  const navigate = useNavigate();
  const location = useLocation();
  const { themeState, toggleMode } = useTheme();
  const { locale, setLocale, t } = useLocale();
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

  const isRegister = location.pathname === '/register';
  const recovery = location.pathname === '/forgot-password';
  const activeRegistrationResult = isRegister ? registrationResult : null;
  const isVerified = verification >= 92;
  const passwordScore = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const passwordStrength = passwordScore <= 1
    ? { label: t('auth.weak'), level: 'weak' }
    : passwordScore <= 3
      ? { label: t('auth.medium'), level: 'medium' }
      : { label: t('auth.strong'), level: 'strong' };

  const switchMode = (nextMode: 'login' | 'register') => {
    setPassword('');
    setConfirmPassword('');
    setVerification(0);
    setRegistrationResult(null);
    navigate(nextMode === 'login' ? '/login' : '/register');
  };

  const completeVerification = (value: number) => {
    setVerification(value >= 92 ? 100 : value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (recovery) {
      if (!email.trim()) {
        toast.error(t('auth.recoveryEmailRequired'));
        return;
      }
      toast.success(t('auth.resetLinkSent'));
      navigate('/login');
      return;
    }

    if (isRegister) {
      if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
        toast.error(t('auth.registrationRequired'));
        return;
      }
      if (password.length < 6) {
        toast.error(t('auth.passwordMin'));
        return;
      }
      if (password !== confirmPassword) {
        toast.error(t('auth.passwordMismatch'));
        return;
      }
      if (!agreed) {
        toast.error(t('auth.termsRequired'));
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
        toast.success(t('auth.accountCreated'));
      }, 700);
      return;
    }

    if (!account.trim() || !password) {
      toast.error(t('auth.accountPasswordRequired'));
      return;
    }
    if (!isVerified) {
      toast.error(t('auth.securityVerificationRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const { token, accessToken = token, refreshToken, user } = await login({ username: account.trim(), password });
      const tokenStorage = remember ? window.localStorage : window.sessionStorage;
      const otherStorage = remember ? window.sessionStorage : window.localStorage;
      tokenStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }));
      otherStorage.removeItem(TOKEN_STORAGE_KEY);
      saveCurrentAccount(accountFromProfile(user));
      await refreshEdition();
    } catch (error) {
      setSubmitting(false);
      toast.error(error instanceof Error ? error.message : '登录失败');
      return;
    }
    window.setTimeout(() => {
      if (remember) {
        window.localStorage.setItem(REMEMBERED_ACCOUNT_KEY, account.trim());
      } else {
        window.localStorage.removeItem(REMEMBERED_ACCOUNT_KEY);
      }
      setSubmitting(false);
      toast.success(remember ? t('auth.signInRemembered') : t('auth.signInSuccess'));
      navigate('/');
    }, 700);
  };

  const pageTitle = activeRegistrationResult ? t('auth.accountCreatedTitle') : recovery ? t('auth.passwordRecoveryTitle') : isRegister ? t('auth.createAccountTitle') : t('auth.welcomeBack');
  const pageDescription = activeRegistrationResult
    ? t('auth.accountCreatedDescription')
    : recovery
    ? t('auth.passwordRecoveryDescription')
    : isRegister
      ? t('auth.createAccountDescription')
      : t('auth.signInDescription');

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
                title={themeState.mode === 'dark' ? t('auth.switchToLight') : t('auth.switchToDark')}
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

            {!recovery && !activeRegistrationResult && (
              <div className="auth-mode-tabs" role="tablist" aria-label={t('auth.authMethod')}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isRegister}
                  className={!isRegister ? 'is-active' : ''}
                  onClick={() => switchMode('login')}
                >
                  {t('auth.loginNow')}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isRegister}
                  className={isRegister ? 'is-active' : ''}
                  onClick={() => switchMode('register')}
                >
                  {t('auth.register')}
                </button>
              </div>
            )}

            {activeRegistrationResult ? (
              <section className="auth-registration-result" aria-live="polite">
                <div className="auth-result-icon"><CheckCircle2Icon size={25} /></div>
                <div className="auth-result-copy">
                  <strong>{activeRegistrationResult.name}</strong>
                  <span>{t('auth.joined')}</span>
                </div>
                <dl className="auth-result-details">
                  <div>
                    <dt>{t('auth.account')}</dt>
                    <dd>{activeRegistrationResult.name}</dd>
                  </div>
                  <div>
                    <dt>{t('auth.email')}</dt>
                    <dd><MailIcon size={15} />{activeRegistrationResult.email}</dd>
                  </div>
                </dl>
                <button className="auth-submit" type="button" onClick={() => switchMode('login')}>
                  {t('auth.loginNow')}
                </button>
              </section>
            ) : <form className="auth-form" onSubmit={handleSubmit}>
              {recovery ? (
                <label className="auth-field">
                  <span>{t('auth.emailAddress')}</span>
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
                    <span>{t('auth.name')}</span>
                    <div className="auth-input-wrap">
                      <UserRoundIcon size={17} />
                      <input
                        autoFocus
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder={t('auth.namePlaceholder')}
                        autoComplete="name"
                      />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>{t('auth.emailAddress')}</span>
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
                    <span>{t('auth.loginRole')}</span>
                    <div className="auth-select-wrap">
                      <select value={role} onChange={(event) => setRole(event.target.value)}>
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
                        ))}
                      </select>
                      <ChevronDownIcon size={17} />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>{t('auth.account')}</span>
                    <div className="auth-input-wrap">
                      <UserRoundIcon size={17} />
                      <input
                        autoFocus
                        value={account}
                        onChange={(event) => setAccount(event.target.value)}
                        placeholder={t('auth.usernamePlaceholder')}
                        autoComplete="username"
                      />
                    </div>
                  </label>
                </>
              )}

              {!recovery && (
                <>
                  <label className="auth-field">
                    <span>{t('auth.password')}</span>
                    <div className="auth-input-wrap">
                      <LockKeyholeIcon size={17} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={isRegister ? t('auth.passwordMinPlaceholder') : t('auth.passwordPlaceholder')}
                        autoComplete={isRegister ? 'new-password' : 'current-password'}
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowPassword((visible) => !visible)}
                        title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      >
                        {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                      </button>
                    </div>
                  </label>

                  {isRegister && password && (
                    <div className={'auth-password-strength level-' + passwordStrength.level} aria-live="polite">
                      <span>{t('auth.passwordStrength')}</span>
                      <div aria-hidden="true"><i /><i /><i /></div>
                      <em>{passwordStrength.label}</em>
                    </div>
                  )}

                  {isRegister && (
                    <label className="auth-field">
                      <span>{t('auth.confirmPassword')}</span>
                      <div className="auth-input-wrap">
                        <LockKeyholeIcon size={17} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder={t('auth.confirmPasswordPlaceholder')}
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
                  <span>{isVerified ? t('auth.verificationPassed') : t('auth.verificationHint')}</span>
                  <input
                    aria-label={t('auth.verificationAria')}
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
                    <em>{t('auth.rememberPassword')}</em>
                  </label>
                  <button type="button" onClick={() => navigate('/forgot-password')}>{t('auth.forgotPassword')}</button>
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
                  <em>{t('auth.terms')}</em>
                </label>
              )}

              <button className="auth-submit" type="submit" disabled={submitting}>
                {submitting ? <i /> : null}
                {submitting ? t('auth.processing') : recovery ? t('auth.sendResetLink') : isRegister ? t('auth.createAccount') : t('auth.loginNow')}
              </button>
            </form>}

            {!activeRegistrationResult && <div className="auth-footer">
              {recovery ? (
                <button type="button" onClick={() => navigate('/login')}>{t('auth.backToLogin')}</button>
              ) : isRegister ? (
                <p>{t('auth.haveAccount')}<button type="button" onClick={() => switchMode('login')}>{t('auth.loginNow')}</button></p>
              ) : (
                <p>{t('auth.noAccount')}<button type="button" onClick={() => switchMode('register')}>{t('auth.register')}</button></p>
              )}
            </div>}
          </div>

          <footer className="auth-copyright">{appConfig.copyright}</footer>
        </section>
      </div></LocalizedText>
      <ThemePanel open={themePanelOpen} onClose={() => setThemePanelOpen(false)} />
    </main>
  );
}
