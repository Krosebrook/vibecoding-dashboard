import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Plus, 
  Trash, 
  Copy, 
  ArrowsDownUp, 
  Lightning, 
  Path,
  CirclesFour,
  Timer
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AnimationPreset, 
  ElementAnimation, 
  ChoreographyConfig,
  animationPresets 
} from '@/lib/animation-presets'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ChoreographyStep {
  id: string
  presetId: string
  elementIds: string[]
  delay: number
  customDuration?: number
}

export function ChoreographyBuilder() {
  const [choreographyName, setChoreographyName] = useState("My Choreography")
  const [steps, setSteps] = useState<ChoreographyStep[]>([])
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  const addStep = () => {
    const newStep: ChoreographyStep = {
      id: `step-${Date.now()}`,
      presetId: animationPresets[0].id,
      elementIds: ['element-1'],
      delay: 0
    }
    setSteps([...steps, newStep])
    setSelectedStep(newStep.id)
  }

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id))
    if (selectedStep === id) setSelectedStep(null)
  }

  const duplicateStep = (id: string) => {
    const step = steps.find(s => s.id === id)
    if (!step) return
    
    const newStep: ChoreographyStep = {
      ...step,
      id: `step-${Date.now()}`
    }
    setSteps([...steps, newStep])
  }

  const updateStep = (id: string, updates: Partial<ChoreographyStep>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const moveStep = (id: string, direction: 'up' | 'down') => {
    const index = steps.findIndex(s => s.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === steps.length - 1) return

    const newSteps = [...steps]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]
    setSteps(newSteps)
  }

  const playChoreography = () => {
    setPreviewKey(prev => prev + 1)
    setIsPlaying(true)
    
    const totalDuration = steps.reduce((acc, step) => {
      const preset = animationPresets.find(p => p.id === step.presetId)
      return acc + (step.delay || 0) + (step.customDuration || preset?.totalDuration || 0)
    }, 0)
    
    setTimeout(() => setIsPlaying(false), totalDuration * 1000)
  }

  const exportChoreography = () => {
    const config: ChoreographyConfig = {
      name: choreographyName,
      elements: Array.from(new Set(steps.flatMap(s => s.elementIds))),
      preset: animationPresets.find(p => p.id === steps[0]?.presetId) || animationPresets[0],
      autoPlay: false
    }
    
    const dataStr = JSON.stringify(config, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${choreographyName.toLowerCase().replace(/\s+/g, '-')}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Choreography exported!")
  }

  const currentStep = steps.find(s => s.id === selectedStep)
  const currentPreset = currentStep ? animationPresets.find(p => p.id === currentStep.presetId) : null

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Path size={24} weight="duotone" className="text-accent" />
              Animation Choreography Builder
            </CardTitle>
            <CardDescription>
              Create complex multi-element animation sequences with precise timing
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Lightning size={14} />
            Advanced
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label>Choreography Name</Label>
            <Input
              value={choreographyName}
              onChange={(e) => setChoreographyName(e.target.value)}
              placeholder="Enter choreography name"
            />
          </div>
          <div className="flex gap-2 pt-6">
            <Button onClick={addStep}>
              <Plus size={16} className="mr-2" />
              Add Step
            </Button>
            <Button 
              variant="secondary" 
              onClick={playChoreography}
              disabled={steps.length === 0 || isPlaying}
            >
              <Play size={16} className="mr-2" />
              Play
            </Button>
            <Button 
              variant="outline" 
              onClick={exportChoreography}
              disabled={steps.length === 0}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Timer size={18} />
                  Timeline ({steps.length} steps)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {steps.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No steps yet. Click "Add Step" to begin.
                      </div>
                    ) : (
                      steps.map((step, index) => {
                        const preset = animationPresets.find(p => p.id === step.presetId)
                        return (
                          <motion.div
                            key={step.id}
                            layout
                            className={cn(
                              "p-3 rounded-lg border-2 cursor-pointer transition-all",
                              selectedStep === step.id 
                                ? "border-accent bg-accent/10" 
                                : "border-border hover:border-accent/50"
                            )}
                            onClick={() => setSelectedStep(step.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono text-muted-foreground">
                                    #{index + 1}
                                  </span>
                                  <span className="text-lg">{preset?.icon}</span>
                                  <span className="text-sm font-medium truncate">
                                    {preset?.name}
                                  </span>
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                  {step.elementIds.map((id, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {id}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    moveStep(step.id, 'up')
                                  }}
                                  disabled={index === 0}
                                >
                                  <ArrowsDownUp size={12} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    duplicateStep(step.id)
                                  }}
                                >
                                  <Copy size={12} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeStep(step.id)
                                  }}
                                >
                                  <Trash size={12} />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {currentStep && currentPreset ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Step Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Animation Preset</Label>
                      <Select
                        value={currentStep.presetId}
                        onValueChange={(value) => updateStep(currentStep.id, { presetId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {animationPresets.map((preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                              {preset.icon} {preset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Target Elements (comma-separated)</Label>
                      <Input
                        value={currentStep.elementIds.join(', ')}
                        onChange={(e) => {
                          const ids = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          updateStep(currentStep.id, { elementIds: ids })
                        }}
                        placeholder="element-1, element-2, element-3"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Delay: {currentStep.delay}s</Label>
                        <Slider
                          value={[currentStep.delay]}
                          onValueChange={(value) => updateStep(currentStep.id, { delay: value[0] })}
                          min={0}
                          max={5}
                          step={0.1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Duration: {currentStep.customDuration || currentPreset.totalDuration}s
                        </Label>
                        <Slider
                          value={[currentStep.customDuration || currentPreset.totalDuration]}
                          onValueChange={(value) => updateStep(currentStep.id, { customDuration: value[0] })}
                          min={0.1}
                          max={5}
                          step={0.1}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="text-muted-foreground mb-1">Category</div>
                        <Badge className="text-xs">{currentPreset.category}</Badge>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="text-muted-foreground mb-1">Complexity</div>
                        <Badge variant="outline" className="text-xs">{currentPreset.complexity}</Badge>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="text-muted-foreground mb-1">Orchestration</div>
                        <Badge variant="secondary" className="text-xs">{currentPreset.orchestration}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CirclesFour size={18} />
                      Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChoreographyPreview
                      key={previewKey}
                      steps={steps}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="h-[600px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Path size={64} className="mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Build Your Choreography</h3>
                      <p className="text-muted-foreground max-w-sm">
                        Add animation steps to create complex multi-element choreographies.
                        Select a step to configure its properties.
                      </p>
                    </div>
                    <Button onClick={addStep} size="lg">
                      <Plus size={20} className="mr-2" />
                      Add First Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ChoreographyPreviewProps {
  steps: ChoreographyStep[]
}

function ChoreographyPreview({ steps }: ChoreographyPreviewProps) {
  if (steps.length === 0) {
    return (
      <div className="h-[400px] bg-muted/30 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Add steps to see preview</p>
      </div>
    )
  }

  const allElementIds = Array.from(new Set(steps.flatMap(s => s.elementIds)))

  return (
    <div className="h-[400px] bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg flex items-center justify-center p-8 overflow-hidden">
      <div className="flex flex-wrap gap-6 justify-center items-center">
        {allElementIds.map((elementId) => {
          const stepForElement = steps.find(s => s.elementIds.includes(elementId))
          if (!stepForElement) return null

          const preset = animationPresets.find(p => p.id === stepForElement.presetId)
          if (!preset) return null

          const element = preset.elements[0]
          const variants = {
            initial: element.from || {},
            animate: element.to || {}
          }

          return (
            <div key={elementId} className="relative">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-lg shadow-lg flex items-center justify-center"
                initial={variants.initial}
                animate={variants.animate}
                transition={{
                  duration: stepForElement.customDuration || preset.totalDuration,
                  ease: "easeOut",
                  delay: stepForElement.delay
                }}
              >
                <span className="text-xs font-mono text-primary-foreground">
                  {elementId}
                </span>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
