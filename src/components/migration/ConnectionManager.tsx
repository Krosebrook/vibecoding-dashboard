import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Database, Plus, Trash, CircleNotch, CheckCircle, Warning } from '@phosphor-icons/react'
import { DatabaseConnection, DatabaseType } from '@/lib/types'
import { testConnection, getDatabaseIcon, getDatabaseColor } from '@/lib/database-helpers'
import { toast } from 'sonner'

interface ConnectionManagerProps {
  connections: DatabaseConnection[]
  onConnectionsChange: (connections: DatabaseConnection[]) => void
  onSelectConnection?: (connection: DatabaseConnection) => void
}

export function ConnectionManager({ connections, onConnectionsChange, onSelectConnection }: ConnectionManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<DatabaseConnection>>({
    name: '',
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
    status: 'idle',
  })

  const handleTypeChange = (type: DatabaseType) => {
    const defaultPorts: Record<DatabaseType, number | undefined> = {
      postgresql: 5432,
      mysql: 3306,
      mongodb: 27017,
      sqlite: undefined,
      csv: undefined,
    }
    
    setFormData({
      ...formData,
      type,
      port: defaultPorts[type],
    })
  }

  const handleSave = () => {
    if (!formData.name || !formData.type) {
      toast.error('Please fill in required fields')
      return
    }

    if (formData.type === 'csv' && !formData.filePath) {
      toast.error('Please provide a file path for CSV')
      return
    }

    if (formData.type !== 'csv' && formData.type !== 'sqlite' && (!formData.host || !formData.database)) {
      toast.error('Please provide host and database name')
      return
    }

    const newConnection: DatabaseConnection = {
      id: editingConnection?.id || `conn-${Date.now()}`,
      name: formData.name!,
      type: formData.type!,
      host: formData.host,
      port: formData.port,
      database: formData.database,
      username: formData.username,
      password: formData.password,
      filePath: formData.filePath,
      status: 'idle',
    }

    if (editingConnection) {
      onConnectionsChange(connections.map(c => c.id === editingConnection.id ? newConnection : c))
      toast.success('Connection updated')
    } else {
      onConnectionsChange([...connections, newConnection])
      toast.success('Connection added')
    }

    setIsDialogOpen(false)
    setEditingConnection(null)
    setFormData({
      name: '',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: '',
      username: '',
      password: '',
      status: 'idle',
    })
  }

  const handleTest = async (connection: DatabaseConnection) => {
    setTestingId(connection.id)
    
    const updated = { ...connection, status: 'connecting' as const }
    onConnectionsChange(connections.map(c => c.id === connection.id ? updated : c))

    try {
      const result = await testConnection(connection)
      
      if (result.success) {
        const successConnection = {
          ...connection,
          status: 'connected' as const,
          lastTested: new Date().toISOString(),
          metadata: result.metadata,
        }
        onConnectionsChange(connections.map(c => c.id === connection.id ? successConnection : c))
        toast.success('Connection successful!')
      } else {
        const errorConnection = { ...connection, status: 'error' as const }
        onConnectionsChange(connections.map(c => c.id === connection.id ? errorConnection : c))
        toast.error(result.message)
      }
    } catch (error) {
      const errorConnection = { ...connection, status: 'error' as const }
      onConnectionsChange(connections.map(c => c.id === connection.id ? errorConnection : c))
      toast.error('Connection test failed')
    } finally {
      setTestingId(null)
    }
  }

  const handleDelete = (id: string) => {
    onConnectionsChange(connections.filter(c => c.id !== id))
    toast.success('Connection deleted')
  }

  const handleEdit = (connection: DatabaseConnection) => {
    setEditingConnection(connection)
    setFormData(connection)
    setIsDialogOpen(true)
  }

  const getStatusIcon = (status: DatabaseConnection['status'], id: string) => {
    if (testingId === id) {
      return <CircleNotch size={16} className="animate-spin text-warning" />
    }
    
    switch (status) {
      case 'connected':
        return <CheckCircle size={16} className="text-success" weight="fill" />
      case 'error':
        return <Warning size={16} className="text-destructive" weight="fill" />
      case 'connecting':
        return <CircleNotch size={16} className="animate-spin text-warning" />
      default:
        return <Database size={16} className="text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database size={20} weight="duotone" />
              Database Connections
            </CardTitle>
            <CardDescription>
              Manage source and destination database connections
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingConnection(null)
                setFormData({
                  name: '',
                  type: 'postgresql',
                  host: 'localhost',
                  port: 5432,
                  database: '',
                  username: '',
                  password: '',
                  status: 'idle',
                })
              }}>
                <Plus size={16} className="mr-2" />
                Add Connection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingConnection ? 'Edit' : 'New'} Database Connection</DialogTitle>
                <DialogDescription>
                  Configure connection details for your database
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="connection-name">Connection Name *</Label>
                    <Input
                      id="connection-name"
                      placeholder="Production DB"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="connection-type">Database Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleTypeChange(value as DatabaseType)}>
                      <SelectTrigger id="connection-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                        <SelectItem value="sqlite">SQLite</SelectItem>
                        <SelectItem value="csv">CSV File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.type === 'csv' ? (
                  <div className="space-y-2">
                    <Label htmlFor="file-path">File Path *</Label>
                    <Input
                      id="file-path"
                      placeholder="/path/to/data.csv"
                      value={formData.filePath || ''}
                      onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                    />
                  </div>
                ) : formData.type === 'sqlite' ? (
                  <div className="space-y-2">
                    <Label htmlFor="file-path">Database File Path *</Label>
                    <Input
                      id="file-path"
                      placeholder="/path/to/database.db"
                      value={formData.filePath || formData.database || ''}
                      onChange={(e) => setFormData({ ...formData, filePath: e.target.value, database: e.target.value })}
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="host">Host *</Label>
                        <Input
                          id="host"
                          placeholder="localhost"
                          value={formData.host}
                          onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input
                          id="port"
                          type="number"
                          placeholder="5432"
                          value={formData.port || ''}
                          onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || undefined })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="database">Database Name *</Label>
                      <Input
                        id="database"
                        placeholder="myapp_production"
                        value={formData.database}
                        onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="admin"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingConnection ? 'Update' : 'Add'} Connection
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {connections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database size={48} className="mx-auto mb-3 opacity-50" weight="duotone" />
            <p>No connections configured</p>
            <p className="text-sm">Add your first database connection to get started</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-accent/50 ${
                  connection.status === 'connected' ? 'border-success/40 bg-success/5' :
                  connection.status === 'error' ? 'border-destructive/40 bg-destructive/5' :
                  connection.status === 'connecting' ? 'border-warning/40 bg-warning/5' :
                  'border-border bg-card'
                }`}
                onClick={() => onSelectConnection?.(connection)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{getDatabaseIcon(connection.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{connection.name}</h4>
                      {getStatusIcon(connection.status, connection.id)}
                      <Badge variant="outline" className="text-xs">
                        {connection.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {connection.type === 'csv' || connection.type === 'sqlite' 
                        ? connection.filePath || connection.database
                        : `${connection.host}:${connection.port}/${connection.database}`
                      }
                    </p>
                    {connection.metadata?.tables && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {connection.metadata.tables.length} tables
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTest(connection)
                      }}
                      disabled={testingId === connection.id}
                    >
                      Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(connection)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(connection.id)
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
