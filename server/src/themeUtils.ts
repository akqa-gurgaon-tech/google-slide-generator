// Utility functions for applying themes to Google Slides
import { slides_v1 } from 'googleapis';

// Apply themes to slides data before sending to Google Slides API
export function applyThemesToSlides(slides: any[], themes?: any): any[] {
  if (!themes) {
    return slides;
  }

  const { presentationTheme, slideOverrides } = themes;

  return slides.map(slide => {
    // Get theme for this slide (slide override or presentation theme)
    if (!slide.slideId) {
      return {
        ...slide,
        theme: presentationTheme,
        styling: generateSlideStyleRequests(presentationTheme),
      };
    }
    
    const slideIdStr = slide.slideId.toString();
    const slideTheme = slideOverrides?.[slideIdStr] || presentationTheme;
    
    if (!slideTheme) {
      return slide;
    }

    // Apply theme styling to slide
    return {
      ...slide,
      theme: slideTheme,
      // Add theme-specific styling that can be applied via Google Slides API
      styling: generateSlideStyleRequests(slideTheme),
    };
  });
}

// Generate Google Slides API requests for theme styling
export function generateSlideStyleRequests(theme: any): any[] {
  const requests: any[] = [];

  // Background color request
  if (theme.colors?.background?.primary) {
    requests.push({
      updatePageProperties: {
        objectId: '', // Will be filled when slide is created
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: hexToRgb(theme.colors.background.primary)
              }
            }
          }
        },
        fields: 'pageBackgroundFill'
      }
    });
  }

  return requests;
}

// Convert hex color to RGB for Google Slides API
export function hexToRgb(hex: string): { red: number; green: number; blue: number } {
  // Handle both #rgb and #rrggbb formats
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
  if (!result) {
    // Return white as default
    return { red: 1, green: 1, blue: 1 };
  }

  return {
    red: parseInt(result[1], 16) / 255,
    green: parseInt(result[2], 16) / 255,
    blue: parseInt(result[3], 16) / 255
  };
}

// Apply text styling based on theme
export function generateTextStyleRequests(theme: any, textType: 'title' | 'subtitle' | 'body' | 'caption'): any {
  // Map text types to theme style keys
  const styleKeyMap = {
    'title': 'slideTitle',
    'subtitle': 'slideSubtitle', 
    'body': 'bodyText',
    'caption': 'caption'
  };
  
  const styleKey = styleKeyMap[textType];
  const textStyle = theme.typography?.styles?.[styleKey];
  
  if (!textStyle) {
    console.log(`⚠️ No text style found for ${textType} (looking for ${styleKey})`);
    console.log(`⚠️ Available styles:`, Object.keys(theme.typography?.styles || {}));
    return {};
  }

  // Determine which font family to use based on text type
  let fontFamily = 'Arial'; // Default fallback
  
  console.log(`🔤 Processing font for ${textType}:`, {
    primaryFont: theme.typography?.fontFamily?.primary,
    secondaryFont: theme.typography?.fontFamily?.secondary,
    fullTypography: theme.typography
  });
  
  if (textType === 'title' || textType === 'subtitle') {
    // Use primary font for titles and subtitles
    fontFamily = getFontFamilyName(theme.typography?.fontFamily?.primary) || 'Arial';
    console.log(`🔤 Using primary font for ${textType}: ${fontFamily}`);
  } else {
    // Use secondary font for body and caption text
    fontFamily = getFontFamilyName(theme.typography?.fontFamily?.secondary) || 'Arial';
    console.log(`🔤 Using secondary font for ${textType}: ${fontFamily}`);
  }

  // Determine text color based on text type
  let textColor = theme.colors?.text?.primary || '#000000';
  if (textType === 'subtitle') {
    textColor = theme.colors?.text?.secondary || theme.colors?.text?.primary || '#000000';
  } else if (textType === 'caption') {
    textColor = theme.colors?.text?.secondary || theme.colors?.text?.primary || '#000000';
  }

  const finalStyle = {
    foregroundColor: {
      opaqueColor: {
        rgbColor: hexToRgb(textColor)
      }
    },
    fontSize: {
      magnitude: parseFontSize(textStyle.fontSize),
      unit: 'PT'
    },
    fontFamily: fontFamily,
    bold: textStyle.fontWeight === 'bold' || parseInt(textStyle.fontWeight) >= 600,
    italic: textStyle.fontStyle === 'italic',
  };
  
  console.log(`🎨 Final style for ${textType}:`, finalStyle);
  return finalStyle;
}

// Extract the primary font name from a font family stack
function getFontFamilyName(fontStack: string[]): string {
  console.log(`🔤 getFontFamilyName called with:`, fontStack);
  
  if (!fontStack || !Array.isArray(fontStack) || fontStack.length === 0) {
    console.log(`🔤 Font stack is empty or invalid, returning Arial`);
    return 'Arial';
  }
  
  // Take the first font in the stack and clean it up
  let fontName = fontStack[0];
  console.log(`🔤 First font in stack: "${fontName}"`);
  
  // Remove quotes if present
  fontName = fontName.replace(/^['"]|['"]$/g, '');
  console.log(`🔤 Font after quote removal: "${fontName}"`);
  
  // Map common web fonts to Google Slides compatible names
  const fontMapping: { [key: string]: string } = {
    'Google Sans': 'Roboto', // Google Slides doesn't have Google Sans, use Roboto
    'Open Sans': 'Open Sans',
    'Roboto': 'Roboto',
    'Inter': 'Roboto', // Fallback to Roboto for newer fonts
    'Montserrat': 'Oswald', // Similar geometric sans-serif
    'Playfair Display': 'Playfair Display',
    'Source Serif Pro': 'Source Serif Pro',
    'Lato': 'Lato',
    'Poppins': 'Roboto', // Fallback to Roboto
    'Merriweather': 'Merriweather',
    'Dancing Script': 'Dancing Script',
    'Arial': 'Arial',
    'Times New Roman': 'Times New Roman',
    'Helvetica': 'Helvetica', 
    // Add more mappings as needed
  };
  
  const mappedFont = fontMapping[fontName] || fontName || 'Arial';
  console.log(`🔤 Final mapped font: "${mappedFont}"`);
  
  return mappedFont;
}

// Parse CSS font size to points
function parseFontSize(fontSize: string): number {
  if (!fontSize) return 12;
  
  // Convert rem/em to pixels (assuming 16px base)
  if (fontSize.includes('rem')) {
    return parseFloat(fontSize) * 16 * 0.75; // Convert to points (1px = 0.75pt)
  }
  
  if (fontSize.includes('em')) {
    return parseFloat(fontSize) * 16 * 0.75;
  }
  
  // Parse pixel values
  if (fontSize.includes('px')) {
    return parseFloat(fontSize) * 0.75;
  }
  
  // Default fallback
  return 12;
}

// Create theme-aware color palette for the presentation
export function createThemeColorPalette(theme: any): any[] {
  const colors = [];
  
  if (theme.colors?.accents) {
    Object.values(theme.colors.accents).forEach((color: any) => {
      if (typeof color === 'string') {
        colors.push({
          rgbColor: hexToRgb(color)
        });
      }
    });
  }
  
  return colors;
}

// Apply theme to master slide layouts
export function applyThemeToMasterLayouts(theme: any): any[] {
  const requests: any[] = [];
  
  // This would apply theme styling to master layouts
  // For now, we'll focus on individual slide styling
  
  return requests;
}

export default {
  applyThemesToSlides,
  generateSlideStyleRequests,
  generateTextStyleRequests,
  createThemeColorPalette,
  hexToRgb,
};
