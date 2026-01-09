import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  Stop,
  FastForward,
  Rewind,
  Cursor,
  Path,
  Speedometer,
  Target,
  Circle,
  Lightning,
  Timer,
  Gauge,
  Eye,
  ArrowsClockwise,
  Crosshair
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Recording, RecordedEvent } from './AnimationRecorder'

interface CursorTrail {
  id: string
  x: number
  y: number
  timestamp: number
}

interface PlaybackState {
  isPlaying: boolean
  currentTime: number
  speed: number
  progress: number
}

const SPEED_PRESETS = [
  { value: 0.1, label: '0.1x', icon: '🐌', description: 'Super Slow' },
  { value: 0.25, label: '0.25x', icon: '🐢', description: 'Very Slow' },
  { value: 0.5, label: '0.5x', icon: '🚶', description: 'Slow' },
  { value: 1, label: '1x', icon: '▶️', description: 'Normal' },
  { value: 1.5, label: '1.5x', icon: '⚡', description: 'Fast' },
  { value: 2, label: '2x', icon: '🏃', description: 'Very Fast' },
  { value: 3, label: '3x', icon: '🚀', description: 'Ultra Fast' },
  { value: 5, label: '5x', icon: '⚡⚡', description: 'Lightning' },
]

const CURSOR_STYLES = [
  { id: 'pointer', label: 'Pointer', icon: <Cursor size={24} weight="fill" />, color: 'oklch(0.75 0.15 195)' },
  { id: 'crosshair', label: 'Crosshair', icon: <Crosshair size={24} weight="duotone" />, color: 'oklch(0.60 0.22 25)' },
  { id: 'target', label: 'Target', icon: <Target size={24} weight="duotone" />, color: 'oklch(0.45 0.19 250)' },
  { id: 'circle', label: 'Circle', icon: <Circle size={24} weight="fill" />, color: 'oklch(0.50 0.15 290)' },
]

