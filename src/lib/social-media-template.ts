import { DashboardConfig } from './types'

export const socialMediaDashboard: DashboardConfig = {
  id: 'social-media-preconfigured',
  name: 'Social Media Dashboard',
  description: 'Engagement metrics and social media analytics',
  type: 'social-media',
  components: [],
  layout: {
    type: 'grid',
    columns: 12,
    gap: 24,
    padding: 24,
  },
}
