import { action } from "./_generated/server"
import { api } from "./_generated/api"

// Sample data for seeding
const SAMPLE_TENANTS = [
  {
    name: "Elite Auto Spa",
    timezone: "America/New_York",
    businessName: "Elite Auto Spa & Detailing",
    userId: "seed_user_1",
    userEmail: "owner@eliteautospa.com",
  },
  {
    name: "Crystal Clear Detailing",
    timezone: "America/Los_Angeles",
    businessName: "Crystal Clear Auto Detailing",
    userId: "seed_user_2",
    userEmail: "manager@crystalclear.com",
  },
]

const SAMPLE_CLIENTS = [
  // Elite Auto Spa clients
  {
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    notes: "Owns a 2022 Tesla Model 3. Prefers ceramic coating packages.",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 234-5678",
    notes: "2021 BMW X5. Regular monthly detailing customer.",
  },
  {
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "(555) 345-6789",
    notes: "Multiple vehicles: Porsche 911 and Range Rover. VIP customer.",
  },
  {
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "(555) 456-7890",
    notes: "2023 Mercedes-Benz C-Class. Prefers interior detailing.",
  },
  {
    name: "Robert Wilson",
    email: "r.wilson@email.com",
    phone: "(555) 567-8901",
    notes: "Classic car collector. Owns 1967 Mustang and 1969 Camaro.",
  },
  // Crystal Clear Detailing clients
  {
    name: "Lisa Anderson",
    email: "lisa.a@email.com",
    phone: "(555) 678-9012",
    notes: "2022 Audi Q7. Family SUV, needs frequent interior cleaning.",
  },
  {
    name: "David Martinez",
    email: "d.martinez@email.com",
    phone: "(555) 789-0123",
    notes: "Fleet customer with 5 company vehicles.",
  },
  {
    name: "Jennifer Taylor",
    email: "jen.taylor@email.com",
    phone: "(555) 890-1234",
    notes: "2023 Lexus RX. Prefers eco-friendly products.",
  },
  {
    name: "James Brown",
    email: "james.b@email.com",
    phone: "(555) 901-2345",
    notes: "Motorcycle enthusiast. Harley Davidson and Indian.",
  },
  {
    name: "Maria Garcia",
    email: "maria.g@email.com",
    phone: "(555) 012-3456",
    notes: "2021 Honda CR-V. Budget-conscious, basic packages.",
  },
]

const SERVICES = [
  "Basic Wash & Wax",
  "Premium Detail Package",
  "Interior Deep Clean",
  "Ceramic Coating Application",
  "Paint Correction",
  "Full Detail Package",
  "Express Detail",
  "Headlight Restoration",
  "Engine Bay Cleaning",
  "Leather Conditioning",
]

// Helper function to generate random past/future dates
function generateRandomDate(daysFromNow: number, variance: number): number {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow + Math.floor(Math.random() * variance - variance / 2))
  date.setHours(Math.floor(Math.random() * 8) + 9) // 9 AM to 5 PM
  date.setMinutes(Math.random() > 0.5 ? 0 : 30) // On the hour or half hour
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date.getTime()
}

// Helper function to get random service
function getRandomService(): string {
  return SERVICES[Math.floor(Math.random() * SERVICES.length)]
}

// Helper function to generate booking notes
function generateBookingNotes(): string | undefined {
  const notes = [
    "Customer requested extra attention to wheels",
    "Use fragrance-free products (allergies)",
    "Park in shaded area during service",
    "Text when service is complete",
    "Customer will wait in lobby",
    "Second vehicle may be added to appointment",
    "Birthday gift certificate redemption",
    "Refer to previous service notes",
    undefined, // Some bookings have no notes
    undefined,
  ]
  return notes[Math.floor(Math.random() * notes.length)]
}

