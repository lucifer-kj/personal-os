import * as React from "react";
import Link from "next/link";
import { FolderKanban, ArrowRight } from "lucide-react";
import { ProjectWithStats } from "@/modules/projects/types";
import { Card } from "@/components/ui/card";

interface ActiveProjectsWidgetProps {
  projects: ProjectWithStats[];
}

export function ActiveProjectsWidget({ projects }: ActiveProjectsWidgetProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">
            Active Projects
          </h2>
          <span className="text-xs font-mono text-[var(--muted-foreground)]">
            ({projects.length})
          </span>
        </div>

        <Link
          href="/projects"
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
        >
          <span>All projects</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
            No active projects. Group your tasks into deliverables to track meaningful progress.
          </p>
          <Link
            href="/projects"
            className="inline-block mt-3 text-xs font-medium text-[var(--primary)] hover:underline"
          >
            Create first project
          </Link>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {projects.map((project) => {
            const { stats } = project;
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block group"
              >
                <Card className="p-3 transition-colors group-hover:border-[var(--primary)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-medium text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                      {project.name}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
                      {stats.progress_percent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, stats.progress_percent))}%` }}
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                    <span>
                      {stats.completed_tasks}/{stats.total_tasks} tasks done
                    </span>
                    {project.due_date && (
                      <span className="font-mono">Due {project.due_date}</span>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