export function PlaybackSpeedTester() {
  const [recordings] = useKV<Recording[]>('animation-recordings', [])
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    speed: 1,
    progress: 0,
  })
  
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [cursorTrail, setCursorTrail] = useState<CursorTrail[]>([])
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  
  const [showCursor, setShowCursor] = useState(true)
  const [showTrail, setShowTrail] = useState(true)
  const [showPath, setShowPath] = useState(true)
  const [showClickMarkers, setShowClickMarkers] = useState(true)
  const [showSpeed, setShowSpeed] = useState(true)
  const [showEventInfo, setShowEventInfo] = useState(true)
  const [cursorSize, setCursorSize] = useState(32)
  const [trailLength, setTrailLength] = useState(20)
  const [selectedCursorStyle, setSelectedCursorStyle] = useState('pointer')
  
  const playbackTimeoutRef = useRef<number | undefined>(undefined)
  const playbackStartTimeRef = useRef<number>(0)
  const [clickMarkers, setClickMarkers] = useState<Array<{ x: number; y: number; id: string }>>([])
  const [currentEvent, setCurrentEvent] = useState<RecordedEvent | null>(null)
  const pathCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!showPath || !selectedRecording || !pathCanvasRef.current) return

    const canvas = pathCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const mouseMoves = selectedRecording.events.filter(e => e.type === 'mousemove' && e.data.x && e.data.y)
    
    if (mouseMoves.length < 2) return

    ctx.strokeStyle = 'oklch(0.75 0.15 195 / 0.3)'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(mouseMoves[0].data.x!, mouseMoves[0].data.y!)
    
    for (let i = 1; i < mouseMoves.length; i++) {
      const event = mouseMoves[i]
      if (event.data.x && event.data.y) {
        ctx.lineTo(event.data.x, event.data.y)
      }
    }
    
    ctx.stroke()

    const clicks = selectedRecording.events.filter(e => e.type === 'click')
    clicks.forEach((click, index) => {
      if (click.data.x && click.data.y) {
        ctx.beginPath()
        ctx.arc(click.data.x, click.data.y, 8, 0, 2 * Math.PI)
        ctx.fillStyle = 'oklch(0.60 0.22 25 / 0.5)'
        ctx.fill()
        ctx.strokeStyle = 'oklch(0.60 0.22 25)'
        ctx.lineWidth = 2
        ctx.stroke()
        
        ctx.fillStyle = 'oklch(0.98 0 0)'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText((index + 1).toString(), click.data.x, click.data.y)
      }
    })

  }, [selectedRecording, showPath])

  const playRecording = (recording: Recording, startTime: number = 0) => {
    if (playbackState.isPlaying) return

    setPlaybackState(prev => ({ ...prev, isPlaying: true }))
    playbackStartTimeRef.current = Date.now() - (startTime / playbackState.speed)
    setClickMarkers([])
    setCursorTrail([])
    
    const startIndex = recording.events.findIndex(e => e.timestamp >= startTime)
    setCurrentEventIndex(startIndex >= 0 ? startIndex : 0)

    const playNextEvent = (index: number, lastEventTime: number) => {
      if (index >= recording.events.length) {
        setPlaybackState(prev => ({ ...prev, isPlaying: false, progress: 100 }))
        toast.success('Playback complete')
        return
      }

      const event = recording.events[index]
      const elapsed = (Date.now() - playbackStartTimeRef.current) * playbackState.speed
      const delay = Math.max(0, event.timestamp - elapsed)

      playbackTimeoutRef.current = window.setTimeout(() => {
        setCurrentEventIndex(index)
        setCurrentEvent(event)
        setPlaybackState(prev => ({
          ...prev,
          currentTime: event.timestamp,
          progress: (event.timestamp / recording.duration) * 100,
        }))

        if (event.type === 'mousemove' && event.data.x !== undefined && event.data.y !== undefined) {
          setCursorPosition({ x: event.data.x, y: event.data.y })
          
          if (showTrail) {
            setCursorTrail(prev => {
              const newTrail = [
                ...prev,
                { id: `trail-${Date.now()}-${Math.random()}`, x: event.data.x!, y: event.data.y!, timestamp: Date.now() }
              ]
              return newTrail.slice(-trailLength)
            })
          }
        }

        if (event.type === 'click' && event.data.x !== undefined && event.data.y !== undefined) {
          setCursorPosition({ x: event.data.x, y: event.data.y })
          
          if (showClickMarkers) {
            const markerId = `click-${Date.now()}-${Math.random()}`
            setClickMarkers(prev => [...prev, { x: event.data.x!, y: event.data.y!, id: markerId }])
          }
        }

        if (event.type === 'scroll' && event.data.scrollX !== undefined && event.data.scrollY !== undefined) {
          window.scrollTo({
            left: event.data.scrollX,
            top: event.data.scrollY,
            behavior: 'smooth'
          })
        }

        playNextEvent(index + 1, event.timestamp)
      }, delay)
    }

    playNextEvent(startIndex >= 0 ? startIndex : 0, startTime)
  }

  const pausePlayback = () => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current)
    }
    setPlaybackState(prev => ({ ...prev, isPlaying: false }))
    toast.info('Playback paused')
  }

  const stopPlayback = () => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current)
    }
    setPlaybackState({
      isPlaying: false,
      currentTime: 0,
      speed: playbackState.speed,
      progress: 0,
    })
    setCurrentEventIndex(0)
    setCurrentEvent(null)
    setCursorPosition({ x: 0, y: 0 })
    setCursorTrail([])
    setClickMarkers([])
    toast.info('Playback stopped')
  }

  const changeSpeed = (newSpeed: number) => {
    const wasPlaying = playbackState.isPlaying
    if (wasPlaying) {
      pausePlayback()
    }
    
    setPlaybackState(prev => ({ ...prev, speed: newSpeed }))
    toast.success(`Playback speed: ${newSpeed}x`)
    
    if (wasPlaying && selectedRecording) {
      setTimeout(() => {
        playRecording(selectedRecording, playbackState.currentTime)
      }, 100)
    }
  }

  const skipToTime = (time: number) => {
    if (!selectedRecording) return
    
    const wasPlaying = playbackState.isPlaying
    stopPlayback()
    
    if (wasPlaying) {
      setTimeout(() => {
        playRecording(selectedRecording, time)
      }, 100)
    } else {
      setPlaybackState(prev => ({ ...prev, currentTime: time, progress: (time / selectedRecording.duration) * 100 }))
    }
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const milliseconds = Math.floor((ms % 1000) / 10)
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  }

  const getCursorStyle = () => {
    const style = CURSOR_STYLES.find(s => s.id === selectedCursorStyle)
    return style || CURSOR_STYLES[0]
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Speedometer size={24} weight="duotone" className="text-accent" />
                Playback Speed Tester
              </CardTitle>
              <CardDescription>
                Test recordings at different speeds with advanced cursor visualization
              </CardDescription>
            </div>
            {playbackState.isPlaying && (
              <Badge className="gap-2 bg-accent text-accent-foreground animate-pulse">
                <Lightning size={14} weight="fill" />
                {playbackState.speed}x
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recordings">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="recordings">
                <Eye size={16} className="mr-2" />
                Recordings
              </TabsTrigger>
              <TabsTrigger value="playback" disabled={!selectedRecording}>
                <Play size={16} className="mr-2" />
                Playback
              </TabsTrigger>
              <TabsTrigger value="visualization" disabled={!selectedRecording}>
                <Path size={16} className="mr-2" />
                Visualization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recordings" className="space-y-3">
              {!recordings || recordings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Timer size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
                  <p>No recordings available</p>
                  <p className="text-sm mt-2">Create recordings using the Animation Recorder</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {recordings.map((recording) => (
                      <motion.button
                        key={recording.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'w-full p-4 rounded-lg border-2 transition-all text-left',
                          selectedRecording?.id === recording.id
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/50'
                        )}
                        onClick={() => {
                          setSelectedRecording(recording)
                          stopPlayback()
                          toast.success(`Selected: ${recording.name}`)
                        }}
                      >
                        <div className="font-semibold mb-2">{recording.name}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {formatTime(recording.duration)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {recording.events.length} events
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {recording.events.filter(e => e.type === 'click').length} clicks
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {recording.events.filter(e => e.type === 'mousemove').length} moves
                          </Badge>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="playback" className="space-y-4">
              {selectedRecording && (
                <>
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Speed Presets</span>
                      <Badge variant="outline" className="gap-1">
                        <Gauge size={14} />
                        {playbackState.speed}x
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {SPEED_PRESETS.map((preset) => (
                        <Button
                          key={preset.value}
                          variant={playbackState.speed === preset.value ? 'default' : 'outline'}
                          size="sm"
                          className="flex flex-col gap-1 h-auto py-2"
                          onClick={() => changeSpeed(preset.value)}
                          disabled={playbackState.isPlaying}
                        >
                          <span className="text-lg">{preset.icon}</span>
                          <span className="text-xs font-mono">{preset.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Custom Speed</Label>
                      <Badge variant="outline" className="font-mono">{playbackState.speed.toFixed(2)}x</Badge>
                    </div>
                    <Slider
                      value={[playbackState.speed]}
                      onValueChange={(value) => changeSpeed(value[0])}
                      min={0.1}
                      max={10}
                      step={0.1}
                      disabled={playbackState.isPlaying}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.1x</span>
                      <span>5x</span>
                      <span>10x</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Timeline</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatTime(playbackState.currentTime)} / {formatTime(selectedRecording.duration)}
                      </span>
                    </div>
                    <div className="relative">
                      <Slider
                        value={[playbackState.currentTime]}
                        onValueChange={(value) => skipToTime(value[0])}
                        min={0}
                        max={selectedRecording.duration}
                        step={10}
                        className="cursor-pointer"
                      />
                      <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary via-accent to-secondary"
                          style={{ width: `${playbackState.progress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => skipToTime(Math.max(0, playbackState.currentTime - 1000))}
                      disabled={playbackState.isPlaying}
                    >
                      <Rewind size={20} weight="fill" />
                    </Button>
                    
                    {!playbackState.isPlaying ? (
                      <Button
                        className="flex-1 bg-gradient-to-r from-primary to-accent"
                        onClick={() => playRecording(selectedRecording, playbackState.currentTime)}
                      >
                        <Play size={20} weight="fill" className="mr-2" />
                        Play {playbackState.currentTime > 0 ? 'Resume' : ''}
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={pausePlayback}
                      >
                        <Pause size={20} weight="fill" className="mr-2" />
                        Pause
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={stopPlayback}
                      disabled={!playbackState.isPlaying && playbackState.currentTime === 0}
                    >
                      <Stop size={20} weight="fill" className="mr-2" />
                      Stop
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => skipToTime(Math.min(selectedRecording.duration, playbackState.currentTime + 1000))}
                      disabled={playbackState.isPlaying}
                    >
                      <FastForward size={20} weight="fill" />
                    </Button>
                  </div>

                  {showEventInfo && currentEvent && (
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <Circle size={12} weight="fill" className="text-accent" />
                        Current Event
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="outline" className="ml-2">{currentEvent.type}</Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Index:</span>
                          <span className="ml-2">{currentEventIndex + 1} / {selectedRecording.events.length}</span>
                        </div>
                        {currentEvent.data.x !== undefined && (
                          <div>
                            <span className="text-muted-foreground">X:</span>
                            <span className="ml-2">{Math.round(currentEvent.data.x)}px</span>
                          </div>
                        )}
                        {currentEvent.data.y !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Y:</span>
                            <span className="ml-2">{Math.round(currentEvent.data.y)}px</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="visualization" className="space-y-4">
              {selectedRecording && (
                <>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="show-cursor" className="text-sm">Show Cursor</Label>
                        <Switch
                          id="show-cursor"
                          checked={showCursor}
                          onCheckedChange={setShowCursor}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="show-trail" className="text-sm">Show Trail</Label>
                        <Switch
                          id="show-trail"
                          checked={showTrail}
                          onCheckedChange={setShowTrail}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="show-path" className="text-sm">Show Path</Label>
                        <Switch
                          id="show-path"
                          checked={showPath}
                          onCheckedChange={setShowPath}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="show-clicks" className="text-sm">Click Markers</Label>
                        <Switch
                          id="show-clicks"
                          checked={showClickMarkers}
                          onCheckedChange={setShowClickMarkers}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="show-speed" className="text-sm">Speed Badge</Label>
                        <Switch
                          id="show-speed"
                          checked={showSpeed}
                          onCheckedChange={setShowSpeed}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="show-event-info" className="text-sm">Event Info</Label>
                        <Switch
                          id="show-event-info"
                          checked={showEventInfo}
                          onCheckedChange={setShowEventInfo}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Cursor Style</Label>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {CURSOR_STYLES.map((style) => (
                          <Button
                            key={style.id}
                            variant={selectedCursorStyle === style.id ? 'default' : 'outline'}
                            className="flex flex-col gap-1 h-auto py-3"
                            onClick={() => setSelectedCursorStyle(style.id)}
                          >
                            {style.icon}
                            <span className="text-xs">{style.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Cursor Size</Label>
                        <Badge variant="outline">{cursorSize}px</Badge>
                      </div>
                      <Slider
                        value={[cursorSize]}
                        onValueChange={(value) => setCursorSize(value[0])}
                        min={16}
                        max={64}
                        step={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Trail Length</Label>
                        <Badge variant="outline">{trailLength} points</Badge>
                      </div>
                      <Slider
                        value={[trailLength]}
                        onValueChange={(value) => setTrailLength(value[0])}
                        min={5}
                        max={100}
                        step={5}
                      />
                    </div>

                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setShowCursor(true)
                        setShowTrail(true)
                        setShowPath(true)
                        setShowClickMarkers(true)
                        setShowSpeed(true)
                        setShowEventInfo(true)
                        setCursorSize(32)
                        setTrailLength(20)
                        setSelectedCursorStyle('pointer')
                        toast.success('Reset to defaults')
                      }}
                    >
                      <ArrowsClockwise size={16} className="mr-2" />
                      Reset Defaults
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showPath && selectedRecording && (
        <canvas
          ref={pathCanvasRef}
          className="fixed inset-0 pointer-events-none z-[9998]"
          style={{ width: '100vw', height: '100vh' }}
        />
      )}

      <AnimatePresence>
        {playbackState.isPlaying && showCursor && (
          <motion.div
            className="fixed pointer-events-none z-[99999] drop-shadow-lg"
            style={{
              left: cursorPosition.x,
              top: cursorPosition.y,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1 }}
          >
            {selectedCursorStyle === 'pointer' && (
              <Cursor 
                size={cursorSize} 
                weight="fill" 
                style={{ color: getCursorStyle().color }}
              />
            )}
            {selectedCursorStyle === 'crosshair' && (
              <Crosshair 
                size={cursorSize} 
                weight="duotone" 
                style={{ color: getCursorStyle().color }}
              />
            )}
            {selectedCursorStyle === 'target' && (
              <Target 
                size={cursorSize} 
                weight="duotone" 
                style={{ color: getCursorStyle().color }}
              />
            )}
            {selectedCursorStyle === 'circle' && (
              <Circle 
                size={cursorSize} 
                weight="fill" 
                style={{ color: getCursorStyle().color }}
              />
            )}
          </motion.div>
        )}

        {playbackState.isPlaying && showTrail && cursorTrail.map((trail, index) => (
          <motion.div
            key={trail.id}
            className="fixed pointer-events-none z-[99998] rounded-full"
            style={{
              left: trail.x,
              top: trail.y,
              width: 8,
              height: 8,
              backgroundColor: getCursorStyle().color,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ 
              opacity: 0,
              scale: 0.2,
            }}
            transition={{ duration: 1 }}
          />
        ))}

        {showClickMarkers && clickMarkers.map((marker) => (
          <motion.div
            key={marker.id}
            className="fixed pointer-events-none z-[99997]"
            style={{
              left: marker.x,
              top: marker.y,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [1, 0.5, 0], scale: [0, 1.5, 2] }}
            transition={{ duration: 1 }}
            onAnimationComplete={() => {
              setClickMarkers(prev => prev.filter(m => m.id !== marker.id))
            }}
          >
            <div
              className="w-16 h-16 rounded-full border-4"
              style={{ borderColor: 'oklch(0.60 0.22 25)' }}
            />
          </motion.div>
        ))}

        {showSpeed && playbackState.isPlaying && (
          <motion.div
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[99999] pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Badge className="text-lg px-4 py-2 gap-2 bg-accent text-accent-foreground shadow-lg">
              <Lightning size={20} weight="fill" />
              {playbackState.speed}x Speed
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
