import { SupabaseClient } from "@supabase/supabase-js";
import { ISocialPostRepository, getSocialPostRepository } from "./studio.repository";
import {
  SocialPost,
  CreateSocialPostDTO,
  UpdateSocialPostDTO,
  PostFilters,
  PlatformType,
  MediaType,
  PLATFORM_LIMITS,
} from "./types";

export function detectMediaType(urls: string[]): MediaType {
  if (!urls || urls.length === 0) return "none";
  const videoExts = [".mp4", ".mov", ".webm", ".mkv"];
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"];

  let hasVideo = false;
  let hasImage = false;

  for (const url of urls) {
    const clean = url.split("?")[0].toLowerCase();
    if (videoExts.some((ext) => clean.endsWith(ext))) {
      hasVideo = true;
    } else if (imageExts.some((ext) => clean.endsWith(ext))) {
      hasImage = true;
    } else {
      // Default to image if unrecognized
      hasImage = true;
    }
  }

  if (hasVideo && hasImage) return "mixed";
  if (hasVideo) return "video";
  return "image";
}

export function validatePlatformCharacterLimit(
  platform: PlatformType,
  content: string
): { valid: boolean; max: number; count: number } {
  const max = PLATFORM_LIMITS[platform] ?? PLATFORM_LIMITS.generic;
  const count = content.length;
  return {
    valid: count <= max,
    max,
    count,
  };
}

export class SocialStudioService {
  constructor(private repo: ISocialPostRepository) {}

  async listPosts(userId: string, filters?: PostFilters): Promise<SocialPost[]> {
    return this.repo.findMany(userId, filters);
  }

  async getPost(userId: string, id: string): Promise<SocialPost | null> {
    return this.repo.findById(userId, id);
  }

  async createPost(userId: string, dto: CreateSocialPostDTO): Promise<SocialPost> {
    const platform = dto.platform ?? "generic";
    const media_urls = dto.media_urls ?? [];
    const media_type = dto.media_type ?? detectMediaType(media_urls);

    // Validate limit if strictly specified platform
    const limitCheck = validatePlatformCharacterLimit(platform, dto.content);
    if (!limitCheck.valid) {
      throw new Error(
        `Content exceeds character limit for ${platform.toUpperCase()} (${limitCheck.count}/${limitCheck.max})`
      );
    }

    const title =
      dto.title && dto.title.trim().length > 0
        ? dto.title.trim()
        : dto.content.split("\n")[0].slice(0, 50).trim() || "Untitled Post";

    return this.repo.create(userId, {
      ...dto,
      title,
      platform,
      media_urls,
      media_type,
    });
  }

  async updatePost(
    userId: string,
    id: string,
    dto: UpdateSocialPostDTO
  ): Promise<SocialPost | null> {
    const existing = await this.repo.findById(userId, id);
    if (!existing) return null;

    const platform = dto.platform ?? existing.platform;
    const content = dto.content ?? existing.content;

    const limitCheck = validatePlatformCharacterLimit(platform, content);
    if (!limitCheck.valid) {
      throw new Error(
        `Content exceeds character limit for ${platform.toUpperCase()} (${limitCheck.count}/${limitCheck.max})`
      );
    }

    let media_urls = dto.media_urls ?? existing.media_urls;
    let media_type = dto.media_type ?? (dto.media_urls ? detectMediaType(dto.media_urls) : existing.media_type);

    let published_at = dto.published_at;
    if (dto.status === "published" && existing.status !== "published" && !dto.published_at) {
      published_at = new Date().toISOString();
    } else if (dto.status && dto.status !== "published" && existing.status === "published") {
      published_at = null;
    }

    return this.repo.update(userId, id, {
      ...dto,
      platform,
      media_urls,
      media_type,
      ...(published_at !== undefined ? { published_at } : {}),
    });
  }

  async publishPost(userId: string, id: string): Promise<SocialPost | null> {
    return this.updatePost(userId, id, {
      status: "published",
      published_at: new Date().toISOString(),
    });
  }

  async schedulePost(
    userId: string,
    id: string,
    scheduledAt: string
  ): Promise<SocialPost | null> {
    return this.updatePost(userId, id, {
      status: "scheduled",
      scheduled_at: scheduledAt,
    });
  }

  async deletePost(userId: string, id: string): Promise<boolean> {
    return this.repo.delete(userId, id);
  }
}

export function getSocialStudioService(supabase?: SupabaseClient | null): SocialStudioService {
  return new SocialStudioService(getSocialPostRepository(supabase));
}
