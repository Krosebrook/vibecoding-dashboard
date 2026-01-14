# API Reference

## Table of Contents
- [Spark Runtime API](#spark-runtime-api)
- [Dashboard Generation API](#dashboard-generation-api)
- [Data Connector API](#data-connector-api)
- [Webhook API](#webhook-api)
- [Transform API](#transform-api)
- [Pattern Builder API](#pattern-builder-api)
- [Animation API](#animation-api)

---

## Spark Runtime API

The Spark runtime provides a global `spark` object with core platform features.

### LLM Integration

#### `spark.llmPrompt`

Create prompts with proper formatting and interpolation.

```typescript
const prompt = spark.llmPrompt`Generate a summary of: ${content}`
```

**Parameters**:
- Template literal with interpolated values

**Returns**: `string` - Formatted prompt string

#### `spark.llm`

Execute LLM calls with optional JSON mode.

```typescript
const result = await spark.llm(prompt, modelName?, jsonMode?)
```

**Parameters**:
- `prompt: string` - The prompt to send (use spark.llmPrompt)
- `modelName?: string` - Model to use (default: 'gpt-4o', options: 'gpt-4o', 'gpt-4o-mini')
- `jsonMode?: boolean` - Enable JSON response mode (default: false)

**Returns**: `Promise<string>` - LLM response

**Example**:
```typescript
const topic = "machine learning"
const prompt = spark.llmPrompt`Write a brief explanation of ${topic}`
const explanation = await spark.llm(prompt)
```

**JSON Mode Example**:
```typescript
const prompt = spark.llmPrompt`Generate exactly 10 user objects. 
Return as JSON with a single property "users" containing an array.
Format: {"users": [{"id": "...", "username": "..."}]}`

const result = await spark.llm(prompt, "gpt-4o", true)
const jsonResult = JSON.parse(result)
const users = jsonResult.users // Array of user objects
```

### User API

#### `spark.user`

Get current user information and permissions.

```typescript
const user = await spark.user()
```

**Returns**: `Promise<UserInfo>`
```typescript
interface UserInfo {
  avatarUrl: string
  email: string
  id: string
  isOwner: boolean
  login: string
}
```

**Example**:
```typescript
const user = await spark.user()
if (user.isOwner) {
  // Show admin features
}
```

### Key-Value Storage API

#### `spark.kv.get`

Retrieve a value from persistent storage.

```typescript
const value = await spark.kv.get<T>(key)
```

**Parameters**:
- `key: string` - Storage key

**Returns**: `Promise<T | undefined>` - Stored value or undefined

#### `spark.kv.set`

Store a value persistently.

```typescript
await spark.kv.set<T>(key, value)
```

**Parameters**:
- `key: string` - Storage key
- `value: T` - Value to store (must be JSON serializable)

**Returns**: `Promise<void>`

#### `spark.kv.delete`

Remove a value from storage.

```typescript
await spark.kv.delete(key)
```

**Parameters**:
- `key: string` - Storage key

**Returns**: `Promise<void>`

#### `spark.kv.keys`

List all storage keys.

```typescript
const allKeys = await spark.kv.keys()
```

**Returns**: `Promise<string[]>` - Array of all keys

### React Hooks

#### `useKV`

React hook for persistent state (preferred method).

```typescript
import { useKV } from '@github/spark/hooks'

const [value, setValue, deleteValue] = useKV<T>(key, defaultValue)
```

**Parameters**:
- `key: string` - Storage key
- `defaultValue: T` - Initial value if key doesn't exist

**Returns**: `[T, SetValue<T>, DeleteValue]`
- `value: T` - Current value
- `setValue: (newValue: T | ((current: T) => T)) => void` - Update function
- `deleteValue: () => void` - Delete function

**Example**:
```typescript
const [todos, setTodos, deleteTodos] = useKV("user-todos", [])

// ✅ CORRECT - Use functional updates
setTodos((currentTodos) => [...currentTodos, newTodo])

// Add a todo
setTodos((current) => [...current, { id: Date.now(), text: "New todo" }])

// Remove a todo
setTodos((current) => current.filter(todo => todo.id !== todoId))

// Update a todo
setTodos((current) =>
  current.map(todo =>
    todo.id === todoId ? { ...todo, completed: true } : todo
  )
)

// Clear all todos
setTodos([])

// Delete the entire key
deleteTodos()
```

---

## Dashboard Generation API

### `generateDashboard`

Generate a complete dashboard from natural language description.

```typescript
import { generateDashboard } from '@/lib/dashboard-generator'

const dashboard = await generateDashboard(
  prompt,
  template?,
  onProgress?
)
```

**Parameters**:
- `prompt: string` - Natural language dashboard description
- `template?: DashboardTemplate` - Optional template to base generation on
- `onProgress?: (progress: GenerationProgress) => void` - Progress callback

**Returns**: `Promise<DashboardConfig>` - Complete dashboard configuration

**Example**:
```typescript
const dashboard = await generateDashboard(
  "Create a sales dashboard with revenue charts and top products",
  undefined,
  (progress) => {
    console.log(`${progress.stage}: ${progress.progress}%`)
  }
)
```

### `refineDashboard`

Refine existing dashboard with natural language instructions.

```typescript
import { refineDashboard } from '@/lib/dashboard-generator'

const refined = await refineDashboard(
  currentDashboard,
  refinementPrompt,
  onProgress?
)
```

**Parameters**:
- `currentDashboard: DashboardConfig` - Existing dashboard to refine
- `refinementPrompt: string` - Natural language refinement instructions
- `onProgress?: (progress: GenerationProgress) => void` - Progress callback

**Returns**: `Promise<DashboardConfig>` - Updated dashboard configuration

**Example**:
```typescript
const refined = await refineDashboard(
  currentDashboard,
  "Add a pie chart showing product categories"
)
```

### `generateSetupInstructions`

Generate deployment instructions for a dashboard.

```typescript
import { generateSetupInstructions } from '@/lib/dashboard-generator'

const instructions = generateSetupInstructions(dashboard)
```

**Parameters**:
- `dashboard: DashboardConfig` - Dashboard configuration

**Returns**: `string` - Markdown-formatted setup instructions

---

## Data Connector API

### `useDataConnector`

React hook for managing API data connections.

```typescript
import { useDataConnector } from '@/hooks/use-data-connector'

const {
  data,
  loading,
  error,
  refetch,
  testConnection
} = useDataConnector(connectorId)
```

**Parameters**:
- `connectorId: string` - Data connector ID

**Returns**: `DataConnectorHookResult`
```typescript
interface DataConnectorHookResult {
  data: any | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  testConnection: () => Promise<boolean>
}
```

### `createDataConnector`

Create a new data connector configuration.

```typescript
import { createDataConnector } from '@/lib/data-connectors'

const connector = createDataConnector({
  name: "My API",
  type: "rest",
  url: "https://api.example.com/data",
  authentication: {
    type: "bearer",
    credentials: { token: "..." }
  }
})
```

**Parameters**: `Partial<DataConnector>`

**Returns**: `DataConnector` - Complete connector configuration

### Pre-configured Connectors

```typescript
import { 
  jsonPlaceholderConnector,
  githubTrendingConnector,
  coinbaseConnector,
  catFactsConnector,
  openBreweryConnector,
  exchangeRatesConnector
} from '@/lib/data-connectors'
```

Each connector is pre-configured and ready to use.

---

## Webhook API

### `useWebhook`

React hook for managing webhook connections.

```typescript
import { useWebhook } from '@/hooks/use-webhook'

const {
  events,
  webhook,
  addEvent,
  clearEvents,
  testWebhook
} = useWebhook(webhookId)
```

**Parameters**:
- `webhookId: string` - Webhook ID

**Returns**: `WebhookHookResult`
```typescript
interface WebhookHookResult {
  events: WebhookEvent[]
  webhook: WebhookConfig | null
  addEvent: (event: WebhookEvent) => void
  clearEvents: () => void
  testWebhook: (payload: any) => Promise<boolean>
}
```

### `createWebhook`

Create a new webhook configuration.

```typescript
import { createWebhook } from '@/lib/webhook-connectors'

const webhook = createWebhook({
  name: "GitHub Webhook",
  provider: "github",
  events: ["push", "pull_request"]
})
```

**Parameters**: `Partial<WebhookConfig>`

**Returns**: `WebhookConfig` - Complete webhook configuration

### Webhook Templates

```typescript
import { 
  githubWebhookTemplate,
  stripeWebhookTemplate,
  slackWebhookTemplate,
  shopifyWebhookTemplate,
  twilioWebhookTemplate,
  sendgridWebhookTemplate,
  discordWebhookTemplate,
  zapierWebhookTemplate
} from '@/lib/webhook-connectors'
```

Each template provides pre-configured settings for the service.

### `verifyWebhookSignature`

Verify webhook signature for security.

```typescript
import { verifyWebhookSignature } from '@/lib/webhook-connectors'

const isValid = await verifyWebhookSignature(
  payload,
  signature,
  secret,
  algorithm
)
```

**Parameters**:
- `payload: string` - Raw webhook payload
- `signature: string` - Signature from headers
- `secret: string` - Webhook secret
- `algorithm: 'sha256' | 'sha1'` - Hash algorithm

**Returns**: `Promise<boolean>` - Signature validity

---

## Transform API

### `useTransform`

React hook for managing payload transformations.

```typescript
import { useTransform } from '@/hooks/use-transform'

const {
  transform,
  apply,
  test
} = useTransform(transformId)
```

**Parameters**:
- `transformId: string` - Transform ID

**Returns**: `TransformHookResult`
```typescript
interface TransformHookResult {
  transform: PayloadTransform | null
  apply: (payload: any) => any
  test: (samplePayload: any) => { result: any; error?: string }
}
```

### `createTransform`

Create a payload transformation configuration.

```typescript
import { createTransform } from '@/lib/transform-patterns'

const transform = createTransform({
  name: "User Extraction",
  mappings: [
    {
      source: "data.user.email",
      target: "email",
      type: "direct"
    },
    {
      source: "data.user.created_at",
      target: "registrationDate",
      type: "function",
      function: "new Date(value).toISOString()"
    }
  ]
})
```

### `generateTransformFromAI`

Generate transformation using AI from natural language.

```typescript
import { generateTransformFromAI } from '@/lib/ai-transform-generator'

const transform = await generateTransformFromAI(
  description,
  samplePayload?
)
```

**Parameters**:
- `description: string` - Natural language transformation description
- `samplePayload?: any` - Optional sample payload for context

**Returns**: `Promise<PayloadTransform>` - Generated transformation

**Example**:
```typescript
const transform = await generateTransformFromAI(
  "Extract user email, name, and registration date. Convert timestamp to ISO format.",
  samplePayload
)
```

### Transform Pattern Library

```typescript
import { transformPatterns } from '@/lib/transform-patterns'

// Browse by category
const dataExtraction = transformPatterns.filter(p => p.category === 'Data Extraction')

// Browse by industry
const ecommercePatterns = transformPatterns.filter(p => p.industry === 'E-commerce')

// Search patterns
const emailPatterns = transformPatterns.filter(p => 
  p.name.toLowerCase().includes('email')
)
```

---

## Pattern Builder API

### Pattern Element Types

```typescript
type PatternElementType =
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'line'
  | 'grid'
  | 'dots'
  | 'waves'
  | 'gradient'
  | 'noise'
  | 'stripes'
  | 'chevron'
  | 'hexagon'
  | 'star'
  | 'spiral'
```

### `createPattern`

Create a pattern configuration.

```typescript
import { createPattern } from '@/lib/pattern-builder-types'

const pattern = createPattern({
  name: "My Pattern",
  elements: [
    {
      type: 'dots',
      properties: {
        size: 4,
        spacing: 20,
        color: 'oklch(0.75 0.15 195)',
        opacity: 0.3
      }
    }
  ]
})
```

### `generatePatternFromAI`

Generate pattern using AI description.

```typescript
import { generatePatternFromAI } from '@/lib/pattern-builder-types'

const pattern = await generatePatternFromAI(
  "Create a subtle geometric background with diagonal stripes and dots"
)
```

### `exportPatternToCSS`

Export pattern as CSS code.

```typescript
import { exportPatternToCSS } from '@/lib/pattern-renderer'

const cssCode = exportPatternToCSS(pattern)
```

**Returns**: `string` - CSS with base64 background

---

## Animation API

### Animation Presets

```typescript
import { animationPresets } from '@/lib/animation-presets'

// Filter by category
const entranceAnimations = animationPresets.filter(p => 
  p.category === 'entrance'
)

// Filter by complexity
const simpleAnimations = animationPresets.filter(p => 
  p.complexity === 'simple'
)

// Get preset by ID
const preset = animationPresets.find(p => p.id === 'fade-in')
```

### Preset Structure

```typescript
interface AnimationPreset {
  id: string
  name: string
  description: string
  category: 'entrance' | 'exit' | 'attention' | 'choreography' | 'interaction' | 'transformation'
  complexity: 'simple' | 'moderate' | 'complex' | 'advanced'
  variants: Variants // Framer Motion variants
  orchestration: 'parallel' | 'sequence' | 'stagger' | 'cascade' | 'wave'
  staggerDelay?: number
  defaultDuration: number
  easing: string
  code: string // Copy-paste Framer Motion code
}
```

### Easing Curves

```typescript
import { easingCurves } from '@/lib/text-animation-curves'

// Get curve by name
const curve = easingCurves.find(c => c.name === 'spring')

// Filter by category
const physicsC curves = easingCurves.filter(c => 
  c.category === 'physics'
)
```

### Choreography API

```typescript
interface ChoreographyStep {
  id: string
  presetId: string
  targetElements: string[] // CSS selectors or element IDs
  delay: number
  duration: number
  order: number
}

interface Choreography {
  id: string
  name: string
  steps: ChoreographyStep[]
}
```

### Recording API

```typescript
interface RecordingEvent {
  type: 'click' | 'mousemove' | 'scroll' | 'hover'
  timestamp: number
  x?: number
  y?: number
  target?: string
  deltaX?: number
  deltaY?: number
}

interface Recording {
  id: string
  name: string
  events: RecordingEvent[]
  duration: number
  createdAt: string
}
```

### Text Animation API

```typescript
interface TextAnimationConfig {
  text: string
  preset: string
  curve: string
  level: 'character' | 'word' | 'line'
  duration: number
  stagger: number
}
```

### Physics Engine API

```typescript
interface PhysicsConfig {
  gravity: number // 0-2
  elasticity: number // 0-1
  damping: number // 0.9-1.0
  friction: number // 0.5-1.0
  wind: number // -1 to 1
  turbulence: number // 0-2
  repulsion: boolean
  attraction: boolean
  cursorAttraction: boolean
  wallBounce: boolean
}
```

---

## Type Definitions

### Dashboard Types

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

interface DashboardComponent {
  id: string
  type: ComponentType
  props: Record<string, any>
  position: Position
  size: Size
  title?: string
  description?: string
}

interface Position {
  row: number
  col: number
}

interface Size {
  rows: number
  cols: number
}
```

### Data Types

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

interface PayloadTransform {
  id: string
  name: string
  mappings: TransformMapping[]
}

interface TransformMapping {
  source: string
  target: string
  type: 'direct' | 'function' | 'computed' | 'conditional'
  function?: string
  defaultValue?: any
}
```

---

## Error Handling

All API functions follow consistent error handling patterns:

```typescript
try {
  const result = await apiFunction()
  // Success
} catch (error) {
  if (error instanceof ApiError) {
    // API-specific error
    console.error(error.message)
    toast.error(error.userMessage)
  } else {
    // Unexpected error
    console.error('Unexpected error:', error)
    toast.error('An unexpected error occurred')
  }
}
```

## Rate Limiting

API connectors implement automatic rate limiting:

```typescript
// Connector configuration
const connector = {
  rateLimit: {
    requestsPerMinute: 60 // Max 60 requests per minute
  }
}

// Automatic queuing when limit approached
// Requests wait until rate limit window resets
```

## Caching

Data connectors use automatic caching:

```typescript
const connector = {
  caching: {
    enabled: true,
    ttl: 300 // 5 minutes in seconds
  }
}

// First request fetches from API
// Subsequent requests within TTL return cached data
// Manual refresh always fetches fresh data
```
