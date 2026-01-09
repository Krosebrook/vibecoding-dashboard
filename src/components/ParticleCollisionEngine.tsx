import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Atom, Play, Pause, ArrowsClockwise, Magnet, Lightning, Planet } from '@phosphor-icons/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type CollisionMode = 'bounce' | 'merge' | 'destroy' | 'pass-through' | 'magnetize'
type ForceField = 'gravity' | 'repulsion' | 'vortex' | 'wind' | 'none'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  mass: number
  color: string
  life: number
  trail: { x: number; y: number }[]
}

export function ParticleCollisionEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [isPlaying, setIsPlaying] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  
  const [particleCount, setParticleCount] = useState([50])
  const [collisionMode, setCollisionMode] = useState<CollisionMode>('bounce')
  const [forceField, setForceField] = useState<ForceField>('none')
  const [restitution, setRestitution] = useState([0.8])
  const [friction, setFriction] = useState([0.99])
  const [gravity, setGravity] = useState([0.1])
  const [forceStrength, setForceStrength] = useState([0.5])
  const [showTrails, setShowTrails] = useState(false)
  const [showVectors, setShowVectors] = useState(false)
  const [enableWallCollision, setEnableWallCollision] = useState(true)
  const [mergeThreshold, setMergeThreshold] = useState([20])

  const colors = [
    'oklch(0.75 0.15 195)',
    'oklch(0.45 0.19 250)',
    'oklch(0.50 0.15 290)',
    'oklch(0.75 0.20 340)',
    'oklch(0.80 0.18 120)',
  ]

  const initializeParticles = (count: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: Math.random() * 10 + 5,
        mass: Math.random() * 5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        trail: [],
      })
    }
    setParticles(newParticles)
  }

  const handleReset = () => {
    setIsPlaying(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    initializeParticles(particleCount[0])
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      initializeParticles(particleCount[0])
    }
  }, [particleCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const checkCollision = (p1: Particle, p2: Particle): boolean => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < p1.radius + p2.radius
  }

  const resolveCollision = (p1: Particle, p2: Particle, mode: CollisionMode) => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance === 0) return { p1, p2, merged: null }

    switch (mode) {
      case 'bounce': {
        const nx = dx / distance
        const ny = dy / distance
        
        const relVelX = p1.vx - p2.vx
        const relVelY = p1.vy - p2.vy
        const velAlongNormal = relVelX * nx + relVelY * ny
        
        if (velAlongNormal > 0) return { p1, p2, merged: null }
        
        const impulse = (2 * velAlongNormal) / (p1.mass + p2.mass)
        
        p1.vx -= impulse * p2.mass * nx * restitution[0]
        p1.vy -= impulse * p2.mass * ny * restitution[0]
        p2.vx += impulse * p1.mass * nx * restitution[0]
        p2.vy += impulse * p1.mass * ny * restitution[0]
        
        const overlap = (p1.radius + p2.radius - distance) / 2
        p1.x -= overlap * nx
        p1.y -= overlap * ny
        p2.x += overlap * nx
        p2.y += overlap * ny
        
        return { p1, p2, merged: null }
      }
      
      case 'merge': {
        if (distance < mergeThreshold[0]) {
          const totalMass = p1.mass + p2.mass
          const merged: Particle = {
            id: Date.now(),
            x: (p1.x * p1.mass + p2.x * p2.mass) / totalMass,
            y: (p1.y * p1.mass + p2.y * p2.mass) / totalMass,
            vx: (p1.vx * p1.mass + p2.vx * p2.mass) / totalMass,
            vy: (p1.vy * p1.mass + p2.vy * p2.mass) / totalMass,
            radius: Math.sqrt(p1.radius * p1.radius + p2.radius * p2.radius),
            mass: totalMass,
            color: p1.mass > p2.mass ? p1.color : p2.color,
            life: 1,
            trail: [],
          }
          return { p1: null, p2: null, merged }
        }
        return { p1, p2, merged: null }
      }
      
      case 'destroy': {
        p1.life -= 0.02
        p2.life -= 0.02
        return { p1, p2, merged: null }
      }
      
      case 'magnetize': {
        const force = forceStrength[0] * 0.1
        const nx = dx / distance
        const ny = dy / distance
        
        p1.vx += nx * force / p1.mass
        p1.vy += ny * force / p1.mass
        p2.vx -= nx * force / p2.mass
        p2.vy -= ny * force / p2.mass
        
        return { p1, p2, merged: null }
      }
      
      case 'pass-through':
      default:
        return { p1, p2, merged: null }
    }
  }

  const applyForceField = (particle: Particle, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const dx = centerX - particle.x
    const dy = centerY - particle.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance === 0) return
    
    const strength = forceStrength[0] * 0.01
    
    switch (forceField) {
      case 'gravity': {
        const force = strength * particle.mass / (distance * distance)
        particle.vx += (dx / distance) * force * 100
        particle.vy += (dy / distance) * force * 100
        break
      }
      
      case 'repulsion': {
        const force = strength * particle.mass / (distance * distance)
        particle.vx -= (dx / distance) * force * 100
        particle.vy -= (dy / distance) * force * 100
        break
      }
      
      case 'vortex': {
        const force = strength * 0.1
        const angle = Math.atan2(dy, dx)
        particle.vx += Math.cos(angle + Math.PI / 2) * force * 10
        particle.vy += Math.sin(angle + Math.PI / 2) * force * 10
        break
      }
      
      case 'wind': {
        particle.vx += strength * 0.5
        particle.vy += Math.sin(Date.now() * 0.001) * strength * 0.2
        break
      }
    }
  }

  useEffect(() => {
    if (!isPlaying) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let currentParticles = particles

    const animate = () => {
      ctx.fillStyle = 'oklch(0.15 0.01 260)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      let updatedParticles = [...currentParticles]

      updatedParticles.forEach(particle => {
        if (forceField !== 'none') {
          applyForceField(particle, canvas)
        }
        
        particle.vy += gravity[0] * 0.1
        
        particle.vx *= friction[0]
        particle.vy *= friction[0]
        
        particle.x += particle.vx
        particle.y += particle.vy

        if (enableWallCollision) {
          if (particle.x - particle.radius < 0) {
            particle.x = particle.radius
            particle.vx *= -restitution[0]
          } else if (particle.x + particle.radius > canvas.width) {
            particle.x = canvas.width - particle.radius
            particle.vx *= -restitution[0]
          }
          
          if (particle.y - particle.radius < 0) {
            particle.y = particle.radius
            particle.vy *= -restitution[0]
          } else if (particle.y + particle.radius > canvas.height) {
            particle.y = canvas.height - particle.radius
            particle.vy *= -restitution[0]
          }
        }

        if (showTrails) {
          particle.trail.push({ x: particle.x, y: particle.y })
          if (particle.trail.length > 20) {
            particle.trail.shift()
          }
        } else {
          particle.trail = []
        }
      })

      for (let i = 0; i < updatedParticles.length; i++) {
        for (let j = i + 1; j < updatedParticles.length; j++) {
          const p1 = updatedParticles[i]
          const p2 = updatedParticles[j]
          
          if (checkCollision(p1, p2)) {
            const result = resolveCollision(p1, p2, collisionMode)
            
            if (result.merged) {
              updatedParticles.splice(j, 1)
              updatedParticles.splice(i, 1)
              updatedParticles.push(result.merged)
              break
            }
          }
        }
      }

      updatedParticles = updatedParticles.filter(p => p.life > 0)

      updatedParticles.forEach(particle => {
        if (showTrails && particle.trail.length > 1) {
          ctx.strokeStyle = particle.color
          ctx.lineWidth = 2
          ctx.globalAlpha = 0.3
          ctx.beginPath()
          ctx.moveTo(particle.trail[0].x, particle.trail[0].y)
          for (let i = 1; i < particle.trail.length; i++) {
            ctx.lineTo(particle.trail[i].x, particle.trail[i].y)
          }
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.life
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1

        if (showVectors && (particle.vx !== 0 || particle.vy !== 0)) {
          const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
          const scale = Math.min(speed * 3, 50)
          const endX = particle.x + (particle.vx / speed) * scale
          const endY = particle.y + (particle.vy / speed) * scale
          
          ctx.strokeStyle = 'oklch(0.75 0.15 195)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(endX, endY)
          ctx.stroke()
          
          const angle = Math.atan2(particle.vy, particle.vx)
          const arrowSize = 5
          ctx.beginPath()
          ctx.moveTo(endX, endY)
          ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
          )
          ctx.moveTo(endX, endY)
          ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
          )
          ctx.stroke()
        }
      })

      if (forceField !== 'none') {
        ctx.strokeStyle = 'oklch(0.75 0.15 195 / 0.2)'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }

      currentParticles = updatedParticles
      setParticles(updatedParticles)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, collisionMode, forceField, restitution, friction, gravity, forceStrength, showTrails, showVectors, enableWallCollision, mergeThreshold])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Atom size={24} weight="duotone" className="text-accent" />
          Particle Collision & Interaction Physics
        </CardTitle>
        <CardDescription>
          Advanced collision detection with force fields and interactive behaviors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1"
            variant={isPlaying ? 'secondary' : 'default'}
          >
            {isPlaying ? (
              <>
                <Pause size={20} className="mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play size={20} className="mr-2" />
                Play
              </>
            )}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <ArrowsClockwise size={20} className="mr-2" />
            Reset
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Badge variant="outline" className="gap-2">
            <Atom size={16} />
            {particles.length} Particles
          </Badge>
          <Badge variant="outline" className="gap-2 capitalize">
            {collisionMode.replace('-', ' ')}
          </Badge>
          <Badge variant="outline" className="gap-2 capitalize">
            {forceField === 'none' ? 'No Field' : forceField}
          </Badge>
        </div>

        <div className="relative w-full h-[500px] rounded-lg overflow-hidden border-2 border-border bg-background">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        </div>

        <Tabs defaultValue="collision" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collision">Collision</TabsTrigger>
            <TabsTrigger value="forces">Forces</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          <TabsContent value="collision" className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label>Collision Mode</Label>
              <Select value={collisionMode} onValueChange={(v) => setCollisionMode(v as CollisionMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bounce">
                    <div className="flex items-center gap-2">
                      <Lightning size={16} />
                      <span>Bounce - Realistic elastic collision</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="merge">
                    <div className="flex items-center gap-2">
                      <Magnet size={16} />
                      <span>Merge - Combine particles on contact</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="destroy">
                    <div className="flex items-center gap-2">
                      <Atom size={16} />
                      <span>Destroy - Fade on collision</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="magnetize">
                    <div className="flex items-center gap-2">
                      <Magnet size={16} />
                      <span>Magnetize - Attract on proximity</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pass-through">
                    <div className="flex items-center gap-2">
                      <Planet size={16} />
                      <span>Pass Through - No collision</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Particle Count: {particleCount[0]}</Label>
              </div>
              <Slider
                value={particleCount}
                onValueChange={setParticleCount}
                min={10}
                max={200}
                step={10}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Restitution (Bounciness): {restitution[0].toFixed(2)}</Label>
              </div>
              <Slider
                value={restitution}
                onValueChange={setRestitution}
                min={0}
                max={1}
                step={0.05}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Friction: {friction[0].toFixed(2)}</Label>
              </div>
              <Slider
                value={friction}
                onValueChange={setFriction}
                min={0.9}
                max={1}
                step={0.01}
              />
            </div>

            {collisionMode === 'merge' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Merge Distance: {mergeThreshold[0]}px</Label>
                </div>
                <Slider
                  value={mergeThreshold}
                  onValueChange={setMergeThreshold}
                  min={5}
                  max={50}
                  step={5}
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <Label htmlFor="wall-collision">Enable Wall Collision</Label>
              <Switch
                id="wall-collision"
                checked={enableWallCollision}
                onCheckedChange={setEnableWallCollision}
              />
            </div>
          </TabsContent>

          <TabsContent value="forces" className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label>Force Field Type</Label>
              <Select value={forceField} onValueChange={(v) => setForceField(v as ForceField)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - No force field</SelectItem>
                  <SelectItem value="gravity">Gravity - Pull to center</SelectItem>
                  <SelectItem value="repulsion">Repulsion - Push from center</SelectItem>
                  <SelectItem value="vortex">Vortex - Spiral around center</SelectItem>
                  <SelectItem value="wind">Wind - Horizontal flow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Gravity Strength: {gravity[0].toFixed(2)}</Label>
              </div>
              <Slider
                value={gravity}
                onValueChange={setGravity}
                min={0}
                max={1}
                step={0.05}
              />
            </div>

            {forceField !== 'none' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Force Field Strength: {forceStrength[0].toFixed(2)}</Label>
                </div>
                <Slider
                  value={forceStrength}
                  onValueChange={setForceStrength}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="display" className="space-y-6 pt-4">
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <div>
                <Label htmlFor="show-trails">Show Particle Trails</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Display motion paths behind particles
                </p>
              </div>
              <Switch
                id="show-trails"
                checked={showTrails}
                onCheckedChange={setShowTrails}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <div>
                <Label htmlFor="show-vectors">Show Velocity Vectors</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Display speed and direction arrows
                </p>
              </div>
              <Switch
                id="show-vectors"
                checked={showVectors}
                onCheckedChange={setShowVectors}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
