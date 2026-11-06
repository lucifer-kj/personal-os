import * as React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createProjectService } from "@/modules/projects/project.service";
import { createTaskService } from "@/modules/tasks/task.service";
import { PageShell } from "@/components/layout/PageShell";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Project ${id} — Personal OS`,
    description: "Project detail, milestones, and task progression.",
  };
}

async function ProjectDetailContent({ params }: ProjectPageProps) {
  const { id } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    notFound();
  }

  const supabase = await createClient();
  const projectService = createProjectService(supabase);
  const taskService = createTaskService(supabase);

  const [project, { tasks }] = await Promise.all([
    projectService.getProject(user.id, id),
    taskService.listTasks(user.id, { project_id: id }),
  ]);

  if (!project) {
    notFound();
  }

  return <ProjectDetailView initialProject={project} initialTasks={tasks} />;
}

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  return (
    <PageShell className="pb-16">
      <React.Suspense
        fallback={
          <div className="space-y-4 pt-4">
            <div className="h-8 w-48 rounded bg-[var(--muted)] animate-pulse" />
            <div className="h-24 rounded-lg bg-[var(--card)] border border-[var(--border)] animate-pulse" />
          </div>
        }
      >
        <ProjectDetailContent params={params} />
      </React.Suspense>
    </PageShell>
  );
}
