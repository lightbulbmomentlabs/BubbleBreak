# Blog Post Workflow - Image Optimization

This document outlines the streamlined workflow for adding new blog posts with optimized images to improve PageSpeed performance.

## Quick Start

1. **Add your images** to the `/post-imgs/` folder
2. **Run the workflow script**:
   ```bash
   ./add-blog-post.sh your-featured-image.jpg your-infographic.jpg
   ```
3. **Copy the generated HTML** templates into your article
4. **Update alt text and captions** as needed

## Detailed Workflow

### Step 1: Prepare Your Images
- Save your images as JPGs in the `/post-imgs/` folder
- Use descriptive filenames (e.g., `feat-img-study-tips-for-students.jpg`)
- Recommended size: 1200px wide or larger for best quality

### Step 2: Run the Optimization Script
```bash
# Single image
./add-blog-post.sh new-featured-image.jpg

# Multiple images
./add-blog-post.sh featured-image.jpg infographic.jpg chart.jpg
```

### Step 3: What the Script Does
The script automatically:
- ✅ Creates 4 sizes: 400px, 800px, 1200px, and original
- ✅ Generates WebP versions (67% smaller file sizes)
- ✅ Maintains JPEG fallbacks for compatibility
- ✅ Strips metadata for faster loading
- ✅ Shows file size comparisons
- ✅ Generates ready-to-use HTML templates

### Step 4: Copy HTML Templates
The script provides 3 types of templates:

#### Featured Image (Article Headers)
```html
<div class="featured-image">
    <picture>
        <source srcset="../../post-imgs/optimized/your-image-400w.webp 400w,
                        ../../post-imgs/optimized/your-image-800w.webp 800w,
                        ../../post-imgs/optimized/your-image-1200w.webp 1200w"
                type="image/webp">
        <img src="../../post-imgs/optimized/your-image-800w.jpg"
             srcset="../../post-imgs/optimized/your-image-400w.jpg 400w,
                     ../../post-imgs/optimized/your-image-800w.jpg 800w,
                     ../../post-imgs/optimized/your-image-1200w.jpg 1200w"
             sizes="(max-width: 768px) 400px, 800px"
             alt="UPDATE THIS ALT TEXT"
             loading="eager">
    </picture>
</div>
```

#### Content Image (Infographics)
```html
<div class="content-image">
    <picture>
        <!-- WebP sources and img tag -->
    </picture>
    <div class="image-caption">UPDATE THIS CAPTION</div>
</div>
```

#### Article Listing Image
```html
<div class="article-image">
    <picture>
        <!-- Smaller sizes for listing pages -->
    </picture>
</div>
```

### Step 5: Update Alt Text and Captions
- Replace `"UPDATE THIS ALT TEXT"` with descriptive alt text
- Replace `"UPDATE THIS CAPTION"` with relevant captions
- Ensure alt text describes the image content for accessibility

## Performance Benefits

### Before Optimization
- Large JPEG files (200-400KB each)
- Single size for all devices
- No modern format support

### After Optimization
- **67% smaller WebP files** for modern browsers
- **Responsive images** sized appropriately for device
- **Lazy loading** for better performance
- **1-year cache headers** for repeat visits

### Example Results
```
Original: 316KB → Optimized WebP: 104KB (67% reduction)
Original: 172KB → Optimized WebP: 60KB (65% reduction)
```

## File Structure

```
post-imgs/
├── your-image.jpg                          # Original image
└── optimized/
    ├── your-image.jpg                      # Optimized original
    ├── your-image.webp                     # WebP original
    ├── your-image-400w.jpg                 # Small JPEG
    ├── your-image-400w.webp                # Small WebP
    ├── your-image-800w.jpg                 # Medium JPEG
    ├── your-image-800w.webp                # Medium WebP
    ├── your-image-1200w.jpg                # Large JPEG
    └── your-image-1200w.webp               # Large WebP
```

## Troubleshooting

### ImageMagick Not Found
```bash
# Install ImageMagick
brew install imagemagick
```

### Image Not Found Error
- Ensure your image is in the `/post-imgs/` folder
- Check the filename matches exactly (case-sensitive)

### Existing Images
To optimize existing images that weren't processed:
```bash
./optimize-images.sh  # Processes all JPGs in post-imgs/
```

## Tips for Best Results

1. **Image Quality**: Start with high-quality images (1200px+ wide)
2. **Naming**: Use descriptive, SEO-friendly filenames
3. **Alt Text**: Write descriptive alt text for accessibility and SEO
4. **Captions**: Add informative captions for infographics
5. **Testing**: Test on mobile and desktop to ensure proper sizing

## Cache Optimization

Images are automatically cached for 1 year via `static.json`:
```json
"/post-imgs/optimized/**": {
  "Cache-Control": "public, max-age=31536000, immutable"
}
```

This ensures optimal performance for repeat visitors.