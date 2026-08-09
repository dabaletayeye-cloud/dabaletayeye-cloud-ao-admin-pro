import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getGenerationQuotas, updateGenerationQuotas, type GenerationQuotas } from '../api/systemConfig';
import { toast } from '../lib/localizedToast';
import { useTheme } from '../hooks/useTheme';
import { CheckCircleIcon, SaveIcon, SparklesIcon } from 'lucide-react';

const MANGA_PINK = '#E91E8C';

const DEFAULT_QUOTAS: GenerationQuotas = {
  proScriptGenerateLimit: 100,
  proRewriteLimit: 200,
  proAdaptCardsLimit: 100,
};

export default function GenerationQuotaPage() {
  const { themeState } = useTheme();
  const primary = themeState.themeId === 'manga' ? MANGA_PINK : 'var(--primary)';
  const [quotas, setQuotas] = useState<GenerationQuotas>(DEFAULT_QUOTAS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    getGenerationQuotas()
      .then((value) => { if (active) setQuotas(value); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : '生成配额加载失败'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const setQuota = (key: keyof GenerationQuotas, value: string) => {
    setQuotas((current) => ({ ...current, [key]: value === '' ? 0 : Number(value) }));
    setSaved(false);
  };

  const save = async () => {
    if (Object.values(quotas).some((value) => !Number.isInteger(value) || value < 1 || value > 100000)) {
      toast.error('配额需为 1 到 100000 的整数');
      return;
    }
    setSaving(true);
    try {
      setQuotas(await updateGenerationQuotas(quotas));
      setError('');
      setSaved(true);
      toast.success('生成配额已保存并立即生效');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : '生成配额保存失败';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,.05)',
  };
  const inputStyle: React.CSSProperties = {
    width: 180,
    height: 38,
    boxSizing: 'border-box',
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'var(--input)',
    color: 'var(--foreground)',
    padding: '0 12px',
    outline: 'none',
    fontSize: 14,
  };

  return (
    <AdminLayout>
      <div data-cmp="GenerationQuotaPage" style={{ padding: '28px', minHeight: '100%', background: 'var(--background)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SparklesIcon size={19} style={{ color: primary }} />
              <h1 style={{ margin: 0, color: 'var(--foreground)', fontSize: 20, fontWeight: 700 }}>生成配额</h1>
            </div>
            <p style={{ margin: '6px 0 0', color: 'var(--muted-foreground)', fontSize: 13 }}>管理 Pro 套餐的自然月 AI 使用上限，保存后立即生效。</p>
          </div>
        </div>

        <section style={{ ...cardStyle, maxWidth: 900, padding: 24 }}>
          <div style={{ marginBottom: 20, paddingBottom: 15, borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ margin: 0, color: 'var(--foreground)', fontSize: 15, fontWeight: 700 }}>Pro 套餐配额</h2>
            <p style={{ margin: '6px 0 0', color: 'var(--muted-foreground)', fontSize: 12 }}>Team 套餐仍为不限量；免费版额度由服务端默认配置控制。</p>
          </div>

          {error && <div role="alert" style={{ marginBottom: 18, padding: '10px 12px', border: '1px solid #fecaca', borderRadius: 8, background: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>{error}</div>}

          {[
            ['proScriptGenerateLimit', '剧本生成', '每位 Pro 用户每月可生成的剧本数'],
            ['proRewriteLimit', 'AI 修改', '每位 Pro 用户每月可使用的改写次数'],
            ['proAdaptCardsLimit', '改编方向卡', '每位 Pro 用户每月可生成的方向卡次数'],
          ].map(([key, label, hint]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
              <span style={{ width: 150, flexShrink: 0 }}>
                <strong style={{ display: 'block', color: 'var(--foreground)', fontSize: 13 }}>{label}</strong>
                <small style={{ display: 'block', marginTop: 4, color: 'var(--muted-foreground)', fontSize: 11 }}>{hint}</small>
              </span>
              <input type="number" min={1} max={100000} step={1} value={quotas[key as keyof GenerationQuotas]} disabled={loading || saving} onChange={(event) => setQuota(key as keyof GenerationQuotas, event.target.value)} style={inputStyle} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>次 / 月</span>
            </label>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            {saved && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#16a34a', fontSize: 13 }}><CheckCircleIcon size={15} />已保存</span>}
            <button type="button" disabled={loading || saving} onClick={save} style={{ height: 36, padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', borderRadius: 8, background: primary, color: '#fff', cursor: loading || saving ? 'not-allowed' : 'pointer', opacity: loading || saving ? .6 : 1, fontSize: 13, fontWeight: 700 }}>
              <SaveIcon size={14} />{saving ? '保存中…' : '保存配置'}
            </button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
