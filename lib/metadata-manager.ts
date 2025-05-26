import { clerkClient } from "@clerk/nextjs/server"

// Public metadata is accessible on both frontend and backend
export async function setPublicMetadata(userId: string, metadata: Record<string, unknown>) {
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: metadata,
  })
}

export async function updatePublicMetadata(userId: string, metadata: Record<string, unknown>) {
  const user = await clerkClient.users.getUser(userId)

  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      ...metadata,
    },
  })
}

// Private metadata is only accessible on the backend
export async function setPrivateMetadata(userId: string, metadata: Record<string, unknown>) {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: metadata,
  })
}

export async function updatePrivateMetadata(userId: string, metadata: Record<string, unknown>) {
  const user = await clerkClient.users.getUser(userId)

  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...user.privateMetadata,
      ...metadata,
    },
  })
}

// Helper to get a specific private metadata value
export async function getPrivateMetadata(userId: string, key: string) {
  const user = await clerkClient.users.getUser(userId)
  return user.privateMetadata[key]
}

// Helper to store Stripe customer ID in private metadata
export async function setStripeCustomerId(userId: string, stripeCustomerId: string) {
  await updatePrivateMetadata(userId, { stripeCustomerId })
}

// Helper to get Stripe customer ID from private metadata
export async function getStripeCustomerId(userId: string): Promise<string | null> {
  const stripeCustomerId = await getPrivateMetadata(userId, "stripeCustomerId")
  return (stripeCustomerId as string) || null
}
