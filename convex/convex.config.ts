/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 25/05/2025 - 21:19:20
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 25/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
import { defineApp } from "convex/server"
import agent from "@convex-dev/agent/convex.config"
import workflow from "@convex-dev/workflow/convex.config"
import cache from "@convex-dev/action-cache/convex.config";
import persistentTextStreaming from "@convex-dev/persistent-text-streaming/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";



const app = defineApp()
app.use(agent);
app.use(workflow);
app.use(cache);
app.use(persistentTextStreaming);
app.use(rateLimiter);


export default app
