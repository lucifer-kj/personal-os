import * as React from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getCalendarRepository } from "@/modules/calendar/calendar.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { CalendarService } from "@/modules/calendar/calendar.service";
import { TaskService } from "@/modules/tasks/task.service";
import { PageShell } from "@/components/layout/PageShell";
import { CalendarView } from "@/components/calendar/CalendarView";
import { getStartOfMonth, getEndOfMonth } from "@/modules/calendar/utils";

export const metadata: Metadata = {
  title: "Calendar & Time Blocking — Personal OS",
  description:
    "Calm, distraction-free calendar scheduling and time-blocking workstation.",
};

async function CalendarContent() {
  await connection();

  const user = await getAuthenticatedUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000001";

  const supabase = await createClient();
  const calendarRepo = getCalendarRepository(supabase);
  const taskRepo = getTaskRepository(supabase);
  const calendarService = new CalendarService(calendarRepo, taskRepo);
  const taskService = new TaskService(taskRepo);

  const now = new Date();
  const from = getStartOfMonth(now);
  from.setDate(from.getDate() - 7);
  const to = getEndOfMonth(now);
  to.setDate(to.getDate() + 14);

  const [events, tasksResult] = await Promise.all([
    calendarService.listEvents(userId, {
      from: from.toISOString(),
      to: to.toISOString(),
    }),
    taskService.listTasks(userId, {
      status: ["todo", "in_progress"],
    }),
  ]);

  return (
    <CalendarView
      initialEvents={events}
      initialTasks={tasksResult.tasks}
    />
  );
}

export default function CalendarPage() {
  return (
    <PageShell className="pb-16 max-w-6xl">
      <React.Suspense
        fallback={
          <div className="space-y-4 pt-2">
            <div className="h-16 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
            <div className="h-[600px] rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
          </div>
        }
      >
        <CalendarContent />
      </React.Suspense>
    </PageShell>
  );
}
