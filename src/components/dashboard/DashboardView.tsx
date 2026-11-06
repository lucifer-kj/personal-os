"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardOverviewDTO } from "@/modules/dashboard/types";
import { Task, CreateTaskDTO } from "@/modules/tasks/types";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardMetrics } from "./DashboardMetrics";
import { TodayAgenda } from "./TodayAgenda";
import { ActiveProjectsWidget } from "./ActiveProjectsWidget";
import { QuickCaptureCard } from "./QuickCaptureCard";
import { TaskCreateDialog } from "@/components/tasks/TaskCreateDialog";

interface DashboardViewProps {
  initialOverview: DashboardOverviewDTO;
}

export function DashboardView({ initialOverview }: DashboardViewProps) {
  const router = useRouter();
  const [overview, setOverview] = React.useState<DashboardOverviewDTO>(initialOverview);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Quick event listener for global quick-capture event
  React.useEffect(() => {
    const handleGlobalCapture = () => setIsCreateOpen(true);
    window.addEventListener("personal-os:quick-capture", handleGlobalCapture);
    return () => window.removeEventListener("personal-os:quick-capture", handleGlobalCapture);
  }, []);

  const handleUpdateIntention = async (intention: string) => {
    const res = await fetch("/api/v1/day/intention", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: overview.date, intention }),
    });

    if (res.ok) {
      setOverview((prev) => ({
        ...prev,
        intention,
      }));
    }
  };

  const handleToggleTask = async (task: Task) => {
    const isCompleted = task.status === "completed";
    const newStatus = isCompleted ? "todo" : "completed";
    const endpoint = `/api/v1/tasks/${task.id}/${isCompleted ? "reopen" : "complete"}`;

    // Optimistic update
    setOverview((prev) => {
      const updateList = (list: Task[]) =>
        list.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: newStatus as Task["status"],
                completed_at: isCompleted ? null : new Date().toISOString(),
              }
            : t
        );

      const newToday = updateList(prev.today_agenda);
      const newOverdue = updateList(prev.overdue_tasks).filter((t) => t.status !== "completed");
      const completedCount = newToday.filter((t) => t.status === "completed").length;
      const pendingCount = newToday.length - completedCount;

      return {
        ...prev,
        today_agenda: newToday,
        overdue_tasks: newOverdue,
        metrics: {
          ...prev.metrics,
          tasks_completed_today: completedCount,
          tasks_pending_today: pendingCount,
        },
      };
    });

    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) {
        // Revert on failure
        setOverview(initialOverview);
      }
    } catch {
      setOverview(initialOverview);
    }
  };

  const handleCreateTask = async (dto: CreateTaskDTO) => {
    const res = await fetch("/api/v1/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (res.ok) {
      const { data: created } = await res.json();
      setIsCreateOpen(false);

      // Add to today's agenda if due today
      if (created.due_date === overview.date) {
        setOverview((prev) => ({
          ...prev,
          today_agenda: [created, ...prev.today_agenda],
          metrics: {
            ...prev.metrics,
            tasks_pending_today: prev.metrics.tasks_pending_today + 1,
            estimated_focus_minutes:
              prev.metrics.estimated_focus_minutes + (created.estimated_minutes || 0),
          },
        }));
      }
    }
  };

  const handleQuickAddTodayTask = async (title: string) => {
    await handleCreateTask({
      title,
      due_date: overview.date,
      priority: "medium",
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with greeting, date & editable intention */}
      <DashboardHeader
        greeting={overview.greeting}
        dateStr={overview.date}
        initialIntention={overview.intention}
        onUpdateIntention={handleUpdateIntention}
        onStartFocus={() => router.push("/focus")}
      />

      {/* 2. Calm Summary Metrics */}
      <DashboardMetrics metrics={overview.metrics} />

      {/* 3. Balanced 2-Column Content Layout (Single-Column Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Today's Chronological Flow & Priority Tasks */}
        <div className="lg:col-span-7 space-y-6">
          <TodayAgenda
            todayTasks={overview.today_agenda}
            overdueTasks={overview.overdue_tasks}
            onToggleTask={handleToggleTask}
            onOpenCreateTask={() => setIsCreateOpen(true)}
          />
        </div>

        {/* Right Column: Active Projects & Quick Capture */}
        <div className="lg:col-span-5 space-y-6">
          <ActiveProjectsWidget projects={overview.active_projects} />

          <QuickCaptureCard
            onQuickAddTodayTask={handleQuickAddTodayTask}
            onOpenCreateDialog={() => setIsCreateOpen(true)}
          />
        </div>
      </div>

      {/* Create Task Modal Dialog */}
      <TaskCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTask={handleCreateTask}
        initialDueDate={overview.date}
      />
    </div>
  );
}
