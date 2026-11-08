"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Fingerprint, KeyRound, Loader2 } from "lucide-react";
import {
  isWebAuthnSupported,
  signInWithPasskey,
  registerPasskey,
  PasskeyAuthResult,
  PasskeyRegistrationResult,
} from "@/lib/auth/passkeys";

export interface PasskeyButtonProps {
  mode?: "signin" | "register";
  onSuccess?: (result: PasskeyAuthResult | PasskeyRegistrationResult) => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  disabled?: boolean;
}

export function PasskeyButton({
  mode = "signin",
  onSuccess,
  onError,
  className = "",
  variant = "outline",
  disabled = false,
}: PasskeyButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [supported, setSupported] = React.useState(true);

  React.useEffect(() => {
    setSupported(isWebAuthnSupported());
  }, []);

  const handleClick = async () => {
    if (disabled || loading) return;
    setLoading(true);

    try {
      if (mode === "signin") {
        const res = await signInWithPasskey();
        if (res.error) {
          const message =
            res.error instanceof Error
              ? res.error.message
              : typeof (res.error as { message?: unknown }).message === "string"
              ? (res.error as { message: string }).message
              : "Passkey authentication failed";
          onError?.(new Error(message));
        } else {
          onSuccess?.(res);
        }
      } else {
        const res = await registerPasskey();
        if (res.error) {
          const message =
            res.error instanceof Error
              ? res.error.message
              : typeof (res.error as { message?: unknown }).message === "string"
              ? (res.error as { message: string }).message
              : "Passkey registration failed";
          onError?.(new Error(message));
        } else {
          onSuccess?.(res);
        }
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Passkey ceremony error");
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return null;
  }

  const label =
    mode === "signin"
      ? "Sign in with Passkey / Biometrics"
      : "Register New Passkey";

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={label}
      className={`w-full h-10 text-xs font-medium gap-2 border-[var(--border)] transition-colors ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-[var(--muted-foreground)]" />
      ) : mode === "signin" ? (
        <Fingerprint className="h-4 w-4 text-[var(--primary)]" />
      ) : (
        <KeyRound className="h-4 w-4 text-[var(--primary)]" />
      )}
      <span>{label}</span>
    </Button>
  );
}
