/**
 * Physics Engine for Soap Bubbles
 * Handles realistic bubble movement, floating behavior, and environmental effects
 */

class PhysicsEngine {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // Physics constants - reduced for slower, gentler movement
        this.gravity = -0.05; // Much gentler upward buoyancy
        this.airResistance = 0.995; // Less drag for smoother movement
        this.wobbleStrength = 0.1; // Reduced wobble
        this.breezeStrength = 0.2; // Gentler breeze

        // Environmental effects
        this.windForce = { x: 0, y: 0 };
        this.lastWindUpdate = 0;
        this.windUpdateInterval = 3000; // Update wind every 3 seconds
        this.targetWind = { x: 0, y: 0 };

        // Breeze zones (areas of varying wind)
        this.breezeZones = this.generateBreezeZones();

        // Performance optimization
        this.simplePhysics = false; // Switch to simpler physics if performance is low
    }

    /**
     * Update bubble physics
     */
    updateBubble(bubble, deltaTime) {
        const dt = Math.min(deltaTime / 16.67, 2); // Cap delta for stability (60fps = 16.67ms)

        // Update environmental forces
        this.updateEnvironmentalForces(deltaTime);

        // Check if bubble is in spawn grace period (first 2 seconds or until on-screen)
        const isInGracePeriod = this.isInSpawnGracePeriod(bubble);
        const graceFactor = isInGracePeriod ? 0.1 : 1.0; // Reduce physics forces by 90% during grace period

        // Apply physics forces (reduced during grace period)
        this.applyBuoyancy(bubble, dt, graceFactor);
        this.applyWobble(bubble, dt, graceFactor);
        this.applyBreeze(bubble, dt, graceFactor);
        this.applyAirResistance(bubble, dt);

        // Update position
        bubble.x += bubble.vx * dt;
        bubble.y += bubble.vy * dt;

        // Apply boundary conditions
        this.handleBoundaries(bubble);

        // Size-based physics adjustments
        this.applySizeEffects(bubble, dt);
    }

    /**
     * Check if bubble is in spawn grace period
     */
    isInSpawnGracePeriod(bubble) {
        const maxGraceTime = 2000; // 2 seconds maximum grace period
        const margin = 50; // Consider "on screen" if within 50px of visible area

        // End grace period if bubble has been alive for more than 2 seconds
        if (bubble.age > maxGraceTime) {
            return false;
        }

        // End grace period if bubble is clearly on screen
        const isOnScreen = bubble.x > -margin &&
                          bubble.x < this.width + margin &&
                          bubble.y > -margin &&
                          bubble.y < this.height + margin;

        return !isOnScreen;
    }

    /**
     * Apply upward buoyancy force
     */
    applyBuoyancy(bubble, dt, graceFactor = 1.0) {
        // Larger bubbles have more buoyancy
        const buoyancyForce = this.gravity * (1 + bubble.size / 100) * graceFactor;
        bubble.vy += buoyancyForce * dt;
    }

    /**
     * Apply natural wobble effect
     */
    applyWobble(bubble, dt, graceFactor = 1.0) {
        if (this.simplePhysics) return;

        // Create organic wobble pattern
        const wobbleX = Math.sin(bubble.age * bubble.wobbleSpeed + bubble.wobbleOffset) * this.wobbleStrength * graceFactor;
        const wobbleY = Math.cos(bubble.age * bubble.wobbleSpeed * 0.7 + bubble.wobbleOffset) * this.wobbleStrength * 0.5 * graceFactor;

        // Apply wobble as force, not direct position change - much gentler
        bubble.vx += wobbleX * 0.003 * dt;
        bubble.vy += wobbleY * 0.003 * dt;

        // Add subtle size-based wobble variation
        const sizeModifier = 0.5 + (bubble.size / 300); // Larger bubbles wobble more
        bubble.vx += wobbleX * 0.002 * sizeModifier * dt;
    }

    /**
     * Apply wind and breeze effects
     */
    applyBreeze(bubble, dt, graceFactor = 1.0) {
        // Global wind force - much gentler
        bubble.vx += this.windForce.x * 0.005 * dt * graceFactor;
        bubble.vy += this.windForce.y * 0.003 * dt * graceFactor;

        // Local breeze effects - reduced
        const localBreeze = this.getLocalBreeze(bubble.x, bubble.y);
        bubble.vx += localBreeze.x * 0.004 * dt * graceFactor;
        bubble.vy += localBreeze.y * 0.003 * dt * graceFactor;

        // Size affects wind resistance - larger bubbles are more affected
        const windResistance = 0.5 + (bubble.size / 300);
        bubble.vx += this.windForce.x * 0.003 * windResistance * dt * graceFactor;
    }

    /**
     * Apply air resistance
     */
    applyAirResistance(bubble, dt) {
        // Apply drag to velocity
        bubble.vx *= Math.pow(this.airResistance, dt);
        bubble.vy *= Math.pow(this.airResistance, dt);

        // Terminal velocity limits - much slower
        const maxSpeed = 0.8 + bubble.size / 200;
        const speed = Math.sqrt(bubble.vx * bubble.vx + bubble.vy * bubble.vy);

        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            bubble.vx *= scale;
            bubble.vy *= scale;
        }
    }

    /**
     * Apply size-based physics effects
     */
    applySizeEffects(bubble, dt) {
        // Larger bubbles have different physics properties
        const sizeRatio = bubble.size / 150; // Normalized size (150px is medium for new size range)

        // Larger bubbles move slower horizontally
        if (sizeRatio > 1) {
            bubble.vx *= Math.pow(0.95, dt);
        }

        // Smaller bubbles are more affected by wobble
        if (sizeRatio < 0.8) {
            const extraWobble = (0.8 - sizeRatio) * 0.1;
            bubble.vx += (Math.random() - 0.5) * extraWobble * dt;
        }
    }

    /**
     * Handle boundary conditions
     */
    handleBoundaries(bubble) {
        const margin = 50;

        // Soft boundaries - gently push bubbles back
        if (bubble.x < margin) {
            bubble.vx += (margin - bubble.x) * 0.001;
        } else if (bubble.x > this.width - margin) {
            bubble.vx -= (bubble.x - (this.width - margin)) * 0.001;
        }

        if (bubble.y < margin) {
            bubble.vy += (margin - bubble.y) * 0.001;
        }

        // Allow bubbles to float off the top naturally
        // They will be cleaned up by the bubble manager based on lifetime
    }

    /**
     * Update environmental forces (wind, etc.)
     */
    updateEnvironmentalForces(deltaTime) {
        this.lastWindUpdate += deltaTime;

        if (this.lastWindUpdate >= this.windUpdateInterval) {
            this.generateNewWindPattern();
            this.lastWindUpdate = 0;
        }

        // Smoothly interpolate to target wind
        const lerpSpeed = 0.02;
        this.windForce.x += (this.targetWind.x - this.windForce.x) * lerpSpeed;
        this.windForce.y += (this.targetWind.y - this.windForce.y) * lerpSpeed;
    }

    /**
     * Generate new wind pattern
     */
    generateNewWindPattern() {
        // Generate very gentle wind patterns
        const windStrength = 0.1 + Math.random() * 0.2; // 0.1 to 0.3 (much gentler)
        const windDirection = Math.random() * Math.PI * 2;

        this.targetWind.x = Math.cos(windDirection) * windStrength;
        this.targetWind.y = Math.sin(windDirection) * windStrength * 0.3; // Less vertical wind

        // Occasionally create slightly stronger gusts (but still gentle)
        if (Math.random() < 0.1) {
            this.targetWind.x *= 1.5;
            this.targetWind.y *= 1.2;
        }
    }

    /**
     * Generate breeze zones across the screen
     */
    generateBreezeZones() {
        const zones = [];
        const zoneCount = 4 + Math.floor(Math.random() * 3); // 4-6 zones

        for (let i = 0; i < zoneCount; i++) {
            zones.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 150 + Math.random() * 250, // Larger, gentler zones
                strength: 0.05 + Math.random() * 0.15, // Much gentler strength
                direction: Math.random() * Math.PI * 2,
                pulseSpeed: 0.0005 + Math.random() * 0.001, // Slower pulse
                phase: Math.random() * Math.PI * 2
            });
        }

        return zones;
    }

    /**
     * Get local breeze effect at position
     */
    getLocalBreeze(x, y) {
        let totalForce = { x: 0, y: 0 };
        let totalWeight = 0;

        for (const zone of this.breezeZones) {
            const dx = x - zone.x;
            const dy = y - zone.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < zone.radius) {
                // Calculate influence based on distance
                const influence = 1 - (distance / zone.radius);
                const weight = influence * influence; // Quadratic falloff

                // Add pulsing effect
                const pulse = 1 + Math.sin(Date.now() * zone.pulseSpeed + zone.phase) * 0.3;
                const strength = zone.strength * pulse * weight;

                // Calculate force direction
                const forceX = Math.cos(zone.direction) * strength;
                const forceY = Math.sin(zone.direction) * strength;

                totalForce.x += forceX * weight;
                totalForce.y += forceY * weight;
                totalWeight += weight;
            }
        }

        // Average the forces
        if (totalWeight > 0) {
            totalForce.x /= totalWeight;
            totalForce.y /= totalWeight;
        }

        return totalForce;
    }

    /**
     * Update bounds when window is resized
     */
    updateBounds(width, height) {
        this.width = width;
        this.height = height;

        // Regenerate breeze zones for new screen size
        this.breezeZones = this.generateBreezeZones();
    }

    /**
     * Enable simple physics mode for performance
     */
    enableSimplePhysics(enabled = true) {
        this.simplePhysics = enabled;

        if (enabled) {
            // Reduce physics complexity
            this.breezeZones = this.breezeZones.slice(0, 2); // Fewer breeze zones
            this.windUpdateInterval = 5000; // Less frequent wind updates
        }
    }

    /**
     * Get physics debug info
     */
    getDebugInfo() {
        return {
            windForce: this.windForce,
            breezeZoneCount: this.breezeZones.length,
            simplePhysics: this.simplePhysics,
            nextWindUpdate: this.windUpdateInterval - this.lastWindUpdate
        };
    }

    /**
     * Create turbulence effect (for special effects)
     */
    createTurbulence(x, y, radius, strength, duration = 2000) {
        const turbulence = {
            x, y, radius, strength,
            startTime: Date.now(),
            duration,
            active: true
        };

        // Add temporary turbulence zone
        const tempZone = {
            x, y,
            radius,
            strength: strength * 2,
            direction: Math.random() * Math.PI * 2,
            pulseSpeed: 0.01,
            phase: 0
        };

        this.breezeZones.push(tempZone);

        // Remove after duration
        setTimeout(() => {
            const index = this.breezeZones.indexOf(tempZone);
            if (index > -1) {
                this.breezeZones.splice(index, 1);
            }
        }, duration);
    }

    /**
     * Simulate bubble collision (for future enhancement)
     */
    checkBubbleCollision(bubble1, bubble2) {
        const dx = bubble1.x - bubble2.x;
        const dy = bubble1.y - bubble2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = bubble1.radius + bubble2.radius;

        return distance < minDistance;
    }

    /**
     * Handle bubble-to-bubble physics (for future enhancement)
     */
    resolveBubbleCollision(bubble1, bubble2) {
        const dx = bubble1.x - bubble2.x;
        const dy = bubble1.y - bubble2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = bubble1.radius + bubble2.radius;

        if (distance < minDistance && distance > 0) {
            // Calculate overlap
            const overlap = minDistance - distance;
            const separationX = (dx / distance) * overlap * 0.5;
            const separationY = (dy / distance) * overlap * 0.5;

            // Separate bubbles
            bubble1.x += separationX;
            bubble1.y += separationY;
            bubble2.x -= separationX;
            bubble2.y -= separationY;

            // Exchange some velocity (elastic collision)
            const vxDiff = bubble1.vx - bubble2.vx;
            const vyDiff = bubble1.vy - bubble2.vy;

            bubble1.vx -= vxDiff * 0.1;
            bubble1.vy -= vyDiff * 0.1;
            bubble2.vx += vxDiff * 0.1;
            bubble2.vy += vyDiff * 0.1;
        }
    }
}