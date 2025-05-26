import { type NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { auth } from "@clerk/nextjs/server"
import { captureException } from "@/lib/sentry"

export function withSentry<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>,
  options?: {
    operation?: string
    tags?: Record<string, string>
  },
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const transaction = Sentry.startTransaction({
      name: `${req.method} ${req.nextUrl.pathname}`,
      op: options?.operation || "http.server",
      data: {
        method: req.method,
        url: req.url,
        pathname: req.nextUrl.pathname,
      },
    })

    Sentry.getCurrentHub().configureScope((scope) => {
      scope.setSpan(transaction)

      if (options?.tags) {
        Object.entries(options.tags).forEach(([key, value]) => {
          scope.setTag(key, value)
        })
      }

      // Add request context
      scope.setContext("request", {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
      })
    })

    try {
      // Add user context if authenticated
      try {
        const { userId, orgId } = auth()
        if (userId) {
          Sentry.setUser({ id: userId })
          if (orgId) {
            Sentry.setTag("organizationId", orgId)
          }
        }
      } catch (authError) {
        // Auth might fail, that's okay
      }

      const response = await handler(req, ...args)

      transaction.setHttpStatus(response.status)
      transaction.setTag("http.status_code", response.status.toString())

      return response
    } catch (error) {
      transaction.setHttpStatus(500)
      transaction.setTag("http.status_code", "500")

      captureException(error as Error, {
        tags: {
          route: req.nextUrl.pathname,
          method: req.method,
          ...options?.tags,
        },
        extra: {
          url: req.url,
          headers: Object.fromEntries(req.headers.entries()),
        },
      })

      return NextResponse.json({ error: "Internal server error", eventId: Sentry.lastEventId() }, { status: 500 })
    } finally {
      transaction.finish()
    }
  }
}
