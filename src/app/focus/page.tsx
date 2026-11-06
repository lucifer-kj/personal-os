import * as React from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { FocusView } from "@/components/focus/FocusView";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getFocusRepository } from "@/modules/focus/focus.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { FocusService } from "@/modules/focus/focus.service";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Focus Mode — Personal OS",
  description: "Distraction-free deep work space with state orb synchronization.",
};

async function FocusContent() {
  await connection();

  const user = await getAuthenticatedUser();
  let initialActiveSession = null;

  if (user) {
    const supabase = await createClient();
    const focusRepo = getFocusRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new FocusService(focusRepo, taskRepo);
    initialActiveSession = await service.getActiveSession(user.id);
  }

  return <FocusView initialActiveSession={initialActiveSession} autoFetch={false} />;
}

export default function FocusPage() {
  return (
    <PageShell className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <React.Suspense
        fallback={
          <div className="flex h-full min-h-[400px] items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-[var(--muted)] animate-pulse" />
          </div>
        }
      >
        <FocusContent />
      </React.Suspense>
    </PageShell>
  );
}
