import {
  getRequestContext,
  type RequestContext,
  type AuthenticatedUser,
  DEFAULT_DEV_USER_ID,
  DEFAULT_DEV_USER_EMAIL,
} from "./context";

export type { AuthenticatedUser, RequestContext };
export { DEFAULT_DEV_USER_ID, DEFAULT_DEV_USER_EMAIL, getRequestContext };

/**
 * Derives and verifies authenticated user identity from the unified RequestContext.
 * Never trust a user_id passed in the JSON request body.
 *
 * In production: Strictly fails closed. Returns null if there is no valid Supabase session.
 * In test: Supports x-test-user-id and x-unauthenticated headers for isolated test execution.
 */
export async function getAuthenticatedUser(
  request?: Request
): Promise<AuthenticatedUser | null> {
  const ctx = await getRequestContext(request);
  return ctx ? ctx.user : null;
}
