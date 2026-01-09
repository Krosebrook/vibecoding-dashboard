import { DashboardConfig } from './types'

export const salesDashboard: DashboardConfig = {
  id: 'sales-preconfigured',
  name: 'Sales Dashboard',
  description: 'Revenue tracking, pipeline management, and sales performance metrics with real-time updates',
  type: 'sales',
  createdAt: new Date().toISOString(),
  components: [
    {
      id: 'revenue-metric',
      type: 'metric-card',
      title: 'Total Revenue',
      description: 'This month',
      position: { row: 0, col: 0 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        prefix: '$',
        trend: 'up',
        trendValue: '23.5%',
        icon: 'currency',
      },
    },
    {
      id: 'deals-metric',
      type: 'metric-card',
      title: 'Deals Closed',
      description: 'This month',
      position: { row: 0, col: 3 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        trend: 'up',
        trendValue: '18.2%',
        icon: 'handshake',
      },
    },
    {
      id: 'conversion-metric',
      type: 'metric-card',
      title: 'Win Rate',
      description: 'Conversion rate',
      position: { row: 0, col: 6 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        suffix: '%',
        trend: 'up',
        trendValue: '5.3%',
        icon: 'target',
      },
    },
    {
      id: 'pipeline-metric',
      type: 'metric-card',
      title: 'Pipeline Value',
      description: 'Active opportunities',
      position: { row: 0, col: 9 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        prefix: '$',
        trend: 'up',
        trendValue: '12.8%',
        icon: 'funnel',
      },
    },
    {
      id: 'revenue-chart',
      type: 'line-chart',
      title: 'Revenue Trend',
      description: 'Monthly revenue over time',
      position: { row: 1, col: 0 },
      size: { rows: 2, cols: 8 },
      props: {
        dataKey: 'revenue',
        xAxis: 'month',
        yAxis: ['actual', 'target'],
      },
    },
    {
      id: 'pipeline-funnel',
      type: 'bar-chart',
      title: 'Sales Pipeline',
      description: 'Deals by stage',
      position: { row: 1, col: 8 },
      size: { rows: 2, cols: 4 },
      props: {
        dataKey: 'pipeline',
        xAxis: 'stage',
        yAxis: 'value',
        layout: 'vertical',
      },
    },
    {
      id: 'top-products',
      type: 'data-table',
      title: 'Top Products',
      description: 'Best selling items',
      position: { row: 3, col: 0 },
      size: { rows: 1, cols: 6 },
      props: {
        dataKey: 'topProducts',
        columns: ['product', 'units', 'revenue', 'growth'],
      },
    },
    {
      id: 'category-breakdown',
      type: 'pie-chart',
      title: 'Revenue by Category',
      description: 'Product categories',
      position: { row: 3, col: 6 },
      size: { rows: 1, cols: 6 },
      props: {
        dataKey: 'categories',
      },
    },
    {
      id: 'sales-team',
      type: 'user-list',
      title: 'Sales Team Performance',
      description: 'Top performers this month',
      position: { row: 4, col: 0 },
      size: { rows: 1, cols: 6 },
      props: {
        dataKey: 'salesTeam',
      },
    },
    {
      id: 'recent-deals',
      type: 'activity-feed',
      title: 'Recent Deals',
      description: 'Latest closed opportunities',
      position: { row: 4, col: 6 },
      size: { rows: 1, cols: 6 },
      props: {
        dataKey: 'recentDeals',
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
    primaryColor: 'oklch(0.50 0.20 145)',
    accentColor: 'oklch(0.75 0.18 85)',
    backgroundColor: 'oklch(0.98 0 0)',
    textColor: 'oklch(0.20 0 0)',
    borderRadius: 12,
  },
  dataModel: {
    entities: [
      {
        name: 'Deal',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'value', type: 'number', required: true },
          { name: 'stage', type: 'string', required: true },
          { name: 'probability', type: 'number', required: true },
          { name: 'closeDate', type: 'date', required: true },
        ],
      },
      {
        name: 'Product',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'category', type: 'string', required: true },
          { name: 'price', type: 'number', required: true },
          { name: 'unitsSold', type: 'number', required: true },
        ],
      },
      {
        name: 'SalesRep',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'revenue', type: 'number', required: true },
          { name: 'deals', type: 'number', required: true },
          { name: 'quota', type: 'number', required: true },
        ],
      },
    ],
    seedData: {
      revenue: [
        { month: 'Jan', actual: 145000, target: 150000 },
        { month: 'Feb', actual: 168000, target: 155000 },
        { month: 'Mar', actual: 182000, target: 160000 },
        { month: 'Apr', actual: 195000, target: 165000 },
        { month: 'May', actual: 223000, target: 170000 },
        { month: 'Jun', actual: 251000, target: 175000 },
      ],
      pipeline: [
        { stage: 'Lead', value: 450000, count: 45 },
        { stage: 'Qualified', value: 320000, count: 28 },
        { stage: 'Proposal', value: 210000, count: 18 },
        { stage: 'Negotiation', value: 125000, count: 9 },
        { stage: 'Closed Won', value: 95000, count: 6 },
      ],
      topProducts: [
        { product: 'Enterprise Plan', units: 234, revenue: 468000, growth: '+28%' },
        { product: 'Professional Plan', units: 567, revenue: 283500, growth: '+15%' },
        { product: 'Starter Plan', units: 1234, revenue: 123400, growth: '+42%' },
        { product: 'Add-on: Analytics', units: 445, revenue: 89000, growth: '+67%' },
        { product: 'Add-on: Support', units: 332, revenue: 66400, growth: '+23%' },
      ],
      categories: [
        { name: 'Subscriptions', value: 584900, fill: 'oklch(0.50 0.20 145)' },
        { name: 'Add-ons', value: 155400, fill: 'oklch(0.75 0.18 85)' },
        { name: 'Services', value: 234000, fill: 'oklch(0.65 0.15 220)' },
        { name: 'Training', value: 87500, fill: 'oklch(0.70 0.12 30)' },
      ],
      salesTeam: [
        { name: 'Sarah Johnson', revenue: 125000, deals: 12, quota: 120000, progress: 104 },
        { name: 'Mike Chen', revenue: 118000, deals: 15, quota: 120000, progress: 98 },
        { name: 'Emma Davis', revenue: 109000, deals: 11, quota: 100000, progress: 109 },
        { name: 'James Wilson', revenue: 95000, deals: 10, quota: 100000, progress: 95 },
        { name: 'Lisa Anderson', revenue: 87000, deals: 9, quota: 90000, progress: 97 },
      ],
      recentDeals: [
        { company: 'Acme Corp', value: 45000, rep: 'Sarah J.', stage: 'Closed Won', time: '2 hours ago' },
        { company: 'TechStart Inc', value: 32000, rep: 'Mike C.', stage: 'Closed Won', time: '5 hours ago' },
        { company: 'Global Systems', value: 78000, rep: 'Emma D.', stage: 'Negotiation', time: '1 day ago' },
        { company: 'Digital Solutions', value: 23000, rep: 'James W.', stage: 'Closed Won', time: '1 day ago' },
      ],
    },
  },
  setupInstructions: `# Sales Dashboard - Setup Guide

## Overview
This dashboard provides comprehensive sales tracking including revenue metrics, pipeline management, product performance, and team analytics with real-time updates.

## Features
- **Revenue Metrics**: Total revenue, deals closed, win rate, and pipeline value with trend indicators
- **Revenue Trend**: Line chart comparing actual vs target revenue over time
- **Sales Pipeline**: Bar chart showing deal progression through sales stages
- **Top Products**: Data table with best-selling items and growth rates
- **Revenue by Category**: Pie chart breakdown of revenue sources
- **Sales Team Performance**: Leaderboard showing top performers against quotas
- **Recent Deals**: Activity feed of latest closed opportunities

## Data Structure

### Metrics
Four key performance indicators:
- **Total Revenue**: Current month's closed revenue
- **Deals Closed**: Number of won opportunities
- **Win Rate**: Percentage of deals closed vs total opportunities
- **Pipeline Value**: Total value of active deals weighted by probability

### Revenue Trend Chart
Compares two metrics monthly:
- \`actual\`: Real revenue achieved
- \`target\`: Revenue quota/goal

### Pipeline Funnel
Five sales stages tracked:
- Lead → Qualified → Proposal → Negotiation → Closed Won
- Each stage shows value and count of active deals

## Customization Options

### Connecting CRM Data

Integrate with Salesforce:

\`\`\`typescript
import jsforce from 'jsforce'

const conn = new jsforce.Connection({
  loginUrl: 'https://login.salesforce.com'
})

await conn.login(username, password)

const opportunities = await conn.sobject('Opportunity')
  .find({
    CloseDate: { $gte: startOfMonth },
    StageName: { $ne: 'Closed Lost' }
  })
  .select('Id, Name, Amount, StageName, Probability, CloseDate')
  .execute()

// Transform to dashboard format
const pipelineData = aggregatePipeline(opportunities)
\`\`\`

Integrate with HubSpot:

\`\`\`typescript
import { Client } from '@hubspot/api-client'

const hubspot = new Client({ accessToken: 'YOUR_TOKEN' })

const deals = await hubspot.crm.deals.getAll()

// Map to dashboard format
const salesData = deals.map(deal => ({
  id: deal.id,
  name: deal.properties.dealname,
  value: parseFloat(deal.properties.amount),
  stage: deal.properties.dealstage,
  closeDate: deal.properties.closedate
}))
\`\`\`

### Calculating Win Rate

Custom win rate calculation:

\`\`\`typescript
const calculateWinRate = (deals: Deal[]) => {
  const closedDeals = deals.filter(d => 
    d.stage === 'Closed Won' || d.stage === 'Closed Lost'
  )
  
  const wonDeals = deals.filter(d => d.stage === 'Closed Won')
  
  return (wonDeals.length / closedDeals.length) * 100
}
\`\`\`

### Pipeline Value with Probability

Weight pipeline by close probability:

\`\`\`typescript
const calculateWeightedPipeline = (deals: Deal[]) => {
  return deals.reduce((total, deal) => {
    if (deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost') {
      return total + (deal.value * (deal.probability / 100))
    }
    return total
  }, 0)
}
\`\`\`

### Adding Sales Forecast

Implement forecasting logic:

\`\`\`typescript
const forecastRevenue = (historicalData: Revenue[], months: number) => {
  // Simple linear regression
  const avgGrowth = calculateAverageGrowth(historicalData)
  const lastValue = historicalData[historicalData.length - 1].actual
  
  return Array.from({ length: months }, (_, i) => ({
    month: getMonthName(i + 1),
    forecast: lastValue * Math.pow(1 + avgGrowth, i + 1)
  }))
}
\`\`\`

## Component Details

### Revenue Metrics
- **Type**: \`metric-card\`
- **Updates**: Calculated from deals data
- **Formatting**: Currency with locale support
- **Trends**: Comparison to previous period

### Revenue Trend Chart
- **Type**: \`line-chart\`
- **Library**: Recharts
- **Time Range**: Last 6-12 months
- **Customizable**: Add forecast line, goals, etc.

### Sales Pipeline Chart
- **Type**: \`bar-chart\`
- **Layout**: Vertical (horizontal funnel)
- **Interactive**: Click to filter by stage
- **Tooltips**: Show count and total value

### Top Products Table
- **Type**: \`data-table\`
- **Sortable**: All columns
- **Columns**: Product, Units, Revenue, Growth
- **Actions**: Click to view product details

### Revenue by Category
- **Type**: \`pie-chart\`
- **Interactive**: Hover for percentages
- **Labels**: Show both name and value
- **Colors**: Custom theme colors

### Sales Team Performance
- **Type**: \`user-list\`
- **Shows**: Name, revenue, deals, quota attainment
- **Sorted**: By revenue (descending)
- **Progress bars**: Visual quota tracking

### Recent Deals Feed
- **Type**: \`activity-feed\`
- **Real-time**: Updates as deals close
- **Filters**: By stage, rep, or date
- **Limit**: Last 20 activities

## Integration Guides

### Salesforce
1. Install jsforce: \`npm install jsforce\`
2. Set up OAuth or username/password auth
3. Query Opportunity and Account objects
4. Map fields to dashboard data model
5. Set up webhook for real-time updates

### HubSpot
1. Install SDK: \`npm install @hubspot/api-client\`
2. Generate private app access token
3. Use CRM Deals API
4. Implement pagination for large datasets
5. Cache responses to reduce API calls

### Pipedrive
1. Install SDK: \`npm install pipedrive\`
2. Get API token from settings
3. Fetch deals with \`/deals\` endpoint
4. Transform stage names to match dashboard
5. Set up webhooks for instant updates

### Custom CRM
Build connector for your system:
1. Define API endpoints for deals, products, reps
2. Implement authentication (OAuth 2.0 recommended)
3. Create data transformation layer
4. Handle pagination and rate limiting
5. Add error handling and retries

## Real-Time Updates

### WebSocket for Deal Updates

\`\`\`typescript
useEffect(() => {
  const ws = new WebSocket('wss://your-crm-api.com/deals')
  
  ws.onmessage = (event) => {
    const deal = JSON.parse(event.data)
    
    if (deal.stage === 'Closed Won') {
      // Update revenue metric
      setRevenue(prev => prev + deal.value)
      
      // Add to recent deals feed
      setRecentDeals(prev => [deal, ...prev].slice(0, 20))
      
      // Show toast notification
      toast.success(\`Deal closed: $\${deal.value.toLocaleString()}\`)
    }
  }
  
  return () => ws.close()
}, [])
\`\`\`

### Polling Alternative

\`\`\`typescript
useEffect(() => {
  const fetchLatestDeals = async () => {
    const deals = await fetch('/api/deals/recent?limit=20').then(r => r.json())
    setRecentDeals(deals)
  }
  
  const interval = setInterval(fetchLatestDeals, 30000) // 30 seconds
  return () => clearInterval(interval)
}, [])
\`\`\`

## Advanced Features

### Sales Forecasting
Add AI-powered forecasting:

\`\`\`typescript
const generateForecast = async (historicalData: Revenue[]) => {
  const prompt = spark.llmPrompt\`
    Based on this historical revenue data:
    \${JSON.stringify(historicalData)}
    
    Generate a 3-month revenue forecast with confidence intervals.
    Return as JSON with months and predicted values.
  \`
  
  const result = await spark.llm(prompt, 'gpt-4o', true)
  return JSON.parse(result)
}
\`\`\`

### Deal Scoring
Implement predictive lead scoring:

\`\`\`typescript
const scoreDeal = (deal: Deal) => {
  let score = 0
  
  // Value-based scoring
  if (deal.value > 100000) score += 30
  else if (deal.value > 50000) score += 20
  else score += 10
  
  // Stage-based scoring
  const stageScores = {
    'Lead': 10,
    'Qualified': 20,
    'Proposal': 40,
    'Negotiation': 70,
    'Closed Won': 100
  }
  score += stageScores[deal.stage] || 0
  
  // Time in stage penalty
  const daysInStage = getDaysInStage(deal)
  if (daysInStage > 30) score -= 10
  
  return Math.min(100, Math.max(0, score))
}
\`\`\`

### Commission Calculator
Track rep commissions:

\`\`\`typescript
const calculateCommission = (rep: SalesRep, deals: Deal[]) => {
  const repDeals = deals.filter(d => d.repId === rep.id && d.stage === 'Closed Won')
  
  let commission = 0
  repDeals.forEach(deal => {
    // Tiered commission structure
    if (deal.value < 10000) commission += deal.value * 0.05
    else if (deal.value < 50000) commission += deal.value * 0.08
    else commission += deal.value * 0.10
  })
  
  return commission
}
\`\`\`

## Performance Optimization

### Data Aggregation
Pre-aggregate large datasets:

\`\`\`typescript
// Instead of processing all deals on each render
const aggregatedData = useMemo(() => ({
  totalRevenue: deals.reduce((sum, d) => sum + d.value, 0),
  dealsCount: deals.length,
  pipelineValue: calculatePipeline(deals),
  winRate: calculateWinRate(deals)
}), [deals])
\`\`\`

### Lazy Loading Large Tables

\`\`\`typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const rowVirtualizer = useVirtualizer({
  count: deals.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
})
\`\`\`

## Reporting & Exports

### Generate PDF Report

\`\`\`typescript
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const generateSalesReport = async () => {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text('Sales Report', 20, 20)
  
  // Add metrics
  doc.setFontSize(12)
  doc.text(\`Total Revenue: $\${totalRevenue.toLocaleString()}\`, 20, 40)
  doc.text(\`Deals Closed: \${dealsCount}\`, 20, 50)
  
  // Add charts (convert to image first)
  const chartElement = document.getElementById('revenue-chart')
  const canvas = await html2canvas(chartElement)
  const imgData = canvas.toDataURL('image/png')
  doc.addImage(imgData, 'PNG', 20, 60, 170, 100)
  
  doc.save('sales-report.pdf')
}
\`\`\`

### Export to Excel

\`\`\`typescript
import * as XLSX from 'xlsx'

const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(deals)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Deals')
  XLSX.writeFile(workbook, 'sales-data.xlsx')
}
\`\`\`

## Troubleshooting

### Revenue Calculations Off
1. Check date range filtering
2. Verify closed won stage name
3. Ensure currency conversion if multi-currency
4. Check for duplicate deals

### Pipeline Not Updating
1. Verify stage name mapping
2. Check WebSocket connection
3. Ensure deal updates trigger re-fetch
4. Look for stale data in cache

### Team Performance Wrong
1. Verify rep assignment on deals
2. Check quota period alignment
3. Ensure deal owner vs creator distinction
4. Validate commission calculations

## Security Considerations

### API Key Management
Never expose API keys in frontend:

\`\`\`typescript
// Backend proxy (recommended)
app.get('/api/crm/deals', authenticateUser, async (req, res) => {
  const deals = await crmClient.getDeals({
    apiKey: process.env.CRM_API_KEY
  })
  res.json(deals)
})
\`\`\`

### Role-Based Access
Implement permissions:

\`\`\`typescript
const user = await spark.user()

// Only show commission data to reps for their own deals
const visibleDeals = user.role === 'admin' 
  ? allDeals 
  : allDeals.filter(d => d.repId === user.id)
\`\`\`

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile: Responsive layout included

## Deployment Checklist
- [ ] Connect to CRM API
- [ ] Set up authentication
- [ ] Configure webhooks for real-time updates
- [ ] Implement caching strategy
- [ ] Add error handling
- [ ] Set up monitoring
- [ ] Configure rate limiting
- [ ] Test with production data
- [ ] Add export functionality
- [ ] Document API endpoints
`,
}
