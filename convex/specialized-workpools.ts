/**
 * @description      : Specialized workpools for auto-detailing business
 * @author           : rrome
 * @created          : 27/05/2025
 */
import { v } from "convex/values"
import { internalAction, internalMutation, mutation, query } from "./_generated/server"
import { internal } from "./_generated/api"
import { Workpool } from "@convex-dev/workpool"
import { components } from "./_generated/api"

// Create specialized workpools for different business functions
export const inventoryWorkpool = new Workpool(components.inventoryWorkpool, {
  maxParallelism: 3,
  retryActionsByDefault: true,
  defaultRetryBehavior: { maxAttempts: 3, initialBackoffMs: 1000, base: 2 },
  logLevel: "INFO",
})

export const staffSchedulingWorkpool = new Workpool(components.staffSchedulingWorkpool, {
  maxParallelism: 2,
  retryActionsByDefault: true,
  defaultRetryBehavior: { maxAttempts: 3, initialBackoffMs: 1000, base: 2 },
  logLevel: "INFO",
})

export const customerFeedbackWorkpool = new Workpool(components.customerFeedbackWorkpool, {
  maxParallelism: 5,
  retryActionsByDefault: true,
  defaultRetryBehavior: { maxAttempts: 2, initialBackoffMs: 2000, base: 2 },
  logLevel: "INFO",
})

export const marketingWorkpool = new Workpool(components.marketingWorkpool, {
  maxParallelism: 3,
  retryActionsByDefault: true,
  defaultRetryBehavior: { maxAttempts: 5, initialBackoffMs: 5000, base: 2 },
  logLevel: "INFO",
})

export const financialWorkpool = new Workpool(components.financialWorkpool, {
  maxParallelism: 2,
  retryActionsByDefault: false, // Financial operations should be carefully controlled
  logLevel: "INFO",
})

//
// 1. INVENTORY MANAGEMENT WORKPOOL FUNCTIONS
//

// Check inventory levels and create alerts for low stock
export const checkInventoryLevels = internalMutation({
  args: {
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    // Get all inventory items for the tenant
    const inventoryItems = await ctx.db
      .query("inventory")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect()

    const lowStockItems = []

    // Check each item's stock level
    for (const item of inventoryItems) {
      if (item.currentStock <= item.reorderThreshold) {
        lowStockItems.push(item)

        // Create alert for low stock
        await ctx.db.insert("inventoryAlerts", {
          tenantId: args.tenantId,
          inventoryItemId: item._id,
          alertType: "low_stock",
          message: `${item.name} is low in stock (${item.currentStock} remaining)`,
          isResolved: false,
          createdAt: Date.now(),
        })
      }
    }

    return { lowStockItems }
  },
})

