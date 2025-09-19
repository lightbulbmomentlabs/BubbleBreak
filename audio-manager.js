/**
 * Audio Manager for Soap Bubbles
 * Handles procedural sound generation using Web Audio API
 * Creates bubble pop sounds with variations based on bubble size
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isEnabled = true;
        this.isMuted = false;
        this.volume = 0.3; // 30% volume for meeting-friendly use
        this.isInitialized = false;

        // Audio buffers for different theme sounds
        this.bubblePopBuffers = {
            classic: null,
            oil: null,
            crystal: null,
            galaxy: null
        };
        this.isBufferLoaded = false;

        // Performance optimization
        this.maxSimultaneousSounds = 5; // Increased for audio file playback
        this.activeSounds = [];
        this.soundQueue = [];

        // Browser compatibility
        this.isWebAudioSupported = this.checkWebAudioSupport();
    }

    /**
     * Initialize the audio system
     */
    async init() {
        if (!this.isWebAudioSupported) {
            console.warn('Web Audio API not supported');
            this.isEnabled = false;
            return false;
        }

        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Load the bubble pop sound file
            await this.loadBubblePopSound();

            // Handle browser autoplay policy
            if (this.audioContext.state === 'suspended') {
                console.log('Audio context suspended. Will initialize on first user interaction.');
                this.setupUserInteractionHandler();
                // Set initial UI state to show audio is available but not yet activated
                this.setInitialUIState();
            } else {
                this.isInitialized = true;
                console.log('Audio system fully initialized and ready');
                this.updateAudioToggleUI();
            }

            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            this.isEnabled = false;
            return false;
        }
    }

    /**
     * Load bubble pop sound files for different themes
     */
    async loadBubblePopSound() {
        try {
            console.log('Loading bubble pop sounds...');

            // Define sound files for each theme
            const soundFiles = {
                classic: 'sfx/bubble-pop.wav',
                oil: 'sfx/bubble-pop-oil.wav',
                crystal: 'sfx/bubble-pop-crystal.wav',
                galaxy: 'sfx/bubble-pop-galaxy.wav'
            };

            // Load each sound file
            const loadPromises = Object.entries(soundFiles).map(async ([theme, filePath]) => {
                try {
                    const response = await fetch(filePath);
                    if (!response.ok) {
                        throw new Error(`Failed to load ${filePath}: ${response.status}`);
                    }

                    const arrayBuffer = await response.arrayBuffer();
                    this.bubblePopBuffers[theme] = await this.audioContext.decodeAudioData(arrayBuffer);
                    console.log(`Loaded sound for ${theme} theme`);
                } catch (error) {
                    console.error(`Failed to load sound for ${theme} theme:`, error);
                    // Fallback to classic sound if available
                    this.bubblePopBuffers[theme] = null;
                }
            });

            await Promise.all(loadPromises);
            this.isBufferLoaded = true;

            console.log('Bubble pop sounds loaded successfully');

        } catch (error) {
            console.error('Failed to load bubble pop sounds:', error);
            console.log('Falling back to procedural sound generation');
            this.isBufferLoaded = false;
        }
    }

    /**
     * Check if Web Audio API is supported
     */
    checkWebAudioSupport() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }

    /**
     * Setup handler for user interaction to resume audio context
     */
    setupUserInteractionHandler() {
        const resumeAudio = async (event) => {
            console.log('User interaction detected:', event.type);

            if (this.audioContext && this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                    this.isInitialized = true;
                    console.log('Audio context resumed after user interaction');

                    // Update UI to reflect audio is working
                    this.updateAudioToggleUI();

                    // Remove event listeners after successful activation
                    this.removeActivationListeners();
                } catch (error) {
                    console.error('Failed to resume audio context:', error);
                }
            } else if (this.audioContext && this.audioContext.state === 'running') {
                // Context is already running, just mark as initialized
                this.isInitialized = true;
                console.log('Audio context already running');
                this.updateAudioToggleUI();
                this.removeActivationListeners();
            }
        };

        // Store reference to remove listeners later
        this.resumeAudioHandler = resumeAudio;

        console.log('Setting up audio activation handlers - audio will start after first user interaction');

        // Add event listeners for user interaction
        document.addEventListener('click', resumeAudio);
        document.addEventListener('touchstart', resumeAudio);
        document.addEventListener('keydown', resumeAudio);
        document.addEventListener('mousemove', resumeAudio);

        // Also listen for canvas interactions specifically
        const canvas = document.getElementById('bubbleCanvas');
        if (canvas) {
            canvas.addEventListener('mousemove', resumeAudio);
            canvas.addEventListener('click', resumeAudio);
        }
    }

    /**
     * Remove activation event listeners
     */
    removeActivationListeners() {
        if (this.resumeAudioHandler) {
            document.removeEventListener('click', this.resumeAudioHandler);
            document.removeEventListener('touchstart', this.resumeAudioHandler);
            document.removeEventListener('keydown', this.resumeAudioHandler);
            document.removeEventListener('mousemove', this.resumeAudioHandler);

            const canvas = document.getElementById('bubbleCanvas');
            if (canvas) {
                canvas.removeEventListener('mousemove', this.resumeAudioHandler);
                canvas.removeEventListener('click', this.resumeAudioHandler);
            }

            this.resumeAudioHandler = null;
            console.log('Audio activation listeners removed');
        }
    }

    /**
     * Update audio toggle UI to reflect current state
     */
    updateAudioToggleUI() {
        const audioToggle = document.getElementById('audioToggle');
        if (audioToggle) {
            audioToggle.classList.remove('muted');
            const srText = audioToggle.querySelector('.sr-only');
            if (srText) {
                srText.textContent = 'Sound: ON';
            }
        }
    }

    /**
     * Set initial UI state when audio context is suspended
     */
    setInitialUIState() {
        const audioToggle = document.getElementById('audioToggle');
        if (audioToggle) {
            // Don't show muted state initially - show as ready to activate
            audioToggle.classList.remove('muted');
            const srText = audioToggle.querySelector('.sr-only');
            if (srText) {
                srText.textContent = 'Sound: Click to activate';
            }
        }
    }

    /**
     * Play bubble pop sound with variations based on bubble size and theme
     */
    playPopSound(bubbleSize, theme = 'classic') {
        // Minimal debug logging (uncomment for debugging)
        // console.log('playPopSound called:', { bubbleSize, theme, isBufferLoaded: this.isBufferLoaded });

        if (!this.isEnabled || this.isMuted || !this.audioContext || !this.isInitialized) {
            return;
        }

        if (this.audioContext.state === 'suspended') {
            return;
        }

        // Limit simultaneous sounds for performance
        if (this.activeSounds.length >= this.maxSimultaneousSounds) {
            this.soundQueue.push({ bubbleSize, theme, timestamp: Date.now() });
            this.processQueuedSounds();
            return;
        }

        // Use loaded audio file if available, otherwise fall back to procedural generation
        if (this.isBufferLoaded && this.bubblePopBuffers[theme]) {
            this.playAudioFile(bubbleSize, theme);
        } else if (this.isBufferLoaded && this.bubblePopBuffers.classic) {
            // Fallback to classic theme if requested theme is not available
            this.playAudioFile(bubbleSize, 'classic');
        } else {
            this.createPopSound(bubbleSize);
        }
    }

    /**
     * Play the loaded audio file with variations based on bubble size and theme
     */
    playAudioFile(bubbleSize, theme = 'classic') {
        try {
            const soundId = Date.now() + Math.random();

            // Create audio source
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            // Connect nodes - use theme-specific buffer
            source.buffer = this.bubblePopBuffers[theme];
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Calculate variations based on bubble size
            const sizeRatio = Math.max(0.3, Math.min(3.0, bubbleSize / 150)); // Normalize size for new larger range

            // Vary playback rate for pitch variation (larger bubbles = lower pitch)
            const playbackRate = 0.8 + (1 - sizeRatio * 0.3); // Range: 0.8 to 1.4
            source.playbackRate.setValueAtTime(playbackRate, this.audioContext.currentTime);

            // Vary volume based on size (larger bubbles = slightly louder)
            const volumeVariation = 0.7 + (sizeRatio * 0.6); // Range: 0.7 to 1.3

            // Add slight random volume variation for variety
            const randomVariation = 0.8 + Math.random() * 0.4; // Range: 0.8 to 1.2

            // Calculate final volume with all variations
            const finalVolume = this.volume * volumeVariation * randomVariation;
            gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime);

            // Debug logging for volume
            console.log(`Audio playback - Base volume: ${this.volume.toFixed(2)}, Final volume: ${finalVolume.toFixed(3)}, Size variation: ${volumeVariation.toFixed(2)}, Random: ${randomVariation.toFixed(2)}`);

            // Start playback
            const now = this.audioContext.currentTime;
            source.start(now);

            // Calculate duration based on playback rate
            const duration = this.bubblePopBuffer.duration / playbackRate;

            // Track active sound
            const sound = {
                id: soundId,
                source,
                gainNode,
                startTime: now,
                duration
            };

            this.activeSounds.push(sound);

            // Clean up when sound finishes
            source.onended = () => {
                this.cleanupSound(soundId);
            };

            // console.log(`Playing bubble pop (size: ${bubbleSize.toFixed(1)}, rate: ${playbackRate.toFixed(2)}, volume: ${(finalVolume * randomVariation).toFixed(2)})`);

        } catch (error) {
            console.error('Error playing audio file:', error);
            // Fall back to procedural sound
            this.createPopSound(bubbleSize);
        }
    }

    /**
     * Create and play a procedural pop sound
     */
    createPopSound(bubbleSize) {
        try {
            const soundId = Date.now() + Math.random();

            // Calculate sound parameters based on bubble size
            const sizeRatio = Math.max(0.3, Math.min(3.0, bubbleSize / 150)); // Normalize size (150px = 1.0)

            // Frequency varies with size - larger bubbles = lower pitch
            const frequency = this.baseFrequency + (this.frequencyRange * (1 - sizeRatio * 0.5));

            // Duration varies with size
            const duration = 0.08 + (sizeRatio * 0.04); // 80-120ms

            // Create sound components
            const sound = this.synthesizePopSound(frequency, duration, sizeRatio, soundId);

            this.activeSounds.push(sound);

            // Clean up after sound finishes
            setTimeout(() => {
                this.cleanupSound(soundId);
            }, duration * 1000 + 100);

        } catch (error) {
            console.error('Error creating pop sound:', error);
        }
    }

    /**
     * Synthesize a bubble pop sound using Web Audio API
     */
    synthesizePopSound(frequency, duration, sizeRatio, soundId) {
        // Create oscillator for the main pop tone
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();

        // Connect audio nodes
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Configure oscillator
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Add frequency sweep for realistic pop effect
        const sweepDuration = duration * 0.3;
        oscillator.frequency.exponentialRampToValueAtTime(
            frequency * 0.6,
            this.audioContext.currentTime + sweepDuration
        );

        // Configure filter for bubble-like timbre
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(frequency * 3, this.audioContext.currentTime);
        filterNode.Q.setValueAtTime(2 + sizeRatio, this.audioContext.currentTime);

        // Create envelope for natural pop sound
        const attackTime = 0.005; // Quick attack
        const decayTime = duration * 0.7;
        const sustainLevel = 0.3;
        const releaseTime = duration * 0.3;

        const now = this.audioContext.currentTime;
        const peakVolume = this.volume * (0.5 + sizeRatio * 0.3);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(peakVolume, now + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(sustainLevel * peakVolume, now + attackTime + decayTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Add subtle harmonics for richness
        const harmonic = this.createHarmonic(frequency * 2, duration * 0.5, peakVolume * 0.3);

        // Start the sound
        oscillator.start(now);
        oscillator.stop(now + duration);

        if (harmonic) {
            harmonic.start(now + attackTime);
            harmonic.stop(now + duration);
        }

        return {
            id: soundId,
            oscillator,
            gainNode,
            filterNode,
            harmonic,
            startTime: now,
            duration
        };
    }

    /**
     * Create harmonic component for richer sound
     */
    createHarmonic(frequency, duration, volume) {
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

            return oscillator;
        } catch (error) {
            console.error('Error creating harmonic:', error);
            return null;
        }
    }

    /**
     * Process queued sounds when slots become available
     */
    processQueuedSounds() {
        // Remove old queued sounds (older than 100ms)
        const now = Date.now();
        this.soundQueue = this.soundQueue.filter(sound => now - sound.timestamp < 100);

        // Play next sound if there's room
        if (this.soundQueue.length > 0 && this.activeSounds.length < this.maxSimultaneousSounds) {
            const nextSound = this.soundQueue.shift();

            // Use theme-aware playback
            if (this.isBufferLoaded && this.bubblePopBuffers[nextSound.theme || 'classic']) {
                this.playAudioFile(nextSound.bubbleSize, nextSound.theme || 'classic');
            } else {
                this.createPopSound(nextSound.bubbleSize);
            }
        }
    }

    /**
     * Clean up finished sounds
     */
    cleanupSound(soundId) {
        this.activeSounds = this.activeSounds.filter(sound => sound.id !== soundId);
        this.processQueuedSounds();
    }

    /**
     * Toggle audio mute state
     */
    toggleMute() {
        // If audio context is suspended, try to resume it first
        if (this.audioContext && this.audioContext.state === 'suspended' && !this.isMuted) {
            console.log('Attempting to resume audio context via toggle');
            this.audioContext.resume().then(() => {
                this.isInitialized = true;
                console.log('Audio context resumed via toggle');
                this.removeActivationListeners();
            }).catch(error => {
                console.error('Failed to resume audio context via toggle:', error);
            });
        }

        this.isMuted = !this.isMuted;

        if (this.isMuted) {
            // Stop all active sounds
            this.stopAllSounds();
        }

        return !this.isMuted; // Return enabled state
    }

    /**
     * Set volume level
     */
    setVolume(volume) {
        const oldVolume = this.volume;
        this.volume = Math.max(0, Math.min(1, volume));
        console.log(`AudioManager volume changed: ${oldVolume.toFixed(2)} → ${this.volume.toFixed(2)}`);
    }

    /**
     * Get current volume
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Check if audio is enabled
     */
    isAudioEnabled() {
        return this.isEnabled && !this.isMuted;
    }

    /**
     * Stop all active sounds
     */
    stopAllSounds() {
        this.activeSounds.forEach(sound => {
            try {
                if (sound.oscillator) {
                    sound.oscillator.stop();
                }
                if (sound.harmonic) {
                    sound.harmonic.stop();
                }
            } catch (error) {
                // Ignore errors when stopping already-stopped oscillators
            }
        });

        this.activeSounds = [];
        this.soundQueue = [];
    }

    /**
     * Create a test sound for audio verification
     */
    playTestSound() {
        console.log('playTestSound called');
        console.log('Audio status:', this.getStatus());

        if (!this.isEnabled) {
            console.log('Audio not enabled');
            return;
        }

        if (!this.isInitialized) {
            console.log('Audio not initialized - trying to resume context...');
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('Audio context resumed, trying test sound again');
                    this.isInitialized = true;
                    this.playPopSound(100, 'classic');
                }).catch(error => {
                    console.error('Failed to resume audio context:', error);
                });
                return;
            }
        }

        // Play a medium-sized bubble pop sound
        this.playPopSound(100, 'classic');
        console.log('Test sound played - using', this.isBufferLoaded ? 'loaded audio file' : 'procedural generation');
    }

    /**
     * Force audio context activation (for debugging)
     */
    forceActivateAudio() {
        console.log('Forcing audio activation...');
        if (this.audioContext && this.audioContext.state === 'suspended') {
            return this.audioContext.resume().then(() => {
                this.isInitialized = true;
                console.log('Audio context force-activated');
                this.playTestSound();
            });
        } else {
            console.log('Audio context already active');
            this.playTestSound();
        }
    }

    /**
     * Get audio system status
     */
    getStatus() {
        return {
            isSupported: this.isWebAudioSupported,
            isEnabled: this.isEnabled,
            isInitialized: this.isInitialized,
            isMuted: this.isMuted,
            volume: this.volume,
            activeSounds: this.activeSounds.length,
            queuedSounds: this.soundQueue.length,
            contextState: this.audioContext ? this.audioContext.state : 'none',
            isBufferLoaded: this.isBufferLoaded,
            audioFileUsed: this.isBufferLoaded ? 'bubble-pop.wav' : 'procedural'
        };
    }

    /**
     * Cleanup resources
     */
    dispose() {
        this.stopAllSounds();

        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (error) {
                console.error('Error closing audio context:', error);
            }
        }

        this.audioContext = null;
        this.isInitialized = false;
    }

    /**
     * Enable performance mode (reduce audio quality for better performance)
     */
    enablePerformanceMode(enabled = true) {
        if (enabled) {
            this.maxSimultaneousSounds = 2;
            this.soundVariations = 3;
        } else {
            this.maxSimultaneousSounds = 3;
            this.soundVariations = 5;
        }
    }

    /**
     * Create ambient background sound (for future enhancement)
     */
    createAmbientSound() {
        // Placeholder for potential ambient sound features
        // Could include gentle wind sounds or subtle background tones
    }

    /**
     * Adjust audio settings based on device capabilities
     */
    optimizeForDevice() {
        // Check if we're on a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // Reduce simultaneous sounds on mobile for performance
            this.maxSimultaneousSounds = 2;
            this.volume *= 0.8; // Slightly lower volume on mobile
        }

        // Check for low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
            this.enablePerformanceMode(true);
        }
    }
}