import { httpAdapter } from '../../../api/adapters/http';

export const erpApi = {
  list: (resource: string, query?: { keyword?: string; status?: string }) => httpAdapter.listErp(resource, query),
  get: (resource: string, id: number) => httpAdapter.getErp(resource, id),
  create: (resource: string, input: Record<string, unknown>) => httpAdapter.createErp(resource, input),
  update: (resource: string, id: number, input: Record<string, unknown>) => httpAdapter.updateErp(resource, id, input),
  remove: (resource: string, id: number) => httpAdapter.deleteErp(resource, id),
  moveInventory: (productId: number, input: Record<string, unknown>) => httpAdapter.moveErpInventory(productId, input),
  flows: (productId: number) => httpAdapter.listErpInventoryFlows(productId),
  reports: () => httpAdapter.getErpReports(),
  approvePurchase: (id: number, input: Record<string, unknown>) => httpAdapter.approveErpPurchase(id, input),
  inventoryAlerts: () => httpAdapter.listErpInventoryAlerts(),
  stats: (resource: string) => httpAdapter.getErpStats(resource),
};
