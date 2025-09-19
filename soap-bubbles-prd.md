# Soap Bubbles - Product Requirements Document

## Project Overview

### Vision
Create a simple, oddly satisfying web experience where users can interact with floating soap bubbles by popping them with their mouse. This is designed as a fidget-friendly digital toy that people can use during Zoom meetings or when they need a brief, calming distraction.

### Target Audience
- Remote workers looking for stress relief during video calls
- People seeking simple, satisfying digital fidget experiences
- Users who enjoy minimalist, zen-like web interactions

### Success Metrics
- High engagement time (2-5 minutes average session)
- Low bounce rate
- Repeat visitors
- Mobile and desktop compatibility
- Smooth 60fps performance across devices

## Core Features

### Primary Functionality
1. **Bubble Generation**
   - Bubbles continuously spawn from random positions off-screen
   - Varying sizes (small to medium, never too large)
   - Natural floating physics with gentle upward drift
   - Realistic wobble and movement patterns

2. **Bubble Appearance**
   - Iridescent soap bubble effect with realistic coloring
   - Semi-transparent with rainbow refractions
   - Subtle surface tension animation (gentle pulsing/wobbling)
   - Gradient opacity from center to edges

3. **Bubble Popping Interaction**
   - Mouse hover detection (no clicking required)
   - Smooth pop animation with surface tension burst effect
   - Particle spray effect when popped
   - Satisfying audio feedback (soft "pop" sound)

4. **Ambient Behavior**
   - Bubbles naturally pop after 8-12 seconds if not interacted with
   - Gentle floating movement with physics-based drift
   - Occasional gentle breeze effects that influence movement
   - Auto-fade for bubbles that float off-screen

### Audio System
- **Pop Sounds**: Procedurally generated using Web Audio API
- **Variations**: Slight pitch and tone variations based on bubble size
- **Volume**: Subtle, non-intrusive (won't interfere with video calls)
- **Toggle**: Audio on/off button for meeting-friendly use

### Visual Effects
- **Pop Animation**: Realistic bubble burst with surface tension snap
- **Particle Effects**: Small water droplets scatter when bubble pops
- **Iridescent Shader**: Rainbow color shifting on bubble surfaces
- **Smooth Transitions**: All animations at 60fps with proper easing

## Technical Requirements

### Technology Stack
- **Frontend**: HTML5 Canvas + Vanilla JavaScript
- **Graphics**: Canvas 2D Context (no WebGL)
- **Audio**: Web Audio API for procedural sound generation
- **Physics**: Custom lightweight physics engine
- **Performance**: Object pooling for particles and bubbles

### Performance Specifications
- **Frame Rate**: Maintain 60fps on devices with 4GB+ RAM
- **Particle Count**: Support 15-25 simultaneous bubbles
- **Loading Time**: Under 2 seconds on 3G connection
- **Memory Usage**: Under 50MB peak memory consumption
- **CPU Usage**: Low enough to run alongside video conferencing

### Browser Compatibility
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 7+)

## User Experience Design

### Layout
- **Full Screen Canvas**: Bubbles use entire viewport
- **Minimal UI**: Only essential controls visible
- **Responsive Design**: Adapts to all screen sizes
- **Clean Aesthetic**: Soft gradient background (sky blue to white)

### Interaction Model
- **Zero Learning Curve**: Immediate understanding through visual cues
- **Mouse-Only**: No keyboard required
- **Touch-Friendly**: Works on mobile devices
- **Passive Enjoyment**: Beautiful even without interaction

### Accessibility
- **Audio Toggle**: Clear on/off button for sound
- **Visual Indicators**: Subtle visual feedback for all interactions
- **Performance Scaling**: Reduce particle count on slower devices
- **Color Contrast**: Ensure UI elements meet WCAG guidelines

## Monetization Strategy

### Google AdSense Integration
- **Ad Placement**: Single banner ad at bottom of screen (728x90 or 320x50)
- **Non-Intrusive Design**: Fixed position that doesn't overlap bubble area
- **Minimal Visual Impact**: Styled to blend with overall aesthetic
- **Performance Consideration**: Async loading to prevent gameplay lag
- **Mobile Optimization**: Responsive ad units for different screen sizes

### Ad Implementation Requirements
- Load ads after core game is functional
- Implement proper ad refresh intervals (30+ seconds)
- Ensure ads don't interfere with Canvas rendering performance
- Include privacy-compliant cookie consent if required
- Fallback gracefully if ad blocking is detected

## Technical Implementation Details

### File Structure
```
index.html          # Main HTML structure
styles.css          # Minimal styling for UI elements
bubble-game.js      # Core game logic
physics-engine.js   # Bubble physics and movement
audio-manager.js    # Sound generation and management
particle-system.js  # Pop effects and particles
```

### Core Classes/Modules
1. **BubbleManager**: Handles bubble creation, lifecycle, and pooling
2. **PhysicsEngine**: Manages movement, collision detection, and natural behavior
3. **AudioManager**: Generates procedural pop sounds with variations
4. **ParticleSystem**: Creates and animates pop effects
5. **InputHandler**: Manages mouse/touch interactions
6. **PerformanceMonitor**: Tracks FPS and adjusts quality as needed

### Configuration Options
- Maximum bubble count (default: 20)
- Bubble spawn rate (default: 1 every 2-3 seconds)
- Audio volume level (default: 30%)
- Performance quality setting (auto-detected)

## Quality Assurance

### Testing Requirements
- **Performance Testing**: Maintain 60fps during peak usage
- **Device Testing**: Test on minimum spec devices (4GB RAM, integrated graphics)
- **Browser Testing**: Verify functionality across all supported browsers
- **Audio Testing**: Ensure Web Audio API works properly
- **Mobile Testing**: Touch interactions work smoothly

### Success Criteria
- Page loads in under 3 seconds
- Smooth bubble animations with no visible stuttering
- Audio plays without distortion or delay
- Mouse interactions feel responsive (< 16ms latency)
- No memory leaks during extended use (30+ minutes)

## Future Enhancement Opportunities
- Different bubble themes (soap, oil, water)
- Gentle background music options
- Bubble count customization
- Seasonal visual variations
- Social sharing of "zen moments"

## Development Timeline
- **Week 1**: Core bubble physics and rendering
- **Week 2**: Interaction system and pop animations
- **Week 3**: Audio implementation and polish
- **Week 4**: AdSense integration and optimization
- **Week 5**: Testing, bug fixes, and deployment

## Launch Checklist
- [ ] Core functionality working across all browsers
- [ ] Audio system properly implemented with toggle
- [ ] AdSense properly integrated and tested
- [ ] Performance optimization complete
- [ ] Mobile responsiveness verified
- [ ] Privacy policy updated for ads (if required)
- [ ] Analytics tracking implemented
- [ ] SEO meta tags and descriptions added