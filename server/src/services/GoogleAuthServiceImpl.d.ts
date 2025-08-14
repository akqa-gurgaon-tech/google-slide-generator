import type { DBService } from "../interfaces/DBService.ts";
import type { GoogleAuthService } from "../interfaces/GoogleAuthService.ts";
export declare class GoogleAuthServiceImpl implements GoogleAuthService {
    private oauth2Client;
    private db;
    constructor(db: DBService);
    generateAuthUrl(forceConsent?: boolean): string;
    handleOAuthCallback(code: string): Promise<string>;
    getClientForUser(userId: string): Promise<any>;
}
//# sourceMappingURL=GoogleAuthServiceImpl.d.ts.map