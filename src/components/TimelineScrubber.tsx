import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Pause, 
  ArrowsClockwise, 
  Plus, 
  Trash,
  CaretLeft,
  CaretRight,
  Timer,
  Target,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  FilmStrip,
  Lightning,
  Circle,
  Warning
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Keyframe {
  id: string
  time: number
  properties: Record<string, number | string>
  easing?: string
  label?: string
}

interface AnimationTrack {
  id: string
  name: string
  elementId: string
  enabled: boolean
  keyframes: Keyframe[]
  color: string
  locked: boolean
}

interface TimelineScrubberProps {
  tracks: AnimationTrack[]
  duration: number
  onUpdateTrack: (trackId: string, updates: Partial<AnimationTrack>) => void
  onCreateKeyframe: (trackId: string, time: number) => void
  onDeleteKeyframe: (trackId: string, keyframeId: string) => void
  onUpdateKeyframe: (trackId: string, keyframeId: string, updates: Partial<Keyframe>) => void
  currentTime?: number
  isPlaying?: boolean
  onTimeChange?: (time: number) => void
  onPlayStateChange?: (isPlaying: boolean) => void
}

export function TimelineScrubber({
  tracks,
  duration,
  onUpdateTrack,
  onCreateKeyframe,
  onDeleteKeyframe,
  onUpdateKeyframe,
  currentTime: externalCurrentTime,
  isPlaying: externalIsPlaying,
  onTimeChange,
  onPlayStateChange
}: TimelineScrubberProps) {
  const [localCurrentTime, setLocalCurrentTime] = useState(0)
  const [localIsPlaying, setLocalIsPlaying] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [selectedKeyframe, setSelectedKeyframe] = useState<{ trackId: string, keyframeId: string } | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedKeyframe, setDraggedKeyframe] = useState<{ trackId: string, keyframeId: string } | null>(null)
  const [snapToKeyframes, setSnapToKeyframes] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const timelineRef = useRef<HTMLDivElement>(null)
  const scrubberRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const lastTimeRef = useRef<number>(0)

  const currentTime = externalCurrentTime !== undefined ? externalCurrentTime : localCurrentTime
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : localIsPlaying

  const setCurrentTime = useCallback((value: number | ((prev: number) => number)) => {
    const newValue = typeof value === 'function' ? value(currentTime) : value
    if (onTimeChange) {
      onTimeChange(newValue)
    } else {
      setLocalCurrentTime(newValue)
    }
  }, [currentTime, onTimeChange])

  const setIsPlaying = useCallback((value: boolean) => {
    if (onPlayStateChange) {
      onPlayStateChange(value)
    } else {
      setLocalIsPlaying(value)
    }
  }, [onPlayStateChange])

  useEffect(() => {
    if (isPlaying) {
      const animate = (timestamp: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp
        const delta = (timestamp - lastTimeRef.current) * playbackSpeed
        lastTimeRef.current = timestamp

        setCurrentTime(prev => {
          const next = prev + delta
          if (next >= duration) {
            setIsPlaying(false)
            return 0
          }
          return next
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
  }, [isPlaying, duration, playbackSpeed, setCurrentTime, setIsPlaying])

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    let newTime = percentage * duration

    if (snapToKeyframes && e.shiftKey === false) {
      const allKeyframeTimes = tracks.flatMap(t => t.keyframes?.map(k => k.time) || [])
      const snapDistance = 50
      const closest = allKeyframeTimes.reduce<number>((prev, curr) => {
        return Math.abs(curr - newTime) < Math.abs(prev - newTime) ? curr : prev
      }, Infinity)
      
      if (Math.abs(closest - newTime) < snapDistance && closest !== Infinity) {
        newTime = closest
      }
    }

    setCurrentTime(newTime)
  }

  const handleKeyframeDragStart = (trackId: string, keyframeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraggedKeyframe({ trackId, keyframeId })
    setSelectedKeyframe({ trackId, keyframeId })
    setIsDragging(true)
  }

  const handleKeyframeDrag = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedKeyframe || !timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    let newTime = percentage * duration

    if (snapToKeyframes && !e.shiftKey) {
      const track = tracks.find(t => t.id === draggedKeyframe.trackId)
      if (track) {
        const otherKeyframeTimes = track.keyframes
          .filter(k => k.id !== draggedKeyframe.keyframeId)
          .map(k => k.time)
        
        const snapDistance = 50
        const closest = otherKeyframeTimes.reduce((prev, curr) => {
          return Math.abs(curr - newTime) < Math.abs(prev - newTime) ? curr : prev
        }, Infinity)
        
        if (Math.abs(closest - newTime) < snapDistance) {
          newTime = closest
        }
      }
    }

    onUpdateKeyframe(draggedKeyframe.trackId, draggedKeyframe.keyframeId, { time: newTime })
  }, [isDragging, draggedKeyframe, duration, tracks, snapToKeyframes, onUpdateKeyframe])

  const handleKeyframeDragEnd = useCallback(() => {
    setIsDragging(false)
    setDraggedKeyframe(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleKeyframeDrag)
      window.addEventListener('mouseup', handleKeyframeDragEnd)
      return () => {
        window.removeEventListener('mousemove', handleKeyframeDrag)
        window.removeEventListener('mouseup', handleKeyframeDragEnd)
      }
    }
  }, [isDragging, handleKeyframeDrag, handleKeyframeDragEnd])

  const stepForward = () => {
    const frameTime = 1000 / 60
    setCurrentTime(Math.min(currentTime + frameTime, duration))
  }

  const stepBackward = () => {
    const frameTime = 1000 / 60
    setCurrentTime(Math.max(currentTime - frameTime, 0))
  }

  const jumpToNextKeyframe = () => {
    const allKeyframeTimes = tracks
      .flatMap(t => t.keyframes?.map(k => k.time) || [])
      .filter(t => t > currentTime)
      .sort((a, b) => a - b)
    
    if (allKeyframeTimes.length > 0) {
      setCurrentTime(allKeyframeTimes[0])
    }
  }

  const jumpToPreviousKeyframe = () => {
    const allKeyframeTimes = tracks
      .flatMap(t => t.keyframes?.map(k => k.time) || [])
      .filter(t => t < currentTime)
      .sort((a, b) => b - a)
    
    if (allKeyframeTimes.length > 0) {
      setCurrentTime(allKeyframeTimes[0])
    }
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const milliseconds = Math.floor(ms % 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0').slice(0, 2)}`
  }

  const selectedKeyframeData = selectedKeyframe 
    ? tracks.find(t => t.id === selectedKeyframe.trackId)?.keyframes.find(k => k.id === selectedKeyframe.keyframeId)
    : null

  const timelineWidth = 100 * zoom

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-none pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FilmStrip size={20} weight="duotone" className="text-accent" />
              Timeline Scrubber
            </CardTitle>
            <CardDescription>Precise keyframe editing and animation control</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Timer size={14} />
            {formatTime(currentTime)} / {formatTime(duration)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isPlaying ? 'default' : 'outline'}
              onClick={() => {
                setIsPlaying(!isPlaying)
                if (!isPlaying && currentTime >= duration) {
                  setCurrentTime(0)
                }
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
              size="sm"
              variant="outline"
              onClick={() => setCurrentTime(0)}
            >
              <ArrowsClockwise size={16} />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              size="sm"
              variant="ghost"
              onClick={jumpToPreviousKeyframe}
              title="Previous Keyframe"
            >
              <Target size={16} className="mr-1" />
              <CaretLeft size={12} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={stepBackward}
              title="Step Backward (1 frame)"
            >
              <CaretLeft size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={stepForward}
              title="Step Forward (1 frame)"
            >
              <CaretRight size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={jumpToNextKeyframe}
              title="Next Keyframe"
            >
              <CaretRight size={12} />
              <Target size={16} className="ml-1" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Speed:</Label>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="text-xs h-8 px-2 rounded border border-border bg-background"
              >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            >
              <MagnifyingGlassMinus size={16} />
            </Button>
            <div className="text-xs font-mono w-12 text-center">{zoom.toFixed(2)}x</div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setZoom(Math.min(4, zoom + 0.25))}
            >
              <MagnifyingGlassPlus size={16} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 px-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="snap-keyframes"
              checked={snapToKeyframes}
              onChange={(e) => setSnapToKeyframes(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="snap-keyframes" className="text-xs cursor-pointer">
              Snap to keyframes
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-grid"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="show-grid" className="text-xs cursor-pointer">
              Show grid
            </Label>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden border border-border rounded-lg bg-card">
          <div className="flex-none h-8 border-b border-border relative overflow-x-auto">
            <div 
              className="relative h-full"
              style={{ width: `${timelineWidth}%` }}
            >
              {showGrid && (
                <div className="absolute inset-0 flex">
                  {Array.from({ length: 21 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-r border-border/30 relative"
                    >
                      <div className="absolute top-0 left-0 text-[10px] text-muted-foreground px-1">
                        {formatTime((duration * i) / 20)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="relative" style={{ width: `${timelineWidth}%`, minHeight: '300px' }}>
              <div
                ref={timelineRef}
                className="absolute inset-0"
                onClick={handleTimelineClick}
              >
                {showGrid && (
                  <div className="absolute inset-0 flex pointer-events-none">
                    {Array.from({ length: 21 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-r border-border/20"
                      />
                    ))}
                  </div>
                )}

                {tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className={cn(
                      "relative h-16 border-b border-border transition-colors",
                      selectedTrack === track.id && "bg-accent/5",
                      !track.enabled && "opacity-40"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTrack(track.id)
                    }}
                  >
                    <div className="absolute left-0 top-0 h-full w-32 bg-card border-r border-border flex items-center px-3 gap-2 z-10">
                      <input
                        type="checkbox"
                        checked={track.enabled}
                        onChange={(e) => {
                          e.stopPropagation()
                          onUpdateTrack(track.id, { enabled: e.target.checked })
                        }}
                        className="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{track.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {track.keyframes.length} keyframes
                        </div>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: track.color }}
                      />
                    </div>

                    <div className="absolute left-32 right-0 top-0 h-full">
                      <AnimatePresence>
                        {track.keyframes.map((keyframe) => {
                          const position = (keyframe.time / duration) * 100
                          const isSelected = selectedKeyframe?.trackId === track.id && 
                                           selectedKeyframe?.keyframeId === keyframe.id
                          
                          return (
                            <motion.div
                              key={keyframe.id}
                              className={cn(
                                "absolute top-1/2 -translate-y-1/2 cursor-move group",
                                isDragging && draggedKeyframe?.keyframeId === keyframe.id && "z-20"
                              )}
                              style={{ left: `${position}%` }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              onMouseDown={(e) => handleKeyframeDragStart(track.id, keyframe.id, e)}
                            >
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-sm rotate-45 border-2 transition-all",
                                  isSelected 
                                    ? "border-accent bg-accent scale-125 shadow-lg shadow-accent/50" 
                                    : "border-primary bg-primary group-hover:scale-110 group-hover:border-accent"
                                )}
                                style={{ borderColor: track.color, backgroundColor: track.color }}
                              />
                              {keyframe.label && (
                                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                  {keyframe.label}
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover border border-border rounded text-[10px] whitespace-nowrap shadow-lg">
                                  {formatTime(keyframe.time)}
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>

                      {track.keyframes.length > 1 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                          {track.keyframes.slice(0, -1).map((keyframe, idx) => {
                            const nextKeyframe = track.keyframes[idx + 1]
                            const x1 = (keyframe.time / duration) * 100
                            const x2 = (nextKeyframe.time / duration) * 100
                            
                            return (
                              <line
                                key={keyframe.id}
                                x1={`${x1}%`}
                                y1="50%"
                                x2={`${x2}%`}
                                y2="50%"
                                stroke={track.color}
                                strokeWidth="2"
                                strokeDasharray="4 2"
                              />
                            )
                          })}
                        </svg>
                      )}
                    </div>
                  </div>
                ))}

                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-[0_0_10px_rgba(var(--accent),0.5)] pointer-events-none z-30"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                    <div className="w-4 h-4 bg-accent rounded-sm rotate-45 border-2 border-accent-foreground shadow-lg" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {selectedKeyframeData && selectedKeyframe && (
          <Card className="border-accent/50 bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Circle size={16} weight="fill" className="text-accent" />
                Keyframe Editor
                <Badge variant="secondary" className="ml-auto text-xs">
                  {formatTime(selectedKeyframeData.time)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Time (ms)</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedKeyframeData.time)}
                    onChange={(e) => {
                      const newTime = Math.max(0, Math.min(duration, parseFloat(e.target.value) || 0))
                      onUpdateKeyframe(selectedKeyframe.trackId, selectedKeyframe.keyframeId, { time: newTime })
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Label (optional)</Label>
                  <Input
                    value={selectedKeyframeData.label || ''}
                    onChange={(e) => {
                      onUpdateKeyframe(selectedKeyframe.trackId, selectedKeyframe.keyframeId, { label: e.target.value })
                    }}
                    placeholder="Keyframe label"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Properties</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(selectedKeyframeData.properties).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Label className="text-xs min-w-[60px] text-muted-foreground">{key}:</Label>
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => {
                          const newProperties = { ...selectedKeyframeData.properties, [key]: parseFloat(e.target.value) }
                          onUpdateKeyframe(selectedKeyframe.trackId, selectedKeyframe.keyframeId, { properties: newProperties })
                        }}
                        className="h-7 text-xs flex-1"
                        step="0.1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs"
                  onClick={() => {
                    onDeleteKeyframe(selectedKeyframe.trackId, selectedKeyframe.keyframeId)
                    setSelectedKeyframe(null)
                    toast.success('Keyframe deleted')
                  }}
                >
                  <Trash size={14} className="mr-2" />
                  Delete Keyframe
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedKeyframeData && tracks.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="space-y-3">
              <FilmStrip size={48} weight="duotone" className="mx-auto text-muted-foreground opacity-50" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">No animation tracks</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create animations in the timeline to see them here
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
