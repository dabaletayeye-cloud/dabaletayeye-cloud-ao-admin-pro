import { apiAdapter } from './adapter';
import type { MenuItem } from './types';
export const listMenus = (): Promise<MenuItem[]> => apiAdapter.listMenus();
export const createMenu = (input: Partial<MenuItem>): Promise<MenuItem> => apiAdapter.createMenu(input);
export const updateMenu = (id: number, input: Partial<MenuItem>): Promise<MenuItem> => apiAdapter.updateMenu(id, input);
export const deleteMenu = (id: number): Promise<void> => apiAdapter.deleteMenu(id);
