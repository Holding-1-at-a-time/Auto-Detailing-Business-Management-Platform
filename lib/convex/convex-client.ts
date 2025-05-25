import { ConvexClient } from "convex/browser"

// Initialize the Convex client
export const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

// Function to get a tenant-scoped Convex client
export function getTenantScopedClient(tenantId: string) {
  return {\
    query: async <T>(fnName: string, args: any = {}): Promise<T> => {
      return convex.query(fnName, { ...args, tenantId }) as T;
}
,
    mutation: async <T>(fnName: string, args: any =
{
}
): Promise<T> =>
{
  return convex.mutation(fnName, { ...args, tenantId }) as T;
}
,
  }
}
