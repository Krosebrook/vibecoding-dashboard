import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Pause, Stop, CheckCircle, Warning, Info } from '@phosphor-icons/react'
import { MigrationConfig, MigrationExecution, MigrationLog } from '@/lib/types'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface MigrationExecutorProps {
  config: MigrationConfig | null
  onExecutionComplete?: (execution: MigrationExecution) => void
}

export function MigrationExecutor({ config, onExecutionComplete }: MigrationExecutorProps) {
  const [execution, setExecution] = useState<MigrationExecution | null>(null)
  const [logs, setLogs] = useState<MigrationLog[]>([])

  const startMigration = async () => {
    if (!config) return

    const newExecution: MigrationExecution = {
      id: `exec-${Date.now()}`,
      configId: config.id,
      status: 'running',
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      failedRecords: 0,
      startTime: new Date().toISOString(),
      errors: [],
      logs: [],
      canRollback: true,
    }

    setExecution(newExecution)
    addLog('info', 'Migration started')
    toast.success('Migration started')

    let totalRecords = 0
    config.mappings.forEach(mapping => {
      totalRecords += Math.floor(Math.random() * 1000) + 500
    })

    newExecution.totalRecords = totalRecords

    const batchSize = config.options.batchSize
    const batches = Math.ceil(totalRecords / batchSize)

    for (let i = 0; i < batches; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))

      const processed = Math.min((i + 1) * batchSize, totalRecords)
      const progress = (processed / totalRecords) * 100

      const failed = Math.random() > 0.95 ? Math.floor(Math.random() * 5) : 0

      setExecution(prev => prev ? {
        ...prev,
        progress,
        processedRecords: processed,
        failedRecords: (prev.failedRecords || 0) + failed,
      } : null)

      addLog('info', `Batch ${i + 1}/${batches}: Processed ${processed}/${totalRecords} records`)

      if (failed > 0) {
        addLog('warning', `${failed} records failed in this batch`)
      }

      if (newExecution.status === 'paused') {
        addLog('info', 'Migration paused')
        break
      }
    }

    if (newExecution.status === 'running') {
      const finalExecution: MigrationExecution = {
        ...newExecution,
        status: 'completed',
        progress: 100,
        endTime: new Date().toISOString(),
      }
      
      setExecution(finalExecution)
      addLog('success', 'Migration completed successfully')
      toast.success('Migration completed!')
      onExecutionComplete?.(finalExecution)
    }
  }

  const pauseMigration = () => {
    if (execution) {
      setExecution({ ...execution, status: 'paused' })
      addLog('warning', 'Migration paused by user')
      toast.info('Migration paused')
    }
  }

  const stopMigration = () => {
    if (execution) {
      setExecution({ ...execution, status: 'failed' })
      addLog('error', 'Migration stopped by user')
      toast.error('Migration stopped')
    }
  }

  const addLog = (level: MigrationLog['level'], message: string) => {
    const newLog: MigrationLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      message,
      level,
    }
    setLogs(prev => [...prev, newLog])
  }

  const getLogIcon = (level: MigrationLog['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle size={16} className="text-success" weight="fill" />
      case 'warning':
        return <Warning size={16} className="text-warning" weight="fill" />
      case 'error':
        return <Warning size={16} className="text-destructive" weight="fill" />
      default:
        return <Info size={16} className="text-info" weight="fill" />
    }
  }

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play size={20} weight="duotone" />
            Migration Execution
          </CardTitle>
          <CardDescription>Execute and monitor the data migration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Play size={48} className="mx-auto mb-3 opacity-50" weight="duotone" />
            <p>Configure connections and mappings to start migration</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play size={20} weight="duotone" />
          Migration Execution
        </CardTitle>
        <CardDescription>
          Execute and monitor the data migration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{config.name}</h4>
              <p className="text-sm text-muted-foreground">{config.description || 'No description'}</p>
            </div>
            {execution && (
              <Badge
                variant={
                  execution.status === 'completed' ? 'default' :
                  execution.status === 'failed' ? 'destructive' :
                  'secondary'
                }
              >
                {execution.status}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Total Records</div>
              <div className="text-2xl font-bold">{execution?.totalRecords.toLocaleString() || '-'}</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Processed</div>
              <div className="text-2xl font-bold text-success">{execution?.processedRecords.toLocaleString() || '0'}</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Failed</div>
              <div className="text-2xl font-bold text-destructive">{execution?.failedRecords.toLocaleString() || '0'}</div>
            </div>
          </div>

          {execution && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-mono font-semibold">{execution.progress.toFixed(1)}%</span>
              </div>
              <div className="relative">
                <Progress value={execution.progress} className="h-3" />
                {execution.status === 'running' && (
                  <motion.div
                    className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: [-80, 400],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!execution || execution.status === 'completed' || execution.status === 'failed' ? (
            <Button className="flex-1" onClick={startMigration}>
              <Play size={16} className="mr-2" weight="fill" />
              Start Migration
            </Button>
          ) : (
            <>
              {execution.status === 'running' && (
                <Button variant="outline" onClick={pauseMigration}>
                  <Pause size={16} className="mr-2" weight="fill" />
                  Pause
                </Button>
              )}
              {execution.status === 'paused' && (
                <Button onClick={startMigration}>
                  <Play size={16} className="mr-2" weight="fill" />
                  Resume
                </Button>
              )}
              <Button variant="destructive" onClick={stopMigration}>
                <Stop size={16} className="mr-2" weight="fill" />
                Stop
              </Button>
            </>
          )}
        </div>

        {logs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Migration Log</h4>
            <ScrollArea className="h-[200px] border rounded-lg">
              <div className="p-3 space-y-1">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-2 text-sm py-1">
                    <div className="mt-0.5">{getLogIcon(log.level)}</div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="ml-2">{log.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
