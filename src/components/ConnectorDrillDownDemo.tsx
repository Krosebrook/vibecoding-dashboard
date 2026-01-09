import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  publicApiConnectors, 
  drillDownConnectors,
  DataConnector,
  DrillDownConfig 
} from '@/lib/data-connectors'
import { useConnectorWithDrillDown } from '@/hooks/use-data-connector'
import { 
  ArrowLeft, 
  CaretRight, 
  Table as TableIcon,
  ArrowsClockwise,
  Sparkle,
  ChartBar
} from '@phosphor-icons/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

export function ConnectorDrillDownDemo() {
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>('jsonplaceholder-users')
  const [showTable, setShowTable] = useState(false)

  const selectedConnector = publicApiConnectors.find(c => c.id === selectedConnectorId)
  
  const drillDownConfig: DrillDownConfig | null = selectedConnectorId === 'jsonplaceholder-users'
    ? drillDownConnectors.userPosts
    : null

  const {
    activeData,
    loading,
    error,
    refetch,
    drillStack,
    drillDown,
    navigateTo,
    isInDrillDown,
    canDrillDown,
  } = useConnectorWithDrillDown(selectedConnector || null, drillDownConfig)

  const handleBarClick = (data: any) => {
    if (canDrillDown && data) {
      drillDown(data)
    }
  }

  const renderChart = () => {
    if (loading && !activeData) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center space-y-3">
            <div className="animate-spin mx-auto h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center space-y-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <ArrowsClockwise size={14} className="mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )
    }

    if (!activeData || !Array.isArray(activeData) || activeData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      )
    }

    const keys = Object.keys(activeData[0]).filter(k => typeof activeData[0][k] === 'number')
    const xKey = Object.keys(activeData[0])[0]

    if (selectedConnectorId === 'jsonplaceholder-users' || selectedConnectorId === 'github-trending') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={activeData.slice(0, 10)} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload[0]) {
                handleBarClick(e.activePayload[0].payload)
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.02 260)" opacity={0.5} />
            <XAxis 
              dataKey={xKey}
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)', fontSize: 10 }}
            />
            <YAxis 
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'oklch(0.25 0.01 260)', 
                border: '1px solid oklch(0.35 0.02 260)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'oklch(0.85 0.01 260)' }}
              cursor={{ fill: 'oklch(0.75 0.15 195 / 0.1)' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {keys.slice(0, 2).map((key, idx) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={idx === 0 ? 'oklch(0.45 0.19 250)' : 'oklch(0.75 0.15 195)'}
                radius={[4, 4, 0, 0]}
                style={{ cursor: canDrillDown ? 'pointer' : 'default' }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={activeData.slice(0, 15)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.02 260)" opacity={0.5} />
          <XAxis 
            dataKey={xKey}
            stroke="oklch(0.65 0.01 260)"
            tick={{ fill: 'oklch(0.65 0.01 260)', fontSize: 10 }}
          />
          <YAxis 
            stroke="oklch(0.65 0.01 260)"
            tick={{ fill: 'oklch(0.65 0.01 260)', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'oklch(0.25 0.01 260)', 
              border: '1px solid oklch(0.35 0.02 260)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: 'oklch(0.85 0.01 260)' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {keys.slice(0, 2).map((key, idx) => (
            <Line 
              key={key} 
              type="monotone" 
              dataKey={key} 
              stroke={idx === 0 ? 'oklch(0.45 0.19 250)' : 'oklch(0.75 0.15 195)'}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const renderTable = () => {
    if (!activeData || !Array.isArray(activeData) || activeData.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
    }

    const keys = Object.keys(activeData[0])

    return (
      <ScrollArea className="h-[300px] rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card border-b border-border">
            <tr>
              {keys.map(key => (
                <th key={key} className="text-left p-2 font-semibold">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeData.map((row, idx) => (
              <tr key={idx} className="border-b border-border/50 hover:bg-accent/5">
                {keys.map(key => (
                  <td key={key} className="p-2">
                    {typeof row[key] === 'number' 
                      ? row[key].toLocaleString()
                      : String(row[key] || '').substring(0, 50)
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkle size={20} weight="duotone" className="text-accent" />
              Live API Data with Drill-Down
            </CardTitle>
            <CardDescription>
              Real data from public APIs with interactive drill-down exploration
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isInDrillDown && (
              <Badge variant="secondary" className="animate-pulse">
                Drilled Down
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <ArrowsClockwise size={14} className="mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {publicApiConnectors.slice(0, 4).map((connector) => (
            <Button
              key={connector.id}
              variant={selectedConnectorId === connector.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedConnectorId(connector.id)
                setShowTable(false)
              }}
            >
              <span className="mr-2">{connector.icon}</span>
              {connector.name}
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {drillStack.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 flex-wrap p-3 bg-accent/10 rounded-lg border border-accent/20"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo(-1)}
                className="h-7 px-2"
              >
                <ArrowLeft size={14} className="mr-1" />
                Back to Overview
              </Button>
              {drillStack.map((level, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CaretRight size={14} className="text-muted-foreground" />
                  <Badge variant="outline">
                    Level {level.level + 1}
                  </Badge>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs value={showTable ? 'table' : 'chart'} onValueChange={(v) => setShowTable(v === 'table')}>
          <div className="flex items-center justify-between mb-3">
            <TabsList>
              <TabsTrigger value="chart">
                <ChartBar size={14} className="mr-2" />
                Chart
              </TabsTrigger>
              <TabsTrigger value="table">
                <TableIcon size={14} className="mr-2" />
                Table
              </TabsTrigger>
            </TabsList>
            {activeData && Array.isArray(activeData) && (
              <Badge variant="outline">
                {activeData.length} records
              </Badge>
            )}
          </div>

          <TabsContent value="chart" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedConnectorId}-${drillStack.length}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderChart()}
                {canDrillDown && !isInDrillDown && (
                  <p className="text-xs text-muted-foreground text-center mt-3 italic">
                    💡 Click on a bar to drill down and explore more details
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="table" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`table-${selectedConnectorId}-${drillStack.length}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTable()}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
