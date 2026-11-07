"use client";

import * as React from "react";
import { CalendarEvent } from "@/modules/calendar/types";
import {
  formatTime,
  formatEventDuration,
  getEventTypeBadge,
} from "@/modules/calendar/utils";
import {
  Clock,
  MapPin,
  AlertTriangle,
  CheckSquare,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectHour: (hour: number) => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM
const HOUR_HEIGHT = 70; // px per hour

export function DayView({
  currentDate,
  events,
  onSelectEvent,
  onSelectHour,
}: DayViewProps) {
  const dayKey = currentDate.toISOString().slice(0, 10);
  const dayEvents = React.useMemo(
    () => events.filter((e) => e.start_at.slice(0, 10) === dayKey),
    [events, dayKey]
  );

  const allDayEvents = dayEvents.filter((e) => e.all_day);
  const timedEvents = dayEvents.filter((e) => !e.all_day);

  return (
    <div className="flex flex-col flex-1 border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)] shadow-xs">
      {/* Day Overview Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)]/20 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
              {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
            </span>
            <span className="text-lg font-serif font-medium text-[var(--foreground)]">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--muted-foreground)]">
            {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"} scheduled
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectHour(9)}
            className="h-8 gap-1 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add to Day
          </Button>
        </div>
      </div>

      {/* All-Day Events Strip */}
      {allDayEvents.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)]/10 px-6 py-2.5">
          <span className="text-xs font-mono text-[var(--muted-foreground)] uppercase">
            All Day:
          </span>
          {allDayEvents.map((event) => {
            const badge = getEventTypeBadge(event.event_type);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium border shadow-2xs ${badge.pillClasses}`}
              >
                {event.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Hourly Timeline */}
      <div className="relative overflow-y-auto max-h-[700px] p-4 sm:p-6">
        <div className="relative grid grid-cols-[70px_1fr] divide-x divide-[var(--border)]">
          {/* Time Labels */}
          <div className="flex flex-col select-none pr-3">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: `${HOUR_HEIGHT}px` }}
                className="text-right text-xs font-mono text-[var(--muted-foreground)]"
              >
                {hour === 12
                  ? "12:00 PM"
                  : hour > 12
                  ? `${hour - 12}:00 PM`
                  : `${hour}:00 AM`}
              </div>
            ))}
          </div>

          {/* Time Slots Area */}
          <div className="relative pl-3">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: `${HOUR_HEIGHT}px` }}
                onClick={() => onSelectHour(hour)}
                className="border-b border-[var(--border)]/40 hover:bg-[var(--accent)]/30 cursor-pointer transition-colors relative group"
              >
                <span className="absolute right-2 top-1 text-[10px] font-mono text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity">
                  + Add at {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </span>
              </div>
            ))}

            {/* Positioned Event Cards */}
            {timedEvents.map((event) => {
              const s = new Date(event.start_at);
              const e = new Date(event.end_at);
              const startHour = s.getUTCHours() + s.getUTCMinutes() / 60;
              const endHour = e.getUTCHours() + e.getUTCMinutes() / 60;

              const top = Math.max(0, (startHour - 6) * HOUR_HEIGHT);
              const height = Math.max(
                45,
                (endHour - startHour) * HOUR_HEIGHT
              );

              const hasConflict = timedEvents.some(
                (other) =>
                  other.id !== event.id &&
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
                  className={`absolute left-4 right-4 rounded-lg p-3 border shadow-xs cursor-pointer transition-all hover:scale-[1.005] hover:shadow-md z-10 flex flex-col justify-between overflow-hidden ${badge.pillClasses}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">
                          {event.title}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-medium border ${badge.badgeClasses}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {hasConflict && (
                        <div
                          title="Overlapping schedule conflict advisory"
                          className="flex items-center gap-1 rounded bg-amber-200/80 px-2 py-0.5 text-[11px] font-medium text-amber-900 border border-amber-300"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span>Conflict</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs opacity-80 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.start_at)} – {formatTime(event.end_at)} (
                        {formatEventDuration(event.start_at, event.end_at)})
                      </span>

                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}

                      {event.task_id && (
                        <span className="flex items-center gap-1 text-[var(--primary)] font-medium">
                          <CheckSquare className="h-3 w-3" />
                          Linked Task
                        </span>
                      )}
                    </div>
                  </div>

                  {event.description && height > 80 && (
                    <p className="text-xs opacity-75 line-clamp-2 mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
