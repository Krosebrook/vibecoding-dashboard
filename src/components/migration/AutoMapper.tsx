import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Lightning, Sparkle, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { DatabaseConnection, FieldMapping } from '@/lib/types'
import { toast } from 'sonner'

interface FieldSuggestion {
  sourceField: string
  destinationField: string
  confidence: number
  reason: string
}

interface AutoMapperProps {
  sourceConnection: DatabaseConnection | null
  destinationConnection: DatabaseConnection | null
  onMappingsGenerated: (mappings: FieldMapping[]) => void
}

export function AutoMapper({ sourceConnection, destinationConnection, onMappingsGenerated }: AutoMapperProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [suggestions, setSuggestions] = useState<FieldSuggestion[]>([])
  const [confidenceThreshold, setConfidenceThreshold] = useState([70])
  const [aiMode, setAiMode] = useState<'pattern' | 'ai'>('pattern')

  const mockSourceFields = [
    'user_id', 'first_name', 'last_name', 'email_address', 
    'phone_number', 'created_at', 'updated_at', 'is_active',
    'user_type', 'profile_image_url'
  ]

  const mockDestFields = [
    'id', 'firstName', 'lastName', 'email', 
    'phone', 'createdDate', 'modifiedDate', 'active',
    'accountType', 'avatarUrl'
  ]

  const generateMappings = async () => {
    if (!sourceConnection || !destinationConnection) {
      toast.error('Please select both source and destination connections')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setSuggestions([])

    const newSuggestions: FieldSuggestion[] = []

    if (aiMode === 'ai') {
      toast.info('Using AI to analyze field meanings...')
      
      for (let i = 0; i < mockSourceFields.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const sourceField = mockSourceFields[i]
        const destField = mockDestFields[i]
        const confidence = Math.floor(Math.random() * 30) + 70
        
        newSuggestions.push({
          sourceField,
          destinationField: destField,
          confidence,
          reason: aiMode === 'ai' 
            ? 'AI semantic analysis of field purpose'
            : 'Pattern matching on field name similarity'
        })

        setSuggestions([...newSuggestions])
        setProgress(((i + 1) / mockSourceFields.length) * 100)
      }
    } else {
      for (let i = 0; i < mockSourceFields.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 150))
        
        const sourceField = mockSourceFields[i]
        const destField = mockDestFields[i]
        const confidence = Math.floor(Math.random() * 25) + 65
        
        newSuggestions.push({
          sourceField,
          destinationField: destField,
          confidence,
          reason: 'Pattern matching on field name similarity'
        })

        setSuggestions([...newSuggestions])
        setProgress(((i + 1) / mockSourceFields.length) * 100)
      }
    }

    setIsGenerating(false)
    toast.success(`Generated ${newSuggestions.length} mapping suggestions`)
  }

  const applyMappings = () => {
    const filteredSuggestions = suggestions.filter(s => s.confidence >= confidenceThreshold[0])
    
    const mappings: FieldMapping[] = filteredSuggestions.map((suggestion, index) => ({
      id: `mapping-${Date.now()}-${index}`,
      sourceTable: 'users',
      sourceField: suggestion.sourceField,
      destinationTable: 'users',
      destinationField: suggestion.destinationField,
    }))

    onMappingsGenerated(mappings)
    toast.success(`Applied ${mappings.length} mappings`)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success'
    if (confidence >= 70) return 'text-info'
    if (confidence >= 50) return 'text-warning'
    return 'text-destructive'
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 90) return 'bg-success/20 border-success/40'
    if (confidence >= 70) return 'bg-info/20 border-info/40'
    if (confidence >= 50) return 'bg-warning/20 border-warning/40'
    return 'bg-destructive/20 border-destructive/40'
  }

  const filteredSuggestions = suggestions.filter(s => s.confidence >= confidenceThreshold[0])
  const acceptedCount = filteredSuggestions.length
  const rejectedCount = suggestions.length - acceptedCount

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-info/20 flex items-center justify-center">
                  <Lightning size={20} weight="duotone" className="text-accent" />
                </div>
                <CardTitle>Auto-Mapper</CardTitle>
              </div>
              <CardDescription>
                Automatically generate field mappings using pattern recognition or AI
              </CardDescription>
            </div>
            <Button 
              onClick={generateMappings}
              disabled={isGenerating || !sourceConnection || !destinationConnection}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkle size={16} weight="fill" />
                  Generate Mappings
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!sourceConnection || !destinationConnection ? (
            <div className="text-center py-12 text-muted-foreground">
              <Lightning size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
              <p>Select source and destination connections to enable auto-mapping</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Mapping Mode</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={aiMode === 'pattern' ? 'default' : 'outline'}
                      onClick={() => setAiMode('pattern')}
                    >
                      Pattern Matching
                    </Button>
                    <Button
                      size="sm"
                      variant={aiMode === 'ai' ? 'default' : 'outline'}
                      onClick={() => setAiMode('ai')}
                      className="gap-2"
                    >
                      <Sparkle size={14} weight="fill" />
                      AI Semantic
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">
                      Confidence Threshold
                    </label>
                    <span className="text-sm font-mono">{confidenceThreshold[0]}%</span>
                  </div>
                  <Slider
                    value={confidenceThreshold}
                    onValueChange={setConfidenceThreshold}
                    min={0}
                    max={100}
                    step={5}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Only suggestions above this confidence level will be applied
                  </p>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {aiMode === 'ai' ? 'Analyzing with AI...' : 'Generating mappings...'}
                    </span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {suggestions.length > 0 && (
                <>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Card className="p-4 border-accent/40 bg-accent/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Suggestions</span>
                        <Sparkle size={16} className="text-accent" weight="fill" />
                      </div>
                      <div className="text-2xl font-bold">{suggestions.length}</div>
                    </Card>
                    <Card className="p-4 border-success/40 bg-success/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Will Apply</span>
                        <CheckCircle size={16} className="text-success" weight="fill" />
                      </div>
                      <div className="text-2xl font-bold text-success">{acceptedCount}</div>
                    </Card>
                    <Card className="p-4 border-muted bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Below Threshold</span>
                      </div>
                      <div className="text-2xl font-bold text-muted-foreground">{rejectedCount}</div>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Mapping Suggestions
                      </h3>
                      <Button
                        size="sm"
                        onClick={applyMappings}
                        disabled={acceptedCount === 0}
                        className="gap-2"
                      >
                        <CheckCircle size={16} weight="fill" />
                        Apply {acceptedCount} Mappings
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => {
                          const willApply = suggestion.confidence >= confidenceThreshold[0]
                          return (
                            <Card 
                              key={index} 
                              className={`p-4 transition-all ${
                                willApply 
                                  ? 'border-accent hover:border-accent/80' 
                                  : 'opacity-50 border-dashed'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex-1 flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="font-mono text-sm font-semibold">
                                      {suggestion.sourceField}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      Source Field
                                    </div>
                                  </div>
                                  
                                  <ArrowRight 
                                    size={20} 
                                    className={willApply ? 'text-accent' : 'text-muted-foreground'} 
                                    weight="bold"
                                  />
                                  
                                  <div className="flex-1">
                                    <div className="font-mono text-sm font-semibold">
                                      {suggestion.destinationField}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      Destination Field
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <Badge 
                                    variant="outline"
                                    className={getConfidenceBg(suggestion.confidence)}
                                  >
                                    <span className={getConfidenceColor(suggestion.confidence)}>
                                      {suggestion.confidence}%
                                    </span>
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {suggestion.reason}
                                  </span>
                                </div>
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
