"use client";

import * as React from "react";
import { HabitWithStreak } from "@/modules/habits/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Check, Archive, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: HabitWithStreak;
  onToggleCheckin: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function HabitCard({
  habit,
  onToggleCheckin,
  onArchive,
  onDelete,
}: HabitCardProps) {
  const [isToggling, setIsToggling] = React.useState(false);

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await onToggleCheckin(habit.id);
    } finally {
      setIsToggling(false);
    }
  };

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div
      className={cn(
        "group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200",
        habit.is_completed_today
          ? "bg-[var(--card)] border-[var(--primary)]/30 shadow-xs"
          : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/20 shadow-xs",
        habit.is_archived && "opacity-60 bg-[var(--muted)]/20"
      )}
    >
      {/* Left: Info & streak */}
      <div className="flex items-start sm:items-center gap-3.5 mb-3 sm:mb-0">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          aria-label={habit.is_completed_today ? "Mark habit incomplete" : "Mark habit complete"}
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
            habit.is_completed_today
              ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-xs"
              : "border-[var(--border)] bg-[var(--background)] text-transparent hover:border-[var(--primary)]/60 hover:text-[var(--primary)]/40"
          )}
        >
          <Check className={cn("h-5 w-5 stroke-[2.5]", habit.is_completed_today && "text-white")} />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "font-medium text-base text-[var(--foreground)] leading-snug",
                habit.is_completed_today && "line-through text-[var(--muted-foreground)]"
              )}
            >
              {habit.name}
            </span>

            {habit.current_streak > 0 && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-xs px-2 py-0.5 flex items-center gap-1 font-mono font-medium"
              >
                <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                {habit.current_streak}d
              </Badge>
            )}

            {habit.is_archived && (
              <Badge variant="outline" className="text-xs">
                Archived
              </Badge>
            )}
          </div>

          {habit.description && (
            <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
              {habit.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: 7-day tracker & actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4">
        {/* 7-day mini bubbles */}
        <div className="flex items-center gap-1.5" title="Last 7 days consistency">
          {habit.recent_history.map((day, idx) => {
            const shortDay = dayLabels[idx] || "";
            return (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-mono text-[var(--muted-foreground)]">
                  {shortDay}
                </span>
                <div
                  className={cn(
                    "h-3 w-3 rounded-full border transition-colors",
                    day.completed
                      ? "bg-[var(--primary)] border-[var(--primary)]"
                      : "bg-[var(--muted)]/40 border-[var(--border)]"
                  )}
                  title={`${day.date}: ${day.completed ? "Completed" : "Not completed"}`}
                />
              </div>
            );
          })}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(habit.id)}
            className="h-8 w-8 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            title={habit.is_archived ? "Restore Habit" : "Archive Habit"}
          >
            {habit.is_archived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(habit.id)}
            className="h-8 w-8 p-0 text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            title="Delete Habit"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
