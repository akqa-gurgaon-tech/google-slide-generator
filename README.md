# Google Slides Generator

A modern, interactive web application for creating Google Slides presentations with a clean, Google Slides-like interface.

## Features

### 🎨 Google Slides-like Interface

- **Modern UI**: Clean, professional design that mimics Google Slides
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Interactive Components**: Smooth animations and hover effects
- **Real-time Preview**: See your slide content as you type

### 📝 Slide Management

- **Multiple Layouts**: Choose from various slide layouts (Title, Title & Content, Two Columns, etc.)
- **Visual Thumbnails**: See slide previews in the sidebar
- **Drag & Drop Ready**: Interface prepared for future drag-and-drop functionality
- **Slide Navigation**: Easy switching between slides

### 🛠️ Interactive Features

- **Live Preview**: Real-time slide preview as you edit
- **Layout Selection**: Visual layout picker with icons
- **Content Editor**: Rich text editing with proper formatting
- **Slide Thumbnails**: Visual representation of each slide
- **Delete Functionality**: Remove slides with confirmation

### 🚀 Technical Features

- **Component-based Architecture**: Modular, maintainable code structure
- **State Management**: Efficient React state handling
- **Local Storage**: Automatic saving of your work
- **Error Handling**: Graceful error handling and user feedback
- **Loading States**: Visual feedback during operations

## Project Structure

```
src/
├── components/
│   ├── SlideThumbnail.jsx    # Individual slide preview component
│   ├── SlidePanel.jsx        # Sidebar with all slide thumbnails
│   ├── SlideEditor.jsx       # Main content editing interface
│   └── Toolbar.jsx          # Top toolbar with actions
├── App.jsx                   # Main application component
├── App.css                   # Google Slides-like styling
└── main.jsx                  # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd slides-generator
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating Slides

1. Click the "Add Slide" button in the toolbar
2. Select a layout from the visual layout picker
3. Fill in the content fields
4. See your changes in real-time preview

### Managing Slides

- **Select**: Click on any slide thumbnail to edit it
- **Delete**: Hover over a slide thumbnail and click the × button
- **Reorder**: Drag and drop functionality coming soon

### Creating Presentations

1. Add and configure your slides
2. Click "Create Slides" in the toolbar
3. Wait for the processing to complete
4. Click "Open Presentation" to view in Google Slides

## Layouts Available

- **Title Slide**: Perfect for presentation introductions
- **Title and Content**: Standard content slides
- **Two Columns**: Compare and contrast information
- **Title Only**: Clean, minimal slides
- **Centered Title**: Focus on key messages
- **Subtitle**: Additional context slides

## Styling

The application uses a Google Slides-inspired design system:

- **Colors**: Google's Material Design color palette
- **Typography**: Google Sans and Roboto fonts
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle elevation effects
- **Animations**: Smooth transitions and hover effects

## Development

### Adding New Layouts

1. Update the `layouts` object in `SlideEditor.jsx`
2. Add corresponding preview logic in `SlideThumbnail.jsx`
3. Update the layout options array with new icons and labels

### Customizing Styles

- Main styles are in `src/App.css`
- Base styles are in `src/index.css`
- Follow Google's Material Design principles

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by Google Slides interface design
- Built with React and Vite
- Uses Google's Material Design principles
