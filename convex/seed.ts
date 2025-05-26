import { mutation, query } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

// Check if we need to seed data
export const needsSeeding = query({
  handler: async (ctx) => {
    const tenants = await ctx.db.query("tenants").collect()
    return tenants.length === 0
  },
})

// Main seeding function
export const seedDatabase = mutation({
  handler: async (ctx) => {
    // Check if we already have data
    const existingTenants = await ctx.db.query("tenants").collect()
    if (existingTenants.length > 0) {
      return { success: false, message: "Database already has data" }
    }

    // Create tenants
    const tenantIds = await seedTenants(ctx)

    // Create users and link to tenants
    const userIds = await seedUsers(ctx, tenantIds)

    // Create clients for each tenant
    const clientIds = await seedClients(ctx, tenantIds)

    // Create bookings for each tenant and client
    const bookingIds = await seedBookings(ctx, tenantIds, clientIds)

    // Create notifications
    await seedNotifications(ctx, tenantIds, bookingIds)

    return {
      success: true,
      message: "Database seeded successfully",
      stats: {
        tenants: tenantIds.length,
        users: userIds.length,
        clients: clientIds.length,
        bookings: bookingIds.length,
      },
    }
  },
})

// Helper function to seed tenants
async function seedTenants(ctx: any) {
  const now = Date.now()
  const tenantData = [
    {
      name: "premium-auto-detailing",
      timezone: "America/New_York",
      logoUrl: "/logo-premium.png",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "sparkle-shine-detailing",
      timezone: "America/Chicago",
      logoUrl: "/logo-sparkle.png",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "elite-car-care",
      timezone: "America/Los_Angeles",
      logoUrl: "/logo-elite.png",
      createdAt: now,
      updatedAt: now,
    },
  ]

  const tenantIds: Id<"tenants">[] = []

  for (const tenant of tenantData) {
    const tenantId = await ctx.db.insert("tenants", tenant)
    tenantIds.push(tenantId)

    // Create tenant settings
    await ctx.db.insert("tenantSettings", {
      tenantId,
      businessName: formatBusinessName(tenant.name),
      timezone: tenant.timezone,
      logoUrl: tenant.logoUrl,
      calendarConnected: false,
      updatedAt: now,
    })
  }

  return tenantIds
}

// Helper function to seed users
async function seedUsers(ctx: any, tenantIds: Id<"tenants">[]) {
  const now = Date.now()
  const userData = [
    {
      userId: "user_1",
      email: "admin@premiumautodetailing.com",
      name: "Admin User",
      tenants: [tenantIds[0].toString()],
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: "user_2",
      email: "manager@sparkleshine.com",
      name: "Manager User",
      tenants: [tenantIds[1].toString()],
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: "user_3",
      email: "owner@elitecarcare.com",
      name: "Owner User",
      tenants: [tenantIds[2].toString()],
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: "user_4",
      email: "multi@detailing.com",
      name: "Multi-Tenant User",
      tenants: tenantIds.map((id) => id.toString()),
      createdAt: now,
      updatedAt: now,
    },
  ]

  const userIds: Id<"users">[] = []

  for (const user of userData) {
    const userId = await ctx.db.insert("users", user)
    userIds.push(userId)
  }

  return userIds
}

// Helper function to seed clients
async function seedClients(ctx: any, tenantIds: Id<"tenants">[]) {
  const now = Date.now()
  const clientIds: Id<"clients">[] = []

  // Create 5-10 clients for each tenant
  for (const tenantId of tenantIds) {
    const numClients = 5 + Math.floor(Math.random() * 6) // 5-10 clients

    for (let i = 0; i < numClients; i++) {
      const clientId = await ctx.db.insert("clients", {
        tenantId,
        name: `Client ${i + 1}`,
        email: `client${i + 1}@example.com`,
        phone: `555-${100 + i}-${1000 + i}`,
        notes: i % 3 === 0 ? `VIP client with ${i + 1} vehicles` : undefined,
        isDeleted: false,
        createdAt: now - i * 86400000, // Stagger creation dates
        updatedAt: now,
      })

      clientIds.push(clientId)
    }
  }

  return clientIds
}

