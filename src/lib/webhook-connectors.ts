export interface WebhookConnector {
  id: string
  name: string
  description: string
  endpoint: string
  secret?: string
  status: 'active' | 'inactive' | 'error'
  events: WebhookEvent[]
  config: WebhookConfig
  transform?: (payload: any) => any
  validation?: (payload: any, headers: Record<string, string>) => boolean
  createdAt: string
  lastReceivedAt?: string
}

export interface WebhookConfig {
  authType: 'none' | 'secret' | 'signature' | 'bearer'
  signatureHeader?: string
  signatureAlgorithm?: 'sha256' | 'sha1' | 'md5'
  allowedOrigins?: string[]
  retryAttempts?: number
  bufferSize?: number
  autoAck?: boolean
}

export interface WebhookEvent {
  id: string
  webhookId: string
  eventType: string
  payload: any
  headers: Record<string, string>
  timestamp: number
  processed: boolean
  error?: string
}

export interface WebhookTemplate {
  id: string
  name: string
  description: string
  provider: string
  icon: string
  config: Partial<WebhookConfig>
  samplePayload: any
  documentation: string
}

type WebhookSubscriber = (event: WebhookEvent) => void | Promise<void>

class WebhookService {
  private webhooks: Map<string, WebhookConnector> = new Map()
  private eventBuffers: Map<string, WebhookEvent[]> = new Map()
  private subscribers: Map<string, Set<WebhookSubscriber>> = new Map()
  private eventCounter = 0

  registerWebhook(webhook: WebhookConnector): void {
    this.webhooks.set(webhook.id, webhook)
    this.eventBuffers.set(webhook.id, [])
    this.subscribers.set(webhook.id, new Set())
  }

  unregisterWebhook(webhookId: string): void {
    this.webhooks.delete(webhookId)
    this.eventBuffers.delete(webhookId)
    this.subscribers.delete(webhookId)
  }

  getWebhook(webhookId: string): WebhookConnector | undefined {
    return this.webhooks.get(webhookId)
  }

  getAllWebhooks(): WebhookConnector[] {
    return Array.from(this.webhooks.values())
  }

  subscribe(webhookId: string, callback: WebhookSubscriber): () => void {
    const subscribers = this.subscribers.get(webhookId)
    if (!subscribers) {
      throw new Error(`Webhook ${webhookId} not found`)
    }

    subscribers.add(callback)

    return () => {
      subscribers.delete(callback)
    }
  }

