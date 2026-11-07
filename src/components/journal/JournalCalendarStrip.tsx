"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalCalendarStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  entriesDates: Set<string>;
}

export function JournalCalendarStrip({
  selectedDate,
  onSelectDate,
  entriesDates,
}: JournalCalendarStripProps) {
  // Generate 14 days ending today or around selected date
  const days = React.useMemo(() => {
    const list: { date: string; dayNum: number; dayLabel: string; isToday: boolean }[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });
      const dayNum = d.getDate();

      list.push({
        date: iso,
        dayNum,
        dayLabel,
        isToday: iso === todayStr,
      });
    }
    return list;
  }, []);

  const handlePrev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split("T")[0]);
  };

  const handleNext = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (selectedDate >= todayStr) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const nextIso = d.toISOString().split("T")[0];
    if (nextIso <= todayStr) {
      onSelectDate(nextIso);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const isSelectedToday = selectedDate === todayStr;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          className="h-8 w-8 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          aria-label="Previous Day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1.5 px-2">
          <CalendarIcon className="h-4 w-4 text-[var(--primary)]" />
          <span className="font-serif font-medium text-sm text-[var(--foreground)]">
            {new Date(selectedDate + "T12:00:00Z").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {isSelectedToday && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
              Today
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={isSelectedToday}
          className="h-8 w-8 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          aria-label="Next Day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Date pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {days.map((item) => {
          const isSelected = item.date === selectedDate;
          const hasEntry = entriesDates.has(item.date);

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => onSelectDate(item.date)}
              className={cn(
                "flex flex-col items-center justify-center min-w-9 h-11 px-2 rounded-lg border transition-all cursor-pointer",
                isSelected
                  ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-xs"
                  : "bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/40",
                item.isToday && !isSelected && "border-[var(--primary)]/50"
              )}
            >
              <span
                className={cn(
                  "text-[9px] font-mono leading-none",
                  isSelected ? "text-white/80" : "text-[var(--muted-foreground)]"
                )}
              >
                {item.dayLabel}
              </span>
              <span className="text-xs font-semibold leading-tight mt-0.5">
                {item.dayNum}
              </span>

              {/* Dot indicator */}
              <div
                className={cn(
                  "h-1 w-1 rounded-full mt-0.5",
                  isSelected
                    ? "bg-white"
                    : hasEntry
                    ? "bg-[var(--primary)]"
                    : "bg-transparent"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
