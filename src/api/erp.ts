import { apiAdapter } from './adapter';

export const erpApi = {
  list: (resource: string, query?: { keyword?: string; status?: string }) => apiAdapter.listErp(resource, query),
  get: (resource: string, id: number) => apiAdapter.getErp(resource, id),
  create: (resource: string, input: Record<string, unknown>) => apiAdapter.createErp(resource, input),
  update: (resource: string, id: number, input: Record<string, unknown>) => apiAdapter.updateErp(resource, id, input),
  remove: (resource: string, id: number) => apiAdapter.deleteErp(resource, id),
  moveInventory: (productId: number, input: Record<string, unknown>) => apiAdapter.moveErpInventory(productId, input),
  flows: (productId: number) => apiAdapter.listErpInventoryFlows(productId),
  reports: () => apiAdapter.getErpReports(),
  approvePurchase: (id: number, input: Record<string, unknown>) => apiAdapter.approveErpPurchase(id, input),
  inventoryAlerts: () => apiAdapter.listErpInventoryAlerts(),
  stats: (resource: string) => apiAdapter.getErpStats(resource),
};
