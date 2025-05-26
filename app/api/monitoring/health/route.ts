import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { withSentry } from "@/lib/api/sentry-wrapper"

async function handler(req: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Simulate health checks - in production, these would be real health checks
  const health = {
    database: "healthy" as const,
    api: "healthy" as const,
    integrations: {
      googleCalendar: Math.random() > 0.1 ? ("healthy" as const) : ("degraded" as const),
      stripe: "healthy" as const,
      email: Math.random() > 0.05 ? ("healthy" as const) : ("degraded" as const),
    },
  }

  return NextResponse.json(health)
}

export const GET = withSentry(handler, {
  operation: "monitoring.health",
  tags: { endpoint: "health" },
})
