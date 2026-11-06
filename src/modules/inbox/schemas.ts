import { z } from "zod";

export const captureTypeSchema = z.enum([
  "task",
  "note",
  "idea",
  "link",
  "reminder",
  "other",
]);

export const inboxStatusSchema = z.enum([
  "unprocessed",
  "processed",
  "dismissed",
]);

export const createInboxItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  content: z.string().max(10000).nullable().optional(),
  capture_type: captureTypeSchema.default("idea"),
  source: z.enum(["manual", "widget", "extension", "ai", "integration"]).default("manual"),
  url: z.string().url("Must be a valid URL").nullable().optional().or(z.literal("")),
});

export const updateInboxItemSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().max(10000).nullable().optional(),
  capture_type: captureTypeSchema.optional(),
  status: inboxStatusSchema.optional(),
  url: z.string().url().nullable().optional().or(z.literal("")),
});

export const processInboxItemSchema = z.object({
  target_type: z.enum(["task", "note", "project", "event"]),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD").nullable().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  project_id: z.string().uuid().nullable().optional(),
});
