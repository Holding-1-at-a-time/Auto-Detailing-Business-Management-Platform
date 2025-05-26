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
import type * as booking_workflow from "../booking-workflow.js";
import type * as bookings from "../bookings.js";
import type * as clients from "../clients.js";
import type * as notifications from "../notifications.js";
import type * as scheduling from "../scheduling.js";
import type * as schema_extension from "../schema-extension.js";
import type * as tenants from "../tenants.js";

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
  "booking-workflow": typeof booking_workflow;
  bookings: typeof bookings;
  clients: typeof clients;
  notifications: typeof notifications;
  scheduling: typeof scheduling;
  "schema-extension": typeof schema_extension;
  tenants: typeof tenants;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
