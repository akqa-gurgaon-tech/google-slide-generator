// Database interface for theme operations
export interface CustomTheme {
  id?: number;                    // Auto-generated primary key
  theme_id: string;              // Unique theme identifier
  theme_desc?: string;           // Theme description
  schema_str: any;               // Theme schema as JSONB
  created_by: string;            // User ID who created the theme
  created_at?: Date;             // Creation timestamp
}

export interface ThemeDBService {
  // Create a new custom theme
  createTheme(theme: Omit<CustomTheme, 'id' | 'created_at'>): Promise<CustomTheme>;
  
  // Get theme by theme_id
  getThemeById(themeId: string): Promise<CustomTheme | null>;
  
  // Get all themes created by a specific user
  getThemesByUser(userId: string): Promise<CustomTheme[]>;
  
  // Get all themes (for admin or public themes)
  getAllThemes(): Promise<CustomTheme[]>;
  
  // Update an existing theme (only by creator)
  updateTheme(themeId: string, userId: string, updates: Partial<Pick<CustomTheme, 'theme_desc' | 'schema_str'>>): Promise<CustomTheme | null>;
  
  // Delete a theme (only by creator)
  deleteTheme(themeId: string, userId: string): Promise<boolean>;
  
  // Check if user owns a theme
  isThemeOwner(themeId: string, userId: string): Promise<boolean>;
}
