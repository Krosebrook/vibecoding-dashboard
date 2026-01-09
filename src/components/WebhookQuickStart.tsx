import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWebhookManager } from '@/hooks/use-webhook'
import { webhookTemplates } from '@/lib/webhook-connectors'
import { Lightning, Play, CheckCircle, XCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function WebhookQuickStart() {
  const { webhooks, createWebhook } = useWebhookManager()
  const [isCreating, setIsCreating] = useState(false)

  const quickCreateWebhook = async (templateId: string) => {
    setIsCreating(true)
    const template = webhookTemplates.find(t => t.id === templateId)
    if (!template) return

    const endpoint = `webhook_${Date.now()}`
    
    const newWebhook = {
      id: `wh_${Date.now()}`,
      name: `${template.name} Demo`,
      description: `Demo webhook for ${template.provider}`,
      endpoint,
      status: 'active' as const,
      events: [],
      config: {
        authType: template.config.authType || 'none' as const,
        signatureHeader: template.config.signatureHeader,
        signatureAlgorithm: template.config.signatureAlgorithm,
        autoAck: template.config.autoAck !== false,
        bufferSize: template.config.bufferSize || 100,
      },
      createdAt: new Date().toISOString(),
    }

    createWebhook(newWebhook)
    
    setTimeout(() => {
      setIsCreating(false)
      toast.success(`${template.name} created! Test it with the Play button.`)
    }, 500)
  }

  const popularTemplates = webhookTemplates.filter(t => 
    ['github-webhook', 'stripe-webhook', 'slack-webhook', 'custom-webhook'].includes(t.id)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightning size={20} weight="duotone" className="text-secondary" />
          Webhook Quick Start
        </CardTitle>
        <CardDescription>
          Create popular webhook connectors in one click
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {webhooks && webhooks.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} weight="fill" className="text-green-500" />
              <span className="text-sm font-medium">
                {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} active
              </span>
            </div>
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                Your Webhooks
              </div>
              <ScrollArea className="h-[100px]">
                <div className="space-y-1">
                  {webhooks.map(webhook => (
                    <div key={webhook.id} className="flex items-center justify-between py-1">
                      <span className="text-sm">{webhook.name}</span>
                      <Badge 
                        variant={webhook.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {webhook.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Get started with these popular webhook integrations:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {popularTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-auto py-3 flex flex-col gap-2 items-start hover:border-accent"
                  onClick={() => quickCreateWebhook(template.id)}
                  disabled={isCreating}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold">{template.name}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-left">
                    {template.provider}
                  </div>
                </Button>
              ))}
            </div>
            <div className="pt-2 text-xs text-center text-muted-foreground">
              Click to create • Test with <Play size={12} className="inline" /> button
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
