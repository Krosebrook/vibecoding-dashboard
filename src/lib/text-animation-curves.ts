export type TextEasingFunction = 
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInQuart"
  | "easeOutQuart"
  | "easeInOutQuart"
  | "easeInQuint"
  | "easeOutQuint"
  | "easeInOutQuint"
  | "easeInExpo"
  | "easeOutExpo"
  | "easeInOutExpo"
  | "easeInCirc"
  | "easeOutCirc"
  | "easeInOutCirc"
  | "easeInBack"
  | "easeOutBack"
  | "easeInOutBack"
  | "easeInElastic"
  | "easeOutElastic"
  | "easeInOutElastic"
  | "easeInBounce"
  | "easeOutBounce"
  | "easeInOutBounce"
  | "typewriter"
  | "smooth"
  | "snappy"
  | "spring"
  | "gentle"
  | "dramatic"
  | "cinematic"
  | "floaty"
  | "punchy"
  | "silk"
  | "butter"
  | "bouncy"
  | "overshoot"
  | "anticipate"
  | "whip"

export interface TextAnimationCurve {
  name: TextEasingFunction
  displayName: string
  description: string
  category: "standard" | "expressive" | "physics" | "text-specific"
  bezier: [number, number, number, number]
  visualPreview: string
  bestFor: string[]
  intensity: "subtle" | "moderate" | "strong" | "extreme"
}

