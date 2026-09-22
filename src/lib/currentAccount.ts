import type { BaseUser } from '../api/baseUser';
import { scopedStorageKey } from '../api/authConfig';

export interface CurrentAccount extends Omit<BaseUser, 'id'> {
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

const STORAGE_KEY = scopedStorageKey('ao-admin-pro.current-account');

export const DEFAULT_CURRENT_ACCOUNT: CurrentAccount = {
  name: '', account: '', email: '', phone: '', role: '', department: '', position: '', location: '', bio: '', avatar: '',
};

export function accountFromProfile(profile: BaseUser): CurrentAccount {
  return {id:profile.id,accountType:profile.accountType,clientId:profile.clientId,name:profile.name??'',email:profile.email??'',account:profile.username??'',phone:profile.phone??'',role:profile.role??'',department:profile.department??'',position:profile.position??'',location:profile.region??'',bio:profile.bio??'',avatar:profile.avatar??'',gender:profile.gender};
}

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
