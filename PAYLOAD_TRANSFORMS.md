# Webhook Payload Transformation Guide

## Overview

The Webhook Payload Transformation Wizard enables you to map incoming webhook payloads from external services to your custom dashboard data model. This powerful feature allows you to:

- **Transform** webhook data structures to match your needs
- **Map** nested fields to flat structures (or vice versa)
- **Apply** custom JavaScript functions for complex transformations
- **Validate** and test transformations before deployment
- **Reuse** transforms across multiple dashboards

## Getting Started

### 1. Create a Webhook First

Before creating a transformation, you need to have a webhook set up:

1. Navigate to **Webhook Manager** in the sidebar
2. Create a new webhook or use an existing one
3. Test your webhook to capture a sample payload

### 2. Open Transform Manager

1. Find the **Transform Manager** card in the sidebar
2. Click **"New Transform"**
3. Select the webhook you want to transform

## Transform Types

### Direct Mapping

The simplest form - copy a value directly from source to target.

**Example:**
```
Source Path: data.user.name
Target Field: userName
Transform Type: Direct
```

**Input Payload:**
```json
{
  "data": {
    "user": {
      "name": "John Doe"
    }
  }
}
```

**Output:**
```json
{
  "userName": "John Doe"
}
```

---

### Function Transform

Apply a JavaScript function to transform the value.

**Example:**
```
Source Path: email
Target Field: emailDomain
Transform Type: Function
Function: return value.split('@')[1]
```

**Input Payload:**
```json
{
  "email": "user@example.com"
}
```

**Output:**
```json
{
  "emailDomain": "example.com"
}
```

**Common Function Examples:**

```javascript
// Convert to uppercase
return value.toUpperCase()

// Parse JSON string
return JSON.parse(value)

// Format date
return new Date(value).toLocaleDateString()

// Extract first name
return value.split(' ')[0]

// Convert to number
return parseFloat(value)

// Truncate text
return value.slice(0, 100) + '...'

// Calculate percentage
return (value * 100).toFixed(2) + '%'
```

---

### Computed Transform

Create a new value by combining multiple fields from the payload.

**Example:**
```
Target Field: fullName
Transform Type: Computed
Function: return payload.firstName + ' ' + payload.lastName
```

**Input Payload:**
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

**Output:**
```json
{
  "fullName": "John Doe"
}
```

**Common Computed Examples:**

```javascript
// Combine address fields
return `${payload.street}, ${payload.city}, ${payload.state} ${payload.zip}`

// Calculate total
return payload.items.reduce((sum, item) => sum + item.price, 0)

// Get array length
return payload.orders.length

// Format currency
return '$' + payload.amount.toFixed(2)

// Calculate age from birthdate
const birthYear = new Date(payload.birthdate).getFullYear()
const currentYear = new Date().getFullYear()
return currentYear - birthYear

// Concatenate array
return payload.tags.join(', ')
```

---

### Conditional Transform

Map values based on conditions.

**Example:**
```
Source Path: status
Target Field: statusLabel
Transform Type: Conditional
Condition Field: status
Operator: equals
Value: active
Default Value: Inactive
```

**Input Payload:**
```json
{
  "status": "active"
}
```

**Output:**
```json
{
  "statusLabel": "active"
}
```

If status was not "active", it would output "Inactive".

**Available Operators:**
- **equals**: Exact match
- **not_equals**: Does not match
- **contains**: String contains substring
- **greater**: Numeric greater than
- **less**: Numeric less than
- **exists**: Field exists and is not null

---

## Real-World Examples

### GitHub Push Events

Transform GitHub webhook push events for a development dashboard:

```javascript
// Repository name
Source: repository.name
Target: repoName
Type: Direct

// Commit count
Source: commits
Target: commitCount
Type: Computed
Function: return payload.commits.length

// Last commit message
Source: commits
Target: lastCommitMessage
Type: Function
Function: return value[value.length - 1].message

// Author name
Source: pusher.name
Target: authorName
Type: Direct

// Branch name (from ref)
Source: ref
Target: branchName
Type: Function
Function: return value.replace('refs/heads/', '')

// Timestamp
Source: commits
Target: timestamp
Type: Function
Function: return value[value.length - 1].timestamp
```

---

### Stripe Payment Events

Transform Stripe webhook payment events:

```javascript
// Payment ID
Source: data.object.id
Target: paymentId
Type: Direct

// Amount in dollars
Source: data.object.amount
Target: amountUSD
Type: Function
Function: return (value / 100).toFixed(2)

// Payment status badge
Source: data.object.status
Target: statusBadge
Type: Conditional
Condition Field: data.object.status
Operator: equals
Value: succeeded
Default Value: failed

// Customer ID
Source: data.object.customer
Target: customerId
Type: Direct

// Currency (uppercase)
Source: data.object.currency
Target: currency
Type: Function
Function: return value.toUpperCase()

// Formatted date
Source: created
Target: createdAt
Type: Function
Function: return new Date(value * 1000).toISOString()
```

