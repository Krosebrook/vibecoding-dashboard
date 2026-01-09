import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, ArrowsClockwise, Download, Sparkle } from '@phosphor-icons/react'
import { ParticlePresets } from '@/components/ParticlePresets'
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
  scale: number
}

interface EmitterConfig {
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

const DEFAULT_CONFIG: EmitterConfig = {
  x: 50,
  y: 50,
  rate: 5,
  spread: 180,
  velocity: 3,
  gravity: 0.1,
  friction: 0.99,
  rotation: true,
  rotationSpeed: 2,
  fontSize: 24,
  fontSizeVariation: 10,
  lifespan: 3000,
  fadeIn: true,
  fadeOut: true,
  colorPalette: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'],
  emitterType: 'point',
  emitterSize: 100,
  textSource: 'random',
  customText: 'Hello World',
  bounce: false,
  bounceStrength: 0.7
}

const RANDOM_WORDS = [
  'Spark', 'Flow', 'Vibe', 'Dream', 'Code', 'Magic', 'Pixel', 'Glow',
  'Burst', 'Wave', 'Pulse', 'Shine', 'Swift', 'Bold', 'Pure', 'Live',
  'Neon', 'Echo', 'Flux', 'Zen', 'Nova', 'Blaze', 'Drift', 'Quest',
  'Epic', 'Sage', 'Zeal', 'Volt', 'Aura', 'Prism', 'Cosmic', 'Lunar'
]

export function ParticleEmitterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const particlesRef = useRef<Particle[]>([])
  const lastEmitRef = useRef<number>(0)
  const particleIdRef = useRef<number>(0)
  
  const [config, setConfig] = useState<EmitterConfig>(DEFAULT_CONFIG)
  const [isPlaying, setIsPlaying] = useState(true)
  const [particleCount, setParticleCount] = useState(0)
  const [generatingText, setGeneratingText] = useState(false)
  const [llmWords, setLlmWords] = useState<string[]>([])
  const [llmIndex, setLlmIndex] = useState(0)

