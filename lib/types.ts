export interface Tenant {
  id: string
  name: string
  timezone: string
  stripeCustomerId?: string
  logoUrl?: string
  createdAt: number | Date
  updatedAt: number | Date
}

export interface Booking {
  id: string
  tenantId: string
  clientId: string
  dateTime: number | Date
  service: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  googleEventId?: string
  createdAt: number | Date
  updatedAt: number | Date
  client?: Client // For joined queries
}

export interface Client {
  id: string
  tenantId: string
  name: string
  email?: string
  phone?: string
  notes?: string
  isDeleted: boolean
  createdAt: number | Date
  updatedAt: number | Date
}

export interface User {
  id: string
  email: string
  tenants: string[] // Array of tenant IDs the user has access to
}

export type ServiceType =
  | "Basic Wash"
  | "Interior Detailing"
  | "Exterior Detailing"
  | "Full Detailing"
  | "Ceramic Coating"
  | "Paint Correction"

export interface TenantSettings {
  id: string
  tenantId: string
  businessName: string
  timezone: string
  logoUrl?: string
  calendarConnected: boolean
  googleCalendarId?: string
  updatedAt: number | Date
}

// Helper functions for date conversion
export function toDate(timestamp: number | Date): Date {
  return timestamp instanceof Date ? timestamp : new Date(timestamp)
}

export function toTimestamp(date: Date | number): number {
  return date instanceof Date ? date.getTime() : date
}
