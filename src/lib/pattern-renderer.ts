import { PatternElement } from './pattern-builder-types'

export const renderPatternElement = (
  element: PatternElement,
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) => {
  ctx.save()

  ctx.globalAlpha = element.opacity
  ctx.globalCompositeOperation = element.blendMode as GlobalCompositeOperation

  const centerX = element.x + element.width / 2
  const centerY = element.y + element.height / 2
  ctx.translate(centerX, centerY)
  ctx.rotate((element.rotation * Math.PI) / 180)
  ctx.scale(element.scale, element.scale)
  ctx.translate(-centerX, -centerY)

  switch (element.type) {
    case 'rectangle':
      renderRectangle(element, ctx)
      break
    case 'circle':
      renderCircle(element, ctx)
      break
    case 'triangle':
      renderTriangle(element, ctx)
      break
    case 'line':
      renderLine(element, ctx)
      break
    case 'grid':
      renderGrid(element, ctx)
      break
    case 'dots':
      renderDots(element, ctx)
      break
    case 'waves':
      renderWaves(element, ctx)
      break
    case 'gradient':
      renderGradient(element, ctx)
      break
    case 'noise':
      renderNoise(element, ctx)
      break
    case 'stripes':
      renderStripes(element, ctx)
      break
    case 'chevron':
      renderChevron(element, ctx)
      break
    case 'hexagon':
      renderHexagon(element, ctx)
      break
    case 'star':
      renderStar(element, ctx)
      break
    case 'spiral':
      renderSpiral(element, ctx)
      break
  }

  ctx.restore()
}

const renderRectangle = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = element.color
  const cornerRadius = element.properties.cornerRadius || 0
  
  if (cornerRadius > 0) {
    ctx.beginPath()
    ctx.roundRect(element.x, element.y, element.width, element.height, cornerRadius)
    ctx.fill()
  } else {
    ctx.fillRect(element.x, element.y, element.width, element.height)
  }
}

const renderCircle = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = element.color
  const centerX = element.x + element.width / 2
  const centerY = element.y + element.height / 2
  const radius = Math.min(element.width, element.height) / 2
  
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()
}

const renderTriangle = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = element.color
  
  ctx.beginPath()
  ctx.moveTo(element.x + element.width / 2, element.y)
  ctx.lineTo(element.x + element.width, element.y + element.height)
  ctx.lineTo(element.x, element.y + element.height)
  ctx.closePath()
  ctx.fill()
}

const renderLine = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = element.color
  ctx.lineWidth = element.properties.lineWidth || 2
  
  ctx.beginPath()
  ctx.moveTo(element.x, element.y)
  ctx.lineTo(element.x + element.width, element.y + element.height)
  ctx.stroke()
}

const renderGrid = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = element.color
  ctx.lineWidth = element.properties.lineWidth || 1
  const spacing = element.properties.spacing || 20
  
  for (let x = element.x; x <= element.x + element.width; x += spacing) {
    ctx.beginPath()
    ctx.moveTo(x, element.y)
    ctx.lineTo(x, element.y + element.height)
    ctx.stroke()
  }
  
  for (let y = element.y; y <= element.y + element.height; y += spacing) {
    ctx.beginPath()
    ctx.moveTo(element.x, y)
    ctx.lineTo(element.x + element.width, y)
    ctx.stroke()
  }
}

const renderDots = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = element.color
  const spacing = element.properties.spacing || 20
  const dotSize = element.properties.dotSize || 3
  
  for (let x = element.x; x <= element.x + element.width; x += spacing) {
    for (let y = element.y; y <= element.y + element.height; y += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

const renderWaves = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = element.color
  ctx.lineWidth = element.properties.lineWidth || 2
  const amplitude = element.properties.amplitude || 20
  const frequency = element.properties.frequency || 2
  const phase = (element.properties.phase || 0) * Math.PI / 180
  
  ctx.beginPath()
  for (let x = 0; x <= element.width; x += 2) {
    const y = amplitude * Math.sin((x / element.width) * frequency * Math.PI * 2 + phase)
    if (x === 0) {
      ctx.moveTo(element.x + x, element.y + element.height / 2 + y)
    } else {
      ctx.lineTo(element.x + x, element.y + element.height / 2 + y)
    }
  }
  ctx.stroke()
}

const renderGradient = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  const gradientType = element.properties.gradientType || 'linear'
  const colorStops = element.properties.colorStops || [
    { offset: 0, color: element.color },
    { offset: 100, color: 'transparent' }
  ]
  
  let gradient: CanvasGradient
  
  if (gradientType === 'radial') {
    const centerX = element.x + element.width / 2
    const centerY = element.y + element.height / 2
    const radius = Math.max(element.width, element.height) / 2
    gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  } else {
    gradient = ctx.createLinearGradient(element.x, element.y, element.x + element.width, element.y + element.height)
  }
  
  colorStops.forEach((stop: any) => {
    gradient.addColorStop(stop.offset / 100, stop.color)
  })
  
  ctx.fillStyle = gradient
  ctx.fillRect(element.x, element.y, element.width, element.height)
}

