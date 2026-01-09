# Physics-Based Text Animation Engine

## Overview

The Physics-Based Text Animation Engine is a real-time particle simulation system that applies realistic physics principles to text characters. Each character becomes an independent particle with its own velocity, mass, and physical properties, creating dynamic and engaging text animations.

## Features

### Core Physics Systems

#### 1. **Gravity**
- Simulates downward force on all particles
- Adjustable from 0 (weightless) to 2 (heavy gravity)
- Each particle responds based on its mass
- Creates natural falling motion

#### 2. **Elasticity (Bounce)**
- Controls how much energy particles retain after collision
- Range: 0 (no bounce) to 1 (perfect bounce)
- Applies to ground, wall, and particle collisions
- Higher values create more energetic, bouncy behavior

#### 3. **Damping (Air Resistance)**
- Simulates friction and air resistance
- Fine-tuned range: 0.900 to 1.000
- Values close to 1 maintain velocity longer
- Lower values slow particles quickly

#### 4. **Wind Force**
- Horizontal force applied continuously
- Range: -1 (left) to 1 (right)
- Creates drifting effects
- Can be combined with other forces

#### 5. **Turbulence**
- Random noise applied to particle motion
- Range: 0 (smooth) to 2 (chaotic)
- Creates unpredictable, organic movement
- Simulates turbulent air currents

#### 6. **Ground Friction**
- Horizontal damping when particles touch ground
- Range: 0.5 to 1.0
- Lower values = more sliding
- Helps particles come to rest naturally

### Force Systems

#### Repulsion Force
- Particles push away from each other
- Creates space between characters
- Effective within 200px radius
- Force decreases with distance (inverse square law)

#### Attraction Force
- Particles pull toward each other
- Creates clustering effects
- Magnetizes text into formations
- Builds cohesion between characters

#### Cursor Attraction
- Interactive force controlled by mouse position
- Draws particles toward cursor
- Effective within 300px radius
- Real-time visual feedback with cursor indicator

### Configuration Options

#### Wall Bounce Toggle
- Enable/disable boundary collision
- When enabled: particles bounce off edges
- When disabled: particles can exit canvas
- Applies elasticity coefficient to wall collisions

## Presets

### 1. Gentle Fall
**Description:** Soft gravity with high elasticity
- **Use Case:** Elegant, smooth animations
- **Gravity:** 0.3 (light)
- **Elasticity:** 0.7 (bouncy)
- **Damping:** 0.98 (gradual slowdown)
- **Best For:** Titles, headers, elegant reveals

### 2. Bouncy Ball
**Description:** High elasticity with medium gravity
- **Use Case:** Playful, energetic animations
- **Gravity:** 0.5 (moderate)
- **Elasticity:** 0.9 (very bouncy)
- **Damping:** 0.995 (maintains energy)
- **Best For:** Game interfaces, children's content

### 3. Magnetic
**Description:** Particles attract each other
- **Use Case:** Text reformation, clustering effects
- **Gravity:** 0.2 (light)
- **Elasticity:** 0.5 (moderate bounce)
- **Attraction:** Enabled
- **Best For:** Logo animations, text assembly

### 4. Chaotic Storm
**Description:** High turbulence and wind
- **Use Case:** Dramatic, dynamic effects
- **Wind:** 0.3 (strong right)
- **Turbulence:** 0.8 (very chaotic)
- **Gravity:** 0.1 (light)
- **Best For:** Weather apps, dramatic reveals

### 5. Repulsion Field
**Description:** Particles push away from each other
- **Use Case:** Explosive, dispersing effects
- **Gravity:** 0.4 (moderate)
- **Repulsion:** Enabled
- **Best For:** Transition effects, explosions

## Usage Guide

### Basic Setup

1. **Enter Text**
   - Type text in the input field (auto-converts to uppercase)
   - Characters become individual particles
   - Spacing calculated automatically

2. **Start Simulation**
   - Click **Play** button to begin physics simulation
   - Click **Pause** to freeze current state
   - Click **Reset** (↻) to return to initial positions

3. **Adjust Physics**
   - Use sliders to fine-tune individual parameters
   - Changes apply in real-time
   - Experiment with different combinations

### Advanced Techniques

#### Creating Custom Behaviors

**Floating Effect:**
- Gravity: 0
- Damping: 0.99
- Wind: 0.1-0.3
- Turbulence: 0.2

**Heavy Drop:**
- Gravity: 1.5-2.0
- Elasticity: 0.2
- Damping: 0.95
- Ground Friction: 0.7

**Orbital Motion:**
- Gravity: 0.3
- Attraction: Enabled
- Damping: 0.98
- Cursor Attraction: Enabled

**Explosive Dispersion:**
- Gravity: 0.5
- Repulsion: Enabled
- Elasticity: 0.8
- Damping: 0.97

### Interactive Features

#### Cursor Attraction Mode
1. Toggle "Cursor Attraction" switch
2. Move mouse over canvas
3. Particles follow cursor within range
4. Visual indicator shows attraction zone
5. Combine with other forces for complex effects

#### Export Capabilities
- Click **Export** button to save current frame
- Captures as PNG image
- Timestamp in filename
- Preserves exact particle positions and colors

## Physics Implementation Details

### Particle Properties
```typescript
{
  char: string        // Character to display
  x, y: number       // Position
  vx, vy: number     // Velocity
  mass: number       // Mass (affects gravity response)
  charge: number     // Used for force interactions
  color: string      // HSL color (varies by position)
  fontSize: number   // Text size
}
```

