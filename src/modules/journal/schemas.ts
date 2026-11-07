import { z } from "zod";

export const JournalMoodSchema = z.enum(["great", "good", "neutral", "low", "rough"]);

export const CreateJournalSchema = z.object({
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "entry_date must be formatted as YYYY-MM-DD"),
  title: z.string().max(200, "Title cannot exceed 200 characters").optional().default(""),
  content: z.string().max(20000, "Content cannot exceed 20,000 characters").optional().default(""),
  mood: JournalMoodSchema.nullable().optional().default(null),
  energy_level: z.number().int().min(1).max(5).nullable().optional().default(null),
  reflection: z.string().max(2000, "Reflection cannot exceed 2,000 characters").optional().default(""),
  gratitude: z.array(z.string().max(250)).optional().default([]),
  tags: z.array(z.string().max(50)).optional().default([]),
});

export const UpdateJournalSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().max(20000).optional(),
  mood: JournalMoodSchema.nullable().optional(),
  energy_level: z.number().int().min(1).max(5).nullable().optional(),
  reflection: z.string().max(2000).optional(),
  gratitude: z.array(z.string().max(250)).optional(),
  tags: z.array(z.string().max(50)).optional(),
});

export const JournalFilterSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  mood: JournalMoodSchema.optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(30),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});
