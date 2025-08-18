export interface GoogleAuthService {
  generateAuthUrl(forceConsent?: boolean): string;
  getAuthUrl(forceConsent?: boolean): string;
  handleOAuthCallback(code: string): Promise<string>;
  handleAuthCallback(code: string): Promise<string>;
  getClientForUser(userId: string): Promise<any>;
}