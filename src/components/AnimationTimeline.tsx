import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ElementAnimation, 
  AnimationKeyframe, 
  PatternElement,
  AnimationType,
  EasingFunction 
} from '@/lib/pattern-builder-types'
import { 
  Play, 
  Pause, 
  Plus, 
  Trash, 
  Copy,
  ArrowsClockwise,
  Circle,
  Lightning,
  TrendUp
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimationTimelineProps {
  elements: PatternElement[]
  onUpdateElement: (elementId: string, updates: Partial<PatternElement>) => void
  externalIsPlaying?: boolean
  externalCurrentTime?: number
  onPlayStateChange?: (isPlaying: boolean) => void
  onTimeChange?: (time: number) => void
}

export function AnimationTimeline({ 
  elements, 
  onUpdateElement,
  externalIsPlaying,
  externalCurrentTime,
  onPlayStateChange,
  onTimeChange
}: AnimationTimelineProps) {
  const [selectedAnimationId, setSelectedAnimationId] = useState<string | null>(null)
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null)
  const [localIsPlaying, setLocalIsPlaying] = useState(false)
  const [localCurrentTime, setLocalCurrentTime] = useState(0)
  const [timelineZoom, setTimelineZoom] = useState(1)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const lastTimeRef = useRef<number>(0)

  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : localIsPlaying
  const currentTime = externalCurrentTime !== undefined ? externalCurrentTime : localCurrentTime

  const setIsPlaying = (value: boolean) => {
    if (onPlayStateChange) {
      onPlayStateChange(value)
    } else {
      setLocalIsPlaying(value)
    }
  }

  const setCurrentTime = (value: number | ((prev: number) => number)) => {
    if (onTimeChange) {
      const newValue = typeof value === 'function' ? value(currentTime) : value
      onTimeChange(newValue)
    } else {
      setLocalCurrentTime(value)
    }
  }

  const allAnimations = elements.flatMap(el => 
    (el.animations || []).map(anim => ({ ...anim, elementName: el.name, elementId: el.id }))
  )

  const selectedAnimation = allAnimations.find(a => a.id === selectedAnimationId)
  const selectedElement = elements.find(e => e.id === selectedElementId)
  const maxDuration = Math.max(...allAnimations.map(a => a.duration + a.delay), 5000)

  useEffect(() => {
    if (externalIsPlaying !== undefined || externalCurrentTime !== undefined) {
      return
    }

    if (isPlaying) {
      const animate = (timestamp: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp
        const delta = timestamp - lastTimeRef.current
        lastTimeRef.current = timestamp

        setCurrentTime(prev => {
          const next = prev + delta
          return next >= maxDuration ? 0 : next
        })

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        lastTimeRef.current = 0
      }
    } else {
      lastTimeRef.current = 0
    }
  }, [isPlaying, maxDuration])

  const createAnimation = () => {
    if (!selectedElementId) {
      toast.error('Please select an element first')
      return
    }

    const element = elements.find(e => e.id === selectedElementId)
    if (!element) return

    const newAnimation: ElementAnimation = {
      id: `anim-${Date.now()}`,
      elementId: selectedElementId,
      name: 'New Animation',
      type: 'move',
      duration: 2000,
      delay: 0,
      iterations: 'infinite',
      direction: 'normal',
      easing: 'ease-in-out',
      keyframes: [
        {
          id: `kf-${Date.now()}-0`,
          time: 0,
          x: element.x,
          y: element.y,
          scale: element.scale,
          rotation: element.rotation,
          opacity: element.opacity,
        },
        {
          id: `kf-${Date.now()}-1`,
          time: 100,
          x: element.x,
          y: element.y,
          scale: element.scale,
          rotation: element.rotation,
          opacity: element.opacity,
        },
      ],
      enabled: true,
    }

    const animations = [...(element.animations || []), newAnimation]
    onUpdateElement(selectedElementId, { animations })
    setSelectedAnimationId(newAnimation.id)
    toast.success('Animation created')
  }

  const updateAnimation = (animId: string, updates: Partial<ElementAnimation>) => {
    const element = elements.find(e => e.animations?.some(a => a.id === animId))
    if (!element) return

    const animations = element.animations!.map(a => 
      a.id === animId ? { ...a, ...updates } : a
    )
    onUpdateElement(element.id, { animations })
  }

  const deleteAnimation = (animId: string) => {
    const element = elements.find(e => e.animations?.some(a => a.id === animId))
    if (!element) return

    const animations = element.animations!.filter(a => a.id !== animId)
    onUpdateElement(element.id, { animations })
    if (selectedAnimationId === animId) {
      setSelectedAnimationId(null)
    }
    toast.success('Animation deleted')
  }

  const duplicateAnimation = (animId: string) => {
    const element = elements.find(e => e.animations?.some(a => a.id === animId))
    if (!element) return

    const anim = element.animations!.find(a => a.id === animId)
    if (!anim) return

    const duplicated: ElementAnimation = {
      ...anim,
      id: `anim-${Date.now()}`,
      name: `${anim.name} (Copy)`,
      keyframes: anim.keyframes.map((kf, idx) => ({
        ...kf,
        id: `kf-${Date.now()}-${idx}`,
      })),
    }

    const animations = [...element.animations!, duplicated]
    onUpdateElement(element.id, { animations })
    setSelectedAnimationId(duplicated.id)
    toast.success('Animation duplicated')
  }

  const addKeyframe = () => {
    if (!selectedAnimation) return

    const element = elements.find(e => e.id === selectedAnimation.elementId)
    if (!element) return

    const progress = (currentTime / selectedAnimation.duration) * 100
    const lastKeyframe = selectedAnimation.keyframes[selectedAnimation.keyframes.length - 1]

    const newKeyframe: AnimationKeyframe = {
      id: `kf-${Date.now()}`,
      time: Math.min(progress, 99),
      x: lastKeyframe.x,
      y: lastKeyframe.y,
      scale: lastKeyframe.scale,
      rotation: lastKeyframe.rotation,
      opacity: lastKeyframe.opacity,
      width: lastKeyframe.width,
      height: lastKeyframe.height,
    }

    const keyframes = [...selectedAnimation.keyframes, newKeyframe].sort((a, b) => a.time - b.time)
    updateAnimation(selectedAnimation.id, { keyframes })
    setSelectedKeyframeId(newKeyframe.id)
    toast.success('Keyframe added')
  }

  const updateKeyframe = (kfId: string, updates: Partial<AnimationKeyframe>) => {
    if (!selectedAnimation) return

    const keyframes = selectedAnimation.keyframes.map(kf =>
      kf.id === kfId ? { ...kf, ...updates } : kf
    )
    updateAnimation(selectedAnimation.id, { keyframes })
  }

  const deleteKeyframe = (kfId: string) => {
    if (!selectedAnimation || selectedAnimation.keyframes.length <= 2) {
      toast.error('Animation must have at least 2 keyframes')
      return
    }

    const keyframes = selectedAnimation.keyframes.filter(kf => kf.id !== kfId)
    updateAnimation(selectedAnimation.id, { keyframes })
    if (selectedKeyframeId === kfId) {
      setSelectedKeyframeId(null)
    }
    toast.success('Keyframe deleted')
  }

  const applyAnimationPreset = (type: AnimationType) => {
    if (!selectedElementId) {
      toast.error('Please select an element first')
      return
    }

    const element = elements.find(e => e.id === selectedElementId)
    if (!element) return

    let newAnimation: ElementAnimation

    switch (type) {
      case 'pulse':
        newAnimation = {
          id: `anim-${Date.now()}`,
          elementId: selectedElementId,
          name: 'Pulse Animation',
          type: 'pulse',
          duration: 1500,
          delay: 0,
          iterations: 'infinite',
          direction: 'alternate',
          easing: 'ease-in-out',
          keyframes: [
            {
              id: `kf-${Date.now()}-0`,
              time: 0,
              scale: element.scale,
              opacity: element.opacity,
            },
            {
              id: `kf-${Date.now()}-1`,
              time: 100,
              scale: element.scale * 1.2,
              opacity: Math.min(element.opacity * 1.2, 1),
            },
          ],
          enabled: true,
        }
        break

      case 'move':
        newAnimation = {
          id: `anim-${Date.now()}`,
          elementId: selectedElementId,
          name: 'Move Animation',
          type: 'move',
          duration: 3000,
          delay: 0,
          iterations: 'infinite',
          direction: 'alternate',
          easing: 'ease-in-out',
          keyframes: [
            {
              id: `kf-${Date.now()}-0`,
              time: 0,
              x: element.x,
              y: element.y,
            },
            {
              id: `kf-${Date.now()}-1`,
              time: 100,
              x: element.x + 100,
              y: element.y + 100,
            },
          ],
          enabled: true,
        }
        break

      case 'rotate':
        newAnimation = {
          id: `anim-${Date.now()}`,
          elementId: selectedElementId,
          name: 'Rotate Animation',
          type: 'rotate',
          duration: 4000,
          delay: 0,
          iterations: 'infinite',
          direction: 'normal',
          easing: 'linear',
          keyframes: [
            {
              id: `kf-${Date.now()}-0`,
              time: 0,
              rotation: 0,
            },
            {
              id: `kf-${Date.now()}-1`,
              time: 100,
              rotation: 360,
            },
          ],
          enabled: true,
        }
        break

      case 'fade':
        newAnimation = {
          id: `anim-${Date.now()}`,
          elementId: selectedElementId,
          name: 'Fade Animation',
          type: 'fade',
          duration: 2000,
          delay: 0,
          iterations: 'infinite',
          direction: 'alternate',
          easing: 'ease-in-out',
          keyframes: [
            {
              id: `kf-${Date.now()}-0`,
              time: 0,
              opacity: element.opacity,
            },
            {
              id: `kf-${Date.now()}-1`,
              time: 100,
              opacity: 0.2,
            },
          ],
          enabled: true,
        }
        break

      default:
        return
    }

    const animations = [...(element.animations || []), newAnimation]
    onUpdateElement(selectedElementId, { animations })
    setSelectedAnimationId(newAnimation.id)
    toast.success(`${type} animation created`)
  }

  const selectedKeyframe = selectedAnimation?.keyframes.find(kf => kf.id === selectedKeyframeId)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightning size={20} weight="duotone" className="text-accent" />
              Animation Timeline
            </CardTitle>
            <CardDescription>Add keyframe animations to pattern elements</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPlaying(!isPlaying)
                if (isPlaying) setCurrentTime(0)
              }}
            >
              {isPlaying ? (
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentTime(0)}
            >
              <ArrowsClockwise size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <Tabs defaultValue="timeline" className="flex-1 flex flex-col">
          <TabsList className="w-fit">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex-1 flex flex-col gap-4 overflow-hidden mt-4">
            <div className="flex items-center gap-3">
              <Select value={selectedElementId || ''} onValueChange={setSelectedElementId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select element" />
                </SelectTrigger>
                <SelectContent>
                  {elements.map(el => (
                    <SelectItem key={el.id} value={el.id}>
                      {el.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={createAnimation} disabled={!selectedElementId}>
                <Plus size={16} className="mr-2" />
                New Animation
              </Button>
              <div className="flex-1" />
              <Label className="text-xs">Zoom:</Label>
              <Slider
                value={[timelineZoom]}
                onValueChange={([v]) => setTimelineZoom(v)}
                min={0.5}
                max={3}
                step={0.1}
                className="w-24"
              />
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg">
                <div className="text-xs font-mono text-muted-foreground">
                  {Math.round(currentTime)}ms / {maxDuration}ms
                </div>
                <div className="flex-1 h-1 bg-border rounded-full relative overflow-hidden">
                  <motion.div
                    className="absolute h-full bg-accent"
                    style={{ width: `${(currentTime / maxDuration) * 100}%` }}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-4">
                  {allAnimations.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Lightning size={32} weight="duotone" className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No animations yet</p>
                      <p className="text-xs mt-1">Select an element and create an animation</p>
                    </div>
                  )}

                  {allAnimations.map(anim => (
                    <div
                      key={anim.id}
                      className={`border rounded-lg transition-all ${
                        selectedAnimationId === anim.id
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div
                        className="flex items-center gap-2 p-3 cursor-pointer"
                        onClick={() => setSelectedAnimationId(anim.id)}
                      >
                        <Switch
                          checked={anim.enabled}
                          onCheckedChange={(enabled) => updateAnimation(anim.id, { enabled })}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium flex items-center gap-2">
                            {anim.name}
                            <Badge variant="outline" className="text-xs">
                              {anim.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {anim.elementName} • {anim.duration}ms • {anim.keyframes.length} keyframes
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateAnimation(anim.id)
                          }}
                        >
                          <Copy size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteAnimation(anim.id)
                          }}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>

                      {selectedAnimationId === anim.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-border"
                        >
                          <div className="p-3 space-y-3">
                            <div className="relative h-12 bg-muted/20 rounded-lg overflow-hidden">
                              <div
                                className="absolute inset-y-0 bg-primary/10"
                                style={{
                                  left: `${(anim.delay / maxDuration) * 100}%`,
                                  width: `${(anim.duration / maxDuration) * 100}%`,
                                }}
                              />
                              {anim.keyframes.map(kf => (
                                <button
                                  key={kf.id}
                                  className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all ${
                                    selectedKeyframeId === kf.id
                                      ? 'bg-accent border-accent scale-125'
                                      : 'bg-primary border-primary hover:scale-110'
                                  }`}
                                  style={{
                                    left: `${((anim.delay + (anim.duration * kf.time / 100)) / maxDuration) * 100}%`,
                                  }}
                                  onClick={() => setSelectedKeyframeId(kf.id)}
                                />
                              ))}
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-accent"
                                style={{
                                  left: `${(currentTime / maxDuration) * 100}%`,
                                }}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={addKeyframe}
                              >
                                <Plus size={14} className="mr-1" />
                                Add Keyframe
                              </Button>
                              {selectedKeyframeId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteKeyframe(selectedKeyframeId)}
                                >
                                  <Trash size={14} className="mr-1" />
                                  Delete Keyframe
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Quick animation presets for the selected element
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => applyAnimationPreset('pulse')}
                    disabled={!selectedElementId}
                  >
                    <Circle size={24} weight="duotone" className="text-accent" />
                    <div className="text-sm font-medium">Pulse</div>
                    <div className="text-xs text-muted-foreground">Scale & fade</div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => applyAnimationPreset('move')}
                    disabled={!selectedElementId}
                  >
                    <TrendUp size={24} weight="duotone" className="text-primary" />
                    <div className="text-sm font-medium">Move</div>
                    <div className="text-xs text-muted-foreground">Position change</div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => applyAnimationPreset('rotate')}
                    disabled={!selectedElementId}
                  >
                    <ArrowsClockwise size={24} weight="duotone" className="text-secondary" />
                    <div className="text-sm font-medium">Rotate</div>
                    <div className="text-xs text-muted-foreground">360° spin</div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => applyAnimationPreset('fade')}
                    disabled={!selectedElementId}
                  >
                    <Circle size={24} weight="thin" className="text-muted-foreground" />
                    <div className="text-sm font-medium">Fade</div>
                    <div className="text-xs text-muted-foreground">Opacity change</div>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-hidden mt-4">
            {selectedAnimation ? (
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  <div className="space-y-2">
                    <Label>Animation Name</Label>
                    <Input
                      value={selectedAnimation.name}
                      onChange={(e) => updateAnimation(selectedAnimation.id, { name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={selectedAnimation.type}
                      onValueChange={(type: AnimationType) => updateAnimation(selectedAnimation.id, { type })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="move">Move</SelectItem>
                        <SelectItem value="pulse">Pulse</SelectItem>
                        <SelectItem value="rotate">Rotate</SelectItem>
                        <SelectItem value="scale">Scale</SelectItem>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (ms)</Label>
                    <Input
                      type="number"
                      value={selectedAnimation.duration}
                      onChange={(e) => updateAnimation(selectedAnimation.id, { duration: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Delay (ms)</Label>
                    <Input
                      type="number"
                      value={selectedAnimation.delay}
                      onChange={(e) => updateAnimation(selectedAnimation.id, { delay: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Iterations</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={selectedAnimation.iterations === 'infinite' ? '' : selectedAnimation.iterations}
                        onChange={(e) => {
                          const value = parseInt(e.target.value)
                          updateAnimation(selectedAnimation.id, { iterations: isNaN(value) ? 1 : value })
                        }}
                        placeholder="Count"
                        disabled={selectedAnimation.iterations === 'infinite'}
                      />
                      <Button
                        variant={selectedAnimation.iterations === 'infinite' ? 'default' : 'outline'}
                        onClick={() => updateAnimation(selectedAnimation.id, {
                          iterations: selectedAnimation.iterations === 'infinite' ? 1 : 'infinite'
                        })}
                      >
                        Infinite
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Direction</Label>
                    <Select
                      value={selectedAnimation.direction}
                      onValueChange={(direction: any) => updateAnimation(selectedAnimation.id, { direction })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="reverse">Reverse</SelectItem>
                        <SelectItem value="alternate">Alternate</SelectItem>
                        <SelectItem value="alternate-reverse">Alternate Reverse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Easing</Label>
                    <Select
                      value={selectedAnimation.easing}
                      onValueChange={(easing: EasingFunction) => updateAnimation(selectedAnimation.id, { easing })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="ease-in">Ease In</SelectItem>
                        <SelectItem value="ease-out">Ease Out</SelectItem>
                        <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                        <SelectItem value="ease-in-back">Ease In Back</SelectItem>
                        <SelectItem value="ease-out-back">Ease Out Back</SelectItem>
                        <SelectItem value="ease-in-out-back">Ease In Out Back</SelectItem>
                        <SelectItem value="ease-in-elastic">Ease In Elastic</SelectItem>
                        <SelectItem value="ease-out-elastic">Ease Out Elastic</SelectItem>
                        <SelectItem value="ease-in-out-elastic">Ease In Out Elastic</SelectItem>
                        <SelectItem value="ease-in-bounce">Ease In Bounce</SelectItem>
                        <SelectItem value="ease-out-bounce">Ease Out Bounce</SelectItem>
                        <SelectItem value="ease-in-out-bounce">Ease In Out Bounce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedKeyframe && (
                    <div className="pt-4 border-t border-border space-y-4">
                      <div className="text-sm font-semibold">Selected Keyframe</div>

                      <div className="space-y-2">
                        <Label>Time (%)</Label>
                        <Slider
                          value={[selectedKeyframe.time]}
                          onValueChange={([time]) => updateKeyframe(selectedKeyframe.id, { time })}
                          min={0}
                          max={100}
                          step={1}
                        />
                        <div className="text-xs text-muted-foreground text-right">
                          {selectedKeyframe.time.toFixed(1)}%
                        </div>
                      </div>

                      {selectedKeyframe.x !== undefined && (
                        <div className="space-y-2">
                          <Label>X Position</Label>
                          <Input
                            type="number"
                            value={selectedKeyframe.x}
                            onChange={(e) => updateKeyframe(selectedKeyframe.id, { x: parseFloat(e.target.value) })}
                          />
                        </div>
                      )}

                      {selectedKeyframe.y !== undefined && (
                        <div className="space-y-2">
                          <Label>Y Position</Label>
                          <Input
                            type="number"
                            value={selectedKeyframe.y}
                            onChange={(e) => updateKeyframe(selectedKeyframe.id, { y: parseFloat(e.target.value) })}
                          />
                        </div>
                      )}

                      {selectedKeyframe.scale !== undefined && (
                        <div className="space-y-2">
                          <Label>Scale</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={selectedKeyframe.scale}
                            onChange={(e) => updateKeyframe(selectedKeyframe.id, { scale: parseFloat(e.target.value) })}
                          />
                        </div>
                      )}

                      {selectedKeyframe.rotation !== undefined && (
                        <div className="space-y-2">
                          <Label>Rotation (deg)</Label>
                          <Input
                            type="number"
                            value={selectedKeyframe.rotation}
                            onChange={(e) => updateKeyframe(selectedKeyframe.id, { rotation: parseFloat(e.target.value) })}
                          />
                        </div>
                      )}

                      {selectedKeyframe.opacity !== undefined && (
                        <div className="space-y-2">
                          <Label>Opacity</Label>
                          <Slider
                            value={[selectedKeyframe.opacity]}
                            onValueChange={([opacity]) => updateKeyframe(selectedKeyframe.id, { opacity })}
                            min={0}
                            max={1}
                            step={0.01}
                          />
                          <div className="text-xs text-muted-foreground text-right">
                            {(selectedKeyframe.opacity * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Lightning size={32} weight="duotone" className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No animation selected</p>
                  <p className="text-xs mt-1">Select an animation from the timeline</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
