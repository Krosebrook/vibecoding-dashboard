import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Atom, Play, Pause, ArrowCounterClockwi

  id: string
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Atom, Play, Pause, ArrowCounterClockwise, Export, Cursor, Drop, Waves, Target } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Particle {
  id: string
  char: string
  wind: num
  groundFri
}
interface Pr
  description:
  icon: React.Re

  {
}

      elasticity: 0.7,
      repulsion: 
      wind: 0,
      groundFrict
    }
  {
    descriptio
    config: {
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
   
    name: 'Gentle Fall',
    description: 'Soft gravity with high elasticity',
    icon: <Drop size={20} weight="duotone" />,
    config: {
      gravity: 0.3,
      wind: 0.3,
      damping: 0.98,
      repulsion: false,
      attraction: false,
    descriptio
      turbulence: 0,
      groundFriction: 0.95,
      wallBounce: true
     
  },
   
    name: 'Bouncy Ball',
    description: 'High elasticity with medium gravity',
    icon: <Atom size={20} weight="duotone" />,
  const [part
      gravity: 0.5,
  
      damping: 0.995,
      repulsion: false,
      attraction: false,
      wind: 0,
      turbulence: 0,
      groundFriction: 0.98,
      wallBounce: true

  },
   
    name: 'Magnetic',
    description: 'Particles attract each other',
    icon: <Target size={20} weight="duotone" />,
      vy: (Ma
      gravity: 0.2,
      elasticity: 0.5,
      damping: 0.97,
      repulsion: false,
      attraction: true,
      wind: 0,
      turbulence: 0,
  }
      wallBounce: true
    }
  },
   
    name: 'Chaotic Storm',
      const rect = canvas.getBoundingClientR
    icon: <Waves size={20} weight="duotone" />,
      })
      gravity: 0.1,
      elasticity: 0.6,
      damping: 0.99,
      repulsion: false,
      attraction: false,
      return
      turbulence: 0.8,
      groundFriction: 0.85,
      wallBounce: true
     
  },
   
    name: 'Repulsion Field',
    description: 'Particles push away from each other',
    icon: <Atom size={20} weight="duotone" />,

      gravity: 0.4,
          }
      damping: 0.96,
              if (othe
      attraction: false,
      wind: 0,
      turbulence: 0,
      groundFriction: 0.9,
      wallBounce: true
    }
   
]

            const distSq = dx * dx + 
  const canvasRef = useRef<HTMLCanvasElement>(null)
              const force = 5 / distSq 
  const [text, setText] = useState('PHYSICS')
  const [particles, setParticles] = useState<Particle[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [cursorAttraction, setCursorAttraction] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  const [config, setConfig] = useState<PhysicsConfig>({
          }
    elasticity: 0.7,
              x = 
    repulsion: false,
              x = canv
    wind: 0,
    turbulence: 0,
    groundFriction: 0.95,

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

      x: startX + i * spacing,
    animate()
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      mass: 1,
      charge: Math.random() > 0.5 ? 1 : -1,
      color: `hsl(${(i / chars.length) * 360}, 70%, 60%)`,

    }))
   

  const handleReset = () => {
    const newParticles = initializeParticles(text)
    setParticles(newParticles)
   

  const applyPreset = (preset: Preset) => {
    setConfig(preset.config)
    toast.success(`Applied preset: ${preset.name}`)
  }

          </Badge>
    handleReset()
  }, [text])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
                  <
        x: e.clientX - rect.left,

      })
     

    canvas.addEventListener('mousemove', handleMouseMove)
    return () => canvas.removeEventListener('mousemove', handleMouseMove)
        

                  <
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
       
      return
     

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

              />
            vx += config.wind * 0.1
          <

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

                    </span>
              const force = 5 / distSq * 10000
                    onValueChange={([v]
              vy += (dy / dist) * force
             
          }

          vx *= config.damping
                      {config.

                 
          y += vy

          if (y + particle.fontSize / 2 >= canvas.height) {
            y = canvas.height - particle.fontSize / 2
            vy *= -config.elasticity
                    <span className="te
           

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
                    </Label>
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
                          {preset.description}
          ctx.fill()
          ctx.strokeStyle = 'rgba(117, 255, 220, 0.8)'
          ctx.lineWidth = 2
          ctx.stroke()
        }

        return updated
        

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
              <div className="tex
        cancelAnimationFrame(animationRef.current)
       
    }
  }, [isPlaying, config, cursorAttraction, mousePos])

              <div className="
    const canvas = canvasRef.current
        </div>

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



    <Card className="border-2 border-accent/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Atom size={28} weight="duotone" className="text-accent" />
              Physics-Based Text Engine

            <CardDescription className="mt-2">
              Gravity, elasticity, damping, and force simulation
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
            Real-time Physics
          </Badge>

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

                ) : (
                  <>
                    <Play size={20} weight="fill" className="mr-2" />
                    Play
                  </>

              </Button>

                onClick={handleReset}

                size="lg"

                <ArrowCounterClockwise size={20} />
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                size="lg"
              >
                <Export size={20} />
              </Button>



              <Label htmlFor="physics-text">Text Content</Label>

                id="physics-text"
                value={text}
                onChange={e => setText(e.target.value.toUpperCase())}
                placeholder="Enter text..."
                className="font-bold text-lg"



            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border">
              <Cursor size={24} weight="duotone" className="text-accent" />
              <div className="flex-1">
                <Label htmlFor="cursor-attraction" className="text-sm font-semibold">
                  Cursor Attraction
                </Label>
                <p className="text-xs text-muted-foreground">








            </div>







              </TabsList>









                  <Slider



                    max={2}



                </div>



                    <span>Elasticity</span>







                    min={0}

                    step={0.05}















                    max={1}

                    className="py-2"

                </div>

                <div className="space-y-2">

                    <span>Wind</span>



                  </Label>

                    value={[config.wind]}

                    min={-1}

                    step={0.05}









                    </span>









                </div>

                <div className="space-y-2">









                    min={0.5}

                    step={0.01}

                  />





                      Repulsion Force

                    <Switch







                    />
                  </div>


















                      Wall Bounce

                    <Switch



                    />

                </div>



                {presets.map((preset, i) => (







                        {preset.icon}





                        </div>



                ))}

            </Tabs>













                    {isPlaying ? '▶ Playing' : '⏸ Paused'}




          </div>






















      </CardContent>



