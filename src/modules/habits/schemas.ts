import { z } from "zod";

export const HabitFrequencySchema = z.enum(["daily", "weekdays", "weekends", "custom"]);

export const CreateHabitSchema = z.object({
  name: z.string().trim().min(1, "Habit name is required").max(120, "Name cannot exceed 120 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().default(""),
  frequency: HabitFrequencySchema.optional().default("daily"),
  target_days: z
    .array(z.number().int().min(1).max(7))
    .optional()
    .default([1, 2, 3, 4, 5, 6, 7]),
  target_count: z.number().int().min(1, "Target count must be at least 1").optional().default(1),
  color: z.string().max(32).optional().default("terracotta"),
});

export const UpdateHabitSchema = z.object({
  name: z.string().trim().min(1, "Habit name cannot be empty").max(120).optional(),
  description: z.string().max(500).optional(),
  frequency: HabitFrequencySchema.optional(),
  target_days: z.array(z.number().int().min(1).max(7)).optional(),
  target_count: z.number().int().min(1).optional(),
  color: z.string().max(32).optional(),
  is_archived: z.boolean().optional(),
});

export const LogHabitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be formatted as YYYY-MM-DD"),
  completed: z.boolean().optional().default(true),
  count: z.number().int().min(0, "Count cannot be negative").optional().default(1),
  note: z.string().max(300, "Note cannot exceed 300 characters").optional().default(""),
});

export const HabitFilterSchema = z.object({
  is_archived: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val !== undefined ? val === "true" : undefined)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be formatted as YYYY-MM-DD").optional(),
});
