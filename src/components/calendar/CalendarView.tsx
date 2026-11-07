"use client";

import * as React from "react";
import { CalendarEvent } from "@/modules/calendar/types";
import { Task } from "@/modules/tasks/types";
import {
  CalendarViewType,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfDay,
  getEndOfDay,
} from "@/modules/calendar/utils";
import { CalendarHeader } from "./CalendarHeader";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { AgendaView } from "./AgendaView";
import { EventModal } from "./EventModal";
import { TimeBlockDrawer } from "./TimeBlockDrawer";
import { Loader2 } from "lucide-react";

interface CalendarViewProps {
  initialEvents?: CalendarEvent[];
  initialTasks?: Task[];
}

export function CalendarView({
  initialEvents = [],
  initialTasks = [],
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date());
  const [viewType, setViewType] = React.useState<CalendarViewType>("month");
  const [events, setEvents] = React.useState<CalendarEvent[]>(initialEvents);
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = React.useState(false);

  // Auto-switch to Agenda view on mobile viewport for clarity
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setViewType("agenda");
    }
  }, []);

  // Modals & Panels state
  const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
  const [eventToEdit, setEventToEdit] = React.useState<CalendarEvent | null>(null);
  const [selectedSlotDate, setSelectedSlotDate] = React.useState<Date>(new Date());
  const [isTimeBlockOpen, setIsTimeBlockOpen] = React.useState(false);

  // Calculate range bounds based on active view and date
  const rangeBounds = React.useMemo(() => {
    switch (viewType) {
      case "day":
        return {
          from: getStartOfDay(currentDate).toISOString(),
          to: getEndOfDay(currentDate).toISOString(),
        };
      case "week":
        return {
          from: getStartOfWeek(currentDate).toISOString(),
          to: getEndOfWeek(currentDate).toISOString(),
        };
      case "month":
      case "agenda":
      default: {
        // Fetch slightly wider buffer (start of month - 7 days to end + 14 days) to cover month grid
        const start = getStartOfMonth(currentDate);
        start.setDate(start.getDate() - 7);
        const end = getEndOfMonth(currentDate);
        end.setDate(end.getDate() + 14);
        return {
          from: start.toISOString(),
          to: end.toISOString(),
        };
      }
    }
  }, [currentDate, viewType]);

  // Fetch events on mount or range change
  React.useEffect(() => {
    let isMounted = true;

    fetch(
      `/api/v1/calendar/events?from=${encodeURIComponent(
        rangeBounds.from
      )}&to=${encodeURIComponent(rangeBounds.to)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json && Array.isArray(json.data)) {
          setEvents(json.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [rangeBounds]);

  // Fetch tasks for time blocking drawer
  React.useEffect(() => {
    let isMounted = true;

    fetch(`/api/v1/tasks?status=todo,in_progress`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json && Array.isArray(json.data)) {
          setTasks(json.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshEvents = React.useCallback(() => {
    fetch(
      `/api/v1/calendar/events?from=${encodeURIComponent(
        rangeBounds.from
      )}&to=${encodeURIComponent(rangeBounds.to)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.data)) {
          setEvents(json.data);
        }
      })
      .catch(() => {});
  }, [rangeBounds]);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewType === "month") next.setMonth(next.getMonth() - 1);
      else if (viewType === "week") next.setDate(next.getDate() - 7);
      else if (viewType === "day") next.setDate(next.getDate() - 1);
      else next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewType === "month") next.setMonth(next.getMonth() + 1);
      else if (viewType === "week") next.setDate(next.getDate() + 7);
      else if (viewType === "day") next.setDate(next.getDate() + 1);
      else next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Event interaction handlers
  const handleOpenNewEvent = (initialSlot?: Date) => {
    setEventToEdit(null);
    setSelectedSlotDate(initialSlot || currentDate);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (event: CalendarEvent) => {
    setEventToEdit(event);
    setSelectedSlotDate(new Date(event.start_at));
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/calendar/events/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      // Ignore
    }
  };

  const handleScheduleTask = async (
    taskId: string,
    startAt: string,
    durationMinutes: number
  ) => {
    const res = await fetch(`/api/v1/calendar/schedule-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id: taskId,
        start_at: startAt,
        duration_minutes: durationMinutes,
        event_type: "focus",
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data?.event) {
        setEvents((prev) => [...prev, json.data.event]);
      }
      refreshEvents();
      fetch(`/api/v1/tasks?status=todo,in_progress`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j && Array.isArray(j.data)) setTasks(j.data);
        })
        .catch(() => {});
    }
  };

  // Compute total conflict count in active events
  const conflictCount = React.useMemo(() => {
    let count = 0;
    const timed = events.filter((e) => !e.all_day);
    for (let i = 0; i < timed.length; i++) {
      for (let j = i + 1; j < timed.length; j++) {
        const e1 = timed[i];
        const e2 = timed[j];
        if (e1 && e2 && e1.start_at < e2.end_at && e1.end_at > e2.start_at) {
          count++;
          break;
        }
      }
    }
    return count;
  }, [events]);

  return (
    <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
      {/* Calendar Header with View Switcher and Navigation */}
      <CalendarHeader
        currentDate={currentDate}
        viewType={viewType}
        onViewChange={setViewType}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onNewEvent={() => handleOpenNewEvent()}
        onToggleTimeBlock={() => setIsTimeBlockOpen((prev) => !prev)}
        isTimeBlockOpen={isTimeBlockOpen}
        conflictCount={conflictCount}
      />

      {/* Main View Area */}
      <div className="flex-1 p-4 sm:p-6 relative">
        {isLoading && (
          <div className="absolute top-8 right-8 z-30 flex items-center gap-1.5 rounded-full bg-[var(--card)] px-3 py-1 shadow-sm border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Updating...</span>
          </div>
        )}

        {viewType === "month" && (
          <MonthView
            currentDate={currentDate}
            events={events}
            onSelectEvent={handleOpenEditEvent}
            onSelectDay={(day) => {
              setCurrentDate(day);
              handleOpenNewEvent(day);
            }}
          />
        )}

        {viewType === "week" && (
          <WeekView
            currentDate={currentDate}
            events={events}
            onSelectEvent={handleOpenEditEvent}
            onSelectTimeSlot={(day, hour) => {
              const d = new Date(day);
              d.setHours(hour, 0, 0, 0);
              setCurrentDate(d);
              handleOpenNewEvent(d);
            }}
          />
        )}

        {viewType === "day" && (
          <DayView
            currentDate={currentDate}
            events={events}
            onSelectEvent={handleOpenEditEvent}
            onSelectHour={(hour) => {
              const d = new Date(currentDate);
              d.setHours(hour, 0, 0, 0);
              handleOpenNewEvent(d);
            }}
          />
        )}

        {viewType === "agenda" && (
          <AgendaView
            events={events}
            onSelectEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onNewEvent={() => handleOpenNewEvent()}
          />
        )}
      </div>

      {/* Event Create / Edit Dialog Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSaved={refreshEvents}
        eventToEdit={eventToEdit}
        initialDate={selectedSlotDate}
        tasks={tasks}
      />

      {/* Time Block Tasks Drawer */}
      <TimeBlockDrawer
        isOpen={isTimeBlockOpen}
        onClose={() => setIsTimeBlockOpen(false)}
        tasks={tasks}
        currentDate={currentDate}
        onScheduleTask={handleScheduleTask}
      />
    </div>
  );
}
