export interface DashboardConfig {
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

export interface DashboardComponent {
  id: string
  type: ComponentType
  props: Record<string, any>
  position: Position
  size: Size
  title?: string
  description?: string
}

export type ComponentType =
  | 'metric-card'
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'area-chart'
  | 'radar-chart'
  | 'composed-chart'
  | 'scatter-chart'
  | 'data-table'
  | 'stat-grid'
  | 'progress-bar'
  | 'activity-feed'
  | 'user-list'
  | 'calendar'
  | 'kanban-board'
  | 'form'
  | 'text-block'
  | 'image-gallery'
  | 'map'
  | 'timeline'
  | 'cpu-monitor'
  | 'memory-monitor'
  | 'network-monitor'
  | 'server-status'
  | 'alert-list'
  | 'realtime-chart'

export interface Position {
  row: number
  col: number
}

export interface Size {
  rows: number
  cols: number
}

export interface LayoutConfig {
  type: 'grid' | 'flex' | 'masonry'
  columns: number
  gap: number
  padding: number
}

export interface ThemeConfig {
  primaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderRadius: number
}

export interface DataModel {
  entities: Entity[]
  seedData: Record<string, any[]>
}

export interface Entity {
  name: string
  fields: Field[]
}

export interface Field {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  required?: boolean
}

export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: string
  preview: string
  config: Partial<DashboardConfig>
}

export interface GenerationProgress {
  stage: 'analyzing' | 'modeling' | 'designing' | 'generating' | 'complete'
  progress: number
  message: string
}
