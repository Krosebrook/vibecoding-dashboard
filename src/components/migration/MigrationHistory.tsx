import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, ArrowCounterClockwise, CheckCircle, Warning } from '@phosphor-icons/react'
import { MigrationExecution } from '@/lib/types'
import { toast } from 'sonner'

interface MigrationHistoryProps {
  executions: MigrationExecution[]
  onRollback?: (execution: MigrationExecution) => void
}

export function MigrationHistory({ executions, onRollback }: MigrationHistoryProps) {
  const handleRollback = (execution: MigrationExecution) => {
    toast.success('Rollback initiated')
    onRollback?.(execution)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock size={20} weight="duotone" />
          Migration History
        </CardTitle>
        <CardDescription>
          View past migrations and rollback if needed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock size={48} className="mx-auto mb-3 opacity-50" weight="duotone" />
            <p>No migration history</p>
            <p className="text-sm">Completed migrations will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className={`p-4 rounded-lg border-2 ${
                    execution.status === 'completed' ? 'border-success/40 bg-success/5' :
                    execution.status === 'failed' || execution.status === 'rolled-back' ? 'border-destructive/40 bg-destructive/5' :
                    'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {execution.status === 'completed' ? (
                        <CheckCircle size={20} className="text-success" weight="fill" />
                      ) : (
                        <Warning size={20} className="text-destructive" weight="fill" />
                      )}
                      <Badge
                        variant={
                          execution.status === 'completed' ? 'default' :
                          execution.status === 'failed' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {execution.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {execution.startTime && new Date(execution.startTime).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="font-semibold">{execution.totalRecords.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Processed</div>
                      <div className="font-semibold text-success">{execution.processedRecords.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                      <div className="font-semibold text-destructive">{execution.failedRecords.toLocaleString()}</div>
                    </div>
                  </div>

                  {execution.endTime && execution.startTime && (
                    <div className="text-xs text-muted-foreground mb-3">
                      Duration: {Math.round((new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000)}s
                    </div>
                  )}

                  {execution.canRollback && execution.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleRollback(execution)}
                    >
                      <ArrowCounterClockwise size={16} className="mr-2" />
                      Rollback Migration
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
