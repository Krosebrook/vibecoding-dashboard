# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- Git for version control

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd spark-template

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Project Structure

```
spark-template/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components (pre-installed)
│   │   ├── *Connector*.tsx  # Data/webhook connector components
│   │   ├── *Animation*.tsx  # Animation-related components
│   │   ├── *Pattern*.tsx    # Pattern builder components
│   │   └── Dashboard*.tsx   # Dashboard components
│   ├── hooks/               # Custom React hooks
│   │   ├── use-mobile.ts
│   │   ├── use-data-connector.ts
│   │   ├── use-webhook.ts
│   │   └── use-transform.ts
│   ├── lib/                 # Business logic & utilities
│   │   ├── types.ts         # TypeScript type definitions
│   │   ├── utils.ts         # Utility functions
│   │   ├── *-generator.ts   # Generation logic
│   │   ├── *-connectors.ts  # Connector definitions
│   │   ├── *-template.ts    # Dashboard templates
│   │   ├── *-patterns.ts    # Pattern/transform libraries
│   │   └── *-presets.ts     # Animation presets
│   ├── styles/              # Global styles
│   │   └── theme.css
│   ├── App.tsx              # Main application component
│   ├── index.css            # Tailwind CSS configuration
│   └── main.tsx             # Entry point (DO NOT EDIT)
├── index.html               # HTML template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration (DO NOT EDIT)
└── *.md                     # Documentation files
```

## Development Workflow

### 1. Understanding the Codebase

Start by reading:
1. `PRD.md` - Product requirements and design decisions
2. `ARCHITECTURE.md` - System architecture overview
3. `API.md` - API reference for all modules

### 2. Creating New Features

#### A. Add a New Dashboard Component Type

1. **Define the type** in `src/lib/types.ts`:
```typescript
export type ComponentType =
  | 'metric-card'
  | 'my-new-component' // Add here
  // ... existing types
```

2. **Create the component** in `src/components/`:
```typescript
// MyNewComponent.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface MyNewComponentProps {
  data: any
  title?: string
}

export function MyNewComponent({ data, title }: MyNewComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'My Component'}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your component implementation */}
      </CardContent>
    </Card>
  )
}
```

3. **Register in ComponentRenderer** (`src/components/ComponentRenderer.tsx`):
```typescript
import { MyNewComponent } from './MyNewComponent'

// In the component mapping
const componentMap = {
  'metric-card': MetricCard,
  'my-new-component': MyNewComponent, // Add here
  // ... other components
}
```

4. **Update AI prompt** in `src/lib/dashboard-generator.ts`:
```typescript
const systemPrompt = `...
Available component types: metric-card, my-new-component, ...
...`
```

#### B. Add a New Data Connector

1. **Define connector** in `src/lib/data-connectors.ts`:
```typescript
export const myApiConnector: DataConnector = {
  id: 'my-api',
  name: 'My API',
  type: 'rest',
  url: 'https://api.example.com/data',
  authentication: {
    type: 'bearer',
    credentials: { token: '' } // User will provide
  },
  headers: {
    'Content-Type': 'application/json'
  },
  caching: {
    enabled: true,
    ttl: 300 // 5 minutes
  },
  rateLimit: {
    requestsPerMinute: 60
  }
}
```

2. **Add to connector list**:
```typescript
export const preConfiguredConnectors = [
  jsonPlaceholderConnector,
  myApiConnector, // Add here
  // ... other connectors
]
```

3. **Test the connector**:
```typescript
const { data, loading, error, testConnection } = useDataConnector('my-api')

const handleTest = async () => {
  const isValid = await testConnection()
  console.log('Connection valid:', isValid)
}
```

#### C. Add a New Webhook Template

1. **Define template** in `src/lib/webhook-connectors.ts`:
```typescript
export const myServiceWebhookTemplate: WebhookTemplate = {
  id: 'my-service',
  name: 'My Service',
  provider: 'my-service',
  description: 'Receive events from My Service',
  events: ['event.created', 'event.updated'],
  signatureHeader: 'X-My-Service-Signature',
  signatureAlgorithm: 'sha256',
  secretRequired: true,
  documentation: 'https://docs.myservice.com/webhooks'
}
```

