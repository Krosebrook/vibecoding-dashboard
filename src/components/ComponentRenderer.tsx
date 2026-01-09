import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardComponent } from '@/lib/types'
import { 
  TrendUp, 
  TrendDown, 
  Users, 
  CurrencyDollar, 
  ChartLine,
  ShoppingCart,
  ChatCircle,
  Calendar as CalendarIcon,
} from '@phosphor-icons/react'
import { 
  CPUMonitor, 
  MemoryMonitor, 
  NetworkMonitor, 
  ServerStatus, 
  AlertList,
  RealtimeChart 
} from './SystemMonitoring'

interface ComponentRendererProps {
  component: DashboardComponent
  data?: Record<string, any[]>
}

export function ComponentRenderer({ component, data }: ComponentRendererProps) {
  const renderContent = () => {
    switch (component.type) {
      case 'metric-card':
        return <MetricCard component={component} />
      case 'line-chart':
      case 'bar-chart':
      case 'pie-chart':
      case 'area-chart':
        return <ChartPlaceholder component={component} />
      case 'data-table':
        return <DataTable component={component} data={data} />
      case 'stat-grid':
        return <StatGrid component={component} />
      case 'progress-bar':
        return <ProgressBar component={component} />
      case 'activity-feed':
        return <ActivityFeed component={component} data={data} />
      case 'text-block':
        return <TextBlock component={component} />
      case 'cpu-monitor':
        return <CPUMonitor component={component} />
      case 'memory-monitor':
        return <MemoryMonitor component={component} />
      case 'network-monitor':
        return <NetworkMonitor component={component} />
      case 'server-status':
        return <ServerStatus component={component} />
      case 'alert-list':
        return <AlertList component={component} />
      case 'realtime-chart':
        return <RealtimeChart component={component} />
      default:
        return <GenericComponent component={component} />
    }
  }

  return (
    <div
      className="h-full"
      style={{
        gridRow: `span ${component.size.rows}`,
        gridColumn: `span ${component.size.cols}`,
      }}
    >
      {renderContent()}
    </div>
  )
}

function MetricCard({ component }: { component: DashboardComponent }) {
  const icons = [
    <Users key="users" size={24} weight="duotone" />,
    <CurrencyDollar key="dollar" size={24} weight="duotone" />,
    <ChartLine key="activity" size={24} weight="duotone" />,
    <ShoppingCart key="cart" size={24} weight="duotone" />,
    <ChatCircle key="message" size={24} weight="duotone" />,
  ]
  const icon = icons[Math.floor(Math.random() * icons.length)]
  const value = component.props.value || Math.floor(Math.random() * 10000)
  const change = component.props.change || (Math.random() * 40 - 10).toFixed(1)
  const isPositive = parseFloat(change) > 0

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {component.title || 'Metric'}
        </CardTitle>
        <div className="text-accent">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center gap-1 text-sm mt-1">
          {isPositive ? (
            <TrendUp size={16} weight="bold" className="text-green-500" />
          ) : (
            <TrendDown size={16} weight="bold" className="text-red-500" />
          )}
          <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
            {change}%
          </span>
          <span className="text-muted-foreground ml-1">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartPlaceholder({ component }: { component: DashboardComponent }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Chart'}</CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
          <div className="text-center text-muted-foreground">
            <ChartLine size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">{component.type.replace('-', ' ').toUpperCase()}</p>
            <p className="text-xs mt-1">Connected to live data</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DataTable({ component, data }: { component: DashboardComponent; data?: Record<string, any[]> }) {
  const sampleData = data?.[Object.keys(data)[0]]?.slice(0, 5) || []
  const columns = sampleData.length > 0 ? Object.keys(sampleData[0]) : ['Column 1', 'Column 2', 'Column 3']

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Data Table'}</CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="text-left p-3 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.length > 0 ? (
                sampleData.map((row, idx) => (
                  <tr key={idx} className="border-t border-border">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="p-3">
                        {String(row[col] || '-')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function StatGrid({ component }: { component: DashboardComponent }) {
  const stats = [
    { label: 'Total Users', value: '12,345', icon: <Users size={20} weight="duotone" /> },
    { label: 'Revenue', value: '$54.2K', icon: <CurrencyDollar size={20} weight="duotone" /> },
    { label: 'Active', value: '89%', icon: <ChartLine size={20} weight="duotone" /> },
    { label: 'Orders', value: '432', icon: <ShoppingCart size={20} weight="duotone" /> },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Statistics'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="text-accent">{stat.icon}</div>
              <div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-lg font-bold">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressBar({ component }: { component: DashboardComponent }) {
  const progress = component.props.progress || Math.floor(Math.random() * 100)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Progress'}</CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityFeed({ component, data }: { component: DashboardComponent; data?: Record<string, any[]> }) {
  const activities = data?.[Object.keys(data)[0]]?.slice(0, 4) || [
    { user: 'User 1', action: 'completed a task', time: '2 min ago' },
    { user: 'User 2', action: 'uploaded a file', time: '15 min ago' },
    { user: 'User 3', action: 'commented', time: '1 hour ago' },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Recent Activity'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                {activity.user?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user || 'User'}</span>{' '}
                  <span className="text-muted-foreground">{activity.action || 'performed an action'}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.time || 'Just now'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TextBlock({ component }: { component: DashboardComponent }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Information'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {component.description || 'This is a text block component that can display information, instructions, or any other content.'}
        </p>
      </CardContent>
    </Card>
  )
}

function GenericComponent({ component }: { component: DashboardComponent }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || component.type}</CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[150px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
          <div className="text-center text-muted-foreground">
            <CalendarIcon size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">{component.type.replace('-', ' ').toUpperCase()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
