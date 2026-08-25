import { apiAdapter } from './adapter';

export const listFiles = () => apiAdapter.listFiles();
export const uploadFiles = (files: File[], folder?: import('./types').ManagedFileFolder) => apiAdapter.uploadFiles(files, folder);
export const downloadFile = (id: number) => apiAdapter.downloadFile(id);
export const deleteFile = (id: number) => apiAdapter.deleteFile(id);
export const getFileStorageInfo = () => apiAdapter.getFileStorageInfo();
