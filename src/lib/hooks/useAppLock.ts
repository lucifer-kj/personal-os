"use client";

import * as React from "react";
import { signInWithPasskey } from "@/lib/auth/passkeys";

export interface AppLockOptions {
  gracePeriodMs?: number;
  autoLockEnabled?: boolean;
}

export const DEFAULT_LOCK_GRACE_PERIOD_MS = 60 * 1000; // 60 seconds

export function useAppLock(options: AppLockOptions = {}) {
  const {
    gracePeriodMs = DEFAULT_LOCK_GRACE_PERIOD_MS,
    autoLockEnabled = true,
  } = options;

  const [isShielded, setIsShielded] = React.useState(false);
  const [isLocked, setIsLocked] = React.useState(false);
  const [unlocking, setUnlocking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const lastBackgroundedAtRef = React.useRef<number | null>(null);

  const lock = React.useCallback(() => {
    setIsLocked(true);
    setIsShielded(true);
    setError(null);
  }, []);

  const unlock = React.useCallback(async (): Promise<boolean> => {
    setUnlocking(true);
    setError(null);

    try {
      const res = await signInWithPasskey();
      if (res.error) {
        setError(res.error.message || "Biometric authentication failed");
        setUnlocking(false);
        return false;
      }

      setIsLocked(false);
      setIsShielded(false);
      lastBackgroundedAtRef.current = null;
      setUnlocking(false);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unlock ceremony failed";
      setError(message);
      setUnlocking(false);
      return false;
    }
  }, []);

  const bypassUnlockForTesting = React.useCallback(() => {
    setIsLocked(false);
    setIsShielded(false);
    setError(null);
    lastBackgroundedAtRef.current = null;
  }, []);

  React.useEffect(() => {
    if (!autoLockEnabled || typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.visibilityState === "hidden") {
        // Immediately shield privacy when tab or app is backgrounded
        lastBackgroundedAtRef.current = now;
        setIsShielded(true);
      } else if (document.visibilityState === "visible") {
        const backgroundedAt = lastBackgroundedAtRef.current;
        if (backgroundedAt) {
          const elapsed = now - backgroundedAt;
          if (elapsed > gracePeriodMs) {
            // Grace period exceeded: require biometric re-authentication
            setIsLocked(true);
            setIsShielded(true);
          } else if (!isLocked) {
            // Returned within grace period: dismiss privacy shield
            setIsShielded(false);
          }
        }
      }
    };

    const handleWindowBlur = () => {
      if (document.visibilityState === "visible" && !isShielded && !isLocked) {
        lastBackgroundedAtRef.current = Date.now();
        setIsShielded(true);
      }
    };

    const handleWindowFocus = () => {
      const backgroundedAt = lastBackgroundedAtRef.current;
      if (backgroundedAt && !isLocked) {
        const elapsed = Date.now() - backgroundedAt;
        if (elapsed > gracePeriodMs) {
          setIsLocked(true);
          setIsShielded(true);
        } else {
          setIsShielded(false);
        }
      }
    };

    const handleManualLockEvent = () => {
      lock();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("personal-os:lock-app", handleManualLockEvent);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("personal-os:lock-app", handleManualLockEvent);
    };
  }, [autoLockEnabled, gracePeriodMs, isLocked, isShielded, lock]);

  return {
    isShielded,
    isLocked,
    unlocking,
    error,
    lock,
    unlock,
    bypassUnlockForTesting,
  };
}
