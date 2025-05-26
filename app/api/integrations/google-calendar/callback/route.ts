import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(
        new URL(`/settings?tab=integrations&error=${encodeURIComponent(error)}`, request.url),
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/settings?tab=integrations&error=missing_parameters", request.url))
    }

    const { tenantId, userId: stateUserId } = JSON.parse(state)

    if (stateUserId !== userId) {
      return NextResponse.redirect(new URL("/settings?tab=integrations&error=invalid_state", request.url))
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-calendar/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens")
    }

    const tokens = await tokenResponse.json()

    // Store tokens in Convex
    await convex.mutation(api.integrations.connectGoogleCalendar, {
      tenantId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    })

    return NextResponse.redirect(new URL("/settings?tab=integrations&success=google_calendar_connected", request.url))
  } catch (error) {
    console.error("Error handling Google Calendar OAuth callback:", error)
    return NextResponse.redirect(new URL("/settings?tab=integrations&error=oauth_callback_failed", request.url))
  }
}
