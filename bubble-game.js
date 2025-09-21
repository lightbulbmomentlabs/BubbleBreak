/**
 * Soap Bubbles Game - Main Game Engine
 * A relaxing digital fidget toy for popping floating soap bubbles
 */

class BubbleGame {
    constructor() {
        // Canvas and rendering
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.dpr = window.devicePixelRatio || 1;

        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.deltaTime = 0;

        // Configuration (adjusted for more bubbles and longer lifetime)
        this.config = {
            maxBubbles: 25, // Increased for more bubbles on screen
            spawnRate: 800, // Much faster spawning (0.8-1.8 seconds)
            spawnRateVariation: 1000,
            bubbleLifetime: 18000, // Much longer lifetime (18-22 seconds)
            bubbleLifetimeVariation: 4000,
            performanceTarget: 60, // fps
            maxMemoryUsage: 50 * 1024 * 1024, // 50MB in bytes
            initialBubbleCount: 8, // Spawn this many bubbles immediately on start
        };

        // Ad zone configuration for bubble avoidance
        this.adZones = {
            left: { width: 180, margin: 20 }, // Ad width + safety margin
            bottom: { height: 100, margin: 20 } // Ad height + safety margin
        };

        // Game systems
        this.bubbleManager = null;
        this.physicsEngine = null;
        this.audioManager = null;
        this.particleSystem = null;
        this.inputHandler = null;
        this.performanceMonitor = null;

        // UI elements
        this.loadingScreen = null;
        this.startScreen = null;
        this.startButton = null;
        this.popCountElement = null;
        this.volumeSlider = null;
        this.speedSlider = null;
        this.densitySlider = null;
        this.settingsToggle = null;
        this.collapsibleSettings = null;

        // Game state
        this.gameStarted = false;
        this.popCount = 0;
        this.currentTheme = 'classic'; // Default theme
        this.currentBackground = 'gradient'; // Default background
        this.isTransitioning = false;
        this.bubbleSpeedMultiplier = 1.0; // Default speed (5 on the slider)
        this.bubbleDensityMultiplier = 1.0; // Default density (5 on the slider)

        // Theme definitions
        this.themes = {
            classic: {
                name: 'Classic Soap',
                colors: {
                    hueBase: 200,
                    saturation: 70,
                    lightness: 80,
                    opacity: 0.3
                },
                highlight: 'rgba(255, 255, 255, 0.6)',
                outline: true
            },
            oil: {
                name: 'Oil Slick',
                colors: {
                    hueBase: 280,
                    saturation: 90,
                    lightness: 60,
                    opacity: 0.4
                },
                highlight: 'rgba(255, 215, 0, 0.4)',
                outline: true,
                shimmer: true
            },
            crystal: {
                name: 'Crystal',
                colors: {
                    hueBase: 180,
                    saturation: 30,
                    lightness: 95,
                    opacity: 0.2
                },
                highlight: 'rgba(255, 255, 255, 0.9)',
                outline: true,
                sparkle: true
            },
            galaxy: {
                name: 'Galaxy',
                colors: {
                    hueBase: 260,
                    saturation: 80,
                    lightness: 40,
                    opacity: 0.5
                },
                highlight: 'rgba(255, 255, 255, 0.3)',
                outline: false,
                stars: true
            }
        };

        // Background definitions
        this.backgrounds = {
            gradient: {
                name: 'Default Gradient',
                type: 'gradient'
            },
            aurora: {
                name: 'Aurora',
                type: 'image',
                url: 'bgs/aurora.jpg'
            },
            clouds: {
                name: 'Clouds',
                type: 'image',
                url: 'bgs/clouds.jpg'
            },
            forest: {
                name: 'Forest',
                type: 'image',
                url: 'bgs/forest.jpg'
            },
            galaxy: {
                name: 'Galaxy',
                type: 'image',
                url: 'bgs/galaxy.jpg'
            },
            meadow: {
                name: 'Meadow',
                type: 'image',
                url: 'bgs/meadow.jpg'
            },
            mountain: {
                name: 'Mountain',
                type: 'image',
                url: 'bgs/mountain.jpg'
            },
            ocean: {
                name: 'Ocean',
                type: 'image',
                url: 'bgs/ocean.jpg'
            },
            zen: {
                name: 'Zen',
                type: 'image',
                url: 'bgs/zen.jpg'
            }
        };

        // Timing
        this.lastSpawnTime = 0;
        this.nextSpawnDelay = this.getRandomSpawnDelay();

        // Spawn distribution tracking (for debugging) - updated for 3 edges
        this.spawnStats = { bottom: 0, left: 0, right: 0 };

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    /**
     * Initialize the game
     */
    async init() {
        try {
            console.log('Initializing Soap Bubbles Game...');

            // Get DOM elements
            this.canvas = document.getElementById('bubbleCanvas');
            this.loadingScreen = document.getElementById('loadingScreen');
            this.startScreen = document.getElementById('startScreen');
            this.startButton = document.getElementById('startButton');
            this.popCountElement = document.getElementById('popCount');
            this.volumeSlider = document.getElementById('volumeSlider');
            this.speedSlider = document.getElementById('speedSlider');
            this.densitySlider = document.getElementById('densitySlider');
            this.settingsToggle = document.getElementById('settingsToggle');
            this.collapsibleSettings = document.getElementById('collapsibleSettings');
            this.themeSelect = document.getElementById('themeSelect');
            this.backgroundSelect = document.getElementById('backgroundSelect');

            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }

            // Setup canvas
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();

            // Initialize game systems
            await this.initializeSystems();

            // Setup event listeners
            this.setupEventListeners();

            // Hide loading screen
            this.hideLoadingScreen();

            // Show start screen instead of starting immediately
            this.showStartScreen();

            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError(error.message);
        }
    }

    /**
     * Setup canvas with proper scaling and high DPI support
     */
    setupCanvas() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Set canvas size accounting for device pixel ratio
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        // Scale context for high DPI displays
        this.ctx.scale(this.dpr, this.dpr);

