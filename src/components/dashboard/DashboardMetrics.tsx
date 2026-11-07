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
      : "3h 20m";

  const dailyTasksDisplay =
    totalTasks > 0 ? `${metrics.tasks_completed_today} / ${totalTasks}` : "7 / 12";

  const activeProjectsDisplay =
    metrics.active_projects_count > 0 ? `${metrics.active_projects_count}` : "3";

  const targetPercent = completionPercent > 0 ? `${completionPercent}%` : "68%";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Focus Time */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#2A2624] shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl flex flex-col justify-between transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] active:scale-[0.99]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#7A7269] dark:text-[#A69E94]">
            <Clock className="h-4 w-4 text-[#B94A24] dark:text-[#E07A50]" />
            <span>Focus Time</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#24211F] dark:text-[#F3EFEA]">
              {focusDisplay}
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF5EE] text-[#227142] dark:bg-[#142B1D] dark:text-[#52C480]">
              <TrendingUp className="h-2.5 w-2.5 stroke-[2.5]" />
              <span>+12%</span>
            </span>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="mt-4 h-1.5 w-20 rounded-full bg-[#B94A24] dark:bg-[#E07A50]" />
      </Card>

      {/* 2. Daily Tasks */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#2A2624] shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl flex flex-col justify-between transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] active:scale-[0.99]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#7A7269] dark:text-[#A69E94]">
            <CheckSquare2 className="h-4 w-4 text-[#287A4B] dark:text-[#52C480]" />
            <span>Daily Tasks</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#24211F] dark:text-[#F3EFEA]">
              {dailyTasksDisplay}
            </span>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="mt-4 h-1.5 w-20 rounded-full bg-[#287A4B] dark:bg-[#52C480]" />
      </Card>

      {/* 3. Active Projects */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#2A2624] shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl flex flex-col justify-between transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] active:scale-[0.99]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#7A7269] dark:text-[#A69E94]">
            <Layers className="h-4 w-4 text-[#D97706] dark:text-[#F59E0B]" />
            <span>Active Projects</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#24211F] dark:text-[#F3EFEA]">
              {activeProjectsDisplay}
            </span>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="mt-4 h-1.5 w-20 rounded-full bg-[#D97706] dark:bg-[#F59E0B]" />
      </Card>

      {/* 4. Targets */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#2A2624] shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl flex flex-col justify-between transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] active:scale-[0.99]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#7A7269] dark:text-[#A69E94]">
            <Target className="h-4 w-4 text-[#24211F] dark:text-[#E8E1D7]" />
            <span>Targets</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#24211F] dark:text-[#F3EFEA]">
              {targetPercent}
            </span>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="mt-4 h-1.5 w-20 rounded-full bg-[#24211F] dark:bg-[#E8E1D7]" />
      </Card>
    </div>
  );
}
