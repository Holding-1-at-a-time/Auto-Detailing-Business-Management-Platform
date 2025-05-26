import { convex } from "@/lib/convex/convex-client"
import type { Notification } from "@/lib/types"

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  tenantId: string,
  userId: string,
  filters?: {
    unreadOnly?: boolean
    limit?: number
  },
) {
  try {
    return await convex.query("notifications.getUserNotifications", {
      tenantId,
      userId,
      ...filters,
    })
  } catch (error) {
    console.error("Error fetching user notifications:", error)
    throw new Error("Failed to fetch user notifications")
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(tenantId: string, notificationId: string) {
  try {
    return await convex.mutation("notifications.markAsRead", {
      tenantId,
      notificationId,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw new Error("Failed to mark notification as read")
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(tenantId: string, userId: string) {
  try {
    return await convex.mutation("notifications.markAllAsRead", {
      tenantId,
      userId,
    })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw new Error("Failed to mark all notifications as read")
  }
}

/**
 * Create a notification
 */
export async function createNotification(tenantId: string, data: Omit<Notification, "id" | "createdAt" | "read">) {
  try {
    return await convex.mutation("notifications.createNotification", {
      tenantId,
      ...data,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    throw new Error("Failed to create notification")
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(tenantId: string, notificationId: string) {
  try {
    return await convex.mutation("notifications.deleteNotification", {
      tenantId,
      notificationId,
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw new Error("Failed to delete notification")
  }
}
