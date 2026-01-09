export type EasingFunction = 
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "circIn"
  | "circOut"
  | "circInOut"
  | "backIn"
  | "backOut"
  | "backInOut"
  | "anticipate"
  | "bounceIn"
  | "bounceOut"
  | "bounceInOut"

export type AnimationDirection = "normal" | "reverse" | "alternate" | "alternate-reverse"

export interface KeyframeConfig {
  at: number
  opacity?: number
  scale?: number
  x?: number
  y?: number
  rotate?: number
  skewX?: number
  skewY?: number
  borderRadius?: string
  backgroundColor?: string
  filter?: string
}

export interface ElementAnimation {
  elementId: string
  delay?: number
  duration?: number
  easing?: EasingFunction
  keyframes?: KeyframeConfig[]
  from?: Partial<KeyframeConfig>
  to?: Partial<KeyframeConfig>
  repeat?: number | "infinite"
  repeatType?: "loop" | "reverse" | "mirror"
  repeatDelay?: number
}

export interface AnimationPreset {
  id: string
  name: string
  description: string
  category: "entrance" | "exit" | "attention" | "choreography" | "interaction" | "transformation"
  icon: string
  complexity: "simple" | "moderate" | "complex" | "advanced"
  elements: ElementAnimation[]
  totalDuration: number
  staggerDelay?: number
  orchestration?: "sequence" | "parallel" | "stagger" | "cascade" | "wave"
}

export interface StaggerConfig {
  from?: "first" | "last" | "center" | "edges" | number
  direction?: 1 | -1
  amount?: number
  ease?: EasingFunction
}

export interface ChoreographyConfig {
  name: string
  elements: string[]
  preset: AnimationPreset
  stagger?: StaggerConfig
  loop?: boolean
  autoPlay?: boolean
}

const easingPresets: Record<EasingFunction, number[]> = {
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  circIn: [0.55, 0, 1, 0.45],
  circOut: [0, 0.55, 0.45, 1],
  circInOut: [0.85, 0, 0.15, 1],
  backIn: [0.36, 0, 0.66, -0.56],
  backOut: [0.34, 1.56, 0.64, 1],
  backInOut: [0.68, -0.6, 0.32, 1.6],
  anticipate: [0.36, 0, 0.66, -0.56],
  bounceIn: [0.87, 0, 0.13, 1],
  bounceOut: [0.87, 0, 0.13, 1],
  bounceInOut: [0.87, 0, 0.13, 1],
}

