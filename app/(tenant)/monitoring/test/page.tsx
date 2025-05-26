"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Play, RefreshCw } from "lucide-react"
import { MonitoringTest } from "@/lib/monitoring/monitoring-test"
import { useMonitoring } from "@/hooks/useMonitoring"

interface TestResult {
  test: string
  passed: boolean
  error?: string
}

export default function MonitoringTestPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{ passed: number; failed: number; results: TestResult[] } | null>(null)
  const { trackUserAction } = useMonitoring()

  const runTests = async () => {
    setTesting(true)
    trackUserAction("run_monitoring_tests")

    try {
      const testResults = await MonitoringTest.runAllTests()
      setResults(testResults)
    } catch (error) {
      console.error("Failed to run monitoring tests:", error)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Test Suite</h1>
          <p className="text-muted-foreground">Test all monitoring and Sentry integrations</p>
        </div>
        <Button onClick={runTests} disabled={testing}>
          {testing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
              <CardDescription>Overall test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Tests:</span>
                  <span>{results.passed + results.failed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Passed:</span>
                  <Badge variant="default">{results.passed}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Failed:</span>
                  <Badge variant={results.failed > 0 ? "destructive" : "default"}>{results.failed}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span>{((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Individual test outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{result.test}</span>
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Badge variant={result.passed ? "default" : "destructive"}>
                        {result.passed ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {results && results.failed > 0 && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Some tests failed. Check the Sentry dashboard for detailed error information and ensure all environment
            variables are properly configured.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What This Tests</CardTitle>
          <CardDescription>Comprehensive monitoring system validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Business Metrics</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Booking creation tracking</li>
                <li>• Client registration tracking</li>
                <li>• Payment processing metrics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Performance Tracking</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• API response time monitoring</li>
                <li>• Database query performance</li>
                <li>• Component render tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Error Tracking</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Exception capture and reporting</li>
                <li>• Error context and tagging</li>
                <li>• Sentry integration validation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">User Behavior</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• User action tracking</li>
                <li>• Feature usage analytics</li>
                <li>• Session and interaction monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