// Helper function to seed bookings
async function seedBookings(ctx: any, tenantIds: Id<"tenants">[], clientIds: Id<"clients">[]) {
  const now = Date.now()
  const bookingIds: Id<"bookings">[] = []

  // Group clients by tenant
  const clientsByTenant: Record<string, Id<"clients">[]> = {}

  for (const clientId of clientIds) {
    const client = await ctx.db.get(clientId)
    const tenantIdStr = client.tenantId.toString()

    if (!clientsByTenant[tenantIdStr]) {
      clientsByTenant[tenantIdStr] = []
    }

    clientsByTenant[tenantIdStr].push(clientId)
  }

  // Create bookings for each tenant
  for (const tenantId of tenantIds) {
    const tenantClients = clientsByTenant[tenantId.toString()] || []
    if (tenantClients.length === 0) continue

    // Create past, current, and future bookings
    const numBookings = 15 + Math.floor(Math.random() * 10) // 15-25 bookings

    for (let i = 0; i < numBookings; i++) {
      // Randomly select a client for this tenant
      const clientIndex = Math.floor(Math.random() * tenantClients.length)
      const clientId = tenantClients[clientIndex]

      // Determine booking date (past, present, or future)
      let bookingDate: number
      let status: string

      if (i < numBookings * 0.4) {
        // 40% past bookings
        bookingDate = now - (1 + Math.floor(Math.random() * 30)) * 86400000
        status = Math.random() > 0.1 ? "completed" : "cancelled"
      } else if (i < numBookings * 0.6) {
        // 20% today's bookings
        bookingDate = now + Math.floor(Math.random() * 86400000)
        status = Math.random() > 0.7 ? "completed" : "scheduled"
      } else {
        // 40% future bookings
        bookingDate = now + (1 + Math.floor(Math.random() * 30)) * 86400000
        status = "scheduled"
      }

      // Select a service
      const services = [
        "Basic Wash",
        "Full Detail",
        "Interior Detail",
        "Exterior Detail",
        "Premium Package",
        "Ceramic Coating",
        "Paint Correction",
        "Headlight Restoration",
      ]
      const service = services[Math.floor(Math.random() * services.length)]

      // Create the booking
      const bookingId = await ctx.db.insert("bookings", {
        tenantId,
        clientId,
        dateTime: bookingDate,
        service,
        status,
        notes: Math.random() > 0.7 ? `Special request for ${service}` : undefined,
        createdAt: now - i * 3600000, // Stagger creation times
        updatedAt: now,
      })

      bookingIds.push(bookingId)
    }
  }

  return bookingIds
}

// Helper function to seed notifications
async function seedNotifications(ctx: any, tenantIds: Id<"tenants">[], bookingIds: Id<"bookings">[]) {
  const now = Date.now()

  // Create notifications for recent and upcoming bookings
  for (const bookingId of bookingIds) {
    const booking = await ctx.db.get(bookingId)

    // Only create notifications for recent or upcoming bookings
    if (booking.dateTime < now - 7 * 86400000) continue // Skip if more than a week old

    const notificationTypes = ["booking_created", "booking_updated", "booking_reminder", "client_message"]

    // Create 1-3 notifications per booking
    const numNotifications = 1 + Math.floor(Math.random() * 3)

    for (let i = 0; i < numNotifications; i++) {
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      let message = ""

      switch (type) {
        case "booking_created":
          message = `New booking created for ${booking.service}`
          break
        case "booking_updated":
          message = `Booking for ${booking.service} has been updated`
          break
        case "booking_reminder":
          message = `Reminder: Upcoming booking for ${booking.service}`
          break
        case "client_message":
          message = `Client has sent a message about their ${booking.service} appointment`
          break
      }

      await ctx.db.insert("notifications", {
        tenantId: booking.tenantId,
        type,
        resourceId: bookingId.toString(),
        message,
        isRead: Math.random() > 0.6, // 40% unread
        createdAt: now - Math.floor(Math.random() * 86400000), // Within the last day
        updatedAt: now,
      })
    }
  }
}

// Utility function to format business name from slug
function formatBusinessName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
