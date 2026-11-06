"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Plus, AlertCircle, Calendar, Clock, ArrowRight } from "lucide-react";
import { Task } from "@/modules/tasks/types";
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
  const [showOverdue, setShowOverdue] = React.useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--primary)]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">
            Today&apos;s Agenda
          </h2>
          <span className="text-xs font-mono text-[var(--muted-foreground)]">
            ({todayTasks.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/tasks"
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
          >
            <span>All tasks</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCreateTask}
            className="h-7 text-xs gap-1"
          >
            <Plus className="h-3 w-3" />
            <span>Add</span>
          </Button>
        </div>
      </div>

      {/* Overdue Warning Callout */}
      {overdueTasks.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20 p-3 text-xs">
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
                <div
                  key={task.id}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => onToggleTask(task)}
                      className="h-4 w-4 rounded border border-amber-300 flex items-center justify-center bg-white dark:bg-black/30 text-amber-600 hover:border-amber-500 transition-colors"
                    >
                      {task.status === "completed" && <Check className="h-2.5 w-2.5" />}
                    </button>
                    <span className="truncate text-amber-950 dark:text-amber-100">
                      {task.title}
                    </span>
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

      {/* Today's Tasks */}
      {todayTasks.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
            No tasks scheduled for today. Take time to focus, plan upcoming priorities, or add a new task.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCreateTask}
            className="mt-3 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Schedule a task
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {todayTasks.map((task) => {
            const isCompleted = task.status === "completed";
            return (
              <Card
                key={task.id}
                className="p-3 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleTask(task)}
                    className={`h-4.5 w-4.5 rounded border transition-colors flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                        : "border-[var(--border)] hover:border-[var(--primary)] text-transparent"
                    }`}
                    aria-label={`Mark "${task.title}" as ${isCompleted ? "incomplete" : "completed"}`}
                  >
                    <Check className="h-3 w-3" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs sm:text-sm truncate transition-colors ${
                        isCompleted
                          ? "line-through text-[var(--muted-foreground)]"
                          : "text-[var(--foreground)] font-medium"
                      }`}
                    >
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.estimated_minutes && (
                    <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-[var(--muted-foreground)]">
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
