import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';

import { NeonDatabase } from './db.ts';
import { GoogleClientService } from './gs.ts';
import { google } from 'googleapis';
import { createPresentation } from './slideGenerator.ts';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', // Allow your frontend origin
  credentials: true, // If sending cookies or Authorization header
}));

const db = new NeonDatabase(process.env.DATABASE_URL!);
const googleService = new GoogleClientService(db);

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


// Home page
// app.get('/login', (req, res) => {
//   console.log('req.session');
//   const userId = req.session.userId;
//   if (userId) return res.redirect('/presentation');
//   res.send(`
//     <h1>Google Slides OAuth Test</h1>
//     <a href="/auth">Login with Google</a>
//   `);
// });

// Step 1: Redirect user to Google
app.get('/auth', (req, res) => {
  const userId = req.session.userId;
  if (userId) res.redirect('http://localhost:5173/presentations');
  const url = googleService.generateAuthUrl();
  res.redirect(url);
});

// Step 2: Google redirects here with code
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code as string;

  try {
    const userId = await googleService.handleOAuthCallback(code);
    req.session.userId = userId;
    res.redirect('http://localhost:5173/presentations');
    // res.json({ url: 'http://localhost:5173/presentations' });
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send('Authentication failed');
  }
});

// Step 3: List user's presentations (protected route)
app.get('/slides', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.redirect('/');

  try {
    const client = await googleService.getClientForUser(userId);
    const slidesApi = google.slides({ version: 'v1', auth: client });

    // Just list one presentation or show success
    res.send(`
      <h2>✅ Auth Success</h2>
      <p>You are logged in. You can now use Google Slides API.</p>
      // add a text box to capture the presentation id
    <form action="/slides/list" method="get">
      <input type="text" id="presentationId" name="presentationId" placeholder="Enter presentation ID" />
      <button type="submit">List slides</button>
    </form>

    // add a button to create a new presentation
    <form action="/slides/create" method="post">
      <button type="submit">Create new presentation</button>
    </form>

      
    `);
  } catch (err) {
    console.error('Slides API error:', err);
    res.status(500).send('Failed to access Slides API');
  }
});

app.post('/presentation/create', async (req, res) => {
  const userId = req.session.userId;
  const { slides } = req.body;

  const client = await googleService.getClientForUser(userId);
  const slidesApi = google.slides({ version: 'v1', auth: client });
  const url = await createPresentation(slidesApi, slides);
  console.log("Generated ppt url: ", url);
  res.json({url: url});
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










// async function listSlides(presentationId: string, authClient1: Auth.OAuth2Client): Promise<void> {
//   if (!authClient1) {
//     console.error('Authentication required. Call authorize() first.');
//     return;
//   }

//   const slidesApi = google.slides({ version: 'v1', auth: authClient1 });
  
//   try {
//     const res = await slidesApi.presentations.get({ presentationId });
//     const slides = res.data.slides;
//     if (!slides || slides.length === 0) {
//       console.log('No slides found.');
//       return;
//     }
//     console.log('The presentation contains %s slides:', slides.length);
//     slides.forEach((slide, i) => {
//       console.log(
//         `- Slide #${i + 1} contains ${slide.pageElements ? slide.pageElements.length : 0} elements.`
//       );
//     });
//   } catch (err: any) {
//     console.error('The API returned an error:', err.message);
//   }
// }

// app.get('/slides/list', async (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) return res.redirect('/');

//   const client = await googleService.getClientForUser(userId);
//   const slidesApi = google.slides({ version: 'v1', auth: client });

//   const presentationId = req.query.presentationId as string;
//   if (!presentationId) {
//     res.status(400).send('Presentation ID is required');
//     return;
//   }

//   const presentations = await slidesApi.presentations.get({ presentationId });
//   await listSlides(presentationId, client);
//   res.send(presentations.data.slides);
// });