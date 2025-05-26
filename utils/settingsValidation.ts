/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 26/05/2025 - 09:43:08
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 26/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
import { z } from "zod"

export const profileSettingsSchema = z.object({
  businessName: z
    .string()
    .min(1, "Business name is required")
    .max(100, "Business name must be less than 100 characters"),
  timezone: z.string().min(1, "Timezone is required"),
  logoUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
})

export const integrationSettingsSchema = z.object({
  type: z.enum(["google_calendar", "email_notifications", "sms_notifications"]),
  enabled: z.boolean(),
  settings: z.record(z.any()).optional(),
})

export const billingSettingsSchema = z.object({
  planName: z.string(),
  status: z.enum(["active", "inactive", "past_due", "canceled"]),
  features: z.array(z.string()),
  bookingLimit: z.number().optional(),
  clientLimit: z.number().optional(),
})

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size must be less than 5MB.",
    }
  }

  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}