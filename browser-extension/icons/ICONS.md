# Browser Extension Icons

The VibeDev browser extension requires three icon sizes:
- 16x16 pixels (`icon16.png`)
- 48x48 pixels (`icon48.png`)
- 128x128 pixels (`icon128.png`)

## Creating Icons

### Option 1: Use an Icon Generator

1. Visit [Favicon Generator](https://www.favicon-generator.org/)
2. Upload your design
3. Generate icons in all sizes
4. Download and place them in this directory

### Option 2: Use Figma/Sketch

1. Create a 128x128 artboard
2. Design your icon (keep it simple!)
3. Export at 128x128, 48x48, and 16x16

### Option 3: Command Line (ImageMagick)

If you have a source image:

```bash
# Install ImageMagick
brew install imagemagick  # macOS
apt-get install imagemagick  # Linux

# Generate all sizes from source
convert source.png -resize 16x16 icon16.png
convert source.png -resize 48x48 icon48.png
convert source.png -resize 128x128 icon128.png
```

## Design Guidelines

- **Simple**: Icons should be recognizable at small sizes
- **High contrast**: Use bold colors that stand out
- **Consistent**: Match the VibeDev brand (purple/cyan gradient)
- **Square**: Icons should be centered in a square

## Suggested Design

A simple design for VibeDev:
- Background: Purple-to-blue gradient (#667eea to #764ba2)
- Icon: White "V" with a lightning bolt or wave symbol
- Style: Modern, flat design

## Temporary Solution

Until you create custom icons, you can:
1. Use a placeholder emoji (🎸) converted to PNG
2. Or skip the icons - the extension will still work, just without an icon in the toolbar

## Resources

- [Chrome Extension Icon Guidelines](https://developer.chrome.com/docs/extensions/mv3/user_interface/#icons)
- [Icon Generator Tools](https://realfavicongenerator.net/)
- [Free Icon Resources](https://www.flaticon.com/)
