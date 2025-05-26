/**
 * @description      : Convex configuration with components
 * @author           : rrome
 * @group            :
 * @created          : 26/05/2025 - 10:12:31
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 26/05/2025
 * - Author          : rrome
 * - Modification    : Added workpool and crons components
 * - Version         : 1.1.0
 * - Date            : 27/05/2025
 * - Author          : rrome
 * - Modification    : Added additional specialized workpools
 **/
import { defineApp } from "convex/server"
import agent from "@convex-dev/agent/convex.config"
import workflow from "@convex-dev/workflow/convex.config"
import cache from "@convex-dev/action-cache/convex.config"
import persistentTextStreaming from "@convex-dev/persistent-text-streaming/convex.config"
import rateLimiter from "@convex-dev/rate-limiter/convex.config"
import workpool from "@convex-dev/workpool/convex.config"
import crons from "@convex-dev/crons/convex.config"

const app = defineApp()
app.use(agent)
app.use(workflow)
app.use(cache)
app.use(persistentTextStreaming)
app.use(rateLimiter)
// Existing workpool components
app.use(workpool, { name: "notificationWorkpool" })
app.use(workpool, { name: "bookingWorkpool" })
app.use(workpool, { name: "calendarSyncWorkpool" })
app.use(workpool, { name: "analyticsWorkpool" })
// New specialized workpool components
app.use(workpool, { name: "inventoryWorkpool" })
app.use(workpool, { name: "staffSchedulingWorkpool" })
app.use(workpool, { name: "customerFeedbackWorkpool" })
app.use(workpool, { name: "marketingWorkpool" })
app.use(workpool, { name: "financialWorkpool" })
// Add crons component
app.use(crons)

export default app
