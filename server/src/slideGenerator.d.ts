export declare function createPresentation(slides: any, slidesData: any[], presentationId: string): Promise<string>;
export declare function createEmptyPresentation(slidesApi: any, presentationTitle?: string): Promise<{
    presentationId: any;
    url: string;
    title: string;
}>;
export declare function deleteAllSlides(presentationId: string, slides: any): Promise<void>;
export declare function updatePresentationTitle(client: any, presentationId: string, title: string): Promise<{
    success: boolean;
    title: string;
}>;
//# sourceMappingURL=slideGenerator.d.ts.map