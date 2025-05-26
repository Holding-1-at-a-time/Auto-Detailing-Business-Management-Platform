import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const ENVIRONMENT = process.env.NODE_ENV || "development"
const RELEASE = process.env.VERCEL_GIT_COMMIT_SHA || "local"

Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,
  release: RELEASE,

  // Performance Monitoring
  tracesSampleRate: ENVIRONMENT === "production" ? 0.05 : 1.0,

  // Debug settings
  debug: ENVIRONMENT === "development",

  beforeSend(event) {
    // Add edge-specific context
    event.tags = {
      ...event.tags,
      runtime: "edge",
    }

    return event
  },
})

import "./lib/sentry"
