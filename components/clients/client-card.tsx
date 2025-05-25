import type { Client } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface ClientCardProps {
  client: Client
  lastBookingDate?: Date | null
}

export function ClientCard({ client, lastBookingDate }: ClientCardProps) {
  // Generate initials for avatar
  const getInitials = (name: string) => {
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
            <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="font-semibold text-lg">{client.name}</h3>

            {client.email && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Mail className="mr-1 h-4 w-4" />
                {client.email}
              </div>
            )}

            {client.phone && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Phone className="mr-1 h-4 w-4" />
                {client.phone}
              </div>
            )}

            {lastBookingDate && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                Last visit: {formatDate(lastBookingDate)}
              </div>
            )}
          </div>
        </div>

        {client.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">{client.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