export const animationPresets: AnimationPreset[] = [
  {
    id: "fade-scale-entrance",
    name: "Fade & Scale Entrance",
    description: "Elements fade in while scaling from 80% to 100%",
    category: "entrance",
    icon: "🎭",
    complexity: "simple",
    totalDuration: 0.6,
    orchestration: "stagger",
    staggerDelay: 0.1,
    elements: [{
      elementId: "target",
      duration: 0.6,
      easing: "easeOut",
      from: { opacity: 0, scale: 0.8 },
      to: { opacity: 1, scale: 1 }
    }]
  },
  {
    id: "slide-bounce-entrance",
    name: "Slide & Bounce Entrance",
    description: "Elements slide in from left with a bounce effect",
    category: "entrance",
    icon: "🎪",
    complexity: "moderate",
    totalDuration: 0.8,
    orchestration: "stagger",
    staggerDelay: 0.08,
    elements: [{
      elementId: "target",
      duration: 0.8,
      easing: "backOut",
      from: { opacity: 0, x: -100 },
      to: { opacity: 1, x: 0 }
    }]
  },
  {
    id: "rotate-scale-entrance",
    name: "Rotate & Scale Entrance",
    description: "Elements rotate and scale in with a spin",
    category: "entrance",
    icon: "🌀",
    complexity: "moderate",
    totalDuration: 0.7,
    orchestration: "stagger",
    staggerDelay: 0.12,
    elements: [{
      elementId: "target",
      duration: 0.7,
      easing: "backOut",
      from: { opacity: 0, scale: 0, rotate: -180 },
      to: { opacity: 1, scale: 1, rotate: 0 }
    }]
  },
  {
    id: "wave-cascade",
    name: "Wave Cascade",
    description: "Elements cascade in a wave pattern with vertical movement",
    category: "entrance",
    icon: "🌊",
    complexity: "complex",
    totalDuration: 1.2,
    orchestration: "wave",
    staggerDelay: 0.15,
    elements: [{
      elementId: "target",
      duration: 0.8,
      easing: "easeInOut",
      keyframes: [
        { at: 0, opacity: 0, y: -50, scale: 0.8 },
        { at: 0.5, opacity: 1, y: 10, scale: 1.05 },
        { at: 1, opacity: 1, y: 0, scale: 1 }
      ]
    }]
  },
  {
    id: "elastic-bounce",
    name: "Elastic Bounce",
    description: "Attention-grabbing elastic bounce with scale",
    category: "attention",
    icon: "🎾",
    complexity: "moderate",
    totalDuration: 1.0,
    orchestration: "parallel",
    elements: [{
      elementId: "target",
      duration: 1.0,
      easing: "easeInOut",
      keyframes: [
        { at: 0, scale: 1 },
        { at: 0.2, scale: 1.3 },
        { at: 0.4, scale: 0.9 },
        { at: 0.6, scale: 1.15 },
        { at: 0.8, scale: 0.95 },
        { at: 1, scale: 1 }
      ]
    }]
  },
  {
    id: "pulse-glow",
    name: "Pulse Glow",
    description: "Pulsing scale with glow effect for attention",
    category: "attention",
    icon: "💫",
    complexity: "moderate",
    totalDuration: 1.5,
    orchestration: "parallel",
    elements: [{
      elementId: "target",
      duration: 1.5,
      easing: "easeInOut",
      repeat: "infinite",
      repeatType: "reverse",
      keyframes: [
        { at: 0, scale: 1, filter: "drop-shadow(0 0 0px rgba(59, 130, 246, 0))" },
        { at: 0.5, scale: 1.08, filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))" },
        { at: 1, scale: 1, filter: "drop-shadow(0 0 0px rgba(59, 130, 246, 0))" }
      ]
    }]
  },
  {
    id: "shake-horizontal",
    name: "Shake Horizontal",
    description: "Horizontal shake for error states or attention",
    category: "attention",
    icon: "📳",
    complexity: "simple",
    totalDuration: 0.5,
    orchestration: "parallel",
    elements: [{
      elementId: "target",
      duration: 0.5,
      easing: "easeInOut",
      keyframes: [
        { at: 0, x: 0 },
        { at: 0.1, x: -10 },
        { at: 0.2, x: 10 },
        { at: 0.3, x: -10 },
        { at: 0.4, x: 10 },
        { at: 0.5, x: -5 },
        { at: 0.6, x: 5 },
        { at: 0.7, x: -5 },
        { at: 0.8, x: 5 },
        { at: 1, x: 0 }
      ]
    }]
  },
  {
    id: "flip-entrance",
    name: "3D Flip Entrance",
    description: "3D card flip effect entrance",
    category: "entrance",
    icon: "🎴",
    complexity: "complex",
    totalDuration: 0.8,
    orchestration: "stagger",
    staggerDelay: 0.1,
    elements: [{
      elementId: "target",
      duration: 0.8,
      easing: "easeOut",
      from: { opacity: 0, rotate: 90, scale: 0.8 },
      to: { opacity: 1, rotate: 0, scale: 1 }
    }]
  },
  {
    id: "slide-fade-exit",
    name: "Slide Fade Exit",
    description: "Elements slide right and fade out",
    category: "exit",
    icon: "👋",
    complexity: "simple",
    totalDuration: 0.5,
    orchestration: "stagger",
    staggerDelay: 0.05,
    elements: [{
      elementId: "target",
      duration: 0.5,
      easing: "easeIn",
      from: { opacity: 1, x: 0 },
      to: { opacity: 0, x: 100 }
    }]
  },
  {
    id: "scale-collapse-exit",
    name: "Scale Collapse Exit",
    description: "Elements collapse and scale down to exit",
    category: "exit",
    icon: "🎯",
    complexity: "moderate",
    totalDuration: 0.6,
    orchestration: "stagger",
    staggerDelay: 0.07,
    elements: [{
      elementId: "target",
      duration: 0.6,
      easing: "backIn",
      from: { opacity: 1, scale: 1 },
      to: { opacity: 0, scale: 0 }
    }]
  },
  {
    id: "morphing-shapes",
    name: "Morphing Shapes",
    description: "Elements morph through different shapes and colors",
    category: "transformation",
    icon: "🔮",
    complexity: "advanced",
    totalDuration: 2.0,
    orchestration: "sequence",
    elements: [{
      elementId: "target",
      duration: 2.0,
      easing: "easeInOut",
      keyframes: [
        { at: 0, borderRadius: "0%", rotate: 0, scale: 1 },
        { at: 0.25, borderRadius: "50%", rotate: 90, scale: 1.2 },
        { at: 0.5, borderRadius: "20%", rotate: 180, scale: 0.9 },
        { at: 0.75, borderRadius: "50%", rotate: 270, scale: 1.1 },
        { at: 1, borderRadius: "0%", rotate: 360, scale: 1 }
      ]
    }]
  },
  {
    id: "parallax-depth",
    name: "Parallax Depth",
    description: "Multi-layer parallax effect with depth",
    category: "choreography",
    icon: "🏔️",
    complexity: "advanced",
    totalDuration: 1.5,
    orchestration: "parallel",
    elements: [
      {
        elementId: "layer-1",
        duration: 1.5,
        easing: "easeOut",
        from: { y: 100, opacity: 0 },
        to: { y: 0, opacity: 1 }
      },
      {
        elementId: "layer-2",
        duration: 1.5,
        delay: 0.1,
        easing: "easeOut",
        from: { y: 150, opacity: 0 },
        to: { y: 0, opacity: 1 }
      },
      {
        elementId: "layer-3",
        duration: 1.5,
        delay: 0.2,
        easing: "easeOut",
        from: { y: 200, opacity: 0 },
        to: { y: 0, opacity: 1 }
      }
    ]
  },
  {
    id: "domino-cascade",
    name: "Domino Cascade",
    description: "Sequential domino effect with rotation and movement",
    category: "choreography",
    icon: "🎲",
    complexity: "complex",
    totalDuration: 2.0,
    orchestration: "cascade",
    staggerDelay: 0.15,
    elements: [{
      elementId: "target",
      duration: 0.6,
      easing: "easeInOut",
      keyframes: [
        { at: 0, opacity: 1, rotate: 0, y: 0 },
        { at: 0.3, opacity: 1, rotate: 15, y: -20 },
        { at: 0.6, opacity: 1, rotate: 0, y: 0 },
        { at: 1, opacity: 1, rotate: 0, y: 0 }
      ]
    }]
  },
  {
    id: "orbit-rotation",
    name: "Orbit Rotation",
    description: "Elements orbit around a central point",
    category: "choreography",
    icon: "🪐",
    complexity: "advanced",
    totalDuration: 3.0,
    orchestration: "parallel",
    elements: [{
      elementId: "target",
      duration: 3.0,
      easing: "linear",
      repeat: "infinite",
      keyframes: [
        { at: 0, rotate: 0 },
        { at: 0.25, rotate: 90 },
        { at: 0.5, rotate: 180 },
        { at: 0.75, rotate: 270 },
        { at: 1, rotate: 360 }
      ]
    }]
  },
  {
    id: "typewriter-reveal",
    name: "Typewriter Reveal",
    description: "Sequential character-by-character reveal",
    category: "choreography",
    icon: "⌨️",
    complexity: "complex",
    totalDuration: 2.0,
    orchestration: "sequence",
    staggerDelay: 0.05,
    elements: [{
      elementId: "target",
      duration: 0.1,
      easing: "easeOut",
      from: { opacity: 0, x: -5 },
      to: { opacity: 1, x: 0 }
    }]
  },
  {
    id: "glitch-effect",
    name: "Glitch Effect",
    description: "Digital glitch with RGB split and distortion",
    category: "attention",
    icon: "⚡",
    complexity: "advanced",
    totalDuration: 0.6,
    orchestration: "parallel",
    elements: [{
      elementId: "target",
      duration: 0.6,
      easing: "easeInOut",
      keyframes: [
        { at: 0, x: 0, skewX: 0 },
        { at: 0.1, x: -5, skewX: -5 },
        { at: 0.2, x: 5, skewX: 5 },
        { at: 0.3, x: -3, skewX: -3 },
        { at: 0.4, x: 3, skewX: 3 },
        { at: 0.5, x: -2, skewX: -2 },
        { at: 0.6, x: 2, skewX: 2 },
        { at: 1, x: 0, skewX: 0 }
      ]
    }]
  },
  {
    id: "ripple-wave",
    name: "Ripple Wave",
    description: "Concentric ripple effect from center",
    category: "choreography",
    icon: "🌊",
    complexity: "advanced",
    totalDuration: 1.5,
    orchestration: "stagger",
    staggerDelay: 0.1,
    elements: [{
      elementId: "target",
      duration: 1.0,
      easing: "easeOut",
      from: { scale: 0, opacity: 0.8 },
      to: { scale: 1.5, opacity: 0 }
    }]
  },
  {
    id: "confetti-burst",
    name: "Confetti Burst",
    description: "Explosive particle burst effect",
    category: "interaction",
    icon: "🎉",
    complexity: "advanced",
    totalDuration: 1.2,
    orchestration: "parallel",
    elements: [{
      elementId: "target",
      duration: 1.2,
      easing: "easeOut",
      keyframes: [
        { at: 0, scale: 0, rotate: 0, opacity: 1 },
        { at: 0.3, scale: 1.2, rotate: 180, opacity: 1 },
        { at: 1, scale: 0.8, rotate: 720, opacity: 0 }
      ]
    }]
  },
  {
    id: "accordion-expand",
    name: "Accordion Expand",
    description: "Smooth accordion expand with content reveal",
    category: "interaction",
    icon: "📋",
    complexity: "moderate",
    totalDuration: 0.4,
    orchestration: "sequence",
    elements: [{
      elementId: "target",
      duration: 0.4,
      easing: "easeOut",
      from: { opacity: 0, scale: 0.95, y: -10 },
      to: { opacity: 1, scale: 1, y: 0 }
    }]
  },
  {
    id: "magnetic-pull",
    name: "Magnetic Pull",
    description: "Elements attract and pull together",
    category: "choreography",
    icon: "🧲",
    complexity: "complex",
    totalDuration: 1.0,
    orchestration: "parallel",
    elements: [
      {
        elementId: "element-1",
        duration: 1.0,
        easing: "backOut",
        from: { x: -100, scale: 0.8 },
        to: { x: 0, scale: 1 }
      },
      {
        elementId: "element-2",
        duration: 1.0,
        easing: "backOut",
        from: { x: 100, scale: 0.8 },
        to: { x: 0, scale: 1 }
      }
    ]
  },
  {
    id: "liquid-morph",
    name: "Liquid Morph",
    description: "Fluid liquid-like transformation",
    category: "transformation",
    icon: "💧",
    complexity: "advanced",
    totalDuration: 1.5,
    orchestration: "sequence",
    elements: [{
      elementId: "target",
      duration: 1.5,
      easing: "easeInOut",
      keyframes: [
        { at: 0, scale: 1, skewX: 0, skewY: 0 },
        { at: 0.2, scale: 0.95, skewX: 5, skewY: -5 },
        { at: 0.4, scale: 1.1, skewX: -5, skewY: 5 },
        { at: 0.6, scale: 0.9, skewX: 3, skewY: -3 },
        { at: 0.8, scale: 1.05, skewX: -2, skewY: 2 },
        { at: 1, scale: 1, skewX: 0, skewY: 0 }
      ]
    }]
  },
  {
    id: "zoom-blur-entrance",
    name: "Zoom Blur Entrance",
    description: "Fast zoom with motion blur effect",
    category: "entrance",
    icon: "💨",
    complexity: "complex",
    totalDuration: 0.6,
    orchestration: "stagger",
    staggerDelay: 0.08,
    elements: [{
      elementId: "target",
      duration: 0.6,
      easing: "easeOut",
      keyframes: [
        { at: 0, scale: 2, opacity: 0, filter: "blur(20px)" },
        { at: 0.6, scale: 1.05, opacity: 1, filter: "blur(2px)" },
        { at: 1, scale: 1, opacity: 1, filter: "blur(0px)" }
      ]
    }]
  },
  {
    id: "spotlight-reveal",
    name: "Spotlight Reveal",
    description: "Dramatic spotlight reveal with scale",
    category: "entrance",
    icon: "🔦",
    complexity: "complex",
    totalDuration: 1.0,
    orchestration: "stagger",
    staggerDelay: 0.15,
    elements: [{
      elementId: "target",
      duration: 1.0,
      easing: "easeOut",
      keyframes: [
        { at: 0, scale: 0.5, opacity: 0, filter: "brightness(0)" },
        { at: 0.5, scale: 1.1, opacity: 1, filter: "brightness(1.5)" },
        { at: 1, scale: 1, opacity: 1, filter: "brightness(1)" }
      ]
    }]
  },
  {
    id: "card-shuffle",
    name: "Card Shuffle",
    description: "Playing card shuffle choreography",
    category: "choreography",
    icon: "🃏",
    complexity: "advanced",
    totalDuration: 2.0,
    orchestration: "cascade",
    staggerDelay: 0.1,
    elements: [{
      elementId: "target",
      duration: 0.8,
      easing: "easeInOut",
      keyframes: [
        { at: 0, x: 0, y: 0, rotate: 0 },
        { at: 0.3, x: -50, y: -30, rotate: -15 },
        { at: 0.7, x: 50, y: -30, rotate: 15 },
        { at: 1, x: 0, y: 0, rotate: 0 }
      ]
    }]
  },
  {
    id: "pendulum-swing",
    name: "Pendulum Swing",
    description: "Smooth pendulum swinging motion",
    category: "attention",
    icon: "⏱️",
    complexity: "moderate",
    totalDuration: 2.0,
    orchestration: "parallel",
    elements: [{
      elementId: "target",
      duration: 2.0,
      easing: "easeInOut",
      repeat: "infinite",
      keyframes: [
        { at: 0, rotate: -20 },
        { at: 0.5, rotate: 20 },
        { at: 1, rotate: -20 }
      ]
    }]
  },
  {
    id: "matrix-rain",
    name: "Matrix Rain",
    description: "Digital rain falling effect",
    category: "choreography",
    icon: "🌧️",
    complexity: "advanced",
    totalDuration: 3.0,
    orchestration: "stagger",
    staggerDelay: 0.05,
    elements: [{
      elementId: "target",
      duration: 2.0,
      easing: "linear",
      repeat: "infinite",
      from: { y: -100, opacity: 0 },
      to: { y: 100, opacity: 1 }
    }]
  },
  {
    id: "kaleidoscope",
    name: "Kaleidoscope",
    description: "Radial kaleidoscope pattern animation",
    category: "transformation",
    icon: "🎨",
    complexity: "advanced",
    totalDuration: 2.5,
    orchestration: "parallel",
    elements: [{
      elementId: "target",
      duration: 2.5,
      easing: "linear",
      repeat: "infinite",
      keyframes: [
        { at: 0, rotate: 0, scale: 1 },
        { at: 0.5, rotate: 180, scale: 1.3 },
        { at: 1, rotate: 360, scale: 1 }
      ]
    }]
  },
  {
    id: "spring-bounce",
    name: "Spring Bounce",
    description: "Physics-based spring bounce animation",
    category: "attention",
    icon: "🎪",
    complexity: "moderate",
    totalDuration: 1.2,
    orchestration: "parallel",
    elements: [{
      elementId: "target",
      duration: 1.2,
      easing: "easeInOut",
      keyframes: [
        { at: 0, y: 0 },
        { at: 0.2, y: -50 },
        { at: 0.4, y: 0 },
        { at: 0.5, y: -25 },
        { at: 0.6, y: 0 },
        { at: 0.7, y: -10 },
        { at: 0.8, y: 0 },
        { at: 1, y: 0 }
      ]
    }]
  }
]

