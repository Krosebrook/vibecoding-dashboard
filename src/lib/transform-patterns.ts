export interface TransformPattern {
  id: string
  name: string
  category: string
  industry?: string
  description: string
  useCase: string
  code: string
  example: {
    input: string
    output: string
  }
  tags: string[]
  complexity: 'basic' | 'intermediate' | 'advanced'
}

export const transformPatterns: TransformPattern[] = [
  {
    id: 'string-uppercase',
    name: 'To Uppercase',
    category: 'String Manipulation',
    description: 'Convert text to uppercase letters',
    useCase: 'Standardizing company names or codes',
    code: 'return value.toUpperCase()',
    example: {
      input: '"hello world"',
      output: '"HELLO WORLD"'
    },
    tags: ['text', 'format', 'case'],
    complexity: 'basic'
  },
  {
    id: 'string-lowercase',
    name: 'To Lowercase',
    category: 'String Manipulation',
    description: 'Convert text to lowercase letters',
    useCase: 'Normalizing email addresses',
    code: 'return value.toLowerCase()',
    example: {
      input: '"JOHN@EXAMPLE.COM"',
      output: '"john@example.com"'
    },
    tags: ['text', 'format', 'case'],
    complexity: 'basic'
  },
  {
    id: 'string-title-case',
    name: 'Title Case',
    category: 'String Manipulation',
    description: 'Capitalize first letter of each word',
    useCase: 'Formatting proper names and titles',
    code: 'return value.split(\' \').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(\' \')',
    example: {
      input: '"john doe"',
      output: '"John Doe"'
    },
    tags: ['text', 'format', 'case'],
    complexity: 'intermediate'
  },
  {
    id: 'string-trim',
    name: 'Trim Whitespace',
    category: 'String Manipulation',
    description: 'Remove leading and trailing spaces',
    useCase: 'Cleaning user input data',
    code: 'return value.trim()',
    example: {
      input: '"  hello  "',
      output: '"hello"'
    },
    tags: ['text', 'clean', 'whitespace'],
    complexity: 'basic'
  },
  {
    id: 'string-extract-domain',
    name: 'Extract Domain',
    category: 'String Manipulation',
    description: 'Get domain from email address',
    useCase: 'Segmenting users by company',
    code: 'return value.split(\'@\')[1]',
    example: {
      input: '"user@example.com"',
      output: '"example.com"'
    },
    tags: ['email', 'parse', 'extract'],
    complexity: 'basic'
  },
  {
    id: 'string-first-name',
    name: 'First Name',
    category: 'String Manipulation',
    description: 'Extract first name from full name',
    useCase: 'Personalizing email greetings',
    code: 'return value.split(\' \')[0]',
    example: {
      input: '"John Doe"',
      output: '"John"'
    },
    tags: ['name', 'parse', 'extract'],
    complexity: 'basic'
  },
  {
    id: 'string-last-name',
    name: 'Last Name',
    category: 'String Manipulation',
    description: 'Extract last name from full name',
    useCase: 'Organizing contacts alphabetically',
    code: 'return value.split(\' \').slice(-1)[0]',
    example: {
      input: '"John Michael Doe"',
      output: '"Doe"'
    },
    tags: ['name', 'parse', 'extract'],
    complexity: 'basic'
  },
  {
    id: 'string-truncate',
    name: 'Truncate Text',
    category: 'String Manipulation',
    description: 'Limit text length with ellipsis',
    useCase: 'Creating preview text for long descriptions',
    code: 'return value.length > 50 ? value.slice(0, 50) + \'...\' : value',
    example: {
      input: '"This is a very long description that needs to be truncated"',
      output: '"This is a very long description that needs to b..."'
    },
    tags: ['text', 'limit', 'truncate'],
    complexity: 'basic'
  },
  {
    id: 'string-slug',
    name: 'URL Slug',
    category: 'String Manipulation',
    description: 'Create URL-friendly slug',
    useCase: 'Generating SEO-friendly URLs',
    code: 'return value.toLowerCase().replace(/[^a-z0-9]+/g, \'-\').replace(/^-|-$/g, \'\')',
    example: {
      input: '"Hello World! How are you?"',
      output: '"hello-world-how-are-you"'
    },
    tags: ['url', 'slug', 'seo'],
    complexity: 'intermediate'
  },
  {
    id: 'string-remove-special-chars',
    name: 'Remove Special Characters',
    category: 'String Manipulation',
    description: 'Keep only alphanumeric characters',
    useCase: 'Sanitizing phone numbers',
    code: 'return value.replace(/[^a-zA-Z0-9]/g, \'\')',
    example: {
      input: '"(555) 123-4567"',
      output: '"5551234567"'
    },
    tags: ['clean', 'sanitize', 'phone'],
    complexity: 'basic'
  },

  {
    id: 'date-format-readable',
    name: 'Readable Date',
    category: 'Date & Time',
    description: 'Convert to human-readable date',
    useCase: 'Displaying dates in UI',
    code: 'return new Date(value).toLocaleDateString(\'en-US\', { year: \'numeric\', month: \'long\', day: \'numeric\' })',
    example: {
      input: '"2024-01-15"',
      output: '"January 15, 2024"'
    },
    tags: ['date', 'format', 'display'],
    complexity: 'basic'
  },
  {
    id: 'date-iso',
    name: 'ISO Date String',
    category: 'Date & Time',
    description: 'Convert to ISO 8601 format',
    useCase: 'Standardizing date formats for APIs',
    code: 'return new Date(value).toISOString()',
    example: {
      input: '"Jan 15, 2024"',
      output: '"2024-01-15T00:00:00.000Z"'
    },
    tags: ['date', 'iso', 'standard'],
    complexity: 'basic'
  },
  {
    id: 'date-unix-to-iso',
    name: 'Unix to ISO',
    category: 'Date & Time',
    description: 'Unix timestamp to ISO string',
    useCase: 'Converting server timestamps',
    code: 'return new Date(value * 1000).toISOString()',
    example: {
      input: '1705334400',
      output: '"2024-01-15T12:00:00.000Z"'
    },
    tags: ['timestamp', 'unix', 'convert'],
    complexity: 'basic'
  },
  {
    id: 'date-relative',
    name: 'Relative Time',
    category: 'Date & Time',
    description: 'Show time elapsed (e.g., "2h ago")',
    useCase: 'Displaying post timestamps',
    code: `const diff = Date.now() - new Date(value).getTime();
const hours = Math.floor(diff / 36e5);
const days = Math.floor(hours / 24);
if (days > 0) return \`\${days}d ago\`;
if (hours > 0) return \`\${hours}h ago\`;
return \`\${Math.floor(diff / 6e4)}m ago\``,
    example: {
      input: '"2024-01-15T10:00:00Z"',
      output: '"2h ago"'
    },
    tags: ['time', 'relative', 'elapsed'],
    complexity: 'intermediate'
  },
  {
    id: 'date-day-of-week',
    name: 'Day of Week',
    category: 'Date & Time',
    description: 'Get weekday name',
    useCase: 'Scheduling and calendar displays',
    code: 'return new Date(value).toLocaleDateString(\'en-US\', { weekday: \'long\' })',
    example: {
      input: '"2024-01-15"',
      output: '"Monday"'
    },
    tags: ['date', 'weekday', 'calendar'],
    complexity: 'basic'
  },
  {
    id: 'date-quarter',
    name: 'Fiscal Quarter',
    category: 'Date & Time',
    industry: 'Finance',
    description: 'Calculate fiscal quarter',
    useCase: 'Financial reporting periods',
    code: 'const month = new Date(value).getMonth(); return `Q${Math.floor(month / 3) + 1}`',
    example: {
      input: '"2024-04-15"',
      output: '"Q2"'
    },
    tags: ['finance', 'quarter', 'fiscal'],
    complexity: 'intermediate'
  },
  {
    id: 'date-age',
    name: 'Calculate Age',
    category: 'Date & Time',
    description: 'Get age from birthdate',
    useCase: 'Customer demographics',
    code: 'const today = new Date(); const birth = new Date(value); let age = today.getFullYear() - birth.getFullYear(); const m = today.getMonth() - birth.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--; return age',
    example: {
      input: '"1990-05-15"',
      output: '34'
    },
    tags: ['age', 'calculate', 'birthdate'],
    complexity: 'intermediate'
  },

  {
    id: 'number-parse',
    name: 'Parse Number',
    category: 'Number Formatting',
    description: 'Convert string to number',
    useCase: 'Processing numeric input',
    code: 'return parseFloat(value)',
    example: {
      input: '"42.5"',
      output: '42.5'
    },
    tags: ['number', 'parse', 'convert'],
    complexity: 'basic'
  },
  {
    id: 'number-percentage',
    name: 'To Percentage',
    category: 'Number Formatting',
    description: 'Convert decimal to percentage',
    useCase: 'Displaying conversion rates',
    code: 'return (value * 100).toFixed(1) + \'%\'',
    example: {
      input: '0.753',
      output: '"75.3%"'
    },
    tags: ['percentage', 'format', 'display'],
    complexity: 'basic'
  },
  {
    id: 'number-currency-usd',
    name: 'USD Currency',
    category: 'Number Formatting',
    description: 'Format as US dollar amount',
    useCase: 'E-commerce pricing',
    code: 'return new Intl.NumberFormat(\'en-US\', { style: \'currency\', currency: \'USD\' }).format(value)',
    example: {
      input: '1234.56',
      output: '"$1,234.56"'
    },
    tags: ['currency', 'money', 'usd'],
    complexity: 'basic'
  },
  {
    id: 'number-currency-eur',
    name: 'EUR Currency',
    category: 'Number Formatting',
    description: 'Format as Euro amount',
    useCase: 'International pricing',
    code: 'return new Intl.NumberFormat(\'de-DE\', { style: \'currency\', currency: \'EUR\' }).format(value)',
    example: {
      input: '1234.56',
      output: '"1.234,56 €"'
    },
    tags: ['currency', 'money', 'eur'],
    complexity: 'basic'
  },
  {
    id: 'number-thousands',
    name: 'Thousands Separator',
    category: 'Number Formatting',
    description: 'Add comma separators',
    useCase: 'Displaying large numbers',
    code: 'return value.toLocaleString(\'en-US\')',
    example: {
      input: '1234567',
      output: '"1,234,567"'
    },
    tags: ['format', 'separator', 'display'],
    complexity: 'basic'
  },
  {
    id: 'number-round',
    name: 'Round Number',
    category: 'Number Formatting',
    description: 'Round to nearest integer',
    useCase: 'Simplifying metric displays',
    code: 'return Math.round(value)',
    example: {
      input: '42.7',
      output: '43'
    },
    tags: ['round', 'math', 'integer'],
    complexity: 'basic'
  },
  {
    id: 'number-decimal-places',
    name: 'Fixed Decimal Places',
    category: 'Number Formatting',
    description: 'Round to specific decimal places',
    useCase: 'Precise financial calculations',
    code: 'return parseFloat(value.toFixed(2))',
    example: {
      input: '42.6789',
      output: '42.68'
    },
    tags: ['decimal', 'precision', 'round'],
    complexity: 'basic'
  },
  {
    id: 'number-abbreviate',
    name: 'Abbreviate Large Numbers',
    category: 'Number Formatting',
    description: 'Convert to K, M, B notation',
    useCase: 'Social media metrics display',
    code: `if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
return value.toString()`,
    example: {
      input: '1234567',
      output: '"1.2M"'
    },
    tags: ['abbreviate', 'compact', 'display'],
    complexity: 'intermediate'
  },

  {
    id: 'array-length',
    name: 'Array Length',
    category: 'Array Operations',
    description: 'Count array items',
    useCase: 'Counting list items',
    code: 'return value.length',
    example: {
      input: '[1, 2, 3, 4, 5]',
      output: '5'
    },
    tags: ['array', 'count', 'length'],
    complexity: 'basic'
  },
  {
    id: 'array-first',
    name: 'First Item',
    category: 'Array Operations',
    description: 'Get first element',
    useCase: 'Getting most recent item',
    code: 'return value[0]',
    example: {
      input: '["apple", "banana", "cherry"]',
      output: '"apple"'
    },
    tags: ['array', 'first', 'access'],
    complexity: 'basic'
  },
  {
    id: 'array-last',
    name: 'Last Item',
    category: 'Array Operations',
    description: 'Get last element',
    useCase: 'Getting oldest item',
    code: 'return value[value.length - 1]',
    example: {
      input: '["apple", "banana", "cherry"]',
      output: '"cherry"'
    },
    tags: ['array', 'last', 'access'],
    complexity: 'basic'
  },
  {
    id: 'array-join',
    name: 'Join Array',
    category: 'Array Operations',
    description: 'Combine with separator',
    useCase: 'Creating comma-separated lists',
    code: 'return value.join(\', \')',
    example: {
      input: '["apple", "banana", "cherry"]',
      output: '"apple, banana, cherry"'
    },
    tags: ['array', 'join', 'string'],
    complexity: 'basic'
  },
  {
    id: 'array-extract-property',
    name: 'Extract Property',
    category: 'Array Operations',
    description: 'Map to property values',
    useCase: 'Getting list of names from objects',
    code: 'return value.map(item => item.name)',
    example: {
      input: '[{name: "Alice"}, {name: "Bob"}]',
      output: '["Alice", "Bob"]'
    },
    tags: ['array', 'map', 'property'],
    complexity: 'intermediate'
  },
  {
    id: 'array-filter-active',
    name: 'Filter Active Items',
    category: 'Array Operations',
    description: 'Keep only active items',
    useCase: 'Filtering active subscriptions',
    code: 'return value.filter(item => item.active)',
    example: {
      input: '[{id:1, active:true}, {id:2, active:false}]',
      output: '[{id:1, active:true}]'
    },
    tags: ['array', 'filter', 'active'],
    complexity: 'intermediate'
  },
  {
    id: 'array-sum',
    name: 'Sum Values',
    category: 'Array Operations',
    description: 'Calculate total',
    useCase: 'Calculating cart total',
    code: 'return value.reduce((sum, item) => sum + item.price, 0)',
    example: {
      input: '[{price: 10}, {price: 20}, {price: 15}]',
      output: '45'
    },
    tags: ['array', 'sum', 'total'],
    complexity: 'intermediate'
  },
  {
    id: 'array-average',
    name: 'Calculate Average',
    category: 'Array Operations',
    description: 'Get mean value',
    useCase: 'Average rating calculation',
    code: 'const sum = value.reduce((a, b) => a + b, 0); return sum / value.length',
    example: {
      input: '[10, 20, 30, 40]',
      output: '25'
    },
    tags: ['array', 'average', 'mean'],
    complexity: 'intermediate'
  },
  {
    id: 'array-unique',
    name: 'Remove Duplicates',
    category: 'Array Operations',
    description: 'Get unique values',
    useCase: 'Deduplicating tag lists',
    code: 'return [...new Set(value)]',
    example: {
      input: '[1, 2, 2, 3, 3, 3]',
      output: '[1, 2, 3]'
    },
    tags: ['array', 'unique', 'deduplicate'],
    complexity: 'intermediate'
  },
  {
    id: 'array-sort-asc',
    name: 'Sort Ascending',
    category: 'Array Operations',
    description: 'Sort numbers low to high',
    useCase: 'Organizing pricing tiers',
    code: 'return [...value].sort((a, b) => a - b)',
    example: {
      input: '[30, 10, 20]',
      output: '[10, 20, 30]'
    },
    tags: ['array', 'sort', 'ascending'],
    complexity: 'intermediate'
  },
  {
    id: 'array-sort-desc',
    name: 'Sort Descending',
    category: 'Array Operations',
    description: 'Sort numbers high to low',
    useCase: 'Top performers leaderboard',
    code: 'return [...value].sort((a, b) => b - a)',
    example: {
      input: '[10, 30, 20]',
      output: '[30, 20, 10]'
    },
    tags: ['array', 'sort', 'descending'],
    complexity: 'intermediate'
  },

  {
    id: 'ecommerce-tax',
    name: 'Calculate Tax',
    category: 'E-Commerce',
    industry: 'Retail',
    description: 'Add sales tax to price',
    useCase: 'Order total calculation',
    code: 'const taxRate = 0.0875; return (value * (1 + taxRate)).toFixed(2)',
    example: {
      input: '100.00',
      output: '"108.75"'
    },
    tags: ['tax', 'price', 'calculation'],
    complexity: 'basic'
  },
  {
    id: 'ecommerce-discount',
    name: 'Apply Discount',
    category: 'E-Commerce',
    industry: 'Retail',
    description: 'Calculate discounted price',
    useCase: 'Promotional pricing',
    code: 'const discount = payload.discountPercent / 100; return (value * (1 - discount)).toFixed(2)',
    example: {
      input: 'price: 100, discountPercent: 20',
      output: '"80.00"'
    },
    tags: ['discount', 'price', 'promotion'],
    complexity: 'basic'
  },
  {
    id: 'ecommerce-margin',
    name: 'Profit Margin',
    category: 'E-Commerce',
    industry: 'Retail',
    description: 'Calculate profit margin percentage',
    useCase: 'Product profitability analysis',
    code: 'const margin = ((payload.price - payload.cost) / payload.price) * 100; return margin.toFixed(1) + \'%\'',
    example: {
      input: 'price: 100, cost: 60',
      output: '"40.0%"'
    },
    tags: ['margin', 'profit', 'finance'],
    complexity: 'intermediate'
  },
  {
    id: 'ecommerce-sku',
    name: 'Generate SKU',
    category: 'E-Commerce',
    industry: 'Retail',
    description: 'Create product SKU code',
    useCase: 'Inventory management',
    code: 'const category = payload.category.substring(0, 3).toUpperCase(); const id = String(payload.id).padStart(6, \'0\'); return `${category}-${id}`',
    example: {
      input: 'category: "Electronics", id: 42',
      output: '"ELE-000042"'
    },
    tags: ['sku', 'inventory', 'product'],
    complexity: 'intermediate'
  },
  {
    id: 'ecommerce-shipping-tier',
    name: 'Shipping Tier',
    category: 'E-Commerce',
    industry: 'Retail',
    description: 'Determine shipping cost tier',
    useCase: 'Logistics cost calculation',
    code: 'if (value < 50) return \'Standard\'; if (value < 100) return \'Express\'; return \'Overnight\'',
    example: {
      input: '75.00',
      output: '"Express"'
    },
    tags: ['shipping', 'logistics', 'tier'],
    complexity: 'basic'
  },

  {
    id: 'crm-lead-score',
    name: 'Lead Score',
    category: 'CRM & Sales',
    industry: 'Sales',
    description: 'Calculate lead qualification score',
    useCase: 'Sales prioritization',
    code: `let score = 0;
if (payload.company) score += 20;
if (payload.jobTitle?.includes('Director') || payload.jobTitle?.includes('VP')) score += 30;
if (payload.employees > 50) score += 25;
if (payload.engagement > 5) score += 25;
return score`,
    example: {
      input: 'company: "Acme", jobTitle: "VP Sales", employees: 100, engagement: 7',
      output: '100'
    },
    tags: ['lead', 'score', 'sales'],
    complexity: 'advanced'
  },
  {
    id: 'crm-full-name',
    name: 'Full Name',
    category: 'CRM & Sales',
    description: 'Combine first and last name',
    useCase: 'Contact display formatting',
    code: 'return `${payload.firstName} ${payload.lastName}`.trim()',
    example: {
      input: 'firstName: "John", lastName: "Doe"',
      output: '"John Doe"'
    },
    tags: ['name', 'contact', 'format'],
    complexity: 'basic'
  },
  {
    id: 'crm-company-size',
    name: 'Company Size Category',
    category: 'CRM & Sales',
    industry: 'Sales',
    description: 'Categorize by employee count',
    useCase: 'Market segmentation',
    code: 'if (value < 10) return \'Startup\'; if (value < 50) return \'Small\'; if (value < 250) return \'Medium\'; return \'Enterprise\'',
    example: {
      input: '150',
      output: '"Medium"'
    },
    tags: ['company', 'segmentation', 'size'],
    complexity: 'basic'
  },
  {
    id: 'crm-deal-stage-days',
    name: 'Days in Stage',
    category: 'CRM & Sales',
    industry: 'Sales',
    description: 'Calculate time in current stage',
    useCase: 'Pipeline velocity tracking',
    code: 'const entered = new Date(payload.stageEnteredAt); const now = new Date(); return Math.floor((now - entered) / (1000 * 60 * 60 * 24))',
    example: {
      input: 'stageEnteredAt: "2024-01-01"',
      output: '14'
    },
    tags: ['pipeline', 'time', 'stage'],
    complexity: 'intermediate'
  },

  {
    id: 'marketing-conversion-rate',
    name: 'Conversion Rate',
    category: 'Marketing & Analytics',
    industry: 'Marketing',
    description: 'Calculate conversion percentage',
    useCase: 'Campaign performance metrics',
    code: 'return ((payload.conversions / payload.visitors) * 100).toFixed(2) + \'%\'',
    example: {
      input: 'conversions: 150, visitors: 5000',
      output: '"3.00%"'
    },
    tags: ['conversion', 'rate', 'analytics'],
    complexity: 'basic'
  },
  {
    id: 'marketing-ctr',
    name: 'Click-Through Rate',
    category: 'Marketing & Analytics',
    industry: 'Marketing',
    description: 'Calculate CTR percentage',
    useCase: 'Ad performance tracking',
    code: 'return ((payload.clicks / payload.impressions) * 100).toFixed(2) + \'%\'',
    example: {
      input: 'clicks: 500, impressions: 50000',
      output: '"1.00%"'
    },
    tags: ['ctr', 'ads', 'performance'],
    complexity: 'basic'
  },
  {
    id: 'marketing-cpa',
    name: 'Cost Per Acquisition',
    category: 'Marketing & Analytics',
    industry: 'Marketing',
    description: 'Calculate CPA',
    useCase: 'Budget optimization',
    code: 'return (payload.spend / payload.acquisitions).toFixed(2)',
    example: {
      input: 'spend: 5000, acquisitions: 100',
      output: '"50.00"'
    },
    tags: ['cpa', 'cost', 'acquisition'],
    complexity: 'basic'
  },
  {
    id: 'marketing-roas',
    name: 'Return on Ad Spend',
    category: 'Marketing & Analytics',
    industry: 'Marketing',
    description: 'Calculate ROAS',
    useCase: 'Campaign ROI analysis',
    code: 'return ((payload.revenue / payload.spend) * 100).toFixed(0) + \'%\'',
    example: {
      input: 'revenue: 15000, spend: 5000',
      output: '"300%"'
    },
    tags: ['roas', 'roi', 'revenue'],
    complexity: 'basic'
  },
  {
    id: 'marketing-utm-campaign',
    name: 'Extract UTM Campaign',
    category: 'Marketing & Analytics',
    industry: 'Marketing',
    description: 'Parse campaign from URL',
    useCase: 'Campaign attribution',
    code: 'const url = new URL(value); return url.searchParams.get(\'utm_campaign\') || \'direct\'',
    example: {
      input: '"https://example.com?utm_campaign=summer_sale"',
      output: '"summer_sale"'
    },
    tags: ['utm', 'campaign', 'attribution'],
    complexity: 'intermediate'
  },

  {
    id: 'finance-compound-growth',
    name: 'Compound Growth Rate',
    category: 'Financial Calculations',
    industry: 'Finance',
    description: 'Calculate CAGR',
    useCase: 'Investment performance',
    code: 'const years = payload.periods; return ((Math.pow(value / payload.initial, 1 / years) - 1) * 100).toFixed(2) + \'%\'',
    example: {
      input: 'initial: 1000, final: 1500, periods: 3',
      output: '"14.47%"'
    },
    tags: ['growth', 'cagr', 'investment'],
    complexity: 'advanced'
  },
  {
    id: 'finance-mrr',
    name: 'Monthly Recurring Revenue',
    category: 'Financial Calculations',
    industry: 'SaaS',
    description: 'Calculate MRR from subscriptions',
    useCase: 'SaaS revenue tracking',
    code: 'return value.filter(sub => sub.active).reduce((sum, sub) => sum + sub.amount, 0)',
    example: {
      input: '[{active:true, amount:99}, {active:true, amount:199}]',
      output: '298'
    },
    tags: ['mrr', 'saas', 'revenue'],
    complexity: 'intermediate'
  },
  {
    id: 'finance-churn-rate',
    name: 'Churn Rate',
    category: 'Financial Calculations',
    industry: 'SaaS',
    description: 'Calculate customer churn',
    useCase: 'Retention analysis',
    code: 'return ((payload.lost / payload.total) * 100).toFixed(2) + \'%\'',
    example: {
      input: 'lost: 15, total: 500',
      output: '"3.00%"'
    },
    tags: ['churn', 'retention', 'saas'],
    complexity: 'basic'
  },
  {
    id: 'finance-ltv',
    name: 'Lifetime Value',
    category: 'Financial Calculations',
    industry: 'SaaS',
    description: 'Calculate customer LTV',
    useCase: 'Customer value analysis',
    code: 'const avgMonths = 1 / (payload.churnRate / 100); return (payload.monthlyRevenue * avgMonths).toFixed(2)',
    example: {
      input: 'monthlyRevenue: 100, churnRate: 5',
      output: '"2000.00"'
    },
    tags: ['ltv', 'value', 'saas'],
    complexity: 'advanced'
  },

  {
    id: 'hr-tenure',
    name: 'Employee Tenure',
    category: 'HR & Workforce',
    industry: 'Human Resources',
    description: 'Calculate years of service',
    useCase: 'Benefits eligibility',
    code: 'const hired = new Date(value); const years = (Date.now() - hired.getTime()) / (365.25 * 24 * 60 * 60 * 1000); return Math.floor(years)',
    example: {
      input: '"2020-06-15"',
      output: '4'
    },
    tags: ['tenure', 'employee', 'years'],
    complexity: 'intermediate'
  },
  {
    id: 'hr-pto-accrual',
    name: 'PTO Accrual',
    category: 'HR & Workforce',
    industry: 'Human Resources',
    description: 'Calculate vacation days earned',
    useCase: 'Time-off tracking',
    code: 'const dailyRate = 1.67; const daysWorked = Math.floor((Date.now() - new Date(payload.lastReset)) / (24 * 60 * 60 * 1000)); return (daysWorked * dailyRate / 30).toFixed(1)',
    example: {
      input: 'lastReset: "2024-01-01"',
      output: '"1.7"'
    },
    tags: ['pto', 'vacation', 'accrual'],
    complexity: 'advanced'
  },

  {
    id: 'logistics-tracking-status',
    name: 'Shipping Status',
    category: 'Logistics & Supply Chain',
    industry: 'Logistics',
    description: 'Map tracking code to status',
    useCase: 'Order tracking',
    code: `const statusMap = {
  'OS': 'Order Placed',
  'PP': 'Processing',
  'SH': 'Shipped',
  'IT': 'In Transit',
  'OD': 'Out for Delivery',
  'DL': 'Delivered'
};
return statusMap[value] || 'Unknown'`,
    example: {
      input: '"IT"',
      output: '"In Transit"'
    },
    tags: ['shipping', 'status', 'tracking'],
    complexity: 'basic'
  },
  {
    id: 'logistics-delivery-eta',
    name: 'Delivery ETA',
    category: 'Logistics & Supply Chain',
    industry: 'Logistics',
    description: 'Calculate estimated delivery date',
    useCase: 'Customer communication',
    code: 'const shipped = new Date(payload.shippedAt); const transitDays = payload.shippingMethod === "express" ? 2 : 5; const eta = new Date(shipped.getTime() + transitDays * 24 * 60 * 60 * 1000); return eta.toLocaleDateString()',
    example: {
      input: 'shippedAt: "2024-01-15", shippingMethod: "express"',
      output: '"1/17/2024"'
    },
    tags: ['delivery', 'eta', 'shipping'],
    complexity: 'intermediate'
  },

  {
    id: 'healthcare-bmi',
    name: 'Body Mass Index',
    category: 'Healthcare & Wellness',
    industry: 'Healthcare',
    description: 'Calculate BMI',
    useCase: 'Health assessments',
    code: 'const heightM = payload.heightCm / 100; return (payload.weightKg / (heightM * heightM)).toFixed(1)',
    example: {
      input: 'weightKg: 70, heightCm: 175',
      output: '"22.9"'
    },
    tags: ['bmi', 'health', 'wellness'],
    complexity: 'basic'
  },
  {
    id: 'healthcare-age-group',
    name: 'Age Group Category',
    category: 'Healthcare & Wellness',
    industry: 'Healthcare',
    description: 'Categorize by age ranges',
    useCase: 'Demographic analysis',
    code: 'if (value < 18) return \'Pediatric\'; if (value < 65) return \'Adult\'; return \'Senior\'',
    example: {
      input: '45',
      output: '"Adult"'
    },
    tags: ['age', 'category', 'demographics'],
    complexity: 'basic'
  },

  {
    id: 'social-engagement-rate',
    name: 'Engagement Rate',
    category: 'Social Media',
    industry: 'Social Media',
    description: 'Calculate post engagement',
    useCase: 'Content performance',
    code: 'const total = payload.likes + payload.comments + payload.shares; return ((total / payload.followers) * 100).toFixed(2) + \'%\'',
    example: {
      input: 'likes: 150, comments: 20, shares: 10, followers: 5000',
      output: '"3.60%"'
    },
    tags: ['engagement', 'social', 'metrics'],
    complexity: 'intermediate'
  },
  {
    id: 'social-hashtag-extract',
    name: 'Extract Hashtags',
    category: 'Social Media',
    industry: 'Social Media',
    description: 'Parse hashtags from text',
    useCase: 'Content categorization',
    code: 'return value.match(/#\\w+/g) || []',
    example: {
      input: '"Check out our new product! #tech #innovation #startup"',
      output: '["#tech", "#innovation", "#startup"]'
    },
    tags: ['hashtag', 'parse', 'social'],
    complexity: 'intermediate'
  },
  {
    id: 'social-mention-extract',
    name: 'Extract Mentions',
    category: 'Social Media',
    industry: 'Social Media',
    description: 'Parse @mentions from text',
    useCase: 'User engagement tracking',
    code: 'return value.match(/@\\w+/g) || []',
    example: {
      input: '"Thanks @john and @sarah for the help!"',
      output: '["@john", "@sarah"]'
    },
    tags: ['mention', 'parse', 'social'],
    complexity: 'intermediate'
  },

  {
    id: 'education-grade-letter',
    name: 'Numeric to Letter Grade',
    category: 'Education',
    industry: 'Education',
    description: 'Convert score to letter grade',
    useCase: 'Academic reporting',
    code: 'if (value >= 90) return \'A\'; if (value >= 80) return \'B\'; if (value >= 70) return \'C\'; if (value >= 60) return \'D\'; return \'F\'',
    example: {
      input: '85',
      output: '"B"'
    },
    tags: ['grade', 'score', 'academic'],
    complexity: 'basic'
  },
  {
    id: 'education-gpa',
    name: 'Calculate GPA',
    category: 'Education',
    industry: 'Education',
    description: 'Calculate grade point average',
    useCase: 'Academic performance',
    code: 'const gradePoints = {A: 4, B: 3, C: 2, D: 1, F: 0}; const total = value.reduce((sum, grade) => sum + gradePoints[grade], 0); return (total / value.length).toFixed(2)',
    example: {
      input: '["A", "B", "A", "B"]',
      output: '"3.50"'
    },
    tags: ['gpa', 'academic', 'average'],
    complexity: 'intermediate'
  },

  {
    id: 'boolean-has-value',
    name: 'Has Value',
    category: 'Boolean & Validation',
    description: 'Check if value exists',
    useCase: 'Required field validation',
    code: 'return value !== undefined && value !== null && value !== \'\'',
    example: {
      input: 'null',
      output: 'false'
    },
    tags: ['validation', 'check', 'exists'],
    complexity: 'basic'
  },
  {
    id: 'boolean-is-empty',
    name: 'Is Empty',
    category: 'Boolean & Validation',
    description: 'Check if value is empty',
    useCase: 'Empty state detection',
    code: 'return !value || value.length === 0',
    example: {
      input: '[]',
      output: 'true'
    },
    tags: ['validation', 'empty', 'check'],
    complexity: 'basic'
  },
  {
    id: 'boolean-is-email',
    name: 'Is Valid Email',
    category: 'Boolean & Validation',
    description: 'Validate email format',
    useCase: 'Form validation',
    code: 'return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)',
    example: {
      input: '"user@example.com"',
      output: 'true'
    },
    tags: ['validation', 'email', 'regex'],
    complexity: 'intermediate'
  },
  {
    id: 'boolean-is-url',
    name: 'Is Valid URL',
    category: 'Boolean & Validation',
    description: 'Validate URL format',
    useCase: 'Link validation',
    code: 'try { new URL(value); return true; } catch { return false; }',
    example: {
      input: '"https://example.com"',
      output: 'true'
    },
    tags: ['validation', 'url', 'link'],
    complexity: 'intermediate'
  },
  {
    id: 'boolean-is-phone',
    name: 'Is Valid Phone',
    category: 'Boolean & Validation',
    description: 'Validate US phone number',
    useCase: 'Contact validation',
    code: 'return /^\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$/.test(value)',
    example: {
      input: '"(555) 123-4567"',
      output: 'true'
    },
    tags: ['validation', 'phone', 'regex'],
    complexity: 'intermediate'
  },

  {
    id: 'json-parse',
    name: 'Parse JSON',
    category: 'Data Transformation',
    description: 'Parse JSON string to object',
    useCase: 'API response parsing',
    code: 'return JSON.parse(value)',
    example: {
      input: '\'{"name":"John","age":30}\'',
      output: '{name: "John", age: 30}'
    },
    tags: ['json', 'parse', 'object'],
    complexity: 'basic'
  },
  {
    id: 'json-stringify',
    name: 'Stringify Object',
    category: 'Data Transformation',
    description: 'Convert object to JSON string',
    useCase: 'API request formatting',
    code: 'return JSON.stringify(value)',
    example: {
      input: '{name: "John", age: 30}',
      output: '\'{"name":"John","age":30}\''
    },
    tags: ['json', 'stringify', 'string'],
    complexity: 'basic'
  },
  {
    id: 'object-get-nested',
    name: 'Get Nested Property',
    category: 'Data Transformation',
    description: 'Safely access nested object property',
    useCase: 'Deep property extraction',
    code: 'return value?.user?.profile?.email',
    example: {
      input: '{user: {profile: {email: "test@example.com"}}}',
      output: '"test@example.com"'
    },
    tags: ['object', 'nested', 'property'],
    complexity: 'intermediate'
  },
  {
    id: 'object-flatten',
    name: 'Flatten Object',
    category: 'Data Transformation',
    description: 'Convert nested to flat structure',
    useCase: 'CSV export preparation',
    code: 'const flat = {}; Object.keys(value).forEach(key => { if (typeof value[key] === \'object\' && value[key] !== null) Object.keys(value[key]).forEach(k => flat[`${key}_${k}`] = value[key][k]); else flat[key] = value[key]; }); return flat',
    example: {
      input: '{user: {name: "John", age: 30}}',
      output: '{user_name: "John", user_age: 30}'
    },
    tags: ['object', 'flatten', 'transform'],
    complexity: 'advanced'
  }
]

export const transformCategories = Array.from(
  new Set(transformPatterns.map(p => p.category))
).sort()

export const transformIndustries = Array.from(
  new Set(transformPatterns.filter(p => p.industry).map(p => p.industry!))
).sort()

export const getPatternsByCategory = (category: string) => {
  return transformPatterns.filter(p => p.category === category)
}

export const getPatternsByIndustry = (industry: string) => {
  return transformPatterns.filter(p => p.industry === industry)
}

export const getPatternsByComplexity = (complexity: 'basic' | 'intermediate' | 'advanced') => {
  return transformPatterns.filter(p => p.complexity === complexity)
}

export const searchPatterns = (query: string) => {
  const lowerQuery = query.toLowerCase()
  return transformPatterns.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.useCase.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
