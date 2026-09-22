import { scopedStorageKey } from './authConfig';
const key = scopedStorageKey('ao-merchant-scope');
export function merchantScope(): number {
  try { const id = Number(sessionStorage.getItem(key) || '0'); return Number.isSafeInteger(id) && id >= 0 ? id : 0; }
  catch { return 0; }
}
export function setMerchantScope(id: number) {
  if (!Number.isSafeInteger(id) || id < 0) throw new Error('商户 ID 无效');
  sessionStorage.setItem(key, String(id));
}
export function merchantHeaders(): Record<string,string> {
  return { 'X-Merchant-Id': String(merchantScope()) };
}
