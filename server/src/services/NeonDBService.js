import { Pool } from "@neondatabase/serverless";
export class NeonDBService {
    static instance;
    pool;
    constructor(connectionString) {
        this.pool = new Pool({ connectionString });
        console.log("NeonDB connected");
    }
    static getInstance(connectionString) {
        if (!NeonDBService.instance) {
            NeonDBService.instance = new NeonDBService(connectionString);
        }
        return NeonDBService.instance;
    }
    async storeOrUpdateUserToken(token) {
        // Check if user exists to determine if this is an insert or update
        const existingUser = await this.getUserToken(token.user_id);
        if (existingUser) {
            // User exists - only update if token is expired or we have new refresh token
            const now = new Date();
            const tokenExpiry = new Date(existingUser.expiry);
            // Only update if token is expired OR we have a new refresh token
            if (now >= tokenExpiry || token.refresh_token) {
                const updateFields = [];
                const updateValues = [];
                let paramIndex = 1;
                // Always update access token and expiry when updating
                if (token.access_token !== undefined) {
                    updateFields.push(`access_token = $${paramIndex++}`);
                    updateValues.push(token.access_token);
                }
                if (token.expiry !== undefined) {
                    updateFields.push(`expiry = $${paramIndex++}`);
                    updateValues.push(token.expiry);
                }
                // Update refresh token only if provided
                if (token.refresh_token !== undefined) {
                    updateFields.push(`refresh_token = $${paramIndex++}`);
                    updateValues.push(token.refresh_token);
                }
                // Update user info if provided
                if (token.user_name !== undefined) {
                    updateFields.push(`user_name = $${paramIndex++}`);
                    updateValues.push(token.user_name);
                }
                if (token.user_email !== undefined) {
                    updateFields.push(`user_email = $${paramIndex++}`);
                    updateValues.push(token.user_email);
                }
                if (updateFields.length > 0) {
                    updateValues.push(token.user_id);
                    await this.pool.query(`UPDATE user_tokens SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex}`, updateValues);
                    console.log('Updated existing user tokens');
                }
                else {
                    console.log('No update needed - token still valid');
                }
            }
            else {
                console.log('User exists with valid token - no update needed');
            }
        }
        else {
            // New user - require ALL mandatory fields including refresh_token
            if (!token.user_name || !token.user_email || !token.access_token || !token.refresh_token || !token.expiry) {
                throw new Error('Missing required fields for new user registration. All fields including refresh_token are mandatory.');
            }
            console.log('Inserting new user with complete data');
            await this.pool.query(`INSERT INTO user_tokens (user_name, user_email, user_id, access_token, refresh_token, expiry)
                 VALUES ($1, $2, $3, $4, $5, $6)`, [token.user_name, token.user_email, token.user_id, token.access_token, token.refresh_token, token.expiry]);
        }
    }
    async getUserToken(userId) {
        const result = await this.pool.query('SELECT user_name, user_email, user_id, access_token, refresh_token, expiry FROM user_tokens WHERE user_id = $1', [userId]);
        return result.rows[0] || {};
    }
    async close() {
        await this.pool.end();
    }
    // Theme Database Operations
    async createTheme(theme) {
        try {
            const result = await this.pool.query(`INSERT INTO theme_schema (theme_id, theme_desc, schema_str, created_by)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`, [theme.theme_id, theme.theme_desc, JSON.stringify(theme.schema_str), theme.created_by]);
            if (result.rows.length === 0) {
                throw new Error('Failed to create theme');
            }
            const createdTheme = result.rows[0];
            // Parse the JSONB back to object
            return {
                ...createdTheme,
                schema_str: typeof createdTheme.schema_str === 'string'
                    ? JSON.parse(createdTheme.schema_str)
                    : createdTheme.schema_str
            };
        }
        catch (error) {
            if (error.code === '23505') { // Unique constraint violation
                throw new Error(`Theme with ID '${theme.theme_id}' already exists`);
            }
            throw error;
        }
    }
    async getThemeById(themeId) {
        const result = await this.pool.query('SELECT * FROM theme_schema WHERE theme_id = $1', [themeId]);
        if (result.rows.length === 0) {
            return null;
        }
        const theme = result.rows[0];
        return {
            ...theme,
            schema_str: typeof theme.schema_str === 'string'
                ? JSON.parse(theme.schema_str)
                : theme.schema_str
        };
    }
    async getThemesByUser(userId) {
        return this.getAllThemes();
        // TODO: Implement this if we need to get themes by user
        // const result = await this.pool.query<CustomTheme>(
        //     'SELECT * FROM theme_schema WHERE created_by = $1 ORDER BY created_at DESC',
        //     [userId]
        // );
        // return result.rows.map(theme => ({
        //     ...theme,
        //     schema_str: typeof theme.schema_str === 'string' 
        //         ? JSON.parse(theme.schema_str) 
        //         : theme.schema_str
        // }));
    }
    async getAllThemes() {
        const result = await this.pool.query('SELECT * FROM theme_schema ORDER BY created_at DESC');
        return result.rows.map(theme => ({
            ...theme,
            schema_str: typeof theme.schema_str === 'string'
                ? JSON.parse(theme.schema_str)
                : theme.schema_str
        }));
    }
    async updateTheme(themeId, userId, updates) {
        // First check if user owns the theme
        const isOwner = await this.isThemeOwner(themeId, userId);
        if (!isOwner) {
            throw new Error('User does not have permission to update this theme');
        }
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;
        if (updates.theme_desc !== undefined) {
            updateFields.push(`theme_desc = $${paramIndex++}`);
            updateValues.push(updates.theme_desc);
        }
        if (updates.schema_str !== undefined) {
            updateFields.push(`schema_str = $${paramIndex++}`);
            updateValues.push(JSON.stringify(updates.schema_str));
        }
        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }
        updateValues.push(themeId);
        // updateValues.push(userId);
        // const result = await this.pool.query<CustomTheme>(
        //     `UPDATE theme_schema 
        //      SET ${updateFields.join(', ')} 
        //      WHERE theme_id = $${paramIndex++} AND created_by = $${paramIndex++}
        //      RETURNING *`,
        //     updateValues
        // );
        const result = await this.pool.query(`UPDATE theme_schema 
             SET ${updateFields.join(', ')} 
             WHERE theme_id = $${paramIndex++}
             RETURNING *`, updateValues);
        if (result.rows.length === 0) {
            return null;
        }
        const theme = result.rows[0];
        return {
            ...theme,
            schema_str: typeof theme.schema_str === 'string'
                ? JSON.parse(theme.schema_str)
                : theme.schema_str
        };
    }
    async deleteTheme(themeId, userId) {
        // First check if user owns the theme
        const isOwner = await this.isThemeOwner(themeId, userId);
        if (!isOwner) {
            throw new Error('User does not have permission to delete this theme');
        }
        // const result = await this.pool.query(
        //     'DELETE FROM theme_schema WHERE theme_id = $1 AND created_by = $2',
        //     [themeId, userId]
        // );
        const result = await this.pool.query('DELETE FROM theme_schema WHERE theme_id = $1', [themeId]);
        return result.rowCount > 0;
    }
    async isThemeOwner(themeId, userId) {
        // TODO: Implement this if we need to check if the user is the owner of the theme
        const result = await this.pool.query('SELECT 1 FROM theme_schema WHERE theme_id = $1', [themeId]);
        // const result = await this.pool.query(
        //     'SELECT CASE WHEN EXISTS (SELECT 1 FROM user_tokens) THEN 1 ELSE 0 END'
        // );
        return result.rows.length > 0;
    }
}
//# sourceMappingURL=NeonDBService.js.map