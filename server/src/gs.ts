import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { NeonDatabase } from './db.ts';

export class GoogleClientService {
  private oauth2Client: OAuth2Client;
  private db: NeonDatabase;

  constructor(db: NeonDatabase) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );

    this.db = db;
  }

  // Step 1: Get Google Auth URL
  generateAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/presentations', 'https://www.googleapis.com/auth/userinfo.email'],
      prompt: 'consent'
    });
  }

  // Step 2: Exchange code for tokens & store them
  async handleOAuthCallback(code: string): Promise<string> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const userInfo = await google.oauth2('v2').userinfo.get({ auth: this.oauth2Client });
    console.log(userInfo);

    console.log(JSON.stringify(userInfo));

    const userId = userInfo.data.id!;
    const accessToken = tokens.access_token!;
    const refreshToken = tokens.refresh_token!;
    const expiry = new Date(tokens.expiry_date || Date.now());

    await this.db.storeOrUpdateUserToken({
      user_id: userId,
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry,
    });

    // Return userId so you can store it in session/JWT
    return userId;
  }

  // Step 3: Load & refresh tokens when needed
  async getClientForUser(userId: string): Promise<OAuth2Client> {
    const token = await this.db.getUserToken(userId);
    if (!token) throw new Error('User not authenticated');

    this.oauth2Client.setCredentials({
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expiry_date: new Date(token.expiry).getTime(),
    });

    // Refresh if expired
    if (Date.now() >= new Date(token.expiry).getTime()) {
      const refreshed = await this.oauth2Client.refreshAccessToken();
      const { credentials } = refreshed;

      await this.db.storeOrUpdateUserToken({
        user_id: userId,
        access_token: credentials.access_token!,
        refresh_token: credentials.refresh_token || token.refresh_token,
        expiry: new Date(credentials.expiry_date || Date.now() + 3600 * 1000),
      });

      this.oauth2Client.setCredentials(credentials);
    }

    return this.oauth2Client;
  }
}
