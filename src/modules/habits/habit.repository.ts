import { SupabaseClient } from "@supabase/supabase-js";
import {
  Habit,
  HabitLog,
  CreateHabitDTO,
  UpdateHabitDTO,
  LogHabitDTO,
  HabitFilterParams,
} from "./types";

export interface IHabitRepository {
  createHabit(userId: string, data: CreateHabitDTO): Promise<Habit>;
  findById(userId: string, id: string): Promise<Habit | null>;
  findMany(userId: string, filter?: HabitFilterParams): Promise<Habit[]>;
  update(userId: string, id: string, data: UpdateHabitDTO): Promise<Habit>;
  delete(userId: string, id: string): Promise<boolean>;

  upsertLog(userId: string, habitId: string, data: LogHabitDTO): Promise<HabitLog>;
  findLog(userId: string, habitId: string, date: string): Promise<HabitLog | null>;
  findLogsByHabit(userId: string, habitId: string, from?: string, to?: string): Promise<HabitLog[]>;
  findLogsByDateRange(userId: string, from: string, to: string): Promise<HabitLog[]>;
  deleteLog(userId: string, habitId: string, date: string): Promise<boolean>;
}

export class InMemoryHabitRepository implements IHabitRepository {
  private habits: Map<string, Habit> = new Map();
  private logs: Map<string, HabitLog> = new Map();

  private getLogKey(userId: string, habitId: string, date: string): string {
    return `${userId}:${habitId}:${date}`;
  }

