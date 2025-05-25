import { Agent, createTool } from "@convex-dev/agent"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { components } from "./_generated/api"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"

// Define the booking agent with OpenAI integration
export const bookingAgent = new Agent(components.agent, {
  chat: openai.chat("gpt-4o"),
  textEmbedding: openai.embedding("text-embedding-3-small"),
  instructions: `You are a helpful booking assistant for an auto-detailing business.
  Your job is to help customers schedule appointments for various auto-detailing services.
  Available services include: Basic Wash, Interior Detailing, Exterior Detailing, Full Detailing, Ceramic Coating, and Paint Correction.
  Be friendly, professional, and efficient. Ask clarifying questions if needed.`,
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
        // Query Google Calendar for available slots
        const availableSlots = await ctx.runQuery(internal.scheduling.getAvailableTimeSlots, {
          tenantId: args.tenantId as Id<"tenants">,
          date: args.date,
          service: args.service,
        })
        return availableSlots
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
        const clients = await ctx.runQuery(internal.scheduling.findClientBySearch, {
          tenantId: args.tenantId as Id<"tenants">,
          search: args.searchTerm,
        })
        return clients
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
  },
  maxSteps: 10, // Allow multiple tool calls in a single conversation
  storageOptions: {
    saveAllInputMessages: true,
    saveOutputMessages: true,
  },
})

// Export actions for use in workflows and API routes
export const createThread = bookingAgent.createThreadMutation()
export const continueThread = bookingAgent.continueThreadMutation()
export const generateBookingResponse = bookingAgent.asTextAction({
  maxSteps: 10,
})