export const textEasingCurves: Record<TextEasingFunction, TextAnimationCurve> = {
  linear: {
    name: "linear",
    displayName: "Linear",
    description: "Constant speed throughout",
    category: "standard",
    bezier: [0, 0, 1, 1],
    visualPreview: "━━━━━━━━━━",
    bestFor: ["mechanical text", "digital displays", "monospace fonts"],
    intensity: "subtle"
  },
  easeIn: {
    name: "easeIn",
    displayName: "Ease In",
    description: "Slow start, accelerating finish",
    category: "standard",
    bezier: [0.42, 0, 1, 1],
    visualPreview: "╱━━━━━━━━━",
    bestFor: ["exit animations", "disappearing text", "fade outs"],
    intensity: "moderate"
  },
  easeOut: {
    name: "easeOut",
    displayName: "Ease Out",
    description: "Fast start, decelerating finish",
    category: "standard",
    bezier: [0, 0, 0.58, 1],
    visualPreview: "━━━━━━━━╲",
    bestFor: ["entrance animations", "appearing text", "fade ins"],
    intensity: "moderate"
  },
  easeInOut: {
    name: "easeInOut",
    displayName: "Ease In Out",
    description: "Smooth acceleration and deceleration",
    category: "standard",
    bezier: [0.42, 0, 0.58, 1],
    visualPreview: "╱━━━━━━╲",
    bestFor: ["transitions", "morphing text", "general purpose"],
    intensity: "moderate"
  },
  easeInQuad: {
    name: "easeInQuad",
    displayName: "Ease In Quad",
    description: "Quadratic acceleration",
    category: "standard",
    bezier: [0.11, 0, 0.5, 0],
    visualPreview: "╱━━━━━━━━━",
    bestFor: ["subtle entrances", "gentle reveals"],
    intensity: "subtle"
  },
  easeOutQuad: {
    name: "easeOutQuad",
    displayName: "Ease Out Quad",
    description: "Quadratic deceleration",
    category: "standard",
    bezier: [0.5, 1, 0.89, 1],
    visualPreview: "━━━━━━━━╲",
    bestFor: ["gentle stops", "natural settling"],
    intensity: "subtle"
  },
  easeInOutQuad: {
    name: "easeInOutQuad",
    displayName: "Ease In Out Quad",
    description: "Quadratic acceleration and deceleration",
    category: "standard",
    bezier: [0.45, 0, 0.55, 1],
    visualPreview: "╱━━━━━╲",
    bestFor: ["smooth transitions", "balanced motion"],
    intensity: "subtle"
  },
  easeInCubic: {
    name: "easeInCubic",
    displayName: "Ease In Cubic",
    description: "Cubic acceleration curve",
    category: "standard",
    bezier: [0.32, 0, 0.67, 0],
    visualPreview: "╱╱━━━━━━━━",
    bestFor: ["dramatic entrances", "attention-grabbing"],
    intensity: "moderate"
  },
  easeOutCubic: {
    name: "easeOutCubic",
    displayName: "Ease Out Cubic",
    description: "Cubic deceleration curve",
    category: "standard",
    bezier: [0.33, 1, 0.68, 1],
    visualPreview: "━━━━━━━╲╲",
    bestFor: ["smooth stops", "polished exits"],
    intensity: "moderate"
  },
  easeInOutCubic: {
    name: "easeInOutCubic",
    displayName: "Ease In Out Cubic",
    description: "Cubic S-curve",
    category: "standard",
    bezier: [0.65, 0, 0.35, 1],
    visualPreview: "╱━━━━╲",
    bestFor: ["elegant transitions", "professional motion"],
    intensity: "moderate"
  },
  easeInQuart: {
    name: "easeInQuart",
    displayName: "Ease In Quart",
    description: "Quartic acceleration",
    category: "expressive",
    bezier: [0.5, 0, 0.75, 0],
    visualPreview: "╱╱╱━━━━━━━",
    bestFor: ["powerful reveals", "impactful text"],
    intensity: "strong"
  },
  easeOutQuart: {
    name: "easeOutQuart",
    displayName: "Ease Out Quart",
    description: "Quartic deceleration",
    category: "expressive",
    bezier: [0.25, 1, 0.5, 1],
    visualPreview: "━━━━━━━╲╲╲",
    bestFor: ["heavy text settling", "weighty content"],
    intensity: "strong"
  },
  easeInOutQuart: {
    name: "easeInOutQuart",
    displayName: "Ease In Out Quart",
    description: "Quartic S-curve",
    category: "expressive",
    bezier: [0.76, 0, 0.24, 1],
    visualPreview: "╱╱━━╲╲",
    bestFor: ["dramatic transitions", "bold statements"],
    intensity: "strong"
  },
  easeInQuint: {
    name: "easeInQuint",
    displayName: "Ease In Quint",
    description: "Quintic acceleration",
    category: "expressive",
    bezier: [0.64, 0, 0.78, 0],
    visualPreview: "╱╱╱╱━━━━━━",
    bestFor: ["explosive reveals", "dynamic entrances"],
    intensity: "extreme"
  },
  easeOutQuint: {
    name: "easeOutQuint",
    displayName: "Ease Out Quint",
    description: "Quintic deceleration",
    category: "expressive",
    bezier: [0.22, 1, 0.36, 1],
    visualPreview: "━━━━━━╲╲╲╲",
    bestFor: ["soft landings", "gentle settling"],
    intensity: "extreme"
  },
  easeInOutQuint: {
    name: "easeInOutQuint",
    displayName: "Ease In Out Quint",
    description: "Quintic S-curve",
    category: "expressive",
    bezier: [0.83, 0, 0.17, 1],
    visualPreview: "╱╱╱╲╲╲",
    bestFor: ["cinematic motion", "film-like transitions"],
    intensity: "extreme"
  },
  easeInExpo: {
    name: "easeInExpo",
    displayName: "Ease In Exponential",
    description: "Exponential acceleration",
    category: "expressive",
    bezier: [0.7, 0, 0.84, 0],
    visualPreview: "___╱━━━━━━",
    bestFor: ["sudden reveals", "surprise effects"],
    intensity: "extreme"
  },
  easeOutExpo: {
    name: "easeOutExpo",
    displayName: "Ease Out Exponential",
    description: "Exponential deceleration",
    category: "expressive",
    bezier: [0.16, 1, 0.3, 1],
    visualPreview: "━━━━━━╲___",
    bestFor: ["quick stops", "abrupt endings"],
    intensity: "extreme"
  },
  easeInOutExpo: {
    name: "easeInOutExpo",
    displayName: "Ease In Out Exponential",
    description: "Exponential S-curve",
    category: "expressive",
    bezier: [0.87, 0, 0.13, 1],
    visualPreview: "__╱╲__",
    bestFor: ["dramatic transitions", "high contrast motion"],
    intensity: "extreme"
  },
  easeInCirc: {
    name: "easeInCirc",
    displayName: "Ease In Circular",
    description: "Circular acceleration curve",
    category: "standard",
    bezier: [0.55, 0, 1, 0.45],
    visualPreview: "╱━━━━━━━━━",
    bestFor: ["smooth starts", "circular motion"],
    intensity: "moderate"
  },
  easeOutCirc: {
    name: "easeOutCirc",
    displayName: "Ease Out Circular",
    description: "Circular deceleration curve",
    category: "standard",
    bezier: [0, 0.55, 0.45, 1],
    visualPreview: "━━━━━━━━╲",
    bestFor: ["smooth stops", "natural endings"],
    intensity: "moderate"
  },
  easeInOutCirc: {
    name: "easeInOutCirc",
    displayName: "Ease In Out Circular",
    description: "Circular S-curve",
    category: "standard",
    bezier: [0.85, 0, 0.15, 1],
    visualPreview: "╱━━━━╲",
    bestFor: ["smooth transitions", "circular flow"],
    intensity: "moderate"
  },
  easeInBack: {
    name: "easeInBack",
    displayName: "Ease In Back",
    description: "Anticipation before acceleration",
    category: "physics",
    bezier: [0.36, 0, 0.66, -0.56],
    visualPreview: "╲╱━━━━━━━━",
    bestFor: ["playful reveals", "bounce-in text"],
    intensity: "strong"
  },
  easeOutBack: {
    name: "easeOutBack",
    displayName: "Ease Out Back",
    description: "Overshoot then settle",
    category: "physics",
    bezier: [0.34, 1.56, 0.64, 1],
    visualPreview: "━━━━━━━╱╲",
    bestFor: ["playful exits", "spring-like motion"],
    intensity: "strong"
  },
  easeInOutBack: {
    name: "easeInOutBack",
    displayName: "Ease In Out Back",
    description: "Anticipation and overshoot",
    category: "physics",
    bezier: [0.68, -0.6, 0.32, 1.6],
    visualPreview: "╲╱━━╱╲",
    bestFor: ["playful transitions", "bouncy text"],
    intensity: "strong"
  },
  easeInElastic: {
    name: "easeInElastic",
    displayName: "Ease In Elastic",
    description: "Elastic spring-like acceleration",
    category: "physics",
    bezier: [0.6, -0.28, 0.735, 0.045],
    visualPreview: "╲╱╲╱━━━━━━",
    bestFor: ["rubber band effects", "springy text"],
    intensity: "extreme"
  },
  easeOutElastic: {
    name: "easeOutElastic",
    displayName: "Ease Out Elastic",
    description: "Elastic spring-like deceleration",
    category: "physics",
    bezier: [0.175, 0.885, 0.32, 1.275],
    visualPreview: "━━━━━━╱╲╱╲",
    bestFor: ["bouncy reveals", "elastic text"],
    intensity: "extreme"
  },
  easeInOutElastic: {
    name: "easeInOutElastic",
    displayName: "Ease In Out Elastic",
    description: "Double elastic effect",
    category: "physics",
    bezier: [0.68, -0.55, 0.265, 1.55],
    visualPreview: "╲╱╲╱╱╲╱╲",
    bestFor: ["playful transitions", "fun interactions"],
    intensity: "extreme"
  },
  easeInBounce: {
    name: "easeInBounce",
    displayName: "Ease In Bounce",
    description: "Bouncing ball acceleration",
    category: "physics",
    bezier: [0.6, -0.28, 0.735, 0.045],
    visualPreview: "╲╱╲━━━━━━━",
    bestFor: ["ball drop effects", "impact text"],
    intensity: "strong"
  },
  easeOutBounce: {
    name: "easeOutBounce",
    displayName: "Ease Out Bounce",
    description: "Bouncing ball deceleration",
    category: "physics",
    bezier: [0.175, 0.885, 0.32, 1.275],
    visualPreview: "━━━━━━━╱╲╱",
    bestFor: ["landing effects", "settling text"],
    intensity: "strong"
  },
  easeInOutBounce: {
    name: "easeInOutBounce",
    displayName: "Ease In Out Bounce",
    description: "Double bounce effect",
    category: "physics",
    bezier: [0.68, -0.55, 0.265, 1.55],
    visualPreview: "╲╱╲━━╱╲╱",
    bestFor: ["bouncy transitions", "playful text"],
    intensity: "strong"
  },
  typewriter: {
    name: "typewriter",
    displayName: "Typewriter",
    description: "Mechanical typing rhythm",
    category: "text-specific",
    bezier: [0, 0.5, 0.5, 1],
    visualPreview: "┣━┣━┣━┣━┣━",
    bestFor: ["character reveals", "typing effects", "code text"],
    intensity: "moderate"
  },
  smooth: {
    name: "smooth",
    displayName: "Smooth Silk",
    description: "Ultra-smooth, silk-like motion",
    category: "text-specific",
    bezier: [0.25, 0.46, 0.45, 0.94],
    visualPreview: "━━━━━━━━━━",
    bestFor: ["elegant text", "luxury brands", "serif fonts"],
    intensity: "subtle"
  },
  snappy: {
    name: "snappy",
    displayName: "Snappy",
    description: "Quick, responsive motion",
    category: "text-specific",
    bezier: [0.25, 0.1, 0.25, 1],
    visualPreview: "━╱━━━━━━━╲",
    bestFor: ["UI text", "buttons", "labels", "sans-serif"],
    intensity: "moderate"
  },
  spring: {
    name: "spring",
    displayName: "Spring",
    description: "Natural spring physics",
    category: "text-specific",
    bezier: [0.5, -0.3, 0.1, 1.45],
    visualPreview: "━━━━╱╲╱━━━",
    bestFor: ["interactive text", "hover effects", "dynamic content"],
    intensity: "strong"
  },
  gentle: {
    name: "gentle",
    displayName: "Gentle Float",
    description: "Soft, floating motion",
    category: "text-specific",
    bezier: [0.16, 1, 0.3, 1],
    visualPreview: "━━━━━━╲___",
    bestFor: ["subtitles", "captions", "light text"],
    intensity: "subtle"
  },
  dramatic: {
    name: "dramatic",
    displayName: "Dramatic",
    description: "Bold, theatrical motion",
    category: "text-specific",
    bezier: [0.95, 0.05, 0.795, 0.035],
    visualPreview: "━━━━━━━━╲╲",
    bestFor: ["headlines", "hero text", "impact statements"],
    intensity: "extreme"
  },
  cinematic: {
    name: "cinematic",
    displayName: "Cinematic",
    description: "Film-quality motion curve",
    category: "text-specific",
    bezier: [0.83, 0, 0.17, 1],
    visualPreview: "╱╱━━━━╲╲",
    bestFor: ["video titles", "credits", "film text"],
    intensity: "strong"
  },
  floaty: {
    name: "floaty",
    displayName: "Floaty",
    description: "Weightless, floating motion",
    category: "text-specific",
    bezier: [0.22, 1, 0.36, 1],
    visualPreview: "━━━━━╲___",
    bestFor: ["dreamy text", "poetic content", "soft reveals"],
    intensity: "subtle"
  },
  punchy: {
    name: "punchy",
    displayName: "Punchy",
    description: "Sharp, impactful motion",
    category: "text-specific",
    bezier: [0.68, -0.55, 0.265, 1.55],
    visualPreview: "╲╱━━━━━╱╲",
    bestFor: ["call-to-action", "alerts", "notifications"],
    intensity: "extreme"
  },
  silk: {
    name: "silk",
    displayName: "Silk Smooth",
    description: "Luxuriously smooth curve",
    category: "text-specific",
    bezier: [0.4, 0, 0.2, 1],
    visualPreview: "━━━━━━━━━━",
    bestFor: ["premium text", "elegant typography", "high-end brands"],
    intensity: "subtle"
  },
  butter: {
    name: "butter",
    displayName: "Butter Smooth",
    description: "Warm, buttery motion",
    category: "text-specific",
    bezier: [0.645, 0.045, 0.355, 1],
    visualPreview: "━━━━━━━━━━",
    bestFor: ["warm text", "friendly content", "casual brands"],
    intensity: "subtle"
  },
  bouncy: {
    name: "bouncy",
    displayName: "Bouncy",
    description: "Playful bounce effect",
    category: "text-specific",
    bezier: [0.68, -0.55, 0.265, 1.55],
    visualPreview: "╲╱━━━━╱╲╱",
    bestFor: ["playful text", "kid-friendly", "fun content"],
    intensity: "strong"
  },
  overshoot: {
    name: "overshoot",
    displayName: "Overshoot",
    description: "Slight overshoot and settle",
    category: "text-specific",
    bezier: [0.175, 0.885, 0.32, 1.275],
    visualPreview: "━━━━━━╱╲",
    bestFor: ["satisfying reveals", "polished UI", "modern text"],
    intensity: "moderate"
  },
  anticipate: {
    name: "anticipate",
    displayName: "Anticipate",
    description: "Pull back before moving forward",
    category: "text-specific",
    bezier: [0.36, 0, 0.66, -0.56],
    visualPreview: "╲╱━━━━━━━━",
    bestFor: ["surprise reveals", "attention-grabbing", "teasers"],
    intensity: "strong"
  },
  whip: {
    name: "whip",
    displayName: "Whip",
    description: "Fast whip-like motion",
    category: "text-specific",
    bezier: [0.95, 0.05, 0.795, 0.035],
    visualPreview: "━━━━━━━╲╲╲",
    bestFor: ["fast transitions", "swipe text", "quick reveals"],
    intensity: "extreme"
  }
}

