# Advanced Database Migration Features

## Overview

DataFlow has been enhanced with five powerful new features that significantly improve the database migration experience:

1. **Data Preview & Query Builder** - Interactive SQL query editor with AI assistance
2. **Transformation Pipeline Builder** - Visual multi-step data transformation workflows
3. **Performance Monitor** - Real-time migration performance tracking
4. **Batch Operations Manager** - Intelligent batch processing optimization
5. **Data Quality Dashboard** - Comprehensive data quality assessment

---

## 1. Data Preview & Query Builder

### Purpose
Explore your database schema and query data before running migrations to understand structure and content.

### Key Features
- **Table Browser**: View all tables with record counts and complete schema information
- **SQL Query Editor**: Write custom SQL queries with syntax highlighting
- **AI Query Generation**: Generate intelligent queries automatically using AI
- **Real-time Execution**: Execute queries and see results instantly
- **CSV Export**: Export query results for external analysis
- **Query History**: Access previously executed queries

### How to Use

1. Navigate to the **Preview** tab
2. Select a database connection from the dropdown
3. Choose a table to explore or write a custom SQL query
4. Click **AI Generate** for intelligent query suggestions
5. Click **Execute Query** to run and view results
6. Export results to CSV if needed

### Example Workflow
```sql
-- AI can generate queries like:
SELECT users.id, users.email, COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE users.created_at > '2024-01-01'
GROUP BY users.id, users.email
ORDER BY order_count DESC
LIMIT 100
```

---

## 2. Transformation Pipeline Builder

### Purpose
Create complex, multi-step data transformations that go beyond simple field mapping.

### Key Features
- **Visual Pipeline**: Drag-and-drop interface for building transformation workflows
- **Multiple Step Types**:
  - **Filter**: Remove records based on conditions
  - **Map**: Transform field values
  - **Aggregate**: Group and summarize data
  - **Join**: Combine data from multiple sources
  - **Sort**: Order records by fields
  - **Deduplicate**: Remove duplicate records
  - **Validate**: Check data quality rules
- **Step Configuration**: Each step is fully configurable with JSON config
- **Step Ordering**: Reorder steps with up/down controls
- **Enable/Disable**: Toggle steps without deleting them
- **Pipeline Execution**: Test entire pipeline before applying to migration

### How to Use

1. Navigate to the **Pipeline** tab
2. Click **New Pipeline** and name your workflow
3. Click **Add Step** to add transformation steps
4. Configure each step with appropriate settings
5. Reorder steps using arrow buttons
6. Toggle steps on/off to test different configurations
7. Click **Execute Pipeline** to test the complete workflow

### Example Pipeline
```json
Pipeline: "Clean User Data"
├── Step 1: Filter (Remove inactive users)
│   Config: { "condition": "is_active = true" }
├── Step 2: Validate (Check email format)
│   Config: { "field": "email", "pattern": "^[\\w.-]+@[\\w.-]+\\.\\w+$" }
├── Step 3: Map (Normalize phone numbers)
│   Config: { "field": "phone", "function": "normalizePhone" }
└── Step 4: Deduplicate (Remove duplicates by email)
    Config: { "key": "email" }
```

---

## 3. Performance Monitor

### Purpose
Track real-time migration performance, resource usage, and identify bottlenecks.

### Key Features
- **Live Metrics Dashboard**:
  - Records per second throughput
  - Bytes per second transfer rate
  - CPU usage percentage
  - Memory usage percentage
  - Estimated time remaining
- **Real-time Charts**:
  - Throughput over time (area chart)
  - CPU & memory usage (line chart)
  - Error rate tracking (area chart)
- **Migration Progress**: Visual progress bar with detailed statistics
- **Performance Alerts**: Warnings for high resource usage

### Metrics Explained

| Metric | Description | Good Range |
|--------|-------------|------------|
| **Throughput** | Records processed per second | 100-300 rec/s |
| **CPU Usage** | Processor utilization | < 70% |
| **Memory Usage** | RAM allocation | < 70% |
| **Error Rate** | Errors per second | < 1% |

### How to Use

1. Start a migration from the **Execute** tab
2. Navigate to the **Monitor** tab to view real-time metrics
3. Watch for performance warnings (yellow/red indicators)
4. Monitor charts for trends and anomalies
5. Use insights to adjust batch configuration if needed

