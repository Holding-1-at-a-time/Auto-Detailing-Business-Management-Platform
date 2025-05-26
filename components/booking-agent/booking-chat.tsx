"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Id } from "@convexus/shared"

interface BookingChatProps {
  tenantId?: Id<"tenants">
  initialMessage?: string
  onBookingComplete?: () => void
}

export function BookingChat({ tenantId, initialMessage, onBookingComplete }: BookingChatProps) {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState("")

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      handleSendMessage(initialMessage)
    }
  }, [initialMessage])

  const handleSendMessage = (message: string) => {
    // Simulate sending a message and receiving a response
    setMessages([...messages, `You: ${message}`])

    // Simulate a booking process
    setTimeout(() => {
      setMessages([...messages, `You: ${message}`, `Agent: Booking confirmed!`])
      // After the booking is successfully created
      if (onBookingComplete) {
        onBookingComplete()
      }
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleSendMessage(input)
      setInput("")
    }
  }

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
