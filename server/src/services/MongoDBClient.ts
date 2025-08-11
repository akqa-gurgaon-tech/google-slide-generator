import mongoose from 'mongoose';
import { DeckModel } from '../models/db-schema/deck.ts';

export class MongoDBClient {
    private static uri: string;
    private static instance: MongoDBClient;
    

    private constructor(uri: string) {
        MongoDBClient.uri = uri;
        console.log('MongoDBClient initialized');
        this.run();
    }
    public static getInstance(uri: string): MongoDBClient {
        if (!MongoDBClient.instance) {
            MongoDBClient.instance = new MongoDBClient(uri);
        }
        return MongoDBClient.instance;
    }
    private async run() {
        await mongoose.connect(MongoDBClient.uri)
            .then(() => console.log('MongoDB connected'))
            .catch((err: Error) => console.error(err));

        if (!mongoose.connection.db) {
            throw new Error('MongoDB connection is not established.');
        }
        const collections = await mongoose.connection.db.listCollections().toArray();
        const exists = collections.some(col => col.name === 'deck');

        if (!exists) {
            console.log('❌ Collection "deck" does not exist. Will create by inserting dummy document...');

            const dummyDeck = new DeckModel({
                deckId: 'temp',
                title: 'Temporary Deck',
                slidesJson: { slides: [] }
            });
            await dummyDeck.save();

            console.log('✅ "deck" collection created');
        } else {
            console.log('✅ "deck" collection already exists');
        }

    }

    public async saveDeck(pptJson: any, slidesArr: any): Promise<void> {
        const presentationId = pptJson.presentationId;
        const title = pptJson.title;
        const outline = pptJson.outline || '';
        const themeId = pptJson.themeId || '';
        const createdBy = pptJson.createdBy || ''
        const updatedBy = pptJson.updatedBy || '';
        const createdAt = pptJson.createdAt || new Date();
        const updatedAt = pptJson.updatedAt || new Date();

        let slides = [];

        for (const slide of slidesArr) {
            const slideId = slide.slideId;
            const layout = slide.layout || 'default';
            const inputs = slide.inputs || {};

            slides.push({
                slideId,
                layout,
                inputs
            });
        }

        // check if presentationId already exists
        const existingDeck = await DeckModel.findOne({ presentationId: presentationId });
        if (existingDeck) {
            console.log(`Deck with ID ${presentationId} already exists. Updating...`);
            existingDeck.title = title;
            existingDeck.outline = outline;
            existingDeck.themeId = themeId;
            existingDeck.createdBy = createdBy;
            existingDeck.updatedBy = updatedBy;
            existingDeck.createdAt = createdAt;
            existingDeck.updatedAt = updatedAt;
            existingDeck.slidesJson = { slides };

            await existingDeck.save();
            console.log('✅ Deck updated:', presentationId);
            return;
        }

        try {
            const deck = new DeckModel({
                presentationId: presentationId,
                title: title,
                outline: outline,
                themeId: null,
                createdBy: createdBy,
                updatedBy: null,
                createdAt: createdAt,
                updatedAt: updatedAt,
                slidesJson: { slides: slides }
            });
            await deck.save();
            console.log('✅ Deck saved:', deck.presentationId);
        } catch (error) {
            console.error('❌ Error saving deck:', error);
            throw error;
        }
    }

    public async getAllPpt() {
        if (!mongoose.connection.readyState) {
            throw new Error('MongoDB connection is not established.');
        }
        try {
            const decks = await DeckModel.find({});
            return decks;
        } catch (error) {
            console.error('❌ Error fetching presentations:', error);
            throw error;
        }
    }



    public async close() {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        } else {
            console.log('MongoDB connection is not open, no need to close');
        }
    }
}