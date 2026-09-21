import { apiAdapter } from './adapter';
import type { CurrentProfile, CurrentProfileInput } from './adapters/types';

export type { CurrentProfile, CurrentProfileInput };

export const getCurrentProfile = (): Promise<CurrentProfile> => apiAdapter.getCurrentProfile();
export const updateCurrentProfile = (input: CurrentProfileInput): Promise<CurrentProfile> => apiAdapter.updateCurrentProfile(input);
export const changeCurrentPassword = (input: { currentPassword: string; newPassword: string }): Promise<void> => apiAdapter.changeCurrentPassword(input);
