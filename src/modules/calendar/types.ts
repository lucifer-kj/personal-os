export type EventType =
  | "personal"
  | "focus"
  | "meeting"
  | "reminder"
  | "external";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  start_at: string; // ISO 8601 UTC string
  end_at: string; // ISO 8601 UTC string
  all_day: boolean;
  timezone: string;
  location: string | null;
  project_id: string | null;
  task_id: string | null;
  meeting_id: string | null;
  source_provider: string | null;
  source_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCalendarEventDTO {
  user_id: string;
  title: string;
  description?: string | null;
  event_type?: EventType;
  start_at: string;
  end_at: string;
  all_day?: boolean;
  timezone?: string;
  location?: string | null;
  project_id?: string | null;
  task_id?: string | null;
  meeting_id?: string | null;
  source_provider?: string | null;
  source_event_id?: string | null;
}

export interface UpdateCalendarEventDTO {
  title?: string;
  description?: string | null;
  event_type?: EventType;
  start_at?: string;
  end_at?: string;
  all_day?: boolean;
  timezone?: string;
  location?: string | null;
  project_id?: string | null;
  task_id?: string | null;
}

export interface MoveCalendarEventDTO {
  start_at: string;
  end_at: string;
}

export interface CalendarEventFilters {
  from?: string; // ISO timestamp
  to?: string; // ISO timestamp
  event_type?: EventType;
  project_id?: string;
  task_id?: string;
}

export interface ConflictAdvisory {
  has_conflict: boolean;
  conflicting_events: CalendarEvent[];
}

export interface ICalendarRepository {
  findMany(
    userId: string,
    filters?: CalendarEventFilters
  ): Promise<CalendarEvent[]>;

  findById(userId: string, id: string): Promise<CalendarEvent | null>;

  create(data: CreateCalendarEventDTO): Promise<CalendarEvent>;

  update(
    userId: string,
    id: string,
    data: UpdateCalendarEventDTO
  ): Promise<CalendarEvent>;

  move(
    userId: string,
    id: string,
    data: MoveCalendarEventDTO
  ): Promise<CalendarEvent>;

  delete(userId: string, id: string): Promise<boolean>;

  detectConflicts(
    userId: string,
    startAt: string,
    endAt: string,
    excludeEventId?: string
  ): Promise<CalendarEvent[]>;
}
