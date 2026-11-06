"use client";

import * as React from "react";
import { Check, Clock, Trash2, AlertCircle } from "lucide-react";
import { Task, TaskPriority } from "@/modules/tasks/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityBadgeVariant: Record<TaskPriority, "outline" | "secondary" | "warning" | "destructive"> = {
  low: "outline",
  medium: "secondary",
  high: "warning",
  urgent: "destructive",
};

export function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  const isCompleted = task.status === "completed";

  const formattedDueDate = task.due_date || (task.due_at ? task.due_at.split("T")[0] : null);

  return (
    <div
      data-testid={`task-item-${task.id}`}
      className={cn(
        "group relative flex items-start justify-between gap-3 p-4 rounded-[var(--radius-card)] border transition-all duration-[var(--motion-fast)]",
        isCompleted
          ? "border-[var(--border)]/60 bg-[var(--muted)]/50 opacity-75"
          : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 hover:shadow-xs"
      )}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Accessible Completion Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={isCompleted ? `Mark '${task.title}' as incomplete` : `Mark '${task.title}' as completed`}
          onClick={() => onToggleComplete(task)}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
            isCompleted
              ? "border-[var(--success)] bg-[var(--success)] text-white"
              : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]"
          )}
        >
          {isCompleted && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
        </button>

        {/* Task Details */}
        <div className="flex flex-col space-y-1 min-w-0 flex-1">
          <span
            className={cn(
              "text-sm font-medium leading-snug break-words transition-colors",
              isCompleted
                ? "line-through text-[var(--muted-foreground)]"
                : "text-[var(--foreground)]"
            )}
          >
            {task.title}
          </span>

          {task.description && (
            <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <Badge variant={priorityBadgeVariant[task.priority]} className="capitalize text-[10px] px-2 py-0.2">
              {task.priority === "urgent" && <AlertCircle className="h-2.5 w-2.5 mr-1 inline" />}
              {task.priority}
            </Badge>

            {formattedDueDate && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-md">
                <Clock className="h-2.5 w-2.5" />
                {formattedDueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete '${task.title}'`}
          className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
