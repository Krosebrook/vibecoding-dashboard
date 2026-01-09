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
