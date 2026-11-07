import { SupabaseClient } from "@supabase/supabase-js";
import {
  CalendarEvent,
  CreateCalendarEventDTO,
  UpdateCalendarEventDTO,
  MoveCalendarEventDTO,
  CalendarEventFilters,
  ICalendarRepository,
} from "./types";

export class InMemoryCalendarRepository implements ICalendarRepository {
  private events: Map<string, CalendarEvent> = new Map();

  async findMany(
    userId: string,
    filters: CalendarEventFilters = {}
  ): Promise<CalendarEvent[]> {
    let result = Array.from(this.events.values()).filter(
      (e) => e.user_id === userId
    );

    if (filters.from) {
      const fromTime = new Date(filters.from).getTime();
      result = result.filter((e) => new Date(e.end_at).getTime() >= fromTime);
    }

    if (filters.to) {
      const toTime = new Date(filters.to).getTime();
      result = result.filter((e) => new Date(e.start_at).getTime() <= toTime);
    }

    if (filters.event_type) {
      result = result.filter((e) => e.event_type === filters.event_type);
    }

    if (filters.project_id) {
      result = result.filter((e) => e.project_id === filters.project_id);
    }

    if (filters.task_id) {
      result = result.filter((e) => e.task_id === filters.task_id);
    }

    result.sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    );

    return result;
  }

  async findById(userId: string, id: string): Promise<CalendarEvent | null> {
    const event = this.events.get(id);
    if (!event || event.user_id !== userId) return null;
    return event;
  }

  async create(data: CreateCalendarEventDTO): Promise<CalendarEvent> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const event: CalendarEvent = {
      id,
      user_id: data.user_id,
      title: data.title,
      description: data.description ?? null,
      event_type: data.event_type || "personal",
      start_at: data.start_at,
      end_at: data.end_at,
      all_day: data.all_day ?? false,
      timezone: data.timezone || "UTC",
      location: data.location ?? null,
      project_id: data.project_id ?? null,
      task_id: data.task_id ?? null,
      meeting_id: data.meeting_id ?? null,
      source_provider: data.source_provider ?? null,
      source_event_id: data.source_event_id ?? null,
      created_at: now,
      updated_at: now,
    };

    this.events.set(id, event);
    return event;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateCalendarEventDTO
  ): Promise<CalendarEvent> {
    const existing = await this.findById(userId, id);
    if (!existing) {
      throw new Error(`Calendar event with id ${id} not found`);
    }

    const updated: CalendarEvent = {
      ...existing,
      ...data,
      title: data.title ?? existing.title,
      description:
        data.description !== undefined ? data.description : existing.description,
      location: data.location !== undefined ? data.location : existing.location,
      project_id:
        data.project_id !== undefined ? data.project_id : existing.project_id,
      task_id: data.task_id !== undefined ? data.task_id : existing.task_id,
      updated_at: new Date().toISOString(),
    };

    this.events.set(id, updated);
    return updated;
  }

  async move(
    userId: string,
    id: string,
    data: MoveCalendarEventDTO
  ): Promise<CalendarEvent> {
    const existing = await this.findById(userId, id);
    if (!existing) {
      throw new Error(`Calendar event with id ${id} not found`);
    }

    const updated: CalendarEvent = {
      ...existing,
      start_at: data.start_at,
      end_at: data.end_at,
      updated_at: new Date().toISOString(),
    };

    this.events.set(id, updated);
    return updated;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await this.findById(userId, id);
    if (!existing) return false;
    this.events.delete(id);
    return true;
  }

  async detectConflicts(
    userId: string,
    startAt: string,
    endAt: string,
    excludeEventId?: string
  ): Promise<CalendarEvent[]> {
    const reqStart = new Date(startAt).getTime();
    const reqEnd = new Date(endAt).getTime();

    const conflicts = Array.from(this.events.values()).filter((e) => {
      if (e.user_id !== userId) return false;
      if (excludeEventId && e.id === excludeEventId) return false;
      if (e.all_day) return false; // all day events don't create hourly conflicts

      const eStart = new Date(e.start_at).getTime();
      const eEnd = new Date(e.end_at).getTime();

      // Overlap condition: start1 < end2 AND end1 > start2
      return eStart < reqEnd && eEnd > reqStart;
    });

    conflicts.sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    );

    return conflicts;
  }

  // Testing helper
  clear(): void {
    this.events.clear();
  }
}

