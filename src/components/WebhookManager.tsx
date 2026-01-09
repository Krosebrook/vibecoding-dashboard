import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useWebhookManager, useWebhook } from '@/hooks/use-webhook'
import { webhookTemplates, WebhookConnector } from '@/lib/webhook-connectors'
import { Plus, Lightning, Check, X, Copy, Play, Trash, CloudArrowDown, CircleNotch, WarningCircle, Plugs } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function WebhookManager() {
  const { webhooks, createWebhook, deleteWebhook, toggleWebhook } = useWebhookManager()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [webhookName, setWebhookName] = useState('')
  const [webhookDescription, setWebhookDescription] = useState('')
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null)

  const handleCreateFromTemplate = () => {
    const template = webhookTemplates.find(t => t.id === selectedTemplate)
    if (!template || !webhookName) {
      toast.error('Please select a template and provide a name')
      return
    }

    const endpoint = `webhook_${Date.now()}`
    
    const newWebhook: WebhookConnector = {
      id: `wh_${Date.now()}`,
      name: webhookName,
      description: webhookDescription || template.description,
      endpoint,
      status: 'active',
      events: [],
      config: {
        authType: template.config.authType || 'none',
        signatureHeader: template.config.signatureHeader,
        signatureAlgorithm: template.config.signatureAlgorithm,
        autoAck: template.config.autoAck !== false,
        bufferSize: template.config.bufferSize || 100,
      },
      createdAt: new Date().toISOString(),
    }

    createWebhook(newWebhook)
    toast.success(`Webhook "${webhookName}" created successfully!`)
    
    setCreateDialogOpen(false)
    setWebhookName('')
    setWebhookDescription('')
    setSelectedTemplate('')
  }

  const handleCopyEndpoint = (endpoint: string) => {
    const fullUrl = `${window.location.origin}/webhooks/${endpoint}`
    navigator.clipboard.writeText(fullUrl)
    toast.success('Endpoint URL copied to clipboard!')
  }

  const handleDelete = (webhookId: string, webhookName: string) => {
    if (confirm(`Are you sure you want to delete webhook "${webhookName}"?`)) {
      deleteWebhook(webhookId)
      toast.success('Webhook deleted')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plugs size={20} weight="duotone" className="text-accent" />
              Webhook Connectors
            </CardTitle>
            <CardDescription>
              Receive real-time push data from external services
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                <Plus size={16} className="mr-2" />
                Create Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Webhook Connector</DialogTitle>
                <DialogDescription>
                  Set up a webhook endpoint to receive real-time events
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Webhook Name</Label>
                  <Input
                    id="webhook-name"
                    placeholder="My Webhook"
                    value={webhookName}
                    onChange={(e) => setWebhookName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-description">Description (Optional)</Label>
                  <Textarea
                    id="webhook-description"
                    placeholder="What this webhook receives..."
                    value={webhookDescription}
                    onChange={(e) => setWebhookDescription(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="template-select">Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="template-select">
                      <SelectValue placeholder="Choose a webhook template" />
                    </SelectTrigger>
                    <SelectContent>
                      {webhookTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <span>{template.icon}</span>
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="text-sm font-medium">
                      {webhookTemplates.find(t => t.id === selectedTemplate)?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {webhookTemplates.find(t => t.id === selectedTemplate)?.documentation}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFromTemplate} disabled={!selectedTemplate || !webhookName}>
                    <Lightning size={16} className="mr-2" />
                    Create Webhook
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {webhooks.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
              <Plugs size={32} weight="duotone" className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">No webhooks configured</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a webhook to start receiving real-time events
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <WebhookCard
                  key={webhook.id}
                  webhook={webhook}
                  onToggle={() => toggleWebhook(webhook.id)}
                  onCopyEndpoint={() => handleCopyEndpoint(webhook.endpoint)}
                  onDelete={() => handleDelete(webhook.id, webhook.name)}
                  onSelect={() => setSelectedWebhook(webhook.id)}
                  isSelected={selectedWebhook === webhook.id}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {selectedWebhook && (
          <div className="mt-4 pt-4 border-t border-border">
            <WebhookEventViewer webhookId={selectedWebhook} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface WebhookCardProps {
  webhook: WebhookConnector
  onToggle: () => void
  onCopyEndpoint: () => void
  onDelete: () => void
  onSelect: () => void
  isSelected: boolean
}

function WebhookCard({ webhook, onToggle, onCopyEndpoint, onDelete, onSelect, isSelected }: WebhookCardProps) {
  const { simulate } = useWebhook(webhook.id)
  const [isTesting, setIsTesting] = useState(false)

  const handleTest = async () => {
    setIsTesting(true)
    const result = await simulate()
    setIsTesting(false)
    
    if (result.success) {
      toast.success('Test event sent successfully!')
    } else {
      toast.error(`Test failed: ${result.error}`)
    }
  }

  const statusColor = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    error: 'bg-red-500',
  }[webhook.status]

  const statusIcon = {
    active: <Check size={12} weight="bold" />,
    inactive: <X size={12} weight="bold" />,
    error: <WarningCircle size={12} weight="bold" />,
  }[webhook.status]

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isSelected ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{webhook.name}</h4>
            <Badge variant="outline" className="gap-1">
              <div className={`w-2 h-2 rounded-full ${statusColor}`} />
              {statusIcon}
              {webhook.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{webhook.description}</p>
          
          <div className="flex items-center gap-2 mt-3">
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1 truncate">
              /webhooks/{webhook.endpoint}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onCopyEndpoint()
              }}
              className="h-7 w-7 p-0"
            >
              <Copy size={14} />
            </Button>
          </div>

          {webhook.lastReceivedAt && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <CloudArrowDown size={12} />
              Last received: {new Date(webhook.lastReceivedAt).toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Switch
            checked={webhook.status === 'active'}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleTest()
            }}
            disabled={isTesting}
            className="h-8 w-8 p-0"
          >
            {isTesting ? <CircleNotch size={14} className="animate-spin" /> : <Play size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}

function WebhookEventViewer({ webhookId }: { webhookId: string }) {
  const { events, latestEvent, clearEvents } = useWebhook(webhookId)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Recent Events</div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{events.length} events</Badge>
          {events.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearEvents}>
              <Trash size={14} className="mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No events received yet. Test the webhook to see events here.
        </div>
      ) : (
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {events.slice().reverse().map((event) => (
              <div
                key={event.id}
                className="p-3 bg-muted rounded-lg text-xs font-mono space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono">
                    {event.eventType}
                  </Badge>
                  <span className="text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {latestEvent && (
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <div className="text-xs font-semibold text-accent mb-2">Latest Event</div>
          <div className="text-xs font-mono">
            <div className="flex items-center justify-between mb-2">
              <Badge>{latestEvent.eventType}</Badge>
              <span className="text-muted-foreground">
                {new Date(latestEvent.timestamp).toLocaleString()}
              </span>
            </div>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(latestEvent.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
