import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { textEasingCurves, textTransitionPresets } from '@/lib/text-animation-curves'
import { cn } from '@/lib/utils'

interface DemoScenario {
  id: string
  name: string
  description: string
  category: string
  icon: string
  elements: {
    text: string
    presetId: string
    delay: number
    style?: string
  }[]
}

const demoScenarios: DemoScenario[] = [
  {
    id: "hero-section",
    name: "Hero Section",
    description: "Classic hero section with headline and CTA",
    category: "landing-page",
    icon: "🎯",
    elements: [
      { text: "Transform Your Business", presetId: "split-word-cascade", delay: 0, style: "text-5xl font-bold mb-4" },
      { text: "with AI-Powered Solutions", presetId: "split-word-cascade", delay: 0.8, style: "text-3xl text-muted-foreground mb-8" },
      { text: "Get Started Today", presetId: "scale-punchy", delay: 1.6, style: "text-xl bg-primary text-primary-foreground px-8 py-4 rounded-lg inline-block" }
    ]
  },
  {
    id: "pricing-cards",
    name: "Pricing Cards",
    description: "Animated pricing tier headers",
    category: "e-commerce",
    icon: "💳",
    elements: [
      { text: "Basic", presetId: "slide-snappy", delay: 0, style: "text-2xl font-bold mb-2" },
      { text: "Professional", presetId: "slide-snappy", delay: 0.1, style: "text-2xl font-bold mb-2" },
      { text: "Enterprise", presetId: "slide-snappy", delay: 0.2, style: "text-2xl font-bold mb-2" }
    ]
  },
  {
    id: "feature-showcase",
    name: "Feature Showcase",
    description: "Product features with smooth reveals",
    category: "marketing",
    icon: "✨",
    elements: [
      { text: "Lightning Fast", presetId: "scale-dramatic", delay: 0, style: "text-3xl font-bold mb-2" },
      { text: "Ultra Secure", presetId: "scale-dramatic", delay: 0.3, style: "text-3xl font-bold mb-2" },
      { text: "Always Available", presetId: "scale-dramatic", delay: 0.6, style: "text-3xl font-bold mb-2" }
    ]
  },
  {
    id: "notification-toast",
    name: "Notification Toast",
    description: "System notification with attention-grabbing animation",
    category: "ui-component",
    icon: "🔔",
    elements: [
      { text: "Success!", presetId: "scale-punchy", delay: 0, style: "text-2xl font-bold text-green-500" },
      { text: "Your changes have been saved", presetId: "fade-smooth", delay: 0.2, style: "text-sm text-muted-foreground" }
    ]
  },
  {
    id: "loading-state",
    name: "Loading State",
    description: "Elegant loading message",
    category: "ui-component",
    icon: "⏳",
    elements: [
      { text: "Please wait", presetId: "fade-cinematic", delay: 0, style: "text-xl" },
      { text: "Loading your experience", presetId: "typewriter-mechanical", delay: 0.5, style: "text-sm text-muted-foreground" }
    ]
  },
  {
    id: "testimonial",
    name: "Testimonial Quote",
    description: "Customer testimonial with dramatic reveal",
    category: "marketing",
    icon: "💬",
    elements: [
      { text: "This changed everything for us", presetId: "reveal-curtain", delay: 0, style: "text-3xl italic mb-4" },
      { text: "— Sarah Johnson, CEO", presetId: "fade-smooth", delay: 1.0, style: "text-lg text-muted-foreground" }
    ]
  },
  {
    id: "countdown",
    name: "Countdown Timer",
    description: "Urgent countdown with punchy animation",
    category: "e-commerce",
    icon: "⏰",
    elements: [
      { text: "Limited Time Offer", presetId: "scale-punchy", delay: 0, style: "text-2xl font-bold text-red-500" },
      { text: "Ends in 24 hours", presetId: "elastic-bounce", delay: 0.3, style: "text-xl" }
    ]
  },
  {
    id: "blog-title",
    name: "Blog Article Title",
    description: "Elegant article title reveal",
    category: "content",
    icon: "📝",
    elements: [
      { text: "The Future of Design", presetId: "split-word-cascade", delay: 0, style: "text-4xl font-bold mb-4" },
      { text: "How modern tools are reshaping creativity", presetId: "fade-cinematic", delay: 0.8, style: "text-xl text-muted-foreground" }
    ]
  },
  {
    id: "error-message",
    name: "Error Alert",
    description: "Attention-grabbing error state",
    category: "ui-component",
    icon: "⚠️",
    elements: [
      { text: "Oops!", presetId: "rotate-bouncy", delay: 0, style: "text-3xl font-bold text-destructive" },
      { text: "Something went wrong. Please try again.", presetId: "slide-spring", delay: 0.3, style: "text-sm" }
    ]
  },
  {
    id: "welcome-message",
    name: "Welcome Screen",
    description: "Warm welcome animation sequence",
    category: "onboarding",
    icon: "👋",
    elements: [
      { text: "Welcome back", presetId: "fade-cinematic", delay: 0, style: "text-4xl font-bold mb-4" },
      { text: "Ready to continue where you left off?", presetId: "float-up", delay: 0.8, style: "text-xl text-muted-foreground" }
    ]
  },
  {
    id: "stats-counter",
    name: "Statistics Counter",
    description: "Impressive stats reveal",
    category: "marketing",
    icon: "📊",
    elements: [
      { text: "10,000+", presetId: "scale-dramatic", delay: 0, style: "text-5xl font-bold text-accent" },
      { text: "Happy Customers", presetId: "slide-snappy", delay: 0.4, style: "text-xl text-muted-foreground" }
    ]
  },
  {
    id: "cta-banner",
    name: "Call to Action Banner",
    description: "Conversion-focused CTA",
    category: "marketing",
    icon: "🎁",
    elements: [
      { text: "Don't miss out", presetId: "anticipate-slide", delay: 0, style: "text-2xl font-bold" },
      { text: "Join thousands of satisfied users today", presetId: "slide-spring", delay: 0.3, style: "text-lg mb-4" },
      { text: "Start Free Trial", presetId: "scale-punchy", delay: 0.6, style: "text-xl bg-accent text-accent-foreground px-6 py-3 rounded-lg inline-block" }
    ]
  }
]

