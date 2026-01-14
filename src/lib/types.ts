export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'csv'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

export type MigrationStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'rolled-back'

export type TransformationType = 
  | 'none' 
  | 'type-conversion' 
  | 'value-mapping' 
  | 'calculated-field' 
  | 'filter' 
  | 'concatenate'
  | 'split'
  | 'date-format'
  | 'case-transform'

export interface DatabaseConnection {
  id: string
  name: string
  type: DatabaseType
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  filePath?: string
  status: ConnectionStatus
  lastTested?: string
  metadata?: {
    tables?: string[]
    version?: string
  }
}

export interface SchemaField {
  name: string
  type: string
  nullable: boolean
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  defaultValue?: string
}

export interface SchemaTable {
  name: string
  fields: SchemaField[]
  recordCount?: number
}

export interface FieldMapping {
  id: string
  sourceTable: string
  sourceField: string
  destinationTable: string
  destinationField: string
  transformation?: DataTransformation
}

export interface DataTransformation {
  type: TransformationType
  config?: {
    targetType?: string
    mapping?: Record<string, string>
    expression?: string
    filter?: string
    dateFormat?: string
    caseType?: 'upper' | 'lower' | 'title'
    delimiter?: string
    fields?: string[]
  }
}

export interface MigrationConfig {
  id: string
  name: string
  description?: string
  sourceConnectionId: string
  destinationConnectionId: string
  mappings: FieldMapping[]
  options: {
    batchSize: number
    continueOnError: boolean
    deleteExisting: boolean
    validateData: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface MigrationExecution {
  id: string
  configId: string
  status: MigrationStatus
  progress: number
  totalRecords: number
  processedRecords: number
  failedRecords: number
  startTime?: string
  endTime?: string
  errors: MigrationError[]
  logs: MigrationLog[]
  canRollback: boolean
}

export interface MigrationError {
  id: string
  timestamp: string
  record?: any
  field?: string
  message: string
  severity: 'warning' | 'error' | 'critical'
}

export interface MigrationLog {
  id: string
  timestamp: string
  message: string
  level: 'info' | 'success' | 'warning' | 'error'
}

export interface ValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  suggestions: string[]
}

export type DashboardType = 
  | 'analytics' 
  | 'crm' 
  | 'project' 
  | 'monitoring' 
  | 'social' 
  | 'social-media'
  | 'ecommerce' 
  | 'custom'
  | 'business-intelligence'
  | 'sales'
  | 'finance'
  | 'hr'

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
  | 'cpu-monitor'
  | 'memory-monitor'
  | 'network-monitor'
  | 'server-status'
  | 'alert-list'
  | 'realtime-chart'

export interface DashboardComponent {
  id: string
  type: ComponentType
  title: string
  description?: string
  position: {
    row: number
    col: number
  }
  size: {
    rows: number
    cols: number
  }
  props: Record<string, any>
}

export interface DashboardLayout {
  type: 'grid' | 'flex'
  columns: number
  gap: number
  padding?: number
}

export interface DashboardConfig {
  id?: string
  name: string
  description: string
  type: DashboardType
  components: DashboardComponent[]
  layout: DashboardLayout
  theme?: {
    primary: string
    secondary: string
    accent: string
  }
  dataModel?: {
    entities: Array<{
      name: string
      fields: Array<{
        name: string
        type: string
        required?: boolean
      }>
    }>
    seedData: Record<string, any[]>
  }
  createdAt?: string
  updatedAt?: string
}

export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: string
  config: DashboardConfig
  tags: string[]
  isPopular?: boolean
}

export type GenerationStage = 'analyzing' | 'modeling' | 'designing' | 'generating' | 'complete'

export interface GenerationProgress {
  stage: GenerationStage
  progress: number
  message: string
}
