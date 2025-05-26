import { action } from "./_generated/server"
import { api } from "./_generated/api"

export const seedDatabase = action({
  args: {},
  handler: async (ctx) => {
    console.log("Starting database seed...")

    try {
      // Create sample tenants
      const tenant1Id = await ctx.runMutation(api.tenants.createTenant, {
        name: "Premium Auto Spa",
        timezone: "America/New_York",
        logoUrl: "/placeholder.svg?height=100&width=100",
        userId: "user_seed_1",
        userEmail: "owner@premiumautospa.com",
      })

      const tenant2Id = await ctx.runMutation(api.tenants.createTenant, {
        name: "Elite Detail Works",
        timezone: "America/Los_Angeles",
        logoUrl: "/placeholder.svg?height=100&width=100",
        userId: "user_seed_2",
        userEmail: "admin@elitedetailworks.com",
      })

      console.log("Created tenants:", { tenant1Id, tenant2Id })

      // Create additional users for tenant 1
      await ctx.runMutation(api.users.createUser, {
        userId: "user_seed_3",
        email: "tech@premiumautospa.com",
        name: "John Technician",
      })

      await ctx.runMutation(api.users.addTenantToUser, {
        userId: "user_seed_3",
        tenantId: tenant1Id,
      })

      // Create clients for tenant 1
      const clients1 = []
      const clientData1 = [
        {
          name: "Sarah Johnson",
          email: "sarah.johnson@email.com",
          phone: "(555) 123-4567",
          notes: "Prefers ceramic coating, owns a 2023 Tesla Model S",
        },
        {
          name: "Michael Chen",
          email: "m.chen@business.com",
          phone: "(555) 234-5678",
          notes: "Regular monthly detailing, fleet of 3 vehicles",
        },
        {
          name: "Emily Rodriguez",
          email: "emily.r@email.com",
          phone: "(555) 345-6789",
          notes: "Sensitive to strong chemicals, prefers eco-friendly products",
        },
        {
          name: "David Thompson",
          email: "david.t@email.com",
          phone: "(555) 456-7890",
          notes: "Owns classic cars, very particular about paint care",
        },
        {
          name: "Lisa Anderson",
          email: "lisa.anderson@email.com",
          phone: "(555) 567-8901",
          notes: "New customer, referred by Sarah Johnson",
        },
      ]

      for (const client of clientData1) {
        const clientId = await ctx.runMutation(api.clients.createClient, {
          tenantId: tenant1Id,
          ...client,
        })
        clients1.push(clientId)
      }

      console.log("Created clients for tenant 1:", clients1.length)

      // Create clients for tenant 2
      const clients2 = []
      const clientData2 = [
        {
          name: "Robert Williams",
          email: "r.williams@company.com",
          phone: "(555) 678-9012",
          notes: "Corporate account, multiple vehicles",
        },
        {
          name: "Jennifer Martinez",
          email: "j.martinez@email.com",
          phone: "(555) 789-0123",
          notes: "Prefers weekend appointments",
        },
        {
          name: "Christopher Lee",
          email: "chris.lee@email.com",
          phone: "(555) 890-1234",
          notes: "Owns a luxury SUV, wants paint protection",
        },
      ]

      for (const client of clientData2) {
        const clientId = await ctx.runMutation(api.clients.createClient, {
          tenantId: tenant2Id,
          ...client,
        })
        clients2.push(clientId)
      }

      console.log("Created clients for tenant 2:", clients2.length)

      // Create bookings for tenant 1
      const now = Date.now()
      const oneDay = 24 * 60 * 60 * 1000
      const oneHour = 60 * 60 * 1000

      const bookingData1 = [
        // Past bookings
        {
          clientId: clients1[0],
          dateTime: now - 7 * oneDay,
          service: "Full Detailing",
          status: "completed",
          notes: "Great service, customer very satisfied",
        },
        {
          clientId: clients1[1],
          dateTime: now - 3 * oneDay,
          service: "Ceramic Coating",
          status: "completed",
          notes: "Applied 5-year ceramic coating package",
        },
        // Today's bookings
        {
          clientId: clients1[2],
          dateTime: now + 2 * oneHour,
          service: "Interior Detailing",
          status: "scheduled",
          notes: "Use hypoallergenic products",
        },
        {
          clientId: clients1[3],
          dateTime: now + 4 * oneHour,
          service: "Paint Correction",
          status: "scheduled",
          notes: "1967 Mustang - be extra careful",
        },
        // Future bookings
        {
          clientId: clients1[4],
          dateTime: now + 1 * oneDay + 3 * oneHour,
          service: "Basic Wash",
          status: "scheduled",
          notes: "First time customer",
        },
        {
          clientId: clients1[0],
          dateTime: now + 3 * oneDay + 2 * oneHour,
          service: "Exterior Detailing",
          status: "scheduled",
          notes: "Regular maintenance",
        },
        {
          clientId: clients1[1],
          dateTime: now + 7 * oneDay + 4 * oneHour,
          service: "Full Detailing",
          status: "scheduled",
          notes: "Monthly appointment",
        },
        // Cancelled booking
        {
          clientId: clients1[2],
          dateTime: now + 2 * oneDay,
          service: "Basic Wash",
          status: "cancelled",
          notes: "Customer rescheduled",
        },
      ]

      const bookings1 = []
      for (const booking of bookingData1) {
        const bookingId = await ctx.runMutation(api.bookings.createBooking, {
          tenantId: tenant1Id,
          clientId: booking.clientId,
          dateTime: booking.dateTime,
          service: booking.service,
          notes: booking.notes,
        })

        if (booking.status !== "scheduled") {
          await ctx.runMutation(api.bookings.updateBooking, {
            tenantId: tenant1Id,
            bookingId,
            status: booking.status,
          })
        }

        bookings1.push(bookingId)
      }

      console.log("Created bookings for tenant 1:", bookings1.length)

      // Create bookings for tenant 2
      const bookingData2 = [
        {
          clientId: clients2[0],
          dateTime: now + 1 * oneDay + 1 * oneHour,
          service: "Full Detailing",
          status: "scheduled",
          notes: "Fleet vehicle #1",
        },
        {
          clientId: clients2[1],
          dateTime: now + 2 * oneDay + 3 * oneHour,
          service: "Interior Detailing",
          status: "scheduled",
          notes: "Saturday appointment requested",
        },
        {
          clientId: clients2[2],
          dateTime: now + 4 * oneDay + 2 * oneHour,
          service: "Ceramic Coating",
          status: "scheduled",
          notes: "New vehicle protection package",
        },
      ]

      const bookings2 = []
      for (const booking of bookingData2) {
        const bookingId = await ctx.runMutation(api.bookings.createBooking, {
          tenantId: tenant2Id,
          clientId: booking.clientId,
          dateTime: booking.dateTime,
          service: booking.service,
          notes: booking.notes,
        })
        bookings2.push(bookingId)
      }

      console.log("Created bookings for tenant 2:", bookings2.length)

      // Create notifications for tenant 1
      const notificationData1 = [
        {
          type: "booking_reminder",
          resourceId: bookings1[2],
          message: "Reminder: Interior Detailing appointment today at 2:00 PM",
          isRead: false,
        },
        {
          type: "booking_created",
          resourceId: bookings1[4],
          message: "New booking created for Basic Wash tomorrow",
          isRead: true,
        },
        {
          type: "client_created",
          resourceId: clients1[4],
          message: "New client added: Lisa Anderson",
          isRead: true,
        },
      ]

      for (const notification of notificationData1) {
        await ctx.runMutation(api.notifications.create, {
          tenantId: tenant1Id,
          ...notification,
        })
      }

      console.log("Created notifications for tenant 1:", notificationData1.length)

      // Update tenant settings
      await ctx.runMutation(api.tenants.updateTenantSettings, {
        tenantId: tenant1Id,
        businessName: "Premium Auto Spa - Downtown",
        calendarConnected: false,
      })

      await ctx.runMutation(api.tenants.updateTenantSettings, {
        tenantId: tenant2Id,
        businessName: "Elite Detail Works LLC",
        calendarConnected: false,
      })

      console.log("Database seeding completed successfully!")

      return {
        success: true,
        summary: {
          tenants: 2,
          users: 3,
          clients: clients1.length + clients2.length,
          bookings: bookings1.length + bookings2.length,
          notifications: notificationData1.length,
        },
      }
    } catch (error) {
      console.error("Error seeding database:", error)
      throw new Error(`Failed to seed database: ${error.message}`)
    }
  },
})

export const clearDatabase = action({
  args: {},
  handler: async (ctx) => {
    console.log("Starting database clear...")

    try {
      // Note: This is a simplified version. In production, you'd want to
      // properly delete all records in the correct order to respect foreign keys

      console.log("WARNING: This will delete all data in the database!")
      console.log("Database clearing is not implemented for safety reasons.")
      console.log("Please use the Convex dashboard to manually clear data if needed.")

      return {
        success: false,
        message: "Database clearing not implemented for safety",
      }
    } catch (error) {
      console.error("Error clearing database:", error)
      throw new Error(`Failed to clear database: ${error.message}`)
    }
  },
})
