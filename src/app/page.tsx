import * as React from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createDashboardService } from "@/modules/dashboard/dashboard.service";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Today — Personal OS",
  description: "A calm, focused orientation for your daily intentions, active agenda, and deliverables.",
};

async function DashboardContent() {
  await connection();
  const user = await getAuthenticatedUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000001";

  const supabase = await createClient();
  const dashboardService = createDashboardService(supabase);
  const overview = await dashboardService.getDashboardOverview(userId);

  return <DashboardView initialOverview={overview} />;
}

export default function HomePage() {
  return (
    <PageShell className="pb-16 max-w-6xl">
      <React.Suspense
        fallback={
          <div className="space-y-6 pt-2">
            <div className="h-20 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="h-24 rounded-lg bg-[var(--card)] border border-[var(--border)] animate-pulse" />
              <div className="h-24 rounded-lg bg-[var(--card)] border border-[var(--border)] animate-pulse" />
              <div className="h-24 rounded-lg bg-[var(--card)] border border-[var(--border)] animate-pulse" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 h-64 rounded-lg bg-[var(--card)] border border-[var(--border)] animate-pulse" />
              <div className="lg:col-span-5 h-64 rounded-lg bg-[var(--card)] border border-[var(--border)] animate-pulse" />
            </div>
          </div>
        }
      >
        <DashboardContent />
      </React.Suspense>
    </PageShell>
  );
}
