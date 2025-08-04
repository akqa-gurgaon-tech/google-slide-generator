const express = require("express");
const cors = require("cors");
const slideGenerator = require("./slideGenerator");
const fs = require("fs/promises");
const readline = require("readline");
const { google } = require("googleapis");

const app = express();
app.use(cors());
app.use(express.json());

const SCOPES = ["https://www.googleapis.com/auth/presentations"];
const TOKEN_PATH = "token.json";

let auth;

app.post("/api/create-slide", async (req, res) => {
  // const { layout, inputs } = req.body;
  const { slides } = req.body;

  try {
    const url = await slideGenerator.createPresentation(auth, slides);
    console.log("Slide created at URL:", url);
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  return new Promise(async (resolve, reject) => {
    try {
      const token = await fs.readFile(TOKEN_PATH, { encoding: "utf8" });
      oAuth2Client.setCredentials(JSON.parse(token));
      resolve(oAuth2Client);
    } catch (err) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });
      console.log("Authorize this app by visiting this URL:", authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question("Enter the code: ", async (code) => {
        rl.close();
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
        resolve(oAuth2Client);
      });
    }
  });
}

async function getAuth() {
  try {
    const content = await fs.readFile("credentials.json", { encoding: "utf8" });

    const auth = await authorize(JSON.parse(content));
    // console.log("Credentials loaded successfully", auth);
    return auth;
  } catch (err) {
    console.error("Error loading credentials:", err);
    throw err;
  }
}

const PORT = 5000;

async function startServer() {
  try {
    auth = await getAuth();
    console.log("Authenticated successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to authenticate:", err);
    process.exit(1);
  }
}

startServer();
