import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/texta
import { Table, TableBody, TableCell, TableHead, Ta
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Database, Table as TableIcon, CircleNotch, Download, Sparkle } from '@phosphor-icons/r
import { toast } from 'sonner'
interface DataPreviewQueryProps {
  onQueryExecute?: (result: QueryResult) => void

  const [query, setQuery] = useState('')
  const [queryResult, setQuery


    if (connection && connection.status
    }
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
      

      queryResult.columns.
        queryResult.columns.map(col => JSON.stringi
    ].join('\n')
    const blob = new Blob([csv], { type: 'tex
    c
   

    toast.success('Results exported to CSV')

    return (
   

      </Card>
  }

      <Tabs defau
          <TabsTrigger value="query"
          <TabsTrigger value="histor

        
              <C

                    <SelectTrigger className="w-48">
                    </SelectTrigger>
                      {schema.map(table =
                
                      ))}
             
                    variant=

                  >
   

              <CardD
            
            
                <Textarea
                  onChange={(e) => setQuery(e.target.value)}
                  className="font-mono text-sm min-h-32"
              </div>
             
     
   

          
                    <>
                      Execute Query
                  )}
              </div>
          </Card>
          {queryResult && (
              <Card

                    <Badge variant="secondary">
                
                      {q
                  </div>
                    <Download size={16} class
                  </Button>
              </CardHeader>
                <ScrollArea className="h-96 w-full r
                    <TableHeader>
                        {queryResult
                            {col}
                        ))}
                    </TableHeader>
                      {queryResult.rows.map((row, i) => (
                          {queryResul
                         
                                : St
                          )
                      ))}
                  </Table>
              </CardContent>
          )}

          <div clas
              <Card key={table.name}>
                  <CardTitle cl
                      <Tabl
                    </
                      <Bad
                      </Badge>
                        variant="outline"
                        onClick=
                        P
                    </div>
                </C
                  <div cl
                      <div
                        className="flex items-center justify
                        <div className="flex items-center gap-2">
                            {field.name}
                  
                    
                            <Badge variant="outline" className="t
                        </div>
                          <span className="font-mono">{
                      
                        </div>
                    ))}
                </Card
            ))}
        </TabsContent>
        <TabsContent va
            <CardHeader
              <CardDes
            <CardContent>
                <div className="tex
                </div>
                <div
                    <div
                    
                    >
                 

            </CardContent>
        </TabsCont
    </div>
}







































































































































