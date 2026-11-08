import { SupabaseClient } from "@supabase/supabase-js";
import {
  RSSFeed,
  RadarItem,
  CreateFeedDTO,
  RadarFilter,
} from "./types";

export interface IRadarRepository {
  findFeeds(userId: string): Promise<RSSFeed[]>;
  findFeedById(userId: string, id: string): Promise<RSSFeed | null>;
  createFeed(
    userId: string,
    data: CreateFeedDTO & { title: string; site_url?: string | null }
  ): Promise<RSSFeed>;
  updateFeed(
    userId: string,
    id: string,
    data: Partial<RSSFeed>
  ): Promise<RSSFeed | null>;
  deleteFeed(userId: string, id: string): Promise<boolean>;

  findItems(userId: string, filters?: RadarFilter): Promise<RadarItem[]>;
  findItemById(userId: string, id: string): Promise<RadarItem | null>;
  upsertItems(
    userId: string,
    feedId: string,
    items: Array<{
      title: string;
      url: string;
      author?: string | null;
      summary?: string | null;
      content?: string | null;
      published_at: string;
    }>
  ): Promise<number>;
  updateItem(
    userId: string,
    id: string,
    data: Partial<RadarItem>
  ): Promise<RadarItem | null>;
  pruneOldItems(userId: string, retentionDays?: number): Promise<number>;
}

export class InMemoryRadarRepository implements IRadarRepository {
  private feeds: Map<string, RSSFeed> = new Map();
  private items: Map<string, RadarItem> = new Map();

  clear(): void {
    this.feeds.clear();
    this.items.clear();
  }

  async findFeeds(userId: string): Promise<RSSFeed[]> {
    return Array.from(this.feeds.values())
      .filter((f) => f.user_id === userId)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  async findFeedById(userId: string, id: string): Promise<RSSFeed | null> {
    const feed = this.feeds.get(id);
    return feed && feed.user_id === userId ? feed : null;
  }

  async createFeed(
    userId: string,
    data: CreateFeedDTO & { title: string; site_url?: string | null }
  ): Promise<RSSFeed> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const feed: RSSFeed = {
      id,
      user_id: userId,
      title: data.title,
      url: data.url,
      site_url: data.site_url || null,
      category: data.category || "General",
      icon_url: null,
      last_fetched_at: null,
      fetch_error: null,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    this.feeds.set(id, feed);
    return feed;
  }

  async updateFeed(
    userId: string,
    id: string,
    data: Partial<RSSFeed>
  ): Promise<RSSFeed | null> {
    const existing = await this.findFeedById(userId, id);
    if (!existing) return null;

    const updated: RSSFeed = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.feeds.set(id, updated);
    return updated;
  }

  async deleteFeed(userId: string, id: string): Promise<boolean> {
    const existing = await this.findFeedById(userId, id);
    if (!existing) return false;

    this.feeds.delete(id);
    // Cascade delete items
    for (const [itemId, item] of this.items.entries()) {
      if (item.feed_id === id) {
        this.items.delete(itemId);
      }
    }
    return true;
  }

  async findItems(userId: string, filters: RadarFilter = {}): Promise<RadarItem[]> {
    let result = Array.from(this.items.values()).filter((i) => i.user_id === userId);

    if (filters.feed_id) {
      result = result.filter((i) => i.feed_id === filters.feed_id);
    }
    if (filters.is_read !== undefined) {
      result = result.filter((i) => i.is_read === filters.is_read);
    }
    if (filters.is_starred !== undefined) {
      result = result.filter((i) => i.is_starred === filters.is_starred);
    }
    if (filters.category) {
      result = result.filter((i) => {
        const feed = this.feeds.get(i.feed_id);
        return feed && feed.category.toLowerCase() === filters.category?.toLowerCase();
      });
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.summary && i.summary.toLowerCase().includes(q))
      );
    }

    result.sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    // Attach feed metadata
    return result.map((item) => {
      const feed = this.feeds.get(item.feed_id);
      return {
        ...item,
        feed: feed ? { title: feed.title, category: feed.category } : undefined,
      };
    });
  }

  async findItemById(userId: string, id: string): Promise<RadarItem | null> {
    const item = this.items.get(id);
    if (!item || item.user_id !== userId) return null;
    const feed = this.feeds.get(item.feed_id);
    return {
      ...item,
      feed: feed ? { title: feed.title, category: feed.category } : undefined,
    };
  }

  async upsertItems(
    userId: string,
    feedId: string,
    items: Array<{
      title: string;
      url: string;
      author?: string | null;
      summary?: string | null;
      content?: string | null;
      published_at: string;
    }>
  ): Promise<number> {
    let count = 0;
    const now = new Date().toISOString();

    for (const item of items) {
      // Check duplicate by (user_id, feed_id, url)
      const existing = Array.from(this.items.values()).find(
        (i) => i.user_id === userId && i.feed_id === feedId && i.url === item.url
      );

      if (!existing) {
        const id = crypto.randomUUID();
        this.items.set(id, {
          id,
          user_id: userId,
          feed_id: feedId,
          title: item.title,
          url: item.url,
          author: item.author || null,
          summary: item.summary || null,
          content: item.content || null,
          published_at: item.published_at,
          is_read: false,
          is_starred: false,
          promoted_to_note_id: null,
          promoted_to_post_id: null,
          created_at: now,
        });
        count++;
      }
    }
    return count;
  }

  async updateItem(
    userId: string,
    id: string,
    data: Partial<RadarItem>
  ): Promise<RadarItem | null> {
    const existing = await this.findItemById(userId, id);
    if (!existing) return null;

    const updated: RadarItem = {
      ...existing,
      ...data,
    };
    this.items.set(id, updated);
    return updated;
  }

  async pruneOldItems(userId: string, retentionDays: number = 7): Promise<number> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    let count = 0;
    for (const [id, item] of this.items.entries()) {
      if (
        item.user_id === userId &&
        !item.is_starred &&
        !item.promoted_to_note_id &&
        !item.promoted_to_post_id &&
        item.published_at < cutoffDate
      ) {
        this.items.delete(id);
        count++;
      }
    }
    return count;
  }
}

