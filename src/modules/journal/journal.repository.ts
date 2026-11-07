import { SupabaseClient } from "@supabase/supabase-js";
import {
  JournalEntry,
  CreateJournalDTO,
  UpdateJournalDTO,
  JournalFilterParams,
} from "./types";

export interface IJournalRepository {
  upsertEntry(userId: string, data: CreateJournalDTO): Promise<JournalEntry>;
  findById(userId: string, id: string): Promise<JournalEntry | null>;
  findByDate(userId: string, date: string): Promise<JournalEntry | null>;
  findMany(userId: string, filter?: JournalFilterParams): Promise<{ entries: JournalEntry[]; total: number }>;
  update(userId: string, id: string, data: UpdateJournalDTO): Promise<JournalEntry>;
  delete(userId: string, id: string): Promise<boolean>;
}

export class InMemoryJournalRepository implements IJournalRepository {
  private entries: Map<string, JournalEntry> = new Map();

  async upsertEntry(userId: string, data: CreateJournalDTO): Promise<JournalEntry> {
    const existing = await this.findByDate(userId, data.entry_date);
    const now = new Date().toISOString();

    if (existing) {
      const updated: JournalEntry = {
        ...existing,
        title: data.title !== undefined ? data.title : existing.title,
        content: data.content !== undefined ? data.content : existing.content,
        mood: data.mood !== undefined ? data.mood : existing.mood,
        energy_level: data.energy_level !== undefined ? data.energy_level : existing.energy_level,
        reflection: data.reflection !== undefined ? data.reflection : existing.reflection,
        gratitude: data.gratitude !== undefined ? data.gratitude : existing.gratitude,
        tags: data.tags !== undefined ? data.tags : existing.tags,
        updated_at: now,
      };
      this.entries.set(existing.id, updated);
      return updated;
    }

    const id = `journal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newEntry: JournalEntry = {
      id,
      user_id: userId,
      entry_date: data.entry_date,
      title: data.title || "",
      content: data.content || "",
      mood: data.mood || null,
      energy_level: data.energy_level || null,
      reflection: data.reflection || "",
      gratitude: data.gratitude || [],
      tags: data.tags || [],
      created_at: now,
      updated_at: now,
    };

    this.entries.set(id, newEntry);
    return newEntry;
  }

  async findById(userId: string, id: string): Promise<JournalEntry | null> {
    const entry = this.entries.get(id);
    if (!entry || entry.user_id !== userId) return null;
    return entry;
  }

  async findByDate(userId: string, date: string): Promise<JournalEntry | null> {
    for (const entry of this.entries.values()) {
      if (entry.user_id === userId && entry.entry_date === date) {
        return entry;
      }
    }
    return null;
  }

  async findMany(
    userId: string,
    filter?: JournalFilterParams
  ): Promise<{ entries: JournalEntry[]; total: number }> {
    let list = Array.from(this.entries.values()).filter((e) => e.user_id === userId);

    if (filter?.from) list = list.filter((e) => e.entry_date >= filter.from!);
    if (filter?.to) list = list.filter((e) => e.entry_date <= filter.to!);
    if (filter?.mood) list = list.filter((e) => e.mood === filter.mood);
    if (filter?.tag) list = list.filter((e) => e.tags.includes(filter.tag!));
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.reflection.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    list.sort((a, b) => b.entry_date.localeCompare(a.entry_date));

    const offset = filter?.offset || 0;
    const limit = filter?.limit || 30;
    const paginated = list.slice(offset, offset + limit);

    return { entries: paginated, total };
  }

  async update(userId: string, id: string, data: UpdateJournalDTO): Promise<JournalEntry> {
    const entry = await this.findById(userId, id);
    if (!entry) throw new Error("Journal entry not found");

    const updated: JournalEntry = {
      ...entry,
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.entries.set(id, updated);
    return updated;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const entry = await this.findById(userId, id);
    if (!entry) return false;
    return this.entries.delete(id);
  }
}

export class SupabaseJournalRepository implements IJournalRepository {
  constructor(private client: SupabaseClient) {}

  async upsertEntry(userId: string, data: CreateJournalDTO): Promise<JournalEntry> {
    const { data: record, error } = await this.client
      .from("journal_entries")
      .upsert(
        {
          user_id: userId,
          entry_date: data.entry_date,
          title: data.title || "",
          content: data.content || "",
          mood: data.mood || null,
          energy_level: data.energy_level || null,
          reflection: data.reflection || "",
          gratitude: data.gratitude || [],
          tags: data.tags || [],
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,entry_date",
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert journal entry: ${error.message}`);
    }

    return record as JournalEntry;
  }

  async findById(userId: string, id: string): Promise<JournalEntry | null> {
    const { data, error } = await this.client
      .from("journal_entries")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find journal entry: ${error.message}`);
    }

    return (data as JournalEntry) || null;
  }

  async findByDate(userId: string, date: string): Promise<JournalEntry | null> {
    const { data, error } = await this.client
      .from("journal_entries")
      .select("*")
      .eq("entry_date", date)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find journal entry by date: ${error.message}`);
    }

    return (data as JournalEntry) || null;
  }

  async findMany(
    userId: string,
    filter?: JournalFilterParams
  ): Promise<{ entries: JournalEntry[]; total: number }> {
    let query = this.client
      .from("journal_entries")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (filter?.from) query = query.gte("entry_date", filter.from);
    if (filter?.to) query = query.lte("entry_date", filter.to);
    if (filter?.mood) query = query.eq("mood", filter.mood);
    if (filter?.tag) query = query.contains("tags", [filter.tag]);
    if (filter?.search) {
      query = query.or(
        `title.ilike.%${filter.search}%,content.ilike.%${filter.search}%,reflection.ilike.%${filter.search}%`
      );
    }

    const offset = filter?.offset || 0;
    const limit = filter?.limit || 30;

    const { data, count, error } = await query
      .order("entry_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list journal entries: ${error.message}`);
    }

    return { entries: (data || []) as JournalEntry[], total: count || 0 };
  }

  async update(userId: string, id: string, data: UpdateJournalDTO): Promise<JournalEntry> {
    const { data: updated, error } = await this.client
      .from("journal_entries")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update journal entry: ${error.message}`);
    }

    return updated as JournalEntry;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const { error } = await this.client
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete journal entry: ${error.message}`);
    }

    return true;
  }
}

// Global factory
const globalInMemoryJournalRepo = new InMemoryJournalRepository();

export function getJournalRepository(client?: SupabaseClient | null): IJournalRepository {
  if (client) {
    return new SupabaseJournalRepository(client);
  }
  return globalInMemoryJournalRepo;
}
