/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 26/05/2025 - 08:52:31
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 26/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
import { Agent, createTool } from "@convex-dev/agent"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { components } from "./_generated/api"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { v } from "convex/values"
import { action, internalMutation, mutation, query } from "./_generated/server"

// Define the booking agent with OpenAI integration and RAG capabilities
export const bookingAgent = new Agent(components.agent, {
  chat: openai.chat("gpt-4o"),
  textEmbedding: openai.embedding("text-embedding-3-small"),
  instructions: `You are a helpful booking assistant for an auto-detailing business.
  Your job is to help customers schedule appointments for various auto-detailing services.
  Available services include: Basic Wash, Interior Detailing, Exterior Detailing, Full Detailing, Ceramic Coating, and Paint Correction.
  Be friendly, professional, and efficient. Ask clarifying questions if needed.
  
  When a customer wants to book an appointment:
  1. Ask for the service they want
  2. Ask for their preferred date and time
  3. Check availability using the checkAvailability tool
  4. Find or create the client using findClient or createClient tools
  5. Create the booking using createBooking tool
  6. Confirm the booking details with the customer
  
  If you need to reference past bookings, use the searchPastBookings tool.
  Always maintain a professional tone and provide clear information about services.`,
  tools: {
    // Tool to check calendar availability
    checkAvailability: createTool({
      description: "Check available time slots for a specific date",
      args: z.object({
        tenantId: z.string(),
        date: z.string().describe("The date to check in YYYY-MM-DD format"),
        service: z.string().describe("The service type being requested"),
      }),
      handler: async (ctx, args): Promise<Array<{ time: string; available: boolean }>> => {
        // Query for available slots
        return await ctx.runQuery(internal.scheduling.getAvailableTimeSlots, {
          tenantId: args.tenantId as Id<"tenants">,
          date: args.date,
          service: args.service,
        });
      },
    }),

    // Tool to create a booking
    createBooking: createTool({
      description: "Create a new booking for a client",
      args: z.object({
        tenantId: z.string(),
        clientId: z.string(),
        dateTime: z.string().describe("The date and time in ISO format"),
        service: z.string(),
        notes: z.string().optional(),
      }),
      handler: async (ctx, args): Promise<{ success: boolean; bookingId?: string; message: string }> => {
        try {
          // Convert ISO date string to timestamp
          const dateTimeObj = new Date(args.dateTime)
          const timestamp = dateTimeObj.getTime()

          // Create booking in Convex
          const bookingId = await ctx.runMutation(internal.scheduling.createBookingInternal, {
            tenantId: args.tenantId as Id<"tenants">,
            clientId: args.clientId as Id<"clients">,
            dateTime: timestamp,
            service: args.service,
            notes: args.notes || "",
          })

          return {
            success: true,
            bookingId: bookingId as string,
            message: "Booking created successfully",
          }
        } catch (error) {
          return {
            success: false,
            message: `Failed to create booking: ${error}`,
          }
        }
      },
    }),

    // Tool to find a client by name, email, or phone
    findClient: createTool({
      description: "Find a client by name, email, or phone",
      args: z.object({
        tenantId: z.string(),
        searchTerm: z.string().describe("Name, email, or phone to search for"),
      }),
      handler: async (ctx, args): Promise<Array<{ id: string; name: string; email?: string; phone?: string }>> => {
        return await ctx.runQuery(internal.scheduling.findClientBySearch, {
          tenantId: args.tenantId as Id<"tenants">,
          search: args.searchTerm,
        });
      },
    }),

    // Tool to create a new client
    createClient: createTool({
      description: "Create a new client",
      args: z.object({
        tenantId: z.string(),
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
      }),
      handler: async (ctx, args): Promise<{ success: boolean; clientId?: string; message: string }> => {
        try {
          const clientId = await ctx.runMutation(internal.scheduling.createClientInternal, {
            tenantId: args.tenantId as Id<"tenants">,
            name: args.name,
            email: args.email,
            phone: args.phone,
            notes: args.notes,
          })

          return {
            success: true,
            clientId: clientId as string,
            message: "Client created successfully",
          }
        } catch (error) {
          return {
            success: false,
            message: `Failed to create client: ${error}`,
          }
        }
      },
    }),

    // NEW TOOL: Search past bookings for context
    searchPastBookings: createTool({
      description: "Search for past bookings by client or service type",
      args: z.object({
        tenantId: z.string(),
        clientId: z.string().optional(),
        service: z.string().optional(),
        limit: z.number().default(5),
      }),
      handler: async (
        ctx,
        args,
      ): Promise<
        Array<{
          id: string
          clientName: string
          service: string
          dateTime: string
          status: string
          notes?: string
        }>
      > => {
        return await ctx.runQuery(internal.scheduling.getPastBookings, {
          tenantId: args.tenantId as Id<"tenants">,
          clientId: args.clientId as Id<"clients"> | undefined,
          service: args.service,
          limit: args.limit,
        });
      },
    }),

    // NEW TOOL: Get service details
    getServiceDetails: createTool({
      description: "Get details about a specific service",
      args: z.object({
        tenantId: z.string(),
        service: z.string(),
      }),
      handler: async (
        ctx,
        args,
      ): Promise<{
        name: string
        description: string
        duration: number
        price: number
      }> => {
        return await ctx.runQuery(internal.scheduling.getServiceDetails, {
          tenantId: args.tenantId as Id<"tenants">,
          service: args.service,
        });
      },
    }),
  },
  maxSteps: 10, // Allow multiple tool calls in a single conversation
  // Configure RAG for chat context
  contextOptions: {
    includeToolCalls: true, // Include tool calls in the context
    recentMessages: 20, // Include the 20 most recent messages
    searchOptions: {
      limit: 10, // Fetch up to 10 relevant messages
      textSearch: true, // Enable text search
      vectorSearch: true, // Enable vector search
      messageRange: { before: 2, after: 1 }, // Include context around matched messages
    },
    searchOtherThreads: true, // Search across other threads for the same user
  },
  // Configure storage options
  storageOptions: {
    saveAllInputMessages: true, // Save all input messages
    saveOutputMessages: true, // Save all output messages
  },
  // Track token usage
  usageHandler: async (ctx, { model, usage, userId, threadId }) => {
    await ctx.runMutation(internal.agent.trackTokenUsage, {
      model,
      usage,
      userId: userId || "anonymous",
      threadId,
    })
  },
})

