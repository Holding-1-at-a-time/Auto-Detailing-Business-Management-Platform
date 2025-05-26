import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const ENVIRONMENT = process.env.NODE_ENV || "development"
const RELEASE = process.env.VERCEL_GIT_COMMIT_SHA || "local"

Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,
  release: RELEASE,

  // Performance Monitoring
  tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
  profilesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,

  // Debug settings
  debug: ENVIRONMENT === "development",

  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],

  beforeSend(event, hint) {
    // Add server-specific context
    if (event.request) {
      event.tags = {
        ...event.tags,
        server: "true",
      }
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
})

import "./lib/sentry"
