/**
 * @description      : Middleware for handling authentication and tenant extraction
 * @author           : rrome
 * @group            : 
 * @created          : 25/05/2025 - 17:11:09
 * 
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 25/05/2025
 * - Author          : rrome
 * - Modification    : 
 **/
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { clerkMiddleware } from "@clerk/nextjs/server"

interface Auth {
  userId?: string;
}

/**
 * Handles authentication and tenant extraction for GET requests
 * @param req The incoming request
 * @returns A response that continues to the next middleware if the user is authenticated, or redirects to the login page if not
 */
export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId, redirectToSignIn } = await auth()
  if (!userId) 
throw redirectToSignIn()
    return NextResponse.next()
  } catch (error: any) {
    console.error("Error in GET middleware:", error);
    // If the error is a redirect error, return it as a response
    if (error.status === 307 || error.status === 302) {
      return error;
    }
    return new Response("Internal Server Error", { status: 500 });
  }
});


// Tenant extraction function
function getTenantFromHost(req: NextRequest): string | null {
  const host = req.headers.get("host");
  if (!host) return null;

  const hostParts = host.split(".");
  return hostParts.length > 2 ? hostParts[0] : null;
}

function getTenantFromPath(req: NextRequest): string | null {
  const pathParts = new URL(req.url).pathname.split("/").filter(Boolean);
  return pathParts.length > 0 && !pathParts[0].startsWith("_next") && !pathParts[0].startsWith("api") ? pathParts[0] : null;
}

// This middleware runs before the Clerk middleware
export async function authMiddleware(req: NextRequest): Promise<NextResponse> {
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
