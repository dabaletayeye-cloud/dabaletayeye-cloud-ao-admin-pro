import { httpAdapter } from './adapters/http';
import { mockAdapter } from './adapters/mock';
import type { ApiAdapter } from './adapters/types';

export const apiMode = (import.meta.env.VITE_API_MODE || 'mock').toLowerCase() === 'http' ? 'http' : 'mock';
export const apiAdapter: ApiAdapter = apiMode === 'http' ? httpAdapter : mockAdapter;
