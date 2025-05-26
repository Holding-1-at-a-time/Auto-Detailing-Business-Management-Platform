import { BookingChat } from "@/components/booking-agent/booking-chat"

export default function BookingAgentPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">AI Booking Assistant</h1>
      <p className="mb-6 text-muted-foreground">
        Use our AI assistant to schedule appointments, check availability, or manage your bookings. Simply type your
        request in natural language.
      </p>
      <BookingChat />
    </div>
  )
}
