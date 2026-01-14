import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database, Plus, Trash, Code, BookOpen, Play, Check, Warning, Copy } from '@phosphor-icons/react'
import { DatabaseConnector, DatabaseType, databaseTemplates, generateConnectionCode, generateSetupInstructions, generateSampleData, validateDatabaseConfig, SavedQuery } from '@/lib/database-connectors'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function DatabaseConnectorManager() {
  const [connectors, setConnectors] = useKV<DatabaseConnector[]>('database-connectors', [])
  const [selectedConnector, setSelectedConnector] = useState<DatabaseConnector | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [testingQuery, setTestingQuery] = useState<string | null>(null)
  const [queryResults, setQueryResults] = useState<any[] | null>(null)
  const [activeTab, setActiveTab] = useState<string>('list')

  const handleCreateConnector = (type: DatabaseType) => {
    const template = { ...databaseTemplates[type] }
    template.id = `${type}-${Date.now()}`
    setSelectedConnector(template)
    setIsCreating(true)
    setActiveTab('configure')
  }

  const handleSaveConnector = () => {
    if (!selectedConnector) return

    const validation = validateDatabaseConfig(selectedConnector.config)
    if (!validation.valid) {
      toast.error(validation.errors.join(', '))
      return
    }

    setConnectors((current = []) => {
      const existing = current.find((c) => c.id === selectedConnector.id)
      if (existing) {
        return current.map((c) => (c.id === selectedConnector.id ? selectedConnector : c))
      }
      return [...current, selectedConnector]
    })

    toast.success(`${selectedConnector.name} connector saved!`)
    setIsCreating(false)
  }

  const handleDeleteConnector = (id: string) => {
    setConnectors((current = []) => current.filter((c) => c.id !== id))
    if (selectedConnector?.id === id) {
      setSelectedConnector(null)
    }
    toast.success('Connector deleted')
  }

  const handleTestQuery = (query: SavedQuery) => {
    setTestingQuery(query.id)
    
    setTimeout(() => {
      const sampleData = generateSampleData(selectedConnector!.type)
      setQueryResults(sampleData)
      setTestingQuery(null)
      toast.success(`Query executed successfully! ${sampleData.length} rows returned`)
    }, 800)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard!')
  }

  const updateConnectorConfig = (field: string, value: any) => {
    if (!selectedConnector) return
    setSelectedConnector({
      ...selectedConnector,
      config: {
        ...selectedConnector.config,
        [field]: value,
      },
    })
  }

  const updateConnectorField = (field: string, value: any) => {
    if (!selectedConnector) return
    setSelectedConnector({
      ...selectedConnector,
      [field]: value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={20} weight="duotone" className="text-primary" />
          Database Connectors
        </CardTitle>
        <CardDescription>
          Configure PostgreSQL, MySQL, and MongoDB connections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">Connectors</TabsTrigger>
            <TabsTrigger value="configure" disabled={!selectedConnector}>Configure</TabsTrigger>
            <TabsTrigger value="queries" disabled={!selectedConnector}>Queries</TabsTrigger>
            <TabsTrigger value="code" disabled={!selectedConnector}>Code</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => handleCreateConnector('postgresql')}
              >
                <span className="text-4xl">🐘</span>
                <span className="font-semibold">PostgreSQL</span>
                <span className="text-xs text-muted-foreground">Advanced SQL</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => handleCreateConnector('mysql')}
              >
                <span className="text-4xl">🐬</span>
                <span className="font-semibold">MySQL</span>
                <span className="text-xs text-muted-foreground">Popular SQL</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => handleCreateConnector('mongodb')}
              >
                <span className="text-4xl">🍃</span>
                <span className="font-semibold">MongoDB</span>
                <span className="text-xs text-muted-foreground">NoSQL</span>
              </Button>
            </div>

            {connectors && connectors.length > 0 && (
              <div className="space-y-2 pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Saved Connectors</h3>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {connectors.map((connector) => (
                      <motion.div
                        key={connector.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        <div
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            selectedConnector?.id === connector.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            setSelectedConnector(connector)
                            setIsCreating(false)
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-2xl flex-shrink-0">{connector.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{connector.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {connector.config.host}:{connector.config.port}/{connector.config.database}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteConnector(connector.id)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {(!connectors || connectors.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Database size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">No database connectors configured yet.</p>
                <p className="text-xs mt-1">Click a database type above to get started.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="configure" className="space-y-4">
            {selectedConnector && (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-3xl">{selectedConnector.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{selectedConnector.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedConnector.description}</div>
                    </div>
                    <Badge>{selectedConnector.type}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="connector-name">Connection Name</Label>
                      <Input
                        id="connector-name"
                        value={selectedConnector.name}
                        onChange={(e) => updateConnectorField('name', e.target.value)}
                        placeholder="My Database Connection"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="host">Host</Label>
                        <Input
                          id="host"
                          value={selectedConnector.config.host}
                          onChange={(e) => updateConnectorConfig('host', e.target.value)}
                          placeholder="localhost"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input
                          id="port"
                          type="number"
                          value={selectedConnector.config.port}
                          onChange={(e) => updateConnectorConfig('port', parseInt(e.target.value) || 0)}
                          placeholder="5432"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="database">Database Name</Label>
                      <Input
                        id="database"
                        value={selectedConnector.config.database}
                        onChange={(e) => updateConnectorConfig('database', e.target.value)}
                        placeholder="mydb"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={selectedConnector.config.username}
                          onChange={(e) => updateConnectorConfig('username', e.target.value)}
                          placeholder="postgres"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={selectedConnector.config.password}
                          onChange={(e) => updateConnectorConfig('password', e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    {selectedConnector.type === 'mongodb' && (
                      <div className="space-y-2">
                        <Label htmlFor="connection-string">Connection String (Optional)</Label>
                        <Input
                          id="connection-string"
                          value={selectedConnector.config.connectionString || ''}
                          onChange={(e) => updateConnectorConfig('connectionString', e.target.value)}
                          placeholder="mongodb://localhost:27017/mydb"
                        />
                        <p className="text-xs text-muted-foreground">
                          If provided, this will override individual connection settings
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="ssl">Enable SSL/TLS</Label>
                        <p className="text-xs text-muted-foreground">Use encrypted connection</p>
                      </div>
                      <Switch
                        id="ssl"
                        checked={selectedConnector.config.ssl}
                        onCheckedChange={(checked) => updateConnectorConfig('ssl', checked)}
                      />
                    </div>

                    <div className="pt-4 flex gap-2">
                      <Button onClick={handleSaveConnector} className="flex-1">
                        <Check size={16} className="mr-2" />
                        Save Connector
                      </Button>
                      {!isCreating && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedConnector(null)
                            setActiveTab('list')
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="queries" className="space-y-4">
            {selectedConnector && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Sample Queries</h3>
                    <p className="text-xs text-muted-foreground">
                      Test queries with sample data
                    </p>
                  </div>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {selectedConnector.queries?.map((query) => (
                      <Card key={query.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{query.name}</CardTitle>
                              <CardDescription className="text-xs">{query.description}</CardDescription>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleTestQuery(query)}
                              disabled={testingQuery === query.id}
                            >
                              {testingQuery === query.id ? (
                                <>
                                  <div className="animate-spin mr-2 h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full" />
                                  Running...
                                </>
                              ) : (
                                <>
                                  <Play size={14} className="mr-1" />
                                  Test
                                </>
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="bg-muted p-3 rounded-lg">
                            <pre className="text-xs font-mono whitespace-pre-wrap">{query.query}</pre>
                          </div>
                          {query.parameters && query.parameters.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-xs">Parameters:</Label>
                              <div className="flex flex-wrap gap-2">
                                {query.parameters.map((param) => (
                                  <Badge key={param.name} variant="outline">
                                    {param.name}: {param.type}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                {queryResults && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">Query Results</h4>
                      <Badge variant="secondary">{queryResults.length} rows</Badge>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <pre className="text-xs font-mono bg-muted p-3 rounded-lg">
                        {JSON.stringify(queryResults, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            {selectedConnector && (
              <Tabs defaultValue="connection">
                <TabsList>
                  <TabsTrigger value="connection">Connection Code</TabsTrigger>
                  <TabsTrigger value="setup">Setup Guide</TabsTrigger>
                </TabsList>
                <TabsContent value="connection" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Connection Code</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(generateConnectionCode(selectedConnector))}
                    >
                      <Copy size={14} className="mr-1" />
                      Copy
                    </Button>
                  </div>
                  <ScrollArea className="h-[450px]">
                    <pre className="text-xs font-mono bg-muted p-4 rounded-lg whitespace-pre-wrap">
                      {generateConnectionCode(selectedConnector)}
                    </pre>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="setup" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Setup Instructions</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(generateSetupInstructions(selectedConnector))}
                    >
                      <Copy size={14} className="mr-1" />
                      Copy
                    </Button>
                  </div>
                  <ScrollArea className="h-[450px]">
                    <div className="prose prose-sm prose-invert max-w-none">
                      <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-lg">
                        {generateSetupInstructions(selectedConnector)}
                      </pre>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
