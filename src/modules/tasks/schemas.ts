import { z } from "zod";

export const TaskStatusEnum = z.enum([
  "inbox",
  "todo",
  "in_progress",
  "blocked",
  "completed",
  "cancelled",
]);

export const TaskPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

export const CreateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Task title is required")
      .max(255, "Task title cannot exceed 255 characters"),
    description: z.string().trim().max(4000).optional().nullable(),
    status: TaskStatusEnum.optional().default("todo"),
    priority: TaskPriorityEnum.optional().default("medium"),
    due_at: z.string().datetime({ message: "Invalid ISO datetime for due_at" }).optional().nullable(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "due_date must be in YYYY-MM-DD format")
      .optional()
      .nullable(),
    project_id: z.string().uuid("Invalid project UUID").optional().nullable(),
    task_list_id: z.string().uuid("Invalid task list UUID").optional().nullable(),
    parent_task_id: z.string().uuid("Invalid parent task UUID").optional().nullable(),
    estimated_minutes: z
      .number()
      .int()
      .min(0, "Estimated minutes cannot be negative")
      .max(10080, "Estimated minutes cannot exceed one week")
      .optional()
      .nullable(),
    scheduled_start_at: z
      .string()
      .datetime({ message: "Invalid ISO datetime for scheduled_start_at" })
      .optional()
      .nullable(),
    scheduled_end_at: z
      .string()
      .datetime({ message: "Invalid ISO datetime for scheduled_end_at" })
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.scheduled_start_at && data.scheduled_end_at) {
        return new Date(data.scheduled_end_at) > new Date(data.scheduled_start_at);
      }
      return true;
    },
    {
      message: "Scheduled end time must be after scheduled start time",
      path: ["scheduled_end_at"],
    }
  );

export const UpdateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Task title cannot be empty")
      .max(255, "Task title cannot exceed 255 characters")
      .optional(),
    description: z.string().trim().max(4000).optional().nullable(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    due_at: z.string().datetime({ message: "Invalid ISO datetime for due_at" }).optional().nullable(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "due_date must be in YYYY-MM-DD format")
      .optional()
      .nullable(),
    project_id: z.string().uuid("Invalid project UUID").optional().nullable(),
    task_list_id: z.string().uuid("Invalid task list UUID").optional().nullable(),
    parent_task_id: z.string().uuid("Invalid parent task UUID").optional().nullable(),
    estimated_minutes: z
      .number()
      .int()
      .min(0, "Estimated minutes cannot be negative")
      .max(10080)
      .optional()
      .nullable(),
    scheduled_start_at: z
      .string()
      .datetime({ message: "Invalid ISO datetime for scheduled_start_at" })
      .optional()
      .nullable(),
    scheduled_end_at: z
      .string()
      .datetime({ message: "Invalid ISO datetime for scheduled_end_at" })
      .optional()
      .nullable(),
    sort_order: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.scheduled_start_at && data.scheduled_end_at) {
        return new Date(data.scheduled_end_at) > new Date(data.scheduled_start_at);
      }
      return true;
    },
    {
      message: "Scheduled end time must be after scheduled start time",
      path: ["scheduled_end_at"],
    }
  );

export const TaskQuerySchema = z.object({
  status: z.union([TaskStatusEnum, z.array(TaskStatusEnum)]).optional(),
  priority: z.union([TaskPriorityEnum, z.array(TaskPriorityEnum)]).optional(),
  project_id: z.string().uuid().optional(),
  search: z.string().trim().max(100).optional(),
  due_before: z.string().datetime().optional(),
  due_after: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
  include_deleted: z.coerce.boolean().default(false),
});
