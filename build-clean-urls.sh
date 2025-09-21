#!/bin/bash
# build-clean-urls.sh
# Converts .html files to directory structure for clean URLs

echo "🚀 Converting articles to clean URL directory structure..."

# Create articles directory structure
for file in articles/*.html; do
  if [ -f "$file" ]; then
    # Get filename without extension
    basename=$(basename "$file" .html)

    # Skip if it's already index.html
    if [ "$basename" != "index" ]; then
      echo "📁 Converting: $basename"

      # Create directory and move file
      mkdir -p "articles/$basename"
      cp "$file" "articles/$basename/index.html"

      # Remove original .html file
      rm "$file"

      echo "✅ Created: articles/$basename/index.html"
    fi
  fi
done

echo "🎉 Clean URL structure conversion complete!"
echo ""
echo "URLs are now:"
echo "  /articles/beat-exam-anxiety-repetitive-calming-techniques-5-strategies-students/"
echo "  /articles/take-bubble-break-short-repetitive-breaks-ease-study-stress/"
echo "  /articles/fidget-to-focus-how-small-repetitive-movements-help-anxiety-classroom/"
echo "  /articles/why-popping-bubble-wrap-oddly-satisfying-actions-relieve-student-stress/"
echo "  /articles/how-repetitive-actions-reduce-anxiety-students-science-bubble-breaks/"
echo "  /articles/10-repetitive-stress-relief-activities-students/"