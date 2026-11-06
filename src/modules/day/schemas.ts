import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const dateQuerySchema = z.object({
  date: z
    .string()
    .regex(DATE_REGEX, { message: "Date must be in YYYY-MM-DD format" })
    .optional(),
});

export const updateIntentionSchema = z.object({
  date: z
    .string()
    .regex(DATE_REGEX, { message: "Date must be in YYYY-MM-DD format" }),
  intention: z
    .string()
    .trim()
    .max(500, { message: "Intention cannot exceed 500 characters" }),
});

export const updateShutdownNotesSchema = z.object({
  date: z
    .string()
    .regex(DATE_REGEX, { message: "Date must be in YYYY-MM-DD format" }),
  shutdown_notes: z
    .string()
    .trim()
    .max(2000, { message: "Shutdown notes cannot exceed 2000 characters" }),
});

export type DateQueryInput = z.infer<typeof dateQuerySchema>;
export type UpdateIntentionInput = z.infer<typeof updateIntentionSchema>;
export type UpdateShutdownNotesInput = z.infer<typeof updateShutdownNotesSchema>;
