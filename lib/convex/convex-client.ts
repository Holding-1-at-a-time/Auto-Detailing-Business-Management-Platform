import { ConvexClient } from "convex/browser"

// Initialize the Convex client with the deployment URL
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL as string
export const convex = new ConvexClient(convexUrl)

// Create a tenant-scoped client for tenant-specific operations
export function getTenantScopedClient(tenantId: string) {
  return {
    query: async function query(fnName: string, args: any = {}) {
      return await convex.query(fnName, { ...args, tenantId })
    },

    mutation: async function mutation(fnName: string, args: any = {}) {
      return await convex.mutation(fnName, { ...args, tenantId })
    },

    action: async function action(fnName: string, args: any = {}) {
      return await convex.action(fnName, { ...args, tenantId })
    },
  }
}
