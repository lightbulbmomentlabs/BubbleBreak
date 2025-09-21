# Article Optimization Checklist 🚀

This checklist ensures all articles achieve optimal PageSpeed Insights performance with consistent optimizations.

## ✅ Pre-Publication Checklist

### 🎯 Performance Optimizations
- [ ] **Critical CSS inlined** - Above-the-fold styles in `<style>` tag for immediate rendering
- [ ] **CSS deferring implemented** - Non-critical CSS loaded with `preload + onload` pattern
- [ ] **Google Fonts optimized** - Using `preload + onload` with `font-display: swap`
- [ ] **WebP images with JPEG fallback** - Using `<picture>` element for all images
- [ ] **Responsive images** - Multiple sizes (400w, 800w, 1200w) with `srcset`
- [ ] **LCP optimization** - Featured image has `fetchpriority="high"` and `loading="eager"`
- [ ] **Lazy loading** - Content images use `loading="lazy"`
- [ ] **Image dimensions** - All images have explicit `width` and `height` attributes
- [ ] **Cache headers configured** - Static assets cached via multiple config methods

### 🖼️ Image Requirements
- [ ] **Original image placed** - In `/post-imgs/` directory
- [ ] **Images optimized** - Run `./add-blog-post.sh [image-name.jpg]`
- [ ] **Multiple formats created** - Both WebP and JPEG versions generated
- [ ] **Multiple sizes created** - 400w, 800w, 1200w versions available
- [ ] **Featured image implemented** - Using LCP-optimized template
- [ ] **Alt text descriptive** - Accurately describes image content for accessibility

### 📋 SEO & Structure
- [ ] **Meta description** - Compelling 150-160 character description
- [ ] **Title tag optimized** - Under 60 characters, includes primary keyword
- [ ] **Keywords defined** - Relevant keywords in meta keywords tag
- [ ] **Canonical URL set** - Proper canonical link to article
- [ ] **Open Graph complete** - All OG tags filled with article info
- [ ] **Twitter cards** - Twitter-specific meta tags configured
- [ ] **Schema.org markup** - Article structured data implemented
- [ ] **Breadcrumb navigation** - Working breadcrumb trail to articles index
- [ ] **Publication date** - Proper datetime format and human-readable date

### 🔧 Technical Implementation
- [ ] **Clean URL structure** - Lives in `/articles/[slug]/index.html`
- [ ] **Relative paths correct** - All paths use `../../` for assets from article directory
- [ ] **Navigation working** - Header nav links function properly
- [ ] **CSS versioning** - All CSS files include `?v=2024.1` parameter
- [ ] **Google Analytics** - Tracking code implemented correctly
- [ ] **Mobile responsive** - Article displays properly on mobile devices

## 🚀 Post-Publication Testing

### PageSpeed Insights Validation
- [ ] **Test mobile score** - Run PageSpeed Insights on mobile
- [ ] **Test desktop score** - Run PageSpeed Insights on desktop
- [ ] **No render-blocking CSS** - Should see 0ms render-blocking requests
- [ ] **Cache validation** - Static assets should show long cache times
- [ ] **LCP under 2.5s** - Largest Contentful Paint optimized
- [ ] **Image optimization confirmed** - No "improve image delivery" suggestions

### Manual Testing
- [ ] **Cross-browser test** - Check in Chrome, Firefox, Safari
- [ ] **Mobile device test** - Verify on actual mobile device
- [ ] **Link validation** - All internal/external links work
- [ ] **Image loading** - All images load properly with fallbacks
- [ ] **Navigation test** - Breadcrumbs and nav work correctly

## 📁 File Structure Reference

```
articles/
├── [article-slug]/
│   └── index.html          # Article with all optimizations
└── index.html              # Articles listing page

post-imgs/
├── [image-name].jpg        # Original image
└── optimized/
    ├── [image-name].jpg           # Optimized original
    ├── [image-name].webp          # WebP original
    ├── [image-name]-400w.jpg      # Small JPEG
    ├── [image-name]-400w.webp     # Small WebP
    ├── [image-name]-800w.jpg      # Medium JPEG
    ├── [image-name]-800w.webp     # Medium WebP
    ├── [image-name]-1200w.jpg     # Large JPEG
    └── [image-name]-1200w.webp    # Large WebP
```

## 🛠️ Quick Commands

```bash
# Optimize new images for article
./add-blog-post.sh [image-name.jpg]

# Verify all articles have optimizations
grep -l "Critical CSS" articles/*/index.html | wc -l    # Should equal article count
grep -l "preload.*onload" articles/*/index.html | wc -l # Should equal article count
grep -l "\.webp" articles/*/index.html | wc -l         # Should equal article count
grep -l "fetchpriority.*high" articles/*/index.html | wc -l # Should equal article count

# Test PageSpeed
# Visit: https://pagespeed.web.dev/
# Test: https://bubblebreak.fun/articles/[article-slug]/
```

## 🎯 Performance Targets

- **PageSpeed Mobile Score:** 90+
- **PageSpeed Desktop Score:** 95+
- **LCP (Largest Contentful Paint):** < 2.5s
- **Render-blocking requests:** 0ms
- **Cache optimization:** No "efficient cache lifetimes" warnings
- **Image delivery:** No "improve image delivery" warnings

---

*This checklist ensures consistent, high-performance articles that meet all PageSpeed Insights requirements.*