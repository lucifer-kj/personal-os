import { SupabaseClient } from "@supabase/supabase-js";
import { InfrastructureError } from "@/lib/errors";
import {
  InboxItem,
  CreateInboxItemDTO,
  UpdateInboxItemDTO,
  ConvertedEntityType,
  InboxFilters,
  IInboxRepository,
} from "./types";

export class InMemoryInboxRepository implements IInboxRepository {
  private items: Map<string, InboxItem> = new Map();

  async findMany(
    userId: string,
    filters: InboxFilters = {}
  ): Promise<{ items: InboxItem[]; total: number }> {
    let result = Array.from(this.items.values()).filter((i) => i.user_id === userId);

    if (filters.status && filters.status !== "all") {
      result = result.filter((i) => i.status === filters.status);
    } else if (!filters.status) {
      result = result.filter((i) => i.status === "unprocessed");
    }

    if (filters.capture_type) {
      result = result.filter((i) => i.capture_type === filters.capture_type);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(term) ||
          (i.content && i.content.toLowerCase().includes(term))
      );
    }

    result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return { items: result, total: result.length };
  }

  async findById(userId: string, id: string): Promise<InboxItem | null> {
    const item = this.items.get(id);
    if (!item || item.user_id !== userId) return null;
    return item;
  }

  async create(data: CreateInboxItemDTO): Promise<InboxItem> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const item: InboxItem = {
      id,
      user_id: data.user_id,
      title: data.title,
      content: data.content ?? null,
      capture_type: data.capture_type ?? "idea",
      status: "unprocessed",
      source: data.source ?? "manual",
      url: data.url || null,
      converted_entity_type: null,
      converted_entity_id: null,
      processed_at: null,
      created_at: now,
      updated_at: now,
    };

    this.items.set(id, item);
    return item;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateInboxItemDTO
  ): Promise<InboxItem> {
    const item = this.items.get(id);
    if (!item || item.user_id !== userId) {
      throw new Error(`Inbox item ${id} not found`);
    }

    const updated: InboxItem = {
      ...item,
      ...data,
      url: data.url !== undefined ? (data.url || null) : item.url,
      updated_at: new Date().toISOString(),
    };

    this.items.set(id, updated);
    return updated;
  }

  async markProcessed(
    userId: string,
    id: string,
    entityType: ConvertedEntityType,
    entityId: string
  ): Promise<InboxItem> {
    const item = this.items.get(id);
    if (!item || item.user_id !== userId) {
      throw new Error(`Inbox item ${id} not found`);
    }

    const now = new Date().toISOString();
    const updated: InboxItem = {
      ...item,
      status: "processed",
      converted_entity_type: entityType,
      converted_entity_id: entityId,
      processed_at: now,
      updated_at: now,
    };

    this.items.set(id, updated);
    return updated;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const item = this.items.get(id);
    if (!item || item.user_id !== userId) return false;
    return this.items.delete(id);
  }
}

export class SupabaseInboxRepository implements IInboxRepository {
  constructor(private supabase: SupabaseClient) {}

  async findMany(
    userId: string,
    filters: InboxFilters = {}
  ): Promise<{ items: InboxItem[]; total: number }> {
    let query = this.supabase
      .from("inbox_items")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    } else if (!filters.status) {
      query = query.eq("status", "unprocessed");
    }

    if (filters.capture_type) {
      query = query.eq("capture_type", filters.capture_type);
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
      );
    }

    query = query.order("created_at", { ascending: false });

    const { data, count, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch inbox items: ${error.message}`);
    }

    return { items: (data as InboxItem[]) || [], total: count || 0 };
  }

  async findById(userId: string, id: string): Promise<InboxItem | null> {
    const { data, error } = await this.supabase
      .from("inbox_items")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return data as InboxItem;
  }

  async create(data: CreateInboxItemDTO): Promise<InboxItem> {
    const { data: item, error } = await this.supabase
      .from("inbox_items")
      .insert({
        user_id: data.user_id,
        title: data.title,
        content: data.content ?? null,
        capture_type: data.capture_type ?? "idea",
        source: data.source ?? "manual",
        url: data.url || null,
      })
      .select()
      .single();

    if (error || !item) {
      throw new Error(`Failed to create inbox item: ${error?.message}`);
    }

    return item as InboxItem;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateInboxItemDTO
  ): Promise<InboxItem> {
    const { data: item, error } = await this.supabase
      .from("inbox_items")
      .update({
        ...data,
        url: data.url !== undefined ? (data.url || null) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error || !item) {
      throw new Error(`Failed to update inbox item: ${error?.message}`);
    }

    return item as InboxItem;
  }

  async markProcessed(
    userId: string,
    id: string,
    entityType: ConvertedEntityType,
    entityId: string
  ): Promise<InboxItem> {
    const now = new Date().toISOString();
    const { data: item, error } = await this.supabase
      .from("inbox_items")
      .update({
        status: "processed",
        converted_entity_type: entityType,
        converted_entity_id: entityId,
        processed_at: now,
        updated_at: now,
      })
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error || !item) {
      throw new Error(`Failed to mark inbox item processed: ${error?.message}`);
    }

    return item as InboxItem;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("inbox_items")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);

    return !error;
  }
}

const globalInMemoryInboxRepo = new InMemoryInboxRepository();

export function getInboxRepository(client?: SupabaseClient | null): IInboxRepository {
  if (client) {
    return new SupabaseInboxRepository(client);
  }
  if (process.env.NODE_ENV === "production") {
    throw new InfrastructureError(
      "Supabase client is required in production. In-memory persistence fallback is disabled."
    );
  }
  return globalInMemoryInboxRepo;
}

export function getInMemoryInboxRepository(): InMemoryInboxRepository {
  return globalInMemoryInboxRepo;
}