---

### Shopify Order Events

Transform Shopify order webhooks:

```javascript
// Order ID
Source: id
Target: orderId
Type: Direct

// Customer email
Source: email
Target: customerEmail
Type: Direct

// Total price
Source: total_price
Target: totalPrice
Type: Function
Function: return parseFloat(value).toFixed(2)

// Item count
Source: line_items
Target: itemCount
Type: Computed
Function: return payload.line_items.reduce((sum, item) => sum + item.quantity, 0)

// Product names
Source: line_items
Target: productNames
Type: Function
Function: return value.map(item => item.title).join(', ')

// Order date
Source: created_at
Target: orderDate
Type: Function
Function: return new Date(value).toLocaleDateString()

// High value order flag
Source: total_price
Target: isHighValue
Type: Conditional
Condition Field: total_price
Operator: greater
Value: 500
Default Value: false
```

---

### Slack Message Events

Transform Slack webhook events:

```javascript
// Message text
Source: event.text
Target: messageText
Type: Direct

// Channel ID
Source: event.channel
Target: channelId
Type: Direct

// User ID
Source: event.user
Target: userId
Type: Direct

// Timestamp (formatted)
Source: event.ts
Target: timestamp
Type: Function
Function: return new Date(parseFloat(value) * 1000).toISOString()

// Message type
Source: event.type
Target: eventType
Type: Direct

// Has attachments
Source: event
Target: hasAttachments
Type: Computed
Function: return payload.event.files ? true : false
```

---

## Advanced Features

### Auto-Suggest Mappings

Click the **"Auto-Suggest"** button to automatically generate mappings from your sample payload. The wizard will:

1. Analyze the payload structure
2. Extract all available fields
3. Create direct mappings for top-level fields
4. Use field names as target field names

You can then customize these suggestions.

---

### Nested Output Structures

Choose your output format:

- **Flat Object**: All fields at root level
  ```json
  { "userName": "John", "userEmail": "john@example.com" }
  ```

- **Nested Object**: Maintain hierarchical structure
  ```json
  { "user": { "name": "John", "email": "john@example.com" } }
  ```

- **Array**: Output as an array (useful for batch processing)
  ```json
  [{ "name": "John", "email": "john@example.com" }]
  ```

To create nested outputs, use dot notation in target fields:
```
Target Field: user.profile.name
```

---

### Default Values

Set fallback values when source data is missing:

```
Source Path: user.avatar
Target Field: avatarUrl
Default Value: /default-avatar.png
```

If `user.avatar` doesn't exist in the payload, `avatarUrl` will be set to `/default-avatar.png`.

---

### Testing Transforms

Always test your transforms before saving:

1. Go to the **Test** tab
2. Paste a sample payload (or use the provided one)
3. Click **"Test Transform"**
4. Review the output
5. Adjust mappings if needed

The test environment safely executes your transforms without affecting production data.

---

### Code Generation

The wizard generates clean, reusable JavaScript code:

1. Go to the **Code** tab
2. View the generated transformation function
3. Click **"Copy"** to copy to clipboard
4. Use in external services or custom integrations

Example generated code:
```javascript
function transformPayload(payload) {
  const result = {};
  
  result['userName'] = payload.user.name;
  
  result['emailDomain'] = ((value) => {
    return value.split('@')[1]
  })(payload.email);
  
  result['fullName'] = (() => {
    return payload.firstName + ' ' + payload.lastName
  })();
  
  return result;
}
```

---

## Best Practices

### 1. Start Simple
Begin with direct mappings, then add complexity as needed.

### 2. Use Descriptive Names
Make target field names clear and consistent:
- ✅ `customerEmail`, `orderTotal`, `createdAt`
- ❌ `e`, `t`, `x`

### 3. Handle Missing Data
Always set default values for optional fields:
```javascript
return value || 'N/A'
return value ?? 0
```

### 4. Validate Inputs
Add checks in transform functions:
```javascript
if (!value || typeof value !== 'string') return ''
return value.toUpperCase()
```

### 5. Test Edge Cases
Test your transforms with:
- Empty payloads
- Missing fields
- Null/undefined values
- Different data types

### 6. Keep Functions Simple
Break complex transformations into multiple mappings instead of one complex function.

### 7. Document Your Transforms
Use the description field to explain what the transform does and why.

---

