import { describe, it, expect } from "vitest";
import {
  createSessionMeta,
  serializeSessionMeta,
  deserializeSessionMeta,
  evaluateSessionValidity,
  refreshSessionActivity,
  getSessionTimeRemaining,
  isWarningThresholdReached,
  UNTRUSTED_INACTIVITY_MAX_MS,
  UNTRUSTED_ABSOLUTE_MAX_MS,
  TRUSTED_INACTIVITY_MAX_MS,
  TRUSTED_ABSOLUTE_MAX_MS,
  INACTIVITY_WARNING_THRESHOLD_MS,
} from "./session-policy";

describe("Session Policy & Lifetime Engine", () => {
  const baseTime = 1700000000000;

  it("creates session metadata with correct defaults", () => {
    const meta = createSessionMeta(false, "dev-device-1", baseTime);
    expect(meta.createdAt).toBe(baseTime);
    expect(meta.lastActiveAt).toBe(baseTime);
    expect(meta.isTrusted).toBe(false);
    expect(meta.deviceId).toBe("dev-device-1");
  });

  it("serializes and deserializes session metadata cleanly", () => {
    const original = createSessionMeta(true, "macbook-m3-pro", baseTime);
    const serialized = serializeSessionMeta(original);
    expect(typeof serialized).toBe("string");

    const restored = deserializeSessionMeta(serialized);
    expect(restored).toEqual(original);
  });

  it("returns null when deserializing corrupted data", () => {
    expect(deserializeSessionMeta("not-valid-base64")).toBeNull();
    expect(deserializeSessionMeta(null)).toBeNull();
    expect(deserializeSessionMeta(undefined)).toBeNull();
  });

  describe("Inactivity & Lifetime Policies", () => {
    it("validates fresh sessions as valid", () => {
      const meta = createSessionMeta(false, "d1", baseTime);
      const evalResult = evaluateSessionValidity(meta, baseTime + 1000);
      expect(evalResult.isValid).toBe(true);
      expect(evalResult.reason).toBeUndefined();
    });

    it("expires untrusted sessions after 3 hours of inactivity", () => {
      const meta = createSessionMeta(false, "d1", baseTime);
      const pastInactivityTime = baseTime + UNTRUSTED_INACTIVITY_MAX_MS + 1000;

      const evalResult = evaluateSessionValidity(meta, pastInactivityTime);
      expect(evalResult.isValid).toBe(false);
      expect(evalResult.reason).toBe("expired_inactivity");
    });

    it("expires untrusted sessions after 12 hours absolute duration even if active", () => {
      const meta = createSessionMeta(false, "d1", baseTime);
      // Simulate recent activity within inactivity limit, but past 12h absolute
      const pastAbsoluteTime = baseTime + UNTRUSTED_ABSOLUTE_MAX_MS + 5000;
      meta.lastActiveAt = pastAbsoluteTime - 1000;

      const evalResult = evaluateSessionValidity(meta, pastAbsoluteTime);
      expect(evalResult.isValid).toBe(false);
      expect(evalResult.reason).toBe("expired_absolute");
    });

    it("keeps trusted desktop sessions alive past untrusted 3-hour limit", () => {
      const meta = createSessionMeta(true, "trusted-desktop-imac", baseTime);
      // 5 hours later (exceeds untrusted 3h limit, but within trusted 24h limit)
      const fiveHoursLater = baseTime + 5 * 60 * 60 * 1000;

      const evalResult = evaluateSessionValidity(meta, fiveHoursLater);
      expect(evalResult.isValid).toBe(true);
    });

    it("expires trusted desktop sessions after 24 hours of inactivity", () => {
      const meta = createSessionMeta(true, "trusted-desktop-imac", baseTime);
      const pastTrustedInactivity = baseTime + TRUSTED_INACTIVITY_MAX_MS + 2000;

      const evalResult = evaluateSessionValidity(meta, pastTrustedInactivity);
      expect(evalResult.isValid).toBe(false);
      expect(evalResult.reason).toBe("expired_inactivity");
    });

    it("expires trusted desktop sessions after 30 days absolute duration", () => {
      const meta = createSessionMeta(true, "trusted-desktop-imac", baseTime);
      const pastTrustedAbsolute = baseTime + TRUSTED_ABSOLUTE_MAX_MS + 5000;
      meta.lastActiveAt = pastTrustedAbsolute - 1000;

      const evalResult = evaluateSessionValidity(meta, pastTrustedAbsolute);
      expect(evalResult.isValid).toBe(false);
      expect(evalResult.reason).toBe("expired_absolute");
    });

    it("refreshes session activity timestamp cleanly", () => {
      const meta = createSessionMeta(false, "d1", baseTime);
      const refreshed = refreshSessionActivity(meta, baseTime + 50000);
      expect(refreshed.createdAt).toBe(baseTime);
      expect(refreshed.lastActiveAt).toBe(baseTime + 50000);
    });

    describe("Time Remaining & Inactivity Warning", () => {
      it("calculates remaining session time accurately", () => {
        const meta = createSessionMeta(false, "d1", baseTime);
        const elapsed = 60 * 60 * 1000; // 1 hour elapsed
        const remaining = getSessionTimeRemaining(meta, baseTime + elapsed);

        // 3h limit - 1h = 2h inactivity remaining
        expect(remaining.inactivityRemainingMs).toBe(2 * 60 * 60 * 1000);
        // 12h absolute - 1h = 11h absolute remaining
        expect(remaining.absoluteRemainingMs).toBe(11 * 60 * 60 * 1000);
        expect(remaining.effectiveRemainingMs).toBe(2 * 60 * 60 * 1000);
        expect(remaining.isWarning).toBe(false);
      });

      it("identifies when session enters 5-minute warning window", () => {
        const meta = createSessionMeta(false, "d1", baseTime);
        // 2 hours 56 minutes elapsed (4 minutes remaining before 3h inactivity)
        const fourMinutesRemainingTime =
          baseTime + UNTRUSTED_INACTIVITY_MAX_MS - 4 * 60 * 1000;

        const remaining = getSessionTimeRemaining(meta, fourMinutesRemainingTime);
        expect(remaining.isWarning).toBe(true);
        expect(remaining.effectiveRemainingMs).toBe(4 * 60 * 1000);
        expect(isWarningThresholdReached(meta, fourMinutesRemainingTime)).toBe(true);
      });

      it("returns zero remaining and false warning when session has fully expired", () => {
        const meta = createSessionMeta(false, "d1", baseTime);
        const expiredTime = baseTime + UNTRUSTED_INACTIVITY_MAX_MS + 10000;

        const remaining = getSessionTimeRemaining(meta, expiredTime);
        expect(remaining.effectiveRemainingMs).toBe(0);
        expect(remaining.isWarning).toBe(false);
        expect(isWarningThresholdReached(meta, expiredTime)).toBe(false);
      });
    });
  });
});
