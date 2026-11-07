export type PlatformType = "x" | "linkedin" | "threads" | "generic";

export type PostStatus = "draft" | "scheduled" | "published" | "archived";

export type MediaType = "none" | "image" | "video" | "mixed";

export interface SocialPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  platform: PlatformType;
  status: PostStatus;
  media_urls: string[];
  media_type: MediaType;
  scheduled_at: string | null;
  published_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateSocialPostDTO {
  title?: string;
  content: string;
  platform?: PlatformType;
  status?: PostStatus;
  media_urls?: string[];
  media_type?: MediaType;
  scheduled_at?: string | null;
  tags?: string[];
}

export interface UpdateSocialPostDTO {
  title?: string;
  content?: string;
  platform?: PlatformType;
  status?: PostStatus;
  media_urls?: string[];
  media_type?: MediaType;
  scheduled_at?: string | null;
  published_at?: string | null;
  tags?: string[];
}

export interface PostFilters {
  status?: PostStatus | "all";
  platform?: PlatformType | "all";
  search?: string;
}

export const PLATFORM_LIMITS: Record<PlatformType, number> = {
  x: 280,
  threads: 500,
  linkedin: 3000,
  generic: 10000,
};
