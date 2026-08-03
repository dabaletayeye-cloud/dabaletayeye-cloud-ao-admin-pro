import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import AdminLayout from '../components/AdminLayout';
import {
  ServerIcon,
  PowerIcon,
  PowerOffIcon,
  RefreshCwIcon,
  CpuIcon,
  HardDriveIcon,
  MemoryStickIcon,
  ActivityIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from 'lucide-react';

const PINK = '#E91E8C';

// ─── Types ────────────────────────────────────────────────────────────────────

type ServerStatus = 'online' | 'offline' | 'restarting';

interface ServerInfo {
  id: string;
  name: string;
  ip: string;
  cpu: number;
  ram: number;
  swap: number;
  disk: number;
  status: ServerStatus;
  os: string;
  uptime: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_SERVERS: ServerInfo[] = [
  { id: 's1', name: '开发服务器',   ip: '192.168.1.100', cpu: 40, ram: 69, swap: 18, disk: 69, status: 'online',   os: 'CentOS 8.4', uptime: '12d 6h 24m' },
  { id: 's2', name: '测试服务器',   ip: '192.168.1.101', cpu: 33, ram: 18, swap: 37, disk: 13, status: 'online',   os: 'Ubuntu 22.04', uptime: '5d 11h 02m' },
  { id: 's3', name: '预发布服务器', ip: '192.168.1.102', cpu: 63, ram: 0,  swap: 100, disk: 7, status: 'online',   os: 'Debian 11',   uptime: '30d 0h 00m' },
  { id: 's4', name: '线上服务器',   ip: '192.168.1.103', cpu: 24, ram: 15, swap: 79, disk: 55, status: 'online',   os: 'CentOS 8.4', uptime: '88d 3h 47m' },
];

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  const color =
    value >= 80 ? '#ef4444' :
    value >= 60 ? '#f59e0b' :
    value > 0   ? '#3b82f6' : '#22c55e';

  const trackColor =
    value >= 80 ? 'color-mix(in srgb, #ef4444 12%, transparent)' :
    value >= 60 ? 'color-mix(in srgb, #f59e0b 12%, transparent)' :
    value > 0   ? 'color-mix(in srgb, #3b82f6 10%, transparent)' :
                  'color-mix(in srgb, #22c55e 10%, transparent)';

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted-foreground)', fontSize: 12 }}>
          {icon}
          <span>{label}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>
          {value}%
        </span>
      </div>
      <div style={{
        height: 7, borderRadius: 6,
        background: trackColor,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${value}%`,
          borderRadius: 6,
          background: color,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

// ─── Server Card ──────────────────────────────────────────────────────────────

function ServerCard({ server, primary, onChange }: {
  server: ServerInfo;
  primary: string;
  onChange: (id: string, next: Partial<ServerInfo>) => void;
}) {
  const [confirmAction, setConfirmAction] = useState<'off' | 'restart' | null>(null);

  const isOnline     = server.status === 'online';
  const isOffline    = server.status === 'offline';
  const isRestarting = server.status === 'restarting';

  const handlePowerOn = () => {
    onChange(server.id, { status: 'restarting' });
    setTimeout(() => onChange(server.id, { status: 'online' }), 2000);
  };

  const handlePowerOff = () => {
    setConfirmAction('off');
  };

  const handleRestart = () => {
    setConfirmAction('restart');
  };

  const doConfirm = () => {
    if (confirmAction === 'off') {
      onChange(server.id, { status: 'offline' });
    } else if (confirmAction === 'restart') {
      onChange(server.id, { status: 'restarting' });
      setTimeout(() => onChange(server.id, { status: 'online' }), 2500);
    }
    setConfirmAction(null);
  };

  const statusConfig = {
    online:     { label: '运行中', color: '#22c55e', bg: 'color-mix(in srgb, #22c55e 12%, transparent)' },
    offline:    { label: '已关机', color: '#6b7280', bg: 'color-mix(in srgb, #6b7280 12%, transparent)' },
    restarting: { label: '重启中', color: '#f59e0b', bg: 'color-mix(in srgb, #f59e0b 12%, transparent)' },
  };

  const sc = statusConfig[server.status];

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '22px 22px 20px',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      position: 'relative', overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: isOnline ? '#22c55e' : isRestarting ? '#f59e0b' : '#6b7280',
        transition: 'background 0.4s',
        borderRadius: '14px 14px 0 0',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
        {/* Server icon */}
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: `color-mix(in srgb, ${primary} 10%, var(--muted))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: primary,
        }}>
          <ServerIcon size={22} />
        </div>

        {/* Name & IP */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--foreground)', marginBottom: 3 }}>
            {server.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
            {server.ip}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
            {server.os} · 在线 {server.uptime}
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 20,
          background: sc.bg, color: sc.color,
          fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          {isOnline
            ? <CheckCircle2Icon size={12} />
            : isRestarting
              ? <RefreshCwIcon size={12} style={{ animation: 'topbar-spin 1s linear infinite' }} />
              : <XCircleIcon size={12} />
          }
          {sc.label}
        </div>
      </div>

      {/* Progress bars — only when online / restarting */}
      <div style={{ opacity: isOffline ? 0.4 : 1, transition: 'opacity 0.4s', marginBottom: 18 }}>
        <ProgressBar value={server.cpu}  label="CPU"  icon={<CpuIcon size={12} />} />
        <ProgressBar value={server.ram}  label="RAM"  icon={<MemoryStickIcon size={12} />} />
        <ProgressBar value={server.swap} label="SWAP" icon={<ActivityIcon size={12} />} />
        <ProgressBar value={server.disk} label="DISK" icon={<HardDriveIcon size={12} />} />
      </div>

      {/* Confirm overlay */}
      <div style={{
        display: confirmAction ? 'flex' : 'none',
        position: 'absolute', inset: 0,
        background: 'color-mix(in srgb, var(--card) 92%, transparent)',
        backdropFilter: 'blur(2px)',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 14, zIndex: 10, borderRadius: 14,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)', textAlign: 'center' }}>
          确认{confirmAction === 'off' ? '关机' : '重启'}？
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center', maxWidth: 200 }}>
          {confirmAction === 'off'
            ? '关机后服务将中断，请确认操作。'
            : '重启期间服务短暂中断，请确认操作。'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setConfirmAction(null)}
            style={{
              padding: '6px 18px', borderRadius: 7, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--foreground)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={doConfirm}
            style={{
              padding: '6px 18px', borderRadius: 7, border: 'none',
              background: confirmAction === 'off' ? '#ef4444' : '#f59e0b',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            确认{confirmAction === 'off' ? '关机' : '重启'}
          </button>
        </div>
      </div>

      {/* Action buttons row */}
      <div style={{ display: 'flex', gap: 8 }}>
        {/* Power ON */}
        <button
          onClick={handlePowerOn}
          disabled={isOnline || isRestarting}
          title="开机"
          style={{
            flex: 1, height: 34, borderRadius: 8, border: 'none',
            background: isOffline ? 'color-mix(in srgb, #22c55e 12%, transparent)' : 'var(--muted)',
            color: isOffline ? '#22c55e' : 'var(--muted-foreground)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontSize: 12, fontWeight: 600, cursor: isOffline ? 'pointer' : 'not-allowed',
            opacity: isOffline ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
        >
          <PowerIcon size={13} />
          开机
        </button>

        {/* Power OFF */}
        <button
          onClick={handlePowerOff}
          disabled={!isOnline}
          title="关机"
          style={{
            flex: 1, height: 34, borderRadius: 8, border: 'none',
            background: isOnline ? 'color-mix(in srgb, #ef4444 10%, transparent)' : 'var(--muted)',
            color: isOnline ? '#ef4444' : 'var(--muted-foreground)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontSize: 12, fontWeight: 600, cursor: isOnline ? 'pointer' : 'not-allowed',
            opacity: isOnline ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
        >
          <PowerOffIcon size={13} />
          关机
        </button>

        {/* Restart */}
        <button
          onClick={handleRestart}
          disabled={!isOnline}
          title="重启"
          style={{
            flex: 1, height: 34, borderRadius: 8, border: 'none',
            background: isOnline ? 'color-mix(in srgb, #f59e0b 10%, transparent)' : 'var(--muted)',
            color: isOnline ? '#f59e0b' : 'var(--muted-foreground)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontSize: 12, fontWeight: 600, cursor: isOnline ? 'pointer' : 'not-allowed',
            opacity: isOnline ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
        >
          <RefreshCwIcon
            size={13}
            style={{ animation: isRestarting ? 'topbar-spin 0.8s linear infinite' : 'none' }}
          />
          重启
        </button>
      </div>
    </div>
  );
}

// ─── ServerPage ────────────────────────────────────────────────────────────────

export default function ServerPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? PINK : 'var(--primary)';

  const [servers, setServers] = useState<ServerInfo[]>(INITIAL_SERVERS);

  const handleChange = (id: string, next: Partial<ServerInfo>) => {
    setServers(prev => prev.map(s => s.id === id ? { ...s, ...next } : s));
  };

  const onlineCount    = servers.filter(s => s.status === 'online').length;
  const offlineCount   = servers.filter(s => s.status === 'offline').length;
  const restartingCount = servers.filter(s => s.status === 'restarting').length;

  return (
    <AdminLayout>
      {/* Reuse topbar's spin keyframe */}
      <style>{`
        @keyframes topbar-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div data-cmp="ServerPage" style={{ padding: '28px 28px 40px', minHeight: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <ServerIcon size={18} style={{ color: primary }} />
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>服务器管理</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>
            实时监控服务器 CPU / RAM / SWAP / DISK 资源使用情况，支持开机 · 关机 · 重启操作
          </p>
        </div>

        {/* Summary strip */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: '总服务器', value: servers.length, color: primary },
            { label: '运行中',   value: onlineCount,    color: '#22c55e' },
            { label: '已关机',   value: offlineCount,   color: '#6b7280' },
            { label: '重启中',   value: restartingCount, color: '#f59e0b' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 18px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: item.color, flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{item.label}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: item.color, marginLeft: 4 }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* 2×2 grid */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 20,
        }}>
          {servers.map(server => (
            <div key={server.id} style={{ flex: '1 1 calc(50% - 10px)', minWidth: 300 }}>
              <ServerCard server={server} primary={primary} onChange={handleChange} />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{
          marginTop: 24, display: 'flex', alignItems: 'center', gap: 20,
          background: 'var(--muted)', borderRadius: 8, padding: '10px 16px',
          fontSize: 12, color: 'var(--muted-foreground)',
        }}>
          <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>进度条颜色说明：</span>
          {[
            { label: '正常 (0–59%)',  color: '#3b82f6' },
            { label: '警告 (60–79%)', color: '#f59e0b' },
            { label: '危险 (≥80%)',   color: '#ef4444' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 6, borderRadius: 3, background: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
