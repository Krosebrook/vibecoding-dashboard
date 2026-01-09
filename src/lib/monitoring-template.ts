import { DashboardConfig } from './types'

export const systemMonitoringDashboard: DashboardConfig = {
  id: 'system-monitoring-preconfigured',
  name: 'System Monitoring Dashboard',
  description: 'Real-time server metrics and performance monitoring with live data updates',
  type: 'monitoring',
  createdAt: new Date().toISOString(),
  components: [
    {
      id: 'cpu-1',
      type: 'cpu-monitor',
      title: 'CPU Usage',
      description: 'Real-time CPU utilization',
      position: { row: 0, col: 0 },
      size: { rows: 1, cols: 4 },
      props: {},
    },
    {
      id: 'memory-1',
      type: 'memory-monitor',
      title: 'Memory Usage',
      description: 'RAM utilization and available memory',
      position: { row: 0, col: 4 },
      size: { rows: 1, cols: 4 },
      props: {},
    },
    {
      id: 'network-1',
      type: 'network-monitor',
      title: 'Network Traffic',
      description: 'Upload and download bandwidth',
      position: { row: 0, col: 8 },
      size: { rows: 1, cols: 4 },
      props: {},
    },
    {
      id: 'realtime-1',
      type: 'realtime-chart',
      title: 'System Load',
      description: 'Live system performance metrics',
      position: { row: 1, col: 0 },
      size: { rows: 1, cols: 8 },
      props: {},
    },
    {
      id: 'alerts-1',
      type: 'alert-list',
      title: 'System Alerts',
      description: 'Critical warnings and notifications',
      position: { row: 1, col: 8 },
      size: { rows: 2, cols: 4 },
      props: {},
    },
    {
      id: 'servers-1',
      type: 'server-status',
      title: 'Server Status',
      description: 'Infrastructure health overview',
      position: { row: 2, col: 0 },
      size: { rows: 1, cols: 8 },
      props: {},
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
        name: 'Server',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'status', type: 'string', required: true },
          { name: 'uptime', type: 'string', required: true },
          { name: 'load', type: 'number', required: true },
        ],
      },
      {
        name: 'Alert',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'level', type: 'string', required: true },
          { name: 'message', type: 'string', required: true },
          { name: 'time', type: 'string', required: true },
          { name: 'server', type: 'string', required: true },
        ],
      },
    ],
    seedData: {
      servers: [
        { id: '1', name: 'Web Server 1', status: 'online', uptime: '45d 12h', load: 34 },
        { id: '2', name: 'Web Server 2', status: 'online', uptime: '45d 12h', load: 28 },
        { id: '3', name: 'Database Primary', status: 'online', uptime: '89d 3h', load: 52 },
        { id: '4', name: 'Database Replica', status: 'warning', uptime: '12d 8h', load: 78 },
        { id: '5', name: 'Cache Server', status: 'online', uptime: '23d 15h', load: 15 },
        { id: '6', name: 'API Gateway', status: 'online', uptime: '45d 12h', load: 41 },
      ],
      alerts: [
        {
          id: '1',
          level: 'warning',
          message: 'Database Replica load above 75%',
          time: '2 min ago',
          server: 'DB-REPLICA-01',
        },
        {
          id: '2',
          level: 'info',
          message: 'Backup completed successfully',
          time: '15 min ago',
          server: 'BACKUP-SRV',
        },
        {
          id: '3',
          level: 'critical',
          message: 'SSL certificate expires in 7 days',
          time: '1 hour ago',
          server: 'WEB-SRV-01',
        },
      ],
    },
  },
  setupInstructions: `# System Monitoring Dashboard - Setup Guide

## Overview
This dashboard provides real-time monitoring of server metrics including CPU usage, memory consumption, network traffic, server status, and system alerts.

## Features
- **Real-Time CPU Monitoring**: Live tracking of CPU utilization with visual indicators
- **Memory Usage**: Current RAM usage with used/free breakdown
- **Network Traffic**: Upload and download bandwidth monitoring
- **Server Status**: Health overview of all infrastructure components
- **System Alerts**: Critical warnings and notifications
- **Live Charts**: Real-time performance graphs with auto-updating data

## Data Updates
All components update automatically:
- CPU/Memory/Network: Every 2-3 seconds
- Real-time Charts: Every 1.5 seconds
- Server Status: Static with simulated data
- Alerts: Static with timestamp simulation

## Customization Options

### Adjusting Update Intervals
Edit the \`useEffect\` intervals in \`src/components/SystemMonitoring.tsx\`:
\`\`\`typescript
// Change from 2000ms to desired interval
useEffect(() => {
  const interval = setInterval(() => {
    // Update logic
  }, 2000) // <-- Adjust this value
  
  return () => clearInterval(interval)
}, [])
\`\`\`

### Connecting Real Data Sources
Replace simulated data with actual API calls:

\`\`\`typescript
// Example: Fetch real CPU data
const fetchCPUData = async () => {
  const response = await fetch('/api/metrics/cpu')
  const data = await response.json()
  setCpuUsage(data.usage)
}

useEffect(() => {
  const interval = setInterval(fetchCPUData, 2000)
  return () => clearInterval(interval)
}, [])
\`\`\`

### Adding More Servers
Edit the \`servers\` array in \`ServerStatus\` component:
\`\`\`typescript
const servers = [
  { name: 'Your Server Name', status: 'online', uptime: '10d 5h', load: 45 },
  // Add more servers...
]
\`\`\`

### Customizing Alert Levels
Modify thresholds in component logic:
\`\`\`typescript
const getStatusColor = (value: number) => {
  if (value < 50) return 'text-green-500'    // Healthy
  if (value < 75) return 'text-yellow-500'   // Warning
  return 'text-red-500'                       // Critical
}
\`\`\`

## Component Details

### CPU Monitor
- **Type**: \`cpu-monitor\`
- **Updates**: Every 2 seconds
- **Thresholds**: 
  - Healthy: < 50%
  - Warning: 50-75%
  - Critical: > 75%

### Memory Monitor
- **Type**: \`memory-monitor\`
- **Updates**: Every 3 seconds
- **Shows**: Used/Free memory breakdown

### Network Monitor
- **Type**: \`network-monitor\`
- **Updates**: Every 2 seconds
- **Tracks**: Upload/Download speeds and packet counts

### Server Status
- **Type**: \`server-status\`
- **Shows**: Server health, uptime, and load
- **Statuses**: online, warning, offline

### Alert List
- **Type**: \`alert-list\`
- **Levels**: info, warning, critical
- **Auto-categorizes**: Alerts by severity

### Real-time Chart
- **Type**: \`realtime-chart\`
- **Updates**: Every 1.5 seconds
- **Shows**: Last 60 seconds of performance data

## Persistence
Dashboard configuration is automatically saved to local storage using the \`useKV\` hook. All settings and customizations persist across sessions.

## Performance Considerations
- All animations use \`framer-motion\` for smooth 60fps rendering
- Data updates are throttled to prevent excessive re-renders
- Components use React hooks for efficient state management

## Troubleshooting

### High CPU Usage in Browser
If the dashboard itself uses too much CPU:
1. Increase update intervals
2. Reduce number of data points in charts
3. Disable animations by removing \`motion\` components

### Data Not Updating
1. Check browser console for errors
2. Verify \`useEffect\` cleanup functions
3. Ensure component is mounted properly

## Deployment
This dashboard runs entirely in the browser. No backend required for the demo data. For production:
1. Replace simulated data with real API calls
2. Add authentication/authorization
3. Implement WebSocket connections for true real-time updates
4. Add data persistence layer for historical metrics

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile: Responsive layout included
`,
}
