import { ConvexClient } from "convex/browser"
import type { FunctionReference } from "convex/server"

// Initialize the Convex client
export const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

// Function to get a tenant-scoped Convex client
export function getTenantScopedClient(tenantId: string) {
  return {
    query: async <T extends FunctionReference<"query">>(fnName: string, args: Record<string, any> = {}) => {
      return convex.query(fnName as any, { ...args, tenantId })
    },

    mutation: async <T extends FunctionReference<"mutation">>(fnName: string, args: Record<string, any> = {}) => {
      return convex.mutation(fnName as any, { ...args, tenantId })
    },

    action: async <T extends FunctionReference<"action">>(fnName: string, args: Record<string, any> = {}) => {
      return convex.action(fnName as any, { ...args, tenantId })
    },
  }
}
