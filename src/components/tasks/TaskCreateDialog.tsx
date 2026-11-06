"use client";

import * as React from "react";
import { X, Calendar as CalendarIcon, Flag } from "lucide-react";
import { CreateTaskDTO, TaskPriority } from "@/modules/tasks/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TaskCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateTaskDTO) => Promise<boolean>;
}

export function TaskCreateDialog({
  isOpen,
  onClose,
  onSubmit,
}: TaskCreateDialogProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Task title is required");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const success = await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        status: "todo",
      });

      if (success) {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDueDate("");
        onClose();
      } else {
        setErrorMessage("Failed to create task. Please try again.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <h2 id="create-task-title" className="font-serif font-medium text-lg text-[var(--foreground)]">
            Create Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {errorMessage && (
            <div className="p-3 rounded-[var(--radius-control)] bg-[var(--destructive)]/10 text-[var(--destructive)] text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="task-title" className="block text-xs font-medium text-[var(--foreground)] mb-1">
              Title <span className="text-[var(--primary)]">*</span>
            </label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="task-description" className="block text-xs font-medium text-[var(--foreground)] mb-1">
              Description (optional)
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details, context, or links..."
              rows={3}
              className="w-full rounded-[var(--radius-control)] border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="block text-xs font-medium text-[var(--foreground)] mb-1">
                <Flag className="h-3.5 w-3.5 inline mr-1 text-[var(--muted-foreground)]" />
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-10 rounded-[var(--radius-control)] border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date" className="block text-xs font-medium text-[var(--foreground)] mb-1">
                <CalendarIcon className="h-3.5 w-3.5 inline mr-1 text-[var(--muted-foreground)]" />
                Due Date
              </label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