  const updateConfig = <K extends keyof EmitterConfig>(key: K, value: EmitterConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const getRandomWord = (): string => {
    if (config.textSource === 'custom') {
      return config.customText
    } else if (config.textSource === 'llm' && llmWords.length > 0) {
      const word = llmWords[llmIndex % llmWords.length]
      setLlmIndex(prev => prev + 1)
      return word
    } else {
      return RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)]
    }
  }

  const generateLLMWords = async () => {
    setGeneratingText(true)
    try {
      const promptText = 'Generate exactly 30 creative, inspiring, tech-related words (single words only, no phrases). These will be used for a particle text emitter. Return the result as a JSON object with a single property "words" that contains an array of strings.'
      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const data = JSON.parse(response)
      if (data.words && Array.isArray(data.words)) {
        setLlmWords(data.words)
        setLlmIndex(0)
        toast.success(`Generated ${data.words.length} AI words!`)
      }
    } catch (error) {
      console.error('Failed to generate words:', error)
      toast.error('Failed to generate AI words')
    } finally {
      setGeneratingText(false)
    }
  }

  const createParticle = (emitterX: number, emitterY: number): Particle | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    let spawnX = emitterX
    let spawnY = emitterY
    let angle = 0

    if (config.emitterType === 'line') {
      const offset = (Math.random() - 0.5) * config.emitterSize
      spawnX = emitterX + offset
      angle = -Math.PI / 2
    } else if (config.emitterType === 'circle') {
      const circleAngle = Math.random() * Math.PI * 2
      const radius = config.emitterSize / 2
      spawnX = emitterX + Math.cos(circleAngle) * radius
      spawnY = emitterY + Math.sin(circleAngle) * radius
      angle = circleAngle
    } else if (config.emitterType === 'burst') {
      angle = Math.random() * Math.PI * 2
    } else {
      angle = -Math.PI / 2
    }

    const spreadRad = (config.spread * Math.PI) / 180
    const randomSpread = (Math.random() - 0.5) * spreadRad
    const finalAngle = angle + randomSpread

    const speed = config.velocity * (0.5 + Math.random() * 0.5)
    const vx = Math.cos(finalAngle) * speed
    const vy = Math.sin(finalAngle) * speed

    const fontVariation = (Math.random() - 0.5) * config.fontSizeVariation
    const fontSize = Math.max(10, config.fontSize + fontVariation)

    return {
      id: particleIdRef.current++,
      x: spawnX,
      y: spawnY,
      vx,
      vy,
      text: getRandomWord(),
      fontSize,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * config.rotationSpeed * 0.1,
      opacity: config.fadeIn ? 0 : 1,
      life: 0,
      maxLife: config.lifespan,
      color: config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)],
      scale: 1
    }
  }

  const updateParticle = (particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean => {
    particle.life += deltaTime

    if (particle.life >= particle.maxLife) {
      return false
    }

    particle.vy += config.gravity
    particle.vx *= config.friction
    particle.vy *= config.friction

    particle.x += particle.vx
    particle.y += particle.vy

    if (config.bounce) {
      const margin = particle.fontSize
      if (particle.y + margin > canvas.height && particle.vy > 0) {
        particle.vy *= -config.bounceStrength
        particle.y = canvas.height - margin
      }
      if (particle.x - margin < 0 && particle.vx < 0) {
        particle.vx *= -config.bounceStrength
        particle.x = margin
      }
      if (particle.x + margin > canvas.width && particle.vx > 0) {
        particle.vx *= -config.bounceStrength
        particle.x = canvas.width - margin
      }
    }

    if (config.rotation) {
      particle.rotation += particle.rotationSpeed
    }

    const lifeRatio = particle.life / particle.maxLife
    
    if (config.fadeIn && lifeRatio < 0.1) {
      particle.opacity = lifeRatio * 10
    } else if (config.fadeOut && lifeRatio > 0.8) {
      particle.opacity = (1 - lifeRatio) * 5
    } else if (!config.fadeIn && particle.opacity < 1) {
      particle.opacity = 1
    }

    particle.opacity = Math.max(0, Math.min(1, particle.opacity))

    return true
  }

  const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.globalCompositeOperation = 'lighter'

    particlesRef.current.forEach(particle => {
      ctx.save()
      
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)
      ctx.scale(particle.scale, particle.scale)
      
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
    
    const emitterX = (config.x / 100) * canvas.width
    const emitterY = (config.y / 100) * canvas.height

    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)'
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)'
    ctx.lineWidth = 2

    if (config.emitterType === 'point') {
      ctx.beginPath()
      ctx.arc(emitterX, emitterY, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    } else if (config.emitterType === 'line') {
      const halfSize = config.emitterSize / 2
      ctx.beginPath()
      ctx.moveTo(emitterX - halfSize, emitterY)
      ctx.lineTo(emitterX + halfSize, emitterY)
      ctx.stroke()
    } else if (config.emitterType === 'circle') {
      ctx.beginPath()
      ctx.arc(emitterX, emitterY, config.emitterSize / 2, 0, Math.PI * 2)
      ctx.stroke()
    }
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

      const emitterX = (config.x / 100) * canvas.width
      const emitterY = (config.y / 100) * canvas.height

      const emitInterval = 1000 / config.rate
      if (currentTime - lastEmitRef.current > emitInterval) {
        const newParticle = createParticle(emitterX, emitterY)
        if (newParticle) {
          particlesRef.current.push(newParticle)
        }
        lastEmitRef.current = currentTime
      }

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
  }, [config, isPlaying])

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
        link.download = `particle-emitter-${Date.now()}.png`
        link.click()
        URL.revokeObjectURL(url)
        toast.success('Canvas exported!')
      }
    })
  }

  const handleApplyPreset = (presetConfig: any) => {
    setConfig(presetConfig)
    handleReset()
    toast.success('Preset applied!')
  }

  return (
    <Card className="border-2 border-accent/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkle size={24} weight="duotone" className="text-accent" />
              Particle Emitter System
            </CardTitle>
            <CardDescription>
              Continuous text spawning with physics-based particle system
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
        <div className="grid lg:grid-cols-[300px,1fr,280px] gap-6">
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            <Tabs defaultValue="emitter">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="emitter">Emitter</TabsTrigger>
                <TabsTrigger value="physics">Physics</TabsTrigger>
                <TabsTrigger value="appearance">Style</TabsTrigger>
              </TabsList>

              <TabsContent value="emitter" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Emitter Type</Label>
                  <Select value={config.emitterType} onValueChange={(value: any) => updateConfig('emitterType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="point">Point</SelectItem>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="burst">Burst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(config.emitterType === 'line' || config.emitterType === 'circle') && (
                  <div className="space-y-2">
                    <Label>Emitter Size: {config.emitterSize}px</Label>
                    <Slider
                      value={[config.emitterSize]}
                      onValueChange={([value]) => updateConfig('emitterSize', value)}
                      min={20}
                      max={300}
                      step={10}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Position X: {config.x}%</Label>
                  <Slider
                    value={[config.x]}
                    onValueChange={([value]) => updateConfig('x', value)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Position Y: {config.y}%</Label>
                  <Slider
                    value={[config.y]}
                    onValueChange={([value]) => updateConfig('y', value)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Emission Rate: {config.rate}/s</Label>
                  <Slider
                    value={[config.rate]}
                    onValueChange={([value]) => updateConfig('rate', value)}
                    min={1}
                    max={30}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Spread: {config.spread}°</Label>
                  <Slider
                    value={[config.spread]}
                    onValueChange={([value]) => updateConfig('spread', value)}
                    min={0}
                    max={360}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Velocity: {config.velocity.toFixed(1)}</Label>
                  <Slider
                    value={[config.velocity]}
                    onValueChange={([value]) => updateConfig('velocity', value)}
                    min={0.5}
                    max={10}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lifespan: {(config.lifespan / 1000).toFixed(1)}s</Label>
                  <Slider
                    value={[config.lifespan]}
                    onValueChange={([value]) => updateConfig('lifespan', value)}
                    min={1000}
                    max={10000}
                    step={100}
                  />
                </div>
              </TabsContent>

              <TabsContent value="physics" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Gravity: {config.gravity.toFixed(2)}</Label>
                  <Slider
                    value={[config.gravity]}
                    onValueChange={([value]) => updateConfig('gravity', value)}
                    min={-0.5}
                    max={1}
                    step={0.01}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Friction: {config.friction.toFixed(2)}</Label>
                  <Slider
                    value={[config.friction]}
                    onValueChange={([value]) => updateConfig('friction', value)}
                    min={0.9}
                    max={1}
                    step={0.001}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable Rotation</Label>
                  <Switch
                    checked={config.rotation}
                    onCheckedChange={(checked) => updateConfig('rotation', checked)}
                  />
                </div>

                {config.rotation && (
                  <div className="space-y-2">
                    <Label>Rotation Speed: {config.rotationSpeed.toFixed(1)}</Label>
                    <Slider
                      value={[config.rotationSpeed]}
                      onValueChange={([value]) => updateConfig('rotationSpeed', value)}
                      min={0}
                      max={10}
                      step={0.1}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label>Enable Bounce</Label>
                  <Switch
                    checked={config.bounce}
                    onCheckedChange={(checked) => updateConfig('bounce', checked)}
                  />
                </div>

                {config.bounce && (
                  <div className="space-y-2">
                    <Label>Bounce Strength: {config.bounceStrength.toFixed(2)}</Label>
                    <Slider
                      value={[config.bounceStrength]}
                      onValueChange={([value]) => updateConfig('bounceStrength', value)}
                      min={0}
                      max={1}
                      step={0.05}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Text Source</Label>
                  <Select value={config.textSource} onValueChange={(value: any) => updateConfig('textSource', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random Words</SelectItem>
                      <SelectItem value="custom">Custom Text</SelectItem>
                      <SelectItem value="llm">AI Generated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.textSource === 'custom' && (
                  <div className="space-y-2">
                    <Label>Custom Text</Label>
                    <Input
                      value={config.customText}
                      onChange={(e) => updateConfig('customText', e.target.value)}
                      placeholder="Enter text..."
                    />
                  </div>
                )}

                {config.textSource === 'llm' && (
                  <div className="space-y-2">
                    <Button
                      onClick={generateLLMWords}
                      disabled={generatingText}
                      className="w-full"
                      variant="secondary"
                    >
                      {generatingText ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-secondary-foreground border-t-transparent rounded-full" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkle size={16} className="mr-2" />
                          Generate AI Words {llmWords.length > 0 && `(${llmWords.length})`}
                        </>
                      )}
                    </Button>
                    {llmWords.length > 0 && (
                      <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                        {llmWords.slice(0, 10).join(', ')}...
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Font Size: {config.fontSize}px</Label>
                  <Slider
                    value={[config.fontSize]}
                    onValueChange={([value]) => updateConfig('fontSize', value)}
                    min={12}
                    max={72}
                    step={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Size Variation: ±{config.fontSizeVariation}px</Label>
                  <Slider
                    value={[config.fontSizeVariation]}
                    onValueChange={([value]) => updateConfig('fontSizeVariation', value)}
                    min={0}
                    max={30}
                    step={1}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Fade In</Label>
                  <Switch
                    checked={config.fadeIn}
                    onCheckedChange={(checked) => updateConfig('fadeIn', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Fade Out</Label>
                  <Switch
                    checked={config.fadeOut}
                    onCheckedChange={(checked) => updateConfig('fadeOut', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color Palette</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {config.colorPalette.map((color, index) => (
                      <Input
                        key={index}
                        type="color"
                        value={color}
                        onChange={(e) => {
                          const newPalette = [...config.colorPalette]
                          newPalette[index] = e.target.value
                          updateConfig('colorPalette', newPalette)
                        }}
                        className="h-10 p-1 cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Active Particles: <span className="font-bold text-foreground">{particleCount}</span>
              </div>
            </div>
          </div>

          <div className="relative bg-muted/30 rounded-lg border-2 border-border overflow-hidden min-h-[600px]">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ cursor: 'crosshair' }}
            />
          </div>

          <div className="space-y-4">
            <ParticlePresets onApplyPreset={handleApplyPreset} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
