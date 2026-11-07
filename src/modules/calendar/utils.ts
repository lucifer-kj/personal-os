import { EventType } from "./types";

export type CalendarViewType = "month" | "week" | "day" | "agenda";

export function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfWeek(date: Date, weekStartsOn: 0 | 1 = 1): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  return d;
}

export function getEndOfWeek(date: Date, weekStartsOn: 0 | 1 = 1): Date {
  const start = getStartOfWeek(date, weekStartsOn);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getMonthGridDays(currentDate: Date): Date[] {
  const startOfMonth = getStartOfMonth(currentDate);
  const startDay = startOfMonth.getDay(); // 0 is Sun
  // Monday start: 0(Sun) -> 6, 1(Mon) -> 0, etc.
  const offset = (startDay + 6) % 7;

  const firstGridDate = new Date(startOfMonth);
  firstGridDate.setDate(firstGridDate.getDate() - offset);
  firstGridDate.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(firstGridDate);
    day.setDate(firstGridDate.getDate() + i);
    days.push(day);
  }
  return days;
}

export function getWeekDays(date: Date): Date[] {
  const start = getStartOfWeek(date, 1);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatEventDuration(startAt: string, endAt: string): string {
  const diffMinutes = Math.round(
    (new Date(endAt).getTime() - new Date(startAt).getTime()) / (60 * 1000)
  );
  if (diffMinutes >= 60) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${diffMinutes}m`;
}

export function getEventTypeBadge(type: EventType): {
  label: string;
  pillClasses: string;
  badgeClasses: string;
} {
  switch (type) {
    case "focus":
      return {
        label: "Focus Block",
        pillClasses: "bg-amber-500/15 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800",
        badgeClasses: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
      };
    case "meeting":
      return {
        label: "Meeting",
        pillClasses: "bg-blue-500/15 text-blue-900 border-blue-300 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800",
        badgeClasses: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
      };
    case "reminder":
      return {
        label: "Reminder",
        pillClasses: "bg-rose-500/15 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800",
        badgeClasses: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
      };
    case "external":
      return {
        label: "External",
        pillClasses: "bg-stone-500/15 text-stone-900 border-stone-300 dark:bg-stone-800/60 dark:text-stone-200 dark:border-stone-700",
        badgeClasses: "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300",
      };
    case "personal":
    default:
      return {
        label: "Personal",
        pillClasses: "bg-emerald-500/15 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
        badgeClasses: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
      };
  }
}
