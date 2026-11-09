import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import {
  SESSION_COOKIE_NAME,
  createSessionMeta,
  deserializeSessionMeta,
  serializeSessionMeta,
  evaluateSessionValidity,
  refreshSessionActivity,
  getSessionTimeRemaining,
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
  const timeRemaining = getSessionTimeRemaining(meta);

  return apiSuccess({
    user: ctx.user,
    sessionMeta: meta,
    evaluation,
    timeRemaining,
  });
}

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext(req);
  if (!ctx) {
    return apiError("UNAUTHORIZED", "Active session required", undefined, 401);
  }

  let body: {
    action?: "init" | "extend" | "refresh";
    isTrusted?: boolean;
    deviceId?: string;
  } = {};

  try {
    body = await req.json();
  } catch {
    // Body is optional
  }

  const rawExisting = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const existingMeta = deserializeSessionMeta(rawExisting);

  let meta;
  if ((body.action === "extend" || body.action === "refresh") && existingMeta) {
    // Extend existing session by refreshing last-active timestamp
    meta = refreshSessionActivity(existingMeta);
  } else {
    // Initialize or re-create session meta
    const isTrusted = body.isTrusted !== undefined ? Boolean(body.isTrusted) : (existingMeta?.isTrusted ?? false);
    meta = createSessionMeta(isTrusted, body.deviceId ?? existingMeta?.deviceId);
  }

  const serialized = serializeSessionMeta(meta);
  const maxAgeSeconds = Math.floor(
    (meta.isTrusted ? TRUSTED_ABSOLUTE_MAX_MS : UNTRUSTED_ABSOLUTE_MAX_MS) / 1000
  );
  const timeRemaining = getSessionTimeRemaining(meta);

  const response = apiSuccess({
    message: body.action === "extend" ? "Session extended" : "Session policy established",
    meta,
    timeRemaining,
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
