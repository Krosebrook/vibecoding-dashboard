import { DashboardConfig } from './types'

export const socialMediaDashboard: DashboardConfig = {
  id: 'social-media-preconfigured',
  name: 'Social Media Dashboard',
  description: 'Track engagement, followers, reach, and content performance across all social platforms',
  type: 'social-media',
  createdAt: new Date().toISOString(),
  components: [
    {
      id: 'followers-metric',
      type: 'metric-card',
      title: 'Total Followers',
      description: 'Across all platforms',
      position: { row: 0, col: 0 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        trend: 'up',
        trendValue: '15.3%',
        icon: 'users',
      },
    },
    {
      id: 'engagement-metric',
      type: 'metric-card',
      title: 'Engagement Rate',
      description: 'Last 30 days',
      position: { row: 0, col: 3 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        suffix: '%',
        trend: 'up',
        trendValue: '8.7%',
        icon: 'heart',
      },
    },
    {
      id: 'reach-metric',
      type: 'metric-card',
      title: 'Total Reach',
      description: 'Impressions',
      position: { row: 0, col: 6 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        trend: 'up',
        trendValue: '22.1%',
        icon: 'eye',
      },
    },
    {
      id: 'posts-metric',
      type: 'metric-card',
      title: 'Posts Published',
      description: 'This month',
      position: { row: 0, col: 9 },
      size: { rows: 1, cols: 3 },
      props: {
        value: 'dynamic',
        trend: 'up',
        trendValue: '5.0%',
        icon: 'file',
      },
    },
    {
      id: 'engagement-chart',
      type: 'area-chart',
      title: 'Engagement Over Time',
      description: 'Likes, comments, and shares',
      position: { row: 1, col: 0 },
      size: { rows: 2, cols: 8 },
      props: {
        dataKey: 'engagement',
        xAxis: 'date',
        yAxis: ['likes', 'comments', 'shares'],
      },
    },
    {
      id: 'platform-distribution',
      type: 'pie-chart',
      title: 'Followers by Platform',
      description: 'Distribution breakdown',
      position: { row: 1, col: 8 },
      size: { rows: 2, cols: 4 },
      props: {
        dataKey: 'platforms',
      },
    },
    {
      id: 'top-posts',
      type: 'data-table',
      title: 'Top Performing Posts',
      description: 'Highest engagement',
      position: { row: 3, col: 0 },
      size: { rows: 1, cols: 8 },
      props: {
        dataKey: 'topPosts',
        columns: ['content', 'platform', 'likes', 'comments', 'shares', 'engagement'],
      },
    },
    {
      id: 'growth-chart',
      type: 'line-chart',
      title: 'Follower Growth',
      description: 'Growth trend by platform',
      position: { row: 3, col: 8 },
      size: { rows: 1, cols: 4 },
      props: {
        dataKey: 'growth',
        xAxis: 'week',
        yAxis: ['followers'],
      },
    },
    {
      id: 'best-times',
      type: 'bar-chart',
      title: 'Best Time to Post',
      description: 'Engagement by hour',
      position: { row: 4, col: 0 },
      size: { rows: 1, cols: 6 },
      props: {
        dataKey: 'postTimes',
        xAxis: 'hour',
        yAxis: 'engagement',
      },
    },
    {
      id: 'recent-activity',
      type: 'activity-feed',
      title: 'Recent Activity',
      description: 'Latest interactions',
      position: { row: 4, col: 6 },
      size: { rows: 1, cols: 6 },
      props: {
        dataKey: 'recentActivity',
      },
    },
  ],
  layout: {
    type: 'grid',
    columns: 12,
    gap: 24,
    padding: 24,
  },
  theme: {
    primaryColor: 'oklch(0.60 0.24 320)',
    accentColor: 'oklch(0.70 0.20 40)',
    backgroundColor: 'oklch(0.98 0 0)',
    textColor: 'oklch(0.20 0 0)',
    borderRadius: 12,
  },
  dataModel: {
    entities: [
      {
        name: 'Post',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'content', type: 'string', required: true },
          { name: 'platform', type: 'string', required: true },
          { name: 'likes', type: 'number', required: true },
          { name: 'comments', type: 'number', required: true },
          { name: 'shares', type: 'number', required: true },
          { name: 'timestamp', type: 'date', required: true },
        ],
      },
      {
        name: 'Platform',
        fields: [
          { name: 'name', type: 'string', required: true },
          { name: 'followers', type: 'number', required: true },
          { name: 'engagement', type: 'number', required: true },
          { name: 'posts', type: 'number', required: true },
        ],
      },
    ],
    seedData: {
      engagement: [
        { date: '1/1', likes: 2400, comments: 890, shares: 450 },
        { date: '1/2', likes: 2210, comments: 820, shares: 380 },
        { date: '1/3', likes: 2890, comments: 1020, shares: 520 },
        { date: '1/4', likes: 2780, comments: 980, shares: 490 },
        { date: '1/5', likes: 3090, comments: 1150, shares: 610 },
        { date: '1/6', likes: 3290, comments: 1240, shares: 680 },
        { date: '1/7', likes: 3490, comments: 1380, shares: 720 },
      ],
      platforms: [
        { name: 'Instagram', value: 45600, fill: 'oklch(0.60 0.24 320)' },
        { name: 'Twitter/X', value: 32400, fill: 'oklch(0.45 0.15 240)' },
        { name: 'Facebook', value: 28900, fill: 'oklch(0.55 0.20 260)' },
        { name: 'LinkedIn', value: 18200, fill: 'oklch(0.50 0.18 230)' },
        { name: 'TikTok', value: 52300, fill: 'oklch(0.70 0.20 40)' },
      ],
      topPosts: [
        { 
          content: 'Product launch announcement 🚀', 
          platform: 'Instagram', 
          likes: 4523, 
          comments: 892, 
          shares: 456, 
          engagement: '12.4%' 
        },
        { 
          content: 'Behind the scenes video', 
          platform: 'TikTok', 
          likes: 8912, 
          comments: 1234, 
          shares: 2341, 
          engagement: '18.7%' 
        },
        { 
          content: 'Customer success story', 
          platform: 'LinkedIn', 
          likes: 2341, 
          comments: 567, 
          shares: 891, 
          engagement: '15.2%' 
        },
        { 
          content: 'Industry insights thread', 
          platform: 'Twitter/X', 
          likes: 3456, 
          comments: 678, 
          shares: 1234, 
          engagement: '14.8%' 
        },
        { 
          content: 'Community highlight', 
          platform: 'Facebook', 
          likes: 2890, 
          comments: 445, 
          shares: 678, 
          engagement: '11.3%' 
        },
      ],
      growth: [
        { week: 'W1', followers: 165400 },
        { week: 'W2', followers: 170200 },
        { week: 'W3', followers: 173800 },
        { week: 'W4', followers: 177400 },
      ],
      postTimes: [
        { hour: '6am', engagement: 245 },
        { hour: '9am', engagement: 567 },
        { hour: '12pm', engagement: 892 },
        { hour: '3pm', engagement: 734 },
        { hour: '6pm', engagement: 1234 },
        { hour: '9pm', engagement: 978 },
      ],
      recentActivity: [
        { user: '@sarahj', action: 'commented on', post: 'Product launch', platform: 'Instagram', time: '2m ago' },
        { user: '@tech_mike', action: 'shared', post: 'Behind the scenes', platform: 'TikTok', time: '5m ago' },
        { user: 'Emma D.', action: 'liked', post: 'Customer story', platform: 'LinkedIn', time: '8m ago' },
        { user: '@digital_pro', action: 'retweeted', post: 'Industry insights', platform: 'Twitter/X', time: '12m ago' },
      ],
    },
  },
  setupInstructions: `# Social Media Dashboard - Setup Guide

## Overview
This dashboard provides comprehensive social media analytics tracking engagement, followers, reach, and content performance across all major platforms including Instagram, Twitter/X, Facebook, LinkedIn, and TikTok.

## Features
- **Key Metrics**: Total followers, engagement rate, reach, and posts published with trend indicators
- **Engagement Over Time**: Area chart tracking likes, comments, and shares
- **Platform Distribution**: Pie chart showing follower breakdown by platform
- **Top Performing Posts**: Data table with highest engagement content
- **Follower Growth**: Line chart showing growth trend over time
- **Best Time to Post**: Bar chart revealing optimal posting hours
- **Recent Activity**: Real-time feed of latest interactions

## Data Structure

### Metrics
Four key performance indicators:
- **Total Followers**: Sum across all platforms
- **Engagement Rate**: (Likes + Comments + Shares) / Total Followers × 100
- **Total Reach**: Total impressions across all posts
- **Posts Published**: Content posted in current period

### Engagement Chart
Tracks three metrics over time:
- \`likes\`: Post likes/reactions
- \`comments\`: Post comments/replies
- \`shares\`: Post shares/retweets

### Platform Distribution
Follower count for each platform:
- Instagram
- Twitter/X
- Facebook
- LinkedIn
- TikTok

## Customization Options

### Connecting Social Media APIs

#### Instagram (via Meta Graph API)

\`\`\`typescript
const getInstagramMetrics = async (accessToken: string, accountId: string) => {
  const response = await fetch(
    \`https://graph.facebook.com/v18.0/\${accountId}/insights?\` +
    \`metric=follower_count,impressions,reach,engagement&\` +
    \`period=day&access_token=\${accessToken}\`
  )
  
  const data = await response.json()
  
  return {
    followers: data.data.find(m => m.name === 'follower_count').values[0].value,
    reach: data.data.find(m => m.name === 'reach').values[0].value,
    engagement: data.data.find(m => m.name === 'engagement').values[0].value
  }
}
\`\`\`

#### Twitter/X API

\`\`\`typescript
import { TwitterApi } from 'twitter-api-v2'

const client = new TwitterApi({
  appKey: 'YOUR_APP_KEY',
  appSecret: 'YOUR_APP_SECRET',
  accessToken: 'YOUR_ACCESS_TOKEN',
  accessSecret: 'YOUR_ACCESS_SECRET',
})

const getUserMetrics = async (username: string) => {
  const user = await client.v2.userByUsername(username, {
    'user.fields': ['public_metrics']
  })
  
  return {
    followers: user.data.public_metrics.followers_count,
    tweets: user.data.public_metrics.tweet_count
  }
}

const getRecentTweets = async (userId: string) => {
  const tweets = await client.v2.userTimeline(userId, {
    max_results: 10,
    'tweet.fields': ['public_metrics', 'created_at']
  })
  
  return tweets.data.data.map(tweet => ({
    content: tweet.text,
    likes: tweet.public_metrics.like_count,
    retweets: tweet.public_metrics.retweet_count,
    replies: tweet.public_metrics.reply_count,
    timestamp: tweet.created_at
  }))
}
\`\`\`

#### LinkedIn API

\`\`\`typescript
const getLinkedInMetrics = async (accessToken: string, orgId: string) => {
  const response = await fetch(
    \`https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?\` +
    \`q=organizationalEntity&organizationalEntity=urn:li:organization:\${orgId}\`,
    {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'LinkedIn-Version': '202401'
      }
    }
  )
  
  const data = await response.json()
  return data
}
\`\`\`

#### TikTok API

\`\`\`typescript
const getTikTokMetrics = async (accessToken: string) => {
  const response = await fetch(
    'https://open.tiktokapis.com/v2/research/user/info/',
    {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'your_username'
      })
    }
  )
  
  const data = await response.json()
  
  return {
    followers: data.data.follower_count,
    likes: data.data.likes_count,
    videos: data.data.video_count
  }
}
\`\`\`

### Calculating Engagement Rate

Standard engagement rate formula:

\`\`\`typescript
const calculateEngagementRate = (post: Post, followers: number) => {
  const totalEngagement = post.likes + post.comments + post.shares
  return (totalEngagement / followers) * 100
}

// For multiple posts
const calculateAverageEngagement = (posts: Post[], followers: number) => {
  const totalEngagement = posts.reduce((sum, post) => 
    sum + post.likes + post.comments + post.shares, 0
  )
  return (totalEngagement / (posts.length * followers)) * 100
}
\`\`\`

### Best Time to Post Analysis

Analyze engagement by hour:

\`\`\`typescript
const analyzeBestPostingTimes = (posts: Post[]) => {
  const hourlyEngagement: Record<number, { total: number, count: number }> = {}
  
  posts.forEach(post => {
    const hour = new Date(post.timestamp).getHours()
    const engagement = post.likes + post.comments + post.shares
    
    if (!hourlyEngagement[hour]) {
      hourlyEngagement[hour] = { total: 0, count: 0 }
    }
    
    hourlyEngagement[hour].total += engagement
    hourlyEngagement[hour].count++
  })
  
  return Object.entries(hourlyEngagement).map(([hour, data]) => ({
    hour: \`\${hour}:00\`,
    avgEngagement: data.total / data.count
  })).sort((a, b) => b.avgEngagement - a.avgEngagement)
}
\`\`\`

## Component Details

### Follower Metrics
- **Type**: \`metric-card\`
- **Updates**: Daily aggregation from all platforms
- **Trend**: Comparison to previous 30 days

### Engagement Over Time
- **Type**: \`area-chart\`
- **Library**: Recharts
- **Stacked**: Shows cumulative engagement
- **Time Range**: Last 7-30 days

### Platform Distribution
- **Type**: \`pie-chart\`
- **Interactive**: Click to filter by platform
- **Percentages**: Automatic calculation
- **Colors**: Platform brand colors

### Top Posts Table
- **Type**: \`data-table\`
- **Sortable**: All columns
- **Clickable**: Opens post in native platform
- **Filters**: By platform, date, engagement

### Follower Growth Chart
- **Type**: \`line-chart\`
- **Granularity**: Daily or weekly
- **Forecast**: Optional trend projection

### Best Time to Post
- **Type**: \`bar-chart\`
- **Time Zone**: User's local timezone
- **Analysis**: Based on last 30 days

### Recent Activity Feed
- **Type**: \`activity-feed\`
- **Real-time**: Updates via WebSocket
- **Limit**: Last 50 interactions
- **Filters**: By platform or action type

## Advanced Features

### Content Calendar Integration

\`\`\`typescript
import { useKV } from '@github/spark/hooks'

const [scheduledPosts, setScheduledPosts] = useKV('scheduled-posts', [])

const schedulePost = (post: ScheduledPost) => {
  setScheduledPosts(current => [...current, post].sort(
    (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  ))
}
\`\`\`

### Hashtag Performance Tracking

\`\`\`typescript
const analyzeHashtags = (posts: Post[]) => {
  const hashtagStats: Record<string, { uses: number, engagement: number }> = {}
  
  posts.forEach(post => {
    const hashtags = post.content.match(/#\\w+/g) || []
    const postEngagement = post.likes + post.comments + post.shares
    
    hashtags.forEach(tag => {
      if (!hashtagStats[tag]) {
        hashtagStats[tag] = { uses: 0, engagement: 0 }
      }
      hashtagStats[tag].uses++
      hashtagStats[tag].engagement += postEngagement
    })
  })
  
  return Object.entries(hashtagStats)
    .map(([tag, stats]) => ({
      hashtag: tag,
      uses: stats.uses,
      avgEngagement: stats.engagement / stats.uses
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
}
\`\`\`

### Competitor Analysis

\`\`\`typescript
const compareToCompetitors = async (competitors: string[]) => {
  const competitorData = await Promise.all(
    competitors.map(async username => {
      const metrics = await fetchUserMetrics(username)
      return {
        username,
        followers: metrics.followers,
        engagement: metrics.engagementRate,
        postsPerWeek: metrics.postsPerWeek
      }
    })
  )
  
  return competitorData
}
\`\`\`

### AI Content Suggestions

\`\`\`typescript
const generateContentIdeas = async (topPosts: Post[], platform: string) => {
  const prompt = spark.llmPrompt\`
    Based on these top performing posts:
    \${JSON.stringify(topPosts.slice(0, 5))}
    
    Generate 5 content ideas for \${platform} that would likely perform well.
    Consider trending topics and engagement patterns.
    Return as JSON array with: title, description, suggestedHashtags
  \`
  
  const result = await spark.llm(prompt, 'gpt-4o', true)
  return JSON.parse(result)
}
\`\`\`

### Sentiment Analysis

\`\`\`typescript
const analyzeCommentSentiment = async (comments: string[]) => {
  const prompt = spark.llmPrompt\`
    Analyze the sentiment of these social media comments:
    \${comments.join('\\n')}
    
    Return JSON with: positive, negative, neutral (percentages)
    and topThemes (array of main topics discussed)
  \`
  
  const result = await spark.llm(prompt, 'gpt-4o', true)
  return JSON.parse(result)
}
\`\`\`

## Real-Time Updates

### WebSocket for Live Activity

\`\`\`typescript
useEffect(() => {
  const ws = new WebSocket('wss://your-api.com/social/activity')
  
  ws.onmessage = (event) => {
    const activity = JSON.parse(event.data)
    
    setRecentActivity(prev => [activity, ...prev].slice(0, 50))
    
    // Update metrics
    if (activity.action === 'follow') {
      setFollowers(prev => prev + 1)
    }
    
    // Show notification for high-value activity
    if (activity.engagement > 1000) {
      toast.success(\`High engagement: \${activity.post}\`)
    }
  }
  
  return () => ws.close()
}, [])
\`\`\`

### Polling Alternative

\`\`\`typescript
useEffect(() => {
  const fetchLatestActivity = async () => {
    const activities = await Promise.all([
      fetch('/api/instagram/recent').then(r => r.json()),
      fetch('/api/twitter/recent').then(r => r.json()),
      fetch('/api/tiktok/recent').then(r => r.json()),
    ])
    
    const combined = activities.flat()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    setRecentActivity(combined)
  }
  
  const interval = setInterval(fetchLatestActivity, 60000) // 1 minute
  return () => clearInterval(interval)
}, [])
\`\`\`

## Performance Optimization

### Image Lazy Loading

\`\`\`typescript
import { LazyLoadImage } from 'react-lazy-load-image-component'

<LazyLoadImage
  src={post.imageUrl}
  alt={post.content}
  effect="blur"
  threshold={100}
/>
\`\`\`

### Data Caching Strategy

\`\`\`typescript
import { useQuery } from '@tanstack/react-query'

const { data: metrics } = useQuery({
  queryKey: ['social-metrics', dateRange],
  queryFn: fetchAllPlatformMetrics,
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchInterval: 5 * 60 * 1000,
})
\`\`\`

## Exporting & Reporting

### Generate Social Report

\`\`\`typescript
const generateReport = () => {
  const report = {
    period: dateRange,
    metrics: {
      followers: totalFollowers,
      engagement: engagementRate,
      reach: totalReach,
      posts: postsCount
    },
    topPosts: topPosts.slice(0, 10),
    growth: followerGrowth,
    platforms: platformBreakdown
  }
  
  // Export as JSON
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = \`social-report-\${new Date().toISOString().split('T')[0]}.json\`
  link.click()
}
\`\`\`

## Troubleshooting

### API Rate Limits
Most social platforms have rate limits:
- Instagram: 200 calls/hour
- Twitter: 300 calls/15min (user timeline)
- LinkedIn: Varies by endpoint
- TikTok: 100 calls/day (research API)

Solutions:
1. Implement request caching
2. Use webhooks instead of polling
3. Batch requests when possible
4. Spread calls over time

### Authentication Expires
Handle token refresh:

\`\`\`typescript
const refreshToken = async (platform: string) => {
  const response = await fetch(\`/api/auth/\${platform}/refresh\`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken: getRefreshToken(platform) })
  })
  
  const { accessToken } = await response.json()
  setAccessToken(platform, accessToken)
}
\`\`\`

### Cross-Origin Issues
Use backend proxy:

\`\`\`typescript
// Backend (Express)
app.get('/api/social/:platform/metrics', async (req, res) => {
  const { platform } = req.params
  const data = await fetchPlatformData(platform, req.user.tokens[platform])
  res.json(data)
})
\`\`\`

## Privacy & Compliance

### GDPR Considerations
- Allow users to export their data
- Provide data deletion options
- Don't store unnecessary personal info
- Document data retention policy

### Platform Terms of Service
Each platform has specific terms:
- Don't cache profile photos beyond allowed time
- Respect rate limits
- Display proper attribution
- Use official APIs only

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile: Fully responsive

## Deployment Checklist
- [ ] Set up OAuth for each platform
- [ ] Configure API credentials
- [ ] Implement token refresh logic
- [ ] Add error handling for API failures
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Test with real accounts
- [ ] Add loading states
- [ ] Implement caching
- [ ] Set up monitoring/alerting
`,
}
