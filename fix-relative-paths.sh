#!/bin/bash
# fix-relative-paths.sh
# Fix relative paths in moved article files from ../ to ../../

echo "🔧 Fixing relative paths in article files..."

# Find all index.html files in article subdirectories
for file in articles/*/index.html; do
  if [ -f "$file" ]; then
    echo "📝 Fixing paths in: $file"

    # Replace ../ with ../../ for all relative paths
    sed -i '' 's|href="../|href="../../|g' "$file"
    sed -i '' 's|src="../|src="../../|g' "$file"

    echo "✅ Fixed: $file"
  fi
done

echo "🎉 All relative paths fixed!"