  async receiveWebhook(
    webhookId: string,
    payload: any,
    headers: Record<string, string> = {}
  ): Promise<{ success: boolean; error?: string }> {
    const webhook = this.webhooks.get(webhookId)
    
    if (!webhook) {
      return { success: false, error: 'Webhook not found' }
    }

    if (webhook.status !== 'active') {
      return { success: false, error: 'Webhook is not active' }
    }

    if (webhook.validation && !webhook.validation(payload, headers)) {
      return { success: false, error: 'Webhook validation failed' }
    }

    try {
      const transformedPayload = webhook.transform ? webhook.transform(payload) : payload

      const event: WebhookEvent = {
        id: `evt_${++this.eventCounter}_${Date.now()}`,
        webhookId,
        eventType: payload.event || payload.type || 'unknown',
        payload: transformedPayload,
        headers,
        timestamp: Date.now(),
        processed: false,
      }

      const buffer = this.eventBuffers.get(webhookId)!
      const maxBuffer = webhook.config.bufferSize || 100
      
      buffer.push(event)
      if (buffer.length > maxBuffer) {
        buffer.shift()
      }

      webhook.lastReceivedAt = new Date().toISOString()
      webhook.events = [...webhook.events, event]

      await this.notifySubscribers(webhookId, event)

      if (webhook.config.autoAck !== false) {
        event.processed = true
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  getEvents(webhookId: string, limit = 50): WebhookEvent[] {
    const buffer = this.eventBuffers.get(webhookId)
    if (!buffer) return []
    
    return buffer.slice(-limit)
  }

  getLatestEvent(webhookId: string): WebhookEvent | undefined {
    const buffer = this.eventBuffers.get(webhookId)
    if (!buffer || buffer.length === 0) return undefined
    
    return buffer[buffer.length - 1]
  }

  clearEvents(webhookId: string): void {
    const buffer = this.eventBuffers.get(webhookId)
    if (buffer) {
      buffer.length = 0
    }
  }

  private async notifySubscribers(webhookId: string, event: WebhookEvent): Promise<void> {
    const subscribers = this.subscribers.get(webhookId)
    if (!subscribers) return

    const promises = Array.from(subscribers).map(async (callback) => {
      try {
        await callback(event)
      } catch (error) {
        console.error('Subscriber error:', error)
      }
    })

    await Promise.all(promises)
  }

  updateWebhookStatus(webhookId: string, status: 'active' | 'inactive' | 'error'): void {
    const webhook = this.webhooks.get(webhookId)
    if (webhook) {
      webhook.status = status
    }
  }

  simulateWebhook(webhookId: string, payload?: any): Promise<{ success: boolean; error?: string }> {
    const webhook = this.webhooks.get(webhookId)
    if (!webhook) {
      return Promise.resolve({ success: false, error: 'Webhook not found' })
    }

    const template = webhookTemplates.find(t => t.provider === webhook.name.split(' ')[0].toLowerCase())
    const samplePayload = payload || template?.samplePayload || { event: 'test', data: { message: 'Test webhook event' } }

    return this.receiveWebhook(webhookId, samplePayload, {
      'content-type': 'application/json',
      'user-agent': 'webhook-simulator',
    })
  }
}

export const webhookService = new WebhookService()

export const webhookTemplates: WebhookTemplate[] = [
  {
    id: 'github-webhook',
    name: 'GitHub Webhook',
    description: 'Receive events from GitHub repositories',
    provider: 'github',
    icon: '🐙',
    config: {
      authType: 'signature',
      signatureHeader: 'X-Hub-Signature-256',
      signatureAlgorithm: 'sha256',
      autoAck: true,
    },
    samplePayload: {
      event: 'push',
      repository: {
        name: 'my-repo',
        full_name: 'user/my-repo',
        stars: 42,
      },
      pusher: {
        name: 'developer',
        email: 'dev@example.com',
      },
      commits: [
        {
          id: 'abc123',
          message: 'Fix bug in production',
          author: { name: 'developer' },
          timestamp: new Date().toISOString(),
        },
      ],
    },
    documentation: 'Configure GitHub webhook in repository Settings > Webhooks',
  },
  {
    id: 'stripe-webhook',
    name: 'Stripe Webhook',
    description: 'Receive payment and subscription events from Stripe',
    provider: 'stripe',
    icon: '💳',
    config: {
      authType: 'signature',
      signatureHeader: 'Stripe-Signature',
      signatureAlgorithm: 'sha256',
      autoAck: true,
    },
    samplePayload: {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          amount: 2000,
          currency: 'usd',
          status: 'succeeded',
          customer: 'cus_123',
        },
      },
      created: Math.floor(Date.now() / 1000),
    },
    documentation: 'Configure Stripe webhook in Dashboard > Developers > Webhooks',
  },
  {
    id: 'slack-webhook',
    name: 'Slack Webhook',
    description: 'Receive events from Slack workspace',
    provider: 'slack',
    icon: '💬',
    config: {
      authType: 'secret',
      autoAck: true,
    },
    samplePayload: {
      type: 'message',
      event: {
        type: 'message',
        channel: 'C123456',
        user: 'U123456',
        text: 'Hello from Slack!',
        ts: Date.now().toString(),
      },
      team_id: 'T123456',
    },
    documentation: 'Create Slack app at api.slack.com and enable Event Subscriptions',
  },
  {
    id: 'shopify-webhook',
    name: 'Shopify Webhook',
    description: 'Receive order and product events from Shopify',
    provider: 'shopify',
    icon: '🛍️',
    config: {
      authType: 'signature',
      signatureHeader: 'X-Shopify-Hmac-SHA256',
      signatureAlgorithm: 'sha256',
      autoAck: true,
    },
    samplePayload: {
      event: 'orders/create',
      id: 820982911946154500,
      email: 'customer@example.com',
      total_price: '199.99',
      currency: 'USD',
      line_items: [
        {
          title: 'Product Name',
          quantity: 2,
          price: '99.99',
        },
      ],
      created_at: new Date().toISOString(),
    },
    documentation: 'Configure webhooks in Shopify Admin > Settings > Notifications',
  },
  {
    id: 'twilio-webhook',
    name: 'Twilio Webhook',
    description: 'Receive SMS and voice call events from Twilio',
    provider: 'twilio',
    icon: '📱',
    config: {
      authType: 'signature',
      signatureHeader: 'X-Twilio-Signature',
      signatureAlgorithm: 'sha1',
      autoAck: true,
    },
    samplePayload: {
      MessageSid: 'SM123456789',
      From: '+15551234567',
      To: '+15559876543',
      Body: 'Hello from Twilio',
      MessageStatus: 'received',
      NumMedia: '0',
      ApiVersion: '2010-04-01',
    },
    documentation: 'Configure webhook URL in Twilio Console for phone numbers or messaging services',
  },
  {
    id: 'sendgrid-webhook',
    name: 'SendGrid Webhook',
    description: 'Receive email delivery and engagement events',
    provider: 'sendgrid',
    icon: '📧',
    config: {
      authType: 'bearer',
      autoAck: true,
    },
    samplePayload: [
      {
        email: 'recipient@example.com',
        event: 'delivered',
        timestamp: Math.floor(Date.now() / 1000),
        sg_message_id: 'msg123',
        smtp_id: '<smtp123@example.com>',
      },
    ],
    documentation: 'Configure Event Webhook in SendGrid Settings > Mail Settings > Event Webhook',
  },
  {
    id: 'webhook-site',
    name: 'Webhook.site Integration',
    description: 'Test webhooks with webhook.site proxy',
    provider: 'webhook-site',
    icon: '🔗',
    config: {
      authType: 'none',
      autoAck: true,
    },
    samplePayload: {
      event: 'test',
      timestamp: Date.now(),
      data: {
        message: 'Test webhook from webhook.site',
        source: 'webhook-connector',
      },
    },
    documentation: 'Visit webhook.site to generate a unique URL for testing',
  },
  {
    id: 'zapier-webhook',
    name: 'Zapier Webhook',
    description: 'Receive events from Zapier automation',
    provider: 'zapier',
    icon: '⚡',
    config: {
      authType: 'none',
      autoAck: true,
    },
    samplePayload: {
      event: 'zap_triggered',
      zap_id: 'zap_123',
      data: {
        field1: 'value1',
        field2: 'value2',
      },
      timestamp: new Date().toISOString(),
    },
    documentation: 'Use Webhooks by Zapier action to send data to your endpoint',
  },
  {
    id: 'discord-webhook',
    name: 'Discord Webhook',
    description: 'Receive events from Discord server',
    provider: 'discord',
    icon: '🎮',
    config: {
      authType: 'none',
      autoAck: true,
    },
    samplePayload: {
      type: 'message',
      content: 'New message in Discord',
      author: {
        id: '123456789',
        username: 'User',
        discriminator: '1234',
      },
      channel_id: '987654321',
      timestamp: new Date().toISOString(),
    },
    documentation: 'Create webhook in Discord Server Settings > Integrations',
  },
  {
    id: 'custom-webhook',
    name: 'Custom Webhook',
    description: 'Generic webhook for any service',
    provider: 'custom',
    icon: '🔧',
    config: {
      authType: 'none',
      autoAck: true,
      bufferSize: 100,
    },
    samplePayload: {
      event: 'custom_event',
      timestamp: Date.now(),
      data: {},
    },
    documentation: 'Configure custom webhook to match your service requirements',
  },
]
