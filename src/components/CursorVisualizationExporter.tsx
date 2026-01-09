import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Export,
  FilmStrip,
  FileImage,
  Download,
  Play,
  Stop,
  Cursor,
  CheckCircle,
  Warning,
  Lightning,
  Palette,
  Resize,
  Eye,
  Image as ImageIcon,
  Textbox,
  Stamp
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { Recording } from './AnimationRecorder'

interface ExportSettings {
  format: 'gif' | 'webm' | 'mp4'
  fps: number
  quality: number
  width: number
  height: number
  backgroundColor: string
  showCursor: boolean
  showTrail: boolean
  showClickMarkers: boolean
  showPath: boolean
  cursorSize: number
  cursorColor: string
  trailLength: number
  playbackSpeed: number
  watermark: {
    enabled: boolean
    text: string
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
    fontSize: number
    color: string
    opacity: number
    logoUrl?: string
    animation: {
      enabled: boolean
      type: 'fade' | 'slide' | 'scale' | 'bounce' | 'typewriter'
      duration: number
      delay: number
    }
  }
  textOverlay: {
    enabled: boolean
    title: string
    subtitle: string
    showTimestamp: boolean
    showEventCounter: boolean
    position: 'top' | 'bottom'
    backgroundColor: string
    textColor: string
    opacity: number
    animation: {
      enabled: boolean
      type: 'fade' | 'slide' | 'scale' | 'bounce' | 'none'
      duration: number
      stagger: boolean
    }
  }
}

interface Frame {
  imageData: ImageData
  timestamp: number
}

