import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Atom, Play, Pause, ArrowCounterClockwise, Export, Cursor, Drop, Waves, Target } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Particle {
  id: string
  char: string
  x: number
  y: number
  vx: number
  vy: number
  mass: number
  charge: number
  fontSize: number
  color: string
}

interface PhysicsConfig {
  gravity: number
  elasticity: number
  damping: number
  repulsion: boolean
  attraction: boolean
  wind: number
  turbulence: number
  groundFriction: number
  wallBounce: boolean
}

interface Preset {
  name: string
  description: string
  config: PhysicsConfig
  icon: JSX.Element
}

const presets: Preset[] = [
  {
    name: 'Gentle Fall',
    description: 'Soft gravity with high elasticity',
    icon: <Drop size={20} weight="duotone" />,
    config: {
      gravity: 0.3,
      elasticity: 0.7,
      damping: 0.98,
      repulsion: false,
      attraction: false,
      wind: 0,
      turbulence: 0,
      groundFriction: 0.95,
      wallBounce: true
    }
  },
  {
    name: 'Bouncy Ball',
    description: 'High elasticity with medium gravity',
    icon: <Atom size={20} weight="duotone" />,
    config: {
      gravity: 0.5,
      elasticity: 0.9,
      damping: 0.995,
      repulsion: false,
      attraction: false,
      wind: 0,
      turbulence: 0,
      groundFriction: 0.98,
      wallBounce: true
    }
  },
  {
    name: 'Magnetic',
    description: 'Particles attract each other',
    icon: <Target size={20} weight="duotone" />,
    config: {
      gravity: 0.2,
      elasticity: 0.5,
      damping: 0.97,
      repulsion: false,
      attraction: true,
      wind: 0,
      turbulence: 0,
      groundFriction: 0.9,
      wallBounce: true
    }
  },
  {
    name: 'Chaotic Storm',
    description: 'High turbulence and wind',
    icon: <Waves size={20} weight="duotone" />,
    config: {
      gravity: 0.1,
      elasticity: 0.6,
      damping: 0.99,
      repulsion: false,
      attraction: false,
      wind: 0.5,
      turbulence: 0.8,
      groundFriction: 0.85,
      wallBounce: true
    }
  },
  {
    name: 'Repulsion Field',
    description: 'Particles push away from each other',
    icon: <Atom size={20} weight="duotone" />,
    config: {
      gravity: 0.4,
      elasticity: 0.7,
      damping: 0.96,
      repulsion: true,
      attraction: false,
      wind: 0,
      turbulence: 0,
      groundFriction: 0.9,
      wallBounce: true
    }
  }
]

