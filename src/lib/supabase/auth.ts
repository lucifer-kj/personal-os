import { createClient } from "./server";

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export const DEFAULT_DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_DEV_USER_EMAIL = "user@personal-os.local";

/**
 * Derives and verifies authenticated user identity from the server session or test headers.
 * Never trust a user_id passed in the JSON request body.
 */
export async function getAuthenticatedUser(
  request?: Request
): Promise<AuthenticatedUser | null> {
  // Support testing overrides when explicit header provided
  if (request) {
    if (request.headers.get("x-unauthenticated") === "true") {
      return null;
    }
    const testUserId = request.headers.get("x-test-user-id");
    if (testUserId) {
      return { id: testUserId, email: "test@personal-os.local" };
    }
  }

  const supabase = await createClient();

  if (supabase) {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
      };
    } catch {
      return null;
    }
  }

  // Fallback for local development/offline sandbox when Supabase credentials are not set
  return {
    id: DEFAULT_DEV_USER_ID,
    email: DEFAULT_DEV_USER_EMAIL,
  };
}
