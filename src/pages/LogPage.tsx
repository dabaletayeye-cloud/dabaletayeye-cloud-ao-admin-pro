import { useState } from 'react';
import { toast } from 'sonner';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../hooks/useTheme';
import {
  SearchIcon,
  DownloadIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  LogInIcon,
  SlidersIcon,
  AlertTriangleIcon,
} from 'lucide-react';

const MANGA_PINK = '#E91E8C';

type LogTab = 'login' | 'operation' | 'exception';

interface LoginLog {
  id: number;
  username: string;
  ip: string;
  location: string;
  browser: string;
  os: string;
  status: 'success' | 'fail';
  msg: string;
  time: string;
}

interface OperationLog {
  id: number;
  username: string;
  module: string;
  type: string;
  method: string;
  requestUri: string;
  ip: string;
  status: 'success' | 'fail';
  costTime: number;
  time: string;
}

interface ExceptionLog {
  id: number;
  username: string;
  requestUri: string;
  errorMsg: string;
  exceptionClass: string;
  ip: string;
  time: string;
}

const MOCK_LOGIN_LOGS: LoginLog[] = [
  { id: 1, username: 'admin', ip: '192.168.1.1', location: '上海市', browser: 'Chrome 121', os: 'Windows 11', status: 'success', msg: '登录成功', time: '2024-05-20 09:23:11' },
  { id: 2, username: 'lin@example.com', ip: '114.22.33.44', location: '北京市', browser: 'Safari 17', os: 'macOS Sonoma', status: 'success', msg: '登录成功', time: '2024-05-20 08:55:02' },
  { id: 3, username: 'test_user', ip: '10.0.0.5', location: '内网', browser: 'Firefox 124', os: 'Ubuntu', status: 'fail', msg: '密码错误', time: '2024-05-20 08:40:17' },
  { id: 4, username: 'zhang@example.com', ip: '220.13.55.66', location: '广州市', browser: 'Edge 124', os: 'Windows 10', status: 'success', msg: '登录成功', time: '2024-05-19 22:11:33' },
  { id: 5, username: 'hacker_bot', ip: '103.5.67.200', location: '境外', browser: 'Python Requests', os: '未知', status: 'fail', msg: '账号被锁定', time: '2024-05-19 21:00:00' },
  { id: 6, username: 'wang@example.com', ip: '60.6.7.8', location: '深圳市', browser: 'Chrome 121', os: 'Android', status: 'success', msg: '登录成功', time: '2024-05-19 17:30:45' },
  { id: 7, username: 'admin2', ip: '192.168.0.100', location: '内网', browser: 'Chrome 121', os: 'Windows 11', status: 'fail', msg: '验证码错误', time: '2024-05-19 10:05:22' },
];

const MOCK_OPERATION_LOGS: OperationLog[] = [
  { id: 1, username: 'admin', module: '用户管理', type: '新增', method: 'POST', requestUri: '/api/users', ip: '192.168.1.1', status: 'success', costTime: 123, time: '2024-05-20 09:30:01' },
  { id: 2, username: 'lin@example.com', module: '文章管理', type: '发布', method: 'PUT', requestUri: '/api/articles/42', ip: '114.22.33.44', status: 'success', costTime: 87, time: '2024-05-20 09:15:22' },
  { id: 3, username: 'zhang@example.com', module: '媒体库', type: '上传', method: 'POST', requestUri: '/api/media/upload', ip: '220.13.55.66', status: 'success', costTime: 1240, time: '2024-05-20 08:50:00' },
  { id: 4, username: 'admin', module: '角色管理', type: '修改', method: 'PUT', requestUri: '/api/roles/3', ip: '192.168.1.1', status: 'success', costTime: 65, time: '2024-05-19 16:20:11' },
  { id: 5, username: 'admin', module: '系统设置', type: '修改', method: 'POST', requestUri: '/api/config/site', ip: '192.168.1.1', status: 'fail', costTime: 890, time: '2024-05-19 15:05:33' },
  { id: 6, username: 'wang@example.com', module: '优惠券', type: '删除', method: 'DELETE', requestUri: '/api/coupons/10', ip: '60.6.7.8', status: 'success', costTime: 55, time: '2024-05-19 14:00:00' },
  { id: 7, username: 'admin', module: '日志管理', type: '导出', method: 'GET', requestUri: '/api/logs/export', ip: '192.168.1.1', status: 'success', costTime: 3200, time: '2024-05-19 10:11:00' },
];

