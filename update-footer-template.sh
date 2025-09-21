#!/bin/bash
# update-footer-template.sh
# Script to update the footer template across all pages

echo "🔄 Updating footer template across all pages..."

# Footer CSS is now included in main styles.css file for consistent loading

# Define the main footer template (for index and articles index)
MAIN_FOOTER_TEMPLATE='    <footer class="footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>BubbleBreak.fun</h4>
                    <p>Free stress relief through bubble popping. Perfect for students and professionals seeking quick anxiety relief.</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="REPLACE_HOME_URL">Start Relaxing</a></li>
                        <li><a href="REPLACE_ARTICLES_URL">All Articles</a></li>
                        <li><a href="REPLACE_HOME_URL#faq">FAQ</a></li>
                        <li><a href="REPLACE_PRIVACY_URL">Privacy Policy</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Student Resources</h4>
                    <ul>
                        <li><a href="https://adaa.org/understanding-anxiety" target="_blank" rel="noopener">Anxiety & Depression Association</a></li>
                        <li><a href="https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/tips-to-reduce-stress/" target="_blank" rel="noopener">NHS Stress Management</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 BubbleBreak.fun - Stress relief for students. Zero data collection. 🫧</p>
            </div>
        </div>
    </footer>'

# Simple footer for privacy policy and minimal pages
SIMPLE_FOOTER_TEMPLATE='    <footer class="simple-footer">
        <div class="footer-container">
            <div class="footer-links">
                <a href="REPLACE_HOME_URL">Home</a>
                <a href="REPLACE_ARTICLES_URL">Articles</a>
                <a href="REPLACE_PRIVACY_URL">Privacy Policy</a>
            </div>
            <div class="footer-text">
                © 2025 BubbleBreak.fun - Stress relief for students. Zero data collection. 🫧
            </div>
        </div>
    </footer>'

update_footer() {
    local file="$1"
    local footer_template="$2"
    local home_url="$3"
    local articles_url="$4"
    local privacy_url="$5"

    echo "🔄 Updating footer in: $file"

    # Replace the URLs in the template
    local processed_footer=$(echo "$footer_template" | \
        sed "s|REPLACE_HOME_URL|$home_url|g" | \
        sed "s|REPLACE_ARTICLES_URL|$articles_url|g" | \
        sed "s|REPLACE_PRIVACY_URL|$privacy_url|g")

    # Create a temporary file with everything before the footer
    awk '/<footer|<\/body>/{exit} {print}' "$file" > "${file}.tmp"

    # Add the new footer
    echo "$processed_footer" >> "${file}.tmp"

    # Add closing body and html tags
    echo "</body>" >> "${file}.tmp"
    echo "</html>" >> "${file}.tmp"

    # Replace the original file
    mv "${file}.tmp" "$file"

    echo "✅ Updated: $file"
}

# Update main index page
if [ -f "index.html" ]; then
    update_footer "index.html" "$MAIN_FOOTER_TEMPLATE" "/" "articles/" "privacy-policy"
fi

# Update articles index page
if [ -f "articles/index.html" ]; then
    update_footer "articles/index.html" "$MAIN_FOOTER_TEMPLATE" "../" "./" "../privacy-policy"
fi

# Update privacy policy page
if [ -f "privacy-policy/index.html" ]; then
    update_footer "privacy-policy/index.html" "$SIMPLE_FOOTER_TEMPLATE" "../" "../articles/" "../privacy-policy"
fi

# Update individual article pages
find articles -maxdepth 2 -name "index.html" ! -path "articles/index.html" | while read file; do
    update_footer "$file" "$MAIN_FOOTER_TEMPLATE" "../../" "../../articles/" "../../privacy-policy"
done

echo ""
echo "🎉 Footer template update complete!"
echo "📋 All pages now use centralized footer templates"
echo "🔧 To update footer content in the future:"
echo "   1. Edit this script (update-footer-template.sh)"
echo "   2. Run: ./update-footer-template.sh"
echo "   3. Commit and push changes"