/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 25/05/2025 - 17:53:01
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 25/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
// types/index.ts

/**
 * JWT Payload Types
 * -----------------
 * Reflects the structure of the JWT used by Clerk, including user details and
 * organization memberships.
 */

export interface JwtUser {
    fullName: string;
    hasImage: boolean;
    imageUrl: string | null;
    lastName: string;
    username: string;
    createdAt: string;          // ISO date string
    firstName: string;
    updatedAt: string;          // ISO date string
    externalId: string;
    emailVerified: boolean;
    publicMetadata: Record<string, any>;
    twoFactorEnabled: boolean;
    primaryWeb3Wallet?: string | null;
    primaryPhoneNumber?: string | null;
    phoneNumberVerified: boolean;
    primaryEmailAddress: string;
}

export interface OrganizationMembership {
    permissions: string[];            // e.g. ["read:bookings", "write:bookings"]
    publicMetadata: Record<string, any>;
}

export interface Organization {
    name: string;
    role: string;                     // e.g. "admin" | "member"
    slug: string;                     // URL-friendly identifier
    orgId: string;                    // Clerk organization ID
    hasImage: boolean;
    imageUrl: string | null;
    membership: OrganizationMembership;
    publicMetadata: Record<string, any>;
}

export interface JwtPayload {
    user: JwtUser;
    clerkUserId: string;              // Clerk's internal user ID
    organizations: Organization[];
}

/**
 * Tenant & Settings
 * -----------------
 * Data models related to multi-tenant architecture. Each tenant corresponds
 * to a distinct business or “organization” in our system.
 */

export interface Tenant {
    id: string;                       // Unique tenant identifier (slug or UUID)
    name: string;                     // Business or organization name
    timezone: string;                 // IANA timezone string, e.g. "America/Chicago"
    stripeCustomerId: string | null;  // Stripe Customer ID (null until first subscription)
    createdAt: string;                // ISO date string
    updatedAt: string;                // ISO date string
}

export interface TenantSettings {
    tenantId: string;                 // Foreign key to Tenant.id
    businessName: string;
    timezone: string;
    logoUrl?: string;                 // Public URL to tenant’s custom logo
    calendarConnected: boolean;       // Has the tenant connected Google Calendar?
    defaultServiceTypes: ServiceType[]; // Allowed service types for bookings
}

/**
 * Auth Context
 * ------------
 * Represents the authenticated session context extracted from Clerk’s JWT.
 */

export interface AuthContext {
    jwt: JwtPayload;
    tenantId: string;                 // Current tenant (derived from subdomain or URL)
    clerkUserId: string;              // Same as jwt.clerkUserId
    userFullName: string;             // Convenience alias for jwt.user.fullName
    userEmail: string;                // User’s primary email
}

/**
 * Calendar Integration
 * --------------------
 * Types used when interacting with Google Calendar.
 */

export interface CalendarAvailabilityResponse {
    available: boolean;
    alternatives?: string[];          // ISO date-time strings of alternative slots
}

export interface GoogleCalendarEventData {
    eventId: string;
    bookingId: string;
    startDateTime: string;            // ISO date-time
    endDateTime: string;              // ISO date-time
    summary: string;                  // e.g. “Ceramic Coat for John Doe”
}

/**
 * Stripe Integration
 * ------------------
 * Types used when creating checkout sessions or processing webhooks.
 */

export interface StripeCheckoutSessionRequest {
    tenantId: string;
    priceId: string;                  // Stripe Price ID (e.g., “price_1Hh1xL…”)
    successUrl: string;               // Redirect URL upon successful payment
    cancelUrl: string;                // Redirect URL if user cancels checkout
}

export interface StripeCheckoutSessionResponse {
    url: string;                      // The Checkout Session URL to redirect the client
}

export interface StripeWebhookEvent {
    id: string;                       // Stripe event ID
    type: string;                     // e.g., “invoice.payment_succeeded”
    data: {
        object: any;                    // Raw Stripe event payload (type depends on event)
    };
    created: number;                  // UNIX timestamp (seconds)
    livemode: boolean;
    pendingWebhooks: number;
    request: {
        id: string | null;
        idempotency_key: string | null;
    };
}

/**
 * AI / LLM Integration
 * --------------------
 * Types for parsing natural language booking requests via Vercel AI SDK.
 */

