import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWebhook } from '@/hooks/use-webhook'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ChartLine, ChartBar, ChartPie, Clock } from '@phosphor-icons/react'

interface WebhookDashboardProps {
  webhookId: string
  webhookName: string
}

export function WebhookDashboard({ webhookId, webhookName }: WebhookDashboardProps) {
  const { events, latestEvent, isConnected } = useWebhook(webhookId)
  const [chartData, setChartData] = useState<any[]>([])
  const [eventTypes, setEventTypes] = useState<Record<string, number>>({})

  useEffect(() => {
    const timeSeriesData = events.slice(-20).map((event, index) => ({
      time: new Date(event.timestamp).toLocaleTimeString(),
      events: index + 1,
      timestamp: event.timestamp,
    }))
    setChartData(timeSeriesData)

    const types: Record<string, number> = {}
    events.forEach(event => {
      types[event.eventType] = (types[event.eventType] || 0) + 1
    })
    setEventTypes(types)
  }, [events])

  const eventTypePieData = Object.entries(eventTypes).map(([name, value]) => ({
    name,
    value,
  }))

  const COLORS = ['oklch(0.45 0.19 250)', 'oklch(0.50 0.15 290)', 'oklch(0.75 0.15 195)', 'oklch(0.60 0.22 25)']

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {webhookName}
                <Badge variant={isConnected ? 'default' : 'secondary'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Real-time webhook event analytics
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{events.length}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ChartLine size={18} weight="duotone" />
              Event Timeline
            </CardTitle>
            <CardDescription>Events received over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.02 260)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="oklch(0.65 0.01 260)" 
                    fontSize={10}
                  />
                  <YAxis stroke="oklch(0.65 0.01 260)" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.25 0.01 260)',
                      border: '1px solid oklch(0.35 0.02 260)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="events" 
                    stroke="oklch(0.75 0.15 195)" 
                    strokeWidth={2}
                    dot={{ fill: 'oklch(0.75 0.15 195)', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                No events yet. Send a test event to see data.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ChartPie size={18} weight="duotone" />
              Event Types
            </CardTitle>
            <CardDescription>Distribution by event type</CardDescription>
          </CardHeader>
          <CardContent>
            {eventTypePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={eventTypePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eventTypePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.25 0.01 260)',
                      border: '1px solid oklch(0.35 0.02 260)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                No events yet. Send a test event to see data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ChartBar size={18} weight="duotone" />
            Event Type Breakdown
          </CardTitle>
          <CardDescription>Count by event type</CardDescription>
        </CardHeader>
        <CardContent>
          {eventTypePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={eventTypePieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.02 260)" />
                <XAxis 
                  dataKey="name" 
                  stroke="oklch(0.65 0.01 260)" 
                  fontSize={10}
                />
                <YAxis stroke="oklch(0.65 0.01 260)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'oklch(0.25 0.01 260)',
                    border: '1px solid oklch(0.35 0.02 260)',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="oklch(0.45 0.19 250)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
              No events yet. Send a test event to see data.
            </div>
          )}
        </CardContent>
      </Card>

      {latestEvent && (
        <Card className="border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock size={18} weight="duotone" className="text-accent" />
              Latest Event
            </CardTitle>
            <CardDescription>Most recent webhook event received</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Event Type</div>
                <Badge className="mt-1">{latestEvent.eventType}</Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Received</div>
                <div className="text-sm font-mono mt-1">
                  {new Date(latestEvent.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Payload Preview</div>
              <pre className="text-xs font-mono bg-muted p-3 rounded-lg overflow-x-auto max-h-[200px]">
                {JSON.stringify(latestEvent.payload, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