export const choreographyTemplates: ChoreographyConfig[] = [
  {
    name: "Hero Section Reveal",
    elements: ["hero-title", "hero-subtitle", "hero-cta"],
    preset: animationPresets.find(p => p.id === "fade-scale-entrance")!,
    stagger: { from: "first", direction: 1, amount: 0.2 },
    autoPlay: true
  },
  {
    name: "Card Grid Entrance",
    elements: Array.from({ length: 12 }, (_, i) => `card-${i}`),
    preset: animationPresets.find(p => p.id === "wave-cascade")!,
    stagger: { from: 0, direction: 1, amount: 0.1 },
    autoPlay: true
  },
  {
    name: "Navigation Menu",
    elements: ["nav-item-1", "nav-item-2", "nav-item-3", "nav-item-4"],
    preset: animationPresets.find(p => p.id === "slide-bounce-entrance")!,
    stagger: { from: "first", direction: 1, amount: 0.08 },
    autoPlay: true
  },
  {
    name: "Feature Showcase",
    elements: ["feature-1", "feature-2", "feature-3"],
    preset: animationPresets.find(p => p.id === "flip-entrance")!,
    stagger: { from: "center", direction: 1, amount: 0.15 },
    autoPlay: false
  },
  {
    name: "Dashboard Widgets",
    elements: ["widget-1", "widget-2", "widget-3", "widget-4", "widget-5", "widget-6"],
    preset: animationPresets.find(p => p.id === "zoom-blur-entrance")!,
    stagger: { from: "first", direction: 1, amount: 0.1 },
    autoPlay: true
  }
]