export interface TextTransitionPreset {
  id: string
  name: string
  description: string
  category: "fade" | "slide" | "scale" | "rotate" | "morph" | "split" | "reveal" | "typing"
  easing: TextEasingFunction
  duration: number
  properties: {
    from: Record<string, any>
    to: Record<string, any>
  }
  characterDelay?: number
  wordDelay?: number
  lineDelay?: number
  icon: string
  complexity: "simple" | "moderate" | "complex"
  intensity: "subtle" | "moderate" | "strong"
  bestFor: string[]
}

export const textTransitionPresets: TextTransitionPreset[] = [
  {
    id: "fade-smooth",
    name: "Smooth Fade",
    description: "Ultra-smooth fade transition",
    category: "fade",
    easing: "smooth",
    duration: 0.8,
    properties: {
      from: { opacity: 0 },
      to: { opacity: 1 }
    },
    icon: "✨",
    complexity: "simple",
    intensity: "subtle",
    bestFor: ["body text", "paragraphs", "subtle reveals"]
  },
  {
    id: "fade-cinematic",
    name: "Cinematic Fade",
    description: "Film-quality fade with dramatic timing",
    category: "fade",
    easing: "cinematic",
    duration: 1.2,
    properties: {
      from: { opacity: 0 },
      to: { opacity: 1 }
    },
    icon: "🎬",
    complexity: "simple",
    intensity: "moderate",
    bestFor: ["titles", "hero text", "video captions"]
  },
  {
    id: "slide-snappy",
    name: "Snappy Slide",
    description: "Quick, responsive slide from left",
    category: "slide",
    easing: "snappy",
    duration: 0.5,
    properties: {
      from: { opacity: 0, x: -30 },
      to: { opacity: 1, x: 0 }
    },
    icon: "→",
    complexity: "simple",
    intensity: "moderate",
    bestFor: ["menu items", "list items", "UI labels"]
  },
  {
    id: "slide-spring",
    name: "Spring Slide",
    description: "Natural spring-powered slide",
    category: "slide",
    easing: "spring",
    duration: 0.7,
    properties: {
      from: { opacity: 0, x: -50 },
      to: { opacity: 1, x: 0 }
    },
    icon: "↗",
    complexity: "moderate",
    intensity: "strong",
    bestFor: ["interactive text", "hover reveals", "animated buttons"]
  },
  {
    id: "scale-gentle",
    name: "Gentle Scale",
    description: "Soft scaling from small to normal",
    category: "scale",
    easing: "gentle",
    duration: 0.6,
    properties: {
      from: { opacity: 0, scale: 0.9 },
      to: { opacity: 1, scale: 1 }
    },
    icon: "○",
    complexity: "simple",
    intensity: "subtle",
    bestFor: ["subtle emphasis", "light text", "secondary content"]
  },
  {
    id: "scale-dramatic",
    name: "Dramatic Scale",
    description: "Bold, theatrical scaling reveal",
    category: "scale",
    easing: "dramatic",
    duration: 0.9,
    properties: {
      from: { opacity: 0, scale: 0.5 },
      to: { opacity: 1, scale: 1 }
    },
    icon: "●",
    complexity: "moderate",
    intensity: "strong",
    bestFor: ["headlines", "impact text", "attention-grabbing"]
  },
  {
    id: "scale-punchy",
    name: "Punchy Pop",
    description: "Sharp pop-in with overshoot",
    category: "scale",
    easing: "punchy",
    duration: 0.5,
    properties: {
      from: { opacity: 0, scale: 0.3 },
      to: { opacity: 1, scale: 1 }
    },
    icon: "💥",
    complexity: "moderate",
    intensity: "strong",
    bestFor: ["CTAs", "alerts", "important notices"]
  },
  {
    id: "rotate-bouncy",
    name: "Bouncy Rotate",
    description: "Playful rotation with bounce",
    category: "rotate",
    easing: "bouncy",
    duration: 0.8,
    properties: {
      from: { opacity: 0, rotate: -180, scale: 0.5 },
      to: { opacity: 1, rotate: 0, scale: 1 }
    },
    icon: "🔄",
    complexity: "complex",
    intensity: "strong",
    bestFor: ["playful text", "fun content", "kid-friendly"]
  },
  {
    id: "typewriter-mechanical",
    name: "Typewriter",
    description: "Classic typing machine effect",
    category: "typing",
    easing: "typewriter",
    duration: 1.5,
    properties: {
      from: { opacity: 0, x: -2 },
      to: { opacity: 1, x: 0 }
    },
    characterDelay: 0.05,
    icon: "⌨️",
    complexity: "complex",
    intensity: "moderate",
    bestFor: ["code text", "monospace fonts", "terminal-style"]
  },
  {
    id: "split-word-cascade",
    name: "Word Cascade",
    description: "Words appear one by one with stagger",
    category: "split",
    easing: "overshoot",
    duration: 0.5,
    properties: {
      from: { opacity: 0, y: 20, scale: 0.8 },
      to: { opacity: 1, y: 0, scale: 1 }
    },
    wordDelay: 0.1,
    icon: "📝",
    complexity: "complex",
    intensity: "moderate",
    bestFor: ["headlines", "taglines", "emphasis text"]
  },
  {
    id: "split-char-wave",
    name: "Character Wave",
    description: "Characters wave in from bottom",
    category: "split",
    easing: "silk",
    duration: 0.4,
    properties: {
      from: { opacity: 0, y: 30 },
      to: { opacity: 1, y: 0 }
    },
    characterDelay: 0.03,
    icon: "🌊",
    complexity: "complex",
    intensity: "moderate",
    bestFor: ["artistic text", "creative headlines", "decorative"]
  },
  {
    id: "split-line-stagger",
    name: "Line Stagger",
    description: "Lines appear with vertical stagger",
    category: "split",
    easing: "butter",
    duration: 0.6,
    properties: {
      from: { opacity: 0, x: -20 },
      to: { opacity: 1, x: 0 }
    },
    lineDelay: 0.15,
    icon: "≡",
    complexity: "moderate",
    intensity: "subtle",
    bestFor: ["paragraphs", "multi-line text", "content blocks"]
  },
  {
    id: "reveal-curtain",
    name: "Curtain Reveal",
    description: "Text reveals like opening a curtain",
    category: "reveal",
    easing: "cinematic",
    duration: 1.0,
    properties: {
      from: { opacity: 0, scaleX: 0 },
      to: { opacity: 1, scaleX: 1 }
    },
    icon: "🎭",
    complexity: "moderate",
    intensity: "moderate",
    bestFor: ["dramatic reveals", "titles", "announcements"]
  },
  {
    id: "reveal-wipe",
    name: "Wipe Reveal",
    description: "Fast wipe-in reveal",
    category: "reveal",
    easing: "whip",
    duration: 0.6,
    properties: {
      from: { opacity: 0, scaleX: 0, x: -50 },
      to: { opacity: 1, scaleX: 1, x: 0 }
    },
    icon: "⚡",
    complexity: "moderate",
    intensity: "strong",
    bestFor: ["fast transitions", "quick reveals", "energetic"]
  },
  {
    id: "morph-blur",
    name: "Blur Morph",
    description: "Text morphs in from blur",
    category: "morph",
    easing: "smooth",
    duration: 0.8,
    properties: {
      from: { opacity: 0, filter: "blur(10px)", scale: 1.1 },
      to: { opacity: 1, filter: "blur(0px)", scale: 1 }
    },
    icon: "🌫️",
    complexity: "moderate",
    intensity: "subtle",
    bestFor: ["soft reveals", "dreamy text", "elegant"]
  },
  {
    id: "morph-glitch",
    name: "Glitch Morph",
    description: "Digital glitch reveal effect",
    category: "morph",
    easing: "snappy",
    duration: 0.4,
    properties: {
      from: { opacity: 0, skewX: 20, x: -10 },
      to: { opacity: 1, skewX: 0, x: 0 }
    },
    icon: "⚡",
    complexity: "complex",
    intensity: "strong",
    bestFor: ["tech text", "digital content", "modern UI"]
  },
  {
    id: "float-up",
    name: "Float Up",
    description: "Weightless float from bottom",
    category: "slide",
    easing: "floaty",
    duration: 1.0,
    properties: {
      from: { opacity: 0, y: 50 },
      to: { opacity: 1, y: 0 }
    },
    icon: "☁️",
    complexity: "simple",
    intensity: "subtle",
    bestFor: ["dreamy text", "poetic content", "soft reveals"]
  },
  {
    id: "anticipate-slide",
    name: "Anticipate Slide",
    description: "Pull back before sliding in",
    category: "slide",
    easing: "anticipate",
    duration: 0.7,
    properties: {
      from: { opacity: 0, x: 30 },
      to: { opacity: 1, x: 0 }
    },
    icon: "↶",
    complexity: "moderate",
    intensity: "strong",
    bestFor: ["surprise reveals", "attention-grabbing", "teasers"]
  },
  {
    id: "elastic-bounce",
    name: "Elastic Bounce",
    description: "Bouncy elastic reveal",
    category: "scale",
    easing: "easeOutElastic",
    duration: 1.0,
    properties: {
      from: { opacity: 0, scale: 0 },
      to: { opacity: 1, scale: 1 }
    },
    icon: "🎈",
    complexity: "moderate",
    intensity: "strong",
    bestFor: ["playful text", "fun reveals", "energetic"]
  },
  {
    id: "perspective-flip",
    name: "Perspective Flip",
    description: "3D perspective flip reveal",
    category: "rotate",
    easing: "easeOutCubic",
    duration: 0.8,
    properties: {
      from: { opacity: 0, rotateX: 90, scale: 0.9 },
      to: { opacity: 1, rotateX: 0, scale: 1 }
    },
    icon: "🔲",
    complexity: "complex",
    intensity: "strong",
    bestFor: ["3D text", "modern design", "tech content"]
  }
]

