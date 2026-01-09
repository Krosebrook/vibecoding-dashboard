# Webhook Connectors Documentation

## Overview

Webhook Connectors enable your Dashboard VibeCoder application to receive real-time push data from external services. Unlike traditional API connectors that poll for data, webhooks allow external services to push data to your dashboard instantly when events occur.

## Key Features

- **Real-Time Data Reception**: Receive events instantly as they happen in external services
- **Multiple Provider Support**: Pre-configured templates for popular services (GitHub, Stripe, Slack, etc.)
- **Event Buffering**: Store and display recent webhook events for monitoring and debugging
- **Security**: Support for multiple authentication methods including signatures, secrets, and bearer tokens
- **Test Mode**: Simulate webhook events to test your integration before going live
- **Event Viewer**: Inspect payloads and debug webhook integrations with built-in event viewer

## Supported Webhook Templates

### 1. GitHub Webhook 🐙
Receive events from GitHub repositories (push, pull requests, issues, etc.)
- **Auth Type**: Signature (SHA-256)
- **Use Case**: CI/CD triggers, code analytics, deployment notifications

### 2. Stripe Webhook 💳
Receive payment and subscription events from Stripe
- **Auth Type**: Signature (SHA-256)
- **Use Case**: Payment confirmations, subscription updates, invoice notifications

### 3. Slack Webhook 💬
Receive events from Slack workspace (messages, reactions, commands)
- **Auth Type**: Secret verification
- **Use Case**: Team notifications, command handlers, chat analytics

### 4. Shopify Webhook 🛍️
Receive order and product events from Shopify stores
- **Auth Type**: HMAC signature (SHA-256)
- **Use Case**: Order processing, inventory updates, customer notifications

### 5. Twilio Webhook 📱
Receive SMS and voice call events from Twilio
- **Auth Type**: Signature (SHA-1)
- **Use Case**: SMS receipts, call logs, delivery confirmations

### 6. SendGrid Webhook 📧
Receive email delivery and engagement events
- **Auth Type**: Bearer token
- **Use Case**: Email delivery tracking, bounce handling, open/click analytics

### 7. Discord Webhook 🎮
Receive events from Discord servers
- **Auth Type**: None (use URL secret)
- **Use Case**: Server moderation, activity tracking, bot integrations

### 8. Zapier Webhook ⚡
Receive events from Zapier automation workflows
- **Auth Type**: None (configurable)
- **Use Case**: Multi-service automation, data synchronization

### 9. Custom Webhook 🔧
Generic webhook for any service
- **Auth Type**: Configurable
- **Use Case**: Any custom integration or service

## Getting Started

### Step 1: Create a Webhook

1. Click **"Create Webhook"** button in the Webhook Connectors card
2. Enter a descriptive name (e.g., "GitHub Production Repo")
3. Optionally add a description
4. Select a webhook template from the dropdown
5. Click **"Create Webhook"**

### Step 2: Get Your Webhook Endpoint

After creating a webhook, you'll see an endpoint URL like:
```
https://your-app-domain/webhooks/webhook_1234567890
```

Copy this URL by clicking the copy button.

### Step 3: Configure External Service

Configure the external service to send webhooks to your endpoint:

**Example: GitHub**
1. Go to your GitHub repository
2. Navigate to Settings > Webhooks
3. Click "Add webhook"
4. Paste your webhook endpoint URL
5. Select events you want to receive
6. Save webhook

**Example: Stripe**
1. Go to Stripe Dashboard
2. Navigate to Developers > Webhooks
3. Click "Add endpoint"
4. Paste your webhook endpoint URL
5. Select events to listen for
6. Save endpoint

### Step 4: Test Your Webhook

1. Click the **Play** button on your webhook card to send a test event
2. Check the "Recent Events" section to see if the test event was received
3. Inspect the payload to ensure data format is correct

### Step 5: Monitor Events

- Toggle webhooks on/off using the switch
- View real-time events in the Event Viewer
- Check "Last received" timestamp to monitor activity
- Clear old events with the "Clear" button

## Using Webhook Data in Dashboards

### React Hook Example

```typescript
import { useWebhook } from '@/hooks/use-webhook'

function MyComponent() {
  const { events, latestEvent, isConnected } = useWebhook('your-webhook-id')
  
  return (
    <div>
      <h3>Connection: {isConnected ? 'Active' : 'Inactive'}</h3>
      <p>Total Events: {events.length}</p>
      {latestEvent && (
        <div>
          <h4>Latest: {latestEvent.eventType}</h4>
          <pre>{JSON.stringify(latestEvent.payload, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
```

### Subscribe to Events

