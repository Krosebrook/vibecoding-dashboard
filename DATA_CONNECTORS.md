# Data Connectors & Drill-Down System

## Overview

The Dashboard VibeCoder now includes a powerful data connector system that allows dashboards to fetch **real data from any API source**. This transforms static dashboards into live, production-ready applications.

## Features

### 🔌 Pre-Configured Public APIs

7+ ready-to-use connectors for popular public APIs:

- **JSONPlaceholder** - User and post data for testing
- **GitHub** - Trending repositories and stars
- **Coinbase** - Real-time cryptocurrency prices
- **Cat Facts** - Fun educational content
- **Open Brewery DB** - Brewery information
- **Exchange Rates** - Currency conversion rates
- **And more!**

### 🛠️ Custom Connector Builder

Create your own connectors without writing code:

- Visual configuration interface
- Support for GET, POST, PUT, DELETE methods
- Multiple authentication types (Bearer, API Key, Basic Auth)
- Custom headers and query parameters
- Response transformation
- Auto-refresh intervals
- Request caching

### ⚡ Performance & Reliability

- **Automatic Caching** - Reduces redundant API calls
- **Rate Limiting** - Prevents API quota exhaustion
- **Error Handling** - Graceful fallbacks and retry logic
- **Refresh Intervals** - Keep data current automatically

### 🔍 Drill-Down Integration

- Click any chart element to drill into detailed data
- Hierarchical API calls fetch related information
- Breadcrumb navigation through data levels
- Context-aware data fetching

## Usage

### Using Pre-Configured Connectors

1. Navigate to the **Data Connectors** section in the sidebar
2. Browse the **Public APIs** tab
3. Click **Test** on any connector to see live data
4. The data is automatically cached for performance

### Creating Custom Connectors

1. Click **Create Custom** in the Data Connectors section
2. Fill in the configuration:
   - **Name**: Your connector's name
   - **URL**: The API endpoint (use `{param}` for dynamic values)
   - **Method**: GET, POST, PUT, or DELETE
   - **Headers**: JSON object with custom headers
   - **Auth**: Choose authentication type and provide credentials
   - **Refresh Interval**: How often to fetch fresh data (in milliseconds)
3. Click **Test** to verify the connection
4. Use the connector in your dashboards

### Example: Custom Weather API

```json
{
  "name": "Weather API",
  "url": "https://api.weatherapi.com/v1/current.json",
  "method": "GET",
  "params": {
    "key": "YOUR_API_KEY",
    "q": "San Francisco"
  },
  "refreshInterval": 300000
}
```

### Drill-Down Example

The JSONPlaceholder Users connector demonstrates drill-down:

1. **Level 0**: View all users (bar chart)
2. **Click a user**: Drills down to that user's posts
3. **Click a post**: Drills down to post comments
4. **Navigate back**: Use breadcrumbs to return to any level

## API Reference

### DataConnector Interface

```typescript
interface DataConnector {
  id: string
  name: string
  description: string
  category: 'api' | 'database' | 'file' | 'realtime'
  icon: string
  config: ConnectorConfig
  transform?: (data: any) => any
}
```

### ConnectorConfig Interface

```typescript
interface ConnectorConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  params?: Record<string, any>
  authType?: 'none' | 'bearer' | 'api-key' | 'basic'
  authConfig?: AuthConfig
  refreshInterval?: number
  rateLimit?: RateLimitConfig
}
```

### Using the React Hook

```typescript
import { useDataConnector } from '@/hooks/use-data-connector'
import { publicApiConnectors } from '@/lib/data-connectors'

function MyComponent() {
  const connector = publicApiConnectors[0]
  const { data, loading, error, refetch } = useDataConnector(
    connector,
    {},
    { autoFetch: true }
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return <div>Data: {JSON.stringify(data)}</div>
}
```

### Using Drill-Down

```typescript
import { useConnectorWithDrillDown } from '@/hooks/use-data-connector'
import { drillDownConnectors } from '@/lib/data-connectors'

function MyChart() {
  const {
    activeData,
    drillStack,
    drillDown,
    navigateTo,
    isInDrillDown,
  } = useConnectorWithDrillDown(
    myConnector,
    drillDownConnectors.userPosts
  )

  const handleBarClick = (data) => {
    drillDown(data)
  }

  return (
    <>
      {isInDrillDown && (
        <button onClick={() => navigateTo(-1)}>Back</button>
      )}
      <Chart data={activeData} onBarClick={handleBarClick} />
    </>
  )
}
```

## Architecture

### Service Layer

`DataConnectorService` handles all API interactions:

- Request building and execution
- Authentication header construction
- Response caching with TTL
- Rate limit tracking
- Context mapping for drill-down

### Hook Layer

React hooks provide declarative data fetching:

- `useDataConnector` - Basic connector execution
- `useDrillDown` - Drill-down navigation
- `useConnectorWithDrillDown` - Combined connector + drill-down

### Component Layer

UI components for management and visualization:

- `DataConnectorManager` - Browse and create connectors
- `ConnectorDrillDownDemo` - Live demo with charts
- `InteractiveCharts` - Chart components with drill-down

## Best Practices

### Caching

Set appropriate refresh intervals based on data volatility:

- **Static data** (e.g., reference tables): 1 hour+ (3600000ms)
- **Semi-dynamic** (e.g., analytics): 5-15 minutes (300000-900000ms)
- **Real-time** (e.g., stock prices): 30 seconds (30000ms)

### Rate Limiting

Configure rate limits to stay within API quotas:

```typescript
rateLimit: {
  maxRequests: 100,
  perMilliseconds: 60000  // 100 requests per minute
}
```

### Authentication

Store API keys securely:

- Use environment variables in production
- Never commit keys to version control
- Rotate keys regularly
- Use least-privilege access

### Error Handling

Always handle potential failures:

```typescript
const { data, error, loading } = useDataConnector(connector)

if (error) {
  // Show user-friendly error message
  // Offer retry option
  // Fall back to cached data if available
}
```

## Troubleshooting

### CORS Errors

Some APIs may not support browser requests due to CORS restrictions. Solutions:

1. Use APIs that explicitly support CORS
2. Set up a backend proxy
3. Use the API's JSONP endpoint if available

### Authentication Failures

If authentication isn't working:

1. Verify your API key is correct
2. Check the authentication type (Bearer vs API Key)
3. Ensure the header name matches the API's requirements
4. Test the API endpoint directly with curl/Postman

### Rate Limit Exceeded

If you hit rate limits:

1. Increase the refresh interval
2. Implement smarter caching strategies
3. Reduce concurrent requests
4. Consider upgrading your API plan

## Future Enhancements

- WebSocket support for real-time data
- GraphQL connectors
- Database connectors (PostgreSQL, MongoDB)
- Batch request optimization
- Response schema validation
- Connector marketplace for sharing
- Visual data transformation builder
- Offline mode with service workers

## Contributing

To add new pre-configured connectors:

1. Add connector definition to `src/lib/data-connectors.ts`
2. Test the connector thoroughly
3. Add transform function if needed
4. Document any special requirements
5. Submit a pull request

## License

Same as the main project license.
