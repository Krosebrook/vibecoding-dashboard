export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb'

export interface DatabaseConnector {
  id: string
  name: string
  description: string
  type: DatabaseType
  icon: string
  config: DatabaseConfig
  status?: 'connected' | 'disconnected' | 'testing' | 'error'
  lastTested?: number
  queries?: SavedQuery[]
}

export interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl?: boolean
  connectionString?: string
  options?: Record<string, any>
}

export interface SavedQuery {
  id: string
  name: string
  description: string
  query: string
  parameters?: QueryParameter[]
  lastExecuted?: number
  resultCount?: number
}

export interface QueryParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date'
  defaultValue?: any
  required?: boolean
}

export interface QueryResult {
  success: boolean
  data?: any[]
  rowCount?: number
  executionTime?: number
  error?: string
  timestamp: number
}

export const databaseTemplates: Record<DatabaseType, DatabaseConnector> = {
  postgresql: {
    id: 'postgresql-template',
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL database with advanced query capabilities',
    type: 'postgresql',
    icon: '🐘',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'mydb',
      username: 'postgres',
      password: '',
      ssl: false,
      options: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    },
    queries: [
      {
        id: 'sample-1',
        name: 'Get All Users',
        description: 'Retrieve all users from the users table',
        query: 'SELECT * FROM users ORDER BY created_at DESC LIMIT 100;',
        parameters: [],
      },
      {
        id: 'sample-2',
        name: 'User by ID',
        description: 'Get a specific user by their ID',
        query: 'SELECT * FROM users WHERE id = $1;',
        parameters: [
          { name: 'userId', type: 'number', required: true },
        ],
      },
      {
        id: 'sample-3',
        name: 'Recent Orders',
        description: 'Get recent orders with user information',
        query: `SELECT o.*, u.name, u.email 
FROM orders o 
JOIN users u ON o.user_id = u.id 
WHERE o.created_at > NOW() - INTERVAL '30 days' 
ORDER BY o.created_at DESC;`,
        parameters: [],
      },
    ],
  },
  mysql: {
    id: 'mysql-template',
    name: 'MySQL',
    description: 'Connect to MySQL/MariaDB database with flexible querying',
    type: 'mysql',
    icon: '🐬',
    config: {
      host: 'localhost',
      port: 3306,
      database: 'mydb',
      username: 'root',
      password: '',
      ssl: false,
      options: {
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
      },
    },
    queries: [
      {
        id: 'sample-1',
        name: 'Get All Products',
        description: 'Retrieve all products from inventory',
        query: 'SELECT * FROM products ORDER BY created_at DESC LIMIT 100;',
        parameters: [],
      },
      {
        id: 'sample-2',
        name: 'Product by Category',
        description: 'Get products filtered by category',
        query: 'SELECT * FROM products WHERE category = ? ORDER BY name;',
        parameters: [
          { name: 'category', type: 'string', required: true },
        ],
      },
      {
        id: 'sample-3',
        name: 'Sales Summary',
        description: 'Get sales summary grouped by month',
        query: `SELECT 
  DATE_FORMAT(order_date, '%Y-%m') as month,
  COUNT(*) as order_count,
  SUM(total) as total_sales
FROM orders
WHERE order_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY month
ORDER BY month DESC;`,
        parameters: [],
      },
    ],
  },
  mongodb: {
    id: 'mongodb-template',
    name: 'MongoDB',
    description: 'Connect to MongoDB with document-based queries',
    type: 'mongodb',
    icon: '🍃',
    config: {
      host: 'localhost',
      port: 27017,
      database: 'mydb',
      username: '',
      password: '',
      ssl: false,
      connectionString: 'mongodb://localhost:27017/mydb',
      options: {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
      },
    },
    queries: [
      {
        id: 'sample-1',
        name: 'Find All Documents',
        description: 'Find all documents in a collection',
        query: 'db.collection.find({}).limit(100).toArray()',
        parameters: [],
      },
      {
        id: 'sample-2',
        name: 'Find by Field',
        description: 'Find documents matching a specific field',
        query: 'db.collection.find({ status: "active" }).toArray()',
        parameters: [
          { name: 'status', type: 'string', required: true },
        ],
      },
      {
        id: 'sample-3',
        name: 'Aggregate Pipeline',
        description: 'Run an aggregation pipeline',
        query: `db.collection.aggregate([
  { $match: { created_at: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
  { $group: { _id: "$category", count: { $sum: 1 }, total: { $sum: "$amount" } } },
  { $sort: { total: -1 } }
]).toArray()`,
        parameters: [],
      },
    ],
  },
}

