# Database Connectors Guide

## Overview

The Dashboard VibeCoder now includes a comprehensive database connector system that allows you to configure connections to **PostgreSQL, MySQL, and MongoDB** databases. While the browser environment doesn't support direct database connections, this system generates production-ready connection code and setup instructions that developers can immediately integrate into their backend applications.

## Features

### 🗄️ Supported Databases

Three major database types with full configuration support:

- **PostgreSQL** 🐘 - Advanced SQL database with extensive features
- **MySQL** 🐬 - Popular open-source relational database
- **MongoDB** 🍃 - Leading NoSQL document database

### 🛠️ Visual Configuration

Create database connections without writing code:

- Connection details (host, port, database name)
- Authentication (username/password)
- SSL/TLS encryption toggle
- Connection pooling configuration
- Custom options per database type
- Connection string support (MongoDB)

### 📝 Sample Query Library

Each database type includes pre-built sample queries:

- **PostgreSQL**: User queries, joins, interval-based filtering
- **MySQL**: Product queries, category filtering, date aggregations
- **MongoDB**: Document queries, field matching, aggregation pipelines

### 🧪 Query Testing

Test queries with simulated data:

- Execute queries with sample results
- View result sets in JSON format
- Parameter visualization
- Execution simulation

### 💻 Code Generation

Production-ready connection code for Node.js:

- Uses popular, well-maintained drivers (pg, mysql2, mongodb)
- Includes connection pooling setup
- Error handling patterns
- Graceful shutdown handlers
- Security best practices

### 📚 Comprehensive Documentation

Complete setup instructions including:

- Installation commands
- Configuration examples
- Common operations
- Security best practices
- Troubleshooting guides

## Usage Guide

### Creating a Database Connector

1. **Select Database Type**
   - Navigate to the "Database Connectors" card in the sidebar
   - Click one of the three database types (PostgreSQL, MySQL, or MongoDB)
   - The configuration form will open automatically

2. **Configure Connection Details**
   ```
   Connection Name: My Production Database
   Host: db.example.com
   Port: 5432 (PostgreSQL), 3306 (MySQL), or 27017 (MongoDB)
   Database Name: myapp_production
   Username: myapp_user
   Password: ••••••••
   Enable SSL: ✓ (recommended for production)
   ```

3. **Save Connector**
   - Click "Save Connector"
   - Connector appears in the saved list
   - Configuration persists across sessions

### Testing Queries

1. **Navigate to Queries Tab**
   - Select a saved connector
   - Click the "Queries" tab
   - Browse pre-built sample queries

2. **Execute Test Query**
   - Click "Test" on any sample query
   - View simulated results
   - See row count and execution time
   - Results display in JSON format

3. **Understanding Parameters**
   - Queries with parameters show badges
   - Parameter types: string, number, boolean, date
   - Required parameters are marked

### Getting Connection Code

1. **Navigate to Code Tab**
   - Select a saved connector
   - Click the "Code" tab
   - Choose between "Connection Code" and "Setup Guide"

2. **Copy Connection Code**
   - Click "Copy" button
   - Paste into your Node.js backend
   - Install required dependencies
   - Configure with your actual credentials

3. **Read Setup Instructions**
   - Comprehensive guide for each database
   - Installation commands
   - Common operations
   - Security best practices
   - Troubleshooting tips

## Database-Specific Details

### PostgreSQL

**Driver**: `pg` (node-postgres)

**Connection Pool Options**:
```javascript
{
  max: 20,                      // Maximum clients in pool
  idleTimeoutMillis: 30000,     // Close idle clients after 30s
  connectionTimeoutMillis: 2000 // Fail fast on connection issues
}
```

**Sample Queries**:
- Get All Users: Basic SELECT with ORDER BY and LIMIT
- User by ID: Parameterized query with $1 placeholder
- Recent Orders: JOIN with interval-based date filtering

**Best For**:
- Complex queries with joins
- Advanced SQL features (CTEs, window functions)
- ACID compliance requirements
- Large-scale applications

### MySQL

**Driver**: `mysql2` (with Promise support)

**Connection Pool Options**:
```javascript
{
  connectionLimit: 10,      // Maximum connections
  waitForConnections: true, // Queue requests when pool is full
  queueLimit: 0            // No limit on queue size
}
```

