import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Database, 
  Play, 
  Check, 
  Warning, 
  Plus, 
  CloudArrowDown,
  Code,
  ArrowsClockwise,
  Trash,
  Copy
} from '@phosphor-icons/react'
import { 
  DataConnector, 
  publicApiConnectors, 
  dataConnectorService,
  ConnectorExecutionResult 
} from '@/lib/data-connectors'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function DataConnectorManager() {
  const [customConnectors, setCustomConnectors] = useKV<DataConnector[]>('custom-connectors', [])
  const [selectedConnector, setSelectedConnector] = useState<DataConnector | null>(null)
  const [testResult, setTestResult] = useState<ConnectorExecutionResult | null>(null)
  const [isTestingConnector, setIsTestingConnector] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingConnector, setEditingConnector] = useState<Partial<DataConnector> | null>(null)

  const allConnectors = [...publicApiConnectors, ...(customConnectors || [])]

  const handleTestConnector = async (connector: DataConnector) => {
    setIsTestingConnector(true)
    setSelectedConnector(connector)
    setTestResult(null)

    try {
      const result = await dataConnectorService.executeConnector(connector)
      setTestResult(result)
      
      if (result.success) {
        toast.success('Connector test successful!')
      } else {
        toast.error(`Test failed: ${result.error}`)
      }
    } catch (error) {
      toast.error('Failed to test connector')
    } finally {
      setIsTestingConnector(false)
    }
  }

  const handleCreateConnector = () => {
    if (!editingConnector?.name || !editingConnector?.config?.url) {
      toast.error('Name and URL are required')
      return
    }

    const newConnector: DataConnector = {
      id: `custom-${Date.now()}`,
      name: editingConnector.name,
      description: editingConnector.description || '',
      category: editingConnector.category || 'api',
      icon: editingConnector.icon || '🔌',
      config: {
        url: editingConnector.config.url,
        method: editingConnector.config.method || 'GET',
        headers: editingConnector.config.headers,
        params: editingConnector.config.params,
        refreshInterval: editingConnector.config.refreshInterval || 60000,
      },
    }

    setCustomConnectors((current = []) => [...current, newConnector])
    setShowCreateDialog(false)
    setEditingConnector(null)
    toast.success('Custom connector created!')
  }

  const handleDeleteConnector = (connectorId: string) => {
    setCustomConnectors((current = []) => current.filter(c => c.id !== connectorId))
    toast.success('Connector deleted!')
  }

  const handleDuplicateConnector = (connector: DataConnector) => {
    const duplicated: DataConnector = {
      ...connector,
      id: `custom-${Date.now()}`,
      name: `${connector.name} (Copy)`,
    }
    setCustomConnectors((current = []) => [...current, duplicated])
    toast.success('Connector duplicated!')
  }

  const handleClearCache = () => {
    dataConnectorService.clearCache()
    toast.success('Cache cleared!')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} weight="duotone" className="text-accent" />
                Data Connectors
              </CardTitle>
              <CardDescription>
                Connect to real APIs and data sources
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
              >
                <ArrowsClockwise size={16} className="mr-2" />
                Clear Cache
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setEditingConnector({
                    category: 'api',
                    icon: '🔌',
                    config: {
                      url: '',
                      method: 'GET',
                      refreshInterval: 60000,
                    },
                  })
                  setShowCreateDialog(true)
                }}
              >
                <Plus size={16} className="mr-2" />
                Create Custom
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="public">
            <TabsList className="mb-4">
              <TabsTrigger value="public">
                <CloudArrowDown size={16} className="mr-2" />
                Public APIs ({publicApiConnectors.length})
              </TabsTrigger>
              <TabsTrigger value="custom">
                <Code size={16} className="mr-2" />
                Custom ({customConnectors?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="public">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {publicApiConnectors.map((connector) => (
                    <motion.div
                      key={connector.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedConnector?.id === connector.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-3xl flex-shrink-0">{connector.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold">{connector.name}</h4>
                              <Badge variant="secondary" className="text-[10px]">
                                {connector.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {connector.description}
                            </p>
                            <code className="text-[10px] bg-muted px-2 py-1 rounded">
                              {connector.config.url}
                            </code>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateConnector(connector)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnector(connector)}
                            disabled={isTestingConnector}
                          >
                            <Play size={14} weight="fill" className="mr-1" />
                            Test
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="custom">
              <ScrollArea className="h-[400px]">
                {!customConnectors || customConnectors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <Database size={48} weight="duotone" className="text-muted-foreground mb-3" />
                    <h3 className="text-sm font-semibold mb-1">No Custom Connectors</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Create custom connectors to fetch data from your own APIs
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingConnector({
                          category: 'api',
                          icon: '🔌',
                          config: {
                            url: '',
                            method: 'GET',
                            refreshInterval: 60000,
                          },
                        })
                        setShowCreateDialog(true)
                      }}
                    >
                      <Plus size={14} className="mr-2" />
                      Create Your First Connector
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customConnectors.map((connector) => (
                      <motion.div
                        key={connector.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedConnector?.id === connector.id
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-3xl flex-shrink-0">{connector.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-bold">{connector.name}</h4>
                                <Badge variant="secondary" className="text-[10px]">
                                  Custom
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {connector.description}
                              </p>
                              <code className="text-[10px] bg-muted px-2 py-1 rounded">
                                {connector.config.url}
                              </code>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteConnector(connector.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestConnector(connector)}
                              disabled={isTestingConnector}
                            >
                              <Play size={14} weight="fill" className="mr-1" />
                              Test
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {testResult && selectedConnector && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-lg border-2"
                style={{
                  borderColor: testResult.success 
                    ? 'oklch(0.75 0.15 195)' 
                    : 'oklch(0.60 0.22 25)',
                  backgroundColor: testResult.success
                    ? 'oklch(0.75 0.15 195 / 0.1)'
                    : 'oklch(0.60 0.22 25 / 0.1)',
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  {testResult.success ? (
                    <Check size={20} weight="bold" className="text-accent flex-shrink-0 mt-0.5" />
                  ) : (
                    <Warning size={20} weight="bold" className="text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold mb-1">
                      {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {testResult.success 
                        ? `Fetched ${Array.isArray(testResult.data) ? testResult.data.length : 1} record(s)`
                        : testResult.error
                      }
                    </p>
                    {testResult.cached && (
                      <Badge variant="outline" className="text-[10px] mt-2">
                        Cached Result
                      </Badge>
                    )}
                  </div>
                </div>

                {testResult.success && testResult.data && (
                  <ScrollArea className="h-[200px] rounded-lg bg-muted p-3">
                    <pre className="text-[10px] font-mono">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </ScrollArea>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Create Custom Data Connector</DialogTitle>
            <DialogDescription>
              Configure a custom API endpoint to fetch data from
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connector-name">Name *</Label>
                <Input
                  id="connector-name"
                  placeholder="My Custom API"
                  value={editingConnector?.name || ''}
                  onChange={(e) => setEditingConnector(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="connector-description">Description</Label>
                <Input
                  id="connector-description"
                  placeholder="Fetches data from my custom API"
                  value={editingConnector?.description || ''}
                  onChange={(e) => setEditingConnector(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="connector-icon">Icon (emoji)</Label>
                <Input
                  id="connector-icon"
                  placeholder="🔌"
                  value={editingConnector?.icon || ''}
                  onChange={(e) => setEditingConnector(prev => ({ ...prev, icon: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="connector-url">URL *</Label>
                <Input
                  id="connector-url"
                  placeholder="https://api.example.com/data"
                  value={editingConnector?.config?.url || ''}
                  onChange={(e) => setEditingConnector(prev => ({
                    ...prev,
                    config: { ...prev?.config, url: e.target.value || '' },
                  } as Partial<DataConnector>))}
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{paramName}'} for dynamic URL parameters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="connector-method">HTTP Method</Label>
                <Select
                  value={editingConnector?.config?.method || 'GET'}
                  onValueChange={(value: any) => setEditingConnector(prev => ({
                    ...prev,
                    config: { ...prev?.config, url: prev?.config?.url || '', method: value } as any,
                  }))}
                >
                  <SelectTrigger id="connector-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="connector-headers">Headers (JSON)</Label>
                <Textarea
                  id="connector-headers"
                  placeholder='{"Authorization": "Bearer token", "Custom-Header": "value"}'
                  className="font-mono text-xs"
                  rows={3}
                  value={editingConnector?.config?.headers ? JSON.stringify(editingConnector.config.headers, null, 2) : ''}
                  onChange={(e) => {
                    try {
                      const headers = e.target.value ? JSON.parse(e.target.value) : undefined
                      setEditingConnector(prev => ({
                        ...prev,
                        config: { ...prev?.config, url: prev?.config?.url || '', headers } as any,
                      }))
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="connector-params">Query Parameters (JSON)</Label>
                <Textarea
                  id="connector-params"
                  placeholder='{"limit": 10, "sort": "desc"}'
                  className="font-mono text-xs"
                  rows={3}
                  value={editingConnector?.config?.params ? JSON.stringify(editingConnector.config.params, null, 2) : ''}
                  onChange={(e) => {
                    try {
                      const params = e.target.value ? JSON.parse(e.target.value) : undefined
                      setEditingConnector(prev => ({
                        ...prev,
                        config: { ...prev?.config, url: prev?.config?.url || '', params } as any,
                      }))
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="connector-refresh">Refresh Interval (ms)</Label>
                <Input
                  id="connector-refresh"
                  type="number"
                  placeholder="60000"
                  value={editingConnector?.config?.refreshInterval || 60000}
                  onChange={(e) => setEditingConnector(prev => ({
                    ...prev,
                    config: { ...prev?.config, url: prev?.config?.url || '', refreshInterval: parseInt(e.target.value) } as any,
                  }))}
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                setEditingConnector(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateConnector}>
              Create Connector
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
