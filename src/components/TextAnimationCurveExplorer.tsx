import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Pause, ArrowClockwise, Copy, Code } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  textEasingCurves, 
  textTransitionPresets, 
  TextEasingFunction, 
  TextTransitionPreset,
  getCurvesByCategory,
  getCurvesByIntensity,
  getTransitionsByCategory,
  generateTextAnimationCSS,
  evaluateEasing
} from '@/lib/text-animation-curves'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function TextAnimationCurveExplorer() {
  const [selectedCurve, setSelectedCurve] = useState<TextEasingFunction>('smooth')
  const [selectedPreset, setSelectedPreset] = useState<TextTransitionPreset>(textTransitionPresets[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const [duration, setDuration] = useState(0.8)
  const [customText, setCustomText] = useState('Hello World')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterIntensity, setFilterIntensity] = useState<string>('all')

  const handlePlayAnimation = () => {
    setIsPlaying(true)
    setAnimationKey(prev => prev + 1)
    setTimeout(() => setIsPlaying(false), (selectedPreset.duration || duration) * 1000)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setAnimationKey(prev => prev + 1)
  }

  const handleCopyCurve = () => {
    const curve = textEasingCurves[selectedCurve]
    const bezierString = `cubic-bezier(${curve.bezier.join(', ')})`
    navigator.clipboard.writeText(bezierString)
    toast.success('Bezier curve copied to clipboard!')
  }

  const handleCopyCSS = () => {
    const css = generateTextAnimationCSS(selectedPreset, 'custom-text-animation')
    navigator.clipboard.writeText(css)
    toast.success('CSS animation code copied!')
  }

  const filteredCurves = Object.values(textEasingCurves).filter(curve => {
    const categoryMatch = filterCategory === 'all' || curve.category === filterCategory
    const intensityMatch = filterIntensity === 'all' || curve.intensity === filterIntensity
    return categoryMatch && intensityMatch
  })

  const curve = textEasingCurves[selectedCurve]
  const [x1, y1, x2, y2] = curve.bezier

  const renderCurvePath = () => {
    const width = 200
    const height = 200
    const padding = 20
    const graphWidth = width - padding * 2
    const graphHeight = height - padding * 2

    const path = `M ${padding} ${height - padding} 
                  C ${padding + x1 * graphWidth} ${height - padding - y1 * graphHeight},
                    ${padding + x2 * graphWidth} ${height - padding - y2 * graphHeight},
                    ${width - padding} ${padding}`

    return (
      <svg width={width} height={height} className="mx-auto">
        <defs>
          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.75 0.15 195)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="oklch(0.50 0.15 290)" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        <rect 
          x={padding} 
          y={padding} 
          width={graphWidth} 
          height={graphHeight}
          fill="oklch(0.25 0.01 260)"
          stroke="oklch(0.35 0.02 260)"
          strokeWidth="1"
          rx="4"
        />
        
        <line 
          x1={padding} 
          y1={height - padding} 
          x2={width - padding} 
          y2={padding}
          stroke="oklch(0.35 0.02 260)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        
        <path
          d={path}
          fill="none"
          stroke="url(#curveGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        <circle 
          cx={padding} 
          cy={height - padding} 
          r="4" 
          fill="oklch(0.75 0.15 195)"
        />
        <circle 
          cx={width - padding} 
          cy={padding} 
          r="4" 
          fill="oklch(0.50 0.15 290)"
        />
        
        <circle 
          cx={padding + x1 * graphWidth} 
          cy={height - padding - y1 * graphHeight} 
          r="6" 
          fill="oklch(0.75 0.15 195)"
          opacity="0.6"
        />
        <circle 
          cx={padding + x2 * graphWidth} 
          cy={height - padding - y2 * graphHeight} 
          r="6" 
          fill="oklch(0.50 0.15 290)"
          opacity="0.6"
        />
        
        <line
          x1={padding}
          y1={height - padding}
          x2={padding + x1 * graphWidth}
          y2={height - padding - y1 * graphHeight}
          stroke="oklch(0.75 0.15 195)"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.4"
        />
        <line
          x1={width - padding}
          y1={padding}
          x2={padding + x2 * graphWidth}
          y2={height - padding - y2 * graphHeight}
          stroke="oklch(0.50 0.15 290)"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.4"
        />
      </svg>
    )
  }

  const renderAnimationTimeline = () => {
    const points: { t: number; value: number }[] = []
    for (let i = 0; i <= 100; i += 5) {
      const t = i / 100
      const value = evaluateEasing(selectedCurve, t)
      points.push({ t, value })
    }

    return (
      <div className="relative h-16 bg-muted/30 rounded-lg overflow-hidden">
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.75 0.15 195)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="oklch(0.50 0.15 290)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d={`M 0 64 ${points.map((p, i) => 
              `L ${(p.t * 100).toFixed(2)}% ${(64 - p.value * 60).toFixed(2)}`
            ).join(' ')} L 100% 64 Z`}
            fill="url(#timelineGradient)"
          />
          <polyline
            points={points.map(p => `${(p.t * 100).toFixed(2)}%,${(64 - p.value * 60).toFixed(2)}`).join(' ')}
            fill="none"
            stroke="oklch(0.75 0.15 195)"
            strokeWidth="2"
          />
        </svg>
      </div>
    )
  }

  const renderTextPreview = () => {
    if (selectedPreset.characterDelay) {
      return (
        <div className="text-4xl font-bold text-center py-8" style={{ fontFamily: 'var(--font-space)' }}>
          {customText.split('').map((char, index) => (
            <AnimatePresence key={`${animationKey}-${index}`} mode="wait">
              {isPlaying && (
                <motion.span
                  key={`char-${animationKey}-${index}`}
                  initial={selectedPreset.properties.from}
                  animate={selectedPreset.properties.to}
                  transition={{
                    duration: selectedPreset.duration,
                    delay: index * (selectedPreset.characterDelay || 0),
                    ease: curve.bezier as [number, number, number, number]
                  }}
                  style={{ display: 'inline-block' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              )}
            </AnimatePresence>
          ))}
          {!isPlaying && customText}
        </div>
      )
    }

    if (selectedPreset.wordDelay) {
      return (
        <div className="text-4xl font-bold text-center py-8" style={{ fontFamily: 'var(--font-space)' }}>
          {customText.split(' ').map((word, index) => (
            <span key={index}>
              <AnimatePresence key={`${animationKey}-${index}`} mode="wait">
                {isPlaying && (
                  <motion.span
                    key={`word-${animationKey}-${index}`}
                    initial={selectedPreset.properties.from}
                    animate={selectedPreset.properties.to}
                    transition={{
                      duration: selectedPreset.duration,
                      delay: index * (selectedPreset.wordDelay || 0),
                      ease: curve.bezier as [number, number, number, number]
                    }}
                    style={{ display: 'inline-block' }}
                  >
                    {word}
                  </motion.span>
                )}
              </AnimatePresence>
              {!isPlaying && <span>{word}</span>}
              {index < customText.split(' ').length - 1 && ' '}
            </span>
          ))}
        </div>
      )
    }

    return (
      <div className="text-4xl font-bold text-center py-8" style={{ fontFamily: 'var(--font-space)' }}>
        <AnimatePresence key={animationKey} mode="wait">
          {isPlaying ? (
            <motion.div
              key={`text-${animationKey}`}
              initial={selectedPreset.properties.from}
              animate={selectedPreset.properties.to}
              transition={{
                duration: selectedPreset.duration,
                ease: curve.bezier as [number, number, number, number]
              }}
            >
              {customText}
            </motion.div>
          ) : (
            <div>{customText}</div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">✍️</span>
          Text Animation Curve Explorer
        </CardTitle>
        <CardDescription>
          Advanced easing curves and transition presets specifically designed for text animations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="curves" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="curves">Easing Curves</TabsTrigger>
            <TabsTrigger value="presets">Transition Presets</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="curves" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="expressive">Expressive</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="text-specific">Text-Specific</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterIntensity} onValueChange={setFilterIntensity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Intensity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Intensities</SelectItem>
                      <SelectItem value="subtle">Subtle</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                      <SelectItem value="extreme">Extreme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="h-[500px]">
                  <div className="space-y-2 pr-4">
                    {filteredCurves.map((curveItem) => (
                      <button
                        key={curveItem.name}
                        onClick={() => setSelectedCurve(curveItem.name)}
                        className={cn(
                          "w-full p-4 rounded-lg border-2 transition-all text-left",
                          selectedCurve === curveItem.name
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">{curveItem.displayName}</div>
                            <div className="text-xs text-muted-foreground">{curveItem.description}</div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {curveItem.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <code className="text-accent font-mono">{curveItem.visualPreview}</code>
                          <Badge 
                            variant={
                              curveItem.intensity === 'subtle' ? 'secondary' :
                              curveItem.intensity === 'moderate' ? 'default' :
                              curveItem.intensity === 'strong' ? 'default' :
                              'destructive'
                            }
                            className="text-xs"
                          >
                            {curveItem.intensity}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{curve.displayName}</CardTitle>
                    <CardDescription>{curve.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderCurvePath()}
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Bezier Values</Label>
                      <code className="block p-3 bg-muted rounded-lg text-xs font-mono">
                        cubic-bezier({curve.bezier.join(', ')})
                      </code>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={handleCopyCurve}
                      >
                        <Copy size={14} className="mr-2" />
                        Copy Bezier
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Animation Timeline</Label>
                      {renderAnimationTimeline()}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Best For</Label>
                      <div className="flex flex-wrap gap-1">
                        {curve.bestFor.map((use, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 pr-4">
                  {textTransitionPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all text-left",
                        selectedPreset.id === preset.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{preset.icon}</span>
                          <div>
                            <div className="font-semibold text-sm">{preset.name}</div>
                            <div className="text-xs text-muted-foreground">{preset.description}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap mt-2">
                        <Badge variant="outline" className="text-xs">{preset.category}</Badge>
                        <Badge variant="outline" className="text-xs">{preset.easing}</Badge>
                        <Badge variant="secondary" className="text-xs">{preset.duration}s</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-xl">{selectedPreset.icon}</span>
                      {selectedPreset.name}
                    </CardTitle>
                    <CardDescription>{selectedPreset.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Category</Label>
                        <div className="text-sm font-medium capitalize">{selectedPreset.category}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Complexity</Label>
                        <div className="text-sm font-medium capitalize">{selectedPreset.complexity}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Intensity</Label>
                        <div className="text-sm font-medium capitalize">{selectedPreset.intensity}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Duration</Label>
                        <div className="text-sm font-medium">{selectedPreset.duration}s</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Easing Curve</Label>
                      <div className="text-sm font-medium font-mono">{selectedPreset.easing}</div>
                      {renderAnimationTimeline()}
                    </div>

                    {selectedPreset.characterDelay && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Character Delay</Label>
                        <div className="text-sm font-medium">{selectedPreset.characterDelay}s</div>
                      </div>
                    )}

                    {selectedPreset.wordDelay && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Word Delay</Label>
                        <div className="text-sm font-medium">{selectedPreset.wordDelay}s</div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Best For</Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedPreset.bestFor.map((use, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Properties</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">From</div>
                          <code className="block p-2 bg-muted rounded text-xs font-mono">
                            {JSON.stringify(selectedPreset.properties.from, null, 2)}
                          </code>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">To</div>
                          <code className="block p-2 bg-muted rounded text-xs font-mono">
                            {JSON.stringify(selectedPreset.properties.to, null, 2)}
                          </code>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleCopyCSS}
                    >
                      <Code size={14} className="mr-2" />
                      Copy CSS Code
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Animation Preview</CardTitle>
                <CardDescription>
                  Test your selected preset with custom text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Custom Text</Label>
                    <Input
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Enter text to animate..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Animation Preset: {selectedPreset.name}</Label>
                    <div className="text-xs text-muted-foreground">
                      {selectedPreset.description}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Easing Curve: {curve.displayName}</Label>
                    <div className="text-xs text-muted-foreground">
                      {curve.description}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-muted/30 rounded-lg border-2 border-border min-h-[200px] flex items-center justify-center">
                  {renderTextPreview()}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePlayAnimation}
                    disabled={isPlaying}
                    className="flex-1"
                  >
                    <Play size={16} className="mr-2" weight="fill" />
                    Play Animation
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                  >
                    <ArrowClockwise size={16} />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Animation Code</Label>
                  <ScrollArea className="h-[200px]">
                    <pre className="text-xs font-mono bg-muted p-4 rounded-lg">
                      {generateTextAnimationCSS(selectedPreset, 'custom-animation')}
                    </pre>
                  </ScrollArea>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleCopyCSS}
                  >
                    <Copy size={14} className="mr-2" />
                    Copy CSS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
