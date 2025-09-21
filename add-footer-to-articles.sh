#!/bin/bash
# add-footer-to-articles.sh
# Add footer navigation to all article pages

echo "🔗 Adding footer navigation to all article pages..."

FOOTER_HTML='
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-links">
                <a href="../../">Home</a>
                <a href="../../articles/">Articles</a>
                <a href="../../privacy-policy">Privacy Policy</a>
            </div>
            <div class="footer-text">
                © 2025 BubbleBreak.fun - Stress relief for students. Zero data collection. 🫧
            </div>
        </div>
    </footer>
</body>
</html>'

FOOTER_CSS='
.footer {
    background: #2c3e50;
    color: #ecf0f1;
    padding: 2rem 0;
    margin-top: 3rem;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.footer-links a {
    color: #ecf0f1;
    text-decoration: none;
    transition: color 0.2s ease;
}

.footer-links a:hover {
    color: #4a90e2;
}

.footer-text {
    font-size: 0.9rem;
    color: #bdc3c7;
}

@media (max-width: 768px) {
    .footer-links {
        flex-direction: column;
        gap: 1rem;
    }
}'

# Find all article index.html files (excluding main articles index)
find articles -maxdepth 2 -name "index.html" ! -path "articles/index.html" | while read file; do
    echo "🔄 Processing: $file"

    # Check if footer already exists
    if grep -q "footer.*footer-container" "$file"; then
        echo "✅ Footer already exists in $file"
        continue
    fi

    # Add footer CSS to critical CSS section (before closing </style>)
    if grep -q "Critical CSS" "$file"; then
        # Find the last occurrence of closing style tag in critical CSS
        awk -v css="$FOOTER_CSS" '
        /Critical CSS/ { in_critical = 1 }
        in_critical && /<\/style>/ {
            print css
            print $0
            in_critical = 0
            next
        }
        { print }
        ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"

        echo "   ✅ Added footer CSS to critical CSS section"
    fi

    # Replace closing body and html tags with footer
    sed -i.bak 's|</body>.*</html>|'"$(echo "$FOOTER_HTML" | sed 's/|/\\|/g')"'|' "$file"

    # Remove backup file
    rm -f "${file}.bak"

    echo "✅ Added footer to $file"
done

echo ""
echo "🎉 Footer navigation added to all article pages!"
echo "📋 All pages now include:"
echo "   • Home link"
echo "   • Articles link"
echo "   • Privacy Policy link"
echo "   • Consistent styling"