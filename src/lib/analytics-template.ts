import { DashboardConfig } from './types'

export const analyticsDashboard: DashboardConfig = {
  id: 'analytics-preconfigured',
  name: 'Analytics Dashboard',
  description: 'Comprehensive web analytics with visitor metrics, traffic sources, and user behavior tracking',
  type: 'analytics',
  components: [],
  layout: {
    type: 'grid',
    columns: 12,
    gap: 24,
    padding: 24,
  },
}
