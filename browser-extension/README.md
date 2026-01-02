# VibeDev Browser Extension

One-click bug context capture directly from your browser.

## Features

- **Real-time Error Tracking**: Automatically captures console errors, warnings, and network failures
- **One-Click Capture**: Instant bug report generation with all context
- **Storage Inspection**: Captures localStorage and sessionStorage state
- **Claude-Ready Output**: Pre-formatted for sharing with Claude Code

## Installation

### Chrome/Edge

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `browser-extension` folder

### Testing

1. Navigate to any webpage
2. Open DevTools (F12)
3. Trigger some errors (e.g., `undefined.property` in console)
4. Click the VibeDev extension icon
5. Click "Capture Bug Context"
6. Copy the output and share with Claude Code

## How It Works

### Content Script
The extension injects a content script that intercepts:
- `console.error()` and `console.warn()` calls
- Unhandled errors and promise rejections
- Failed network requests (fetch and XMLHttpRequest)

### Popup
Click the extension icon to:
- View captured errors
- Generate a comprehensive bug report
- Copy to clipboard for sharing

## Usage Example

1. **Browse** to your app with an issue
2. **Reproduce** the bug (errors are captured automatically)
3. **Click** the VibeDev extension icon
4. **Capture** the bug context
5. **Copy** to clipboard
6. **Paste** into Claude Code and get help!

## Limitations

- Console errors are only captured after the extension loads
- For historical errors, export console logs manually from DevTools
- Network errors require interception, not all failures may be caught

## Future Enhancements

- [ ] Screenshot capture from extension
- [ ] Visual diff highlighting
- [ ] Integration with VibeDev CLI
- [ ] Export to multiple formats
- [ ] Automatic GitHub issue creation
- [ ] Session replay

## Development

To modify the extension:

1. Edit files in `browser-extension/`
2. Reload the extension in `chrome://extensions/`
3. Test your changes

No build step required - it's vanilla JavaScript!

## Icons

The extension currently uses placeholder icons. To add custom icons:

1. Create 16x16, 48x48, and 128x128 PNG images
2. Save them in `browser-extension/icons/`
3. Name them `icon16.png`, `icon48.png`, `icon128.png`

Or generate them using a tool like [Icon Generator](https://www.favicon-generator.org/).
