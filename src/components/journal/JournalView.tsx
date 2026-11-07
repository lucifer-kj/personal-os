"use client";

import * as React from "react";
import { JournalEntry, JournalMood } from "@/modules/journal/types";
import { JournalCalendarStrip } from "./JournalCalendarStrip";
import { JournalEditor } from "./JournalEditor";
import { JournalHistory } from "./JournalHistory";

interface JournalViewProps {
  initialEntries?: JournalEntry[];
  initialTodayEntry?: JournalEntry | null;
}

export function JournalView({
  initialEntries = [],
  initialTodayEntry = null,
}: JournalViewProps) {
  const [entries, setEntries] = React.useState<JournalEntry[]>(() => {
    if (initialTodayEntry && !initialEntries.some((e) => e.id === initialTodayEntry.id)) {
      return [initialTodayEntry, ...initialEntries];
    }
    return initialEntries;
  });

  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const entriesDates = React.useMemo(() => {
    return new Set(entries.map((e) => e.entry_date));
  }, [entries]);

  const activeEntry = React.useMemo(() => {
    return entries.find((e) => e.entry_date === selectedDate) || null;
  }, [entries, selectedDate]);

  // When selectedDate changes and not in cache, fetch asynchronously
  React.useEffect(() => {
    const isPresent = entries.some((e) => e.entry_date === selectedDate);
    if (!isPresent) {
      fetch(`/api/v1/journal?date=${selectedDate}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data) {
            setEntries((prev) => {
              if (prev.some((e) => e.id === json.data.id)) return prev;
              return [...prev, json.data].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
            });
          }
        })
        .catch(() => {});
    }
  }, [selectedDate, entries]);

  const handleSave = async (payload: {
    entry_date: string;
    title?: string;
    content?: string;
    mood?: JournalMood | null;
    energy_level?: number | null;
    reflection?: string;
    gratitude?: string[];
  }) => {
    const res = await fetch("/api/v1/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      const saved: JournalEntry = json.data;

      setEntries((prev) => {
        const filtered = prev.filter((e) => e.id !== saved.id && e.entry_date !== saved.entry_date);
        return [saved, ...filtered].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h1 className="text-3xl font-serif font-medium text-[var(--foreground)] tracking-tight">
          Reflective Journal & Mind
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1 font-serif italic">
          A calm sanctuary for gratitude, observations, and honest self-inquiry.
        </p>
      </div>

      {/* Date Navigation Strip */}
      <JournalCalendarStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        entriesDates={entriesDates}
      />

      {/* Editor & History Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JournalEditor
            key={selectedDate}
            entry={activeEntry}
            selectedDate={selectedDate}
            onSave={handleSave}
          />
        </div>

        <div className="lg:col-span-1">
          <JournalHistory
            entries={entries}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>
    </div>
  );
}