export function CursorVisualizationExporter() {
  const [recordings] = useKV<Recording[]>('animation-recordings', [])
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStatus, setExportStatus] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'webm',
    fps: 30,
    quality: 80,
    width: 1920,
    height: 1080,
    backgroundColor: '#1a1a2e',
    showCursor: true,
    showTrail: true,
    showClickMarkers: true,
    showPath: true,
    cursorSize: 32,
    cursorColor: '#64d2ff',
    trailLength: 20,
    playbackSpeed: 1,
    watermark: {
      enabled: false,
      text: 'Made with DashboardVibeCoder',
      position: 'bottom-right',
      fontSize: 16,
      color: '#ffffff',
      opacity: 0.7,
      animation: {
        enabled: true,
        type: 'fade',
        duration: 1000,
        delay: 500,
      },
    },
    textOverlay: {
      enabled: false,
      title: '',
      subtitle: '',
      showTimestamp: true,
      showEventCounter: true,
      position: 'bottom',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      opacity: 0.8,
      animation: {
        enabled: true,
        type: 'slide',
        duration: 800,
        stagger: true,
      },
    },
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const framesRef = useRef<Frame[]>([])

  const updateSetting = <K extends keyof ExportSettings>(key: K, value: ExportSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const drawCursor = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ) => {
    ctx.save()
    ctx.translate(x, y)
    
    ctx.fillStyle = color
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, size * 0.75)
    ctx.lineTo(size * 0.25, size * 0.6)
    ctx.lineTo(size * 0.4, size)
    ctx.lineTo(size * 0.5, size * 0.95)
    ctx.lineTo(size * 0.35, size * 0.55)
    ctx.lineTo(size * 0.6, size * 0.4)
    ctx.closePath()
    
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  const drawClickMarker = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    progress: number
  ) => {
    const size = 20 + (40 * progress)
    const opacity = 1 - progress
    
    ctx.save()
    ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y, size, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.restore()
  }

  const drawTrailPoint = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    age: number,
    maxAge: number
  ) => {
    const progress = age / maxAge
    const size = 6 * (1 - progress)
    const opacity = 0.6 * (1 - progress)
    
    const [r, g, b] = hexToRgb(settings.cursorColor)
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawPath = (
    ctx: CanvasRenderingContext2D,
    events: Recording['events'],
    currentIndex: number
  ) => {
    const mouseMoves = events
      .slice(0, currentIndex + 1)
      .filter(e => e.type === 'mousemove' && e.data.x && e.data.y)

    if (mouseMoves.length < 2) return

    ctx.save()
    ctx.strokeStyle = `${settings.cursorColor}66`
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

    const clicks = events
      .slice(0, currentIndex + 1)
      .filter(e => e.type === 'click' && e.data.x && e.data.y)
    
    clicks.forEach((click, index) => {
      if (click.data.x && click.data.y) {
        ctx.beginPath()
        ctx.arc(click.data.x, click.data.y, 8, 0, 2 * Math.PI)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'
        ctx.fill()
        ctx.strokeStyle = 'rgb(239, 68, 68)'
        ctx.lineWidth = 2
        ctx.stroke()
        
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText((index + 1).toString(), click.data.x, click.data.y)
      }
    })

    ctx.restore()
  }

  const drawWatermark = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    currentTime: number
  ) => {
    if (!settings.watermark.enabled) return

    ctx.save()

    let animationProgress = 1
    if (settings.watermark.animation.enabled) {
      const animStart = settings.watermark.animation.delay
      const animEnd = animStart + settings.watermark.animation.duration
      
      if (currentTime < animStart) {
        animationProgress = 0
      } else if (currentTime < animEnd) {
        const elapsed = currentTime - animStart
        animationProgress = elapsed / settings.watermark.animation.duration
        animationProgress = easeOutCubic(animationProgress)
      }
    }

    let opacity = settings.watermark.opacity * animationProgress
    let scale = 1
    let offsetX = 0
    let offsetY = 0
    let displayText = settings.watermark.text

    if (settings.watermark.animation.enabled && animationProgress < 1) {
      switch (settings.watermark.animation.type) {
        case 'fade':
          break
        case 'scale':
          scale = 0.5 + (animationProgress * 0.5)
          opacity = settings.watermark.opacity * animationProgress
          break
        case 'slide':
          const slideDistance = 50
          offsetX = slideDistance * (1 - animationProgress)
          break
        case 'bounce':
          const bounce = Math.sin(animationProgress * Math.PI)
          scale = 0.8 + (bounce * 0.4)
          break
        case 'typewriter':
          const charCount = Math.floor(settings.watermark.text.length * animationProgress)
          displayText = settings.watermark.text.substring(0, charCount)
          break
      }
    }

    ctx.globalAlpha = opacity

    const padding = 20
    const fontSize = settings.watermark.fontSize
    ctx.font = `${fontSize}px 'Space Grotesk', sans-serif`
    ctx.fillStyle = settings.watermark.color

    const textMetrics = ctx.measureText(displayText)
    const textWidth = textMetrics.width
    const textHeight = fontSize

    let x = padding
    let y = padding + textHeight

    switch (settings.watermark.position) {
      case 'top-left':
        x = padding + offsetX
        y = padding + textHeight + offsetY
        break
      case 'top-right':
        x = canvas.width - textWidth - padding - offsetX
        y = padding + textHeight + offsetY
        break
      case 'bottom-left':
        x = padding + offsetX
        y = canvas.height - padding + offsetY
        break
      case 'bottom-right':
        x = canvas.width - textWidth - padding - offsetX
        y = canvas.height - padding + offsetY
        break
      case 'center':
        x = (canvas.width - textWidth) / 2 + offsetX
        y = canvas.height / 2 + offsetY
        break
    }

    ctx.save()
    ctx.translate(x + textWidth / 2, y - textHeight / 2)
    ctx.scale(scale, scale)
    ctx.translate(-(x + textWidth / 2), -(y - textHeight / 2))

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    ctx.fillText(displayText, x, y)
    
    ctx.restore()
    ctx.restore()
  }

  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3)
  }

  const easeOutElastic = (t: number): number => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  }

  const drawTextOverlay = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    currentTime: number,
    totalDuration: number,
    eventCount: number
  ) => {
    if (!settings.textOverlay.enabled) return

    ctx.save()

    let animationProgress = 1
    const animDuration = settings.textOverlay.animation.enabled ? settings.textOverlay.animation.duration : 0
    
    if (settings.textOverlay.animation.enabled && currentTime < animDuration) {
      animationProgress = currentTime / animDuration
      animationProgress = easeOutCubic(animationProgress)
    }

    const padding = 20
    const lineHeight = 30
    const barHeight = settings.textOverlay.title || settings.textOverlay.subtitle ? 100 : 60
    const yPosition = settings.textOverlay.position === 'top' ? 0 : canvas.height - barHeight

    let barOpacity = settings.textOverlay.opacity
    let slideOffset = 0
    let scale = 1

    if (settings.textOverlay.animation.enabled && animationProgress < 1) {
      switch (settings.textOverlay.animation.type) {
        case 'fade':
          barOpacity = settings.textOverlay.opacity * animationProgress
          break
        case 'slide':
          slideOffset = barHeight * (1 - animationProgress)
          if (settings.textOverlay.position === 'top') {
            slideOffset = -slideOffset
          }
          break
        case 'scale':
          scale = 0.8 + (animationProgress * 0.2)
          barOpacity = settings.textOverlay.opacity * animationProgress
          break
        case 'bounce':
          const bounce = easeOutElastic(animationProgress)
          slideOffset = barHeight * (1 - bounce)
          if (settings.textOverlay.position === 'top') {
            slideOffset = -slideOffset
          }
          break
      }
    }

    ctx.globalAlpha = barOpacity
    ctx.fillStyle = settings.textOverlay.backgroundColor
    
    ctx.save()
    ctx.translate(0, slideOffset)
    ctx.scale(1, scale)
    ctx.fillRect(0, yPosition, canvas.width, barHeight)
    ctx.restore()

    ctx.globalAlpha = 1
    ctx.fillStyle = settings.textOverlay.textColor

    let currentY = yPosition + padding + slideOffset

    const titleDelay = settings.textOverlay.animation.stagger ? 0 : 0
    const subtitleDelay = settings.textOverlay.animation.stagger ? 200 : 0
    const infoDelay = settings.textOverlay.animation.stagger ? 400 : 0

    if (settings.textOverlay.title) {
      const titleProgress = settings.textOverlay.animation.enabled 
        ? Math.max(0, Math.min(1, (currentTime - titleDelay) / animDuration))
        : 1
      
      if (titleProgress > 0) {
        ctx.save()
        const titleOpacity = easeOutCubic(titleProgress)
        ctx.globalAlpha = titleOpacity
        
        let titleOffset = 0
        if (settings.textOverlay.animation.type === 'slide' && titleProgress < 1) {
          titleOffset = 20 * (1 - titleProgress)
        }
        
        ctx.font = 'bold 24px "Space Grotesk", sans-serif'
        ctx.fillText(settings.textOverlay.title, padding + titleOffset, currentY)
        ctx.restore()
      }
      currentY += lineHeight
    }

    if (settings.textOverlay.subtitle) {
      const subtitleProgress = settings.textOverlay.animation.enabled 
        ? Math.max(0, Math.min(1, (currentTime - subtitleDelay) / animDuration))
        : 1
      
      if (subtitleProgress > 0) {
        ctx.save()
        const subtitleOpacity = easeOutCubic(subtitleProgress)
        ctx.globalAlpha = subtitleOpacity
        
        let subtitleOffset = 0
        if (settings.textOverlay.animation.type === 'slide' && subtitleProgress < 1) {
          subtitleOffset = 20 * (1 - subtitleProgress)
        }
        
        ctx.font = '16px "Space Grotesk", sans-serif'
        ctx.fillText(settings.textOverlay.subtitle, padding + subtitleOffset, currentY)
        ctx.restore()
      }
      currentY += lineHeight - 5
    }

    const infoText: string[] = []
    
    if (settings.textOverlay.showTimestamp) {
      const current = (currentTime / 1000).toFixed(1)
      const total = (totalDuration / 1000).toFixed(1)
      infoText.push(`⏱ ${current}s / ${total}s`)
    }

    if (settings.textOverlay.showEventCounter) {
      infoText.push(`🖱 ${eventCount} events`)
    }

    if (infoText.length > 0) {
      const infoProgress = settings.textOverlay.animation.enabled 
        ? Math.max(0, Math.min(1, (currentTime - infoDelay) / animDuration))
        : 1
      
      if (infoProgress > 0) {
        ctx.save()
        const infoOpacity = easeOutCubic(infoProgress)
        ctx.globalAlpha = infoOpacity
        
        let infoOffset = 0
        if (settings.textOverlay.animation.type === 'slide' && infoProgress < 1) {
          infoOffset = 20 * (1 - infoProgress)
        }
        
        ctx.font = '14px "JetBrains Mono", monospace'
        const infoString = infoText.join('  •  ')
        ctx.fillText(infoString, padding + infoOffset, currentY)
        ctx.restore()
      }
    }

    ctx.restore()
  }

  const generatePreview = async () => {
    if (!selectedRecording || !previewCanvasRef.current) return

    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = settings.width
    canvas.height = settings.height

    ctx.fillStyle = settings.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const midEvents = selectedRecording.events.slice(
      Math.floor(selectedRecording.events.length * 0.3),
      Math.floor(selectedRecording.events.length * 0.5)
    )

    const mouseEvent = midEvents.find(e => e.type === 'mousemove' && e.data.x && e.data.y)
    
    if (settings.showPath) {
      drawPath(ctx, selectedRecording.events, Math.floor(selectedRecording.events.length * 0.5))
    }

    if (mouseEvent && mouseEvent.data.x && mouseEvent.data.y && settings.showCursor) {
      if (settings.showTrail) {
        const trailEvents = midEvents
          .filter(e => e.type === 'mousemove' && e.data.x && e.data.y)
          .slice(-settings.trailLength)
        
        trailEvents.forEach((event, index) => {
          if (event.data.x && event.data.y) {
            drawTrailPoint(ctx, event.data.x, event.data.y, trailEvents.length - index, settings.trailLength)
          }
        })
      }

      drawCursor(ctx, mouseEvent.data.x, mouseEvent.data.y, settings.cursorSize, settings.cursorColor)
    }

    const midTime = selectedRecording.duration / 2
    const midEventCount = Math.floor(selectedRecording.events.length / 2)
    
    drawTextOverlay(ctx, canvas, midTime, selectedRecording.duration, midEventCount)
    drawWatermark(ctx, canvas, midTime)

    const dataUrl = canvas.toDataURL('image/png')
    setPreviewUrl(dataUrl)
    toast.success('Preview updated')
  }

  const exportAsVideo = async (recording: Recording) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = settings.width
    canvas.height = settings.height

    try {
      setIsExporting(true)
      setExportProgress(0)
      setExportStatus('Initializing video export...')

      const stream = canvas.captureStream(settings.fps)
      const mimeType = settings.format === 'webm' 
        ? 'video/webm;codecs=vp9'
        : 'video/webm;codecs=vp8'

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error(`${mimeType} is not supported`)
      }

      recordedChunksRef.current = []
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: settings.quality * 100000
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: settings.format === 'webm' ? 'video/webm' : 'video/mp4'
        })
        downloadBlob(blob, `${recording.name}-cursor-viz.${settings.format}`)
        setIsExporting(false)
        setExportProgress(100)
        setExportStatus('Export complete!')
        toast.success('Video exported successfully!')
      }

      mediaRecorderRef.current.start()
      setExportStatus('Recording frames...')

      await renderRecording(recording, ctx, canvas)

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }

    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed: ' + (error as Error).message)
      setIsExporting(false)
      setExportStatus('Export failed')
    }
  }

  const exportAsGIF = async (recording: Recording) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = settings.width
    canvas.height = settings.height

    try {
      setIsExporting(true)
      setExportProgress(0)
      setExportStatus('Generating GIF frames...')

      framesRef.current = []
      await renderRecording(recording, ctx, canvas, true)

      setExportStatus('Encoding GIF (this may take a while)...')
      
      toast.info('GIF encoding would require gif.js library', {
        description: 'For now, exporting as WebM video instead'
      })
      
      await exportAsVideo(recording)

    } catch (error) {
      console.error('GIF export error:', error)
      toast.error('GIF export failed: ' + (error as Error).message)
      setIsExporting(false)
      setExportStatus('Export failed')
    }
  }

  const renderRecording = async (
    recording: Recording,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    captureFrames: boolean = false
  ): Promise<void> => {
    return new Promise((resolve) => {
      const frameDuration = 1000 / settings.fps
      const totalFrames = Math.ceil((recording.duration / settings.playbackSpeed) / frameDuration)
      let currentFrame = 0
      let currentEventIndex = 0
      const trailPoints: Array<{ x: number; y: number; timestamp: number }> = []
      const clickMarkers: Array<{ x: number; y: number; startTime: number }> = []

      const renderFrame = () => {
        const currentTime = (currentFrame * frameDuration) * settings.playbackSpeed

        ctx.fillStyle = settings.backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        while (
          currentEventIndex < recording.events.length &&
          recording.events[currentEventIndex].timestamp <= currentTime
        ) {
          const event = recording.events[currentEventIndex]

          if (event.type === 'mousemove' && event.data.x && event.data.y) {
            trailPoints.push({
              x: event.data.x,
              y: event.data.y,
              timestamp: event.timestamp
            })
            if (trailPoints.length > settings.trailLength) {
              trailPoints.shift()
            }
          }

          if (event.type === 'click' && event.data.x && event.data.y && settings.showClickMarkers) {
            clickMarkers.push({
              x: event.data.x,
              y: event.data.y,
              startTime: currentTime
            })
          }

          currentEventIndex++
        }

        if (settings.showPath && currentEventIndex > 0) {
          drawPath(ctx, recording.events, currentEventIndex - 1)
        }

        if (settings.showTrail && trailPoints.length > 0) {
          trailPoints.forEach((point, index) => {
            const age = trailPoints.length - index
            drawTrailPoint(ctx, point.x, point.y, age, settings.trailLength)
          })
        }

        clickMarkers.forEach((marker, index) => {
          const age = currentTime - marker.startTime
          const duration = 1000
          if (age < duration) {
            const progress = age / duration
            drawClickMarker(ctx, marker.x, marker.y, progress)
          }
        })

        if (settings.showCursor && currentEventIndex > 0) {
          const lastMoveEvent = [...recording.events]
            .slice(0, currentEventIndex)
            .reverse()
            .find(e => e.type === 'mousemove' && e.data.x && e.data.y)

          if (lastMoveEvent && lastMoveEvent.data.x && lastMoveEvent.data.y) {
            drawCursor(
              ctx,
              lastMoveEvent.data.x,
              lastMoveEvent.data.y,
              settings.cursorSize,
              settings.cursorColor
            )
          }
        }

        drawTextOverlay(ctx, canvas, currentTime, recording.duration, currentEventIndex)
        drawWatermark(ctx, canvas, currentTime)

        if (captureFrames) {
          framesRef.current.push({
            imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
            timestamp: currentTime
          })
        }

        const progress = (currentFrame / totalFrames) * 100
        setExportProgress(progress)

        currentFrame++

        if (currentFrame < totalFrames) {
          setTimeout(renderFrame, 0)
        } else {
          resolve()
        }
      }

      renderFrame()
    })
  }

  const handleExport = async () => {
    if (!selectedRecording) {
      toast.error('Please select a recording first')
      return
    }

    if (settings.format === 'gif') {
      await exportAsGIF(selectedRecording)
    } else {
      await exportAsVideo(selectedRecording)
    }
  }

  const stopExport = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsExporting(false)
    setExportStatus('Export cancelled')
    toast.info('Export cancelled')
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [100, 210, 255]
  }

  const estimateFileSize = () => {
    if (!selectedRecording) return 'Unknown'
    
    const duration = selectedRecording.duration / 1000
    const bitrate = settings.quality * 100000
    const estimatedBytes = (duration * bitrate) / 8
    
    if (estimatedBytes < 1024) return `${estimatedBytes.toFixed(0)} B`
    if (estimatedBytes < 1024 * 1024) return `${(estimatedBytes / 1024).toFixed(1)} KB`
    return `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilmStrip size={24} weight="duotone" className="text-accent" />
            Cursor Visualization Exporter
          </CardTitle>
          <CardDescription>
            Export cursor recordings as animated GIF or video files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="select">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="select">
                <FilmStrip size={16} className="mr-2" />
                Select
              </TabsTrigger>
              <TabsTrigger value="settings" disabled={!selectedRecording}>
                <Palette size={16} className="mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="export" disabled={!selectedRecording}>
                <Export size={16} className="mr-2" />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-3 mt-4">
              {!recordings || recordings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileImage size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
                  <p>No recordings available</p>
                  <p className="text-sm mt-2">Create recordings to export them as videos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recordings.map((recording) => (
                    <motion.button
                      key={recording.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedRecording?.id === recording.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                      onClick={() => {
                        setSelectedRecording(recording)
                        toast.success(`Selected: ${recording.name}`)
                      }}
                    >
                      <div className="font-semibold mb-2">{recording.name}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {Math.floor(recording.duration / 1000)}s
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {recording.events.length} events
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {recording.events.filter(e => e.type === 'click').length} clicks
                        </Badge>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              {selectedRecording && (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select
                      value={settings.format}
                      onValueChange={(value) => updateSetting('format', value as 'gif' | 'webm' | 'mp4')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webm">
                          <div className="flex items-center gap-2">
                            <FilmStrip size={16} />
                            <span>WebM Video (Best quality)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="gif">
                          <div className="flex items-center gap-2">
                            <ImageIcon size={16} />
                            <span>Animated GIF (Experimental)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Resolution</Label>
                      <Select
                        value={`${settings.width}x${settings.height}`}
                        onValueChange={(value) => {
                          const [w, h] = value.split('x').map(Number)
                          updateSetting('width', w)
                          updateSetting('height', h)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1920x1080">1920×1080 (Full HD)</SelectItem>
                          <SelectItem value="1280x720">1280×720 (HD)</SelectItem>
                          <SelectItem value="854x480">854×480 (SD)</SelectItem>
                          <SelectItem value="640x360">640×360 (Low)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Frame Rate</Label>
                      <Select
                        value={settings.fps.toString()}
                        onValueChange={(value) => updateSetting('fps', Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60 FPS (Smooth)</SelectItem>
                          <SelectItem value="30">30 FPS (Standard)</SelectItem>
                          <SelectItem value="24">24 FPS (Cinematic)</SelectItem>
                          <SelectItem value="15">15 FPS (Low)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Quality</Label>
                      <Badge variant="outline">{settings.quality}%</Badge>
                    </div>
                    <Slider
                      value={[settings.quality]}
                      onValueChange={(value) => updateSetting('quality', value[0])}
                      min={10}
                      max={100}
                      step={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Playback Speed</Label>
                      <Badge variant="outline">{settings.playbackSpeed}x</Badge>
                    </div>
                    <Slider
                      value={[settings.playbackSpeed]}
                      onValueChange={(value) => updateSetting('playbackSpeed', value[0])}
                      min={0.25}
                      max={4}
                      step={0.25}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        placeholder="#1a1a2e"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cursor Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.cursorColor}
                        onChange={(e) => updateSetting('cursorColor', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.cursorColor}
                        onChange={(e) => updateSetting('cursorColor', e.target.value)}
                        placeholder="#64d2ff"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Cursor Size</Label>
                      <Badge variant="outline">{settings.cursorSize}px</Badge>
                    </div>
                    <Slider
                      value={[settings.cursorSize]}
                      onValueChange={(value) => updateSetting('cursorSize', value[0])}
                      min={16}
                      max={64}
                      step={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Trail Length</Label>
                      <Badge variant="outline">{settings.trailLength}</Badge>
                    </div>
                    <Slider
                      value={[settings.trailLength]}
                      onValueChange={(value) => updateSetting('trailLength', value[0])}
                      min={5}
                      max={50}
                      step={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="export-cursor">Show Cursor</Label>
                      <Switch
                        id="export-cursor"
                        checked={settings.showCursor}
                        onCheckedChange={(checked) => updateSetting('showCursor', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="export-trail">Show Trail</Label>
                      <Switch
                        id="export-trail"
                        checked={settings.showTrail}
                        onCheckedChange={(checked) => updateSetting('showTrail', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="export-clicks">Click Markers</Label>
                      <Switch
                        id="export-clicks"
                        checked={settings.showClickMarkers}
                        onCheckedChange={(checked) => updateSetting('showClickMarkers', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="export-path">Show Path</Label>
                      <Switch
                        id="export-path"
                        checked={settings.showPath}
                        onCheckedChange={(checked) => updateSetting('showPath', checked)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Label className="flex items-center gap-2">
                          <Stamp size={18} weight="duotone" className="text-accent" />
                          Watermark
                        </Label>
                        {settings.watermark.enabled && settings.watermark.animation.enabled && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Lightning size={12} weight="fill" className="text-accent" />
                            {settings.watermark.animation.type}
                          </Badge>
                        )}
                      </div>
                      <Switch
                        id="watermark-enabled"
                        checked={settings.watermark.enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            watermark: { ...prev.watermark, enabled: checked }
                          }))
                        }
                      />
                    </div>

                    {settings.watermark.enabled && (
                      <div className="space-y-3 pl-6 border-l-2 border-accent/30">
                        <div className="space-y-2">
                          <Label>Watermark Text</Label>
                          <Input
                            value={settings.watermark.text}
                            onChange={(e) => 
                              setSettings(prev => ({
                                ...prev,
                                watermark: { ...prev.watermark, text: e.target.value }
                              }))
                            }
                            placeholder="Your watermark text"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Select
                            value={settings.watermark.position}
                            onValueChange={(value) => 
                              setSettings(prev => ({
                                ...prev,
                                watermark: { ...prev.watermark, position: value as any }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top-left">Top Left</SelectItem>
                              <SelectItem value="top-right">Top Right</SelectItem>
                              <SelectItem value="bottom-left">Bottom Left</SelectItem>
                              <SelectItem value="bottom-right">Bottom Right</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Font Size</Label>
                            <Input
                              type="number"
                              value={settings.watermark.fontSize}
                              onChange={(e) => 
                                setSettings(prev => ({
                                  ...prev,
                                  watermark: { ...prev.watermark, fontSize: Number(e.target.value) }
                                }))
                              }
                              min={10}
                              max={48}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Opacity</Label>
                            <Input
                              type="number"
                              value={settings.watermark.opacity}
                              onChange={(e) => 
                                setSettings(prev => ({
                                  ...prev,
                                  watermark: { ...prev.watermark, opacity: Number(e.target.value) }
                                }))
                              }
                              min={0}
                              max={1}
                              step={0.1}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={settings.watermark.color}
                              onChange={(e) => 
                                setSettings(prev => ({
                                  ...prev,
                                  watermark: { ...prev.watermark, color: e.target.value }
                                }))
                              }
                              className="w-20 h-10"
                            />
                            <Input
                              type="text"
                              value={settings.watermark.color}
                              onChange={(e) => 
                                setSettings(prev => ({
                                  ...prev,
                                  watermark: { ...prev.watermark, color: e.target.value }
                                }))
                              }
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        <div className="border-t border-border pt-3 mt-3">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Entry Animation
                            </Label>
                            <Switch
                              checked={settings.watermark.animation.enabled}
                              onCheckedChange={(checked) => 
                                setSettings(prev => ({
                                  ...prev,
                                  watermark: { 
                                    ...prev.watermark, 
                                    animation: { ...prev.watermark.animation, enabled: checked } 
                                  }
                                }))
                              }
                            />
                          </div>

                          {settings.watermark.animation.enabled && (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label>Animation Type</Label>
                                <Select
                                  value={settings.watermark.animation.type}
                                  onValueChange={(value) => 
                                    setSettings(prev => ({
                                      ...prev,
                                      watermark: { 
                                        ...prev.watermark, 
                                        animation: { 
                                          ...prev.watermark.animation, 
                                          type: value as 'fade' | 'slide' | 'scale' | 'bounce' | 'typewriter'
                                        } 
                                      }
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="fade">Fade In</SelectItem>
                                    <SelectItem value="slide">Slide In</SelectItem>
                                    <SelectItem value="scale">Scale Up</SelectItem>
                                    <SelectItem value="bounce">Bounce</SelectItem>
                                    <SelectItem value="typewriter">Typewriter</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label>Duration (ms)</Label>
                                  <Input
                                    type="number"
                                    value={settings.watermark.animation.duration}
                                    onChange={(e) => 
                                      setSettings(prev => ({
                                        ...prev,
                                        watermark: { 
                                          ...prev.watermark, 
                                          animation: { 
                                            ...prev.watermark.animation, 
                                            duration: Number(e.target.value) 
                                          } 
                                        }
                                      }))
                                    }
                                    min={100}
                                    max={3000}
                                    step={100}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Delay (ms)</Label>
                                  <Input
                                    type="number"
                                    value={settings.watermark.animation.delay}
                                    onChange={(e) => 
                                      setSettings(prev => ({
                                        ...prev,
                                        watermark: { 
                                          ...prev.watermark, 
                                          animation: { 
                                            ...prev.watermark.animation, 
                                            delay: Number(e.target.value) 
                                          } 
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={5000}
                                    step={100}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Label className="flex items-center gap-2">
                          <Textbox size={18} weight="duotone" className="text-secondary" />
                          Text Overlay
                        </Label>
                        {settings.textOverlay.enabled && settings.textOverlay.animation.enabled && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Lightning size={12} weight="fill" className="text-secondary" />
                            {settings.textOverlay.animation.type}
                          </Badge>
                        )}
                      </div>
                      <Switch
                        id="overlay-enabled"
                        checked={settings.textOverlay.enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            textOverlay: { ...prev.textOverlay, enabled: checked }
                          }))
                        }
                      />
                    </div>

                    {settings.textOverlay.enabled && (
                      <div className="space-y-3 pl-6 border-l-2 border-secondary/30">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={settings.textOverlay.title}
                            onChange={(e) => 
                              setSettings(prev => ({
                                ...prev,
                                textOverlay: { ...prev.textOverlay, title: e.target.value }
                              }))
                            }
                            placeholder="Video title"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Subtitle</Label>
                          <Input
                            value={settings.textOverlay.subtitle}
                            onChange={(e) => 
                              setSettings(prev => ({
                                ...prev,
                                textOverlay: { ...prev.textOverlay, subtitle: e.target.value }
                              }))
                            }
                            placeholder="Video subtitle"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Select
                            value={settings.textOverlay.position}
                            onValueChange={(value) => 
                              setSettings(prev => ({
                                ...prev,
                                textOverlay: { ...prev.textOverlay, position: value as 'top' | 'bottom' }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top">Top</SelectItem>
                              <SelectItem value="bottom">Bottom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="show-timestamp">Timestamp</Label>
                            <Switch
                              id="show-timestamp"
                              checked={settings.textOverlay.showTimestamp}
                              onCheckedChange={(checked) => 
                                setSettings(prev => ({
                                  ...prev,
                                  textOverlay: { ...prev.textOverlay, showTimestamp: checked }
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="show-events">Event Count</Label>
                            <Switch
                              id="show-events"
                              checked={settings.textOverlay.showEventCounter}
                              onCheckedChange={(checked) => 
                                setSettings(prev => ({
                                  ...prev,
                                  textOverlay: { ...prev.textOverlay, showEventCounter: checked }
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Opacity</Label>
                          <Input
                            type="number"
                            value={settings.textOverlay.opacity}
                            onChange={(e) => 
                              setSettings(prev => ({
                                ...prev,
                                textOverlay: { ...prev.textOverlay, opacity: Number(e.target.value) }
                              }))
                            }
                            min={0}
                            max={1}
                            step={0.1}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>BG Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={settings.textOverlay.backgroundColor}
                                onChange={(e) => 
                                  setSettings(prev => ({
                                    ...prev,
                                    textOverlay: { ...prev.textOverlay, backgroundColor: e.target.value }
                                  }))
                                }
                                className="w-full h-10"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Text Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={settings.textOverlay.textColor}
                                onChange={(e) => 
                                  setSettings(prev => ({
                                    ...prev,
                                    textOverlay: { ...prev.textOverlay, textColor: e.target.value }
                                  }))
                                }
                                className="w-full h-10"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-border pt-3 mt-3">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Entry Animation
                            </Label>
                            <Switch
                              checked={settings.textOverlay.animation.enabled}
                              onCheckedChange={(checked) => 
                                setSettings(prev => ({
                                  ...prev,
                                  textOverlay: { 
                                    ...prev.textOverlay, 
                                    animation: { ...prev.textOverlay.animation, enabled: checked } 
                                  }
                                }))
                              }
                            />
                          </div>

                          {settings.textOverlay.animation.enabled && (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label>Animation Type</Label>
                                <Select
                                  value={settings.textOverlay.animation.type}
                                  onValueChange={(value) => 
                                    setSettings(prev => ({
                                      ...prev,
                                      textOverlay: { 
                                        ...prev.textOverlay, 
                                        animation: { 
                                          ...prev.textOverlay.animation, 
                                          type: value as 'fade' | 'slide' | 'scale' | 'bounce' | 'none'
                                        } 
                                      }
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="fade">Fade In</SelectItem>
                                    <SelectItem value="slide">Slide In</SelectItem>
                                    <SelectItem value="scale">Scale Up</SelectItem>
                                    <SelectItem value="bounce">Bounce In</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Duration (ms)</Label>
                                <Input
                                  type="number"
                                  value={settings.textOverlay.animation.duration}
                                  onChange={(e) => 
                                    setSettings(prev => ({
                                      ...prev,
                                      textOverlay: { 
                                        ...prev.textOverlay, 
                                        animation: { 
                                          ...prev.textOverlay.animation, 
                                          duration: Number(e.target.value) 
                                        } 
                                      }
                                    }))
                                  }
                                  min={100}
                                  max={2000}
                                  step={100}
                                />
                              </div>

                              <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="stagger-animation">Stagger Elements</Label>
                                <Switch
                                  id="stagger-animation"
                                  checked={settings.textOverlay.animation.stagger}
                                  onCheckedChange={(checked) => 
                                    setSettings(prev => ({
                                      ...prev,
                                      textOverlay: { 
                                        ...prev.textOverlay, 
                                        animation: { 
                                          ...prev.textOverlay.animation, 
                                          stagger: checked 
                                        } 
                                      }
                                    }))
                                  }
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Animate title, subtitle, and info separately
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={generatePreview}
                  >
                    <Eye size={16} className="mr-2" />
                    Generate Preview
                  </Button>

                  {previewUrl && (
                    <div className="border-2 border-border rounded-lg p-2">
                      <img src={previewUrl} alt="Export preview" className="w-full h-auto rounded" />
                      <p className="text-xs text-center text-muted-foreground mt-2">Preview Frame</p>
                    </div>
                  )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="export" className="space-y-4 mt-4">
              {selectedRecording && (
                <>
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="text-sm font-semibold">Export Summary</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Format:</span>
                        <span className="ml-2 font-mono">{settings.format.toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Resolution:</span>
                        <span className="ml-2 font-mono">{settings.width}×{settings.height}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">FPS:</span>
                        <span className="ml-2 font-mono">{settings.fps}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2 font-mono">
                          {(selectedRecording.duration / settings.playbackSpeed / 1000).toFixed(1)}s
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Size:</span>
                        <span className="ml-2 font-mono">{estimateFileSize()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quality:</span>
                        <span className="ml-2 font-mono">{settings.quality}%</span>
                      </div>
                    </div>
                  </div>

                  {isExporting && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Lightning size={20} weight="fill" className="text-accent animate-pulse" />
                        <span className="text-sm font-semibold">{exportStatus}</span>
                      </div>
                      <Progress value={exportProgress} className="h-2" />
                      <div className="text-xs text-muted-foreground text-center">
                        {exportProgress.toFixed(0)}% complete
                      </div>
                    </div>
                  )}

                  {!isExporting && exportProgress === 100 && (
                    <div className="p-4 bg-accent/10 border-2 border-accent rounded-lg flex items-center gap-3">
                      <CheckCircle size={24} weight="fill" className="text-accent flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Export Complete!</div>
                        <div className="text-xs text-muted-foreground">
                          Video has been downloaded to your device
                        </div>
                      </div>
                    </div>
                  )}

                  {!isExporting && exportStatus.includes('failed') && (
                    <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-lg flex items-center gap-3">
                      <Warning size={24} weight="fill" className="text-destructive flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Export Failed</div>
                        <div className="text-xs text-muted-foreground">
                          {exportStatus}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!isExporting ? (
                      <Button
                        className="flex-1 bg-gradient-to-r from-primary via-accent to-secondary"
                        size="lg"
                        onClick={handleExport}
                      >
                        <Download size={20} weight="fill" className="mr-2" />
                        Export {settings.format.toUpperCase()}
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        variant="destructive"
                        size="lg"
                        onClick={stopExport}
                      >
                        <Stop size={20} weight="fill" className="mr-2" />
                        Cancel Export
                      </Button>
                    )}
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">Note:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Large recordings may take several minutes to export</li>
                      <li>Higher quality and resolution increase file size</li>
                      <li>WebM format provides best quality and compatibility</li>
                      <li>GIF export is experimental and falls back to WebM</li>
                    </ul>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={previewCanvasRef} className="hidden" />
    </>
  )
}
