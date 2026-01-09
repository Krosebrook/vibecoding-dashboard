import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Record, 
  Stop, 
  Play, 
  Pause, 
  Download, 
  Trash,
  ArrowClockwise,
  Circle,
  Mouse,
  Cursor,
  Hand,
  Eye,
  Code,
  FilmSlate,
  Export
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export interface RecordedEvent {
  timestamp: number
  type: 'click' | 'mousemove' | 'scroll' | 'keypress' | 'hover'
  target: string
  data: {
    x?: number
    y?: number
    scrollX?: number
    scrollY?: number
    key?: string
    elementPath?: string
  }
}

export interface Recording {
  id: string
  name: string
  duration: number
  events: RecordedEvent[]
  createdAt: number
  thumbnail?: string
}

export function AnimationRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentRecording, setCurrentRecording] = useState<RecordedEvent[]>([])
  const [recordings, setRecordings] = useKV<Recording[]>('animation-recordings', [])
  const [recordingName, setRecordingName] = useState('')
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showCursor, setShowCursor] = useState(true)
  const [recordClicks, setRecordClicks] = useState(true)
  const [recordMouseMoves, setRecordMouseMoves] = useState(true)
  const [recordScrolls, setRecordScrolls] = useState(true)
  const [recordHovers, setRecordHovers] = useState(false)
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [showPlaybackCursor, setShowPlaybackCursor] = useState(false)

  const startTimeRef = useRef<number>(0)
  const pauseTimeRef = useRef<number>(0)
  const totalPausedTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const playbackStartTimeRef = useRef<number>(0)
  const playbackTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!isRecording || isPaused) return

    const handleClick = (e: MouseEvent) => {
      if (!recordClicks) return
      
      const event: RecordedEvent = {
        timestamp: Date.now() - startTimeRef.current - totalPausedTimeRef.current,
        type: 'click',
        target: getElementPath(e.target as HTMLElement),
        data: {
          x: e.clientX,
          y: e.clientY,
          elementPath: getElementPath(e.target as HTMLElement)
        }
      }
      setCurrentRecording(prev => [...prev, event])
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!recordMouseMoves) return
      
      const event: RecordedEvent = {
        timestamp: Date.now() - startTimeRef.current - totalPausedTimeRef.current,
        type: 'mousemove',
        target: 'document',
        data: {
          x: e.clientX,
          y: e.clientY
        }
      }
      setCurrentRecording(prev => [...prev, event])
    }

    const handleScroll = () => {
      if (!recordScrolls) return
      
      const event: RecordedEvent = {
        timestamp: Date.now() - startTimeRef.current - totalPausedTimeRef.current,
        type: 'scroll',
        target: 'window',
        data: {
          scrollX: window.scrollX,
          scrollY: window.scrollY
        }
      }
      setCurrentRecording(prev => [...prev, event])
    }

    const handleMouseOver = (e: MouseEvent) => {
      if (!recordHovers) return
      
      const event: RecordedEvent = {
        timestamp: Date.now() - startTimeRef.current - totalPausedTimeRef.current,
        type: 'hover',
        target: getElementPath(e.target as HTMLElement),
        data: {
          x: e.clientX,
          y: e.clientY,
          elementPath: getElementPath(e.target as HTMLElement)
        }
      }
      setCurrentRecording(prev => [...prev, event])
    }

    const throttledMouseMove = throttle(handleMouseMove, 50)

    document.addEventListener('click', handleClick)
    document.addEventListener('mousemove', throttledMouseMove)
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mouseover', handleMouseOver)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('mousemove', throttledMouseMove)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mouseover', handleMouseOver)
    }
  }, [isRecording, isPaused, recordClicks, recordMouseMoves, recordScrolls, recordHovers])

  useEffect(() => {
    if (!isRecording) return

    const updateDuration = () => {
      if (!isPaused) {
        setRecordingDuration(Date.now() - startTimeRef.current - totalPausedTimeRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(updateDuration)
    }

    animationFrameRef.current = requestAnimationFrame(updateDuration)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRecording, isPaused])

  const startRecording = () => {
    setIsRecording(true)
    setIsPaused(false)
    setCurrentRecording([])
    setRecordingDuration(0)
    startTimeRef.current = Date.now()
    totalPausedTimeRef.current = 0
    toast.success('Recording started', {
      description: 'Interact with the page to record animations'
    })
  }

  const pauseRecording = () => {
    setIsPaused(true)
    pauseTimeRef.current = Date.now()
    toast.info('Recording paused')
  }

  const resumeRecording = () => {
    setIsPaused(false)
    totalPausedTimeRef.current += Date.now() - pauseTimeRef.current
    toast.info('Recording resumed')
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsPaused(false)
    
    if (currentRecording.length === 0) {
      toast.error('No events recorded')
      return
    }

    const name = recordingName || `Recording ${(recordings || []).length + 1}`
    const recording: Recording = {
      id: `rec-${Date.now()}`,
      name,
      duration: recordingDuration,
      events: currentRecording,
      createdAt: Date.now()
    }

    setRecordings((prev = []) => [...prev, recording])
    setCurrentRecording([])
    setRecordingName('')
    setRecordingDuration(0)
    
    toast.success('Recording saved', {
      description: `${currentRecording.length} events captured`
    })
  }

  const playRecording = (recording: Recording) => {
    if (isPlaying) return
    
    setIsPlaying(true)
    setSelectedRecording(recording)
    setPlaybackProgress(0)
    setShowPlaybackCursor(true)
    playbackStartTimeRef.current = Date.now()

    const playEvent = (event: RecordedEvent, index: number) => {
      const delay = (event.timestamp / playbackSpeed)
      
      playbackTimeoutRef.current = window.setTimeout(() => {
        setPlaybackProgress((index + 1) / recording.events.length * 100)
        
        if (event.type === 'mousemove' && event.data.x && event.data.y) {
          setCursorPosition({ x: event.data.x, y: event.data.y })
        }
        
        if (event.type === 'click' && event.data.x && event.data.y) {
          setCursorPosition({ x: event.data.x, y: event.data.y })
          showClickAnimation(event.data.x, event.data.y)
        }
        
        if (event.type === 'scroll' && event.data.scrollX !== undefined && event.data.scrollY !== undefined) {
          window.scrollTo({
            left: event.data.scrollX,
            top: event.data.scrollY,
            behavior: 'smooth'
          })
        }
        
        if (index < recording.events.length - 1) {
          const nextEvent = recording.events[index + 1]
          const nextDelay = (nextEvent.timestamp - event.timestamp) / playbackSpeed
          playEvent(nextEvent, index + 1)
        } else {
          setIsPlaying(false)
          setShowPlaybackCursor(false)
          setPlaybackProgress(100)
          toast.success('Playback complete')
        }
      }, index === 0 ? delay : (recording.events[index].timestamp - recording.events[index - 1].timestamp) / playbackSpeed)
    }

    if (recording.events.length > 0) {
      playEvent(recording.events[0], 0)
    }
  }

  const stopPlayback = () => {
    setIsPlaying(false)
    setShowPlaybackCursor(false)
    setPlaybackProgress(0)
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current)
    }
    toast.info('Playback stopped')
  }

  const deleteRecording = (id: string) => {
    setRecordings((prev = []) => prev.filter(r => r.id !== id))
    if (selectedRecording?.id === id) {
      setSelectedRecording(null)
    }
    toast.success('Recording deleted')
  }

  const exportRecording = (recording: Recording, format: 'json' | 'csv' | 'code') => {
    let content = ''
    let filename = ''
    let mimeType = ''

    switch (format) {
      case 'json':
        content = JSON.stringify(recording, null, 2)
        filename = `${recording.name.replace(/\s+/g, '-').toLowerCase()}.json`
        mimeType = 'application/json'
        break
      
      case 'csv':
        const headers = 'Timestamp,Type,Target,X,Y,ScrollX,ScrollY,ElementPath\n'
        const rows = recording.events.map(e => 
          `${e.timestamp},${e.type},${e.target},${e.data.x || ''},${e.data.y || ''},${e.data.scrollX || ''},${e.data.scrollY || ''},${e.data.elementPath || ''}`
        ).join('\n')
        content = headers + rows
        filename = `${recording.name.replace(/\s+/g, '-').toLowerCase()}.csv`
        mimeType = 'text/csv'
        break
      
      case 'code':
        content = generateAnimationCode(recording)
        filename = `${recording.name.replace(/\s+/g, '-').toLowerCase()}.tsx`
        mimeType = 'text/plain'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success(`Exported as ${format.toUpperCase()}`)
  }

  const showClickAnimation = (x: number, y: number) => {
    const ripple = document.createElement('div')
    ripple.style.position = 'fixed'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.style.width = '20px'
    ripple.style.height = '20px'
    ripple.style.borderRadius = '50%'
    ripple.style.border = '3px solid oklch(0.75 0.15 195)'
    ripple.style.transform = 'translate(-50%, -50%) scale(0)'
    ripple.style.animation = 'ripple 0.6s ease-out'
    ripple.style.pointerEvents = 'none'
    ripple.style.zIndex = '99999'
    
    document.body.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getElementPath = (element: HTMLElement): string => {
    const path: string[] = []
    let current: HTMLElement | null = element

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase()
      
      if (current.id) {
        selector += `#${current.id}`
      } else if (current.className) {
        const classes = current.className.split(' ').filter(c => c.trim()).slice(0, 2)
        if (classes.length > 0) {
          selector += `.${classes.join('.')}`
        }
      }
      
      path.unshift(selector)
      current = current.parentElement
    }

    return path.join(' > ')
  }

  const generateAnimationCode = (recording: Recording): string => {
    return `// Generated animation code for: ${recording.name}
import { motion } from 'framer-motion'

export const ${recording.name.replace(/\s+/g, '')}Animation = () => {
  const events = ${JSON.stringify(recording.events, null, 2)}

  return (
    <div className="relative">
      {/* Implement animation based on recorded events */}
      {events.map((event, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: event.data.x,
            y: event.data.y
          }}
          transition={{ 
            delay: event.timestamp / 1000,
            duration: 0.3 
          }}
        />
      ))}
    </div>
  )
}

// Total events: ${recording.events.length}
// Duration: ${formatDuration(recording.duration)}
// Clicks: ${recording.events.filter(e => e.type === 'click').length}
// Mouse moves: ${recording.events.filter(e => e.type === 'mousemove').length}
// Scrolls: ${recording.events.filter(e => e.type === 'scroll').length}
`
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FilmSlate size={20} weight="duotone" className="text-accent" />
                Animation Recorder
              </CardTitle>
              <CardDescription>
                Capture live interactions and replay them as animations
              </CardDescription>
            </div>
            {isRecording && (
              <Badge variant="destructive" className="gap-2 animate-pulse">
                <Circle size={12} weight="fill" />
                {isPaused ? 'Paused' : 'Recording'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isRecording && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recording-name">Recording Name</Label>
                <Input
                  id="recording-name"
                  placeholder="My Animation Recording"
                  value={recordingName}
                  onChange={(e) => setRecordingName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="record-clicks" className="text-sm">Record Clicks</Label>
                  <Switch
                    id="record-clicks"
                    checked={recordClicks}
                    onCheckedChange={setRecordClicks}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="record-moves" className="text-sm">Record Mouse</Label>
                  <Switch
                    id="record-moves"
                    checked={recordMouseMoves}
                    onCheckedChange={setRecordMouseMoves}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="record-scrolls" className="text-sm">Record Scrolls</Label>
                  <Switch
                    id="record-scrolls"
                    checked={recordScrolls}
                    onCheckedChange={setRecordScrolls}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="record-hovers" className="text-sm">Record Hovers</Label>
                  <Switch
                    id="record-hovers"
                    checked={recordHovers}
                    onCheckedChange={setRecordHovers}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-destructive to-accent"
                size="lg"
                onClick={startRecording}
              >
                <Record size={20} weight="fill" className="mr-2" />
                Start Recording
              </Button>
            </div>
          )}

          {isRecording && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="text-2xl font-bold font-mono">
                    {formatDuration(recordingDuration)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentRecording.length} events captured
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isPaused ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={pauseRecording}
                    >
                      <Pause size={20} weight="fill" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={resumeRecording}
                    >
                      <Play size={20} weight="fill" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={stopRecording}
                  >
                    <Stop size={20} weight="fill" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Event breakdown:</div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-center">
                    <div className="text-lg font-bold">{currentRecording.filter(e => e.type === 'click').length}</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div className="p-2 bg-secondary/10 rounded-lg text-center">
                    <div className="text-lg font-bold">{currentRecording.filter(e => e.type === 'mousemove').length}</div>
                    <div className="text-xs text-muted-foreground">Moves</div>
                  </div>
                  <div className="p-2 bg-accent/10 rounded-lg text-center">
                    <div className="text-lg font-bold">{currentRecording.filter(e => e.type === 'scroll').length}</div>
                    <div className="text-xs text-muted-foreground">Scrolls</div>
                  </div>
                  <div className="p-2 bg-muted rounded-lg text-center">
                    <div className="text-lg font-bold">{currentRecording.filter(e => e.type === 'hover').length}</div>
                    <div className="text-xs text-muted-foreground">Hovers</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {recordings && recordings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} weight="duotone" />
              Saved Recordings ({recordings.length})
            </CardTitle>
            <CardDescription>
              Replay, export, or delete your recorded animations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list">
              <TabsList className="w-full">
                <TabsTrigger value="list" className="flex-1">
                  <Mouse size={16} className="mr-2" />
                  Recordings
                </TabsTrigger>
                <TabsTrigger value="playback" className="flex-1" disabled={!selectedRecording}>
                  <Play size={16} className="mr-2" />
                  Playback
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-3 mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {recordings.map((recording) => (
                      <motion.div
                        key={recording.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedRecording?.id === recording.id
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold mb-1">{recording.name}</div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {formatDuration(recording.duration)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {recording.events.length} events
                                </Badge>
                              </div>
                              <div className="text-xs">
                                {new Date(recording.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedRecording(recording)
                                playRecording(recording)
                              }}
                              disabled={isPlaying}
                            >
                              <Play size={16} weight="fill" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedRecording(recording)
                                setExportDialogOpen(true)
                              }}
                            >
                              <Download size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteRecording(recording.id)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="playback" className="space-y-4 mt-4">
                {selectedRecording && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Playback Speed</Label>
                        <Badge variant="outline">{playbackSpeed}x</Badge>
                      </div>
                      <Slider
                        value={[playbackSpeed]}
                        onValueChange={(value) => setPlaybackSpeed(value[0])}
                        min={0.25}
                        max={4}
                        step={0.25}
                        disabled={isPlaying}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="show-cursor">Show Playback Cursor</Label>
                      <Switch
                        id="show-cursor"
                        checked={showCursor}
                        onCheckedChange={setShowCursor}
                        disabled={isPlaying}
                      />
                    </div>

                    {playbackProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{Math.round(playbackProgress)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${playbackProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!isPlaying ? (
                        <Button
                          className="flex-1"
                          onClick={() => playRecording(selectedRecording)}
                        >
                          <Play size={16} weight="fill" className="mr-2" />
                          Play Recording
                        </Button>
                      ) : (
                        <Button
                          className="flex-1"
                          variant="destructive"
                          onClick={stopPlayback}
                        >
                          <Stop size={16} weight="fill" className="mr-2" />
                          Stop Playback
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPlaybackProgress(0)
                          stopPlayback()
                        }}
                      >
                        <ArrowClockwise size={16} />
                      </Button>
                    </div>

                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="text-sm font-semibold">Recording Details</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="ml-2 font-mono">{formatDuration(selectedRecording.duration)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Events:</span>
                          <span className="ml-2 font-mono">{selectedRecording.events.length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clicks:</span>
                          <span className="ml-2 font-mono">{selectedRecording.events.filter(e => e.type === 'click').length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mouse Moves:</span>
                          <span className="ml-2 font-mono">{selectedRecording.events.filter(e => e.type === 'mousemove').length}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Export size={20} weight="duotone" />
              Export Recording
            </DialogTitle>
            <DialogDescription>
              Choose a format to export your recording
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                if (selectedRecording) {
                  exportRecording(selectedRecording, 'json')
                  setExportDialogOpen(false)
                }
              }}
            >
              <Code size={20} className="mr-2" />
              <div className="text-left">
                <div className="font-semibold">JSON Format</div>
                <div className="text-xs text-muted-foreground">
                  Complete recording data with all event details
                </div>
              </div>
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                if (selectedRecording) {
                  exportRecording(selectedRecording, 'csv')
                  setExportDialogOpen(false)
                }
              }}
            >
              <Download size={20} className="mr-2" />
              <div className="text-left">
                <div className="font-semibold">CSV Format</div>
                <div className="text-xs text-muted-foreground">
                  Spreadsheet-friendly format for analysis
                </div>
              </div>
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                if (selectedRecording) {
                  exportRecording(selectedRecording, 'code')
                  setExportDialogOpen(false)
                }
              }}
            >
              <Code size={20} className="mr-2" />
              <div className="text-left">
                <div className="font-semibold">React Code</div>
                <div className="text-xs text-muted-foreground">
                  Generate Framer Motion animation code
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {showPlaybackCursor && showCursor && (
          <motion.div
            className="fixed pointer-events-none z-[99999]"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: cursorPosition.x,
              y: cursorPosition.y
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Cursor size={32} weight="fill" className="text-accent drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes ripple {
          to {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
