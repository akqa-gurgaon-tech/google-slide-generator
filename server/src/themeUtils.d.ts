export declare function applyThemesToSlides(slides: any[], themes?: any): any[];
export declare function generateSlideStyleRequests(theme: any): any[];
export declare function hexToRgb(hex: string): {
    red: number;
    green: number;
    blue: number;
};
export declare function generateTextStyleRequests(theme: any, textType: 'title' | 'subtitle' | 'body' | 'caption'): any;
export declare function createThemeColorPalette(theme: any): any[];
export declare function applyThemeToMasterLayouts(theme: any): any[];
declare const _default: {
    applyThemesToSlides: typeof applyThemesToSlides;
    generateSlideStyleRequests: typeof generateSlideStyleRequests;
    generateTextStyleRequests: typeof generateTextStyleRequests;
    createThemeColorPalette: typeof createThemeColorPalette;
    hexToRgb: typeof hexToRgb;
};
export default _default;
//# sourceMappingURL=themeUtils.d.ts.map