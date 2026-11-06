import { z } from "zod";

export const sessionModeSchema = z.enum([
  "deep_work",
  "pomodoro",
  "short_break",
  "long_break",
  "custom",
]);

export const sessionStatusSchema = z.enum([
  "running",
  "paused",
  "completed",
  "abandoned",
]);

export const startFocusSessionSchema = z.object({
  task_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  description: z.string().max(255).nullable().optional(),
  session_mode: sessionModeSchema.default("deep_work"),
  planned_duration_seconds: z.number().int().positive().nullable().optional(),
});

export const completeFocusSessionSchema = z.object({
  session_rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  mark_task_completed: z.boolean().default(false).optional(),
});

export const abandonFocusSessionSchema = z.object({
  reason: z.string().max(500).nullable().optional(),
});
