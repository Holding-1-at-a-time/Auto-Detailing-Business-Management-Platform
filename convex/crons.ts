import { internalMutation, internalQuery } from "./_generated/server"
import { internal } from "./_generated/api"
import { Crons } from "@convex-dev/crons"
import { components } from "./_generated/api"

// Initialize crons
const crons = new Crons(components.crons)

// Initialize cron jobs
export const initializeCronJobs = internalMutation({
  handler: async (ctx) => {
    // Daily booking reminders - runs at 8 AM every day
    if ((await crons.get(ctx, { name: "daily-booking-reminders" })) === null) {
      await crons.register(
        ctx,
        { kind: "cron", cronspec: "0 8 * * *" },
        internal.crons.sendBookingReminders,
        {},
        "daily-booking-reminders",
      )
    }

    // Hourly calendar sync check - runs every hour
    if ((await crons.get(ctx, { name: "hourly-calendar-sync" })) === null) {
      await crons.register(
        ctx,
        { kind: "interval", ms: 3600000 }, // 1 hour
        internal.crons.syncCalendarEvents,
        {},
        "hourly-calendar-sync",
      )
    }

    // Daily analytics update - runs at 1 AM every day
    if ((await crons.get(ctx, { name: "daily-analytics-update" })) === null) {
      await crons.register(
        ctx,
        { kind: "cron", cronspec: "0 1 * * *" },
        internal.crons.updateDailyAnalytics,
        {},
        "daily-analytics-update",
      )
    }

    // Weekly client retention check - runs at 2 AM every Monday
    if ((await crons.get(ctx, { name: "weekly-client-retention" })) === null) {
      await crons.register(
        ctx,
        { kind: "cron", cronspec: "0 2 * * 1" },
        internal.crons.checkClientRetention,
        {},
        "weekly-client-retention",
      )
    }

    // Monthly business report - runs at 3 AM on the 1st of each month
    if ((await crons.get(ctx, { name: "monthly-business-report" })) === null) {
      await crons.register(
        ctx,
        { kind: "cron", cronspec: "0 3 1 * *" },
        internal.crons.generateMonthlyReport,
        {},
        "monthly-business-report",
      )
    }

    return { success: true }
  },
})

// Cron job handlers
export const sendBookingReminders = internalMutation({
  handler: async (ctx) => {
    const now = Date.now()
    const tomorrow = now + 24 * 60 * 60 * 1000

    // Get all tenants
    const tenants = await ctx.db.query("tenants").collect()

    for (const tenant of tenants) {
      // Find bookings scheduled for tomorrow
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
        .filter(
          (q) =>
            q.eq(q.field("status"), "scheduled") &&
            q.gte(q.field("dateTime"), tomorrow) &&
            q.lt(q.field("dateTime"), tomorrow + 24 * 60 * 60 * 1000),
        )
        .collect()

      // Send reminder for each booking
      for (const booking of bookings) {
        await components.notificationWorkpool.enqueueAction(
          ctx,
          internal.workpools.sendBookingConfirmationEmail,
          {
            tenantId: tenant._id,
            bookingId: booking._id,
            clientId: booking.clientId,
            emailTemplate: "booking_reminder",
          },
          {
            onComplete: internal.workpools.notificationSent,
            context: {
              tenantId: tenant._id,
              bookingId: booking._id,
              notificationType: "booking_reminder",
            },
          },
        )
      }

      console.log(`Scheduled ${bookings.length} booking reminders for tenant ${tenant._id}`)
    }

    return { success: true, remindersScheduled: true }
  },
})

export const syncCalendarEvents = internalMutation({
  handler: async (ctx) => {
    // Get all tenants with Google Calendar integration
    const tenants = await ctx.db
      .query("tenants")
      .filter((q) => q.eq(q.field("hasGoogleCalendarIntegration"), true))
      .collect()

    let syncCount = 0

    for (const tenant of tenants) {
      // Find bookings that need syncing
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
        .filter((q) => q.eq(q.field("status"), "scheduled") && q.eq(q.field("calendarSynced"), false))
        .collect()

      // Sync each booking
      for (const booking of bookings) {
        await components.calendarSyncWorkpool.enqueueAction(
          ctx,
          internal.workpools.syncBookingToCalendar,
          {
            tenantId: tenant._id,
            bookingId: booking._id,
          },
          {
            onComplete: internal.workpools.calendarSyncCompleted,
            context: {
              tenantId: tenant._id,
              bookingId: booking._id,
            },
          },
        )
        syncCount++
      }
    }

    console.log(`Scheduled ${syncCount} calendar syncs`)
    return { success: true, syncCount }
  },
})

