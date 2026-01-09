import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Copy, Lightbulb } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TransformPattern {
  name: string
  category: string
  description: string
  code: string
  example: {
    input: string
    output: string
  }
}

const patterns: TransformPattern[] = [
  {
    name: 'To Uppercase',
    category: 'String',
    description: 'Convert text to uppercase',
    code: 'return value.toUpperCase()',
    example: {
      input: '"hello world"',
      output: '"HELLO WORLD"'
    }
  },
  {
    name: 'Extract Domain',
    category: 'String',
    description: 'Get domain from email',
    code: 'return value.split(\'@\')[1]',
    example: {
      input: '"user@example.com"',
      output: '"example.com"'
    }
  },
  {
    name: 'First Name',
    category: 'String',
    description: 'Extract first name from full name',
    code: 'return value.split(\' \')[0]',
    example: {
      input: '"John Doe"',
      output: '"John"'
    }
  },
  {
    name: 'Truncate Text',
    category: 'String',
    description: 'Limit text length with ellipsis',
    code: 'return value.length > 50 ? value.slice(0, 50) + \'...\' : value',
    example: {
      input: '"Very long text..."',
      output: '"Very long text... (truncated)"'
    }
  },
  {
    name: 'Slug Generation',
    category: 'String',
    description: 'Create URL-friendly slug',
    code: 'return value.toLowerCase().replace(/\\s+/g, \'-\')',
    example: {
      input: '"Hello World"',
      output: '"hello-world"'
    }
  },
  {
    name: 'Format Date',
    category: 'Date',
    description: 'Convert to readable date',
    code: 'return new Date(value).toLocaleDateString()',
    example: {
      input: '"2024-01-15"',
      output: '"1/15/2024"'
    }
  },
  {
    name: 'Unix to ISO',
    category: 'Date',
    description: 'Unix timestamp to ISO string',
    code: 'return new Date(value * 1000).toISOString()',
    example: {
      input: '1705334400',
      output: '"2024-01-15T12:00:00.000Z"'
    }
  },
  {
    name: 'Relative Time',
    category: 'Date',
    description: 'Show time elapsed',
    code: 'const hours = Math.floor((Date.now() - new Date(value)) / 36e5); return `${hours}h ago`',
    example: {
      input: '"2024-01-15T10:00:00Z"',
      output: '"2h ago"'
    }
  },
  {
    name: 'Parse Number',
    category: 'Number',
    description: 'Convert to number',
    code: 'return parseFloat(value)',
    example: {
      input: '"42.5"',
      output: '42.5'
    }
  },
  {
    name: 'To Percentage',
    category: 'Number',
    description: 'Convert decimal to percentage',
    code: 'return (value * 100).toFixed(1) + \'%\'',
    example: {
      input: '0.753',
      output: '"75.3%"'
    }
  },
  {
    name: 'Currency Format',
    category: 'Number',
    description: 'Format as USD currency',
    code: 'return \'$\' + value.toFixed(2)',
    example: {
      input: '1234.5',
      output: '"$1234.50"'
    }
  },
  {
    name: 'Thousands Separator',
    category: 'Number',
    description: 'Add comma separators',
    code: 'return value.toLocaleString()',
    example: {
      input: '1234567',
      output: '"1,234,567"'
    }
  },
  {
    name: 'Round Number',
    category: 'Number',
    description: 'Round to nearest integer',
    code: 'return Math.round(value)',
    example: {
      input: '42.7',
      output: '43'
    }
  },
  {
    name: 'Array Length',
    category: 'Array',
    description: 'Count array items',
    code: 'return value.length',
    example: {
      input: '[1, 2, 3]',
      output: '3'
    }
  },
  {
    name: 'First Item',
    category: 'Array',
    description: 'Get first element',
    code: 'return value[0]',
    example: {
      input: '[1, 2, 3]',
      output: '1'
    }
  },
  {
    name: 'Last Item',
    category: 'Array',
    description: 'Get last element',
    code: 'return value[value.length - 1]',
    example: {
      input: '[1, 2, 3]',
      output: '3'
    }
  },
  {
    name: 'Join Array',
    category: 'Array',
    description: 'Combine with separator',
    code: 'return value.join(\', \')',
    example: {
      input: '["a", "b", "c"]',
      output: '"a, b, c"'
    }
  },
  {
    name: 'Extract Property',
    category: 'Array',
    description: 'Map to property values',
    code: 'return value.map(item => item.name)',
    example: {
      input: '[{name: "A"}, {name: "B"}]',
      output: '["A", "B"]'
    }
  },
  {
    name: 'Filter Count',
    category: 'Array',
    description: 'Count filtered items',
    code: 'return value.filter(item => item.active).length',
    example: {
      input: '[{active:true}, {active:false}]',
      output: '1'
    }
  },
  {
    name: 'Sum Values',
    category: 'Array',
    description: 'Calculate total',
    code: 'return value.reduce((sum, item) => sum + item.price, 0)',
    example: {
      input: '[{price: 10}, {price: 20}]',
      output: '30'
    }
  },
  {
    name: 'Full Name',
    category: 'Computed',
    description: 'Combine first and last name',
    code: 'return payload.firstName + \' \' + payload.lastName',
    example: {
      input: '{firstName: "John", lastName: "Doe"}',
      output: '"John Doe"'
    }
  },
  {
    name: 'Address String',
    category: 'Computed',
    description: 'Format complete address',
    code: 'return `${payload.street}, ${payload.city}, ${payload.state} ${payload.zip}`',
    example: {
      input: '{street: "123 Main", city: "NYC", state: "NY", zip: "10001"}',
      output: '"123 Main, NYC, NY 10001"'
    }
  },
  {
    name: 'Has Property',
    category: 'Boolean',
    description: 'Check if property exists',
    code: 'return value !== undefined && value !== null',
    example: {
      input: 'null',
      output: 'false'
    }
  },
  {
    name: 'Is Empty',
    category: 'Boolean',
    description: 'Check if value is empty',
    code: 'return !value || value.length === 0',
    example: {
      input: '[]',
      output: 'true'
    }
  }
]

export function TransformPatternLibrary() {
  const categories = Array.from(new Set(patterns.map(p => p.category)))

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb size={20} weight="duotone" className="text-accent" />
          Transform Pattern Library
        </CardTitle>
        <CardDescription>
          Ready-to-use transformation functions for common scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category}>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  {category}
                  <Badge variant="outline" className="text-xs">
                    {patterns.filter(p => p.category === category).length}
                  </Badge>
                </h3>
                <div className="grid gap-3">
                  {patterns.filter(p => p.category === category).map((pattern, idx) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg hover:border-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{pattern.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {pattern.description}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(pattern.code)}
                          className="flex-shrink-0"
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                          {pattern.code}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground mb-1">Input:</div>
                            <code className="text-primary">{pattern.example.input}</code>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Output:</div>
                            <code className="text-accent">{pattern.example.output}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
