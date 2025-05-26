/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 26/05/2025 - 00:33:07
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 26/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher(['/', '/sign-up(.*)', '/sign-in(.*)']);


// Tenant extraction function
function getTenantFromHost(req: NextRequest): string | null {
  const host = req.headers.get("host");
  if (!host) {
    return null;
  }
  // Extract subdomain (e.g., acme.autodetailer.app -> acme)
  const hostParts = host.split(".");
  if (hostParts.length > 2) {
    return hostParts[0];
  }
  return null;
}

function getTenantFromPath(req: NextRequest): string | null {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // If the first part of the path could be a tenant ID
  if (pathParts.length > 0 && !pathParts[0].startsWith("_next") && !pathParts[0].startsWith("api")) {
    return pathParts[0];
  }
  return null;
}
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