```typescript
import { webhookService } from '@/lib/webhook-connectors'

const unsubscribe = webhookService.subscribe('webhook-id', (event) => {
  console.log('New webhook event:', event)
  // Process event data
  // Update dashboard state
  // Trigger notifications
})

// Clean up subscription
unsubscribe()
```

### Manual Event Reception

```typescript
import { webhookService } from '@/lib/webhook-connectors'

const result = await webhookService.receiveWebhook(
  'webhook-id',
  {
    event: 'custom_event',
    data: { foo: 'bar' }
  },
  {
    'content-type': 'application/json',
    'user-agent': 'MyService/1.0'
  }
)

if (result.success) {
  console.log('Event received successfully')
} else {
  console.error('Error:', result.error)
}
```

## Security Best Practices

### 1. Use Signature Verification
For production webhooks, always use signature verification:
- GitHub: Validates with `X-Hub-Signature-256` header
- Stripe: Validates with `Stripe-Signature` header
- Custom: Implement your own validation function

### 2. Secret Management
- Never expose webhook secrets in client-side code
- Store secrets securely in environment variables
- Rotate secrets periodically

### 3. Allowed Origins
Configure allowed origins to prevent unauthorized webhook calls:
```typescript
config: {
  authType: 'signature',
  allowedOrigins: ['https://github.com', 'https://api.stripe.com']
}
```

### 4. Rate Limiting
Configure rate limiting to prevent abuse:
```typescript
config: {
  retryAttempts: 3,
  bufferSize: 100
}
```

## Advanced Configuration

### Custom Transform Function

Transform incoming webhook payloads to match your data model:

```typescript
const webhook: WebhookConnector = {
  // ... other config
  transform: (payload) => {
    return {
      id: payload.id,
      timestamp: new Date(payload.created * 1000).toISOString(),
      user: payload.user?.name || 'Unknown',
      amount: payload.amount / 100, // Convert cents to dollars
    }
  }
}
```

### Custom Validation Function

Implement custom validation logic:

```typescript
const webhook: WebhookConnector = {
  // ... other config
  validation: (payload, headers) => {
    // Check required fields
    if (!payload.id || !payload.timestamp) {
      return false
    }
    
    // Verify custom header
    if (headers['x-api-key'] !== 'expected-key') {
      return false
    }
    
    return true
  }
}
```

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook status**: Ensure webhook is toggled to "Active"
2. **Verify endpoint URL**: Make sure external service has correct URL
3. **Check external service logs**: Many services show webhook delivery attempts
4. **Test with simulator**: Use the test button to verify webhook works locally

### Events Not Appearing

1. **Check buffer size**: Large buffer may be full, clear old events
2. **Inspect validation**: Custom validation may be rejecting events
3. **Review transform function**: Transform errors may be dropping events

### Authentication Failures

1. **Verify auth type**: Ensure correct auth type for your service
2. **Check secrets**: Validate signature secrets are correct
3. **Review headers**: Some services require specific headers

## Real-World Use Cases

### 1. Real-Time Order Dashboard
Monitor e-commerce orders as they come in:
- Shopify webhook for order creation
- Display order details instantly
- Trigger fulfillment workflows

### 2. DevOps Monitoring
Track deployments and CI/CD events:
- GitHub webhooks for push events
- Monitor build status
- Alert on failures

### 3. Customer Support Dashboard
Aggregate support tickets in real-time:
- Zendesk webhooks for new tickets
- Slack webhooks for urgent mentions
- Auto-route to team members

### 4. Marketing Analytics
Track campaign performance live:
- SendGrid webhooks for email metrics
- Stripe webhooks for conversions
- Calculate ROI in real-time

### 5. IoT Device Monitoring
Receive sensor data from IoT devices:
- Custom webhooks from devices
- Display real-time sensor readings
- Alert on threshold violations

## Performance Considerations

- **Buffer Management**: Events are automatically trimmed to buffer size
- **Memory Usage**: Each webhook stores up to 100 events by default
- **Event Processing**: Async processing prevents UI blocking
- **Subscription Cleanup**: Always unsubscribe when components unmount

## API Reference

See the full API documentation in the source code:
- `/src/lib/webhook-connectors.ts` - Core webhook service
- `/src/hooks/use-webhook.ts` - React hooks
- `/src/components/WebhookManager.tsx` - UI component

## Support

For issues or questions about webhook connectors:
1. Check this documentation first
2. Review external service documentation
3. Test with webhook simulator
4. Inspect event payloads in Event Viewer

---

**Pro Tip**: Start with test webhooks using webhook.site to validate your integration before connecting real services!
