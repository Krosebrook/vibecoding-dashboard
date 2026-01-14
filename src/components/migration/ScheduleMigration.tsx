import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Calendar, Clock, Plus, Trash, Play, Pause } from '@phosphor-icons/react'
import { MigrationConfig } from '@/lib/types'
import { toast } from 'sonner'

interface ScheduledMigration {
  id: string
  configId: string
  configName: string
  schedule: {
    type: 'once' | 'daily' | 'weekly' | 'monthly'
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
    date?: string
  }
  enabled: boolean
  lastRun?: string
  nextRun: string
  createdAt: string
}

interface ScheduleMigrationProps {
  configs: MigrationConfig[]
}

export function ScheduleMigration({ configs }: ScheduleMigrationProps) {
  const [schedules, setSchedules] = useKV<ScheduledMigration[]>('scheduled-migrations', [])
  const [isCreating, setIsCreating] = useState(false)

  const [formData, setFormData] = useState({
    configId: '',
    scheduleType: 'once',
    time: '00:00',
    dayOfWeek: '1',
    dayOfMonth: '1',
    date: new Date().toISOString().split('T')[0],
  })

  const handleCreate = () => {
    if (!formData.configId) {
      toast.error('Please select a migration configuration')
      return
    }

    const config = configs.find(c => c.id === formData.configId)
    if (!config) return

    const newSchedule: ScheduledMigration = {
      id: `schedule-${Date.now()}`,
      configId: formData.configId,
      configName: config.name,
      schedule: {
        type: formData.scheduleType as any,
        time: formData.time,
        dayOfWeek: formData.scheduleType === 'weekly' ? parseInt(formData.dayOfWeek) : undefined,
        dayOfMonth: formData.scheduleType === 'monthly' ? parseInt(formData.dayOfMonth) : undefined,
        date: formData.scheduleType === 'once' ? formData.date : undefined,
      },
      enabled: true,
      nextRun: calculateNextRun(formData),
      createdAt: new Date().toISOString(),
    }

    setSchedules((current) => [...(current || []), newSchedule])
    setIsCreating(false)
    toast.success('Migration scheduled successfully')

    setFormData({
      configId: '',
      scheduleType: 'once',
      time: '00:00',
      dayOfWeek: '1',
      dayOfMonth: '1',
      date: new Date().toISOString().split('T')[0],
    })
  }

  const calculateNextRun = (data: typeof formData): string => {
    const now = new Date()
    const [hours, minutes] = data.time.split(':').map(Number)

    switch (data.scheduleType) {
      case 'once':
        const onceDate = new Date(data.date)
        onceDate.setHours(hours, minutes, 0, 0)
        return onceDate.toISOString()
      
      case 'daily':
        const dailyDate = new Date(now)
        dailyDate.setHours(hours, minutes, 0, 0)
        if (dailyDate <= now) {
          dailyDate.setDate(dailyDate.getDate() + 1)
        }
        return dailyDate.toISOString()
      
      case 'weekly':
        const weeklyDate = new Date(now)
        weeklyDate.setHours(hours, minutes, 0, 0)
        const targetDay = parseInt(data.dayOfWeek)
        const currentDay = weeklyDate.getDay()
        const daysUntilTarget = (targetDay - currentDay + 7) % 7
        weeklyDate.setDate(weeklyDate.getDate() + (daysUntilTarget || 7))
        return weeklyDate.toISOString()
      
      case 'monthly':
        const monthlyDate = new Date(now)
        monthlyDate.setHours(hours, minutes, 0, 0)
        monthlyDate.setDate(parseInt(data.dayOfMonth))
        if (monthlyDate <= now) {
          monthlyDate.setMonth(monthlyDate.getMonth() + 1)
        }
        return monthlyDate.toISOString()
      
      default:
        return now.toISOString()
    }
  }

  const handleToggle = (id: string) => {
    setSchedules((current) =>
      (current || []).map((schedule) =>
        schedule.id === id ? { ...schedule, enabled: !schedule.enabled } : schedule
      )
    )
    toast.success('Schedule updated')
  }

  const handleDelete = (id: string) => {
    setSchedules((current) => (current || []).filter((schedule) => schedule.id !== id))
    toast.success('Schedule deleted')
  }

  const formatSchedule = (schedule: ScheduledMigration['schedule']) => {
    const time = schedule.time
    switch (schedule.type) {
      case 'once':
        return `Once on ${new Date(schedule.date!).toLocaleDateString()} at ${time}`
      case 'daily':
        return `Daily at ${time}`
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return `Every ${days[schedule.dayOfWeek!]} at ${time}`
      case 'monthly':
        return `Monthly on day ${schedule.dayOfMonth} at ${time}`
      default:
        return 'Unknown schedule'
    }
  }

  const getStatusBadge = (schedule: ScheduledMigration) => {
    if (!schedule.enabled) {
      return <Badge variant="secondary">Disabled</Badge>
    }
    
    const nextRun = new Date(schedule.nextRun)
    const now = new Date()
    
    if (nextRun < now) {
      return <Badge className="bg-warning/20 text-warning border-warning/40">Pending</Badge>
    }
    
    return <Badge className="bg-success/20 text-success border-success/40">Active</Badge>
  }

  const formatNextRun = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (diff < 0) return 'Overdue'
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`
    return 'Soon'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success/20 to-info/20 flex items-center justify-center">
                  <Calendar size={20} weight="duotone" className="text-success" />
                </div>
                <CardTitle>Schedule Migrations</CardTitle>
              </div>
              <CardDescription>
                Automate migrations to run at specific times or intervals
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
              <Plus size={16} weight="bold" />
              {isCreating ? 'Cancel' : 'New Schedule'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCreating && (
            <Card className="p-6 bg-muted/50 border-2 border-dashed">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="config">Migration Configuration</Label>
                  <Select value={formData.configId} onValueChange={(value) => setFormData({ ...formData, configId: value })}>
                    <SelectTrigger id="config">
                      <SelectValue placeholder="Select a migration" />
                    </SelectTrigger>
                    <SelectContent>
                      {configs.length === 0 ? (
                        <div className="px-2 py-3 text-sm text-muted-foreground">
                          No configurations available
                        </div>
                      ) : (
                        configs.map((config) => (
                          <SelectItem key={config.id} value={config.id}>
                            {config.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-type">Schedule Type</Label>
                  <Select value={formData.scheduleType} onValueChange={(value) => setFormData({ ...formData, scheduleType: value })}>
                    <SelectTrigger id="schedule-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">One-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {formData.scheduleType === 'once' && (
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}

                  {formData.scheduleType === 'weekly' && (
                    <div className="space-y-2">
                      <Label htmlFor="day-of-week">Day of Week</Label>
                      <Select value={formData.dayOfWeek} onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}>
                        <SelectTrigger id="day-of-week">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.scheduleType === 'monthly' && (
                    <div className="space-y-2">
                      <Label htmlFor="day-of-month">Day of Month</Label>
                      <Input
                        id="day-of-month"
                        type="number"
                        min="1"
                        max="31"
                        value={formData.dayOfMonth}
                        onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>
                    Create Schedule
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Scheduled Migrations ({schedules?.length || 0})
            </h3>
            
            {!schedules || schedules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
                <p>No scheduled migrations yet</p>
                <p className="text-sm mt-1">Create your first schedule to automate migrations</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <Card key={schedule.id} className="p-4 hover:border-accent transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold mb-1">{schedule.configName}</div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock size={14} />
                                {formatSchedule(schedule.schedule)}
                              </div>
                            </div>
                            {getStatusBadge(schedule)}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Next run:</span>
                              <span className="font-semibold">
                                {new Date(schedule.nextRun).toLocaleString()}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {formatNextRun(schedule.nextRun)}
                              </Badge>
                            </div>
                          </div>

                          {schedule.lastRun && (
                            <div className="text-xs text-muted-foreground">
                              Last run: {new Date(schedule.lastRun).toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={schedule.enabled}
                            onCheckedChange={() => handleToggle(schedule.id)}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(schedule.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
