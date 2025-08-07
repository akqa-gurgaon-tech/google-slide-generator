export interface GoogleAuthService {
  generateAuthUrl(forceConsent?: boolean): string;
  handleOAuthCallback(code: string): Promise<string>;
  getClientForUser(userId: string): Promise<any>;
}