export function generateConnectionCode(connector: DatabaseConnector): string {
  const { type, config } = connector

  switch (type) {
    case 'postgresql':
      return `// PostgreSQL Connection Setup
// Install: npm install pg

import { Pool } from 'pg'

const pool = new Pool({
  host: '${config.host}',
  port: ${config.port},
  database: '${config.database}',
  user: '${config.username}',
  password: '${config.password}',
  ssl: ${config.ssl ? '{ rejectUnauthorized: false }' : 'false'},
  max: ${config.options?.max || 20},
  idleTimeoutMillis: ${config.options?.idleTimeoutMillis || 30000},
  connectionTimeoutMillis: ${config.options?.connectionTimeoutMillis || 2000},
})

// Example query
async function executeQuery() {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM users LIMIT 10')
    return result.rows
  } finally {
    client.release()
  }
}

// Don't forget to close the pool when shutting down
process.on('SIGTERM', () => {
  pool.end()
})`

    case 'mysql':
      return `// MySQL Connection Setup
// Install: npm install mysql2

import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: '${config.host}',
  port: ${config.port},
  database: '${config.database}',
  user: '${config.username}',
  password: '${config.password}',
  ssl: ${config.ssl ? '{ rejectUnauthorized: false }' : 'undefined'},
  waitForConnections: true,
  connectionLimit: ${config.options?.connectionLimit || 10},
  queueLimit: ${config.options?.queueLimit || 0},
})

// Example query
async function executeQuery() {
  const [rows] = await pool.execute('SELECT * FROM products LIMIT 10')
  return rows
}

// Close the pool when shutting down
process.on('SIGTERM', async () => {
  await pool.end()
})`

    case 'mongodb':
      return `// MongoDB Connection Setup
// Install: npm install mongodb

import { MongoClient } from 'mongodb'

const uri = '${config.connectionString || `mongodb://${config.username ? `${config.username}:${config.password}@` : ''}${config.host}:${config.port}/${config.database}`}'

const client = new MongoClient(uri, {
  ssl: ${config.ssl},
  maxPoolSize: ${config.options?.maxPoolSize || 10},
  minPoolSize: ${config.options?.minPoolSize || 2},
  serverSelectionTimeoutMS: ${config.options?.serverSelectionTimeoutMS || 5000},
})

async function connect() {
  await client.connect()
  return client.db('${config.database}')
}

// Example query
async function executeQuery() {
  const db = await connect()
  const collection = db.collection('users')
  return await collection.find({}).limit(10).toArray()
}

// Close connection when shutting down
process.on('SIGTERM', async () => {
  await client.close()
})`

    default:
      return '// Unknown database type'
  }
}

export function generateSetupInstructions(connector: DatabaseConnector): string {
  const { type, config } = connector

  const commonInstructions = `# Database Connection Setup Instructions

## Overview
This guide will help you set up and connect to your ${connector.name} database.

## Prerequisites
- Node.js 18+ installed
- ${connector.name} database server running
- Database credentials and access permissions

`

  const specificInstructions = {
    postgresql: `## PostgreSQL Setup

### 1. Install Dependencies
\`\`\`bash
npm install pg
npm install --save-dev @types/pg
\`\`\`

### 2. Connection Details
- Host: ${config.host}
- Port: ${config.port}
- Database: ${config.database}
- Username: ${config.username}
- SSL: ${config.ssl ? 'Enabled' : 'Disabled'}

### 3. Create Connection
See the "Connection Code" tab for the complete implementation.

### 4. Security Best Practices
- Store credentials in environment variables
- Use connection pooling for performance
- Enable SSL in production
- Set appropriate connection limits
- Use parameterized queries to prevent SQL injection

### 5. Common Operations

**Create Table:**
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

**Insert Data:**
\`\`\`sql
INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *;
\`\`\`

**Query Data:**
\`\`\`sql
SELECT * FROM users WHERE email = $1;
\`\`\`

### 6. Troubleshooting
- Ensure PostgreSQL is running: \`sudo systemctl status postgresql\`
- Check firewall allows port ${config.port}
- Verify user has proper permissions
- Check pg_hba.conf for authentication settings`,

    mysql: `## MySQL Setup

### 1. Install Dependencies
\`\`\`bash
npm install mysql2
\`\`\`

### 2. Connection Details
- Host: ${config.host}
- Port: ${config.port}
- Database: ${config.database}
- Username: ${config.username}
- SSL: ${config.ssl ? 'Enabled' : 'Disabled'}

### 3. Create Connection
See the "Connection Code" tab for the complete implementation.

### 4. Security Best Practices
- Store credentials in environment variables
- Use connection pooling for optimal performance
- Enable SSL/TLS in production
- Set appropriate connection limits
- Always use prepared statements

### 5. Common Operations

**Create Table:**
\`\`\`sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

**Insert Data:**
\`\`\`sql
INSERT INTO products (name, price, category) VALUES (?, ?, ?);
\`\`\`

**Query Data:**
\`\`\`sql
SELECT * FROM products WHERE category = ? ORDER BY price DESC;
\`\`\`

### 6. Troubleshooting
- Ensure MySQL is running: \`sudo systemctl status mysql\`
- Check firewall allows port ${config.port}
- Verify user privileges: \`SHOW GRANTS FOR '${config.username}'@'${config.host}';\`
- Check max_connections setting if connection errors occur`,

    mongodb: `## MongoDB Setup

### 1. Install Dependencies
\`\`\`bash
npm install mongodb
\`\`\`

### 2. Connection Details
- Host: ${config.host}
- Port: ${config.port}
- Database: ${config.database}
${config.username ? `- Username: ${config.username}` : '- Authentication: Disabled'}
- SSL: ${config.ssl ? 'Enabled' : 'Disabled'}
- Connection String: ${config.connectionString || 'Generated from settings'}

### 3. Create Connection
See the "Connection Code" tab for the complete implementation.

### 4. Security Best Practices
- Store credentials in environment variables
- Enable authentication in production
- Use SSL/TLS for encrypted connections
- Set appropriate connection pool sizes
- Implement proper error handling

### 5. Common Operations

**Insert Document:**
\`\`\`javascript
await collection.insertOne({
  name: 'John Doe',
  email: 'john@example.com',
  created_at: new Date()
})
\`\`\`

**Find Documents:**
\`\`\`javascript
const users = await collection.find({ status: 'active' }).toArray()
\`\`\`

**Update Document:**
\`\`\`javascript
await collection.updateOne(
  { _id: userId },
  { $set: { status: 'inactive' } }
)
\`\`\`

**Aggregation:**
\`\`\`javascript
const result = await collection.aggregate([
  { $match: { category: 'electronics' } },
  { $group: { _id: '$brand', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).toArray()
\`\`\`

### 6. Troubleshooting
- Ensure MongoDB is running: \`sudo systemctl status mongod\`
- Check firewall allows port ${config.port}
- Verify authentication if enabled
- Check connection string format
- Monitor connection pool with db.serverStatus()`,
  }

  return commonInstructions + specificInstructions[type]
}

