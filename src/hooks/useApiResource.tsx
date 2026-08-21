import { useCallback, useEffect, useRef, useState } from 'react';

export interface ApiResource<T> { data: T | undefined; loading: boolean; error: Error | null; reload: () => Promise<void>; }

export function useApiResource<T>(loader: () => Promise<T>, initial?: T): ApiResource<T> {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [data, setData] = useState<T | undefined>(initial);
  const [loading, setLoading] = useState(initial === undefined);
  const [error, setError] = useState<Error | null>(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await loaderRef.current()); }
    catch (cause) { setError(cause instanceof Error ? cause : new Error(String(cause))); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  return { data, loading, error, reload };
}

export function ApiState({ loading, error }: Pick<ApiResource<unknown>, 'loading' | 'error'>) {
  if (loading) return <div style={{ padding: 16, color: 'var(--muted-foreground)', fontSize: 13 }}>加载中…</div>;
  if (error) return <div style={{ padding: 16, color: '#dc2626', fontSize: 13 }}>数据加载失败：{error.message}</div>;
  return null;
}