2. **Add to template list**:
```typescript
export const webhookTemplates = [
  githubWebhookTemplate,
  myServiceWebhookTemplate, // Add here
  // ... other templates
]
```

#### D. Add a New Animation Preset

1. **Define preset** in `src/lib/animation-presets.ts`:
```typescript
export const myAnimationPreset: AnimationPreset = {
  id: 'my-animation',
  name: 'My Animation',
  description: 'Custom animation effect',
  category: 'entrance',
  complexity: 'moderate',
  variants: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  orchestration: 'stagger',
  staggerDelay: 0.1,
  defaultDuration: 0.6,
  easing: 'spring',
  code: `<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6, type: "spring" }}
>
  {children}
</motion.div>`
}
```

2. **Add to presets list**:
```typescript
export const animationPresets = [
  fadeInPreset,
  myAnimationPreset, // Add here
  // ... other presets
]
```

### 3. Testing Your Changes

#### Manual Testing
```bash
npm run dev
# Test in browser at http://localhost:5000
```

#### Testing Checklist
- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Performance is acceptable (no lag, smooth animations)
- [ ] Data persists across page refresh (if using useKV)
- [ ] Error states handled gracefully

#### Testing Data Connectors
1. Open "Data Connector Manager"
2. Select your connector
3. Click "Test Connection"
4. Verify data displays correctly
5. Test caching (second request should be instant)
6. Test error handling (invalid credentials)

#### Testing Webhooks
1. Create webhook from template
2. Copy endpoint URL
3. Use webhook simulator or external service
4. Verify events appear in buffer
5. Test signature verification
6. Test payload transformation

### 4. Code Style Guidelines

#### TypeScript
- Use explicit types, avoid `any` when possible
- Use interfaces for object shapes
- Use type unions for variants
- Export types from `lib/types.ts`

```typescript
// ✅ Good
interface UserData {
  id: string
  name: string
  email: string
}

function processUser(user: UserData): void {
  // ...
}

// ❌ Avoid
function processUser(user: any) {
  // ...
}
```

#### React Components
- Use functional components with hooks
- Extract complex logic to custom hooks
- Use semantic HTML elements
- Add proper accessibility attributes

```typescript
// ✅ Good
export function MyComponent({ data }: MyComponentProps) {
  const [state, setState] = useState(0)
  
  return (
    <div role="region" aria-label="My Component">
      {/* ... */}
    </div>
  )
}

// ❌ Avoid
export default ({ data }: any) => {
  let state = 0
  return <div onClick={() => state++}>{state}</div>
}
```

#### State Management
- Use `useState` for local UI state
- Use `useKV` for persistent data
- **Always use functional updates with useKV**

```typescript
// ✅ CORRECT - Functional update
const [items, setItems] = useKV("items", [])
setItems((current) => [...current, newItem])

// ❌ WRONG - Stale closure
setItems([...items, newItem]) // items may be stale!
```

#### Styling
- Use Tailwind utility classes
- Follow existing design patterns
- Use CSS variables from theme
- Keep styling consistent with PRD

```typescript
// ✅ Good
<div className="flex items-center gap-4 p-6 rounded-lg bg-card">
  {/* ... */}
</div>

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '24px' }}>
  {/* ... */}
</div>
```

#### Error Handling
- Always handle errors gracefully
- Show user-friendly messages
- Log errors for debugging
- Provide recovery actions

```typescript
// ✅ Good
try {
  const data = await fetchData()
  return data
} catch (error) {
  console.error('Failed to fetch data:', error)
  toast.error('Failed to load data. Please try again.')
  return cachedData || []
}

// ❌ Avoid silent failures
try {
  const data = await fetchData()
  return data
} catch (error) {
  return null
}
```

### 5. Performance Best Practices

#### Component Optimization
```typescript
// Memoize expensive components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // ...
})

// Memoize computed values
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value)
}, [data])

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

#### Animation Performance
```typescript
// ✅ GPU-accelerated transforms
<motion.div
  animate={{ x: 100, opacity: 1 }}
  transition={{ duration: 0.3 }}
/>

// ❌ Avoid animating layout properties
<motion.div
  animate={{ left: '100px' }} // Causes reflow
/>
```

#### Data Fetching
```typescript
// Use caching to reduce API calls
const connector = {
  caching: {
    enabled: true,
    ttl: 300 // Cache for 5 minutes
  }
}

