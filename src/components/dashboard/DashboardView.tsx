"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardOverviewDTO } from "@/modules/dashboard/types";
import { Task, CreateTaskDTO } from "@/modules/tasks/types";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardMetrics } from "./DashboardMetrics";
import { CurrentFocusCard } from "./CurrentFocusCard";
import { FocusTimerWidget } from "./FocusTimerWidget";
import { TodayAgenda } from "./TodayAgenda";
import { ActiveProjectsWidget } from "./ActiveProjectsWidget";
import { QuickCaptureCard } from "./QuickCaptureCard";
import { TaskCreateDialog } from "@/components/tasks/TaskCreateDialog";
import { MobileFocusedDashboard } from "./MobileFocusedDashboard";
import { PlanMyDayModal } from "./PlanMyDayModal";

interface DashboardViewProps {
  initialOverview: DashboardOverviewDTO;
}

export function DashboardView({ initialOverview }: DashboardViewProps) {
  const router = useRouter();
  const [overview, setOverview] = React.useState<DashboardOverviewDTO>(initialOverview);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isPlanDayOpen, setIsPlanDayOpen] = React.useState(false);

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
    <div>
      {/* 1. Mobile Focused Day View (< lg) */}
      <MobileFocusedDashboard
        overview={overview}
        onAddTask={() => setIsCreateOpen(true)}
        onPlanDay={() => setIsPlanDayOpen(true)}
        onQuickCapture={() => setIsCreateOpen(true)}
        onSubmitPrompt={(text) => handleQuickAddTodayTask(text)}
      />

      {/* 2. Desktop High-Craft Workstation Layout (>= lg) */}
      <div className="hidden lg:flex flex-col space-y-6">
        {/* Header with greeting, date & editable intention */}
        <DashboardHeader
          greeting={overview.greeting}
          dateStr={overview.date}
          userName="Arif"
          initialIntention={overview.intention}
          onUpdateIntention={handleUpdateIntention}
          onStartFocus={() => router.push("/focus")}
          onPlanDay={() => setIsPlanDayOpen(true)}
        />

        {/* 4-Card Calm Summary Metrics */}
        <DashboardMetrics metrics={overview.metrics} />

        {/* Middle Section: Current Focus & Focus Timer */}
        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="col-span-12 lg:col-span-8 flex flex-col">
            <CurrentFocusCard
              title={overview.intention || "Complete dashboard design & token architecture"}
              description="Finalize layouts, interaction patterns, and design tokens before spec handoff."
              onOpenDetails={() => router.push("/focus")}
              className="h-full flex flex-col justify-between"
            />
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col">
            <FocusTimerWidget
              onSessionComplete={() => router.push("/focus")}
              className="h-full flex flex-col justify-between"
            />
          </div>
        </div>

        {/* Bottom Section: Today's Flow & Active Projects */}
        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="col-span-12 lg:col-span-7 flex flex-col">
            <TodayAgenda
              todayTasks={overview.today_agenda}
              overdueTasks={overview.overdue_tasks}
              onToggleTask={handleToggleTask}
              onOpenCreateTask={() => setIsCreateOpen(true)}
              className="h-full flex flex-col justify-between"
            />
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col">
            <ActiveProjectsWidget
              projects={overview.active_projects}
              className="h-full flex flex-col justify-between"
            />
          </div>
        </div>
      </div>

      {/* Create Task Modal Dialog */}
      <TaskCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTask={handleCreateTask}
        initialDueDate={overview.date}
      />

      {/* Plan My Day Rapid Docket Modal */}
      <PlanMyDayModal
        isOpen={isPlanDayOpen}
        onClose={() => setIsPlanDayOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
