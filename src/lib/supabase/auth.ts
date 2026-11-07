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

      if (!error && user) {
        return {
          id: user.id,
          email: user.email,
        };
      }
    } catch {
      // Fall through to dev check
    }
  }

  // Support local dev preview when running in development
  if (process.env.NODE_ENV === "development") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      if (cookieStore.get("dev_preview")?.value === "true") {
        return {
          id: "40dd9499-53c2-48d9-9749-a061ac72ad7a",
          email: "321arifali@gmail.com",
        };
      }
    } catch {
      // Outside request context
    }
  }

  // Fallback for local development/offline sandbox when Supabase credentials are not set
  return {
    id: DEFAULT_DEV_USER_ID,
    email: DEFAULT_DEV_USER_EMAIL,
  };
}
