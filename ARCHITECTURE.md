# Architecture Documentation

## Overview

Dashboard VibeCoder is a sophisticated AI-powered dashboard generator built with React 19, TypeScript, and modern web technologies. This document provides a comprehensive overview of the system architecture, design patterns, and technical decisions.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (React Components + shadcn/ui + Tailwind CSS v4)          │
└─────────────────┬───────────────────────────┬───────────────┘
                  │                           │
                  ▼                           ▼
┌─────────────────────────────┐  ┌──────────────────────────┐
│   State Management Layer     │  │   AI Integration Layer   │
│  (React Hooks + Spark KV)    │  │  (spark.llm API)         │
└─────────────────┬────────────┘  └──────────┬───────────────┘
                  │                           │
                  ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  (Dashboard Generator, Data Connectors, Webhooks, etc.)     │
└─────────────────┬───────────────────────────┬───────────────┘
                  │                           │
                  ▼                           ▼
┌──────────────────────────┐      ┌─────────────────────────┐
│  External APIs           │      │  Spark Runtime          │
│  (REST APIs, Webhooks)   │      │  (KV Store, LLM API)    │
└──────────────────────────┘      └─────────────────────────┘
```

## Core Modules

### 1. Dashboard Generation System

**Location**: `src/lib/dashboard-generator.ts`

**Purpose**: Transforms natural language descriptions into complete dashboard configurations using AI.

**Key Functions**:
- `generateDashboard()` - Main generation function
- `refineDashboard()` - Iterative refinement of existing dashboards
- `generateSetupInstructions()` - Creates deployment documentation

**Data Flow**:
```
User Prompt → AI Analysis → Component Selection → 
Data Model Generation → Layout Calculation → 
Configuration Object → React Rendering
```

**AI Integration**:
- Uses `spark.llm()` with GPT-4o for intelligent generation
- JSON mode enabled for structured output
- Progressive generation with user feedback

### 2. Component Rendering System

**Location**: `src/components/ComponentRenderer.tsx`, `src/components/DashboardPreview.tsx`

**Purpose**: Dynamically renders dashboard components based on configuration.

**Supported Component Types**:
- **Metrics**: metric-card, stat-grid, progress-bar
- **Charts**: line-chart, bar-chart, pie-chart, area-chart, radar-chart, scatter-chart, composed-chart
- **Data**: data-table, activity-feed, user-list
- **Monitoring**: cpu-monitor, memory-monitor, network-monitor, server-status, alert-list, realtime-chart
- **Organization**: calendar, kanban-board, timeline
- **Content**: form, text-block, image-gallery, map

**Rendering Strategy**:
- Component registry pattern for type-to-component mapping
- Props validation and sanitization
- Graceful degradation for unknown types
- Responsive grid layout with CSS Grid

### 3. Data Integration System

#### A. API Connectors (Pull Model)

**Location**: `src/lib/data-connectors.ts`, `src/hooks/use-data-connector.ts`

**Purpose**: Fetch data from external APIs with caching, rate limiting, and transformation.

**Architecture**:
```
Component → useDataConnector Hook → 
API Connector → HTTP Request → 
Transform Response → Cache → 
Return to Component
```

**Features**:
- Pre-configured connectors for 7+ public APIs
- Custom connector builder with visual UI
- Automatic caching with TTL
- Rate limiting per connector
- Multiple authentication methods (Bearer, API Key, Basic)
- Request/response transformation
- Drill-down data fetching

**Pre-configured APIs**:
1. JSONPlaceholder - Demo data
2. GitHub API - Repository and issue data
3. Coinbase API - Cryptocurrency prices
4. Open Brewery DB - Brewery directory
5. Exchange Rates API - Currency conversion
6. Cat Facts API - Random facts (demo)
7. Custom - User-defined endpoints

#### B. Webhook Connectors (Push Model)

**Location**: `src/lib/webhook-connectors.ts`, `src/hooks/use-webhook.ts`

**Purpose**: Receive real-time push data from external services.

**Architecture**:
```
External Service → Webhook Endpoint → 
Signature Verification → Payload Transform → 
Event Buffer → Dashboard Update
```

**Features**:
- 10+ pre-configured webhook templates
- Unique endpoint generation per webhook
- Signature verification (SHA-256, SHA-1)
- Event buffering with size limits
- Test/simulate functionality
- Payload transformation wizard
- Event history and replay

**Supported Services**:
1. GitHub - Commits, PRs, issues
2. Stripe - Payments, subscriptions
3. Slack - Messages, events
4. Shopify - Orders, products
5. Twilio - SMS, calls
6. SendGrid - Email events
7. Discord - Server events
8. Zapier - Automation triggers
9. Webhook.site - Testing
10. Custom - User-defined

### 4. Payload Transformation System

**Location**: `src/lib/transform-patterns.ts`, `src/components/WebhookTransformManager.tsx`

**Purpose**: Map and transform webhook payloads to dashboard data models.

**Transform Types**:
1. **Direct Mapping** - Simple field-to-field mapping
2. **JavaScript Functions** - Custom transformation logic
3. **Computed Fields** - Derived values from multiple sources
4. **Conditional Logic** - Conditional field selection

**Pattern Library**:
- 100+ pre-built transformation patterns
- Organized by industry (E-commerce, CRM, Marketing, Finance, etc.)
- 12 categories (Data Extraction, Enrichment, Aggregation, etc.)
- Copy-paste ready JavaScript functions

**AI-Powered Generation**:
- Natural language to transformation code
- Intelligent field mapping suggestions
- Type inference and validation
- Code explanation and optimization tips

### 5. Visual Pattern Builder

**Location**: `src/components/VisualPatternBuilder.tsx`, `src/lib/pattern-builder-types.ts`

**Purpose**: Create custom visual patterns for dashboard backgrounds and decorative elements.

**Features**:
- 14 element types (shapes, lines, gradients, etc.)
- Drag-and-drop interface
- Real-time canvas preview
- Layer management (z-index, blend modes)
- AI-powered pattern generation
- Export to CSS/JSON

**Element Types**:
- Basic: rectangle, circle, triangle, line
- Patterns: grid, dots, waves, stripes, chevron
- Effects: gradient, noise
- Complex: hexagon, star, spiral

### 6. Animation System

#### A. Animation Presets Library

**Location**: `src/lib/animation-presets.ts`, `src/components/AnimationPresetsLibrary.tsx`

**Purpose**: Pre-built animation sequences for dashboard elements.

**Categories**:
1. Entrance - Fade in, slide in, scale in, etc.
2. Exit - Fade out, slide out, scale out, etc.
3. Attention - Pulse, shake, bounce, etc.
4. Choreography - Multi-element sequences
5. Interaction - Hover, click, drag effects
6. Transformation - Morph, flip, rotate, etc.

**Complexity Levels**: Simple, Moderate, Complex, Advanced

**Orchestration Types**: Parallel, Sequence, Stagger, Cascade, Wave

#### B. Choreography Builder

**Location**: `src/components/ChoreographyBuilder.tsx`

**Purpose**: Create complex multi-element animation sequences.

**Features**:
- Step-by-step configuration
- Timeline visualization
- Preset chaining
- Custom timing (delay, duration)
- Element targeting
- Live preview
- JSON export

#### C. Animation Recording

**Location**: `src/components/AnimationRecorder.tsx`

**Purpose**: Capture user interactions and replay as animations.

**Captured Events**:
- Mouse movements (throttled to 50ms)
- Clicks with coordinates
- Scrolls with delta and position
- Hovers with target element

**Export Formats**:
1. **JSON** - Complete event data with timestamps
2. **CSV** - Tabular format for analysis
3. **React/Framer Motion** - Production-ready code

**Playback Features**:
- Variable speed (0.25x - 4x)
- Animated cursor visualization
- Progress bar with scrubbing
- Pause/resume controls

#### D. Text Animation System

**Location**: `src/lib/text-animation-curves.ts`, `src/components/TextAnimationShowcase.tsx`

**Purpose**: Sophisticated text animations with custom easing curves.

**Easing Curves**: 40+ custom curves including:
- Standard: linear, ease, ease-in, ease-out, ease-in-out
- Physics: spring, bounce, elastic, back
- Text-specific: typewriter, smooth, snappy, cinematic, etc.

**Transition Presets**: 20+ categories:
- Fade, Slide, Scale, Rotate
- Morph, Split, Reveal, Typing

**Animation Levels**: Character, Word, Line

#### E. Physics-Based Text Engine

**Location**: `src/components/PhysicsTextEngine.tsx`

**Purpose**: Real-time particle physics simulation for text characters.

**Physics Parameters**:
- Gravity (0-2)
- Elasticity (0-1) 
- Damping (0.9-1.0)
- Ground Friction (0.5-1.0)

**Force Systems**:
- Repulsion/Attraction between particles
- Wind (-1 to 1)
- Turbulence (0-2)
- Cursor attraction

**Presets**: Gentle Fall, Bouncy Ball, Magnetic, Chaotic Storm, Repulsion Field

### 7. Timeline & Scrubber System

**Location**: `src/components/TimelineScrubber.tsx`, `src/components/AnimationTimeline.tsx`

**Purpose**: Frame-accurate animation editing tools.

**Features**:
- Draggable keyframes
- Multi-track visualization
- Zoom controls (0.5x-4x)
- Playback speed adjustment
- Snap-to-keyframe
- Frame stepping (60fps)
- Property editing

## Data Models

### Dashboard Configuration

```typescript
interface DashboardConfig {
  id: string
  name: string
  description: string
  type: string
  createdAt: string
  components: DashboardComponent[]
  layout: LayoutConfig
  theme: ThemeConfig
  dataModel: DataModel
  setupInstructions: string
}
```

### Component Definition

```typescript
interface DashboardComponent {
  id: string
  type: ComponentType
  props: Record<string, any>
  position: Position
  size: Size
  title?: string
  description?: string
}
```

### Data Connector

```typescript
interface DataConnector {
  id: string
  name: string
  type: 'rest' | 'graphql' | 'websocket'
  url: string
  authentication?: {
    type: 'bearer' | 'apiKey' | 'basic'
    credentials: Record<string, string>
  }
  headers?: Record<string, string>
  params?: Record<string, string>
  caching?: {
    enabled: boolean
    ttl: number
  }
  rateLimit?: {
    requestsPerMinute: number
  }
}
```

### Webhook Configuration

```typescript
interface WebhookConfig {
  id: string
  name: string
  provider: string
  endpoint: string
  secret?: string
  events: string[]
  transform?: PayloadTransform
  active: boolean
  buffer: WebhookEvent[]
}
```

## State Management

### React Hooks

**Standard State**: `useState` for ephemeral UI state
- Form inputs
- UI toggles
- Loading states
- Temporary calculations

**Persistent State**: `useKV` hook for data that survives page refresh
- Dashboard configurations
- Saved connectors
- Webhook configurations
- User preferences
- Animation recordings

### State Management Pattern

```typescript
// ❌ WRONG - Don't reference state from closure
const [todos, setTodos] = useKV("todos", [])
setTodos([...todos, newTodo]) // todos is stale!

