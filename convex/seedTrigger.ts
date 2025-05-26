import { action } from "./_generated/server"
import { api } from "./_generated/api"

// Action to check if seeding is needed and trigger it if so
export const checkAndSeedDatabase = action({
  handler: async (ctx) => {
    // Check if we need to seed
    const needsSeeding = await ctx.runQuery(api.seed.needsSeeding)

    if (needsSeeding) {
      // Run the seeding mutation
      const result = await ctx.runMutation(api.seed.seedDatabase)
      return result
    }

    return {
      success: false,
      message: "Database already has data",
      stats: null,
    }
  },
})