export function PhysicsTextEngine() {
  const animationRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [text, setText] = useState('PHYSICS')
  const [particles, setParticles] = useState<Particle[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [cursorAttraction, setCursorAttraction] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  const [config, setConfig] = useState<PhysicsConfig>({
    gravity: 0.5,
    damping: 0.98,
    elasticity: 0.7,
    repulsion: false,
    attraction: false,
    wind: 0,
    turbulence: 0,
    groundFriction: 0.95,
    wallBounce: true
  })

  const initializeParticles = (inputText: string) => {
    const canvas = canvasRef.current
    if (!canvas) return []

    const chars = inputText.split('')
    const spacing = 50
    const startX = (canvas.width - (chars.length * spacing)) / 2
    const startY = 100

    return chars.map((char, i) => ({
      id: `${i}-${Date.now()}`,
      char,
      x: startX + i * spacing,
      y: startY,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      mass: 1,
      charge: Math.random() > 0.5 ? 1 : -1,
      fontSize: 48,
      color: `hsl(${(i / chars.length) * 360}, 70%, 60%)`
    }))
  }

  const handleReset = () => {
    const newParticles = initializeParticles(text)
    setParticles(newParticles)
  }

  const applyPreset = (preset: Preset) => {
    setConfig(preset.config)
    toast.success(`Applied preset: ${preset.name}`)
  }

  useEffect(() => {
    handleReset()
  }, [text])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    return () => canvas.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      setParticles(prevParticles => {
        const updated = prevParticles.map(particle => {
          let { x, y, vx, vy } = particle
          const { mass } = particle

          vy += config.gravity / mass

          if (config.wind !== 0) {
            vx += config.wind * 0.1
          }

          if (config.turbulence > 0) {
            vx += (Math.random() - 0.5) * config.turbulence
            vy += (Math.random() - 0.5) * config.turbulence
          }

          if (config.repulsion || config.attraction) {
            prevParticles.forEach(other => {
              if (other.id === particle.id) return

              const dx = other.x - x
              const dy = other.y - y
              const distSq = dx * dx + dy * dy
              const dist = Math.sqrt(distSq)

              if (dist > 0 && dist < 200) {
                const force = config.attraction ? 0.5 : -2
                const forceStrength = (force / distSq) * 1000
                
                vx += (dx / dist) * forceStrength
                vy += (dy / dist) * forceStrength
              }
            })
          }

          if (cursorAttraction) {
            const dx = mousePos.x - x
            const dy = mousePos.y - y
            const distSq = dx * dx + dy * dy
            const dist = Math.sqrt(distSq)

            if (dist > 0 && dist < 300) {
              const force = 5 / distSq * 10000
              vx += (dx / dist) * force
              vy += (dy / dist) * force
            }
          }

          vx *= config.damping
          vy *= config.damping

          x += vx
          y += vy

          if (y + particle.fontSize / 2 >= canvas.height) {
            y = canvas.height - particle.fontSize / 2
            vy *= -config.elasticity
            vx *= config.groundFriction
          }

          if (config.wallBounce) {
            if (x - particle.fontSize / 2 <= 0) {
              x = particle.fontSize / 2
              vx *= -config.elasticity
            }
            if (x + particle.fontSize / 2 >= canvas.width) {
              x = canvas.width - particle.fontSize / 2
              vx *= -config.elasticity
            }
            if (y - particle.fontSize / 2 <= 0) {
              y = particle.fontSize / 2
              vy *= -config.elasticity
            }
          }

          return { ...particle, x, y, vx, vy }
        })

        updated.forEach(particle => {
          ctx.save()
          ctx.font = `bold ${particle.fontSize}px 'Space Grotesk', sans-serif`
          ctx.fillStyle = particle.color
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = particle.color
          ctx.shadowBlur = 10
          ctx.fillText(particle.char, particle.x, particle.y)
          ctx.restore()
        })

        if (cursorAttraction && mousePos.x > 0) {
          ctx.beginPath()
          ctx.arc(mousePos.x, mousePos.y, 10, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(117, 255, 220, 0.5)'
          ctx.fill()
          ctx.strokeStyle = 'rgba(117, 255, 220, 0.8)'
          ctx.lineWidth = 2
          ctx.stroke()
        }

        return updated
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, config, cursorAttraction, mousePos])

  const handleExport = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `physics-text-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Frame exported!')
    })
  }

  return (
    <Card className="border-2 border-accent/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Atom size={28} weight="duotone" className="text-accent" />
              Physics-Based Text Engine
            </CardTitle>
            <CardDescription className="mt-2">
              Gravity, elasticity, damping, and force simulation
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
            Real-time Physics
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full border-2 border-border rounded-lg bg-gradient-to-br from-card via-card to-muted cursor-crosshair"
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                      <Play size={32} weight="fill" className="text-accent ml-1" />
                    </div>
                    <p className="text-sm text-muted-foreground">Click Play to start simulation</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                size="lg"
                className="flex-1"
              >
                {isPlaying ? (
                  <>
                    <Pause size={20} weight="fill" className="mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} weight="fill" className="mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
              >
                <ArrowCounterClockwise size={20} />
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                size="lg"
              >
                <Export size={20} />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="physics-text">Text Content</Label>
              <Input
                id="physics-text"
                value={text}
                onChange={e => setText(e.target.value.toUpperCase())}
                placeholder="Enter text..."
                className="font-bold text-lg"
              />
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border">
              <Cursor size={24} weight="duotone" className="text-accent" />
              <div className="flex-1">
                <Label htmlFor="cursor-attraction" className="text-sm font-semibold">
                  Cursor Attraction
                </Label>
                <p className="text-xs text-muted-foreground">
                  Move your mouse to attract particles
                </p>
              </div>
              <Switch
                id="cursor-attraction"
                checked={cursorAttraction}
                onCheckedChange={setCursorAttraction}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Tabs defaultValue="controls">
              <TabsList className="w-full">
                <TabsTrigger value="controls" className="flex-1">Controls</TabsTrigger>
                <TabsTrigger value="presets" className="flex-1">Presets</TabsTrigger>
              </TabsList>

              <TabsContent value="controls" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span>Gravity</span>
                    <span className="text-xs text-muted-foreground">{config.gravity.toFixed(2)}</span>
                  </Label>
                  <Slider
                    value={[config.gravity]}
                    onValueChange={([v]) => setConfig({ ...config, gravity: v })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span>Elasticity</span>
                    <span className="text-xs text-muted-foreground">{config.elasticity.toFixed(2)}</span>
                  </Label>
                  <Slider
                    value={[config.elasticity]}
                    onValueChange={([v]) => setConfig({ ...config, elasticity: v })}
                    min={0}
                    max={1}
                    step={0.05}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span>Wind</span>
                    <span className="text-xs text-muted-foreground">{config.wind.toFixed(2)}</span>
                  </Label>
                  <Slider
                    value={[config.wind]}
                    onValueChange={([v]) => setConfig({ ...config, wind: v })}
                    min={-1}
                    max={1}
                    step={0.05}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span>Damping</span>
                    <span className="text-xs text-muted-foreground">{config.damping.toFixed(3)}</span>
                  </Label>
                  <Slider
                    value={[config.damping]}
                    onValueChange={([v]) => setConfig({ ...config, damping: v })}
                    min={0.5}
                    max={1}
                    step={0.01}
                    className="py-2"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor="repulsion" className="text-sm">
                    Repulsion Force
                  </Label>
                  <Switch
                    id="repulsion"
                    checked={config.repulsion}
                    onCheckedChange={(checked) => setConfig({ ...config, repulsion: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor="attraction" className="text-sm">
                    Attraction Force
                  </Label>
                  <Switch
                    id="attraction"
                    checked={config.attraction}
                    onCheckedChange={(checked) => setConfig({ ...config, attraction: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor="wall-bounce" className="text-sm">
                    Wall Bounce
                  </Label>
                  <Switch
                    id="wall-bounce"
                    checked={config.wallBounce}
                    onCheckedChange={(checked) => setConfig({ ...config, wallBounce: checked })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="presets" className="space-y-2 mt-4">
                {presets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => applyPreset(preset)}
                    className="w-full p-4 rounded-lg border-2 border-border hover:border-accent hover:bg-accent/5 transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-accent mt-1">
                        {preset.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{preset.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {preset.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </TabsContent>
            </Tabs>

            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                <span className="text-muted-foreground">
                  {isPlaying ? '▶ Playing' : '⏸ Paused'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {particles.length} particles • {Math.round(1000 / 60)}fps target
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