// Process inventory order
export const processInventoryOrder = internalAction({
  args: {
    tenantId: v.id("tenants"),
    supplierId: v.string(),
    items: v.array(
      v.object({
        inventoryItemId: v.id("inventory"),
        quantity: v.number(),
        unitPrice: v.number(),
      }),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(`Processing inventory order for tenant ${args.tenantId}`)

    // In a real implementation, you would:
    // 1. Connect to supplier API or send email
    // 2. Place the order
    // 3. Get confirmation and tracking details

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return {
      success: true,
      orderId: `order_${Math.random().toString(36).substring(2, 15)}`,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      trackingNumber: `TRK${Math.floor(Math.random() * 1000000)}`,
    }
  },
})

export const inventoryOrderCompleted = internalMutation({
  args: {
    workId: v.string(),
    result: v.any(),
    context: v.object({
      tenantId: v.id("tenants"),
      items: v.array(
        v.object({
          inventoryItemId: v.id("inventory"),
          quantity: v.number(),
        }),
      ),
    }),
  },
  handler: async (ctx, args) => {
    if (args.result.kind === "canceled") return

    if (args.result.kind === "success") {
      // Create order record
      const orderId = await ctx.db.insert("inventoryOrders", {
        tenantId: args.context.tenantId,
        externalOrderId: args.result.returnValue.orderId,
        status: "ordered",
        trackingNumber: args.result.returnValue.trackingNumber,
        estimatedDelivery: new Date(args.result.returnValue.estimatedDelivery).getTime(),
        items: args.context.items,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Resolve any related alerts
      const alertsToResolve = await ctx.db
        .query("inventoryAlerts")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.context.tenantId))
        .filter((q) => q.eq(q.field("isResolved"), false) && q.eq(q.field("alertType"), "low_stock"))
        .collect()

      for (const alert of alertsToResolve) {
        const itemInOrder = args.context.items.find((item) => item.inventoryItemId === alert.inventoryItemId)
        if (itemInOrder) {
          await ctx.db.patch(alert._id, {
            isResolved: true,
            resolutionDetails: `Order placed: ${orderId}`,
            updatedAt: Date.now(),
          })
        }
      }

      // Send notification to manager
      await components.notificationWorkpool.enqueueAction(
        ctx,
        internal.workpools.sendBookingConfirmationEmail, // Reusing email function
        {
          tenantId: args.context.tenantId,
          bookingId: orderId, // Using order ID
          clientId: "", // No client for this notification
          emailTemplate: "inventory_order_placed",
        },
        {
          onComplete: internal.workpools.notificationSent,
          context: {
            tenantId: args.context.tenantId,
            bookingId: orderId,
            notificationType: "inventory_order",
          },
        },
      )
    } else if (args.result.kind === "failed") {
      // Log the error
      await ctx.db.insert("errorLogs", {
        tenantId: args.context.tenantId,
        operation: "inventory_order",
        error: args.result.error,
        timestamp: Date.now(),
      })

      // Create a task for manual follow-up
      await ctx.db.insert("tasks", {
        tenantId: args.context.tenantId,
        taskType: "inventory_order_failed",
        status: "pending",
        priority: "high",
        description: `Inventory order failed: ${args.result.error}`,
        createdAt: Date.now(),
      })
    }
  },
})

// Public API for ordering inventory
export const orderInventory = mutation({
  args: {
    tenantId: v.id("tenants"),
    supplierId: v.string(),
    items: v.array(
      v.object({
        inventoryItemId: v.id("inventory"),
        quantity: v.number(),
        unitPrice: v.number(),
      }),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Enqueue the inventory order processing
    const workId = await inventoryWorkpool.enqueueAction(
      ctx,
      internal.specializedWorkpools.processInventoryOrder,
      args,
      {
        onComplete: internal.specializedWorkpools.inventoryOrderCompleted,
        context: {
          tenantId: args.tenantId,
          items: args.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity,
          })),
        },
      },
    )

    return { workId }
  },
})

//
// 2. STAFF SCHEDULING WORKPOOL FUNCTIONS
//

// Generate optimal staff schedule
export const generateStaffSchedule = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all staff members
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    // Get all bookings in the date range
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter(
        (q) =>
          q.eq(q.field("status"), "scheduled") &&
          q.gte(q.field("dateTime"), args.startDate) &&
          q.lte(q.field("dateTime"), args.endDate),
      )
      .collect()

    // Get staff availability
    const availability = await ctx.db
      .query("staffAvailability")
      .withIndex("by_tenant_date", (q) =>
        q.eq("tenantId", args.tenantId).gte("date", args.startDate).lte("date", args.endDate),
      )
      .collect()

    // In a real implementation, you would:
    // 1. Use an algorithm to optimize staff assignments based on:
    //    - Staff skills and specializations
    //    - Booking service requirements
    //    - Staff availability
    //    - Workload balancing
    // 2. Create a schedule that minimizes conflicts and maximizes efficiency

    // For this example, we'll use a simple approach:
    // Assign bookings to available staff members based on their skills and workload
    const assignments = []
    const staffWorkload = {}

    // Initialize workload counter for each staff member
    staff.forEach((s) => {
      staffWorkload[s._id] = 0
    })

    // Sort bookings by date
    bookings.sort((a, b) => a.dateTime - b.dateTime)

    // Assign each booking to an available staff member
    for (const booking of bookings) {
      // Find staff members with the required skills
      const serviceId = booking.serviceId
      const qualifiedStaff = staff.filter((s) => s.skills.includes(serviceId))

      if (qualifiedStaff.length === 0) continue

      // Check availability for the booking time
      const bookingDate = new Date(booking.dateTime).setHours(0, 0, 0, 0)
      const availableStaff = qualifiedStaff.filter((s) => {
        const staffAvail = availability.find((a) => a.staffId === s._id && a.date === bookingDate && a.isAvailable)
        return staffAvail !== undefined
      })

      if (availableStaff.length === 0) continue

      // Assign to staff member with lowest workload
      availableStaff.sort((a, b) => staffWorkload[a._id] - staffWorkload[b._id])
      const assignedStaff = availableStaff[0]

      // Create assignment
      const assignmentId = await ctx.db.insert("staffAssignments", {
        tenantId: args.tenantId,
        bookingId: booking._id,
        staffId: assignedStaff._id,
        serviceId: booking.serviceId,
        startTime: booking.dateTime,
        endTime: booking.endTime || booking.dateTime + 60 * 60 * 1000, // Default 1 hour if not specified
        status: "assigned",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Update workload counter
      staffWorkload[assignedStaff._id] += 1

      assignments.push({
        assignmentId,
        bookingId: booking._id,
        staffId: assignedStaff._id,
        staffName: assignedStaff.name,
      })
    }

    return { assignments, totalAssigned: assignments.length, totalBookings: bookings.length }
  },
})