export function getPresetsByCategory(category: AnimationPreset["category"]): AnimationPreset[] {
  return animationPresets.filter(preset => preset.category === category)
}

export function getPresetsByComplexity(complexity: AnimationPreset["complexity"]): AnimationPreset[] {
  return animationPresets.filter(preset => preset.complexity === complexity)
}

export function generateStaggeredAnimations(
  preset: AnimationPreset,
  elementIds: string[],
  staggerConfig?: StaggerConfig
): ElementAnimation[] {
  const animations: ElementAnimation[] = []
  const baseDelay = 0
  const staggerAmount = staggerConfig?.amount || preset.staggerDelay || 0.1
  
  elementIds.forEach((id, index) => {
    const elementAnimations = preset.elements.map(el => ({
      ...el,
      elementId: id,
      delay: baseDelay + (index * staggerAmount)
    }))
    animations.push(...elementAnimations)
  })
  
  return animations
}

export function createSequentialChoreography(
  presets: AnimationPreset[],
  elementId: string
): ElementAnimation[] {
  const animations: ElementAnimation[] = []
  let cumulativeDelay = 0
  
  presets.forEach(preset => {
    preset.elements.forEach(el => {
      animations.push({
        ...el,
        elementId,
        delay: cumulativeDelay + (el.delay || 0)
      })
    })
    cumulativeDelay += preset.totalDuration
  })
  
  return animations
}

