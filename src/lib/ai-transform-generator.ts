import { PayloadTransform, TransformMapping } from '@/components/WebhookTransformWizard'

export interface TransformGenerationRequest {
  description: string
  samplePayload?: any
  webhookId: string
  webhookName?: string
}

export interface TransformGenerationResult {
  transform: PayloadTransform
  explanation: string
  suggestions: string[]
}

export async function generateTransformFromDescription(
  request: TransformGenerationRequest
): Promise<TransformGenerationResult> {
  const { description, samplePayload, webhookId, webhookName } = request

  const samplePayloadStr = samplePayload 
    ? JSON.stringify(samplePayload, null, 2)
    : 'No sample payload provided'

  const systemPrompt = `You are an expert at webhook payload transformation. Generate a complete payload transformation configuration based on the user's natural language description.

User Description: "${description}"

Webhook ID: ${webhookId}
Webhook Name: ${webhookName || 'Unknown'}

Sample Payload Structure:
${samplePayloadStr}

Your task is to create a transformation configuration that:
1. Maps fields from the incoming webhook payload to the target data model
2. Applies appropriate transformations (type conversions, computations, formatting)
3. Handles edge cases with default values and conditions
4. Produces clean, usable data for dashboard components

Generate a JSON object with the following structure:
{
  "transform": {
    "name": "A descriptive name for this transform (string)",
    "description": "A clear description of what this transform does (string)",
    "outputFormat": "flat" or "nested" or "array" (string),
    "mappings": [
      {
        "sourcePath": "path.to.source.field (string)",
        "targetField": "targetFieldName (string)",
        "transformType": "direct" or "function" or "computed" (string)",
        "transformFunction": "JavaScript code if transformType is 'function' or 'computed' (string, optional)",
        "defaultValue": "default value if source is missing (any, optional)",
        "condition": {
          "field": "path.to.condition.field (string)",
          "operator": "equals" or "not_equals" or "contains" or "greater" or "less" or "exists" (string)",
          "value": "comparison value (any)"
        } (optional object)
      }
    ]
  },
  "explanation": "A clear explanation of how this transform works and what it does (string)",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"] (array of 3-5 strings with improvement ideas)
}

Transform Type Guidelines:
- "direct": Simple field-to-field mapping with no transformation
- "function": Transform a single field value (receives 'value' and 'payload' parameters)
- "computed": Compute a new value from multiple fields (receives 'payload' parameter)

Common Transform Patterns:
- Type conversions: String to number, date parsing, boolean conversion
- Formatting: Date formatting, number formatting, string manipulation
- Aggregation: Sum, average, count from arrays
- Extraction: Parse nested data, extract from strings
- Validation: Check existence, validate format, apply defaults

Example Transform Functions:
- Type conversion: "return Number(value)"
- Date formatting: "return new Date(value).toISOString()"
- String manipulation: "return value.toUpperCase()"
- Computation: "return payload.quantity * payload.price"
- Array operations: "return payload.items.reduce((sum, item) => sum + item.value, 0)"

Be intelligent about:
1. Inferring field mappings from the description and sample payload
2. Choosing appropriate transform types
3. Adding sensible default values
4. Suggesting relevant conditions when needed
5. Creating meaningful field names that match dashboard conventions

Return ONLY valid JSON matching the structure above. No markdown, no explanations outside the JSON structure.`

  try {
    const response = await window.spark.llm(systemPrompt, 'gpt-4o', true)
    const result = JSON.parse(response)

    const transform: PayloadTransform = {
      id: `transform-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      webhookId,
      name: result.transform.name,
      description: result.transform.description,
      outputFormat: result.transform.outputFormat || 'flat',
      mappings: result.transform.mappings.map((m: any) => ({
        id: `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sourcePath: m.sourcePath,
        targetField: m.targetField,
        transformType: m.transformType || 'direct',
        transformFunction: m.transformFunction,
        defaultValue: m.defaultValue,
        condition: m.condition
      }))
    }

    return {
      transform,
      explanation: result.explanation,
      suggestions: result.suggestions || []
    }
  } catch (error) {
    console.error('Transform generation error:', error)
    throw new Error('Failed to generate transform. Please try again with a more specific description.')
  }
}