// Notify staff about schedule
export const notifyStaffAboutSchedule = internalAction({
  args: {
    tenantId: v.id("tenants"),
    staffId: v.id("staff"),
    assignments: v.array(
      v.object({
        assignmentId: v.id("staffAssignments"),
        bookingId: v.id("bookings"),
        startTime: v.number(),
        endTime: v.number(),
        serviceName: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    console.log(`Notifying staff ${args.staffId} about ${args.assignments.length} assignments`)

    // In a real implementation, you would:
    // 1. Get staff contact details
    // 2. Format the schedule notification
    // 3. Send via email, SMS, or push notification

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      sentAt: new Date().toISOString(),
      deliveryMethod: "email",
    }
  },
})

export const staffNotificationCompleted = internalMutation({
  args: {
    workId: v.string(),
    result: v.any(),
    context: v.object({
      tenantId: v.id("tenants"),
      staffId: v.id("staff"),
      assignments: v.array(v.id("staffAssignments")),
    }),
  },
  handler: async (ctx, args) => {
    if (args.result.kind === "canceled") return

    if (args.result.kind === "success") {
      // Update assignments to mark as notified
      for (const assignmentId of args.context.assignments) {
        await ctx.db.patch(assignmentId, {
          isNotified: true,
          notificationSentAt: Date.now(),
          updatedAt: Date.now(),
        })
      }

      // Log the notification
      await ctx.db.insert("staffNotificationLogs", {
        tenantId: args.context.tenantId,
        staffId: args.context.staffId,
        notificationType: "schedule",
        assignmentCount: args.context.assignments.length,
        deliveryMethod: args.result.returnValue.deliveryMethod,
        sentAt: Date.now(),
        success: true,
      })
    } else if (args.result.kind === "failed") {
      // Log the error
      await ctx.db.insert("errorLogs", {
        tenantId: args.context.tenantId,
        operation: "staff_notification",
        error: args.result.error,
        timestamp: Date.now(),
      })

      // Create a task for manual follow-up
      await ctx.db.insert("tasks", {
        tenantId: args.context.tenantId,
        taskType: "staff_notification_failed",
        status: "pending",
        priority: "medium",
        description: `Failed to notify staff ${args.context.staffId} about schedule: ${args.result.error}`,
        createdAt: Date.now(),
      })
    }
  },
})

// Public API for generating staff schedule
export const createStaffSchedule = mutation({
  args: {
    tenantId: v.id("tenants"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Enqueue the schedule generation
    const workId = await staffSchedulingWorkpool.enqueueMutation(
      ctx,
      internal.specializedWorkpools.generateStaffSchedule,
      args,
      {
        // No onComplete handler as we'll handle notifications separately
      },
    )

    return { workId }
  },
})

// Public API for checking schedule status
export const getScheduleStatus = query({
  args: {
    workId: v.string(),
  },
  handler: async (ctx, args) => {
    return await staffSchedulingWorkpool.status(args.workId)
  },
})

//
// 3. CUSTOMER FEEDBACK WORKPOOL FUNCTIONS
//

// Process customer feedback
export const processFeedback = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    bookingId: v.id("bookings"),
    rating: v.number(),
    comments: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Store the feedback
    const feedbackId = await ctx.db.insert("feedback", {
      tenantId: args.tenantId,
      clientId: args.clientId,
      bookingId: args.bookingId,
      rating: args.rating,
      comments: args.comments || "",
      categories: args.categories || [],
      isProcessed: false,
      createdAt: Date.now(),
    })

    // Update client's average rating
    const clientFeedback = await ctx.db
      .query("feedback")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect()

    const totalRating = clientFeedback.reduce((sum, feedback) => sum + feedback.rating, 0)
    const averageRating = totalRating / clientFeedback.length

    await ctx.db.patch(args.clientId, {
      averageRating,
      updatedAt: Date.now(),
    })

    // Update booking with feedback reference
    await ctx.db.patch(args.bookingId, {
      hasFeedback: true,
      feedbackId,
      updatedAt: Date.now(),
    })

    // Check if feedback requires attention
    let requiresAttention = false
    let attentionReason = ""

    if (args.rating <= 2) {
      // Low rating
      requiresAttention = true
      attentionReason = "Low rating"
    } else if (args.comments && args.comments.toLowerCase().includes("unhappy")) {
      // Negative sentiment in comments
      requiresAttention = true
      attentionReason = "Negative sentiment detected"
    }

    if (requiresAttention) {
      // Create a task for follow-up
      await ctx.db.insert("tasks", {
        tenantId: args.tenantId,
        taskType: "feedback_followup",
        status: "pending",
        priority: "high",
        description: `Follow up with client regarding feedback: ${attentionReason}`,
        resourceId: feedbackId,
        resourceType: "feedback",
        createdAt: Date.now(),
      })
    }

    return { feedbackId, requiresAttention }
  },
})

