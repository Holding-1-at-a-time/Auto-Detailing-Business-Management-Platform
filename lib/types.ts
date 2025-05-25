export interface Tenant {
  id: string
  name: string
  timezone: string
  stripeCustomerId?: string
  logoUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  tenantId: string
  clientId: string
  dateTime: Date
  service: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  tenantId: string
  name: string
  email?: string
  phone?: string
  notes?: string
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  tenants: string[] // Array of tenant IDs the user has access to
}

export type ServiceType = "wax" | "polish" | "interior" | "ceramic" | "full-detail"

export interface TenantSettings {
  id: string
  tenantId: string
  businessName: string
  timezone: string
  logoUrl?: string
  calendarConnected: boolean
  googleCalendarId?: string
  updatedAt: Date
}