export class SupabaseRadarRepository implements IRadarRepository {
  constructor(private client: SupabaseClient) {}

  async findFeeds(userId: string): Promise<RSSFeed[]> {
    const { data, error } = await this.client
      .from("rss_feeds")
      .select("*")
      .eq("user_id", userId)
      .order("title", { ascending: true });

    if (error) throw new Error(`Failed to list feeds: ${error.message}`);
    return (data || []) as RSSFeed[];
  }

  async findFeedById(userId: string, id: string): Promise<RSSFeed | null> {
    const { data, error } = await this.client
      .from("rss_feeds")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as RSSFeed;
  }

  async createFeed(
    userId: string,
    data: CreateFeedDTO & { title: string; site_url?: string | null }
  ): Promise<RSSFeed> {
    const { data: created, error } = await this.client
      .from("rss_feeds")
      .insert({
        user_id: userId,
        title: data.title,
        url: data.url,
        site_url: data.site_url || null,
        category: data.category || "General",
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create feed: ${error.message}`);
    return created as RSSFeed;
  }

  async updateFeed(
    userId: string,
    id: string,
    data: Partial<RSSFeed>
  ): Promise<RSSFeed | null> {
    const { data: updated, error } = await this.client
      .from("rss_feeds")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) return null;
    return updated as RSSFeed;
  }

  async deleteFeed(userId: string, id: string): Promise<boolean> {
    const { error } = await this.client
      .from("rss_feeds")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);

    return !error;
  }

  async findItems(userId: string, filters: RadarFilter = {}): Promise<RadarItem[]> {
    let query = this.client
      .from("radar_items")
      .select("*, feed:rss_feeds(title, category)")
      .eq("user_id", userId);

    if (filters.feed_id) {
      query = query.eq("feed_id", filters.feed_id);
    }
    if (filters.is_read !== undefined) {
      query = query.eq("is_read", filters.is_read);
    }
    if (filters.is_starred !== undefined) {
      query = query.eq("is_starred", filters.is_starred);
    }
    if (filters.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    query = query.order("published_at", { ascending: false }).limit(100);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list radar items: ${error.message}`);
    return (data || []) as RadarItem[];
  }

  async findItemById(userId: string, id: string): Promise<RadarItem | null> {
    const { data, error } = await this.client
      .from("radar_items")
      .select("*, feed:rss_feeds(title, category)")
      .eq("user_id", userId)
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as RadarItem;
  }

  async upsertItems(
    userId: string,
    feedId: string,
    items: Array<{
      title: string;
      url: string;
      author?: string | null;
      summary?: string | null;
      content?: string | null;
      published_at: string;
    }>
  ): Promise<number> {
    if (items.length === 0) return 0;

    const records = items.map((item) => ({
      user_id: userId,
      feed_id: feedId,
      title: item.title,
      url: item.url,
      author: item.author || null,
      summary: item.summary || null,
      content: item.content || null,
      published_at: item.published_at,
    }));

    const { error } = await this.client
      .from("radar_items")
      .upsert(records, {
        onConflict: "user_id,feed_id,url",
        ignoreDuplicates: true,
      });

    if (error) {
      console.error("Upsert items error:", error);
      return 0;
    }
    return records.length;
  }

  async updateItem(
    userId: string,
    id: string,
    data: Partial<RadarItem>
  ): Promise<RadarItem | null> {
    const { data: updated, error } = await this.client
      .from("radar_items")
      .update(data)
      .eq("user_id", userId)
      .eq("id", id)
      .select("*, feed:rss_feeds(title, category)")
      .single();

    if (error || !updated) return null;
    return updated as RadarItem;
  }

  async pruneOldItems(userId: string, retentionDays: number = 7): Promise<number> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await this.client
      .from("radar_items")
      .delete()
      .eq("user_id", userId)
      .eq("is_starred", false)
      .is("promoted_to_note_id", null)
      .is("promoted_to_post_id", null)
      .lt("published_at", cutoffDate)
      .select("id");

    if (error) {
      console.error("Failed to prune old radar items:", error);
      return 0;
    }
    return data?.length || 0;
  }
}

// Global in-memory singleton for development / testing
const globalInMemoryRadarRepo = new InMemoryRadarRepository();

export function getRadarRepository(
  client?: SupabaseClient | null
): IRadarRepository {
  if (client) {
    return new SupabaseRadarRepository(client);
  }
  return globalInMemoryRadarRepo;
}

export function getInMemoryRadarRepository(): InMemoryRadarRepository {
  return globalInMemoryRadarRepo;
}
