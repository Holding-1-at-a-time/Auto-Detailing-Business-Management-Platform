import { convex } from "@/lib/convex/convex-client"
import type { Integration } from "@/lib/types"

/**
 * Get all integrations for a tenant
 */
export async function getIntegrations(tenantId: string) {
  try {
    return await convex.query("integrations.getIntegrations", {
      tenantId,
    })
  } catch (error) {
    console.error("Error fetching integrations:", error)
    throw new Error("Failed to fetch integrations")
  }
}

/**
 * Get an integration by type
 */
export async function getIntegrationByType(tenantId: string, type: string) {
  try {
    return await convex.query("integrations.getIntegrationByType", {
      tenantId,
      type,
    })
  } catch (error) {
    console.error("Error fetching integration:", error)
    throw new Error("Failed to fetch integration")
  }
}

/**
 * Connect an integration
 */
export async function connectIntegration(tenantId: string, data: Omit<Integration, "id">) {
  try {
    return await convex.mutation("integrations.connectIntegration", {
      tenantId,
      ...data,
    })
  } catch (error) {
    console.error("Error connecting integration:", error)
    throw new Error("Failed to connect integration")
  }
}

/**
 * Disconnect an integration
 */
export async function disconnectIntegration(tenantId: string, integrationType: string) {
  try {
    return await convex.mutation("integrations.disconnectIntegration", {
      tenantId,
      type: integrationType,
    })
  } catch (error) {
    console.error("Error disconnecting integration:", error)
    throw new Error("Failed to disconnect integration")
  }
}

/**
 * Test an integration
 */
export async function testIntegration(tenantId: string, integrationType: string) {
  try {
    return await convex.action("integrations.testIntegration", {
      tenantId,
      type: integrationType,
    })
  } catch (error) {
    console.error("Error testing integration:", error)
    throw new Error("Failed to test integration")
  }
}
