const { google } = require("googleapis");
const fs = require("fs/promises");
const readline = require("readline");
const { get } = require("http");
const { buildInsertTextRequests } = require("./slide-layouts/layout");

async function createPresentation(auth, slidesData) {
  const slides = google.slides({ version: "v1", auth });

  const createRes = await slides.presentations.create({
    requestBody: {
      title: "Generated Slide Deck",
    },
  });

  const presentationId = createRes.data.presentationId;

  for (const slide of slidesData) {
    // 1. Create slide
    const createSlideRes = await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: [
          {
            createSlide: {
              slideLayoutReference: {
                predefinedLayout: slide.layout,
              },
            },
          },
        ],
      },
    });

    // 2. Get the new slide ID
    const slideId = createSlideRes.data.replies[0].createSlide.objectId;
    console.log(`Created slideId: ${slideId}`);

    // 3. Get the new slide's page elements (placeholders)
    const allSlides = (await slides.presentations.get({ presentationId })).data
      .slides;

    const newSlide = allSlides.find((s) => s.objectId === slideId);
    console.log(`newSlide: ${JSON.stringify(newSlide)}`);
    const placeholders = newSlide.pageElements;

    console.log(
      `Slide ${slide.id} placeholders: ${JSON.stringify(placeholders)}`
    );

    // 4. Build insert text/image requests for this slide
    const requests = buildInsertTextRequests(placeholders, slide.inputs);

    // 5. Apply content
    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: { requests },
    });
  }
  return `https://docs.google.com/presentation/d/${presentationId}/edit`;
}

module.exports = { createPresentation };
