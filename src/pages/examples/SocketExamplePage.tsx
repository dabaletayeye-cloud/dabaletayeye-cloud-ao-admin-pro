import { useState } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { CableIcon, CircleDotIcon, CopyIcon, PlayIcon, SendIcon, SquareIcon } from 'lucide-react';

interface SocketLog { id: number; time: string; direction: 'sent' | 'received' | 'system'; content: string; }

const initialLogs: SocketLog[] = [
  { id: 1, time: '10:24:08', direction: 'system', content: '等待建立 WebSocket 连接' },
  { id: 2, time: '10:24:12', direction: 'received', content: '{"event":"welcome","message":"连接通道已就绪"}' },
];

export default function SocketExamplePage() {
  const { themeState } = useTheme();
  const primary = themeState.themeId === 'manga' ? '#E91E8C' : 'var(--primary)';
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState('wss://api.example.com/updates');
  const [message, setMessage] = useState('{"event":"ping"}');
  const [logs, setLogs] = useState<SocketLog[]>(initialLogs);
  const addLog = (direction: SocketLog['direction'], content: string) => setLogs(items => [...items, { id: Date.now(), time: new Date().toLocaleTimeString('zh-CN', { hour12: false }), direction, content }]);
  const toggleConnection = () => {
    const next = !connected;
    setConnected(next);
    addLog('system', next ? `已连接至 ${channel}` : '连接已断开');
  };
  const send = () => {
    if (!connected) { toast.error('请先建立连接'); return; }
    if (!message.trim()) return;
    addLog('sent', message.trim());
    setMessage('');
  };
  const simulateMessage = () => {
    if (!connected) { toast.error('请先建立连接'); return; }
    addLog('received', '{"event":"order.updated","id":"ORD-20240608","status":"已完成"}');
  };

  return (
    <AdminLayout>
      <div data-cmp="SocketExamplePage" style={{ padding: 24, minHeight: '100%', background: 'var(--background)' }}>
        <div className="mb-6"><h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Socket 连接</h1><p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>模拟 WebSocket 连接、消息发送与服务端事件接收的调试流程</p></div>
        <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-semibold" style={{ color: 'var(--foreground)' }}><CableIcon size={17} style={{ color: primary }} />连接配置</h2><span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: connected ? '#16A34A' : 'var(--muted-foreground)' }}><CircleDotIcon size={12} fill="currentColor" />{connected ? '已连接' : '未连接'}</span></div>
            <label className="mt-5 grid gap-1.5 text-sm" style={{ color: 'var(--foreground)' }}><span>服务地址</span><input value={channel} disabled={connected} onChange={event => setChannel(event.target.value)} className="h-9 rounded-lg border px-3 text-sm outline-none disabled:opacity-60" style={{ borderColor: 'var(--border)', background: 'var(--input)', color: 'var(--foreground)' }} /></label>
            <button type="button" onClick={toggleConnection} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ background: connected ? '#64748B' : primary }}>{connected ? <><SquareIcon size={14} />断开连接</> : <><PlayIcon size={14} />建立连接</>}</button>
            <div className="mt-6 rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}><div className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>连接说明</div><p className="mt-2 text-sm leading-6" style={{ color: 'var(--foreground)' }}>这是前端调试示例。实际项目中可将连接逻辑替换为后端提供的 WebSocket 服务地址。</p></div>
          </section>
          <section className="overflow-hidden rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}><div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}><div><h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>消息调试台</h2><p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>共 {logs.length} 条消息</p></div><button type="button" onClick={simulateMessage} className="rounded-lg border px-3 py-2 text-xs font-medium" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>模拟服务端消息</button></div><div className="h-[320px] space-y-2 overflow-y-auto p-4" style={{ background: 'var(--muted)' }}>{logs.map(log => <div key={log.id} className="rounded-lg border px-3 py-2.5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}><div className="mb-1 flex items-center justify-between gap-3 text-xs"><span style={{ color: log.direction === 'received' ? '#16A34A' : log.direction === 'sent' ? primary : 'var(--muted-foreground)' }}>{log.direction === 'received' ? '接收' : log.direction === 'sent' ? '发送' : '系统'}</span><span style={{ color: 'var(--muted-foreground)' }}>{log.time}</span></div><code className="break-all text-xs" style={{ color: 'var(--foreground)' }}>{log.content}</code></div>)}</div><div className="border-t p-4" style={{ borderColor: 'var(--border)' }}><label className="flex items-center gap-2"><input value={message} onChange={event => setMessage(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') send(); }} placeholder="输入要发送的 JSON 消息" className="h-9 min-w-0 flex-1 rounded-lg border px-3 text-sm outline-none" style={{ borderColor: 'var(--border)', background: 'var(--input)', color: 'var(--foreground)' }} /><button type="button" onClick={send} className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ background: primary }} title="发送消息"><SendIcon size={15} /></button></label><button type="button" onClick={() => { void navigator.clipboard?.writeText(logs.map(log => `[${log.time}] ${log.content}`).join('\n')); toast.success('调试日志已复制'); }} className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}><CopyIcon size={13} />复制全部日志</button></div></section>
        </div>
      </div>
    </AdminLayout>
  );
}