export function TextAnimationShowcase() {
  const [activeScenario, setActiveScenario] = useState<DemoScenario>(demoScenarios[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

  const handlePlayScenario = (scenario: DemoScenario) => {
    setActiveScenario(scenario)
    setIsPlaying(true)
    setAnimationKey(prev => prev + 1)
    
    const maxDuration = Math.max(...scenario.elements.map(el => {
      const preset = textTransitionPresets.find(p => p.id === el.presetId)
      return el.delay + (preset?.duration || 0)
    }))
    
    setTimeout(() => setIsPlaying(false), maxDuration * 1000 + 500)
  }

  const renderScenarioPreview = () => {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <div key={animationKey} className="text-center max-w-3xl">
              {activeScenario.elements.map((element, index) => {
                const preset = textTransitionPresets.find(p => p.id === element.presetId)
                if (!preset) return null
                
                const curve = textEasingCurves[preset.easing]
                
                if (preset.characterDelay) {
                  return (
                    <div key={index} className={cn("mb-4", element.style)}>
                      {element.text.split('').map((char, charIndex) => (
                        <motion.span
                          key={`${animationKey}-${index}-${charIndex}`}
                          initial={preset.properties.from}
                          animate={preset.properties.to}
                          transition={{
                            duration: preset.duration,
                            delay: element.delay + (charIndex * (preset.characterDelay || 0)),
                            ease: curve.bezier as [number, number, number, number]
                          }}
                          style={{ display: 'inline-block' }}
                        >
                          {char === ' ' ? '\u00A0' : char}
                        </motion.span>
                      ))}
                    </div>
                  )
                }
                
                if (preset.wordDelay) {
                  return (
                    <div key={index} className={cn("mb-4", element.style)}>
                      {element.text.split(' ').map((word, wordIndex) => (
                        <span key={wordIndex}>
                          <motion.span
                            key={`${animationKey}-${index}-${wordIndex}`}
                            initial={preset.properties.from}
                            animate={preset.properties.to}
                            transition={{
                              duration: preset.duration,
                              delay: element.delay + (wordIndex * (preset.wordDelay || 0)),
                              ease: curve.bezier as [number, number, number, number]
                            }}
                            style={{ display: 'inline-block' }}
                          >
                            {word}
                          </motion.span>
                          {wordIndex < element.text.split(' ').length - 1 && ' '}
                        </span>
                      ))}
                    </div>
                  )
                }
                
                return (
                  <motion.div
                    key={`${animationKey}-${index}`}
                    initial={preset.properties.from}
                    animate={preset.properties.to}
                    transition={{
                      duration: preset.duration,
                      delay: element.delay,
                      ease: curve.bezier as [number, number, number, number]
                    }}
                    className={cn("mb-4", element.style)}
                  >
                    {element.text}
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div key="placeholder" className="text-center">
              <div className="text-muted-foreground mb-4">
                Select a scenario and click Play to see the animation
              </div>
              <Button onClick={() => handlePlayScenario(activeScenario)}>
                <Play size={16} className="mr-2" weight="fill" />
                Play Preview
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const categories = Array.from(new Set(demoScenarios.map(s => s.category)))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎪</span>
          Text Animation Showcase
        </CardTitle>
        <CardDescription>
          Real-world examples of text animations in common UI scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0]} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category.replace('-', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2 pr-4">
                      {demoScenarios
                        .filter(scenario => scenario.category === category)
                        .map(scenario => (
                          <button
                            key={scenario.id}
                            onClick={() => setActiveScenario(scenario)}
                            className={cn(
                              "w-full p-4 rounded-lg border-2 transition-all text-left",
                              activeScenario.id === scenario.id
                                ? "border-accent bg-accent/10"
                                : "border-border hover:border-accent/50"
                            )}
                          >
                            <div className="flex items-start gap-3 mb-2">
                              <span className="text-2xl">{scenario.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm">{scenario.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {scenario.description}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {scenario.elements.map((el, index) => {
                                const preset = textTransitionPresets.find(p => p.id === el.presetId)
                                return preset ? (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {preset.icon} {preset.name}
                                  </Badge>
                                ) : null
                              })}
                            </div>
                          </button>
                        ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <span className="text-2xl">{activeScenario.icon}</span>
                            {activeScenario.name}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {activeScenario.description}
                          </CardDescription>
                        </div>
                        <Button 
                          onClick={() => handlePlayScenario(activeScenario)}
                          disabled={isPlaying}
                        >
                          <Play size={16} className="mr-2" weight="fill" />
                          Play
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-muted/30 rounded-lg border-2 border-border">
                        {renderScenarioPreview()}
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-semibold">Animation Sequence</div>
                        {activeScenario.elements.map((element, index) => {
                          const preset = textTransitionPresets.find(p => p.id === element.presetId)
                          if (!preset) return null
                          
                          return (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex-shrink-0 w-16 text-center">
                                <div className="text-xs text-muted-foreground">Step {index + 1}</div>
                                <div className="text-sm font-mono font-semibold">
                                  {element.delay.toFixed(1)}s
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm mb-1">{element.text}</div>
                                <div className="flex gap-1 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    {preset.icon} {preset.name}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {preset.easing}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {preset.duration}s
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