export function getCurveByName(name: TextEasingFunction): TextAnimationCurve {
  return textEasingCurves[name]
}

export function getCurvesByCategory(category: TextAnimationCurve["category"]): TextAnimationCurve[] {
  return Object.values(textEasingCurves).filter(curve => curve.category === category)
}

export function getCurvesByIntensity(intensity: TextAnimationCurve["intensity"]): TextAnimationCurve[] {
  return Object.values(textEasingCurves).filter(curve => curve.intensity === intensity)
}

export function getTransitionsByCategory(category: TextTransitionPreset["category"]): TextTransitionPreset[] {
  return textTransitionPresets.filter(preset => preset.category === category)
}

export function getTransitionsByComplexity(complexity: TextTransitionPreset["complexity"]): TextTransitionPreset[] {
  return textTransitionPresets.filter(preset => preset.complexity === complexity)
}

export function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const oneMinusT = 1 - t
  return (
    Math.pow(oneMinusT, 3) * p0 +
    3 * Math.pow(oneMinusT, 2) * t * p1 +
    3 * oneMinusT * Math.pow(t, 2) * p2 +
    Math.pow(t, 3) * p3
  )
}

export function evaluateEasing(easing: TextEasingFunction, progress: number): number {
  const curve = textEasingCurves[easing]
  if (!curve) return progress
  
  const [x1, y1, x2, y2] = curve.bezier
  
  let t = progress
  for (let i = 0; i < 10; i++) {
    const x = cubicBezier(0, x1, x2, 1, t)
    const diff = x - progress
    if (Math.abs(diff) < 0.001) break
    t -= diff / (3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2))
  }
  
  return cubicBezier(0, y1, y2, 1, t)
}