  async createHabit(userId: string, data: CreateHabitDTO): Promise<Habit> {
    const now = new Date().toISOString();
    const id = `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const habit: Habit = {
      id,
      user_id: userId,
      name: data.name,
      description: data.description || "",
      frequency: data.frequency || "daily",
      target_days: data.target_days || [1, 2, 3, 4, 5, 6, 7],
      target_count: data.target_count || 1,
      color: data.color || "terracotta",
      is_archived: false,
      created_at: now,
      updated_at: now,
    };

    this.habits.set(id, habit);
    return habit;
  }

  async findById(userId: string, id: string): Promise<Habit | null> {
    const habit = this.habits.get(id);
    if (!habit || habit.user_id !== userId) return null;
    return habit;
  }

  async findMany(userId: string, filter?: HabitFilterParams): Promise<Habit[]> {
    let list = Array.from(this.habits.values()).filter((h) => h.user_id === userId);

    if (filter?.is_archived !== undefined) {
      list = list.filter((h) => h.is_archived === filter.is_archived);
    }

    return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  async update(userId: string, id: string, data: UpdateHabitDTO): Promise<Habit> {
    const habit = await this.findById(userId, id);
    if (!habit) {
      throw new Error("Habit not found");
    }

    const updated: Habit = {
      ...habit,
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.habits.set(id, updated);
    return updated;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const habit = await this.findById(userId, id);
    if (!habit) return false;

    // Delete associated logs
    for (const [key, log] of this.logs.entries()) {
      if (log.user_id === userId && log.habit_id === id) {
        this.logs.delete(key);
      }
    }

    return this.habits.delete(id);
  }

  async upsertLog(userId: string, habitId: string, data: LogHabitDTO): Promise<HabitLog> {
    const key = this.getLogKey(userId, habitId, data.date);
    const existing = this.logs.get(key);
    const now = new Date().toISOString();

    if (existing) {
      const updated: HabitLog = {
        ...existing,
        completed: data.completed !== undefined ? data.completed : existing.completed,
        count: data.count !== undefined ? data.count : existing.count,
        note: data.note !== undefined ? data.note : existing.note,
        updated_at: now,
      };
      this.logs.set(key, updated);
      return updated;
    }

    const newLog: HabitLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      habit_id: habitId,
      date: data.date,
      completed: data.completed !== undefined ? data.completed : true,
      count: data.count !== undefined ? data.count : 1,
      note: data.note || "",
      created_at: now,
      updated_at: now,
    };

    this.logs.set(key, newLog);
    return newLog;
  }

  async findLog(userId: string, habitId: string, date: string): Promise<HabitLog | null> {
    const key = this.getLogKey(userId, habitId, date);
    return this.logs.get(key) || null;
  }

  async findLogsByHabit(userId: string, habitId: string, from?: string, to?: string): Promise<HabitLog[]> {
    return Array.from(this.logs.values())
      .filter((l) => {
        if (l.user_id !== userId || l.habit_id !== habitId) return false;
        if (from && l.date < from) return false;
        if (to && l.date > to) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async findLogsByDateRange(userId: string, from: string, to: string): Promise<HabitLog[]> {
    return Array.from(this.logs.values())
      .filter((l) => {
        if (l.user_id !== userId) return false;
        if (l.date < from || l.date > to) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async deleteLog(userId: string, habitId: string, date: string): Promise<boolean> {
    const key = this.getLogKey(userId, habitId, date);
    return this.logs.delete(key);
  }
}

export class SupabaseHabitRepository implements IHabitRepository {
  constructor(private client: SupabaseClient) {}

  async createHabit(userId: string, data: CreateHabitDTO): Promise<Habit> {
    const { data: record, error } = await this.client
      .from("habits")
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description || "",
        frequency: data.frequency || "daily",
        target_days: data.target_days || [1, 2, 3, 4, 5, 6, 7],
        target_count: data.target_count || 1,
        color: data.color || "terracotta",
        is_archived: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create habit: ${error.message}`);
    }

    return record as Habit;
  }

  async findById(userId: string, id: string): Promise<Habit | null> {
    const { data, error } = await this.client
      .from("habits")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find habit: ${error.message}`);
    }

    return (data as Habit) || null;
  }

  async findMany(userId: string, filter?: HabitFilterParams): Promise<Habit[]> {
    let query = this.client.from("habits").select("*").eq("user_id", userId);

    if (filter?.is_archived !== undefined) {
      query = query.eq("is_archived", filter.is_archived);
    }

    const { data, error } = await query.order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to list habits: ${error.message}`);
    }

    return (data || []) as Habit[];
  }

  async update(userId: string, id: string, data: UpdateHabitDTO): Promise<Habit> {
    const { data: updated, error } = await this.client
      .from("habits")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update habit: ${error.message}`);
    }

    return updated as Habit;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const { error } = await this.client.from("habits").delete().eq("id", id).eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete habit: ${error.message}`);
    }

    return true;
  }

  async upsertLog(userId: string, habitId: string, data: LogHabitDTO): Promise<HabitLog> {
    const { data: record, error } = await this.client
      .from("habit_logs")
      .upsert(
        {
          user_id: userId,
          habit_id: habitId,
          date: data.date,
          completed: data.completed !== undefined ? data.completed : true,
          count: data.count !== undefined ? data.count : 1,
          note: data.note || "",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,habit_id,date",
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert habit log: ${error.message}`);
    }

    return record as HabitLog;
  }

  async findLog(userId: string, habitId: string, date: string): Promise<HabitLog | null> {
    const { data, error } = await this.client
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("habit_id", habitId)
      .eq("date", date)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find habit log: ${error.message}`);
    }

    return (data as HabitLog) || null;
  }

  async findLogsByHabit(userId: string, habitId: string, from?: string, to?: string): Promise<HabitLog[]> {
    let query = this.client
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("habit_id", habitId);

    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);

    const { data, error } = await query.order("date", { ascending: false });

    if (error) {
      throw new Error(`Failed to find habit logs: ${error.message}`);
    }

    return (data || []) as HabitLog[];
  }

  async findLogsByDateRange(userId: string, from: string, to: string): Promise<HabitLog[]> {
    const { data, error } = await this.client
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: false });

    if (error) {
      throw new Error(`Failed to find habit logs in range: ${error.message}`);
    }

    return (data || []) as HabitLog[];
  }

  async deleteLog(userId: string, habitId: string, date: string): Promise<boolean> {
    const { error } = await this.client
      .from("habit_logs")
      .delete()
      .eq("user_id", userId)
      .eq("habit_id", habitId)
      .eq("date", date);

    if (error) {
      throw new Error(`Failed to delete habit log: ${error.message}`);
    }

    return true;
  }
}

// Global factory
const globalInMemoryHabitRepo = new InMemoryHabitRepository();

export function getHabitRepository(client?: SupabaseClient | null): IHabitRepository {
  if (client) {
    return new SupabaseHabitRepository(client);
  }
  return globalInMemoryHabitRepo;
}
