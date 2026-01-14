import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Database, GitBranch, Play, Clock, ArrowsLeftRight, Flask, BookOpen, Lightning, FileCode, Calendar } from '@phosphor-icons/react'
import { DatabaseConnection, MigrationConfig, FieldMapping, MigrationExecution } from '@/lib/types'
import { ConnectionManager } from '@/components/migration/ConnectionManager'
import { SchemaMapping } from '@/components/migration/SchemaMapping'
import { MigrationExecutor } from '@/components/migration/MigrationExecutor'
import { MigrationHistory } from '@/components/migration/MigrationHistory'
import { DataValidator } from '@/components/migration/DataValidator'
import { TemplateLibrary } from '@/components/migration/TemplateLibrary'
import { AutoMapper } from '@/components/migration/AutoMapper'
import { ScriptGenerator } from '@/components/migration/ScriptGenerator'
import { ScheduleMigration } from '@/components/migration/ScheduleMigration'
import { toast } from 'sonner'

function App() {
  const [connections, setConnections] = useKV<DatabaseConnection[]>('db-connections', [])
  const [executions, setExecutions] = useKV<MigrationExecution[]>('migration-executions', [])
  
  const [sourceConnection, setSourceConnection] = useState<DatabaseConnection | null>(null)
  const [destConnection, setDestConnection] = useState<DatabaseConnection | null>(null)
  const [mappings, setMappings] = useState<FieldMapping[]>([])
  const [currentTab, setCurrentTab] = useState('connections')
  const [configs, setConfigs] = useKV<MigrationConfig[]>('migration-configs', [])

  const currentConfig: MigrationConfig | null = (sourceConnection && destConnection && mappings.length > 0) ? {
    id: `config-${Date.now()}`,
    name: `${sourceConnection.name} → ${destConnection.name}`,
    description: `Migrate data from ${sourceConnection.name} to ${destConnection.name}`,
    sourceConnectionId: sourceConnection.id,
    destinationConnectionId: destConnection.id,
    mappings,
    options: {
      batchSize: 100,
      continueOnError: true,
      deleteExisting: false,
      validateData: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } : null

  const handleExecutionComplete = (execution: MigrationExecution) => {
    setExecutions((current) => [...(current || []), execution])
  }

  const handleRollback = (execution: MigrationExecution) => {
    setExecutions((current) =>
      (current || []).map((e) => 
        e.id === execution.id ? { ...e, status: 'rolled-back' as const } : e
      )
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-info to-accent flex items-center justify-center">
              <ArrowsLeftRight size={28} weight="bold" className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">DataFlow</h1>
              <p className="text-sm text-muted-foreground">
                Database Migration Tools
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 max-w-5xl">
            <TabsTrigger value="connections" className="gap-2">
              <Database size={16} />
              <span className="hidden sm:inline">Connections</span>
            </TabsTrigger>
            <TabsTrigger value="auto-mapper" className="gap-2">
              <Lightning size={16} />
              <span className="hidden sm:inline">Auto-Map</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <BookOpen size={16} />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="mapping" className="gap-2" disabled={!sourceConnection || !destConnection}>
              <GitBranch size={16} />
              <span className="hidden sm:inline">Mapping</span>
            </TabsTrigger>
            <TabsTrigger value="validator" className="gap-2">
              <Flask size={16} />
              <span className="hidden sm:inline">Validate</span>
            </TabsTrigger>
            <TabsTrigger value="execution" className="gap-2" disabled={!currentConfig}>
              <Play size={16} />
              <span className="hidden sm:inline">Execute</span>
            </TabsTrigger>
            <TabsTrigger value="scripts" className="gap-2">
              <FileCode size={16} />
              <span className="hidden sm:inline">Scripts</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar size={16} />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock size={16} />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-6">
            <ConnectionManager
              connections={connections || []}
              onConnectionsChange={setConnections}
              onSelectSource={setSourceConnection}
              onSelectDestination={setDestConnection}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Source Database</h3>
                {sourceConnection ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{sourceConnection.name}</h4>
                        <p className="text-sm text-muted-foreground font-mono">
                          {sourceConnection.type}
                        </p>
                      </div>
                      <button
                        className="text-xs text-destructive hover:underline"
                        onClick={() => setSourceConnection(null)}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database size={32} className="mx-auto mb-2 opacity-50" weight="duotone" />
                    <p className="text-sm">Select a source connection from above</p>
                  </div>
                )}
                {!sourceConnection && (connections || []).filter(c => c.status === 'connected').length > 0 && (
                  <div className="mt-4 space-y-2">
                    {(connections || []).filter(c => c.status === 'connected').map(conn => (
                      <button
                        key={conn.id}
                        className="w-full p-3 rounded-lg border border-border hover:border-accent transition-all text-left"
                        onClick={() => {
                          setSourceConnection(conn)
                          if (currentTab === 'connections') setCurrentTab('mapping')
                        }}
                      >
                        <div className="font-medium">{conn.name}</div>
                        <div className="text-xs text-muted-foreground">{conn.type}</div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Destination Database</h3>
                {destConnection ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{destConnection.name}</h4>
                        <p className="text-sm text-muted-foreground font-mono">
                          {destConnection.type}
                        </p>
                      </div>
                      <button
                        className="text-xs text-destructive hover:underline"
                        onClick={() => setDestConnection(null)}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database size={32} className="mx-auto mb-2 opacity-50" weight="duotone" />
                    <p className="text-sm">Select a destination connection from above</p>
                  </div>
                )}
                {!destConnection && (connections || []).filter(c => c.status === 'connected' && c.id !== sourceConnection?.id).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {(connections || []).filter(c => c.status === 'connected' && c.id !== sourceConnection?.id).map(conn => (
                      <button
                        key={conn.id}
                        className="w-full p-3 rounded-lg border border-border hover:border-accent transition-all text-left"
                        onClick={() => {
                          setDestConnection(conn)
                          if (currentTab === 'connections') setCurrentTab('mapping')
                        }}
                      >
                        <div className="font-medium">{conn.name}</div>
                        <div className="text-xs text-muted-foreground">{conn.type}</div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="auto-mapper">
            <AutoMapper
              sourceConnection={sourceConnection}
              destinationConnection={destConnection}
              onMappingsGenerated={(newMappings) => {
                setMappings(newMappings)
                toast.success('Auto-generated mappings applied')
                setCurrentTab('mapping')
              }}
            />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateLibrary
              onTemplateSelect={(template) => {
                toast.info(`Loading template: ${template.name}`)
                setCurrentTab('mapping')
              }}
              onSaveAsTemplate={(config) => {
                setConfigs((current) => [...(current || []), config])
              }}
            />
          </TabsContent>

          <TabsContent value="mapping">
            <SchemaMapping
              sourceConnection={sourceConnection}
              destinationConnection={destConnection}
              mappings={mappings}
              onMappingsChange={setMappings}
            />
          </TabsContent>

          <TabsContent value="validator">
            <DataValidator
              sourceConnection={sourceConnection}
              destinationConnection={destConnection}
              onValidationComplete={(hasErrors) => {
                if (!hasErrors) {
                  toast.success('Validation passed! Ready to execute')
                }
              }}
            />
          </TabsContent>

          <TabsContent value="execution">
            <MigrationExecutor
              config={currentConfig}
              onExecutionComplete={handleExecutionComplete}
            />
          </TabsContent>

          <TabsContent value="scripts">
            <ScriptGenerator config={currentConfig} />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleMigration configs={configs || []} />
          </TabsContent>

          <TabsContent value="history">
            <MigrationHistory
              executions={executions || []}
              onRollback={handleRollback}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
