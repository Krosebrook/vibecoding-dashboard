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
│   State Management Layer     │  │   AI Integr
└─────────────────┬────────────┘  └──────────┬───────────────
                  ▼                           ▼
│                    Business Logic Layer                     
└─────────────────┬───────────────────────────┬───────────────
                  ▼                           ▼
│  External APIs           │      │  Spark Runt
└──────────────────────────┘      └─────────────────────────┘





- `generateDashboard()` - Main generation function
- `generateSetupInstructions()` - Creates deployment document
**Data Flow**:
User Prompt → AI Analysis → Component Selection → 
Con

- Uses `spark.l

### 2. Component Rendering System

**Purpose**: Dynamically renders dashboard com

- **Charts**: line-chart, bar-chart, pie-chart, area-chart, radar-chart, scatter-chart, composed-chart

- **Content**: for
**Rendering Strategy**:
- Props validation and sanitization
- Responsive grid layout with CSS Grid

#### A. API Co
**L
**Purpose**: Fetch data from external APIs with ca
**Architecture**:
Component → useDataConnector Hook → 
Tra

**Features**:
- Custom connector builder with visual UI
- Rate limiting per connector
- Request/response transformation

1. JSONPlaceholder - Demo data

5. Exchange Rates API - Currency conversion

#### B. Webhook Connectors (Push Model)

**Purpose**: Receive real-time
**Architecture**:
External Service → Webhook Endpoint → 
Event Buffer → Dashboard Update

- 10+ pre-configured webhook templates
- Signature verification (SHA-256, SHA-1)

- Event history and rep
**Supported Services**:
2. Stripe - Payments, subscriptions
4. Shopify - Orders, products
6. SendGrid - Email events

10. Custom - User-defined

**Location**: `src/lib/transform-pa

**Transform Types**:

4. **Conditional Logic** - Conditional field selection

- Organized by in
- C
**AI-Powered Generation**:
- Intelligent field mapping sug
- Code explanation and optimi
### 5. Visual Patte
**L

**Features**:
- Drag-and-drop interface
- Layer management (z-index, blend modes)
- Export to CSS/JSON
**Element Types**:
- Patterns: grid, dots, waves, stripes, chevron
- Complex: hexagon, star, spiral
### 6. Animation System

**Location**: `src/lib/a
**Purpose**: Pre-built animati
**Categories**:
2. Exit - Fade out, slide out, scale ou
4. Choreography - Multi-element sequen
6. Transformation - Morph, flip, rotate, et
**Complexity Levels**: Simple, Moderat
**Orchestration Types**: Parallel,

**Location**: `src/components/Choreogra

**Features**:

- Custom timing (delay, duration)





- Mouse movements (throttled to
- S

1. **JSON** -
3. **React/Framer Motion** - Productio
**Playback Features**:
- Animated cursor visualization
- Pause/resume controls
#### D. Text Animation System
**Location**: `src/lib/text-ani
**Purpose**: Sophisticated

- Physics: spring, boun

- Fade, Slide, Scale, Rotate





- Gravity (0-2)
- Damping (0.9-1.0)


- Turbulence (0-2)





- Draggable keyframe
- Zoom controls (0.5x-4x)
- Snap-to-keyframe
- Property editing
## Data Models

```typescript
  id: string
  description: string
  createdAt: string
  layout: LayoutConfig

}


interface DashboardComponent {
  type: ComponentType

  title?: string



interface DataConnector {

  url: string
    type: 'bearer' | 'apiKey' | 'basic'
  }
  params?: Record<string, 
    enabled: boolean
  }
    requestsPerMinut



interface WebhookConfig {
  name: string
  endpoint: string

  active: boolean





- Loading states

- Dashboard con
- Webhook configurations
- Animation recordings
### State Management Pattern
```typescript
const [todos, setTodos] = useKV("todos", []




- Dynamic imports for heavy components

### 2. Rendering Optimizatio

- Virtualization for long lists (ScrollArea)

- Webhook event buffering with limits

### 4. Animat
- GPU-accelerated transforms
- Throttling for high-fr
## Security Consi
### 1. API Security
- Client-side encry
- CORS-aware c
### 2. Webhoo

- Payload size limits

- Input sanitization

### 4. User Data

- Export/import for 
## Error Handling
### 1. API Errors
try {
  if (!response.ok) throw ne

  console.error('AP
  return cachedFallback
```
### 2. AI Generation Errors

- Progress indication
### 3. Rendering Errors
- Graceful degradation
- User notification with reco
## Testing Strategy

- Data model validation

- API connector functionality

### E2E Tests

- Animation recording and playback
## Build & Deployment
### Build Process
npm run build


```bash
# Vite dev server with HMR

### Production Considerations

- Lazy loading for code splitting

**Supported Browsers**:

- Opera 76+

- CSS Grid
- Fetch API
- Canvas API (for p
## Dependencies
### Core Framework


- shadcn/ui v4 - Component library
- Tailwind CSS v

- Recharts 2 - Char

### Utilities



- LLM integration API

### Scalability

- Collaborati
### Performance
- IndexedDB for large datas
- Offline support
### Features
- Version control 
- Analytics and usage tr




















































































































































































































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
