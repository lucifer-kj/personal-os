"use client";

import * as React from "react";
import { CalendarEvent } from "@/modules/calendar/types";
import {
  getMonthGridDays,
  isSameDay,
  formatTime,
  getEventTypeBadge,
} from "@/modules/calendar/utils";
import { AlertCircle } from "lucide-react";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDay: (date: Date) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthView({
  currentDate,
  events,
  onSelectEvent,
  onSelectDay,
}: MonthViewProps) {
  const days = React.useMemo(
    () => getMonthGridDays(currentDate),
    [currentDate]
  );
  const today = React.useMemo(() => new Date(), []);
  const currentMonthIdx = currentDate.getMonth();

  // Group events by YYYY-MM-DD
  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const dayKey = e.start_at.slice(0, 10);
      if (!map.has(dayKey)) {
        map.set(dayKey, []);
      }
      map.get(dayKey)!.push(e);
    }
    return map;
  }, [events]);

  return (
    <div className="flex flex-col flex-1 min-h-[640px] border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)] shadow-xs">
      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--muted)]/20 text-center py-2 text-xs font-mono font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* 42-day Month Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-[var(--border)]">
        {days.map((day, idx) => {
          const isToday = isSameDay(day, today);
          const isCurrentMonth = day.getMonth() === currentMonthIdx;
          const dayKey = day.toISOString().slice(0, 10);
          const dayEvents = eventsByDay.get(dayKey) || [];

          // Detect if any 2 events overlap on this day
          const hasDayConflict = dayEvents.some((e1, i) =>
            dayEvents.slice(i + 1).some((e2) => {
              if (e1.all_day || e2.all_day) return false;
              return e1.start_at < e2.end_at && e1.end_at > e2.start_at;
            })
          );

          return (
            <div
              key={idx}
              onClick={() => onSelectDay(day)}
              className={`min-h-[105px] p-1.5 sm:p-2 transition-colors flex flex-col justify-between group cursor-pointer hover:bg-[var(--accent)]/30 ${
                !isCurrentMonth ? "bg-[var(--muted)]/5 opacity-40" : ""
              } ${isToday ? "bg-[var(--primary)]/5" : ""}`}
            >
              {/* Day Number & Conflict indicator */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-medium transition-transform group-hover:scale-105 ${
                    isToday
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-xs"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {day.getDate()}
                </span>

                {hasDayConflict && (
                  <span
                    title="Overlapping schedule conflict"
                    className="flex items-center text-amber-600 dark:text-amber-400"
                  >
                    <AlertCircle className="h-3 w-3" />
                  </span>
                )}
              </div>

              {/* Event Chips */}
              <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => {
                  const badge = getEventTypeBadge(event.event_type);
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className={`w-full text-left truncate rounded px-1.5 py-0.5 text-[11px] font-medium border leading-tight transition-transform hover:scale-[1.02] shadow-2xs ${badge.pillClasses}`}
                    >
                      {!event.all_day && (
                        <span className="font-mono text-[10px] opacity-75 mr-1">
                          {formatTime(event.start_at)}
                        </span>
                      )}
                      <span>{event.title}</span>
                    </button>
                  );
                })}

                {dayEvents.length > 3 && (
                  <span className="text-[10px] font-mono font-medium text-[var(--muted-foreground)] px-1">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
