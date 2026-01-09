import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowsDownUp, 
  Plus, 
  Trash, 
  PencilSimple, 
  Check,
  Warning,
  MagicWand
} from '@phosphor-icons/react'
import { WebhookTransformWizard, PayloadTransform } from './WebhookTransformWizard'
import { TransformFlowDiagram } from './TransformFlowDiagram'
import { useWebhookManager } from '@/hooks/use-webhook'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export function WebhookTransformManager() {
  const { webhooks } = useWebhookManager()
  const [transforms, setTransforms] = useKV<PayloadTransform[]>('webhook-transforms', [])
  const [editingTransform, setEditingTransform] = useState<PayloadTransform | undefined>()
  const [selectedWebhookId, setSelectedWebhookId] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSaveTransform = (transform: PayloadTransform) => {
    setTransforms((current) => {
      const existing = current?.find(t => t.id === transform.id)
      if (existing) {
        return (current || []).map(t => t.id === transform.id ? transform : t)
      }
      return [...(current || []), transform]
    })
    
    setDialogOpen(false)
    setEditingTransform(undefined)
    setSelectedWebhookId('')
  }

  const handleDeleteTransform = (id: string) => {
    setTransforms((current) => (current || []).filter(t => t.id !== id))
    toast.success('Transform deleted')
  }

  const handleEditTransform = (transform: PayloadTransform) => {
    setEditingTransform(transform)
    setSelectedWebhookId(transform.webhookId)
    setDialogOpen(true)
  }

  const handleCreateNew = () => {
    setEditingTransform(undefined)
    setSelectedWebhookId('')
    setDialogOpen(true)
  }

  const getWebhookName = (webhookId: string) => {
    const webhook = webhooks.find(w => w.id === webhookId)
    return webhook?.name || 'Unknown Webhook'
  }

  return (
    <>
      <TransformFlowDiagram />
      
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowsDownUp size={20} weight="duotone" className="text-accent" />
              Transform Manager
            </CardTitle>
            <CardDescription>
              Manage payload transformations for your webhooks
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateNew} size="sm">
                <Plus size={16} className="mr-2" />
                New Transform
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editingTransform ? 'Edit Transform' : 'Create Transform'}
                </DialogTitle>
                <DialogDescription>
                  Configure how webhook payloads are transformed into your data model
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {!editingTransform && webhooks.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium col-span-2 mb-2">Select Webhook</div>
                      {webhooks.map(webhook => (
                        <button
                          key={webhook.id}
                          onClick={() => setSelectedWebhookId(webhook.id)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedWebhookId === webhook.id
                              ? 'border-accent bg-accent/10'
                              : 'border-border hover:border-accent/50'
                          }`}
                        >
                          <div className="font-medium text-sm">{webhook.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {webhook.events.length} events
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {(selectedWebhookId || editingTransform) && (
                    <WebhookTransformWizard
                      webhookId={selectedWebhookId || editingTransform?.webhookId}
                      samplePayload={
                        webhooks.find(w => w.id === (selectedWebhookId || editingTransform?.webhookId))
                          ?.events[0]?.payload
                      }
                      onSave={handleSaveTransform}
                      existingTransform={editingTransform}
                    />
                  )}

                  {!selectedWebhookId && !editingTransform && webhooks.length === 0 && (
                    <Alert>
                      <Warning size={16} />
                      <AlertDescription>
                        Create a webhook first before setting up transformations
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!transforms || transforms.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
              <MagicWand size={32} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">No Transforms Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first payload transformation to map webhook data to your dashboard
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {transforms.map((transform) => (
                <motion.div
                  key={transform.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm">{transform.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {transform.mappings.length} mappings
                        </Badge>
                        {transform.outputFormat !== 'flat' && (
                          <Badge variant="secondary" className="text-xs">
                            {transform.outputFormat}
                          </Badge>
                        )}
                      </div>
                      
                      {transform.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {transform.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Webhook:</span>
                        <span className="font-medium">{getWebhookName(transform.webhookId)}</span>
                      </div>

                      {transform.mappings.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Sample Mappings:
                          </div>
                          {transform.mappings.slice(0, 3).map((mapping, idx) => (
                            <div key={idx} className="text-xs font-mono flex items-center gap-2 text-muted-foreground">
                              <code className="text-primary">{mapping.sourcePath}</code>
                              <span>→</span>
                              <code className="text-accent">{mapping.targetField}</code>
                              {mapping.transformType !== 'direct' && (
                                <Badge variant="outline" className="text-xs">
                                  {mapping.transformType}
                                </Badge>
                              )}
                            </div>
                          ))}
                          {transform.mappings.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              + {transform.mappings.length - 3} more mappings
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTransform(transform)}
                      >
                        <PencilSimple size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransform(transform.id)}
                      >
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}

        {transforms && transforms.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2 text-xs">
              <Check size={14} className="text-accent mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                Transforms are automatically applied to incoming webhook payloads before they're passed to your dashboard components
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  )
}
