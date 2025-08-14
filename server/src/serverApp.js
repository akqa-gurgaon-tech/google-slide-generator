import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import { google } from "googleapis";
import { createPresentation, createEmptyPresentation, updatePresentationTitle, } from "./slideGenerator.js";
import { applyThemesToSlides } from "./themeUtils.js";
import cors from "cors";
import { NeonDBService } from "./services/NeonDBService.js";
import { GoogleAuthServiceImpl } from "./services/GoogleAuthServiceImpl.js";
import { MongoDBClient } from "./services/MongoDBClient.js";
import { extractSlideTemplates, createPresentationFromTemplate } from "./slideTemplateExtractor.js";
// Load environment variables
dotenv.config();
export function createServerApp() {
    const app = express();
    app.use(express.json());
    // Configure CORS for both local development and production
    const corsOrigins = process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || 'https://your-vercel-app.vercel.app']
        : ['http://localhost:5173', 'http://localhost:3000'];
    app.use(cors({
        origin: corsOrigins,
        credentials: true,
    }));
    // Initialize services
    const mongoClient = MongoDBClient.getInstance(process.env.MONGO_URI);
    const dbService = NeonDBService.getInstance(process.env.DATABASE_URL);
    const googleService = new GoogleAuthServiceImpl(dbService);
    // Configure sessions
    app.use(session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            secure: process.env.NODE_ENV === 'production', // HTTPS in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        },
    }));
    // Add all your existing routes here...
    // (I'll include the key routes, but you'll need to copy all routes from the original server.ts)
    // Health check endpoint
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // Step 1: Redirect user to Google
    app.get("/auth", async (req, res) => {
        try {
            const forceConsent = req.query.force === 'true';
            const authUrl = await googleService.getAuthUrl(forceConsent);
            res.redirect(authUrl);
        }
        catch (error) {
            console.error("Error generating auth URL:", error);
            res.status(500).json({ error: "Failed to generate auth URL" });
        }
    });
    // Step 2: Handle the callback and exchange code for tokens
    app.get("/auth/callback", async (req, res) => {
        const { code } = req.query;
        if (!code || typeof code !== "string") {
            return res.status(400).json({ error: "Authorization code is required" });
        }
        try {
            const userId = await googleService.handleAuthCallback(code);
            // Store userId in session
            req.session.userId = userId;
            // Redirect to frontend with success
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/?auth=success`);
        }
        catch (err) {
            console.error("Error in auth callback:", err);
            if (err.message === "MISSING_REFRESH_TOKEN") {
                // Redirect back to auth with force consent
                return res.redirect("/auth?force=true");
            }
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/?auth=error&message=${encodeURIComponent(err.message)}`);
        }
    });
    // Check authentication status
    app.get("/auth/status", async (req, res) => {
        const userId = req.session.userId;
        if (!userId) {
            return res.json({ authenticated: false });
        }
        try {
            const userToken = await dbService.getUserToken(userId);
            res.json({
                authenticated: true,
                userId: userId,
                hasRefreshToken: !!userToken?.refresh_token,
            });
        }
        catch (error) {
            console.error("Error checking auth status:", error);
            if (error.message?.includes("re-authenticate with consent")) {
                return res.json({
                    authenticated: false,
                    requiresConsent: true,
                    message: "Please re-authenticate to grant necessary permissions",
                });
            }
            res.status(500).json({
                authenticated: false,
                error: "Failed to check authentication status",
            });
        }
    });
    // Logout endpoint
    app.post("/auth/logout", (req, res) => {
        req.session.destroy(() => {
            res.json({ success: true });
        });
    });
    // Get user presentations
    app.get("/api/presentations", async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        try {
            const userToken = await dbService.getUserToken(req.session.userId);
            res.json({
                authenticated: true,
                userId: req.session.userId,
                presentations: [], // Add your presentations logic here
            });
        }
        catch (error) {
            console.error("Error fetching presentations:", error);
            res.status(500).json({ error: "Failed to fetch presentations" });
        }
    });
    // Add more routes as needed...
    // You'll need to copy all the remaining routes from your original server.ts file
    return app;
}
// Helper functions (copy from original server.ts)
function mapLayoutTypeToEditorFormat(layoutType) {
    const layoutMap = {
        'TITLE_SLIDE': 'TITLE_SLIDE',
        'TITLE_AND_BODY': 'TITLE_AND_CONTENT',
        'TITLE_AND_TWO_COLUMNS': 'TWO_COLUMN',
        'TITLE_ONLY': 'TITLE_ONLY',
        'BLANK': 'CENTERED_TITLE'
    };
    return layoutMap[layoutType] || 'TITLE_AND_CONTENT';
}
function extractInputsFromContent(slideContent) {
    const inputs = {};
    if (slideContent?.placeholders) {
        Object.entries(slideContent.placeholders).forEach(([placeholderType, content]) => {
            const fieldName = mapPlaceholderToEditorField(placeholderType);
            inputs[fieldName] = content.text || '';
        });
    }
    return inputs;
}
function mapPlaceholderToEditorField(placeholderType) {
    const fieldMap = {
        'CENTERED_TITLE': 'CENTERED_TITLE',
        'TITLE': 'TITLE',
        'SUBTITLE': 'SUBTITLE',
        'BODY': 'BODY',
        'LEFT_COLUMN': 'LEFT_COLUMN',
        'RIGHT_COLUMN': 'RIGHT_COLUMN'
    };
    return fieldMap[placeholderType] || placeholderType;
}
//# sourceMappingURL=serverApp.js.map