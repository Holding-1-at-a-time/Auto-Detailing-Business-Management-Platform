"use client"

import { useState, useEffect, useRef } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTenant } from "@/hooks/useTenant"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export function BookingChat() {
  const { tenantId } = useTenant()
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const createThread = useMutation(api.agent.createThread)
  const continueThread = useMutation(api.agent.continueThread)
  const startWorkflow = useMutation(api.bookingWorkflow.startBookingWorkflow)

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm your booking assistant. How can I help you schedule an auto-detailing service today?",
          timestamp: Date.now(),
        },
      ])
    }
  }, [messages])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
          prompt: input,
        })
      } else {
        // Continue existing thread
        await continueThread({
          tenantId,
          threadId,
          prompt: input,
        })
      }

      // In a real implementation, you would subscribe to the thread messages
      // For now, we'll simulate a response
      setTimeout(() => {
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant" as const,
          content: "I'm checking our availability for your request. Give me a moment...",
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)

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
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Booking Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pb-0">
        <div className="space-y-4">
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
      </CardContent>
      <CardFooter className="pt-4">
        <div className="flex w-full items-center space-x-2">
          <Textarea
            placeholder="Type your booking request... (e.g., 'I need a full detailing next Tuesday')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            className="flex-grow"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="icon">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
