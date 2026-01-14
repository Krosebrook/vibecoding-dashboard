import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Database, Table as TableIcon, CircleNotch, Download, Sparkle } from '@phosphor-icons/react'
import { DatabaseConnection, QueryResult, SchemaTable } from '@/lib/types'
import { toast } from 'sonner'

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
    const prompt = `Generate a useful SQL SELECT query for exploring the ${selectedTable} table. The table has these columns: ${columns}. Generate a query that shows interesting data with appropriate filtering, ordering, and limiting. Return only the SQL query without explanation.`

    try {
      toast.loading('AI generating query...')
      const result = await window.spark.llm(prompt, 'gpt-4o-mini')
      
      const cleanQuery = result.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim()
      setQuery(cleanQuery)
      toast.success('Query generated successfully')
    } catch (error) {
      toast.error('Failed to generate query')
    }
  }

  const previewTable = (tableName: string) => {
    setSelectedTable(tableName)
    setQuery(`SELECT * FROM ${tableName} LIMIT 100`)
  }

  const exportResults = () => {
    if (!queryResult) return

    const csv = [
      queryResult.columns.join(','),
      ...queryResult.rows.map(row =>
        queryResult.columns.map(col => JSON.stringify(row[col])).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query-results-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Results exported to CSV')
  }

  if (!connection) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Database size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
          <p>Select a database connection to preview data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="query" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="query">Query Builder</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>SQL Query Editor</span>
                <div className="flex items-center gap-2">
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {schema.map(table => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name} ({table.recordCount?.toLocaleString()} rows)
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
                    <Sparkle size={16} className="mr-2" />
                    AI Generate
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Write SQL queries to preview and analyze your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SELECT * FROM users WHERE created_at > '2024-01-01' LIMIT 100"
                  className="font-mono text-sm min-h-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {connection.name} ({connection.type})
                </div>
                <Button onClick={executeQuery} disabled={isExecuting || !query.trim()}>
                  {isExecuting ? (
                    <>
                      <CircleNotch size={16} className="mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-2" weight="fill" />
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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>Query Results</span>
                    <Badge variant="secondary">
                      {queryResult.rowCount.toLocaleString()} rows
                    </Badge>
                    <Badge variant="outline">
                      {queryResult.executionTime}ms
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportResults}>
                    <Download size={16} className="mr-2" />
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {queryResult.columns.map(col => (
                          <TableHead key={col} className="font-semibold">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryResult.rows.map((row, i) => (
                        <TableRow key={i}>
                          {queryResult.columns.map(col => (
                            <TableCell key={col} className="font-mono text-xs">
                              {typeof row[col] === 'object'
                                ? JSON.stringify(row[col])
                                : String(row[col])}
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

        <TabsContent value="tables" className="space-y-4">
          <div className="grid gap-4">
            {schema.map(table => (
              <Card key={table.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TableIcon size={20} weight="duotone" />
                      {table.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {table.recordCount?.toLocaleString()} rows
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previewTable(table.name)}
                      >
                        Preview
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {table.fields.map(field => (
                      <div
                        key={field.name}
                        className="flex items-center justify-between p-2 rounded bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm">
                            {field.name}
                          </span>
                          {field.isPrimaryKey && (
                            <Badge variant="default" className="text-xs">PK</Badge>
                          )}
                          {field.isForeignKey && (
                            <Badge variant="outline" className="text-xs">FK</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-mono">{field.type}</span>
                          {!field.nullable && (
                            <Badge variant="secondary" className="text-xs">NOT NULL</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Query History</CardTitle>
              <CardDescription>Recently executed queries</CardDescription>
            </CardHeader>
            <CardContent>
              {queryHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No query history yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queryHistory.map((q, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer"
                      onClick={() => setQuery(q)}
                    >
                      <code className="text-sm text-foreground">{q}</code>
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
