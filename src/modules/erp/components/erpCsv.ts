type Field = { key: string; label: string; required?: boolean; numeric?: 'money' | 'integer' | 'positive'; options?: Record<string, string>; date?: boolean };
const field = (key: string, label: string, extra: Omit<Field, 'key' | 'label'> = {}): Field => ({ key, label, ...extra });
const name = field('name', '名称', { required: true });
const amount = field('amount', '金额', { required: true, numeric: 'money' });
const contacts = [field('contact', '联系人'), field('phone', '电话'), field('address', '地址')];
const status = (options: Record<string, string>) => field('status', '状态', { options });
export const importFields: Record<string, Field[]> = {
  products: [field('sku', 'SKU', { required: true }), name, field('category', '分类', { required: true }), field('unit_price', '单价', { numeric: 'money' }), field('stock', '库存', { numeric: 'integer' }), status({ on_sale: '上架', off_sale: '下架' })],
  orders: [field('customer', '客户', { required: true }), amount, field('item_count', '件数', { required: true, numeric: 'positive' }), status({ pending_payment: '待付款', pending_shipping: '待发货', completed: '已完成', cancelled: '已取消' }), field('order_date', '时间', { date: true })],
  purchases: [field('supplier', '供应商', { required: true }), amount, field('item_count', '件数', { required: true, numeric: 'positive' }), status({ draft: '草稿', pending_approval: '待审批', approving: '审批中', received: '已入库', rejected: '已驳回' }), field('order_date', '时间', { date: true })],
  suppliers: [name, ...contacts, status({ active: '启用', inactive: '停用' })],
  customers: [name, ...contacts, field('level', '等级', { options: { new: '新客户', normal: '普通客户', vip: 'VIP客户' } }), field('total_spent', '累计消费', { numeric: 'money' })],
  finance: [field('record_type', '类型', { required: true, options: { income: '收入', expense: '支出' } }), amount, field('category', '分类', { required: true }), field('related_no', '关联单据'), field('operator', '经办人'), field('record_time', '时间', { required: true, date: true }), field('remark', '备注')],
  inventory: [field('sku', 'SKU', { required: true }), field('type', '方向', { required: true, options: { in: '入库', out: '出库' } }), field('quantity', '数量', { required: true, numeric: 'positive' }), field('reference_no', '关联单据'), field('operator', '经办人'), field('remark', '备注')],
};

/** CSV with quoted commas, escaped quotes and embedded CRLF, without eval or spreadsheet coercion. */
export function parseCsv(text: string): string[][] {
  text = text.replace(/^\uFEFF/, '');
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false; let closed = false;
  const push = () => { row.push(cell); cell = ''; closed = false; };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') { quoted = false; closed = true; }
      else cell += ch;
    } else if (ch === ',') push();
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      push(); if (row.some(value => value.trim())) rows.push(row); row = [];
    } else if (ch === '"') {
      if (cell || closed) throw new Error('CSV 引号格式错误，请使用模板或标准 CSV 导出文件。');
      quoted = true;
    } else {
      if (closed && ch.trim()) throw new Error('CSV 引号后只能出现逗号或换行。');
      if (!closed) cell += ch;
    }
  }
  if (quoted) throw new Error('CSV 存在未闭合的双引号。');
  push(); if (row.some(value => value.trim())) rows.push(row);
  return rows;
}

export type ImportRow = { row: number; data: Record<string, string | number>; errors: string[] };
export function prepareCsv(resource: string, text: string): ImportRow[] {
  const fields = importFields[resource];
  if (!fields) throw new Error('此列表不支持导入。');
  const [header, ...records] = parseCsv(text);
  if (!header || !records.length) throw new Error('文件没有数据行，请在模板表头下填写数据。');
  if (records.length > 500) throw new Error('每次最多导入 500 行，请拆分文件。');
  const columns = header.map(raw => fields.find(item => item.key.toLowerCase() === raw.trim().toLowerCase() || item.label === raw.trim()));
  const readOnly = resource === 'orders' ? ['order_no', '订单号'] : resource === 'purchases' ? ['purchase_no', '采购单号'] : [];
  const unknown = header.filter((value, index) => !columns[index] && !readOnly.includes(value.trim()));
  if (unknown.length) throw new Error(`无法识别列：${unknown.join('、')}。请使用本页导入模板。`);
  const keys = columns.filter(Boolean).map(item => item!.key);
  if (new Set(keys).size !== keys.length) throw new Error('表头存在重复字段。');
  const missing = fields.filter(item => item.required && !keys.includes(item.key));
  if (missing.length) throw new Error(`缺少必填列：${missing.map(item => item.label).join('、')}`);
  const seen = new Set<string>();
  return records.map((cells, index) => {
    const data: ImportRow['data'] = {}; const errors: string[] = [];
    if (cells.length !== header.length) errors.push(`列数应为 ${header.length}，实际 ${cells.length}`);
    columns.forEach((item, column) => {
      if (!item) return;
      let value = (cells[column] ?? '').trim();
      if (!value) { if (item.required) errors.push(`${item.label}不能为空`); return; }
      if (item.numeric) {
        const isMoney = item.numeric === 'money';
        if (!(isMoney ? /^\d+(\.\d{1,2})?$/ : /^\d+$/).test(value) || !Number.isFinite(Number(value)) || Number(value) > (isMoney ? 9999999999.99 : 2147483647) || item.numeric === 'positive' && Number(value) < 1) errors.push(`${item.label}须为${isMoney ? '非负金额（最多两位小数）' : item.numeric === 'positive' ? '正整数' : '非负整数'}`);
        else data[item.key] = Number(value);
      } else {
        if (item.options) {
          value = Object.entries(item.options).find(([key, label]) => key === value || label === value)?.[0] ?? value;
          if (!Object.hasOwn(item.options, value)) errors.push(`${item.label}可选：${Object.values(item.options).join('、')}`);
        }
        if (item.date) {
          const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
          if (!parts) errors.push(`${item.label}格式应为 YYYY-MM-DD HH:mm:ss`);
          else {
            const [, year, month, day, hour = '00', minute = '00', second = '00'] = parts;
            const date = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second));
            if (date.getUTCFullYear() !== +year || date.getUTCMonth() !== +month - 1 || date.getUTCDate() !== +day || +hour > 23 || +minute > 59 || +second > 59) errors.push(`${item.label}不是有效日期`);
            value = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
          }
        }
        data[item.key] = value;
      }
    });
    if (resource === 'products' && data.sku) {
      if (seen.has(String(data.sku).toLowerCase())) errors.push('文件内 SKU 重复');
      seen.add(String(data.sku).toLowerCase());
    }
    return { row: index + 2, data, errors };
  });
}

export function downloadCsv(filename: string, rows: unknown[][]) {
  const text = '\ufeff' + rows.map(row => row.map(value => {
    let cell = String(value ?? '');
    if (/^[=+@\-\t\r]/.test(cell)) cell = "'" + cell;
    return '"' + cell.replaceAll('"', '""') + '"';
  }).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