export async function refineTransform(
  existingTransform: PayloadTransform,
  refinementDescription: string,
  samplePayload?: any
): Promise<TransformGenerationResult> {
  const samplePayloadStr = samplePayload 
    ? JSON.stringify(samplePayload, null, 2)
    : 'No sample payload provided'

  const existingTransformStr = JSON.stringify(existingTransform, null, 2)

  const systemPrompt = `You are an expert at webhook payload transformation. Refine an existing transformation configuration based on the user's refinement request.

User Refinement Request: "${refinementDescription}"

Existing Transform Configuration:
${existingTransformStr}

Sample Payload Structure:
${samplePayloadStr}

Your task is to modify the existing transformation to incorporate the user's requested changes while preserving the parts they didn't ask to change.

Generate a JSON object with the following structure:
{
  "transform": {
    "name": "Updated name (string)",
    "description": "Updated description (string)",
    "outputFormat": "flat" or "nested" or "array" (string)",
    "mappings": [
      {
        "sourcePath": "path.to.source.field (string)",
        "targetField": "targetFieldName (string)",
        "transformType": "direct" or "function" or "computed" (string)",
        "transformFunction": "JavaScript code if transformType is 'function' or 'computed' (string, optional)",
        "defaultValue": "default value if source is missing (any, optional)",
        "condition": {
          "field": "path.to.condition.field (string)",
          "operator": "equals" or "not_equals" or "contains" or "greater" or "less" or "exists" (string)",
          "value": "comparison value (any)"
        } (optional object)
      }
    ]
  },
  "explanation": "A clear explanation of what changes were made and why (string)",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"] (array of 3-5 strings with additional improvement ideas)
}

Be intelligent about:
1. Identifying which parts of the transform the user wants to change
2. Preserving existing mappings that aren't affected by the refinement
3. Adding, removing, or modifying mappings as needed
4. Updating the description to reflect the changes
5. Maintaining consistency across the entire transform

Return ONLY valid JSON matching the structure above. No markdown, no explanations outside the JSON structure.`

  try {
    const response = await window.spark.llm(systemPrompt, 'gpt-4o', true)
    const result = JSON.parse(response)

    const transform: PayloadTransform = {
      ...existingTransform,
      name: result.transform.name,
      description: result.transform.description,
      outputFormat: result.transform.outputFormat || 'flat',
      mappings: result.transform.mappings.map((m: any) => ({
        id: m.id || `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sourcePath: m.sourcePath,
        targetField: m.targetField,
        transformType: m.transformType || 'direct',
        transformFunction: m.transformFunction,
        defaultValue: m.defaultValue,
        condition: m.condition
      }))
    }

    return {
      transform,
      explanation: result.explanation,
      suggestions: result.suggestions || []
    }
  } catch (error) {
    console.error('Transform refinement error:', error)
    throw new Error('Failed to refine transform. Please try again.')
  }
}

export async function explainTransform(transform: PayloadTransform): Promise<string> {
  const transformStr = JSON.stringify(transform, null, 2)

  const systemPrompt = `You are an expert at webhook payload transformation. Explain this transformation configuration in clear, simple language that a non-technical user can understand.

Transform Configuration:
${transformStr}

Provide a clear, concise explanation that covers:
1. What data this transform extracts from the webhook
2. What transformations and computations it performs
3. What the final output looks like
4. Any conditional logic or special handling

Keep the explanation under 200 words and use simple, everyday language.`

  try {
    const explanation = await window.spark.llm(systemPrompt, 'gpt-4o-mini', false)
    return explanation
  } catch (error) {
    console.error('Transform explanation error:', error)
    return 'Unable to generate explanation. The transform will map webhook data according to its configured mappings.'
  }
}

export async function suggestMappings(
  samplePayload: any,
  targetSchema?: string[]
): Promise<TransformMapping[]> {
  const samplePayloadStr = JSON.stringify(samplePayload, null, 2)
  const targetSchemaStr = targetSchema?.join(', ') || 'Common dashboard fields'

  const systemPrompt = `You are an expert at data mapping. Analyze this webhook payload and suggest intelligent field mappings.

Webhook Payload:
${samplePayloadStr}

Target Fields (if specified): ${targetSchemaStr}

Suggest the most logical field mappings from the webhook payload to dashboard-friendly field names. Consider:
1. Common naming conventions (camelCase for output)
2. Data types and appropriate transformations
3. Nested data structures that should be flattened or preserved
4. Computed fields that would be useful for dashboards

Generate a JSON object with the following structure:
{
  "mappings": [
    {
      "sourcePath": "path.to.source.field",
      "targetField": "targetFieldName",
      "transformType": "direct" or "function" or "computed",
      "transformFunction": "JavaScript code if needed",
      "defaultValue": "sensible default if needed"
    }
  ]
}

Return ONLY valid JSON. No markdown or additional text.`

  try {
    const response = await window.spark.llm(systemPrompt, 'gpt-4o', true)
    const result = JSON.parse(response)
    return (result.mappings || []).map((m: any) => ({
      id: `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourcePath: m.sourcePath,
      targetField: m.targetField,
      transformType: m.transformType || 'direct',
      transformFunction: m.transformFunction,
      defaultValue: m.defaultValue
    }))
  } catch (error) {
    console.error('Mapping suggestion error:', error)
    return []
  }
}
