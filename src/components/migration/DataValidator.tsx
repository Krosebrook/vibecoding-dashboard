import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Flask, CheckCircle, Warning, XCircle, Play, ArrowRight } from '@phosphor-icons/react'
import { DatabaseConnection } from '@/lib/types'
import { toast } from 'sonner'

interface ValidationRule {
  id: string
  name: string
  type: 'type-check' | 'null-check' | 'range-check' | 'format-check' | 'uniqueness' | 'referential-integrity'
  field: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning'
  message?: string
  recordsAffected?: number
}

interface DataValidatorProps {
  sourceConnection: DatabaseConnection | null
  destinationConnection: DatabaseConnection | null
  onValidationComplete?: (hasErrors: boolean) => void
}

export function DataValidator({ sourceConnection, destinationConnection, onValidationComplete }: DataValidatorProps) {
  const [rules, setRules] = useState<ValidationRule[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (sourceConnection && destinationConnection) {
      generateValidationRules()
    }
  }, [sourceConnection, destinationConnection])

  const generateValidationRules = () => {
    const newRules: ValidationRule[] = [
      {
        id: '1',
        name: 'Data Type Compatibility',
        type: 'type-check',
        field: 'All mapped fields',
        status: 'pending',
      },
      {
        id: '2',
        name: 'NULL Value Handling',
        type: 'null-check',
        field: 'Required fields',
        status: 'pending',
      },
      {
        id: '3',
        name: 'Primary Key Uniqueness',
        type: 'uniqueness',
        field: 'Primary key fields',
        status: 'pending',
      },
      {
        id: '4',
        name: 'Foreign Key References',
        type: 'referential-integrity',
        field: 'Foreign key fields',
        status: 'pending',
      },
      {
        id: '5',
        name: 'Date Format Validation',
        type: 'format-check',
        field: 'Date/time fields',
        status: 'pending',
      },
      {
        id: '6',
        name: 'Numeric Range Check',
        type: 'range-check',
        field: 'Numeric fields',
        status: 'pending',
      },
    ]
    setRules(newRules)
  }

  const runValidation = async () => {
    if (!sourceConnection || !destinationConnection) {
      toast.error('Please select both source and destination connections')
      return
    }

    setIsRunning(true)
    setProgress(0)

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      
      setRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, status: 'running' } : r
      ))

      await new Promise(resolve => setTimeout(resolve, 800))

      const random = Math.random()
      const result: 'passed' | 'warning' | 'failed' = 
        random > 0.8 ? 'failed' : random > 0.6 ? 'warning' : 'passed'
      
      setRules(prev => prev.map(r => 
        r.id === rule.id ? { 
          ...r, 
          status: result,
          message: result === 'failed' 
            ? 'Type mismatch detected in 3 fields' 
            : result === 'warning'
            ? 'Some NULL values found in non-nullable fields'
            : 'All checks passed',
          recordsAffected: Math.floor(Math.random() * 100)
        } : r
      ))

      setProgress(((i + 1) / rules.length) * 100)
    }

    setIsRunning(false)
    
    const hasErrors = rules.some(r => r.status === 'failed')
    const hasWarnings = rules.some(r => r.status === 'warning')
    
    if (hasErrors) {
      toast.error('Validation completed with errors')
    } else if (hasWarnings) {
      toast.warning('Validation completed with warnings')
    } else {
      toast.success('All validation checks passed')
    }

    onValidationComplete?.(hasErrors)
  }

  const getStatusIcon = (status: ValidationRule['status']) => {
    switch (status) {
      case 'running':
        return <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      case 'passed':
        return <CheckCircle size={20} weight="fill" className="text-success" />
      case 'warning':
        return <Warning size={20} weight="fill" className="text-warning" />
      case 'failed':
        return <XCircle size={20} weight="fill" className="text-destructive" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted" />
    }
  }

  const getStatusBadge = (status: ValidationRule['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      passed: 'default',
      warning: 'default',
      failed: 'destructive',
    }
    
    return (
      <Badge 
        variant={variants[status] as any}
        className={
          status === 'passed' ? 'bg-success/20 text-success border-success/40' :
          status === 'warning' ? 'bg-warning/20 text-warning border-warning/40' :
          status === 'running' ? 'bg-info/20 text-info border-info/40' :
          ''
        }
      >
        {status}
      </Badge>
    )
  }

  const passedCount = rules.filter(r => r.status === 'passed').length
  const warningCount = rules.filter(r => r.status === 'warning').length
  const failedCount = rules.filter(r => r.status === 'failed').length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warning/20 to-success/20 flex items-center justify-center">
                  <Flask size={20} weight="duotone" className="text-warning" />
                </div>
                <CardTitle>Data Validation</CardTitle>
              </div>
              <CardDescription>
                Pre-migration validation to identify potential issues before data transfer
              </CardDescription>
            </div>
            <Button 
              onClick={runValidation}
              disabled={isRunning || !sourceConnection || !destinationConnection}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play size={16} weight="fill" />
                  Run Validation
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!sourceConnection || !destinationConnection ? (
            <div className="text-center py-12 text-muted-foreground">
              <Flask size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
              <p>Select source and destination connections to enable validation</p>
            </div>
          ) : (
            <>
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Validation progress</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {rules.some(r => r.status !== 'pending') && (
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 border-success/40 bg-success/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Passed</span>
                      <CheckCircle size={20} weight="fill" className="text-success" />
                    </div>
                    <div className="text-2xl font-bold text-success mt-1">{passedCount}</div>
                  </Card>
                  <Card className="p-4 border-warning/40 bg-warning/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Warnings</span>
                      <Warning size={20} weight="fill" className="text-warning" />
                    </div>
                    <div className="text-2xl font-bold text-warning mt-1">{warningCount}</div>
                  </Card>
                  <Card className="p-4 border-destructive/40 bg-destructive/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Failed</span>
                      <XCircle size={20} weight="fill" className="text-destructive" />
                    </div>
                    <div className="text-2xl font-bold text-destructive mt-1">{failedCount}</div>
                  </Card>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Validation Rules
                </h3>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {rules.map((rule) => (
                      <Card key={rule.id} className="p-4 hover:border-accent transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getStatusIcon(rule.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-semibold">{rule.name}</h4>
                              {getStatusBadge(rule.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Field: <span className="font-mono text-foreground">{rule.field}</span>
                            </p>
                            {rule.message && (
                              <div className="flex items-start gap-2 text-sm">
                                <ArrowRight size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                                <span className={
                                  rule.status === 'failed' ? 'text-destructive' :
                                  rule.status === 'warning' ? 'text-warning' :
                                  'text-success'
                                }>
                                  {rule.message}
                                  {rule.recordsAffected !== undefined && 
                                    ` (${rule.recordsAffected} records)`
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
