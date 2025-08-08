import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import type { DBService } from "../interfaces/DBService.ts";
import type { GoogleAuthService } from "../interfaces/GoogleAuthService.ts";
import type { UserToken } from "../types/UserToken.js";

export class GoogleAuthServiceImpl implements GoogleAuthService {
  private oauth2Client: any; // Using any to avoid version conflicts
  private db: DBService;

  constructor(db: DBService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );

    this.db = db;
  }

  // Step 1: Get Google Auth URL
  generateAuthUrl(forceConsent: boolean = false): string {
    const authParams: any = {
      access_type: "offline",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/presentations",
        "https://www.googleapis.com/auth/drive",
      ],
      include_granted_scopes: true,
    };

    // Only force consent if explicitly requested (e.g., when refresh token is missing)
    if (forceConsent) {
      authParams.prompt = "consent";
    }

    return this.oauth2Client.generateAuthUrl(authParams);
  }

  // Step 2: Exchange code for tokens & store them
  async handleOAuthCallback(code: string): Promise<string> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2("v2");
    const userInfo = await oauth2.userinfo.get({ auth: this.oauth2Client });
    const userName = userInfo.data.name!;
    const userEmail = userInfo.data.email!;
    const userId = userInfo.data.id!;
    const accessToken = tokens.access_token!;
    const refreshToken = tokens.refresh_token; // Can be undefined on subsequent logins
    const expiry = new Date(tokens.expiry_date || Date.now());

    // Check if user exists
    const existingUser = await this.db.getUserToken(userId);

    if (existingUser) {
      // Existing user - only store if we have refresh token or token is expired
      const tokenData: Partial<UserToken> & Pick<UserToken, "user_id"> = {
        user_id: userId,
        access_token: accessToken,
        expiry,
      };

      // Include refresh token if provided
      if (refreshToken) {
        tokenData.refresh_token = refreshToken;
      }

      await this.db.storeOrUpdateUserToken(tokenData);
    } else {
      // New user - must have refresh token
      if (!refreshToken) {
        throw new Error("MISSING_REFRESH_TOKEN");
      }

      // Store complete user data
      const tokenData: Partial<UserToken> & Pick<UserToken, "user_id"> = {
        user_name: userName,
        user_email: userEmail,
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry,
      };

      await this.db.storeOrUpdateUserToken(tokenData);
    }

    // Return userId so you can store it in session/JWT
    return userId;
  }

  // Step 3: Load & refresh tokens when needed
  async getClientForUser(userId: string): Promise<any> {
    const token = await this.db.getUserToken(userId);
    if (!token) throw new Error("User not authenticated");

    this.oauth2Client.setCredentials({
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expiry_date: new Date(token.expiry).getTime(),
    });

    // Refresh if expired
    if (Date.now() >= new Date(token.expiry).getTime()) {
      try {
        const refreshed = await this.oauth2Client.refreshAccessToken();
        const { credentials } = refreshed;

        // Update tokens in database
        const refreshTokenData: Partial<UserToken> &
          Pick<UserToken, "user_id"> = {
          user_id: userId,
          access_token: credentials.access_token!,
          expiry: new Date(credentials.expiry_date || Date.now() + 3600 * 1000),
        };

        // Include refresh token if provided
        if (credentials.refresh_token) {
          refreshTokenData.refresh_token = credentials.refresh_token;
        }

        await this.db.storeOrUpdateUserToken(refreshTokenData);
        this.oauth2Client.setCredentials(credentials);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        throw new Error("Token refresh failed - user needs to re-authenticate");
      }
    }

    return this.oauth2Client;
  }
}
