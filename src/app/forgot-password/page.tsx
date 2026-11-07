"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AppOrb } from "@/components/brand/AppOrb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AppOrb size={64} state="searching" interactive />
          </div>
          <h1 className="text-2xl font-serif font-medium tracking-tight text-[var(--foreground)]">
            Reset Password
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] font-serif italic">
            Receive a secure recovery link.
          </p>
        </div>

        <Card className="p-6 bg-[var(--card)] border-[var(--border)] shadow-xs space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-50 text-red-900 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center animate-in zoom-in-95">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Reset Link Sent
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                If an account exists for {email}, a recovery link has been dispatched to your email.
              </p>
              <Link href="/login" className="pt-2 text-xs text-[var(--primary)] font-medium hover:underline">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@domain.com"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
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
                <span>Send Reset Link</span>
              </Button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
            Remembered password?{" "}
            <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
