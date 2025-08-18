import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { google } from 'googleapis';

// Import server services and utilities
import type { DBService } from '../server/src/interfaces/DBService';
import { NeonDBService } from '../server/src/services/NeonDBService';
import type { GoogleAuthService } from '../server/src/interfaces/GoogleAuthService';
import { GoogleAuthServiceImpl } from '../server/src/services/GoogleAuthServiceImpl';
import { extractSlideTemplates, createPresentationFromTemplate } from '../server/src/slideTemplateExtractor';

// Load environment variables
dotenv.config();

// Initialize services
let dbService: DBService;
let googleService: GoogleAuthService;

try {
  dbService = NeonDBService.getInstance(process.env.DATABASE_URL!);
  googleService = new GoogleAuthServiceImpl(dbService);
} catch (error) {
  console.error('Failed to initialize services:', error);
}

// Create Express app for serverless
const app = express();

// Configure middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.get('/api/auth', async (req, res) => {
  try {
    const forceConsent = req.query.force === 'true';
    const authUrl = await googleService.getAuthUrl(forceConsent);
    res.redirect(authUrl);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const userId = await googleService.handleAuthCallback(code);
    (req as any).session.userId = userId;
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/?auth=success`);
  } catch (err: any) {
    if (err.message === 'MISSING_REFRESH_TOKEN') {
      return res.redirect('/api/auth?force=true');
    }
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/?auth=error&message=${encodeURIComponent(err.message)}`);
  }
});

app.get('/api/auth/status', async (req, res) => {
  const userId = (req as any).session?.userId;
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
  } catch (error: any) {
    res.json({ authenticated: false, error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  (req as any).session?.destroy(() => {
    res.json({ success: true });
  });
});

// API routes placeholder - add your other routes here
app.get('/api/*', (req, res) => {
  res.json({ message: 'API endpoint not implemented yet', path: req.path });
});

// Export the handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve, reject) => {
    // Cast VercelRequest to Express Request to maintain compatibility
    const expressReq = req as any;
    const expressRes = res as any;
    
    app(expressReq, expressRes, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}
