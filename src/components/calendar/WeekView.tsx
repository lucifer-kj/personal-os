"use client";

import * as React from "react";
import { CalendarEvent } from "@/modules/calendar/types";
import {
  getWeekDays,
  isSameDay,
  formatTime,
  getEventTypeBadge,
} from "@/modules/calendar/utils";
import { AlertTriangle, Clock } from "lucide-react";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectTimeSlot: (date: Date, hour: number) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 AM to 10:00 PM (22:00)
const HOUR_HEIGHT = 60; // px per hour

export function WeekView({
  currentDate,
  events,
  onSelectEvent,
  onSelectTimeSlot,
}: WeekViewProps) {
  const weekDays = React.useMemo(() => getWeekDays(currentDate), [currentDate]);
  const today = React.useMemo(() => new Date(), []);

  // Filter events per day
  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const d of weekDays) {
      const key = d.toISOString().slice(0, 10);
      map.set(
        key,
        events.filter((e) => e.start_at.slice(0, 10) === key)
      );
    }
    return map;
  }, [weekDays, events]);

  return (
    <div className="flex flex-col flex-1 border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)] shadow-xs">
      {/* Week Header Row */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[var(--border)] bg-[var(--muted)]/20 text-center py-2.5">
        <div className="text-xs font-mono text-[var(--muted-foreground)] flex items-center justify-center">
          <Clock className="h-3.5 w-3.5 opacity-50" />
        </div>
        {weekDays.map((day, idx) => {
          const isToday = isSameDay(day, today);
          return (
            <div key={idx} className="flex flex-col items-center gap-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-medium ${
                  isToday
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-xs"
                    : "text-[var(--foreground)]"
                }`}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hourly Grid */}
      <div className="relative overflow-y-auto max-h-[680px]">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
          {/* Time Labels Column */}
          <div className="flex flex-col border-r border-[var(--border)] bg-[var(--muted)]/5 select-none">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: `${HOUR_HEIGHT}px` }}
                className="pr-2 pt-1 text-right text-[11px] font-mono text-[var(--muted-foreground)] border-b border-[var(--border)]/50"
              >
                {hour === 12
                  ? "12 PM"
                  : hour > 12
                  ? `${hour - 12} PM`
                  : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* 7 Day Columns */}
          {weekDays.map((day, dayIdx) => {
            const dayKey = day.toISOString().slice(0, 10);
            const dayEvents = eventsByDay.get(dayKey) || [];

            return (
              <div
                key={dayIdx}
                className="relative border-r border-[var(--border)] last:border-r-0"
              >
                {/* Hourly Background Clickable Slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    onClick={() => onSelectTimeSlot(day, hour)}
                    className="border-b border-[var(--border)]/50 hover:bg-[var(--accent)]/30 cursor-pointer transition-colors"
                  />
                ))}

                {/* Event Blocks Overlay */}
                {dayEvents.map((event) => {
                  if (event.all_day) return null;

                  const s = new Date(event.start_at);
                  const e = new Date(event.end_at);
                  const startHour = s.getUTCHours() + s.getUTCMinutes() / 60;
                  const endHour = e.getUTCHours() + e.getUTCMinutes() / 60;

                  // Bound within 7:00 to 23:00
                  const top = Math.max(0, (startHour - 7) * HOUR_HEIGHT);
                  const height = Math.max(
                    26,
                    (endHour - startHour) * HOUR_HEIGHT
                  );

                  // Detect if this event has conflict on this day
                  const hasConflict = dayEvents.some(
                    (other) =>
                      other.id !== event.id &&
                      !other.all_day &&
                      event.start_at < other.end_at &&
                      event.end_at > other.start_at
                  );

                  const badge = getEventTypeBadge(event.event_type);

                  return (
                    <div
                      key={event.id}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        onSelectEvent(event);
                      }}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                      }}
                      className={`absolute left-1 right-1 rounded-md p-1.5 border text-xs shadow-xs cursor-pointer overflow-hidden transition-all hover:scale-[1.01] hover:z-20 ${badge.pillClasses}`}
                    >
                      <div className="flex items-center justify-between gap-1 leading-tight">
                        <span className="font-medium truncate text-[11px]">
                          {event.title}
                        </span>
                        {hasConflict && (
                          <span
                            title="Conflict advisory: Overlapping schedule"
                            className="flex items-center text-amber-600 shrink-0"
                          >
                            <AlertTriangle className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono opacity-80 mt-0.5 truncate">
                        {formatTime(event.start_at)} – {formatTime(event.end_at)}
                      </div>
                      {event.location && height > 45 && (
                        <div className="text-[10px] opacity-75 truncate mt-0.5">
                          {event.location}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
