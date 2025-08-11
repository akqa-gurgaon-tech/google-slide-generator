import express from "express";
import dotenv from "dotenv";
import session from "express-session";

import { google } from "googleapis";
import {
  createPresentation,
  createEmptyPresentation,
  updatePresentationTitle,
} from "./slideGenerator.ts";
import cors from "cors";
import type { DBService } from "./interfaces/DBService.ts";
import { NeonDBService } from "./services/NeonDBService.ts";
import type { GoogleAuthService } from "./interfaces/GoogleAuthService.ts";
import { GoogleAuthServiceImpl } from "./services/GoogleAuthServiceImpl.ts";
import { MongoDBClient } from "./services/MongoDBClient.ts";

dotenv.config();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // Allow your frontend origin
    credentials: true, // If sending cookies or Authorization header
  })
);

const mongoClient = MongoDBClient.getInstance(process.env.MONGO_URI!);
const dbService: DBService = NeonDBService.getInstance(
  process.env.DATABASE_URL!
);
const googleService: GoogleAuthService = new GoogleAuthServiceImpl(dbService);

// 🔐 Use sessions to store userId
app.use(
  session({
    secret: "your-secret-key", // change this in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: false, // Set to true in production with HTTPS
    },
  })
);

// Step 1: Redirect user to Google
app.get("/auth", async (req, res) => {
  const userId = req.session.userId;
  if (userId) res.redirect("http://localhost:5173/presentations");

  // Check if we need to force consent (only if user exists but has no valid refresh token)
  const forceConsent = req.query.force_consent === "true";
  const url = googleService.generateAuthUrl(forceConsent);
  res.redirect(url);
});

// Step 2: Google redirects here with code
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code as string;

  try {
    const userId = await googleService.handleOAuthCallback(code);
    req.session.userId = userId;
    res.redirect("http://localhost:5173/presentations");
  } catch (err) {
    console.error("OAuth callback error:", err);

    // If it's a missing refresh token error for new user, redirect to consent
    if (err.message === "MISSING_REFRESH_TOKEN") {
      console.log(
        "New user missing refresh token, redirecting to consent flow"
      );
      return res.redirect("/auth?force_consent=true");
    }

    res.status(500).send("Authentication failed");
  }
});

app.post("/api/create-presentation", async (req, res) => {
  const { presentationTitle } = req.body;

  const userId = req.session.userId;
  const client = await googleService.getClientForUser(userId);
  const slidesApi = google.slides({ version: "v1", auth: client });

  try {
    const result = await createEmptyPresentation(slidesApi, presentationTitle);
    console.log("Empty presentation created:", result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("failed to create new presentation");
  }
});

app.post("/presentation/create", async (req, res) => {
  const userId = req.session.userId;
  const { slides, presentationId } = req.body;

  try {
    const client = await googleService.getClientForUser(userId);
    const slidesApi = google.slides({ version: "v1", auth: client });
    const url = await createPresentation(slidesApi, slides, presentationId);
    console.log("Generated ppt url: ", url);
    res.json({ url: url });
  } catch (error) {
    console.error("Presentation creation error:", error);

    // If user needs to re-authenticate, send appropriate response
    if (error.message?.includes("re-authenticate with consent")) {
      return res.status(401).json({
        error: "Authentication required",
        needsConsent: true,
        message: "Please log in again to grant necessary permissions",
      });
    }

    res.status(500).json({ error: "Failed to create presentation" });
  }
});

app.get("/ppt/get", async (req, res) => {
  res.json(await mongoClient.getAllPpt());
});

app.post("/ppt/update", async (req, res) => {
  const json = req.body;
  console.log("json", JSON.stringify(json, null, 2));

  await mongoClient
    .saveDeck(json.pptJson, json.slidesArr)
    .then(() => {
      res
        .status(200)
        .json({ success: true, message: "Deck saved successfully" });
    })
    .catch((err) => {
      console.error("Error saving deck:", err);
      res.status(500).json({ success: false, message: "Failed to save deck" });
    });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ url: "/login" });
  });
});

app.get("/auth/status", async (req, res) => {
  if (req.session.userId) {
    try {
      // Get user information from database
      const userToken = await dbService.getUserToken(req.session.userId);
      if (userToken) {
        res.json({
          loggedIn: true,
          userId: req.session.userId,
          userInfo: {
            name: userToken.user_name,
            email: userToken.user_email,
          },
        });
      } else {
        res.json({ loggedIn: false });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      res.json({ loggedIn: false });
    }
  } else {
    res.json({ loggedIn: false });
  }
});

app.patch("/api/update-presentation-title", async (req, res) => {
  const { presentationId, title } = req.body;

  const userId = req.session.userId;
  const client = await googleService.getClientForUser(userId);
  // const slidesApi = google.slides({ version: "v1", auth: client });

  try {
    const result = await updatePresentationTitle(client, presentationId, title);
    console.log("Presentation title updated:", result);
    res.json({ success: true, title: title });
  } catch (err) {
    console.error(err);
    res.status(500).send("failed to update presentation title");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