        // Set rendering properties for smooth graphics
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    /**
     * Initialize all game systems
     */
    async initializeSystems() {
        // Initialize physics engine
        if (typeof PhysicsEngine !== 'undefined') {
            this.physicsEngine = new PhysicsEngine(this.width, this.height);
        }

        // Initialize audio manager
        if (typeof AudioManager !== 'undefined') {
            this.audioManager = new AudioManager();
            await this.audioManager.init();
        }

        // Initialize particle system
        if (typeof ParticleSystem !== 'undefined') {
            this.particleSystem = new ParticleSystem(this.ctx);
        }

        // Initialize bubble manager
        this.bubbleManager = new BubbleManager(this.ctx, this.config.maxBubbles);

        // Initialize input handler
        this.inputHandler = new InputHandler(this.canvas);

        // Initialize performance monitor
        this.performanceMonitor = new PerformanceMonitor(this.config.performanceTarget);

        // Connect input events
        this.inputHandler.onBubbleHover = (x, y) => {
            this.handleBubbleInteraction(x, y);
        };

        // Initialize background
        this.initializeBackground();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', this.handleResize, { passive: true });

        // Page visibility (for performance)
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // Start button
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Settings toggle
        if (this.settingsToggle && this.collapsibleSettings) {
            this.settingsToggle.addEventListener('click', () => {
                this.toggleSettings();
            });
        }

        // Volume slider
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.handleVolumeChange(e.target.value);
            });

            // Set initial volume from slider value
            this.handleVolumeChange(this.volumeSlider.value);
        }

        // Speed slider
        if (this.speedSlider) {
            this.speedSlider.addEventListener('input', (e) => {
                this.handleSpeedChange(e.target.value);
            });

            // Set initial speed from slider value
            this.handleSpeedChange(this.speedSlider.value);
        }

        // Density slider
        if (this.densitySlider) {
            this.densitySlider.addEventListener('input', (e) => {
                this.handleDensityChange(e.target.value);
            });

            // Set initial density from slider value
            this.handleDensityChange(this.densitySlider.value);
        }

        // Theme selector
        if (this.themeSelect) {
            this.themeSelect.addEventListener('change', (e) => {
                this.handleThemeChange(e.target.value);
            });
        }

        // Background selector
        if (this.backgroundSelect) {
            this.backgroundSelect.addEventListener('change', (e) => {
                this.handleBackgroundChange(e.target.value);
            });
        }

        // Error handling
        window.addEventListener('error', (event) => {
            console.error('Game error:', event.error);
        });

        // Debug mode toggle (press 'D' key)
        window.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'd') {
                if (this.performanceMonitor) {
                    this.performanceMonitor.toggleDebugMode();
                    console.log('Debug mode:', this.performanceMonitor.debugMode ? 'ON' : 'OFF');
                }
            }
        });
    }

    /**
     * Start the game
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

    /**
     * Pause the game
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Resume the game
     */
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.lastTime = performance.now();
        }
    }

    /**
     * Stop the game
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
    }

    /**
     * Main game loop - runs at 60fps
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Skip frame if paused
        if (this.isPaused) {
            requestAnimationFrame(this.gameLoop);
            return;
        }

        // Performance monitoring
        this.performanceMonitor.frameStart();

        // Update game systems
        this.update(this.deltaTime);

        // Render frame
        this.render();

        // Performance monitoring
        this.performanceMonitor.frameEnd();

        // Continue the loop
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Update all game systems
     */
    update(deltaTime) {
        // Spawn new bubbles
        this.updateBubbleSpawning(deltaTime);

        // Update bubbles with speed multiplier
        this.bubbleManager.update(deltaTime, this.physicsEngine, this.bubbleSpeedMultiplier);

        // Update particles
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime);
        }

        // Update input
        this.inputHandler.update();

        // Check performance and adjust quality if needed
        this.performanceMonitor.update();
    }

    /**
     * Render the current frame
     */
    render() {
        // Clear canvas with gradient background
        this.clearCanvas();

        // Render bubbles
        this.bubbleManager.render();

        // Render particles
        if (this.particleSystem) {
            this.particleSystem.render();
        }

        // Render debug info if enabled
        if (this.performanceMonitor.debugMode) {
            this.renderDebugInfo();
        }
    }

    /**
     * Clear canvas with background
     */
    clearCanvas() {
        if (this.currentBackground === 'gradient') {
            // Create gradient background (only for gradient mode)
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#ffffff');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else {
            // For image backgrounds, clear with transparency to show CSS background
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }

    /**
     * Handle bubble spawning timing
     */
    updateBubbleSpawning(deltaTime) {
        // Don't spawn bubbles if game hasn't started yet
        if (!this.gameStarted) {
            return;
        }

        this.lastSpawnTime += deltaTime;

        const currentBubbleCount = this.bubbleManager ? this.bubbleManager.getActiveCount() : 0;
        const targetBubbleCount = this.config.maxBubbles * 0.8; // Try to maintain 80% of max

        // Spawn more aggressively if we're below target
        let spawnDelay = this.nextSpawnDelay;
        if (currentBubbleCount < targetBubbleCount) {
            spawnDelay = spawnDelay * 0.3; // Much faster spawning when below target

            // At very high density levels (6x+), spawn even faster
            if (this.bubbleDensityMultiplier >= 3.0) {
                spawnDelay = spawnDelay * 0.5; // Even faster for high density
            }
        }

        // Debug logging (temporary)
        if (Math.floor(this.lastSpawnTime / 1000) !== Math.floor((this.lastSpawnTime - deltaTime) / 1000)) {
            console.log(`Spawn check: bubbles=${currentBubbleCount}/${this.config.maxBubbles}, target=${targetBubbleCount}, delay=${spawnDelay.toFixed(0)}ms, elapsed=${this.lastSpawnTime.toFixed(0)}ms`);
        }

        if (this.lastSpawnTime >= spawnDelay &&
            currentBubbleCount < this.config.maxBubbles) {

            console.log('Triggering spawn...');
            this.spawnBubble();
            this.lastSpawnTime = 0;
            this.nextSpawnDelay = this.getRandomSpawnDelay();
        }
    }

    /**
     * Get safe zones for spawning bubbles (avoiding ad areas)
     */
    getSafeSpawnZones() {
        const leftSafeZone = this.adZones.left.width + this.adZones.left.margin;
        const bottomSafeZone = this.adZones.bottom.height + this.adZones.bottom.margin;

        return {
            leftEdge: leftSafeZone,
            rightEdge: this.width, // No right ad zone, so full width available
            bottomEdge: this.height - bottomSafeZone,
            safeWidth: this.width - leftSafeZone // Only avoid left ad zone
        };
    }

    /**
     * Spawn a new bubble
     */
    spawnBubble() {
        try {
            // Spawn closer to screen edges to ensure bubbles enter view quickly
            const spawnDistance = 30; // Much closer to screen edge

            // Weighted spawn distribution: 80% bottom, 10% left, 10% right
            const randomValue = Math.random();
            let side;
            if (randomValue < 0.8) {
                side = 0; // bottom edge (80% chance)
            } else if (randomValue < 0.9) {
                side = 1; // left edge (10% chance)
            } else {
                side = 2; // right edge (10% chance)
            }

            const safeZones = this.getSafeSpawnZones();
            let x, y;

            switch (side) {
                case 0: // bottom edge - only in safe width area (avoiding left/right ads)
                    x = safeZones.leftEdge + Math.random() * safeZones.safeWidth;
                    y = this.height + spawnDistance;
                    break;
                case 1: // left edge - spawn from safe left position
                    x = -spawnDistance;
                    y = Math.random() * this.height;
                    break;
                case 2: // right edge - spawn from safe right position
                    x = this.width + spawnDistance;
                    y = Math.random() * this.height;
                    break;
                default:
                    console.error('Invalid spawn side:', side);
                    return;
            }

            // Create bubble with random size (large to extra large for better visibility)
            const sizeType = Math.random();
            let size;

            if (sizeType < 0.6) {
                // 60% chance: Regular large bubbles
                size = 60 + Math.random() * 80; // 60-140px diameter
            } else if (sizeType < 0.9) {
                // 30% chance: Extra large bubbles
                size = 120 + Math.random() * 100; // 120-220px diameter
            } else {
                // 10% chance: Giant bubbles
                size = 180 + Math.random() * 120; // 180-300px diameter
            }
            const lifetime = this.config.bubbleLifetime +
                            (Math.random() - 0.5) * this.config.bubbleLifetimeVariation;

            // Track spawn distribution (updated for 3 edges)
            const edgeNames = ['bottom', 'left', 'right'];
            if (edgeNames[side] && this.spawnStats) {
                // Update spawn stats structure to match new edges
                if (!this.spawnStats[edgeNames[side]]) {
                    this.spawnStats[edgeNames[side]] = 0;
                }
                this.spawnStats[edgeNames[side]]++;
            }

            // Debug spawn distribution
            console.log(`Spawning bubble from ${edgeNames[side]} edge at (${Math.round(x)}, ${Math.round(y)})`);

            if (this.bubbleManager) {
                const bubble = this.bubbleManager.createBubble(x, y, size, lifetime, this.themes[this.currentTheme]);

                // Set strong initial velocity to overcome physics and enter screen
                if (bubble) {
                    let vx = 0, vy = 0;
                    const baseSpeed = 0.8; // Much stronger initial speed
                    const randomSpeed = 0.3 + Math.random() * 0.4; // 0.3-0.7 variation

                    switch (side) {
                        case 0: // bottom edge - move upward into screen
                            vx = (Math.random() - 0.5) * 0.3; // Small horizontal drift
                            vy = -baseSpeed * randomSpeed; // Strong upward movement
                            bubble.spawnDirection = 'bottom';
                            bubble.spawnMomentumX = 0;
                            bubble.spawnMomentumY = -0.4; // Upward momentum
                            break;
                        case 1: // left edge - move rightward into screen
                            vx = baseSpeed * randomSpeed * 1.5; // Stronger rightward movement
                            vy = -0.2 - Math.random() * 0.3; // Also float upward
                            bubble.spawnDirection = 'left';
                            bubble.spawnMomentumX = 0.6; // Strong rightward momentum
                            bubble.spawnMomentumY = -0.2; // Gentle upward momentum
                            break;
                        case 2: // right edge - move leftward into screen
                            vx = -baseSpeed * randomSpeed * 1.5; // Stronger leftward movement
                            vy = -0.2 - Math.random() * 0.3; // Also float upward
                            bubble.spawnDirection = 'right';
                            bubble.spawnMomentumX = -0.6; // Strong leftward momentum
                            bubble.spawnMomentumY = -0.2; // Gentle upward momentum
                            break;
                    }

                    bubble.vx = vx;
                    bubble.vy = vy;

                    console.log(`${edgeNames[side]} bubble at (${Math.round(x)}, ${Math.round(y)}) with velocity (${vx.toFixed(2)}, ${vy.toFixed(2)})`);
                }
            } else {
                console.error('BubbleManager not available');
            }

        } catch (error) {
            console.error('Error in spawnBubble:', error);
        }
    }

    /**
     * Get random spawn delay
     */
    getRandomSpawnDelay() {
        return this.config.spawnRate +
               (Math.random() - 0.5) * this.config.spawnRateVariation;
    }

    /**
     * Spawn initial bubbles when game starts
     */
    spawnInitialBubbles() {
        console.log(`Spawning ${this.config.initialBubbleCount} initial bubbles`);
        const safeZones = this.getSafeSpawnZones();

        for (let i = 0; i < this.config.initialBubbleCount; i++) {
            // Spawn bubbles at random positions on screen in safe zones (avoiding ads)
            const padding = 100; // Keep some padding from edges
            const x = safeZones.leftEdge + padding + Math.random() * (safeZones.safeWidth - padding * 2);
            const y = padding + Math.random() * (this.height - padding * 2 - safeZones.bottomEdge);

            // Create bubble with random size
            const sizeType = Math.random();
            let size;

            if (sizeType < 0.6) {
                size = 60 + Math.random() * 80; // 60-140px diameter
            } else if (sizeType < 0.9) {
                size = 120 + Math.random() * 100; // 120-220px diameter
            } else {
                size = 180 + Math.random() * 120; // 180-300px diameter
            }

            const lifetime = this.config.bubbleLifetime +
                            (Math.random() - 0.5) * this.config.bubbleLifetimeVariation;

            const bubble = this.bubbleManager.createBubble(x, y, size, lifetime, this.themes[this.currentTheme]);

            // Set gentle random movement for initial bubbles
            if (bubble) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.1 + Math.random() * 0.15; // Slow movement
                bubble.vx = Math.cos(angle) * speed;
                bubble.vy = Math.sin(angle) * speed;
            }
        }
    }

    /**
     * Handle bubble interaction (popping)
     */
    handleBubbleInteraction(x, y) {
        const poppedBubble = this.bubbleManager.checkCollision(x, y);

        if (poppedBubble) {
            // Increment pop count for user-popped bubbles
            this.incrementPopCount();

            // Create pop effect
            if (this.particleSystem) {
                this.particleSystem.createPopEffect(poppedBubble.x, poppedBubble.y, poppedBubble.size);
            }

            // Play pop sound with theme-specific audio
            if (this.audioManager) {
                this.audioManager.playPopSound(poppedBubble.size, this.currentTheme);
            }

            // Remove bubble
            this.bubbleManager.popBubble(poppedBubble);

            // Instantly spawn a replacement bubble to maintain density
            this.spawnReplacementBubble();
        }
    }

    /**
     * Spawn a replacement bubble immediately when one is popped
     */
    spawnReplacementBubble() {
        // Only spawn if we're below max bubbles
        if (this.bubbleManager.getActiveCount() < this.config.maxBubbles) {
            this.spawnBubble();
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.setupCanvas();

        // Update physics engine bounds
        if (this.physicsEngine) {
            this.physicsEngine.updateBounds(this.width, this.height);
        }
    }

    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.pause();
        } else {
            this.resume();
        }
    }


    /**
     * Handle volume slider changes
     */
    handleVolumeChange(sliderValue) {
        // Convert slider value (0-10) to volume level (0.0-1.0)
        const volumeLevel = parseFloat(sliderValue) / 10;

        console.log(`Game handleVolumeChange: slider=${sliderValue}, volumeLevel=${volumeLevel.toFixed(2)}`);

        if (this.audioManager) {
            this.audioManager.setVolume(volumeLevel);

            // If volume is set to 0, ensure mute state is updated
            if (volumeLevel === 0) {
                this.audioManager.isMuted = true;
            } else if (this.audioManager.isMuted) {
                // If volume is raised from 0, unmute
                this.audioManager.isMuted = false;
            }

            // Test the volume change with a sound
            setTimeout(() => {
                if (this.audioManager && !this.audioManager.isMuted) {
                    console.log('Testing volume with a pop sound...');
                    this.audioManager.playPopSound(150, this.currentTheme);
                }
            }, 100);
        }

        // Update slider aria-valuenow for accessibility
        if (this.volumeSlider) {
            this.volumeSlider.setAttribute('aria-valuenow', sliderValue);
        }

        console.log(`Volume set to: ${volumeLevel.toFixed(1)} (${sliderValue}/10)`);
    }

    /**
     * Handle speed change
     */
    handleSpeedChange(sliderValue) {
        const speedLevel = parseInt(sliderValue);
        console.log(`Speed changed to: ${speedLevel}/10`);

        // Convert speed level (0-10) to multiplier
        // 0 = 0.1x (very slow), 5 = 1.0x (normal), 10 = 2.0x (very fast)
        if (speedLevel === 0) {
            this.bubbleSpeedMultiplier = 0.1;
        } else {
            this.bubbleSpeedMultiplier = 0.1 + (speedLevel * 0.19); // 0.1 to 2.0 range
        }

        // Update slider aria-valuenow for accessibility
        if (this.speedSlider) {
            this.speedSlider.setAttribute('aria-valuenow', sliderValue);
        }

        console.log(`Bubble speed multiplier: ${this.bubbleSpeedMultiplier.toFixed(2)}x`);
    }

    /**
     * Handle density change
     */
    handleDensityChange(sliderValue) {
        const densityLevel = parseInt(sliderValue);
        console.log(`Density changed to: ${densityLevel}/10`);

        // Convert density level (0-10) to multiplier
        // 0 = 0.2x (few bubbles), 5 = 1.0x (normal), 10 = 6.0x (screen full of bubbles!)
        if (densityLevel === 0) {
            this.bubbleDensityMultiplier = 0.2;
        } else if (densityLevel <= 5) {
            // Linear scaling from 0.2x to 1.0x for levels 1-5
            this.bubbleDensityMultiplier = 0.2 + (densityLevel * 0.16); // 0.2 to 1.0 range
        } else {
            // Exponential scaling for levels 6-10 to create dramatic increase
            const excessLevel = densityLevel - 5;
            this.bubbleDensityMultiplier = 1.0 + (excessLevel * 1.0); // 1.0 to 6.0 range
        }

        // Update the max bubbles configuration based on density
        const baseBubbles = 25; // Original max bubbles
        this.config.maxBubbles = Math.round(baseBubbles * this.bubbleDensityMultiplier);

        // Also update initial bubble count to help fill screen faster at high density
        const baseInitialBubbles = 8; // Original initial bubble count
        this.config.initialBubbleCount = Math.round(baseInitialBubbles * this.bubbleDensityMultiplier);

        // Update slider aria-valuenow for accessibility
        if (this.densitySlider) {
            this.densitySlider.setAttribute('aria-valuenow', sliderValue);
        }

        console.log(`Bubble density multiplier: ${this.bubbleDensityMultiplier.toFixed(2)}x (${this.config.maxBubbles} max bubbles, ${this.config.initialBubbleCount} initial)`);
    }


    /**
     * Update volume slider visual state
     */
    updateVolumeSliderState(isMuted) {
        if (this.volumeSlider) {
            this.volumeSlider.style.opacity = isMuted ? '0.5' : '1.0';
            this.volumeSlider.disabled = isMuted;
        }
    }

    /**
     * Toggle settings visibility on mobile
     */
    toggleSettings() {
        if (this.collapsibleSettings && this.settingsToggle) {
            const isVisible = this.collapsibleSettings.classList.contains('show');

            if (isVisible) {
                // Hide settings
                this.collapsibleSettings.classList.remove('show');
                this.settingsToggle.classList.remove('active');
                this.settingsToggle.setAttribute('aria-expanded', 'false');
            } else {
                // Show settings
                this.collapsibleSettings.classList.add('show');
                this.settingsToggle.classList.add('active');
                this.settingsToggle.setAttribute('aria-expanded', 'true');
            }
        }
    }

    /**
     * Handle theme change
     */
    handleThemeChange(themeName) {
        if (this.themes[themeName]) {
            console.log(`Switching to theme: ${this.themes[themeName].name}`);
            this.currentTheme = themeName;

            // Update all existing bubbles with the new theme
            if (this.bubbleManager && this.bubbleManager.bubbles) {
                this.bubbleManager.bubbles.forEach(bubble => {
                    if (bubble.active) {
                        bubble.theme = this.themes[themeName];
                    }
                });
            }
        }
    }

    /**
     * Initialize background system
     */
    initializeBackground() {
        const currentLayer = document.getElementById('currentBackground');
        if (currentLayer) {
            // Set the default gradient background
            currentLayer.className = 'background-layer current gradient';
            currentLayer.style.opacity = '1';
        }

        // Set initial scroll indicator color
        this.updateScrollIndicatorColor();
    }

    /**
     * Update scroll indicator color based on current background
     */
    updateScrollIndicatorColor() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            if (this.currentBackground === 'gradient') {
                scrollIndicator.classList.add('blue-text');
            } else {
                scrollIndicator.classList.remove('blue-text');
            }
        }
    }

    /**
     * Handle background change
     */
    handleBackgroundChange(backgroundName) {
        if (this.backgrounds[backgroundName] && !this.isTransitioning) {
            console.log(`Switching to background: ${this.backgrounds[backgroundName].name}`);
            this.isTransitioning = true;

            const currentLayer = document.getElementById('currentBackground');
            const nextLayer = document.getElementById('nextBackground');

            if (!currentLayer || !nextLayer) {
                console.error('Background layers not found');
                this.isTransitioning = false;
                return;
            }

            const background = this.backgrounds[backgroundName];

            // Toggle text color for dark backgrounds
            const body = document.body;
            if (backgroundName === 'galaxy' || backgroundName === 'aurora') {
                body.classList.add('dark-background');
            } else {
                body.classList.remove('dark-background');
            }

            // Set up the new background on the next layer
            if (background.type === 'gradient') {
                nextLayer.className = 'background-layer next gradient';
                nextLayer.style.backgroundImage = '';
            } else if (background.type === 'image') {
                nextLayer.className = 'background-layer next';
                nextLayer.style.backgroundImage = `url('${background.url}')`;
            }

            // Start the transition
            setTimeout(() => {
                nextLayer.style.opacity = '1';
                currentLayer.style.opacity = '0';
            }, 50);

            // Complete the transition - swap the layers
            setTimeout(() => {
                // Set up the current layer with new background first
                if (background.type === 'gradient') {
                    currentLayer.className = 'background-layer current gradient';
                    currentLayer.style.backgroundImage = '';
                } else {
                    currentLayer.className = 'background-layer current';
                    currentLayer.style.backgroundImage = `url('${background.url}')`;
                }
                currentLayer.style.opacity = '1';

                // Use requestAnimationFrame to ensure the current layer is rendered before clearing next
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        nextLayer.className = 'background-layer next';
                        nextLayer.style.backgroundImage = '';
                        nextLayer.style.opacity = '0';
                    });
                });

                this.currentBackground = backgroundName;
                this.isTransitioning = false;

                // Update scroll indicator color for better visibility
                this.updateScrollIndicatorColor();
            }, 1550); // Slightly longer than the CSS transition
        }
    }

    /**
     * Sync volume slider with audio manager current volume
     */
    syncVolumeSlider() {
        if (this.audioManager && this.volumeSlider) {
            const currentVolume = this.audioManager.getVolume();
            const sliderValue = Math.round(currentVolume * 10);
            this.volumeSlider.value = sliderValue;
            this.volumeSlider.setAttribute('aria-valuenow', sliderValue);

            // Update visual state based on mute status
            this.updateVolumeSliderState(this.audioManager.isMuted);

            console.log(`Volume slider synced to: ${sliderValue}/10 (${currentVolume.toFixed(1)})`);
        }
    }

    /**
     * Get current volume level (0-10)
     */
    getCurrentVolumeLevel() {
        if (this.audioManager) {
            return Math.round(this.audioManager.getVolume() * 10);
        }
        return 5; // Default middle value
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Show start screen
     */
    showStartScreen() {
        if (this.startScreen) {
            this.startScreen.classList.remove('hidden');
            this.startScreen.style.display = 'flex';
        }
    }

    /**
     * Hide start screen and begin the game
     */
    startGame() {
        console.log('Starting game...');

        // Hide start screen
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
            setTimeout(() => {
                this.startScreen.style.display = 'none';
            }, 500);
        }

        // Enable audio context if needed (user interaction requirement)
        if (this.audioManager && this.audioManager.audioContext &&
            this.audioManager.audioContext.state === 'suspended') {
            console.log('Activating audio context on game start');
            this.audioManager.forceActivateAudio();
        }

        // Mark game as started
        this.gameStarted = true;

        // Reset pop count for new session
        this.resetPopCount();

        // Sync volume slider with audio manager
        this.syncVolumeSlider();

        // Spawn initial bubbles immediately
        this.spawnInitialBubbles();

        // Start the game loop if not already running
        this.start();
    }

    /**
     * Reset pop count to zero
     */
    resetPopCount() {
        this.popCount = 0;
        this.updatePopCountDisplay();
    }

    /**
     * Increment pop count when user pops a bubble
     */
    incrementPopCount() {
        this.popCount++;
        this.updatePopCountDisplay();
        this.animateCounterUpdate();

        console.log(`Bubble popped! Total: ${this.popCount}`);
    }

    /**
     * Update the pop count display
     */
    updatePopCountDisplay() {
        if (this.popCountElement) {
            this.popCountElement.textContent = this.popCount;
        }
    }

    /**
     * Animate counter when updated
     */
    animateCounterUpdate() {
        if (this.popCountElement) {
            // Add animation class
            this.popCountElement.classList.add('updated');

            // Remove animation class after animation completes
            setTimeout(() => {
                this.popCountElement.classList.remove('updated');
            }, 300);
        }
    }

    /**
     * Get current pop count
     */
    getPopCount() {
        return this.popCount;
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error('Game Error:', message);

        if (this.loadingScreen) {
            const content = this.loadingScreen.querySelector('.loading-content p');
            if (content) {
                content.textContent = `Error: ${message}`;
            }
        }
    }

    /**
     * Render debug information
     */
    renderDebugInfo() {
        const fps = this.performanceMonitor.getCurrentFPS();
        const bubbleCount = this.bubbleManager.getActiveCount();

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 160);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`FPS: ${fps.toFixed(1)}`, 20, 30);
        this.ctx.fillText(`Bubbles: ${bubbleCount}/${this.config.maxBubbles}`, 20, 50);
        this.ctx.fillText(`Memory: ${this.getMemoryUsage()}MB`, 20, 70);
        this.ctx.fillText(`Target: ${Math.floor(this.config.maxBubbles * 0.8)}`, 20, 90);
        this.ctx.fillText(`Popped: ${this.popCount}`, 20, 110);

        // Show spawn distribution (updated for 3 edges)
        this.ctx.fillText(`Spawns:`, 20, 130);
        this.ctx.fillText(`B:${this.spawnStats.bottom} L:${this.spawnStats.left}`, 20, 145);
        this.ctx.fillText(`R:${this.spawnStats.right}`, 20, 160);
    }

    /**
     * Get estimated memory usage
     */
    getMemoryUsage() {
        if (performance.memory) {
            return (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
        }
        return 'N/A';
    }
}

