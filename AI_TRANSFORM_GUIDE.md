# AI Transform Generator - User Guide

## Overview

The AI Transform Generator allows you to create complex webhook payload transformations using simple natural language descriptions. Instead of manually configuring field mappings, type conversions, and custom functions, you can describe what you want in plain English and let AI build the complete transformation for you.

## Quick Start

### 1. Create or Select a Webhook

First, you need a webhook connector to transform data for:
- Navigate to the **Webhook Manager** section
- Create a new webhook or select an existing one
- Note: Having a sample webhook event helps the AI generate better transforms

### 2. Open the Transform Wizard

- In the **Transform Manager** section, click **"New Transform"**
- Select the webhook you want to create a transform for
- The **Transform Wizard** dialog will open

### 3. Use AI Generate Tab

- The wizard opens on the **"AI Generate"** tab by default
- You'll see a text area with placeholder examples
- A sample payload indicator shows if the AI has context to work with

### 4. Describe Your Transformation

Write a natural language description of what you want to extract and transform. Be specific but conversational.

**Example descriptions:**
```
Extract user email, name, and signup date from the payload 
and convert the date to ISO format
```

```
Map order items array and calculate total price by summing 
quantity * price for each item
```

```
Extract event type and data, only include records where 
status equals active
```

```
Pull customer info including ID, email, and phone. Convert 
phone number to international format with country code.
```

### 5. Generate the Transform

- Click **"Generate Transform"** button
- Wait 2-5 seconds while AI analyzes your description
- The generated transform will appear with:
  - **Transform name and description**
  - **Explanation** of what it does
  - **Complete field mappings** with source paths and target fields
  - **Transform functions** for type conversions and computations
  - **Suggestions** for potential improvements

### 6. Review the Result

The AI generates a complete transform configuration showing:

```
sourcePath → targetField [transformType]
  transformFunction code (if applicable)
  Default: value (if configured)
```

**Example output:**
```
data.user.email → userEmail [direct]

data.user.created_at → signupDate [function]
  return new Date(value).toISOString()

data.order.items → totalPrice [computed]
  return payload.data.order.items.reduce((sum, item) => 
    sum + (item.quantity * item.price), 0)
```

### 7. Use the Transform

- Review the generated mappings
- Read the suggestions for improvements
- Click **"Use This Transform"** to load it into the wizard
- Switch to the **"Test"** tab to verify with sample data
- Click **"Save Transform"** when satisfied

## Writing Effective Descriptions

### Be Specific About Fields

❌ **Vague:** "Get the user data"
✅ **Better:** "Extract user ID, email, first name, and last name"

### Mention Type Conversions

❌ **Vague:** "Get the date"
✅ **Better:** "Extract the registration timestamp and convert it to ISO date format"

### Describe Computations Clearly

❌ **Vague:** "Calculate the total"
✅ **Better:** "Sum the price * quantity for all items in the cart to get the order total"

### Specify Conditions When Needed

❌ **Vague:** "Get the active items"
✅ **Better:** "Extract all items where the status field equals 'active'"

### Mention Nested Data Structures

❌ **Vague:** "Get the address"
✅ **Better:** "Extract the nested address fields: street, city, state, and zip code from user.address"

## Common Use Cases

### 1. E-commerce Order Webhook

**Description:**
```
Extract order ID, customer email, order total, and shipping 
address. Map the line items array with product name, quantity, 
and price. Calculate subtotal for each item by multiplying 
quantity and price.
```

**What AI Generates:**
- Direct mappings for order ID, email, total
- Nested mappings for shipping address fields
- Array processing for line items
- Computed field for item subtotals

### 2. User Registration Webhook

**Description:**
```
Map user profile data including email, username, and full name. 
Convert the signup timestamp to ISO 8601 format. Extract nested 
address fields (street, city, country) and phone number with 
country code.
```

**What AI Generates:**
- Direct mappings for email, username, full name
- Date conversion function for timestamp
- Nested field extraction for address
- Phone number formatting

### 3. Payment Webhook from Stripe

**Description:**
```
Extract transaction ID, amount in cents, currency code, and 
customer email. Convert amount from cents to dollars by dividing 
by 100. Only include transactions where status is 'succeeded'.
```

**What AI Generates:**
- Direct mappings for ID, currency, email
- Function to convert cents to dollars
- Conditional logic to filter by status

### 4. GitHub Webhook Events

**Description:**
```
Extract repository name, event type, and author username. 
Get the commit message from the first commit in the array. 
Convert the timestamp to a readable date format.
```

**What AI Generates:**
- Direct mappings for repo, event, author
- Array indexing to get first commit message
- Date formatting function

### 5. CRM Contact Updates

**Description:**
```
Map contact information: full name (concatenate first and last), 
email, company name, and job title. Convert the lead score to a 
percentage by dividing by 100. Extract phone extension from the 
full phone string after the 'x'.
```

**What AI Generates:**
- Computed field for full name concatenation
- Direct mappings for email, company, title
- Function for lead score conversion
- String parsing function for extension

## Transform Types Explained

The AI automatically selects the appropriate transform type for each field:

### Direct Mapping
Simple field-to-field copy with no transformation
```javascript
payload.user.email → userEmail
```

### Function Transform
Transform a single field's value
```javascript
payload.created_at → createdDate
Function: return new Date(value).toISOString()
```

### Computed Transform
Calculate a new value from multiple fields
```javascript
payload → orderTotal
Function: return payload.items.reduce((sum, i) => sum + i.price, 0)
```

### Conditional Mapping
Map based on a condition
```javascript
payload.status → isActive
Condition: status equals 'active'
```

## Advanced Techniques

### Working with Arrays

