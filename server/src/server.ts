import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';

import { google } from 'googleapis';
import { createPresentation } from './slideGenerator.ts';
import cors from 'cors';
import type { DBService } from './interfaces/DBService.ts';
import { NeonDBService } from './services/NeonDBService.ts';
import type { GoogleAuthService } from './interfaces/GoogleAuthService.ts';
import { GoogleAuthServiceImpl } from './services/GoogleAuthServiceImpl.ts';

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', // Allow your frontend origin
  credentials: true, // If sending cookies or Authorization header
}));

const dbService: DBService = new NeonDBService(process.env.DATABASE_URL!);
const googleService: GoogleAuthService = new GoogleAuthServiceImpl(dbService);

// 🔐 Use sessions to store userId
app.use(session({
  secret: 'your-secret-key', // change this in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: false, // Set to true in production with HTTPS
  }
}));

// Step 1: Redirect user to Google
app.get('/auth', async (req, res) => {
  const userId = req.session.userId;
  if (userId) res.redirect('http://localhost:5173/presentations');
  
  // Check if we need to force consent (only if user exists but has no valid refresh token)
  const forceConsent = req.query.force_consent === 'true';
  const url = googleService.generateAuthUrl(forceConsent);
  res.redirect(url);
});

// Step 2: Google redirects here with code
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code as string;

  try {
    const userId = await googleService.handleOAuthCallback(code);
    req.session.userId = userId;
    res.redirect('http://localhost:5173/presentations');
  } catch (err) {
    console.error('OAuth callback error:', err);
    
    // If it's a missing refresh token error for new user, redirect to consent
    if (err.message === 'MISSING_REFRESH_TOKEN') {
      console.log('New user missing refresh token, redirecting to consent flow');
      return res.redirect('/auth?force_consent=true');
    }
    
    res.status(500).send('Authentication failed');
  }
});

app.post('/presentation/create', async (req, res) => {
  const userId = req.session.userId;
  const { slides } = req.body;

  try {
    const client = await googleService.getClientForUser(userId);
    const slidesApi = google.slides({ version: 'v1', auth: client });
    const url = await createPresentation(slidesApi, slides);
    console.log("Generated ppt url: ", url);
    res.json({url: url});
  } catch (error) {
    console.error('Presentation creation error:', error);
    
    // If user needs to re-authenticate, send appropriate response
    if (error.message?.includes('re-authenticate with consent')) {
      return res.status(401).json({ 
        error: 'Authentication required', 
        needsConsent: true,
        message: 'Please log in again to grant necessary permissions'
      });
    }
    
    res.status(500).json({ error: 'Failed to create presentation' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({"url": '/login'});
  });
});

app.get('/auth/status', (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, userId: req.session.userId });
  } else {
    res.json({ loggedIn: false });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});