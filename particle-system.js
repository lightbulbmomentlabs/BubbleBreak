/**
 * Particle System for Soap Bubbles
 * Handles bubble pop effects and water droplet animations
 * Creates realistic burst effects with scattered particles
 */

class ParticleSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 200; // Total particle limit for performance
        this.activeParticles = 0;

        // Effect configuration
        this.config = {
            baseParticleCount: 8, // Base number of particles per pop
            maxParticleCount: 20, // Max particles for large bubbles
            particleLifetime: 1000, // 1 second lifetime in ms
            gravity: 0.3, // Downward acceleration
            airResistance: 0.98, // Drag coefficient
            minSize: 1, // Minimum particle size
            maxSize: 4, // Maximum particle size
            fadeOutDuration: 300, // Fade out in last 300ms
        };

        // Performance settings
        this.performanceMode = false;
        this.qualityLevel = 1.0; // 0.0 to 1.0 quality multiplier
    }

    /**
     * Create bubble pop effect with scattered particles
     */
    createPopEffect(x, y, bubbleSize) {
        // Calculate number of particles based on bubble size
        const sizeRatio = Math.max(0.5, Math.min(3.0, bubbleSize / 150));
        const particleCount = Math.floor(
            this.config.baseParticleCount * sizeRatio * this.qualityLevel
        );

        // Limit total particles for performance
        const availableSlots = this.maxParticles - this.activeParticles;
        const actualCount = Math.min(particleCount, availableSlots);

        // Create burst pattern
        for (let i = 0; i < actualCount; i++) {
            this.createDropletParticle(x, y, bubbleSize, i, actualCount);
        }

        // Create central burst effect
        this.createBurstEffect(x, y, bubbleSize);
    }

    /**
     * Create individual water droplet particle
     */
    createDropletParticle(centerX, centerY, bubbleSize, index, totalParticles) {
        let particle;

        // Use pooled particle if available
        if (this.particlePool.length > 0) {
            particle = this.particlePool.pop();
            this.resetParticle(particle);
        } else {
            particle = this.createNewParticle();
        }

        // Position particle at bubble center
        particle.x = centerX;
        particle.y = centerY;

        // Calculate ejection angle for even distribution
        const angle = (Math.PI * 2 * index) / totalParticles + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 4; // Random speed 2-6 units
        const speedMultiplier = Math.sqrt(bubbleSize / 150); // Larger bubbles eject faster

        // Set initial velocity
        particle.vx = Math.cos(angle) * speed * speedMultiplier;
        particle.vy = Math.sin(angle) * speed * speedMultiplier - 1; // Slight upward bias

        // Particle properties based on bubble size
        const sizeFactor = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
        particle.size = (this.config.minSize +
                        (this.config.maxSize - this.config.minSize) * sizeFactor) *
                       Math.sqrt(bubbleSize / 150);

        // Visual properties
        particle.opacity = 0.8 + Math.random() * 0.2;
        particle.color = this.getDropletColor(bubbleSize);
        particle.lifetime = this.config.particleLifetime + (Math.random() - 0.5) * 200;

        // Add to active particles
        this.particles.push(particle);
        this.activeParticles++;
    }

    /**
     * Create central burst effect (expanding ring)
     */
    createBurstEffect(x, y, bubbleSize) {
        const burstParticle = this.getPooledParticle();
        if (!burstParticle) return;

        burstParticle.x = x;
        burstParticle.y = y;
        burstParticle.type = 'burst';
        burstParticle.size = bubbleSize * 0.1; // Start small
        burstParticle.maxSize = bubbleSize * 1.3; // Expand to larger than original bubble
        burstParticle.opacity = 0.4;
        burstParticle.lifetime = 200; // Short burst animation
        burstParticle.age = 0;
        burstParticle.color = 'rgba(200, 230, 255, 0.3)';

        this.particles.push(burstParticle);
        this.activeParticles++;
    }

    /**
     * Create new particle object
     */
    createNewParticle() {
        return {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            size: 1,
            opacity: 1,
            color: '#87CEEB',
            lifetime: 1000,
            age: 0,
            isAlive: true,
            type: 'droplet',
            rotation: 0,
            rotationSpeed: 0
        };
    }

    /**
     * Reset particle for reuse
     */
    resetParticle(particle) {
        particle.age = 0;
        particle.isAlive = true;
        particle.type = 'droplet';
        particle.rotation = 0;
        particle.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    /**
     * Get pooled particle or create new one
     */
    getPooledParticle() {
        if (this.particlePool.length > 0) {
            const particle = this.particlePool.pop();
            this.resetParticle(particle);
            return particle;
        } else if (this.activeParticles < this.maxParticles) {
            return this.createNewParticle();
        }
        return null; // No available particles
    }

    /**
     * Get appropriate color for water droplet
     */
    getDropletColor(bubbleSize) {
        // Vary color slightly based on size and randomness
        const hue = 200 + Math.random() * 40; // Blue-ish tones
        const saturation = 40 + Math.random() * 30;
        const lightness = 70 + Math.random() * 20;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    /**
     * Update all particles
     */
    update(deltaTime) {
        const dt = deltaTime / 16.67; // Normalize to 60fps

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            if (!particle.isAlive) {
                this.removeParticle(i);
                continue;
            }

            this.updateParticle(particle, dt);

            // Check if particle should be removed
            if (particle.age >= particle.lifetime || particle.opacity <= 0) {
                this.removeParticle(i);
            }
        }
    }

    /**
     * Update individual particle
     */
    updateParticle(particle, dt) {
        particle.age += dt * 16.67; // Convert back to milliseconds

        if (particle.type === 'burst') {
            this.updateBurstParticle(particle, dt);
        } else {
            this.updateDropletParticle(particle, dt);
        }

        // Update opacity for fade out
        this.updateParticleOpacity(particle);
    }

    /**
     * Update water droplet particle
     */
    updateDropletParticle(particle, dt) {
        // Apply gravity
        particle.vy += this.config.gravity * dt;

        // Apply air resistance
        particle.vx *= Math.pow(this.config.airResistance, dt);
        particle.vy *= Math.pow(this.config.airResistance, dt);

        // Update position
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;

        // Update rotation
        particle.rotation += particle.rotationSpeed * dt;

        // Add slight size variation over time
        const ageRatio = particle.age / particle.lifetime;
        if (ageRatio < 0.3) {
            // Slight expansion early in life
            particle.size *= 1 + 0.01 * dt;
        } else {
            // Slight shrinking as it evaporates
            particle.size *= 1 - 0.005 * dt;
        }

        // Remove if too small or off screen
        if (particle.size < 0.5 ||
            particle.x < -50 || particle.x > window.innerWidth + 50 ||
            particle.y > window.innerHeight + 100) {
            particle.isAlive = false;
        }
    }

    /**
     * Update burst effect particle
     */
    updateBurstParticle(particle, dt) {
        const progress = particle.age / particle.lifetime;

        // Expand the burst ring
        particle.size = particle.maxSize * progress;

        // Fade opacity
        particle.opacity = 0.4 * (1 - progress);

        if (progress >= 1) {
            particle.isAlive = false;
        }
    }

    /**
     * Update particle opacity for fade effects
     */
    updateParticleOpacity(particle) {
        const ageRatio = particle.age / particle.lifetime;

        if (particle.type === 'droplet') {
            // Start fade out in the last portion of lifetime
            const fadeStart = 1 - (this.config.fadeOutDuration / particle.lifetime);

            if (ageRatio > fadeStart) {
                const fadeProgress = (ageRatio - fadeStart) / (1 - fadeStart);
                particle.opacity *= (1 - fadeProgress);
            }
        }
    }

    /**
     * Render all particles
     */
    render() {
        if (this.particles.length === 0) return;

        this.ctx.save();

        // Sort particles by type for proper rendering order
        const droplets = this.particles.filter(p => p.type === 'droplet');
        const bursts = this.particles.filter(p => p.type === 'burst');

        // Render bursts first (behind droplets)
        for (const particle of bursts) {
            this.renderBurstParticle(particle);
        }

        // Render droplets
        for (const particle of droplets) {
            this.renderDropletParticle(particle);
        }

        this.ctx.restore();
    }

    /**
     * Render water droplet particle
     */
    renderDropletParticle(particle) {
        if (particle.opacity <= 0 || particle.size <= 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity;

        // Create gradient for realistic water droplet
        const gradient = this.ctx.createRadialGradient(
            particle.x - particle.size * 0.3,
            particle.y - particle.size * 0.3,
            0,
            particle.x,
            particle.y,
            particle.size
        );

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // Bright center
        gradient.addColorStop(0.7, particle.color);
        gradient.addColorStop(1, 'rgba(135, 206, 235, 0.3)'); // Transparent edge

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Add subtle highlight
        if (particle.size > 1.5 && !this.performanceMode) {
            const highlightSize = particle.size * 0.4;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(
                particle.x - particle.size * 0.3,
                particle.y - particle.size * 0.3,
                highlightSize,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    /**
     * Render burst effect particle
     */
    renderBurstParticle(particle) {
        if (particle.opacity <= 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity;

        // Draw expanding ring
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.stroke();

        // Add inner glow effect
        if (!this.performanceMode && particle.size > 10) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 0.8, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    /**
     * Remove particle and return to pool
     */
    removeParticle(index) {
        const particle = this.particles.splice(index, 1)[0];
        if (particle) {
            this.particlePool.push(particle);
            this.activeParticles--;
        }
    }

    /**
     * Clear all particles
     */
    clearAll() {
        // Move all active particles back to pool
        for (const particle of this.particles) {
            this.particlePool.push(particle);
        }
        this.particles = [];
        this.activeParticles = 0;
    }

    /**
     * Enable performance mode
     */
    enablePerformanceMode(enabled = true) {
        this.performanceMode = enabled;

        if (enabled) {
            this.maxParticles = 100;
            this.qualityLevel = 0.7;
            this.config.baseParticleCount = 6;
            this.config.maxParticleCount = 12;
        } else {
            this.maxParticles = 200;
            this.qualityLevel = 1.0;
            this.config.baseParticleCount = 8;
            this.config.maxParticleCount = 20;
        }
    }

    /**
     * Set quality level (0.0 to 1.0)
     */
    setQualityLevel(level) {
        this.qualityLevel = Math.max(0.1, Math.min(1.0, level));
    }

    /**
     * Get particle system stats
     */
    getStats() {
        return {
            activeParticles: this.activeParticles,
            pooledParticles: this.particlePool.length,
            maxParticles: this.maxParticles,
            qualityLevel: this.qualityLevel,
            performanceMode: this.performanceMode
        };
    }

    /**
     * Create splash effect (for future enhancement)
     */
    createSplashEffect(x, y, intensity = 1.0) {
        // Could be used for special effects or when bubbles hit surfaces
        const particleCount = Math.floor(12 * intensity * this.qualityLevel);

        for (let i = 0; i < particleCount; i++) {
            const particle = this.getPooledParticle();
            if (!particle) break;

            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 3 + Math.random() * 2;

            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed - 2; // Upward bias
            particle.size = 1 + Math.random() * 2;
            particle.lifetime = 800 + Math.random() * 400;
            particle.color = this.getDropletColor(30);
            particle.opacity = 0.6 + Math.random() * 0.4;

            this.particles.push(particle);
            this.activeParticles++;
        }
    }

    /**
     * Dispose of particle system resources
     */
    dispose() {
        this.clearAll();
        this.particlePool = [];
        this.particles = [];
        this.activeParticles = 0;
    }
}