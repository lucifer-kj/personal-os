import { z } from "zod";

export const CreateFeedSchema = z.object({
  url: z.string().url("Must be a valid feed URL (http/https)"),
  title: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional().default("General"),
});

export const RadarFilterSchema = z.object({
  feed_id: z.string().uuid().optional(),
  category: z.string().trim().optional(),
  is_read: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  is_starred: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  search: z.string().trim().optional(),
});

export const PromoteRadarItemSchema = z.object({
  target: z.enum(["note", "post"]),
  title: z.string().trim().max(200).optional(),
  notes: z.string().trim().optional(),
});

export const UpdateRadarItemSchema = z.object({
  is_read: z.boolean().optional(),
  is_starred: z.boolean().optional(),
});
