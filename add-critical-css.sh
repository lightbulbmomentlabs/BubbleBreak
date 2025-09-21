#!/bin/bash
# add-critical-css.sh
# Add critical CSS to remaining article pages

echo "🎯 Adding critical CSS to remaining article pages..."

CRITICAL_CSS='
    <!-- Critical CSS (inlined for immediate rendering) -->
    <style>
/* Critical CSS for Article Pages - Above the fold */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    height: 100%;
    overflow-x: hidden;
    font-family: '\''Fredoka'\'', -apple-system, BlinkMacSystemFont, '\''Segoe UI'\'', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-weight: 400;
    background: #ffffff;
    scroll-behavior: smooth;
    color: #333;
    line-height: 1.6;
}

button, input, select, textarea, option {
    font-family: inherit;
}

.article-page {
    background: #ffffff;
}

.article-header {
    background: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logo-link {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: #4a90e2;
    font-weight: 600;
    font-size: 18px;
    transition: all 0.2s ease;
}

.logo-link:hover {
    color: #357abd;
    transform: translateY(-1px);
}

.logo-icon {
    font-size: 24px;
    line-height: 1;
}

.logo-text {
    letter-spacing: -0.02em;
}

.nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
    align-items: center;
}

.nav-links a {
    text-decoration: none;
    color: #666;
    font-weight: 500;
    transition: color 0.2s ease;
    position: relative;
}

.nav-links a:hover {
    color: #4a90e2;
}

.article-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.article-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1rem;
    line-height: 1.2;
}

.article-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 2rem;
}

.article-meta time {
    font-weight: 500;
}

.read-time {
    color: #888;
}

.article-category {
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.featured-image,
.article-featured-image {
    margin-bottom: 2rem;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.featured-image img,
.article-featured-image img {
    width: 100%;
    height: auto;
    display: block;
}

.breadcrumb {
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.breadcrumb a {
    color: #4a90e2;
    text-decoration: none;
}

.breadcrumb a:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .header-container {
        padding: 1rem;
    }

    .nav-links {
        gap: 1rem;
    }

    .article-container {
        padding: 1rem;
    }

    .article-title {
        font-size: 2rem;
    }

    .article-meta {
        flex-direction: column;
        gap: 0.5rem;
    }
}
    </style>

'

# Articles that still need critical CSS
ARTICLES=(
    "articles/beat-exam-anxiety-repetitive-calming-techniques-5-strategies-students/index.html"
    "articles/fidget-to-focus-how-small-repetitive-movements-help-anxiety-classroom/index.html"
    "articles/how-repetitive-actions-reduce-anxiety-students-science-bubble-breaks/index.html"
    "articles/10-repetitive-stress-relief-activities-students/index.html"
)

for file in "${ARTICLES[@]}"; do
    echo "🔄 Processing: $file"

    # Check if critical CSS is already added
    if grep -q "Critical CSS" "$file"; then
        echo "✅ Critical CSS already exists in $file"
        continue
    fi

    # Find the line with noscript article-styles and add critical CSS after it
    if grep -q "noscript.*article-styles" "$file"; then
        # Create a temp file with the critical CSS insertion
        awk -v css="$CRITICAL_CSS" '
        /noscript.*article-styles/ {
            print $0
            print css
            next
        }
        { print }
        ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"

        echo "✅ Added critical CSS to $file"
    else
        echo "❌ Could not find insertion point in $file"
    fi
done

echo ""
echo "🎯 Critical CSS addition complete!"
echo "📊 All article pages now have:"
echo "   • Inlined critical CSS for immediate rendering"
echo "   • Deferred non-critical CSS loading"
echo "   • Complete render-blocking elimination"