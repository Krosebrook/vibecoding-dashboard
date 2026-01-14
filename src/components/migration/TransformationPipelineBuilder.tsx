import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Trash, 
  ArrowDown, 
  ArrowUp, 
  Play, 
  FlowArrow, 
  FunnelSimple,
  ArrowsLeftRight,
  ChartBar,
  ArrowsDownUp,
  CheckCircle
} from '@phosphor-icons/react'
import { DatabaseConnection, TransformationPipeline, TransformationStep } from '@/lib/types'
import { toast } from 'sonner'

interface TransformationPipelineBuilderProps {
  sourceConnection: DatabaseConnection | null
  destinationConnection: DatabaseConnection | null
}

const stepIcons = {
  filter: FunnelSimple,
  map: ArrowsLeftRight,
  aggregate: ChartBar,
  join: FlowArrow,
  sort: ArrowsDownUp,
  deduplicate: CheckCircle,
  validate: CheckCircle,
}

const stepDescriptions = {
  filter: 'Remove records based on conditions',
  map: 'Transform field values',
  aggregate: 'Group and summarize data',
  join: 'Combine data from multiple sources',
  sort: 'Order records by fields',
  deduplicate: 'Remove duplicate records',
  validate: 'Check data quality rules',
}

export function TransformationPipelineBuilder({ 
  sourceConnection, 
  destinationConnection 
}: TransformationPipelineBuilderProps) {
  const [pipelines, setPipelines] = useKV<TransformationPipeline[]>('transformation-pipelines', [])
  const [selectedPipeline, setSelectedPipeline] = useState<TransformationPipeline | null>(null)
  const [isNewPipelineOpen, setIsNewPipelineOpen] = useState(false)
  const [isAddStepOpen, setIsAddStepOpen] = useState(false)
  
  const [newPipelineName, setNewPipelineName] = useState('')
  const [newPipelineDescription, setNewPipelineDescription] = useState('')

  const [newStep, setNewStep] = useState<Partial<TransformationStep>>({
    type: 'filter',
    name: '',
    enabled: true,
    config: {},
  })

  const createPipeline = () => {
    if (!newPipelineName.trim()) {
      toast.error('Pipeline name is required')
      return
    }

    const pipeline: TransformationPipeline = {
      id: `pipeline-${Date.now()}`,
      name: newPipelineName,
      description: newPipelineDescription,
      steps: [],
      sourceConnectionId: sourceConnection?.id || '',
      destinationConnectionId: destinationConnection?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setPipelines(current => [...(current || []), pipeline])
    setSelectedPipeline(pipeline)
    setIsNewPipelineOpen(false)
    setNewPipelineName('')
    setNewPipelineDescription('')
    toast.success('Pipeline created')
  }

  const addStep = () => {
    if (!selectedPipeline || !newStep.name?.trim()) {
      toast.error('Step name is required')
      return
    }

    const step: TransformationStep = {
      id: `step-${Date.now()}`,
      type: newStep.type!,
      name: newStep.name,
      config: newStep.config || {},
      enabled: newStep.enabled!,
      order: selectedPipeline.steps.length,
    }

    const updatedPipeline: TransformationPipeline = {
      ...selectedPipeline,
      steps: [...selectedPipeline.steps, step],
      updatedAt: new Date().toISOString(),
    }

    setPipelines(current =>
      (current || []).map(p => (p.id === selectedPipeline.id ? updatedPipeline : p))
    )
    setSelectedPipeline(updatedPipeline)
    setIsAddStepOpen(false)
    setNewStep({
      type: 'filter',
      name: '',
      enabled: true,
      config: {},
    })
    toast.success('Step added to pipeline')
  }

  const deleteStep = (stepId: string) => {
    if (!selectedPipeline) return

    const updatedPipeline: TransformationPipeline = {
      ...selectedPipeline,
      steps: selectedPipeline.steps
        .filter(s => s.id !== stepId)
        .map((s, i) => ({ ...s, order: i })),
      updatedAt: new Date().toISOString(),
    }

    setPipelines(current =>
      (current || []).map(p => (p.id === selectedPipeline.id ? updatedPipeline : p))
    )
    setSelectedPipeline(updatedPipeline)
    toast.success('Step removed')
  }

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    if (!selectedPipeline) return

    const currentIndex = selectedPipeline.steps.findIndex(s => s.id === stepId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= selectedPipeline.steps.length) return

    const newSteps = [...selectedPipeline.steps]
    const [movedStep] = newSteps.splice(currentIndex, 1)
    newSteps.splice(newIndex, 0, movedStep)

    const updatedPipeline: TransformationPipeline = {
      ...selectedPipeline,
      steps: newSteps.map((s, i) => ({ ...s, order: i })),
      updatedAt: new Date().toISOString(),
    }

    setPipelines(current =>
      (current || []).map(p => (p.id === selectedPipeline.id ? updatedPipeline : p))
    )
    setSelectedPipeline(updatedPipeline)
  }

  const toggleStep = (stepId: string) => {
    if (!selectedPipeline) return

    const updatedPipeline: TransformationPipeline = {
      ...selectedPipeline,
      steps: selectedPipeline.steps.map(s =>
        s.id === stepId ? { ...s, enabled: !s.enabled } : s
      ),
      updatedAt: new Date().toISOString(),
    }

    setPipelines(current =>
      (current || []).map(p => (p.id === selectedPipeline.id ? updatedPipeline : p))
    )
    setSelectedPipeline(updatedPipeline)
  }

  const executePipeline = async () => {
    if (!selectedPipeline) return

    toast.loading('Executing pipeline...')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success(`Pipeline "${selectedPipeline.name}" executed successfully`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlowArrow size={24} weight="duotone" />
              Transformation Pipelines
            </div>
            <Dialog open={isNewPipelineOpen} onOpenChange={setIsNewPipelineOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  New Pipeline
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Transformation Pipeline</DialogTitle>
                  <DialogDescription>
                    Build a multi-step data transformation workflow
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pipeline-name">Pipeline Name</Label>
                    <Input
                      id="pipeline-name"
                      value={newPipelineName}
                      onChange={(e) => setNewPipelineName(e.target.value)}
                      placeholder="e.g., Clean User Data"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pipeline-description">Description</Label>
                    <Textarea
                      id="pipeline-description"
                      value={newPipelineDescription}
                      onChange={(e) => setNewPipelineDescription(e.target.value)}
                      placeholder="Describe what this pipeline does..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewPipelineOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createPipeline}>Create Pipeline</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Chain multiple transformation steps for complex data processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(pipelines || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FlowArrow size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
              <p>No pipelines yet. Create your first transformation pipeline.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {(pipelines || []).map(pipeline => (
                <div
                  key={pipeline.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedPipeline?.id === pipeline.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                  onClick={() => setSelectedPipeline(pipeline)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{pipeline.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pipeline.description || 'No description'}
                      </p>
                    </div>
                    <Badge variant="secondary">{pipeline.steps.length} steps</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPipeline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pipeline: {selectedPipeline.name}</span>
              <div className="flex items-center gap-2">
                <Dialog open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus size={16} className="mr-2" />
                      Add Step
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Transformation Step</DialogTitle>
                      <DialogDescription>
                        Choose a transformation type and configure it
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="step-type">Step Type</Label>
                        <Select
                          value={newStep.type}
                          onValueChange={(value) => setNewStep({ ...newStep, type: value as TransformationStep['type'] })}
                        >
                          <SelectTrigger id="step-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(stepDescriptions).map(([type, desc]) => (
                              <SelectItem key={type} value={type}>
                                <div>
                                  <div className="font-medium capitalize">{type}</div>
                                  <div className="text-xs text-muted-foreground">{desc}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="step-name">Step Name</Label>
                        <Input
                          id="step-name"
                          value={newStep.name}
                          onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                          placeholder="e.g., Filter Active Users"
                        />
                      </div>
                      <div>
                        <Label htmlFor="step-config">Configuration (JSON)</Label>
                        <Textarea
                          id="step-config"
                          value={JSON.stringify(newStep.config, null, 2)}
                          onChange={(e) => {
                            try {
                              setNewStep({ ...newStep, config: JSON.parse(e.target.value) })
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                          className="font-mono text-sm"
                          rows={6}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddStepOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addStep}>Add Step</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={executePipeline}>
                  <Play size={16} className="mr-2" weight="fill" />
                  Execute Pipeline
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPipeline.steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No steps in this pipeline. Add your first step.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPipeline.steps.map((step, index) => {
                  const StepIcon = stepIcons[step.type]
                  return (
                    <div
                      key={step.id}
                      className={`relative p-4 rounded-lg border ${
                        step.enabled
                          ? 'border-border bg-card'
                          : 'border-border/50 bg-muted/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            <StepIcon size={24} weight="duotone" className="text-accent" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                Step {index + 1}
                              </Badge>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {step.type}
                              </Badge>
                            </div>
                            <h4 className="font-semibold">{step.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {stepDescriptions[step.type]}
                            </p>
                            {Object.keys(step.config).length > 0 && (
                              <pre className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-x-auto">
                                {JSON.stringify(step.config, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={step.enabled}
                            onCheckedChange={() => toggleStep(step.id)}
                          />
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveStep(step.id, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveStep(step.id, 'down')}
                              disabled={index === selectedPipeline.steps.length - 1}
                            >
                              <ArrowDown size={14} />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteStep(step.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                      {index < selectedPipeline.steps.length - 1 && (
                        <div className="absolute left-1/2 -bottom-3 transform -translate-x-1/2 z-10">
                          <ArrowDown
                            size={20}
                            weight="bold"
                            className="text-accent bg-background"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
