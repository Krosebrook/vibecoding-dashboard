import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkle, MagicWand, ArrowRight } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function AITransformQuickStart() {
  const [isExpanded, setIsExpanded] = useState(false)

  const examples = [
    {
      title: 'E-commerce Order Transform',
      description: 'Extract order ID, customer email, total amount, and map line items with calculated subtotals',
      icon: '🛒'
    },
    {
      title: 'User Registration Transform',
      description: 'Map user profile data, convert timestamps to ISO format, and extract nested address fields',
      icon: '👤'
    },
    {
      title: 'Payment Event Transform',
      description: 'Extract transaction ID, amount, currency, and calculate fees. Include only successful payments.',
      icon: '💳'
    },
    {
      title: 'API Event Transform',
      description: 'Parse event type, extract metadata, compute response time from start/end timestamps',
      icon: '⚡'
    }
  ]

  return (
    <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle size={20} weight="fill" className="text-accent" />
          AI Transform Quick Start
        </CardTitle>
        <CardDescription>
          Generate webhook transformations from natural language descriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isExpanded ? (
          <>
            <div className="text-center space-y-3 py-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto">
                <MagicWand size={32} weight="duotone" className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Transform Your Webhook Data with AI</h3>
                <p className="text-sm text-muted-foreground">
                  Describe what you want to extract and transform in plain English, and let AI create the complete mapping configuration for you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {examples.map((example, idx) => (
                <button
                  key={idx}
                  className="p-3 rounded-lg border-2 border-border hover:border-accent/50 transition-all text-left hover:bg-accent/5"
                >
                  <div className="text-2xl mb-1">{example.icon}</div>
                  <div className="text-xs font-semibold mb-1">{example.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {example.description}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-start gap-2 text-xs">
                <ArrowRight size={14} className="text-accent mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Describe your transformation:</strong> "Extract user email and name, calculate age from birthdate, format signup date"
                </p>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <ArrowRight size={14} className="text-accent mt-0.5 flex-shrink-0" />
                <p>
                  <strong>AI generates the mapping:</strong> Field paths, type conversions, computations, and conditions
                </p>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <ArrowRight size={14} className="text-accent mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Review and deploy:</strong> Test with sample data, refine if needed, and apply to your webhooks
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsExpanded(true)}
              className="w-full bg-gradient-to-r from-accent to-primary"
            >
              <Sparkle size={16} className="mr-2" weight="fill" />
              Try AI Transform Generator
            </Button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="text-sm">
              To use the AI Transform Generator:
            </div>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Create or select a webhook connector</li>
              <li>Open the Transform Manager</li>
              <li>Click "New Transform"</li>
              <li>Use the "AI Generate" tab</li>
              <li>Describe your transformation in natural language</li>
            </ol>
            <Button
              onClick={() => setIsExpanded(false)}
              variant="outline"
              className="w-full"
            >
              Got it!
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