export class SupabaseCalendarRepository implements ICalendarRepository {
  constructor(private supabase: SupabaseClient) {}

  async findMany(
    userId: string,
    filters: CalendarEventFilters = {}
  ): Promise<CalendarEvent[]> {
    let query = this.supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId);

    if (filters.from) {
      query = query.gte("end_at", filters.from);
    }

    if (filters.to) {
      query = query.lte("start_at", filters.to);
    }

    if (filters.event_type) {
      query = query.eq("event_type", filters.event_type);
    }

    if (filters.project_id) {
      query = query.eq("project_id", filters.project_id);
    }

    if (filters.task_id) {
      query = query.eq("task_id", filters.task_id);
    }

    query = query.order("start_at", { ascending: true });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch calendar events: ${error.message}`);
    }

    return (data || []) as CalendarEvent[];
  }

  async findById(userId: string, id: string): Promise<CalendarEvent | null> {
    const { data, error } = await this.supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch calendar event: ${error.message}`);
    }

    return (data as CalendarEvent) || null;
  }

  async create(data: CreateCalendarEventDTO): Promise<CalendarEvent> {
    const { data: event, error } = await this.supabase
      .from("calendar_events")
      .insert({
        user_id: data.user_id,
        title: data.title,
        description: data.description ?? null,
        event_type: data.event_type || "personal",
        start_at: data.start_at,
        end_at: data.end_at,
        all_day: data.all_day ?? false,
        timezone: data.timezone || "UTC",
        location: data.location ?? null,
        project_id: data.project_id ?? null,
        task_id: data.task_id ?? null,
        meeting_id: data.meeting_id ?? null,
        source_provider: data.source_provider ?? null,
        source_event_id: data.source_event_id ?? null,
      })
      .select()
      .single();

    if (error || !event) {
      throw new Error(`Failed to create calendar event: ${error?.message}`);
    }

    return event as CalendarEvent;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateCalendarEventDTO
  ): Promise<CalendarEvent> {
    const { data: event, error } = await this.supabase
      .from("calendar_events")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error || !event) {
      throw new Error(`Failed to update calendar event: ${error?.message}`);
    }

    return event as CalendarEvent;
  }

  async move(
    userId: string,
    id: string,
    data: MoveCalendarEventDTO
  ): Promise<CalendarEvent> {
    const { data: event, error } = await this.supabase
      .from("calendar_events")
      .update({
        start_at: data.start_at,
        end_at: data.end_at,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error || !event) {
      throw new Error(`Failed to move calendar event: ${error?.message}`);
    }

    return event as CalendarEvent;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("calendar_events")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);

    return !error;
  }

  async detectConflicts(
    userId: string,
    startAt: string,
    endAt: string,
    excludeEventId?: string
  ): Promise<CalendarEvent[]> {
    let query = this.supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .eq("all_day", false)
      .lt("start_at", endAt)
      .gt("end_at", startAt);

    if (excludeEventId) {
      query = query.neq("id", excludeEventId);
    }

    query = query.order("start_at", { ascending: true });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to detect event conflicts: ${error.message}`);
    }

    return (data || []) as CalendarEvent[];
  }
}

const globalInMemoryCalendarRepo = new InMemoryCalendarRepository();

export function getCalendarRepository(
  client?: SupabaseClient | null
): ICalendarRepository {
  if (client) {
    return new SupabaseCalendarRepository(client);
  }
  return globalInMemoryCalendarRepo;
}

export function getInMemoryCalendarRepository(): InMemoryCalendarRepository {
  return globalInMemoryCalendarRepo;
}
