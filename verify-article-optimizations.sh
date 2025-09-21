#!/bin/bash
# verify-article-optimizations.sh
# Automated verification that all articles have PageSpeed optimizations

echo "🔍 Verifying PageSpeed optimizations across all articles..."
echo ""

# Count total articles (excluding main index)
TOTAL_ARTICLES=$(find articles -maxdepth 2 -name "index.html" ! -path "articles/index.html" | wc -l | tr -d ' ')
echo "📊 Total article pages found: $TOTAL_ARTICLES"
echo ""

# Function to check optimization and show results
check_optimization() {
    local name="$1"
    local pattern="$2"
    local expected="$3"

    local count=$(grep -l "$pattern" articles/*/index.html | wc -l | tr -d ' ')

    if [ "$count" -eq "$expected" ]; then
        echo "✅ $name: $count/$expected articles"
    else
        echo "❌ $name: $count/$expected articles"
        echo "   Missing from:"
        find articles -maxdepth 2 -name "index.html" ! -path "articles/index.html" -exec grep -L "$pattern" {} \; | sed 's/^/   - /'
    fi
    echo ""
}

echo "🎯 PageSpeed Optimization Status:"
echo "================================="

# Check each optimization
check_optimization "Critical CSS inlined" "Critical CSS" $TOTAL_ARTICLES
check_optimization "CSS deferring implemented" "preload.*onload" $TOTAL_ARTICLES
check_optimization "WebP images with fallback" "\.webp" $TOTAL_ARTICLES
check_optimization "Responsive images (srcset)" "srcset" $TOTAL_ARTICLES
check_optimization "LCP optimization (fetchpriority)" "fetchpriority.*high" $TOTAL_ARTICLES
check_optimization "Google Fonts optimized" "preload.*fonts.googleapis" $TOTAL_ARTICLES
check_optimization "Cache-busting parameters" "\?v=2024\.1" $TOTAL_ARTICLES

# Additional checks
echo "🔧 Additional Checks:"
echo "==================="

# Check for lazy loading (should be less than total since featured images use eager)
LAZY_COUNT=$(grep -l "loading.*lazy" articles/*/index.html | wc -l | tr -d ' ')
echo "✅ Lazy loading implemented: $LAZY_COUNT articles (content images)"

# Check for image dimensions
DIMENSION_COUNT=$(grep -l 'width="' articles/*/index.html | wc -l | tr -d ' ')
if [ "$DIMENSION_COUNT" -eq "$TOTAL_ARTICLES" ]; then
    echo "✅ Image dimensions specified: $DIMENSION_COUNT/$TOTAL_ARTICLES articles"
else
    echo "❌ Image dimensions specified: $DIMENSION_COUNT/$TOTAL_ARTICLES articles"
fi

# Check for schema markup
SCHEMA_COUNT=$(grep -l "ld+json" articles/*/index.html | wc -l | tr -d ' ')
if [ "$SCHEMA_COUNT" -eq "$TOTAL_ARTICLES" ]; then
    echo "✅ Schema.org markup: $SCHEMA_COUNT/$TOTAL_ARTICLES articles"
else
    echo "❌ Schema.org markup: $SCHEMA_COUNT/$TOTAL_ARTICLES articles"
fi

echo ""
echo "📈 Cache Configuration Status:"
echo "=============================="

# Check cache configuration files
if [ -f "static.json" ]; then
    echo "✅ static.json exists"
else
    echo "❌ static.json missing"
fi

if [ -f ".htaccess" ]; then
    echo "✅ .htaccess exists"
else
    echo "❌ .htaccess missing"
fi

if [ -f ".do/app.yaml" ]; then
    echo "✅ DigitalOcean app.yaml exists"
else
    echo "❌ DigitalOcean app.yaml missing"
fi

echo ""
echo "🎯 Performance Summary:"
echo "======================"

# Calculate overall completion
TOTAL_CHECKS=7  # Number of main optimizations we check
PASSED_CHECKS=0

# Count passed checks (simplified - just checking if count equals expected)
for pattern in "Critical CSS" "preload.*onload" "\.webp" "srcset" "fetchpriority.*high" "preload.*fonts.googleapis" "\?v=2024\.1"; do
    count=$(grep -l "$pattern" articles/*/index.html | wc -l | tr -d ' ')
    if [ "$count" -eq "$TOTAL_ARTICLES" ]; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
done

COMPLETION_PERCENT=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ "$COMPLETION_PERCENT" -eq 100 ]; then
    echo "🎉 ALL OPTIMIZATIONS COMPLETE: $COMPLETION_PERCENT% ($PASSED_CHECKS/$TOTAL_CHECKS checks passed)"
    echo "   Ready for PageSpeed Insights testing!"
else
    echo "⚠️  OPTIMIZATIONS INCOMPLETE: $COMPLETION_PERCENT% ($PASSED_CHECKS/$TOTAL_CHECKS checks passed)"
    echo "   Some articles need optimization updates."
fi

echo ""
echo "📋 Next Steps:"
echo "============="
echo "1. Fix any missing optimizations shown above"
echo "2. Test articles in PageSpeed Insights:"
echo "   https://pagespeed.web.dev/"
echo "3. Target scores: Mobile 90+, Desktop 95+"
echo ""
echo "🛠️  Quick fix commands:"
echo "   ./add-critical-css.sh     # Add critical CSS to missing articles"
echo "   ./add-blog-post.sh [img]  # Optimize new images"