import type { ApiAdapter } from './types';

type Row = Record<string, unknown> & { id: number };
type Store = Record<string, Row[]>;
const copy = <T>(value: T): T => structuredClone(value);
const now = () => new Date().toLocaleString('sv-SE');
const today = () => now().slice(0, 10);
const num = (value: unknown) => Number(value ?? 0);
const requireFields = (row: Record<string, unknown>, fields: string[]) => {
  for (const field of fields) if (row[field] == null || String(row[field]).trim() === '') throw new Error(`缺少必填字段：${field}`);
};
type BusinessMethods = Pick<ApiAdapter, 'listErp' | 'getErp' | 'createErp' | 'updateErp' | 'deleteErp' | 'moveErpInventory' | 'listErpInventoryFlows' | 'getErpReports' | 'approveErpPurchase' | 'listErpInventoryAlerts' | 'getErpStats' | 'oaList' | 'oaGet' | 'oaCreate' | 'oaUpdate' | 'oaDelete'>;

/** In-memory demonstration data. No fetch, real inventory, or real financial writes. */
export function createMockBusiness(empty = false): Required<BusinessMethods> {
  let sequence = 100;
  const stamp = now();
  let erp: Store = {
    products: [
      { id: 1, sku: 'SKU-1001', name: '无线降噪耳机', category: '数码配件', unit_price: 399, stock: 86, status: 'on_sale' },
      { id: 2, sku: 'SKU-1002', name: '机械键盘', category: '数码配件', unit_price: 269, stock: 12, status: 'on_sale' },
      { id: 3, sku: 'SKU-1003', name: '人体工学椅', category: '办公家具', unit_price: 899, stock: 0, status: 'off_sale' },
    ],
    customers: [{ id: 1, name: '星河科技', contact: '李敏', phone: '13800001001', address: '上海市浦东新区', level: 'vip', total_spent: 12880 }, { id: 2, name: '远山设计', contact: '王璐', phone: '13800001002', address: '北京市朝阳区', level: 'normal', total_spent: 4260 }],
    suppliers: [{ id: 1, name: '华东供应链', contact: '孙强', phone: '13900002001', address: '上海市闵行区', status: 'active' }],
    orders: [
      { id: 1, order_no: 'SO-DEMO-001', customer_id: 1, customer: '星河科技', amount: 798, item_count: 2, status: 'completed', order_date: stamp, items: [{ product_id: 1, product_name: '无线降噪耳机', quantity: 2, unit_price: 399 }] },
      { id: 2, order_no: 'SO-DEMO-002', customer_id: 2, customer: '远山设计', amount: 269, item_count: 1, status: 'pending_payment', order_date: stamp, items: [{ product_id: 2, product_name: '机械键盘', quantity: 1, unit_price: 269 }] },
    ],
    purchases: [{ id: 1, purchase_no: 'PO-DEMO-001', supplier: '华东供应链', supplier_id: 1, amount: 2000, item_count: 10, status: 'pending_approval', order_date: stamp, items: [{ product_id: 2, product_name: '机械键盘', quantity: 10, unit_price: 200 }], approvals: [] }],
    inventory: [], flows: [],
    finance: [{ id: 1, record_type: 'income', amount: 798, category: '销售收入', related_no: 'SO-DEMO-001', operator: '演示管理员', record_time: stamp }, { id: 2, record_type: 'expense', amount: 300, category: '办公支出', related_no: '', operator: '演示管理员', record_time: stamp }],
  };
  erp.inventory = erp.products.map(product => ({ id: product.id, product_id: product.id, product_name: product.name, stock: product.stock, safe_stock: 20, updated_at: stamp }));
  erp.flows = erp.products.filter(product => num(product.stock) > 0).map(product => ({ id: sequence++, product_id: product.id, inventory_id: product.id, flow_type: 'initial', quantity: product.stock, before_stock: 0, after_stock: product.stock, operator: '演示管理员', created_at: stamp }));
  if (empty) for (const key of Object.keys(erp)) erp[key] = [];
  const oa: Store = {
    approval: [{ id: 1, approval_no: 'OA-DEMO-001', approval_type: 'leave', title: '年假申请', applicant_id: 1, applicant_name: '演示管理员', status: 'pending', current_node: '部门主管', submitted_at: stamp, records: [] }, { id: 2, approval_no: 'OA-DEMO-002', approval_type: 'expense', title: '差旅报销', applicant_id: 1, status: 'approved', current_node: '完成', submitted_at: stamp, records: [] }],
    attendance: [{ id: 1, user_id: 1, attendance_date: '2026-09-07', check_in: '2026-09-07 08:56:00', check_out: '2026-09-07 18:10:00', status: 'normal', remark: '模拟出勤记录' }],
    notices: [{ id: 1, title: '欢迎使用纯前端演示版', notice_type: 'notice', status: 'published', is_top: 1, content: '本模式不连接后端，数据变更仅在当前页面会话内保存。', published_at: stamp }, { id: 2, title: '办公用品领用制度', notice_type: 'policy', status: 'draft', is_top: 0, content: '演示公告草稿' }],
    schedule: [{ id: 1, title: '项目周会', start_time: `${today()} 10:00:00`, end_time: `${today()} 11:00:00`, schedule_type: 'meeting', location: '大会议室' }],
    org: [{ id: 1, name: '总经办', parent_id: null, leader_id: 1, member_count: 2 }, { id: 2, name: '研发部', parent_id: 1, leader_id: 2, member_count: 5 }],
  };
  const table = (store: Store, resource: string) => {
    if (!Object.hasOwn(store, resource)) throw new Error(`不支持的资源：${resource}`);
    return store[resource];
  };
  const find = (store: Store, resource: string, id: number) => {
    const row = table(store, resource).find(row => row.id === id);
    if (!row) throw new Error('记录不存在');
    return row;
  };
  const stockRow = (row: Row) => ({ ...row, status: num(row.stock) <= 0 ? 'shortage' : num(row.stock) < num(row.safe_stock) ? 'warning' : 'normal' });
  const atomic = <T>(action: () => T): T => {
    const previous = copy(erp);
    try { return copy(action()); } catch (error) { erp = previous; throw error; }
  };
  function move(productId: number, input: Record<string, unknown>) {
    const product = find(erp, 'products', productId);
    const quantity = num(input.quantity);
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || !['in', 'out'].includes(String(input.type))) throw new Error('方向必须是入库/出库，数量必须为正整数');
    const inventory = erp.inventory.find(row => row.product_id === productId);
    if (!inventory) throw new Error('库存记录不存在');
    const before = num(inventory.stock);
    const after = before + (input.type === 'out' ? -quantity : quantity);
    if (after < 0) throw new Error('库存不足');
    inventory.stock = after; product.stock = after; inventory.updated_at = now();
    erp.flows.unshift({ id: sequence++, inventory_id: inventory.id, product_id: productId, flow_type: input.type, quantity, before_stock: before, after_stock: after, reference_no: input.referenceNo ?? '', operator: input.operator ?? '演示管理员', remark: input.remark ?? '', created_at: now() });
    return stockRow(inventory);
  }
  function saveErp(resource: string, id: number | null, input: Record<string, unknown>) {
    return atomic(() => {
      const rows = table(erp, resource);
      const previous = id === null ? undefined : find(erp, resource, id);
      const defaults: Record<string, unknown> = resource === 'products' ? { unit_price: 0, stock: 0, status: 'on_sale' }
        : resource === 'orders' ? { status: 'pending_payment', order_date: now(), items: [] }
        : resource === 'purchases' ? { status: 'draft', order_date: now(), items: [], approvals: [] }
        : resource === 'suppliers' ? { status: 'active' } : resource === 'customers' ? { level: 'new', total_spent: 0 } : { record_time: now() };
      const row: Row = { ...defaults, ...previous, ...copy(input), id: id ?? sequence++, updated_at: now() };
      const required: Record<string, string[]> = { products: ['sku', 'name', 'category'], orders: ['customer', 'amount', 'item_count'], purchases: ['supplier', 'amount', 'item_count'], customers: ['name'], suppliers: ['name'], finance: ['record_type', 'amount', 'category'] };
      requireFields(row, required[resource] ?? []);
      for (const key of ['unit_price', 'stock', 'safe_stock', 'amount', 'total_spent', 'item_count']) if (row[key] !== undefined) {
        const value = Number(row[key]);
        if (!Number.isFinite(value) || value < 0 || ['stock', 'safe_stock', 'item_count'].includes(key) && !Number.isInteger(value)) throw new Error(`数值无效：${key}`);
        row[key] = value;
      }
      if (resource === 'products') {
        if (rows.some(item => item.id !== id && String(item.sku).toLowerCase() === String(row.sku).toLowerCase())) throw new Error('SKU 已存在');
        if (!previous) {
          erp.inventory.unshift({ id: sequence++, product_id: row.id, product_name: row.name, stock: 0, safe_stock: 0, updated_at: now() });
          rows.unshift(row);
        }
        const inventory = erp.inventory.find(item => item.product_id === row.id)!;
        inventory.product_name = row.name;
        const delta = num(row.stock) - num(inventory.stock);
        if (delta) move(row.id, { type: delta > 0 ? 'in' : 'out', quantity: Math.abs(delta), remark: '商品库存调整' });
      }
      if (resource === 'inventory') {
        if (!previous) throw new Error('请通过商品建档或入库创建库存');
        if (input.stock !== undefined && num(input.stock) !== num(previous.stock)) throw new Error('请使用入库/出库调整库存');
      }
      if (resource === 'orders' || resource === 'purchases') {
        const numberField = resource === 'orders' ? 'order_no' : 'purchase_no';
        if (!previous) row[numberField] = `${resource === 'orders' ? 'SO' : 'PO'}${today().replaceAll('-', '')}${row.id}`;
        const final = resource === 'orders' ? 'completed' : 'received';
        if (previous?.status === final && row.status !== final) throw new Error('已结算单据不可回退状态');
        if (row.status === final && previous?.status !== final) {
          for (const item of (Array.isArray(row.items) ? row.items : []) as Record<string, unknown>[]) if (item.product_id) move(num(item.product_id), { type: resource === 'orders' ? 'out' : 'in', quantity: num(item.quantity), referenceNo: row[numberField] });
          erp.finance.unshift({ id: sequence++, record_type: resource === 'orders' ? 'income' : 'expense', amount: row.amount, category: resource === 'orders' ? '销售收入' : '采购支出', related_no: row[numberField], operator: '演示管理员', record_time: now() });
          if (resource === 'orders') {
            const customer = erp.customers.find(customer => customer.id === row.customer_id || customer.name === row.customer);
            if (customer) customer.total_spent = num(customer.total_spent) + num(row.amount);
          }
        }
      }
      const existing = rows.findIndex(item => item.id === row.id);
      if (existing < 0) rows.unshift(row); else rows[existing] = row;
      return resource === 'inventory' ? stockRow(row) : row;
    });
  }
  const search = (rows: Row[], keyword?: string) => rows.filter(row => !keyword || JSON.stringify(row).toLowerCase().includes(keyword.toLowerCase()));
  return {
    async listErp(resource, query = {}) { const rows = table(erp, resource).map(row => resource === 'inventory' ? stockRow(row) : row); return copy(search(rows, query.keyword).filter(row => !query.status || row[resource === 'finance' ? 'record_type' : 'status'] === query.status)); },
    async getErp(resource, id) { const row = find(erp, resource, id); return copy(resource === 'inventory' ? stockRow(row) : row); },
    async createErp(resource, input) { return saveErp(resource, null, input); },
    async updateErp(resource, id, input) { return saveErp(resource, id, input); },
    async deleteErp(resource, id) { find(erp, resource, id); erp[resource] = table(erp, resource).filter(row => row.id !== id); if (resource === 'products') { erp.inventory = erp.inventory.filter(row => row.product_id !== id); erp.flows = erp.flows.filter(row => row.product_id !== id); } },
    async moveErpInventory(id, input) { return atomic(() => move(id, input)); },
    async listErpInventoryFlows(id) { return copy(erp.flows.filter(row => row.product_id === id)); },
    async approveErpPurchase(id, input) { const row = saveErp('purchases', id, { ...input, status: 'received' }); return row; },
    async listErpInventoryAlerts() { return copy(erp.inventory.map(stockRow).filter(row => row.status !== 'normal')); },
    async getErpStats(resource) { const rows = table(erp, resource); return { total: rows.length, totalAmount: rows.reduce((sum, row) => sum + num(row.amount), 0) }; },
    async getErpReports() {
      const trend = new Map<string, number>(); const statuses = new Map<string, number>(); const products = new Map<string, number>();
      const labels: Record<string, string> = { pending_payment: '待付款', pending_shipping: '待发货', completed: '已完成', cancelled: '已取消' };
      for (const order of erp.orders) {
        const status = labels[String(order.status)] ?? String(order.status); statuses.set(status, (statuses.get(status) ?? 0) + 1);
        if (order.status !== 'completed') continue;
        const day = String(order.order_date).slice(0, 10); trend.set(day, (trend.get(day) ?? 0) + num(order.amount));
        for (const item of (Array.isArray(order.items) ? order.items : []) as Record<string, unknown>[]) products.set(String(item.product_name), (products.get(String(item.product_name)) ?? 0) + num(item.quantity));
      }
      const totalIncome = erp.finance.filter(row => row.record_type === 'income').reduce((sum, row) => sum + num(row.amount), 0);
      const totalExpense = erp.finance.filter(row => row.record_type === 'expense').reduce((sum, row) => sum + num(row.amount), 0);
      return { salesTrend: [...trend].sort().map(([label, value]) => ({ label, value })), orderStatus: [...statuses].map(([label, value]) => ({ label, value })), topProducts: [...products].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({ label, value })), metrics: { totalIncome, totalExpense, netCashFlow: totalIncome - totalExpense, totalOrders: erp.orders.filter(row => row.status !== 'cancelled').length } };
    },
    async oaList(resource, query = {}) {
      return copy(search(table(oa, resource), query.keyword).filter(row => {
        if (query.status && row.status !== query.status) return false;
        if (resource === 'attendance' && ((query.from && String(row.attendance_date) < query.from) || (query.to && String(row.attendance_date) > query.to))) return false;
        if (resource === 'approval' && query.tab === 'pending') return row.status === 'pending';
        if (resource === 'approval' && query.tab === 'done') return row.status !== 'pending';
        return true;
      }));
    },
    async oaGet(resource, id) { return copy(find(oa, resource, id)); },
    async oaCreate(resource, input) {
      const rows = table(oa, resource);
      if (resource === 'attendance' && input.type) {
        if (!['in', 'out'].includes(String(input.type))) throw new Error('打卡类型无效');
        let row = rows.find(row => row.attendance_date === today() && row.user_id === 1);
        const field = input.type === 'out' ? 'check_out' : 'check_in';
        if (row?.[field]) throw new Error('今天已经完成此项打卡');
        if (!row) { row = { id: sequence++, user_id: 1, attendance_date: today(), status: 'normal', remark: '' }; rows.unshift(row); }
        row[field] = now(); return copy(row);
      }
      requireFields(input, resource === 'org' ? ['name'] : resource === 'attendance' ? ['attendance_date'] : ['title']);
      const id = sequence++;
      const defaults = resource === 'approval' ? { approval_no: `OA${today().replaceAll('-', '')}${id}`, approval_type: 'leave', status: 'pending', current_node: '部门主管', applicant_id: 1, records: [], submitted_at: now() }
        : resource === 'notices' ? { notice_type: 'notice', status: 'draft', is_top: 0 } : resource === 'org' ? { member_count: 0, parent_id: null } : { status: 'normal' };
      const row: Row = { ...defaults, ...copy(input), id }; rows.unshift(row); return copy(row);
    },
    async oaUpdate(resource, id, input) {
      const row = find(oa, resource, id); const next: Row = { ...row, ...copy(input), id };
      if (resource === 'approval' && input.action) {
        if (row.status !== 'pending') throw new Error('审批已结束');
        const statuses: Record<string, string> = { approve: 'approved', reject: 'rejected', cancel: 'cancelled' };
        if (!statuses[String(input.action)]) throw new Error('审批操作无效');
        if (input.action === 'reject' && !String(input.opinion ?? '').trim()) throw new Error('请填写驳回意见');
        next.status = statuses[String(input.action)]; next.current_node = '完成';
        next.records = [...(Array.isArray(row.records) ? row.records : []), { status: next.status, opinion: input.opinion ?? '', handled_at: now() }];
      }
      oa[resource] = table(oa, resource).map(row => row.id === id ? next : row); return copy(next);
    },
    async oaDelete(resource, id) { const row = find(oa, resource, id); if (resource === 'org' && (num(row.member_count) > 0 || oa.org.some(item => item.parent_id === id))) throw new Error('部门存在成员或子部门'); oa[resource] = table(oa, resource).filter(row => row.id !== id); },
  };
}
