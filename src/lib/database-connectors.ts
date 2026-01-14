export type DatabaseConnectorType = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'csv'
export type DatabaseType = DatabaseConnectorType

export interface DatabaseConnectorConfig {
  id: string
  name: string
  type: DatabaseConnectorType
  config: Record<string, any>
  lastTested?: number
}

export interface DatabaseConnector extends DatabaseConnectorConfig {
  status?: 'idle' | 'connected' | 'error'
  description?: string
  icon?: string
  queries?: SavedQuery[]
}

export interface SavedQuery {
  id: string
  name: string
  description?: string
  query: string
  connectorId: string
  createdAt: string
  lastRun?: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
  }>
}

export const databaseTemplates: Record<DatabaseType, DatabaseConnector> = {
  postgresql: {
    id: '',
    name: 'New PostgreSQL Connection',
    type: 'postgresql',
    description: 'PostgreSQL database connection',
    status: 'idle',
    config: {
      host: 'localhost',
      port: 5432,
      database: '',
      username: '',
      password: ''
    }
  },
  mysql: {
    id: '',
    name: 'New MySQL Connection',
    type: 'mysql',
    description: 'MySQL database connection',
    status: 'idle',
    config: {
      host: 'localhost',
      port: 3306,
      database: '',
      username: '',
      password: ''
    }
  },
  mongodb: {
    id: '',
    name: 'New MongoDB Connection',
    type: 'mongodb',
    description: 'MongoDB database connection',
    status: 'idle',
    config: {
      host: 'localhost',
      port: 27017,
      database: '',
      username: '',
      password: ''
    }
  },
  sqlite: {
    id: '',
    name: 'New SQLite Connection',
    type: 'sqlite',
    description: 'SQLite database connection',
    status: 'idle',
    config: {
      filePath: ''
    }
  },
  csv: {
    id: '',
    name: 'New CSV Connection',
    type: 'csv',
    description: 'CSV file connection',
    status: 'idle',
    config: {
      filePath: '',
      delimiter: ',',
      hasHeader: true
    }
  }
}

export function generateConnectionCode(connector: DatabaseConnector): string {
  switch (connector.type) {
    case 'postgresql':
      return `import { Pool } from 'pg'

const pool = new Pool({
  host: '${connector.config.host}',
  port: ${connector.config.port},
  database: '${connector.config.database}',
  user: '${connector.config.username}',
  password: '${connector.config.password}'
})

const client = await pool.connect()
try {
  const result = await client.query('SELECT * FROM your_table')
  console.log(result.rows)
} finally {
  client.release()
}`

    case 'mysql':
      return `import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: '${connector.config.host}',
  port: ${connector.config.port},
  database: '${connector.config.database}',
  user: '${connector.config.username}',
  password: '${connector.config.password}'
})

const [rows] = await connection.execute('SELECT * FROM your_table')
console.log(rows)`

    case 'mongodb':
      return `import { MongoClient } from 'mongodb'

const uri = 'mongodb://${connector.config.username}:${connector.config.password}@${connector.config.host}:${connector.config.port}/${connector.config.database}'
const client = new MongoClient(uri)

await client.connect()
const db = client.db('${connector.config.database}')
const collection = db.collection('your_collection')
const docs = await collection.find({}).toArray()
console.log(docs)`

    case 'sqlite':
      return `import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const db = await open({
  filename: '${connector.config.filePath}',
  driver: sqlite3.Database
})

const rows = await db.all('SELECT * FROM your_table')
console.log(rows)`

    case 'csv':
      return `import fs from 'fs'
import csv from 'csv-parser'

const results = []
fs.createReadStream('${connector.config.filePath}')
  .pipe(csv({ separator: '${connector.config.delimiter}' }))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results)
  })`

    default:
      return '// Connection code not available'
  }
}

export function generateSetupInstructions(connector: DatabaseConnector): string {
  switch (connector.type) {
    case 'postgresql':
      return `1. Install PostgreSQL client library:
   npm install pg

2. Create connection pool with your credentials
3. Use parameterized queries to prevent SQL injection
4. Always release connections after use`

    case 'mysql':
      return `1. Install MySQL client library:
   npm install mysql2

2. Create connection with your credentials
3. Use prepared statements for security
4. Close connections when done`

    case 'mongodb':
      return `1. Install MongoDB driver:
   npm install mongodb

2. Connect using connection URI
3. Use proper authentication
4. Close connection when finished`

    case 'sqlite':
      return `1. Install SQLite library:
   npm install sqlite3 sqlite

2. Open database file
3. Run queries using the connection
4. Close database when done`

    case 'csv':
      return `1. Install CSV parser:
   npm install csv-parser

2. Create read stream from file
3. Parse rows with appropriate delimiter
4. Process data in chunks`

    default:
      return 'Setup instructions not available'
  }
}

export function generateSampleData(connectorOrType: DatabaseConnector | DatabaseConnectorType): any[] {
  return [
    { id: 1, name: 'Sample Row 1', value: 100, created_at: new Date().toISOString() },
    { id: 2, name: 'Sample Row 2', value: 200, created_at: new Date().toISOString() },
    { id: 3, name: 'Sample Row 3', value: 300, created_at: new Date().toISOString() }
  ]
}

export function validateDatabaseConfig(connector: DatabaseConnector): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!connector.name || connector.name.trim() === '') {
    errors.push('Connection name is required')
  }

  switch (connector.type) {
    case 'postgresql':
    case 'mysql':
    case 'mongodb':
      if (!connector.config.host) errors.push('Host is required')
      if (!connector.config.port) errors.push('Port is required')
      if (!connector.config.database) errors.push('Database name is required')
      break

    case 'sqlite':
    case 'csv':
      if (!connector.config.filePath) errors.push('File path is required')
      break
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
