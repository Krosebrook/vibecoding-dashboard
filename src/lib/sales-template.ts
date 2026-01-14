import { DashboardConfig } from './types'

export const salesDashboard: DashboardConfig = {
  id: 'sales-preconfigured',
  name: 'Sales Dashboard',
  description: 'Track sales performance and revenue metrics',
  type: 'sales',
  components: [],
  layout: {
    type: 'grid',
    columns: 12,
    gap: 24,
    padding: 24,
  },
}
