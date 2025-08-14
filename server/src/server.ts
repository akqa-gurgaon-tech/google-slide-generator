import express from "express";
import dotenv from "dotenv";
import session from "express-session";

import { google } from "googleapis";
import {
  createPresentation,
  createEmptyPresentation,
  updatePresentationTitle,
} from "./slideGenerator";
import { applyThemesToSlides } from "./themeUtils";
import cors from "cors";
import type { DBService } from "./interfaces/DBService";
import { NeonDBService } from "./services/NeonDBService";
import type { GoogleAuthService } from "./interfaces/GoogleAuthService";
import { GoogleAuthServiceImpl } from "./services/GoogleAuthServiceImpl";
import { MongoDBClient } from "./services/MongoDBClient";

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
  const userId = (req.session as any).userId;
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
    (req.session as any).userId = userId;
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
  const { slides, presentationId, themes } = req.body;

  try {
    const client = await googleService.getClientForUser(userId);
    const slidesApi = google.slides({ version: "v1", auth: client });
    
    // Apply themes to slides before creating presentation
    const themedSlides = applyThemesToSlides(slides, themes);
    
    const url = await createPresentation(slidesApi, themedSlides, presentationId);
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
  const userId = req.session.userId;

  // Get user information if available
  let userInfo = null;
  if (userId) {
    try {
      userInfo = await dbService.getUserToken(userId);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }

  await mongoClient
    .saveDeck(json.pptJson, json.slidesArr, json.themes, userInfo)
    .then(() => {
      res
        .status(200)
        .json({ success: true, message: "Deck saved successfully" });
    })
    .catch((err) => {
      console.error("❌ Server: Error saving deck:", err);
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

// Theme Management API Endpoints

// Debug endpoint to test theme functionality
app.get("/api/themes/debug", async (req, res) => {
  const userId = req.session.userId;
  
  try {
    console.log("Theme Debug - User ID:", userId);
    
    if (!userId) {
      return res.json({ 
        error: "No authenticated user session",
        sessionValid: false,
        needsLogin: true
      });
    }
    
    // Test database connection and table existence
    const userThemes = await dbService.getThemesByUser(userId);
    
    res.json({ 
      sessionValid: true,
      userId: userId,
      themeCount: userThemes.length,
      themes: userThemes,
      message: "Theme debug successful"
    });
  } catch (error) {
    console.error("Theme debug error:", error);
    res.status(500).json({ 
      error: "Theme debug failed", 
      details: error.message,
      needsTableCreation: error.message.includes('relation "theme_schema" does not exist')
    });
  }
});

// Get all themes for current user
app.get("/api/themes", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const userThemes = await dbService.getThemesByUser(userId);
    res.json({ themes: userThemes });
  } catch (error) {
    console.error("Error fetching themes:", error);
    res.status(500).json({ error: "Failed to fetch themes" });
  }
});

// Get specific theme by ID
app.get("/api/themes/:themeId", async (req, res) => {
  const { themeId } = req.params;
  
  try {
    const theme = await dbService.getThemeById(themeId);
    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }
    res.json({ theme });
  } catch (error) {
    console.error("Error fetching theme:", error);
    res.status(500).json({ error: "Failed to fetch theme" });
  }
});

// Create a new custom theme
app.post("/api/themes", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { theme_id, theme_desc, schema_str } = req.body;

  // Validate required fields
  if (!theme_id || !schema_str) {
    return res.status(400).json({ 
      error: "Missing required fields: theme_id and schema_str are required" 
    });
  }

  try {
    const newTheme = await dbService.createTheme({
      theme_id,
      theme_desc: theme_desc || null,
      schema_str,
      created_by: userId
    });

    res.status(201).json({ 
      message: "Theme created successfully", 
      theme: newTheme 
    });
  } catch (error) {
    console.error("Error creating theme:", error);
    
    if (error.message.includes("already exists")) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Failed to create theme" });
  }
});

// Update an existing theme
app.put("/api/themes/:themeId", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { themeId } = req.params;
  const { theme_desc, schema_str } = req.body;

  // Validate that at least one field is provided
  if (theme_desc === undefined && schema_str === undefined) {
    return res.status(400).json({ 
      error: "At least one field (theme_desc or schema_str) must be provided" 
    });
  }

  try {
    const updates: any = {};
    if (theme_desc !== undefined) updates.theme_desc = theme_desc;
    if (schema_str !== undefined) updates.schema_str = schema_str;

    const updatedTheme = await dbService.updateTheme(themeId, userId, updates);
    
    if (!updatedTheme) {
      return res.status(404).json({ error: "Theme not found or access denied" });
    }

    res.json({ 
      message: "Theme updated successfully", 
      theme: updatedTheme 
    });
  } catch (error) {
    console.error("Error updating theme:", error);
    
    if (error.message.includes("permission")) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Failed to update theme" });
  }
});

// Delete a theme
app.delete("/api/themes/:themeId", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { themeId } = req.params;

  try {
    const deleted = await dbService.deleteTheme(themeId, userId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Theme not found or access denied" });
    }

    res.json({ message: "Theme deleted successfully" });
  } catch (error) {
    console.error("Error deleting theme:", error);
    
    if (error.message.includes("permission")) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Failed to delete theme" });
  }
});

// Check if user owns a theme
app.get("/api/themes/:themeId/ownership", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { themeId } = req.params;

  try {
    const isOwner = await dbService.isThemeOwner(themeId, userId);
    res.json({ isOwner });
  } catch (error) {
    console.error("Error checking theme ownership:", error);
    res.status(500).json({ error: "Failed to check ownership" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
