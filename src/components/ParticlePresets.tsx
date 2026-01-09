import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Fire, Cloud, Star, Drop, Lightning } from '@phosphor-icons/react'

export interface ParticlePreset {
  id: string
  name: string
  description: string
  icon: any
  config: {
    x: number
    y: number
    rate: number
    spread: number
    velocity: number
    gravity: number
    friction: number
    rotation: boolean
    rotationSpeed: number
    fontSize: number
    fontSizeVariation: number
    lifespan: number
    fadeIn: boolean
    fadeOut: boolean
    colorPalette: string[]
    emitterType: 'point' | 'line' | 'circle' | 'burst'
    emitterSize: number
    textSource: 'custom' | 'random' | 'llm'
    customText: string
    bounce: boolean
    bounceStrength: number
  }
}

export const particlePresets: ParticlePreset[] = [
  {
    id: 'fountain',
    name: 'Fountain',
    description: 'Classic fountain effect with upward spray',
    icon: Drop,
    config: {
      x: 50,
      y: 90,
      rate: 15,
      spread: 60,
      velocity: 8,
      gravity: 0.15,
      friction: 0.98,
      rotation: true,
      rotationSpeed: 3,
      fontSize: 20,
      fontSizeVariation: 8,
      lifespan: 4000,
      fadeIn: true,
      fadeOut: true,
      colorPalette: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#eff6ff'],
      emitterType: 'point',
      emitterSize: 100,
      textSource: 'random',
      customText: 'Hello',
      bounce: false,
      bounceStrength: 0.7
    }
  },
  {
    id: 'fireworks',
    name: 'Fireworks',
    description: 'Explosive burst in all directions',
    icon: Fire,
    config: {
      x: 50,
      y: 50,
      rate: 20,
      spread: 360,
      velocity: 6,
      gravity: 0.05,
      friction: 0.97,
      rotation: true,
      rotationSpeed: 5,
      fontSize: 24,
      fontSizeVariation: 12,
      lifespan: 3000,
      fadeIn: true,
      fadeOut: true,
      colorPalette: ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#a855f7'],
      emitterType: 'burst',
      emitterSize: 100,
      textSource: 'random',
      customText: 'Hello',
      bounce: false,
      bounceStrength: 0.7
    }
  },
  {
    id: 'rain',
    name: 'Rain',
    description: 'Gentle downward falling particles',
    icon: Cloud,
    config: {
      x: 50,
      y: 0,
      rate: 25,
      spread: 15,
      velocity: 2,
      gravity: 0.08,
      friction: 1,
      rotation: false,
      rotationSpeed: 0,
      fontSize: 18,
      fontSizeVariation: 6,
      lifespan: 6000,
      fadeIn: true,
      fadeOut: true,
      colorPalette: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'],
      emitterType: 'line',
      emitterSize: 200,
      textSource: 'random',
      customText: 'Hello',
      bounce: false,
      bounceStrength: 0.7
    }
  },
  {
    id: 'galaxy',
    name: 'Galaxy Spiral',
    description: 'Rotating circular emission',
    icon: Star,
    config: {
      x: 50,
      y: 50,
      rate: 18,
      spread: 30,
      velocity: 4,
      gravity: 0.02,
      friction: 0.995,
      rotation: true,
      rotationSpeed: 4,
      fontSize: 22,
      fontSizeVariation: 10,
      lifespan: 5000,
      fadeIn: true,
      fadeOut: true,
      colorPalette: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
      emitterType: 'circle',
      emitterSize: 150,
      textSource: 'random',
      customText: 'Hello',
      bounce: false,
      bounceStrength: 0.7
    }
  },
  {
    id: 'bounce',
    name: 'Bouncy Balls',
    description: 'Particles that bounce off boundaries',
    icon: Lightning,
    config: {
      x: 50,
      y: 10,
      rate: 8,
      spread: 45,
      velocity: 5,
      gravity: 0.2,
      friction: 0.99,
      rotation: true,
      rotationSpeed: 2,
      fontSize: 28,
      fontSizeVariation: 8,
      lifespan: 8000,
      fadeIn: false,
      fadeOut: true,
      colorPalette: ['#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16'],
      emitterType: 'point',
      emitterSize: 100,
      textSource: 'random',
      customText: 'Hello',
      bounce: true,
      bounceStrength: 0.8
    }
  },
  {
    id: 'sparkle',
    name: 'Sparkle Trail',
    description: 'Slow floating sparkles',
    icon: Sparkle,
    config: {
      x: 50,
      y: 80,
      rate: 12,
      spread: 120,
      velocity: 1.5,
      gravity: -0.05,
      friction: 0.985,
      rotation: true,
      rotationSpeed: 1,
      fontSize: 16,
      fontSizeVariation: 8,
      lifespan: 7000,
      fadeIn: true,
      fadeOut: true,
      colorPalette: ['#fbbf24', '#fcd34d', '#fde047', '#fef08a', '#fef9c3'],
      emitterType: 'line',
      emitterSize: 120,
      textSource: 'random',
      customText: 'Hello',
      bounce: false,
      bounceStrength: 0.7
    }
  }
]

interface ParticlePresetsProps {
  onApplyPreset: (config: any) => void
}

export function ParticlePresets({ onApplyPreset }: ParticlePresetsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Effect Presets</CardTitle>
        <CardDescription>Quick start with pre-configured effects</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-3">
            {particlePresets.map((preset) => {
              const Icon = preset.icon
              return (
                <button
                  key={preset.id}
                  onClick={() => onApplyPreset(preset.config)}
                  className="w-full p-4 rounded-lg border-2 border-border hover:border-accent hover:bg-accent/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                      <Icon size={20} weight="duotone" className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{preset.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {preset.config.emitterType}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                      <div className="flex gap-1 mt-2">
                        {preset.config.colorPalette.slice(0, 5).map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded border border-border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