### Force Calculation Order
1. **Gravity** - Applied each frame based on mass
2. **Wind** - Horizontal constant force
3. **Turbulence** - Random noise added
4. **Repulsion/Attraction** - Inter-particle forces calculated
5. **Cursor Attraction** - If enabled, calculated from mouse position
6. **Damping** - Applied to all velocities
7. **Position Update** - New position = old position + velocity
8. **Collision Detection** - Check boundaries
9. **Bounce Response** - Apply elasticity on collision
10. **Friction** - Ground friction when touching bottom

### Collision System
- **Ground:** Bottom edge of canvas
- **Walls:** Left, right, and top edges (if enabled)
- **Response:** Velocity reversed and multiplied by elasticity
- **Friction:** Horizontal velocity reduced on ground contact

### Performance Optimization
- Canvas-based rendering for smooth 60fps
- Efficient distance calculations for forces
- RequestAnimationFrame for optimal timing
- Conditional force calculations (proximity checks)

## Use Cases

### Marketing & Branding
- **Logo Reveals:** Magnetic preset with attraction
- **Product Launches:** Bouncy Ball for playfulness
- **Hero Text:** Gentle Fall for elegance

### UI/UX
- **Loading States:** Chaotic Storm for dynamic feel
- **Error Messages:** Repulsion Field for attention
- **Success Confirmations:** Gentle Fall with low gravity

### Gaming
- **Title Screens:** Bouncy Ball with cursor interaction
- **Level Complete:** Magnetic with text reformation
- **Game Over:** Heavy gravity with high damping

### Educational
- **Physics Demonstrations:** Real-time parameter adjustment
- **Interactive Learning:** Cursor attraction for engagement
- **Science Communication:** Turbulence and wind effects

### Entertainment
- **Music Videos:** Sync turbulence to beat
- **Social Media:** Eye-catching text animations
- **Streaming Overlays:** Dynamic text effects

## Technical Specifications

### Canvas Settings
- **Width:** 800px
- **Height:** 600px
- **Responsive:** Scales to container width
- **Background:** Gradient from card to muted colors

### Text Rendering
- **Font:** Space Grotesk Bold
- **Base Size:** 48px
- **Alignment:** Center
- **Shadow:** Dynamic glow matching text color

### Color System
- **Dynamic:** HSL based on character position
- **Hue Range:** 0-360° (full spectrum)
- **Saturation:** 70% (vibrant)
- **Lightness:** 60% (visible on dark background)

### Performance Metrics
- **Frame Rate:** 60 FPS target
- **Particle Limit:** Recommended < 20 characters
- **Force Range:** 200-300px radius
- **Update Frequency:** Every animation frame

## Best Practices

### For Smooth Animation
1. Start with preset, then fine-tune
2. Use damping > 0.95 for fluid motion
3. Keep elasticity between 0.5-0.8 for realism
4. Balance gravity with ground friction

### For Visual Impact
1. Use high elasticity (0.8-0.9) for energy
2. Enable cursor attraction for interaction
3. Combine turbulence with wind for chaos
4. Use repulsion for dramatic dispersion

### For Performance
1. Limit text length to 15 characters or fewer
2. Disable unnecessary forces (repulsion/attraction)
3. Use higher damping to stabilize faster
4. Reduce turbulence if frame rate drops

## Keyboard Shortcuts

- **Space:** Play/Pause
- **R:** Reset to initial state
- **E:** Export current frame
- **C:** Toggle cursor attraction

(Note: Keyboard shortcuts would require additional implementation)

## Troubleshooting

### Particles fly off screen
- **Solution:** Enable "Wall Bounce"
- **Alternative:** Increase damping to 0.99+

### Animation too slow
- **Solution:** Decrease damping below 0.97
- **Alternative:** Increase gravity or wind

### Particles don't settle
- **Solution:** Increase ground friction
- **Alternative:** Decrease elasticity and increase damping

### Too chaotic
- **Solution:** Reduce turbulence to 0
- **Alternative:** Increase damping to 0.99+

### Not bouncy enough
- **Solution:** Increase elasticity above 0.8
- **Alternative:** Increase gravity for stronger impacts

## Future Enhancements

### Planned Features
- Multiple text layers with independent physics
- Particle trails and motion blur
- Video export (GIF/MP4) instead of single frame
- Custom particle shapes (not just text)
- Collision between particles (not just forces)
- Spring connections between particles
- Custom color gradients per particle
- Physics presets from JSON import/export
- Timeline recording and playback
- Particle emitters and spawners

### Advanced Physics
- Rotation and angular velocity
- Torque and moment of inertia
- Fluid dynamics simulation
- Magnetic field visualization
- Particle lifetimes and fading
- Energy conservation modes
- Constraint systems (springs, joints)

## API Reference

### Configuration Object
```typescript
interface PhysicsConfig {
  gravity: number          // 0-2
  elasticity: number       // 0-1
  damping: number          // 0.9-1.0
  repulsion: boolean       // Particle repulsion
  attraction: boolean      // Particle attraction
  wind: number            // -1 to 1
  turbulence: number      // 0-2
  groundFriction: number  // 0.5-1.0
  wallBounce: boolean     // Enable boundaries
}
```

### Particle Object
```typescript
interface Particle {
  id: string
  char: string
  x: number
  y: number
  vx: number
  vy: number
  mass: number
  charge: number
  color: string
  fontSize: number
}
```

## Credits & License

Built with React, TypeScript, and Canvas API
Uses Space Grotesk font for character rendering
Physics simulation runs at native requestAnimationFrame rate
Phosphor Icons for UI elements

---

**Version:** 1.0.0
**Last Updated:** 2024
**Component:** PhysicsTextEngine.tsx
