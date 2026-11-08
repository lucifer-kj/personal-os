import { SupabaseClient } from "@supabase/supabase-js";
import { InfrastructureError } from "@/lib/errors";
import { DailyPlan } from "./types";

export interface IDayRepository {
  findByDate(userId: string, date: string): Promise<DailyPlan | null>;
  upsertIntention(userId: string, date: string, intention: string): Promise<DailyPlan>;
  upsertShutdownNotes(userId: string, date: string, notes: string): Promise<DailyPlan>;
}

export class InMemoryDayRepository implements IDayRepository {
  private plans: Map<string, DailyPlan> = new Map();

  private makeKey(userId: string, date: string): string {
    return `${userId}:${date}`;
  }

  async findByDate(userId: string, date: string): Promise<DailyPlan | null> {
    const key = this.makeKey(userId, date);
    return this.plans.get(key) || null;
  }

  async upsertIntention(userId: string, date: string, intention: string): Promise<DailyPlan> {
    const key = this.makeKey(userId, date);
    const existing = this.plans.get(key);
    const now = new Date().toISOString();

    if (existing) {
      const updated: DailyPlan = {
        ...existing,
        intention,
        updated_at: now,
      };
      this.plans.set(key, updated);
      return updated;
    }

    const created: DailyPlan = {
      id: crypto.randomUUID(),
      user_id: userId,
      plan_date: date,
      intention,
      shutdown_notes: null,
      created_at: now,
      updated_at: now,
    };
    this.plans.set(key, created);
    return created;
  }

  async upsertShutdownNotes(userId: string, date: string, notes: string): Promise<DailyPlan> {
    const key = this.makeKey(userId, date);
    const existing = this.plans.get(key);
    const now = new Date().toISOString();

    if (existing) {
      const updated: DailyPlan = {
        ...existing,
        shutdown_notes: notes,
        updated_at: now,
      };
      this.plans.set(key, updated);
      return updated;
    }

    const created: DailyPlan = {
      id: crypto.randomUUID(),
      user_id: userId,
      plan_date: date,
      intention: null,
      shutdown_notes: notes,
      created_at: now,
      updated_at: now,
    };
    this.plans.set(key, created);
    return created;
  }

  clear(): void {
    this.plans.clear();
  }
}

export class SupabaseDayRepository implements IDayRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByDate(userId: string, date: string): Promise<DailyPlan | null> {
    const { data, error } = await this.supabase
      .from("daily_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_date", date)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find daily plan: ${error.message}`);
    }

    return (data as DailyPlan) || null;
  }

  async upsertIntention(userId: string, date: string, intention: string): Promise<DailyPlan> {
    const { data, error } = await this.supabase
      .from("daily_plans")
      .upsert(
        {
          user_id: userId,
          plan_date: date,
          intention,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,plan_date" }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert intention: ${error.message}`);
    }

    return data as DailyPlan;
  }

  async upsertShutdownNotes(userId: string, date: string, notes: string): Promise<DailyPlan> {
    const { data, error } = await this.supabase
      .from("daily_plans")
      .upsert(
        {
          user_id: userId,
          plan_date: date,
          shutdown_notes: notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,plan_date" }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert shutdown notes: ${error.message}`);
    }

    return data as DailyPlan;
  }
}

const globalInMemoryDayRepo = new InMemoryDayRepository();

export function getDayRepository(client?: SupabaseClient | null): IDayRepository {
  if (client) {
    return new SupabaseDayRepository(client);
  }
  if (process.env.NODE_ENV === "production") {
    throw new InfrastructureError(
      "Supabase client is required in production. In-memory persistence fallback is disabled."
    );
  }
  return globalInMemoryDayRepo;
}

export function getInMemoryDayRepository(): InMemoryDayRepository {
  return globalInMemoryDayRepo;
}
