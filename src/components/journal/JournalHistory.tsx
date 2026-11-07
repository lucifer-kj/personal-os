"use client";

import * as React from "react";
import { JournalEntry } from "@/modules/journal/types";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Smile, Meh, Frown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalHistoryProps {
  entries: JournalEntry[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function JournalHistory({
  entries,
  selectedDate,
  onSelectDate,
}: JournalHistoryProps) {
  const getMoodIcon = (mood: string | null) => {
    switch (mood) {
      case "great":
      case "good":
        return <Smile className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
      case "neutral":
        return <Meh className="h-3.5 w-3.5 text-amber-500" />;
      case "low":
      case "rough":
        return <Frown className="h-3.5 w-3.5 text-rose-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <BookOpen className="h-4 w-4 text-[var(--primary)]" />
        <h3 className="font-serif font-medium text-base text-[var(--foreground)]">
          Recent Reflections
        </h3>
        <span className="text-xs font-mono text-[var(--muted-foreground)]">
          ({entries.length})
        </span>
      </div>

      <div className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-xs text-[var(--muted-foreground)] italic p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-center">
            No reflections recorded yet. Select any date on the timeline above to begin.
          </p>
        ) : (
          entries.map((entry) => {
            const isSelected = entry.entry_date === selectedDate;
            const formattedDate = new Date(entry.entry_date + "T12:00:00Z").toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            );

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelectDate(entry.entry_date)}
                className={cn(
                  "w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer group",
                  isSelected
                    ? "bg-[var(--card)] border-[var(--primary)] shadow-xs ring-1 ring-[var(--primary)]/20"
                    : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/40"
                )}
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-medium text-[var(--primary)]">
                      {formattedDate}
                    </span>

                    {entry.mood && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 flex items-center gap-1 font-mono capitalize"
                      >
                        {getMoodIcon(entry.mood)}
                        <span>{entry.mood}</span>
                      </Badge>
                    )}

                    {entry.energy_level !== null && (
                      <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                        ⚡ {entry.energy_level}/5
                      </span>
                    )}
                  </div>

                  <p className="font-serif text-sm font-medium text-[var(--foreground)] truncate">
                    {entry.title || "Untitled Entry"}
                  </p>

                  {entry.content && (
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                      {entry.content}
                    </p>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