**Sample Queries**:
- Get All Products: Basic inventory query
- Product by Category: Parameterized with ? placeholder
- Sales Summary: Date formatting and aggregation

**Best For**:
- Web applications
- Read-heavy workloads
- Shared hosting environments
- WordPress, Drupal, etc.

### MongoDB

**Driver**: `mongodb` (official Node.js driver)

**Connection Options**:
```javascript
{
  maxPoolSize: 10,                 // Maximum connections
  minPoolSize: 2,                  // Minimum connections
  serverSelectionTimeoutMS: 5000  // Timeout for finding server
}
```

**Sample Queries**:
- Find All Documents: Basic collection query
- Find by Field: Field-based filtering
- Aggregate Pipeline: Complex aggregations

**Best For**:
- Document-based data models
- Flexible schemas
- Rapid prototyping
- Real-time analytics

## Integration Examples

### Backend API Endpoint (Express.js)

```javascript
// Using PostgreSQL connector
import express from 'express'
import { Pool } from 'pg'

const app = express()
const pool = new Pool({
  host: 'your-host',
  port: 5432,
  database: 'your-database',
  user: 'your-username',
  password: 'your-password',
  ssl: { rejectUnauthorized: false }
})

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users LIMIT 100')
    res.json(result.rows)
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

app.listen(3000)
```

### Dashboard Integration

```javascript
// Frontend dashboard fetching from your API
async function fetchDashboardData() {
  const response = await fetch('/api/users')
  const data = await response.json()
  return data
}

// Use with data connector or custom fetch
const connector = {
  id: 'backend-users',
  name: 'Backend Users API',
  url: '/api/users',
  method: 'GET'
}
```

## Security Best Practices

### 1. Credentials Management

❌ **Don't**: Hardcode credentials in code
```javascript
const pool = new Pool({
  password: 'mysecretpassword123' // Never do this!
})
```

✅ **Do**: Use environment variables
```javascript
const pool = new Pool({
  password: process.env.DB_PASSWORD
})
```

### 2. SSL/TLS Encryption

Always enable SSL in production:
```javascript
ssl: {
  rejectUnauthorized: true, // Verify server certificate
  ca: fs.readFileSync('/path/to/ca-cert.pem')
}
```

### 3. Connection Pooling

Reuse connections for better performance and resource management:
```javascript
// Good: Use connection pools
const pool = new Pool(config)
const result = await pool.query('SELECT * FROM users')

// Bad: Create new connections each time
const client = new Client(config)
await client.connect()
const result = await client.query('SELECT * FROM users')
await client.end()
```

### 4. SQL Injection Prevention

Always use parameterized queries:

**PostgreSQL**:
```javascript
// ✅ Safe
await pool.query('SELECT * FROM users WHERE id = $1', [userId])

// ❌ Dangerous
await pool.query(`SELECT * FROM users WHERE id = ${userId}`)
```

**MySQL**:
```javascript
// ✅ Safe
await pool.execute('SELECT * FROM users WHERE id = ?', [userId])

// ❌ Dangerous
await pool.execute(`SELECT * FROM users WHERE id = ${userId}`)
```

**MongoDB**:
```javascript
// ✅ Safe (automatic)
await collection.findOne({ _id: userId })

// ⚠️ Be careful with $where operator
```

### 5. Least Privilege Principle

Create database users with minimal required permissions:

```sql
-- PostgreSQL
CREATE USER dashboard_reader WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE mydb TO dashboard_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dashboard_reader;

-- MySQL
CREATE USER 'dashboard_reader'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT ON mydb.* TO 'dashboard_reader'@'%';
FLUSH PRIVILEGES;
```

## Troubleshooting

### Connection Refused

**Problem**: Cannot connect to database server

**Solutions**:
- Verify database server is running
- Check firewall rules allow the port
- Ensure host/port are correct
- Verify network connectivity

### Authentication Failed

**Problem**: Invalid credentials or permission denied

**Solutions**:
- Double-check username and password
- Verify user has connection privileges
- Check IP whitelist/firewall rules
- Review pg_hba.conf (PostgreSQL)

### SSL/TLS Errors

**Problem**: SSL connection fails

**Solutions**:
- Verify server supports SSL
- Check certificate validity
- Use `rejectUnauthorized: false` for self-signed certs (dev only)
- Ensure CA certificate is correct

### Connection Pool Exhausted

