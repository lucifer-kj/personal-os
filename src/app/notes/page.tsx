import * as React from "react";
import { Metadata } from "next";
import { connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getNoteRepository } from "@/modules/notes/note.repository";
import { getProjectRepository } from "@/modules/projects/project.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { NoteService } from "@/modules/notes/note.service";
import { ProjectService } from "@/modules/projects/project.service";
import { TaskService } from "@/modules/tasks/task.service";
import { PageShell } from "@/components/layout/PageShell";
import { NotesView } from "@/components/notes/NotesView";

export const metadata: Metadata = {
  title: "Notes & Knowledge Base — Personal OS",
  description:
    "Calm, durable markdown knowledge workstation with networked links and tags.",
};

async function NotesContent() {
  await connection();

  const user = await getAuthenticatedUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000001";

  const supabase = await createClient();
  const noteRepo = getNoteRepository(supabase);
  const projectRepo = getProjectRepository(supabase);
  const taskRepo = getTaskRepository(supabase);

  const noteService = new NoteService(noteRepo, projectRepo, taskRepo);
  const projectService = new ProjectService(projectRepo, taskRepo);
  const taskService = new TaskService(taskRepo);

  const [notes, tags, projectsResult, tasksResult] = await Promise.all([
    noteService.listNotes(userId),
    noteService.getAllTags(userId),
    projectService.listProjects(userId),
    taskService.listTasks(userId, { status: ["todo", "in_progress"] }),
  ]);

  return (
    <NotesView
      initialNotes={notes}
      initialTags={tags}
      initialProjects={projectsResult.projects}
      initialTasks={tasksResult.tasks}
    />
  );
}

export default function NotesPage() {
  return (
    <PageShell className="pb-12 max-w-7xl">
      <React.Suspense
        fallback={
          <div className="flex flex-col lg:flex-row flex-1 min-h-[600px] border border-[var(--border)] rounded-xl bg-[var(--card)] animate-pulse">
            <div className="w-full lg:w-80 border-r border-[var(--border)] p-4 space-y-4">
              <div className="h-8 bg-[var(--muted)]/40 rounded-md" />
              <div className="h-10 bg-[var(--muted)]/30 rounded-md" />
              <div className="space-y-2 pt-2">
                <div className="h-16 bg-[var(--muted)]/20 rounded-md" />
                <div className="h-16 bg-[var(--muted)]/20 rounded-md" />
                <div className="h-16 bg-[var(--muted)]/20 rounded-md" />
              </div>
            </div>
            <div className="flex-1 p-8 space-y-4">
              <div className="h-10 w-2/3 bg-[var(--muted)]/30 rounded-md" />
              <div className="h-6 w-1/3 bg-[var(--muted)]/20 rounded-md" />
              <div className="h-64 bg-[var(--muted)]/10 rounded-md" />
            </div>
          </div>
        }
      >
        <NotesContent />
      </React.Suspense>
    </PageShell>
  );
}
