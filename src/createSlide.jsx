import fs from "fs";
import readline from "readline";
import { google } from "googleapis";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// === AUTH FUNCTIONS ===
const SCOPES = ["https://www.googleapis.com/auth/presentations"];
const TOKEN_PATH = "token.json";

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, async (err, token) => {
      if (err) {
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
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
          resolve(oAuth2Client);
        });
      } else {
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(oAuth2Client);
      }
    });
  });
}

// === OPENAI AGENT ===
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getBestLayout(content) {
  const prompt = `
You are an expert in presentation design.
Given the following content structure, suggest the best Google Slides predefined layout from:

- TITLE
- TITLE_AND_BODY
- TITLE_AND_TWO_COLUMNS
- SECTION_HEADER
- TITLE_ONLY
- BIG_NUMBER
- TITLE_SUBTITLE_AND_BODY
- BLANK

Return only one layout in uppercase. No explanation.

Content:${JSON.stringify(content, null, 2)}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  return res.data.choices[0].message.content.trim();
}

// === MAIN SLIDE GENERATOR ===
async function createSlide(auth, content) {
  const slides = google.slides({ version: "v1", auth });

  // 1. Create presentation
  const pres = await slides.presentations.create({
    requestBody: { title: content.title },
  });
  const presentationId = pres.data.presentationId;

  // 2. Get layout from OpenAI
  //   const layout = await getBestLayout(content);
  const layout = "TITLE_AND_TWO_COLUMNS"; // For testing, use a fixed layout

  console.log(`🧠 Layout suggested by AI: ${layout}`);

  // 3. Add slide
  const slideRes = await slides.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests: [
        {
          createSlide: {
            slideLayoutReference: { predefinedLayout: layout },
          },
        },
      ],
    },
  });

  const slideId = slideRes.data.replies[0].createSlide.objectId;

  // 4. Get placeholders
  const slideData = (
    await slides.presentations.get({ presentationId })
  ).data.slides.slice(-1)[0];
  //   const placeholders = slideData.pageElements.filter(
  //     (e) => e.shape?.text?.textElements
  //   );
  const placeholders = slideData.pageElements;
  //   console.log(`📄 Placeholders found: ${placeholders.length}`);

  // 5. Insert title/subtitle/body
  const requests = [];

  for (const el of placeholders) {
    // console.log(`🔍 Processing placeholder: ${JSON.stringify(el)})`);
    if (el.shape.placeholder.type === "TITLE" && content.title) {
      requests.push({
        insertText: {
          objectId: el.objectId,
          text: content.title,
          insertionIndex: 0,
        },
      });
    } else if (el.shape.placeholder.type === "BODY" && content.textBlock) {
      requests.push({
        insertText: {
          objectId: el.objectId,
          text: content.textBlock,
          insertionIndex: 0,
        },
      });
    } else if (content.textBlock) {
      requests.push({
        insertText: {
          objectId: el.objectId,
          text: content.textBlock,
          insertionIndex: 0,
        },
      });
    }
  }

  // 6. Insert image if present
  if (content.image) {
    requests.push({
      createImage: {
        objectId: "img_01",
        url: content.image,
        elementProperties: {
          pageObjectId: slideId,
          size: {
            height: { magnitude: 3000000, unit: "EMU" },
            width: { magnitude: 3000000, unit: "EMU" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 4000000,
            translateY: 1400000,
            unit: "EMU",
          },
        },
      },
    });
  }
  console.log(`📄 Requests to update: ${JSON.stringify(requests)}`);
  

  // 7. Send all update requests
  await slides.presentations.batchUpdate({
    presentationId,
    requestBody: { requests },
  });

  console.log(
    `✅ Slides created: https://docs.google.com/presentation/d/${presentationId}`
  );
}

// === BOOTSTRAP ===
fs.readFile("credentials.json", async (err, content) => {
  if (err) return console.error("Error loading credentials:", err);

  const auth = await authorize(JSON.parse(content));

  const cont = {
    title: "AI-Powered Slide Generator",
    subtitle: "Layout Prediction with GPT-4",
    textBlock:
      "This slide demonstrates how AI agents can dynamically select the best layout for your content when building presentations using Google Slides API.",
    image:
      "https://plus.unsplash.com/premium_photo-1683910767532-3a25b821f7ae?q=80&w=1408&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  };

  await createSlide(auth, cont);
});
