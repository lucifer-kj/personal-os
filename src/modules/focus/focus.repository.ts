import { SupabaseClient } from "@supabase/supabase-js";
import { InfrastructureError } from "@/lib/errors";
import {
  FocusSession,
  TimeEntry,
  IFocusRepository,
} from "./types";

export class InMemoryFocusRepository implements IFocusRepository {
  private timeEntries: Map<string, TimeEntry> = new Map();
  private focusSessions: Map<string, FocusSession> = new Map();

  async createSession(
    timeEntryData: Omit<TimeEntry, "id" | "created_at" | "updated_at">,
    sessionData: Omit<FocusSession, "id" | "time_entry_id" | "created_at" | "updated_at">
  ): Promise<{ timeEntry: TimeEntry; session: FocusSession }> {
    const timeEntryId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const timeEntry: TimeEntry = {
      ...timeEntryData,
      id: timeEntryId,
      created_at: now,
      updated_at: now,
    };

    const session: FocusSession = {
      ...sessionData,
      id: sessionId,
      time_entry_id: timeEntryId,
      created_at: now,
      updated_at: now,
    };

    this.timeEntries.set(timeEntryId, timeEntry);
    this.focusSessions.set(sessionId, session);

    return { timeEntry, session };
  }

  async getActiveSession(
    userId: string
  ): Promise<{ timeEntry: TimeEntry; session: FocusSession } | null> {
    for (const session of this.focusSessions.values()) {
      if (
        session.user_id === userId &&
        (session.status === "running" || session.status === "paused")
      ) {
        const timeEntry = this.timeEntries.get(session.time_entry_id);
        if (timeEntry && timeEntry.ended_at === null) {
          return { timeEntry, session };
        }
      }
    }
    return null;
  }

  async getSessionById(
    sessionId: string,
    userId: string
  ): Promise<{ timeEntry: TimeEntry; session: FocusSession } | null> {
    const session = this.focusSessions.get(sessionId);
    if (!session || session.user_id !== userId) return null;

    const timeEntry = this.timeEntries.get(session.time_entry_id);
    if (!timeEntry || timeEntry.user_id !== userId) return null;

    return { timeEntry, session };
  }

  async updateSession(
    sessionId: string,
    userId: string,
    updates: Partial<FocusSession>
  ): Promise<FocusSession> {
    const session = this.focusSessions.get(sessionId);
    if (!session || session.user_id !== userId) {
      throw new Error(`Focus session ${sessionId} not found`);
    }

    const updated: FocusSession = {
      ...session,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.focusSessions.set(sessionId, updated);
    return updated;
  }

  async updateTimeEntry(
    timeEntryId: string,
    userId: string,
    updates: Partial<TimeEntry>
  ): Promise<TimeEntry> {
    const entry = this.timeEntries.get(timeEntryId);
    if (!entry || entry.user_id !== userId) {
      throw new Error(`Time entry ${timeEntryId} not found`);
    }

    const updated: TimeEntry = {
      ...entry,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.timeEntries.set(timeEntryId, updated);
    return updated;
  }

  async listRecentSessions(
    userId: string,
    limit = 10
  ): Promise<Array<{ session: FocusSession; timeEntry: TimeEntry }>> {
    const results: Array<{ session: FocusSession; timeEntry: TimeEntry }> = [];

    for (const session of this.focusSessions.values()) {
      if (session.user_id === userId) {
        const timeEntry = this.timeEntries.get(session.time_entry_id);
        if (timeEntry) {
          results.push({ session, timeEntry });
        }
      }
    }

    results.sort(
      (a, b) =>
        new Date(b.session.created_at).getTime() -
        new Date(a.session.created_at).getTime()
    );

    return results.slice(0, limit);
  }
}

export class SupabaseFocusRepository implements IFocusRepository {
  constructor(private supabase: SupabaseClient) {}

  async createSession(
    timeEntryData: Omit<TimeEntry, "id" | "created_at" | "updated_at">,
    sessionData: Omit<FocusSession, "id" | "time_entry_id" | "created_at" | "updated_at">
  ): Promise<{ timeEntry: TimeEntry; session: FocusSession }> {
    const { data: timeEntry, error: teError } = await this.supabase
      .from("time_entries")
      .insert(timeEntryData)
      .select()
      .single();

    if (teError || !timeEntry) {
      throw new Error(`Failed to create time entry: ${teError?.message}`);
    }

    const { data: session, error: fsError } = await this.supabase
      .from("focus_sessions")
      .insert({
        ...sessionData,
        time_entry_id: timeEntry.id,
      })
      .select()
      .single();

    if (fsError || !session) {
      // Cleanup time entry if session creation fails
      await this.supabase.from("time_entries").delete().eq("id", timeEntry.id);
      throw new Error(`Failed to create focus session: ${fsError?.message}`);
    }

    return { timeEntry: timeEntry as TimeEntry, session: session as FocusSession };
  }

  async getActiveSession(
    userId: string
  ): Promise<{ timeEntry: TimeEntry; session: FocusSession } | null> {
    const { data: session, error } = await this.supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["running", "paused"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !session) return null;

    const { data: timeEntry, error: teError } = await this.supabase
      .from("time_entries")
      .select("*")
      .eq("id", session.time_entry_id)
      .is("ended_at", null)
      .maybeSingle();

    if (teError || !timeEntry) return null;

    return {
      session: session as FocusSession,
      timeEntry: timeEntry as TimeEntry,
    };
  }

  async getSessionById(
    sessionId: string,
    userId: string
  ): Promise<{ timeEntry: TimeEntry; session: FocusSession } | null> {
    const { data: session, error } = await this.supabase
      .from("focus_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !session) return null;

    const { data: timeEntry, error: teError } = await this.supabase
      .from("time_entries")
      .select("*")
      .eq("id", session.time_entry_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (teError || !timeEntry) return null;

    return {
      session: session as FocusSession,
      timeEntry: timeEntry as TimeEntry,
    };
  }

  async updateSession(
    sessionId: string,
    userId: string,
    updates: Partial<FocusSession>
  ): Promise<FocusSession> {
    const { data, error } = await this.supabase
      .from("focus_sessions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update focus session: ${error?.message}`);
    }

    return data as FocusSession;
  }

  async updateTimeEntry(
    timeEntryId: string,
    userId: string,
    updates: Partial<TimeEntry>
  ): Promise<TimeEntry> {
    const { data, error } = await this.supabase
      .from("time_entries")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", timeEntryId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update time entry: ${error?.message}`);
    }

    return data as TimeEntry;
  }

  async listRecentSessions(
    userId: string,
    limit = 10
  ): Promise<Array<{ session: FocusSession; timeEntry: TimeEntry }>> {
    const { data: sessions, error } = await this.supabase
      .from("focus_sessions")
      .select("*, time_entries(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !sessions) return [];

    return sessions
      .filter((s) => s.time_entries)
      .map((s) => {
        const { time_entries, ...sessionData } = s;
        return {
          session: sessionData as FocusSession,
          timeEntry: time_entries as TimeEntry,
        };
      });
  }
}

const globalInMemoryFocusRepo = new InMemoryFocusRepository();

export function getFocusRepository(client?: SupabaseClient | null): IFocusRepository {
  if (client) {
    return new SupabaseFocusRepository(client);
  }
  if (process.env.NODE_ENV === "production") {
    throw new InfrastructureError(
      "Supabase client is required in production. In-memory persistence fallback is disabled."
    );
  }
  return globalInMemoryFocusRepo;
}

export function getInMemoryFocusRepository(): InMemoryFocusRepository {
  return globalInMemoryFocusRepo;
}
