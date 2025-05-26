import { v } from "convex/values"
import { internalMutation, action } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

// Helper to generate random dates within a range
const randomDate = (start: Date, end: Date): number => {
  return start.getTime() + Math.random() * (end.getTime() - start.getTime())
}

// Helper to pick a random item from an array
const randomItem = <T,>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)]
}

// Auto detailing services with realistic names and prices
const autoDetailingServices = [
  "Basic Wash & Vacuum ($49.99)",
  "Full Interior Detail ($149.99)",
  "Exterior Detail ($129.99)",
  "Complete Detail Package ($249.99)",
  "Paint Correction ($299.99)",
  "Ceramic Coating Application ($599.99)",
  "Headlight Restoration ($79.99)",
  "Engine Bay Cleaning ($89.99)",
  "Leather Treatment ($69.99)",
  "Pet Hair Removal ($59.99)",
  "Odor Elimination ($79.99)",
  "Wheel & Tire Detail ($49.99)",
]

// Realistic client names
const clientFirstNames = [
  "James",
  "Robert",
  "John",
  "Michael",
  "David",
  "William",
  "Richard",
  "Joseph",
  "Thomas",
  "Charles",
  "Mary",
  "Patricia",
  "Jennifer",
  "Linda",
  "Elizabeth",
  "Barbara",
  "Susan",
  "Jessica",
  "Sarah",
  "Karen",
  "Christopher",
  "Daniel",
  "Matthew",
  "Anthony",
  "Mark",
  "Donald",
  "Steven",
  "Paul",
  "Andrew",
  "Joshua",
  "Michelle",
  "Amanda",
  "Stephanie",
  "Melissa",
  "Rebecca",
  "Laura",
  "Sharon",
  "Cynthia",
  "Kathleen",
  "Amy",
]

const clientLastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
]

// Generate a random phone number
const generatePhoneNumber = (): string => {
  const areaCode = Math.floor(Math.random() * 800) + 200
  const prefix = Math.floor(Math.random() * 800) + 200
  const lineNumber = Math.floor(Math.random() * 9000) + 1000
  return `(${areaCode}) ${prefix}-${lineNumber}`
}

// Generate a random email based on name
const generateEmail = (firstName: string, lastName: string): string => {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com", "hotmail.com", "aol.com"]
  const randomDomain = randomItem(domains)
  const randomNum = Math.floor(Math.random() * 100)

  // Different email patterns
  const patterns = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomDomain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${randomDomain}`,
    `${firstName.toLowerCase()}${randomNum}@${randomDomain}`,
    `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@${randomDomain}`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}@${randomDomain}`,
  ]

  return randomItem(patterns)
}

// Generate random notes for clients
const generateClientNotes = (): string | undefined => {
  const notes = [
    "Prefers weekend appointments",
    "Has a large SUV",
    "Allergic to certain cleaning products",
    "Prefers text message reminders",
    "Regular customer, offers good tips",
    "Has a classic car collection",
    "Needs pet hair removal regularly",
    "Prefers early morning appointments",
    "Has a Tesla with specific care requirements",
    "Referred by another client",
    undefined, // Sometimes no notes
  ]

  return randomItem(notes)
}

// Generate random notes for bookings
const generateBookingNotes = (): string | undefined => {
  const notes = [
    "Customer requested extra attention to dashboard",
    "Vehicle has mud stains on carpets",
    "Bring extra microfiber towels",
    "Customer will be 10 minutes late",
    "Dog hair in back seat",
    "New car, first detail",
    "Coffee stains on passenger seat",
    "Customer requested fragrance-free products",
    "Scratch on driver's door needs attention",
    "Customer will wait during service",
    undefined, // Sometimes no notes
  ]

  return randomItem(notes)
}

