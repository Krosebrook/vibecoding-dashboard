import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkle, Layout, Code, Eye, Plus, Download, Check, Warning, Monitor, ChartLine, CurrencyDollar, ShareNetwork, ChartBar, Palette, Lightning } from '@phosphor-icons/react'
import { DashboardConfig, GenerationProgress, DashboardTemplate } from '@/lib/types'
import { generateDashboard, refineDashboard, generateSetupInstructions } from '@/lib/dashboard-generator'
import { dashboardTemplates } from '@/lib/templates'
import { systemMonitoringDashboard } from '@/lib/monitoring-template'
import { analyticsDashboard } from '@/lib/analytics-template'
import { salesDashboard } from '@/lib/sales-template'
import { socialMediaDashboard } from '@/lib/social-media-template'
import { businessIntelligenceDashboard } from '@/lib/business-intelligence-template'
import { DashboardPreview } from '@/components/DashboardPreview'
import { DrillDownGuide } from '@/components/DrillDownGuide'
import { DataConnectorManager } from '@/components/DataConnectorManager'
import { ConnectorDrillDownDemo } from '@/components/ConnectorDrillDownDemo'
import { WebhookManager } from '@/components/WebhookManager'
import { WebhookQuickStart } from '@/components/WebhookQuickStart'
import { WebhookTransformManager } from '@/components/WebhookTransformManager'
import { TransformPatternLibrary } from '@/components/TransformPatternLibrary'
import { AITransformQuickStart } from '@/components/AITransformQuickStart'
import { VisualPatternBuilder } from '@/components/VisualPatternBuilder'
import { AnimationPresetsLibrary } from '@/components/AnimationPresetsLibrary'
import { ChoreographyBuilder } from '@/components/ChoreographyBuilder'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'pattern' | 'animation'>('dashboard')
  const [prompt, setPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | undefined>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null)
  const [currentDashboard, setCurrentDashboard] = useKV<DashboardConfig | null>('current-dashboard', null)
  const [savedDashboards, setSavedDashboards] = useKV<DashboardConfig[]>('saved-dashboards', [])
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [refinementPrompt, setRefinementPrompt] = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a dashboard description')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(null)

    try {
      const dashboard = await generateDashboard(
        prompt,
        selectedTemplate,
        (progress) => setGenerationProgress(progress)
      )
      
      setCurrentDashboard(dashboard)
      toast.success('Dashboard generated successfully!')
      setPrompt('')
      setSelectedTemplate(undefined)
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate dashboard. Please try again.')
    } finally {
      setIsGenerating(false)
      setGenerationProgress(null)
    }
  }

  const handleRefine = async () => {
    if (!currentDashboard || !refinementPrompt.trim()) {
      toast.error('Please enter refinement instructions')
      return
    }

    setIsGenerating(true)

    try {
      const refined = await refineDashboard(
        currentDashboard,
        refinementPrompt,
        (progress) => setGenerationProgress(progress)
      )
      
      setCurrentDashboard(refined)
      toast.success('Dashboard refined successfully!')
      setRefinementPrompt('')
    } catch (error) {
      console.error('Refinement error:', error)
      toast.error('Failed to refine dashboard. Please try again.')
    } finally {
      setIsGenerating(false)
      setGenerationProgress(null)
    }
  }

  const handleSave = () => {
    if (!currentDashboard) return

    setSavedDashboards((current = []) => {
      const existing = current.find(d => d.id === currentDashboard.id)
      if (existing) {
        return current.map(d => d.id === currentDashboard.id ? currentDashboard : d)
      }
      return [...current, currentDashboard]
    })
    
    toast.success('Dashboard saved!')
  }

  const handleLoadDashboard = (dashboard: DashboardConfig) => {
    setCurrentDashboard(dashboard)
    toast.success('Dashboard loaded!')
  }

  const handleLoadMonitoringDashboard = () => {
    setCurrentDashboard(systemMonitoringDashboard)
    toast.success('System Monitoring Dashboard loaded!')
  }

  const handleLoadAnalyticsDashboard = () => {
    setCurrentDashboard(analyticsDashboard)
    toast.success('Analytics Dashboard loaded!')
  }

  const handleLoadSalesDashboard = () => {
    setCurrentDashboard(salesDashboard)
    toast.success('Sales Dashboard loaded!')
  }

  const handleLoadSocialMediaDashboard = () => {
    setCurrentDashboard(socialMediaDashboard)
    toast.success('Social Media Dashboard loaded!')
  }

  const handleLoadBusinessIntelligenceDashboard = () => {
    setCurrentDashboard(businessIntelligenceDashboard)
    toast.success('Business Intelligence Dashboard loaded!')
  }

  const handleDeleteDashboard = (id: string) => {
    setSavedDashboards((current = []) => current.filter(d => d.id !== id))
    if (currentDashboard?.id === id) {
      setCurrentDashboard(null)
    }
    toast.success('Dashboard deleted!')
  }

  const handleExport = () => {
    if (!currentDashboard) return
    
    const dataStr = JSON.stringify(currentDashboard, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentDashboard.name.replace(/\s+/g, '-').toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Dashboard exported!')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                {viewMode === 'dashboard' ? (
                  <Sparkle size={24} weight="fill" className="text-primary-foreground" />
                ) : viewMode === 'pattern' ? (
                  <Palette size={24} weight="fill" className="text-primary-foreground" />
                ) : (
                  <Lightning size={24} weight="fill" className="text-primary-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {viewMode === 'dashboard' ? 'Dashboard VibeCoder' : viewMode === 'pattern' ? 'Visual Pattern Builder' : 'Animation Presets'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {viewMode === 'dashboard' ? 'AI-Powered Dashboard Generator' : viewMode === 'pattern' ? 'Drag-and-drop pattern design system' : 'Multi-element choreography library'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'dashboard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('dashboard')}
              >
                <Sparkle size={16} className="mr-2" />
                Dashboard
              </Button>
              <Button
                variant={viewMode === 'pattern' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('pattern')}
              >
                <Palette size={16} className="mr-2" />
                Patterns
              </Button>
              <Button
                variant={viewMode === 'animation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('animation')}
              >
                <Lightning size={16} className="mr-2" />
                Animations
              </Button>
              {viewMode === 'dashboard' && currentDashboard && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                  >
                    <Download size={16} className="mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                  >
                    <Code size={16} className="mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSetupDialogOpen(true)}
                  >
                    <Eye size={16} className="mr-2" />
                    Setup
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'pattern' ? (
        <VisualPatternBuilder />
      ) : viewMode === 'animation' ? (
        <div className="container mx-auto px-6 py-8 space-y-6">
          <AnimationPresetsLibrary />
          <ChoreographyBuilder />
        </div>
      ) : (
      <>
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkle size={20} weight="duotone" className="text-accent" />
                  Generate Dashboard
                </CardTitle>
                <CardDescription>
                  Describe your dashboard in natural language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  id="dashboard-prompt"
                  placeholder="E.g., 'Create a sales dashboard with revenue charts, top products, and recent orders' or 'Build a social media analytics dashboard tracking engagement and follower growth'"
                  className={`min-h-[120px] resize-none ${isGenerating ? 'animate-pulse-glow' : ''}`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                
                {selectedTemplate && (
                  <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <span className="text-2xl">{selectedTemplate.preview}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{selectedTemplate.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedTemplate.category}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTemplate(undefined)}
                    >
                      Clear
                    </Button>
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      {generationProgress?.message || 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Sparkle size={20} weight="fill" className="mr-2" />
                      Generate Dashboard
                    </>
                  )}
                </Button>

                {generationProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{generationProgress.stage}</span>
                      <span>{generationProgress.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${generationProgress.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {currentDashboard && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkle size={20} weight="duotone" className="text-secondary" />
                    Refine Dashboard
                  </CardTitle>
                  <CardDescription>
                    Make changes with natural language
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    id="refinement-prompt"
                    placeholder="E.g., 'Add a pie chart showing product categories' or 'Change the color scheme to be more vibrant'"
                    className="min-h-[80px] resize-none"
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={handleRefine}
                    disabled={isGenerating || !refinementPrompt.trim()}
                  >
                    <Sparkle size={16} className="mr-2" />
                    Refine
                  </Button>
                </CardContent>
              </Card>
            )}

            <DrillDownGuide />

            <ConnectorDrillDownDemo />

            <WebhookQuickStart />

            <AITransformQuickStart />

            <WebhookManager />

            <WebhookTransformManager />

            <TransformPatternLibrary />

            <DataConnectorManager />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout size={20} weight="duotone" />
                  Templates
                </CardTitle>
                <CardDescription>
                  Start with a pre-configured dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pre-Configured Dashboards</h3>
                      <div className="grid gap-2">
                        <button
                          className="w-full p-3 rounded-lg border-2 border-accent bg-accent/10 hover:bg-accent/15 transition-all text-left"
                          onClick={handleLoadBusinessIntelligenceDashboard}
                        >
                          <div className="flex items-center gap-3">
                            <ChartBar size={24} weight="duotone" className="text-accent flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold">Business Intelligence</div>
                              <div className="text-xs text-muted-foreground">All interactive chart types</div>
                            </div>
                            <Badge className="bg-accent text-accent-foreground flex-shrink-0">Featured</Badge>
                          </div>
                        </button>

                        <button
                          className="w-full p-3 rounded-lg border-2 border-accent bg-accent/10 hover:bg-accent/15 transition-all text-left"
                          onClick={handleLoadMonitoringDashboard}
                        >
                          <div className="flex items-center gap-3">
                            <Monitor size={24} weight="duotone" className="text-accent flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold">System Monitoring</div>
                              <div className="text-xs text-muted-foreground">Real-time server metrics</div>
                            </div>
                            <Badge className="bg-accent text-accent-foreground flex-shrink-0">Ready</Badge>
                          </div>
                        </button>

                        <button
                          className="w-full p-3 rounded-lg border-2 border-primary bg-primary/10 hover:bg-primary/15 transition-all text-left"
                          onClick={handleLoadAnalyticsDashboard}
                        >
                          <div className="flex items-center gap-3">
                            <ChartLine size={24} weight="duotone" className="text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold">Analytics</div>
                              <div className="text-xs text-muted-foreground">Web traffic & engagement</div>
                            </div>
                            <Badge className="bg-primary text-primary-foreground flex-shrink-0">Ready</Badge>
                          </div>
                        </button>

                        <button
                          className="w-full p-3 rounded-lg border-2 border-secondary bg-secondary/10 hover:bg-secondary/15 transition-all text-left"
                          onClick={handleLoadSalesDashboard}
                        >
                          <div className="flex items-center gap-3">
                            <CurrencyDollar size={24} weight="duotone" className="text-secondary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold">Sales</div>
                              <div className="text-xs text-muted-foreground">Revenue & pipeline tracking</div>
                            </div>
                            <Badge className="bg-secondary text-secondary-foreground flex-shrink-0">Ready</Badge>
                          </div>
                        </button>

                        <button
                          className="w-full p-3 rounded-lg border-2 border-accent bg-accent/10 hover:bg-accent/15 transition-all text-left"
                          onClick={handleLoadSocialMediaDashboard}
                        >
                          <div className="flex items-center gap-3">
                            <ShareNetwork size={24} weight="duotone" className="text-accent flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold">Social Media</div>
                              <div className="text-xs text-muted-foreground">Multi-platform analytics</div>
                            </div>
                            <Badge className="bg-accent text-accent-foreground flex-shrink-0">Ready</Badge>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Template Starters</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {dashboardTemplates.map((template) => (
                          <button
                            key={template.id}
                            className={`p-4 rounded-lg border-2 transition-all text-left hover:border-accent hover:bg-accent/5 ${
                              selectedTemplate?.id === template.id
                                ? 'border-accent bg-accent/10'
                                : 'border-border'
                            }`}
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <div className="text-3xl mb-2">{template.preview}</div>
                            <div className="text-sm font-medium mb-1">{template.name}</div>
                            <div className="text-xs text-muted-foreground">{template.category}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {(savedDashboards && savedDashboards.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download size={20} weight="duotone" />
                    Saved Dashboards
                  </CardTitle>
                  <CardDescription>
                    {savedDashboards.length} dashboard{savedDashboards.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {savedDashboards.map((dashboard) => (
                        <div
                          key={dashboard.id}
                          className={`p-3 rounded-lg border transition-all ${
                            currentDashboard?.id === dashboard.id
                              ? 'border-accent bg-accent/10'
                              : 'border-border hover:border-accent/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              className="flex-1 text-left"
                              onClick={() => handleLoadDashboard(dashboard)}
                            >
                              <div className="font-medium text-sm">{dashboard.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {dashboard.components.length} components
                              </div>
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDashboard(dashboard.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Warning size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-12rem)]">
              {currentDashboard ? (
                <Tabs defaultValue="preview" className="h-full flex flex-col">
                  <CardHeader className="flex-none">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {currentDashboard.name}
                          <Badge variant="secondary">{currentDashboard.type}</Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {currentDashboard.description}
                        </CardDescription>
                      </div>
                    </div>
                    <TabsList className="w-fit mt-4">
                      <TabsTrigger value="preview">
                        <Eye size={16} className="mr-2" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="config">
                        <Code size={16} className="mr-2" />
                        Config
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="preview" className="h-full m-0">
                      <DashboardPreview config={currentDashboard} />
                    </TabsContent>
                    <TabsContent value="config" className="h-full m-0 p-6">
                      <ScrollArea className="h-full">
                        <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-x-auto">
                          {JSON.stringify(currentDashboard, null, 2)}
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              ) : (
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4 max-w-md">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                      <Sparkle size={40} weight="duotone" className="text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Start VibeCoding</h3>
                      <p className="text-muted-foreground">
                        Describe your dream dashboard in natural language and watch it materialize.
                        Choose a template or start from scratch.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Badge variant="outline" className="gap-1">
                        <Check size={14} />
                        Production Ready
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Check size={14} />
                        Fully Functional
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Check size={14} />
                        Any Style
                      </Badge>
                    </div>
                    <div className="pt-4 space-y-2">
                      <p className="text-sm font-semibold text-foreground mb-3">Try a Pre-Configured Dashboard:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={handleLoadBusinessIntelligenceDashboard}
                          variant="outline"
                          className="h-auto py-3 flex-col gap-1 hover:border-accent"
                        >
                          <ChartBar size={24} weight="duotone" />
                          <span className="text-xs">Business Intelligence</span>
                        </Button>
                        <Button
                          onClick={handleLoadMonitoringDashboard}
                          variant="outline"
                          className="h-auto py-3 flex-col gap-1 hover:border-accent"
                        >
                          <Monitor size={24} weight="duotone" />
                          <span className="text-xs">System Monitoring</span>
                        </Button>
                        <Button
                          onClick={handleLoadAnalyticsDashboard}
                          variant="outline"
                          className="h-auto py-3 flex-col gap-1 hover:border-primary"
                        >
                          <ChartLine size={24} weight="duotone" />
                          <span className="text-xs">Analytics</span>
                        </Button>
                        <Button
                          onClick={handleLoadSalesDashboard}
                          variant="outline"
                          className="h-auto py-3 flex-col gap-1 hover:border-secondary"
                        >
                          <CurrencyDollar size={24} weight="duotone" />
                          <span className="text-xs">Sales</span>
                        </Button>
                        <Button
                          onClick={handleLoadSocialMediaDashboard}
                          variant="outline"
                          className="h-auto py-3 flex-col gap-1 hover:border-accent col-span-2"
                        >
                          <ShareNetwork size={24} weight="duotone" />
                          <span className="text-xs">Social Media</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Setup Instructions</DialogTitle>
            <DialogDescription>
              Complete guide to deploy and customize your dashboard
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="prose prose-sm prose-invert max-w-none pr-4">
              <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {currentDashboard && generateSetupInstructions(currentDashboard)}
              </pre>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  )
}

export default App