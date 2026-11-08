"use client";

import * as React from "react";
import { AppOrb } from "@/components/brand/AppOrb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fingerprint, Lock, LogOut, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export interface AppLockScreenProps {
  isShielded: boolean;
  isLocked: boolean;
  unlocking: boolean;
  error?: string | null;
  onUnlock: () => void;
  onSignOut?: () => void;
}

export function AppLockScreen({
  isShielded,
  isLocked,
  unlocking,
  error,
  onUnlock,
  onSignOut,
}: AppLockScreenProps) {
  const router = useRouter();

  if (!isShielded && !isLocked) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await fetch("/api/v1/auth/session", { method: "DELETE" });
    } catch {
      // Non-blocking
    }
    if (onSignOut) {
      onSignOut();
    } else {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isLocked ? "Workstation Locked" : "Privacy Shield"}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl bg-black/70 animate-in fade-in duration-200"
    >
      <Card className="w-full max-w-sm p-6 bg-[var(--card)]/95 border-[var(--border)] shadow-2xl backdrop-blur-md space-y-6 text-center">
        <div className="flex justify-center">
          <AppOrb
            size={56}
            state={isLocked ? "shaping" : "breathing"}
            interactive={false}
          />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider uppercase bg-[var(--muted)] text-[var(--muted-foreground)]">
            <Lock className="h-3 w-3" />
            <span>{isLocked ? "Enclave Locked" : "Privacy Shield Active"}</span>
          </div>

          <h2 className="text-xl font-serif font-medium text-[var(--foreground)] tracking-tight">
            {isLocked ? "Personal OS Locked" : "Screen Protected"}
          </h2>

          <p className="text-xs text-[var(--muted-foreground)]">
            {isLocked
              ? "Re-authenticate using your device passkey or biometric sensor to resume."
              : "Interface shielded while app was backgrounded."}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-left rounded-lg bg-red-50 text-red-900 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          {isLocked ? (
            <Button
              type="button"
              onClick={onUnlock}
              disabled={unlocking}
              className="w-full h-11 text-xs font-medium gap-2 shadow-sm"
            >
              {unlocking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Fingerprint className="h-4 w-4" />
              )}
              <span>Unlock with Passkey / Face ID</span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onUnlock}
              className="w-full h-10 text-xs font-medium gap-2 shadow-xs"
            >
              <span>Resume Workstation</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={handleSignOut}
            className="w-full h-9 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