export type ServiceType =
    | "wash"
    | "wax"
    | "polish"
    | "interior"
    | "ceramic"
    | "detailing";
// Extendable: Each tenant may have a custom list of ServiceType values

export interface AIParsingResult {
    dateISO: string;                  // e.g. "2025-06-14T14:00:00.000Z"
    timeISO: string;                  // Same as dateISO or extracted separately
    service: ServiceType;
    clientName?: string;              // If LLM can extract a client name
    notes?: string;                   // Any extra notes extracted
}

/**
 * Convex Data Models (Bookings, Clients, etc.)
 * --------------------------------------------
 * Shared types for data stored in Convex.
 */

export type BookingStatus = "scheduled" | "completed" | "cancelled";

export interface Booking {
    id: string;                           // Convex-generated ID (string)
    tenantId: string;                     // Must match current tenant context
    clientId: string;                     // Foreign key to Client.id
    userId: string;                       // Clerk user ID who created the booking
    dateTime: string;                     // ISO date-time of scheduled start
    service: ServiceType;
    status: BookingStatus;
    notes?: string;                       // Optional notes field
    createdAt: string;                    // ISO date-time when booking was created
    updatedAt: string;                    // ISO date-time when booking was last updated
    googleEventId?: string | null;        // Optional: Google Calendar event ID
    priceCents?: number;                  // Optional: price in cents, if needed
}

export interface BookingInput {
    clientId: string;
    dateTime: string;                     // ISO date-time
    service: ServiceType;
    notes?: string;
    // tenantId and userId are inferred from context in server functions
}

export interface BookingUpdate {
    dateTime?: string;                    // ISO date-time (if rescheduling)
    service?: ServiceType;
    status?: BookingStatus;
    notes?: string;
}

/**
 * Client / Customer Models
 * ------------------------
 * Shared types for client (customers of the auto-detailer) records.
 */

export interface Client {
    id: string;                           // Convex-generated ID
    tenantId: string;                     // Must match current tenant context
    name: string;                         // Full name (required)
    email?: string;                       // Optional email (validate format)
    phone?: string;                       // Optional phone number
    notes?: string;                       // Optional internal notes
    isDeleted: boolean;                   // Soft-delete flag (true = archived)
    createdAt: string;                    // ISO date-time
    updatedAt: string;                    // ISO date-time
    totalSpentCents?: number;             // Computed field: sum of booking prices
}

export interface ClientInput {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
}

export interface ClientUpdate {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
    isDeleted?: boolean;
}

/**
 * Tenant Settings & Profile
 * -------------------------
 * Types related to user-editable settings, branding, and integrations.
 */

export interface ProfileSettingsInput {
    businessName: string;
    timezone: string;                     // IANA timezone string
    logoUrl?: string;                     // Public URL to uploaded logo
}

export interface IntegrationSettings {
    googleCalendarConnected: boolean;
    twilioConfigured: boolean;
    // Potential future integrations: e.g., Facebook API, Instagram API, etc.
}

/**
 * API Request & Response Shapes
 * -----------------------------
 * Standardized types for HTTP request bodies and responses.
 */

export interface ApiResponse<T> {
    data: T;
    error?: undefined;
}

export interface ApiError {
    data?: undefined;
    error: {
        message: string;
        code?: string;                      // Optional error code (e.g., "BAD_REQUEST")
        details?: any;                      // Optional extra context (validation errors, etc.)
    };
}

/**
 * Examples:
 *   type CreateBookingResponse = ApiResponse<Booking>;
 *   type CreateBookingError    = ApiError;
 */

/**
 * Clien-Side React Context Types
 * ------------------------------
 * Types for React context providers/hooks.
 */

export interface TenantContextValue {
    tenantId: string;
    tenantName: string;
    timezone: string;
}

export interface AuthContextValue {
    user: JwtUser;
    clerkUserId: string;
    organizations: Organization[];
    currentOrganization?: Organization;
}

/**
 * Utility & Miscellaneous Types
 * ------------------------------
 * Other shared types used throughout the codebase.
 */

export interface EnvConfig {
    // Convex
    CONVEX_URL: string;
    CONVEX_KEY: string;
    // Clerk
    CLERK_SECRET_KEY: string;
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    // Stripe
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    // Google OAuth
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    // Sentry
    SENTRY_DSN: string;
    // Next.js
    NEXT_PUBLIC_APP_URL: string;
}

