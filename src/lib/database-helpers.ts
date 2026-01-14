import { DatabaseConnection, SchemaTable, DatabaseType } from './types'

export async function testConnection(connection: DatabaseConnection): Promise<{ success: boolean; message: string; metadata?: any }> {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
  
  const success = Math.random() > 0.2
  
  if (success) {
    const mockMetadata = {
      version: getMockVersion(connection.type),
      tables: getMockTables(connection.type),
    }
    
    return {
      success: true,
      message: 'Connection successful',
      metadata: mockMetadata,
    }
  }
  
  return {
    success: false,
    message: 'Failed to connect: Invalid credentials or host unreachable',
  }
}

export async function fetchSchema(connection: DatabaseConnection): Promise<SchemaTable[]> {
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
  
  return getMockSchema(connection.type)
}

function getMockVersion(type: DatabaseType): string {
  const versions: Record<DatabaseType, string> = {
    postgresql: 'PostgreSQL 15.3',
    mysql: 'MySQL 8.0.33',
    mongodb: 'MongoDB 6.0.5',
    sqlite: 'SQLite 3.42.0',
    csv: 'CSV File Format',
  }
  return versions[type]
}

function getMockTables(type: DatabaseType): string[] {
  if (type === 'mongodb') {
    return ['users', 'orders', 'products', 'categories', 'reviews']
  }
  if (type === 'csv') {
    return ['data']
  }
  return ['users', 'orders', 'products', 'categories', 'order_items', 'reviews']
}

function getMockSchema(type: DatabaseType): SchemaTable[] {
  if (type === 'mongodb') {
    return [
      {
        name: 'users',
        recordCount: 1250,
        fields: [
          { name: '_id', type: 'ObjectId', nullable: false, isPrimaryKey: true },
          { name: 'email', type: 'String', nullable: false },
          { name: 'name', type: 'String', nullable: false },
          { name: 'age', type: 'Number', nullable: true },
          { name: 'created_at', type: 'Date', nullable: false },
        ],
      },
      {
        name: 'products',
        recordCount: 850,
        fields: [
          { name: '_id', type: 'ObjectId', nullable: false, isPrimaryKey: true },
          { name: 'name', type: 'String', nullable: false },
          { name: 'description', type: 'String', nullable: true },
          { name: 'price', type: 'Number', nullable: false },
          { name: 'stock', type: 'Number', nullable: false },
        ],
      },
    ]
  }
  
  if (type === 'csv') {
    return [
      {
        name: 'data',
        recordCount: 5000,
        fields: [
          { name: 'id', type: 'text', nullable: false },
          { name: 'name', type: 'text', nullable: false },
          { name: 'value', type: 'text', nullable: true },
          { name: 'date', type: 'text', nullable: true },
        ],
      },
    ]
  }
  
  return [
    {
      name: 'users',
      recordCount: 1250,
      fields: [
        { name: 'id', type: type === 'postgresql' ? 'integer' : 'int', nullable: false, isPrimaryKey: true },
        { name: 'email', type: 'varchar', nullable: false },
        { name: 'name', type: 'varchar', nullable: false },
        { name: 'age', type: type === 'postgresql' ? 'integer' : 'int', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: false },
      ],
    },
    {
      name: 'products',
      recordCount: 850,
      fields: [
        { name: 'id', type: type === 'postgresql' ? 'integer' : 'int', nullable: false, isPrimaryKey: true },
        { name: 'name', type: 'varchar', nullable: false },
        { name: 'description', type: 'text', nullable: true },
        { name: 'price', type: 'decimal', nullable: false },
        { name: 'stock', type: type === 'postgresql' ? 'integer' : 'int', nullable: false },
        { name: 'category_id', type: type === 'postgresql' ? 'integer' : 'int', nullable: true, isForeignKey: true },
      ],
    },
    {
      name: 'orders',
      recordCount: 3420,
      fields: [
        { name: 'id', type: type === 'postgresql' ? 'integer' : 'int', nullable: false, isPrimaryKey: true },
        { name: 'user_id', type: type === 'postgresql' ? 'integer' : 'int', nullable: false, isForeignKey: true },
        { name: 'total_amount', type: 'decimal', nullable: false },
        { name: 'status', type: 'varchar', nullable: false },
        { name: 'created_at', type: 'timestamp', nullable: false },
      ],
    },
  ]
}

export function getDatabaseIcon(type: DatabaseType): string {
  const icons: Record<DatabaseType, string> = {
    postgresql: '🐘',
    mysql: '🐬',
    mongodb: '🍃',
    sqlite: '🪶',
    csv: '📄',
  }
  return icons[type]
}

export function getDatabaseColor(type: DatabaseType): string {
  const colors: Record<DatabaseType, string> = {
    postgresql: 'text-blue-400',
    mysql: 'text-orange-400',
    mongodb: 'text-green-400',
    sqlite: 'text-cyan-400',
    csv: 'text-yellow-400',
  }
  return colors[type]
}

export function validateMapping(sourceField: string, destField: string, sourceType: string, destType: string): { valid: boolean; warning?: string } {
  if (sourceType === destType) {
    return { valid: true }
  }
  
  const safeConversions: Record<string, string[]> = {
    'int': ['integer', 'bigint', 'decimal', 'varchar', 'text'],
    'integer': ['int', 'bigint', 'decimal', 'varchar', 'text'],
    'varchar': ['text', 'char'],
    'text': ['varchar'],
    'decimal': ['int', 'integer', 'varchar', 'text'],
    'timestamp': ['varchar', 'text', 'date'],
    'date': ['timestamp', 'varchar', 'text'],
  }
  
  const sourceLower = sourceType.toLowerCase()
  const destLower = destType.toLowerCase()
  
  if (safeConversions[sourceLower]?.includes(destLower)) {
    return { 
      valid: true, 
      warning: `Type conversion: ${sourceType} → ${destType}` 
    }
  }
  
  return { 
    valid: true, 
    warning: `Manual type conversion may be required: ${sourceType} → ${destType}` 
  }
}
