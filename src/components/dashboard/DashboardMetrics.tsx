"use client";

import * as React from "react";
import { Clock, CheckSquare2, Layers, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardMetrics as MetricsType } from "@/modules/dashboard/types";

interface DashboardMetricsProps {
  metrics: MetricsType;
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const totalTasks = metrics.tasks_completed_today + metrics.tasks_pending_today;
  const completionPercent =
    totalTasks > 0 ? Math.round((metrics.tasks_completed_today / totalTasks) * 100) : 0;

  // Format focus minutes to "Xh Ym"
  const focusHours = Math.floor(metrics.estimated_focus_minutes / 60);
  const focusRemainingMins = metrics.estimated_focus_minutes % 60;
  const focusDisplay =
    metrics.estimated_focus_minutes > 0
      ? focusHours > 0
        ? `${focusHours}h ${focusRemainingMins}m`
        : `${focusRemainingMins}m`
      : "0m";

  const dailyTasksDisplay = `${metrics.tasks_completed_today} / ${totalTasks}`;
  const activeProjectsDisplay = `${metrics.active_projects_count}`;
  const targetPercent = `${completionPercent}%`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Focus Time */}
      <Card className="group p-4 sm:p-5 bg-[var(--card)] border-[var(--border)] shadow-xs rounded-2xl flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
            <Clock className="h-4 w-4 text-[var(--primary)]" />
            <span>Focus Time</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[var(--foreground)]">
              {focusDisplay}
            </span>
            {metrics.estimated_focus_minutes > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                <TrendingUp className="h-2.5 w-2.5 stroke-[2.5]" />
                <span>Active</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Micro Accent Track */}
        <div className="mt-4 h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden">
          <div className="h-full w-14 group-hover:w-28 bg-[var(--primary)] rounded-full transition-all duration-300" />
        </div>
      </Card>

      {/* 2. Daily Tasks */}
      <Card className="group p-4 sm:p-5 bg-[var(--card)] border-[var(--border)] shadow-xs rounded-2xl flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
            <CheckSquare2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Daily Tasks</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[var(--foreground)]">
              {dailyTasksDisplay}
            </span>
          </div>
        </div>

        {/* Dynamic Micro Accent Track */}
        <div className="mt-4 h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(12, Math.min(100, completionPercent))}%` }}
          />
        </div>
      </Card>

      {/* 3. Active Projects */}
      <Card className="group p-4 sm:p-5 bg-[var(--card)] border-[var(--border)] shadow-xs rounded-2xl flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
            <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Active Projects</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[var(--foreground)]">
              {activeProjectsDisplay}
            </span>
          </div>
        </div>

        {/* Dynamic Micro Accent Track */}
        <div className="mt-4 h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden">
          <div className="h-full w-12 group-hover:w-24 bg-amber-600 dark:bg-amber-500 rounded-full transition-all duration-300" />
        </div>
      </Card>

      {/* 4. Targets */}
      <Card className="group p-4 sm:p-5 bg-[var(--card)] border-[var(--border)] shadow-xs rounded-2xl flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
            <Target className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Targets</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[var(--foreground)]">
              {targetPercent}
            </span>
          </div>
        </div>

        {/* Dynamic Micro Accent Track */}
        <div className="mt-4 h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-600 dark:bg-sky-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(10, Math.min(100, completionPercent))}%` }}
          />
        </div>
      </Card>
    </div>
  );
}
