import { DashboardTemplate } from './types'

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Track metrics, KPIs, and data trends with charts and graphs',
    category: 'Business',
    preview: '📊',
    config: {
      type: 'analytics',
      layout: {
        type: 'grid',
        columns: 12,
        gap: 24,
        padding: 24,
      },
    },
  },
  {
    id: 'crm',
    name: 'CRM Dashboard',
    description: 'Manage customers, leads, and sales pipeline',
    category: 'Sales',
    preview: '👥',
    config: {
      type: 'crm',
      layout: {
        type: 'grid',
        columns: 12,
        gap: 24,
        padding: 24,
      },
    },
  },
  {
    id: 'project',
    name: 'Project Management',
    description: 'Track tasks, milestones, and team progress',
    category: 'Productivity',
    preview: '📋',
    config: {
      type: 'project',
      layout: {
        type: 'grid',
        columns: 12,
        gap: 24,
        padding: 24,
      },
    },
  },
  {
    id: 'monitoring',
    name: 'System Monitoring',
    description: 'Real-time metrics, alerts, and system health',
    category: 'DevOps',
    preview: '🖥️',
    config: {
      type: 'monitoring',
      layout: {
        type: 'grid',
        columns: 12,
        gap: 24,
        padding: 24,
      },
    },
  },
  {
    id: 'social',
    name: 'Social Media Dashboard',
    description: 'Engagement metrics, content calendar, and audience insights',
    category: 'Marketing',
    preview: '📱',
    config: {
      type: 'social',
      layout: {
        type: 'grid',
        columns: 12,
        gap: 24,
        padding: 24,
      },
    },
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Dashboard',
    description: 'Sales, inventory, orders, and customer analytics',
    category: 'Retail',
    preview: '🛍️',
    config: {
      type: 'ecommerce',
      layout: {
        type: 'grid',
        columns: 12,
        gap: 24,
        padding: 24,
      },
    },
  },
  {
    id: 'finance',
    name: 'Financial Dashboard',
    description: 'Revenue, expenses, cash flow, and financial forecasting',
    category: 'Finance',
    preview: '💰',
    config: {
      type: 'finance',
      layout: {
        type: 'grid',
        columns: 12,
        gap: 24,
        padding: 24,
      },
    },
  },
  {
    id: 'hr',
    name: 'HR Dashboard',
    description: 'Employee data, recruitment, performance, and attendance',
    category: 'Human Resources',
    preview: '👔',
    config: {
      type: 'hr',
      layout: {
        type: 'grid',
        columns: 12,
        gap: 24,
        padding: 24,
      },
    },
  },
]
