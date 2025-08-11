import type { UserToken } from '../types/UserToken.js';

export interface DBService {
    getUserToken(userId: string): Promise<UserToken | null>;
    storeOrUpdateUserToken(token: Partial<UserToken> & Pick<UserToken, 'user_id'>): Promise<void>;
    close(): Promise<void>;
}