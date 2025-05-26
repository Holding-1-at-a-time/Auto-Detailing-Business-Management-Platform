import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

// Initialize the Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error verifying webhook", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses[0]?.email_address

    if (email) {
      try {
        // Create user in Convex
        await convex.mutation(api.users.createUser, {
          userId: id,
          email,
          name: `${first_name || ""} ${last_name || ""}`.trim() || undefined,
        })
      } catch (error) {
        console.error("Error creating user in Convex:", error)
      }
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses[0]?.email_address

    if (email) {
      try {
        // Update user in Convex
        await convex.mutation(api.users.updateUser, {
          userId: id,
          email,
          name: `${first_name || ""} ${last_name || ""}`.trim() || undefined,
        })
      } catch (error) {
        console.error("Error updating user in Convex:", error)
      }
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data

    try {
      // Handle user deletion in Convex (you might want to implement this)
      // await convex.mutation(api.users.deleteUser, { userId: id });
    } catch (error) {
      console.error("Error deleting user in Convex:", error)
    }
  }

  if (eventType === "organization.created") {
    const { id, name, slug } = evt.data

    try {
      // Create tenant in Convex
      await convex.mutation(api.tenants.createTenant, {
        name: name || "Unnamed Organization",
        slug: slug || id,
        clerkOrgId: id,
      })
    } catch (error) {
      console.error("Error creating organization in Convex:", error)
    }
  }

  if (eventType === "organizationMembership.created") {
    const { organization, public_user_data } = evt.data

    if (organization?.id && public_user_data?.user_id) {
      try {
        // Get tenant by Clerk org ID
        const tenant = await convex.query(api.tenants.getTenantByClerkOrgId, {
          clerkOrgId: organization.id,
        })

        if (tenant) {
          // Add user to tenant in Convex
          await convex.mutation(api.users.addTenantToUser, {
            userId: public_user_data.user_id,
            tenantId: tenant._id,
          })
        }
      } catch (error) {
        console.error("Error adding user to organization in Convex:", error)
      }
    }
  }

  return NextResponse.json({ success: true })
}
