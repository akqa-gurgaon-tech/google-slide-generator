import { Pool } from "@neondatabase/serverless";
import type { DBService } from "../interfaces/DBService.ts";

export class NeonDBService implements DBService {
    private pool: Pool;

    constructor(connectionString: string) {
        this.pool = new Pool({ connectionString });
        console.log("DB connected")
    }

    async storeOrUpdateUserToken(token: UserToken): Promise<void> {
        await this.pool.query(
            `
            INSERT INTO user_tokens (user_id, access_token, refresh_token, expiry)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id)
            DO UPDATE SET access_token = $2, refresh_token = $3, expiry = $4;
            `,
            [token.user_id, token.access_token, token.refresh_token, token.expiry]
        );
    }

    async getUserToken(userId: string): Promise<UserToken | null> {
        const result = await this.pool.query<UserToken>(
            'SELECT * FROM user_tokens WHERE user_id = $1',
            [userId]
        );

        return result.rows[0] || null;
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}