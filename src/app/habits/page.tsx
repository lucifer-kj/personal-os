import * as React from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { HabitService } from "@/modules/habits/habit.service";
import { getHabitRepository } from "@/modules/habits/habit.repository";
import { PageShell } from "@/components/layout/PageShell";
import { HabitsView } from "@/components/habits/HabitsView";

export const metadata: Metadata = {
  title: "Habits & Routines — Personal OS",
  description: "Track daily rhythm, consistency streaks, and habit completions.",
};

async function HabitsContent() {
  await connection();

  const user = await getAuthenticatedUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000001";

  const supabase = await createClient();
  const service = new HabitService(getHabitRepository(supabase));
  const habits = await service.listHabits(userId, { is_archived: false });
  const stats = await service.getSummaryStats(userId);

  return <HabitsView initialHabits={habits} initialStats={stats} />;
}

export default function HabitsPage() {
  return (
    <PageShell className="pb-12 max-w-5xl">
      <React.Suspense
        fallback={
          <div className="w-full max-w-5xl mx-auto space-y-8 animate-pulse">
            <div className="h-16 bg-[var(--muted)]/40 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-20 bg-[var(--muted)]/30 rounded-xl" />
              <div className="h-20 bg-[var(--muted)]/30 rounded-xl" />
              <div className="h-20 bg-[var(--muted)]/30 rounded-xl" />
            </div>
            <div className="h-64 bg-[var(--muted)]/20 rounded-2xl" />
          </div>
        }
      >
        <HabitsContent />
      </React.Suspense>
    </PageShell>
  );
}
