"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PricingTable } from "@clerk/nextjs"
import { useOrganization, useAuth } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import { useTenant } from "@/hooks/useTenant"
import { useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { BillingDashboard } from "./billing-dashboard"

interface BillingInfo {
  plan: string
  status: "active" | "inactive" | "past_due" | "canceled"
  currentPeriodEnd?: Date
  features: string[]
}

export function BillingSettings() {
  const { organization } = useOrganization()
  const { has } = useAuth()
  const { tenant } = useTenant()
  const convex = useConvex()
  const { toast } = useToast()
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPricing, setShowPricing] = useState(false)

  useEffect(() => {
    loadBillingInfo()
  }, [organization])

  const loadBillingInfo = async () => {
    if (!organization || !tenant) return

    setIsLoading(true)
    try {
      // Get billing info from Convex
      const billing = await convex.query(api.billing.getBillingInfo, {
        tenantId: tenant._id,
      })

      if (billing) {
        setBillingInfo({
          plan: billing.planName || "Free",
          status: billing.status as any,
          currentPeriodEnd: billing.currentPeriodEnd ? new Date(billing.currentPeriodEnd) : undefined,
          features: billing.features || [],
        })
      } else {
        // Default to free plan
        setBillingInfo({
          plan: "Free",
          status: "active",
          features: ["Basic booking management", "Up to 50 bookings/month"],
        })
      }
    } catch (error) {
      console.error("Error loading billing info:", error)
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId: organization?.id,
          tenantId: tenant?._id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create billing portal session")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Error accessing billing portal:", error)
      toast({
        title: "Error",
        description: "Failed to access billing portal",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "past_due":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Past Due
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Canceled
          </Badge>
        )
      default:
        return <Badge variant="outline">Inactive</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading billing information...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Billing Dashboard */}
      <BillingDashboard />

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Current Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{billingInfo?.plan}</h3>
              <p className="text-sm text-muted-foreground">
                {billingInfo?.currentPeriodEnd
                  ? `Renews on ${billingInfo.currentPeriodEnd.toLocaleDateString()}`
                  : "Free plan with basic features"}
              </p>
            </div>
            {getStatusBadge(billingInfo?.status || "inactive")}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Plan Features:</h4>
            <ul className="space-y-1">
              {billingInfo?.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex space-x-2">
            {billingInfo?.plan !== "Free" && (
              <Button onClick={handleManageBilling} variant="outline">
                Manage Billing
              </Button>
            )}
            <Button onClick={() => setShowPricing(!showPricing)}>
              {billingInfo?.plan === "Free" ? "Upgrade Plan" : "Change Plan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Table */}
      {showPricing && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Plan</CardTitle>
            <CardDescription>Select the plan that best fits your business needs</CardDescription>
          </CardHeader>
          <CardContent>
            <PricingTable />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function UsageMetrics() {
  const { tenant } = useTenant()
  const convex = useConvex()
  const [usage, setUsage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsage()
  }, [tenant])

  const loadUsage = async () => {
    if (!tenant) return

    try {
      const usageData = await convex.query(api.billing.getUsageMetrics, {
        tenantId: tenant._id,
      })
      setUsage(usageData)
    } catch (error) {
      console.error("Error loading usage:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading usage...</div>
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">Bookings This Month</p>
        <p className="text-2xl font-bold">{usage?.bookingsThisMonth || 0}</p>
        <p className="text-xs text-muted-foreground">
          {usage?.bookingLimit ? `of ${usage.bookingLimit} limit` : "Unlimited"}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Active Clients</p>
        <p className="text-2xl font-bold">{usage?.activeClients || 0}</p>
        <p className="text-xs text-muted-foreground">
          {usage?.clientLimit ? `of ${usage.clientLimit} limit` : "Unlimited"}
        </p>
      </div>
    </div>
  )
}