// Track token usage
export const trackTokenUsage = internalMutation({
  args: {
    model: v.string(),
    usage: v.object({
      promptTokens: v.number(),
      completionTokens: v.number(),
      totalTokens: v.number(),
    }),
    userId: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("tokenUsage", {
      model: args.model,
      promptTokens: args.usage.promptTokens,
      completionTokens: args.usage.completionTokens,
      totalTokens: args.usage.totalTokens,
      userId: args.userId,
      threadId: args.threadId,
      timestamp: Date.now(),
    })
  },
})

// Create a new thread
export const createThread = mutation({
  args: {
    tenantId: v.id("tenants"),
    title: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { threadId, thread } = await bookingAgent.createThread(ctx, {
      userId: args.userId,
      // Remove 'metadata' property, and instead pass 'title' directly if supported
      title: args.title,
    })

    // Store thread metadata in our own table for easier querying
    await ctx.db.insert("agentThreads", {
      threadId,
      tenantId: args.tenantId,
      userId: args.userId || "anonymous",
      title: args.title,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return { threadId, thread }
  }
});

  // Continue an existing thread
  export const continueThread = mutation({
    args: {
      tenantId: v.id("tenants"),
      threadId: v.string(),
      userId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      // Verify thread belongs to tenant
      const thread = await ctx.db
        .query("agentThreads")
        .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
        .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
        .first()

      if (!thread) {
        throw new Error("Thread not found or does not belong to this tenant")
      }

      return await bookingAgent.continueThread(ctx, {
        threadId: args.threadId,
        userId: args.userId,
      });
    },
  })

// Generate text with the agent
export const generateText = action({
    args: {
      tenantId: v.id("tenants"),
      threadId: v.string(),
      prompt: v.string(),
      userId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      // Continue the thread
      const { thread } = await bookingAgent.continueThread(ctx, {
        threadId: args.threadId,
        userId: args.userId,
      })

      // Generate text with streaming
      const result = await thread.generateText({
        prompt: args.prompt,
      })

      return result
    },
  })

// Stream text with the agent (for real-time UI updates)
export const streamText = action({
    args: {
      tenantId: v.id("tenants"),
      threadId: v.string(),
      prompt: v.string(),
      userId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      // Continue the thread
      const { thread } = await bookingAgent.continueThread(ctx, {
        threadId: args.threadId,
        userId: args.userId,
      })

      // Generate text with streaming
      const stream = await thread.streamText({
        prompt: args.prompt,
      })

      return stream
    },
  })

// Generate a structured object with the agent
export const generateObject = action({
    args: {
      tenantId: v.id("tenants"),
      threadId: v.string(),
      prompt: v.string(),
      userId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      // Continue the thread
      const { thread } = await bookingAgent.continueThread(ctx, {
        threadId: args.threadId,
        userId: args.userId,
      })

      // Generate a booking object
      const result = await thread.generateObject({
        prompt: args.prompt,
        schema: z.object({
          service: z.string().describe("The auto-detailing service requested"),
          date: z.string().describe("The requested date in YYYY-MM-DD format"),
          time: z.string().describe("The requested time in HH:MM format"),
          clientName: z.string().describe("The client's full name"),
          clientEmail: z.string().optional().describe("The client's email address"),
          clientPhone: z.string().optional().describe("The client's phone number"),
          notes: z.string().optional().describe("Any additional notes about the booking"),
        }),
      })

      return result
    },
  })

// Stream a structured object with the agent
export const streamObject = action({
    args: {
      tenantId: v.id("tenants"),
      threadId: v.string(),
      prompt: v.string(),
      userId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      // Continue the thread
      const { thread } = await bookingAgent.continueThread(ctx, {
        threadId: args.threadId,
        userId: args.userId,
      })

      // Stream a booking object
      const stream = await thread.streamObject({
        prompt: args.prompt,
        schema: z.object({
          service: z.string().describe("The auto-detailing service requested"),
          date: z.string().describe("The requested date in YYYY-MM-DD format"),
          time: z.string().describe("The requested time in HH:MM format"),
          clientName: z.string().describe("The client's full name"),
          clientEmail: z.string().optional().describe("The client's email address"),
          clientPhone: z.string().optional().describe("The client's phone number"),
          notes: z.string().optional().describe("Any additional notes about the booking"),
        }),
      })

      return stream
    },
  })

// List threads for a user
export const listThreads = query({
    args: {
      tenantId: v.id("tenants"),
      userId: v.optional(v.string()),
      limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      const query = ctx.db.query("agentThreads").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))

      const filteredQuery = args.userId ? query.filter((q) => q.eq(q.field("userId"), args.userId)) : query

      const threads = await filteredQuery.order("desc").take(args.limit || 10)

      return threads
    },
  })

