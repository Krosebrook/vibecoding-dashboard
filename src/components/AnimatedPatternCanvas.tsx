import { useRef, useEffect, useState } from 'react'
import { PatternConfig, ElementAnimation, AnimationKeyframe, EasingFunction } from '@/lib/pattern-builder-types'
import { renderPatternElement } from '@/lib/pattern-renderer'

interface AnimatedPatternCanvasProps {
  config: PatternConfig
  scale?: number
  className?: string
  isPlaying?: boolean
  currentTime?: number
}

const easingFunctions: Record<EasingFunction, (t: number) => number> = {
  'linear': (t) => t,
  'ease-in': (t) => t * t,
  'ease-out': (t) => t * (2 - t),
  'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  'ease-in-back': (t) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return c3 * t * t * t - c1 * t * t
  },
  'ease-out-back': (t) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
  'ease-in-out-back': (t) => {
    const c1 = 1.70158
    const c2 = c1 * 1.525
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
  },
  'ease-in-elastic': (t) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
  },
  'ease-out-elastic': (t) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },
  'ease-in-out-elastic': (t) => {
    const c5 = (2 * Math.PI) / 4.5
    return t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
  },
  'ease-in-bounce': (t) => 1 - easingFunctions['ease-out-bounce'](1 - t),
  'ease-out-bounce': (t) => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
  },
  'ease-in-out-bounce': (t) => {
    return t < 0.5
      ? (1 - easingFunctions['ease-out-bounce'](1 - 2 * t)) / 2
      : (1 + easingFunctions['ease-out-bounce'](2 * t - 1)) / 2
  },
}

function interpolateKeyframes(keyframes: AnimationKeyframe[], progress: number, easing: EasingFunction) {
  if (keyframes.length === 0) return {}
  if (keyframes.length === 1) return keyframes[0]

  const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time)

  if (progress <= sortedKeyframes[0].time) return sortedKeyframes[0]
  if (progress >= sortedKeyframes[sortedKeyframes.length - 1].time) return sortedKeyframes[sortedKeyframes.length - 1]

  let startFrame = sortedKeyframes[0]
  let endFrame = sortedKeyframes[1]

  for (let i = 0; i < sortedKeyframes.length - 1; i++) {
    if (progress >= sortedKeyframes[i].time && progress <= sortedKeyframes[i + 1].time) {
      startFrame = sortedKeyframes[i]
      endFrame = sortedKeyframes[i + 1]
      break
    }
  }

  const frameProgress = (progress - startFrame.time) / (endFrame.time - startFrame.time)
  const easedProgress = easingFunctions[easing](frameProgress)

  const interpolated: Partial<AnimationKeyframe> = {}

  const keys: (keyof AnimationKeyframe)[] = ['x', 'y', 'scale', 'rotation', 'opacity', 'width', 'height']
  
  keys.forEach(key => {
    if (key === 'id' || key === 'time') return
    if (startFrame[key] !== undefined && endFrame[key] !== undefined) {
      interpolated[key] = startFrame[key]! + (endFrame[key]! - startFrame[key]!) * easedProgress
    }
  })

  return interpolated
}

function getAnimationProgress(animation: ElementAnimation, currentTime: number) {
  if (currentTime < animation.delay) return null

  const elapsed = currentTime - animation.delay
  const duration = animation.duration
  const iterations = animation.iterations === 'infinite' ? Infinity : animation.iterations

  const totalDuration = duration * iterations
  if (elapsed >= totalDuration) return null

  const cycleTime = elapsed % duration
  let progress = (cycleTime / duration) * 100

  switch (animation.direction) {
    case 'reverse':
      progress = 100 - progress
      break
    case 'alternate':
      const cycle = Math.floor(elapsed / duration)
      if (cycle % 2 === 1) progress = 100 - progress
      break
    case 'alternate-reverse':
      const reverseCycle = Math.floor(elapsed / duration)
      if (reverseCycle % 2 === 0) progress = 100 - progress
      break
  }

  return progress
}

export function AnimatedPatternCanvas({ 
  config, 
  scale = 1, 
  className = '',
  isPlaying = false,
  currentTime = 0
}: AnimatedPatternCanvasProps) {
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

    ctx.save()
    ctx.scale(scale, scale)
    
    sortedElements.forEach((element) => {
      const animatedElement = { ...element }

      if (isPlaying && element.animations) {
        element.animations.forEach(animation => {
          if (!animation.enabled) return

          const progress = getAnimationProgress(animation, currentTime)
          if (progress === null) return

          const interpolated = interpolateKeyframes(animation.keyframes, progress, animation.easing)

          if (interpolated.x !== undefined) animatedElement.x = interpolated.x
          if (interpolated.y !== undefined) animatedElement.y = interpolated.y
          if (interpolated.scale !== undefined) animatedElement.scale = interpolated.scale
          if (interpolated.rotation !== undefined) animatedElement.rotation = interpolated.rotation
          if (interpolated.opacity !== undefined) animatedElement.opacity = interpolated.opacity
          if (interpolated.width !== undefined) animatedElement.width = interpolated.width
          if (interpolated.height !== undefined) animatedElement.height = interpolated.height
        })
      }

      renderPatternElement(animatedElement, ctx, config.width, config.height)
    })

    ctx.restore()
  }, [config, scale, isPlaying, currentTime])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: config.width * scale,
        height: config.height * scale,
      }}
    />
  )
}
