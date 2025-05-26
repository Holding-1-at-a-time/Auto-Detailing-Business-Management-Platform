import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
    }

    // In a real implementation, you would verify the Stripe signature here
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)

    // For now, we'll parse the body directly (this is not secure for production)
    const event = JSON.parse(body)

    console.log("Received Stripe webhook:", event.type)

    // Handle the webhook event
    await convex.mutation(api.billing.handleStripeWebhook, {
      eventType: event.type,
      data: event.data.object,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling Stripe webhook:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
