// This file contains deployment-specific configuration

export const deploymentConfig = {
  // Clerk configuration
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET,

  // Convex configuration
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,

  // Application configuration
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Feature flags
  features: {
    enableOrganizations: true,
    enableRoleManagement: true,
    enableAnalytics: true,
  },
}
