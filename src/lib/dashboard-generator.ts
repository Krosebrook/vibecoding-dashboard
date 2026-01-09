import { DashboardConfig, GenerationProgress, DashboardTemplate } from './types'

export async function generateDashboard(
  prompt: string,
  template?: DashboardTemplate,
  onProgress?: (progress: GenerationProgress) => void
): Promise<DashboardConfig> {
  const stages: GenerationProgress[] = [
    { stage: 'analyzing', progress: 20, message: 'Analyzing requirements...' },
    { stage: 'modeling', progress: 40, message: 'Creating data model...' },
    { stage: 'designing', progress: 60, message: 'Designing components...' },
    { stage: 'generating', progress: 80, message: 'Generating dashboard...' },
    { stage: 'complete', progress: 100, message: 'Dashboard ready!' },
  ]

  for (const stage of stages) {
    onProgress?.(stage)
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  const systemPrompt = `You are an expert dashboard designer. Generate a complete dashboard configuration based on the user's description.

${template ? `Use this template as a starting point: ${JSON.stringify(template.config)}` : ''}

Analyze the prompt and create:
1. Dashboard name and description
2. Appropriate component types (metric-card, line-chart, bar-chart, pie-chart, area-chart, data-table, stat-grid, progress-bar, activity-feed, user-list, calendar, kanban-board, form, text-block)
3. Layout configuration (grid-based with row/col positions)
4. Data model with entities and realistic seed data
5. Setup instructions

Return a JSON object with this exact structure:
{
  "name": "Dashboard Name",
  "description": "Brief description",
  "type": "analytics|crm|project|monitoring|social|ecommerce|custom",
  "components": [
    {
      "id": "unique-id",
      "type": "component-type",
      "title": "Component Title",
      "description": "Brief description",
      "position": {"row": 0, "col": 0},
      "size": {"rows": 1, "cols": 1},
      "props": {}
    }
  ],
  "layout": {
    "type": "grid",
    "columns": 12,
    "gap": 24,
    "padding": 24
  },
  "dataModel": {
    "entities": [
      {
        "name": "EntityName",
        "fields": [
          {"name": "fieldName", "type": "string|number|boolean|date|array|object", "required": true}
        ]
      }
    ],
    "seedData": {
      "entityName": [
        {"id": "1", "field": "value"}
      ]
    }
  },
  "setupInstructions": "Detailed markdown setup instructions"
}

User prompt: ${prompt}`

  const aiPrompt = spark.llmPrompt`${systemPrompt}`
  const response = await spark.llm(aiPrompt, 'gpt-4o', true)
  
  const config = JSON.parse(response)
  
  return {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...config,
    theme: {
      primaryColor: 'oklch(0.45 0.19 250)',
      accentColor: 'oklch(0.75 0.15 195)',
      backgroundColor: 'oklch(0.15 0.01 260)',
      textColor: 'oklch(0.85 0.01 260)',
      borderRadius: 12,
    },
  }
}

export async function refineDashboard(
  currentConfig: DashboardConfig,
  refinementPrompt: string,
  onProgress?: (progress: GenerationProgress) => void
): Promise<DashboardConfig> {
  onProgress?.({ stage: 'analyzing', progress: 50, message: 'Refining dashboard...' })
  await new Promise(resolve => setTimeout(resolve, 300))

  const systemPrompt = `You are refining an existing dashboard configuration. 

Current configuration: ${JSON.stringify(currentConfig)}

User's refinement request: ${refinementPrompt}

Analyze the request and update the configuration accordingly. Return the complete updated configuration in the same JSON format.`

  const aiPrompt = spark.llmPrompt`${systemPrompt}`
  const response = await spark.llm(aiPrompt, 'gpt-4o', true)
  
  onProgress?.({ stage: 'complete', progress: 100, message: 'Refinement complete!' })
  
  const config = JSON.parse(response)
  
  return {
    ...currentConfig,
    ...config,
  }
}

export function generateSetupInstructions(config: DashboardConfig): string {
  return `# ${config.name} - Setup Instructions

## Overview
${config.description}

**Dashboard Type**: ${config.type}  
**Created**: ${new Date(config.createdAt).toLocaleString()}  
**Components**: ${config.components.length}

## Quick Start

### 1. Data Model
This dashboard uses the following data entities:

${config.dataModel.entities.map(entity => `
#### ${entity.name}
\`\`\`typescript
interface ${entity.name} {
${entity.fields.map(field => `  ${field.name}${field.required ? '' : '?'}: ${field.type}`).join('\n')}
}
\`\`\`
`).join('\n')}

### 2. Seed Data
Sample data is provided for testing. In production, replace with your API endpoints:

${Object.keys(config.dataModel.seedData).map(key => `
**${key}**: ${config.dataModel.seedData[key].length} records
`).join('\n')}

### 3. Components
This dashboard includes ${config.components.length} components:

${config.components.map((comp, idx) => `
${idx + 1}. **${comp.title || comp.type}** (${comp.type})
   - Position: Row ${comp.position.row}, Col ${comp.position.col}
   - Size: ${comp.size.cols} cols × ${comp.size.rows} rows
   ${comp.description ? `- ${comp.description}` : ''}
`).join('\n')}

### 4. Layout Configuration
- **Type**: ${config.layout.type}
- **Columns**: ${config.layout.columns}
- **Gap**: ${config.layout.gap}px
- **Padding**: ${config.layout.padding}px

### 5. Customization

#### Updating Data Sources
Replace seed data with live API calls:
\`\`\`typescript
// Example: Fetch from your API
const data = await fetch('your-api-endpoint').then(r => r.json())
\`\`\`

#### Styling
The dashboard uses these theme variables:
- Primary: \`${config.theme.primaryColor}\`
- Accent: \`${config.theme.accentColor}\`
- Background: \`${config.theme.backgroundColor}\`

#### Adding Components
To add new components, use the refinement feature or manually extend the configuration.

### 6. Deployment
This dashboard is production-ready. To deploy:
1. Ensure all API endpoints are configured
2. Update environment variables
3. Test all interactive features
4. Deploy using your preferred hosting platform

## Support
For issues or enhancements, use the refinement feature to describe changes in natural language.

---
*Generated by Dashboard VibeCoder*
`
}
