/**
 * AdSense Integration for Soap Bubbles
 * Handles Google AdSense banner placement and optimization
 * Ensures non-intrusive ads that don't interfere with gameplay
 */

class AdSenseManager {
    constructor() {
        this.isInitialized = false;
        this.isAdBlockerDetected = false;

        // Multiple ad containers
        this.adContainers = {
            bottom: null,
            left: null,
            right: null
        };
        this.adSlots = {
            bottom: null,
            left: null,
            right: null
        };

        this.refreshInterval = 30000; // 30 seconds minimum as per PRD
        this.refreshTimer = null;
        this.isGameLoaded = false;
        this.retryAttempts = 0;
        this.maxRetryAttempts = 3;

        // Ad configuration based on PRD requirements
        this.adConfig = {
            publisher: 'ca-pub-XXXXXXXXXXXXXXXX', // Replace with actual publisher ID
            bottom: {
                desktop: {
                    slot: 'XXXXXXXXXX', // Replace with actual ad slot ID
                    width: 728,
                    height: 90,
                    format: 'banner'
                },
                mobile: {
                    slot: 'XXXXXXXXXX', // Replace with actual mobile ad slot ID
                    width: 320,
                    height: 50,
                    format: 'mobile-banner'
                }
            },
            left: {
                desktop: {
                    slot: 'YYYYYYYYYY', // Replace with actual left vertical ad slot ID
                    width: 160,
                    height: 600,
                    format: 'vertical-banner'
                },
                mobile: {
                    // Hidden on mobile
                    enabled: false
                }
            },
            right: {
                desktop: {
                    slot: 'ZZZZZZZZZZ', // Replace with actual right vertical ad slot ID
                    width: 160,
                    height: 600,
                    format: 'vertical-banner'
                },
                mobile: {
                    // Hidden on mobile
                    enabled: false
                }
            }
        };
    }

