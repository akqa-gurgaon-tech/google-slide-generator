import mongoose from "mongoose";
export declare class MongoDBClient {
    private static uri;
    private static instance;
    private constructor();
    static getInstance(uri: string): MongoDBClient;
    private run;
    saveDeck(pptJson: any, slidesArr: any[], themes?: any, userInfo?: any): Promise<void>;
    getAllPpt(): Promise<(mongoose.Document<unknown, {}, {
        title: string;
        presentationId: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
        outline?: string | null;
        themeId?: string | null;
        createdBy?: string | null;
        updatedBy?: string | null;
        slidesJson?: {
            slides: mongoose.Types.DocumentArray<{
                slideId: string;
                layout: string;
                inputs: any;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                slideId: string;
                layout: string;
                inputs: any;
            }> & {
                slideId: string;
                layout: string;
                inputs: any;
            }>;
        } | null;
    }, {}, mongoose.DefaultSchemaOptions> & {
        title: string;
        presentationId: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
        outline?: string | null;
        themeId?: string | null;
        createdBy?: string | null;
        updatedBy?: string | null;
        slidesJson?: {
            slides: mongoose.Types.DocumentArray<{
                slideId: string;
                layout: string;
                inputs: any;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                slideId: string;
                layout: string;
                inputs: any;
            }> & {
                slideId: string;
                layout: string;
                inputs: any;
            }>;
        } | null;
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    close(): Promise<void>;
    private cleanupDuplicateSlides;
}
//# sourceMappingURL=MongoDBClient.d.ts.map