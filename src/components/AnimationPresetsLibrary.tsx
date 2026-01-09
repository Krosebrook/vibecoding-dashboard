import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Play, Pause, Copy, Download, Sparkle, MagicWand, Lightning, Eye, Code } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  animationPresets, 
  choreographyTemplates,
  getPresetsByCategory,
  getPresetsByComplexity,
  generateStaggeredAnimations,
  AnimationPreset,
  ChoreographyConfig,
  StaggerConfig
} from '@/lib/animation-presets'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function AnimationPresetsLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedComplexity, setSelectedComplexity] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPreset, setSelectedPreset] = useState<AnimationPreset | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [customStagger, setCustomStagger] = useState<StaggerConfig>({
    from: "first",
    direction: 1,
    amount: 0.1
  })
  const [elementCount, setElementCount] = useState(5)

  const filteredPresets = animationPresets.filter(preset => {
    const matchesCategory = selectedCategory === "all" || preset.category === selectedCategory
    const matchesComplexity = selectedComplexity === "all" || preset.complexity === selectedComplexity
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesComplexity && matchesSearch
  })

  const handlePlayPreview = (preset: AnimationPreset) => {
    setSelectedPreset(preset)
    setPreviewKey(prev => prev + 1)
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), preset.totalDuration * 1000)
  }

  const handleCopyCode = (preset: AnimationPreset) => {
    const code = generateFramerMotionCode(preset)
    navigator.clipboard.writeText(code)
    toast.success("Animation code copied to clipboard!")
  }

  const handleExportPreset = (preset: AnimationPreset) => {
    const dataStr = JSON.stringify(preset, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${preset.id}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Preset exported!")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkle size={24} weight="duotone" className="text-accent" />
              Animation Presets Library
            </CardTitle>
            <CardDescription>
              {animationPresets.length} professional animation presets with multi-element choreography
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Lightning size={14} />
            Production Ready
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search animations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="entrance">Entrance</SelectItem>
                <SelectItem value="exit">Exit</SelectItem>
                <SelectItem value="attention">Attention</SelectItem>
                <SelectItem value="choreography">Choreography</SelectItem>
                <SelectItem value="interaction">Interaction</SelectItem>
                <SelectItem value="transformation">Transformation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="complex">Complex</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="presets">
              <MagicWand size={16} className="mr-2" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="choreography">
              <Sparkle size={16} className="mr-2" />
              Choreography
            </TabsTrigger>
            <TabsTrigger value="playground">
              <Play size={16} className="mr-2" />
              Playground
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                {filteredPresets.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onPlay={handlePlayPreview}
                    onCopy={handleCopyCode}
                    onExport={handleExportPreset}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="choreography" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {choreographyTemplates.map((template, index) => (
                  <ChoreographyCard
                    key={index}
                    template={template}
                    onPlay={() => {
                      setSelectedPreset(template.preset)
                      setPreviewKey(prev => prev + 1)
                      setIsPlaying(true)
                      setTimeout(() => setIsPlaying(false), template.preset.totalDuration * 1000)
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="playground" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Preview Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Animation Preset</Label>
                      <Select 
                        value={selectedPreset?.id || ""} 
                        onValueChange={(id) => {
                          const preset = animationPresets.find(p => p.id === id)
                          if (preset) setSelectedPreset(preset)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preset" />
                        </SelectTrigger>
                        <SelectContent>
                          {animationPresets.map((preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                              {preset.icon} {preset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Element Count: {elementCount}</Label>
                      <Slider
                        value={[elementCount]}
                        onValueChange={(value) => setElementCount(value[0])}
                        min={1}
                        max={12}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Stagger Amount: {customStagger.amount}s</Label>
                      <Slider
                        value={[(customStagger.amount || 0.1) * 100]}
                        onValueChange={(value) => setCustomStagger({ ...customStagger, amount: value[0] / 100 })}
                        min={0}
                        max={50}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Stagger From</Label>
                      <Select 
                        value={String(customStagger.from)} 
                        onValueChange={(value) => {
                          setCustomStagger({ 
                            ...customStagger, 
                            from: value === "first" || value === "last" || value === "center" || value === "edges" 
                              ? value 
                              : parseInt(value) 
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first">First</SelectItem>
                          <SelectItem value="last">Last</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="edges">Edges</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {
                        setPreviewKey(prev => prev + 1)
                        setIsPlaying(true)
                        setTimeout(() => setIsPlaying(false), (selectedPreset?.totalDuration || 1) * 1000)
                      }}
                      disabled={!selectedPreset || isPlaying}
                    >
                      <Play size={16} className="mr-2" />
                      Play Animation
                    </Button>
                  </CardContent>
                </Card>

                {selectedPreset && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Animation Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-mono">{selectedPreset.totalDuration}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Orchestration:</span>
                        <span className="font-mono">{selectedPreset.orchestration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Complexity:</span>
                        <Badge variant="outline">{selectedPreset.complexity}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge>{selectedPreset.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimationPlayground
                    key={previewKey}
                    preset={selectedPreset}
                    elementCount={elementCount}
                    staggerConfig={customStagger}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface PresetCardProps {
  preset: AnimationPreset
  onPlay: (preset: AnimationPreset) => void
  onCopy: (preset: AnimationPreset) => void
  onExport: (preset: AnimationPreset) => void
}

function PresetCard({ preset, onPlay, onCopy, onExport }: PresetCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all hover:border-accent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{preset.icon}</span>
            <div>
              <CardTitle className="text-sm">{preset.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {preset.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {preset.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {preset.complexity}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {preset.totalDuration}s
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            className="flex-1"
            onClick={() => onPlay(preset)}
          >
            <Play size={14} className="mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(preset)}
          >
            <Copy size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExport(preset)}
          >
            <Download size={14} />
          </Button>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 border-t border-border">
                <MiniPreview preset={preset} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

interface MiniPreviewProps {
  preset: AnimationPreset
}

function MiniPreview({ preset }: MiniPreviewProps) {
  const [key, setKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setKey(prev => prev + 1)
    }, (preset.totalDuration + 1) * 1000)

    return () => clearInterval(interval)
  }, [preset.totalDuration])

  const element = preset.elements[0]
  const variants = {
    initial: element.from || {},
    animate: element.to || {}
  }

  return (
    <div className="h-20 bg-muted/30 rounded-lg flex items-center justify-center overflow-hidden">
      <motion.div
        key={key}
        className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg"
        initial={variants.initial}
        animate={variants.animate}
        transition={{
          duration: element.duration || 0.6,
          ease: element.easing === "linear" ? "linear" : "easeOut"
        }}
      />
    </div>
  )
}

interface ChoreographyCardProps {
  template: ChoreographyConfig
  onPlay: () => void
}

function ChoreographyCard({ template, onPlay }: ChoreographyCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {template.preset.icon} {template.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {template.elements.length} elements • {template.preset.name}
            </CardDescription>
          </div>
          <Button onClick={onPlay}>
            <Play size={16} className="mr-2" />
            Preview
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {template.elements.slice(0, 8).map((el, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {el}
              </Badge>
            ))}
            {template.elements.length > 8 && (
              <Badge variant="secondary" className="text-xs">
                +{template.elements.length - 8} more
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between p-2 bg-muted/30 rounded">
              <span className="text-muted-foreground">Stagger:</span>
              <span className="font-mono">{template.stagger?.amount}s</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/30 rounded">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-mono">{template.preset.totalDuration}s</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AnimationPlaygroundProps {
  preset: AnimationPreset | null
  elementCount: number
  staggerConfig: StaggerConfig
}

function AnimationPlayground({ preset, elementCount, staggerConfig }: AnimationPlaygroundProps) {
  if (!preset) {
    return (
      <div className="h-[400px] bg-muted/30 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-2">
          <Eye size={48} className="mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Select a preset to preview</p>
        </div>
      </div>
    )
  }

  const element = preset.elements[0]
  const variants = {
    initial: element.from || {},
    animate: element.to || {}
  }

  return (
    <div className="h-[400px] bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg flex items-center justify-center p-8 overflow-hidden">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: elementCount }).map((_, i) => (
          <motion.div
            key={i}
            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg shadow-lg"
            initial={variants.initial}
            animate={variants.animate}
            transition={{
              duration: element.duration || 0.6,
              ease: element.easing === "linear" ? "linear" : "easeOut",
              delay: i * (staggerConfig.amount || 0.1)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function generateFramerMotionCode(preset: AnimationPreset): string {
  const element = preset.elements[0]
  
  return `import { motion } from 'framer-motion'

// ${preset.name}
// ${preset.description}

const variants = {
  initial: ${JSON.stringify(element.from || {}, null, 2)},
  animate: ${JSON.stringify(element.to || {}, null, 2)}
}

export function AnimatedComponent() {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      transition={{
        duration: ${element.duration || 0.6},
        ease: "${element.easing || 'easeOut'}"${element.repeat ? `,
        repeat: ${typeof element.repeat === 'string' ? `"${element.repeat}"` : element.repeat}` : ''}${element.repeatType ? `,
        repeatType: "${element.repeatType}"` : ''}
      }}
    >
      {/* Your content */}
    </motion.div>
  )
}

// For staggered animations:
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: ${preset.staggerDelay || 0.1}
    }
  }
}

export function StaggeredList() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
    >
      {items.map((item, i) => (
        <motion.div key={i} variants={variants}>
          {item}
        </motion.div>
      ))}
    </motion.div>
  )
}`
}
