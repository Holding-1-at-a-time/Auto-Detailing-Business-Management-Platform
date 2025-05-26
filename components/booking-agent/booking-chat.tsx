"use client"

import { useState, useEffect, useRef } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTenant } from "@/hooks/useTenant"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send, RefreshCw, Plus, List, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string | any
  timestamp: number
  isStreaming?: boolean
}

interface Thread {
  id: string
  title: string
  status: string
  updatedAt: number
}

export function BookingChat() {
  const { tenantId } = useTenant()
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [showThreadList, setShowThreadList] = useState(false)
  const [showToolCalls, setShowToolCalls] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Convex mutations and queries
  const createThread = useMutation(api.agent.createThread)
  const continueThread = useMutation(api.agent.continueThread)
  const startWorkflow = useMutation(api.bookingWorkflow.startBookingWorkflow)
  const listThreads = useQuery(api.agent.listThreads, { tenantId })
  const threadMessages = useQuery(
    api.components.agent.messages.listMessagesByThreadId,
    threadId ? { threadId } : "skip",
  )

  // Load threads
  useEffect(() => {
    if (listThreads) {
      setThreads(
        listThreads.map((thread) => ({
          id: thread.threadId,
          title: thread.title,
          status: thread.status,
          updatedAt: thread.updatedAt,
        })),
      )
    }
  }, [listThreads])

  // Load messages when thread changes
  useEffect(() => {
    if (threadMessages && threadId) {
      const formattedMessages = threadMessages.map((msg) => {
        let content = msg.content
        if (typeof content !== "string") {
          try {
            content = JSON.stringify(content, null, 2)
          } catch (e) {
            content = "Error parsing message content"
          }
        }

        return {
          id: msg._id,
          role: msg.role as "user" | "assistant" | "system" | "tool",
          content,
          timestamp: msg.createdAt,
        }
      })

      // Filter out tool calls if not showing them
      const filteredMessages = showToolCalls
        ? formattedMessages
        : formattedMessages.filter((msg) => msg.role !== "tool")

      setMessages(filteredMessages)
    }
  }, [threadMessages, threadId, showToolCalls])

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0 && !threadId) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm your booking assistant. How can I help you schedule an auto-detailing service today?",
          timestamp: Date.now(),
        },
      ])
    }
  }, [messages, threadId])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle thread selection
  const selectThread = async (selectedThreadId: string) => {
    setThreadId(selectedThreadId)
    setShowThreadList(false)
    setMessages([]) // Clear messages until new ones load
  }

  // Create a new thread
  const createNewThread = async () => {
    setThreadId(null)
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your booking assistant. How can I help you schedule an auto-detailing service today?",
        timestamp: Date.now(),
      },
    ])
    setShowThreadList(false)
  }

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
        const result = await createThread({
          tenantId,
          title: "Booking Conversation",
          userId: "current-user", // In a real app, get this from auth
        })
        setThreadId(result.threadId)

        // Start the booking workflow with streaming
        const stream = await api.agent.streamText({
          tenantId,
          threadId: result.threadId,
          prompt: input,
          userId: "current-user",
        })

        // Process the stream
        for await (const chunk of stream) {
          setMessages((prev) => {
            const updatedMessages = [...prev]
            const streamingMsgIndex = updatedMessages.findIndex((msg) => msg.id === streamingId)
            if (streamingMsgIndex !== -1) {
              updatedMessages[streamingMsgIndex] = {
                ...updatedMessages[streamingMsgIndex],
                content: (updatedMessages[streamingMsgIndex].content as string) + chunk,
              }
            }
            return updatedMessages
          })
        }
      } else {
        // Continue existing thread with streaming
        const stream = await api.agent.streamText({
          tenantId,
          threadId,
          prompt: input,
          userId: "current-user",
        })

        // Process the stream
        for await (const chunk of stream) {
          setMessages((prev) => {
            const updatedMessages = [...prev]
            const streamingMsgIndex = updatedMessages.findIndex((msg) => msg.id === streamingId)
            if (streamingMsgIndex !== -1) {
              updatedMessages[streamingMsgIndex] = {
                ...updatedMessages[streamingMsgIndex],
                content: (updatedMessages[streamingMsgIndex].content as string) + chunk,
              }
            }
            return updatedMessages
          })
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

  // Format message content based on role and content type
  const formatMessageContent = (message: Message) => {
    if (message.role === "tool") {
      try {
        const toolContent = typeof message.content === "string" ? JSON.parse(message.content) : message.content

        return (
          <div className="bg-gray-100 p-2 rounded text-xs font-mono">
            <div className="font-semibold">Tool Call: {toolContent.name || "Unknown Tool"}</div>
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(toolContent.result || toolContent, null, 2)}
            </pre>
          </div>
        )
      } catch (e) {
        return <pre className="whitespace-pre-wrap text-sm">{String(message.content)}</pre>
      }
    }

    return <p className="text-sm whitespace-pre-wrap">{String(message.content)}</p>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Booking Assistant</CardTitle>
            {threadId && (
              <CardDescription>
                Thread: {threads.find((t) => t.id === threadId)?.title || "Current Conversation"}
              </CardDescription>
            )}
          </div>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowToolCalls(!showToolCalls)}>
                    {showToolCalls ? <X className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showToolCalls ? "Hide Tool Calls" : "Show Tool Calls"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowThreadList(!showThreadList)}>
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Conversation History</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={createNewThread}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Conversation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      {showThreadList && (
        <div className="px-4 py-2 border-t border-b">
          <ScrollArea className="h-48">
            <div className="space-y-2 p-2">
              {threads.length === 0 ? (
                <p className="text-sm text-muted-foreground">No previous conversations</p>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`p-2 rounded cursor-pointer hover:bg-muted flex justify-between items-center ${
                      thread.id === threadId ? "bg-muted" : ""
                    }`}
                    onClick={() => selectThread(thread.id)}
                  >
                    <div>
                      <p className="text-sm font-medium truncate">{thread.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(thread.updatedAt).toLocaleString()}</p>
                    </div>
                    <Badge variant={thread.status === "completed" ? "success" : "secondary"}>{thread.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      <CardContent className="flex-grow overflow-y-auto pb-0 pt-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex items-start max-w-[80%]">
                {message.role !== "user" && message.role !== "tool" && (
                  <Avatar className="mr-2 mt-0.5">
                    <AvatarFallback>AI</AvatarFallback>
                    <AvatarImage src="/ai-assistant-avatar.png" />
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.role === "tool"
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-muted"
                  }`}
                >
                  {message.isStreaming && (
                    <div className="flex items-center mb-1">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      <span className="text-xs text-muted-foreground">AI is typing...</span>
                    </div>
                  )}
                  {formatMessageContent(message)}
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
            disabled={isLoading || isStreaming}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || isStreaming || !input.trim()} size="icon">
            {isLoading || isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
