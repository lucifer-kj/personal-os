import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
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
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext(req);
  if (!ctx) {
    return apiError("UNAUTHORIZED", "Active session required", undefined, 401);
  }

  const raw = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const meta = deserializeSessionMeta(raw);
  const evaluation = evaluateSessionValidity(meta);

  return apiSuccess({
    user: ctx.user,
    sessionMeta: meta,
    evaluation,
  });
}

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext(req);
  if (!ctx) {
    return apiError("UNAUTHORIZED", "Active session required", undefined, 401);
  }

  let body: { isTrusted?: boolean; deviceId?: string } = {};
  try {
    body = await req.json();
  } catch {
    // Body is optional
  }

  const isTrusted = Boolean(body.isTrusted);
  const meta = createSessionMeta(isTrusted, body.deviceId);
  const serialized = serializeSessionMeta(meta);

  const maxAgeSeconds = Math.floor(
    (isTrusted ? TRUSTED_ABSOLUTE_MAX_MS : UNTRUSTED_ABSOLUTE_MAX_MS) / 1000
  );

  const response = apiSuccess({
    message: "Session policy established",
    meta,
  });

  response.cookies.set(SESSION_COOKIE_NAME, serialized, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeSeconds,
  });

  return response;
}

export async function DELETE(req: NextRequest) {
  const ctx = await getRequestContext(req);
  if (ctx?.supabase) {
    try {
      await ctx.supabase.auth.signOut();
    } catch {
      // Non-blocking sign out
    }
  }

  const response = apiSuccess({ message: "Session terminated" });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
