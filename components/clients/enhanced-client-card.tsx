import type { Client } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar, AlertCircle, Crown } from "lucide-react"
import { formatDate } from "@/lib/utils/date-utils"
import { useQuery } from "convex/react"

interface EnhancedClientCardProps {
  client: Client
  tenantId: string
  lastBookingDate?: Date | null
}

export function EnhancedClientCard({ client, tenantId, lastBookingDate }: EnhancedClientCardProps) {
  // Get client's total spent from analytics
  const analytics = useQuery("analytics.getClientAnalytics", {
    tenantId,
    clientId: client.id,
  })

  const totalSpent = analytics?.totalSpent || 0
  const isVIP = totalSpent > 1000 // VIP if spent more than $1000

  // Check for missing required fields
  const hasIncompleteData = !client.email && !client.phone

  // Generate initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={isVIP ? "bg-yellow-100 text-yellow-800" : ""}>
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{client.name || "Unnamed Client"}</h3>
              {isVIP && (
                <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Crown className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              )}
              {hasIncompleteData && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Data incomplete
                </Badge>
              )}
            </div>

            {client.email ? (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Mail className="mr-1 h-4 w-4" />
                {client.email}
              </div>
            ) : (
              <div className="flex items-center mt-2 text-sm text-muted-foreground italic">
                <Mail className="mr-1 h-4 w-4" />
                No email provided
              </div>
            )}

            {client.phone ? (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Phone className="mr-1 h-4 w-4" />
                {client.phone}
              </div>
            ) : (
              <div className="flex items-center mt-2 text-sm text-muted-foreground italic">
                <Phone className="mr-1 h-4 w-4" />
                No phone provided
              </div>
            )}

            {lastBookingDate && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                Last visit: {formatDate(lastBookingDate)}
              </div>
            )}

            {totalSpent > 0 && (
              <div className="mt-2 text-sm font-medium text-green-600">Total spent: ${totalSpent.toFixed(2)}</div>
            )}
          </div>
        </div>

        {client.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">{client.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
