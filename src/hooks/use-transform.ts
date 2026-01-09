import { useKV } from '@github/spark/hooks'
import { PayloadTransform } from '@/components/WebhookTransformWizard'

export function useTransform() {
  const [transforms] = useKV<PayloadTransform[]>('webhook-transforms', [])

  const getTransform = (webhookId: string): PayloadTransform | undefined => {
    return transforms?.find(t => t.webhookId === webhookId)
  }

  const applyTransform = (webhookId: string, payload: any): any => {
    const transform = getTransform(webhookId)
    if (!transform || !transform.mappings || transform.mappings.length === 0) {
      return payload
    }

    const result: any = {}

    transform.mappings.forEach(mapping => {
      try {
        const getValueByPath = (obj: any, path: string): any => {
          return path.split('.').reduce((acc, part) => acc?.[part], obj)
        }

        let value = getValueByPath(payload, mapping.sourcePath)

        if (mapping.condition) {
          const conditionValue = getValueByPath(payload, mapping.condition.field)
          let conditionMet = false

          switch (mapping.condition.operator) {
            case 'equals':
              conditionMet = conditionValue === mapping.condition.value
              break
            case 'not_equals':
              conditionMet = conditionValue !== mapping.condition.value
              break
            case 'contains':
              conditionMet = String(conditionValue).includes(mapping.condition.value)
              break
            case 'greater':
              conditionMet = Number(conditionValue) > Number(mapping.condition.value)
              break
            case 'less':
              conditionMet = Number(conditionValue) < Number(mapping.condition.value)
              break
            case 'exists':
              conditionMet = conditionValue !== undefined && conditionValue !== null
              break
          }

          if (!conditionMet) {
            value = mapping.defaultValue
          }
        }

        if (value === undefined || value === null) {
          value = mapping.defaultValue
        }

        if (mapping.transformType === 'function' && mapping.transformFunction) {
          try {
            const fn = new Function('value', 'payload', mapping.transformFunction)
            value = fn(value, payload)
          } catch (error) {
            console.error('Transform function error:', error)
            value = mapping.defaultValue
          }
        }

        if (mapping.transformType === 'computed' && mapping.transformFunction) {
          try {
            const fn = new Function('payload', mapping.transformFunction)
            value = fn(payload)
          } catch (error) {
            console.error('Computed function error:', error)
            value = mapping.defaultValue
          }
        }

        const targetParts = mapping.targetField.split('.')
        if (targetParts.length === 1) {
          result[mapping.targetField] = value
        } else {
          let current = result
          for (let i = 0; i < targetParts.length - 1; i++) {
            if (!current[targetParts[i]]) {
              current[targetParts[i]] = {}
            }
            current = current[targetParts[i]]
          }
          current[targetParts[targetParts.length - 1]] = value
        }
      } catch (error) {
        console.error('Mapping error:', error)
      }
    })

    return result
  }

  return {
    transforms: transforms || [],
    getTransform,
    applyTransform
  }
}
