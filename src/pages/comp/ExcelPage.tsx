import * as XLSX from 'xlsx';
import AdminLayout from '../../components/AdminLayout';
import {
  DownloadIcon,
  TableIcon,
  FileSpreadsheetIcon,
  UsersIcon,
  CheckCircleIcon,
  UploadIcon,
  XCircleIcon,
  FileIcon,
  Trash2Icon,
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────
interface UserRow {
  id: number;
  name: string;
  department: string;
  position: string;
  joinDate: string;
  status: '在职' | '试用期' | '离职';
  email: string;
  city: string;
}

const MOCK_USERS: UserRow[] = [
  { id: 1,  name: '张伟', department: '产品部', position: '产品经理',   joinDate: '2019-03-12', status: '在职',   email: 'zhangwei@company.com',   city: '北京' },
  { id: 2,  name: '李芳', department: '设计部', position: 'UI 设计师',  joinDate: '2020-07-08', status: '在职',   email: 'lifang@company.com',     city: '上海' },
  { id: 3,  name: '王磊', department: '研发部', position: '前端工程师', joinDate: '2021-01-15', status: '在职',   email: 'wanglei@company.com',    city: '深圳' },
  { id: 4,  name: '赵静', department: '市场部', position: '市场专员',   joinDate: '2020-11-22', status: '在职',   email: 'zhaojing@company.com',   city: '广州' },
  { id: 5,  name: '陈浩', department: '研发部', position: '后端工程师', joinDate: '2022-04-03', status: '试用期', email: 'chenhao@company.com',    city: '杭州' },
  { id: 6,  name: '刘洋', department: '运营部', position: '运营经理',   joinDate: '2018-09-30', status: '在职',   email: 'liuyang@company.com',    city: '成都' },
  { id: 7,  name: '孙雪', department: '人事部', position: 'HR 专员',    joinDate: '2023-02-14', status: '试用期', email: 'sunxue@company.com',     city: '北京' },
  { id: 8,  name: '周杰', department: '财务部', position: '财务主管',   joinDate: '2017-06-01', status: '在职',   email: 'zhoujie@company.com',    city: '上海' },
  { id: 9,  name: '吴丽', department: '产品部', position: '产品助理',   joinDate: '2023-08-20', status: '试用期', email: 'wuli@company.com',       city: '深圳' },
  { id: 10, name: '郑强', department: '研发部', position: '技术负责人', joinDate: '2016-12-05', status: '在职',   email: 'zhengqiang@company.com', city: '北京' },
];

const COLUMNS: { key: keyof UserRow; label: string; width?: number }[] = [
  { key: 'id',         label: 'ID',       width: 56  },
  { key: 'name',       label: '姓名',     width: 88  },
  { key: 'department', label: '部门',     width: 100 },
  { key: 'position',   label: '职位',     width: 130 },
  { key: 'joinDate',   label: '入职日期', width: 120 },
  { key: 'status',     label: '状态',     width: 80  },
  { key: 'email',      label: '邮箱',     width: 220 },
  { key: 'city',       label: '城市',     width: 80  },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  '在职':   { bg: 'rgba(34,197,94,0.12)',  color: '#16a34a' },
  '试用期': { bg: 'rgba(234,179,8,0.12)',  color: '#ca8a04' },
  '离职':   { bg: 'rgba(239,68,68,0.12)',  color: '#dc2626' },
};

// ─────────────────────────────────────────────
// Export helpers
// ─────────────────────────────────────────────
function buildExcelData(rows: UserRow[]) {
  return rows.map(r => ({
    ID: r.id, 姓名: r.name, 部门: r.department, 职位: r.position,
    入职日期: r.joinDate, 在职状态: r.status, 邮箱: r.email, 城市: r.city,
  }));
}

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function exportToExcel(rows: UserRow[]) {
  const ws = XLSX.utils.json_to_sheet(buildExcelData(rows));
  ws['!cols'] = [
    { wch: 6 }, { wch: 10 }, { wch: 12 }, { wch: 18 },
    { wch: 14 }, { wch: 10 }, { wch: 30 }, { wch: 10 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '员工列表');
  XLSX.writeFile(wb, `员工数据_${todayString()}.xlsx`);
}

// ─────────────────────────────────────────────
// Import helpers
// ─────────────────────────────────────────────
interface ParsedSheet {
  headers: string[];
  rows: string[][];
  sheetName: string;
  fileName: string;
  totalRows: number;
}

function parseXlsx(file: File): Promise<ParsedSheet> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buf = e.target?.result;
        if (!buf) { reject(new Error('empty')); return; }
        const wb = XLSX.read(buf, { type: 'array' });
        const sheetName = wb.SheetNames[0] ?? '';
        const ws = wb.Sheets[sheetName];
        if (!ws) { reject(new Error('no sheet')); return; }
        // sheet_to_json with header:1 → array of arrays
        const raw = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });
        if (!raw || raw.length === 0) { reject(new Error('empty sheet')); return; }
        const headers = (raw[0] ?? []).map(String);
        const rows = raw.slice(1).map(r => headers.map((_, i) => String(r[i] ?? '')));
        resolve({ headers, rows, sheetName, fileName: file.name, totalRows: rows.length });
      } catch {
        reject(new Error('parse error'));
      }
    };
    reader.onerror = () => reject(new Error('read error'));
    reader.readAsArrayBuffer(file);
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─────────────────────────────────────────────
// ImportZone component
// ─────────────────────────────────────────────
interface ImportZoneProps {
  parsed: ParsedSheet | null;
  onParsed: (result: ParsedSheet | null) => void;
}

