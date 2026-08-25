import type {
  ApiListQuery, Article, Category, DashboardData, DictItem, DictType, ExceptionLog,
  FunnelData, LoginLog, MenuItem, OperationLog, PageResult, Role, Tag, User,
  UserPortraitData, VisitStatsData,
  FileStorageInfo, ManagedFile, ManagedFileFolder,
  SystemConfig,
} from '../types';

export interface ApiAdapter {
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
}
