import { google, Auth } from "googleapis";
import { buildInsertTextRequests } from "./slide-layouts/layout.ts";

export async function createPresentation(
  slides: any,
  slidesData: any[],
  presentationId: string
): Promise<string> {
  // const createRes = await slides.presentations.create({
  //   requestBody: {
  //     title: "Generated Slide Deck",
  //   },
  // });

  // const presentationId = createRes.data.presentationId as string;

  if (presentationId) {
    await deleteAllSlides(presentationId, slides);
  }

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
    const slideId = createSlideRes.data.replies?.[0]?.createSlide
      ?.objectId as string;
    console.log(`Created slideId: ${slideId}`);

    // 3. Get the new slide's page elements (placeholders)
    const allSlides = (await slides.presentations.get({ presentationId })).data
      .slides;

    const newSlide = allSlides?.find((s: any) => s.objectId === slideId);

    const placeholders = newSlide?.pageElements;

    // console.log(
    //   `Slide ${slide.id} placeholders: ${JSON.stringify(placeholders)}`
    // );

    // 4. Build insert text/image requests for this slide
    const requests = buildInsertTextRequests(placeholders ?? [], slide.inputs);

    // 5. Apply content
    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: { requests },
    });
  }
  return `https://docs.google.com/presentation/d/${presentationId}/edit`;
}

export async function createEmptyPresentation(
  slidesApi: any,
  presentationTitle = "Untitled presentation"
) {
  const createRes = await slidesApi.presentations.create({
    requestBody: {
      title: presentationTitle,
    },
  });

  const presentationId = createRes.data.presentationId;

  return {
    presentationId,
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    title: presentationTitle,
  };
}

export async function deleteAllSlides(presentationId: string, slides: any) {
  // Step 1: Get all slide IDs
  const presentation = await slides.presentations.get({ presentationId });
  const slideIds = presentation.data.slides.map((slide: any) => slide.objectId);

  if (slideIds.length === 0) {
    console.log("No slides to delete.");
    return;
  }

  // Step 2: Delete all slides
  const requests = slideIds.map((id: string) => ({
    deleteObject: { objectId: id },
  }));

  await slides.presentations.batchUpdate({
    presentationId,
    requestBody: { requests },
  });

  console.log(`✅ Deleted ${slideIds.length} slide(s)`);
}

export async function updatePresentationTitle(
  client: any,
  presentationId: string,
  title: string
) {
  // console.log(`client: ${JSON.stringify(client)}`);

  // const auth = new google.auth.OAuth2();
  // auth.setCredentials({
  //   access_token: client.credentials.access_token, // replace with your actual access token
  //   refresh_token: client.credentials.refresh_token, // optional but recommended
  // });

  const drive = google.drive({ version: "v3", auth: client });
  console.log(`Updating presentation title to ${title}`);

  try {
    await drive.files.update({
      fileId: presentationId,
      requestBody: {
        name: title,
      },
    });

    console.log(`✅ Presentation title updated to: "${title}"`);
  } catch (err) {
    console.error(err);
  }

  // const updateRes = await slidesApi.presentations.batchUpdate({
  //   presentationId,
  //   requestBody: {
  //     requests: [
  //       {
  //         updatePresentationProperties: {
  //           presentationProperties: {
  //             title: title,
  //           },
  //           fields: "title",
  //         },
  //       },
  //     ],
  //   },
  // });

  return {
    success: true,
    title: title,
  };
}
