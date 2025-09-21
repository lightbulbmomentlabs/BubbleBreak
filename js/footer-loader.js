/**
 * Global Footer Loader
 * Dynamically loads footer partial with correct relative paths for each page
 */

class FooterLoader {
    constructor() {
        this.footerCache = null;
        this.currentPath = this.getCurrentPath();
    }

    /**
     * Determine the current page depth to calculate relative paths
     */
    getCurrentPath() {
        const path = window.location.pathname;

        // Count directory depth to determine relative path prefix
        const segments = path.split('/').filter(segment => segment && segment !== 'index.html');

        // Remove trailing empty segments and file names
        const depth = segments.length;

        // Generate relative path prefix
        const prefix = depth > 0 ? '../'.repeat(depth) : './';

        return {
            depth: depth,
            prefix: prefix,
            homeUrl: depth > 0 ? '../'.repeat(depth) : './',
            articlesUrl: depth > 0 ? '../'.repeat(depth) + 'articles/' : 'articles/',
            privacyUrl: depth > 0 ? '../'.repeat(depth) + 'privacy-policy' : 'privacy-policy'
        };
    }

    /**
     * Load footer HTML from partial
     */
    async loadFooterPartial() {
        if (this.footerCache) {
            return this.footerCache;
        }

        try {
            const response = await fetch(this.currentPath.prefix + 'partials/footer.html');
            if (!response.ok) {
                throw new Error(`Failed to load footer: ${response.status}`);
            }

            this.footerCache = await response.text();
            return this.footerCache;
        } catch (error) {
            console.error('Footer loading error:', error);
            return this.getFallbackFooter();
        }
    }

    /**
     * Fallback footer in case the partial fails to load
     */
    getFallbackFooter() {
        return `
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h4>BubbleBreak.fun</h4>
                            <p>Free stress relief through bubble popping. Perfect for students and professionals seeking quick anxiety relief.</p>
                        </div>
                        <div class="footer-section">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><a href="${this.currentPath.homeUrl}">Start Relaxing</a></li>
                                <li><a href="${this.currentPath.articlesUrl}">All Articles</a></li>
                                <li><a href="${this.currentPath.homeUrl}#faq">FAQ</a></li>
                                <li><a href="${this.currentPath.privacyUrl}">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2025 BubbleBreak.fun - Stress relief for students. Zero data collection. 🫧</p>
                    </div>
                </div>
            </footer>
        `;
    }

    /**
     * Replace placeholders with actual URLs based on current page location
     */
    processFooterTemplate(footerHtml) {
        return footerHtml
            .replace(/\{\{HOME_URL\}\}/g, this.currentPath.homeUrl)
            .replace(/\{\{ARTICLES_URL\}\}/g, this.currentPath.articlesUrl)
            .replace(/\{\{PRIVACY_URL\}\}/g, this.currentPath.privacyUrl);
    }

    /**
     * Initialize footer on page load
     */
    async init() {
        try {
            // Find footer placeholder or create one
            let footerPlaceholder = document.getElementById('footer-placeholder');

            if (!footerPlaceholder) {
                // Create footer placeholder at end of body if none exists
                footerPlaceholder = document.createElement('div');
                footerPlaceholder.id = 'footer-placeholder';
                document.body.appendChild(footerPlaceholder);
            }

            // Load and process footer content
            const footerHtml = await this.loadFooterPartial();
            const processedFooter = this.processFooterTemplate(footerHtml);

            // Insert footer
            footerPlaceholder.innerHTML = processedFooter;

            console.log('✅ Footer loaded successfully');
        } catch (error) {
            console.error('❌ Footer initialization failed:', error);
        }
    }

    /**
     * Static method to initialize footer (convenience method)
     */
    static async load() {
        const loader = new FooterLoader();
        await loader.init();
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FooterLoader.load());
} else {
    FooterLoader.load();
}

// Export for manual usage if needed
window.FooterLoader = FooterLoader;