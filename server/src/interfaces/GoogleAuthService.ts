import type { OAuth2Client } from "google-auth-library/build/src/auth/oauth2client.js";

export interface GoogleAuthService {
  generateAuthUrl(): string;
  handleOAuthCallback(code: string): Promise<string>;
  getClientForUser(userId: string): Promise<OAuth2Client>;
}