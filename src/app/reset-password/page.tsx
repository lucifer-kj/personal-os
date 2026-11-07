"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppOrb } from "@/components/brand/AppOrb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AppOrb size={64} state="solving" interactive />
          </div>
          <h1 className="text-2xl font-serif font-medium tracking-tight text-[var(--foreground)]">
            New Password
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] font-serif italic">
            Enter your new master credentials.
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
                Password Updated
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Redirecting you to your workstation...
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  <span>New Password</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  <span>Confirm New Password</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  minLength={8}
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
                <span>Update Password</span>
              </Button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
            <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
              Return to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
