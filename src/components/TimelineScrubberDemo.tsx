import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TimelineScrubber } from '@/components/TimelineScrubber'
import { FilmStrip, Plus, Sparkle, Circle, Square, Triangle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface DemoElement {
  id: string
  name: string
  color: string
  icon: React.ReactNode
}

export function TimelineScrubberDemo() {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const duration = 10000

  const demoElements: DemoElement[] = [
    { id: 'elem-1', name: 'Circle', color: 'oklch(0.75 0.15 195)', icon: <Circle size={20} weight="fill" /> },
    { id: 'elem-2', name: 'Square', color: 'oklch(0.45 0.19 250)', icon: <Square size={20} weight="fill" /> },
    { id: 'elem-3', name: 'Triangle', color: 'oklch(0.50 0.15 290)', icon: <Triangle size={20} weight="fill" /> },
  ]

  const [tracks, setTracks] = useState([
    {
      id: 'track-1',
      name: 'Circle - Move',
      elementId: 'elem-1',
      enabled: true,
      color: 'oklch(0.75 0.15 195)',
      locked: false,
      keyframes: [
        {
          id: 'kf-1-1',
          time: 0,
          properties: { x: 50, y: 100, scale: 1, rotation: 0, opacity: 1 },
          easing: 'ease-in-out',
          label: 'Start',
        },
        {
          id: 'kf-1-2',
          time: 3000,
          properties: { x: 300, y: 100, scale: 1.5, rotation: 180, opacity: 1 },
          easing: 'ease-in-out',
        },
        {
          id: 'kf-1-3',
          time: 6000,
          properties: { x: 300, y: 300, scale: 1, rotation: 360, opacity: 0.5 },
          easing: 'ease-in-out',
        },
        {
          id: 'kf-1-4',
          time: 10000,
          properties: { x: 50, y: 100, scale: 1, rotation: 720, opacity: 1 },
          easing: 'ease-in-out',
          label: 'End',
        },
      ],
    },
    {
      id: 'track-2',
      name: 'Square - Pulse',
      elementId: 'elem-2',
      enabled: true,
      color: 'oklch(0.45 0.19 250)',
      locked: false,
      keyframes: [
        {
          id: 'kf-2-1',
          time: 0,
          properties: { x: 200, y: 200, scale: 1, rotation: 0, opacity: 1 },
          easing: 'ease-in-out',
          label: 'Start',
        },
        {
          id: 'kf-2-2',
          time: 2500,
          properties: { x: 200, y: 200, scale: 1.8, rotation: 45, opacity: 0.8 },
          easing: 'ease-out-back',
        },
        {
          id: 'kf-2-3',
          time: 5000,
          properties: { x: 200, y: 200, scale: 1, rotation: 90, opacity: 1 },
          easing: 'ease-in-back',
        },
        {
          id: 'kf-2-4',
          time: 7500,
          properties: { x: 200, y: 200, scale: 1.8, rotation: 135, opacity: 0.8 },
          easing: 'ease-out-back',
        },
        {
          id: 'kf-2-5',
          time: 10000,
          properties: { x: 200, y: 200, scale: 1, rotation: 180, opacity: 1 },
          easing: 'ease-in-out',
          label: 'End',
        },
      ],
    },
    {
      id: 'track-3',
      name: 'Triangle - Rotate',
      elementId: 'elem-3',
      enabled: true,
      color: 'oklch(0.50 0.15 290)',
      locked: false,
      keyframes: [
        {
          id: 'kf-3-1',
          time: 0,
          properties: { x: 350, y: 150, scale: 1, rotation: 0, opacity: 1 },
          easing: 'linear',
          label: 'Start',
        },
        {
          id: 'kf-3-2',
          time: 5000,
          properties: { x: 350, y: 150, scale: 1.3, rotation: 360, opacity: 1 },
          easing: 'linear',
        },
        {
          id: 'kf-3-3',
          time: 10000,
          properties: { x: 350, y: 150, scale: 1, rotation: 720, opacity: 1 },
          easing: 'linear',
          label: 'End',
        },
      ],
    },
  ])

  const handleUpdateTrack = (trackId: string, updates: any) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, ...updates } : t))
  }

  const handleCreateKeyframe = (trackId: string, time: number) => {
    const track = tracks.find(t => t.id === trackId)
    if (!track) return

    const sortedKeyframes = [...track.keyframes].sort((a, b) => a.time - b.time)
    let prevKf = sortedKeyframes[0]
    let nextKf = sortedKeyframes[sortedKeyframes.length - 1]

    for (let i = 0; i < sortedKeyframes.length - 1; i++) {
      if (sortedKeyframes[i].time <= time && sortedKeyframes[i + 1].time >= time) {
        prevKf = sortedKeyframes[i]
        nextKf = sortedKeyframes[i + 1]
        break
      }
    }

    const progress = (time - prevKf.time) / (nextKf.time - prevKf.time)
    const interpolate = (start: number, end: number) => start + (end - start) * progress

    const newKeyframe = {
      id: `kf-${trackId}-${Date.now()}`,
      time,
      properties: {
        x: interpolate(prevKf.properties.x, nextKf.properties.x),
        y: interpolate(prevKf.properties.y, nextKf.properties.y),
        scale: interpolate(prevKf.properties.scale, nextKf.properties.scale),
        rotation: interpolate(prevKf.properties.rotation, nextKf.properties.rotation),
        opacity: interpolate(prevKf.properties.opacity, nextKf.properties.opacity),
      },
      easing: prevKf.easing,
    }

    setTracks(tracks.map(t => {
      if (t.id === trackId) {
        return {
          ...t,
          keyframes: [...t.keyframes, newKeyframe].sort((a, b) => a.time - b.time),
        }
      }
      return t
    }))
    toast.success('Keyframe added')
  }

  const handleDeleteKeyframe = (trackId: string, keyframeId: string) => {
    const track = tracks.find(t => t.id === trackId)
    if (!track || track.keyframes.length <= 2) {
      toast.error('Track must have at least 2 keyframes')
      return
    }

    setTracks(tracks.map(t => {
      if (t.id === trackId) {
        return {
          ...t,
          keyframes: t.keyframes.filter(kf => kf.id !== keyframeId),
        }
      }
      return t
    }))
  }

  const handleUpdateKeyframe = (trackId: string, keyframeId: string, updates: any) => {
    setTracks(tracks.map(t => {
      if (t.id === trackId) {
        return {
          ...t,
          keyframes: t.keyframes.map(kf => {
            if (kf.id === keyframeId) {
              const updatedKf = { ...kf }
              if (updates.time !== undefined) updatedKf.time = updates.time
              if (updates.properties) updatedKf.properties = { ...kf.properties, ...updates.properties }
              if (updates.label !== undefined) updatedKf.label = updates.label
              return updatedKf
            }
            return kf
          }),
        }
      }
      return t
    }))
  }

  const getKeyframeValue = (trackId: string, property: string): number => {
    const track = tracks.find(t => t.id === trackId)
    if (!track || !track.enabled) return 0

    const sortedKeyframes = [...track.keyframes].sort((a, b) => a.time - b.time)
    
    if (currentTime <= sortedKeyframes[0].time) {
      return sortedKeyframes[0].properties[property]
    }
    
    if (currentTime >= sortedKeyframes[sortedKeyframes.length - 1].time) {
      return sortedKeyframes[sortedKeyframes.length - 1].properties[property]
    }

    for (let i = 0; i < sortedKeyframes.length - 1; i++) {
      const current = sortedKeyframes[i]
      const next = sortedKeyframes[i + 1]
      
      if (currentTime >= current.time && currentTime <= next.time) {
        const progress = (currentTime - current.time) / (next.time - current.time)
        const start = current.properties[property]
        const end = next.properties[property]
        return start + (end - start) * progress
      }
    }

    return sortedKeyframes[0].properties[property]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FilmStrip size={24} weight="duotone" className="text-accent" />
              Timeline Scrubber Demo
            </CardTitle>
            <CardDescription>
              Interactive demonstration of precise keyframe editing with real-time preview
            </CardDescription>
          </div>
          <Badge className="gap-1">
            <Sparkle size={14} />
            Interactive
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative w-full h-[400px] border-2 border-border rounded-lg bg-card overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.25_0.01_260),oklch(0.15_0.01_260))]" />
          
          {demoElements.map(element => {
            const track = tracks.find(t => t.elementId === element.id && t.enabled)
            if (!track) return null

            const x = getKeyframeValue(track.id, 'x')
            const y = getKeyframeValue(track.id, 'y')
            const scale = getKeyframeValue(track.id, 'scale')
            const rotation = getKeyframeValue(track.id, 'rotation')
            const opacity = getKeyframeValue(track.id, 'opacity')

            return (
              <motion.div
                key={element.id}
                className="absolute"
                style={{
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                  opacity,
                  color: element.color,
                  fontSize: '48px',
                }}
              >
                {element.icon}
              </motion.div>
            )
          })}

          <div className="absolute bottom-4 left-4 flex gap-2">
            {demoElements.map(element => {
              const track = tracks.find(t => t.elementId === element.id)
              return (
                <Badge key={element.id} variant="secondary" className="gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: element.color }}
                  />
                  {element.name}
                </Badge>
              )
            })}
          </div>
        </div>

        <TimelineScrubber
          tracks={tracks}
          duration={duration}
          onUpdateTrack={handleUpdateTrack}
          onCreateKeyframe={handleCreateKeyframe}
          onDeleteKeyframe={handleDeleteKeyframe}
          onUpdateKeyframe={handleUpdateKeyframe}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTimeChange={setCurrentTime}
          onPlayStateChange={setIsPlaying}
        />

        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Sparkle size={20} weight="duotone" className="text-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Features:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Drag keyframes</strong> horizontally to adjust timing</li>
                <li>• <strong>Click timeline</strong> to jump to any point</li>
                <li>• <strong>Hold Shift</strong> while dragging to disable snapping</li>
                <li>• <strong>Step forward/backward</strong> for frame-by-frame editing</li>
                <li>• <strong>Jump to keyframes</strong> for quick navigation</li>
                <li>• <strong>Adjust playback speed</strong> for detailed review</li>
                <li>• <strong>Zoom timeline</strong> for precision or overview</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
