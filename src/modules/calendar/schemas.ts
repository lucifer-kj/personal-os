import { z } from "zod";

export const eventTypeSchema = z.enum([
  "personal",
  "focus",
  "meeting",
  "reminder",
  "external",
]);

export const createCalendarEventSchema = z
  .object({
    title: z.string().trim().min(1, "Event title is required").max(255),
    description: z.string().trim().optional().nullable(),
    event_type: eventTypeSchema.default("personal"),
    start_at: z.string().datetime({ message: "start_at must be a valid ISO 8601 UTC timestamp" }),
    end_at: z.string().datetime({ message: "end_at must be a valid ISO 8601 UTC timestamp" }),
    all_day: z.boolean().default(false),
    timezone: z.string().default("UTC"),
    location: z.string().trim().optional().nullable(),
    project_id: z.string().uuid().optional().nullable(),
    task_id: z.string().uuid().optional().nullable(),
  })
  .refine(
    (data) => new Date(data.end_at).getTime() > new Date(data.start_at).getTime(),
    {
      message: "end_at must be strictly after start_at",
      path: ["end_at"],
    }
  );

export const updateCalendarEventSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().optional().nullable(),
    event_type: eventTypeSchema.optional(),
    start_at: z.string().datetime().optional(),
    end_at: z.string().datetime().optional(),
    all_day: z.boolean().optional(),
    timezone: z.string().optional(),
    location: z.string().trim().optional().nullable(),
    project_id: z.string().uuid().optional().nullable(),
    task_id: z.string().uuid().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.start_at && data.end_at) {
        return new Date(data.end_at).getTime() > new Date(data.start_at).getTime();
      }
      return true;
    },
    {
      message: "end_at must be strictly after start_at",
      path: ["end_at"],
    }
  );

export const moveCalendarEventSchema = z
  .object({
    start_at: z.string().datetime({ message: "start_at must be a valid ISO 8601 UTC timestamp" }),
    end_at: z.string().datetime({ message: "end_at must be a valid ISO 8601 UTC timestamp" }),
  })
  .refine(
    (data) => new Date(data.end_at).getTime() > new Date(data.start_at).getTime(),
    {
      message: "end_at must be strictly after start_at",
      path: ["end_at"],
    }
  );

export const calendarQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  type: eventTypeSchema.optional(),
  project_id: z.string().uuid().optional(),
  task_id: z.string().uuid().optional(),
});

export const conflictQuerySchema = z
  .object({
    start_at: z.string().datetime({ message: "start_at must be a valid ISO timestamp" }),
    end_at: z.string().datetime({ message: "end_at must be a valid ISO timestamp" }),
    exclude_id: z.string().uuid().optional(),
  })
  .refine(
    (data) => new Date(data.end_at).getTime() > new Date(data.start_at).getTime(),
    {
      message: "end_at must be after start_at",
      path: ["end_at"],
    }
  );

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;
export type MoveCalendarEventInput = z.infer<typeof moveCalendarEventSchema>;
