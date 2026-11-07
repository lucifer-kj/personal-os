"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
} from "lucide-react";
import { CalendarViewType } from "@/modules/calendar/utils";

interface CalendarHeaderProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewEvent: () => void;
  onToggleTimeBlock: () => void;
  isTimeBlockOpen: boolean;
  conflictCount?: number;
}

export function CalendarHeader({
  currentDate,
  viewType,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onNewEvent,
  onToggleTimeBlock,
  isTimeBlockOpen,
  conflictCount = 0,
}: CalendarHeaderProps) {
  // Format period label based on active view
  const periodLabel = React.useMemo(() => {
    const monthYear = currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (viewType === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (viewType === "week") {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = (day < 1 ? 7 : 0) + day - 1;
      start.setDate(start.getDate() - diff);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);

      const startMonth = start.toLocaleDateString("en-US", { month: "short" });
      const endMonth = end.toLocaleDateString("en-US", { month: "short" });

      if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
    }

    return monthYear;
  }, [currentDate, viewType]);

  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--card)]/50 p-4 sm:p-6 backdrop-blur-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-xs">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[var(--foreground)]">
              {periodLabel}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto sm:ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              aria-label="Previous Period"
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToday}
              className="h-8 px-2.5 text-xs font-medium"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              aria-label="Next Period"
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle Tabs */}
          <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--background)] p-0.5 text-xs font-medium">
            {(["month", "week", "day", "agenda"] as CalendarViewType[]).map(
              (v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onViewChange(v)}
                  className={`rounded-md px-3 py-1.5 capitalize transition-all ${
                    viewType === v
                      ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {v}
                </button>
              )
            )}
          </div>

          {/* Time Block Tasks Drawer Toggle */}
          <Button
            variant={isTimeBlockOpen ? "default" : "outline"}
            size="sm"
            onClick={onToggleTimeBlock}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Time Block</span>
          </Button>

          {/* New Event Button */}
          <Button
            size="sm"
            onClick={onNewEvent}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Event</span>
          </Button>
        </div>
      </div>

      {/* Non-blocking Advisory Conflict Banner if conflicts exist */}
      {conflictCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-amber-300/80 bg-amber-50/80 dark:border-amber-700/60 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-medium">
              Conflict Advisory: {conflictCount} overlapping commitment{conflictCount > 1 ? "s" : ""} detected in current view.
            </span>
          </div>
          <span className="text-[11px] opacity-75 hidden sm:inline">
            Non-blocking advisory
          </span>
        </div>
      )}
    </div>
  );
}
