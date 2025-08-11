import mongoose from "mongoose";
import { DeckModel } from "../models/db-schema/deck.ts";

export class MongoDBClient {
  private static uri: string;
  private static instance: MongoDBClient;

  private constructor(uri: string) {
    MongoDBClient.uri = uri;
    console.log("MongoDBClient initialized");
    this.run();
  }
  public static getInstance(uri: string): MongoDBClient {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient(uri);
    }
    return MongoDBClient.instance;
  }
  private async run() {
    await mongoose
      .connect(MongoDBClient.uri)
      .then(() => console.log("MongoDB connected"))
      .catch((err: Error) => console.error(err));

    if (!mongoose.connection.db) {
      throw new Error("MongoDB connection is not established.");
    }
  }

  public async saveDeck(pptJson: any, slidesArr: any[]): Promise<void> {
    // Normalize input slides
    const newSlides = slidesArr.map((slide) => {
      return {
        slideId: slide.slideId,
        layout: slide.layout || "default",
        inputs: (slide.inputs === undefined || slide.inputs === null) ? {} : slide.inputs,
      };
    });

    // Find existing deck
    const existingDeck = await DeckModel.findOne({
      presentationId: pptJson.presentationId,
    });

    if (existingDeck) {
      console.log(
        `🎯 MongoDB: Deck with ID ${pptJson.presentationId} exists. Updating slides...`
      );

      const prevSlides = existingDeck.slidesJson?.slides || [];
      
      // First, ensure all existing slides have the required inputs property
      prevSlides.forEach((slide) => {
        if (!slide.inputs) {
          slide.inputs = {};
        }
      });

      // Merge: update existing or add new
      newSlides.forEach((slide) => {
        const index = prevSlides.findIndex((s) => s.slideId === slide.slideId);
        if (index !== -1) {
          prevSlides[index] = slide; // Update existing
        } else {
          prevSlides.push(slide); // Add new
        }
      });

      existingDeck.slidesJson = { slides: prevSlides };

      // Update metadata (assuming variables exist in scope)

      await existingDeck.save();
      return;
    }

    // Create new deck
    else {
      try {
        const deck = new DeckModel({
          presentationId: pptJson.presentationId,
          title: pptJson.title,
          outline: pptJson.outline,
          themeId: null,
          createdBy: pptJson.createdBy,
          updatedBy: null,
          createdAt: pptJson.createdAt,
          updatedAt: pptJson.updatedAt,
          slidesJson: { slides: newSlides },
        });
        await deck.save();
      } catch (error) {
        console.error("❌ MongoDB: Error saving deck:", error);
        throw error;
      }
    }
  }

  public async getAllPpt() {
    if (!mongoose.connection.readyState) {
      throw new Error("MongoDB connection is not established.");
    }
    try {
      const decks = await DeckModel.find({});
      return decks;
    } catch (error) {
      console.error("❌ Error fetching presentations:", error);
      throw error;
    }
  }

  public async close() {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } else {
      console.log("MongoDB connection is not open, no need to close");
    }
  }
}
