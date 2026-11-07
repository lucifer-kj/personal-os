"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Plus, AlertCircle, Calendar, Clock, ArrowRight, Circle } from "lucide-react";
import { Task } from "@/modules/tasks/types";
import { fireCelebrationConfetti } from "@/lib/ui/confetti";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TodayAgendaProps {
  todayTasks: Task[];
  overdueTasks: Task[];
  onToggleTask: (task: Task) => void;
  onOpenCreateTask: () => void;
}

export function TodayAgenda({
  todayTasks,
  overdueTasks,
  onToggleTask,
  onOpenCreateTask,
}: TodayAgendaProps) {
  const [viewMode, setViewMode] = React.useState<"timeline" | "list">("timeline");
  const [showOverdue, setShowOverdue] = React.useState(true);

  const handleTaskCheck = (task: Task) => {
    if (task.status !== "completed") {
      const remainingUncompleted = todayTasks.filter(
        (t) => t.id !== task.id && t.status !== "completed"
      );
      if (remainingUncompleted.length === 0) {
        fireCelebrationConfetti();
      }
    }
    onToggleTask(task);
  };

  return (
    <Card className="p-5 sm:p-6 bg-white dark:bg-[#161413] border-[#EDE7DE] dark:border-[#2A2624] shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-2xl space-y-5 transition-all">
      {/* Header with Segmented Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#B94A24] dark:text-[#E07A50]" />
          <h2 className="text-base sm:text-lg font-serif font-medium tracking-tight text-[#24211F] dark:text-[#F3EFEA]">
            Today&apos;s Flow
          </h2>
          <span className="text-xs font-mono text-[#968E85] dark:text-[#8E867C]">
            ({todayTasks.length})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Timeline / List Toggle */}
          <div className="flex items-center rounded-full border border-[#EDE7DE] dark:border-[#2E2926] bg-[#F7F4EF] dark:bg-[#1C1917] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === "timeline"
                  ? "bg-white dark:bg-[#2A2623] text-[#24211F] dark:text-[#F3EFEA] shadow-2xs font-semibold"
                  : "text-[#7A7269] dark:text-[#A69E94] hover:text-[#24211F]"
              }`}
            >
              Timeline
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#2A2623] text-[#24211F] dark:text-[#F3EFEA] shadow-2xs font-semibold"
                  : "text-[#7A7269] dark:text-[#A69E94] hover:text-[#24211F]"
              }`}
            >
              List
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCreateTask}
            className="h-8 rounded-full text-xs gap-1 border-[#E2DAD1] hover:bg-[#F7F4EF]"
          >
            <Plus className="h-3.5 w-3.5 text-[#B94A24]" />
            <span>Add</span>
          </Button>
        </div>
      </div>

      {/* Overdue Warning Callout */}
      {overdueTasks.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => setShowOverdue(!showOverdue)}
              className="text-[11px] underline text-amber-800 dark:text-amber-300 hover:text-amber-950 transition-colors"
            >
              {showOverdue ? "Hide" : "Show"}
            </button>
          </div>

          {showOverdue && (
            <div className="mt-2.5 space-y-1.5 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
              {overdueTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => onToggleTask(task)}
                      className="h-4 w-4 rounded border border-amber-300 flex items-center justify-center bg-white dark:bg-black/30 text-amber-600 hover:border-amber-500 transition-colors"
                    >
                      {task.status === "completed" && <Check className="h-2.5 w-2.5" />}
                    </button>
                    <span className="truncate text-amber-950 dark:text-amber-100">{task.title}</span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 shrink-0 ml-2">
                    Due {task.due_date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Agenda Tasks Container */}
      {todayTasks.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-[#EDE7DE] dark:border-[#2A2624] bg-[#FAF8F5] dark:bg-[#161413]">
          <p className="text-xs sm:text-sm text-[#7A7269] dark:text-[#A69E94]">
            No tasks scheduled for today. Take time to focus, plan upcoming priorities, or add a new task.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCreateTask}
            className="mt-3 text-xs rounded-full border-[#E2DAD1]"
          >
            <Plus className="h-3 w-3 mr-1 text-[#B94A24]" />
            Schedule a task
          </Button>
        </div>
      ) : viewMode === "timeline" ? (
        /* Connected Vertical Timeline View */
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#EAE4DC] dark:before:bg-[#2E2824]">
          {todayTasks.map((task, idx) => {
            const isCompleted = task.status === "completed";
            const firstPendingIdx = todayTasks.findIndex((t) => t.status !== "completed");
            const isHighlighted = idx === firstPendingIdx;

            const timeLabel = (() => {
              if (task.scheduled_start_at) {
                try {
                  const d = new Date(task.scheduled_start_at);
                  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                } catch {
                  // fallback
                }
              }
              if (task.estimated_minutes) {
                return `${task.estimated_minutes}m block`;
              }
              return `Step ${idx + 1}`;
            })();

            const isDeepWork =
              task.priority === "urgent" ||
              Boolean(task.estimated_minutes && task.estimated_minutes >= 45);

            return (
              <div key={task.id} className="relative group">
                {/* Node Status Dot on the Line */}
                <button
                  type="button"
                  onClick={() => handleTaskCheck(task)}
                  className={`absolute -left-6 top-3 h-5 w-5 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 ${
                    isCompleted
                      ? "bg-[#287A4B] text-white"
                      : isHighlighted
                      ? "bg-[#FFF4ED] border-2 border-[#B94A24] text-[#B94A24]"
                      : "bg-white dark:bg-[#1A1715] border-2 border-[#D8D0C5] dark:border-[#423C37] hover:border-[#B94A24]"
                  }`}
                  aria-label={`Mark "${task.title}" as ${isCompleted ? "incomplete" : "completed"}`}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  ) : isHighlighted ? (
                    <div className="h-1.5 w-1.5 rounded-full bg-[#B94A24]" />
                  ) : null}
                </button>

                {/* Task Item Body */}
                <div
                  className={`p-3.5 rounded-xl transition-all ${
                    isHighlighted
                      ? "bg-[#FFF9F5] dark:bg-[#241712] border border-[#F6E1D2] dark:border-[#4B281B] shadow-2xs"
                      : "hover:bg-[#FAF8F5] dark:hover:bg-[#1A1715]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#968E85] dark:text-[#8E867C]">
                    <span>{timeLabel}</span>
                    {isDeepWork && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#B94A24] text-white">
                        Deep Work
                      </span>
                    )}
                    {task.priority !== "medium" && task.priority !== "low" && (
                      <Badge
                        variant={task.priority === "urgent" ? "accent" : "secondary"}
                        className="text-[10px] uppercase font-mono px-1.5 py-0"
                      >
                        {task.priority}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <p
                      className={`text-sm font-medium tracking-tight ${
                        isCompleted
                          ? "line-through text-[#968E85] dark:text-[#7A7269]"
                          : isHighlighted
                          ? "text-[#A84A28] dark:text-[#F39E7D] font-semibold"
                          : "text-[#24211F] dark:text-[#F3EFEA]"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.estimated_minutes && (
                      <span className="text-[11px] font-mono text-[#968E85] shrink-0">
                        {task.estimated_minutes}m
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="mt-0.5 text-xs text-[#7A7269] dark:text-[#A69E94] line-clamp-1">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Classic List View */
        <div className="space-y-2">
          {todayTasks.map((task) => {
            const isCompleted = task.status === "completed";
            return (
              <div
                key={task.id}
                className="p-3 rounded-xl border border-[#EDE7DE] dark:border-[#2A2624] bg-[#FAF8F5] dark:bg-[#1A1715] transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleTaskCheck(task)}
                    className={`h-4.5 w-4.5 rounded border transition-colors flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? "bg-[#B94A24] border-[#B94A24] text-white"
                        : "border-[#D8D0C5] hover:border-[#B94A24] text-transparent"
                    }`}
                    aria-label={`Mark "${task.title}" as ${isCompleted ? "incomplete" : "completed"}`}
                  >
                    <Check className="h-3 w-3" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs sm:text-sm truncate transition-colors ${
                        isCompleted
                          ? "line-through text-[#968E85] dark:text-[#7A7269]"
                          : "text-[#24211F] dark:text-[#F3EFEA] font-medium"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-[11px] text-[#7A7269] dark:text-[#A69E94] truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.estimated_minutes && (
                    <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-[#968E85]">
                      <Clock className="h-3 w-3" />
                      <span>{task.estimated_minutes}m</span>
                    </div>
                  )}

                  {task.priority !== "medium" && task.priority !== "low" && (
                    <Badge
                      variant={task.priority === "urgent" ? "accent" : "secondary"}
                      className="text-[10px] uppercase font-mono px-1.5 py-0"
                    >
                      {task.priority}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer link to full tasks */}
      <div className="pt-2 border-t border-[#F2EDE6] dark:border-[#221F1D] flex justify-end">
        <Link
          href="/tasks"
          className="text-xs font-medium text-[#B94A24] dark:text-[#E07A50] hover:underline flex items-center gap-1"
        >
          <span>View all tasks</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}
