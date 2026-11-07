import { describe, it, expect } from "vitest";
import { CreateTaskSchema, UpdateTaskSchema, TaskQuerySchema } from "./schemas";

describe("Task validation schemas", () => {
  describe("CreateTaskSchema", () => {
    it("accepts valid input with minimal required fields", () => {
      const result = CreateTaskSchema.safeParse({ title: "Write system documentation" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Write system documentation");
        expect(result.data.status).toBe("todo");
        expect(result.data.priority).toBe("medium");
      }
    });

    it("accepts full valid task payload", () => {
      const result = CreateTaskSchema.safeParse({
        title: "Finish sprint milestone",
        description: "Review unit tests and submit PR",
        priority: "urgent",
        status: "in_progress",
        due_at: "2026-11-10T12:00:00.000Z",
        due_date: "2026-11-10",
        estimated_minutes: 90,
        scheduled_start_at: "2026-11-10T09:00:00.000Z",
        scheduled_end_at: "2026-11-10T10:30:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty or whitespace-only title", () => {
      const result = CreateTaskSchema.safeParse({ title: "   " });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Task title is required");
      }
    });

    it("rejects scheduled_end_at earlier than scheduled_start_at", () => {
      const result = CreateTaskSchema.safeParse({
        title: "Invalid schedule",
        scheduled_start_at: "2026-11-10T11:00:00.000Z",
        scheduled_end_at: "2026-11-10T10:00:00.000Z",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Scheduled end time must be after scheduled start time");
      }
    });

    it("rejects invalid ISO dates", () => {
      const result = CreateTaskSchema.safeParse({
        title: "Bad date",
        due_at: "not-a-date",
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative estimated minutes", () => {
      const result = CreateTaskSchema.safeParse({
        title: "Negative estimate",
        estimated_minutes: -10,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateTaskSchema", () => {
    it("allows partial updates", () => {
      const result = UpdateTaskSchema.safeParse({ priority: "high" });
      expect(result.success).toBe(true);
    });

    it("rejects empty title if provided", () => {
      const result = UpdateTaskSchema.safeParse({ title: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("TaskQuerySchema", () => {
    it("parses valid query parameters with defaults", () => {
      const result = TaskQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
        expect(result.data.offset).toBe(0);
        expect(result.data.include_deleted).toBe(false);
      }
    });

    it("constrains limit between 1 and 100", () => {
      const resultUnder = TaskQuerySchema.safeParse({ limit: 0 });
      expect(resultUnder.success).toBe(false);

      const resultOver = TaskQuerySchema.safeParse({ limit: 150 });
      expect(resultOver.success).toBe(false);

      const resultValid = TaskQuerySchema.safeParse({ limit: 50 });
      expect(resultValid.success).toBe(true);
    });

    it("parses comma-delimited status and priority into arrays", () => {
      const result = TaskQuerySchema.safeParse({
        status: "todo,in_progress",
        priority: "high,urgent",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toEqual(["todo", "in_progress"]);
        expect(result.data.priority).toEqual(["high", "urgent"]);
      }
    });
  });
});
