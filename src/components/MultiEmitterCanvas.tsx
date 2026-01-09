import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, ArrowsClockwise, Download, Plus, Trash, Eye, EyeSlash, Copy } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  text: string
  fontSize: number
  rotation: number
  rotationSpeed: number
  opacity: number
  life: number
  maxLife: number
  color: string
  emitterId: string
}

interface EmitterInstance {
  id: string
  name: string
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
  lifespan: number
  colorPalette: string[]
  emitterType: 'point' | 'burst'
  textSource: string
  enabled: boolean
  lastEmit: number
}

const RANDOM_WORDS = [
  'Spark', 'Flow', 'Vibe', 'Dream', 'Code', 'Magic', 'Pixel', 'Glow',
  'Burst', 'Wave', 'Pulse', 'Shine', 'Swift', 'Bold', 'Pure', 'Live'
]

export function MultiEmitterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const particlesRef = useRef<Particle[]>([])
  const particleIdRef = useRef<number>(0)
  
  const [emitters, setEmitters] = useState<EmitterInstance[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [particleCount, setParticleCount] = useState(0)
  const [selectedEmitterId, setSelectedEmitterId] = useState<string | null>(null)

  const createEmitter = (): EmitterInstance => ({
    id: `emitter-${Date.now()}-${Math.random()}`,
    name: `Emitter ${emitters.length + 1}`,
    x: 50,
    y: 50,
    rate: 10,
    spread: 180,
    velocity: 4,
    gravity: 0.1,
    friction: 0.99,
    rotation: true,
    rotationSpeed: 2,
    fontSize: 20,
    lifespan: 3000,
    colorPalette: ['#6366f1', '#8b5cf6', '#ec4899'],
    emitterType: 'point',
    textSource: 'random',
    enabled: true,
    lastEmit: 0
  })

  const addEmitter = () => {
    const newEmitter = createEmitter()
    setEmitters(prev => [...prev, newEmitter])
    setSelectedEmitterId(newEmitter.id)
    toast.success('Emitter added!')
  }

  const removeEmitter = (id: string) => {
    setEmitters(prev => prev.filter(e => e.id !== id))
    if (selectedEmitterId === id) {
      setSelectedEmitterId(null)
    }
    toast.success('Emitter removed!')
  }

  const duplicateEmitter = (emitter: EmitterInstance) => {
    const newEmitter = {
      ...emitter,
      id: `emitter-${Date.now()}-${Math.random()}`,
      name: `${emitter.name} (Copy)`,
      x: (emitter.x + 10) % 100,
      y: (emitter.y + 10) % 100,
      lastEmit: 0
    }
    setEmitters(prev => [...prev, newEmitter])
    toast.success('Emitter duplicated!')
  }

  const toggleEmitter = (id: string) => {
    setEmitters(prev => prev.map(e => 
      e.id === id ? { ...e, enabled: !e.enabled } : e
    ))
  }

  const createParticle = (emitter: EmitterInstance): Particle | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const spawnX = (emitter.x / 100) * canvas.width
    const spawnY = (emitter.y / 100) * canvas.height

    let angle = -Math.PI / 2
    if (emitter.emitterType === 'burst') {
      angle = Math.random() * Math.PI * 2
    }

    const spreadRad = (emitter.spread * Math.PI) / 180
    const randomSpread = (Math.random() - 0.5) * spreadRad
    const finalAngle = angle + randomSpread

    const speed = emitter.velocity * (0.5 + Math.random() * 0.5)
    const vx = Math.cos(finalAngle) * speed
    const vy = Math.sin(finalAngle) * speed

    const text = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)]
    const color = emitter.colorPalette[Math.floor(Math.random() * emitter.colorPalette.length)]

    return {
      id: particleIdRef.current++,
      x: spawnX,
      y: spawnY,
      vx,
      vy,
      text,
      fontSize: emitter.fontSize,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * emitter.rotationSpeed * 0.1,
      opacity: 0,
      life: 0,
      maxLife: emitter.lifespan,
      color,
      emitterId: emitter.id
    }
  }

  const updateParticle = (particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean => {
    particle.life += deltaTime

    if (particle.life >= particle.maxLife) {
      return false
    }

    const emitter = emitters.find(e => e.id === particle.emitterId)
    if (!emitter) return false

    particle.vy += emitter.gravity
    particle.vx *= emitter.friction
    particle.vy *= emitter.friction

    particle.x += particle.vx
    particle.y += particle.vy

    if (emitter.rotation) {
      particle.rotation += particle.rotationSpeed
    }

    const lifeRatio = particle.life / particle.maxLife
    
    if (lifeRatio < 0.1) {
      particle.opacity = lifeRatio * 10
    } else if (lifeRatio > 0.8) {
      particle.opacity = (1 - lifeRatio) * 5
    } else {
      particle.opacity = 1
    }

    particle.opacity = Math.max(0, Math.min(1, particle.opacity))

    return particle.x > -50 && particle.x < canvas.width + 50 && 
           particle.y > -50 && particle.y < canvas.height + 50
  }

  const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.globalCompositeOperation = 'lighter'

    particlesRef.current.forEach(particle => {
      ctx.save()
      
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)
      
      ctx.globalAlpha = particle.opacity
      ctx.fillStyle = particle.color
      ctx.font = `bold ${particle.fontSize}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-space').replace(/'/g, '').trim()}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      ctx.shadowBlur = 10
      ctx.shadowColor = particle.color
      
      ctx.fillText(particle.text, 0, 0)
      
      ctx.restore()
    })

    ctx.globalCompositeOperation = 'source-over'
    
    emitters.forEach(emitter => {
      if (!emitter.enabled) return

      const emitterX = (emitter.x / 100) * canvas.width
      const emitterY = (emitter.y / 100) * canvas.height

      const isSelected = emitter.id === selectedEmitterId
      
      ctx.fillStyle = isSelected ? 'rgba(236, 72, 153, 0.4)' : 'rgba(139, 92, 246, 0.3)'
      ctx.strokeStyle = isSelected ? 'rgba(236, 72, 153, 1)' : 'rgba(139, 92, 246, 0.8)'
      ctx.lineWidth = isSelected ? 3 : 2

      ctx.beginPath()
      ctx.arc(emitterX, emitterY, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      if (isSelected) {
        ctx.font = '12px monospace'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillText(emitter.name, emitterX, emitterY - 15)
      }
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      if (!isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      emitters.forEach(emitter => {
        if (!emitter.enabled) return

        const emitInterval = 1000 / emitter.rate
        if (currentTime - emitter.lastEmit > emitInterval) {
          const newParticle = createParticle(emitter)
          if (newParticle) {
            particlesRef.current.push(newParticle)
          }
          emitter.lastEmit = currentTime
        }
      })

      particlesRef.current = particlesRef.current.filter(particle => 
        updateParticle(particle, deltaTime, canvas)
      )

      setParticleCount(particlesRef.current.length)

      render(ctx, canvas)

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [emitters, isPlaying, selectedEmitterId])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    if (selectedEmitterId) {
      setEmitters(prev => prev.map(em => 
        em.id === selectedEmitterId ? { ...em, x, y } : em
      ))
    }
  }

  const handleReset = () => {
    particlesRef.current = []
    setParticleCount(0)
    toast.success('Particles cleared!')
  }

  const handleExport = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `multi-emitter-${Date.now()}.png`
        link.click()
        URL.revokeObjectURL(url)
        toast.success('Canvas exported!')
      }
    })
  }

  return (
    <Card className="border-2 border-secondary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                <Plus size={20} weight="bold" className="text-secondary-foreground" />
              </div>
              Multi-Emitter System
            </CardTitle>
            <CardDescription>
              Manage multiple particle emitters on a single canvas
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={addEmitter}
            >
              <Plus size={16} className="mr-1" />
              Add Emitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <ArrowsClockwise size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid lg:grid-cols-[280px,1fr] gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Emitters ({emitters.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {emitters.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      No emitters yet.<br />Click "Add Emitter" to start
                    </div>
                  ) : (
                    <div className="space-y-2 pr-3">
                      {emitters.map((emitter) => (
                        <div
                          key={emitter.id}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedEmitterId === emitter.id
                              ? 'border-accent bg-accent/10'
                              : 'border-border hover:border-accent/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <button
                              className="flex-1 text-left"
                              onClick={() => setSelectedEmitterId(emitter.id)}
                            >
                              <div className="font-medium text-sm">{emitter.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {emitter.rate}/s · {emitter.emitterType}
                              </div>
                            </button>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleEmitter(emitter.id)}
                                className="h-7 w-7 p-0"
                              >
                                {emitter.enabled ? <Eye size={14} /> : <EyeSlash size={14} />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => duplicateEmitter(emitter)}
                                className="h-7 w-7 p-0"
                              >
                                <Copy size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEmitter(emitter.id)}
                                className="h-7 w-7 p-0 text-destructive"
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {emitter.colorPalette.slice(0, 3).map((color, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded border border-border"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          {!emitter.enabled && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              Disabled
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-lg">
              <div className="font-semibold">Instructions:</div>
              <div>• Click "Add Emitter" to create a new emitter</div>
              <div>• Select an emitter from the list</div>
              <div>• Click on the canvas to move the selected emitter</div>
              <div>• Use controls to enable/disable or remove emitters</div>
            </div>

            <div className="pt-2">
              <div className="text-sm text-muted-foreground">
                Active Particles: <span className="font-bold text-foreground">{particleCount}</span>
              </div>
            </div>
          </div>

          <div className="relative bg-muted/30 rounded-lg border-2 border-border overflow-hidden min-h-[600px]">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-full"
              style={{ cursor: selectedEmitterId ? 'crosshair' : 'default' }}
            />
            {selectedEmitterId && (
              <div className="absolute top-4 left-4 bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium">
                Click to position emitter
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