// Get thread details
export const getThread = query({
    args: {
      tenantId: v.id("tenants"),
      threadId: v.string(),
    },
    handler: async (ctx, args) => {
      const thread = await ctx.db
        .query("agentThreads")
        .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
        .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
        .first()

      if (!thread) {
        throw new Error("Thread not found or does not belong to this tenant")
      }

      return thread
    },
  })

// Update thread metadata
export const updateThread = mutation({
    args: {
      tenantId: v.id("tenants"),
      threadId: v.string(),
      title: v.optional(v.string()),
      status: v.optional(v.string()),
      summary: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const thread = await ctx.db
        .query("agentThreads")
        .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
        .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
        .first()

      if (!thread) {
        throw new Error("Thread not found or does not belong to this tenant")
      }

      const updates: any = {
        updatedAt: Date.now(),
      }

      if (args.title !== undefined) {
        updates.title = args.title
      }
      if (args.status !== undefined) updates.status = args.status
      if (args.summary !== undefined) updates.summary = args.summary

      await ctx.db.patch(thread._id, updates)

      return { success: true }
    },
  })

// Search messages across threads
export const searchMessages = action({
    args: {
      tenantId: v.id("tenants"),
      query: v.string(),
      userId: v.optional(v.string()),
      limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      // Get all threads for this tenant and optionally user
      const threads = await ctx.runQuery(internal.agent.listThreads, {
        tenantId: args.tenantId,
        userId: args.userId,
        limit: 50, // Get more threads to search through
      })

      // Collect all thread IDs
      const threadIds = threads.map((thread) => thread.threadId)

      // Search messages across all these threads
      const messages = []
      for (const threadId of threadIds) {
        try {
          const threadMessages = await ctx.runQuery(components.agent.messages.searchMessages, {
            threadId,
            query: args.query,
            textSearch: true,
            vectorSearch: true,
            limit: args.limit || 10,
          })

          messages.push(
            ...threadMessages.map((msg) => ({
              ...msg,
              threadId,
              threadTitle: threads.find((t) => t.threadId === threadId)?.title || "Unknown Thread",
            })),
          )
        } catch (error) {
          console.error(`Error searching messages in thread ${threadId}:`, error)
        }
      }

      // Sort by relevance (if available) or by timestamp
      messages.sort((a, b) => {
        if (a.relevance && b.relevance) {
          return b.relevance - a.relevance
        }
        return b.createdAt - a.createdAt
      })

      return messages.slice(0, args.limit || 10)
    },
  })

// Export actions for use in workflows
export const createThreadMutation = bookingAgent.createThreadMutation()
export const generateTextAction = bookingAgent.asTextAction({
    maxSteps: 10,
  })
export const generateObjectAction = bookingAgent.asObjectAction({
    schema: z.object({
      service: z.string(),
      date: z.string(),
      time: z.string(),
      clientName: z.string(),
      clientEmail: z.string().optional(),
      clientPhone: z.string().optional(),
      notes: z.string().optional(),
    }),
    maxSteps: 10,
  })