export function generateSampleData(type: DatabaseType): any[] {
  switch (type) {
    case 'postgresql':
    case 'mysql':
      return [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', created_at: '2024-01-15T10:30:00Z' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', created_at: '2024-01-16T14:20:00Z' },
        { id: 3, name: 'Carol White', email: 'carol@example.com', created_at: '2024-01-17T09:45:00Z' },
        { id: 4, name: 'David Brown', email: 'david@example.com', created_at: '2024-01-18T16:15:00Z' },
        { id: 5, name: 'Emma Davis', email: 'emma@example.com', created_at: '2024-01-19T11:00:00Z' },
      ]
    case 'mongodb':
      return [
        { _id: '507f1f77bcf86cd799439011', name: 'Alice Johnson', email: 'alice@example.com', status: 'active', created_at: new Date('2024-01-15') },
        { _id: '507f1f77bcf86cd799439012', name: 'Bob Smith', email: 'bob@example.com', status: 'active', created_at: new Date('2024-01-16') },
        { _id: '507f1f77bcf86cd799439013', name: 'Carol White', email: 'carol@example.com', status: 'inactive', created_at: new Date('2024-01-17') },
        { _id: '507f1f77bcf86cd799439014', name: 'David Brown', email: 'david@example.com', status: 'active', created_at: new Date('2024-01-18') },
        { _id: '507f1f77bcf86cd799439015', name: 'Emma Davis', email: 'emma@example.com', status: 'active', created_at: new Date('2024-01-19') },
      ]
    default:
      return []
  }
}

export function validateDatabaseConfig(config: DatabaseConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.host || config.host.trim() === '') {
    errors.push('Host is required')
  }

  if (!config.port || config.port < 1 || config.port > 65535) {
    errors.push('Port must be between 1 and 65535')
  }

  if (!config.database || config.database.trim() === '') {
    errors.push('Database name is required')
  }

  if (!config.username || config.username.trim() === '') {
    errors.push('Username is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
