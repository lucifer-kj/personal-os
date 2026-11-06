export type SessionMode =
  | "deep_work"
  | "pomodoro"
  | "short_break"
  | "long_break"
  | "custom";

export type SessionStatus = "running" | "paused" | "completed" | "abandoned";

export type EntryType = "focus" | "manual" | "break" | "meeting";

export interface TimeEntry {
  id: string;
  user_id: string;
  task_id: string | null;
  project_id: string | null;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  entry_type: EntryType;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  time_entry_id: string;
  session_mode: SessionMode;
  status: SessionStatus;
  planned_duration_seconds: number | null;
  paused_duration_seconds: number;
  paused_at: string | null;
  interruption_count: number;
  session_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActiveFocusSession {
  session: FocusSession;
  timeEntry: TimeEntry;
  elapsed_seconds: number;
  remaining_seconds: number | null;
}

export interface StartFocusSessionDTO {
  user_id: string;
  task_id?: string | null;
  project_id?: string | null;
  description?: string | null;
  session_mode?: SessionMode;
  planned_duration_seconds?: number | null;
}

export interface CompleteFocusSessionDTO {
  session_rating?: number | null;
  notes?: string | null;
  mark_task_completed?: boolean;
}

export interface IFocusRepository {
  createSession(
    timeEntryData: Omit<TimeEntry, "id" | "created_at" | "updated_at">,
    sessionData: Omit<FocusSession, "id" | "time_entry_id" | "created_at" | "updated_at">
  ): Promise<{ timeEntry: TimeEntry; session: FocusSession }>;

  getActiveSession(userId: string): Promise<{ timeEntry: TimeEntry; session: FocusSession } | null>;

  getSessionById(sessionId: string, userId: string): Promise<{ timeEntry: TimeEntry; session: FocusSession } | null>;

  updateSession(
    sessionId: string,
    userId: string,
    updates: Partial<FocusSession>
  ): Promise<FocusSession>;

  updateTimeEntry(
    timeEntryId: string,
    userId: string,
    updates: Partial<TimeEntry>
  ): Promise<TimeEntry>;

  listRecentSessions(
    userId: string,
    limit?: number
  ): Promise<Array<{ session: FocusSession; timeEntry: TimeEntry }>>;
}