// Analyze feedback for sentiment and trends
export const analyzeFeedback = internalAction({
  args: {
    tenantId: v.id("tenants"),
    feedbackId: v.id("feedback"),
  },
  handler: async (ctx, args) => {
    console.log(`Analyzing feedback ${args.feedbackId}`)

    // In a real implementation, you would:
    // 1. Retrieve the feedback
    // 2. Use NLP to analyze sentiment
    // 3. Categorize feedback
    // 4. Identify trends

    // Simulate API call to sentiment analysis service
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock sentiment analysis result
    return {
      sentiment: Math.random() > 0.3 ? "positive" : Math.random() > 0.5 ? "neutral" : "negative",
      sentimentScore: Math.random() * 2 - 1, // -1 to 1
      topics: ["service", "cleanliness", "staff", "value"].filter(() => Math.random() > 0.5),
      keyPhrases: ["great service", "clean car", "friendly staff"].filter(() => Math.random() > 0.6),
    }
  },
})

export const feedbackAnalysisCompleted = internalMutation({
  args: {
    workId: v.string(),
    result: v.any(),
    context: v.object({
      tenantId: v.id("tenants"),
      feedbackId: v.id("feedback"),
    }),
  },
  handler: async (ctx, args) => {
    if (args.result.kind === "canceled") return

    if (args.result.kind === "success") {
      // Update feedback with analysis results
      await ctx.db.patch(args.context.feedbackId, {
        sentiment: args.result.returnValue.sentiment,
        sentimentScore: args.result.returnValue.sentimentScore,
        topics: args.result.returnValue.topics,
        keyPhrases: args.result.returnValue.keyPhrases,
        isProcessed: true,
        processedAt: Date.now(),
        updatedAt: Date.now(),
      })

      // If negative sentiment, create a task for follow-up
      if (args.result.returnValue.sentiment === "negative") {
        await ctx.db.insert("tasks", {
          tenantId: args.context.tenantId,
          taskType: "negative_feedback",
          status: "pending",
          priority: "high",
          description: `Negative feedback detected. Score: ${args.result.returnValue.sentimentScore}`,
          resourceId: args.context.feedbackId,
          resourceType: "feedback",
          createdAt: Date.now(),
        })
      }

      // Update feedback trends
      const feedback = await ctx.db.get(args.context.feedbackId)
      if (!feedback) return

      // Get tenant's feedback trends
      const existingTrends = await ctx.db
        .query("feedbackTrends")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.context.tenantId))
        .first()

      if (existingTrends) {
        // Update existing trends
        const topics = { ...existingTrends.topics }
        args.result.returnValue.topics.forEach((topic) => {
          topics[topic] = (topics[topic] || 0) + 1
        })

        await ctx.db.patch(existingTrends._id, {
          totalFeedback: existingTrends.totalFeedback + 1,
          averageSentiment:
            (existingTrends.averageSentiment * existingTrends.totalFeedback + args.result.returnValue.sentimentScore) /
            (existingTrends.totalFeedback + 1),
          sentimentCounts: {
            positive:
              existingTrends.sentimentCounts.positive + (args.result.returnValue.sentiment === "positive" ? 1 : 0),
            neutral: existingTrends.sentimentCounts.neutral + (args.result.returnValue.sentiment === "neutral" ? 1 : 0),
            negative:
              existingTrends.sentimentCounts.negative + (args.result.returnValue.sentiment === "negative" ? 1 : 0),
          },
          topics,
          updatedAt: Date.now(),
        })
      } else {
        // Create new trends record
        const topics = {}
        args.result.returnValue.topics.forEach((topic) => {
          topics[topic] = 1
        })

        await ctx.db.insert("feedbackTrends", {
          tenantId: args.context.tenantId,
          totalFeedback: 1,
          averageSentiment: args.result.returnValue.sentimentScore,
          sentimentCounts: {
            positive: args.result.returnValue.sentiment === "positive" ? 1 : 0,
            neutral: args.result.returnValue.sentiment === "neutral" ? 1 : 0,
            negative: args.result.returnValue.sentiment === "negative" ? 1 : 0,
          },
          topics,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }
    } else if (args.result.kind === "failed") {
      // Log the error
      await ctx.db.insert("errorLogs", {
        tenantId: args.context.tenantId,
        operation: "feedback_analysis",
        error: args.result.error,
        timestamp: Date.now(),
      })

      // Mark feedback as processed but with error
      await ctx.db.patch(args.context.feedbackId, {
        isProcessed: true,
        processingError: args.result.error,
        updatedAt: Date.now(),
      })
    }
  },
})

