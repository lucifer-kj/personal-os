import * as React from "react";

export function TaskSkeleton() {
  return (
    <div data-testid="task-skeleton" className="space-y-3 py-2 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)]"
        >
          <div className="h-5 w-5 rounded-md bg-[var(--muted)] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-[var(--muted)]" />
            <div className="h-3 w-2/3 rounded bg-[var(--muted)]/60" />
            <div className="flex gap-2 pt-1">
              <div className="h-4 w-14 rounded-full bg-[var(--muted)]" />
              <div className="h-4 w-20 rounded bg-[var(--muted)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
