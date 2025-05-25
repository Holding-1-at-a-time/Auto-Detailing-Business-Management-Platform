import { authMiddleware } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Tenant extraction function
function getTenantFromHost(req: NextRequest): string | null {
  const host = req.headers.get("host")
  if (!host) return null

  // Extract subdomain (e.g., acme.autodetailer.app -> acme)
  const hostParts = host.split(".")
  if (hostParts.length > 2) {
    return hostParts[0]
  }

  return null
}

function getTenantFromPath(req: NextRequest): string | null {
  const url = new URL(req.url)
  const pathParts = url.pathname.split("/").filter(Boolean)

  // If the first part of the path could be a tenant ID
  if (pathParts.length > 0 && !pathParts[0].startsWith("_next") && !pathParts[0].startsWith("api")) {
    return pathParts[0]
  }

  return null
}

// This middleware runs before the Clerk middleware
export async function middleware(req: NextRequest) {
  // Extract tenant from subdomain or path
  const tenantId = getTenantFromHost(req) || getTenantFromPath(req)

  // If we have a tenant ID, add it as a header
  if (tenantId) {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-tenant-id", tenantId)

    // Continue with the modified request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // If no tenant ID found, continue normally
  return NextResponse.next()
}

// Use Clerk's auth middleware after our tenant middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

// Apply Clerk's auth middleware
export default authMiddleware({
  publicRoutes: ["/"],
})
