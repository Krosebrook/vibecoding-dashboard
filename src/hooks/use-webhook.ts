import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { webhookService, WebhookConnector, WebhookEvent } from '@/lib/webhook-connectors'

export function useWebhook(webhookId: string) {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [latestEvent, setLatestEvent] = useState<WebhookEvent | undefined>()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const webhook = webhookService.getWebhook(webhookId)
    if (!webhook) {
      setIsConnected(false)
      return
    }

    setIsConnected(webhook.status === 'active')
    setEvents(webhookService.getEvents(webhookId))
    setLatestEvent(webhookService.getLatestEvent(webhookId))

    const unsubscribe = webhookService.subscribe(webhookId, (event) => {
      setEvents((current) => [...current.slice(-49), event])
      setLatestEvent(event)
    })

    return () => {
      unsubscribe()
    }
  }, [webhookId])

  const clearEvents = useCallback(() => {
    webhookService.clearEvents(webhookId)
    setEvents([])
    setLatestEvent(undefined)
  }, [webhookId])

  const simulate = useCallback(async (payload?: any) => {
    return await webhookService.simulateWebhook(webhookId, payload)
  }, [webhookId])

  return {
    events,
    latestEvent,
    isConnected,
    clearEvents,
    simulate,
  }
}

export function useWebhookManager() {
  const [webhooks, setWebhooks] = useKV<WebhookConnector[]>('webhook-connectors', [])

  const createWebhook = useCallback((webhook: WebhookConnector) => {
    webhookService.registerWebhook(webhook)
    setWebhooks((current) => [...(current || []), webhook])
  }, [setWebhooks])

  const deleteWebhook = useCallback((webhookId: string) => {
    webhookService.unregisterWebhook(webhookId)
    setWebhooks((current) => (current || []).filter(w => w.id !== webhookId))
  }, [setWebhooks])

  const updateWebhook = useCallback((webhookId: string, updates: Partial<WebhookConnector>) => {
    const webhook = webhookService.getWebhook(webhookId)
    if (!webhook) return

    const updated = { ...webhook, ...updates }
    webhookService.unregisterWebhook(webhookId)
    webhookService.registerWebhook(updated)

    setWebhooks((current) =>
      (current || []).map(w => w.id === webhookId ? updated : w)
    )
  }, [setWebhooks])

  const toggleWebhook = useCallback((webhookId: string) => {
    const webhook = webhookService.getWebhook(webhookId)
    if (!webhook) return

    const newStatus = webhook.status === 'active' ? 'inactive' : 'active'
    webhookService.updateWebhookStatus(webhookId, newStatus)
    updateWebhook(webhookId, { status: newStatus })
  }, [updateWebhook])

  useEffect(() => {
    if (webhooks) {
      webhooks.forEach(webhook => {
        if (!webhookService.getWebhook(webhook.id)) {
          webhookService.registerWebhook(webhook)
        }
      })
    }
  }, [webhooks])

  return {
    webhooks: webhooks || [],
    createWebhook,
    deleteWebhook,
    updateWebhook,
    toggleWebhook,
  }
}
