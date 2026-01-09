import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PatternConfig, PatternElement, PatternElementType, HistoryState } from '@/lib/pattern-builder-types'
import { patternTemplates } from '@/lib/pattern-templates'
import { PatternCanvas } from '@/components/PatternCanvas'
import { AnimatedPatternCanvas } from '@/components/AnimatedPatternCanvas'
import { PatternElementEditor } from '@/components/PatternElementEditor'
import { AnimationTimeline } from '@/components/AnimationTimeline'
import { TimelineScrubber } from '@/components/TimelineScrubber'
import { Palette, Plus, Download, Upload, Code, ArrowCounterClockwise, ArrowClockwise, Sparkle, Play, Pause } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function VisualPatternBuilder() {
  const [currentPattern, setCurrentPattern] = useKV<PatternConfig | null>('current-pattern', null)
  const [savedPatterns, setSavedPatterns] = useKV<PatternConfig[]>('saved-patterns', [])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportedCSS, setExportedCSS] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false)
  const [animationTime, setAnimationTime] = useState(0)

  useEffect(() => {
    if (!isAnimationPlaying || !currentPattern) return

    let lastTime = performance.now()
    let animationFrameId: number

    const animate = (currentTimeStamp: number) => {
      const delta = currentTimeStamp - lastTime
      lastTime = currentTimeStamp

      setAnimationTime(prev => {
        const allAnimations = currentPattern.elements.flatMap(el => el.animations || [])
        const maxDuration = Math.max(...allAnimations.map(a => a.duration + a.delay), 5000)
        const next = prev + delta
        return next >= maxDuration ? 0 : next
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isAnimationPlaying, currentPattern])

  const addToHistory = (config: PatternConfig) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ config, timestamp: Date.now() })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCurrentPattern(history[historyIndex - 1].config)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCurrentPattern(history[historyIndex + 1].config)
    }
  }

  const createNewPattern = () => {
    const newPattern: PatternConfig = {
      id: `pattern-${Date.now()}`,
      name: 'New Pattern',
      description: 'Custom visual pattern',
      width: 400,
      height: 400,
      backgroundColor: 'oklch(0.15 0.01 260)',
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      repeat: 'repeat',
      category: 'custom',
    }
    setCurrentPattern(newPattern)
    addToHistory(newPattern)
    toast.success('New pattern created')
  }

  const loadTemplate = (template: typeof patternTemplates[0]) => {
    const pattern = {
      ...template.config,
      id: `pattern-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCurrentPattern(pattern)
    addToHistory(pattern)
    toast.success(`Template "${template.name}" loaded`)
  }

  const addElement = (type: PatternElementType) => {
    if (!currentPattern) return

    const newElement: PatternElement = {
      id: `element-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${currentPattern.elements.length + 1}`,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 1,
      color: 'oklch(0.75 0.15 195)',
      blendMode: 'normal',
      zIndex: currentPattern.elements.length + 1,
      scale: 1,
      properties: {},
    }

    const updated = {
      ...currentPattern,
      elements: [...currentPattern.elements, newElement],
      updatedAt: new Date().toISOString(),
    }
    setCurrentPattern(updated)
    addToHistory(updated)
    setSelectedElementId(newElement.id)
    toast.success(`${type} element added`)
  }

  const updateElement = (elementId: string, updates: Partial<PatternElement>) => {
    if (!currentPattern) return

    const updated = {
      ...currentPattern,
      elements: currentPattern.elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
      updatedAt: new Date().toISOString(),
    }
    setCurrentPattern(updated)
    addToHistory(updated)
  }

  const deleteElement = (elementId: string) => {
    if (!currentPattern) return

    const updated = {
      ...currentPattern,
      elements: currentPattern.elements.filter((el) => el.id !== elementId),
      updatedAt: new Date().toISOString(),
    }
    setCurrentPattern(updated)
    addToHistory(updated)
    if (selectedElementId === elementId) {
      setSelectedElementId(null)
    }
    toast.success('Element deleted')
  }

  const duplicateElement = (elementId: string) => {
    if (!currentPattern) return

    const element = currentPattern.elements.find((el) => el.id === elementId)
    if (!element) return

    const duplicated: PatternElement = {
      ...element,
      id: `element-${Date.now()}`,
      name: `${element.name} (Copy)`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: currentPattern.elements.length + 1,
    }

    const updated = {
      ...currentPattern,
      elements: [...currentPattern.elements, duplicated],
      updatedAt: new Date().toISOString(),
    }
    setCurrentPattern(updated)
    addToHistory(updated)
    setSelectedElementId(duplicated.id)
    toast.success('Element duplicated')
  }

  const moveElement = (elementId: string, direction: 'up' | 'down') => {
    if (!currentPattern) return

    const index = currentPattern.elements.findIndex((el) => el.id === elementId)
    if (index === -1) return

    const newElements = [...currentPattern.elements]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newElements.length) return

    ;[newElements[index], newElements[targetIndex]] = [newElements[targetIndex], newElements[index]]

    const updated = {
      ...currentPattern,
      elements: newElements,
      updatedAt: new Date().toISOString(),
    }
    setCurrentPattern(updated)
    addToHistory(updated)
  }

  const savePattern = () => {
    if (!currentPattern) return

    setSavedPatterns((current = []) => {
      const existing = current.find((p) => p.id === currentPattern.id)
      if (existing) {
        return current.map((p) => (p.id === currentPattern.id ? currentPattern : p))
      }
      return [...current, currentPattern]
    })
    toast.success('Pattern saved')
  }

  const exportAsCSS = () => {
    if (!currentPattern) return

    const canvas = document.createElement('canvas')
    canvas.width = currentPattern.width
    canvas.height = currentPattern.height
    const dataURL = canvas.toDataURL('image/png')

    const css = `
/* ${currentPattern.name} */
.pattern-${currentPattern.id} {
  background-color: ${currentPattern.backgroundColor};
  background-image: url('${dataURL}');
  background-repeat: ${currentPattern.repeat};
  background-size: ${currentPattern.width}px ${currentPattern.height}px;
}
    `.trim()

    setExportedCSS(css)
    setExportDialogOpen(true)
  }

  const exportAsJSON = () => {
    if (!currentPattern) return

    const dataStr = JSON.stringify(currentPattern, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentPattern.name.replace(/\s+/g, '-').toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Pattern exported as JSON')
  }

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a pattern description')
      return
    }

    setIsGenerating(true)

    try {
      const promptText = `You are a visual pattern designer. Generate a pattern configuration based on this description: "${aiPrompt}".

Create a PatternConfig with 2-4 elements that match the description. Use creative colors in oklch format, appropriate element types, and interesting properties.

Return ONLY a valid JSON object with this structure:
{
  "name": "Pattern Name",
  "description": "Pattern description",
  "backgroundColor": "oklch(...)",
  "elements": [
    {
      "type": "grid|dots|waves|gradient|etc",
      "name": "Element name",
      "x": 0,
      "y": 0,
      "width": 400,
      "height": 400,
      "rotation": 0,
      "opacity": 0.5,
      "color": "oklch(...)",
      "blendMode": "normal",
      "zIndex": 1,
      "scale": 1,
      "properties": {}
    }
  ]
}`

      const result = await window.spark.llm(promptText, 'gpt-4o', true)
      const parsed = JSON.parse(result)

      const newPattern: PatternConfig = {
        id: `pattern-${Date.now()}`,
        name: parsed.name || 'AI Generated Pattern',
        description: parsed.description || aiPrompt,
        width: 400,
        height: 400,
        backgroundColor: parsed.backgroundColor || 'oklch(0.15 0.01 260)',
        elements: parsed.elements.map((el: any, idx: number) => ({
          id: `element-${Date.now()}-${idx}`,
          type: el.type,
          name: el.name,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation,
          opacity: el.opacity,
          color: el.color,
          blendMode: el.blendMode,
          zIndex: el.zIndex,
          scale: el.scale,
          properties: el.properties || {},
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        repeat: 'repeat',
        category: 'custom',
      }

      setCurrentPattern(newPattern)
      addToHistory(newPattern)
      setAiPrompt('')
      toast.success('Pattern generated with AI!')
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate pattern. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedElement = currentPattern?.elements.find((el) => el.id === selectedElementId)
  const selectedElementIndex = currentPattern?.elements.findIndex((el) => el.id === selectedElementId) ?? -1

  const elementTypes: { type: PatternElementType; label: string; icon: string }[] = [
    { type: 'rectangle', label: 'Rectangle', icon: '▭' },
    { type: 'circle', label: 'Circle', icon: '◯' },
    { type: 'triangle', label: 'Triangle', icon: '△' },
    { type: 'line', label: 'Line', icon: '╱' },
    { type: 'grid', label: 'Grid', icon: '⊞' },
    { type: 'dots', label: 'Dots', icon: '⣿' },
    { type: 'waves', label: 'Waves', icon: '〰' },
    { type: 'gradient', label: 'Gradient', icon: '◐' },
    { type: 'noise', label: 'Noise', icon: '▒' },
    { type: 'stripes', label: 'Stripes', icon: '⟋' },
    { type: 'chevron', label: 'Chevron', icon: '⋀' },
    { type: 'hexagon', label: 'Hexagon', icon: '⬡' },
    { type: 'star', label: 'Star', icon: '✦' },
    { type: 'spiral', label: 'Spiral', icon: '◎' },
  ]

  return (
    <>
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Pattern Generator</CardTitle>
                <CardDescription>Describe your pattern in natural language</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="E.g., 'Futuristic circuit board pattern with neon blue lines'"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent"
                  onClick={generateWithAI}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkle size={16} className="mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Templates</CardTitle>
                <CardDescription>Start with a pre-made pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {patternTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => loadTemplate(template)}
                        className="w-full p-3 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{template.preview}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{template.name}</div>
                            <div className="text-xs text-muted-foreground">{template.category}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Element</CardTitle>
                <CardDescription>Drag elements to build your pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {elementTypes.map((item) => (
                    <Button
                      key={item.type}
                      variant="outline"
                      size="sm"
                      onClick={() => addElement(item.type)}
                      disabled={!currentPattern}
                      className="h-auto py-3 flex-col gap-1"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs">{item.label}</span>
                    </Button>
                  ))}
                </div>
                {!currentPattern && (
                  <Button onClick={createNewPattern} className="w-full mt-3" variant="secondary">
                    <Plus size={16} className="mr-2" />
                    Create New Pattern
                  </Button>
                )}
              </CardContent>
            </Card>

            {savedPatterns && savedPatterns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Saved Patterns</CardTitle>
                  <CardDescription>{savedPatterns.length} patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {savedPatterns.map((pattern) => (
                        <button
                          key={pattern.id}
                          onClick={() => {
                            setCurrentPattern(pattern)
                            addToHistory(pattern)
                            toast.success('Pattern loaded')
                          }}
                          className={`w-full p-3 rounded-lg border transition-all text-left ${
                            currentPattern?.id === pattern.id
                              ? 'border-accent bg-accent/10'
                              : 'border-border hover:border-accent/50'
                          }`}
                        >
                          <div className="font-medium text-sm">{pattern.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {pattern.elements.length} elements • {pattern.category}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-12rem)]">
              {currentPattern ? (
                <div className="h-full flex flex-col">
                  <CardHeader className="flex-none">
                    <div className="space-y-2">
                      <Input
                        value={currentPattern.name}
                        onChange={(e) => {
                          const updated = { ...currentPattern, name: e.target.value }
                          setCurrentPattern(updated)
                        }}
                        className="text-lg font-bold"
                      />
                      <Input
                        value={currentPattern.description}
                        onChange={(e) => {
                          const updated = { ...currentPattern, description: e.target.value }
                          setCurrentPattern(updated)
                        }}
                        className="text-sm"
                      />
                      <div className="flex items-center gap-3">
                        <Badge>{currentPattern.category}</Badge>
                        <Badge variant="outline">{currentPattern.elements.length} elements</Badge>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Background:</Label>
                          <Input
                            type="color"
                            value={currentPattern.backgroundColor.startsWith('oklch') ? '#1a1a2e' : currentPattern.backgroundColor}
                            onChange={(e) => {
                              const updated = { ...currentPattern, backgroundColor: e.target.value }
                              setCurrentPattern(updated)
                            }}
                            className="h-8 w-16 p-1"
                          />
                        </div>
                        <div className="flex-1" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsAnimationPlaying(!isAnimationPlaying)
                            if (isAnimationPlaying) setAnimationTime(0)
                          }}
                        >
                          {isAnimationPlaying ? (
                            <>
                              <Pause size={16} className="mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play size={16} className="mr-2" />
                              Play
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center overflow-hidden">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20">
                      <AnimatedPatternCanvas 
                        config={currentPattern} 
                        scale={1}
                        isPlaying={isAnimationPlaying}
                        currentTime={animationTime}
                      />
                    </div>
                  </CardContent>
                </div>
              ) : (
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                      <Palette size={40} weight="duotone" className="text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Create Your Pattern</h3>
                      <p className="text-muted-foreground">
                        Start with a template or create a new pattern from scratch
                      </p>
                    </div>
                    <Button onClick={createNewPattern} size="lg" className="bg-gradient-to-r from-primary to-accent">
                      <Plus size={20} className="mr-2" />
                      Create New Pattern
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader>
                <CardTitle className="text-lg">Elements</CardTitle>
                <CardDescription>
                  {currentPattern ? `${currentPattern.elements.length} elements` : 'No pattern loaded'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-18rem)]">
                  <div className="space-y-3 p-6">
                    {currentPattern?.elements.map((element, index) => (
                      <PatternElementEditor
                        key={element.id}
                        element={element}
                        onUpdate={(updated) => updateElement(element.id, updated)}
                        onDelete={() => deleteElement(element.id)}
                        onDuplicate={() => duplicateElement(element.id)}
                        onMoveUp={() => moveElement(element.id, 'up')}
                        onMoveDown={() => moveElement(element.id, 'down')}
                        canMoveUp={index > 0}
                        canMoveDown={index < currentPattern.elements.length - 1}
                      />
                    ))}
                    {currentPattern && currentPattern.elements.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No elements yet</p>
                        <p className="text-xs mt-1">Add elements from the sidebar</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {currentPattern && currentPattern.elements.length > 0 && (
          <div className="w-full">
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="w-fit ml-6">
                <TabsTrigger value="timeline">Keyframe Timeline</TabsTrigger>
                <TabsTrigger value="scrubber">Precision Scrubber</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-0">
                <AnimationTimeline 
                  elements={currentPattern.elements}
                  onUpdateElement={updateElement}
                  externalIsPlaying={isAnimationPlaying}
                  externalCurrentTime={animationTime}
                  onPlayStateChange={setIsAnimationPlaying}
                  onTimeChange={setAnimationTime}
                />
              </TabsContent>
              <TabsContent value="scrubber" className="mt-0">
                <TimelineScrubber
                  tracks={currentPattern.elements.flatMap(element => 
                    (element.animations || []).map(anim => ({
                      id: anim.id,
                      name: `${element.name} - ${anim.name}`,
                      elementId: element.id,
                      enabled: anim.enabled,
                      keyframes: anim.keyframes.map(kf => ({
                        id: kf.id,
                        time: (anim.delay + (anim.duration * kf.time / 100)),
                        properties: {
                          x: kf.x ?? element.x,
                          y: kf.y ?? element.y,
                          scale: kf.scale ?? element.scale,
                          rotation: kf.rotation ?? element.rotation,
                          opacity: kf.opacity ?? element.opacity,
                        },
                        easing: anim.easing,
                        label: kf.time === 0 ? 'Start' : kf.time === 100 ? 'End' : undefined,
                      })),
                      color: element.color,
                      locked: false,
                    }))
                  )}
                  duration={Math.max(
                    ...currentPattern.elements.flatMap(el => 
                      (el.animations || []).map(a => a.duration + a.delay)
                    ),
                    5000
                  )}
                  onUpdateTrack={(trackId, updates) => {
                    const element = currentPattern.elements.find(el => 
                      el.animations?.some(a => a.id === trackId)
                    )
                    if (!element) return
                    
                    const animations = element.animations!.map(a => 
                      a.id === trackId ? { ...a, enabled: updates.enabled ?? a.enabled } : a
                    )
                    updateElement(element.id, { animations })
                  }}
                  onCreateKeyframe={(trackId, time) => {
                    const element = currentPattern.elements.find(el => 
                      el.animations?.some(a => a.id === trackId)
                    )
                    if (!element) return
                    
                    const animation = element.animations!.find(a => a.id === trackId)
                    if (!animation) return
                    
                    const percentage = ((time - animation.delay) / animation.duration) * 100
                    const newKeyframe = {
                      id: `kf-${Date.now()}`,
                      time: Math.max(0, Math.min(100, percentage)),
                      x: element.x,
                      y: element.y,
                      scale: element.scale,
                      rotation: element.rotation,
                      opacity: element.opacity,
                    }
                    
                    const keyframes = [...animation.keyframes, newKeyframe].sort((a, b) => a.time - b.time)
                    const animations = element.animations!.map(a => 
                      a.id === trackId ? { ...a, keyframes } : a
                    )
                    updateElement(element.id, { animations })
                  }}
                  onDeleteKeyframe={(trackId, keyframeId) => {
                    const element = currentPattern.elements.find(el => 
                      el.animations?.some(a => a.id === trackId)
                    )
                    if (!element) return
                    
                    const animation = element.animations!.find(a => a.id === trackId)
                    if (!animation || animation.keyframes.length <= 2) return
                    
                    const keyframes = animation.keyframes.filter(kf => kf.id !== keyframeId)
                    const animations = element.animations!.map(a => 
                      a.id === trackId ? { ...a, keyframes } : a
                    )
                    updateElement(element.id, { animations })
                  }}
                  onUpdateKeyframe={(trackId, keyframeId, updates) => {
                    const element = currentPattern.elements.find(el => 
                      el.animations?.some(a => a.id === trackId)
                    )
                    if (!element) return
                    
                    const animation = element.animations!.find(a => a.id === trackId)
                    if (!animation) return
                    
                    const keyframes = animation.keyframes.map(kf => {
                      if (kf.id !== keyframeId) return kf
                      
                      const updatedKf = { ...kf }
                      
                      if (updates.time !== undefined) {
                        const percentage = ((updates.time - animation.delay) / animation.duration) * 100
                        updatedKf.time = Math.max(0, Math.min(100, percentage))
                      }
                      
                      if (updates.properties) {
                        if (updates.properties.x !== undefined) updatedKf.x = Number(updates.properties.x)
                        if (updates.properties.y !== undefined) updatedKf.y = Number(updates.properties.y)
                        if (updates.properties.scale !== undefined) updatedKf.scale = Number(updates.properties.scale)
                        if (updates.properties.rotation !== undefined) updatedKf.rotation = Number(updates.properties.rotation)
                        if (updates.properties.opacity !== undefined) updatedKf.opacity = Number(updates.properties.opacity)
                      }
                      
                      if (updates.label !== undefined) {
                        updatedKf.id = kf.id
                      }
                      
                      return updatedKf
                    })
                    
                    const animations = element.animations!.map(a => 
                      a.id === trackId ? { ...a, keyframes: keyframes.sort((a, b) => a.time - b.time) } : a
                    )
                    updateElement(element.id, { animations })
                  }}
                  currentTime={animationTime}
                  isPlaying={isAnimationPlaying}
                  onTimeChange={setAnimationTime}
                  onPlayStateChange={setIsAnimationPlaying}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      </div>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export as CSS</DialogTitle>
            <DialogDescription>Copy this CSS to use your pattern in any project</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-x-auto">{exportedCSS}</pre>
          </ScrollArea>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(exportedCSS)
              toast.success('CSS copied to clipboard')
            }}
          >
            Copy to Clipboard
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
