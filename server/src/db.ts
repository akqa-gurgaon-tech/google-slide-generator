import { neon, Pool } from '@neondatabase/serverless';

interface User {
  id?: number;
  name: string;
  email: string;
}
import dotenv from 'dotenv';
dotenv.config();

export class NeonDatabase {
    
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  // Create a user
  async createUser(user: User): Promise<User | null> {
    const result = await this.pool.query<User>(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [user.name, user.email]
    );
    return result.rows[0] || null;
  }

  // Read (get user by ID)
  async getUser(email: string): Promise<User | null> {
    const result = await this.pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  // Update a user
  async updateUser(id: number, user: Partial<User>): Promise<User | null> {
    const fields = [];
    const values = [];
    let idx = 1;

    if (user.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(user.name);
    }
    if (user.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(user.email);
    }

    if (fields.length === 0) return null;

    values.push(id); // ID is last param
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;

    const result = await this.pool.query<User>(query, values);
    return result.rows[0] || null;
  }

  // Delete a user
  async deleteUser(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // List all users
  async listUsers(): Promise<User[]> {
    const result = await this.pool.query<User>('SELECT * FROM users ORDER BY id');
    return result.rows;
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



  // Close DB connection (optional for serverless)
  async close(): Promise<void> {
    await this.pool.end();
  }
}


// async function main()  {
//     const db = new NeonDatabase(process.env.DATABASE_URL || '');
//     console.log(process.env.DATABASE_URL);
//     const email = 'john.doe@2.com';
//     await db.createUser({ name: 'John aa', email: email});
//     const user = await db.getUser(email);
//     console.log(user);
//     await db.close();
// }

// main();