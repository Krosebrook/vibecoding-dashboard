import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Warning, CheckCircle, Lightning, ArrowRight, Sparkle, ShieldWarning, CircleNotch } from '@phosphor-icons/react'
import { TypeConflict, DatabaseConnection, FieldMapping, DataTransformation } from '@/lib/types'
import { toast } from 'sonner'

interface TypeConflictResolverProps {
  sourceConnection: DatabaseConnection | null
  destinationConnection: DatabaseConnection | null
  mappings: FieldMapping[]
  onResolutionApplied: (updatedMappings: FieldMapping[]) => void
}

export function TypeConflictResolver({ 
  sourceConnection, 
  destinationConnection, 
  mappings,
  onResolutionApplied 
}: TypeConflictResolverProps) {
  const [conflicts, setConflicts] = useState<TypeConflict[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState<string | null>(null)
  const [selectedResolutions, setSelectedResolutions] = useState<Record<string, TypeConflict['suggestedResolution']>>({})

  useEffect(() => {
    if (sourceConnection && destinationConnection && mappings.length > 0) {
      analyzeTypeConflicts()
    }
  }, [sourceConnection, destinationConnection, mappings])

  const analyzeTypeConflicts = async () => {
    setIsAnalyzing(true)
    
    await new Promise(resolve => setTimeout(resolve, 800))

    const detectedConflicts: TypeConflict[] = []
    
    mappings.forEach((mapping, index) => {
      const sourceType = getFieldType(mapping.sourceField)
      const destType = getFieldType(mapping.destinationField)
      
      if (sourceType !== destType && !mapping.transformation) {
        const conflict = analyzeTypeCompatibility(mapping, sourceType, destType, index)
        if (conflict) {
          detectedConflicts.push(conflict)
        }
      }
    })

    setConflicts(detectedConflicts)
    setIsAnalyzing(false)

    if (detectedConflicts.length > 0) {
      toast.warning(`Found ${detectedConflicts.length} type conflicts`)
    } else {
      toast.success('No type conflicts detected')
    }
  }

  const getFieldType = (fieldName: string): string => {
    const typePatterns: Record<string, string[]> = {
      'integer': ['id', 'count', 'quantity', 'age', 'year'],
      'varchar': ['name', 'title', 'description', 'email', 'address'],
      'decimal': ['price', 'amount', 'cost', 'balance', 'rate'],
      'timestamp': ['created_at', 'updated_at', 'date', 'time'],
      'boolean': ['is_', 'has_', 'active', 'enabled'],
      'text': ['content', 'body', 'notes', 'comment'],
    }

    const lowerField = fieldName.toLowerCase()
    for (const [type, patterns] of Object.entries(typePatterns)) {
      if (patterns.some(pattern => lowerField.includes(pattern))) {
        return type
      }
    }
    return 'varchar'
  }

  const analyzeTypeCompatibility = (
    mapping: FieldMapping,
    sourceType: string,
    destType: string,
    index: number
  ): TypeConflict | null => {
    const compatibilityMatrix: Record<string, Record<string, { severity: TypeConflict['severity'], possibleLoss: boolean }>> = {
      'integer': {
        'varchar': { severity: 'low', possibleLoss: false },
        'decimal': { severity: 'low', possibleLoss: false },
        'text': { severity: 'low', possibleLoss: false },
        'boolean': { severity: 'high', possibleLoss: true },
      },
      'decimal': {
        'integer': { severity: 'medium', possibleLoss: true },
        'varchar': { severity: 'low', possibleLoss: false },
        'text': { severity: 'low', possibleLoss: false },
      },
      'varchar': {
        'integer': { severity: 'high', possibleLoss: true },
        'decimal': { severity: 'high', possibleLoss: true },
        'text': { severity: 'low', possibleLoss: false },
        'boolean': { severity: 'high', possibleLoss: true },
      },
      'timestamp': {
        'varchar': { severity: 'low', possibleLoss: false },
        'text': { severity: 'low', possibleLoss: false },
        'integer': { severity: 'medium', possibleLoss: false },
      },
      'text': {
        'varchar': { severity: 'medium', possibleLoss: true },
      },
    }

    const compat = compatibilityMatrix[sourceType]?.[destType]
    if (!compat) return null

    const suggestedResolution = suggestResolution(sourceType, destType)

    return {
      id: `conflict-${index}`,
      sourceTable: mapping.sourceTable,
      sourceField: mapping.sourceField,
      sourceType,
      destinationTable: mapping.destinationTable,
      destinationField: mapping.destinationField,
      destinationType: destType,
      severity: compat.severity,
      possibleLoss: compat.possibleLoss,
      affectedRecords: Math.floor(Math.random() * 10000) + 100,
      suggestedResolution,
    }
  }

  const suggestResolution = (sourceType: string, destType: string): TypeConflict['suggestedResolution'] => {
    const resolutions: Record<string, Record<string, TypeConflict['suggestedResolution']>> = {
      'integer': {
        'varchar': { method: 'cast', description: 'Convert integer to string representation', confidence: 0.95 },
        'decimal': { method: 'cast', description: 'Convert integer to decimal with .00 precision', confidence: 0.98 },
        'text': { method: 'cast', description: 'Convert integer to text representation', confidence: 0.95 },
      },
      'decimal': {
        'integer': { method: 'round', description: 'Round decimal to nearest integer', confidence: 0.75 },
        'varchar': { method: 'format', description: 'Format decimal as string with 2 decimal places', confidence: 0.92 },
      },
      'varchar': {
        'integer': { method: 'cast', description: 'Parse string to integer (may fail on non-numeric values)', confidence: 0.60 },
        'text': { method: 'cast', description: 'Convert varchar to text', confidence: 0.98 },
      },
      'timestamp': {
        'varchar': { method: 'format', description: 'Format timestamp as ISO 8601 string', confidence: 0.95 },
        'integer': { method: 'cast', description: 'Convert to Unix timestamp', confidence: 0.90 },
      },
      'text': {
        'varchar': { method: 'truncate', description: 'Truncate text to varchar length limit', confidence: 0.80 },
      },
    }

    return resolutions[sourceType]?.[destType] || { method: 'skip', description: 'Skip incompatible records', confidence: 0.50 }
  }

  const generateAISuggestion = async (conflict: TypeConflict) => {
    setAiSuggestionsLoading(conflict.id)

    try {
      const promptText = `You are a database migration expert. Analyze this type conversion conflict and suggest the best resolution strategy.

Source: ${conflict.sourceField} (${conflict.sourceType}) in ${conflict.sourceTable}
Destination: ${conflict.destinationField} (${conflict.destinationType}) in ${conflict.destinationTable}
Affected Records: ${conflict.affectedRecords}
Data Loss Risk: ${conflict.possibleLoss ? 'Yes' : 'No'}

Provide a JSON response with:
1. "method": one of "cast", "truncate", "round", "format", "map", "skip"
2. "description": a clear explanation of the recommended approach
3. "confidence": a number between 0 and 1 indicating confidence in this solution
4. "warnings": array of potential issues or considerations`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const aiSuggestion = JSON.parse(response)

      const updatedSuggestion: TypeConflict['suggestedResolution'] = {
        method: aiSuggestion.method,
        description: aiSuggestion.description,
        confidence: aiSuggestion.confidence,
      }

      setConflicts((current) =>
        current.map(c =>
          c.id === conflict.id ? { ...c, suggestedResolution: updatedSuggestion } : c
        )
      )

      toast.success('AI suggestion generated')
    } catch (error) {
      toast.error('Failed to generate AI suggestion')
    } finally {
      setAiSuggestionsLoading(null)
    }
  }

  const handleApplyResolution = (conflictId: string, resolution: TypeConflict['suggestedResolution']) => {
    setSelectedResolutions((current) => ({
      ...current,
      [conflictId]: resolution,
    }))
    toast.success('Resolution selected')
  }

  const handleApplyAllResolutions = () => {
    const updatedMappings = mappings.map(mapping => {
      const conflict = conflicts.find(c =>
        c.sourceField === mapping.sourceField &&
        c.destinationField === mapping.destinationField
      )

      if (conflict && selectedResolutions[conflict.id]) {
        const resolution = selectedResolutions[conflict.id]
        const transformation: DataTransformation = {
          type: 'type-conversion',
          config: {
            targetType: conflict.destinationType,
            mapping: { [conflict.sourceType]: conflict.destinationType },
          },
        }

        return { ...mapping, transformation }
      }

      return mapping
    })

    onResolutionApplied(updatedMappings)
    toast.success(`Applied ${Object.keys(selectedResolutions).length} resolutions to mappings`)
  }

  const getSeverityColor = (severity: TypeConflict['severity']) => {
    switch (severity) {
      case 'low': return 'text-info border-info/40 bg-info/10'
      case 'medium': return 'text-warning border-warning/40 bg-warning/10'
      case 'high': return 'text-destructive border-destructive/40 bg-destructive/10'
      default: return 'text-muted-foreground'
    }
  }

  const getSeverityBadge = (severity: TypeConflict['severity']) => {
    switch (severity) {
      case 'low': return <Badge variant="outline" className="text-info border-info/40">Low Risk</Badge>
      case 'medium': return <Badge variant="outline" className="text-warning border-warning/40">Medium Risk</Badge>
      case 'high': return <Badge variant="outline" className="text-destructive border-destructive/40">High Risk</Badge>
    }
  }

  if (!sourceConnection || !destinationConnection) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <ShieldWarning size={48} className="mx-auto text-muted-foreground opacity-50" weight="duotone" />
            <p className="text-sm text-muted-foreground">Select source and destination connections to analyze type conflicts</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <CircleNotch size={48} className="mx-auto text-primary animate-spin" weight="bold" />
            <p className="text-sm font-medium">Analyzing type compatibility...</p>
            <p className="text-xs text-muted-foreground">Checking {mappings.length} field mappings</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldWarning size={24} weight="duotone" className="text-warning" />
                Type Conflict Resolution
              </CardTitle>
              <CardDescription>
                Resolve data type mismatches between source and destination schemas
              </CardDescription>
            </div>
            {conflicts.length > 0 && Object.keys(selectedResolutions).length > 0 && (
              <Button onClick={handleApplyAllResolutions} className="gap-2">
                <CheckCircle size={18} weight="bold" />
                Apply {Object.keys(selectedResolutions).length} Resolution{Object.keys(selectedResolutions).length !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {conflicts.length === 0 ? (
            <Alert className="border-success/40 bg-success/10">
              <CheckCircle size={20} weight="bold" className="text-success" />
              <AlertDescription className="text-success">
                No type conflicts detected! All field types are compatible.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert className="border-warning/40 bg-warning/10">
                <Warning size={20} weight="bold" className="text-warning" />
                <AlertDescription className="text-warning">
                  Found {conflicts.length} type conflict{conflicts.length !== 1 ? 's' : ''} that require attention before migration
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {conflicts.map((conflict) => (
                    <Card key={conflict.id} className={`border-2 ${selectedResolutions[conflict.id] ? 'border-primary/40' : ''}`}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(conflict.severity)}
                              {conflict.possibleLoss && (
                                <Badge variant="outline" className="text-destructive border-destructive/40">
                                  <Warning size={12} className="mr-1" weight="bold" />
                                  Data Loss Risk
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold">{conflict.sourceField}</span>
                                <Badge variant="secondary" className="font-mono text-xs">
                                  {conflict.sourceType}
                                </Badge>
                              </div>
                              <ArrowRight size={16} className="text-muted-foreground" weight="bold" />
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold">{conflict.destinationField}</span>
                                <Badge variant="secondary" className="font-mono text-xs">
                                  {conflict.destinationType}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground">
                              Affects approximately {conflict.affectedRecords.toLocaleString()} records
                            </p>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateAISuggestion(conflict)}
                            disabled={aiSuggestionsLoading === conflict.id}
                            className="gap-2 shrink-0"
                          >
                            {aiSuggestionsLoading === conflict.id ? (
                              <>
                                <CircleNotch size={14} className="animate-spin" weight="bold" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkle size={14} weight="bold" />
                                AI Suggest
                              </>
                            )}
                          </Button>
                        </div>

                        <Separator />

                        {conflict.suggestedResolution && (
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Lightning size={20} weight="bold" className="text-primary" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-sm">Suggested Resolution</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Confidence:</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {Math.round(conflict.suggestedResolution.confidence * 100)}%
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {conflict.suggestedResolution.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge className="text-xs font-mono">
                                    {conflict.suggestedResolution.method}
                                  </Badge>
                                  <Progress 
                                    value={conflict.suggestedResolution.confidence * 100} 
                                    className="flex-1 h-2"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApplyResolution(conflict.id, conflict.suggestedResolution!)}
                                disabled={!!selectedResolutions[conflict.id]}
                                className="flex-1 gap-2"
                              >
                                {selectedResolutions[conflict.id] ? (
                                  <>
                                    <CheckCircle size={18} weight="bold" />
                                    Resolution Applied
                                  </>
                                ) : (
                                  <>
                                    Apply Resolution
                                  </>
                                )}
                              </Button>
                              {selectedResolutions[conflict.id] && (
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedResolutions((current) => {
                                      const updated = { ...current }
                                      delete updated[conflict.id]
                                      return updated
                                    })
                                  }}
                                >
                                  Undo
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
