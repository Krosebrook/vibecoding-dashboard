import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DashboardComponent } from '@/lib/types'
import { ArrowLeft, CaretRight, Table as TableIcon } from '@phosphor-icons/react'
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
import { motion, AnimatePresence } from 'framer-motion'

interface InteractiveChartProps {
  component: DashboardComponent
  data?: Record<string, any[]>
}

interface DrillDownLevel {
  name: string
  data: any[]
  context: any
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

function DrillDownBreadcrumb({ levels, onNavigate }: { levels: DrillDownLevel[], onNavigate: (index: number) => void }) {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(-1)}
        className="h-7 px-2"
      >
        <ArrowLeft size={14} className="mr-1" />
        Overview
      </Button>
      {levels.map((level, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <CaretRight size={14} className="text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(idx)}
            className="h-7 px-2"
          >
            {level.name}
          </Button>
        </div>
      ))}
    </div>
  )
}

function DrillDownDataTable({ data, onClose }: { data: any[], onClose: () => void }) {
  if (!data || data.length === 0) return null

  const keys = Object.keys(data[0])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TableIcon size={18} className="text-accent" />
          <span className="text-sm font-semibold">Detailed View</span>
          <Badge variant="secondary">{data.length} records</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft size={14} className="mr-1" />
          Back to Chart
        </Button>
      </div>
      <ScrollArea className="h-[240px] rounded-lg border border-border">
        <div className="relative">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card border-b border-border">
              <tr>
                {keys.map(key => (
                  <th key={key} className="text-left p-2 font-semibold">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-accent/5">
                  {keys.map(key => (
                    <td key={key} className="p-2">
                      {typeof row[key] === 'number' 
                        ? row[key].toLocaleString()
                        : String(row[key])
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </motion.div>
  )
}

function CustomTooltip({ active, payload, label, hint }: any) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-[oklch(0.25_0.01_260)] border border-[oklch(0.35_0.02_260)] rounded-lg p-3 shadow-lg">
      <p className="text-[oklch(0.85_0.01_260)] font-semibold text-xs mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-[oklch(0.85_0.01_260)] text-xs">
          <span style={{ color: entry.color }}>{entry.name}:</span> {entry.value.toLocaleString()}
        </p>
      ))}
      {hint && (
        <p className="text-[oklch(0.75_0.15_195)] text-[10px] mt-2 italic border-t border-border pt-2">
          💡 {hint}
        </p>
      )}
    </div>
  )
}

function generateDrillDownData(parentData: any, parentKey: string) {
  const days = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
  return days.map(day => {
    const baseValue = parentData.value || parentData.sales || parentData.revenue || 1000
    const variance = 0.7 + Math.random() * 0.6
    return {
      [parentKey]: day,
      value: Math.floor(baseValue / 4 * variance),
      breakdown: Math.floor(baseValue / 4 * variance * 0.8),
      target: Math.floor(baseValue / 4),
    }
  })
}

function generateCategoryDrillDown(parentData: any, parentKey: string) {
  const subcategories = ['Sub A', 'Sub B', 'Sub C', 'Sub D']
  return subcategories.map(sub => {
    const baseValue = parentData.value || parentData.sales || parentData.revenue || 1000
    const percentage = Math.random()
    return {
      [parentKey]: sub,
      value: Math.floor(baseValue * percentage),
      count: Math.floor(Math.random() * 100) + 10,
    }
  })
}

export function InteractiveLineChart({ component, data }: InteractiveChartProps) {
  const dataKey = component.props?.dataKey
  const chartData = dataKey && data?.[dataKey] ? data[dataKey] : generateTimeSeriesData()
  
  const xAxisKey = component.props?.xAxis || 'date' || 'name' || 'month' || Object.keys(chartData[0] || {})[0]
  const yAxisKeys = component.props?.yAxis || detectNumericKeys(chartData)

  const [drillDownStack, setDrillDownStack] = useState<DrillDownLevel[]>([])
  const [showDataTable, setShowDataTable] = useState(false)

  const handlePointClick = (data: any) => {
    const drillDownData = generateDrillDownData(data, xAxisKey)
    setDrillDownStack(prev => [...prev, {
      name: data[xAxisKey],
      data: drillDownData,
      context: data
    }])
  }

  const handleNavigate = (index: number) => {
    if (index === -1) {
      setDrillDownStack([])
      setShowDataTable(false)
    } else {
      setDrillDownStack(prev => prev.slice(0, index + 1))
      setShowDataTable(false)
    }
  }

  const currentData = drillDownStack.length > 0 
    ? drillDownStack[drillDownStack.length - 1].data 
    : chartData

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{component.title || 'Line Chart'}</span>
          {drillDownStack.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Drill-down active
            </Badge>
          )}
        </CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {drillDownStack.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DrillDownBreadcrumb levels={drillDownStack} onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>

        {showDataTable ? (
          <DrillDownDataTable 
            data={currentData} 
            onClose={() => setShowDataTable(false)} 
          />
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDataTable(true)}
                className="h-7 text-xs"
              >
                <TableIcon size={14} className="mr-1" />
                View Table
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  content={<CustomTooltip hint="Click to drill down" />}
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
                    activeDot={{ 
                      r: 8, 
                      onClick: (e: any) => {
                        if (e && e.payload) {
                          handlePointClick(e.payload)
                        }
                      },
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function InteractiveBarChart({ component, data }: InteractiveChartProps) {
  const dataKey = component.props?.dataKey
  const chartData = dataKey && data?.[dataKey] ? data[dataKey] : generateCategoryData()
  
  const xAxisKey = component.props?.xAxis || 'name' || 'category' || 'month' || Object.keys(chartData[0] || {})[0]
  const yAxisKeys = component.props?.yAxis || detectNumericKeys(chartData)

  const [drillDownStack, setDrillDownStack] = useState<DrillDownLevel[]>([])
  const [showDataTable, setShowDataTable] = useState(false)

  const handleBarClick = (data: any) => {
    const drillDownData = generateCategoryDrillDown(data, 'subcategory')
    setDrillDownStack(prev => [...prev, {
      name: data[xAxisKey],
      data: drillDownData,
      context: data
    }])
  }

  const handleNavigate = (index: number) => {
    if (index === -1) {
      setDrillDownStack([])
      setShowDataTable(false)
    } else {
      setDrillDownStack(prev => prev.slice(0, index + 1))
      setShowDataTable(false)
    }
  }

  const currentData = drillDownStack.length > 0 
    ? drillDownStack[drillDownStack.length - 1].data 
    : chartData
  
  const currentXKey = drillDownStack.length > 0 ? 'subcategory' : xAxisKey

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{component.title || 'Bar Chart'}</span>
          {drillDownStack.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Drill-down active
            </Badge>
          )}
        </CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {drillDownStack.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DrillDownBreadcrumb levels={drillDownStack} onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>

        {showDataTable ? (
          <DrillDownDataTable 
            data={currentData} 
            onClose={() => setShowDataTable(false)} 
          />
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDataTable(true)}
                className="h-7 text-xs"
              >
                <TableIcon size={14} className="mr-1" />
                View Table
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.02 260)" opacity={0.5} />
                <XAxis 
                  dataKey={currentXKey} 
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
                  content={<CustomTooltip hint="Click bar to drill down" />}
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
                    onClick={(data: any) => handleBarClick(data)}
                    cursor="pointer"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function InteractiveAreaChart({ component, data }: InteractiveChartProps) {
  const dataKey = component.props?.dataKey
  const chartData = dataKey && data?.[dataKey] ? data[dataKey] : generateTimeSeriesData()
  
  const xAxisKey = component.props?.xAxis || 'date' || 'name' || 'month' || Object.keys(chartData[0] || {})[0]
  const yAxisKeys = component.props?.yAxis || detectNumericKeys(chartData)

  const [drillDownStack, setDrillDownStack] = useState<DrillDownLevel[]>([])
  const [showDataTable, setShowDataTable] = useState(false)

  const handleAreaClick = (data: any) => {
    if (!data || !data.activePayload || !data.activePayload[0]) return
    const clickedData = data.activePayload[0].payload
    const drillDownData = generateDrillDownData(clickedData, xAxisKey)
    setDrillDownStack(prev => [...prev, {
      name: clickedData[xAxisKey],
      data: drillDownData,
      context: clickedData
    }])
  }

  const handleNavigate = (index: number) => {
    if (index === -1) {
      setDrillDownStack([])
      setShowDataTable(false)
    } else {
      setDrillDownStack(prev => prev.slice(0, index + 1))
      setShowDataTable(false)
    }
  }

  const currentData = drillDownStack.length > 0 
    ? drillDownStack[drillDownStack.length - 1].data 
    : chartData

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{component.title || 'Area Chart'}</span>
          {drillDownStack.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Drill-down active
            </Badge>
          )}
        </CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {drillDownStack.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DrillDownBreadcrumb levels={drillDownStack} onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>

        {showDataTable ? (
          <DrillDownDataTable 
            data={currentData} 
            onClose={() => setShowDataTable(false)} 
          />
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDataTable(true)}
                className="h-7 text-xs"
              >
                <TableIcon size={14} className="mr-1" />
                View Table
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart 
                data={currentData} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                onClick={handleAreaClick}
                style={{ cursor: 'pointer' }}
              >
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
                  content={<CustomTooltip hint="Click area to drill down" />}
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
          </>
        )}
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
  const [drillDownStack, setDrillDownStack] = useState<DrillDownLevel[]>([])
  const [showDataTable, setShowDataTable] = useState(false)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  const handlePieClick = (data: any) => {
    const drillDownData = generateCategoryDrillDown(data, 'segment')
    setDrillDownStack(prev => [...prev, {
      name: data[nameKey],
      data: drillDownData,
      context: data
    }])
  }

  const handleNavigate = (index: number) => {
    if (index === -1) {
      setDrillDownStack([])
      setShowDataTable(false)
    } else {
      setDrillDownStack(prev => prev.slice(0, index + 1))
      setShowDataTable(false)
    }
  }

  const currentData = drillDownStack.length > 0 
    ? drillDownStack[drillDownStack.length - 1].data 
    : chartData
  
  const currentNameKey = drillDownStack.length > 0 ? 'segment' : nameKey

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{component.title || 'Pie Chart'}</span>
          {drillDownStack.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Drill-down active
            </Badge>
          )}
        </CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {drillDownStack.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DrillDownBreadcrumb levels={drillDownStack} onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>

        {showDataTable ? (
          <DrillDownDataTable 
            data={currentData} 
            onClose={() => setShowDataTable(false)} 
          />
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDataTable(true)}
                className="h-7 text-xs"
              >
                <TableIcon size={14} className="mr-1" />
                View Table
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry[currentNameKey]}: ${entry[valueKey]}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey={valueKey}
                  nameKey={currentNameKey}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  onClick={(data: any) => handlePieClick(data)}
                  cursor="pointer"
                >
                  {currentData.map((entry, index) => (
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
                  content={<CustomTooltip hint="Click segment to drill down" />}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  verticalAlign="bottom"
                  height={36}
                />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
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

  const [drillDownStack, setDrillDownStack] = useState<DrillDownLevel[]>([])
  const [showDataTable, setShowDataTable] = useState(false)

  const handleChartClick = (data: any) => {
    if (!data || !data.activePayload || !data.activePayload[0]) return
    const clickedData = data.activePayload[0].payload
    const drillDownData = generateDrillDownData(clickedData, xAxisKey)
    setDrillDownStack(prev => [...prev, {
      name: clickedData[xAxisKey],
      data: drillDownData,
      context: clickedData
    }])
  }

  const handleNavigate = (index: number) => {
    if (index === -1) {
      setDrillDownStack([])
      setShowDataTable(false)
    } else {
      setDrillDownStack(prev => prev.slice(0, index + 1))
      setShowDataTable(false)
    }
  }

  const currentData = drillDownStack.length > 0 
    ? drillDownStack[drillDownStack.length - 1].data 
    : chartData

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{component.title || 'Multi-Type Chart'}</span>
          {drillDownStack.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Drill-down active
            </Badge>
          )}
        </CardTitle>
        {component.description && (
          <CardDescription>{component.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {drillDownStack.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DrillDownBreadcrumb levels={drillDownStack} onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>

        {showDataTable ? (
          <DrillDownDataTable 
            data={currentData} 
            onClose={() => setShowDataTable(false)} 
          />
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDataTable(true)}
                className="h-7 text-xs"
              >
                <TableIcon size={14} className="mr-1" />
                View Table
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart 
                data={currentData} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                onClick={handleChartClick}
                style={{ cursor: 'pointer' }}
              >
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
                  content={<CustomTooltip hint="Click to drill down" />}
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
          </>
        )}
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
