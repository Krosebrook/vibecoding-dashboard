import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PatternElement, PatternElementType, BlendMode } from '@/lib/pattern-builder-types'
import { Trash, Copy, Eye, EyeSlash, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PatternElementEditorProps {
  element: PatternElement
  onUpdate: (element: PatternElement) => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export function PatternElementEditor({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: PatternElementEditorProps) {
  const [isVisible, setIsVisible] = useState(true)

  const updateProperty = (key: keyof PatternElement, value: any) => {
    onUpdate({ ...element, [key]: value })
  }

  const updateNestedProperty = (key: string, value: any) => {
    onUpdate({
      ...element,
      properties: {
        ...element.properties,
        [key]: value,
      },
    })
  }

  const elementTypeOptions: { value: PatternElementType; label: string }[] = [
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'circle', label: 'Circle' },
    { value: 'triangle', label: 'Triangle' },
    { value: 'line', label: 'Line' },
    { value: 'grid', label: 'Grid' },
    { value: 'dots', label: 'Dots' },
    { value: 'waves', label: 'Waves' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'noise', label: 'Noise' },
    { value: 'stripes', label: 'Stripes' },
    { value: 'chevron', label: 'Chevron' },
    { value: 'hexagon', label: 'Hexagon' },
    { value: 'star', label: 'Star' },
    { value: 'spiral', label: 'Spiral' },
  ]

  const blendModeOptions: { value: BlendMode; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'darken', label: 'Darken' },
    { value: 'lighten', label: 'Lighten' },
    { value: 'color-dodge', label: 'Color Dodge' },
    { value: 'color-burn', label: 'Color Burn' },
    { value: 'hard-light', label: 'Hard Light' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'difference', label: 'Difference' },
    { value: 'exclusion', label: 'Exclusion' },
  ]

  const renderTypeSpecificControls = () => {
    switch (element.type) {
      case 'rectangle':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Corner Radius</Label>
              <Slider
                value={[element.properties.cornerRadius || 0]}
                onValueChange={([value]) => updateNestedProperty('cornerRadius', value)}
                min={0}
                max={50}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.cornerRadius || 0}px
              </div>
            </div>
          </div>
        )

      case 'grid':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Spacing</Label>
              <Slider
                value={[element.properties.spacing || 20]}
                onValueChange={([value]) => updateNestedProperty('spacing', value)}
                min={5}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.spacing || 20}px
              </div>
            </div>
            <div>
              <Label className="text-xs">Line Width</Label>
              <Slider
                value={[element.properties.lineWidth || 1]}
                onValueChange={([value]) => updateNestedProperty('lineWidth', value)}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.lineWidth || 1}px
              </div>
            </div>
          </div>
        )

      case 'dots':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Spacing</Label>
              <Slider
                value={[element.properties.spacing || 20]}
                onValueChange={([value]) => updateNestedProperty('spacing', value)}
                min={5}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.spacing || 20}px
              </div>
            </div>
            <div>
              <Label className="text-xs">Dot Size</Label>
              <Slider
                value={[element.properties.dotSize || 3]}
                onValueChange={([value]) => updateNestedProperty('dotSize', value)}
                min={1}
                max={20}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.dotSize || 3}px
              </div>
            </div>
          </div>
        )

      case 'waves':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Amplitude</Label>
              <Slider
                value={[element.properties.amplitude || 20]}
                onValueChange={([value]) => updateNestedProperty('amplitude', value)}
                min={5}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.amplitude || 20}px
              </div>
            </div>
            <div>
              <Label className="text-xs">Frequency</Label>
              <Slider
                value={[element.properties.frequency || 2]}
                onValueChange={([value]) => updateNestedProperty('frequency', value)}
                min={1}
                max={10}
                step={0.5}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.frequency || 2}
              </div>
            </div>
            <div>
              <Label className="text-xs">Phase</Label>
              <Slider
                value={[element.properties.phase || 0]}
                onValueChange={([value]) => updateNestedProperty('phase', value)}
                min={0}
                max={360}
                step={15}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.phase || 0}°
              </div>
            </div>
          </div>
        )

      case 'stripes':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Spacing</Label>
              <Slider
                value={[element.properties.spacing || 30]}
                onValueChange={([value]) => updateNestedProperty('spacing', value)}
                min={10}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.spacing || 30}px
              </div>
            </div>
            <div>
              <Label className="text-xs">Thickness</Label>
              <Slider
                value={[element.properties.thickness || 10]}
                onValueChange={([value]) => updateNestedProperty('thickness', value)}
                min={1}
                max={50}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.thickness || 10}px
              </div>
            </div>
          </div>
        )

      case 'hexagon':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Size</Label>
              <Slider
                value={[element.properties.size || 30]}
                onValueChange={([value]) => updateNestedProperty('size', value)}
                min={10}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.size || 30}px
              </div>
            </div>
            <div>
              <Label className="text-xs">Spacing</Label>
              <Slider
                value={[element.properties.spacing || 5]}
                onValueChange={([value]) => updateNestedProperty('spacing', value)}
                min={0}
                max={30}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.spacing || 5}px
              </div>
            </div>
            <div>
              <Label className="text-xs">Stroke Width</Label>
              <Slider
                value={[element.properties.strokeWidth || 2]}
                onValueChange={([value]) => updateNestedProperty('strokeWidth', value)}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.strokeWidth || 2}px
              </div>
            </div>
          </div>
        )

      case 'star':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Star Count</Label>
              <Slider
                value={[element.properties.count || 30]}
                onValueChange={([value]) => updateNestedProperty('count', value)}
                min={5}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.count || 30}
              </div>
            </div>
            <div>
              <Label className="text-xs">Min Size</Label>
              <Slider
                value={[element.properties.minSize || 2]}
                onValueChange={([value]) => updateNestedProperty('minSize', value)}
                min={1}
                max={20}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.minSize || 2}px
              </div>
            </div>
            <div>
              <Label className="text-xs">Max Size</Label>
              <Slider
                value={[element.properties.maxSize || 8]}
                onValueChange={([value]) => updateNestedProperty('maxSize', value)}
                min={1}
                max={30}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.maxSize || 8}px
              </div>
            </div>
          </div>
        )

      case 'spiral':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Turns</Label>
              <Slider
                value={[element.properties.turns || 5]}
                onValueChange={([value]) => updateNestedProperty('turns', value)}
                min={1}
                max={20}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.turns || 5}
              </div>
            </div>
            <div>
              <Label className="text-xs">Line Width</Label>
              <Slider
                value={[element.properties.lineWidth || 2]}
                onValueChange={([value]) => updateNestedProperty('lineWidth', value)}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.lineWidth || 2}px
              </div>
            </div>
          </div>
        )

      case 'noise':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Noise Scale</Label>
              <Slider
                value={[element.properties.scale || 0.5]}
                onValueChange={([value]) => updateNestedProperty('scale', value)}
                min={0.1}
                max={1}
                step={0.1}
                className="mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {element.properties.scale || 0.5}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="border-l-4" style={{ borderLeftColor: element.color }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Input
              value={element.name}
              onChange={(e) => updateProperty('name', e.target.value)}
              className="h-8 font-semibold mb-2"
            />
            <CardDescription className="text-xs">
              Layer {element.zIndex} • {element.type}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="h-8 w-8 p-0"
            >
              {isVisible ? <Eye size={16} /> : <EyeSlash size={16} />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isVisible && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Element Type</Label>
            <Select value={element.type} onValueChange={(value) => updateProperty('type', value)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {elementTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">X Position</Label>
              <Input
                type="number"
                value={element.x}
                onChange={(e) => updateProperty('x', Number(e.target.value))}
                className="h-9 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Y Position</Label>
              <Input
                type="number"
                value={element.y}
                onChange={(e) => updateProperty('y', Number(e.target.value))}
                className="h-9 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={element.width}
                onChange={(e) => updateProperty('width', Number(e.target.value))}
                className="h-9 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={element.height}
                onChange={(e) => updateProperty('height', Number(e.target.value))}
                className="h-9 mt-1"
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={element.color.startsWith('oklch') ? '#4A90E2' : element.color}
                onChange={(e) => updateProperty('color', e.target.value)}
                className="h-9 w-16 p-1"
              />
              <Input
                value={element.color}
                onChange={(e) => updateProperty('color', e.target.value)}
                className="h-9 flex-1"
                placeholder="oklch(0.5 0.2 250)"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Opacity</Label>
            <Slider
              value={[element.opacity * 100]}
              onValueChange={([value]) => updateProperty('opacity', value / 100)}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">{Math.round(element.opacity * 100)}%</div>
          </div>

          <div>
            <Label className="text-xs">Rotation</Label>
            <Slider
              value={[element.rotation]}
              onValueChange={([value]) => updateProperty('rotation', value)}
              min={0}
              max={360}
              step={15}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">{element.rotation}°</div>
          </div>

          <div>
            <Label className="text-xs">Scale</Label>
            <Slider
              value={[element.scale * 100]}
              onValueChange={([value]) => updateProperty('scale', value / 100)}
              min={10}
              max={200}
              step={10}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">{Math.round(element.scale * 100)}%</div>
          </div>

          <div>
            <Label className="text-xs">Blend Mode</Label>
            <Select value={element.blendMode} onValueChange={(value) => updateProperty('blendMode', value)}>
              <SelectTrigger className="h-9 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {blendModeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Z-Index (Layer)</Label>
            <Input
              type="number"
              value={element.zIndex}
              onChange={(e) => updateProperty('zIndex', Number(e.target.value))}
              className="h-9 mt-1"
            />
          </div>

          {renderTypeSpecificControls()}

          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={onDuplicate} className="w-full">
              <Copy size={14} className="mr-2" />
              Duplicate
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete} className="w-full">
              <Trash size={14} className="mr-2" />
              Delete
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="flex-1"
            >
              <ArrowUp size={14} className="mr-2" />
              Move Up
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="flex-1"
            >
              <ArrowDown size={14} className="mr-2" />
              Move Down
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
