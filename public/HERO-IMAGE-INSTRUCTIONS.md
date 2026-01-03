# Hero Background Image Setup

## Instructions to Add Your Building Image

1. **Save your building/cathedral image** as `hero-background.jpg` in this folder (`public/`)

2. The image should be:
   - Format: JPG or PNG
   - Recommended size: 1920x1080 or higher
   - Name: `hero-background.jpg`

3. Once you add the image, the Hero section will automatically display it with a purple gradient overlay

## Alternative: Use a Direct URL

If you want to use an image from the web, edit `components/Hero.module.css` and replace:
```css
url('/hero-background.jpg')
```

With your image URL:
```css
url('https://your-image-url.com/image.jpg')
```

## Current Setup

The Hero section is configured to:
- Display the background image
- Apply a purple gradient overlay (85% opacity)
- Use parallax effect (fixed attachment)
- Cover the entire hero section
- Center the image

Your building image will look stunning with the gradient overlay!
