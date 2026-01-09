export type PatternElementType = 
  | 'rectangle' 
  | 'circle' 
  | 'triangle' 
  | 'line' 
  | 'grid' 
  | 'dots' 
  | 'waves'
  | 'gradient'
  | 'noise'
  | 'stripes'
  | 'chevron'
  | 'hexagon'
  | 'star'
  | 'spiral'

export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'

export type EasingFunction = 
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'ease-in-back'
  | 'ease-out-back'
  | 'ease-in-out-back'
  | 'ease-in-elastic'
  | 'ease-out-elastic'
  | 'ease-in-out-elastic'
  | 'ease-in-bounce'
  | 'ease-out-bounce'
  | 'ease-in-out-bounce'

export type AnimationType = 
  | 'move'
  | 'pulse'
  | 'rotate'
  | 'scale'
  | 'fade'
  | 'custom'

export interface AnimationKeyframe {
  id: string
  time: number
  x?: number
  y?: number
  scale?: number
  rotation?: number
  opacity?: number
  width?: number
  height?: number
}

export interface ElementAnimation {
  id: string
  elementId: string
  name: string
  type: AnimationType
  duration: number
  delay: number
  iterations: number | 'infinite'
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  easing: EasingFunction
  keyframes: AnimationKeyframe[]
  enabled: boolean
}

export interface PatternElement {
  id: string
  type: PatternElementType
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  color: string
  blendMode: BlendMode
  zIndex: number
  scale: number
  properties: Record<string, any>
  animations?: ElementAnimation[]
}

export interface PatternConfig {
  id: string
  name: string
  description: string
  width: number
  height: number
  backgroundColor: string
  elements: PatternElement[]
  createdAt: string
  updatedAt: string
  repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  category: 'background' | 'accent' | 'decoration' | 'texture' | 'custom'
}

export interface PatternTemplate {
  id: string
  name: string
  description: string
  category: string
  preview: string
  config: PatternConfig
}

export interface HistoryState {
  config: PatternConfig
  timestamp: number
}