export const updateDailyAnalytics = internalMutation({
  handler: async (ctx) => {
    const now = Date.now()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const yesterdayStart = yesterday.getTime()
    const yesterdayEnd = yesterdayStart + 24 * 60 * 60 * 1000 - 1

    // Get all tenants
    const tenants = await ctx.db.query("tenants").collect()

    for (const tenant of tenants) {
      // Count bookings for yesterday
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
        .filter((q) => q.gte(q.field("dateTime"), yesterdayStart) && q.lte(q.field("dateTime"), yesterdayEnd))
        .collect()

      // Calculate metrics
      const totalBookings = bookings.length
      const completedBookings = bookings.filter((b) => b.status === "completed").length
      const canceledBookings = bookings.filter((b) => b.status === "cancelled").length
      const revenue = bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + (b.totalAmount || 0), 0)

      // Save daily analytics
      await ctx.db.insert("dailyAnalytics", {
        tenantId: tenant._id,
        date: yesterdayStart,
        totalBookings,
        completedBookings,
        canceledBookings,
        revenue,
        createdAt: now,
      })

      console.log(`Updated daily analytics for tenant ${tenant._id}`)
    }

    return { success: true }
  },
})

export const checkClientRetention = internalMutation({
  handler: async (ctx) => {
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000

    // Get all tenants
    const tenants = await ctx.db.query("tenants").collect()

    for (const tenant of tenants) {
      // Find clients who haven't booked in 30-90 days
      const clients = await ctx.db
        .query("clients")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
        .collect()

      for (const client of clients) {
        // Get client's last booking
        const lastBooking = await ctx.db
          .query("bookings")
          .withIndex("by_client", (q) => q.eq("clientId", client._id))
          .order("desc")
          .first()

        if (lastBooking) {
          const lastBookingTime = lastBooking.dateTime

          // Client hasn't booked in 30-90 days
          if (lastBookingTime < thirtyDaysAgo && lastBookingTime > ninetyDaysAgo) {
            // Schedule retention email
            await components.notificationWorkpool.enqueueAction(
              ctx,
              internal.workpools.sendBookingConfirmationEmail, // Reusing the email function
              {
                tenantId: tenant._id,
                bookingId: lastBooking._id,
                clientId: client._id,
                emailTemplate: "client_retention",
              },
              {
                onComplete: internal.workpools.notificationSent,
                context: {
                  tenantId: tenant._id,
                  bookingId: lastBooking._id,
                  notificationType: "client_retention",
                },
              },
            )

            // Update client record
            await ctx.db.patch(client._id, {
              lastRetentionEmailSent: now,
              updatedAt: now,
            })
          }
        }
      }
    }

    return { success: true }
  },
})

export const generateMonthlyReport = internalMutation({
  handler: async (ctx) => {
    const now = Date.now()

    // Calculate previous month date range
    const today = new Date()
    const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0)

    const startTime = firstDayPrevMonth.getTime()
    const endTime = lastDayPrevMonth.setHours(23, 59, 59, 999)

    // Get all tenants
    const tenants = await ctx.db.query("tenants").collect()

    for (const tenant of tenants) {
      // Get all bookings for the previous month
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
        .filter((q) => q.gte(q.field("dateTime"), startTime) && q.lte(q.field("dateTime"), endTime))
        .collect()

      // Calculate metrics
      const totalBookings = bookings.length
      const completedBookings = bookings.filter((b) => b.status === "completed").length
      const canceledBookings = bookings.filter((b) => b.status === "cancelled").length
      const revenue = bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + (b.totalAmount || 0), 0)

      // Get new clients this month
      const newClients = await ctx.db
        .query("clients")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
        .filter((q) => q.gte(q.field("createdAt"), startTime) && q.lte(q.field("createdAt"), endTime))
        .collect()

      // Create monthly report
      const reportId = await ctx.db.insert("monthlyReports", {
        tenantId: tenant._id,
        month: firstDayPrevMonth.getMonth() + 1,
        year: firstDayPrevMonth.getFullYear(),
        totalBookings,
        completedBookings,
        canceledBookings,
        revenue,
        newClients: newClients.length,
        startDate: startTime,
        endDate: endTime,
        createdAt: now,
      })

      // Notify tenant owner about the report
      const tenantOwner = await ctx.db
        .query("users")
        .withIndex("by_tenant_role", (q) => q.eq("tenantId", tenant._id).eq("role", "owner"))
        .first()

      if (tenantOwner) {
        await components.notificationWorkpool.enqueueAction(
          ctx,
          internal.workpools.sendBookingConfirmationEmail, // Reusing the email function
          {
            tenantId: tenant._id,
            bookingId: reportId, // Using report ID instead of booking ID
            clientId: tenantOwner._id, // Using owner ID instead of client ID
            emailTemplate: "monthly_report",
          },
          {
            onComplete: internal.workpools.notificationSent,
            context: {
              tenantId: tenant._id,
              bookingId: reportId,
              notificationType: "monthly_report",
            },
          },
        )
      }

      console.log(`Generated monthly report for tenant ${tenant._id}`)
    }

    return { success: true }
  },
})

// List all registered cron jobs
export const listCronJobs = internalQuery({
  handler: async (ctx) => {
    return await crons.list(ctx)
  },
})
