#!/bin/bash
# optimize-css-loading.sh
# Apply CSS loading optimizations to all article pages

echo "🚀 Optimizing CSS loading for all article pages..."

# Find all article index.html files
find articles/*/index.html -type f | while read -r file; do
    echo "🔄 Processing: $file"

    # Backup original file
    cp "$file" "$file.backup"

    # Optimize Google Fonts loading
    sed -i '' 's|<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap" rel="stylesheet">|<link rel="preload" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='\''stylesheet'\''"><noscript><link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap" rel="stylesheet"></noscript>|g' "$file"

    # Optimize CSS loading
    sed -i '' 's|<link rel="stylesheet" href="../../styles.css?v=2024.1">|<link rel="preload" href="../../styles.css?v=2024.1" as="style" onload="this.onload=null;this.rel='\''stylesheet'\''"><noscript><link rel="stylesheet" href="../../styles.css?v=2024.1"></noscript>|g' "$file"

    sed -i '' 's|<link rel="stylesheet" href="../../article-styles.css?v=2024.1">|<link rel="preload" href="../../article-styles.css?v=2024.1" as="style" onload="this.onload=null;this.rel='\''stylesheet'\''"><noscript><link rel="stylesheet" href="../../article-styles.css?v=2024.1"></noscript>|g' "$file"

    echo "✅ Optimized: $file"
done

# Also optimize articles/index.html
echo "🔄 Processing: articles/index.html"
cp "articles/index.html" "articles/index.html.backup"

# For articles listing page (different path structure)
sed -i '' 's|<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap" rel="stylesheet">|<link rel="preload" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='\''stylesheet'\''"><noscript><link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap" rel="stylesheet"></noscript>|g' "articles/index.html"

sed -i '' 's|<link rel="stylesheet" href="../styles.css?v=2024.1">|<link rel="preload" href="../styles.css?v=2024.1" as="style" onload="this.onload=null;this.rel='\''stylesheet'\''"><noscript><link rel="stylesheet" href="../styles.css?v=2024.1"></noscript>|g' "articles/index.html"

sed -i '' 's|<link rel="stylesheet" href="../article-styles.css?v=2024.1">|<link rel="preload" href="../article-styles.css?v=2024.1" as="style" onload="this.onload=null;this.rel='\''stylesheet'\''"><noscript><link rel="stylesheet" href="../article-styles.css?v=2024.1"></noscript>|g' "articles/index.html"

echo "✅ Optimized: articles/index.html"

echo ""
echo "🎯 CSS Loading Optimization Complete!"
echo "📊 Expected improvements:"
echo "   • Google Fonts: 780ms → non-blocking"
echo "   • styles.css: 180ms → non-blocking"
echo "   • article-styles.css: 480ms → non-blocking"
echo "   • Total savings: ~600ms faster initial render"
echo ""
echo "💡 Changes made:"
echo "   • Google Fonts now load asynchronously"
echo "   • CSS files load with preload + onload pattern"
echo "   • Fallback noscript tags for compatibility"
echo "   • Critical path is no longer blocked"