// Public API for submitting feedback
export const submitFeedback = mutation({
  args: {
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    bookingId: v.id("bookings"),
    rating: v.number(),
    comments: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // First, store the feedback
    const result = await ctx.runMutation(internal.specializedWorkpools.processFeedback, args)

    // Then, enqueue the feedback analysis
    await customerFeedbackWorkpool.enqueueAction(
      ctx,
      internal.specializedWorkpools.analyzeFeedback,
      {
        tenantId: args.tenantId,
        feedbackId: result.feedbackId,
      },
      {
        onComplete: internal.specializedWorkpools.feedbackAnalysisCompleted,
        context: {
          tenantId: args.tenantId,
          feedbackId: result.feedbackId,
        },
      },
    )

    return { success: true, feedbackId: result.feedbackId }
  },
})

//
// 4. MARKETING WORKPOOL FUNCTIONS
//

// Generate targeted marketing campaign
export const generateMarketingCampaign = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    campaignName: v.string(),
    targetSegment: v.string(), // "all", "inactive", "high_value", etc.
    serviceIds: v.array(v.id("services")),
    discountPercentage: v.optional(v.number()),
    validUntil: v.number(),
  },
  handler: async (ctx, args) => {
    // Get target clients based on segment
    let targetClients = []

    switch (args.targetSegment) {
      case "all":
        targetClients = await ctx.db
          .query("clients")
          .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
          .collect()
        break

      case "inactive":
        // Clients who haven't booked in 60+ days
        const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000
        const allClients = await ctx.db
          .query("clients")
          .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
          .collect()

        for (const client of allClients) {
          // Get client's last booking
          const lastBooking = await ctx.db
            .query("bookings")
            .withIndex("by_client", (q) => q.eq("clientId", client._id))
            .order("desc")
            .first()

          if (!lastBooking || lastBooking.dateTime < sixtyDaysAgo) {
            targetClients.push(client)
          }
        }
        break

      case "high_value":
        // Clients with high lifetime value
        targetClients = await ctx.db
          .query("clients")
          .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
          .filter((q) => q.gte(q.field("lifetimeValue"), 500)) // Example threshold
          .collect()
        break

      default:
        throw new Error(`Unknown target segment: ${args.targetSegment}`)
    }

    // Get services info
    const services = await Promise.all(args.serviceIds.map((id) => ctx.db.get(id)))
    const validServices = services.filter((s) => s !== null)

    // Create campaign
    const campaignId = await ctx.db.insert("marketingCampaigns", {
      tenantId: args.tenantId,
      name: args.campaignName,
      targetSegment: args.targetSegment,
      services: validServices.map((s) => ({
        id: s._id,
        name: s.name,
        price: s.price,
      })),
      discountPercentage: args.discountPercentage || 0,
      validUntil: args.validUntil,
      targetClientCount: targetClients.length,
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      conversionCount: 0,
      status: "created",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Create campaign recipients
    for (const client of targetClients) {
      await ctx.db.insert("campaignRecipients", {
        tenantId: args.tenantId,
        campaignId,
        clientId: client._id,
        email: client.email,
        phone: client.phone,
        status: "pending",
        createdAt: Date.now(),
      })
    }

    return { campaignId, recipientCount: targetClients.length }
  },
})

