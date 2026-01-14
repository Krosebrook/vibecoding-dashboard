export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb'

  name: string
  type: Data
  config: Data
  lastTested?: number
}
export interfa
  port: number
  username: string
  ssl?: boolean
  options?: Record<strin


  description: string
  parameters?:
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
  timestamp: number


    name: 'PostgreSQL',
    type: 'pos
    config: {
      port: 5432,
      username: 'pos
 

        connectionTimeoutMilli
    },
      {
        name: 'Get 
        query: 'SELECT *
      },
        id: 'sample
 

        ],
      {
        name: 'Recent Orders',
        query: `SELECT 
JOIN users u ON o.user_id = u.id 
ORDER BY o.created_at D
      },
  },
    id: 'mysql-template'
    description: 
    icon: '🐬',
      host: 'localhost',
      database: 'my
      password: '
      options: {
        waitForC
      },
    queries: [
        
      
        parame
      {
        name: 'Product 
        query: 'SELECT * FROM 
          { name: 'category', type: 'string', required: true },
      },
        id: 'sample-3',
        
  DATE_
  SUM(total) as total_s
WHERE order_date >= DATE_SU
ORDER BY month DESC;`,
      },
  },
    id: 'mongodb-template',
    descri
    icon
      h
      database: 'mydb',
      password: '',
      connectionString: 'mongodb://localhost:27017/mydb',
        maxPoolSize: 10,
        server
    },
      {
        name: 'Find All Docum
        query: 'db.coll
      },
      
    
        pa
        ],
      {
        name: 'Aggregate Pipeline',
        query: `db
  { $group: { _
]).toArray()`
      },
  },

  const { type, config 
  switch (type) {
      return `// 


  host: '${config.host}',
  database: '${config.
  passwo
  max:
  connectionTi

async function executeQ
  try {
    return result.rows
    client.release()
}
// Don't
  pool.

      return `// MySQL Connection Se


  host: '${config.hos
  database: '${config.database}',
  password
  waitFo
  queue

async function executeQuery() 
  return rows

process.on('SIGTERM', async () => {
})`
    case 'mongodb':
// Install:
import { MongoClient } from 'mongodb'
const uri = '$
const client = new Mon
  maxPoolSize: ${config
  server

  aw
}
// Example query
  const db = await c
  return await collection.find({}).limit(10).toArray()

process.on('SIG
})`
    default:
  }

  const { type, con
  const commonInstr
## Overview

- Node.js 18+ in
- Database credentials a
`
  const specificInstructions = {

\`\`\`
npm install --

- Host: ${config.host}
- Database: ${config.database}
- SSL: ${config.ssl ? 'Enabled' : 'Disabled'}
### 3. Create Connection

- Store 
- Enabl
- Use parameterized que
### 5. Common Operations
**Create Table:**
CREATE TABLE users (
  name VARCHAR(255) N
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
\`\`\`
**Insert
INSERT 

\`\`\`sql
\`\`\`
### 6. Troubleshooting
- Check firewall allows port ${config.port}
- Check pg_hba.conf for authentication settings`,
    mysql: `## MySQL Setup
### 1. Install
npm install mysql2

- Host
- Da
-


- Store credentials in environment v

- Always use prep
### 5. Common Operatio
**Create Table:**
CREATE TABLE products (

  category VARCHAR(100),


\`\`\`sql
\`\`\`
**Query Data:**
SELECT * FROM products WHERE 

- Ensure MySQL is running: \`sudo systemctl status mysql\`
- Verify user privileges: \`SHOW GRA


\`

### 2. Connectio
- Port: ${config.port}
${config.username ? `- Username: ${co
- Conne
### 3. Create Connection

- Store crede
- Use SSL/TLS for en
- I
#

await collection.insertOne({
  email: 'john@example.com',
})


\`\`\`
**Update Document:**
await collection.updateOne(

\`\`\`

const result = await collection
  { $group: { _id: '$bran
]).toArray()

- Ensure MongoDB is running: 
- Verify authentication if enable
- Monitor connection pool with db.serverStatus()`,

}
export function generateSampleData(type: Database
  

        { id: 2,
        { id: 4, name: 'David B
      ]
      return 
 

      ]
      return []
}
exp

    errors.push('Ho

    errors.push('Port must be b

    errors.push('Database name is req

    errors.push('Username is required')

    valid: errors.length === 0,
  }










































































































































































































































































