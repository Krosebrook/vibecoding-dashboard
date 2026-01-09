import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkle, Check, Warning, Lightbulb } from '@phosphor-icons/react'
import { generateTransformFromDescription, TransformGenerationResult } from '@/lib/ai-transform-generator'
import { PayloadTransform } from '@/components/WebhookTransformWizard'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface AITransformGeneratorProps {
  webhookId: string
  webhookName?: string
  samplePayload?: any
  onTransformGenerated: (transform: PayloadTransform) => void
}

export function AITransformGenerator({
  webhookId,
  webhookName,
  samplePayload,
  onTransformGenerated
}: AITransformGeneratorProps) {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<TransformGenerationResult | null>(null)

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please describe what you want to transform')
      return
    }

    setIsGenerating(true)
    setResult(null)

    try {
      const generatedResult = await generateTransformFromDescription({
        description,
        samplePayload,
        webhookId,
        webhookName
      })
      
      setResult(generatedResult)
      toast.success('Transform generated successfully!')
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate transform')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUseTransform = () => {
    if (result) {
      onTransformGenerated(result.transform)
      setDescription('')
      setResult(null)
      toast.success('Transform applied!')
    }
  }

  const handleReset = () => {
    setDescription('')
    setResult(null)
  }

  return (
    <Card className="border-2 border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle size={20} weight="fill" className="text-accent" />
          AI Transform Generator
        </CardTitle>
        <CardDescription>
          Describe what you want to transform in natural language and let AI create the mapping
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            id="ai-transform-description"
            placeholder="E.g., 'Extract user email, name, and signup date from the payload and convert the date to ISO format' or 'Map order data with calculated total from quantity * price'"
            className="min-h-[100px] resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isGenerating || !!result}
          />
          
          {samplePayload && (
            <div className="text-xs text-muted-foreground">
              <Check size={12} className="inline mr-1" />
              Sample payload detected - AI will use it for context
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !!result || !description.trim()}
            className="flex-1 bg-gradient-to-r from-accent to-primary"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Generating...
              </>
            ) : (
              <>
                <Sparkle size={16} className="mr-2" weight="fill" />
                Generate Transform
              </>
            )}
          </Button>
          
          {result && (
            <Button
              onClick={handleReset}
              variant="outline"
            >
              Reset
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Alert className="border-accent bg-accent/5">
                <Lightbulb size={16} weight="fill" className="text-accent" />
                <AlertDescription className="text-sm">
                  <strong className="block mb-2">{result.transform.name}</strong>
                  {result.explanation}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Generated Mappings:</div>
                <ScrollArea className="h-[200px] rounded-lg border p-3">
                  <div className="space-y-2">
                    {result.transform.mappings.map((mapping, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-muted/50 rounded text-xs font-mono"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-primary">{mapping.sourcePath}</code>
                          <span>→</span>
                          <code className="text-accent">{mapping.targetField}</code>
                          {mapping.transformType !== 'direct' && (
                            <Badge variant="outline" className="text-xs">
                              {mapping.transformType}
                            </Badge>
                          )}
                        </div>
                        {mapping.transformFunction && (
                          <div className="text-muted-foreground mt-1 pl-2 border-l-2 border-accent/30">
                            {mapping.transformFunction}
                          </div>
                        )}
                        {mapping.defaultValue !== undefined && (
                          <div className="text-muted-foreground mt-1">
                            Default: {JSON.stringify(mapping.defaultValue)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {result.suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Suggestions for improvement:</div>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    {result.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={handleUseTransform}
                className="w-full bg-gradient-to-r from-primary to-accent"
              >
                <Check size={16} className="mr-2" />
                Use This Transform
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !isGenerating && (
          <div className="border-t pt-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">Example descriptions:</div>
            <div className="space-y-1">
              <button
                onClick={() => setDescription('Extract user ID, email, and registration timestamp. Convert timestamp to ISO date format.')}
                className="text-xs text-left w-full p-2 rounded hover:bg-muted/50 transition-colors"
              >
                <span className="text-accent">→</span> Extract user data with date formatting
              </button>
              <button
                onClick={() => setDescription('Map order items array and calculate total price by summing quantity * price for each item')}
                className="text-xs text-left w-full p-2 rounded hover:bg-muted/50 transition-colors"
              >
                <span className="text-accent">→</span> Calculate order totals from items
              </button>
              <button
                onClick={() => setDescription('Extract event type and data, only include records where status equals active')}
                className="text-xs text-left w-full p-2 rounded hover:bg-muted/50 transition-colors"
              >
                <span className="text-accent">→</span> Conditional filtering by status
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
