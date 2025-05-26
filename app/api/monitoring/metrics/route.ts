import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { withSentry } from "@/lib/api/sentry-wrapper"

async function handler(req: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Simulate metrics - in production, these would come from your monitoring system
  const metrics = {
    errorRate: Math.random() * 2, // 0-2%
    responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
    uptime: 99.5 + Math.random() * 0.5, // 99.5-100%
    activeUsers: Math.floor(Math.random() * 100) + 10,
    totalBookings: Math.floor(Math.random() * 500) + 100,
    revenue: Math.floor(Math.random() * 50000) + 10000,
    lastUpdated: new Date().toISOString(),
  }

  return NextResponse.json(metrics)
}

export const GET = withSentry(handler, {
  operation: "monitoring.metrics",
  tags: { endpoint: "metrics" },
})
