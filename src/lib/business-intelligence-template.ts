import { DashboardConfig } from './types'

export const businessIntelligenceDashboard: DashboardConfig = {
  id: 'business-intelligence-preconfigured',
  name: 'Business Intelligence Dashboard',
  description: 'Comprehensive BI dashboard for data analysis and insights',
  type: 'business-intelligence',
  components: [],
  layout: {
    type: 'grid',
    columns: 12,
    gap: 24,
    padding: 24,
  },
}
