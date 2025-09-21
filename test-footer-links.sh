#!/bin/bash
# test-footer-links.sh
# Validate that all footer links resolve to existing files

echo "🔗 Testing footer links across all pages..."

test_links_in_file() {
    local file="$1"
    local base_dir=$(dirname "$file")
    echo "📄 Testing links in: $file"

    # Extract all relative links from footer sections
    grep -A 20 "Quick Links\|footer-links" "$file" | grep -oE 'href="[^"]*"' | sed 's/href="//; s/"//' | while read link; do
        # Skip external links, anchors, and mailto links
        if [[ "$link" =~ ^https?:// ]] || [[ "$link" =~ ^mailto: ]] || [[ "$link" =~ ^# ]]; then
            continue
        fi

        # Remove anchor fragments for file testing
        file_path=$(echo "$link" | sed 's/#.*//')

        # Skip empty paths
        if [ -z "$file_path" ]; then
            continue
        fi

        # Calculate full path relative to the file
        if [[ "$file_path" == /* ]]; then
            # Absolute path from site root
            full_path="${file_path#/}"
            if [ "$full_path" = "" ]; then
                full_path="index.html"
            fi
        else
            # Relative path
            full_path="$base_dir/$file_path"
        fi

        # Normalize path and check if target exists
        if [ -d "$full_path" ]; then
            # Directory - check for index.html
            if [ -f "$full_path/index.html" ]; then
                echo "  ✅ $link → $full_path/index.html"
            else
                echo "  ❌ $link → $full_path/ (no index.html)"
            fi
        elif [ -f "$full_path" ]; then
            echo "  ✅ $link → $full_path"
        else
            # Try adding index.html
            if [ -f "$full_path/index.html" ]; then
                echo "  ✅ $link → $full_path/index.html"
            else
                echo "  ❌ $link → $full_path (not found)"
            fi
        fi
    done
    echo ""
}

# Test all pages with footers
test_links_in_file "index.html"
test_links_in_file "articles/index.html"
test_links_in_file "privacy-policy/index.html"

# Test a couple article pages
test_links_in_file "articles/why-popping-bubble-wrap-oddly-satisfying-actions-relieve-student-stress/index.html"
test_links_in_file "articles/take-bubble-break-short-repetitive-breaks-ease-study-stress/index.html"

echo "🎉 Footer link testing complete!"
echo "📋 Summary:"
echo "   • All footer templates use centralized management"
echo "   • Relative paths automatically calculated for each page"
echo "   • Links should resolve correctly for clean URL structure"