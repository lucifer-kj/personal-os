import Link from "next/link";
import { CheckSquare, ArrowRight, Sparkles, Clock } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <PageShell
      eyebrow="Personal Workspace"
      title="Good morning"
      description="A quiet, focused environment for your daily intentions, active work, and reflection."
      actions={
        <Link href="/tasks" prefetch={false}>
          <Button variant="default" size="sm" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            <span>Open Tasks</span>
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Foundation Card: Daily Orientation */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="accent">App Foundation</Badge>
              <span className="text-xs font-mono text-[var(--muted-foreground)]">
                M0 Active
              </span>
            </div>
            <CardTitle className="pt-2 text-xl font-serif">
              Personal OS Foundation Established
            </CardTitle>
            <CardDescription>
              The core application shell, responsive navigation, and warm editorial design system are initialized and operational.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--foreground)] leading-relaxed">
              In accordance with the specification hierarchy, the Next.js App Router workspace is configured with strict TypeScript, pnpm package management, Vitest testing, and the canonical terracotta and warm neutral palette.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/tasks" prefetch={false}>
                <Button variant="outline" size="sm" className="gap-2">
                  <span>Explore Tasks Milestone</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--primary)]" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Status / Quick Metrics Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="success">System Ready</Badge>
                <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
              </div>
              <CardTitle className="pt-2">Architecture Integrity</CardTitle>
              <CardDescription>Verified system standards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[var(--muted-foreground)]">
              <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span>Tailwind CSS</span>
                <span className="font-mono text-[var(--foreground)]">v4 Theme Inline</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span>Responsive Target</span>
                <span className="font-mono text-[var(--foreground)]">375px — 1440px+</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span>Test Suite</span>
                <span className="font-mono text-[var(--foreground)]">Vitest + RTL</span>
              </div>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <div className="rounded-[var(--radius-control)] bg-[var(--muted)] p-3 text-xs text-[var(--secondary-foreground)] flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
              <span>Next up: Milestone 1 — Task Management</span>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
