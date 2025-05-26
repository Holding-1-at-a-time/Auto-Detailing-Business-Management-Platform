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

  // Session Replay
  replaysSessionSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  // Debug settings
  debug: ENVIRONMENT === "development",

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
