# PhotoSync - Modern Photobooth Experience

PhotoSync is an advanced web-based photobooth application that provides a modern and interactive photo capture experience. Built with modern web technologies, it offers a range of features for capturing, customizing, and sharing photos.

## Features

### Core Features
- **Multiple Layout Options**: Choose from various photo strip layouts (Classic, Grid, Polaroid, Collage)
- **Burst Mode**: Capture multiple photos in quick succession
- **Countdown Timer**: Customizable delay before photo capture
- **Camera Controls**: Rotate and crop camera view
- **Photo Filters**: Apply various filters to enhance your photos
- **Image Adjustments**: Fine-tune brightness, contrast, and saturation
- **Customization Options**: 
  - Frame colors
  - Photo shapes
  - Decorative stickers
  - Logo options
  - Date stamps

### Advanced Features
- **Social Sharing**: Share photos directly to social media platforms
- **Session Management**: Save and organize photo sessions
- **Gallery View**: Browse and manage captured photos
- **Search & Sort**: Find and organize photos by date
- **Download Options**: Save individual photos or entire sessions as ZIP files
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Offline Support**: Works without internet connection
- **Local Storage**: Efficient storage management with automatic cleanup

## Technical Stack

- **Frontend**:
  - HTML5
  - CSS3 (with CSS Variables for theming)
  - JavaScript (ES6+)
  - IndexedDB for local storage
  - Web Share API for social sharing
  - JSZip for file compression

- **Dependencies**:
  - Font Awesome for icons
  - Poppins font for typography
  - JSZip for ZIP file creation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/photosync.git
   cd photosync
   ```

2. Set up a local web server (e.g., using Python):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Usage

1. **Starting a Session**:
   - Select a layout for your photo strip
   - Choose between single photo or burst mode
   - Set countdown timer if desired

2. **Capturing Photos**:
   - Click the capture button or press spacebar
   - Wait for countdown (if enabled)
   - Hold still for the photo

3. **Customizing Photos**:
   - Apply filters and adjustments
   - Choose frame color and photo shape
   - Add stickers and logos
   - Toggle date display

4. **Managing Photos**:
   - Save photos to gallery
   - Share directly to social media
   - Download individual photos or entire sessions
   - Search and sort in gallery view

## Development

### Project Structure
```
photosync/
├── index.html          # Main application file
├── landing.css         # Styles for the landing page
├── script.js           # Core functionality
├── layouts/            # Layout preview images
│   ├── layout-a.jpg
│   ├── layout-b.jpg
│   ├── layout-c.jpg
│   └── layout-d.jpg
└── README.md          # Documentation
```

### Adding New Features

1. **New Layout**:
   - Add layout preview image to `layouts/` directory
   - Update layout options in `index.html`
   - Add layout styles in `styles.css`
   - Implement layout logic in `enhanced.js`

2. **New Filter**:
   - Add filter button in `index.html`
   - Add filter styles in `styles.css`
   - Implement filter logic in `enhanced.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Font Awesome for the icon set
- Google Fonts for the Poppins font
- JSZip for file compression functionality 