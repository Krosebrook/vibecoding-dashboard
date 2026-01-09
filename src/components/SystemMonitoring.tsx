import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardComponent } from '@/lib/types'
import { 
  Cpu, 
  HardDrive,
  WifiHigh,
  CheckCircle,
  Warning,
  XCircle,
  ChartLine,
  Database,
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface SystemMonitoringProps {
  component: DashboardComponent
}

export function CPUMonitor({ component }: SystemMonitoringProps) {
  const [cpuUsage, setCpuUsage] = useState(45)
  const [history, setHistory] = useState<number[]>([40, 42, 38, 45])

  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = Math.max(10, Math.min(95, cpuUsage + (Math.random() - 0.5) * 15))
      setCpuUsage(newValue)
      setHistory(prev => [...prev.slice(-29), newValue])
    }, 2000)

    return () => clearInterval(interval)
  }, [cpuUsage])

  const getStatusColor = (value: number) => {
    if (value < 50) return 'text-green-500'
    if (value < 75) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStatusBadge = (value: number) => {
    if (value < 50) return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Healthy</Badge>
    if (value < 75) return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Warning</Badge>
    return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Critical</Badge>
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Cpu size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {component.title || 'CPU Usage'}
            </CardTitle>
          </div>
        </div>
        {getStatusBadge(cpuUsage)}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`text-4xl font-bold ${getStatusColor(cpuUsage)}`}>
            {cpuUsage.toFixed(1)}%
          </div>
          
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                cpuUsage < 50 ? 'bg-green-500' : cpuUsage < 75 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${cpuUsage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="h-16 flex items-end gap-1">
            {history.map((value, idx) => (
              <motion.div
                key={idx}
                className={`flex-1 rounded-t ${
                  value < 50 ? 'bg-green-500/50' : value < 75 ? 'bg-yellow-500/50' : 'bg-red-500/50'
                }`}
                initial={{ height: 0 }}
                animate={{ height: `${(value / 100) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MemoryMonitor({ component }: SystemMonitoringProps) {
  const [memoryUsage, setMemoryUsage] = useState(62)
  const totalMemory = 16

  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryUsage(prev => Math.max(30, Math.min(90, prev + (Math.random() - 0.5) * 10)))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const usedMemory = ((memoryUsage / 100) * totalMemory).toFixed(2)

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10">
            <HardDrive size={24} weight="duotone" className="text-secondary" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {component.title || 'Memory Usage'}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold">{usedMemory}</div>
            <div className="text-lg text-muted-foreground">/ {totalMemory} GB</div>
          </div>
          
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-secondary to-accent"
              animate={{ width: `${memoryUsage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-muted-foreground">Used</div>
              <div className="font-bold mt-1">{usedMemory} GB</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-muted-foreground">Free</div>
              <div className="font-bold mt-1">{(totalMemory - parseFloat(usedMemory)).toFixed(2)} GB</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NetworkMonitor({ component }: SystemMonitoringProps) {
  const [upload, setUpload] = useState(2.4)
  const [download, setDownload] = useState(8.7)

  useEffect(() => {
    const interval = setInterval(() => {
      setUpload(Math.random() * 10)
      setDownload(Math.random() * 50)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <WifiHigh size={24} weight="duotone" className="text-accent" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {component.title || 'Network Traffic'}
            </CardTitle>
          </div>
        </div>
        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Online</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Upload</span>
              </div>
              <span className="text-lg font-bold">{upload.toFixed(1)} MB/s</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Download</span>
              </div>
              <span className="text-lg font-bold">{download.toFixed(1)} MB/s</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-muted-foreground">Packets Sent</div>
              <div className="font-bold mt-1">{(upload * 1000).toFixed(0)}</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-muted-foreground">Packets Recv</div>
              <div className="font-bold mt-1">{(download * 1000).toFixed(0)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ServerStatus({ component }: SystemMonitoringProps) {
  const servers = [
    { name: 'Web Server 1', status: 'online', uptime: '45d 12h', load: 34 },
    { name: 'Web Server 2', status: 'online', uptime: '45d 12h', load: 28 },
    { name: 'Database Primary', status: 'online', uptime: '89d 3h', load: 52 },
    { name: 'Database Replica', status: 'warning', uptime: '12d 8h', load: 78 },
    { name: 'Cache Server', status: 'online', uptime: '23d 15h', load: 15 },
    { name: 'API Gateway', status: 'online', uptime: '45d 12h', load: 41 },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle size={16} weight="fill" className="text-green-500" />
      case 'warning':
        return <Warning size={16} weight="fill" className="text-yellow-500" />
      case 'offline':
        return <XCircle size={16} weight="fill" className="text-red-500" />
      default:
        return <CheckCircle size={16} weight="fill" className="text-gray-500" />
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={20} weight="duotone" />
          {component.title || 'Server Status'}
        </CardTitle>
        <CardDescription>
          {servers.filter(s => s.status === 'online').length} / {servers.length} servers online
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {servers.map((server, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getStatusIcon(server.status)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{server.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Uptime: {server.uptime}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Load</div>
                  <div className="text-sm font-bold">{server.load}%</div>
                </div>
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      server.load < 60 ? 'bg-green-500' : server.load < 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${server.load}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AlertList({ component }: SystemMonitoringProps) {
  const [alerts] = useState([
    {
      level: 'warning',
      message: 'Database Replica load above 75%',
      time: '2 min ago',
      server: 'DB-REPLICA-01',
    },
    {
      level: 'info',
      message: 'Backup completed successfully',
      time: '15 min ago',
      server: 'BACKUP-SRV',
    },
    {
      level: 'critical',
      message: 'SSL certificate expires in 7 days',
      time: '1 hour ago',
      server: 'WEB-SRV-01',
    },
    {
      level: 'info',
      message: 'System update available',
      time: '2 hours ago',
      server: 'ALL',
    },
  ])

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/10'
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/10'
      case 'info':
        return 'border-blue-500/50 bg-blue-500/10'
      default:
        return 'border-gray-500/50 bg-gray-500/10'
    }
  }

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <XCircle size={16} weight="fill" className="text-red-500" />
      case 'warning':
        return <Warning size={16} weight="fill" className="text-yellow-500" />
      case 'info':
        return <CheckCircle size={16} weight="fill" className="text-blue-500" />
      default:
        return <CheckCircle size={16} weight="fill" className="text-gray-500" />
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Warning size={20} weight="duotone" />
          {component.title || 'System Alerts'}
        </CardTitle>
        <CardDescription>
          {alerts.filter(a => a.level === 'critical').length} critical alerts require attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${getAlertColor(alert.level)}`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.level)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{alert.server}</span>
                    <span>•</span>
                    <span>{alert.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function RealtimeChart({ component }: SystemMonitoringProps) {
  const [dataPoints, setDataPoints] = useState<number[]>(
    Array.from({ length: 30 }, () => Math.random() * 80 + 20)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints(prev => [...prev.slice(1), Math.random() * 80 + 20])
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine size={20} weight="duotone" />
          {component.title || 'Real-Time Metrics'}
        </CardTitle>
        <CardDescription>Live system performance over the last minute</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] relative">
          <svg width="100%" height="100%" className="overflow-visible">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.75 0.15 195)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="oklch(0.75 0.15 195)" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            <motion.path
              d={`M 0 ${200 - (dataPoints[0] / 100) * 200} ${dataPoints
                .map((point, i) => `L ${(i / (dataPoints.length - 1)) * 100}% ${200 - (point / 100) * 200}`)
                .join(' ')} L 100% 200 L 0 200 Z`}
              fill="url(#gradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            <motion.path
              d={`M 0 ${200 - (dataPoints[0] / 100) * 200} ${dataPoints
                .map((point, i) => `L ${(i / (dataPoints.length - 1)) * 100}% ${200 - (point / 100) * 200}`)
                .join(' ')}`}
              stroke="oklch(0.75 0.15 195)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          
          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-muted-foreground">
            <span>60s ago</span>
            <span>30s ago</span>
            <span>Now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
