import { useRef, useEffect } from 'react'
import { PatternConfig } from '@/lib/pattern-builder-types'
import { renderPatternElement } from '@/lib/pattern-renderer'

interface PatternCanvasProps {
  config: PatternConfig
  scale?: number
  className?: string
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

export function PatternCanvas({ config, scale = 1, className = '', onCanvasReady }: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = config.width * scale
    const height = config.height * scale
    
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)
    
    ctx.fillStyle = config.backgroundColor
    ctx.fillRect(0, 0, width, height)

    const sortedElements = [...config.elements].sort((a, b) => a.zIndex - b.zIndex)

    ctx.scale(scale, scale)
    
    sortedElements.forEach((element) => {
      renderPatternElement(element, ctx, config.width, config.height)
    })

    ctx.setTransform(1, 0, 0, 1, 0, 0)

    if (onCanvasReady) {
      onCanvasReady(canvas)
    }
  }, [config, scale, onCanvasReady])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: `${config.width}px`,
        height: `${config.height}px`,
        imageRendering: 'crisp-edges',
      }}
    />
  )
}
