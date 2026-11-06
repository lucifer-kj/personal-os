"use client";

import * as React from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskEmptyStateProps {
  onCaptureClick?: () => void;
  filtered?: boolean;
}

export function TaskEmptyState({ onCaptureClick, filtered = false }: TaskEmptyStateProps) {
  return (
    <div
      data-testid="task-empty-state"
      className="surface flex flex-col items-center justify-center p-12 text-center border-dashed rounded-[var(--radius-panel)] border-[var(--border)] bg-[var(--card)]/60 my-6"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] mb-4">
        <CheckCircle2 className="h-6 w-6 stroke-[1.75]" />
      </div>
      <h3 className="font-serif font-medium text-lg text-[var(--foreground)] tracking-tight">
        {filtered ? "No tasks match the selected filter" : "All tasks clear"}
      </h3>
      <p className="mt-1 text-xs text-[var(--muted-foreground)] max-w-sm leading-relaxed">
        {filtered
          ? "Try adjusting your status or priority filters to see other tasks."
          : "Your workspace is peaceful and caught up. Capture an upcoming action or enjoy focused deep work."}
      </p>

      {onCaptureClick && (
        <div className="mt-6">
          <Button variant="default" size="sm" onClick={onCaptureClick} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Create new task</span>
          </Button>
        </div>
      )}
    </div>
  );
}
