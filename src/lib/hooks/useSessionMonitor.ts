"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { INACTIVITY_WARNING_THRESHOLD_MS } from "@/lib/auth/session-policy";

export interface SessionMonitorOptions {
  checkIntervalMs?: number;
  activityThrottleMs?: number;
  warningThresholdMs?: number;
  enabled?: boolean;
}

export function useSessionMonitor(options: SessionMonitorOptions = {}) {
  const {
    checkIntervalMs = 30000,
    activityThrottleMs = 5 * 60 * 1000, // 5 minutes
    warningThresholdMs = INACTIVITY_WARNING_THRESHOLD_MS,
    enabled = true,
  } = options;

  const router = useRouter();
  const [showWarning, setShowWarning] = React.useState(false);
  const [timeRemainingMs, setTimeRemainingMs] = React.useState<number>(0);
  const [isExtending, setIsExtending] = React.useState(false);

  const lastActivityPingRef = React.useRef<number>(Date.now());
  const countdownIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Extend the session by pinging the backend
  const extendSession = React.useCallback(async (): Promise<boolean> => {
    setIsExtending(true);
    try {
      const res = await fetch("/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "extend" }),
      });

      if (res.ok) {
        const json = await res.json();
        const effective = json?.data?.timeRemaining?.effectiveRemainingMs ?? (3 * 3600 * 1000);
        setTimeRemainingMs(effective);
        setShowWarning(false);
        lastActivityPingRef.current = Date.now();
        setIsExtending(false);
        return true;
      }
    } catch {
      // Non-blocking
    }

    setIsExtending(false);
    return false;
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      await fetch("/api/v1/auth/session", { method: "DELETE" });
    } catch {
      // Non-blocking
    }
    router.push("/login?reason=user_signed_out");
    router.refresh();
  }, [router]);

  // Periodic check against session endpoint
  const checkSessionStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/v1/auth/session");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?reason=expired_inactivity");
          router.refresh();
        }
        return;
      }

      const json = await res.json();
      const timeRemaining = json?.data?.timeRemaining;
      if (timeRemaining) {
        const remaining = timeRemaining.effectiveRemainingMs;
        setTimeRemainingMs(remaining);

        if (remaining <= 0) {
          router.push("/login?reason=expired_inactivity");
          router.refresh();
        } else if (remaining <= warningThresholdMs) {
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      }
    } catch {
      // Non-blocking check
    }
  }, [router, warningThresholdMs]);

  // Throttled keep-alive ping on active interaction
  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleUserActivity = () => {
      const now = Date.now();
      // If we are currently showing warning, don't auto-dismiss via passive mousemove; user must click "Extend"
      if (!showWarning && now - lastActivityPingRef.current > activityThrottleMs) {
        lastActivityPingRef.current = now;
        extendSession();
      }
    };

    window.addEventListener("click", handleUserActivity, { passive: true });
    window.addEventListener("keydown", handleUserActivity, { passive: true });

    return () => {
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, [enabled, showWarning, activityThrottleMs, extendSession]);

  // Heartbeat polling check
  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    checkSessionStatus();
    const interval = setInterval(checkSessionStatus, checkIntervalMs);
    return () => clearInterval(interval);
  }, [enabled, checkIntervalMs, checkSessionStatus]);

  // Second-by-second countdown when warning is active
  React.useEffect(() => {
    if (!showWarning) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setTimeRemainingMs((prev) => {
        if (prev <= 1000) {
          clearInterval(countdownIntervalRef.current!);
          router.push("/login?reason=expired_inactivity");
          router.refresh();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [showWarning, router]);

  return {
    showWarning,
    timeRemainingMs,
    isExtending,
    extendSession,
    signOut,
  };
}
