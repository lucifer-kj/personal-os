import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { SESSION_COOKIE_NAME, deserializeSessionMeta } from "@/lib/auth/session-policy";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext(req);
  if (!ctx || !ctx.supabase) {
    return apiError("UNAUTHORIZED", "Active session required", undefined, 401);
  }

  const rawMeta = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const currentMeta = deserializeSessionMeta(rawMeta);
  const currentDeviceId = currentMeta?.deviceId;

  try {
    const { data: sessions, error } = await ctx.supabase
      .from("auth_sessions")
      .select("*")
      .eq("user_id", ctx.user.id)
      .is("revoked_at", null)
      .order("last_active_at", { ascending: false });

    if (error) {
      return apiError("INTERNAL_ERROR", error.message, undefined, 500);
    }

    const formattedSessions = (sessions || []).map((s) => ({
      id: s.id,
      sessionId: s.session_id,
      deviceName: s.device_name,
      browser: s.browser,
      os: s.os,
      ipAddress: s.ip_address,
      isTrusted: s.is_trusted,
      isCurrent: s.session_id === currentDeviceId,
      lastActiveAt: s.last_active_at,
      createdAt: s.created_at,
    }));

    // If no sessions recorded yet, supply current device as synthesized entry
    if (formattedSessions.length === 0 && currentDeviceId) {
      formattedSessions.push({
        id: currentDeviceId,
        sessionId: currentDeviceId,
        deviceName: "Current Workstation",
        browser: "Web Browser",
        os: "Personal OS",
        ipAddress: "127.0.0.1",
        isTrusted: currentMeta.isTrusted,
        isCurrent: true,
        lastActiveAt: new Date(currentMeta.lastActiveAt).toISOString(),
        createdAt: new Date(currentMeta.createdAt).toISOString(),
      });
    }

    return apiSuccess({ sessions: formattedSessions });
  } catch (err: unknown) {
    return apiError(
      "INTERNAL_ERROR",
      err instanceof Error ? err.message : "Failed to load device sessions",
      undefined,
      500
    );
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext(req);
  if (!ctx || !ctx.supabase) {
    return apiError("UNAUTHORIZED", "Active session required", undefined, 401);
  }

  let body: {
    action?: "revoke" | "revoke_others";
    sessionId?: string;
  } = {};

  try {
    body = await req.json();
  } catch {
    return apiError("BAD_REQUEST", "Invalid JSON payload", undefined, 400);
  }

  const rawMeta = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const currentMeta = deserializeSessionMeta(rawMeta);
  const currentDeviceId = currentMeta?.deviceId;
  const nowIso = new Date().toISOString();

  try {
    if (body.action === "revoke_others") {
      if (!currentDeviceId) {
        return apiError("BAD_REQUEST", "Current session ID not found", undefined, 400);
      }

      const { error } = await ctx.supabase
        .from("auth_sessions")
        .update({ revoked_at: nowIso })
        .eq("user_id", ctx.user.id)
        .neq("session_id", currentDeviceId)
        .is("revoked_at", null);

      if (error) {
        return apiError("INTERNAL_ERROR", error.message, undefined, 500);
      }

      return apiSuccess({ message: "All other sessions have been revoked." });
    }

    if (body.action === "revoke") {
      if (!body.sessionId) {
        return apiError("BAD_REQUEST", "sessionId is required for revocation", undefined, 400);
      }

      const { error } = await ctx.supabase
        .from("auth_sessions")
        .update({ revoked_at: nowIso })
        .eq("user_id", ctx.user.id)
        .eq("session_id", body.sessionId);

      if (error) {
        return apiError("INTERNAL_ERROR", error.message, undefined, 500);
      }

      return apiSuccess({ message: `Session ${body.sessionId} revoked.` });
    }

    return apiError("BAD_REQUEST", "Unsupported action", undefined, 400);
  } catch (err: unknown) {
    return apiError(
      "INTERNAL_ERROR",
      err instanceof Error ? err.message : "Revocation failed",
      undefined,
      500
    );
  }
}