/**
 * Bubble Class - Represents individual soap bubbles
 */
class Bubble {
    constructor(x, y, size, lifetime, theme = null) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = size / 2;
        this.lifetime = lifetime;
        this.age = 0;
        this.isAlive = true;

        // Physics properties - will be set by spawn function
        this.vx = 0;
        this.vy = 0;
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.02;

        // Spawn momentum - preserves initial direction for side-spawned bubbles
        this.spawnMomentumX = 0;
        this.spawnMomentumY = 0;
        this.spawnDirection = 'bottom'; // 'bottom', 'left', 'right'

        // Visual properties
        this.opacity = 1;
        this.theme = theme;
        this.hue = theme ? theme.colors.hueBase + (Math.random() - 0.5) * 60 : Math.random() * 360;
        this.hueSpeed = 0.5 + Math.random() * 1;

        // Theme-specific properties
        this.sparkleOffset = Math.random() * Math.PI * 2;
        this.shimmerPhase = Math.random() * Math.PI * 2;
        this.starPositions = theme && theme.stars ? this.generateStarPositions() : [];
    }

    /**
     * Generate star positions for galaxy theme
     */
    generateStarPositions() {
        const stars = [];
        const starCount = 3 + Math.floor(Math.random() * 4); // 3-6 stars

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: (Math.random() - 0.5) * this.radius * 1.6,
                y: (Math.random() - 0.5) * this.radius * 1.6,
                size: 0.5 + Math.random() * 1.5,
                twinkle: Math.random() * Math.PI * 2
            });
        }
        return stars;
    }

    /**
     * Update bubble state
     */
    update(deltaTime, physicsEngine, speedMultiplier = 1.0) {
        if (!this.isAlive) return;

        this.age += deltaTime;

        // Check if bubble should expire
        if (this.age >= this.lifetime) {
            this.isAlive = false;
            return;
        }

        // Update position with physics
        if (physicsEngine) {
            physicsEngine.updateBubble(this, deltaTime, speedMultiplier);
        } else {
            // Fallback physics with speed multiplier
            this.x += this.vx * speedMultiplier;
            this.y += this.vy * speedMultiplier;

            // Add wobble effect
            this.x += Math.sin(this.age * this.wobbleSpeed + this.wobbleOffset) * 0.2;
        }

        // Update visual properties
        this.hue += this.hueSpeed;
        if (this.hue > 360) this.hue -= 360;

        // Update theme-specific animations
        if (this.theme) {
            if (this.theme.shimmer) {
                this.shimmerPhase += 0.05; // Oil slick shimmer
            }
            if (this.theme.sparkle) {
                this.sparkleOffset += 0.08; // Crystal sparkle
            }
            if (this.theme.stars) {
                // Update star twinkle
                this.starPositions.forEach(star => {
                    star.twinkle += 0.06;
                });
            }
        }

        // Fade out near end of lifetime - much later and gentler
        const lifetimeRatio = this.age / this.lifetime;
        if (lifetimeRatio > 0.92) {
            // Only start fading in the last 8% of lifetime (was 20%)
            this.opacity = 1 - (lifetimeRatio - 0.92) / 0.08;
        }

        // Check bounds (remove if too far off screen)
        if (this.x < -100 || this.x > window.innerWidth + 100 ||
            this.y < -100 || this.y > window.innerHeight + 100) {
            this.isAlive = false;
        }
    }

    /**
     * Render the bubble with theme-specific effects
     */
    render(ctx) {
        if (!this.isAlive || this.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (this.theme) {
            this.renderThemedBubble(ctx);
        } else {
            this.renderClassicBubble(ctx);
        }

        ctx.restore();
    }

    /**
     * Render classic bubble (fallback)
     */
    renderClassicBubble(ctx) {
        // Main bubble body
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );

        // Create iridescent effect
        const hsl1 = `hsla(${this.hue}, 70%, 80%, 0.3)`;
        const hsl2 = `hsla(${(this.hue + 60) % 360}, 70%, 85%, 0.2)`;
        const hsl3 = `hsla(${(this.hue + 120) % 360}, 70%, 90%, 0.1)`;

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, hsl1);
        gradient.addColorStop(0.6, hsl2);
        gradient.addColorStop(1, hsl3);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Bubble highlight
        this.renderHighlight(ctx, 'rgba(255, 255, 255, 0.6)');

        // Bubble outline
        ctx.strokeStyle = `hsla(${this.hue}, 50%, 70%, 0.4)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * Render themed bubble
     */
    renderThemedBubble(ctx) {
        const theme = this.theme;
        const colors = theme.colors;

        // Main bubble body
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );

        // Theme-specific color generation
        let hsl1, hsl2, hsl3;

        if (theme.shimmer) {
            // Oil slick - dynamic shifting colors
            const shimmer = Math.sin(this.shimmerPhase) * 30;
            hsl1 = `hsla(${this.hue + shimmer}, ${colors.saturation}%, ${colors.lightness}%, ${colors.opacity})`;
            hsl2 = `hsla(${(this.hue + 60 + shimmer) % 360}, ${colors.saturation}%, ${colors.lightness + 5}%, ${colors.opacity * 0.7})`;
            hsl3 = `hsla(${(this.hue + 120 + shimmer) % 360}, ${colors.saturation}%, ${colors.lightness + 10}%, ${colors.opacity * 0.5})`;
        } else if (theme.sparkle) {
            // Crystal - clear with sparkles
            hsl1 = `hsla(${this.hue}, ${colors.saturation}%, ${colors.lightness}%, ${colors.opacity})`;
            hsl2 = `hsla(${(this.hue + 20) % 360}, ${colors.saturation}%, ${colors.lightness}%, ${colors.opacity * 0.6})`;
            hsl3 = `hsla(${(this.hue + 40) % 360}, ${colors.saturation}%, ${colors.lightness}%, ${colors.opacity * 0.3})`;
        } else if (theme.stars) {
            // Galaxy - deep space colors
            hsl1 = `hsla(${this.hue}, ${colors.saturation}%, ${colors.lightness}%, ${colors.opacity})`;
            hsl2 = `hsla(${(this.hue + 30) % 360}, ${colors.saturation}%, ${colors.lightness + 10}%, ${colors.opacity * 0.8})`;
            hsl3 = `hsla(${(this.hue + 60) % 360}, ${colors.saturation}%, ${colors.lightness + 20}%, ${colors.opacity * 0.6})`;
        } else {
            // Classic soap with theme colors
            hsl1 = `hsla(${this.hue}, ${colors.saturation}%, ${colors.lightness}%, ${colors.opacity})`;
            hsl2 = `hsla(${(this.hue + 60) % 360}, ${colors.saturation}%, ${colors.lightness + 5}%, ${colors.opacity * 0.7})`;
            hsl3 = `hsla(${(this.hue + 120) % 360}, ${colors.saturation}%, ${colors.lightness + 10}%, ${colors.opacity * 0.5})`;
        }

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, hsl1);
        gradient.addColorStop(0.6, hsl2);
        gradient.addColorStop(1, hsl3);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Theme-specific effects
        if (theme.stars) {
            this.renderStars(ctx);
        }

        if (theme.sparkle) {
            this.renderSparkles(ctx);
        }

        // Bubble highlight
        this.renderHighlight(ctx, theme.highlight);

        // Bubble outline (if enabled)
        if (theme.outline) {
            ctx.strokeStyle = `hsla(${this.hue}, 50%, 70%, 0.4)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    /**
     * Render highlight effect
     */
    renderHighlight(ctx, color) {
        const highlightGradient = ctx.createRadialGradient(
            this.x - this.radius * 0.4, this.y - this.radius * 0.4, 0,
            this.x - this.radius * 0.4, this.y - this.radius * 0.4, this.radius * 0.6
        );
        highlightGradient.addColorStop(0, color);
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.4, this.y - this.radius * 0.4, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render stars for galaxy theme
     */
    renderStars(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.starPositions.forEach(star => {
            const twinkle = Math.sin(star.twinkle) * 0.3 + 0.7;
            const starX = this.x + star.x;
            const starY = this.y + star.y;

            ctx.save();
            ctx.globalAlpha = twinkle;
            ctx.beginPath();
            ctx.arc(starX, starY, star.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    /**
     * Render sparkles for crystal theme
     */
    renderSparkles(ctx) {
        const sparkleCount = 6;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        for (let i = 0; i < sparkleCount; i++) {
            const angle = (i / sparkleCount) * Math.PI * 2 + this.sparkleOffset;
            const distance = this.radius * 0.7;
            const sparkleX = this.x + Math.cos(angle) * distance;
            const sparkleY = this.y + Math.sin(angle) * distance;
            const sparkleSize = 1 + Math.sin(this.sparkleOffset * 2 + i) * 0.5;

            ctx.save();
            ctx.globalAlpha = Math.abs(Math.sin(this.sparkleOffset + i));
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    /**
     * Check if point collides with bubble
     */
    contains(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }
}

/**
 * Bubble Manager - Handles bubble lifecycle and object pooling
 */
class BubbleManager {
    constructor(ctx, maxBubbles) {
        this.ctx = ctx;
        this.maxBubbles = maxBubbles;
        this.bubbles = [];
        this.bubblePool = [];
        this.activeCount = 0;
    }

    /**
     * Create a new bubble
     */
    createBubble(x, y, size, lifetime, theme = null) {
        let bubble;

        // Use pooled bubble if available
        if (this.bubblePool.length > 0) {
            bubble = this.bubblePool.pop();
            this.resetBubble(bubble, x, y, size, lifetime, theme);
        } else {
            bubble = new Bubble(x, y, size, lifetime, theme);
        }

        this.bubbles.push(bubble);
        this.activeCount++;
        return bubble;
    }

    /**
     * Reset a pooled bubble
     */
    resetBubble(bubble, x, y, size, lifetime, theme = null) {
        bubble.x = x;
        bubble.y = y;
        bubble.size = size;
        bubble.radius = size / 2;
        bubble.lifetime = lifetime;
        bubble.age = 0;
        bubble.isAlive = true;
        bubble.opacity = 1;
        bubble.theme = theme;

        // Initialize with zero velocity - will be set by spawn function
        bubble.vx = 0;
        bubble.vy = 0;
        bubble.wobbleOffset = Math.random() * Math.PI * 2;
        bubble.hue = theme ? theme.colors.hueBase + (Math.random() - 0.5) * 60 : Math.random() * 360;

        // Reset theme-specific properties
        bubble.sparkleOffset = Math.random() * Math.PI * 2;
        bubble.shimmerPhase = Math.random() * Math.PI * 2;
        bubble.starPositions = theme && theme.stars ? bubble.generateStarPositions() : [];
    }

    /**
     * Update all bubbles
     */
    update(deltaTime, physicsEngine, speedMultiplier = 1.0) {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            bubble.update(deltaTime, physicsEngine, speedMultiplier);

            // Remove dead bubbles
            if (!bubble.isAlive) {
                this.removeBubble(i);
            }
        }
    }

    /**
     * Render all bubbles
     */
    render() {
        // Sort bubbles by size for proper depth rendering
        this.bubbles.sort((a, b) => b.size - a.size);

        for (const bubble of this.bubbles) {
            bubble.render(this.ctx);
        }
    }

    /**
     * Check collision with point
     */
    checkCollision(x, y) {
        for (const bubble of this.bubbles) {
            if (bubble.isAlive && bubble.contains(x, y)) {
                return bubble;
            }
        }
        return null;
    }

    /**
     * Pop a bubble
     */
    popBubble(bubble) {
        bubble.isAlive = false;
    }

    /**
     * Remove bubble and return to pool
     */
    removeBubble(index) {
        const bubble = this.bubbles.splice(index, 1)[0];
        this.bubblePool.push(bubble);
        this.activeCount--;
    }

    /**
     * Get active bubble count
     */
    getActiveCount() {
        return this.activeCount;
    }
}

/**
 * Input Handler - Manages mouse and touch interactions
 */
class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        this.onBubbleHover = null;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.touchActive = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events (only for non-touch devices)
        if (!this.isTouchDevice) {
            this.canvas.addEventListener('mousemove', (e) => {
                this.updateMousePosition(e);
            }, { passive: true });
        }

        // Touch events for mobile - only trigger on actual touch
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                this.touchActive = true;
                this.updateTouchPosition(e.touches[0]);
                // Immediately check for bubble interaction on touch
                if (this.onBubbleHover) {
                    this.onBubbleHover(this.mouseX, this.mouseY);
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchActive = false;
            // Clear position to prevent persistent hover
            this.mouseX = -1000;
            this.mouseY = -1000;
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0 && this.touchActive) {
                this.updateTouchPosition(e.touches[0]);
                // Check for bubble interaction during touch move
                if (this.onBubbleHover) {
                    this.onBubbleHover(this.mouseX, this.mouseY);
                }
            }
        }, { passive: false });
    }

    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    updateTouchPosition(touch) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = touch.clientX - rect.left;
        this.mouseY = touch.clientY - rect.top;
    }

    update() {
        // Trigger hover check for bubble popping (only on desktop, not touch devices)
        if (this.onBubbleHover && !this.isTouchDevice) {
            this.onBubbleHover(this.mouseX, this.mouseY);
        }
    }
}

/**
 * Performance Monitor - Tracks FPS and performance metrics
 */
class PerformanceMonitor {
    constructor(targetFPS) {
        this.targetFPS = targetFPS;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
        this.frameStartTime = 0;
        this.debugMode = false;

        // Performance tracking
        this.frameTimes = [];
        this.maxFrameTimeHistory = 60;
    }

    frameStart() {
        this.frameStartTime = performance.now();
    }

    frameEnd() {
        const frameTime = performance.now() - this.frameStartTime;
        this.frameTimes.push(frameTime);

        if (this.frameTimes.length > this.maxFrameTimeHistory) {
            this.frameTimes.shift();
        }

        this.frameCount++;
    }

    update() {
        const now = performance.now();

        if (now - this.lastFPSUpdate >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = now;

            // Check performance and adjust quality if needed
            this.checkPerformance();
        }
    }

    checkPerformance() {
        if (this.currentFPS < this.targetFPS * 0.8) {
            console.warn(`Low FPS detected: ${this.currentFPS}. Consider reducing quality.`);
        }
    }

    getCurrentFPS() {
        return this.currentFPS;
    }

    getAverageFrameTime() {
        if (this.frameTimes.length === 0) return 0;
        return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
    }
}