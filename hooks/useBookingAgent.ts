"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTenant } from "./useTenant"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export function useBookingAgent() {
  const { tenantId } = useTenant()
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const createThread = useMutation(api.agent.createThread)
  const continueThread = useMutation(api.agent.continueThread)
  const startWorkflow = useMutation(api.bookingWorkflow.startBookingWorkflow)

  // Get thread messages if we have a threadId
  const threadMessages = useQuery(api.agent.messages.listMessagesByThreadId, threadId ? { threadId } : "skip")

  // Update messages when thread messages change
  useEffect(() => {
    if (threadMessages && threadId) {
      const formattedMessages = threadMessages.map((msg) => ({
        id: msg._id,
        role: msg.role as "user" | "assistant",
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
        timestamp: msg.createdAt,
      }))
      setMessages(formattedMessages)
    }
  }, [threadMessages, threadId])

  // Send a message to the booking agent
  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user" as const,
      content: message,
      timestamp: Date.now(),
    }

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      if (!threadId) {
        // Create a new thread
        const result = await createThread({
          tenantId,
          title: "Booking Conversation",
        })
        setThreadId(result.threadId)

        // Start the booking workflow
        await startWorkflow({
          tenantId,
          threadId: result.threadId,
          userId: "current-user", // In a real app, get this from auth
          prompt: message,
        })
      } else {
        // Continue existing thread
        await continueThread({
          tenantId,
          threadId,
          prompt: message,
        })
      }

      // The messages will be updated via the query subscription
    } catch (error) {
      console.error("Error sending message:", error)

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    isLoading,
    sendMessage,
    threadId,
  }
}
