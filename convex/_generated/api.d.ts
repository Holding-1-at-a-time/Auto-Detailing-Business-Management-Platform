/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 26/05/2025 - 08:09:15
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 26/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agent from "../agent.js";
import type * as analytics from "../analytics.js";
import type * as booking_workflow from "../bookingWorkflow.js";
import type * as bookings from "../bookings.js";
import type * as clients from "../clients.js";
import type * as googleCalendar from "../googleCalendar.js";
import type * as notifications from "../notifications.js";
import type * as scheduling from "../scheduling.js";
import type * as schema_extension from "../schemaExtension.js";
import type * as seed from "../seed.js";
import type * as tenants from "../tenants.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  analytics: typeof analytics;
  "bookingWorkflow": typeof booking_workflow;
  bookings: typeof bookings;
  clients: typeof clients;
  googleCalendar: typeof googleCalendar;
  notifications: typeof notifications;
  scheduling: typeof scheduling;
  "schemaExtension": typeof schema_extension;
  seed: typeof seed;
  tenants: typeof tenants;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
export {
  fullApi,
  agent,
  analytics,
  bookingWorkflow,
  bookings,
  clients,
  googleCalendar,
  notifications,
  scheduling,
  schemaExtension,
  seed,
  tenants,
  users,
};

