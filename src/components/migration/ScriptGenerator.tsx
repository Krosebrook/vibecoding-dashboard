import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileCode, Copy, Download, CheckCircle } from '@phosphor-icons/react'
import { MigrationConfig } from '@/lib/types'
import { toast } from 'sonner'

interface ScriptGeneratorProps {
  config: MigrationConfig | null
}

export function ScriptGenerator({ config }: ScriptGeneratorProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('sql')

  const generateSQLScript = () => {
    if (!config) return ''

    return `-- Migration Script
-- Generated: ${new Date().toISOString()}
-- Source: ${config.sourceConnectionId}
-- Destination: ${config.destinationConnectionId}

BEGIN TRANSACTION;

-- Create destination tables if not exists
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    createdDate TIMESTAMP DEFAULT NOW(),
    modifiedDate TIMESTAMP DEFAULT NOW(),
    active BOOLEAN DEFAULT true,
    accountType VARCHAR(50),
    avatarUrl TEXT
);

-- Insert data with field mapping
INSERT INTO users (
    id, firstName, lastName, email, phone, 
    createdDate, modifiedDate, active, accountType, avatarUrl
)
SELECT 
    user_id,
    first_name,
    last_name,
    email_address,
    phone_number,
    created_at,
    updated_at,
    is_active,
    user_type,
    profile_image_url
FROM source_users
ON CONFLICT (email) DO UPDATE SET
    firstName = EXCLUDED.firstName,
    lastName = EXCLUDED.lastName,
    modifiedDate = NOW();

COMMIT;

-- Verification queries
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT email) as unique_emails,
    SUM(CASE WHEN active THEN 1 ELSE 0 END) as active_users
FROM users;`
  }

  const generatePythonScript = () => {
    if (!config) return ''

    return `#!/usr/bin/env python3
"""
Migration Script
Generated: ${new Date().toISOString()}
Source: ${config.sourceConnectionId}
Destination: ${config.destinationConnectionId}
"""

import psycopg2
from psycopg2.extras import execute_batch
from datetime import datetime

def migrate_data():
    # Source connection
    source_conn = psycopg2.connect(
        host="source_host",
        database="source_db",
        user="source_user",
        password="source_password"
    )
    
    # Destination connection
    dest_conn = psycopg2.connect(
        host="dest_host",
        database="dest_db",
        user="dest_user",
        password="dest_password"
    )
    
    try:
        source_cursor = source_conn.cursor()
        dest_cursor = dest_conn.cursor()
        
        # Fetch source data
        source_cursor.execute("""
            SELECT user_id, first_name, last_name, email_address, 
                   phone_number, created_at, updated_at, is_active, 
                   user_type, profile_image_url
            FROM source_users
        """)
        
        # Prepare batch insert
        insert_query = """
            INSERT INTO users (
                id, firstName, lastName, email, phone,
                createdDate, modifiedDate, active, accountType, avatarUrl
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO UPDATE SET
                firstName = EXCLUDED.firstName,
                lastName = EXCLUDED.lastName,
                modifiedDate = NOW()
        """
        
        # Execute batch insert
        batch_size = ${config.options.batchSize}
        records = source_cursor.fetchmany(batch_size)
        
        while records:
            execute_batch(dest_cursor, insert_query, records)
            dest_conn.commit()
            print(f"Migrated {len(records)} records")
            records = source_cursor.fetchmany(batch_size)
        
        # Verification
        dest_cursor.execute("SELECT COUNT(*) FROM users")
        total = dest_cursor.fetchone()[0]
        print(f"Total records in destination: {total}")
        
    except Exception as e:
        print(f"Error: {e}")
        dest_conn.rollback()
        raise
    finally:
        source_conn.close()
        dest_conn.close()

if __name__ == "__main__":
    migrate_data()`
  }

  const generateNodeScript = () => {
    if (!config) return ''

    return `// Migration Script
// Generated: ${new Date().toISOString()}
// Source: ${config.sourceConnectionId}
// Destination: ${config.destinationConnectionId}

const { Client } = require('pg');

async function migrateData() {
  const sourceClient = new Client({
    host: 'source_host',
    database: 'source_db',
    user: 'source_user',
    password: 'source_password',
  });

  const destClient = new Client({
    host: 'dest_host',
    database: 'dest_db',
    user: 'dest_user',
    password: 'dest_password',
  });

  try {
    await sourceClient.connect();
    await destClient.connect();

    console.log('Connected to databases');

    // Create table if not exists
    await destClient.query(\`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        "firstName" VARCHAR(100),
        "lastName" VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        "createdDate" TIMESTAMP DEFAULT NOW(),
        "modifiedDate" TIMESTAMP DEFAULT NOW(),
        active BOOLEAN DEFAULT true,
        "accountType" VARCHAR(50),
        "avatarUrl" TEXT
      )
    \`);

    // Fetch source data
    const result = await sourceClient.query(\`
      SELECT user_id, first_name, last_name, email_address,
             phone_number, created_at, updated_at, is_active,
             user_type, profile_image_url
      FROM source_users
    \`);

    console.log(\`Fetched \${result.rows.length} records from source\`);

    // Batch insert
    const batchSize = ${config.options.batchSize};
    for (let i = 0; i < result.rows.length; i += batchSize) {
      const batch = result.rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        await destClient.query(\`
          INSERT INTO users (
            id, "firstName", "lastName", email, phone,
            "createdDate", "modifiedDate", active, "accountType", "avatarUrl"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (email) DO UPDATE SET
            "firstName" = EXCLUDED."firstName",
            "lastName" = EXCLUDED."lastName",
            "modifiedDate" = NOW()
        \`, [
          row.user_id,
          row.first_name,
          row.last_name,
          row.email_address,
          row.phone_number,
          row.created_at,
          row.updated_at,
          row.is_active,
          row.user_type,
          row.profile_image_url
        ]);
      }
      
      console.log(\`Migrated batch \${i / batchSize + 1}\`);
    }

    // Verification
    const verification = await destClient.query(\`
      SELECT COUNT(*) as total,
             COUNT(DISTINCT email) as unique_emails,
             SUM(CASE WHEN active THEN 1 ELSE 0 END) as active_users
      FROM users
    \`);

    console.log('Migration complete:', verification.rows[0]);

  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await sourceClient.end();
    await destClient.end();
  }
}

migrateData().catch(console.error);`
  }

  const scripts = {
    sql: {
      name: 'SQL Script',
      language: 'sql',
      content: generateSQLScript(),
      extension: 'sql',
    },
    python: {
      name: 'Python Script',
      language: 'python',
      content: generatePythonScript(),
      extension: 'py',
    },
    node: {
      name: 'Node.js Script',
      language: 'javascript',
      content: generateNodeScript(),
      extension: 'js',
    },
  }

  const handleCopy = async (scriptType: string) => {
    const script = scripts[scriptType as keyof typeof scripts]
    await navigator.clipboard.writeText(script.content)
    setCopied(scriptType)
    toast.success('Script copied to clipboard')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDownload = (scriptType: string) => {
    const script = scripts[scriptType as keyof typeof scripts]
    const blob = new Blob([script.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `migration-script.${script.extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Script downloaded')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-info/20 to-primary/20 flex items-center justify-center">
                  <FileCode size={20} weight="duotone" className="text-info" />
                </div>
                <CardTitle>Script Generator</CardTitle>
              </div>
              <CardDescription>
                Generate executable migration scripts in multiple languages
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!config ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCode size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
              <p>Configure a migration to generate scripts</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-semibold mb-1">{config.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {config.mappings.length} field mappings • Batch size: {config.options.batchSize}
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/20 text-success border-success/40">
                  Ready to Generate
                </Badge>
              </div>

              <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sql">SQL</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="node">Node.js</TabsTrigger>
                </TabsList>

                {Object.entries(scripts).map(([key, script]) => (
                  <TabsContent key={key} value={key} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{script.name}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {script.content.split('\n').length} lines
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(key)}
                          className="gap-2"
                        >
                          {copied === key ? (
                            <>
                              <CheckCircle size={16} weight="fill" className="text-success" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(key)}
                          className="gap-2"
                        >
                          <Download size={16} />
                          Download
                        </Button>
                      </div>
                    </div>

                    <Card className="bg-card border-2">
                      <ScrollArea className="h-[500px]">
                        <pre className="p-4 text-xs font-mono leading-relaxed">
                          <code>{script.content}</code>
                        </pre>
                      </ScrollArea>
                    </Card>

                    <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <FileCode size={16} className="text-info" />
                        Usage Instructions
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        {key === 'sql' && (
                          <>
                            <li>Connect to your destination database using psql or your SQL client</li>
                            <li>Update connection strings and table names as needed</li>
                            <li>Run the script: <code className="px-1 py-0.5 bg-muted rounded">psql -U username -d database -f migration-script.sql</code></li>
                          </>
                        )}
                        {key === 'python' && (
                          <>
                            <li>Install required packages: <code className="px-1 py-0.5 bg-muted rounded">pip install psycopg2-binary</code></li>
                            <li>Update connection parameters in the script</li>
                            <li>Run the script: <code className="px-1 py-0.5 bg-muted rounded">python migration-script.py</code></li>
                          </>
                        )}
                        {key === 'node' && (
                          <>
                            <li>Install required packages: <code className="px-1 py-0.5 bg-muted rounded">npm install pg</code></li>
                            <li>Update connection parameters in the script</li>
                            <li>Run the script: <code className="px-1 py-0.5 bg-muted rounded">node migration-script.js</code></li>
                          </>
                        )}
                      </ul>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
