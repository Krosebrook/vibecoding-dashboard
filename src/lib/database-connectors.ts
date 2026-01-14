export type DatabaseConnectorType = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'csv'

export interface DatabaseConnectorConfig {
  id: string
  name: string
  type: DatabaseConnectorType
  config: Record<string, any>
  lastTested?: number
}
