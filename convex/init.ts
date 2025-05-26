/**
 * @description      : Initialization script for auto-detailing business
 * @author           : rrome
 * @created          : 26/05/2025
 */
import { internalMutation } from "./_generated/server"
import { internal } from "./_generated/api"

// Initialize the application
export const initializeApplication = internalMutation({
  handler: async (ctx) => {
    // Initialize cron jobs
    await ctx.runMutation(internal.crons.initializeCronJobs)

    return { success: true }
  },
})
