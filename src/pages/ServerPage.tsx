import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ActivityIcon, CheckCircle2Icon, CpuIcon, HardDriveIcon, LoaderCircleIcon,
  MemoryStickIcon, PowerIcon, PowerOffIcon, RefreshCwIcon, ServerIcon, XCircleIcon,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { listServers, serverAction } from '../api/servers';
import type { ServerInfo, ServerStatus } from '../api/types';
import { useTheme } from '../hooks/useTheme';
import { toast } from '../lib/localizedToast';

const PINK = '#E91E8C';

function metricColor(value: number) {
  return value >= 80 ? '#ef4444' : value >= 60 ? '#f59e0b' : value > 0 ? 'var(--primary)' : '#22c55e';
}

function ProgressBar({ value, label, icon }: { value: number; label: string; icon: ReactNode }) {
  const color = metricColor(value);
  return <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted-foreground)', fontSize: 12 }}>{icon}<span>{label}</span></div>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}%</span>
    </div>
    <div style={{ height: 7, borderRadius: 6, background: `color-mix(in srgb, ${color} 12%, transparent)`, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, value))}%`, borderRadius: 6, background: color, transition: 'width .5s ease' }} />
    </div>
  </div>;
}

const statusConfig: Record<ServerStatus, { label: string; color: string; icon: ReactNode }> = {
  online: { label: '运行中', color: '#22c55e', icon: <CheckCircle2Icon size={12} /> },
  offline: { label: '已关机', color: '#6b7280', icon: <XCircleIcon size={12} /> },
  restarting: { label: '重启中', color: '#f59e0b', icon: <RefreshCwIcon size={12} className="animate-spin" /> },
};

function ServerCard({ server, primary, busy, onAction }: { server: ServerInfo; primary: string; busy: boolean; onAction: (action: 'start' | 'stop' | 'restart') => void }) {
  const [confirm, setConfirm] = useState<'stop' | 'restart' | null>(null);
  const online = server.status === 'online';
  const offline = server.status === 'offline';
  const status = statusConfig[server.status];
  const actionLabel = confirm === 'stop' ? '关机' : '重启';

  const actionButton = (action: 'start' | 'stop' | 'restart', label: string, icon: ReactNode, enabled: boolean, color: string) => (
    <button type="button" disabled={!enabled || busy} onClick={() => action === 'start' ? onAction(action) : setConfirm(action)} style={{ flex: 1, height: 36, borderRadius: 8, border: 0, background: enabled ? `color-mix(in srgb, ${color} 11%, transparent)` : 'var(--muted)', color: enabled ? color : 'var(--muted-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12, fontWeight: 600, cursor: enabled && !busy ? 'pointer' : 'not-allowed', opacity: enabled ? 1 : .5 }}>
      {busy && enabled ? <LoaderCircleIcon size={13} className="animate-spin" /> : icon}{label}
    </button>
  );

  return <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 22px 20px', boxShadow: '0 2px 10px rgba(0,0,0,.06)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: status.color }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: `color-mix(in srgb, ${primary} 10%, var(--muted))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: primary }}><ServerIcon size={22} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--foreground)', marginBottom: 3 }}>{server.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{server.ip}</div>
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>{server.os} · 在线 {server.uptime}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: `color-mix(in srgb, ${status.color} 12%, transparent)`, color: status.color, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{status.icon}{status.label}</div>
    </div>
    <div style={{ opacity: offline ? .4 : 1, transition: 'opacity .3s', marginBottom: 18 }}>
      <ProgressBar value={server.cpu} label="CPU" icon={<CpuIcon size={12} />} />
      <ProgressBar value={server.ram} label="RAM" icon={<MemoryStickIcon size={12} />} />
      <ProgressBar value={server.swap} label="SWAP" icon={<ActivityIcon size={12} />} />
      <ProgressBar value={server.disk} label="DISK" icon={<HardDriveIcon size={12} />} />
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      {actionButton('start', '开机', <PowerIcon size={13} />, offline, '#22c55e')}
      {actionButton('stop', '关机', <PowerOffIcon size={13} />, online, '#ef4444')}
      {actionButton('restart', '重启', <RefreshCwIcon size={13} />, online, '#f59e0b')}
    </div>
    {confirm && <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'color-mix(in srgb, var(--card) 94%, transparent)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>确认{actionLabel}？</div>
      <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{confirm === 'stop' ? '关机后服务将中断，请确认操作。' : '重启期间服务短暂中断，请确认操作。'}</div>
      <div style={{ display: 'flex', gap: 10 }}><button type="button" onClick={() => setConfirm(null)} style={{ padding: '6px 18px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer' }}>取消</button><button type="button" onClick={() => { onAction(confirm); setConfirm(null); }} style={{ padding: '6px 18px', borderRadius: 7, border: 0, background: confirm === 'stop' ? '#ef4444' : '#f59e0b', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>确认{actionLabel}</button></div>
    </div>}
  </div>;
}

export default function ServerPage() {
  const { themeState } = useTheme();
  const primary = themeState.themeId === 'manga' ? PINK : 'var(--primary)';
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try { setServers(await listServers()); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '服务器状态加载失败'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { void load(); const timer = window.setInterval(() => void load(true), 15000); return () => window.clearInterval(timer); }, [load]);

  const runAction = async (id: number, action: 'start' | 'stop' | 'restart') => {
    setBusyId(id);
    try {
      const updated = await serverAction(id, action);
      setServers(current => current.map(server => server.id === id ? updated : server));
      toast.success(action === 'start' ? '开机操作已提交' : action === 'stop' ? '关机操作已提交' : '重启操作已提交');
      if (action === 'restart') window.setTimeout(() => void load(true), 1600);
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : '服务器操作失败'); }
    finally { setBusyId(null); }
  };

  const online = servers.filter(server => server.status === 'online').length;
  const offline = servers.filter(server => server.status === 'offline').length;
  const restarting = servers.filter(server => server.status === 'restarting').length;
  const card: CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 18px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' };

  return <AdminLayout><main data-cmp="ServerPage" style={{ padding: '28px 28px 40px', minHeight: '100%', background: 'var(--background)' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}><div><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><ServerIcon size={18} style={{ color: primary }} /><h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>服务器管理</h1></div><p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>实时监控服务器 CPU / RAM / SWAP / DISK 资源使用情况，支持开机、关机、重启操作</p></div><button type="button" onClick={() => void load(true)} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--foreground)', cursor: refreshing ? 'not-allowed' : 'pointer' }}><RefreshCwIcon size={14} className={refreshing ? 'animate-spin' : ''} />刷新</button></div>
    {error && <div role="alert" style={{ marginBottom: 18, padding: '10px 12px', border: '1px solid #fecaca', borderRadius: 8, background: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>{error}</div>}
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>{[{ label: '总服务器', value: servers.length, color: primary }, { label: '运行中', value: online, color: '#22c55e' }, { label: '已关机', value: offline, color: '#6b7280' }, { label: '重启中', value: restarting, color: '#f59e0b' }].map(item => <div key={item.label} style={card}><span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} /><span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{item.label}</span><strong style={{ fontSize: 16, color: item.color }}>{item.value}</strong></div>)}</div>
    {loading ? <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted-foreground)' }}><LoaderCircleIcon size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />正在加载服务器状态…</div> : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>{servers.map(server => <div key={server.id} style={{ flex: '1 1 calc(50% - 10px)', minWidth: 300 }}><ServerCard server={server} primary={primary} busy={busyId === server.id} onAction={action => void runAction(server.id, action)} /></div>)}</div>}
    <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 20, background: 'var(--muted)', borderRadius: 8, padding: '10px 16px', fontSize: 12, color: 'var(--muted-foreground)' }}><strong style={{ color: 'var(--foreground)' }}>进度条颜色说明：</strong><span>正常 (0–59%)</span><span style={{ color: '#f59e0b' }}>警告 (60–79%)</span><span style={{ color: '#ef4444' }}>危险 (≥80%)</span></div>
  </main></AdminLayout>;
}
