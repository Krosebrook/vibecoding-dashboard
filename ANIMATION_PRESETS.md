# Animation Presets Library

A comprehensive library of production-ready animation presets with complex multi-element choreography for creating stunning, professional animations.

## Overview

The Animation Presets Library provides 30+ carefully crafted animation presets spanning multiple categories and complexity levels. Each preset is designed to be reusable, composable, and production-ready with precise timing controls and easing functions.

## Features

### 🎭 Animation Categories

- **Entrance**: Elements appearing on screen with style
- **Exit**: Elements leaving the stage gracefully
- **Attention**: Draw focus to important elements
- **Choreography**: Complex multi-element sequences
- **Interaction**: Responsive feedback animations
- **Transformation**: Morphing and state changes

### ⚡ Complexity Levels

- **Simple**: Single-property transitions (0.3-0.6s)
- **Moderate**: Multi-property animations with basic easing (0.6-1.0s)
- **Complex**: Keyframe-based sequences (1.0-2.0s)
- **Advanced**: Multi-layer choreography with precise timing (2.0s+)

### 🎼 Orchestration Types

- **Parallel**: All elements animate simultaneously
- **Sequence**: Elements animate one after another
- **Stagger**: Elements animate with delayed starts
- **Cascade**: Domino effect with overlapping animations
- **Wave**: Ripple effect across elements

## Preset Catalog

### Entrance Animations

#### Fade & Scale Entrance 🎭
Simple opacity and scale animation for smooth element reveals.
- Duration: 0.6s
- Easing: easeOut
- Best for: Cards, modals, tooltips

#### Slide & Bounce Entrance 🎪
Elements slide in from the left with a playful bounce.
- Duration: 0.8s
- Easing: backOut
- Best for: Navigation items, list entries

#### Rotate & Scale Entrance 🌀
Spinning entrance with simultaneous scale.
- Duration: 0.7s
- Easing: backOut
- Best for: Icons, badges, special elements

#### Wave Cascade 🌊
Flowing wave pattern with vertical movement.
- Duration: 1.2s
- Orchestration: Wave
- Best for: Grid layouts, card collections

#### Flip Entrance 🎴
3D card flip effect for dramatic reveals.
- Duration: 0.8s
- Easing: easeOut
- Best for: Feature cards, product showcases

#### Zoom Blur Entrance 💨
Fast zoom with motion blur for dynamic entry.
- Duration: 0.6s
- Best for: Hero sections, call-to-action elements

#### Spotlight Reveal 🔦
Dramatic reveal with brightness changes.
- Duration: 1.0s
- Best for: Featured content, hero images

### Exit Animations

#### Slide Fade Exit 👋
Smooth slide right with fade for clean exits.
- Duration: 0.5s
- Easing: easeIn
- Best for: Dismissible elements, notifications

#### Scale Collapse Exit 🎯
Elements shrink and fade to nothing.
- Duration: 0.6s
- Easing: backIn
- Best for: Removing items, closing modals

### Attention Animations

#### Elastic Bounce 🎾
Attention-grabbing elastic bounce.
- Duration: 1.0s
- Best for: Error states, important buttons

#### Pulse Glow 💫
Infinite pulsing with glow effect.
- Duration: 1.5s (infinite)
- Best for: Live indicators, notifications

#### Shake Horizontal 📳
Rapid horizontal shake for errors.
- Duration: 0.5s
- Best for: Form validation, error states

#### Glitch Effect ⚡
Digital glitch with RGB split.
- Duration: 0.6s
- Best for: Tech/cyber themes, loading states

#### Pendulum Swing ⏱️
Smooth swinging motion.
- Duration: 2.0s (infinite)
- Best for: Decorative elements, loading states

#### Spring Bounce 🎪
Physics-based spring bounce.
- Duration: 1.2s
- Best for: Emphasizing actions, celebrations

### Choreography Animations

#### Parallax Depth 🏔️
Multi-layer depth effect with staggered timing.
- Elements: 3 layers
- Duration: 1.5s
- Best for: Hero sections, layered designs

#### Domino Cascade 🎲
Sequential domino effect with rotation.
- Duration: 2.0s
- Orchestration: Cascade
- Best for: Sequential reveals, storytelling

#### Orbit Rotation 🪐
Elements orbit around a central point.
- Duration: 3.0s (infinite)
- Best for: Loading animations, decorative effects

#### Typewriter Reveal ⌨️
Character-by-character text reveal.
- Duration: 2.0s
- Stagger: 0.05s per character
- Best for: Headlines, quotes, dramatic text

#### Ripple Wave 🌊
Concentric ripples from center.
- Duration: 1.5s
- Best for: Click effects, water themes

#### Magnetic Pull 🧲
Elements attract and pull together.
- Duration: 1.0s
- Best for: Merging elements, grouping animations

#### Card Shuffle 🃏
Playing card shuffle choreography.
- Duration: 2.0s
- Orchestration: Cascade
- Best for: Card interfaces, game UIs

#### Matrix Rain 🌧️
Digital falling rain effect.
- Duration: 3.0s (infinite)
- Best for: Tech backgrounds, loading states

### Interaction Animations

#### Confetti Burst 🎉
Explosive particle burst effect.
- Duration: 1.2s
- Best for: Success states, celebrations

#### Accordion Expand 📋
Smooth content reveal for accordions.
- Duration: 0.4s
- Best for: Expandable sections, dropdowns

### Transformation Animations

