import { SupabaseClient } from "@supabase/supabase-js";
import {
  SocialPost,
  CreateSocialPostDTO,
  UpdateSocialPostDTO,
  PostFilters,
} from "./types";

export interface ISocialPostRepository {
  findMany(userId: string, filters?: PostFilters): Promise<SocialPost[]>;
  findById(userId: string, id: string): Promise<SocialPost | null>;
  create(userId: string, data: CreateSocialPostDTO): Promise<SocialPost>;
  update(userId: string, id: string, data: UpdateSocialPostDTO): Promise<SocialPost | null>;
  delete(userId: string, id: string): Promise<boolean>;
}

export class InMemorySocialPostRepository implements ISocialPostRepository {
  private posts: Map<string, SocialPost> = new Map();

  clear(): void {
    this.posts.clear();
  }

  async findMany(userId: string, filters: PostFilters = {}): Promise<SocialPost[]> {
    let result = Array.from(this.posts.values()).filter(
      (p) => p.user_id === userId && !p.deleted_at
    );

    if (filters.status && filters.status !== "all") {
      result = result.filter((p) => p.status === filters.status);
    }

    if (filters.platform && filters.platform !== "all") {
      result = result.filter((p) => p.platform === filters.platform);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.content.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return result;
  }

  async findById(userId: string, id: string): Promise<SocialPost | null> {
    const post = this.posts.get(id);
    if (!post || post.user_id !== userId || post.deleted_at) return null;
    return post;
  }

  async create(userId: string, data: CreateSocialPostDTO): Promise<SocialPost> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const post: SocialPost = {
      id,
      user_id: userId,
      title: data.title || "",
      content: data.content,
      platform: data.platform || "x",
      status: data.status || "draft",
      media_urls: data.media_urls || [],
      media_type: data.media_type || "none",
      scheduled_at: data.scheduled_at || null,
      published_at: null,
      tags: data.tags || [],
      created_at: now,
      updated_at: now,
    };

    this.posts.set(id, post);
    return post;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateSocialPostDTO
  ): Promise<SocialPost | null> {
    const post = await this.findById(userId, id);
    if (!post) return null;

    const updated: SocialPost = {
      ...post,
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.posts.set(id, updated);
    return updated;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const post = await this.findById(userId, id);
    if (!post) return false;

    post.deleted_at = new Date().toISOString();
    this.posts.set(id, post);
    return true;
  }
}

export class SupabaseSocialPostRepository implements ISocialPostRepository {
  constructor(private client: SupabaseClient) {}

  async findMany(userId: string, filters: PostFilters = {}): Promise<SocialPost[]> {
    let query = this.client
      .from("social_posts")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.platform && filters.platform !== "all") {
      query = query.eq("platform", filters.platform);
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as SocialPost[];
  }

  async findById(userId: string, id: string): Promise<SocialPost | null> {
    const { data, error } = await this.client
      .from("social_posts")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) return null;
    return data as SocialPost;
  }

  async create(userId: string, data: CreateSocialPostDTO): Promise<SocialPost> {
    const { data: created, error } = await this.client
      .from("social_posts")
      .insert({
        user_id: userId,
        title: data.title || "",
        content: data.content,
        platform: data.platform || "x",
        status: data.status || "draft",
        media_urls: data.media_urls || [],
        media_type: data.media_type || "none",
        scheduled_at: data.scheduled_at || null,
        tags: data.tags || [],
      })
      .select()
      .single();

    if (error || !created) {
      throw new Error(error?.message || "Failed to create social post");
    }
    return created as SocialPost;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateSocialPostDTO
  ): Promise<SocialPost | null> {
    const { data: updated, error } = await this.client
      .from("social_posts")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) return null;
    return updated as SocialPost;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const { error } = await this.client
      .from("social_posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("id", id);

    return !error;
  }
}

// Global in-memory singleton for development / testing
const globalInMemorySocialRepo = new InMemorySocialPostRepository();

export function getSocialPostRepository(
  client?: SupabaseClient | null
): ISocialPostRepository {
  if (client) {
    return new SupabaseSocialPostRepository(client);
  }
  return globalInMemorySocialRepo;
}

export function getInMemorySocialPostRepository(): InMemorySocialPostRepository {
  return globalInMemorySocialRepo;
}
