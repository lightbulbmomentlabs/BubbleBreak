#!/bin/bash
# optimize-images.sh
# Create optimized versions of images for better performance

echo "🖼️  Starting image optimization for better PageSpeed..."

# Check if ImageMagick is available
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install it first:"
    echo "   brew install imagemagick"
    exit 1
fi

# Create optimized images directory
mkdir -p post-imgs/optimized

# Define the command to use (magick for newer ImageMagick, convert for older)
if command -v magick &> /dev/null; then
    CMD="magick"
else
    CMD="convert"
fi

echo "📐 Creating responsive image sizes and WebP versions..."

# Process each image in post-imgs directory
for img in post-imgs/*.jpg; do
    if [ -f "$img" ]; then
        # Get filename without extension
        filename=$(basename "$img" .jpg)
        echo "🔄 Processing: $filename"

        # Create different sizes and formats

        # Original size, optimized JPEG (quality 85)
        $CMD "$img" -quality 85 -strip "post-imgs/optimized/${filename}.jpg"

        # Original size WebP (quality 80)
        $CMD "$img" -quality 80 -strip "post-imgs/optimized/${filename}.webp"

        # Medium size (800px wide) - for most article displays
        $CMD "$img" -resize 800x -quality 85 -strip "post-imgs/optimized/${filename}-800w.jpg"
        $CMD "$img" -resize 800x -quality 80 -strip "post-imgs/optimized/${filename}-800w.webp"

        # Small size (400px wide) - for mobile/thumbnail
        $CMD "$img" -resize 400x -quality 85 -strip "post-imgs/optimized/${filename}-400w.jpg"
        $CMD "$img" -resize 400x -quality 80 -strip "post-imgs/optimized/${filename}-400w.webp"

        # Large size (1200px wide) - for high-DPI displays
        $CMD "$img" -resize 1200x -quality 85 -strip "post-imgs/optimized/${filename}-1200w.jpg"
        $CMD "$img" -resize 1200x -quality 80 -strip "post-imgs/optimized/${filename}-1200w.webp"

        echo "✅ Created optimized versions for $filename"
    fi
done

echo "📊 Image optimization complete! Created optimized versions with:"
echo "   • WebP format for modern browsers"
echo "   • Multiple sizes: 400w, 800w, 1200w, original"
echo "   • Optimized JPEG compression"
echo "   • Stripped metadata for smaller file sizes"

# Show file size comparison
echo ""
echo "📈 File size comparison:"
echo "Original images:"
du -sh post-imgs/*.jpg | head -5
echo ""
echo "Optimized images (800w WebP):"
du -sh post-imgs/optimized/*-800w.webp | head -5