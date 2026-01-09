import { DashboardConfig } from './types'

export const analyticsDashboard: DashboardConfig = {
  id: 'analytics-preconfigured',
  name: 'Analytics Dashboard',
  description: 'Comprehensive web analytics with visitor metrics, traffic sources, and user behavior tracking',
  type: 'analytics',
  createdAt: new Date().toISOString(),
  components: [
    {
      id: 'visitors-metric',
      type: 'metric-card',
      title: 'Total Visitors',
      description: 'Last 30 days',
      position: { row: 0, col: 0 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        trend: 'up',
        trendValue: '12.5%',
        icon: 'users',
      },
    },
    {
      id: 'pageviews-metric',
      type: 'metric-card',
      title: 'Page Views',
      description: 'Last 30 days',
      position: { row: 0, col: 3 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        trend: 'up',
        trendValue: '8.3%',
        icon: 'eye',
      },
    },
    {
      id: 'bounce-rate-metric',
      type: 'metric-card',
      title: 'Bounce Rate',
      description: 'Avg. session time',
      position: { row: 0, col: 6 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        trend: 'down',
        trendValue: '2.1%',
        icon: 'chart',
      },
    },
    {
      id: 'conversion-metric',
      type: 'metric-card',
      title: 'Conversion Rate',
      description: 'Goal completions',
      position: { row: 0, col: 9 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        trend: 'up',
        trendValue: '15.7%',
        icon: 'target',
      },
    },
    {
      id: 'traffic-chart',
      type: 'area-chart',
      title: 'Traffic Overview',
      description: 'Visitors and page views over time',
      position: { row: 1, col: 0 },
      size: { rows: 2, cols: 8 },
      props: {
        dataKey: 'traffic',
        xAxis: 'date',
        yAxis: ['visitors', 'pageviews'],
      },
    },
    {
      id: 'sources-pie',
      type: 'pie-chart',
      title: 'Traffic Sources',
      description: 'Where visitors come from',
      position: { row: 1, col: 8 },
      size: { rows: 2, cols: 4 },
      props: {
        dataKey: 'sources',
      },
    },
    {
      id: 'top-pages',
      type: 'data-table',
      title: 'Top Pages',
      description: 'Most visited pages',
      position: { row: 3, col: 0 },
      size: { rows: 1, cols: 6 },
      props: {
        dataKey: 'topPages',
        columns: ['page', 'views', 'avgTime', 'bounceRate'],
      },
    },
    {
      id: 'devices-bar',
      type: 'bar-chart',
      title: 'Device Breakdown',
      description: 'Visitors by device type',
      position: { row: 3, col: 6 },
      size: { rows: 1, cols: 6 },
      props: {
        dataKey: 'devices',
        xAxis: 'device',
        yAxis: 'visitors',
      },
    },
    {
      id: 'realtime-activity',
      type: 'activity-feed',
      title: 'Real-Time Activity',
      description: 'Live visitor actions',
      position: { row: 4, col: 0 },
      size: { rows: 1, cols: 12 },
      props: {
        dataKey: 'realtimeActivity',
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
    primaryColor: 'oklch(0.55 0.22 250)',
    accentColor: 'oklch(0.70 0.18 180)',
    backgroundColor: 'oklch(0.98 0 0)',
    textColor: 'oklch(0.20 0 0)',
    borderRadius: 12,
  },
  dataModel: {
    entities: [
      {
        name: 'Visitor',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'timestamp', type: 'date', required: true },
          { name: 'source', type: 'string', required: true },
          { name: 'device', type: 'string', required: true },
          { name: 'pageViews', type: 'number', required: true },
        ],
      },
      {
        name: 'PageView',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'page', type: 'string', required: true },
          { name: 'views', type: 'number', required: true },
          { name: 'avgTime', type: 'string', required: true },
          { name: 'bounceRate', type: 'number', required: true },
        ],
      },
    ],
    seedData: {
      traffic: [
        { date: '1/1', visitors: 2400, pageviews: 8100 },
        { date: '1/2', visitors: 2210, pageviews: 7200 },
        { date: '1/3', visitors: 2890, pageviews: 9800 },
        { date: '1/4', visitors: 2780, pageviews: 9200 },
        { date: '1/5', visitors: 3090, pageviews: 11200 },
        { date: '1/6', visitors: 3290, pageviews: 12100 },
        { date: '1/7', visitors: 3490, pageviews: 13000 },
      ],
      sources: [
        { name: 'Organic Search', value: 4234, fill: 'oklch(0.55 0.22 250)' },
        { name: 'Direct', value: 2891, fill: 'oklch(0.70 0.18 180)' },
        { name: 'Social Media', value: 1823, fill: 'oklch(0.65 0.20 300)' },
        { name: 'Referral', value: 1456, fill: 'oklch(0.75 0.15 40)' },
        { name: 'Email', value: 982, fill: 'oklch(0.60 0.18 120)' },
      ],
      topPages: [
        { page: '/home', views: 12453, avgTime: '3m 24s', bounceRate: 32 },
        { page: '/products', views: 8921, avgTime: '4m 12s', bounceRate: 28 },
        { page: '/about', views: 6734, avgTime: '2m 45s', bounceRate: 45 },
        { page: '/blog', views: 5892, avgTime: '5m 33s', bounceRate: 22 },
        { page: '/contact', views: 3421, avgTime: '1m 52s', bounceRate: 58 },
      ],
      devices: [
        { device: 'Desktop', visitors: 5823 },
        { device: 'Mobile', visitors: 8912 },
        { device: 'Tablet', visitors: 2456 },
      ],
      realtimeActivity: [
        { user: 'User from New York', action: 'viewed', page: '/products', time: 'Just now' },
        { user: 'User from London', action: 'signed up', page: '/register', time: '2s ago' },
        { user: 'User from Tokyo', action: 'purchased', page: '/checkout', time: '5s ago' },
        { user: 'User from Paris', action: 'viewed', page: '/blog/article-1', time: '8s ago' },
      ],
    },
  },
  setupInstructions: `# Analytics Dashboard - Setup Guide

## Overview
This dashboard provides comprehensive web analytics tracking including visitor metrics, traffic sources, user behavior, and real-time activity monitoring.

## Features
- **Key Metrics**: Total visitors, page views, bounce rate, and conversion rate with trend indicators
- **Traffic Overview**: Area chart showing visitors and page views over time
- **Traffic Sources**: Pie chart breakdown of where visitors come from
- **Top Pages**: Data table with most visited pages and engagement metrics
- **Device Breakdown**: Bar chart showing visitor distribution across device types
- **Real-Time Activity**: Live feed of current visitor actions

## Data Structure

### Metrics
Each metric card displays:
- Current value (dynamically calculated)
- Trend direction (up/down)
- Percentage change
- Relevant icon

### Traffic Overview Chart
Tracks two metrics over time:
- \`visitors\`: Unique visitors per day
- \`pageviews\`: Total page views per day

### Traffic Sources
Five main channels tracked:
- Organic Search
- Direct Traffic
- Social Media
- Referral Links
- Email Campaigns

## Customization Options

### Connecting Real Analytics Data

Replace seed data with actual analytics API:

\`\`\`typescript
// Google Analytics 4 Example
import { BetaAnalyticsDataClient } from '@google-analytics/data'

const analyticsDataClient = new BetaAnalyticsDataClient()

async function fetchVisitorData() {
  const [response] = await analyticsDataClient.runReport({
    property: 'properties/YOUR_PROPERTY_ID',
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }]
  })
  
  return response.rows.map(row => ({
    date: row.dimensionValues[0].value,
    visitors: parseInt(row.metricValues[0].value),
    pageviews: parseInt(row.metricValues[1].value)
  }))
}
\`\`\`

### Adjusting Date Ranges

Modify the time period in component props:

\`\`\`typescript
const [dateRange, setDateRange] = useState({
  start: '30daysAgo',
  end: 'today'
})

// Update data fetch with new range
useEffect(() => {
  fetchData(dateRange)
}, [dateRange])
\`\`\`

### Adding Custom Events

Track custom conversions and goals:

\`\`\`typescript
const customEvents = [
  { name: 'newsletter_signup', goal: 'Lead Generation' },
  { name: 'download_pdf', goal: 'Content Engagement' },
  { name: 'video_play', goal: 'Media Consumption' }
]

// Track in your analytics system
analytics.track(eventName, properties)
\`\`\`

### Filtering by Segments

Add user segment filters:

\`\`\`typescript
const segments = ['All Users', 'New Users', 'Returning Users', 'Converters']
const [activeSegment, setActiveSegment] = useState('All Users')

// Filter data based on segment
const filteredData = data.filter(item => matchesSegment(item, activeSegment))
\`\`\`

## Component Details

### Metric Cards
- **Type**: \`metric-card\`
- **Props**: \`value\`, \`trend\`, \`trendValue\`, \`icon\`
- **Updates**: Calculated from underlying data

### Traffic Overview Chart
- **Type**: \`area-chart\`
- **Library**: Recharts
- **Data Points**: Last 7-30 days
- **Customizable**: Colors, axes, tooltips

### Traffic Sources Pie Chart
- **Type**: \`pie-chart\`
- **Library**: Recharts
- **Interactive**: Hover for percentages
- **Colors**: Custom theme colors

### Top Pages Table
- **Type**: \`data-table\`
- **Sortable**: Click column headers
- **Paginated**: Shows top 5 by default
- **Expandable**: Can show more rows

### Device Breakdown
- **Type**: \`bar-chart\`
- **Responsive**: Adapts to container size
- **Colors**: Gradient fills

### Real-Time Activity Feed
- **Type**: \`activity-feed\`
- **Updates**: WebSocket or polling
- **Auto-scroll**: Newest items first
- **Limit**: Last 50 actions

## Integration Guides

### Google Analytics 4
1. Install package: \`npm install @google-analytics/data\`
2. Set up service account credentials
3. Replace seed data with API calls
4. Map GA4 metrics to dashboard components

### Plausible Analytics
1. Install package: \`npm install plausible-tracker\`
2. Initialize with your domain
3. Use their API for historical data
4. Set up real-time events

### Matomo (Self-Hosted)
1. Install Matomo SDK
2. Configure API endpoint
3. Fetch reports via REST API
4. Transform data to match dashboard format

### Custom Analytics
Build your own tracking:
1. Set up event collection endpoint
2. Store events in database (PostgreSQL/MongoDB)
3. Aggregate data in backend
4. Expose via REST/GraphQL API
5. Connect dashboard to your API

## Real-Time Features

### WebSocket Connection
For live activity feed:

\`\`\`typescript
import { useEffect } from 'react'

useEffect(() => {
  const ws = new WebSocket('wss://your-analytics-api.com/realtime')
  
  ws.onmessage = (event) => {
    const activity = JSON.parse(event.data)
    setRealtimeActivity(prev => [activity, ...prev].slice(0, 50))
  }
  
  return () => ws.close()
}, [])
\`\`\`

### Polling Alternative
If WebSocket isn't available:

\`\`\`typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const recent = await fetch('/api/analytics/recent').then(r => r.json())
    setRealtimeActivity(recent)
  }, 5000)
  
  return () => clearInterval(interval)
}, [])
\`\`\`

## Performance Optimization

### Data Caching
Cache analytics data to reduce API calls:

\`\`\`typescript
import { useQuery } from '@tanstack/react-query'

const { data } = useQuery({
  queryKey: ['analytics', dateRange],
  queryFn: fetchAnalyticsData,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000 // 10 minutes
})
\`\`\`

### Lazy Loading
Load heavy components only when needed:

\`\`\`typescript
import { lazy, Suspense } from 'react'

const TrafficChart = lazy(() => import('./TrafficChart'))

<Suspense fallback={<Skeleton />}>
  <TrafficChart data={trafficData} />
</Suspense>
\`\`\`

## Privacy & GDPR Compliance

### Cookie Consent
Implement consent management:

\`\`\`typescript
const [hasConsent, setHasConsent] = useKV('analytics-consent', false)

if (hasConsent) {
  // Initialize analytics
  analytics.init()
}
\`\`\`

### IP Anonymization
Ensure PII is not tracked:
- Anonymize IP addresses
- Don't track personally identifiable information
- Provide opt-out mechanism
- Document data retention policy

## Exporting Reports

### PDF Generation
Export dashboard as PDF:

\`\`\`typescript
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const exportPDF = async () => {
  const canvas = await html2canvas(dashboardRef.current)
  const pdf = new jsPDF()
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297)
  pdf.save('analytics-report.pdf')
}
\`\`\`

### CSV Export
Export table data:

\`\`\`typescript
const exportCSV = (data: any[]) => {
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'analytics-data.csv'
  link.click()
}
\`\`\`

## Troubleshooting

### Data Not Showing
1. Check API connection
2. Verify date range format
3. Ensure data structure matches expected format
4. Check browser console for errors

### Slow Performance
1. Reduce data points in charts
2. Implement pagination for tables
3. Use virtualization for long lists
4. Optimize re-renders with React.memo

### Incorrect Calculations
1. Verify timezone handling
2. Check date range boundaries
3. Ensure proper aggregation logic
4. Validate data types (numbers vs strings)

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- Mobile: Fully responsive

## Deployment Checklist
- [ ] Connect to real analytics API
- [ ] Set up authentication
- [ ] Configure CORS for API requests
- [ ] Implement error boundaries
- [ ] Add loading states
- [ ] Test with production data
- [ ] Set up monitoring/alerting
- [ ] Document API endpoints
- [ ] Configure caching strategy
- [ ] Enable analytics consent management
`,
}
