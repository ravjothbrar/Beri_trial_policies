# Beri Logo Integration Instructions

## Logo Placement

Save your Beri logo file to:
```
public/images/beri-logo.png
```

## Logo Specifications

### Recommended Format
- **File Type:** PNG with transparent background
- **Dimensions:** 200px × 80px (or similar aspect ratio preserving the berry design)
- **Resolution:** 2x for retina displays (400px × 160px saved as PNG)
- **Color:** Full color (navy blue circles with gold accents matching the branding)

### Alternative Formats
If you need different versions:
- `beri-logo.svg` - Vector format (preferred for scaling)
- `beri-logo-dark.png` - Dark mode variant (if needed)

## Current Implementation

The logo is referenced in:
```
src/components/Header.jsx
```

The component will:
1. Try to load the image from `/images/beri-logo.png`
2. If the image fails to load, fall back to displaying "🎓 BERI" emoji

## Extract Logo from Provided Image

If you have the Beri logo image that was shared:

1. **Save the image file:**
   - Right-click the logo image
   - Select "Save Image As..."
   - Save as `beri-logo.png`

2. **Move to project:**
   ```bash
   mkdir -p public/images
   mv ~/Downloads/beri-logo.png public/images/
   ```

3. **Verify placement:**
   ```bash
   ls -la public/images/beri-logo.png
   ```

## Logo Display

The logo will appear in the header:
- **Left side:** Beri logo (berry/transformers design)
- **Divider:** Vertical line separator
- **Right side:** "Haberdashers' Policy Assistant" text

The integrated branding showcases both:
- **BERI** - The AI technology brand
- **Haberdashers'** - The school institution

## Testing Logo Display

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173/

3. Check the header:
   - Logo should display at 40px height
   - Logo should be on navy blue background (#1e3a5f)
   - Logo should auto-scale width while maintaining aspect ratio

4. If logo doesn't appear:
   - Check browser console (F12) for 404 errors
   - Verify file path: `public/images/beri-logo.png`
   - Verify file name is exactly `beri-logo.png` (case-sensitive on Linux/Mac)
   - Clear browser cache and refresh

## Fallback Behavior

If the logo file is missing, the header will show:
```
🎓 BERI | Haberdashers' Policy Assistant
```

This ensures the application works even without the logo file.

## Creating Logo from Screenshot

If you need to extract the logo from the provided screenshot:

### Using Preview (Mac)
1. Open the screenshot
2. Use rectangular selection to select just the logo
3. Cmd+K to crop
4. File → Export → PNG
5. Save as `beri-logo.png`

### Using Paint (Windows)
1. Open the screenshot in Paint
2. Use Select tool to select the logo area
3. Right-click → Crop
4. File → Save As → PNG
5. Save as `beri-logo.png`

### Using GIMP (Cross-platform)
1. Open screenshot in GIMP
2. Use Rectangle Select Tool (R)
3. Select logo area
4. Image → Crop to Selection
5. File → Export As → PNG
6. Save as `beri-logo.png`

### Online Tool (Quick Option)
1. Go to https://www.remove.bg/ or similar
2. Upload screenshot
3. Download processed image with background removed
4. Crop to just the logo area
5. Save as `beri-logo.png`

## Updating Logo Later

To change the logo after initial setup:

1. Replace the file:
   ```bash
   rm public/images/beri-logo.png
   cp /path/to/new/logo.png public/images/beri-logo.png
   ```

2. Clear browser cache:
   - Chrome: Ctrl+Shift+Delete → Cached images and files
   - Or use Hard Reload: Ctrl+Shift+R

3. Logo will update immediately

---

**Note:** The logo file is referenced in the built application, so remember to include it when deploying to production.
