import type { BaseUser } from '../baseUser';
import type {
  ApiListQuery, Article, Category, DashboardAnalyticsData, DashboardAnalyticsRange, DashboardData, DictItem, DictType, EcommerceDashboardData, ExceptionLog,
  FunnelData, LoginLog, MenuItem, OperationLog, PageResult, Role, Tag, User,
  UserPortraitData, VisitStatsData,
  FileStorageInfo, ManagedFile, ManagedFileFolder,
  SystemConfig,
  ServerInfo,
  OrderInfo, OrderStats,
} from '../types';
import type { EditionConfig } from '../../core/edition';
import type { SystemUser, SystemUserInput } from '../types';

export interface CurrentProfile extends BaseUser {}

export interface CurrentProfileInput {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  region: string;
  gender: string;
  department: string;
  position: string;
  bio: string;
}

export type LowcodeResourceType = 'api' | 'page' | 'form' | 'report' | 'print' | 'generator';
export interface LowcodeResource {
  id: string;
  resourceType: LowcodeResourceType;
  resourceKey: string;
  name: string;
  definition: Record<string, unknown>;
  status: 'draft' | 'published' | string;
  currentVersion?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface LowcodeValidationIssue { code: string; message: string; nodeId?: string | null; }
export interface LowcodeValidationResult { valid: boolean; issues: LowcodeValidationIssue[]; }
export interface LowcodeTestRun { successful: boolean; dryRun: boolean; trace: string[]; validation: LowcodeValidationResult; }
export interface LowcodeDataSource {
  id: string;
  name: string;
  sourceType: 'mysql' | 'postgresql' | 'redis' | 'http' | string;
  host?: string | null;
  port?: number | null;
  username?: string | null;
  secretRef?: string | null;
  secretConfigured: boolean;
  databaseName?: string | null;
  baseUrl?: string | null;
  headersJson?: string | null;
  status: 'ready' | 'incomplete' | string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface LowcodeDataSourceTest { ready: boolean; status: string; messages: string[]; checkedAt: string; }
export interface LowcodeRelease {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: LowcodeResourceType | string;
  version: string;
  publisher: string;
  releaseNote: string;
  snapshotJson: string;
  active: boolean;
  createdAt: string;
}
export interface LowcodeResourceInput { resourceType: LowcodeResourceType; resourceKey: string; name: string; definition: Record<string, unknown>; }
export interface LowcodeDataSourceInput { name: string; sourceType: string; host?: string; port?: number; username?: string; secretRef?: string; databaseName?: string; baseUrl?: string; headersJson?: string; }

export interface ApiAdapter {
  getTenancyContext(): Promise<import('../tenancyTypes').TenancyContext>;
  saveTenantRegion(input: import('../tenancyTypes').RegionInput, id?: number): Promise<void>;
  saveTenantMerchant(input: import('../tenancyTypes').MerchantInput, id?: number): Promise<void>;
  listMerchantMembers(id: number): Promise<import('../tenancyTypes').MerchantMember[]>;
  bindMerchantMember(id: number, type: string, user: number): Promise<void>;
  unbindMerchantMember(id: number, type: string, user: number): Promise<void>;
  listTypedUsers(type: string, query?: ApiListQuery): Promise<PageResult<SystemUser>>;
  createTypedUser(type: string, input: SystemUserInput): Promise<SystemUser>;
  updateTypedUser(type: string, id: number, input: SystemUserInput): Promise<SystemUser>;
  deleteTypedUser(type: string, id: number): Promise<void>;
  listSystemUsers(query?: ApiListQuery): Promise<PageResult<SystemUser>>;
  createSystemUser(input: SystemUserInput): Promise<SystemUser>;
  updateSystemUser(id: number, input: SystemUserInput): Promise<SystemUser>;
  deleteSystemUser(id: number): Promise<void>;
  oaList(resource: string, query?: Record<string, string>): Promise<Record<string, unknown>[]>;
  oaGet(resource: string, id: number): Promise<Record<string, unknown>>;
  oaCreate(resource: string, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  oaUpdate(resource: string, id: number, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  oaDelete(resource: string, id: number): Promise<void>;
  login(input: { username: string; password: string }): Promise<{
    token: string;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    refreshExpiresIn?: number;
    user: User;
  }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getCurrentProfile(): Promise<CurrentProfile>;
  updateCurrentProfile(input: CurrentProfileInput): Promise<CurrentProfile>;
  changeCurrentPassword(input: { currentPassword: string; newPassword: string }): Promise<void>;
  listUsers(query?: ApiListQuery): Promise<PageResult<User>>;
  createUser(input: Partial<User>): Promise<User>;
  updateUser(id: number, input: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  listRoles(query?: ApiListQuery): Promise<PageResult<Role>>;
  createRole(input: Partial<Role>): Promise<Role>;
  updateRole(id: number, input: Partial<Role>): Promise<Role>;
  deleteRole(id: number): Promise<void>;
  updateRolePermissions(id: number, permissions: string[]): Promise<Role>;
  listMenus(): Promise<MenuItem[]>;
  createMenu(input: Partial<MenuItem>): Promise<MenuItem>;
  updateMenu(id: number, input: Partial<MenuItem>): Promise<MenuItem>;
  deleteMenu(id: number): Promise<void>;
  getDashboard(): Promise<DashboardData>;
  getDashboardAnalytics(days?: DashboardAnalyticsRange): Promise<DashboardAnalyticsData>;
  getEcommerceDashboard(days?: DashboardAnalyticsRange): Promise<EcommerceDashboardData>;
  listArticles(query?: ApiListQuery & { category?: string }): Promise<PageResult<Article>>;
  createArticle(input: Partial<Article>): Promise<Article>;
  updateArticle(id: number, input: Partial<Article>): Promise<Article>;
  deleteArticle(id: number): Promise<void>;
  listCategories(): Promise<Category[]>;
  createCategory(input: Partial<Category>): Promise<Category>;
  updateCategory(id: number, input: Partial<Category>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  listTags(): Promise<Tag[]>;
  createTag(input: Partial<Tag>): Promise<Tag>;
  updateTag(id: number, input: Partial<Tag>): Promise<Tag>;
  deleteTag(id: number): Promise<void>;
  getVisitStats(): Promise<VisitStatsData>;
  getUserPortrait(): Promise<UserPortraitData>;
  getFunnel(): Promise<FunnelData>;
  getCalendarEvents(params?: { year?: number; month?: number }): Promise<import('../types').CalEvent[]>;
  getChatData(): Promise<unknown>;
  getMapData(scope?: 'china' | 'world'): Promise<import('../types').RegionData[]>;
  listLogs(): Promise<{ login: LoginLog[]; operation: OperationLog[]; exception: ExceptionLog[] }>;
  listDict(): Promise<{ types: DictType[]; items: DictItem[] }>;
  listFiles(query?: { keyword?: string; folder?: ManagedFileFolder; kind?: import('../types').ManagedFileKind }): Promise<ManagedFile[]>;
  uploadFiles(files: File[], folder?: ManagedFileFolder): Promise<ManagedFile[]>;
  downloadFile(id: number): Promise<Blob>;
  deleteFile(id: number): Promise<void>;
  getFileStorageInfo(): Promise<FileStorageInfo>;
  getSystemConfig(): Promise<SystemConfig>;
  updateSystemConfig(input: Omit<SystemConfig, 'storage'>): Promise<SystemConfig>;
  getSystemEdition(): Promise<EditionConfig>;
  updateSystemEdition(input: EditionConfig): Promise<EditionConfig>;
  listServers(): Promise<ServerInfo[]>;
  serverAction(id: number, action: 'start' | 'stop' | 'restart'): Promise<ServerInfo>;
  listOrders(query?: { keyword?: string; status?: string }): Promise<OrderInfo[]>;
  getOrderStats(): Promise<OrderStats>;
  orderAction(id: number, action: 'process' | 'ship' | 'complete' | 'cancel' | 'restore'): Promise<OrderInfo>;
  listLowcodeResources(type?: LowcodeResourceType): Promise<LowcodeResource[]>;
  getLowcodeResource(id: string): Promise<LowcodeResource>;
  createLowcodeResource(input: LowcodeResourceInput): Promise<LowcodeResource>;
  updateLowcodeResource(id: string, input: LowcodeResourceInput): Promise<LowcodeResource>;
  deleteLowcodeResource(id: string): Promise<void>;
  validateLowcodeResource(id: string): Promise<LowcodeValidationResult>;
  testLowcodeResource(id: string): Promise<LowcodeTestRun>;
  listLowcodeDataSources(): Promise<LowcodeDataSource[]>;
  createLowcodeDataSource(input: LowcodeDataSourceInput): Promise<LowcodeDataSource>;
  updateLowcodeDataSource(id: string, input: LowcodeDataSourceInput): Promise<LowcodeDataSource>;
  deleteLowcodeDataSource(id: string): Promise<void>;
  testLowcodeDataSource(id: string): Promise<LowcodeDataSourceTest>;
  listLowcodeReleases(query?: { type?: LowcodeResourceType; resourceId?: string }): Promise<LowcodeRelease[]>;
  publishLowcodeResource(id: string, releaseNote: string): Promise<LowcodeRelease>;
  rollbackLowcodeRelease(id: string): Promise<LowcodeRelease>;
  listErp(resource: string, query?: { keyword?: string; status?: string }): Promise<Record<string, unknown>[]>;
  getErp(resource: string, id: number): Promise<Record<string, unknown>>;
  createErp(resource: string, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  updateErp(resource: string, id: number, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  deleteErp(resource: string, id: number): Promise<void>;
  moveErpInventory(productId: number, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  listErpInventoryFlows(productId: number): Promise<Record<string, unknown>[]>;
  getErpReports(): Promise<Record<string, unknown>>;
  approveErpPurchase(id: number, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  listErpInventoryAlerts(): Promise<Record<string, unknown>[]>;
  getErpStats(resource: string): Promise<Record<string, unknown>>;
}
