"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTenant } from "@/hooks/useTenant"
import { useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import { TrendingUp, Users, Calendar, CreditCard } from "lucide-react"

interface UsageData {
  bookingsThisMonth: number
  bookingLimit?: number
  activeClients: number
  clientLimit?: number
  planName: string
  status: string
}

export function BillingDashboard() {
  const { tenant } = useTenant()
  const convex = useConvex()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsageData()
  }, [tenant])

  const loadUsageData = async () => {
    if (!tenant) return

    try {
      const [usageMetrics, billingInfo] = await Promise.all([
        convex.query(api.billing.getUsageMetrics, { tenantId: tenant._id }),
        convex.query(api.billing.getBillingInfo, { tenantId: tenant._id }),
      ])

      setUsage({
        bookingsThisMonth: usageMetrics.bookingsThisMonth,
        bookingLimit: usageMetrics.bookingLimit,
        activeClients: usageMetrics.activeClients,
        clientLimit: usageMetrics.clientLimit,
        planName: billingInfo?.planName || "Free",
        status: billingInfo?.status || "active",
      })
    } catch (error) {
      console.error("Error loading usage data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-full bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!usage) return null

  const bookingUsagePercent = usage.bookingLimit ? (usage.bookingsThisMonth / usage.bookingLimit) * 100 : 0

  const clientUsagePercent = usage.clientLimit ? (usage.activeClients / usage.clientLimit) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.planName}</div>
            <Badge variant={usage.status === "active" ? "default" : "destructive"} className="mt-2">
              {usage.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.bookingsThisMonth}</div>
            {usage.bookingLimit && (
              <div className="space-y-2 mt-2">
                <div className="text-xs text-muted-foreground">
                  {usage.bookingsThisMonth} of {usage.bookingLimit} used
                </div>
                <Progress value={bookingUsagePercent} className="h-2" />
              </div>
            )}
            {!usage.bookingLimit && <p className="text-xs text-muted-foreground mt-2">Unlimited</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.activeClients}</div>
            {usage.clientLimit && (
              <div className="space-y-2 mt-2">
                <div className="text-xs text-muted-foreground">
                  {usage.activeClients} of {usage.clientLimit} used
                </div>
                <Progress value={clientUsagePercent} className="h-2" />
              </div>
            )}
            {!usage.clientLimit && <p className="text-xs text-muted-foreground mt-2">Unlimited</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground mt-2">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Warnings */}
      {usage.bookingLimit && bookingUsagePercent > 80 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Usage Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              You've used {Math.round(bookingUsagePercent)}% of your monthly booking limit. Consider upgrading your plan
              to avoid service interruption.
            </p>
            <Button className="mt-4" variant="outline">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
