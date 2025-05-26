import { convex } from "@/lib/convex/convex-client"

/**
 * Parse booking text
 */
export async function parseBookingText(tenantId: string, text: string) {
  try {
    return await convex.action("agent.parseBookingText", {
      tenantId,
      text,
    })
  } catch (error) {
    console.error("Error parsing booking text:", error)
    throw new Error("Failed to parse booking text")
  }
}

/**
 * Generate booking summary
 */
export async function generateBookingSummary(tenantId: string, bookingId: string) {
  try {
    return await convex.action("agent.generateBookingSummary", {
      tenantId,
      bookingId,
    })
  } catch (error) {
    console.error("Error generating booking summary:", error)
    throw new Error("Failed to generate booking summary")
  }
}

/**
 * Generate client insights
 */
export async function generateClientInsights(tenantId: string, clientId: string) {
  try {
    return await convex.action("agent.generateClientInsights", {
      tenantId,
      clientId,
    })
  } catch (error) {
    console.error("Error generating client insights:", error)
    throw new Error("Failed to generate client insights")
  }
}

/**
 * Get AI agent status
 */
export async function getAgentStatus(tenantId: string) {
  try {
    return await convex.query("agent.getStatus", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching agent status:", error)
    throw new Error("Failed to fetch agent status")
  }
}

/**
 * Send message to booking agent
 */
export async function sendMessageToAgent(
  tenantId: string,
  data: {
    sessionId: string
    message: string
    userId: string
  },
) {
  try {
    return await convex.action("agent.sendMessage", {
      tenantId,
      ...data,
    })
  } catch (error) {
    console.error("Error sending message to agent:", error)
    throw new Error("Failed to send message to agent")
  }
}
