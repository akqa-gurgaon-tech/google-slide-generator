import mongoose from 'mongoose';
export declare const DeckModel: mongoose.Model<{
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
}, {}, {}, {}, mongoose.Document<unknown, {}, {
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
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
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
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
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
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
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
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=deck.d.ts.map