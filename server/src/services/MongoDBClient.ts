import mongoose from "mongoose";
import { DeckModel } from "../models/db-schema/deck";

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

  public async saveDeck(pptJson: any, slidesArr: any[], themes?: any, userInfo?: any): Promise<void> {
    // Clean up any existing duplicates in the database first
    await this.cleanupDuplicateSlides(pptJson.presentationId);
    // Normalize input slides and add theme information
    const newSlides = slidesArr.map((slide) => {
      const baseInputs = (slide.inputs === undefined || slide.inputs === null) ? {} : slide.inputs;
      
      // Add theme information to inputs - themeId should be specific to the slide
      const slideThemeId = themes?.slideOverrides?.[slide.slideId]?.id || themes?.presentationTheme?.id || null;
      const inputsWithTheme = {
        ...baseInputs,
        themeId: slideThemeId, // This is now the specific theme for this slide
      };
      
      const normalizedSlide = {
        slideId: slide.slideId,
        layout: slide.layout || "default",
        inputs: inputsWithTheme,
      };
      

      
      return normalizedSlide;
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

      // Ensure unique slides by slideId - remove any duplicates first
      const uniquePrevSlides = [];
      const seenSlideIds = new Set();
      
      prevSlides.forEach((slide) => {
        if (!seenSlideIds.has(slide.slideId)) {
          seenSlideIds.add(slide.slideId);
          uniquePrevSlides.push(slide);
        }
      });
      
      // Merge: update existing or add new
      newSlides.forEach((slide) => {
        const index = uniquePrevSlides.findIndex((s) => String(s.slideId) === String(slide.slideId));
        
        if (index !== -1) {
          uniquePrevSlides[index] = slide; // Update existing
        } else {
          uniquePrevSlides.push(slide); // Add new
        }
      });
      
      // Use the unique slides array
      const finalSlides = uniquePrevSlides;

      existingDeck.slidesJson = { slides: finalSlides };

      // Update metadata with theme and user information
      if (themes?.presentationTheme?.id) {
        existingDeck.themeId = themes.presentationTheme.id;
      }
      if (userInfo?.user_id) {
        existingDeck.updatedBy = userInfo.user_id;
      }
      existingDeck.updatedAt = new Date();

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
          themeId: themes?.presentationTheme?.id || null,
          createdBy: userInfo?.user_id || pptJson.createdBy,
          updatedBy: userInfo?.user_id || null,
          createdAt: pptJson.createdAt || new Date(),
          updatedAt: new Date(),
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

  // Clean up duplicate slides in existing decks
  private async cleanupDuplicateSlides(presentationId: string): Promise<void> {
    try {
      const existingDeck = await DeckModel.findOne({ presentationId });
      if (!existingDeck || !existingDeck.slidesJson?.slides) {
        return;
      }

      const slides = existingDeck.slidesJson.slides;
      const uniqueSlides = [];
      const seenSlideIds = new Set();

      slides.forEach((slide) => {
        if (!seenSlideIds.has(slide.slideId)) {
          seenSlideIds.add(slide.slideId);
          uniqueSlides.push(slide);
        } else {
          console.log(`🎯 MongoDB: Cleanup - Removing duplicate slide ${slide.slideId}`);
        }
      });

      if (uniqueSlides.length !== slides.length) {
        existingDeck.slidesJson = { slides: uniqueSlides };
        await existingDeck.save();
      }
    } catch (error) {
      console.error("❌ MongoDB: Error cleaning up duplicate slides:", error);
    }
  }
}
