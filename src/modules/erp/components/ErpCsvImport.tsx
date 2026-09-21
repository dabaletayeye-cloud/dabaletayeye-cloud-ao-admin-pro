import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { erpApi } from '../../../api/erp';
import { downloadCsv, importFields, prepareCsv, type ImportRow } from './erpCsv';

type Result = { row: number; success: boolean; message: string };
export default function ErpCsvImport({ resource, title, onClose, onImported }: { resource: string; title: string; onClose: () => void; onImported: () => Promise<void> }) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const stop = useRef(false);
  const mounted = useRef(true);
  const readingId = useRef(0);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; stop.current = true; readingId.current++; }; }, []);
  const fields = importFields[resource];
  const errors = rows.flatMap(row => row.errors.map(message => ({ row: row.row, message })));
  const chooseFile = async (file?: File) => {
    if (!file) return;
    const id = ++readingId.current;
    setRows([]); setResults(null); setError(''); setFilename(file.name); setReading(true);
    try {
      if (!/\.csv$/i.test(file.name)) throw new Error('请选择 .csv 文件');
      if (file.size > 2 * 1024 * 1024) throw new Error('文件不能超过 2 MB');
      const bytes = await file.arrayBuffer();
      let text: string;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
      catch { text = new TextDecoder('gb18030', { fatal: true }).decode(bytes); }
      const parsed = prepareCsv(resource, text);
      if (id === readingId.current) setRows(parsed);
    } catch (reason) { if (id === readingId.current) setError(reason instanceof Error ? reason.message : '文件解析失败'); }
    finally { if (id === readingId.current) setReading(false); }
  };
  const start = async () => {
    if (busy || reading || results !== null || !rows.length || errors.length) return;
    stop.current = false; setBusy(true); setResults([]); setError('');
    const completed: Result[] = [];
    try {
      const products = resource === 'inventory' ? await erpApi.list('products') : [];
      const bySku = new Map(products.map(product => [String(product.sku).toLowerCase(), Number(product.id)]));
      if (resource === 'inventory') {
        const missing = rows.filter(row => !bySku.has(String(row.data.sku).toLowerCase()));
        if (missing.length) throw new Error(`以下记录的 SKU 不存在：${missing.map(row => `${row.row}（${row.data.sku}）`).join('、')}`);
      }
      for (const row of rows) {
        if (stop.current) break;
        try {
          if (resource === 'inventory') {
            const { sku, reference_no, ...movement } = row.data;
            await erpApi.moveInventory(bySku.get(String(sku).toLowerCase())!, { ...movement, referenceNo: reference_no ?? '' });
          } else await erpApi.create(resource, row.data);
          completed.push({ row: row.row, success: true, message: '成功' });
        } catch (reason) { completed.push({ row: row.row, success: false, message: reason instanceof Error ? reason.message : '请求失败，请核对是否已保存后再重试' }); }
        if (mounted.current) setResults([...completed]);
      }
    } catch (reason) { if (mounted.current) setError(reason instanceof Error ? reason.message : '导入失败'); }
    finally {
      if (mounted.current) { setBusy(false); if (completed.some(result => result.success)) await onImported(); }
    }
  };
  const failures = results?.filter(result => !result.success) ?? [];
  return createPortal(<div className="erp-modal"><section className="erp-dialog" role="dialog" aria-modal="true" aria-labelledby="erp-import-title" style={{ width: 'min(940px, calc(100vw - 32px))', color: 'var(--foreground)' }}>
    <h3 id="erp-import-title" style={{ marginTop: 0 }}>导入 CSV · {title}</h3>
    <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.7 }}>
      {resource === 'inventory' ? '按 SKU 导入入库/出库流水，数量须为正整数；出库会校验库存余额。' : '按行新增记录，不覆盖已有数据；已存在的商品 SKU 会由后端拒绝。'}
      {' '}支持中文或英文字段名、UTF-8 / GBK 编码，最多 500 条、2 MB。
      {(resource === 'orders' || resource === 'purchases') && ' 单号由系统生成，CSV 中原单号不导入；本模板不含商品明细。已完成订单会生成财务收入，已入库采购会生成支出；需要按商品联动库存时请先补齐明细再审批。'}
    </p>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <button type="button" className="erp-btn secondary" onClick={() => downloadCsv(`erp-${resource}-导入模板.csv`, [fields.map(field => field.label)])}>下载 CSV 模板</button>
      <input type="file" accept=".csv,text/csv" aria-label="选择 CSV 文件" disabled={busy} onChange={event => { void chooseFile(event.target.files?.[0]); event.target.value = ''; }} />
    </div>
    <p style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
      必填：{fields.filter(field => field.required).map(field => field.label).join('、')}。
      {fields.filter(field => field.options).map(field => ` ${field.label}：${Object.values(field.options!).join(' / ')}。`).join('')}
      {fields.some(field => field.date) && ' 时间格式：2026-09-21 09:00:00。'}
    </p>
    {reading && <p role="status">正在读取文件…</p>}
    {error && <p role="alert" style={{ color: 'var(--destructive)' }}>{error}</p>}
    {errors.length > 0 && <div role="alert" style={{ color: 'var(--destructive)', maxHeight: 150, overflow: 'auto' }}>{errors.slice(0, 30).map((item, i) => <div key={i}>记录 {item.row}：{item.message}</div>)}{errors.length > 30 && <div>另有 {errors.length - 30} 项错误</div>}</div>}
    {rows.length > 0 && <><p>{filename}：共 {rows.length} 条，预览前 {Math.min(rows.length, 10)} 条</p><div style={{ overflowX: 'auto', maxHeight: 280 }}><table className="erp-table"><thead><tr><th>记录</th>{fields.map(field => <th key={field.key}>{field.label}</th>)}</tr></thead><tbody>{rows.slice(0, 10).map(row => <tr key={row.row}><td>{row.row}</td>{fields.map(field => <td key={field.key}>{field.options?.[String(row.data[field.key])] ?? String(row.data[field.key] ?? '-')}</td>)}</tr>)}</tbody></table></div></>}
    {results !== null && <div aria-live="polite" style={{ marginTop: 16 }}>已处理 {results.length}/{rows.length} 条；成功 {results.filter(result => result.success).length} 条，失败 {failures.length} 条。{!busy && ' 已成功的记录不会撤销，请勿重复导入整个文件。'}
      {failures.length > 0 && <><div style={{ maxHeight: 150, overflow: 'auto', color: 'var(--destructive)' }}>{failures.slice(0, 30).map(result => <div key={result.row}>记录 {result.row}：{result.message}</div>)}</div><button className="erp-btn secondary" onClick={() => downloadCsv(`erp-${resource}-失败记录.csv`, [['记录', '失败原因', ...fields.map(field => field.label)], ...failures.map(result => [result.row, result.message, ...fields.map(field => rows.find(row => row.row === result.row)?.data[field.key] ?? '')])])}>下载失败报告</button></>}
    </div>}
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
      {busy ? <button className="erp-btn secondary" onClick={() => { stop.current = true; }}>停止后续导入</button> : <button className="erp-btn secondary" onClick={onClose}>关闭</button>}
      <button className="erp-btn" disabled={busy || reading || !rows.length || !!errors.length || results !== null} onClick={() => void start()}>{busy ? '导入中…' : `确认导入${rows.length ? ` ${rows.length} 条` : ''}`}</button>
    </div>
  </section></div>, document.body);
}
