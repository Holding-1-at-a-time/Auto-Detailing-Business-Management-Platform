"use client"

import * as Sentry from "@sentry/nextjs"
import type { User } from "@clerk/nextjs/server"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const ENVIRONMENT = process.env.NODE_ENV || "development"
const RELEASE = process.env.VERCEL_GIT_COMMIT_SHA || "local"

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not configured")
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE,

    // Performance Monitoring
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    profilesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Debug settings
    debug: ENVIRONMENT === "development",

    // Integrations
    integrations: [
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
        maskAllInputs: true,
      }),
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.nextRouterInstrumentation,
        tracePropagationTargets: ["localhost", /^https:\/\/.*\.vercel\.app/, /^https:\/\/.*\.autodetailer\.app/],
      }),
    ],

    // Custom error filtering
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      if (event.exception) {
        const error = hint.originalException
        if (error instanceof Error) {
          // Don't send network errors in development
          if (ENVIRONMENT === "development" && error.message.includes("fetch")) {
            return null
          }

          // Filter out Clerk authentication errors that are expected
          if (error.message.includes("Clerk") && error.message.includes("unauthenticated")) {
            return null
          }

          // Filter out AbortController errors
          if (error.name === "AbortError") {
            return null
          }
        }
      }

      // Add custom tags
      event.tags = {
        ...event.tags,
        component: event.tags?.component || "unknown",
        feature: event.tags?.feature || "unknown",
      }

      return event
    },

    beforeSendTransaction(event) {
      // Sample transactions in production
      if (ENVIRONMENT === "production" && Math.random() > 0.1) {
        return null
      }

      return event
    },

    // Custom fingerprinting for better error grouping
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === "console" && breadcrumb.level === "log") {
        return null
      }

      if (breadcrumb.category === "navigation" && breadcrumb.data?.from === breadcrumb.data?.to) {
        return null
      }

      return breadcrumb
    },
  })
}

// Enhanced error capture with context
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, any>
    user?: Partial<User>
    tenantId?: string
    level?: "fatal" | "error" | "warning" | "info" | "debug"
  },
) {
  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }

    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.emailAddresses?.[0]?.emailAddress,
        username: context.user.username || undefined,
      })
    }

    if (context?.tenantId) {
      scope.setTag("tenantId", context.tenantId)
      scope.setContext("tenant", { id: context.tenantId })
    }

    if (context?.level) {
      scope.setLevel(context.level)
    }

    Sentry.captureException(error)
  })
}

// Enhanced message capture
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, any>
    tenantId?: string
  },
) {
  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }

    if (context?.tenantId) {
      scope.setTag("tenantId", context.tenantId)
    }

    scope.setLevel(level)
    Sentry.captureMessage(message, level)
  })
}

// Performance monitoring
export function startTransaction(name: string, op: string, data?: Record<string, any>) {
  return Sentry.startTransaction({
    name,
    op,
    data,
  })
}

// Custom metrics
export function recordMetric(name: string, value: number, tags?: Record<string, string>) {
  Sentry.metrics.increment(name, value, {
    tags,
  })
}

// User feedback
export function showUserFeedback() {
  const user = Sentry.getCurrentHub().getScope()?.getUser()
  if (user) {
    Sentry.showReportDialog({
      eventId: Sentry.lastEventId(),
      user: {
        email: user.email || "",
        name: user.username || user.id || "",
      },
    })
  }
}

// Set user context
export function setUserContext(user: {
  id: string
  email?: string
  username?: string
  tenantId?: string
  organizationId?: string
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })

  if (user.tenantId) {
    Sentry.setTag("tenantId", user.tenantId)
  }

  if (user.organizationId) {
    Sentry.setTag("organizationId", user.organizationId)
  }
}

// Clear user context on logout
export function clearUserContext() {
  Sentry.setUser(null)
}
