import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChartLine, 
  CircleNotch, 
  ShieldWarning, 
  Lightning, 
  Cpu, 
  Database, 
  HardDrives,
  WifiHigh,
  Clock,
  Warning,
  CheckCircle,
  Info,
  TrendUp,
  GitBranch,
  Sparkle
} from '@phosphor-icons/react'
import { MigrationImpactAnalysis, DatabaseConnection, MigrationConfig } from '@/lib/types'
import { toast } from 'sonner'

interface MigrationImpactAnalyzerProps {
  config: MigrationConfig | null
  sourceConnection: DatabaseConnection | null
  destinationConnection: DatabaseConnection | null
}

export function MigrationImpactAnalyzer({ 
  config, 
  sourceConnection, 
  destinationConnection 
}: MigrationImpactAnalyzerProps) {
  const [analysis, setAnalysis] = useState<MigrationImpactAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [useAI, setUseAI] = useState(false)

  const runAnalysis = async (withAI: boolean = false) => {
    if (!config || !sourceConnection || !destinationConnection) {
      toast.error('Please configure source, destination, and mappings first')
      return
    }

    setIsAnalyzing(true)
    setUseAI(withAI)

    await new Promise(resolve => setTimeout(resolve, withAI ? 2000 : 1000))

    const mockAnalysis: MigrationImpactAnalysis = {
      migrationId: config.id,
      timestamp: new Date().toISOString(),
      estimatedDuration: Math.floor(Math.random() * 120) + 30,
      estimatedDataSize: Math.floor(Math.random() * 500) + 100,
      resourceRequirements: {
        cpu: Math.floor(Math.random() * 60) + 20,
        memory: Math.floor(Math.random() * 2048) + 512,
        disk: Math.floor(Math.random() * 10) + 5,
        network: Math.floor(Math.random() * 100) + 50,
      },
      risks: [
        {
          id: 'risk-1',
          type: 'data-loss',
          severity: 'medium',
          description: 'Potential data truncation when converting VARCHAR(500) to VARCHAR(255)',
          mitigation: 'Review long text fields and consider using TEXT type or truncation rules',
          probability: 0.35,
        },
        {
          id: 'risk-2',
          type: 'performance',
          severity: 'low',
          description: 'Large dataset may cause memory pressure during batch processing',
          mitigation: 'Reduce batch size to 50 or enable streaming mode',
          probability: 0.25,
        },
        {
          id: 'risk-3',
          type: 'compatibility',
          severity: 'high',
          description: 'Source database uses custom data types not supported in destination',
          mitigation: 'Apply custom transformations to convert proprietary types',
          probability: 0.65,
        },
      ],
      dependencies: [
        {
          table: 'orders',
          dependsOn: ['customers', 'products'],
          reason: 'Foreign key constraints require parent tables to be migrated first',
        },
        {
          table: 'order_items',
          dependsOn: ['orders', 'products'],
          reason: 'Foreign key constraints require parent tables to be migrated first',
        },
      ],
      recommendations: [
        'Migrate tables in dependency order: customers → products → orders → order_items',
        'Schedule migration during off-peak hours (recommended: 2:00 AM - 4:00 AM)',
        'Set up a staging environment to test migration before production run',
        'Enable transaction support to allow rollback if issues occur',
        'Monitor memory usage closely during large table migrations',
      ],
      estimatedCost: {
        timeMinutes: Math.floor(Math.random() * 120) + 30,
        resourceUnits: Math.floor(Math.random() * 100) + 50,
        complexity: config.mappings.length > 20 ? 'very-complex' : 
                    config.mappings.length > 10 ? 'complex' :
                    config.mappings.length > 5 ? 'moderate' : 'simple',
      },
    }

    if (withAI) {
      try {
        const promptText = `You are a database migration expert. Analyze this migration configuration and provide insights.

Configuration:
- Source: ${sourceConnection.type} (${sourceConnection.name})
- Destination: ${destinationConnection.type} (${destinationConnection.name})
- Mappings: ${config.mappings.length} field mappings
- Batch Size: ${config.options.batchSize}
- Continue on Error: ${config.options.continueOnError}

Based on this configuration, provide additional recommendations as a JSON array of strings. Focus on:
1. Optimization strategies
2. Risk mitigation
3. Performance improvements
4. Best practices

Return only the JSON array of recommendation strings.`

        const aiResponse = await window.spark.llm(promptText, 'gpt-4o-mini', true)
        const aiRecommendations = JSON.parse(aiResponse)
        
        if (Array.isArray(aiRecommendations.recommendations)) {
          mockAnalysis.recommendations = [
            ...mockAnalysis.recommendations,
            ...aiRecommendations.recommendations,
          ]
        }

        toast.success('AI-enhanced analysis complete')
      } catch (error) {
        toast.warning('Using standard analysis (AI enhancement unavailable)')
      }
    }

    setAnalysis(mockAnalysis)
    setIsAnalyzing(false)
    toast.success('Impact analysis complete')
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'low': return 'text-info border-info/40 bg-info/10'
      case 'medium': return 'text-warning border-warning/40 bg-warning/10'
      case 'high': return 'text-destructive border-destructive/40 bg-destructive/10'
      case 'critical': return 'text-destructive border-destructive bg-destructive/20'
    }
  }

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'low': return <Info size={18} weight="bold" />
      case 'medium': return <Warning size={18} weight="bold" />
      case 'high': return <ShieldWarning size={18} weight="bold" />
      case 'critical': return <ShieldWarning size={18} weight="bold" />
    }
  }

  const getRiskTypeIcon = (type: MigrationImpactAnalysis['risks'][0]['type']) => {
    switch (type) {
      case 'data-loss': return <Database size={16} weight="bold" />
      case 'performance': return <TrendUp size={16} weight="bold" />
      case 'compatibility': return <GitBranch size={16} weight="bold" />
      case 'security': return <ShieldWarning size={16} weight="bold" />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-success'
      case 'moderate': return 'text-info'
      case 'complex': return 'text-warning'
      case 'very-complex': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  if (!config || !sourceConnection || !destinationConnection) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <ChartLine size={48} className="mx-auto text-muted-foreground opacity-50" weight="duotone" />
            <p className="text-sm text-muted-foreground">Configure your migration to analyze potential impact</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <CircleNotch size={48} className="mx-auto text-primary animate-spin" weight="bold" />
            <div>
              <p className="text-sm font-medium">Analyzing migration impact...</p>
              <p className="text-xs text-muted-foreground mt-1">
                {useAI ? 'Running AI-enhanced analysis' : 'Running standard analysis'}
              </p>
            </div>
            <div className="max-w-xs mx-auto">
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChartLine size={24} weight="duotone" className="text-primary" />
                Migration Impact Analysis
              </CardTitle>
              <CardDescription>
                Predict resource requirements, risks, and optimize your migration strategy
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => runAnalysis(false)}
                className="gap-2"
              >
                <Lightning size={18} weight="bold" />
                Quick Analysis
              </Button>
              <Button 
                onClick={() => runAnalysis(true)}
                className="gap-2"
              >
                <Sparkle size={18} weight="bold" />
                AI-Enhanced Analysis
              </Button>
            </div>
          </div>
        </CardHeader>
        {!analysis ? (
          <CardContent>
            <Alert>
              <Info size={20} weight="bold" />
              <AlertDescription>
                Click "Quick Analysis" for a fast impact assessment, or use "AI-Enhanced Analysis" for deeper insights and recommendations.
              </AlertDescription>
            </Alert>
          </CardContent>
        ) : (
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Est. Duration</p>
                          <p className="text-2xl font-bold mt-1">{analysis.estimatedDuration}m</p>
                        </div>
                        <Clock size={32} className="text-primary opacity-50" weight="duotone" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Data Size</p>
                          <p className="text-2xl font-bold mt-1">{analysis.estimatedDataSize} MB</p>
                        </div>
                        <Database size={32} className="text-primary opacity-50" weight="duotone" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Complexity</p>
                          <p className={`text-2xl font-bold mt-1 capitalize ${getComplexityColor(analysis.estimatedCost?.complexity || 'simple')}`}>
                            {analysis.estimatedCost?.complexity.replace('-', ' ')}
                          </p>
                        </div>
                        <ChartLine size={32} className="text-primary opacity-50" weight="duotone" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Risk Level</p>
                          <p className="text-2xl font-bold mt-1">
                            {analysis.risks.filter(r => r.severity === 'high' || r.severity === 'critical').length > 0 ? 'High' :
                             analysis.risks.filter(r => r.severity === 'medium').length > 0 ? 'Medium' : 'Low'}
                          </p>
                        </div>
                        <ShieldWarning size={32} className="text-primary opacity-50" weight="duotone" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {analysis.dependencies.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GitBranch size={20} weight="duotone" />
                        Table Dependencies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.dependencies.map((dep, index) => (
                          <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                              <div className="flex-1">
                                <p className="font-semibold text-sm">
                                  <span className="font-mono">{dep.table}</span>
                                  <span className="text-muted-foreground font-normal mx-2">depends on</span>
                                  {dep.dependsOn.map((t, i) => (
                                    <span key={i}>
                                      <span className="font-mono">{t}</span>
                                      {i < dep.dependsOn.length - 1 && ', '}
                                    </span>
                                  ))}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">{dep.reason}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Cpu size={18} weight="duotone" className="text-primary" />
                            <span className="font-medium">CPU Usage</span>
                          </div>
                          <span className="font-mono">{analysis.resourceRequirements.cpu}%</span>
                        </div>
                        <Progress value={analysis.resourceRequirements.cpu} className="h-3" />
                        <p className="text-xs text-muted-foreground">
                          {analysis.resourceRequirements.cpu < 50 ? 'Low CPU demand - efficient migration' :
                           analysis.resourceRequirements.cpu < 75 ? 'Moderate CPU usage - monitor during peak times' :
                           'High CPU usage - consider running during off-peak hours'}
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <HardDrives size={18} weight="duotone" className="text-primary" />
                            <span className="font-medium">Memory</span>
                          </div>
                          <span className="font-mono">{analysis.resourceRequirements.memory} MB</span>
                        </div>
                        <Progress value={(analysis.resourceRequirements.memory / 4096) * 100} className="h-3" />
                        <p className="text-xs text-muted-foreground">
                          {analysis.resourceRequirements.memory < 1024 ? 'Low memory footprint' :
                           analysis.resourceRequirements.memory < 2048 ? 'Moderate memory usage' :
                           'High memory usage - ensure sufficient RAM available'}
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Database size={18} weight="duotone" className="text-primary" />
                            <span className="font-medium">Disk I/O</span>
                          </div>
                          <span className="font-mono">{analysis.resourceRequirements.disk} GB</span>
                        </div>
                        <Progress value={(analysis.resourceRequirements.disk / 20) * 100} className="h-3" />
                        <p className="text-xs text-muted-foreground">
                          Temporary disk space required for batch processing
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <WifiHigh size={18} weight="duotone" className="text-primary" />
                            <span className="font-medium">Network Bandwidth</span>
                          </div>
                          <span className="font-mono">{analysis.resourceRequirements.network} Mbps</span>
                        </div>
                        <Progress value={analysis.resourceRequirements.network} className="h-3" />
                        <p className="text-xs text-muted-foreground">
                          Network throughput for data transfer between databases
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risks" className="space-y-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pr-4">
                    {analysis.risks.map((risk) => (
                      <Card key={risk.id} className={`border-2 ${getSeverityColor(risk.severity)}`}>
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityColor(risk.severity)}`}>
                                {getSeverityIcon(risk.severity)}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {getRiskTypeIcon(risk.type)}
                                    <span className="ml-1 capitalize">{risk.type.replace('-', ' ')}</span>
                                  </Badge>
                                  <Badge variant="outline" className={`text-xs capitalize ${getSeverityColor(risk.severity)}`}>
                                    {risk.severity}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs font-mono">
                                    {Math.round(risk.probability * 100)}% probability
                                  </Badge>
                                </div>
                                <p className="text-sm font-semibold mt-2">{risk.description}</p>
                              </div>
                            </div>
                          </div>

                          <div className="ml-13 pl-3 border-l-2 border-border space-y-2">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Mitigation Strategy
                              </p>
                              <p className="text-sm mt-1">{risk.mitigation}</p>
                            </div>
                            <Progress value={risk.probability * 100} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightning size={20} weight="duotone" className="text-primary" />
                      Optimization Recommendations
                    </CardTitle>
                    <CardDescription>
                      {useAI ? 'AI-enhanced recommendations based on your configuration' : 'Best practices for your migration'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3 pr-4">
                        {analysis.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/40 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary">{index + 1}</span>
                            </div>
                            <p className="text-sm flex-1">{rec}</p>
                            <CheckCircle size={18} className="text-success shrink-0 mt-0.5" weight="bold" />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
