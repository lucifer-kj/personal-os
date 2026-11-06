import * as React from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getInboxRepository } from "@/modules/inbox/inbox.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { InboxService } from "@/modules/inbox/inbox.service";
import { PageShell } from "@/components/layout/PageShell";
import { InboxView } from "@/components/inbox/InboxView";

export const metadata: Metadata = {
  title: "Inbox — Personal OS",
  description: "Capture and triage unprocessed thoughts, ideas, and tasks.",
};

async function InboxContent() {
  await connection();

  const user = await getAuthenticatedUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000001";

  const supabase = await createClient();
  const inboxRepo = getInboxRepository(supabase);
  const taskRepo = getTaskRepository(supabase);
  const service = new InboxService(inboxRepo, taskRepo);

  const { items } = await service.listItems(userId, { status: "all" });

  return <InboxView initialItems={items} />;
}

export default function InboxPage() {
  return (
    <PageShell className="pb-16 max-w-5xl">
      <React.Suspense
        fallback={
          <div className="space-y-4 pt-2">
            <div className="h-16 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
              <div className="h-20 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
              <div className="h-20 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
            </div>
          </div>
        }
      >
        <InboxContent />
      </React.Suspense>
    </PageShell>
  );
}
