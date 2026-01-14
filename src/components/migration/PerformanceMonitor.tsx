import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { 
  ChartLine, 
  Clock, 
  Database, 
  Gauge, 
  Lightning,
  HardDrives,
  Cpu,
  Warning
} from '@phosphor-icons/react'
import { MigrationExecution, PerformanceMetrics } from '@/lib/types'

interface PerformanceMonitorProps {
  execution?: MigrationExecution | null
  isRunning: boolean
}

export function PerformanceMonitor({ execution, isRunning }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    if (!isRunning || !execution) {
      setMetrics([])
      setCurrentMetrics(null)
      return
    }

    const interval = setInterval(() => {
      const newMetric: PerformanceMetrics = {
        migrationId: execution.id,
        timestamp: new Date().toISOString(),
        recordsPerSecond: 100 + Math.random() * 200,
        bytesPerSecond: 1024 * 100 + Math.random() * 1024 * 500,
        cpuUsage: 20 + Math.random() * 60,
        memoryUsage: 40 + Math.random() * 40,
        errorRate: Math.random() * 5,
        avgRecordSize: 512 + Math.random() * 500,
        estimatedTimeRemaining: Math.max(0, 300 - (Date.now() - (execution.startTime ? new Date(execution.startTime).getTime() : Date.now())) / 1000),
      }

      setCurrentMetrics(newMetric)
      setMetrics(prev => {
        const updated = [...prev, newMetric]
        return updated.slice(-30)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, execution])

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes.toFixed(0)} B/s`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-destructive'
    if (value >= thresholds.warning) return 'text-warning'
    return 'text-success'
  }

  const chartData = metrics.map((m, i) => ({
    time: i,
    records: m.recordsPerSecond,
    cpu: m.cpuUsage,
    memory: m.memoryUsage,
    errors: m.errorRate,
  }))

  if (!isRunning || !execution) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Gauge size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
          <p>Start a migration to see real-time performance metrics</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightning size={18} className="text-accent" weight="duotone" />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics?.recordsPerSecond.toFixed(0) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              records/second
            </p>
            <div className="text-sm text-muted-foreground mt-2">
              {formatBytes(currentMetrics?.bytesPerSecond || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu size={18} className="text-primary" weight="duotone" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(currentMetrics?.cpuUsage || 0, { warning: 70, critical: 85 })}`}>
              {currentMetrics?.cpuUsage.toFixed(1) || 0}%
            </div>
            <Progress 
              value={currentMetrics?.cpuUsage || 0} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              System load
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrives size={18} className="text-info" weight="duotone" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(currentMetrics?.memoryUsage || 0, { warning: 70, critical: 85 })}`}>
              {currentMetrics?.memoryUsage.toFixed(1) || 0}%
            </div>
            <Progress 
              value={currentMetrics?.memoryUsage || 0} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              RAM allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock size={18} className="text-secondary" weight="duotone" />
              Time Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(currentMetrics?.estimatedTimeRemaining || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated completion
            </p>
            <div className="text-sm text-muted-foreground mt-2">
              {((execution.processedRecords / execution.totalRecords) * 100).toFixed(1)}% complete
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine size={20} weight="duotone" />
            Throughput Over Time
          </CardTitle>
          <CardDescription>Records processed per second</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="recordsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.15 195)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="oklch(0.75 0.15 195)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 260)" />
              <XAxis 
                dataKey="time" 
                stroke="oklch(0.60 0.01 260)"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="oklch(0.60 0.01 260)"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.20 0.02 260)',
                  border: '1px solid oklch(0.30 0.02 260)',
                  borderRadius: '8px',
                  color: 'oklch(0.95 0 0)',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="records" 
                stroke="oklch(0.75 0.15 195)" 
                fill="url(#recordsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu size={20} weight="duotone" />
              System Resources
            </CardTitle>
            <CardDescription>CPU and memory usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 260)" />
                <XAxis 
                  dataKey="time" 
                  stroke="oklch(0.60 0.01 260)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="oklch(0.60 0.01 260)"
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.20 0.02 260)',
                    border: '1px solid oklch(0.30 0.02 260)',
                    borderRadius: '8px',
                    color: 'oklch(0.95 0 0)',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="oklch(0.50 0.18 250)" 
                  strokeWidth={2}
                  dot={false}
                  name="CPU %"
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="oklch(0.48 0.15 200)" 
                  strokeWidth={2}
                  dot={false}
                  name="Memory %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warning size={20} weight="duotone" />
              Error Rate
            </CardTitle>
            <CardDescription>Errors per second</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="errorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.22 25)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.55 0.22 25)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 260)" />
                <XAxis 
                  dataKey="time" 
                  stroke="oklch(0.60 0.01 260)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="oklch(0.60 0.01 260)"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.20 0.02 260)',
                    border: '1px solid oklch(0.30 0.02 260)',
                    borderRadius: '8px',
                    color: 'oklch(0.95 0 0)',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="errors" 
                  stroke="oklch(0.55 0.22 25)" 
                  fill="url(#errorsGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Warning size={18} className={getStatusColor(currentMetrics?.errorRate || 0, { warning: 3, critical: 5 })} weight="duotone" />
                <span className="text-sm text-muted-foreground">Current error rate:</span>
              </div>
              <Badge 
                variant={
                  (currentMetrics?.errorRate || 0) >= 5 ? 'destructive' :
                  (currentMetrics?.errorRate || 0) >= 3 ? 'secondary' :
                  'outline'
                }
              >
                {currentMetrics?.errorRate.toFixed(2) || 0} errors/s
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} weight="duotone" />
            Migration Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Records Processed</span>
              <span className="text-sm font-semibold">
                {execution.processedRecords.toLocaleString()} / {execution.totalRecords.toLocaleString()}
              </span>
            </div>
            <Progress value={(execution.processedRecords / execution.totalRecords) * 100} className="h-3" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Total Records</div>
              <div className="text-lg font-semibold">{execution.totalRecords.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Processed</div>
              <div className="text-lg font-semibold text-success">{execution.processedRecords.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Failed</div>
              <div className="text-lg font-semibold text-destructive">{execution.failedRecords.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
