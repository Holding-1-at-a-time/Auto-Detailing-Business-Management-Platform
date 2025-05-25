import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown } from "lucide-react"

interface AnalyticsCardProps {
  title: string
  value: string
  change: string
  type: "positive" | "negative" | "neutral"
}

export function AnalyticsCard({ title, value, change, type }: AnalyticsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-sm">
          {type === "positive" && (
            <>
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-500">{change}</span>
            </>
          )}
          {type === "negative" && (
            <>
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
              <span className="text-red-500">{change}</span>
            </>
          )}
          {type === "neutral" && <span className="text-muted-foreground">{change}</span>}
          <span className="ml-1 text-muted-foreground">from last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
