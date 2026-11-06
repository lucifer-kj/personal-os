import * as React from "react";
import { CheckCircle2, Clock, FolderKanban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardMetrics as MetricsType } from "@/modules/dashboard/types";

interface DashboardMetricsProps {
  metrics: MetricsType;
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const totalTasks = metrics.tasks_completed_today + metrics.tasks_pending_today;
  const completionPercent = totalTasks > 0
    ? Math.round((metrics.tasks_completed_today / totalTasks) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 1. Tasks Completed */}
      <Card className="p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[var(--muted-foreground)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Completed Today
          </span>
          <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {metrics.tasks_completed_today}
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            of {totalTasks} tasks ({completionPercent}%)
          </span>
        </div>
      </Card>

      {/* 2. Planned Focus */}
      <Card className="p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[var(--muted-foreground)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Planned Focus Time
          </span>
          <Clock className="h-4 w-4 text-[var(--secondary)]" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {metrics.estimated_focus_minutes}
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            minutes allocated
          </span>
        </div>
      </Card>

      {/* 3. Active Projects */}
      <Card className="p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[var(--muted-foreground)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Active Projects
          </span>
          <FolderKanban className="h-4 w-4 text-[var(--accent)]" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {metrics.active_projects_count}
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            deliverables active
          </span>
        </div>
      </Card>
    </div>
  );
}