**Description:**
```
Extract the items array and for each item, calculate the 
line total as quantity * unit_price, then sum all line 
totals for the grand total
```

### Handling Missing Data

**Description:**
```
Extract user email and phone number. If phone is missing, 
use 'N/A' as default. Convert email to lowercase.
```

### Complex String Operations

**Description:**
```
Extract the product SKU and convert it to uppercase. 
Parse the category from the SKU by taking the first 3 
characters. Generate a display name by replacing hyphens 
with spaces.
```

### Date/Time Manipulation

**Description:**
```
Extract event timestamp and convert to user's timezone 
(EST). Calculate the number of days since the event by 
comparing to current date. Format as 'YYYY-MM-DD HH:mm'.
```

### Data Validation

**Description:**
```
Extract email and validate format with regex. Extract age 
and ensure it's between 18 and 100, otherwise use null. 
Only include records where email is not empty.
```

## Troubleshooting

### AI Generated Incorrect Mappings

**Solution:** Try these approaches:
1. Be more specific about field names and paths
2. Mention if data is nested (e.g., "from user.profile.email")
3. Provide the actual field names from your webhook payload
4. Use the manual mapping wizard to correct specific fields

### Transform Functions Have Errors

**Solution:**
1. Review the generated JavaScript in the mappings
2. Use the Test tab to see the actual error message
3. Refine your description to be more explicit about the operation
4. Manually edit the function in the Mappings tab

### Wrong Transform Type Selected

**Solution:**
1. The AI chooses based on complexity
2. You can change the transform type in the Mappings tab
3. Regenerate with a clearer description of what you need

### Missing Required Fields

**Solution:**
1. List all required fields explicitly in your description
2. Check the suggestions for recommendations
3. Add missing mappings manually in the Mappings tab

### No Sample Payload Available

**Solution:**
1. The AI will generate generic mappings
2. Create a test webhook event first to provide sample data
3. Use the webhook simulator to generate a sample payload
4. Be very explicit about field names and types in your description

## Best Practices

### ✅ Do's

- **Do** describe the transformation in complete sentences
- **Do** mention specific field names when you know them
- **Do** specify data types and formats (ISO dates, cents to dollars, etc.)
- **Do** mention if you need filtering or conditional logic
- **Do** review and test the generated transform before saving
- **Do** use the suggestions to improve your transform
- **Do** iterate - you can regenerate with refined descriptions

### ❌ Don'ts

- **Don't** use overly technical jargon - plain English works best
- **Don't** assume the AI knows your business logic - be explicit
- **Don't** skip testing - always verify with sample data
- **Don't** forget to check for edge cases in your testing
- **Don't** ignore the suggestions - they often catch issues

## Example Workflow

Let's create a complete transform for a Shopify order webhook:

**Step 1: Describe the transformation**
```
Extract the Shopify order data: order number, customer email, 
total price in USD, line items with product title and quantity, 
and shipping address with street, city, state, and zip. Convert 
the order date to ISO format. Calculate the number of items by 
summing quantities across all line items.
```

**Step 2: Review generated mappings**
The AI creates:
- `order_number` → `orderNumber` (direct)
- `customer.email` → `customerEmail` (direct)
- `total_price` → `totalPrice` (direct)
- `created_at` → `orderDate` (function: ISO conversion)
- `line_items` → `items` (array with product + quantity)
- `shipping_address.*` → `shipping.*` (nested fields)
- Computed field: `totalItemCount` (sum of quantities)

**Step 3: Test with sample**
Switch to Test tab, paste Shopify webhook payload, click "Test Transform"

**Step 4: Review output**
```json
{
  "orderNumber": "1234",
  "customerEmail": "customer@example.com",
  "totalPrice": "99.99",
  "orderDate": "2024-01-15T10:30:00.000Z",
  "items": [...],
  "shipping": {...},
  "totalItemCount": 3
}
```

**Step 5: Save and deploy**
Click "Save Transform" - now all future Shopify webhooks will transform automatically!

## Tips for Complex Transformations

### Breaking Down Complex Transforms

If your transformation is very complex, break it into steps:

**Instead of one complex description:**
```
Extract everything and calculate totals and validate formats 
and filter by status and group by category and...
```

**Use a clear structure:**
```
Extract order fields: order ID, customer email, and created date.

Convert the created date to ISO format.

Process the line items array to calculate:
- Individual line totals (quantity * price)
- Grand total (sum of all line totals)

Only include orders where status is 'completed' or 'shipped'.
```

### Iterative Refinement

1. Start with a basic description
2. Generate and review
3. Check the suggestions for what's missing
4. Add refinements based on suggestions
5. Regenerate with improved description

### Combining AI with Manual

1. Use AI to generate the bulk of mappings (80%)
2. Switch to Mappings tab for fine-tuning
3. Add edge case handling manually
4. Test thoroughly with various payloads

## Getting Help

### Read the Suggestions

The AI provides 3-5 suggestions after each generation:
- These often identify missing fields
- Suggest additional validations
- Recommend better approaches

### Use the Examples

Click the example descriptions at the bottom of the AI Generate tab to see patterns.

### Check the Documentation

Refer to:
- `PAYLOAD_TRANSFORMS.md` - Technical transform details
- `WEBHOOKS.md` - Webhook setup guide
- `PRD.md` - Complete feature documentation

---

## Summary

The AI Transform Generator makes webhook data transformation accessible to everyone:

1. **Describe** what you want in natural language
2. **Generate** complete transform configuration with AI
3. **Review** mappings, functions, and suggestions
4. **Test** with sample webhook data
5. **Deploy** transforms that apply automatically

No coding required - but full customization available when you need it!
