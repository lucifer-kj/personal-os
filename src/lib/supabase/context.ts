import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./server";
import {
  SESSION_COOKIE_NAME,
  deserializeSessionMeta,
  evaluateSessionValidity,
} from "@/lib/auth/session-policy";

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export const DEFAULT_DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_DEV_USER_EMAIL = "user@personal-os.local";

export interface RequestContext {
  user: AuthenticatedUser;
  supabase: SupabaseClient | null;
}

/**
 * Derives the single request-scoped Supabase client and verified authenticated identity in a single pass.
 * Prevents redundant client instantiations and enforces fail-closed authentication.
 *
 * In production:
 * - Fails closed: returns null if there is no verified Supabase user session.
 * - Test headers (x-test-user-id, x-unauthenticated) and dev previews are strictly ignored.
 *
 * In test (NODE_ENV === "test"):
 * - Supports x-unauthenticated: "true" to simulate unauthenticated calls.
 * - Supports x-test-user-id to inject test identities.
 * - Falls back to DEFAULT_DEV_USER_ID when running unit tests without headers or Supabase.
 *
 * In development (NODE_ENV === "development"):
 * - Respects the dev_preview cookie for local enclave preview.
 */
export async function getRequestContext(
  request?: Request
): Promise<RequestContext | null> {
  const isTest = process.env.NODE_ENV === "test";
  const isDev = process.env.NODE_ENV === "development";
  const isProd = process.env.NODE_ENV === "production" || (!isTest && !isDev);

  // 1. In isolated test environments ONLY, support testing headers
  if (isTest && request) {
    if (request.headers.get("x-unauthenticated") === "true") {
      return null;
    }
    const testUserId = request.headers.get("x-test-user-id");
    if (testUserId) {
      return {
        user: { id: testUserId, email: "test@personal-os.local" },
        supabase: null,
      };
    }
  }

  // 2. Instantiate server Supabase client
  let supabase: SupabaseClient | null = null;
  try {
    supabase = await createClient();
  } catch {
    if (isProd) {
      return null;
    }
  }

  // 3. Verify user session through Supabase
  if (supabase) {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user) {
        // Enforce session metadata expiration if cookie is present
        if (request) {
          const cookieHeader = request.headers.get("cookie") || "";
          const match = cookieHeader.match(
            new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`)
          );
          if (match) {
            const sessionMeta = deserializeSessionMeta(decodeURIComponent(match[1]));
            if (sessionMeta) {
              const evaluation = evaluateSessionValidity(sessionMeta);
              if (!evaluation.isValid) {
                return null;
              }

              // Check if session was explicitly revoked
              if (sessionMeta.deviceId && supabase) {
                try {
                  const { data: revRow } = await supabase
                    .from("auth_sessions")
                    .select("revoked_at")
                    .eq("session_id", sessionMeta.deviceId)
                    .maybeSingle();

                  if (revRow?.revoked_at) {
                    return null;
                  }
                } catch {
                  // Non-blocking query failure
                }
              }
            }
          }
        }

        return {
          user: {
            id: user.id,
            email: user.email,
          },
          supabase,
        };
      }
    } catch {
      if (isProd) {
        return null;
      }
    }
  }

  // In production: FAIL CLOSED. No valid session = null
  if (isProd) {
    return null;
  }

  // 4. Local dev preview when running in development mode (auto-authenticated as owner)
  if (isDev) {
    const cookieHeader = request ? request.headers.get("cookie") || "" : "";
    if (!cookieHeader.includes("dev_preview=false")) {
      return {
        user: {
          id: "40dd9499-53c2-48d9-9749-a061ac72ad7a",
          email: "321arifali@gmail.com",
        },
        supabase,
      };
    }
  }

  // 5. Isolated test mode fallback when running unit tests without headers or Supabase
  if (isTest) {
    return {
      user: {
        id: DEFAULT_DEV_USER_ID,
        email: DEFAULT_DEV_USER_EMAIL,
      },
      supabase: null,
    };
  }

  return null;
}

/**
 * Universal authentication context: checks for Bearer API token first (e.g. from n8n or external workers),
 * and falls back to standard user session cookie context.
 */
export async function getAuthOrTokenContext(
  request?: Request
): Promise<RequestContext | null> {
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      const { validateApiToken } = await import("@/lib/auth/api-tokens");
      let supabase: SupabaseClient | null = null;
      try {
        supabase = await createClient();
      } catch {
        // Fallback in dev/test
      }
      const tokenResult = await validateApiToken(request, supabase);
      if (tokenResult.valid && tokenResult.userId) {
        return {
          user: {
            id: tokenResult.userId,
            email: "api-token@personal-os.local",
          },
          supabase,
        };
      }
      return null;
    }
  }

  return getRequestContext(request);
}

