import { z } from "zod";

export const noteTypeSchema = z.enum([
  "standard",
  "meeting",
  "concept",
  "project",
  "reference",
]);

export const contentFormatSchema = z.enum([
  "markdown",
  "plain_text",
  "tiptap_json",
]);

export const linkTypeSchema = z.enum(["related", "references", "derived_from"]);

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .max(255, "Title cannot exceed 255 characters")
    .default("Untitled Note"),
  content: z.string().default(""),
  content_format: contentFormatSchema.default("markdown"),
  note_type: noteTypeSchema.default("standard"),
  project_id: z.string().uuid("project_id must be a valid UUID").optional().nullable(),
  task_id: z.string().uuid("task_id must be a valid UUID").optional().nullable(),
  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(20, "Cannot add more than 20 tags")
    .default([])
    .transform((tags) =>
      Array.from(new Set(tags.map((t) => t.toLowerCase())))
    ),
  is_pinned: z.boolean().default(false),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().max(255).optional(),
  content: z.string().optional(),
  content_format: contentFormatSchema.optional(),
  note_type: noteTypeSchema.optional(),
  project_id: z.string().uuid().optional().nullable(),
  task_id: z.string().uuid().optional().nullable(),
  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(20)
    .optional()
    .transform((tags) =>
      tags ? Array.from(new Set(tags.map((t) => t.toLowerCase()))) : undefined
    ),
  is_pinned: z.boolean().optional(),
  is_archived: z.boolean().optional(),
});

export const createNoteLinkSchema = z.object({
  target_note_id: z.string().uuid("target_note_id must be a valid UUID"),
  link_type: linkTypeSchema.default("related"),
});

export const noteQuerySchema = z.object({
  search: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  project_id: z.string().uuid().optional(),
  task_id: z.string().uuid().optional(),
  note_type: noteTypeSchema.optional(),
  is_pinned: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  is_archived: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CreateNoteLinkInput = z.infer<typeof createNoteLinkSchema>;
