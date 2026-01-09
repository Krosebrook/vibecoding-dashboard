import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkle, MagicWand, ArrowRight, CheckCircle, Copy } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function AITransformQuickStart() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedExample, setSelectedExample] = useState<number | null>(null)

  const examples = [
    {
      title: 'E-commerce Order',
      description: 'Extract order ID, customer email, total amount, and map line items with calculated subtotals',
      fullDescription: 'Extract order ID, customer email, and total amount from the payload. Map the line items array with product name, quantity, and price. Calculate subtotal for each item by multiplying quantity times price.',
      icon: '🛒',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'User Registration',
      description: 'Map user profile data, convert timestamps to ISO format, and extract nested address fields',
      fullDescription: 'Extract user email, username, and full name. Convert the signup timestamp to ISO 8601 format. Extract nested address fields including street, city, state, and zip code from user.address.',
      icon: '👤',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Payment Event',
      description: 'Extract transaction ID, amount, currency, and calculate fees. Include only successful payments.',
      fullDescription: 'Extract transaction ID, amount in cents, currency code, and customer email. Convert amount from cents to dollars by dividing by 100. Only include transactions where status equals succeeded.',
      icon: '💳',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'GitHub Webhook',
      description: 'Parse repository name, event type, author, and extract commit messages',
      fullDescription: 'Extract repository name, event type, and author username from the webhook. Get the commit message from the first commit in the commits array. Convert the timestamp to ISO date format.',
      icon: '⚡',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const handleCopyExample = (description: string, index: number) => {
    navigator.clipboard.writeText(description)
    setSelectedExample(index)
    toast.success('Example copied to clipboard!')
    setTimeout(() => setSelectedExample(null), 2000)
  }

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
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center space-y-3 py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto">
                  <MagicWand size={32} weight="duotone" className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Transform Webhook Data with AI</h3>
                  <p className="text-sm text-muted-foreground">
                    Describe what you want to extract and transform in plain English, and let AI create the complete mapping configuration for you.
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Copy an example to get started:</div>
                {examples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopyExample(example.fullDescription, idx)}
                    className="w-full p-3 rounded-lg border-2 border-border hover:border-accent/50 transition-all text-left hover:bg-accent/5 group relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${example.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    <div className="relative flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">{example.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-xs font-semibold">{example.title}</div>
                          {selectedExample === idx ? (
                            <Badge variant="outline" className="gap-1 text-xs bg-accent/10 border-accent">
                              <CheckCircle size={12} weight="fill" />
                              Copied!
                            </Badge>
                          ) : (
                            <Copy size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {example.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <ArrowRight size={14} className="text-accent mt-0.5 flex-shrink-0" weight="bold" />
                  <p>
                    <strong>Describe your transformation:</strong> "Extract user email and name, calculate age from birthdate, format signup date"
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <ArrowRight size={14} className="text-accent mt-0.5 flex-shrink-0" weight="bold" />
                  <p>
                    <strong>AI generates the mapping:</strong> Field paths, type conversions, computations, and conditions
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <ArrowRight size={14} className="text-accent mt-0.5 flex-shrink-0" weight="bold" />
                  <p>
                    <strong>Review and deploy:</strong> Test with sample data, refine if needed, and apply to your webhooks
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsExpanded(true)}
                  className="flex-1 bg-gradient-to-r from-accent to-primary"
                >
                  <Sparkle size={16} className="mr-2" weight="fill" />
                  Learn More
                </Button>
                <Button
                  onClick={() => {
                    document.getElementById('ai-transform-description')?.scrollIntoView({ behavior: 'smooth' })
                    toast.success('Scroll to Transform Manager to get started')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <MagicWand size={16} className="mr-2" weight="duotone" />
                  Get Started
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="text-sm font-semibold">How to use AI Transform Generator:</div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Badge className="bg-accent text-accent-foreground">1</Badge>
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1">Create or select a webhook</div>
                    <div className="text-xs text-muted-foreground">Navigate to Webhook Manager and create a webhook connector</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Badge className="bg-accent text-accent-foreground">2</Badge>
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1">Open Transform Manager</div>
                    <div className="text-xs text-muted-foreground">Click "New Transform" and select your webhook</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Badge className="bg-accent text-accent-foreground">3</Badge>
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1">Use the AI Generate tab</div>
                    <div className="text-xs text-muted-foreground">Describe your transformation in natural language</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Badge className="bg-accent text-accent-foreground">4</Badge>
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1">Review and deploy</div>
                    <div className="text-xs text-muted-foreground">Test with sample data, then save to apply automatically</div>
                  </div>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/30 p-3 rounded-lg">
                <div className="text-xs font-semibold mb-2 flex items-center gap-2">
                  <Sparkle size={14} weight="fill" className="text-accent" />
                  Pro Tips
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Be specific about field names and paths</li>
                  <li>Mention type conversions explicitly (e.g., "convert to ISO date")</li>
                  <li>Describe computations clearly (e.g., "sum of quantity * price")</li>
                  <li>Specify conditions when filtering (e.g., "where status equals active")</li>
                </ul>
              </div>

              <Button
                onClick={() => setIsExpanded(false)}
                variant="outline"
                className="w-full"
              >
                Got it!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
