export interface DataConnector {
  id: string
  name: string
  description: string
  category: 'api' | 'database' | 'file' | 'realtime'
  icon: string
  config: ConnectorConfig
  transform?: (data: any) => any
}

export interface ConnectorConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  params?: Record<string, any>
  body?: any
  authType?: 'none' | 'bearer' | 'api-key' | 'basic'
  authConfig?: AuthConfig
  refreshInterval?: number
  pagination?: PaginationConfig
  rateLimit?: RateLimitConfig
}

export interface AuthConfig {
  token?: string
  apiKey?: string
  username?: string
  password?: string
  headerName?: string
}

export interface PaginationConfig {
  type: 'offset' | 'cursor' | 'page'
  pageSize: number
  pageParam?: string
  offsetParam?: string
  cursorParam?: string
}

export interface RateLimitConfig {
  maxRequests: number
  perMilliseconds: number
}

export interface DrillDownConfig {
  enabled: boolean
  levels: DrillDownLevel[]
  contextKey?: string
}

export interface DrillDownLevel {
  name: string
  connector: DataConnector
  parentKeyMapping?: Record<string, string>
  transform?: (data: any, context: any) => any
}

export interface ConnectorExecutionResult {
  success: boolean
  data?: any
  error?: string
  timestamp: number
  cached?: boolean
}

class DataConnectorService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private rateLimitTrackers: Map<string, number[]> = new Map()

  async executeConnector(
    connector: DataConnector,
    context?: Record<string, any>
  ): Promise<ConnectorExecutionResult> {
    try {
      if (!this.checkRateLimit(connector)) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          timestamp: Date.now(),
        }
      }

      const cacheKey = this.getCacheKey(connector, context)
      const cached = this.getFromCache(cacheKey, connector.config.refreshInterval)
      
      if (cached) {
        return {
          success: true,
          data: cached,
          timestamp: Date.now(),
          cached: true,
        }
      }

      const url = this.buildUrl(connector.config.url, connector.config.params, context)
      const headers = this.buildHeaders(connector.config)
      const options: RequestInit = {
        method: connector.config.method || 'GET',
        headers,
      }

      if (connector.config.body && connector.config.method !== 'GET') {
        options.body = JSON.stringify(connector.config.body)
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      let data = await response.json()

      if (connector.transform) {
        data = connector.transform(data)
      }

      this.setCache(cacheKey, data)
      this.trackRateLimit(connector)

      return {
        success: true,
        data,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      }
    }
  }

  async executeDrillDown(
    drillDownConfig: DrillDownConfig,
    levelIndex: number,
    context: Record<string, any>
  ): Promise<ConnectorExecutionResult> {
    if (!drillDownConfig.enabled || levelIndex >= drillDownConfig.levels.length) {
      return {
        success: false,
        error: 'Invalid drill-down level',
        timestamp: Date.now(),
      }
    }

    const level = drillDownConfig.levels[levelIndex]
    const mappedContext = this.mapContext(context, level.parentKeyMapping)
    
    const result = await this.executeConnector(level.connector, mappedContext)

    if (result.success && level.transform) {
      result.data = level.transform(result.data, context)
    }

    return result
  }

  private buildUrl(
    baseUrl: string,
    params?: Record<string, any>,
    context?: Record<string, any>
  ): string {
    let url = baseUrl

    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, String(value))
      })
    }

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      url += `?${searchParams.toString()}`
    }

    return url
  }

  private buildHeaders(config: ConnectorConfig): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...config.headers,
    }

    if (config.authType && config.authConfig) {
      switch (config.authType) {
        case 'bearer':
          if (config.authConfig.token) {
            headers['Authorization'] = `Bearer ${config.authConfig.token}`
          }
          break
        case 'api-key':
          if (config.authConfig.apiKey && config.authConfig.headerName) {
            headers[config.authConfig.headerName] = config.authConfig.apiKey
          }
          break
        case 'basic':
          if (config.authConfig.username && config.authConfig.password) {
            const credentials = btoa(`${config.authConfig.username}:${config.authConfig.password}`)
            headers['Authorization'] = `Basic ${credentials}`
          }
          break
      }
    }

    return headers
  }

  private getCacheKey(connector: DataConnector, context?: Record<string, any>): string {
    return `${connector.id}-${JSON.stringify(context || {})}`
  }

  private getFromCache(key: string, refreshInterval?: number): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (refreshInterval && Date.now() - cached.timestamp > refreshInterval) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private checkRateLimit(connector: DataConnector): boolean {
    if (!connector.config.rateLimit) return true

    const now = Date.now()
    const { maxRequests, perMilliseconds } = connector.config.rateLimit
    const requests = this.rateLimitTrackers.get(connector.id) || []
    
    const recentRequests = requests.filter(time => now - time < perMilliseconds)
    
    return recentRequests.length < maxRequests
  }

  private trackRateLimit(connector: DataConnector): void {
    if (!connector.config.rateLimit) return

    const requests = this.rateLimitTrackers.get(connector.id) || []
    requests.push(Date.now())
    this.rateLimitTrackers.set(connector.id, requests)
  }

  private mapContext(
    context: Record<string, any>,
    mapping?: Record<string, string>
  ): Record<string, any> {
    if (!mapping) return context

    const mapped: Record<string, any> = {}
    Object.entries(mapping).forEach(([sourceKey, targetKey]) => {
      if (context[sourceKey] !== undefined) {
        mapped[targetKey] = context[sourceKey]
      }
    })

    return { ...context, ...mapped }
  }

  clearCache(): void {
    this.cache.clear()
  }

  clearRateLimits(): void {
    this.rateLimitTrackers.clear()
  }
}

