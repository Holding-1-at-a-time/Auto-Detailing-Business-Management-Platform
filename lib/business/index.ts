// Export all business utilities
export * from "./service-utilities"
export * from "./booking-utilities"
export * from "./client-analytics-utilities"
export * from "./calendar-utilities"
export * from "./notification-utilities"

// Main business utilities object
import * as serviceUtils from "./service-utilities"
import * as bookingUtils from "./booking-utilities"
import * as clientAnalyticsUtils from "./client-analytics-utilities"
import * as calendarUtils from "./calendar-utilities"
import * as notificationUtils from "./notification-utilities"

const businessUtils = {
  service: serviceUtils,
  booking: bookingUtils,
  clientAnalytics: clientAnalyticsUtils,
  calendar: calendarUtils,
  notification: notificationUtils,
}

export default businessUtils
