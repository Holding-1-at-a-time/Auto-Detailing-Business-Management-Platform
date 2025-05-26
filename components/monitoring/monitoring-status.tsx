"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Activity, TrendingUp } from "lucide-react"

interface MonitoringStatus {
  sentry: "connected" | "disconnected" | "error"
  monitoring: "active" | "inactive" | "error"
  healthChecks: "passing" | "failing" | "unknown"
  errorRate: number
  lastUpdate: string
}

export function MonitoringStatus() {
  const [status, setStatus] = useState<MonitoringStatus>({
    sentry: "connected",
    monitoring: "active",
    healthChecks: "passing",
    errorRate: 0.5,
    lastUpdate: new Date().toISOString(),
  })

  useEffect(() => {
    const checkStatus = () => {
      // In production, this would check real status
      setStatus({
        sentry: "connected",
        monitoring: "active",
        healthChecks: Math.random() > 0.1 ? "passing" : "failing",
        errorRate: Math.random() * 2,
        lastUpdate: new Date().toISOString(),
      })
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
      case "passing":
        return "text-green-600"
      case "failing":
      case "error":
        return "text-red-600"
      default:
        return "text-yellow-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
      case "passing":
        return <CheckCircle className="h-4 w-4" />
      case "failing":
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Monitoring Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Sentry</span>
            <div className={`flex items-center gap-2 ${getStatusColor(status.sentry)}`}>
              {getStatusIcon(status.sentry)}
              <Badge variant={status.sentry === "connected" ? "default" : "destructive"}>{status.sentry}</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Monitoring</span>
            <div className={`flex items-center gap-2 ${getStatusColor(status.monitoring)}`}>
              {getStatusIcon(status.monitoring)}
              <Badge variant={status.monitoring === "active" ? "default" : "destructive"}>{status.monitoring}</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Health Checks</span>
            <div className={`flex items-center gap-2 ${getStatusColor(status.healthChecks)}`}>
              {getStatusIcon(status.healthChecks)}
              <Badge variant={status.healthChecks === "passing" ? "default" : "destructive"}>
                {status.healthChecks}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Error Rate</span>
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${status.errorRate > 2 ? "text-red-600" : "text-green-600"}`} />
              <Badge variant={status.errorRate > 2 ? "destructive" : "default"}>{status.errorRate.toFixed(2)}%</Badge>
            </div>
          </div>
        </div>

        {status.errorRate > 2 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error rate is above normal levels. Check the monitoring dashboard for details.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(status.lastUpdate).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}
