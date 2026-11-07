"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  X,
  Calendar,
  MapPin,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";
import { CalendarEvent, EventType } from "@/modules/calendar/types";
import { Task } from "@/modules/tasks/types";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  eventToEdit?: CalendarEvent | null;
  initialDate?: Date;
  tasks?: Task[];
}

export function EventModal({
  isOpen,
  onClose,
  onSaved,
  eventToEdit,
  initialDate,
  tasks = [],
}: EventModalProps) {
  const isEditing = Boolean(eventToEdit);

  // Form states
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [eventType, setEventType] = React.useState<EventType>("personal");
  const [allDay, setAllDay] = React.useState(false);
  const [startDate, setStartDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endDate, setEndDate] = React.useState("");
  const [endTime, setEndTime] = React.useState("10:00");
  const [location, setLocation] = React.useState("");
  const [taskId, setTaskId] = React.useState<string>("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Live conflict advisory state
  const [conflictList, setConflictList] = React.useState<CalendarEvent[]>([]);

  // Form sync state during render when opened or eventToEdit changes
  const [prevOpen, setPrevOpen] = React.useState(isOpen);
  const [prevEventId, setPrevEventId] = React.useState<string | null>(null);

  const currentEventId = eventToEdit?.id ?? null;
  if (isOpen !== prevOpen || currentEventId !== prevEventId) {
    setPrevOpen(isOpen);
    setPrevEventId(currentEventId);
    if (isOpen) {
      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setDescription(eventToEdit.description || "");
        setEventType(eventToEdit.event_type);
        setAllDay(eventToEdit.all_day);
        setLocation(eventToEdit.location || "");
        setTaskId(eventToEdit.task_id || "");

        const s = new Date(eventToEdit.start_at);
        const e = new Date(eventToEdit.end_at);

        setStartDate(s.toISOString().slice(0, 10));
        setStartTime(s.toTimeString().slice(0, 5));
        setEndDate(e.toISOString().slice(0, 10));
        setEndTime(e.toTimeString().slice(0, 5));
      } else {
        const baseDate = initialDate || new Date();
        const dateStr = baseDate.toISOString().slice(0, 10);
        setTitle("");
        setDescription("");
        setEventType("personal");
        setAllDay(false);
        setStartDate(dateStr);
        setStartTime("09:00");
        setEndDate(dateStr);
        setEndTime("10:00");
        setLocation("");
        setTaskId("");
      }
      setConflictList([]);
      setFormError(null);
    }
  }

  // Debounced conflict checker
  React.useEffect(() => {
    if (!isOpen || allDay || !startDate || !endDate) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const startIso = new Date(`${startDate}T${startTime}:00Z`).toISOString();
        const endIso = new Date(`${endDate}T${endTime}:00Z`).toISOString();

        if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
          return;
        }

        const excludeParam = eventToEdit ? `&exclude_id=${eventToEdit.id}` : "";
        const res = await fetch(
          `/api/v1/calendar/conflicts?start_at=${encodeURIComponent(
            startIso
          )}&end_at=${encodeURIComponent(endIso)}${excludeParam}`
        );

        if (res.ok) {
          const json = await res.json();
          if (json.data?.conflicting_events) {
            setConflictList(json.data.conflicting_events);
          } else {
            setConflictList([]);
          }
        }
      } catch {
        // Ignore advisory check error
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isOpen, allDay, startDate, startTime, endDate, endTime, eventToEdit]);

  // Global escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Event title is required");
      return;
    }

    const startIso = allDay
      ? new Date(`${startDate}T00:00:00Z`).toISOString()
      : new Date(`${startDate}T${startTime}:00Z`).toISOString();

    const endIso = allDay
      ? new Date(`${endDate}T23:59:59Z`).toISOString()
      : new Date(`${endDate}T${endTime}:00Z`).toISOString();

    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      setFormError("End time must be after start time");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        event_type: eventType,
        start_at: startIso,
        end_at: endIso,
        all_day: allDay,
        location: location.trim() || null,
        task_id: taskId || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      };

      const url = isEditing
        ? `/api/v1/calendar/events/${eventToEdit!.id}`
        : `/api/v1/calendar/events`;

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Failed to save event");
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToEdit) return;
    if (!confirm("Are you sure you want to delete this event?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/calendar/events/${eventToEdit.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete event");
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <Card className="w-full max-w-lg bg-[var(--card)] border-[var(--border)] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="font-serif text-lg font-medium text-[var(--foreground)]">
              {isEditing ? "Edit Event" : "Create Calendar Event"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          {/* Live Non-blocking Conflict Advisory Warning */}
          {conflictList.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50/90 dark:border-amber-700 dark:bg-amber-950/40 p-3 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Conflict Advisory:</span> This time window overlaps with:
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  {conflictList.map((c) => (
                    <li key={c.id}>
                      <span className="font-medium">{c.title}</span> ({new Date(c.start_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – {new Date(c.end_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })})
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-[11px] opacity-75">
                  You can still save this event; Personal OS will note the conflict advisories.
                </p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Design Review, Deep Work"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-hidden focus:ring-1 focus:ring-[var(--primary)]"
              autoFocus
            />
          </div>

          {/* Event Type & All Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-hidden focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="personal">Personal</option>
                <option value="focus">Focus Block</option>
                <option value="meeting">Meeting</option>
                <option value="reminder">Reminder</option>
                <option value="external">External</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--foreground)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                All-Day Event
              </label>
            </div>
          </div>

          {/* Start and End Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Start Date {!allDay && "& Time"}
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate < e.target.value) setEndDate(e.target.value);
                  }}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
                />
                {!allDay && (
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-24 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                End Date {!allDay && "& Time"}
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
                />
                {!allDay && (
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-24 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
              Location / Video URL
            </label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Office, Room 4, or Zoom link"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-8 pr-3 py-2 text-sm text-[var(--foreground)] focus:outline-hidden focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          {/* Link to Task */}
          {tasks.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Link to Task (Time Blocking)
              </label>
              <select
                value={taskId}
                onChange={(e) => {
                  setTaskId(e.target.value);
                  if (e.target.value && !title) {
                    const matched = tasks.find((t) => t.id === e.target.value);
                    if (matched) setTitle(matched.title);
                  }
                }}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-hidden focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">No linked task</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} {t.priority === "urgent" ? "(!)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda items or context..."
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-hidden focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            {isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                )}
                Delete
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="gap-1.5"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
