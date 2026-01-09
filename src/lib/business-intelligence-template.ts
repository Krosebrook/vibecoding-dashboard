import { DashboardConfig } from './types'

export const businessIntelligenceDashboard: DashboardConfig = {
  id: 'business-intelligence-preconfigured',
  name: 'Business Intelligence Dashboard',
  description: 'Comprehensive business analytics with interactive charts showcasing all visualization types',
  type: 'business-intelligence',
  createdAt: new Date().toISOString(),
  components: [
    {
      id: 'revenue-metric',
      type: 'metric-card',
      title: 'Total Revenue',
      description: 'Year to date',
      position: { row: 0, col: 0 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 2847593,
        prefix: '$',
        trend: 'up',
        trendValue: '28.4%',
        icon: 'currency',
      },
    },
    {
      id: 'customers-metric',
      type: 'metric-card',
      title: 'Active Customers',
      description: 'Currently engaged',
      position: { row: 0, col: 3 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 15847,
        trend: 'up',
        trendValue: '12.3%',
        icon: 'users',
      },
    },
    {
      id: 'conversion-metric',
      type: 'metric-card',
      title: 'Conversion Rate',
      description: 'This quarter',
      position: { row: 0, col: 6 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 24.7,
        suffix: '%',
        trend: 'up',
        trendValue: '5.2%',
        icon: 'target',
      },
    },
    {
      id: 'satisfaction-metric',
      type: 'metric-card',
      title: 'Customer Satisfaction',
      description: 'NPS score',
      position: { row: 0, col: 9 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 87,
        suffix: '/100',
        trend: 'up',
        trendValue: '3.1%',
        icon: 'heart',
      },
    },
    {
      id: 'revenue-area-chart',
      type: 'area-chart',
      title: 'Revenue Trends',
      description: 'Monthly revenue vs target',
      position: { row: 1, col: 0 },
      size: { rows: 2, cols: 6 },
      props: {
        dataKey: 'revenueMonthly',
        xAxis: 'month',
        yAxis: ['actual', 'target'],
      },
    },
    {
      id: 'category-bar-chart',
      type: 'bar-chart',
      title: 'Sales by Category',
      description: 'Top performing product categories',
      position: { row: 1, col: 6 },
      size: { rows: 2, cols: 6 },
      props: {
        dataKey: 'categoryPerformance',
        xAxis: 'category',
        yAxis: ['units', 'revenue'],
      },
    },
    {
      id: 'market-share-pie',
      type: 'pie-chart',
      title: 'Market Share',
      description: 'By region',
      position: { row: 3, col: 0 },
      size: { rows: 2, cols: 4 },
      props: {
        dataKey: 'marketShare',
        nameKey: 'region',
        valueKey: 'share',
      },
    },
    {
      id: 'performance-radar',
      type: 'radar-chart',
      title: 'Performance Metrics',
      description: 'Multi-dimensional analysis',
      position: { row: 3, col: 4 },
      size: { rows: 2, cols: 4 },
      props: {
        dataKey: 'performanceMetrics',
        nameKey: 'metric',
        valueKeys: ['current', 'target'],
      },
    },
    {
      id: 'growth-line-chart',
      type: 'line-chart',
      title: 'Growth Indicators',
      description: 'Key metrics over time',
      position: { row: 3, col: 8 },
      size: { rows: 2, cols: 4 },
      props: {
        dataKey: 'growthIndicators',
        xAxis: 'quarter',
        yAxis: ['customers', 'orders', 'retention'],
      },
    },
    {
      id: 'customer-segments-composed',
      type: 'composed-chart',
      title: 'Customer Segmentation',
      description: 'Multi-metric comparison',
      position: { row: 5, col: 0 },
      size: { rows: 2, cols: 8 },
      props: {
        dataKey: 'customerSegments',
        xAxis: 'segment',
        yAxis: ['count', 'value', 'ltv'],
      },
    },
    {
      id: 'efficiency-scatter',
      type: 'scatter-chart',
      title: 'Efficiency Analysis',
      description: 'Cost vs Revenue correlation',
      position: { row: 5, col: 8 },
      size: { rows: 2, cols: 4 },
      props: {
        dataKey: 'efficiencyData',
        xAxis: 'cost',
        yAxis: 'revenue',
        zAxis: 'profit',
      },
    },
  ],
  layout: {
    type: 'grid',
    columns: 12,
    gap: 24,
    padding: 24,
  },
  theme: {
    primaryColor: 'oklch(0.45 0.19 250)',
    accentColor: 'oklch(0.75 0.15 195)',
    backgroundColor: 'oklch(0.15 0.01 260)',
    textColor: 'oklch(0.85 0.01 260)',
    borderRadius: 12,
  },
  dataModel: {
    entities: [
      {
        name: 'Revenue',
        fields: [
          { name: 'month', type: 'string', required: true },
          { name: 'actual', type: 'number', required: true },
          { name: 'target', type: 'number', required: true },
        ],
      },
      {
        name: 'Category',
        fields: [
          { name: 'category', type: 'string', required: true },
          { name: 'units', type: 'number', required: true },
          { name: 'revenue', type: 'number', required: true },
        ],
      },
    ],
    seedData: {
      revenueMonthly: [
        { month: 'Jan', actual: 185000, target: 180000 },
        { month: 'Feb', actual: 192000, target: 190000 },
        { month: 'Mar', actual: 221000, target: 200000 },
        { month: 'Apr', actual: 234000, target: 220000 },
        { month: 'May', actual: 256000, target: 240000 },
        { month: 'Jun', actual: 278000, target: 260000 },
        { month: 'Jul', actual: 295000, target: 280000 },
        { month: 'Aug', actual: 312000, target: 300000 },
        { month: 'Sep', actual: 289000, target: 310000 },
        { month: 'Oct', actual: 325000, target: 320000 },
        { month: 'Nov', actual: 342000, target: 340000 },
        { month: 'Dec', actual: 378000, target: 360000 },
      ],
      categoryPerformance: [
        { category: 'Electronics', units: 4523, revenue: 456789 },
        { category: 'Clothing', units: 8912, revenue: 287654 },
        { category: 'Home & Garden', units: 3421, revenue: 198432 },
        { category: 'Sports', units: 2876, revenue: 145678 },
        { category: 'Books', units: 5234, revenue: 89345 },
        { category: 'Toys', units: 3890, revenue: 123456 },
      ],
      marketShare: [
        { region: 'North America', share: 4235 },
        { region: 'Europe', share: 3421 },
        { region: 'Asia Pacific', share: 5678 },
        { region: 'Latin America', share: 1234 },
        { region: 'Middle East', share: 987 },
        { region: 'Africa', share: 765 },
      ],
      performanceMetrics: [
        { metric: 'Sales', current: 92, target: 85 },
        { metric: 'Marketing', current: 78, target: 80 },
        { metric: 'Operations', current: 88, target: 90 },
        { metric: 'Customer Service', current: 95, target: 85 },
        { metric: 'Product Quality', current: 89, target: 90 },
        { metric: 'Innovation', current: 82, target: 85 },
      ],
      growthIndicators: [
        { quarter: 'Q1 2023', customers: 8234, orders: 12456, retention: 78 },
        { quarter: 'Q2 2023', customers: 9123, orders: 14523, retention: 82 },
        { quarter: 'Q3 2023', customers: 10456, orders: 16789, retention: 85 },
        { quarter: 'Q4 2023', customers: 12789, orders: 19345, retention: 88 },
        { quarter: 'Q1 2024', customers: 15847, orders: 23456, retention: 91 },
      ],
      customerSegments: [
        { segment: 'Enterprise', count: 234, value: 450000, ltv: 125000 },
        { segment: 'SMB', count: 1245, value: 280000, ltv: 45000 },
        { segment: 'Startup', count: 3456, value: 180000, ltv: 12000 },
        { segment: 'Individual', count: 10912, value: 95000, ltv: 2500 },
      ],
      efficiencyData: [
        { cost: 45, revenue: 125, profit: 80 },
        { cost: 78, revenue: 210, profit: 132 },
        { cost: 123, revenue: 320, profit: 197 },
        { cost: 92, revenue: 245, profit: 153 },
        { cost: 156, revenue: 410, profit: 254 },
        { cost: 201, revenue: 520, profit: 319 },
        { cost: 67, revenue: 178, profit: 111 },
        { cost: 134, revenue: 356, profit: 222 },
        { cost: 189, revenue: 487, profit: 298 },
        { cost: 98, revenue: 267, profit: 169 },
        { cost: 112, revenue: 298, profit: 186 },
        { cost: 145, revenue: 389, profit: 244 },
        { cost: 87, revenue: 234, profit: 147 },
        { cost: 178, revenue: 456, profit: 278 },
        { cost: 223, revenue: 589, profit: 366 },
        { cost: 76, revenue: 198, profit: 122 },
        { cost: 165, revenue: 423, profit: 258 },
        { cost: 198, revenue: 512, profit: 314 },
        { cost: 89, revenue: 245, profit: 156 },
        { cost: 134, revenue: 367, profit: 233 },
      ],
    },
  },
  setupInstructions: `# Business Intelligence Dashboard - Setup Guide

## Overview
This comprehensive BI dashboard showcases all available interactive chart types with real data visualization. It demonstrates the full capabilities of the dashboard generator including area charts, bar charts, pie charts, radar charts, line charts, composed charts, and scatter plots.

## Interactive Chart Types

### Area Charts
**Component**: Revenue Trends
- Smooth gradient fills for visual appeal
- Multiple data series comparison
- Time-series data visualization
- Hover tooltips for detailed values

### Bar Charts
**Component**: Sales by Category
- Side-by-side comparison of metrics
- Vertical orientation with rounded corners
- Multiple metrics per category
- Color-coded series

### Pie Charts
**Component**: Market Share
- Interactive hover states
- Percentage breakdowns
- Regional distribution
- Color-coded segments with legends

### Radar Charts
**Component**: Performance Metrics
- Multi-dimensional data display
- Current vs target comparison
- Filled polygons with transparency
- Polar grid visualization

### Line Charts
**Component**: Growth Indicators
- Multiple trend lines
- Time-series tracking
- Data point markers
- Smooth interpolation

### Composed Charts
**Component**: Customer Segmentation
- Combines bars and lines
- Multiple visualization types in one
- Complex data relationships
- Flexible metric display

### Scatter Charts
**Component**: Efficiency Analysis
- Correlation visualization
- Three-dimensional data (x, y, z)
- Bubble size variation
- Pattern identification

## Chart Customization

### Changing Colors
All charts use the theme color palette defined in \`CHART_COLORS\`:

\`\`\`typescript
const CHART_COLORS = [
  'oklch(0.45 0.19 250)', // Primary blue
  'oklch(0.50 0.15 290)', // Purple
  'oklch(0.75 0.15 195)', // Cyan
  'oklch(0.60 0.22 25)',  // Red
  'oklch(0.70 0.18 140)', // Green
  'oklch(0.65 0.20 60)',  // Yellow
  'oklch(0.55 0.18 310)', // Magenta
]
\`\`\`

### Adjusting Chart Heights
Default height is 300px. Modify in component:

\`\`\`typescript
<ResponsiveContainer width="100%" height={400}>
  {/* Chart content */}
</ResponsiveContainer>
\`\`\`

### Custom Tooltips
Tooltips are fully styled with dark theme:

\`\`\`typescript
<Tooltip 
  contentStyle={{ 
    backgroundColor: 'oklch(0.25 0.01 260)', 
    border: '1px solid oklch(0.35 0.02 260)',
    borderRadius: '8px',
    fontSize: '12px'
  }}
/>
\`\`\`

## Data Integration

### Connecting Real Data
Replace seed data with live API calls:

\`\`\`typescript
import { useQuery } from '@tanstack/react-query'

const { data: chartData } = useQuery({
  queryKey: ['revenue', dateRange],
  queryFn: async () => {
    const response = await fetch('/api/revenue')
    return response.json()
  },
  refetchInterval: 30000 // Refresh every 30 seconds
})
\`\`\`

### Dynamic Data Updates
Charts automatically re-render when data changes:

\`\`\`typescript
const [chartData, setChartData] = useState(initialData)

useEffect(() => {
  const interval = setInterval(() => {
    fetchLatestData().then(setChartData)
  }, 60000)
  
  return () => clearInterval(interval)
}, [])
\`\`\`

## Chart Interactions

### Hover Effects
All charts include interactive hover states:
- Tooltips show detailed values
- Active elements are highlighted
- Smooth transitions on hover
- Legend items can be clicked to toggle visibility

### Responsive Design
Charts automatically resize to fit containers:
- Mobile-friendly breakpoints
- Flexible aspect ratios
- Readable on all screen sizes
- Touch-friendly interactions

### Animations
Smooth animations on data changes:
- Entry animations on mount
- Update transitions on data change
- Configurable duration and easing
- Performance optimized

## Best Practices

### Data Formatting
Ensure data matches expected structure:

\`\`\`typescript
// Line/Area/Bar Charts
[
  { xAxisKey: 'value', yAxisKey1: 123, yAxisKey2: 456 },
  // ... more data points
]

// Pie Charts
[
  { name: 'Category', value: 123 },
  // ... more segments
]

// Radar Charts
[
  { subject: 'Metric', seriesA: 80, seriesB: 90 },
  // ... more axes
]

// Scatter Charts
[
  { x: 45, y: 125, z: 80 },
  // ... more points
]
\`\`\`

### Performance Optimization

**Large Datasets**:
- Limit data points to 50-100 for smooth performance
- Implement data aggregation on backend
- Use pagination or time-based filtering
- Consider data sampling for very large sets

**Memory Management**:
- Clean up intervals and listeners
- Avoid unnecessary re-renders
- Memoize expensive computations
- Use React.memo for chart components

### Accessibility

**Keyboard Navigation**:
- Charts are keyboard accessible
- Tab through interactive elements
- Use arrow keys within charts

**Screen Readers**:
- Provide descriptive titles
- Include data table alternatives
- Use ARIA labels where appropriate

## Troubleshooting

### Charts Not Rendering
1. Check data format matches expected structure
2. Verify all required keys are present
3. Ensure ResponsiveContainer has height
4. Check for console errors

### Performance Issues
1. Reduce number of data points
2. Simplify animations
3. Implement lazy loading
4. Use production build

### Styling Problems
1. Verify theme colors are valid
2. Check CSS specificity conflicts
3. Ensure container has proper dimensions
4. Test in different browsers

## Advanced Features

### Synchronized Charts
Link multiple charts for coordinated interactions:

\`\`\`typescript
const [syncId] = useState('chart-sync')

<LineChart syncId={syncId} data={data1}>
<BarChart syncId={syncId} data={data2}>
\`\`\`

### Custom Legends
Create custom legend components:

\`\`\`typescript
<Legend 
  content={<CustomLegend />}
  verticalAlign="bottom"
  height={36}
/>
\`\`\`

### Export Functionality
Export charts as images:

\`\`\`typescript
import { toBlob } from 'html-to-image'

const exportChart = async () => {
  const node = chartRef.current
  const blob = await toBlob(node)
  saveAs(blob, 'chart.png')
}
\`\`\`

## Next Steps

1. Connect to your real data sources
2. Customize colors to match your brand
3. Adjust chart types based on your metrics
4. Add filters and date range pickers
5. Implement data export features
6. Set up automated refresh intervals
7. Add drill-down capabilities
8. Create dashboard presets for different roles

This dashboard serves as a comprehensive example of all available chart types and can be customized to fit any business intelligence need.`,
}
