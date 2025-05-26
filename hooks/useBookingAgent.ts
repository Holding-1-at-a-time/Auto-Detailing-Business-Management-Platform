"use client"

import { useState, useEffect, useCallback } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useTenant } from "./useTenant"

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

export function useBookingAgent() {
  const { tenantId } = useTenant()
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])

  // Convex mutations and queries
  const createThreadMutation = useMutation(api.agent.createThread)
  const continueThreadMutation = useMutation(api.agent.continueThread)
  const startWorkflowMutation = useMutation(api.bookingWorkflow.startBookingWorkflow)
  const listThreadsQuery = useQuery(api.agent.listThreads, { tenantId })
  const threadMessagesQuery = useQuery(
    api.components.agent.messages.listMessagesByThreadId,
    threadId ? { threadId } : "skip",
  )

  // Load threads
  useEffect(() => {
    if (listThreadsQuery) {
      setThreads(
        listThreadsQuery.map((thread) => ({
          id: thread.threadId,
          title: thread.title,
          status: thread.status,
          updatedAt: thread.updatedAt,
        })),
      )
    }
  }, [listThreadsQuery])

  // Load messages when thread changes
  useEffect(() => {
    if (threadMessagesQuery && threadId) {
      const formattedMessages = threadMessagesQuery.map((msg) => {
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

      setMessages(formattedMessages)
    }
  }, [threadMessagesQuery, threadId])

  // Create a new thread
  const createThread = useCallback(async () => {
    try {
      const result = await createThreadMutation({
        tenantId,
        title: "New Booking Conversation",
        userId: "current-user", // In a real app, get this from auth
      })

      setThreadId(result.threadId)
      return result.threadId
    } catch (error) {
      console.error("Error creating thread:", error)
      throw error
    }
  }, [tenantId, createThreadMutation])

  // Select an existing thread
  const selectThread = useCallback(async (selectedThreadId: string) => {
    setThreadId(selectedThreadId)
    return selectedThreadId
  }, [])

  // Send a message with streaming
  const sendMessage = useCallback(
    async (message: string, showToolCalls = false) => {
      if (!message.trim() || isLoading || isStreaming) return

      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content: message,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])
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

        let currentThreadId = threadId
        if (!currentThreadId) {
          // Create a new thread
          const result = await createThreadMutation({
            tenantId,
            title: "Booking Conversation",
            userId: "current-user", // In a real app, get this from auth
          })
          currentThreadId = result.threadId
          setThreadId(currentThreadId)
        }

        // Start the booking workflow with streaming
        const stream = await api.agent.streamText({
          tenantId,
          threadId: currentThreadId,
          prompt: message,
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

        // Mark streaming as complete
        setIsStreaming(false)
        setStreamingMessageId(null)

        return currentThreadId
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

        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [tenantId, threadId, isLoading, isStreaming, createThreadMutation],
  )

  // Generate a structured booking object
  const generateBookingObject = useCallback(
    async (prompt: string) => {
      if (!threadId) {
        throw new Error("No active thread")
      }

      try {
        setIsLoading(true)

        const result = await api.agent.generateObject({
          tenantId,
          threadId,
          prompt,
          userId: "current-user",
        })

        return result
      } catch (error) {
        console.error("Error generating booking object:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [tenantId, threadId],
  )

  // Search across threads
  const searchThreads = useCallback(
    async (query: string) => {
      try {
        const results = await api.agent.searchMessages({
          tenantId,
          query,
          userId: "current-user",
          limit: 10,
        })

        return results
      } catch (error) {
        console.error("Error searching threads:", error)
        throw error
      }
    },
    [tenantId],
  )

  return {
    threadId,
    messages,
    threads,
    isLoading,
    isStreaming,
    createThread,
    selectThread,
    sendMessage,
    generateBookingObject,
    searchThreads,
    showToolCalls: false, // Default value, can be controlled by the component
  }
}
