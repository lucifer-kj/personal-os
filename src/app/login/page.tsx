"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppOrb } from "@/components/brand/AppOrb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasskeyButton } from "@/components/auth/PasskeyButton";
import {
  Loader2,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Smartphone,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  LifeBuoy,
} from "lucide-react";
import { verifyMfaChallenge, verifyAndBurnRecoveryCode } from "@/lib/auth/mfa";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isTrusted, setIsTrusted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // MFA Flow States
  const [viewMode, setViewMode] = React.useState<"credentials" | "mfa" | "recovery">("credentials");
  const [totpFactorId, setTotpFactorId] = React.useState<string | null>(null);
  const [totpCode, setTotpCode] = React.useState("");
  const [recoveryCode, setRecoveryCode] = React.useState("");

  const establishSession = async (trusted: boolean) => {
    try {
      await fetch("/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrusted: trusted }),
      });
    } catch {
      // Non-blocking
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Check if user is enrolled in MFA (AAL2 required)
      const aalRes = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalRes.data?.nextLevel === "aal2" && aalRes.data?.currentLevel === "aal1") {
        const factorsRes = await supabase.auth.mfa.listFactors();
        const verifiedFactor = factorsRes.data?.totp?.find((f) => f.status === "verified");
        if (verifiedFactor) {
          setTotpFactorId(verifiedFactor.id);
          setViewMode("mfa");
          setLoading(false);
          return;
        }
      }

      // Single-factor login complete
      await establishSession(isTrusted);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpFactorId || !totpCode) return;

    setError(null);
    setLoading(true);

    try {
      const res = await verifyMfaChallenge(totpFactorId, totpCode);
      if (!res.success) {
        setError(res.error || "Invalid 6-digit code. Please verify against Google Authenticator.");
        setLoading(false);
        return;
      }

      await establishSession(isTrusted);
      toast.success("Identity verified via Google Authenticator");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "MFA verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode) return;

    setError(null);
    setLoading(true);

    try {
      const res = await verifyAndBurnRecoveryCode(recoveryCode);
      if (!res.valid) {
        setError(res.error || "Invalid or already-used recovery code.");
        setLoading(false);
        return;
      }

      await establishSession(isTrusted);
      toast.success(`Recovery code accepted. ${res.remainingCount} codes remaining.`);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Recovery verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height)-1rem)] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Orb & Heading */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AppOrb size={64} state="breathing" interactive />
          </div>
          <h1 className="text-2xl font-serif font-medium tracking-tight text-[var(--foreground)]">
            Personal OS
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] font-serif italic">
            Enter your secure workstation.
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 bg-[var(--card)] border-[var(--border)] shadow-xs space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-50 text-red-900 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* VIEW MODE 1: Standard Credentials & Passkey */}
          {viewMode === "credentials" && (
            <>
              {/* Primary Passwordless Passkey Action */}
              <div className="space-y-3">
                <PasskeyButton
                  mode="signin"
                  onSuccess={async () => {
                    await establishSession(isTrusted);
                    router.push("/");
                    router.refresh();
                  }}
                  onError={(err) => setError(err.message)}
                />

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[var(--border)] w-full" />
                  <span className="bg-[var(--card)] px-2.5 text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-mono">
                    or password
                  </span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                      <span>Password</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-[var(--primary)] hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="remember-device"
                    checked={isTrusted}
                    onChange={(e) => setIsTrusted(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)] cursor-pointer"
                  />
                  <label
                    htmlFor="remember-device"
                    className="text-[11px] text-[var(--muted-foreground)] cursor-pointer select-none"
                  >
                    Remember this workstation (trusted device)
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 text-xs font-medium gap-1.5 shadow-xs"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5" />
                  )}
                  <span>Sign In</span>
                </Button>
              </form>
            </>
          )}

          {/* VIEW MODE 2: Google Authenticator TOTP Challenge */}
          {viewMode === "mfa" && (
            <div className="space-y-4">
              <div className="text-center space-y-1.5 pb-1">
                <div className="inline-flex p-2.5 rounded-full bg-[#E05B27]/10 text-[#E05B27]">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h2 className="text-sm font-serif font-medium text-[var(--foreground)]">
                  Google Authenticator Code
                </h2>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Enter the 6-digit rolling verification code from the Google Authenticator app on your phone.
                </p>
              </div>

              <form onSubmit={handleVerifyTotp} className="space-y-4">
                <div className="space-y-1.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoComplete="one-time-code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="000000"
                    autoFocus
                    required
                    className="w-full text-center text-xl font-mono tracking-widest px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || totpCode.length !== 6}
                  className="w-full h-10 text-xs font-medium gap-1.5 shadow-xs bg-[#E05B27] hover:bg-[#C94D1D] text-white"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )}
                  <span>Verify Identity</span>
                </Button>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("credentials");
                      setError(null);
                    }}
                    className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("recovery");
                      setError(null);
                    }}
                    className="flex items-center gap-1 text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    <LifeBuoy className="h-3 w-3" />
                    <span>Use Recovery Code</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW MODE 3: Emergency Recovery Code */}
          {viewMode === "recovery" && (
            <div className="space-y-4">
              <div className="text-center space-y-1.5 pb-1">
                <div className="inline-flex p-2.5 rounded-full bg-amber-500/10 text-amber-600">
                  <LifeBuoy className="h-6 w-6" />
                </div>
                <h2 className="text-sm font-serif font-medium text-[var(--foreground)]">
                  Emergency Recovery Code
                </h2>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Enter one of your 8-character single-use emergency backup codes (e.g. ABCD-1234).
                </p>
              </div>

              <form onSubmit={handleVerifyRecovery} className="space-y-4">
                <div className="space-y-1.5">
                  <input
                    type="text"
                    maxLength={10}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX"
                    autoFocus
                    required
                    className="w-full text-center text-lg font-mono tracking-wider px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !recoveryCode.trim()}
                  className="w-full h-10 text-xs font-medium gap-1.5 shadow-xs bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="h-3.5 w-3.5" />
                  )}
                  <span>Verify Recovery Code</span>
                </Button>

                <div className="text-center pt-2 border-t border-[var(--border)] text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("mfa");
                      setError(null);
                    }}
                    className="flex items-center gap-1 mx-auto text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back to Google Authenticator</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {viewMode === "credentials" && (
            <div className="text-center pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
              Single-user setup?{" "}
              <Link href="/signup" className="text-[var(--primary)] font-medium hover:underline">
                Initialize Owner Account
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
