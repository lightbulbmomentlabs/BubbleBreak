#!/bin/bash
# add-blog-post.sh
# Streamlined workflow for adding new blog posts with optimized images

echo "🚀 Blog Post Workflow - Adding new post with optimized images"

# Function to show usage
show_usage() {
    echo "Usage: ./add-blog-post.sh [image1.jpg] [image2.jpg] ..."
    echo "Example: ./add-blog-post.sh new-featured-image.jpg infographic.jpg"
    echo ""
    echo "This script will:"
    echo "1. Optimize any new images you specify"
    echo "2. Generate responsive HTML markup for each image"
    echo "3. Show you what to copy/paste into your article"
    exit 1
}

# Check if any arguments provided
if [ $# -eq 0 ]; then
    show_usage
fi

echo "📁 Processing images: $@"

# Check if ImageMagick is available
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install it first:"
    echo "   brew install imagemagick"
    exit 1
fi

# Determine ImageMagick command
if command -v magick &> /dev/null; then
    CMD="magick"
else
    CMD="convert"
fi

# Create optimized images directory
mkdir -p post-imgs/optimized

echo "🖼️  Optimizing images..."

# Process each specified image
for img in "$@"; do
    # Check if image exists in post-imgs
    if [ ! -f "post-imgs/$img" ]; then
        echo "❌ Image not found: post-imgs/$img"
        echo "   Please make sure you've added $img to the post-imgs/ directory first"
        continue
    fi

    # Get filename without extension
    filename=$(basename "$img" .jpg)
    echo "🔄 Processing: $filename"

    # Create different sizes and formats
    echo "   Creating optimized versions..."

    # Original size, optimized JPEG (quality 85)
    $CMD "post-imgs/$img" -quality 85 -strip "post-imgs/optimized/${filename}.jpg"

    # Original size WebP (quality 80)
    $CMD "post-imgs/$img" -quality 80 -strip "post-imgs/optimized/${filename}.webp"

    # Medium size (800px wide) - for most article displays
    $CMD "post-imgs/$img" -resize 800x -quality 85 -strip "post-imgs/optimized/${filename}-800w.jpg"
    $CMD "post-imgs/$img" -resize 800x -quality 80 -strip "post-imgs/optimized/${filename}-800w.webp"

    # Small size (400px wide) - for mobile/thumbnail
    $CMD "post-imgs/$img" -resize 400x -quality 85 -strip "post-imgs/optimized/${filename}-400w.jpg"
    $CMD "post-imgs/$img" -resize 400x -quality 80 -strip "post-imgs/optimized/${filename}-400w.webp"

    # Large size (1200px wide) - for high-DPI displays
    $CMD "post-imgs/$img" -resize 1200x -quality 85 -strip "post-imgs/optimized/${filename}-1200w.jpg"
    $CMD "post-imgs/$img" -resize 1200x -quality 80 -strip "post-imgs/optimized/${filename}-1200w.webp"

    echo "✅ Optimized: $filename"
done

echo ""
echo "📊 Optimization complete!"

# Show file size comparison for first image
if [ -f "post-imgs/$1" ]; then
    first_img=$(basename "$1" .jpg)
    echo ""
    echo "📈 File size comparison for $1:"
    echo "Original:"
    du -sh "post-imgs/$1"
    echo "Optimized (800w WebP):"
    du -sh "post-imgs/optimized/${first_img}-800w.webp"
fi

echo ""
echo "🔧 Next steps:"
echo "1. Copy the HTML templates below into your article"
echo "2. Update the alt text to match your content"
echo "3. Choose the appropriate template based on image usage"

# Generate HTML templates for each image
echo ""
echo "📋 HTML TEMPLATES TO COPY/PASTE:"
echo "=================================="

for img in "$@"; do
    if [ -f "post-imgs/$img" ]; then
        filename=$(basename "$img" .jpg)

        echo ""
        echo "🖼️  For image: $img"
        echo "---"
        echo ""
        echo "FEATURED IMAGE (for article headers):"
        echo '```html'
        echo '<div class="featured-image">'
        echo '    <picture>'
        echo "        <source srcset=\"../../post-imgs/optimized/${filename}-400w.webp 400w,"
        echo "                        ../../post-imgs/optimized/${filename}-800w.webp 800w,"
        echo "                        ../../post-imgs/optimized/${filename}-1200w.webp 1200w\""
        echo '                type="image/webp">'
        echo "        <img src=\"../../post-imgs/optimized/${filename}-800w.jpg\""
        echo "             srcset=\"../../post-imgs/optimized/${filename}-400w.jpg 400w,"
        echo "                     ../../post-imgs/optimized/${filename}-800w.jpg 800w,"
        echo "                     ../../post-imgs/optimized/${filename}-1200w.jpg 1200w\""
        echo '             sizes="(max-width: 768px) 400px, 800px"'
        echo '             alt="UPDATE THIS ALT TEXT"'
        echo '             loading="eager">'
        echo '    </picture>'
        echo '</div>'
        echo '```'
        echo ""
        echo "CONTENT IMAGE (for infographics/images within articles):"
        echo '```html'
        echo '<div class="content-image">'
        echo '    <picture>'
        echo "        <source srcset=\"../../post-imgs/optimized/${filename}-400w.webp 400w,"
        echo "                        ../../post-imgs/optimized/${filename}-800w.webp 800w,"
        echo "                        ../../post-imgs/optimized/${filename}-1200w.webp 1200w\""
        echo '                type="image/webp">'
        echo "        <img src=\"../../post-imgs/optimized/${filename}-800w.jpg\""
        echo "             srcset=\"../../post-imgs/optimized/${filename}-400w.jpg 400w,"
        echo "                     ../../post-imgs/optimized/${filename}-800w.jpg 800w,"
        echo "                     ../../post-imgs/optimized/${filename}-1200w.jpg 1200w\""
        echo '             sizes="(max-width: 768px) 400px, 800px"'
        echo '             alt="UPDATE THIS ALT TEXT"'
        echo '             loading="lazy">'
        echo '    </picture>'
        echo '    <div class="image-caption">UPDATE THIS CAPTION</div>'
        echo '</div>'
        echo '```'
        echo ""
        echo "ARTICLE LISTING IMAGE (for articles/index.html):"
        echo '```html'
        echo '<div class="article-image">'
        echo '    <picture>'
        echo "        <source srcset=\"../post-imgs/optimized/${filename}-400w.webp 400w,"
        echo "                        ../post-imgs/optimized/${filename}-800w.webp 800w\""
        echo '                type="image/webp">'
        echo "        <img src=\"../post-imgs/optimized/${filename}-400w.jpg\""
        echo "             srcset=\"../post-imgs/optimized/${filename}-400w.jpg 400w,"
        echo "                     ../post-imgs/optimized/${filename}-800w.jpg 800w\""
        echo '             sizes="(max-width: 768px) 400px, 400px"'
        echo '             alt="UPDATE THIS ALT TEXT"'
        echo '             loading="lazy">'
        echo '    </picture>'
        echo '</div>'
        echo '```'
    fi
done

echo ""
echo "✨ Ready to publish! Your images are optimized and templates are ready."