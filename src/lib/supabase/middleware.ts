import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  SESSION_COOKIE_NAME,
  createSessionMeta,
  deserializeSessionMeta,
  serializeSessionMeta,
  evaluateSessionValidity,
  refreshSessionActivity,
  TRUSTED_ABSOLUTE_MAX_MS,
  UNTRUSTED_ABSOLUTE_MAX_MS,
} from "@/lib/auth/session-policy";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // In production or when session cookie is present, enforce idle and absolute timeouts
  if (user && !pathname.startsWith("/auth/callback")) {
    const rawSessionMeta = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionMeta = deserializeSessionMeta(rawSessionMeta);

    if (sessionMeta) {
      const evaluation = evaluateSessionValidity(sessionMeta);
      if (!evaluation.isValid) {
        // Session expired according to policy
        supabaseResponse.cookies.delete(SESSION_COOKIE_NAME);
        try {
          await supabase.auth.signOut();
        } catch {
          // Non-blocking
        }

        if (pathname.startsWith("/api")) {
          return NextResponse.json(
            { error: "Session expired", code: evaluation.reason },
            { status: 401 }
          );
        }

        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/login";
        redirectUrl.searchParams.set("reason", evaluation.reason || "expired");
        return NextResponse.redirect(redirectUrl);
      }

      // Valid session: refresh last-active timestamp
      const refreshed = refreshSessionActivity(sessionMeta);
      const maxAgeSeconds = Math.floor(
        (refreshed.isTrusted ? TRUSTED_ABSOLUTE_MAX_MS : UNTRUSTED_ABSOLUTE_MAX_MS) / 1000
      );
      supabaseResponse.cookies.set(
        SESSION_COOKIE_NAME,
        serializeSessionMeta(refreshed),
        {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: maxAgeSeconds,
        }
      );
    } else if (process.env.NODE_ENV === "production") {
      // First observation of user in production without session meta: initialize
      const newMeta = createSessionMeta(false);
      supabaseResponse.cookies.set(
        SESSION_COOKIE_NAME,
        serializeSessionMeta(newMeta),
        {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: Math.floor(UNTRUSTED_ABSOLUTE_MAX_MS / 1000),
        }
      );
    }
  }

  // Public paths that do not require authentication
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth");

  // Check development preview mode
  const hasDevPreview =
    process.env.NODE_ENV === "development" &&
    (request.nextUrl.searchParams.get("preview") === "true" ||
      request.cookies.get("dev_preview")?.value === "true");

  if (hasDevPreview) {
    if (request.nextUrl.searchParams.get("preview") === "true") {
      supabaseResponse.cookies.set("dev_preview", "true", { path: "/", httpOnly: false });
    }
    if (isAuthPage && !pathname.startsWith("/auth/callback")) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Protect internal pages: if not signed in, redirect to /login
  if (!user && !isAuthPage && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If already logged in and visiting auth page, redirect to home
  if (user && isAuthPage && !pathname.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