// Throttle high-frequency events
const handleMouseMove = throttle((e) => {
  // Handle event
}, 50) // Max once per 50ms
```

### 6. Debugging

#### React DevTools
1. Install React DevTools browser extension
2. Inspect component props and state
3. Profile component renders
4. Analyze performance

#### Console Logging
```typescript
// Use structured logging
console.log('Dashboard generated:', {
  id: dashboard.id,
  components: dashboard.components.length,
  timestamp: Date.now()
})

// Use console groups for related logs
console.group('API Request')
console.log('URL:', url)
console.log('Headers:', headers)
console.log('Response:', response)
console.groupEnd()
```

#### Network Tab
- Monitor API requests
- Check response times
- Verify request/response payloads
- Debug CORS issues

#### Spark KV Debugging
```typescript
// List all keys
const keys = await spark.kv.keys()
console.log('All keys:', keys)

// Inspect specific key
const value = await spark.kv.get('key-name')
console.log('Value:', value)

// Clear all data (for testing)
const keys = await spark.kv.keys()
for (const key of keys) {
  await spark.kv.delete(key)
}
```

## Common Tasks

### Adding a New shadcn Component

shadcn components are pre-installed in `src/components/ui/`. If you need a component not yet installed:

1. Check available components: `src/components/ui/`
2. Use existing components when possible
3. Reference shadcn/ui v4 documentation for usage

### Modifying the Theme

Edit `src/index.css`:

```css
:root {
  --primary: oklch(0.45 0.19 250); /* Change primary color */
  --accent: oklch(0.75 0.15 195);  /* Change accent color */
  --radius: 0.75rem;               /* Change border radius */
}
```

### Adding Google Fonts

Edit `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font:wght@400;700&display=swap" rel="stylesheet">
```

Then update `src/index.css`:

```css
@theme {
  --font-primary: 'Your Font', system-ui, sans-serif;
}

body {
  font-family: var(--font-primary);
}
```

### Creating Documentation

When adding features, update relevant documentation:

1. **PRD.md** - Product requirements and feature descriptions
2. **ARCHITECTURE.md** - Technical architecture details
3. **API.md** - API reference for new functions/hooks
4. **README.md** - User-facing feature announcements
5. **Dedicated docs** - Create separate `.md` for complex features

## Troubleshooting

### Build Errors

**"Module not found"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**
```bash
# Check tsconfig.json is correct
# Restart TypeScript server in IDE
# Run type check: npm run build
```

### Runtime Errors

**"useKV is not a function"**
- Ensure `@github/spark` is installed
- Check import: `import { useKV } from '@github/spark/hooks'`

**"spark is not defined"**
- `spark` is a global object, no import needed
- Only available in Spark runtime, not in external projects

**Chart not rendering**
- Verify data structure matches chart expectations
- Check console for Recharts errors
- Ensure data is not undefined or null

### Performance Issues

**Slow dashboard generation**
- Generation uses AI, typically takes 2-5 seconds
- Ensure progress indicators are shown
- Check network tab for API call issues

**Laggy animations**
- Reduce number of animated elements
- Use GPU-accelerated properties (transform, opacity)
- Check for memory leaks with DevTools

**Slow data loading**
- Verify caching is enabled
- Check rate limits aren't exceeded
- Consider reducing data payload size

## Best Practices Summary

### ✅ Do

- Use TypeScript with explicit types
- Use functional components with hooks
- Use `useKV` for persistent data with functional updates
- Handle errors gracefully
- Show loading and error states
- Follow existing code patterns
- Write self-documenting code
- Test on multiple devices
- Keep components small and focused
- Use semantic HTML
- Follow accessibility guidelines

### ❌ Don't

- Use `any` type unnecessarily
- Mutate state directly
- Use class components
- Store secrets in code
- Ignore TypeScript errors
- Skip error handling
- Block the UI thread
- Hardcode values that should be configurable
- Create deeply nested components
- Forget responsive design
- Use closure values with `useKV` (always use functional updates)

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [Spark Platform Docs](../packages/spark-tools/README.md)

## Getting Help

1. Check existing documentation files
2. Search for similar patterns in codebase
3. Review PRD.md for design decisions
4. Check console for error messages
5. Use React DevTools for debugging
6. Test in isolation to narrow down issues
