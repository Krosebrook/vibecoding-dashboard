import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardComponent } from '@/lib/types'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis,
} from 'recharts'

interface InteractiveChartProps {
  component: DashboardComponent
  data?: Record<string, any[]>
}

const CHART_COLORS = [
  'oklch(0.45 0.19 250)',
  'oklch(0.50 0.15 290)',
  'oklch(0.75 0.15 195)',
  'oklch(0.60 0.22 25)',
  'oklch(0.70 0.18 140)',
  'oklch(0.65 0.20 60)',
  'oklch(0.55 0.18 310)',
]

export function InteractiveLineChart({ component, data }: InteractiveChartProps) {
  const dataKey = component.props?.dataKey
  const chartData = dataKey && data?.[dataKey] ? data[dataKey] : generateTimeSeriesData()
  
  const xAxisKey = component.props?.xAxis || 'date' || 'name' || 'month' || Object.keys(chartData[0] || {})[0]
  const yAxisKeys = component.props?.yAxis || detectNumericKeys(chartData)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Line Chart'}</CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.02 260)" opacity={0.5} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)' }}
              fontSize={12}
            />
            <YAxis 
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)' }}
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'oklch(0.25 0.01 260)', 
                border: '1px solid oklch(0.35 0.02 260)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'oklch(0.85 0.01 260)' }}
              itemStyle={{ color: 'oklch(0.85 0.01 260)' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            {yAxisKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[idx % CHART_COLORS.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function InteractiveBarChart({ component, data }: InteractiveChartProps) {
  const dataKey = component.props?.dataKey
  const chartData = dataKey && data?.[dataKey] ? data[dataKey] : generateCategoryData()
  
  const xAxisKey = component.props?.xAxis || 'name' || 'category' || 'month' || Object.keys(chartData[0] || {})[0]
  const yAxisKeys = component.props?.yAxis || detectNumericKeys(chartData)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Bar Chart'}</CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.02 260)" opacity={0.5} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)' }}
              fontSize={12}
            />
            <YAxis 
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)' }}
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'oklch(0.25 0.01 260)', 
                border: '1px solid oklch(0.35 0.02 260)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'oklch(0.85 0.01 260)' }}
              itemStyle={{ color: 'oklch(0.85 0.01 260)' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            {yAxisKeys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function InteractiveAreaChart({ component, data }: InteractiveChartProps) {
  const dataKey = component.props?.dataKey
  const chartData = dataKey && data?.[dataKey] ? data[dataKey] : generateTimeSeriesData()
  
  const xAxisKey = component.props?.xAxis || 'date' || 'name' || 'month' || Object.keys(chartData[0] || {})[0]
  const yAxisKeys = component.props?.yAxis || detectNumericKeys(chartData)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Area Chart'}</CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              {yAxisKeys.map((key, idx) => (
                <linearGradient key={key} id={`color${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.02 260)" opacity={0.5} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)' }}
              fontSize={12}
            />
            <YAxis 
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)' }}
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'oklch(0.25 0.01 260)', 
                border: '1px solid oklch(0.35 0.02 260)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'oklch(0.85 0.01 260)' }}
              itemStyle={{ color: 'oklch(0.85 0.01 260)' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            {yAxisKeys.map((key, idx) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#color${idx})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function InteractivePieChart({ component, data }: InteractiveChartProps) {
  const dataKey = component.props?.dataKey
  const chartData = dataKey && data?.[dataKey] ? data[dataKey] : generatePieData()
  
  const nameKey = component.props?.nameKey || 'name' || 'category' || 'label'
  const valueKey = component.props?.valueKey || 'value' || 'count' || detectNumericKeys(chartData)[0]

  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Pie Chart'}</CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry[nameKey]}: ${entry[valueKey]}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={valueKey}
              nameKey={nameKey}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'oklch(0.25 0.01 260)', 
                border: '1px solid oklch(0.35 0.02 260)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'oklch(0.85 0.01 260)' }}
              itemStyle={{ color: 'oklch(0.85 0.01 260)' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function InteractiveRadarChart({ component, data }: InteractiveChartProps) {
  const dataKey = component.props?.dataKey
  const chartData = dataKey && data?.[dataKey] ? data[dataKey] : generateRadarData()
  
  const nameKey = component.props?.nameKey || 'subject' || 'category'
  const valueKeys = component.props?.valueKeys || detectNumericKeys(chartData)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Radar Chart'}</CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="oklch(0.35 0.02 260)" />
            <PolarAngleAxis 
              dataKey={nameKey}
              tick={{ fill: 'oklch(0.65 0.01 260)', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90}
              tick={{ fill: 'oklch(0.65 0.01 260)', fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'oklch(0.25 0.01 260)', 
                border: '1px solid oklch(0.35 0.02 260)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'oklch(0.85 0.01 260)' }}
              itemStyle={{ color: 'oklch(0.85 0.01 260)' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {valueKeys.map((key, idx) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                fillOpacity={0.5}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function InteractiveComposedChart({ component, data }: InteractiveChartProps) {
  const dataKey = component.props?.dataKey
  const chartData = dataKey && data?.[dataKey] ? data[dataKey] : generateTimeSeriesData()
  
  const xAxisKey = component.props?.xAxis || 'date' || 'name' || 'month' || Object.keys(chartData[0] || {})[0]
  const yAxisKeys = component.props?.yAxis || detectNumericKeys(chartData)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Multi-Type Chart'}</CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.02 260)" opacity={0.5} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)' }}
              fontSize={12}
            />
            <YAxis 
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)' }}
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'oklch(0.25 0.01 260)', 
                border: '1px solid oklch(0.35 0.02 260)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'oklch(0.85 0.01 260)' }}
              itemStyle={{ color: 'oklch(0.85 0.01 260)' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {yAxisKeys.map((key, idx) => {
              if (idx === 0) {
                return (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                )
              } else {
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[idx % CHART_COLORS.length], r: 4 }}
                  />
                )
              }
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function InteractiveScatterChart({ component, data }: InteractiveChartProps) {
  const dataKey = component.props?.dataKey
  const chartData = dataKey && data?.[dataKey] ? data[dataKey] : generateScatterData()
  
  const xAxisKey = component.props?.xAxis || 'x'
  const yAxisKey = component.props?.yAxis || 'y'
  const zAxisKey = component.props?.zAxis || 'z'

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{component.title || 'Scatter Chart'}</CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.02 260)" opacity={0.5} />
            <XAxis 
              type="number" 
              dataKey={xAxisKey}
              name={xAxisKey}
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)' }}
              fontSize={12}
            />
            <YAxis 
              type="number" 
              dataKey={yAxisKey}
              name={yAxisKey}
              stroke="oklch(0.65 0.01 260)"
              tick={{ fill: 'oklch(0.65 0.01 260)' }}
              fontSize={12}
            />
            <ZAxis 
              type="number" 
              dataKey={zAxisKey}
              range={[60, 400]}
              name={zAxisKey}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ 
                backgroundColor: 'oklch(0.25 0.01 260)', 
                border: '1px solid oklch(0.35 0.02 260)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'oklch(0.85 0.01 260)' }}
              itemStyle={{ color: 'oklch(0.85 0.01 260)' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Scatter 
              name="Data Points" 
              data={chartData} 
              fill={CHART_COLORS[0]}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function detectNumericKeys(data: any[]): string[] {
  if (!data || data.length === 0) return ['value']
  
  const firstItem = data[0]
  const numericKeys = Object.keys(firstItem).filter(key => {
    const value = firstItem[key]
    return typeof value === 'number' && key !== 'id' && key !== 'x' && key !== 'y' && key !== 'z'
  })
  
  return numericKeys.length > 0 ? numericKeys : ['value']
}

function generateTimeSeriesData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map(month => ({
    month,
    value: Math.floor(Math.random() * 5000) + 1000,
    target: Math.floor(Math.random() * 5000) + 1000,
  }))
}

function generateCategoryData() {
  const categories = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
  return categories.map(name => ({
    name,
    sales: Math.floor(Math.random() * 10000) + 2000,
    revenue: Math.floor(Math.random() * 50000) + 10000,
  }))
}

function generatePieData() {
  return [
    { name: 'Category A', value: 400 },
    { name: 'Category B', value: 300 },
    { name: 'Category C', value: 300 },
    { name: 'Category D', value: 200 },
    { name: 'Category E', value: 150 },
  ]
}

function generateRadarData() {
  return [
    { subject: 'Performance', A: 120, B: 110 },
    { subject: 'Quality', A: 98, B: 130 },
    { subject: 'Speed', A: 86, B: 130 },
    { subject: 'Reliability', A: 99, B: 100 },
    { subject: 'Security', A: 85, B: 90 },
    { subject: 'Scalability', A: 65, B: 85 },
  ]
}

function generateScatterData() {
  return Array.from({ length: 50 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 100,
  }))
}
