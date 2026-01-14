import { DashboardConfig } from './types'

export const monitoringDashboard: DashboardConfig = {
  id: 'monitoring-preconfigured',
  name: 'System Monitoring Dashboard',
  description: 'Real-time system monitoring and alerts',
  type: 'monitoring',
  components: [],
  layout: {
    type: 'grid',
    columns: 12,
    gap: 24,
    padding: 24,
  },
}
