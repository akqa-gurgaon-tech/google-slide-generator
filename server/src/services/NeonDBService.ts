import { Pool } from "@neondatabase/serverless";
import type { DBService } from "../interfaces/DBService.ts";
import type { UserToken } from "../types/UserToken.js";

export class NeonDBService implements DBService {
    private pool: Pool;

    constructor(connectionString: string) {
        this.pool = new Pool({ connectionString });
        console.log("DB connected")
    }

    async storeOrUpdateUserToken(token: Partial<UserToken> & Pick<UserToken, 'user_id'>): Promise<void> {
        // Check if user exists to determine if this is an insert or update
        const existingUser = await this.getUserToken(token.user_id);
        
        if (existingUser) {
            // Update existing user - preserve refresh_token if not provided
            const updateFields: string[] = [];
            const updateValues: any[] = [];
            let paramIndex = 1;

            if (token.user_name !== undefined) {
                updateFields.push(`user_name = $${paramIndex++}`);
                updateValues.push(token.user_name);
            }
            if (token.user_email !== undefined) {
                updateFields.push(`user_email = $${paramIndex++}`);
                updateValues.push(token.user_email);
            }
            if (token.access_token !== undefined) {
                updateFields.push(`access_token = $${paramIndex++}`);
                updateValues.push(token.access_token);
            }
            if (token.refresh_token !== undefined) {
                updateFields.push(`refresh_token = $${paramIndex++}`);
                updateValues.push(token.refresh_token);
            }
            if (token.expiry !== undefined) {
                updateFields.push(`expiry = $${paramIndex++}`);
                updateValues.push(token.expiry);
            }

            updateValues.push(token.user_id);

            await this.pool.query(
                `UPDATE user_tokens SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex}`,
                updateValues
            );
        } else {
            // Insert new user - require all fields for initial insert except refresh_token
            if (!token.user_name || !token.user_email || !token.access_token || !token.expiry) {
                throw new Error('Missing required fields for new user registration');
            }

            // If no refresh token provided, this might be a subsequent login - skip insert for now
            if (!token.refresh_token) {
                console.log('No refresh token provided for new user, skipping database insert');
                return;
            }

            await this.pool.query(
                `INSERT INTO user_tokens (user_name, user_email, user_id, access_token, refresh_token, expiry)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [token.user_name, token.user_email, token.user_id, token.access_token, token.refresh_token, token.expiry]
            );
        }
    }

    async getUserToken(userId: string): Promise<UserToken | null> {
        const result = await this.pool.query<UserToken>(
            'SELECT user_name, user_email, user_id, access_token, refresh_token, expiry FROM user_tokens WHERE user_id = $1',
            [userId]
        );

        return result.rows[0] || null;
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}