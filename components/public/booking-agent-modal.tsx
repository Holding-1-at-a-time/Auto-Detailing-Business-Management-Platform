"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Minimize2, Maximize2 } from "lucide-react"
import { format } from "date-fns"
import type { Id } from "@/convex/_generated/dataModel"
import { BookingChat } from "@/components/booking-agent/booking-chat"

interface BookingAgentModalProps {
  tenantId: Id<"tenants">
  tenantName: string
  onClose: () => void
  prefilledService?: string
  prefilledDate?: Date
}

export function BookingAgentModal({
  tenantId,
  tenantName,
  onClose,
  prefilledService,
  prefilledDate,
}: BookingAgentModalProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [initialMessage, setInitialMessage] = useState("")

  useEffect(() => {
    // Create an initial message based on prefilled data
    if (prefilledService || prefilledDate) {
      let message = "I'd like to book "
      if (prefilledService) {
        message += `a ${prefilledService} service`
      }
      if (prefilledDate) {
        if (prefilledService) message += " "
        message += `on ${format(prefilledDate, "EEEE, MMMM d, yyyy")}`
      }
      setInitialMessage(message)
    }
  }, [prefilledService, prefilledDate])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className={`${
          isExpanded ? "max-w-4xl h-[80vh]" : "max-w-2xl h-[600px]"
        } flex flex-col p-0 gap-0 transition-all duration-300`}
      >
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Chat with {tenantName} Booking Assistant</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8">
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <BookingChat
            tenantId={tenantId}
            initialMessage={initialMessage}
            onBookingComplete={() => {
              setTimeout(onClose, 2000)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