export const dataConnectorService = new DataConnectorService()

export const publicApiConnectors: DataConnector[] = [
  {
    id: 'jsonplaceholder-users',
    name: 'JSONPlaceholder Users',
    description: 'Sample user data from JSONPlaceholder API',
    category: 'api',
    icon: '👥',
    config: {
      url: 'https://jsonplaceholder.typicode.com/users',
      method: 'GET',
      refreshInterval: 60000,
    },
    transform: (data) => {
      return data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company.name,
        city: user.city || user.address?.city,
        website: user.website,
      }))
    },
  },
  {
    id: 'jsonplaceholder-posts',
    name: 'JSONPlaceholder Posts',
    description: 'Sample blog posts from JSONPlaceholder API',
    category: 'api',
    icon: '📝',
    config: {
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'GET',
      refreshInterval: 60000,
    },
    transform: (data) => {
      return data.map((post: any) => ({
        id: post.id,
        title: post.title,
        body: post.body,
        userId: post.userId,
        words: post.body.split(' ').length,
      }))
    },
  },
  {
    id: 'coinbase-btc',
    name: 'Bitcoin Price (Coinbase)',
    description: 'Real-time Bitcoin price data',
    category: 'api',
    icon: '₿',
    config: {
      url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
      method: 'GET',
      refreshInterval: 30000,
    },
    transform: (data) => {
      return {
        currency: data.data.base,
        price: parseFloat(data.data.amount),
        timestamp: new Date().toISOString(),
      }
    },
  },
  {
    id: 'github-trending',
    name: 'GitHub Trending',
    description: 'Trending repositories on GitHub',
    category: 'api',
    icon: '⭐',
    config: {
      url: 'https://api.github.com/search/repositories',
      method: 'GET',
      params: {
        q: 'stars:>1000',
        sort: 'stars',
        order: 'desc',
        per_page: 20,
      },
      refreshInterval: 300000,
    },
    transform: (data) => {
      return data.items.map((repo: any) => ({
        name: repo.name,
        owner: repo.owner.login,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        description: repo.description,
        url: repo.html_url,
      }))
    },
  },
  {
    id: 'cat-facts',
    name: 'Random Cat Facts',
    description: 'Fun cat facts from Cat Facts API',
    category: 'api',
    icon: '🐱',
    config: {
      url: 'https://catfact.ninja/facts',
      method: 'GET',
      params: {
        limit: 10,
      },
      refreshInterval: 60000,
    },
    transform: (data) => {
      return data.data.map((fact: any, idx: number) => ({
        id: idx + 1,
        fact: fact.fact,
        length: fact.length,
      }))
    },
  },
  {
    id: 'open-brewery',
    name: 'Open Brewery DB',
    description: 'Brewery information database',
    category: 'api',
    icon: '🍺',
    config: {
      url: 'https://api.openbrewerydb.org/v1/breweries',
      method: 'GET',
      params: {
        per_page: 50,
      },
      refreshInterval: 300000,
    },
    transform: (data) => {
      return data.map((brewery: any) => ({
        name: brewery.name,
        type: brewery.brewery_type,
        city: brewery.city,
        state: brewery.state,
        country: brewery.country,
        website: brewery.website_url,
      }))
    },
  },
  {
    id: 'exchangerate-api',
    name: 'Exchange Rates',
    description: 'Currency exchange rates',
    category: 'api',
    icon: '💱',
    config: {
      url: 'https://api.exchangerate-api.com/v4/latest/USD',
      method: 'GET',
      refreshInterval: 3600000,
    },
    transform: (data) => {
      return Object.entries(data.rates).map(([currency, rate]) => ({
        currency,
        rate: rate as number,
        base: data.base,
      }))
    },
  },
]

export const drillDownConnectors = {
  userPosts: {
    enabled: true,
    levels: [
      {
        name: 'User Posts',
        connector: {
          id: 'user-posts-drill',
          name: 'Posts by User',
          description: 'Get all posts by a specific user',
          category: 'api' as const,
          icon: '📝',
          config: {
            url: 'https://jsonplaceholder.typicode.com/users/{userId}/posts',
            method: 'GET' as const,
            refreshInterval: 60000,
          },
        },
        parentKeyMapping: {
          id: 'userId',
        },
      },
      {
        name: 'Post Comments',
        connector: {
          id: 'post-comments-drill',
          name: 'Comments on Post',
          description: 'Get all comments on a specific post',
          category: 'api' as const,
          icon: '💬',
          config: {
            url: 'https://jsonplaceholder.typicode.com/posts/{id}/comments',
            method: 'GET' as const,
            refreshInterval: 60000,
          },
        },
      },
    ],
  },
  githubRepoDetails: {
    enabled: true,
    levels: [
      {
        name: 'Repository Issues',
        connector: {
          id: 'repo-issues-drill',
          name: 'Repository Issues',
          description: 'Get issues for a repository',
          category: 'api' as const,
          icon: '🐛',
          config: {
            url: 'https://api.github.com/repos/{owner}/{name}/issues',
            method: 'GET' as const,
            params: {
              state: 'open',
              per_page: 20,
            },
            refreshInterval: 300000,
          },
          transform: (data: any) => {
            return data.map((issue: any) => ({
              title: issue.title,
              state: issue.state,
              comments: issue.comments,
              created: new Date(issue.created_at).toLocaleDateString(),
              labels: issue.labels.map((l: any) => l.name).join(', '),
            }))
          },
        },
      },
    ],
  },
}