### Performance Optimization Tips
- If CPU > 80%: Reduce parallel batches
- If memory > 80%: Decrease batch size
- If error rate > 3%: Increase retry attempts and delays
- If throughput drops: Check network connectivity

---

## 4. Batch Operations Manager

### Purpose
Optimize migration performance through intelligent batch processing configuration.

### Key Features
- **Configuration Presets**: Quick apply Conservative, Balanced, or Aggressive settings
- **Fine-grained Controls**:
  - **Batch Size**: Records per batch (10-1000)
  - **Parallel Batches**: Concurrent processing (1-20)
  - **Batch Delay**: Rate limiting between batches (0-1000ms)
  - **Retry Attempts**: Failed batch retries (0-10)
  - **Retry Delay**: Backoff delay for retries (100-5000ms)
- **Throughput Estimation**: Real-time calculation of expected performance
- **Simulation Mode**: Test configuration before applying
- **Auto-tuning**: Optional automatic optimization during migration
- **Best Practices Guide**: Built-in recommendations

### Configuration Presets

| Preset | Batch Size | Parallel | Delay | Retry | Use Case |
|--------|------------|----------|-------|-------|----------|
| **Conservative** | 50 | 2 | 200ms | 5 | Unreliable connections, strict rate limits |
| **Balanced** | 100 | 3 | 100ms | 3 | General purpose, most scenarios |
| **Aggressive** | 500 | 10 | 0ms | 1 | Fast networks, no rate limits |

### How to Use

1. Navigate to the **Batch** tab
2. Choose a preset or adjust sliders manually
3. Monitor the **Estimated Throughput** indicator
4. Click **Simulate** to test configuration
5. Review simulation results (throughput, latency, error rate)
6. Configuration auto-applies to next migration

### Best Practices

**Batch Size**
- Larger batches = higher throughput but more memory
- Start with 100-500 records
- Increase for simple data, decrease for complex objects

**Parallel Processing**
- Match your database connection pool size
- Too many parallel batches can overwhelm the database
- Typical range: 2-5 for most databases

**Rate Limiting**
- Add delays if hitting API/database rate limits
- Use 0ms delay for local migrations
- 100-200ms delay for cloud databases

**Retry Strategy**
- More retries = better reliability but slower failures
- Use exponential backoff for transient errors
- 3-5 retries recommended for most scenarios

---

## 5. Data Quality Dashboard

### Purpose
Assess and improve data quality before migrations to prevent issues.

### Key Features
- **Overall Quality Score**: Composite score (0-100) from 5 dimensions
- **Quality Dimensions**:
  - **Completeness**: Data presence and non-null values
  - **Accuracy**: Correctness and validity
  - **Consistency**: Uniformity across datasets
  - **Timeliness**: Data freshness and currency
  - **Validity**: Schema and format compliance
- **Quality Metrics**: Detailed measurements (null values, duplicates, invalid formats, etc.)
- **Issue Detection**: Specific problems with severity and affected record counts
- **Assessment History**: Track quality improvements over time

### Quality Scoring

| Score Range | Label | Meaning |
|-------------|-------|---------|
| 90-100 | **Excellent** | Data is production-ready |
| 80-89 | **Good** | Minor issues, safe to migrate |
| 70-79 | **Fair** | Address warnings before migration |
| < 70 | **Poor** | Significant issues, fix before migration |

### How to Use

1. Navigate to the **Quality** tab
2. Select a database connection
3. Click **Run Assessment**
4. Review the overall quality score and dimensional scores
5. Switch to **Quality Metrics** tab for detailed measurements
6. Switch to **Issues Found** tab for specific problems
7. Fix identified issues in your database
8. Re-run assessment to verify improvements

### Common Issues and Fixes

**Invalid Emails** (Medium Severity)
- Problem: Email addresses don't match standard format
- Fix: Use transformation rules to clean or filter invalid emails

**Missing Area Codes** (Low Severity)
- Problem: Phone numbers incomplete
- Fix: Add data transformation to prefix default area code

**Future Dates** (High Severity)
- Problem: Dates set in the future (data entry errors)
- Fix: Filter records or set to current date during migration

