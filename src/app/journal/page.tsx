import * as React from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { JournalService } from "@/modules/journal/journal.service";
import { getJournalRepository } from "@/modules/journal/journal.repository";
import { PageShell } from "@/components/layout/PageShell";
import { JournalView } from "@/components/journal/JournalView";

export const metadata: Metadata = {
  title: "Journal & Reflections — Personal OS",
  description: "Private daily reflection, gratitude, and mood tracking.",
};

async function JournalContent() {
  await connection();

  const user = await getAuthenticatedUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000001";

  const supabase = await createClient();
  const service = new JournalService(getJournalRepository(supabase));
  const todayStr = new Date().toISOString().split("T")[0];

  const [{ entries }, todayEntry] = await Promise.all([
    service.listEntries(userId, { limit: 20 }),
    service.getEntryByDate(userId, todayStr),
  ]);

  return <JournalView initialEntries={entries} initialTodayEntry={todayEntry} />;
}

export default function JournalPage() {
  return (
    <PageShell className="pb-12 max-w-5xl">
      <React.Suspense
        fallback={
          <div className="w-full max-w-5xl mx-auto space-y-6 animate-pulse">
            <div className="h-16 bg-[var(--muted)]/40 rounded-xl" />
            <div className="h-14 bg-[var(--muted)]/30 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-[var(--muted)]/20 rounded-2xl" />
              <div className="lg:col-span-1 h-96 bg-[var(--muted)]/20 rounded-2xl" />
            </div>
          </div>
        }
      >
        <JournalContent />
      </React.Suspense>
    </PageShell>
  );
}
