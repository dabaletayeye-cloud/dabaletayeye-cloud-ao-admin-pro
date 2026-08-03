import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggleButtons } from '../components/ThemePanel';
import ThemeBackground from '../components/ThemeBackground';
import { EyeIcon, EyeOffIcon, LogInIcon } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1200);
  };

  const brandGradient = isManga
    ? themeState.mode === 'light'
      ? 'linear-gradient(135deg, #E91E8C 0%, #C084FC 60%, #F472B6 100%)'
      : 'linear-gradient(135deg, #1a0a2e 0%, #3b0764 60%, #1e0542 100%)'
    : themeState.themeId === 'purple'
    ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
    : themeState.themeId === 'mono'
    ? 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)'
    : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';

  return (
    <div data-cmp="LoginPage" className="min-h-screen flex relative overflow-hidden" style={{ background: 'var(--background)' }}>
      <ThemeBackground />

      {/* Left brand panel */}
      <div
        className="hidden md:flex flex-col items-center justify-center flex-shrink-0 relative overflow-hidden"
        style={{ width: '45%', background: brandGradient }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full opacity-15" style={{ background: 'rgba(255,255,255,0.4)' }} />
        <div className="absolute top-1/3 right-8 w-32 h-32 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.5)' }} />

        <div className="relative z-10 text-center text-white px-8">
          {/* Logo icon */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)' }}
          >
            {isManga ? '🌸' : '🛡️'}
          </div>
          <h1 className="text-3xl font-bold mb-3">
            {isManga ? 'Manga AdminPro' : 'AdminPro'}
          </h1>
          <p className="text-base opacity-80 leading-relaxed mb-8">
            {isManga
              ? '✨ 专业的漫剧工坊管理系统\n一站式平台内容运营解决方案'
              : '专业的企业级后台管理系统\n一站式数据运营解决方案'}
          </p>
          {/* Feature pills */}
          {(isManga
            ? ['🌸 创作者管理', '💫 内容运营', '✨ 数据分析']
            : ['📊 数据可视化', '👥 用户管理', '⚙️ 系统设置']
          ).map(feature => (
            <div
              key={feature}
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mr-2 mb-2"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4">
          <Link to="/" className="text-sm font-medium no-underline" style={{ color: 'var(--muted-foreground)' }}>
            ← 返回首页
          </Link>
          <ThemeToggleButtons onOpenPanel={() => {}} />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div
            className="w-full max-w-sm"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--foreground)' }}>
                {isManga ? '✨ 登录账户' : '登录账户'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                请输入您的邮箱和密码
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    background: 'var(--muted)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                  密码
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all"
                    style={{
                      background: 'var(--muted)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {showPwd ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer"
                    style={{
                      borderColor: remember ? 'var(--primary)' : 'var(--border)',
                      background: remember ? 'var(--primary)' : 'transparent',
                    }}
                    onClick={() => setRemember(v => !v)}
                  >
                    {remember && <span className="text-white" style={{ fontSize: 9, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>记住我</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('密码找回邮件已发送')}
                  className="text-sm font-medium"
                  style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  忘记密码？
                </button>
              </div>

              {/* Error */}
              <div
                className="rounded-lg px-3 py-2 text-sm"
                style={{
                  display: error ? 'block' : 'none',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#EF4444',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {error}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isManga ? 'manga-glow-btn' : ''}`}
                style={{
                  background: loading ? 'var(--muted)' : 'var(--primary)',
                  color: loading ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: 'var(--primary-foreground)', borderTopColor: 'transparent' }}
                    />
                    登录中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogInIcon size={16} />
                    {isManga ? '✨ 登录' : '登录'}
                  </span>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-xs text-center mt-8" style={{ color: 'var(--muted-foreground)' }}>
              © 2025 AdminPro · 专业管理后台
              {isManga && <span> 🌸</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