## Common Patterns

### Date Formatting
```javascript
// ISO to local date
return new Date(value).toLocaleDateString()

// Unix timestamp to ISO
return new Date(value * 1000).toISOString()

// Relative time
const now = Date.now()
const diff = now - new Date(value).getTime()
const hours = Math.floor(diff / (1000 * 60 * 60))
return `${hours} hours ago`
```

### Array Operations
```javascript
// Get first item
return value[0]

// Get last item
return value[value.length - 1]

// Extract property from array
return value.map(item => item.name)

// Filter and count
return value.filter(item => item.active).length

// Join with separator
return value.join(', ')
```

### String Manipulation
```javascript
// Capitalize first letter
return value.charAt(0).toUpperCase() + value.slice(1)

// Remove whitespace
return value.trim()

// Slug generation
return value.toLowerCase().replace(/\s+/g, '-')

// Truncate with ellipsis
return value.length > 50 ? value.slice(0, 50) + '...' : value
```

### Number Formatting
```javascript
// Currency
return '$' + value.toFixed(2)

// Percentage
return (value * 100).toFixed(1) + '%'

// Thousands separator
return value.toLocaleString()

// Round to nearest
return Math.round(value)
```

---

## Integration with Dashboards

Once you save a transform, it's automatically available to your dashboard components:

1. **Real-time Updates**: Incoming webhooks are transformed on-the-fly
2. **Type Safety**: Transformed data matches your dashboard's data model
3. **Consistent Structure**: All webhook events produce the same output format
4. **Error Handling**: Failed transforms use default values instead of breaking

---

## Troubleshooting

### Transform Not Working

**Check:**
- Source path is correct (use test payload to verify)
- Target field name has no typos
- Transform function has valid JavaScript syntax
- Default values are set for optional fields

### Function Errors

**Common issues:**
- `value is undefined`: Source path doesn't exist in payload
- `Cannot read property of undefined`: Missing null checks
- `Unexpected token`: Syntax error in function

**Solution:**
Add safety checks:
```javascript
if (!value) return ''
return value.property || 'default'
```

### Output Structure Wrong

**Check:**
- Output format setting (flat/nested/array)
- Target field naming (use dots for nested: `user.name`)
- Mappings are in correct order

---

## API Reference

### Transform Types
- `direct`: Copy value as-is
- `function`: Apply function to value
- `computed`: Calculate from entire payload
- `conditional`: Apply based on condition

### Condition Operators
- `equals`: Exact match
- `not_equals`: Does not match
- `contains`: Substring search
- `greater`: Numeric comparison >
- `less`: Numeric comparison <
- `exists`: Truthy check

### Output Formats
- `flat`: Single-level object
- `nested`: Hierarchical object
- `array`: Array of objects

---

## Examples Library

### E-commerce Order
```javascript
// Basic order info
orderId: payload.id
customerName: payload.customer.name
totalAmount: parseFloat(payload.total)

// Calculated fields
itemCount: payload.items.reduce((sum, i) => sum + i.quantity, 0)
hasDiscount: payload.discount_code ? true : false
isShipped: payload.status === 'shipped'

// Formatted strings
orderDate: new Date(payload.created).toLocaleDateString()
productList: payload.items.map(i => i.name).join(', ')
```

### Analytics Event
```javascript
// Event tracking
eventName: payload.event
userId: payload.user_id
sessionId: payload.session_id

// Metrics
pageViews: payload.metrics.page_views
duration: Math.round(payload.metrics.duration / 1000) // ms to seconds
bounceRate: (payload.metrics.bounces / payload.metrics.visits * 100).toFixed(1)

// Device info
device: payload.device.type
browser: payload.device.browser
isReturning: payload.user.visits > 1
```

### Social Media Post
```javascript
// Post data
postId: payload.id
authorUsername: payload.author.username
postContent: payload.text

// Engagement metrics
likeCount: payload.stats.likes
commentCount: payload.stats.comments
shareCount: payload.stats.shares
engagementRate: ((payload.stats.likes + payload.stats.comments) / payload.stats.views * 100).toFixed(2)

// Metadata
createdAt: new Date(payload.timestamp).toISOString()
hasMedia: payload.media && payload.media.length > 0
platform: 'twitter'
```

---

## Next Steps

- **Create Your First Transform**: Start with a simple direct mapping
- **Test Thoroughly**: Use sample payloads to verify behavior
- **Monitor Performance**: Check webhook event logs for errors
- **Iterate and Improve**: Refine transforms based on real data
- **Share Patterns**: Document successful transforms for your team

For more help, see [WEBHOOKS.md](./WEBHOOKS.md) for webhook setup guide.