export interface ErrorBoundaryProps {
    error: Error;
    resetErrorBoundary: () => void;
}

/**
 * Example usage of types in `route.ts` handlers:
 *
 * import { NextResponse } from 'next/server';
 * import type { BookingInput, ApiResponse, ApiError } from '@/types';
 *
 * export async function POST(request: Request, { params }): Promise<
 *   NextResponse<ApiResponse<Booking> | ApiError>
 * > {
 *   // parse payload as `BookingInput`
 *   // ...
 *   return NextResponse.json({ data: createdBooking }, { status: 201 });
 * }
 */

/**
 * Export all types as a single module to simplify imports.
 */
/**
 * Notification & Reminder Types
 * -----------------------------
 * Define structures for in-app notifications and scheduled reminders,
 * enabling tenants to inform users about booking events or follow-ups.
 */

export interface Notification {
    id: string;                          // Unique identifier for the notification (e.g., UUID) :contentReference[oaicite:0]{index=0}
    tenantId: string;                    // Must match current tenant context to maintain data isolation :contentReference[oaicite:1]{index=1}
    userId: string;                      // Clerk user ID who should receive this notification :contentReference[oaicite:2]{index=2}
    type: 'booking_created' | 'booking_cancelled' | 'client_reminder'; // Enumerated notification categories :contentReference[oaicite:3]{index=3}
    message: string;                     // Display text, e.g., "Your booking has been confirmed" :contentReference[oaicite:4]{index=4}
    createdAt: string;                   // ISO date-time when notification was generated :contentReference[oaicite:5]{index=5}
    read: boolean;                       // Indicates whether the user has seen the notification :contentReference[oaicite:6]{index=6}
}

export interface Reminder {
    id: string;                          // Unique identifier for the reminder entry :contentReference[oaicite:7]{index=7}
    tenantId: string;                    // Ensures reminder is scoped to correct tenant :contentReference[oaicite:8]{index=8}
    clientId: string;                    // References the Client record that should receive a follow-up :contentReference[oaicite:9]{index=9}
    scheduledAt: string;                 // ISO date-time when the reminder is due :contentReference[oaicite:10]{index=10}
    type: 'six_month_followup';          // Currently only one type, extendable for other intervals :contentReference[oaicite:11]{index=11}
    sent: boolean;                       // Tracks whether the reminder has been dispatched :contentReference[oaicite:12]{index=12}
}

/**
 * Analytics & Reporting Types
 * ---------------------------
 * Capture aggregated metrics per tenant for dashboards, reporting,
 * and future machine-learning purposes.
 */

export interface AnalyticsMetric {
    tenantId: string;                    // Must match current tenant context for isolation :contentReference[oaicite:13]{index=13}
    month: string;                       // Year-month format, e.g., "2025-05" :contentReference[oaicite:14]{index=14}
    totalRevenueCents: number;           // Sum of booking prices in cents :contentReference[oaicite:15]{index=15}
    totalBookings: number;               // Count of bookings in that month :contentReference[oaicite:16]{index=16}
    newClients: number;                  // Count of clients created in that month :contentReference[oaicite:17]{index=17}
}

/**
 * Validation & Error Types
 * ------------------------
 * Standardize error responses for API endpoints, ensuring consistent
 * client-side handling of validation failures.
 */

export interface ApiValidationError {
    field: string;                       // The name of the field that failed validation :contentReference[oaicite:18]{index=18}
    message: string;                     // Human-readable error message for that field :contentReference[oaicite:19]{index=19}
}

export interface ApiError {
    data?: undefined;                    // In error cases, `data` is omitted :contentReference[oaicite:20]{index=20}
    erro?: string | ApiError | undefined | { // Either a string error message or a nested ?error! : {
        message: string | undefined;                  // General error message, e.g., "Invalid request payload" :contentReference[oaicite:21]{index=21}
        code: string | undefined;                     // Optional machine-readable error code, e.g., "BAD_REQUEST" :contentReference[oaicite:22]{index=22}
        details: ApiValidationError[] | undefined;    // An array of field-specific validation errors :contentReference[oaicite:23]{index=23}
    };
}

/**
 * Export Additional Types for Future Extensibility
 * ------------------------------------------------
 * As new features (e.g., promotions, loyalty points, advanced reports)
 * are added, extend this index with corresponding interfaces.
 */

