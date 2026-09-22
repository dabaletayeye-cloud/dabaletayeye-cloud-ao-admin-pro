import { apiAdapter } from './adapter';
import type { RegionInput, MerchantInput } from './tenancyTypes';
export const tenancyApi = {
  context: () => apiAdapter.getTenancyContext(),
  saveRegion: (input: RegionInput, id?: number) => apiAdapter.saveTenantRegion(input, id),
  saveMerchant: (input: MerchantInput, id?: number) => apiAdapter.saveTenantMerchant(input, id),
  members: (id: number) => apiAdapter.listMerchantMembers(id),
  bind: (id: number, accountType: string, userId: number) => apiAdapter.bindMerchantMember(id, accountType, userId),
  unbind: (id: number, accountType: string, userId: number) => apiAdapter.unbindMerchantMember(id, accountType, userId),
};
