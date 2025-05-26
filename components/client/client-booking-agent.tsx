"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  isStreaming?: boolean
}

interface ClientBookingAgentProps {
  tenantId: string
}

export function ClientBookingAgent({ tenantId }: ClientBookingAgentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Convex mutations
  const createClientThread = useMutation(api.clientBookings.createClientThread)
  const continueClientThread = useMutation(api.clientBookings.continueClientThread)
  const createClientBookingFromAgent = useMutation(api.clientBookings.createClientBookingFromAgent)

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hi there! I'm your booking assistant. I can help you schedule an auto detailing service. Just tell me what service you need and when you'd like to come in.",
          timestamp: Date.now(),
        },
      ])
    }
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle sending a message with streaming
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Create a streaming message placeholder
      const streamingId = `assistant-streaming-${Date.now()}`
      setStreamingMessageId(streamingId)
      setIsStreaming(true)
      setMessages((prev) => [
        ...prev,
        {
          id: streamingId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
          isStreaming: true,
        },
      ])

      if (!threadId) {
        // Create a new thread
        const result = await createClientThread({
          tenantId,
          initialMessage: input,
        })

        setThreadId(result.threadId)

        // Process the response
        updateStreamingMessage(streamingId, result.response)

        // Check if a booking was created
        if (result.bookingId) {
          handleBookingCreated(result.bookingId)
        }
      } else {
        // Continue existing thread
        const result = await continueClientThread({
          tenantId,
          threadId,
          message: input,
        })

        // Process the response
        updateStreamingMessage(streamingId, result.response)

        // Check if a booking was created
        if (result.bookingId) {
          handleBookingCreated(result.bookingId)
        }
      }

      // Mark streaming as complete
      setIsStreaming(false)
      setStreamingMessageId(null)
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

  // Update streaming message content
  const updateStreamingMessage = (messageId: string, content: string) => {
    setMessages((prev) => {
      const updatedMessages = [...prev]
      const streamingMsgIndex = updatedMessages.findIndex((msg) => msg.id === messageId)
      if (streamingMsgIndex !== -1) {
        updatedMessages[streamingMsgIndex] = {
          ...updatedMessages[streamingMsgIndex],
          content,
          isStreaming: false,
        }
      }
      return updatedMessages
    })
  }

  // Handle booking created
  const handleBookingCreated = (bookingId: string) => {
    toast({
      title: "Booking Confirmed!",
      description: "Your appointment has been scheduled successfully.",
    })

    // Redirect to confirmation page
    setTimeout(() => {
      router.push(`/${tenantId}/booking-confirmation/${bookingId}`)
    }, 2000)
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex items-start max-w-[80%]">
              {message.role === "assistant" && (
                <Avatar className="mr-2 mt-0.5">
                  <AvatarFallback>AI</AvatarFallback>
                  <AvatarImage src="/ai-assistant-avatar.png" />
                </Avatar>
              )}
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {message.isStreaming && (
                  <div className="flex items-center mb-1">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    <span className="text-xs text-muted-foreground">AI is typing...</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <Avatar className="ml-2 mt-0.5">
                  <AvatarFallback>U</AvatarFallback>
                  <AvatarImage src="/user-avatar.png" />
                </Avatar>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Textarea
            placeholder="Tell me what service you need and when you'd like to book..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            className="flex-grow resize-none"
            rows={2}
            disabled={isLoading || isStreaming}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || isStreaming || !input.trim()} size="icon">
            {isLoading || isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try: "I need a full detailing for my SUV next Friday afternoon" or "What services do you offer?"
        </p>
      </div>
    </div>
  )
}
