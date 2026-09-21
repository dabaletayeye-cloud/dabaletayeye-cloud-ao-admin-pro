export interface CurrentAccount {
  id?: number;
  name: string;
  account: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  position: string;
  location: string;
  bio: string;
  avatar: string;
  gender?: string;
}

const STORAGE_KEY = 'ao-admin-pro.current-account';

export const DEFAULT_CURRENT_ACCOUNT: CurrentAccount = {
  name: '超级管理员',
  account: 'admin',
  email: 'admin@example.com',
  phone: '138 0000 0000',
  role: '超级管理员',
  department: '平台管理部',
  position: '平台负责人',
  location: '上海',
  bio: '负责平台运营策略、团队协作与系统治理。',
  avatar: 'https://i.pravatar.cc/160?img=68',
};

export function getCurrentAccount(): CurrentAccount {
  if (typeof window === 'undefined') return DEFAULT_CURRENT_ACCOUNT;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_CURRENT_ACCOUNT;
    return { ...DEFAULT_CURRENT_ACCOUNT, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_CURRENT_ACCOUNT;
  }
}

export function saveCurrentAccount(account: CurrentAccount) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    window.dispatchEvent(new Event('ao-current-account-change'));
  }
}
