#!/bin/bash
# add-css-versions.sh
# Add version parameters to CSS files in all article directories

echo "🔧 Adding version parameters to CSS files..."

# Find all index.html files in article subdirectories
for file in articles/*/index.html; do
  if [ -f "$file" ]; then
    echo "📝 Adding versions to: $file"

    # Add version parameters to CSS files
    sed -i '' 's|href="../../styles\.css"|href="../../styles.css?v=2024.1"|g' "$file"
    sed -i '' 's|href="../../article-styles\.css"|href="../../article-styles.css?v=2024.1"|g' "$file"

    echo "✅ Updated: $file"
  fi
done

echo "🎉 All CSS files now have version parameters for better caching!"