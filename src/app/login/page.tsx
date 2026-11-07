"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppOrb } from "@/components/brand/AppOrb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

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
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
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

          <div className="text-center pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
            Single-user setup?{" "}
            <Link href="/signup" className="text-[var(--primary)] font-medium hover:underline">
              Initialize Owner Account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