// ✅ CORRECT - Always use functional updates
setTodos((currentTodos) => [...currentTodos, newTodo])
```

## Performance Optimizations

### 1. Code Splitting
- Dynamic imports for heavy components
- Lazy loading of animation libraries
- Route-based code splitting (pattern, animation, dashboard views)

### 2. Rendering Optimizations
- React.memo for expensive components
- useMemo for computed values
- useCallback for stable function references
- Virtualization for long lists (ScrollArea)

### 3. Data Caching
- API response caching with TTL
- Webhook event buffering with limits
- Dashboard configuration persistence
- Pattern library caching

### 4. Animation Performance
- RequestAnimationFrame for smooth animations
- GPU-accelerated transforms (translate3d, scale, rotate)
- Will-change hints for animated elements
- Throttling for high-frequency events (mouse movement)

## Security Considerations

### 1. API Security
- No credentials stored in code
- Client-side encryption for stored keys
- HTTPS-only API calls
- CORS-aware connector warnings

### 2. Webhook Security
- Signature verification (SHA-256, SHA-1)
- Secret token validation
- Rate limiting per webhook
- Payload size limits

### 3. Data Validation
- Zod schemas for type validation
- Input sanitization
- XSS prevention in rendered content
- JSON parsing with error handling

### 4. User Data
- All data stored in Spark KV (client-side)
- No server-side persistence
- User owns all generated dashboards
- Export/import for data portability

## Error Handling

### 1. API Errors
```typescript
try {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = await response.json()
  return data
} catch (error) {
  console.error('API Error:', error)
  toast.error('Failed to fetch data')
  return cachedFallback
}
```

### 2. AI Generation Errors
- Automatic retry (1 attempt)
- User-friendly error messages
- Fallback to templates
- Progress indication

### 3. Rendering Errors
- React Error Boundaries
- Graceful degradation
- Component-level error handling
- User notification with recovery options

## Testing Strategy

### Unit Tests
- Utility functions (transformations, calculations)
- Data model validation
- State management logic

### Integration Tests
- API connector functionality
- Webhook payload processing
- Dashboard generation flow

### E2E Tests
- Complete dashboard creation workflow
- Data connector configuration
- Webhook setup and testing
- Animation recording and playback

## Build & Deployment

### Build Process
```bash
npm run build
# TypeScript compilation + Vite bundling
# Output: dist/ directory
```

### Development
```bash
npm run dev
# Vite dev server with HMR
# Port: 5000 (configured in Spark runtime)
```

### Production Considerations
- Minified bundle with tree-shaking
- CSS optimization via Tailwind CSS
- Asset optimization (images, fonts)
- Lazy loading for code splitting

## Browser Support

**Supported Browsers**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

**Required Features**:
- ES2020+ JavaScript
- CSS Grid
- CSS Custom Properties
- Fetch API
- LocalStorage (via Spark KV)
- Canvas API (for patterns/animations)

## Dependencies

### Core Framework
- React 19 - UI library
- TypeScript 5.7 - Type safety
- Vite 7 - Build tool

### UI Components
- shadcn/ui v4 - Component library
- Radix UI - Headless components
- Tailwind CSS v4 - Styling
- Framer Motion 12 - Animations

### Data & Charts
- Recharts 2 - Chart library
- D3.js 7 - Data visualization
- date-fns - Date manipulation

### Utilities
- zod - Schema validation
- clsx + tailwind-merge - Class management
- uuid - Unique ID generation

### Spark Runtime
- @github/spark - Platform SDK
- KV storage API
- LLM integration API

## Future Considerations

### Scalability
- Component library extensibility
- Plugin system for custom components
- Template marketplace
- Collaborative editing

### Performance
- Web Workers for heavy computations
- IndexedDB for large datasets
- Progressive Web App features
- Offline support

### Features
- Real-time collaboration
- Version control for dashboards
- A/B testing framework
- Analytics and usage tracking
