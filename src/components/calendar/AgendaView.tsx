"use client";

import * as React from "react";
import { CalendarEvent } from "@/modules/calendar/types";
import {
  formatTime,
  formatEventDuration,
  getEventTypeBadge,
  isSameDay,
} from "@/modules/calendar/utils";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlertTriangle,
  CheckSquare,
  Edit2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgendaViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onNewEvent: () => void;
}

export function AgendaView({
  events,
  onSelectEvent,
  onDeleteEvent,
  onNewEvent,
}: AgendaViewProps) {
  const today = React.useMemo(() => new Date(), []);

  // Group events by YYYY-MM-DD
  const groupedEvents = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const key = e.start_at.slice(0, 10);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(e);
    }
    // Sort chronological
    return Array.from(map.entries()).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    );
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-[var(--border)] rounded-xl bg-[var(--card)] p-8 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
          <CalendarIcon className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-lg font-medium text-[var(--foreground)]">
          No Scheduled Events
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] max-w-sm mt-1 mb-6">
          Your schedule is completely clear for this period. Enjoy the calm uninterrupted focus or time-block your priority tasks.
        </p>
        <Button onClick={onNewEvent} size="sm" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Schedule Event
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groupedEvents.map(([dateStr, dayEvents]) => {
        const dateObj = new Date(`${dateStr}T12:00:00Z`);
        const isToday = isSameDay(dateObj, today);

        return (
          <div
            key={dateStr}
            className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)] shadow-xs"
          >
            {/* Date Group Header */}
            <div
              className={`flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5 ${
                isToday
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "bg-[var(--muted)]/20 text-[var(--foreground)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                  {dateObj.toLocaleDateString("en-US", { weekday: "short" })},
                </span>
                <span className="font-serif font-medium text-sm">
                  {dateObj.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {isToday && (
                  <span className="rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
                    Today
                  </span>
                )}
              </div>

              <span className="text-xs font-mono text-[var(--muted-foreground)]">
                {dayEvents.length} item{dayEvents.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Day Events List */}
            <div className="divide-y divide-[var(--border)]">
              {dayEvents.map((event) => {
                const badge = getEventTypeBadge(event.event_type);
                const hasConflict = dayEvents.some(
                  (other) =>
                    other.id !== event.id &&
                    !event.all_day &&
                    !other.all_day &&
                    event.start_at < other.end_at &&
                    event.end_at > other.start_at
                );

                return (
                  <div
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-[var(--accent)]/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium border ${badge.badgeClasses}`}
                        >
                          {badge.label}
                        </span>

                        <h4 className="font-medium text-sm text-[var(--foreground)] truncate">
                          {event.title}
                        </h4>

                        {hasConflict && (
                          <span
                            title="Overlapping schedule conflict advisory"
                            className="inline-flex items-center gap-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 px-1.5 py-0.5 text-[10px] font-medium"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Conflict Advisory
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3.5 w-3.5" />
                          {event.all_day ? (
                            "All Day"
                          ) : (
                            <>
                              {formatTime(event.start_at)} –{" "}
                              {formatTime(event.end_at)} (
                              {formatEventDuration(
                                event.start_at,
                                event.end_at
                              )}
                              )
                            </>
                          )}
                        </span>

                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </span>
                        )}

                        {event.task_id && (
                          <span className="flex items-center gap-1 text-[var(--primary)] font-medium">
                            <CheckSquare className="h-3.5 w-3.5" />
                            Linked to Task
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 self-end sm:self-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm("Are you sure you want to delete this event?")
                          ) {
                            onDeleteEvent(event.id);
                          }
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
