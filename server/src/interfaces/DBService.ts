export interface DBService {
    getUserToken(userId: string): Promise< | null>;
    storeOrUpdateUserToken(token: UserToken): Promise<void>;
    close(): Promise<void>;
}