"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  RefreshCw,
} from "lucide-react"
import { useSentryMonitoring } from "@/hooks/useSentryMonitoring"
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring"
import { useTenant } from "@/hooks/useTenant"

interface MonitoringMetrics {
  errorRate: number
  responseTime: number
  uptime: number
  activeUsers: number
  totalBookings: number
  revenue: number
  lastUpdated: string
}

interface SystemHealth {
  database: "healthy" | "degraded" | "down"
  api: "healthy" | "degraded" | "down"
  integrations: {
    googleCalendar: "healthy" | "degraded" | "down"
    stripe: "healthy" | "degraded" | "down"
    email: "healthy" | "degraded" | "down"
  }
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const { trackAction, trackBusinessMetric } = useSentryMonitoring()
  const { trackUserInteraction } = usePerformanceMonitoring("MonitoringPage")
  const { tenantId } = useTenant()

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      trackAction("monitoring.refresh", { tenantId })

      const [metricsRes, healthRes] = await Promise.all([
        fetch("/api/monitoring/metrics"),
        fetch("/api/monitoring/health"),
      ])

      const metricsData = await metricsRes.json()
      const healthData = await healthRes.json()

      setMetrics(metricsData)
      setHealth(healthData)
      setLastRefresh(new Date())

      // Track business metrics
      trackBusinessMetric("error_rate", metricsData.errorRate)
      trackBusinessMetric("response_time", metricsData.responseTime)
      trackBusinessMetric("active_users", metricsData.activeUsers)
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "degraded":
        return "text-yellow-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "degraded":
        return <AlertTriangle className="h-4 w-4" />
      case "down":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleRefresh = () => {
    trackUserInteraction("refresh_monitoring")
    fetchMetrics()
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading monitoring data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Last updated: {lastRefresh.toLocaleTimeString()}</span>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.errorRate.toFixed(2)}%</div>
            <Progress value={metrics?.errorRate || 0} className="mt-2" max={5} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average API response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.uptime.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="business">Business Metrics</TabsTrigger>
          <TabsTrigger value="errors">Error Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Core Services</CardTitle>
                <CardDescription>Status of essential system components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Database</span>
                  <div className={`flex items-center gap-2 ${getHealthColor(health?.database || "unknown")}`}>
                    {getHealthIcon(health?.database || "unknown")}
                    <Badge variant={health?.database === "healthy" ? "default" : "destructive"}>
                      {health?.database || "Unknown"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>API</span>
                  <div className={`flex items-center gap-2 ${getHealthColor(health?.api || "unknown")}`}>
                    {getHealthIcon(health?.api || "unknown")}
                    <Badge variant={health?.api === "healthy" ? "default" : "destructive"}>
                      {health?.api || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Third-party service connections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Google Calendar</span>
                  <div
                    className={`flex items-center gap-2 ${getHealthColor(health?.integrations?.googleCalendar || "unknown")}`}
                  >
                    {getHealthIcon(health?.integrations?.googleCalendar || "unknown")}
                    <Badge variant={health?.integrations?.googleCalendar === "healthy" ? "default" : "destructive"}>
                      {health?.integrations?.googleCalendar || "Unknown"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Stripe</span>
                  <div
                    className={`flex items-center gap-2 ${getHealthColor(health?.integrations?.stripe || "unknown")}`}
                  >
                    {getHealthIcon(health?.integrations?.stripe || "unknown")}
                    <Badge variant={health?.integrations?.stripe === "healthy" ? "default" : "destructive"}>
                      {health?.integrations?.stripe || "Unknown"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email Service</span>
                  <div
                    className={`flex items-center gap-2 ${getHealthColor(health?.integrations?.email || "unknown")}`}
                  >
                    {getHealthIcon(health?.integrations?.email || "unknown")}
                    <Badge variant={health?.integrations?.email === "healthy" ? "default" : "destructive"}>
                      {health?.integrations?.email || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Average Response Time</span>
                    <span>{metrics?.responseTime}ms</span>
                  </div>
                  <Progress value={(metrics?.responseTime || 0) / 10} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Error Rate</span>
                    <span>{metrics?.errorRate.toFixed(2)}%</span>
                  </div>
                  <Progress value={metrics?.errorRate || 0} className="mt-2" max={5} />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>System Uptime</span>
                    <span>{metrics?.uptime.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics?.uptime || 0} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalBookings}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics?.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error tracking is handled by Sentry. Check your Sentry dashboard for detailed error analysis and session
              replays.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
              <CardDescription>Recent error statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Current Error Rate</span>
                  <Badge variant={metrics && metrics.errorRate > 2 ? "destructive" : "default"}>
                    {metrics?.errorRate.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sentry Integration</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Session Replay</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