// Main seed function
export default internalMutation({
  args: {
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if we already have data
    const existingTenants = await ctx.db.query("tenants").collect()
    if (existingTenants.length > 0 && !args.force) {
      return {
        message: "Database already has data. Use force: true to reseed.",
        tenantsCount: existingTenants.length,
      }
    }

    // If force is true, clear existing data
    if (args.force) {
      // Get all tables that need to be cleared
      const tables = [
        "tenants",
        "users",
        "tenantSettings",
        "clients",
        "bookings",
        "notifications",
        "googleCalendarTokens",
      ]

      for (const table of tables) {
        const documents = await ctx.db.query(table as any).collect()
        for (const doc of documents) {
          await ctx.db.delete(doc._id)
        }
      }
    }

    const now = Date.now()
    const tenantData = [
      {
        name: "Pristine Auto Detailing",
        timezone: "America/New_York",
        logoUrl: "/logo-pristine.png",
      },
      {
        name: "Sparkle & Shine Car Care",
        timezone: "America/Los_Angeles",
        logoUrl: "/logo-sparkle.png",
      },
      {
        name: "Elite Mobile Detailing",
        timezone: "America/Chicago",
        logoUrl: "/logo-elite.png",
      },
    ]

    const tenantIds: Id<"tenants">[] = []
    const userIds: Record<string, Id<"users">> = {}

    // Create tenants and users
    for (const tenant of tenantData) {
      // Create tenant
      const tenantId = await ctx.db.insert("tenants", {
        name: tenant.name,
        timezone: tenant.timezone,
        logoUrl: tenant.logoUrl,
        createdAt: now,
        updatedAt: now,
      })

      tenantIds.push(tenantId)

      // Create tenant settings
      await ctx.db.insert("tenantSettings", {
        tenantId,
        businessName: tenant.name,
        timezone: tenant.timezone,
        logoUrl: tenant.logoUrl,
        calendarConnected: false,
        updatedAt: now,
      })

      // Create owner user
      const ownerEmail = `owner@${tenant.name.toLowerCase().replace(/\s+/g, "")}.com`
      const userId = `user_${Math.random().toString(36).substring(2, 15)}`

      const user = await ctx.db.insert("users", {
        userId,
        email: ownerEmail,
        name: `Owner of ${tenant.name}`,
        tenants: [tenantId],
        createdAt: now,
        updatedAt: now,
      })

      userIds[tenant.name] = user

      // Create clients for this tenant
      const clientIds: Id<"clients">[] = []
      const clientCount = Math.floor(Math.random() * 15) + 10 // 10-25 clients per tenant

      for (let i = 0; i < clientCount; i++) {
        const firstName = randomItem(clientFirstNames)
        const lastName = randomItem(clientLastNames)
        const fullName = `${firstName} ${lastName}`
        const email = generateEmail(firstName, lastName)
        const phone = generatePhoneNumber()
        const notes = generateClientNotes()

        const clientId = await ctx.db.insert("clients", {
          tenantId,
          name: fullName,
          email,
          phone,
          notes,
          isDeleted: Math.random() < 0.05, // 5% chance of being deleted
          createdAt: now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), // Created within last 30 days
          updatedAt: now,
        })

        clientIds.push(clientId)
      }

      // Create bookings for this tenant
      const today = new Date()
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(today.getMonth() - 1)

      const twoMonthsFromNow = new Date()
      twoMonthsFromNow.setMonth(today.getMonth() + 2)

      const bookingCount = Math.floor(Math.random() * 40) + 20 // 20-60 bookings per tenant

      for (let i = 0; i < bookingCount; i++) {
        const clientId = randomItem(clientIds)
        const service = randomItem(autoDetailingServices)
        const dateTime = randomDate(oneMonthAgo, twoMonthsFromNow)
        const notes = generateBookingNotes()

        // Determine status based on date
        let status: "scheduled" | "completed" | "cancelled" = "scheduled"
        if (dateTime < now) {
          status = Math.random() < 0.9 ? "completed" : "cancelled" // 90% completed, 10% cancelled for past bookings
        }

        const bookingId = await ctx.db.insert("bookings", {
          tenantId,
          clientId,
          dateTime,
          service,
          status,
          notes,
          createdAt: Math.min(dateTime - 86400000 * Math.floor(Math.random() * 14), now), // Created 0-14 days before appointment
          updatedAt: now,
        })

        // Create notifications for some bookings
        if (Math.random() < 0.3) {
          // 30% chance of having a notification
          await ctx.db.insert("notifications", {
            tenantId,
            type: Math.random() < 0.5 ? "booking_created" : "booking_reminder",
            resourceId: bookingId,
            message:
              Math.random() < 0.5
                ? `New booking created for ${service}`
                : `Reminder: Upcoming appointment for ${service}`,
            isRead: Math.random() < 0.7, // 70% chance of being read
            createdAt: now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000), // Created within last 7 days
          })
        }
      }
    }

    return {
      message: "Database seeded successfully!",
      tenantsCreated: tenantIds.length,
      tenantIds,
    }
  },
})

// Action to seed the database and handle any external API calls if needed
export const seedWithExternalData = action({
  args: {
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Call the internal mutation to seed the database
    const result = await ctx.runMutation((api) => api.seed.default, { force: args.force })
    return result
  },
})