**Problem**: All connections in pool are busy

**Solutions**:
- Increase max connections in pool
- Review query performance (slow queries)
- Check for connection leaks (not releasing)
- Implement connection timeout

### Query Performance Issues

**Problem**: Queries are slow

**Solutions**:
- Add database indexes
- Analyze query execution plans
- Optimize JOIN operations
- Use connection pooling
- Implement query caching
- Consider read replicas

## Advanced Configuration

### PostgreSQL Advanced Options

```javascript
{
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  
  // Advanced options
  statement_timeout: 30000,        // Query timeout
  query_timeout: 30000,            // Alternative query timeout
  application_name: 'dashboard',   // Identify in pg_stat_activity
  keepAlive: true,                 // TCP keepalive
  keepAliveInitialDelayMillis: 10000
}
```

### MySQL Advanced Options

```javascript
{
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  
  // Advanced options
  connectTimeout: 10000,           // Connection timeout
  acquireTimeout: 10000,           // Acquire from pool timeout
  timeout: 60000,                  // Session timeout
  enableKeepAlive: true,           // TCP keepalive
  keepAliveInitialDelay: 0
}
```

### MongoDB Advanced Options

```javascript
{
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  
  // Advanced options
  socketTimeoutMS: 45000,          // Socket timeout
  family: 4,                       // IPv4 (use 6 for IPv6)
  compressors: ['snappy', 'zlib'], // Compression
  retryWrites: true,               // Retry failed writes
  retryReads: true,                // Retry failed reads
  readPreference: 'secondaryPreferred'
}
```

## Monitoring & Observability

### PostgreSQL Monitoring

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long-running queries
SELECT pid, now() - query_start as duration, query 
FROM pg_stat_activity 
WHERE state = 'active' 
ORDER BY duration DESC;

-- Database size
SELECT pg_size_pretty(pg_database_size('mydb'));
```

### MySQL Monitoring

```sql
-- Active connections
SHOW PROCESSLIST;

-- Connection statistics
SHOW STATUS LIKE 'Threads%';

-- Slow queries
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;

-- Database size
SELECT table_schema, 
       SUM(data_length + index_length) / 1024 / 1024 AS size_mb
FROM information_schema.tables 
GROUP BY table_schema;
```

### MongoDB Monitoring

```javascript
// Server status
const status = await db.admin().serverStatus()

// Current operations
const ops = await db.admin().currentOp()

// Connection pool stats
const poolStats = await db.admin().serverStatus().then(s => s.connections)

// Database stats
const stats = await db.stats()
```

## Migration Patterns

### From REST API to Database

If you're currently using API connectors and want to migrate to direct database access:

1. **Setup Backend Server**
   - Create Express.js or similar server
   - Install database driver
   - Configure connection pool

2. **Create API Endpoints**
   - Map existing API calls to database queries
   - Implement authentication/authorization
   - Add error handling

3. **Update Dashboard**
   - Keep existing data connector configuration
   - Update URL to point to new backend
   - Test thoroughly

### From Mock Data to Production

1. **Configure Production Connector**
   - Create new connector with production credentials
   - Test with sample queries
   - Verify SSL is enabled

2. **Implement Backend**
   - Copy generated connection code
   - Create necessary API endpoints
   - Deploy to production

3. **Update Dashboard**
   - Switch from mock data to API connector
   - Point connector to production endpoints
   - Monitor performance

## Best Practices Checklist

- [ ] Store credentials in environment variables
- [ ] Enable SSL/TLS for production
- [ ] Use connection pooling
- [ ] Implement parameterized queries
- [ ] Set appropriate timeout values
- [ ] Configure graceful shutdown
- [ ] Add error handling and logging
- [ ] Monitor connection pool usage
- [ ] Use least-privilege database users
- [ ] Regular security audits
- [ ] Keep drivers up to date
- [ ] Implement rate limiting
- [ ] Add query logging (development)
- [ ] Use database indexes appropriately
- [ ] Regular backup strategy

## Contributing

To add new database types or improve existing connectors:

1. Add database type to `DatabaseType` in `database-connectors.ts`
2. Create template configuration in `databaseTemplates`
3. Add connection code generation logic
4. Write comprehensive setup instructions
5. Add sample queries
6. Test thoroughly
7. Update documentation

## License

Same as the main project license.
