/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 26/05/2025 - 07:40:46
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 26/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
// This file is a bridge to ensure compatibility with imports expecting schema.js
// It re-exports the schema from schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bookings: defineTable({
    clientId: v.id("clients"),
    createdAt: v.float64(),
    dateTime: v.float64(),
    googleEventId: v.optional(v.string()),
    notes: v.optional(v.string()),
    service: v.string(),
    status: v.string(),
    tenantId: v.id("tenants"),
    updatedAt: v.float64(),
  })
    .index("by_client", ["clientId"])
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_and_dateTime", [
      "tenantId",
      "dateTime",
    ])
    .index("by_tenant_and_status", ["tenantId", "status"]),
  clients: defineTable({
    createdAt: v.float64(),
    email: v.optional(v.string()),
    isDeleted: v.boolean(),
    name: v.string(),
    notes: v.optional(v.string()),
    phone: v.optional(v.string()),
    tenantId: v.id("tenants"),
    updatedAt: v.float64(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_tenant_and_email", ["tenantId", "email"])
    .index("by_tenant_and_name", ["tenantId", "name"]),
  googleCalendarTokens: defineTable({
    accessToken: v.string(),
    expiryDate: v.float64(),
    refreshToken: v.string(),
    tenantId: v.id("tenants"),
    updatedAt: v.float64(),
  }).index("by_tenantId", ["tenantId"]),
  tenantSettings: defineTable({
    businessName: v.string(),
    calendarConnected: v.boolean(),
    googleCalendarId: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    tenantId: v.id("tenants"),
    timezone: v.string(),
    updatedAt: v.float64(),
  }).index("by_tenantId", ["tenantId"]),
  tenants: defineTable({
    createdAt: v.float64(),
    logoUrl: v.optional(v.string()),
    name: v.string(),
    orgId: v.id("organizations"),
    stripeCustomerId: v.optional(v.string()),
    timezone: v.string(),
    updatedAt: v.float64(),
  }).index("by_name", ["name"]),
  users: defineTable({
    createdAt: v.float64(),
    email: v.string(),
    name: v.optional(v.string()),
    tenants: v.array(v.string()),
    updatedAt: v.float64(),
    userId: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_userId", ["userId"]),
});