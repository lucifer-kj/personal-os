import { z } from "zod";

export const PlatformTypeEnum = z.enum(["x", "linkedin", "threads", "generic"]);
export const PostStatusEnum = z.enum(["draft", "scheduled", "published", "archived"]);
export const MediaTypeEnum = z.enum(["none", "image", "video", "mixed"]);

export const CreateSocialPostSchema = z.object({
  title: z.string().trim().max(150).optional().default(""),
  content: z.string().trim().min(1, "Post content cannot be empty"),
  platform: PlatformTypeEnum.optional().default("x"),
  status: PostStatusEnum.optional().default("draft"),
  media_urls: z.array(z.string().url("Invalid media URL")).optional().default([]),
  media_type: MediaTypeEnum.optional().default("none"),
  scheduled_at: z.string().datetime({ offset: true }).nullable().optional(),
  tags: z.array(z.string().trim()).optional().default([]),
});

export const UpdateSocialPostSchema = z.object({
  title: z.string().trim().max(150).optional(),
  content: z.string().trim().min(1, "Post content cannot be empty").optional(),
  platform: PlatformTypeEnum.optional(),
  status: PostStatusEnum.optional(),
  media_urls: z.array(z.string().url("Invalid media URL")).optional(),
  media_type: MediaTypeEnum.optional(),
  scheduled_at: z.string().datetime({ offset: true }).nullable().optional(),
  published_at: z.string().datetime({ offset: true }).nullable().optional(),
  tags: z.array(z.string().trim()).optional(),
});

export const PostFilterSchema = z.object({
  status: z.enum(["draft", "scheduled", "published", "archived", "all"]).optional().default("all"),
  platform: z.enum(["x", "linkedin", "threads", "generic", "all"]).optional().default("all"),
  search: z.string().trim().optional(),
});

export type CreateSocialPostInput = z.infer<typeof CreateSocialPostSchema>;
export type UpdateSocialPostInput = z.infer<typeof UpdateSocialPostSchema>;
export type PostFilterInput = z.infer<typeof PostFilterSchema>;