    /**
     * Initialize AdSense after game is loaded
     */
    async init() {
        try {
            console.log('Initializing AdSense integration...');

            // Get all ad containers
            this.adContainers.bottom = document.getElementById('adContainer');
            this.adContainers.left = document.getElementById('adContainerLeft');
            this.adContainers.right = document.getElementById('adContainerRight');

            if (!this.adContainers.bottom) {
                throw new Error('Bottom ad container not found');
            }

            // Left and right containers are optional (hidden on mobile)
            if (!this.adContainers.left) {
                console.warn('Left ad container not found');
            }
            if (!this.adContainers.right) {
                console.warn('Right ad container not found');
            }

            // Wait for game to be loaded before showing ads
            await this.waitForGameLoad();

            // Check for ad blocker
            this.detectAdBlocker();

            // Load AdSense script asynchronously
            await this.loadAdSenseScript();

            // Setup responsive ad unit
            this.setupResponsiveAd();

            // Initialize ad display
            this.displayAd();

            // Setup refresh timer
            this.setupAdRefresh();

            this.isInitialized = true;
            console.log('AdSense integration initialized successfully');

        } catch (error) {
            console.error('Failed to initialize AdSense:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Wait for game to be fully loaded before displaying ads
     */
    async waitForGameLoad() {
        return new Promise((resolve) => {
            const checkGameLoad = () => {
                // Check if bubble game is loaded and running
                if (window.bubbleGame && window.bubbleGame.isRunning) {
                    this.isGameLoaded = true;
                    resolve();
                } else {
                    setTimeout(checkGameLoad, 100);
                }
            };

            // Start checking after a brief delay to ensure DOM is ready
            setTimeout(checkGameLoad, 500);
        });
    }

    /**
     * Load Google AdSense script asynchronously
     */
    async loadAdSenseScript() {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            if (window.adsbygoogle) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.adConfig.publisher}`;
            script.crossOrigin = 'anonymous';

            script.onload = () => {
                console.log('AdSense script loaded successfully');
                resolve();
            };

            script.onerror = () => {
                console.warn('Failed to load AdSense script');
                reject(new Error('AdSense script failed to load'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Setup responsive ad units for all containers based on screen size
     */
    setupResponsiveAd() {
        const isMobile = this.isMobileDevice();

        // Setup bottom ad (always visible)
        this.setupAdUnit('bottom', isMobile);

        // Setup vertical ads (only on desktop/tablet)
        if (!isMobile) {
            this.setupAdUnit('left', isMobile);
            this.setupAdUnit('right', isMobile);
        }
    }

    /**
     * Setup individual ad unit
     */
    setupAdUnit(position, isMobile) {
        const container = this.adContainers[position];
        if (!container) {
            console.warn(`Container for ${position} ad not found`);
            return;
        }

        const adConfigForPosition = this.adConfig[position];
        if (!adConfigForPosition) {
            console.warn(`Config for ${position} ad not found`);
            return;
        }

        // Check if mobile ads are enabled for this position
        const config = isMobile ? adConfigForPosition.mobile : adConfigForPosition.desktop;
        if (!config || (isMobile && config.enabled === false)) {
            // Hide container if not enabled for mobile
            container.style.display = 'none';
            return;
        }

        // Show container
        container.style.display = 'block';

        // Clear existing ad content
        container.innerHTML = '';

        // Create ad element
        const adElement = document.createElement('ins');
        adElement.className = 'adsbygoogle';
        adElement.style.display = 'block';
        adElement.setAttribute('data-ad-client', this.adConfig.publisher);
        adElement.setAttribute('data-ad-slot', config.slot);
        adElement.setAttribute('data-ad-format', config.format);
        adElement.setAttribute('data-full-width-responsive', 'true');

        // Set explicit dimensions for better control
        adElement.style.width = config.width + 'px';
        adElement.style.height = config.height + 'px';

        container.appendChild(adElement);
        this.adSlots[position] = adElement;
    }

    /**
     * Display the ad
     */
    async displayAd() {
        if (!this.adSlot || this.isAdBlockerDetected) {
            return;
        }

        try {
            // Push to AdSense queue
            (window.adsbygoogle = window.adsbygoogle || []).push({});

            console.log('Ad display request sent');

            // Monitor ad load
            this.monitorAdLoad();

        } catch (error) {
            console.error('Error displaying ad:', error);
            this.handleAdError(error);
        }
    }

    /**
     * Monitor ad loading and handle failures
     */
    monitorAdLoad() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds maximum wait

        const checkAdLoad = () => {
            attempts++;

            if (this.adSlot && this.adSlot.getAttribute('data-adsbygoogle-status')) {
                const status = this.adSlot.getAttribute('data-adsbygoogle-status');

                if (status === 'done') {
                    console.log('Ad loaded successfully');
                    this.onAdLoaded();
                } else if (status === 'error') {
                    console.warn('Ad failed to load');
                    this.handleAdError(new Error('Ad loading failed'));
                }
            } else if (attempts < maxAttempts) {
                setTimeout(checkAdLoad, 100);
            } else {
                console.warn('Ad loading timeout');
                this.handleAdError(new Error('Ad loading timeout'));
            }
        };

        setTimeout(checkAdLoad, 100);
    }

    /**
     * Handle successful ad load
     */
    onAdLoaded() {
        // Show ad container
        this.adContainer.style.display = 'block';

        // Ensure ad doesn't interfere with game performance
        this.optimizeForPerformance();
    }

    /**
     * Optimize performance when ads are displayed
     */
    optimizeForPerformance() {
        // Reduce game quality slightly if needed to maintain 60fps
        if (window.bubbleGame && window.bubbleGame.performanceMonitor) {
            const fps = window.bubbleGame.performanceMonitor.getCurrentFPS();

            if (fps < 50) {
                console.log('Reducing game quality due to ad performance impact');

                // Enable performance mode in various systems
                if (window.bubbleGame.physicsEngine) {
                    window.bubbleGame.physicsEngine.enableSimplePhysics(true);
                }

                if (window.bubbleGame.particleSystem) {
                    window.bubbleGame.particleSystem.enablePerformanceMode(true);
                }

                if (window.bubbleGame.audioManager) {
                    window.bubbleGame.audioManager.enablePerformanceMode(true);
                }
            }
        }
    }

    /**
     * Setup ad refresh timer
     */
    setupAdRefresh() {
        // Clear existing timer
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        // Setup new refresh timer (minimum 30 seconds as per PRD)
        this.refreshTimer = setInterval(() => {
            this.refreshAd();
        }, this.refreshInterval);
    }

    /**
     * Refresh the ad
     */
    refreshAd() {
        if (!this.isInitialized || this.isAdBlockerDetected) {
            return;
        }

        try {
            console.log('Refreshing ad...');

            // Clear current ad
            if (this.adSlot) {
                this.adSlot.remove();
            }

            // Setup and display new ad
            this.setupResponsiveAd();
            this.displayAd();

        } catch (error) {
            console.error('Error refreshing ad:', error);
        }
    }

    /**
     * Detect if ad blocker is present
     */
    detectAdBlocker() {
        // Create a test element that ad blockers typically block
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.position = 'absolute';
        testAd.style.left = '-1000px';
        testAd.style.width = '1px';
        testAd.style.height = '1px';

        document.body.appendChild(testAd);

        setTimeout(() => {
            try {
                if (testAd.offsetHeight === 0 ||
                    testAd.style.display === 'none' ||
                    testAd.style.visibility === 'hidden') {
                    this.isAdBlockerDetected = true;
                    console.log('Ad blocker detected - ads will be disabled');
                    this.handleAdBlocker();
                }
                document.body.removeChild(testAd);
            } catch (error) {
                // Element might have been removed by ad blocker
                this.isAdBlockerDetected = true;
                this.handleAdBlocker();
            }
        }, 100);
    }

    /**
     * Handle ad blocker detection
     */
    handleAdBlocker() {
        // Hide ad container gracefully
        if (this.adContainer) {
            this.adContainer.style.display = 'none';
        }

        // Clear any refresh timers
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }

        // Optional: Show subtle message about supporting the site
        // (Keep it non-intrusive as per PRD requirements)
        console.log('Ad blocker detected. Continuing with ad-free experience.');
    }

    /**
     * Handle ad errors
     */
    handleAdError(error) {
        console.error('Ad error:', error);

        this.retryAttempts++;

        if (this.retryAttempts < this.maxRetryAttempts) {
            console.log(`Retrying ad load (attempt ${this.retryAttempts + 1})`);
            setTimeout(() => {
                this.displayAd();
            }, 2000 * this.retryAttempts); // Exponential backoff
        } else {
            console.warn('Max ad retry attempts reached. Disabling ads.');
            this.handleAdBlocker(); // Handle as if ad blocker is present
        }
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('AdSense initialization failed:', error);

        // Hide ad container
        if (this.adContainer) {
            this.adContainer.style.display = 'none';
        }

        // Game should continue without ads
        console.log('Continuing without ads due to initialization failure');
    }

    /**
     * Check if device is mobile
     */
    isMobileDevice() {
        return window.innerWidth <= 768 ||
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (!this.isInitialized) return;

        // Check if we need to switch between mobile/desktop ad formats
        const wasMobile = this.adSlot && this.adSlot.style.width === '320px';
        const isMobile = this.isMobileDevice();

        if (wasMobile !== isMobile) {
            console.log('Screen size changed, updating ad format');
            this.setupResponsiveAd();
            this.displayAd();
        }
    }

    /**
     * Cleanup resources
     */
    dispose() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }

        if (this.adContainer) {
            this.adContainer.style.display = 'none';
        }

        this.isInitialized = false;
    }

    /**
     * Get ad manager status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isAdBlockerDetected: this.isAdBlockerDetected,
            isGameLoaded: this.isGameLoaded,
            retryAttempts: this.retryAttempts,
            hasActiveRefreshTimer: !!this.refreshTimer,
            currentAdFormat: this.isMobileDevice() ? 'mobile' : 'desktop'
        };
    }
}

// Privacy consent handling
function initializePrivacyConsent() {
    const privacyNotice = document.getElementById('privacyNotice');
    const acceptButton = document.getElementById('acceptPrivacy');
    const privacyLink = document.getElementById('privacyLink');

    // Check if user has already consented
    const hasConsented = localStorage.getItem('privacy-consent') === 'true';

    if (!hasConsented) {
        // Show privacy notice
        setTimeout(() => {
            privacyNotice.classList.add('show');
        }, 3000); // Show after 3 seconds
    }

    // Handle accept button
    acceptButton.addEventListener('click', () => {
        localStorage.setItem('privacy-consent', 'true');
        privacyNotice.classList.remove('show');

        // Initialize ads after consent
        if (window.adSenseManager) {
            window.adSenseManager.init();
        }
    });

    // Handle privacy policy link
    privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPrivacyPolicy();
    });

    return hasConsented;
}

// Simple privacy policy modal
function showPrivacyPolicy() {
    const modal = document.createElement('div');
    modal.className = 'privacy-modal';
    modal.innerHTML = `
        <div class="privacy-modal-content">
            <h2>Privacy Policy</h2>
            <p>This website uses Google AdSense to display advertisements. AdSense may collect and use your data to show personalized ads.</p>
            <p>We collect minimal data necessary for the game to function and may use cookies for ad personalization.</p>
            <p>By continuing to use this site, you consent to our use of cookies and data collection for advertising purposes.</p>
            <p>For more information about Google's privacy practices, visit <a href="https://policies.google.com/privacy" target="_blank">Google Privacy Policy</a>.</p>
            <button class="privacy-button" onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;

    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;

    modal.querySelector('.privacy-modal-content').style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        color: #333;
    `;

    document.body.appendChild(modal);
}

// Initialize AdSense when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create global AdSense manager
    window.adSenseManager = new AdSenseManager();

    // Initialize privacy consent handling
    const hasConsented = initializePrivacyConsent();

    // If user has already consented, initialize ads immediately
    if (hasConsented) {
        setTimeout(() => {
            window.adSenseManager.init();
        }, 2000);
    }

    // Handle window resize for responsive ads
    window.addEventListener('resize', () => {
        if (window.adSenseManager) {
            window.adSenseManager.handleResize();
        }
    });
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden && window.adSenseManager && window.adSenseManager.refreshTimer) {
        // Pause ad refresh when page is hidden
        clearInterval(window.adSenseManager.refreshTimer);
        window.adSenseManager.refreshTimer = null;
    } else if (!document.hidden && window.adSenseManager && window.adSenseManager.isInitialized) {
        // Resume ad refresh when page becomes visible
        window.adSenseManager.setupAdRefresh();
    }
});