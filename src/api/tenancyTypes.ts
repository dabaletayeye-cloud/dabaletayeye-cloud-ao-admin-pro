export type RegionMode = 'SINGLE_REGION' | 'MULTI_REGION';
export interface Region { id: number; code: string; name: string; enabled: boolean; }
export interface Merchant extends Region { regionIds: number[]; }
export interface MerchantMember { accountType: string; userId: number; merchantId: number; }
export interface TenancyContext {
  editionConfig?: import('../core/edition').EditionConfig;
  enabled: boolean; available: boolean; regionMode: RegionMode; platform: boolean;
  merchantId?: number | null; regions: Region[]; merchants: Merchant[];
}
export type RegionInput = Omit<Region, 'id'>;
export type MerchantInput = Omit<Merchant, 'id'>;
