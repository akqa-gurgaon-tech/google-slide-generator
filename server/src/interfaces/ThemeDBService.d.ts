export interface CustomTheme {
    id?: number;
    theme_id: string;
    theme_desc?: string;
    schema_str: any;
    created_by: string;
    created_at?: Date;
}
export interface ThemeDBService {
    createTheme(theme: Omit<CustomTheme, 'id' | 'created_at'>): Promise<CustomTheme>;
    getThemeById(themeId: string): Promise<CustomTheme | null>;
    getThemesByUser(userId: string): Promise<CustomTheme[]>;
    getAllThemes(): Promise<CustomTheme[]>;
    updateTheme(themeId: string, userId: string, updates: Partial<Pick<CustomTheme, 'theme_desc' | 'schema_str'>>): Promise<CustomTheme | null>;
    deleteTheme(themeId: string, userId: string): Promise<boolean>;
    isThemeOwner(themeId: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=ThemeDBService.d.ts.map