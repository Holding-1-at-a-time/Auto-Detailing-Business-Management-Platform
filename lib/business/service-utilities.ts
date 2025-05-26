import { api } from "../../convex/_generated/api"
import { convex } from "../convex/convex-client"
import type { Id } from "../../convex/_generated/dataModel"

/**
 * Specialized utilities for auto-detailing service management
 */

/**
 * Calculate estimated completion time based on service type and vehicle size
 * @param serviceName - The name of the service
 * @param vehicleSize - The size of the vehicle (small, medium, large)
 * @returns Estimated duration in minutes
 */
export function calculateServiceDuration(
  serviceName: string,
  vehicleSize: "small" | "medium" | "large" = "medium",
): number {
  // Base durations for medium-sized vehicles
  const baseDurations: Record<string, number> = {
    "Basic Wash": 30,
    "Interior Detailing": 90,
    "Exterior Detailing": 60,
    "Full Detailing": 180,
    "Ceramic Coating": 240,
    "Paint Correction": 300,
  }

  // Size multipliers
  const sizeMultipliers: Record<string, number> = {
    small: 0.8,
    medium: 1.0,
    large: 1.3,
  }

  // Get base duration or default to 60 minutes
  const baseDuration = baseDurations[serviceName] || 60

  // Apply size multiplier
  return Math.round(baseDuration * sizeMultipliers[vehicleSize])
}

/**
 * Get available services with pricing
 * @param tenantId - The tenant ID
 * @returns Array of services with pricing
 */
export async function getAvailableServices(tenantId: Id<"tenants">) {
  try {
    const services = await convex.query(api.services.getServices, {
      tenantId,
      includeInactive: false,
    })

    return services
  } catch (error) {
    console.error("Error fetching available services:", error)
    return []
  }
}

/**
 * Calculate service price with add-ons
 * @param basePrice - The base price of the service
 * @param addOns - Array of add-on services
 * @returns Total price
 */
export function calculateServicePrice(basePrice: number, addOns: Array<{ name: string; price: number }> = []): number {
  const addOnTotal = addOns.reduce((sum, addOn) => sum + addOn.price, 0)
  return basePrice + addOnTotal
}

/**
 * Group services by category
 * @param services - Array of services
 * @returns Services grouped by category
 */
export function groupServicesByCategory(services: Array<{ category: string; [key: string]: any }>) {
  return services.reduce(
    (grouped, service) => {
      const category = service.category || "Uncategorized"
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(service)
      return grouped
    },
    {} as Record<string, any[]>,
  )
}

/**
 * Check if a service requires specific equipment
 * @param serviceName - The name of the service
 * @returns Array of required equipment
 */
export function getRequiredEquipment(serviceName: string): string[] {
  const equipmentMap: Record<string, string[]> = {
    "Basic Wash": ["Pressure Washer", "Foam Cannon", "Microfiber Towels"],
    "Interior Detailing": ["Vacuum", "Steam Cleaner", "Interior Brushes", "Fabric Cleaner"],
    "Exterior Detailing": ["Clay Bar", "Polisher", "Wax", "Pressure Washer"],
    "Full Detailing": ["Vacuum", "Steam Cleaner", "Clay Bar", "Polisher", "Wax", "Pressure Washer"],
    "Ceramic Coating": ["Polisher", "IPA Solution", "Ceramic Coating Product", "Microfiber Applicators"],
    "Paint Correction": ["Polisher", "Compound", "Polish", "Microfiber Towels"],
  }

  return equipmentMap[serviceName] || []
}
