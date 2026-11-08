import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ConfigurationError, InfrastructureError } from "@/lib/errors";

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isProd = process.env.NODE_ENV === "production";

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProd) {
      throw new ConfigurationError(
        "Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured in production."
      );
    }
    return null;
  }

  try {
    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored if called from a Server Component
          }
        },
      },
    });
  } catch (err: unknown) {
    // If called outside of a Next.js request context (e.g. in unit tests)
    if (isProd) {
      throw new InfrastructureError(
        `Failed to create Supabase server client: ${err instanceof Error ? err.message : "outside request context"}`
      );
    }
    return null;
  }
}
