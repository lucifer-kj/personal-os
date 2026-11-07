"use client";

import * as React from "react";
import { Task } from "@/modules/tasks/types";
import { Button } from "@/components/ui/button";
import {
  Clock,
  X,
  Plus,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface TimeBlockDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  currentDate: Date;
  onScheduleTask: (taskId: string, startAt: string, durationMinutes: number) => Promise<void>;
}

export function TimeBlockDrawer({
  isOpen,
  onClose,
  tasks,
  currentDate,
  onScheduleTask,
}: TimeBlockDrawerProps) {
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [time, setTime] = React.useState("10:00");
  const [duration, setDuration] = React.useState(45);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successTaskId, setSuccessTaskId] = React.useState<string | null>(null);

  // Filter unscheduled or incomplete tasks
  const eligibleTasks = React.useMemo(() => {
    return tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled");
  }, [tasks]);

  if (!isOpen) return null;

  const handleConfirmSchedule = async (task: Task) => {
    setIsSubmitting(true);
    try {
      const dateStr = currentDate.toISOString().slice(0, 10);
      const startIso = new Date(`${dateStr}T${time}:00Z`).toISOString();
      await onScheduleTask(task.id, startIso, duration);
      setSuccessTaskId(task.id);
      setSelectedTaskId(null);
      setTimeout(() => setSuccessTaskId(null), 2500);
    } catch {
      // Handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 border-l border-[var(--border)] bg-[var(--card)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--primary)]" />
          <h3 className="font-serif text-base font-medium text-[var(--foreground)]">
            Time Block Tasks
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Intro info */}
      <div className="p-4 bg-[var(--muted)]/10 border-b border-[var(--border)] text-xs text-[var(--muted-foreground)]">
        Turn your priority tasks into protected calendar blocks on{" "}
        <span className="font-medium text-[var(--foreground)]">
          {currentDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        .
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {eligibleTasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--muted-foreground)]">
            No pending tasks found. All caught up!
          </div>
        ) : (
          eligibleTasks.map((task) => {
            const isConfiguring = selectedTaskId === task.id;
            const isJustScheduled = successTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`rounded-lg border p-3 transition-all ${
                  isJustScheduled
                    ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : isConfiguring
                    ? "border-[var(--primary)] bg-[var(--accent)]/30"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-xs text-[var(--foreground)] line-clamp-2">
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)] capitalize">
                        {task.priority}
                      </span>
                      {task.estimated_minutes && (
                        <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                          {task.estimated_minutes}m est
                        </span>
                      )}
                    </div>
                  </div>

                  {!isConfiguring && !isJustScheduled && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        if (task.estimated_minutes) {
                          setDuration(task.estimated_minutes);
                        }
                      }}
                      className="h-7 text-[11px] px-2 shrink-0 gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Block
                    </Button>
                  )}

                  {isJustScheduled && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Blocked
                    </span>
                  )}
                </div>

                {/* Inline Scheduling Controls */}
                {isConfiguring && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2.5 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-mono text-[var(--muted-foreground)] mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--foreground)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-[var(--muted-foreground)] mb-1">
                          Duration
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          className="w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--foreground)]"
                        >
                          <option value={25}>25 min (Pomodoro)</option>
                          <option value={45}>45 min</option>
                          <option value={60}>60 min</option>
                          <option value={90}>90 min (Deep Work)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedTaskId(null)}
                        className="h-6 text-[11px] px-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleConfirmSchedule(task)}
                        disabled={isSubmitting}
                        className="h-6 text-[11px] px-2.5 gap-1"
                      >
                        {isSubmitting && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        Confirm Block
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