// Send marketing email
export const sendMarketingEmail = internalAction({
  args: {
    tenantId: v.id("tenants"),
    campaignId: v.id("marketingCampaigns"),
    recipientId: v.id("campaignRecipients"),
    recipientEmail: v.string(),
    subject: v.string(),
    template: v.string(),
    templateData: v.object({}),
  },
  handler: async (ctx, args) => {
    console.log(`Sending marketing email to ${args.recipientEmail} for campaign ${args.campaignId}`)

    // In a real implementation, you would:
    // 1. Format the email using the template and data
    // 2. Send via email service provider
    // 3. Track the send event

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    return {
      success: true,
      messageId: `email_${Math.random().toString(36).substring(2, 15)}`,
      sentAt: new Date().toISOString(),
    }
  },
})

export const marketingEmailSent = internalMutation({
  args: {
    workId: v.string(),
    result: v.any(),
    context: v.object({
      tenantId: v.id("tenants"),
      campaignId: v.id("marketingCampaigns"),
      recipientId: v.id("campaignRecipients"),
    }),
  },
  handler: async (ctx, args) => {
    if (args.result.kind === "canceled") return

    if (args.result.kind === "success") {
      // Update recipient status
      await ctx.db.patch(args.context.recipientId, {
        status: "sent",
        messageId: args.result.returnValue.messageId,
        sentAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Update campaign stats
      const campaign = await ctx.db.get(args.context.campaignId)
      if (campaign) {
        await ctx.db.patch(args.context.campaignId, {
          sentCount: campaign.sentCount + 1,
          updatedAt: Date.now(),
        })
      }
    } else if (args.result.kind === "failed") {
      // Update recipient status
      await ctx.db.patch(args.context.recipientId, {
        status: "failed",
        error: args.result.error,
        updatedAt: Date.now(),
      })

      // Log the error
      await ctx.db.insert("errorLogs", {
        tenantId: args.context.tenantId,
        operation: "marketing_email",
        error: args.result.error,
        timestamp: Date.now(),
      })
    }
  },
})

// Public API for creating marketing campaign
export const createMarketingCampaign = mutation({
  args: {
    tenantId: v.id("tenants"),
    campaignName: v.string(),
    targetSegment: v.string(),
    serviceIds: v.array(v.id("services")),
    discountPercentage: v.optional(v.number()),
    validUntil: v.number(),
  },
  handler: async (ctx, args) => {
    // Create the campaign
    const result = await ctx.runMutation(internal.specializedWorkpools.generateMarketingCampaign, args)

    return { success: true, campaignId: result.campaignId, recipientCount: result.recipientCount }
  },
})

// Public API for sending campaign
export const sendCampaign = mutation({
  args: {
    tenantId: v.id("tenants"),
    campaignId: v.id("marketingCampaigns"),
  },
  handler: async (ctx, args) => {
    // Get campaign details
    const campaign = await ctx.db.get(args.campaignId)
    if (!campaign || campaign.tenantId !== args.tenantId) {
      throw new Error("Campaign not found")
    }

    // Get recipients
    const recipients = await ctx.db
      .query("campaignRecipients")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect()

    // Update campaign status
    await ctx.db.patch(args.campaignId, {
      status: "sending",
      updatedAt: Date.now(),
    })

    // Prepare template data
    const templateData = {
      campaignName: campaign.name,
      services: campaign.services,
      discountPercentage: campaign.discountPercentage,
      validUntil: new Date(campaign.validUntil).toLocaleDateString(),
    }

    // Send to each recipient
    let scheduledCount = 0
    for (const recipient of recipients) {
      if (recipient.email) {
        await marketingWorkpool.enqueueAction(
          ctx,
          internal.specializedWorkpools.sendMarketingEmail,
          {
            tenantId: args.tenantId,
            campaignId: args.campaignId,
            recipientId: recipient._id,
            recipientEmail: recipient.email,
            subject: `Special Offer: ${campaign.name}`,
            template: "marketing_campaign",
            templateData,
          },
          {
            onComplete: internal.specializedWorkpools.marketingEmailSent,
            context: {
              tenantId: args.tenantId,
              campaignId: args.campaignId,
              recipientId: recipient._id,
            },
          },
        )
        scheduledCount++
      }
    }

    return { success: true, scheduledCount }
  },
})

//
// 5. FINANCIAL WORKPOOL FUNCTIONS
//

// Process payment
export const processPayment = internalAction({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
    clientId: v.id("clients"),
    amount: v.number(),
    paymentMethod: v.string(),
    paymentDetails: v.object({}),
  },
  handler: async (ctx, args) => {
    console.log(`Processing payment of ${args.amount} for booking ${args.bookingId}`)

    // In a real implementation, you would:
    // 1. Connect to payment processor API
    // 2. Process the payment
    // 3. Get confirmation and transaction details

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulate success or failure (95% success rate)
    const isSuccess = Math.random() < 0.95

    if (!isSuccess) {
      throw new Error("Payment processor declined the transaction")
    }

    return {
      success: true,
      transactionId: `txn_${Math.random().toString(36).substring(2, 15)}`,
      processorResponse: "approved",
      processedAt: new Date().toISOString(),
    }
  },
})

export const paymentProcessed = internalMutation({
  args: {
    workId: v.string(),
    result: v.any(),
    context: v.object({
      tenantId: v.id("tenants"),
      bookingId: v.id("bookings"),
      clientId: v.id("clients"),
      amount: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    if (args.result.kind === "canceled") return

    if (args.result.kind === "success") {
      // Create payment record
      const paymentId = await ctx.db.insert("payments", {
        tenantId: args.context.tenantId,
        bookingId: args.context.bookingId,
        clientId: args.context.clientId,
        amount: args.context.amount,
        transactionId: args.result.returnValue.transactionId,
        status: "completed",
        processorResponse: args.result.returnValue.processorResponse,
        processedAt: new Date(args.result.returnValue.processedAt).getTime(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Update booking status
      await ctx.db.patch(args.context.bookingId, {
        paymentStatus: "paid",
        paymentId,
        updatedAt: Date.now(),
      })

      // Update client's lifetime value
      const client = await ctx.db.get(args.context.clientId)
      if (client) {
        await ctx.db.patch(args.context.clientId, {
          lifetimeValue: (client.lifetimeValue || 0) + args.context.amount,
          updatedAt: Date.now(),
        })
      }

      // Generate receipt
      await financialWorkpool.enqueueMutation(
        ctx,
        internal.specializedWorkpools.generateReceipt,
        {
          tenantId: args.context.tenantId,
          paymentId,
          bookingId: args.context.bookingId,
          clientId: args.context.clientId,
        },
        {
          // No onComplete needed as this is a follow-up action
        },
      )
    } else if (args.result.kind === "failed") {
      // Create failed payment record
      await ctx.db.insert("payments", {
        tenantId: args.context.tenantId,
        bookingId: args.context.bookingId,
        clientId: args.context.clientId,
        amount: args.context.amount,
        status: "failed",
        error: args.result.error,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Update booking status
      await ctx.db.patch(args.context.bookingId, {
        paymentStatus: "failed",
        paymentError: args.result.error,
        updatedAt: Date.now(),
      })

      // Log the error
      await ctx.db.insert("errorLogs", {
        tenantId: args.context.tenantId,
        operation: "payment_processing",
        error: args.result.error,
        timestamp: Date.now(),
      })

      // Create a task for manual follow-up
      await ctx.db.insert("tasks", {
        tenantId: args.context.tenantId,
        taskType: "payment_failed",
        status: "pending",
        priority: "high",
        description: `Payment failed for booking ${args.context.bookingId}: ${args.result.error}`,
        resourceId: args.context.bookingId,
        resourceType: "booking",
        createdAt: Date.now(),
      })
    }
  },
})

// Generate receipt
export const generateReceipt = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    paymentId: v.id("payments"),
    bookingId: v.id("bookings"),
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    // Get payment, booking, and client details
    const payment = await ctx.db.get(args.paymentId)
    const booking = await ctx.db.get(args.bookingId)
    const client = await ctx.db.get(args.clientId)
    const tenant = await ctx.db.get(args.tenantId)

    if (!payment || !booking || !client || !tenant) {
      throw new Error("Missing required data for receipt generation")
    }

    // Get service details
    const service = await ctx.db.get(booking.serviceId)

    // Generate receipt number
    const receiptNumber = `R-${Date.now().toString().substring(5)}`

    // Create receipt
    const receiptId = await ctx.db.insert("receipts", {
      tenantId: args.tenantId,
      paymentId: args.paymentId,
      bookingId: args.bookingId,
      clientId: args.clientId,
      receiptNumber,
      businessName: tenant.name,
      clientName: client.name,
      serviceName: service ? service.name : "Service",
      serviceDate: booking.dateTime,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod || "Card",
      transactionId: payment.transactionId,
      issueDate: Date.now(),
      createdAt: Date.now(),
    })

    // Send receipt to client
    if (client.email) {
      await components.notificationWorkpool.enqueueAction(
        ctx,
        internal.workpools.sendBookingConfirmationEmail, // Reusing email function
        {
          tenantId: args.tenantId,
          bookingId: args.bookingId,
          clientId: args.clientId,
          emailTemplate: "payment_receipt",
        },
        {
          onComplete: internal.workpools.notificationSent,
          context: {
            tenantId: args.tenantId,
            bookingId: args.bookingId,
            notificationType: "payment_receipt",
          },
        },
      )
    }

    return { receiptId, receiptNumber }
  },
})

// Public API for processing payment
export const makePayment = mutation({
  args: {
    tenantId: v.id("tenants"),
    bookingId: v.id("bookings"),
    clientId: v.id("clients"),
    amount: v.number(),
    paymentMethod: v.string(),
    paymentDetails: v.object({}),
  },
  handler: async (ctx, args) => {
    // Enqueue the payment processing
    const workId = await financialWorkpool.enqueueAction(ctx, internal.specializedWorkpools.processPayment, args, {
      onComplete: internal.specializedWorkpools.paymentProcessed,
      context: {
        tenantId: args.tenantId,
        bookingId: args.bookingId,
        clientId: args.clientId,
        amount: args.amount,
      },
    })

    return { success: true, workId }
  },
})

// Public API for checking payment status
export const getPaymentStatus = query({
  args: {
    workId: v.string(),
  },
  handler: async (ctx, args) => {
    return await financialWorkpool.status(args.workId)
  },
})
