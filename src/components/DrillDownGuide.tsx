import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartLine, ChartBar, ChartPie, Mouse, Table as TableIcon, ArrowsClockwise } from '@phosphor-icons/react'

export function DrillDownGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowsClockwise size={20} weight="duotone" className="text-accent" />
          Drill-Down Feature Guide
        </CardTitle>
        <CardDescription>
          Explore your data at multiple levels with interactive drill-down
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <Mouse size={20} className="text-accent mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">Click to Explore</h4>
              <p className="text-xs text-muted-foreground">
                Click on any data point, bar, or pie segment to drill down into detailed breakdowns
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <ChartLine size={20} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">Line & Area Charts</h4>
              <p className="text-xs text-muted-foreground">
                Click on data points to see weekly breakdowns and trends over time
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
            <ChartBar size={20} className="text-secondary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">Bar Charts</h4>
              <p className="text-xs text-muted-foreground">
                Click on bars to explore subcategories and detailed metrics
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <ChartPie size={20} className="text-accent mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">Pie Charts</h4>
              <p className="text-xs text-muted-foreground">
                Click on segments to drill into sub-segments and distribution details
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border">
            <TableIcon size={20} className="text-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1">Table View</h4>
              <p className="text-xs text-muted-foreground">
                Click "View Table" to see all data in a detailed tabular format at any drill level
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border space-y-2">
          <h4 className="text-sm font-semibold">Navigation</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              Breadcrumbs to navigate back
            </Badge>
            <Badge variant="outline" className="text-xs">
              Multiple drill-down levels
            </Badge>
            <Badge variant="outline" className="text-xs">
              Preserve context throughout
            </Badge>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            💡 Tip: Look for the "Drill-down active" badge when exploring deeper data levels
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
