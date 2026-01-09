import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Lightbulb, MagnifyingGlass, Sparkle, FunnelSimple, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  transformPatterns, 
  transformCategories, 
  transformIndustries,
  getPatternsByCategory,
  getPatternsByIndustry,
  getPatternsByComplexity,
  searchPatterns,
  type TransformPattern
} from '@/lib/transform-patterns'

export function TransformPatternLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedComplexity, setSelectedComplexity] = useState<'all' | 'basic' | 'intermediate' | 'advanced'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyCode = (pattern: TransformPattern) => {
    navigator.clipboard.writeText(pattern.code)
    setCopiedId(pattern.id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success(`${pattern.name} copied to clipboard`)
  }

  const getFilteredPatterns = () => {
    let filtered = transformPatterns

    if (searchQuery) {
      filtered = searchPatterns(searchQuery)
    }

    if (selectedComplexity !== 'all') {
      filtered = filtered.filter(p => p.complexity === selectedComplexity)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    return filtered
  }

  const filteredPatterns = getFilteredPatterns()
  const categoriesInView = Array.from(new Set(filteredPatterns.map(p => p.category))).sort()

  const getComplexityColor = (complexity: 'basic' | 'intermediate' | 'advanced') => {
    switch (complexity) {
      case 'basic': return 'text-accent bg-accent/10'
      case 'intermediate': return 'text-primary bg-primary/10'
      case 'advanced': return 'text-secondary bg-secondary/10'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb size={20} weight="duotone" className="text-accent" />
              Transform Pattern Library
            </CardTitle>
            <CardDescription className="mt-2">
              {transformPatterns.length} industry-proven transformation patterns
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {filteredPatterns.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">
              <FunnelSimple size={16} className="mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="industry">
              <Sparkle size={16} className="mr-2" />
              Industry
            </TabsTrigger>
            <TabsTrigger value="search">
              <MagnifyingGlass size={16} className="mr-2" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <select
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {transformCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1">
                <Button
                  variant={selectedComplexity === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedComplexity('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedComplexity === 'basic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedComplexity('basic')}
                  className={selectedComplexity === 'basic' ? '' : 'hover:bg-accent/10'}
                >
                  Basic
                </Button>
                <Button
                  variant={selectedComplexity === 'intermediate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedComplexity('intermediate')}
                  className={selectedComplexity === 'intermediate' ? '' : 'hover:bg-primary/10'}
                >
                  Int.
                </Button>
                <Button
                  variant={selectedComplexity === 'advanced' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedComplexity('advanced')}
                  className={selectedComplexity === 'advanced' ? '' : 'hover:bg-secondary/10'}
                >
                  Adv.
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {categoriesInView.map(category => {
                  const patternsInCategory = filteredPatterns.filter(p => p.category === category)
                  return (
                    <div key={category}>
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 sticky top-0 bg-background py-2 border-b">
                        {category}
                        <Badge variant="outline" className="text-xs">
                          {patternsInCategory.length}
                        </Badge>
                      </h3>
                      <div className="grid gap-3">
                        {patternsInCategory.map((pattern) => (
                          <PatternCard
                            key={pattern.id}
                            pattern={pattern}
                            onCopy={() => copyCode(pattern)}
                            isCopied={copiedId === pattern.id}
                            getComplexityColor={getComplexityColor}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="industry" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {transformIndustries.map(industry => {
                  const patternsInIndustry = getPatternsByIndustry(industry)
                  return (
                    <div key={industry}>
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 sticky top-0 bg-background py-2 border-b">
                        <Sparkle size={16} weight="duotone" className="text-accent" />
                        {industry}
                        <Badge variant="outline" className="text-xs">
                          {patternsInIndustry.length}
                        </Badge>
                      </h3>
                      <div className="grid gap-3">
                        {patternsInIndustry.map((pattern) => (
                          <PatternCard
                            key={pattern.id}
                            pattern={pattern}
                            onCopy={() => copyCode(pattern)}
                            isCopied={copiedId === pattern.id}
                            getComplexityColor={getComplexityColor}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, use case, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[600px] pr-4">
              {searchQuery ? (
                <div className="space-y-3">
                  {filteredPatterns.length > 0 ? (
                    filteredPatterns.map((pattern) => (
                      <PatternCard
                        key={pattern.id}
                        pattern={pattern}
                        onCopy={() => copyCode(pattern)}
                        isCopied={copiedId === pattern.id}
                        getComplexityColor={getComplexityColor}
                        showCategory
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MagnifyingGlass size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No patterns found matching "{searchQuery}"</p>
                      <p className="text-sm mt-2">Try different keywords or browse by category</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MagnifyingGlass size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Start typing to search patterns</p>
                  <p className="text-sm mt-2">Search by name, description, use case, or tags</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface PatternCardProps {
  pattern: TransformPattern
  onCopy: () => void
  isCopied: boolean
  getComplexityColor: (complexity: 'basic' | 'intermediate' | 'advanced') => string
  showCategory?: boolean
}

function PatternCard({ pattern, onCopy, isCopied, getComplexityColor, showCategory }: PatternCardProps) {
  return (
    <div className="p-3 border rounded-lg hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-sm">{pattern.name}</span>
            <Badge className={`text-xs ${getComplexityColor(pattern.complexity)}`}>
              {pattern.complexity}
            </Badge>
            {pattern.industry && (
              <Badge variant="outline" className="text-xs">
                {pattern.industry}
              </Badge>
            )}
            {showCategory && (
              <Badge variant="secondary" className="text-xs">
                {pattern.category}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            {pattern.description}
          </div>
          <div className="text-xs text-foreground/70 italic">
            Use case: {pattern.useCase}
          </div>
        </div>
        <Button
          variant={isCopied ? "default" : "ghost"}
          size="sm"
          onClick={onCopy}
          className="flex-shrink-0"
        >
          {isCopied ? (
            <CheckCircle size={14} weight="fill" />
          ) : (
            <Copy size={14} />
          )}
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
          {pattern.code}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground mb-1 font-medium">Input:</div>
            <code className="text-primary break-all">{pattern.example.input}</code>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 font-medium">Output:</div>
            <code className="text-accent break-all">{pattern.example.output}</code>
          </div>
        </div>

        {pattern.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {pattern.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