**Invalid Status Values** (Medium Severity)
- Problem: Status field contains unexpected values
- Fix: Use value mapping transformation to normalize

### Assessment Best Practices

1. **Run Before Migration**: Always assess quality before starting
2. **Fix Critical Issues**: Address high severity issues immediately
3. **Document Warnings**: Note medium/low severity issues for monitoring
4. **Regular Assessments**: Run periodically to maintain quality
5. **Compare Over Time**: Track improvements with historical data

---

## Integration Workflow

### Recommended Migration Process

```
1. Connections Tab
   ├── Add source and destination connections
   └── Test connections

2. Preview Tab
   ├── Explore source database schema
   ├── Query sample data
   └── Understand data structure

3. Quality Tab
   ├── Run data quality assessment
   ├── Review quality scores
   └── Fix critical issues

4. Auto-Mapper Tab
   ├── Generate initial field mappings
   └── Review AI suggestions

5. Pipeline Tab
   ├── Create transformation pipeline
   ├── Add data cleaning steps
   └── Test pipeline execution

6. Mapping Tab
   ├── Fine-tune field mappings
   └── Add transformation rules

7. Validator Tab
   ├── Run validation checks
   └── Resolve any warnings

8. Batch Tab
   ├── Configure batch processing
   ├── Run simulation
   └── Optimize settings

9. Execution Tab
   ├── Review configuration
   ├── Start migration
   └── Monitor progress

10. Monitor Tab
    ├── Watch real-time metrics
    ├── Check for performance issues
    └── Adjust if needed

11. History Tab
    ├── Review completed migration
    └── Rollback if necessary
```

---

## Tips & Tricks

### AI Query Generation
- Select the table first for context-aware queries
- AI generates queries with appropriate filters and limits
- Use generated queries as starting points, then customize

### Performance Optimization
- Monitor CPU/memory during migration
- If performance degrades, pause and adjust batch config
- Use simulation to find optimal settings before production

### Data Quality
- Run assessments during development, not just before production
- Track quality scores over time to measure improvements
- Use pipeline transformations to automatically fix common issues

### Transformation Pipelines
- Break complex transformations into small, testable steps
- Use descriptive step names for maintainability
- Disable steps temporarily to isolate issues
- Order matters: filters before maps, validations last

### Batch Configuration
- Start with Balanced preset
- Increase batch size if throughput is low and resources are available
- Decrease parallel batches if seeing connection errors
- Add delays if hitting rate limits

---

## Troubleshooting

### Query Builder Issues

**"Query failed to execute"**
- Check SQL syntax
- Verify table and column names
- Ensure connection is still active

**AI generation not working**
- Ensure you've selected a table
- Check internet connectivity (AI requires API access)
- Try generating again if first attempt fails

### Pipeline Issues

**"Pipeline execution failed"**
- Check each step's configuration
- Ensure JSON config is valid
- Test steps individually by disabling others
- Verify data types match transformation expectations

### Performance Issues

**Low throughput**
- Increase batch size
- Increase parallel batches
- Reduce batch delays
- Check network latency

**High error rate**
- Increase retry attempts
- Increase retry delays
- Check data quality for problematic records
- Review error logs in History tab

### Data Quality Issues

**Assessment taking too long**
- Assessment samples data, should be quick
- Check database connection
- Ensure database isn't under heavy load

**Scores seem incorrect**
- Re-run assessment
- Check issue details for specific problems
- Scores are calculated from sampled data

---

## API Integration

All new features integrate seamlessly with existing DataFlow components:

- **Types**: Extended in `/src/lib/types.ts`
- **Components**: Located in `/src/components/migration/`
- **State Management**: Uses React hooks and `useKV` for persistence
- **AI Integration**: Leverages `window.spark.llm` API for AI features

---

## Future Enhancements

Planned improvements for these features:

- **Query Builder**: Visual query builder, query templates, saved queries
- **Pipeline**: Visual flow diagram, step templates, import/export
- **Performance**: Historical comparison, anomaly detection, auto-optimization
- **Batch**: Machine learning-based auto-tuning, workload profiles
- **Quality**: Custom quality rules, automated fixes, quality gates

---

## Support

For questions, issues, or feature requests:
- Review the main README.md
- Check ROADMAP.md for future plans
- Reference PRD.md for design decisions
