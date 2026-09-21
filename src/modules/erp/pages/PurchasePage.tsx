import { useState } from 'react';
import ErpResourcePage from './ErpResourcePage';

export default function PurchasePage() {
  const [tab, setTab] = useState<'purchases' | 'suppliers'>('purchases');
  return <><div style={{ position: 'fixed', right: 24, top: 76, zIndex: 30, display: 'flex', gap: 6 }}><button className="erp-btn secondary" onClick={() => setTab('purchases')}>采购订单</button><button className="erp-btn secondary" onClick={() => setTab('suppliers')}>供应商</button></div><ErpResourcePage resource={tab} /></>;
}