function ImportZone({ parsed, onParsed }: ImportZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);

  const processFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      toast.error('文件格式不正确', { description: '请上传 .xlsx / .xls / .csv 格式的文件' });
      return;
    }
    setParsing(true);
    try {
      const result = await parseXlsx(file);
      onParsed(result);
      toast.success('解析成功', { description: `共读取 ${result.totalRows} 行数据，${result.headers.length} 列` });
    } catch {
      toast.error('文件格式不正确', { description: '解析失败，请确认文件内容完整且格式正确' });
      onParsed(null);
    } finally {
      setParsing(false);
    }
  }, [onParsed]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => { if (!parsing) inputRef.current?.click(); }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 14,
          padding: '40px 24px',
          textAlign: 'center',
          cursor: parsing ? 'wait' : 'pointer',
          background: dragging
            ? 'rgba(var(--primary-rgb, 99,102,241), 0.05)'
            : 'var(--muted)',
          transition: 'border-color 0.18s, background 0.18s',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* animated stripe when dragging */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(99,102,241,0.04) 10px, rgba(99,102,241,0.04) 20px)',
          opacity: dragging ? 1 : 0,
          transition: 'opacity 0.18s',
          pointerEvents: 'none',
        }} />

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={onInputChange}
        />

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: dragging
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            : 'var(--background)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          transition: 'background 0.18s, border-color 0.18s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          {parsing
            ? <div style={{
                width: 24, height: 24, border: '2.5px solid var(--muted-foreground)',
                borderTopColor: 'var(--primary)', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
            : <UploadIcon size={22} style={{ color: dragging ? '#fff' : 'var(--muted-foreground)', transition: 'color 0.18s' }} />
          }
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 6 }}>
          {parsing ? '正在解析文件…' : dragging ? '松开即可上传' : '拖拽文件到此处，或点击选择'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
          支持 <strong style={{ color: 'var(--foreground)' }}>.xlsx</strong>、
          <strong style={{ color: 'var(--foreground)' }}>.xls</strong>、
          <strong style={{ color: 'var(--foreground)' }}>.csv</strong> 格式
        </div>
      </div>

      {/* Parsed file info bar */}
      <div style={{
        marginTop: 12,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        borderRadius: 10,
        background: parsed ? 'rgba(34,197,94,0.07)' : 'transparent',
        border: parsed ? '1px solid rgba(34,197,94,0.25)' : '1px solid transparent',
        transition: 'background 0.2s, border-color 0.2s',
        minHeight: 44,
      }}>
        {parsed ? (
          <>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileIcon size={14} style={{ color: '#fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {parsed.fileName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                Sheet「{parsed.sheetName}」· {parsed.totalRows} 行 · {parsed.headers.length} 列
              </div>
            </div>
            <button
              onClick={() => onParsed(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                color: 'var(--muted-foreground)', flexShrink: 0,
                borderRadius: 6, display: 'flex', alignItems: 'center',
              }}
              title="清除"
            >
              <Trash2Icon size={14} />
            </button>
          </>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
            尚未选择文件
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Import preview table
// ─────────────────────────────────────────────
const MAX_PREVIEW_ROWS = 100;

interface ImportPreviewProps {
  parsed: ParsedSheet;
}

function ImportPreview({ parsed }: ImportPreviewProps) {
  const displayRows = parsed.rows.slice(0, MAX_PREVIEW_ROWS);
  const truncated = parsed.totalRows > MAX_PREVIEW_ROWS;

  return (
    <div style={{
      marginTop: 20,
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Preview header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <CheckCircleIcon size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>
          解析预览
        </span>
        <span style={{
          padding: '2px 10px', borderRadius: 20,
          background: 'rgba(34,197,94,0.1)', fontSize: 12,
          color: '#16a34a', fontWeight: 600,
        }}>
          {parsed.totalRows} 行 · {parsed.headers.length} 列
        </span>
        {truncated && (
          <span style={{
            padding: '2px 10px', borderRadius: 20,
            background: 'rgba(234,179,8,0.1)', fontSize: 12,
            color: '#ca8a04', fontWeight: 500,
          }}>
            仅展示前 {MAX_PREVIEW_ROWS} 行
          </span>
        )}
      </div>

      {/* Scrollable table */}
      <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontSize: 13, tableLayout: 'auto',
        }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr style={{ background: 'var(--muted)' }}>
              {/* Row number col */}
              <th style={{
                padding: '10px 12px',
                textAlign: 'center',
                fontWeight: 700, fontSize: 11,
                color: 'var(--muted-foreground)',
                borderBottom: '2px solid var(--border)',
                borderRight: '1px solid var(--border)',
                whiteSpace: 'nowrap',
                minWidth: 40,
                background: 'var(--muted)',
              }}>
                #
              </th>
              {parsed.headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: 12,
                    color: 'var(--foreground)',
                    borderBottom: '2px solid var(--border)',
                    whiteSpace: 'nowrap',
                    letterSpacing: 0.2,
                    background: 'var(--muted)',
                  }}
                >
                  {h || `列${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{ background: rIdx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.022)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.background = rIdx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.022)')}
              >
                {/* Row index */}
                <td style={{
                  padding: '9px 12px',
                  textAlign: 'center',
                  color: 'var(--muted-foreground)',
                  fontSize: 11,
                  borderRight: '1px solid var(--border)',
                  fontVariantNumeric: 'tabular-nums',
                  userSelect: 'none',
                }}>
                  {rIdx + 1}
                </td>
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    style={{
                      padding: '9px 16px',
                      color: 'var(--foreground)',
                      whiteSpace: 'nowrap',
                      maxWidth: 260,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={cell}
                  >
                    {cell === '' ? (
                      <span style={{ color: 'var(--muted-foreground)', fontStyle: 'italic', fontSize: 11 }}>—</span>
                    ) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 20px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
          {truncated
            ? `显示前 ${MAX_PREVIEW_ROWS} 行，共 ${parsed.totalRows} 行`
            : `共 ${parsed.totalRows} 行数据`}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted-foreground)' }}>
          <XCircleIcon size={12} />
          <span>空单元格显示为 —</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Spin keyframe (injected once)
// ─────────────────────────────────────────────
function useSpinStyle() {
  useEffect(() => {
    const id = 'excel-spin-kf';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(el);
  }, []);
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function ExcelPage() {
  useSpinStyle();
  const [exported, setExported] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      exportToExcel(MOCK_USERS);
      setExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 2500);
    }, 400);
  };

  return (
    <AdminLayout>
      <div
        data-cmp="ExcelPage"
        style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--background)' }}
      >
        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileSpreadsheetIcon size={18} style={{ color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>
              Excel 导入导出
            </h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)', margin: 0, paddingLeft: 46 }}>
            基于 SheetJS (xlsx) 实现前端纯客户端 Excel 导出与导入解析，无需服务端支持
          </p>
        </div>

        {/* ══════════════════════════════════════════
            §1  导出
        ══════════════════════════════════════════ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{
            width: 4, height: 18, borderRadius: 2,
            background: 'linear-gradient(180deg, #22c55e, #16a34a)',
          }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--foreground)' }}>
            导出 Excel
          </span>
        </div>

        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 32,
        }}>
          {/* Toolbar */}
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <UsersIcon size={16} style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>员工信息表</span>
              </div>
              <span style={{
                padding: '2px 10px', borderRadius: 20,
                background: 'var(--muted)', fontSize: 12,
                color: 'var(--muted-foreground)', fontWeight: 500,
              }}>
                {MOCK_USERS.length} 条记录
              </span>
            </div>

            <button
              onClick={handleExport}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: exporting ? 'var(--muted)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: exporting ? 'var(--muted-foreground)' : '#fff',
                fontWeight: 700, fontSize: 14,
                boxShadow: exporting ? 'none' : '0 4px 14px rgba(34,197,94,0.35)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { if (!exporting) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {exported
                ? <><CheckCircleIcon size={15} /> 导出成功！</>
                : exporting
                ? <><TableIcon size={15} /> 正在生成…</>
                : <><DownloadIcon size={15} /> 导出 Excel</>
              }
            </button>
          </div>

          {/* Info strip */}
          <div style={{
            padding: '10px 24px',
            background: 'rgba(34,197,94,0.06)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <FileSpreadsheetIcon size={14} style={{ color: '#16a34a' }} />
            <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
              点击"导出 Excel"将生成
              <strong style={{ color: 'var(--foreground)', margin: '0 3px' }}>
                员工数据_{todayString()}.xlsx
              </strong>
              并自动下载，包含全部 {MOCK_USERS.length} 条数据和 {COLUMNS.length} 个字段
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
              <colgroup>
                {COLUMNS.map(col => (
                  <col key={col.key} style={{ width: col.width ?? 'auto' }} />
                ))}
              </colgroup>
              <thead>
                <tr style={{ background: 'var(--muted)' }}>
                  {COLUMNS.map(col => (
                    <th key={col.key} style={{
                      padding: '11px 16px', textAlign: 'left',
                      fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)',
                      whiteSpace: 'nowrap', letterSpacing: 0.3,
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.018)', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.018)')}
                  >
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>{row.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 14,
                          background: `hsl(${(row.id * 47) % 360}, 60%, 65%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {row.name.slice(0, 1)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{row.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)' }}>{row.department}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)' }}>{row.position}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>{row.joinDate}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                        fontSize: 12, fontWeight: 600,
                        background: STATUS_STYLE[row.status]?.bg ?? 'var(--muted)',
                        color: STATUS_STYLE[row.status]?.color ?? 'var(--muted-foreground)',
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.email}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)' }}>{row.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 24px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
              共 {MOCK_USERS.length} 条 · 导出时包含所有字段
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted-foreground)' }}>
              <TableIcon size={13} />
              <span>由 SheetJS 驱动</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            §2  导入
        ══════════════════════════════════════════ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{
            width: 4, height: 18, borderRadius: 2,
            background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
          }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--foreground)' }}>
            导入 Excel
          </span>
        </div>

        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '24px',
          marginBottom: 20,
        }}>
          {/* Tips */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '12px 16px', borderRadius: 10,
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.18)',
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
            <span style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
              上传任意 xlsx / xls / csv 文件，SheetJS 将自动解析第一个 Sheet 并在下方渲染预览表格。
              您可以先导出上面的员工数据，再将其作为测试文件上传。
            </span>
          </div>

          <ImportZone parsed={parsed} onParsed={setParsed} />
        </div>

        {/* Preview table — always in DOM, hidden when no data */}
        <div style={{
          opacity: parsed ? 1 : 0,
          transform: parsed ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.22s, transform 0.22s',
          pointerEvents: parsed ? 'auto' : 'none',
        }}>
          {parsed && <ImportPreview parsed={parsed} />}
        </div>

        {/* ── How it works ── */}
        <div style={{
          marginTop: 20,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '22px 24px',
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>⚙️</span> 实现原理
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { step: '①', title: 'json_to_sheet', desc: '将 JS 对象数组转换为 Worksheet，自动推断列头（导出）', color: '#22c55e' },
              { step: '②', title: 'writeFile',     desc: '触发浏览器文件下载，文件名附带当天日期（导出）',         color: '#22c55e' },
              { step: '③', title: 'FileReader',    desc: '以 ArrayBuffer 形式读取用户选择的本地文件（导入）',      color: '#6366f1' },
              { step: '④', title: 'sheet_to_json', desc: '将 Worksheet 解析为二维数组，首行自动作为表头（导入）',  color: '#6366f1' },
            ].map(item => (
              <div
                key={item.step}
                style={{
                  flex: '1 1 180px', padding: '14px 16px', borderRadius: 10,
                  background: 'var(--muted)', border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{item.step}</span>
                  <code style={{
                    fontSize: 12, fontWeight: 700,
                    background: 'var(--background)',
                    padding: '2px 6px', borderRadius: 4,
                    color: item.color,
                  }}>
                    {item.title}
                  </code>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
