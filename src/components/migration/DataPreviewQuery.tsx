import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Database, Table as TableIcon, CircleNotch, Download, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DatabaseConnection } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SchemaTable {
  name: string
  recordCount: number
  fields: SchemaField[]
}

interface SchemaField {
  name: string
  type: string
  nullable: boolean
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  defaultValue?: string
}

interface QueryResult {
  columns: string[]
  rows: any[]
  rowCount: number
  executionTime: number
}

interface DataPreviewQueryProps {
  connection: DatabaseConnection | null
  onQueryExecute?: (result: QueryResult) => void
}

export function DataPreviewQuery({ connection, onQueryExecute }: DataPreviewQueryProps) {
  const [query, setQuery] = useState('')
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [schema, setSchema] = useState<SchemaTable[]>([])
  const [queryHistory, setQueryHistory] = useState<string[]>([])

  useEffect(() => {
    if (connection && connection.status === 'connected') {
      loadSchema()
    }
  }, [connection])

  const loadSchema = async () => {
    if (!connection) return

    const mockSchema: SchemaTable[] = [
      {
        name: 'users',
        recordCount: 1250,
        fields: [
          { name: 'id', type: 'INTEGER', nullable: false, isPrimaryKey: true },
          { name: 'username', type: 'VARCHAR(255)', nullable: false },
          { name: 'email', type: 'VARCHAR(255)', nullable: false },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false },
          { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'true' },
        ],
      },
      {
        name: 'orders',
        recordCount: 5432,
        fields: [
          { name: 'id', type: 'INTEGER', nullable: false, isPrimaryKey: true },
          { name: 'user_id', type: 'INTEGER', nullable: false, isForeignKey: true },
          { name: 'total', type: 'DECIMAL(10,2)', nullable: false },
          { name: 'status', type: 'VARCHAR(50)', nullable: false },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false },
        ],
      },
      {
        name: 'products',
        recordCount: 320,
        fields: [
          { name: 'id', type: 'INTEGER', nullable: false, isPrimaryKey: true },
          { name: 'name', type: 'VARCHAR(255)', nullable: false },
          { name: 'price', type: 'DECIMAL(10,2)', nullable: false },
          { name: 'stock', type: 'INTEGER', nullable: false },
          { name: 'category', type: 'VARCHAR(100)', nullable: true },
        ],
      },
    ]

    setSchema(mockSchema)
    if (mockSchema.length > 0) {
      setSelectedTable(mockSchema[0].name)
    }
  }

  const executeQuery = async () => {
    if (!query.trim() || !connection) {
      toast.error('Please enter a query')
      return
    }

    setIsExecuting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      const mockResult: QueryResult = {
        columns: ['id', 'username', 'email', 'created_at'],
        rows: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          username: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
          created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        })),
        rowCount: 10,
        executionTime: 45,
      }

      setQueryResult(mockResult)
      setQueryHistory(prev => [query, ...prev.slice(0, 9)])
      
      if (onQueryExecute) {
        onQueryExecute(mockResult)
      }

      toast.success(`Query executed successfully - ${mockResult.rowCount} rows in ${mockResult.executionTime}ms`)
    } catch (error) {
      toast.error('Query execution failed')
    } finally {
      setIsExecuting(false)
    }
  }

  const generateQuery = async () => {
    if (!selectedTable) return

    const tableSchema = schema.find(t => t.name === selectedTable)
    if (!tableSchema) return

    const columns = tableSchema.fields.map(f => `${f.name} (${f.type})`).join(', ')
    const promptText = `Generate a useful SQL SELECT query for exploring the ${selectedTable} table. The table has these columns: ${columns}. Generate a query that shows interesting data with appropriate filtering, ordering, and limiting. Return only the SQL query without explanation.`

    try {
      const toastId = toast.loading('AI generating query...')
      const result = await window.spark.llm(promptText, 'gpt-4o-mini')
      
      const cleanQuery = result.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim()
      setQuery(cleanQuery)
      toast.success('Query generated by AI', { id: toastId })
    } catch (error) {
      toast.error('Failed to generate query')
    }
  }

  const exportToCSV = () => {
    if (!queryResult) return

    const csv = [
      queryResult.columns.join(','),
      ...queryResult.rows.map(row => 
        queryResult.columns.map(col => JSON.stringify(row[col] ?? '')).join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `query-results-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast.success('Results exported to CSV')
  }

  if (!connection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={24} weight="duotone" />
            Data Preview & Query
          </CardTitle>
          <CardDescription>No database connection selected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Database size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
            <p>Please select a database connection to preview data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="query" className="space-y-6">
        <TabsList>
          <TabsTrigger value="query">Query Editor</TabsTrigger>
          <TabsTrigger value="history">Query History</TabsTrigger>
          <TabsTrigger value="schema">Schema Explorer</TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database size={24} weight="duotone" />
                    Query {connection.name}
                  </CardTitle>
                  <CardDescription>
                    Write and execute SQL queries
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {schema.map(table => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateQuery}
                    disabled={!selectedTable}
                  >
                    <Sparkle size={16} />
                    AI Generate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SELECT * FROM users WHERE..."
                  className="font-mono text-sm min-h-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <Button
                  onClick={executeQuery}
                  disabled={isExecuting || !query.trim()}
                  className="gap-2"
                >
                  {isExecuting ? (
                    <>
                      <CircleNotch size={16} className="animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Execute Query
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {queryResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Query Results</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {queryResult.rowCount} rows
                      </Badge>
                      <Badge variant="secondary">
                        {queryResult.executionTime}ms
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download size={16} className="mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {queryResult.columns.map(col => (
                          <TableHead key={col}>{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryResult.rows.map((row, i) => (
                        <TableRow key={i}>
                          {queryResult.columns.map(col => (
                            <TableCell key={col} className="font-mono text-xs">
                              {row[col] !== null && row[col] !== undefined 
                                ? String(row[col]) 
                                : <span className="text-muted-foreground italic">null</span>
                              }
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <div className="grid gap-4">
            {schema.map(table => (
              <Card key={table.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TableIcon size={20} weight="duotone" />
                        {table.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {table.recordCount.toLocaleString()} records
                        </Badge>
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTable(table.name)
                        setQuery(`SELECT * FROM ${table.name} LIMIT 100`)
                      }}
                    >
                      <Play size={16} />
                      Preview
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {table.fields.map(field => (
                      <div key={field.name} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{field.name}</span>
                          {field.isPrimaryKey && (
                            <Badge variant="default" className="text-xs">PK</Badge>
                          )}
                          {field.isForeignKey && (
                            <Badge variant="outline" className="text-xs">FK</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-mono">
                            {field.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {field.nullable ? 'nullable' : 'required'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Query History</CardTitle>
              <CardDescription>Recently executed queries</CardDescription>
            </CardHeader>
            <CardContent>
              {queryHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No query history yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queryHistory.map((historyQuery, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors"
                      onClick={() => setQuery(historyQuery)}
                    >
                      <code className="text-sm">{historyQuery}</code>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
