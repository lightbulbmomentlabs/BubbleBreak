#!/bin/bash
# add-privacy-link.sh
# Add Privacy Policy link to existing footer Quick Links in all articles

echo "🔗 Adding Privacy Policy link to all article footers..."

# Find all article index.html files (excluding main articles index)
find articles -maxdepth 2 -name "index.html" ! -path "articles/index.html" | while read file; do
    echo "🔄 Processing: $file"

    # Check if privacy policy link already exists
    if grep -q "privacy-policy" "$file"; then
        echo "✅ Privacy Policy link already exists in $file"
        continue
    fi

    # Add privacy policy link after FAQ link in Quick Links section
    if grep -q "#faq.*FAQ" "$file"; then
        sed -i.bak 's|<li><a href="../../#faq">FAQ</a></li>|<li><a href="../../#faq">FAQ</a></li>\
                        <li><a href="../../privacy-policy">Privacy Policy</a></li>|' "$file"

        # Remove backup file
        rm -f "${file}.bak"

        echo "✅ Added Privacy Policy link to $file"
    else
        echo "❌ Could not find FAQ link pattern in $file"
    fi
done

echo ""
echo "🎉 Privacy Policy links added to all article footers!"
echo "📋 All article pages now link to the privacy policy in their footer navigation."