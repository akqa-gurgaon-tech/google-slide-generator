import type { DBService } from "../interfaces/DBService.ts";
import type { UserToken } from "../types/UserToken.js";
import type { CustomTheme } from "../interfaces/ThemeDBService.ts";
export declare class NeonDBService implements DBService {
    private static instance;
    private pool;
    private constructor();
    static getInstance(connectionString: string): NeonDBService;
    storeOrUpdateUserToken(token: Partial<UserToken> & Pick<UserToken, 'user_id'>): Promise<void>;
    getUserToken(userId: string): Promise<UserToken>;
    close(): Promise<void>;
    createTheme(theme: Omit<CustomTheme, 'id' | 'created_at'>): Promise<CustomTheme>;
    getThemeById(themeId: string): Promise<CustomTheme | null>;
    getThemesByUser(userId: string): Promise<CustomTheme[]>;
    getAllThemes(): Promise<CustomTheme[]>;
    updateTheme(themeId: string, userId: string, updates: Partial<Pick<CustomTheme, 'theme_desc' | 'schema_str'>>): Promise<CustomTheme | null>;
    deleteTheme(themeId: string, userId: string): Promise<boolean>;
    isThemeOwner(themeId: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=NeonDBService.d.ts.map