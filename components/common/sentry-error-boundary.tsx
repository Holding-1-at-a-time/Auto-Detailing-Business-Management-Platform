"use client"

import React from "react"
import * as Sentry from "@sentry/nextjs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, MessageSquare } from "lucide-react"
import { showUserFeedback } from "@/lib/sentry"

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  tags?: Record<string, string>
  level?: "error" | "warning" | "info"
}

interface State {
  hasError: boolean
  error: Error | null
  eventId: string | null
}

export class SentryErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, eventId: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, eventId: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const eventId = Sentry.withScope((scope) => {
      if (this.props.tags) {
        Object.entries(this.props.tags).forEach(([key, value]) => {
          scope.setTag(key, value)
        })
      }

      scope.setTag("errorBoundary", "true")
      scope.setLevel(this.props.level || "error")
      scope.setContext("errorInfo", errorInfo)

      return Sentry.captureException(error)
    })

    this.setState({ eventId })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const resetError = () => {
        this.setState({ hasError: false, error: null, eventId: null })
      }

      if (this.props.fallback) {
        const Fallback = this.props.fallback
        return <Fallback error={this.state.error} resetError={resetError} />
      }

      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">An unexpected error occurred. Our team has been notified.</p>
              {this.state.eventId && (
                <p className="text-sm text-muted-foreground mb-4">Error ID: {this.state.eventId}</p>
              )}
              <div className="flex gap-2">
                <Button onClick={resetError} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try again
                </Button>
                <Button onClick={showUserFeedback} variant="default" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Report issue
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
