import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Stack, 
  Lightning, 
  Clock, 
  ArrowCounterClockwise,
  Gauge,
  Play,
  Pause
} from '@phosphor-icons/react'
import { BatchConfig } from '@/lib/types'
import { toast } from 'sonner'

interface BatchManagerProps {
  onConfigChange?: (config: BatchConfig) => void
}

export function BatchManager({ onConfigChange }: BatchManagerProps) {
  const [config, setConfig] = useKV<BatchConfig>('batch-config', {
    size: 100,
    parallel: 3,
    delayMs: 100,
    retryAttempts: 3,
    retryDelayMs: 1000,
  })

  const [autoTuning, setAutoTuning] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResults, setSimulationResults] = useState<{
    throughput: number
    avgLatency: number
    errorRate: number
  } | null>(null)

  const updateConfig = (updates: Partial<BatchConfig>) => {
    const currentConfig = config || {
      size: 100,
      parallel: 3,
      delayMs: 100,
      retryAttempts: 3,
      retryDelayMs: 1000,
    }
    const newConfig = { ...currentConfig, ...updates }
    setConfig(newConfig)
    if (onConfigChange) {
      onConfigChange(newConfig)
    }
  }

  const runSimulation = async () => {
    setIsSimulating(true)
    toast.loading('Simulating batch configuration...')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const currentConfig = config || { size: 100, parallel: 3, delayMs: 100, retryAttempts: 3, retryDelayMs: 1000 }
    const results = {
      throughput: 150 + (currentConfig.parallel * currentConfig.size / 10) * (1 - currentConfig.delayMs / 1000),
      avgLatency: currentConfig.delayMs + (100 / currentConfig.parallel),
      errorRate: Math.max(0.5, 5 - currentConfig.retryAttempts),
    }
    
    setSimulationResults(results)
    setIsSimulating(false)
    toast.success('Simulation complete')
  }

  const applyPreset = (preset: 'conservative' | 'balanced' | 'aggressive') => {
    const presets: Record<string, BatchConfig> = {
      conservative: {
        size: 50,
        parallel: 2,
        delayMs: 200,
        retryAttempts: 5,
        retryDelayMs: 2000,
      },
      balanced: {
        size: 100,
        parallel: 3,
        delayMs: 100,
        retryAttempts: 3,
        retryDelayMs: 1000,
      },
      aggressive: {
        size: 500,
        parallel: 10,
        delayMs: 0,
        retryAttempts: 1,
        retryDelayMs: 500,
      },
    }
    
    setConfig(presets[preset])
    toast.success(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied`)
  }

  const currentConfig = config || { size: 100, parallel: 3, delayMs: 100, retryAttempts: 3, retryDelayMs: 1000 }
  const estimatedThroughput = Math.round((currentConfig.size * currentConfig.parallel * 1000) / (currentConfig.delayMs + 50))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stack size={24} weight="duotone" />
            Batch Configuration
          </CardTitle>
          <CardDescription>
            Fine-tune batch processing parameters for optimal performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Label>Configuration Presets</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => applyPreset('conservative')}>
                Conservative
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('balanced')}>
                Balanced
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('aggressive')}>
                Aggressive
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="batch-size">Batch Size</Label>
                <Badge variant="secondary">{currentConfig.size} records/batch</Badge>
              </div>
              <Slider
                id="batch-size"
                value={[currentConfig.size]}
                onValueChange={([value]) => updateConfig({ size: value })}
                min={10}
                max={1000}
                step={10}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of records processed in each batch
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="parallel">Parallel Batches</Label>
                <Badge variant="secondary">{currentConfig.parallel} concurrent</Badge>
              </div>
              <Slider
                id="parallel"
                value={[currentConfig.parallel]}
                onValueChange={([value]) => updateConfig({ parallel: value })}
                min={1}
                max={20}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of batches processed simultaneously
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="delay">Batch Delay</Label>
                <Badge variant="secondary">{currentConfig.delayMs}ms</Badge>
              </div>
              <Slider
                id="delay"
                value={[currentConfig.delayMs]}
                onValueChange={([value]) => updateConfig({ delayMs: value })}
                min={0}
                max={1000}
                step={50}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Delay between batch executions (rate limiting)
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="retry-attempts">Retry Attempts</Label>
                <Badge variant="secondary">{currentConfig.retryAttempts} attempts</Badge>
              </div>
              <Slider
                id="retry-attempts"
                value={[currentConfig.retryAttempts]}
                onValueChange={([value]) => updateConfig({ retryAttempts: value })}
                min={0}
                max={10}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of retry attempts for failed batches
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="retry-delay">Retry Delay</Label>
                <Badge variant="secondary">{currentConfig.retryDelayMs}ms</Badge>
              </div>
              <Slider
                id="retry-delay"
                value={[currentConfig.retryDelayMs]}
                onValueChange={([value]) => updateConfig({ retryDelayMs: value })}
                min={100}
                max={5000}
                step={100}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Delay before retrying failed batches (exponential backoff)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Lightning size={20} className="text-accent" weight="duotone" />
              <div>
                <div className="font-semibold">Estimated Throughput</div>
                <div className="text-xs text-muted-foreground">
                  Based on current configuration
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-accent">
              {estimatedThroughput} <span className="text-sm font-normal text-muted-foreground">rec/s</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-tuning"
                checked={autoTuning}
                onCheckedChange={setAutoTuning}
              />
              <Label htmlFor="auto-tuning" className="cursor-pointer">
                Auto-tune during migration
              </Label>
            </div>
            <Button onClick={runSimulation} disabled={isSimulating}>
              {isSimulating ? (
                <>
                  <Pause size={16} className="mr-2" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" weight="fill" />
                  Simulate
                </>
              )}
            </Button>
          </div>

          {simulationResults && (
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Simulation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Throughput</div>
                    <div className="text-xl font-semibold text-success">
                      {simulationResults.throughput.toFixed(0)} rec/s
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Avg Latency</div>
                    <div className="text-xl font-semibold text-info">
                      {simulationResults.avgLatency.toFixed(0)}ms
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Error Rate</div>
                    <div className="text-xl font-semibold text-warning">
                      {simulationResults.errorRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Stack size={20} className="text-accent mt-0.5" weight="duotone" />
            <div>
              <div className="font-medium">Batch Size</div>
              <p className="text-sm text-muted-foreground">
                Larger batches improve throughput but use more memory. Start with 100-500 records.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Gauge size={20} className="text-primary mt-0.5" weight="duotone" />
            <div>
              <div className="font-medium">Parallel Processing</div>
              <p className="text-sm text-muted-foreground">
                Match your database connection pool size. Too many parallel batches can overwhelm the database.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-info mt-0.5" weight="duotone" />
            <div>
              <div className="font-medium">Rate Limiting</div>
              <p className="text-sm text-muted-foreground">
                Add delays if your database has rate limits or if you're seeing connection errors.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ArrowCounterClockwise size={20} className="text-warning mt-0.5" weight="duotone" />
            <div>
              <div className="font-medium">Retry Strategy</div>
              <p className="text-sm text-muted-foreground">
                More retries improve reliability but slow down migrations. Use exponential backoff for transient errors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
