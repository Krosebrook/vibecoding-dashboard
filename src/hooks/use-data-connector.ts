import { useState, useEffect, useCallback } from 'react'
import { 
  DataConnector, 
  dataConnectorService, 
  ConnectorExecutionResult,
  DrillDownConfig 
} from '@/lib/data-connectors'

interface UseDataConnectorOptions {
  autoFetch?: boolean
  refreshInterval?: number
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useDataConnector(
  connector: DataConnector | null,
  context?: Record<string, any>,
  options: UseDataConnectorOptions = {}
) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ConnectorExecutionResult | null>(null)

  const execute = useCallback(async () => {
    if (!connector) {
      setError('No connector provided')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const executionResult = await dataConnectorService.executeConnector(connector, context)
      setResult(executionResult)

      if (executionResult.success) {
        setData(executionResult.data)
        options.onSuccess?.(executionResult.data)
      } else {
        setError(executionResult.error || 'Unknown error')
        options.onError?.(executionResult.error || 'Unknown error')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute connector'
      setError(errorMessage)
      options.onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [connector, context, options])

  useEffect(() => {
    if (options.autoFetch && connector) {
      execute()
    }
  }, [options.autoFetch, connector, execute])

  useEffect(() => {
    if (options.refreshInterval && connector && options.autoFetch) {
      const interval = setInterval(() => {
        execute()
      }, options.refreshInterval)

      return () => clearInterval(interval)
    }
  }, [options.refreshInterval, options.autoFetch, connector, execute])

  return {
    data,
    loading,
    error,
    result,
    execute,
    refetch: execute,
  }
}

interface UseDrillDownOptions {
  onDrillDown?: (level: number, data: any) => void
  onNavigateBack?: (level: number) => void
}

export function useDrillDown(
  drillDownConfig: DrillDownConfig | null,
  options: UseDrillDownOptions = {}
) {
  const [drillStack, setDrillStack] = useState<Array<{ level: number; data: any; context: any }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentLevel = drillStack.length
  const currentData = drillStack[drillStack.length - 1]?.data

  const drillDown = useCallback(async (context: Record<string, any>) => {
    if (!drillDownConfig || !drillDownConfig.enabled) {
      setError('Drill-down not enabled')
      return
    }

    if (currentLevel >= drillDownConfig.levels.length) {
      setError('Maximum drill-down level reached')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await dataConnectorService.executeDrillDown(
        drillDownConfig,
        currentLevel,
        context
      )

      if (result.success) {
        setDrillStack(prev => [...prev, {
          level: currentLevel,
          data: result.data,
          context,
        }])
        options.onDrillDown?.(currentLevel, result.data)
      } else {
        setError(result.error || 'Drill-down failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to drill down'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [drillDownConfig, currentLevel, options])

  const navigateTo = useCallback((levelIndex: number) => {
    if (levelIndex === -1) {
      setDrillStack([])
      options.onNavigateBack?.(-1)
    } else if (levelIndex >= 0 && levelIndex < drillStack.length) {
      setDrillStack(prev => prev.slice(0, levelIndex + 1))
      options.onNavigateBack?.(levelIndex)
    }
  }, [drillStack, options])

  const reset = useCallback(() => {
    setDrillStack([])
    setError(null)
  }, [])

  return {
    drillStack,
    currentLevel,
    currentData,
    loading,
    error,
    drillDown,
    navigateTo,
    reset,
    canDrillDown: drillDownConfig?.enabled && currentLevel < (drillDownConfig?.levels.length || 0),
  }
}

export function useConnectorWithDrillDown(
  connector: DataConnector | null,
  drillDownConfig: DrillDownConfig | null,
  initialContext?: Record<string, any>
) {
  const mainConnector = useDataConnector(connector, initialContext, {
    autoFetch: true,
  })

  const drillDown = useDrillDown(drillDownConfig, {
    onDrillDown: (level, data) => {
      console.log(`Drilled down to level ${level}`, data)
    },
  })

  const activeData = drillDown.currentData || mainConnector.data

  return {
    ...mainConnector,
    ...drillDown,
    activeData,
    isInDrillDown: drillDown.drillStack.length > 0,
  }
}