export function createParallelChoreography(
  presets: AnimationPreset[],
  elementIds: string[]
): ElementAnimation[] {
  const animations: ElementAnimation[] = []
  
  presets.forEach((preset, presetIndex) => {
    const elementId = elementIds[presetIndex] || elementIds[0]
    preset.elements.forEach(el => {
      animations.push({
        ...el,
        elementId
      })
    })
  })
  
  return animations
}

export function getEasingCurve(easing: EasingFunction): number[] {
  return easingPresets[easing] || easingPresets.easeInOut
}

export function interpolateKeyframes(
  keyframes: KeyframeConfig[],
  progress: number
): Partial<KeyframeConfig> {
  if (keyframes.length === 0) return {}
  if (keyframes.length === 1) return keyframes[0]
  
  const sortedKeyframes = [...keyframes].sort((a, b) => a.at - b.at)
  
  if (progress <= sortedKeyframes[0].at) return sortedKeyframes[0]
  if (progress >= sortedKeyframes[sortedKeyframes.length - 1].at) {
    return sortedKeyframes[sortedKeyframes.length - 1]
  }
  
  for (let i = 0; i < sortedKeyframes.length - 1; i++) {
    const current = sortedKeyframes[i]
    const next = sortedKeyframes[i + 1]
    
    if (progress >= current.at && progress <= next.at) {
      const localProgress = (progress - current.at) / (next.at - current.at)
      
      return {
        opacity: interpolateValue(current.opacity, next.opacity, localProgress),
        scale: interpolateValue(current.scale, next.scale, localProgress),
        x: interpolateValue(current.x, next.x, localProgress),
        y: interpolateValue(current.y, next.y, localProgress),
        rotate: interpolateValue(current.rotate, next.rotate, localProgress),
        skewX: interpolateValue(current.skewX, next.skewX, localProgress),
        skewY: interpolateValue(current.skewY, next.skewY, localProgress),
      }
    }
  }
  
  return {}
}

function interpolateValue(
  start: number | undefined,
  end: number | undefined,
  progress: number
): number | undefined {
  if (start === undefined || end === undefined) return start || end
  return start + (end - start) * progress
}