export function generateTextAnimationCSS(
  preset: TextTransitionPreset,
  className: string = "text-animate"
): string {
  const curve = textEasingCurves[preset.easing]
  const bezierString = `cubic-bezier(${curve.bezier.join(", ")})`
  
  let css = `
.${className} {
  animation: ${className}-keyframes ${preset.duration}s ${bezierString} forwards;
}

@keyframes ${className}-keyframes {
  from {
`
  
  Object.entries(preset.properties.from).forEach(([key, value]) => {
    css += `    ${key}: ${value};\n`
  })
  
  css += `  }
  to {
`
  
  Object.entries(preset.properties.to).forEach(([key, value]) => {
    css += `    ${key}: ${value};\n`
  })
  
  css += `  }
}
`
  
  if (preset.characterDelay) {
    css += `
.${className}-char {
  display: inline-block;
  animation: ${className}-keyframes ${preset.duration}s ${bezierString} forwards;
}
`
    for (let i = 0; i < 50; i++) {
      css += `.${className}-char:nth-child(${i + 1}) { animation-delay: ${i * preset.characterDelay}s; }\n`
    }
  }
  
  if (preset.wordDelay) {
    css += `
.${className}-word {
  display: inline-block;
  animation: ${className}-keyframes ${preset.duration}s ${bezierString} forwards;
}
`
    for (let i = 0; i < 20; i++) {
      css += `.${className}-word:nth-child(${i + 1}) { animation-delay: ${i * preset.wordDelay}s; }\n`
    }
  }
  
  return css
}
