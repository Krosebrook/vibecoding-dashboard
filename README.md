# ✨ Dashboard VibeCoder

An AI-powered dashboard generator that transforms natural language descriptions into production-ready, fully functional dashboards with real-time data connectors and webhook integrations.

## 🚀 Features

### Core Capabilities
- **AI-Powered Generation**: Describe any dashboard in natural language and watch it materialize
- **Pre-Configured Dashboards**: Business Intelligence, System Monitoring, Analytics, Sales, and Social Media dashboards ready to use
- **Interactive Charts**: Line, bar, area, pie, radar, scatter, and composed charts with drill-down capabilities
- **Real-Time Data Connectors**: Connect to 7+ pre-configured public APIs or create custom connectors
- **Webhook Receivers**: Accept real-time push data from GitHub, Stripe, Slack, Shopify, and 6+ other services
- **Animation Recording**: Capture live user interactions and export as replayable animations
- **Drill-Down Exploration**: Click any chart element to explore deeper data hierarchies
- **Export & Persistence**: Save, load, and export dashboard configurations

### Data Integration

#### API Connectors
Connect dashboards to real data sources:
- JSONPlaceholder (users, posts)
- GitHub (trending repositories, issues)
- Coinbase (cryptocurrency prices)
- Open Brewery DB
- Exchange Rates API
- Cat Facts API (for demos)
- Custom API connector builder

See [DATA_CONNECTORS.md](./DATA_CONNECTORS.md) for full documentation.

#### Webhook Connectors
Receive real-time push data from external services:
- 🐙 GitHub (commits, PRs, issues)
- 💳 Stripe (payments, subscriptions)
- 💬 Slack (messages, events)
- 🛍️ Shopify (orders, products)
- 📱 Twilio (SMS, calls)
- 📧 SendGrid (email events)
- 🎮 Discord (server events)
- ⚡ Zapier (automation triggers)
- 🔧 Custom webhooks

See [WEBHOOKS.md](./WEBHOOKS.md) for full documentation.

### Animation & Visual Tools

#### Animation Recording Mode
Capture live user interactions and replay them:
- 🎥 **Real-Time Capture**: Record clicks, mouse movements, scrolls, and hovers
- ⏯️ **Playback Controls**: Replay at 0.25x to 4x speed with visual cursor
- 💾 **Recording Management**: Save unlimited named recordings
- 📤 **Multiple Export Formats**: JSON, CSV, and React/Framer Motion code

See [ANIMATION_RECORDING.md](./ANIMATION_RECORDING.md) for full documentation.

#### Visual Pattern Builder
Create animated patterns with drag-and-drop interface:
- 🎨 Canvas-based pattern design
- ⚡ Timeline animation with keyframes
- 📚 Pre-built animation preset library
- 🎭 Multi-element choreography builder

See [PATTERN_BUILDER.md](./PATTERN_BUILDER.md) and [ANIMATION_PRESETS.md](./ANIMATION_PRESETS.md) for full documentation.

## 🏁 Getting Started

### Quick Start

1. **Try Pre-Built Dashboards**
   - Click "Business Intelligence" to see all chart types
   - Click "System Monitoring" for real-time metrics
   - Click "Analytics" for web traffic visualization

2. **Generate Custom Dashboard**
   - Describe your dashboard in the prompt area
   - Click "Generate Dashboard"
   - Refine with natural language edits

3. **Connect Real Data**
   - Scroll to "Data Connectors" card
   - Select a pre-configured API
   - Test connection and view live data

4. **Set Up Webhooks**
   - Click "Create Webhook" in Webhook Connectors
   - Choose a template (GitHub, Stripe, etc.)
   - Copy endpoint URL
   - Configure in external service
   - Test with simulator

5. **Record Animations**
   - Switch to "Animations" tab
   - Click "Start Recording"
   - Interact with the page
   - Stop and replay your interactions
   - Export as code or data

## 💡 Usage Examples

### Generate a Sales Dashboard
```
Create a sales dashboard with revenue charts, 
top products, and recent orders
```

### Connect to Real API
1. Open "Data Connector Manager"
2. Select "GitHub Trending"
3. Click "Test Connection"
4. View live repository data

### Receive GitHub Webhooks
1. Click "Create Webhook"
2. Select "GitHub Webhook"
3. Copy generated endpoint URL
4. Add to GitHub repo settings
5. Receive real-time push events

### Record User Interactions
1. Navigate to "Animations" tab
2. Name your recording
3. Click "Start Recording"
4. Perform interactions
5. Stop recording
6. Replay at any speed
7. Export as JSON, CSV, or React code

## 🛠 Technical Stack

- **Framework**: React 19 + TypeScript
- **UI Components**: shadcn/ui (Radix UI)
- **Charts**: Recharts
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **State**: React Hooks + Spark KV Storage
- **Build**: Vite

## 📚 Documentation

- [PRD.md](./PRD.md) - Product Requirements Document
- [DATA_CONNECTORS.md](./DATA_CONNECTORS.md) - API Connector Guide
- [WEBHOOKS.md](./WEBHOOKS.md) - Webhook Integration Guide
- [ANIMATION_RECORDING.md](./ANIMATION_RECORDING.md) - Animation Recording Mode Guide
- [PATTERN_BUILDER.md](./PATTERN_BUILDER.md) - Visual Pattern Builder Guide
- [ANIMATION_PRESETS.md](./ANIMATION_PRESETS.md) - Animation Presets Library
- [PAYLOAD_TRANSFORMS.md](./PAYLOAD_TRANSFORMS.md) - Webhook Transform Guide
- [TRANSFORM_PATTERNS.md](./TRANSFORM_PATTERNS.md) - Transform Pattern Library
- [AI_TRANSFORM_README.md](./AI_TRANSFORM_README.md) - AI Transform Generator

## 🎨 Architecture

### Data Flow: Pull Model (API Connectors)
```
Dashboard → API Connector → External API → Transform → Cache → Display
```

### Data Flow: Push Model (Webhooks)
```
External Service → Webhook Endpoint → Validate → Transform → Buffer → Dashboard Update
```

## 🔐 Security

- Signature verification for webhooks (SHA-256, SHA-1)
- Bearer token authentication for APIs
- API key and Basic auth support
- Rate limiting and request throttling
- Client-side data encryption with Spark KV

## 🧹 Development

This Spark application is production-ready and fully functional. To extend:

1. Add custom API connectors in `src/lib/data-connectors.ts`
2. Create webhook templates in `src/lib/webhook-connectors.ts`
3. Build custom dashboard components in `src/components/`
4. Extend chart types in dashboard preview renderer

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