#### Morphing Shapes 🔮
Elements morph through different shapes.
- Duration: 2.0s
- Best for: State transitions, loading animations

#### Liquid Morph 💧
Fluid liquid-like transformation.
- Duration: 1.5s
- Best for: Organic transitions, creative effects

#### Kaleidoscope 🎨
Radial kaleidoscope pattern.
- Duration: 2.5s (infinite)
- Best for: Decorative backgrounds, artistic effects

## Choreography Templates

Pre-built multi-element sequences ready to use:

### Hero Section Reveal
3-step entrance for hero title, subtitle, and CTA with stagger.

### Card Grid Entrance
12-element wave cascade for card grids.

### Navigation Menu
4-item slide bounce entrance for navigation.

### Feature Showcase
3-element flip entrance from center.

### Dashboard Widgets
6-widget zoom blur entrance for dashboard layouts.

## Usage Examples

### Basic Animation

```typescript
import { animationPresets } from '@/lib/animation-presets'
import { motion } from 'framer-motion'

const fadeScale = animationPresets.find(p => p.id === 'fade-scale-entrance')!
const element = fadeScale.elements[0]

<motion.div
  initial={element.from}
  animate={element.to}
  transition={{
    duration: element.duration,
    ease: element.easing
  }}
>
  Content
</motion.div>
```

### Staggered List

```typescript
import { generateStaggeredAnimations } from '@/lib/animation-presets'

const preset = animationPresets.find(p => p.id === 'slide-bounce-entrance')!
const elementIds = ['item-1', 'item-2', 'item-3', 'item-4']
const animations = generateStaggeredAnimations(preset, elementIds, {
  from: 'first',
  direction: 1,
  amount: 0.1
})

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

<motion.div variants={container} initial="hidden" animate="show">
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: animations[i].from,
        show: animations[i].to
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Custom Choreography

```typescript
import { createSequentialChoreography } from '@/lib/animation-presets'

const sequence = createSequentialChoreography(
  [
    animationPresets.find(p => p.id === 'fade-scale-entrance')!,
    animationPresets.find(p => p.id === 'pulse-glow')!,
  ],
  'my-element'
)
```

## Choreography Builder

The visual choreography builder allows you to:

- **Create multi-step sequences**: Chain multiple animation presets
- **Configure timing**: Set delays and custom durations for each step
- **Target elements**: Apply animations to specific element groups
- **Preview in real-time**: See your choreography before implementation
- **Export configurations**: Download as JSON for reuse

### Workflow

1. Click "Add Step" to create a new animation step
2. Select an animation preset from the dropdown
3. Specify target element IDs (comma-separated)
4. Adjust delay and duration sliders
5. Reorder steps using the up/down arrows
6. Preview the complete choreography
7. Export the configuration

## Best Practices

### Performance

- **Keep it simple**: Use simpler presets for lists with many items
- **Reduce motion**: Respect `prefers-reduced-motion` user preference
- **GPU acceleration**: Stick to transform and opacity properties when possible
- **Avoid layout thrash**: Don't animate properties that trigger reflow

### Timing

- **Entrance animations**: 0.3-0.8s for optimal feel
- **Exit animations**: Slightly faster than entrance (0.2-0.5s)
- **Attention animations**: 0.5-1.5s, can be infinite but use sparingly
- **Stagger delay**: 0.05-0.15s for smooth cascades

### User Experience

- **Don't block interaction**: Never make users wait for animations
- **Meaningful motion**: Every animation should serve a purpose
- **Consistent language**: Use similar animations for similar actions
- **Respect preferences**: Honor reduced-motion accessibility settings

### When to Use Each Category

- **Entrance**: Page loads, element additions, modal opens
- **Exit**: Element removal, modal closes, dismissals
- **Attention**: Errors, notifications, important actions
- **Choreography**: Complex reveals, onboarding, storytelling
- **Interaction**: Button clicks, hover states, drag-and-drop
- **Transformation**: State changes, theme switches, morphing content

## Customization

All presets support:

- Custom duration
- Custom easing curves
- Repeat modes (loop, reverse, mirror)
- Delay offsets
- Keyframe interpolation

## Accessibility

The library automatically respects user motion preferences:

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (prefersReducedMotion) {
  // Use instant transitions or simpler animations
}
```

## Browser Support

- Modern browsers with CSS transforms
- Framer Motion compatibility
- Hardware acceleration support
- Fallback to static states on older browsers

## Examples in Production

The Animation Presets Library is perfect for:

- **SaaS dashboards**: Widget entrances, data updates
- **Marketing sites**: Hero sections, feature reveals
- **E-commerce**: Product showcases, cart updates
- **Onboarding flows**: Step-by-step guided experiences
- **Game UIs**: Score updates, level transitions
- **Creative portfolios**: Project showcases, page transitions

## Integration with Dashboard VibeCoder

Animations can be applied to dashboard components:

```typescript
const dashboardConfig = {
  components: [{
    id: 'widget-1',
    animation: 'fade-scale-entrance',
    animationDelay: 0
  }]
}
```

## Support & Resources

- View all presets in the Presets tab
- Explore choreography templates in the Choreography tab
- Experiment with settings in the Playground tab
- Copy Framer Motion code directly from preset cards
- Export presets as JSON for version control

## Future Enhancements

- Custom easing curve editor
- Spring physics animations
- Gesture-based animations
- SVG path animations
- Timeline editor with visual scrubbing
- Animation recording from live interactions
