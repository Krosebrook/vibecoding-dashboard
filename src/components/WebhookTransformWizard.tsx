import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowRight, 
  Code, 
  Play, 
  Plus, 
  Trash, 
  Warning,
  Check,
  ArrowsDownUp,
  Function as FunctionIcon,
  Lightbulb,
  Copy,
  Eye
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export interface TransformMapping {
  id: string
  sourcePath: string
  targetField: string
  transformType: 'direct' | 'function' | 'computed' | 'conditional'
  transformFunction?: string
  defaultValue?: any
  condition?: {
    field: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less' | 'exists'
    value: any
  }
}

export interface PayloadTransform {
  id: string
  name: string
  description: string
  webhookId: string
  mappings: TransformMapping[]
  outputFormat: 'flat' | 'nested' | 'array'
  testPayload?: any
  testResult?: any
}

interface WebhookTransformWizardProps {
  webhookId?: string
  samplePayload?: any
  onSave?: (transform: PayloadTransform) => void
  existingTransform?: PayloadTransform
}

export function WebhookTransformWizard({
  webhookId = '',
  samplePayload,
  onSave,
  existingTransform
}: WebhookTransformWizardProps) {
  const [transform, setTransform] = useState<PayloadTransform>(
    existingTransform || {
      id: `transform_${Date.now()}`,
      name: '',
      description: '',
      webhookId,
      mappings: [],
      outputFormat: 'flat'
    }
  )
  const [currentMapping, setCurrentMapping] = useState<Partial<TransformMapping>>({
    transformType: 'direct'
  })
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(samplePayload || { example: 'data' }, null, 2)
  )
  const [testResult, setTestResult] = useState<any>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const transformTypes = [
    { value: 'direct', label: 'Direct', description: 'Map value as-is' },
    { value: 'function', label: 'Function', description: 'Apply JavaScript function' },
    { value: 'computed', label: 'Computed', description: 'Combine multiple fields' },
    { value: 'conditional', label: 'Conditional', description: 'Map based on condition' }
  ]

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater', label: 'Greater Than' },
    { value: 'less', label: 'Less Than' },
    { value: 'exists', label: 'Exists' }
  ]

  const extractPaths = (obj: any, prefix = ''): string[] => {
    const paths: string[] = []
    
    if (!obj || typeof obj !== 'object') return paths
    
    Object.keys(obj).forEach(key => {
      const path = prefix ? `${prefix}.${key}` : key
      paths.push(path)
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        paths.push(...extractPaths(obj[key], path))
      }
    })
    
    return paths
  }

  const getValueByPath = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj)
  }

  const addMapping = () => {
    if (!currentMapping.sourcePath || !currentMapping.targetField) {
      toast.error('Source path and target field are required')
      return
    }

    const newMapping: TransformMapping = {
      id: `mapping_${Date.now()}`,
      sourcePath: currentMapping.sourcePath,
      targetField: currentMapping.targetField,
      transformType: currentMapping.transformType || 'direct',
      transformFunction: currentMapping.transformFunction,
      defaultValue: currentMapping.defaultValue,
      condition: currentMapping.condition
    }

    setTransform(prev => ({
      ...prev,
      mappings: [...prev.mappings, newMapping]
    }))

    setCurrentMapping({ transformType: 'direct' })
    toast.success('Mapping added')
  }

  const removeMapping = (id: string) => {
    setTransform(prev => ({
      ...prev,
      mappings: prev.mappings.filter(m => m.id !== id)
    }))
    toast.success('Mapping removed')
  }

  const applyTransform = (payload: any, mappings: TransformMapping[]): any => {
    const result: any = {}

    mappings.forEach(mapping => {
      try {
        let value = getValueByPath(payload, mapping.sourcePath)

        if (mapping.condition) {
          const conditionValue = getValueByPath(payload, mapping.condition.field)
          let conditionMet = false

          switch (mapping.condition.operator) {
            case 'equals':
              conditionMet = conditionValue === mapping.condition.value
              break
            case 'not_equals':
              conditionMet = conditionValue !== mapping.condition.value
              break
            case 'contains':
              conditionMet = String(conditionValue).includes(mapping.condition.value)
              break
            case 'greater':
              conditionMet = Number(conditionValue) > Number(mapping.condition.value)
              break
            case 'less':
              conditionMet = Number(conditionValue) < Number(mapping.condition.value)
              break
            case 'exists':
              conditionMet = conditionValue !== undefined && conditionValue !== null
              break
          }

          if (!conditionMet) {
            value = mapping.defaultValue
          }
        }

        if (value === undefined || value === null) {
          value = mapping.defaultValue
        }

        if (mapping.transformType === 'function' && mapping.transformFunction) {
          try {
            const fn = new Function('value', 'payload', mapping.transformFunction)
            value = fn(value, payload)
          } catch (error) {
            console.error('Transform function error:', error)
            value = mapping.defaultValue
          }
        }

        if (mapping.transformType === 'computed' && mapping.transformFunction) {
          try {
            const fn = new Function('payload', mapping.transformFunction)
            value = fn(payload)
          } catch (error) {
            console.error('Computed function error:', error)
            value = mapping.defaultValue
          }
        }

        const targetParts = mapping.targetField.split('.')
        if (targetParts.length === 1) {
          result[mapping.targetField] = value
        } else {
          let current = result
          for (let i = 0; i < targetParts.length - 1; i++) {
            if (!current[targetParts[i]]) {
              current[targetParts[i]] = {}
            }
            current = current[targetParts[i]]
          }
          current[targetParts[targetParts.length - 1]] = value
        }
      } catch (error) {
        console.error('Mapping error:', error)
      }
    })

    return result
  }

  const testTransform = () => {
    try {
      const payload = JSON.parse(testPayload)
      const result = applyTransform(payload, transform.mappings)
      setTestResult(result)
      toast.success('Transform applied successfully')
    } catch (error) {
      toast.error('Invalid JSON payload or transform error')
      console.error(error)
    }
  }

  const handleSave = () => {
    if (!transform.name) {
      toast.error('Please provide a transform name')
      return
    }

    if (transform.mappings.length === 0) {
      toast.error('Please add at least one mapping')
      return
    }

    onSave?.(transform)
    toast.success('Transform saved')
  }

  const suggestMappings = () => {
    try {
      const payload = JSON.parse(testPayload)
      const paths = extractPaths(payload)
      
      const suggestions = paths.slice(0, 5).map(path => ({
        id: `mapping_${Date.now()}_${Math.random()}`,
        sourcePath: path,
        targetField: path.split('.').pop() || path,
        transformType: 'direct' as const
      }))

      setTransform(prev => ({
        ...prev,
        mappings: [...prev.mappings, ...suggestions]
      }))

      toast.success(`Added ${suggestions.length} suggested mappings`)
    } catch (error) {
      toast.error('Invalid JSON payload')
    }
  }

  const availablePaths = (() => {
    try {
      const payload = JSON.parse(testPayload)
      return extractPaths(payload)
    } catch {
      return []
    }
  })()

  const generateCode = () => {
    const code = `
// Transform function
function transformPayload(payload) {
  const result = {};
  
${transform.mappings.map(m => {
  if (m.transformType === 'function' && m.transformFunction) {
    return `  // ${m.targetField}\n  result['${m.targetField}'] = ((value) => {\n    ${m.transformFunction}\n  })(payload.${m.sourcePath});`
  } else if (m.transformType === 'computed' && m.transformFunction) {
    return `  // ${m.targetField}\n  result['${m.targetField}'] = (() => {\n    ${m.transformFunction}\n  })();`
  } else {
    return `  result['${m.targetField}'] = payload.${m.sourcePath};`
  }
}).join('\n\n')}
  
  return result;
}`.trim()

    return code
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowsDownUp size={20} weight="duotone" className="text-accent" />
          Payload Transform Wizard
        </CardTitle>
        <CardDescription>
          Map webhook payload fields to your dashboard data model
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mappings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="mappings">Mappings</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>

          <TabsContent value="mappings" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="transform-name">Transform Name</Label>
                <Input
                  id="transform-name"
                  placeholder="e.g., GitHub Push to Dashboard Events"
                  value={transform.name}
                  onChange={(e) => setTransform(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="transform-description">Description</Label>
                <Textarea
                  id="transform-description"
                  placeholder="Describe what this transform does"
                  value={transform.description}
                  onChange={(e) => setTransform(prev => ({ ...prev, description: e.target.value }))}
                  className="resize-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Label>Output Format</Label>
                <Select
                  value={transform.outputFormat}
                  onValueChange={(value: any) => setTransform(prev => ({ ...prev, outputFormat: value }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Object</SelectItem>
                    <SelectItem value="nested">Nested Object</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Field Mappings</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={suggestMappings}
                    disabled={!testPayload}
                  >
                    <Lightbulb size={16} className="mr-2" />
                    Auto-Suggest
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <FunctionIcon size={16} className="mr-2" />
                    {showAdvanced ? 'Simple' : 'Advanced'}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="border-dashed">
                  <CardContent className="pt-6 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="source-path" className="text-xs">Source Path</Label>
                        <div className="flex gap-2">
                          <Input
                            id="source-path"
                            placeholder="data.user.name"
                            value={currentMapping.sourcePath || ''}
                            onChange={(e) => setCurrentMapping(prev => ({ ...prev, sourcePath: e.target.value }))}
                            list="available-paths"
                          />
                          <datalist id="available-paths">
                            {availablePaths.map(path => (
                              <option key={path} value={path} />
                            ))}
                          </datalist>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="target-field" className="text-xs">Target Field</Label>
                        <Input
                          id="target-field"
                          placeholder="userName"
                          value={currentMapping.targetField || ''}
                          onChange={(e) => setCurrentMapping(prev => ({ ...prev, targetField: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="transform-type" className="text-xs">Transform Type</Label>
                      <Select
                        value={currentMapping.transformType}
                        onValueChange={(value: any) => setCurrentMapping(prev => ({ ...prev, transformType: value }))}
                      >
                        <SelectTrigger id="transform-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {transformTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label} - {type.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {showAdvanced && (
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          {(currentMapping.transformType === 'function' || currentMapping.transformType === 'computed') && (
                            <div>
                              <Label htmlFor="transform-function" className="text-xs">
                                Transform Function
                              </Label>
                              <Textarea
                                id="transform-function"
                                placeholder={
                                  currentMapping.transformType === 'function'
                                    ? 'return value.toUpperCase()'
                                    : 'return payload.field1 + payload.field2'
                                }
                                value={currentMapping.transformFunction || ''}
                                onChange={(e) => setCurrentMapping(prev => ({ ...prev, transformFunction: e.target.value }))}
                                className="font-mono text-xs"
                                rows={3}
                              />
                            </div>
                          )}

                          {currentMapping.transformType === 'conditional' && (
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label htmlFor="condition-field" className="text-xs">Condition Field</Label>
                                <Input
                                  id="condition-field"
                                  placeholder="status"
                                  value={currentMapping.condition?.field || ''}
                                  onChange={(e) => setCurrentMapping(prev => ({
                                    ...prev,
                                    condition: { ...prev.condition, field: e.target.value } as any
                                  }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="condition-operator" className="text-xs">Operator</Label>
                                <Select
                                  value={currentMapping.condition?.operator}
                                  onValueChange={(value: any) => setCurrentMapping(prev => ({
                                    ...prev,
                                    condition: { ...prev.condition, operator: value } as any
                                  }))}
                                >
                                  <SelectTrigger id="condition-operator">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {operators.map(op => (
                                      <SelectItem key={op.value} value={op.value}>
                                        {op.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="condition-value" className="text-xs">Value</Label>
                                <Input
                                  id="condition-value"
                                  placeholder="active"
                                  value={currentMapping.condition?.value || ''}
                                  onChange={(e) => setCurrentMapping(prev => ({
                                    ...prev,
                                    condition: { ...prev.condition, value: e.target.value } as any
                                  }))}
                                />
                              </div>
                            </div>
                          )}

                          <div>
                            <Label htmlFor="default-value" className="text-xs">Default Value (Optional)</Label>
                            <Input
                              id="default-value"
                              placeholder="null"
                              value={currentMapping.defaultValue || ''}
                              onChange={(e) => setCurrentMapping(prev => ({ ...prev, defaultValue: e.target.value }))}
                            />
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    <Button
                      onClick={addMapping}
                      className="w-full"
                      size="sm"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Mapping
                    </Button>
                  </CardContent>
                </Card>

                <ScrollArea className="h-[300px] border rounded-lg p-4">
                  {transform.mappings.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <ArrowsDownUp size={32} weight="thin" className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No mappings yet. Add your first mapping above.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {transform.mappings.map((mapping) => (
                        <motion.div
                          key={mapping.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:border-accent/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-xs font-mono text-primary">{mapping.sourcePath}</code>
                              <ArrowRight size={14} className="text-muted-foreground flex-shrink-0" />
                              <code className="text-xs font-mono text-accent">{mapping.targetField}</code>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {mapping.transformType}
                              </Badge>
                              {mapping.transformFunction && (
                                <Badge variant="secondary" className="text-xs">
                                  <FunctionIcon size={12} className="mr-1" />
                                  Function
                                </Badge>
                              )}
                              {mapping.condition && (
                                <Badge variant="secondary" className="text-xs">
                                  Conditional
                                </Badge>
                              )}
                              {mapping.defaultValue && (
                                <Badge variant="secondary" className="text-xs">
                                  Default: {String(mapping.defaultValue).slice(0, 10)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMapping(mapping.id)}
                            className="flex-shrink-0"
                          >
                            <Trash size={16} className="text-destructive" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <div>
              <Label htmlFor="test-payload">Test Payload (JSON)</Label>
              <Textarea
                id="test-payload"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="font-mono text-xs"
                rows={10}
              />
            </div>

            <Button onClick={testTransform} className="w-full">
              <Play size={16} className="mr-2" weight="fill" />
              Test Transform
            </Button>

            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label>Transform Result</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(testResult, null, 2))
                      toast.success('Result copied to clipboard')
                    }}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </motion.div>
            )}

            {transform.mappings.length === 0 && (
              <Alert>
                <Warning size={16} />
                <AlertDescription>
                  Add some mappings first to test the transformation
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Generated Transform Function</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generateCode())
                    toast.success('Code copied to clipboard')
                  }}
                >
                  <Copy size={16} className="mr-2" />
                  Copy
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
                {generateCode()}
              </pre>
            </div>

            <Alert>
              <Code size={16} />
              <AlertDescription>
                This code can be used in your webhook configuration or external services
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1">
            <Check size={16} className="mr-2" />
            Save Transform
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye size={16} className="mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Transform Preview</DialogTitle>
                <DialogDescription>
                  Summary of your payload transformation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Transform Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {transform.name || 'Unnamed'}</p>
                    <p><strong>Description:</strong> {transform.description || 'No description'}</p>
                    <p><strong>Mappings:</strong> {transform.mappings.length}</p>
                    <p><strong>Output Format:</strong> {transform.outputFormat}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Mappings</h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {transform.mappings.map(m => (
                        <div key={m.id} className="text-xs p-2 bg-muted rounded">
                          <code className="text-primary">{m.sourcePath}</code>
                          {' → '}
                          <code className="text-accent">{m.targetField}</code>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {m.transformType}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
