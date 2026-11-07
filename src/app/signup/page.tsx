"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppOrb } from "@/components/brand/AppOrb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, Lock, Mail, ShieldCheck, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [isClaimed, setIsClaimed] = React.useState(false);

  React.useEffect(() => {
    async function checkWorkspace() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("is_workspace_initialized");
        if (!error && data === true) {
          setIsClaimed(true);
        }
      } catch {
        // Ignore check error if RPC is not accessible
      }
    }
    checkWorkspace();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        if (
          signUpError.message.includes("single-user") ||
          signUpError.message.includes("Additional signups")
        ) {
          setIsClaimed(true);
          setError("Workspace is already claimed by an owner. Additional signups are disabled.");
        } else {
          setError(signUpError.message);
        }
      } else if (data?.session) {
        // Direct session returned (e.g. email confirmations disabled)
        router.push("/");
        router.refresh();
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to initialize account");
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
            <AppOrb size={64} state="weaving" interactive />
          </div>
          <h1 className="text-2xl font-serif font-medium tracking-tight text-[var(--foreground)]">
            Owner Initialization
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] font-serif italic">
            Claim and configure your private workspace.
          </p>
        </div>

        {/* Signup Card */}
        <Card className="p-6 bg-[var(--card)] border-[var(--border)] shadow-xs space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-50 text-red-900 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {isClaimed ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
              <ShieldCheck className="h-10 w-10 text-[var(--primary)]" />
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Workspace Initialized
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                This Personal OS workspace has already been claimed by its owner. Additional registrations are locked.
              </p>
              <Button
                size="sm"
                onClick={() => router.push("/login")}
                className="mt-2 text-xs"
              >
                Go to Sign In
              </Button>
            </div>
          ) : success ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center animate-in zoom-in-95">
              <ShieldCheck className="h-10 w-10 text-emerald-600" />
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Account Initialized
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                If email confirmation is enabled on Supabase, check your inbox. Otherwise you can sign in directly.
              </p>
              <Button
                size="sm"
                onClick={() => router.push("/login")}
                className="mt-2 text-xs"
              >
                Proceed to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-[11px] text-amber-900 dark:text-amber-300">
                <strong>Single-User Architecture:</strong> Only the first registered user can claim this database. All future signups are blocked.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  <span>Owner Email</span>
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  <span>Master Password</span>
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
                <span>Initialize Workspace</span>
              </Button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
            Already initialized?{" "}
            <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