const MOCK_EXCEPTION_LOGS: ExceptionLog[] = [
  { id: 1, username: 'admin', requestUri: '/api/config/site', errorMsg: 'Connection refused: database unavailable', exceptionClass: 'java.sql.SQLException', ip: '192.168.1.1', time: '2024-05-19 15:05:33' },
  { id: 2, username: 'system', requestUri: '/api/scheduler/run', errorMsg: 'Task execution timeout after 30000ms', exceptionClass: 'java.util.concurrent.TimeoutException', ip: '127.0.0.1', time: '2024-05-18 03:00:01' },
  { id: 3, username: 'zhang@example.com', requestUri: '/api/media/upload', errorMsg: 'File size exceeds limit: max 10MB', exceptionClass: 'com.admin.exception.FileSizeException', ip: '220.13.55.66', time: '2024-05-18 09:22:14' },
  { id: 4, username: 'hacker_bot', requestUri: '/api/users/1/token', errorMsg: 'Access denied: insufficient permission', exceptionClass: 'org.springframework.security.AccessDeniedException', ip: '103.5.67.200', time: '2024-05-17 21:00:05' },
];

export default function LogPage() {
  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const primary = isManga ? MANGA_PINK : 'var(--primary)';

  const [activeTab, setActiveTab] = useState<LogTab>('login');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('__all__');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-x, 0) var(--shadow-y, 2px) var(--shadow-blur, 8px) var(--shadow-spread, 0) var(--shadow-color, rgba(0,0,0,0.06))',
  };

  const inputStyle = {
    border: '1px solid var(--border)',
    background: 'var(--input)',
    color: 'var(--foreground)',
    borderRadius: '8px',
    padding: '7px 12px',
    outline: 'none',
    fontSize: '13px',
  };

  const TABS: { key: LogTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'login', label: '登录日志', icon: <LogInIcon size={14} />, count: MOCK_LOGIN_LOGS.length },
    { key: 'operation', label: '操作日志', icon: <SlidersIcon size={14} />, count: MOCK_OPERATION_LOGS.length },
    { key: 'exception', label: '异常日志', icon: <AlertTriangleIcon size={14} />, count: MOCK_EXCEPTION_LOGS.length },
  ];

  const filteredLoginLogs = MOCK_LOGIN_LOGS.filter(l => {
    const matchText = l.username.includes(searchText) || l.ip.includes(searchText) || l.location.includes(searchText);
    const matchStatus = statusFilter === '__all__' || l.status === statusFilter;
    return matchText && matchStatus;
  });

  const filteredOpLogs = MOCK_OPERATION_LOGS.filter(l => {
    const matchText = l.username.includes(searchText) || l.module.includes(searchText) || l.requestUri.includes(searchText);
    const matchStatus = statusFilter === '__all__' || l.status === statusFilter;
    return matchText && matchStatus;
  });

  const filteredExLogs = MOCK_EXCEPTION_LOGS.filter(l => {
    return l.username.includes(searchText) || l.errorMsg.includes(searchText) || l.requestUri.includes(searchText);
  });

  const handleExport = () => {
    const rows = activeTab === 'login' ? filteredLoginLogs : activeTab === 'operation' ? filteredOpLogs : filteredExLogs;
    const csv = rows.map(row => Object.values(row).map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ao-admin-pro-${activeTab}-logs.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`已导出 ${rows.length} 条日志`);
  };

  const StatusBadge = ({ status }: { status: 'success' | 'fail' }) => (
    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: status === 'success' ? '#22C55E' : '#EF4444' }}>
      {status === 'success' ? <CheckCircleIcon size={12} /> : <XCircleIcon size={12} />}
      {status === 'success' ? '成功' : '失败'}
    </span>
  );

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' };
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)' };
  const mutedTdStyle: React.CSSProperties = { ...tdStyle, color: 'var(--muted-foreground)' };

  return (
    <AdminLayout>
      <div data-cmp="LogPage" style={{ padding: '24px', minHeight: '100%', background: 'var(--background)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>日志管理</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>系统操作审计和异常监控</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
          >
            <DownloadIcon size={14} />导出日志
          </button>
        </div>

        {/* Tabs */}
        <div style={{ ...cardStyle, marginBottom: '16px', padding: '4px' }}>
          <div className="flex gap-1">
            {TABS.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSearchText(''); setStatusFilter('__all__'); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: isActive ? primary : 'transparent',
                    color: isActive ? '#fff' : 'var(--muted-foreground)',
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--muted)',
                      color: isActive ? '#fff' : 'var(--muted-foreground)',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div style={{ ...cardStyle, padding: '14px 16px', marginBottom: '16px' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2" style={{ flex: 1, minWidth: '180px', maxWidth: '280px', border: '1px solid var(--border)', borderRadius: '8px', padding: '5px 10px', background: 'var(--input)' }}>
              <SearchIcon size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
              <input
                placeholder={activeTab === 'login' ? '用户名/IP/地区…' : activeTab === 'operation' ? '用户名/模块/接口…' : '用户名/错误信息…'}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--foreground)', flex: 1 }}
              />
            </div>
            {activeTab !== 'exception' && (
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="__all__">全部状态</option>
                <option value="success">成功</option>
                <option value="fail">失败</option>
              </select>
            )}
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>至</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
            <button
              onClick={() => { setSearchText(''); setStatusFilter('__all__'); setDateFrom(''); setDateTo(''); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors"
              style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
            >
              <RefreshCwIcon size={13} />重置
            </button>
          </div>
        </div>

        {/* Login Log Table */}
        <div style={{ ...cardStyle, display: activeTab === 'login' ? 'block' : 'none' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                {['用户名', 'IP地址', '登录地点', '浏览器', '操作系统', '状态', '提示信息', '登录时间'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLoginLogs.map((log, idx) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: idx < filteredLoginLogs.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{log.username}</td>
                  <td style={mutedTdStyle}><code style={{ fontSize: '12px' }}>{log.ip}</code></td>
                  <td style={mutedTdStyle}>{log.location}</td>
                  <td style={{ ...mutedTdStyle, fontSize: '12px' }}>{log.browser}</td>
                  <td style={{ ...mutedTdStyle, fontSize: '12px' }}>{log.os}</td>
                  <td style={tdStyle}><StatusBadge status={log.status} /></td>
                  <td style={{ ...mutedTdStyle, fontSize: '12px' }}>{log.msg}</td>
                  <td style={{ ...mutedTdStyle, fontSize: '12px', whiteSpace: 'nowrap' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLoginLogs.length === 0 && (
            <div className="flex items-center justify-center py-12" style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>
              暂无日志数据
            </div>
          )}
        </div>

        {/* Operation Log Table */}
        <div style={{ ...cardStyle, display: activeTab === 'operation' ? 'block' : 'none' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                {['用户名', '所属模块', '操作类型', '请求方式', '请求接口', 'IP地址', '状态', '耗时', '操作时间'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOpLogs.map((log, idx) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: idx < filteredOpLogs.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{log.username}</td>
                  <td style={tdStyle}>{log.module}</td>
                  <td style={tdStyle}>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                      {log.type}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <code style={{
                      fontSize: '11px', padding: '1px 6px', borderRadius: '4px',
                      background: log.method === 'GET' ? 'rgba(59,130,246,0.1)' : log.method === 'POST' ? 'rgba(34,197,94,0.1)' : log.method === 'PUT' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      color: log.method === 'GET' ? '#3B82F6' : log.method === 'POST' ? '#22C55E' : log.method === 'PUT' ? '#F59E0B' : '#EF4444',
                    }}>
                      {log.method}
                    </code>
                  </td>
                  <td style={{ ...mutedTdStyle, fontSize: '12px', fontFamily: 'monospace' }}>{log.requestUri}</td>
                  <td style={mutedTdStyle}><code style={{ fontSize: '12px' }}>{log.ip}</code></td>
                  <td style={tdStyle}><StatusBadge status={log.status} /></td>
                  <td style={{ ...mutedTdStyle, fontSize: '12px' }}>{log.costTime}ms</td>
                  <td style={{ ...mutedTdStyle, fontSize: '12px', whiteSpace: 'nowrap' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOpLogs.length === 0 && (
            <div className="flex items-center justify-center py-12" style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>暂无日志数据</div>
          )}
        </div>

        {/* Exception Log Table */}
        <div style={{ ...cardStyle, display: activeTab === 'exception' ? 'block' : 'none' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                {['用户名', '请求接口', '异常信息', '异常类', 'IP地址', '发生时间'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredExLogs.map((log, idx) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: idx < filteredExLogs.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{log.username}</td>
                  <td style={{ ...mutedTdStyle, fontSize: '12px', fontFamily: 'monospace' }}>{log.requestUri}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', maxWidth: '240px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#EF4444' }}>{log.errorMsg}</span>
                  </td>
                  <td style={{ ...mutedTdStyle, fontSize: '11px', fontFamily: 'monospace', maxWidth: '200px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.exceptionClass}</span>
                  </td>
                  <td style={mutedTdStyle}><code style={{ fontSize: '12px' }}>{log.ip}</code></td>
                  <td style={{ ...mutedTdStyle, fontSize: '12px', whiteSpace: 'nowrap' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExLogs.length === 0 && (
            <div className="flex items-center justify-center py-12" style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>暂无异常记录</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
