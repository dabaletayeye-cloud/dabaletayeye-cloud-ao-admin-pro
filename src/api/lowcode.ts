import { mockAdapter } from './adapters/mock';
import type { LowcodeDataSourceInput, LowcodeResourceInput, LowcodeResourceType } from './adapters/types';

export type * from './adapters/types';

// 低代码中心是纯前端演示模块。无论全局 VITE_API_MODE 配置为何，
// 这里都固定使用 mockAdapter，避免请求后端、鉴权或数据库。
const lowcodeAdapter = mockAdapter;

export const listLowcodeResources = (type?: LowcodeResourceType) => lowcodeAdapter.listLowcodeResources(type);
export const getLowcodeResource = (id: string) => lowcodeAdapter.getLowcodeResource(id);
export const createLowcodeResource = (input: LowcodeResourceInput) => lowcodeAdapter.createLowcodeResource(input);
export const updateLowcodeResource = (id: string, input: LowcodeResourceInput) => lowcodeAdapter.updateLowcodeResource(id, input);
export const deleteLowcodeResource = (id: string) => lowcodeAdapter.deleteLowcodeResource(id);
export const validateLowcodeResource = (id: string) => lowcodeAdapter.validateLowcodeResource(id);
export const testLowcodeResource = (id: string) => lowcodeAdapter.testLowcodeResource(id);
export const listLowcodeDataSources = () => lowcodeAdapter.listLowcodeDataSources();
export const createLowcodeDataSource = (input: LowcodeDataSourceInput) => lowcodeAdapter.createLowcodeDataSource(input);
export const updateLowcodeDataSource = (id: string, input: LowcodeDataSourceInput) => lowcodeAdapter.updateLowcodeDataSource(id, input);
export const deleteLowcodeDataSource = (id: string) => lowcodeAdapter.deleteLowcodeDataSource(id);
export const testLowcodeDataSource = (id: string) => lowcodeAdapter.testLowcodeDataSource(id);
export const listLowcodeReleases = (query?: { type?: LowcodeResourceType; resourceId?: string }) => lowcodeAdapter.listLowcodeReleases(query);
export const publishLowcodeResource = (id: string, releaseNote: string) => lowcodeAdapter.publishLowcodeResource(id, releaseNote);
export const rollbackLowcodeRelease = (id: string) => lowcodeAdapter.rollbackLowcodeRelease(id);
