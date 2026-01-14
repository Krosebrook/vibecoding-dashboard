import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  Warning, 
  XCircle, 
  ChartDonut,
  ListChecks,
  MagnifyingGlass,
  Shield,
  Clock
} from '@phosphor-icons/react'
import { DatabaseConnection, DataQualityReport } from '@/lib/types'
import { toast } from 'sonner'

interface DataQualityDashboardProps {
  connection: DatabaseConnection | null
  onRunAssessment?: () => void
}

export function DataQualityDashboard({ connection, onRunAssessment }: DataQualityDashboardProps) {
  const [report, setReport] = useState<DataQualityReport | null>(null)
  const [isAssessing, setIsAssessing] = useState(false)

  const runAssessment = async () => {
    if (!connection) return

    setIsAssessing(true)
    toast.loading('Assessing data quality...')

    await new Promise(resolve => setTimeout(resolve, 2500))

    const mockReport: DataQualityReport = {
      connectionId: connection.id,
      timestamp: new Date().toISOString(),
      completeness: 92,
      accuracy: 88,
      consistency: 95,
      timeliness: 78,
      validity: 91,
      metrics: [
        {
          id: '1',
          name: 'Null Values',
          value: 8,
          status: 'good',
          description: '8% of fields contain null values',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Duplicate Records',
          value: 3,
          status: 'good',
          description: '3% of records are duplicates',
          timestamp: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Invalid Emails',
          value: 12,
          status: 'warning',
          description: '12% of email addresses are invalid',
          timestamp: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Outdated Records',
          value: 22,
          status: 'warning',
          description: '22% of records not updated in 6+ months',
          timestamp: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'Schema Violations',
          value: 5,
          status: 'good',
          description: '5% of records have schema violations',
          timestamp: new Date().toISOString(),
        },
      ],
      issues: [
        {
          field: 'email',
          issue: 'Invalid email format',
          severity: 'medium',
          affectedRecords: 156,
        },
        {
          field: 'phone',
          issue: 'Missing area code',
          severity: 'low',
          affectedRecords: 82,
        },
        {
          field: 'created_at',
          issue: 'Future dates detected',
          severity: 'high',
          affectedRecords: 12,
        },
        {
          field: 'status',
          issue: 'Invalid status values',
          severity: 'medium',
          affectedRecords: 45,
        },
      ],
    }

    setReport(mockReport)
    setIsAssessing(false)
    toast.success('Data quality assessment complete')

    if (onRunAssessment) {
      onRunAssessment()
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success'
    if (score >= 70) return 'text-warning'
    return 'text-destructive'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Fair'
    return 'Poor'
  }

  const overallScore = report
    ? Math.round(
        (report.completeness +
          report.accuracy +
          report.consistency +
          report.timeliness +
          report.validity) /
          5
      )
    : 0

  if (!connection) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Shield size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
          <p>Select a database connection to assess data quality</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={24} weight="duotone" />
              Data Quality Assessment
            </div>
            <Button onClick={runAssessment} disabled={isAssessing}>
              {isAssessing ? (
                <>
                  <MagnifyingGlass size={16} className="mr-2 animate-pulse" />
                  Assessing...
                </>
              ) : (
                <>
                  <MagnifyingGlass size={16} className="mr-2" />
                  Run Assessment
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Comprehensive data quality metrics for {connection.name}
          </CardDescription>
        </CardHeader>
      </Card>

      {report && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Overall Quality Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {getScoreLabel(overallScore)}
                  </div>
                </div>
                <ChartDonut size={80} weight="duotone" className="text-accent opacity-50" />
              </div>
              <Progress value={overallScore} className="h-3" />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Completeness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(report.completeness)}`}>
                  {report.completeness}%
                </div>
                <Progress value={report.completeness} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Data presence and non-null values
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(report.accuracy)}`}>
                  {report.accuracy}%
                </div>
                <Progress value={report.accuracy} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Correctness and validity of data
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Consistency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(report.consistency)}`}>
                  {report.consistency}%
                </div>
                <Progress value={report.consistency} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Uniformity across datasets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Timeliness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(report.timeliness)}`}>
                  {report.timeliness}%
                </div>
                <Progress value={report.timeliness} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Data freshness and currency
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Validity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(report.validity)}`}>
                  {report.validity}%
                </div>
                <Progress value={report.validity} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Schema and format compliance
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
              <TabsTrigger value="issues">Issues Found</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks size={20} weight="duotone" />
                    Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.metrics.map(metric => {
                      const Icon =
                        metric.status === 'good'
                          ? CheckCircle
                          : metric.status === 'warning'
                          ? Warning
                          : XCircle

                      const colorClass =
                        metric.status === 'good'
                          ? 'text-success'
                          : metric.status === 'warning'
                          ? 'text-warning'
                          : 'text-destructive'

                      return (
                        <div
                          key={metric.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={24} weight="duotone" className={colorClass} />
                            <div>
                              <div className="font-semibold">{metric.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {metric.description}
                              </div>
                            </div>
                          </div>
                          <Badge variant={metric.status === 'good' ? 'outline' : 'secondary'}>
                            {metric.value}%
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warning size={20} weight="duotone" />
                    Data Issues
                  </CardTitle>
                  <CardDescription>
                    {report.issues.length} issues found requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.issues.map((issue, i) => {
                      const severityConfig = {
                        high: { icon: XCircle, color: 'text-destructive', badge: 'destructive' as const },
                        medium: { icon: Warning, color: 'text-warning', badge: 'secondary' as const },
                        low: { icon: Warning, color: 'text-info', badge: 'outline' as const },
                      }

                      const config = severityConfig[issue.severity]
                      const Icon = config.icon

                      return (
                        <div
                          key={i}
                          className="flex items-start justify-between p-4 rounded-lg border border-border"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <Icon size={24} weight="duotone" className={`${config.color} mt-0.5`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-semibold text-sm">
                                  {issue.field}
                                </span>
                                <Badge variant={config.badge} className="text-xs capitalize">
                                  {issue.severity}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {issue.issue}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Affects {issue.affectedRecords.toLocaleString()} records
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} weight="duotone" />
                Assessment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Connection</div>
                  <div className="font-semibold">{connection.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Timestamp</div>
                  <div className="font-semibold">
                    {new Date(report.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
