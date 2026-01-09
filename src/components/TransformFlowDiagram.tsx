import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Database, FunnelSimple, ChartBar } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function TransformFlowDiagram() {
  return (
    <Card className="border-2 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FunnelSimple size={18} weight="duotone" className="text-accent" />
          How Payload Transformation Works
        </CardTitle>
        <CardDescription>
          Visual guide to the webhook transformation pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 p-4 bg-card border-2 border-primary rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Database size={20} weight="duotone" className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Incoming Webhook</div>
                  <div className="text-xs text-muted-foreground">External Service</div>
                </div>
              </div>
              <pre className="text-xs font-mono bg-muted p-2 rounded mt-2 overflow-x-auto">
{`{
  "data": {
    "user": {
      "first": "John",
      "last": "Doe"
    }
  }
}`}
              </pre>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ArrowRight size={24} weight="bold" className="text-accent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex-1 p-4 bg-card border-2 border-accent rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <FunnelSimple size={20} weight="duotone" className="text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Transform Rules</div>
                  <div className="text-xs text-muted-foreground">Your Mappings</div>
                </div>
              </div>
              <div className="space-y-1 mt-2">
                <div className="text-xs font-mono flex items-center gap-2 bg-muted p-2 rounded">
                  <code className="text-primary">data.user.first</code>
                  <ArrowRight size={12} className="text-muted-foreground" />
                  <code className="text-accent">firstName</code>
                </div>
                <div className="text-xs font-mono flex items-center gap-2 bg-muted p-2 rounded">
                  <code className="text-primary">data.user.last</code>
                  <ArrowRight size={12} className="text-muted-foreground" />
                  <code className="text-accent">lastName</code>
                </div>
                <Badge variant="outline" className="text-xs mt-1">
                  + Custom Functions
                </Badge>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <ArrowRight size={24} weight="bold" className="text-accent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex-1 p-4 bg-card border-2 border-secondary rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <ChartBar size={20} weight="duotone" className="text-secondary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Dashboard Data</div>
                  <div className="text-xs text-muted-foreground">Clean & Ready</div>
                </div>
              </div>
              <pre className="text-xs font-mono bg-muted p-2 rounded mt-2 overflow-x-auto">
{`{
  "firstName": "John",
  "lastName": "Doe"
}`}
              </pre>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="font-semibold text-sm mb-1 text-primary">Direct Mapping</div>
              <p className="text-xs text-muted-foreground">
                Copy values from source to target fields as-is
              </p>
            </div>
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
              <div className="font-semibold text-sm mb-1 text-accent">Transform Functions</div>
              <p className="text-xs text-muted-foreground">
                Apply JavaScript functions to modify values
              </p>
            </div>
            <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
              <div className="font-semibold text-sm mb-1 text-secondary">Conditional Logic</div>
              <p className="text-xs text-muted-foreground">
                Map different values based on conditions
              </p>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs space-y-1">
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">→</span>
                <span className="text-muted-foreground">
                  Transforms are applied automatically to all incoming webhook events
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">→</span>
                <span className="text-muted-foreground">
                  Test your transforms before deployment with sample payloads
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">→</span>
                <span className="text-muted-foreground">
                  Reuse transforms across multiple webhooks and dashboards
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
