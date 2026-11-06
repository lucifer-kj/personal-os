import { z } from "zod";

export const ProjectStatusEnum = z.enum([
  "planned",
  "active",
  "on_hold",
  "completed",
  "archived",
]);

export const ProjectPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

export const CreateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required")
      .max(255, "Project name cannot exceed 255 characters"),
    description: z.string().trim().max(4000).optional().nullable(),
    status: ProjectStatusEnum.optional().default("active"),
    priority: ProjectPriorityEnum.optional().default("medium"),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be in YYYY-MM-DD format")
      .optional()
      .nullable(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "due_date must be in YYYY-MM-DD format")
      .optional()
      .nullable(),
    color: z.string().max(50).optional().nullable(),
    icon: z.string().max(50).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.due_date) {
        return data.due_date >= data.start_date;
      }
      return true;
    },
    {
      message: "Target deadline cannot be earlier than planned start date",
      path: ["due_date"],
    }
  );

export const UpdateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Project name cannot be empty")
      .max(255, "Project name cannot exceed 255 characters")
      .optional(),
    description: z.string().trim().max(4000).optional().nullable(),
    status: ProjectStatusEnum.optional(),
    priority: ProjectPriorityEnum.optional(),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be in YYYY-MM-DD format")
      .optional()
      .nullable(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "due_date must be in YYYY-MM-DD format")
      .optional()
      .nullable(),
    color: z.string().max(50).optional().nullable(),
    icon: z.string().max(50).optional().nullable(),
    sort_order: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.due_date) {
        return data.due_date >= data.start_date;
      }
      return true;
    },
    {
      message: "Target deadline cannot be earlier than planned start date",
      path: ["due_date"],
    }
  );

export const ProjectQuerySchema = z.object({
  status: z.union([ProjectStatusEnum, z.array(ProjectStatusEnum)]).optional(),
  priority: z.union([ProjectPriorityEnum, z.array(ProjectPriorityEnum)]).optional(),
  search: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
  include_deleted: z.coerce.boolean().default(false),
});

export const CreateMilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Milestone title is required")
    .max(255, "Milestone title cannot exceed 255 characters"),
  description: z.string().trim().max(2000).optional().nullable(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "due_date must be in YYYY-MM-DD format")
    .optional()
    .nullable(),
  status: z.enum(["pending", "completed"]).optional().default("pending"),
});
