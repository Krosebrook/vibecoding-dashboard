import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BookOpen, MagnifyingGlass, Download, Star, Database } from '@phosphor-icons/react'
import { MigrationConfig, FieldMapping } from '@/lib/types'
import { toast } from 'sonner'

interface MigrationTemplate {
  id: string
  name: string
  description: string
  category: 'common' | 'cloud' | 'analytics' | 'ecommerce' | 'custom'
  sourceType: string
  destinationType: string
  mappingCount: number
  popular: boolean
  tags: string[]
}

interface TemplateLibraryProps {
  onTemplateSelect: (template: MigrationTemplate) => void
  onSaveAsTemplate?: (config: MigrationConfig) => void
}

const templates: MigrationTemplate[] = [
  {
    id: 'mysql-postgres',
    name: 'MySQL to PostgreSQL',
    description: 'Standard migration from MySQL to PostgreSQL with type conversions',
    category: 'common',
    sourceType: 'mysql',
    destinationType: 'postgresql',
    mappingCount: 12,
    popular: true,
    tags: ['relational', 'sql', 'common'],
  },
  {
    id: 'mongo-postgres',
    name: 'MongoDB to PostgreSQL',
    description: 'Document to relational migration with flattening and normalization',
    category: 'common',
    sourceType: 'mongodb',
    destinationType: 'postgresql',
    mappingCount: 8,
    popular: true,
    tags: ['nosql', 'sql', 'normalization'],
  },
  {
    id: 'csv-mysql',
    name: 'CSV to MySQL',
    description: 'Import CSV data files into MySQL database tables',
    category: 'common',
    sourceType: 'csv',
    destinationType: 'mysql',
    mappingCount: 15,
    popular: true,
    tags: ['import', 'file', 'common'],
  },
  {
    id: 'postgres-mongo',
    name: 'PostgreSQL to MongoDB',
    description: 'Relational to document migration with denormalization',
    category: 'cloud',
    sourceType: 'postgresql',
    destinationType: 'mongodb',
    mappingCount: 10,
    popular: false,
    tags: ['sql', 'nosql', 'denormalization'],
  },
  {
    id: 'mysql-analytics',
    name: 'MySQL to Analytics Warehouse',
    description: 'ETL pipeline for analytics and reporting databases',
    category: 'analytics',
    sourceType: 'mysql',
    destinationType: 'postgresql',
    mappingCount: 20,
    popular: false,
    tags: ['analytics', 'etl', 'warehouse'],
  },
  {
    id: 'ecommerce-orders',
    name: 'E-commerce Order Migration',
    description: 'Migrate order data between e-commerce platforms',
    category: 'ecommerce',
    sourceType: 'mysql',
    destinationType: 'postgresql',
    mappingCount: 25,
    popular: true,
    tags: ['ecommerce', 'orders', 'complex'],
  },
  {
    id: 'user-data-gdpr',
    name: 'User Data GDPR Migration',
    description: 'Privacy-aware user data migration with field filtering',
    category: 'common',
    sourceType: 'postgresql',
    destinationType: 'postgresql',
    mappingCount: 18,
    popular: false,
    tags: ['privacy', 'gdpr', 'compliance'],
  },
  {
    id: 'sqlite-cloud',
    name: 'SQLite to Cloud Database',
    description: 'Migrate local SQLite database to cloud PostgreSQL',
    category: 'cloud',
    sourceType: 'sqlite',
    destinationType: 'postgresql',
    mappingCount: 8,
    popular: false,
    tags: ['cloud', 'sqlite', 'migration'],
  },
]

export function TemplateLibrary({ onTemplateSelect, onSaveAsTemplate }: TemplateLibraryProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { value: 'all', label: 'All Templates', count: templates.length },
    { value: 'common', label: 'Common', count: templates.filter(t => t.category === 'common').length },
    { value: 'cloud', label: 'Cloud', count: templates.filter(t => t.category === 'cloud').length },
    { value: 'analytics', label: 'Analytics', count: templates.filter(t => t.category === 'analytics').length },
    { value: 'ecommerce', label: 'E-commerce', count: templates.filter(t => t.category === 'ecommerce').length },
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = search === '' || 
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleSelectTemplate = (template: MigrationTemplate) => {
    toast.success(`Template "${template.name}" loaded`)
    onTemplateSelect(template)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      common: 'bg-primary/20 text-primary border-primary/40',
      cloud: 'bg-info/20 text-info border-info/40',
      analytics: 'bg-accent/20 text-accent-foreground border-accent/40',
      ecommerce: 'bg-warning/20 text-warning border-warning/40',
      custom: 'bg-muted text-muted-foreground border-border',
    }
    return colors[category as keyof typeof colors] || colors.custom
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <BookOpen size={20} weight="duotone" className="text-primary" />
                </div>
                <CardTitle>Migration Templates</CardTitle>
              </div>
              <CardDescription>
                Pre-configured mapping templates for common migration scenarios
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="gap-2"
              >
                {category.label}
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          <ScrollArea className="h-[500px] pr-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredTemplates.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
                  <p>No templates found matching your criteria</p>
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className="p-5 hover:border-accent transition-all cursor-pointer group relative"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    {template.popular && (
                      <div className="absolute top-3 right-3">
                        <Star size={16} weight="fill" className="text-warning" />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{template.mappingCount} mappings</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <div className="flex items-center gap-2 text-xs font-mono flex-1">
                          <Database size={14} className="text-muted-foreground" />
                          <span className="text-muted-foreground">{template.sourceType}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-foreground font-semibold">{template.destinationType}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectTemplate(template)
                          }}
                        >
                          <Download size={14} />
                          Use
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs px-2 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredTemplates.length}</span> templates available
              </div>
              {onSaveAsTemplate && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Star size={16} />
                  Save Current as Template
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
