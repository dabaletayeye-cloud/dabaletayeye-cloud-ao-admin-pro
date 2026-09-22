/** Shared structural model for JSON users; no constructor is needed for API responses. */
export abstract class BaseUser {
  declare id: number;
  declare name: string;
  declare email: string;
  declare username?: string;
  declare accountType?: string;
  declare clientId?: string;
  declare phone?: string;
  declare avatar?: string;
  declare region?: string;
  declare gender?: string;
  declare role?: string;
  declare roles?: string[];
  declare status?: 'active' | 'inactive' | 'banned';
  declare department?: string;
  declare position?: string;
  declare bio?: string;
  declare joinDate?: string;
  declare progress?: number;
}
