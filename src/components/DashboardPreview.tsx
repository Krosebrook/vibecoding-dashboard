import { DashboardConfig } from '@/lib/types'
import { ComponentRenderer } from './ComponentRenderer'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DashboardPreviewProps {
  config: DashboardConfig
}

export function DashboardPreview({ config }: DashboardPreviewProps) {
  return (
    <ScrollArea className="h-full">
      <div
        className="p-6"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${config.layout.columns}, 1fr)`,
          gap: `${config.layout.gap}px`,
          padding: `${config.layout.padding}px`,
        }}
      >
        {config.components.map((component) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            data={config.dataModel.seedData}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