const renderNoise = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  const imageData = ctx.createImageData(element.width, element.height)
  const data = imageData.data
  const noiseScale = element.properties.scale || 0.5
  
  for (let i = 0; i < data.length; i += 4) {
    const value = Math.random() * 255 * noiseScale
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
    data[i + 3] = 255 * element.opacity
  }
  
  ctx.putImageData(imageData, element.x, element.y)
}

const renderStripes = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = element.color
  const spacing = element.properties.spacing || 20
  const thickness = element.properties.thickness || 10
  
  for (let offset = 0; offset < element.width + element.height; offset += spacing) {
    ctx.fillRect(
      element.x + offset - element.height,
      element.y,
      thickness,
      element.height
    )
  }
}

const renderChevron = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = element.color
  ctx.lineWidth = element.properties.thickness || 8
  ctx.lineCap = 'square'
  const spacing = element.properties.spacing || 40
  const angle = element.properties.angle || 45
  
  for (let y = element.y; y <= element.y + element.height + spacing; y += spacing) {
    for (let x = element.x; x <= element.x + element.width; x += spacing * 2) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + spacing / 2, y - spacing / 2)
      ctx.lineTo(x + spacing, y)
      ctx.stroke()
    }
  }
}

const renderHexagon = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = element.color
  ctx.lineWidth = element.properties.strokeWidth || 2
  const size = element.properties.size || 30
  const spacing = element.properties.spacing || 5
  const hexWidth = size * 2
  const hexHeight = Math.sqrt(3) * size
  
  for (let row = 0; row < element.height / hexHeight; row++) {
    for (let col = 0; col < element.width / hexWidth; col++) {
      const x = element.x + col * (hexWidth * 0.75 + spacing)
      const y = element.y + row * (hexHeight + spacing) + (col % 2 ? hexHeight / 2 : 0)
      
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const hx = x + size * Math.cos(angle)
        const hy = y + size * Math.sin(angle)
        if (i === 0) ctx.moveTo(hx, hy)
        else ctx.lineTo(hx, hy)
      }
      ctx.closePath()
      ctx.stroke()
    }
  }
}

const renderStar = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = element.color
  const count = element.properties.count || 30
  const minSize = element.properties.minSize || 2
  const maxSize = element.properties.maxSize || 8
  const points = element.properties.points || 5
  
  const seed = element.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (index: number) => {
    const x = Math.sin(seed + index * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  
  for (let i = 0; i < count; i++) {
    const x = element.x + random(i) * element.width
    const y = element.y + random(i + 1000) * element.height
    const size = minSize + random(i + 2000) * (maxSize - minSize)
    
    drawStar(ctx, x, y, points, size, size / 2)
  }
}

const drawStar = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) => {
  let rot = (Math.PI / 2) * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes
  
  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step
    
    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fill()
}

const renderSpiral = (element: PatternElement, ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = element.color
  ctx.lineWidth = element.properties.lineWidth || 2
  const turns = element.properties.turns || 5
  const spacing = element.properties.spacing || 10
  const centerX = element.x
  const centerY = element.y
  
  ctx.beginPath()
  for (let angle = 0; angle < turns * Math.PI * 2; angle += 0.1) {
    const radius = (angle / (turns * Math.PI * 2)) * Math.min(element.width, element.height) / 2
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    
    if (angle === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()
}
