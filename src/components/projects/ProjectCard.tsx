"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban, Calendar, CheckSquare } from "lucide-react";
import { ProjectWithStats, ProjectStatus, ProjectPriority } from "@/modules/projects/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ProjectCardProps {
  project: ProjectWithStats;
}

const statusBadgeVariant: Record<ProjectStatus, "default" | "secondary" | "accent" | "outline" | "success" | "warning"> = {
  planned: "secondary",
  active: "accent",
  on_hold: "warning",
  completed: "success",
  archived: "outline",
};

const priorityBadgeVariant: Record<ProjectPriority, "outline" | "secondary" | "warning" | "destructive"> = {
  low: "outline",
  medium: "secondary",
  high: "warning",
  urgent: "destructive",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { stats } = project;

  return (
    <Link href={`/projects/${project.id}`} prefetch={false} className="block group">
      <Card
        data-testid={`project-card-${project.id}`}
        className="flex flex-col justify-between h-full transition-all duration-[var(--motion-fast)] hover:border-[var(--primary)]/50 hover:shadow-sm p-5"
      >
        <div className="space-y-3">
          {/* Top badges: Status & Priority */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                <FolderKanban className="h-3.5 w-3.5" />
              </div>
              <Badge variant={statusBadgeVariant[project.status]} className="capitalize text-[10px] px-2 py-0.2">
                {project.status.replace("_", " ")}
              </Badge>
            </div>
            <Badge variant={priorityBadgeVariant[project.priority]} className="capitalize text-[10px] px-2 py-0.2">
              {project.priority}
            </Badge>
          </div>

          {/* Project Title & Description */}
          <div>
            <h3 className="font-serif font-medium text-base text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
              {project.name}
            </h3>
            {project.description ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            ) : (
              <p className="mt-1 text-xs text-[var(--muted-foreground)] italic">
                No description provided.
              </p>
            )}
          </div>
        </div>

        {/* Footer Area: Progress Bar, Dates & Task Counts */}
        <div className="pt-4 mt-4 border-t border-[var(--border)] space-y-2.5">
          {/* Progress Bar with Defined Calculation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[var(--muted-foreground)]">Progress</span>
              <span className="font-semibold text-[var(--foreground)]">
                {stats.progress_percent}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--muted)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, stats.progress_percent))}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] pt-0.5">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="h-3 w-3" />
              <span>
                {stats.completed_tasks}/{stats.total_tasks} tasks
              </span>
            </div>

            {project.due_date && (
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <Calendar className="h-3 w-3" />
                <span>{project.due_date}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