export const seedDatabase = action({
  args: {},
  handler: async (ctx) => {
    console.log("🌱 Starting database seed...")

    try {
      // Check if data already exists
      const existingTenants = await ctx.runQuery(api.tenants.getTenantByName, {
        name: SAMPLE_TENANTS[0].name,
      })

      if (existingTenants) {
        console.log("⚠️  Database already seeded. Skipping...")
        return { success: false, message: "Database already contains seed data" }
      }

      const createdTenants: any[] = []
      const createdClients: any[] = []
      const createdBookings: any[] = []

      // Create tenants
      console.log("Creating tenants...")
      for (const tenantData of SAMPLE_TENANTS) {
        const tenantId = await ctx.runMutation(api.tenants.createTenant, {
          name: tenantData.name,
          timezone: tenantData.timezone,
          userId: tenantData.userId,
          userEmail: tenantData.userEmail,
        })

        // Update tenant settings
        await ctx.runMutation(api.tenants.updateTenantSettings, {
          tenantId,
          businessName: tenantData.businessName,
          calendarConnected: false,
        })

        createdTenants.push({ id: tenantId, ...tenantData })
        console.log(`✅ Created tenant: ${tenantData.name}`)
      }

      // Create clients for each tenant
      console.log("\nCreating clients...")
      for (let i = 0; i < createdTenants.length; i++) {
        const tenant = createdTenants[i]
        const clientsForTenant = SAMPLE_CLIENTS.slice(i * 5, (i + 1) * 5)

        for (const clientData of clientsForTenant) {
          const clientId = await ctx.runMutation(api.clients.createClient, {
            tenantId: tenant.id,
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            notes: clientData.notes,
          })

          createdClients.push({
            id: clientId,
            tenantId: tenant.id,
            ...clientData,
          })
          console.log(`✅ Created client: ${clientData.name} for ${tenant.name}`)
        }
      }

      // Create bookings
      console.log("\nCreating bookings...")
      for (const client of createdClients) {
        // Create 2-4 past bookings per client
        const numPastBookings = Math.floor(Math.random() * 3) + 2
        for (let i = 0; i < numPastBookings; i++) {
          const dateTime = generateRandomDate(-30 - i * 15, 10) // Past 30-90 days
          const bookingId = await ctx.runMutation(api.bookings.createBooking, {
            tenantId: client.tenantId,
            clientId: client.id,
            dateTime,
            service: getRandomService(),
            notes: generateBookingNotes(),
          })

          // Mark most past bookings as completed
          if (Math.random() > 0.1) {
            await ctx.runMutation(api.bookings.updateBooking, {
              tenantId: client.tenantId,
              bookingId,
              status: "completed",
            })
          }

          createdBookings.push({ id: bookingId, clientName: client.name, status: "completed" })
        }

        // Create 0-2 upcoming bookings per client
        const numUpcomingBookings = Math.floor(Math.random() * 3)
        for (let i = 0; i < numUpcomingBookings; i++) {
          const dateTime = generateRandomDate(7 + i * 7, 5) // Next 1-3 weeks
          const bookingId = await ctx.runMutation(api.bookings.createBooking, {
            tenantId: client.tenantId,
            clientId: client.id,
            dateTime,
            service: getRandomService(),
            notes: generateBookingNotes(),
          })

          createdBookings.push({ id: bookingId, clientName: client.name, status: "scheduled" })
        }
      }

      console.log(`✅ Created ${createdBookings.length} bookings`)

      // Create some notifications for the first tenant
      console.log("\nCreating notifications...")
      const firstTenant = createdTenants[0]
      const notifications = [
        {
          type: "booking_reminder",
          message: "Reminder: John Smith's appointment tomorrow at 10:00 AM",
          resourceId: createdBookings[0].id,
        },
        {
          type: "new_booking",
          message: "New booking: Sarah Johnson scheduled for next Tuesday",
          resourceId: createdBookings[1].id,
        },
        {
          type: "booking_cancelled",
          message: "Booking cancelled: Michael Chen cancelled appointment for Friday",
          resourceId: createdBookings[2].id,
        },
      ]

      for (const notification of notifications) {
        await ctx.runMutation(api.notifications.createNotification, {
          tenantId: firstTenant.id,
          type: notification.type,
          message: notification.message,
          resourceId: notification.resourceId,
        })
      }
      console.log(`✅ Created ${notifications.length} notifications`)

      // Summary
      console.log("\n🎉 Database seeding completed!")
      console.log(`📊 Summary:`)
      console.log(`   - ${createdTenants.length} tenants`)
      console.log(`   - ${createdClients.length} clients`)
      console.log(`   - ${createdBookings.length} bookings`)
      console.log(`   - ${notifications.length} notifications`)

      return {
        success: true,
        summary: {
          tenants: createdTenants.length,
          clients: createdClients.length,
          bookings: createdBookings.length,
          notifications: notifications.length,
        },
      }
    } catch (error) {
      console.error("❌ Error seeding database:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  },
})

// Optional: Create a function to clear all seed data
export const clearSeedData = action({
  args: {},
  handler: async (ctx) => {
    console.log("🧹 Clearing seed data...")

    try {
      // Get all tenants created by seed
      const seedUserIds = ["seed_user_1", "seed_user_2"]

      for (const userId of seedUserIds) {
        const tenants = await ctx.runQuery(api.tenants.getUserTenants, { userId })

        for (const tenant of tenants) {
          if (tenant) {
            await ctx.runMutation(api.tenants.deleteTenant, {
              tenantId: tenant._id,
              userId,
            })
            console.log(`✅ Deleted tenant: ${tenant.name}`)
          }
        }
      }

      console.log("🎉 Seed data cleared successfully!")
      return { success: true }
    } catch (error) {
      console.error("❌ Error clearing seed data:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  },
})
