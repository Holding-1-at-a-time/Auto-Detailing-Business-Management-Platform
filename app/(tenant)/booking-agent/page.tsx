import { requireTenantAccess } from "@/lib/auth"
import { BookingChat } from "@/components/booking-agent/booking-chat"

interface BookingAgentPageProps {
  params: { tenant: string }
}

export default async function BookingAgentPage({ params }: BookingAgentPageProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">AI Booking Assistant</h1>
      <p className="text-gray-600 mb-8">
        Chat with our AI assistant to schedule your next auto-detailing appointment. Simply describe what service you
        need and when you'd like to come in.
      </p>

      <BookingChat />
    </div>
  )
}
