"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ShieldAlert, LogOut, Loader2 } from "lucide-react";

export interface SessionExpirationModalProps {
  isOpen: boolean;
  timeRemainingMs: number;
  isExtending: boolean;
  onExtend: () => void;
  onSignOut: () => void;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function SessionExpirationModal({
  isOpen,
  timeRemainingMs,
  isExtending,
  onExtend,
  onSignOut,
}: SessionExpirationModalProps) {
  if (!isOpen) return null;

  const countdownText = formatCountdown(timeRemainingMs);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Session Inactivity Warning"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-200"
    >
      <Card className="w-full max-w-sm p-6 bg-[var(--card)]/95 border-[var(--border)] shadow-2xl backdrop-blur-md space-y-5 text-center">
        {/* Warning Icon Badge */}
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-inner">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
        </div>

        {/* Heading & Notice */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="h-3 w-3" />
            <span>Inactivity Timeout</span>
          </div>

          <h2 className="text-xl font-serif font-medium text-[var(--foreground)] tracking-tight">
            Session Expiring Soon
          </h2>

          <p className="text-xs text-[var(--muted-foreground)]">
            Your workstation session will automatically lock due to inactivity.
          </p>
        </div>

        {/* Countdown Digits */}
        <div className="py-2">
          <span className="font-mono text-3xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
            {countdownText}
          </span>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
            remaining before auto-signout
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            type="button"
            onClick={onExtend}
            disabled={isExtending}
            className="w-full h-10 text-xs font-medium gap-2 shadow-xs bg-[var(--primary)] text-[var(--primary-foreground)]"
          >
            {isExtending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span>Stay Signed In</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onSignOut}
            className="w-full h-9 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Now</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
