import * as React from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getRadarService } from "@/modules/radar/radar.service";
import { PageShell } from "@/components/layout/PageShell";
import { RadarView } from "@/components/radar/RadarView";

export const metadata: Metadata = {
  title: "The Radar — Personal OS",
  description: "Curated high-signal RSS & Atom feeds. 1-click promote to Notes or Social Studio.",
};

async function RadarContent() {
  await connection();

  const user = await getAuthenticatedUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000001";

  const supabase = await createClient();
  const radarService = getRadarService(supabase);

  const [feeds, items] = await Promise.all([
    radarService.listFeeds(userId),
    radarService.listItems(userId),
  ]);

  return <RadarView initialFeeds={feeds} initialItems={items} />;
}

export default function RadarPage() {
  return (
    <PageShell
      title="The Radar"
      description="Curated high-signal RSS workstation"
    >
      <React.Suspense
        fallback={
          <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
            <div className="text-center space-y-3">
              <div className="h-6 w-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[var(--muted-foreground)] font-mono">
                Scanning Radar Signals...
              </p>
            </div>
          </div>
        }
      >
        <RadarContent />
      </React.Suspense>
    </PageShell>
  );
}
