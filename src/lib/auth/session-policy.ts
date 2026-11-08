export interface SessionMeta {
  createdAt: number;
  lastActiveAt: number;
  isTrusted: boolean;
  deviceId: string;
}

export const SESSION_COOKIE_NAME = "pos_session_meta";

// Un-remembered session: 3h idle timeout, 12h absolute maximum
export const UNTRUSTED_INACTIVITY_MAX_MS = 3 * 60 * 60 * 1000; // 3 hours
export const UNTRUSTED_ABSOLUTE_MAX_MS = 12 * 60 * 60 * 1000; // 12 hours

// Remembered desktop session: 24h idle timeout, 30 days absolute maximum
export const TRUSTED_INACTIVITY_MAX_MS = 24 * 60 * 60 * 1000; // 24 hours
export const TRUSTED_ABSOLUTE_MAX_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type SessionInvalidReason =
  | "expired_inactivity"
  | "expired_absolute"
  | "invalid_format";

export interface SessionEvaluation {
  isValid: boolean;
  reason?: SessionInvalidReason;
  meta: SessionMeta | null;
}

/**
 * Creates a new session metadata record.
 */
export function createSessionMeta(
  isTrusted: boolean = false,
  deviceId?: string,
  now: number = Date.now()
): SessionMeta {
  return {
    createdAt: now,
    lastActiveAt: now,
    isTrusted,
    deviceId: deviceId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `dev-${now}`),
  };
}

/**
 * Serializes session metadata for cookie storage.
 */
export function serializeSessionMeta(meta: SessionMeta): string {
  try {
    const json = JSON.stringify(meta);
    if (typeof btoa === "function") {
      return btoa(json);
    }
    return Buffer.from(json).toString("base64");
  } catch {
    return JSON.stringify(meta);
  }
}

/**
 * Deserializes session metadata from cookie string.
 */
export function deserializeSessionMeta(
  raw: string | null | undefined
): SessionMeta | null {
  if (!raw) return null;
  try {
    let json = raw;
    try {
      if (typeof atob === "function") {
        json = atob(raw);
      } else {
        json = Buffer.from(raw, "base64").toString("utf-8");
      }
    } catch {
      // Fallback if raw wasn't base64-encoded
      json = raw;
    }

    const parsed = JSON.parse(json);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.createdAt === "number" &&
      typeof parsed.lastActiveAt === "number" &&
      typeof parsed.isTrusted === "boolean" &&
      typeof parsed.deviceId === "string"
    ) {
      return parsed as SessionMeta;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Evaluates whether a session is valid according to inactivity and absolute lifetime policies.
 */
export function evaluateSessionValidity(
  meta: SessionMeta | null,
  now: number = Date.now()
): SessionEvaluation {
  if (!meta) {
    return { isValid: false, reason: "invalid_format", meta: null };
  }

  const inactivityLimit = meta.isTrusted
    ? TRUSTED_INACTIVITY_MAX_MS
    : UNTRUSTED_INACTIVITY_MAX_MS;

  const absoluteLimit = meta.isTrusted
    ? TRUSTED_ABSOLUTE_MAX_MS
    : UNTRUSTED_ABSOLUTE_MAX_MS;

  // Check absolute lifetime
  if (now - meta.createdAt > absoluteLimit) {
    return { isValid: false, reason: "expired_absolute", meta };
  }

  // Check inactivity duration
  if (now - meta.lastActiveAt > inactivityLimit) {
    return { isValid: false, reason: "expired_inactivity", meta };
  }

  return { isValid: true, meta };
}

/**
 * Returns refreshed metadata with updated last-active timestamp.
 */
export function refreshSessionActivity(
  meta: SessionMeta,
  now: number = Date.now()
): SessionMeta {
  return {
    ...meta,
    lastActiveAt: now,
  };
}
