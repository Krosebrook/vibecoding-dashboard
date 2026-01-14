import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { GitBranch, ArrowRight, Warning, CheckCircle, Plus, Trash } from '@phosphor-icons/react'
import { DatabaseConnection, SchemaTable, FieldMapping, DataTransformation, TransformationType } from '@/lib/types'
import { fetchSchema, validateMapping } from '@/lib/database-helpers'
import { toast } from 'sonner'

interface SchemaMappingProps {
  sourceConnection: DatabaseConnection | null
  destinationConnection: DatabaseConnection | null
  mappings: FieldMapping[]
  onMappingsChange: (mappings: FieldMapping[]) => void
}

export function SchemaMapping({ sourceConnection, destinationConnection, mappings, onMappingsChange }: SchemaMappingProps) {
  const [sourceSchema, setSourceSchema] = useState<SchemaTable[]>([])
  const [destSchema, setDestSchema] = useState<SchemaTable[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSourceTable, setSelectedSourceTable] = useState<string>('')
  const [selectedDestTable, setSelectedDestTable] = useState<string>('')
  const [editingMapping, setEditingMapping] = useState<FieldMapping | null>(null)
  const [transformDialogOpen, setTransformDialogOpen] = useState(false)

  useEffect(() => {
    loadSchemas()
  }, [sourceConnection, destinationConnection])

  const loadSchemas = async () => {
    if (!sourceConnection || !destinationConnection) return
    
    setLoading(true)
    try {
      const [source, dest] = await Promise.all([
        fetchSchema(sourceConnection),
        fetchSchema(destinationConnection),
      ])
      setSourceSchema(source)
      setDestSchema(dest)
      if (source.length > 0) setSelectedSourceTable(source[0].name)
      if (dest.length > 0) setSelectedDestTable(dest[0].name)
    } catch (error) {
      toast.error('Failed to load schemas')
    } finally {
      setLoading(false)
    }
  }

  const addMapping = (sourceTable: string, sourceField: string, sourceType: string, destTable: string, destField: string, destType: string) => {
    const validation = validateMapping(sourceField, destField, sourceType, destType)
    
    const newMapping: FieldMapping = {
      id: `mapping-${Date.now()}`,
      sourceTable,
      sourceField,
      destinationTable: destTable,
      destinationField: destField,
    }

    onMappingsChange([...mappings, newMapping])
    
    if (validation.warning) {
      toast.warning(validation.warning)
    } else {
      toast.success('Mapping added')
    }
  }

  const removeMapping = (id: string) => {
    onMappingsChange(mappings.filter(m => m.id !== id))
    toast.success('Mapping removed')
  }

  const updateMappingTransformation = (id: string, transformation: DataTransformation) => {
    onMappingsChange(mappings.map(m => m.id === id ? { ...m, transformation } : m))
    toast.success('Transformation updated')
  }

  const getSourceTable = () => sourceSchema.find(t => t.name === selectedSourceTable)
  const getDestTable = () => destSchema.find(t => t.name === selectedDestTable)

  const getMappedFields = () => {
    return mappings.filter(
      m => m.sourceTable === selectedSourceTable && m.destinationTable === selectedDestTable
    )
  }

  if (!sourceConnection || !destinationConnection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch size={20} weight="duotone" />
            Schema Mapping
          </CardTitle>
          <CardDescription>Map fields between source and destination databases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <GitBranch size={48} className="mx-auto mb-3 opacity-50" weight="duotone" />
            <p>Select both source and destination connections to begin mapping</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch size={20} weight="duotone" />
          Schema Mapping
        </CardTitle>
        <CardDescription>
          Map fields from {sourceConnection.name} to {destinationConnection.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground mt-3">Loading schemas...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Table</Label>
                <Select value={selectedSourceTable} onValueChange={setSelectedSourceTable}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceSchema.map(table => (
                      <SelectItem key={table.name} value={table.name}>
                        {table.name} ({table.recordCount?.toLocaleString()} records)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destination Table</Label>
                <Select value={selectedDestTable} onValueChange={setSelectedDestTable}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {destSchema.map(table => (
                      <SelectItem key={table.name} value={table.name}>
                        {table.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Source Fields</h4>
                  <Badge variant="outline">{getSourceTable()?.fields.length} fields</Badge>
                </div>
                <ScrollArea className="h-[400px] border rounded-lg">
                  <div className="p-3 space-y-1">
                    {getSourceTable()?.fields.map(field => {
                      const isMapped = getMappedFields().some(m => m.sourceField === field.name)
                      return (
                        <div
                          key={field.name}
                          className={`p-3 rounded-lg border transition-all ${
                            isMapped ? 'bg-accent/10 border-accent' : 'bg-card border-border hover:border-accent/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{field.name}</span>
                                {field.isPrimaryKey && (
                                  <Badge variant="secondary" className="text-xs">PK</Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {field.type} {field.nullable && '(nullable)'}
                              </div>
                            </div>
                            {isMapped && (
                              <CheckCircle size={16} className="text-accent flex-shrink-0" weight="fill" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Destination Fields</h4>
                  <Badge variant="outline">{getDestTable()?.fields.length} fields</Badge>
                </div>
                <ScrollArea className="h-[400px] border rounded-lg">
                  <div className="p-3 space-y-1">
                    {getDestTable()?.fields.map(field => {
                      const mapping = getMappedFields().find(m => m.destinationField === field.name)
                      const sourceField = mapping ? getSourceTable()?.fields.find(f => f.name === mapping.sourceField) : null
                      
                      return (
                        <div
                          key={field.name}
                          className={`p-3 rounded-lg border transition-all ${
                            mapping ? 'bg-accent/10 border-accent' : 'bg-card border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{field.name}</span>
                                {field.isPrimaryKey && (
                                  <Badge variant="secondary" className="text-xs">PK</Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {field.type} {field.nullable && '(nullable)'}
                              </div>
                              {mapping && sourceField && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-accent">
                                  <ArrowRight size={12} weight="bold" />
                                  <span className="font-mono">{sourceField.name}</span>
                                  {mapping.transformation && (
                                    <Badge variant="outline" className="text-xs ml-1">
                                      {mapping.transformation.type}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {!mapping && sourceField && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const sf = getSourceTable()?.fields.find(f => !getMappedFields().some(m => m.sourceField === f.name))
                                    if (sf) {
                                      addMapping(selectedSourceTable, sf.name, sf.type, selectedDestTable, field.name, field.type)
                                    }
                                  }}
                                >
                                  <Plus size={14} />
                                </Button>
                              )}
                              {mapping && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingMapping(mapping)
                                      setTransformDialogOpen(true)
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeMapping(mapping.id)}
                                  >
                                    <Trash size={14} />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-accent" weight="fill" />
                <span className="text-sm">
                  <strong>{getMappedFields().length}</strong> field mappings configured
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const unmappedSource = getSourceTable()?.fields.filter(f => !getMappedFields().some(m => m.sourceField === f.name)) || []
                  const unmappedDest = getDestTable()?.fields.filter(f => !getMappedFields().some(m => m.destinationField === f.name)) || []
                  
                  const autoMappings: FieldMapping[] = []
                  unmappedSource.forEach(sourceField => {
                    const matchingDest = unmappedDest.find(df => df.name.toLowerCase() === sourceField.name.toLowerCase())
                    if (matchingDest) {
                      autoMappings.push({
                        id: `mapping-${Date.now()}-${sourceField.name}`,
                        sourceTable: selectedSourceTable,
                        sourceField: sourceField.name,
                        destinationTable: selectedDestTable,
                        destinationField: matchingDest.name,
                      })
                    }
                  })
                  
                  if (autoMappings.length > 0) {
                    onMappingsChange([...mappings, ...autoMappings])
                    toast.success(`Auto-mapped ${autoMappings.length} fields`)
                  } else {
                    toast.info('No matching fields found for auto-mapping')
                  }
                }}
              >
                Auto-Map Matching Fields
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={transformDialogOpen} onOpenChange={setTransformDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transformation</DialogTitle>
            <DialogDescription>
              Configure data transformation for this field mapping
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transformation Type</Label>
              <Select
                value={editingMapping?.transformation?.type || 'none'}
                onValueChange={(value) => {
                  if (editingMapping) {
                    updateMappingTransformation(editingMapping.id, {
                      type: value as TransformationType,
                      config: {},
                    })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="type-conversion">Type Conversion</SelectItem>
                  <SelectItem value="value-mapping">Value Mapping</SelectItem>
                  <SelectItem value="date-format">Date Format</SelectItem>
                  <SelectItem value="case-transform">Case Transform</SelectItem>
                  <SelectItem value="concatenate">Concatenate</SelectItem>
                  <SelectItem value="split">Split</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
