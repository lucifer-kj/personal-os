import { describe, it, expect } from "vitest";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectQuerySchema,
  CreateMilestoneSchema,
} from "./schemas";

describe("Project validation schemas", () => {
  describe("CreateProjectSchema", () => {
    it("accepts valid input with required fields", () => {
      const result = CreateProjectSchema.safeParse({ name: "Personal OS Launch" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Personal OS Launch");
        expect(result.data.status).toBe("active");
        expect(result.data.priority).toBe("medium");
      }
    });

    it("accepts complete payload with dates", () => {
      const result = CreateProjectSchema.safeParse({
        name: "Q4 Infrastructure Overhaul",
        description: "Migrate to multi-region Supabase",
        priority: "high",
        status: "active",
        start_date: "2026-11-01",
        due_date: "2026-11-30",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty or whitespace-only name", () => {
      const result = CreateProjectSchema.safeParse({ name: "   " });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Project name is required");
      }
    });

    it("rejects due_date earlier than start_date", () => {
      const result = CreateProjectSchema.safeParse({
        name: "Invalid Schedule Project",
        start_date: "2026-11-20",
        due_date: "2026-11-10",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Target deadline cannot be earlier than planned start date");
      }
    });

    it("rejects invalid date format", () => {
      const result = CreateProjectSchema.safeParse({
        name: "Bad Date",
        start_date: "11-01-2026",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateProjectSchema", () => {
    it("allows partial updates", () => {
      const result = UpdateProjectSchema.safeParse({ priority: "urgent" });
      expect(result.success).toBe(true);
    });

    it("rejects empty name if provided", () => {
      const result = UpdateProjectSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("ProjectQuerySchema", () => {
    it("applies defaults for pagination", () => {
      const result = ProjectQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
        expect(result.data.offset).toBe(0);
      }
    });
  });

  describe("CreateMilestoneSchema", () => {
    it("accepts valid milestone data", () => {
      const result = CreateMilestoneSchema.safeParse({
        title: "Database schema migration complete",
        due_date: "2026-11-15",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("pending");
      }
    });

    it("rejects empty milestone title", () => {
      const result = CreateMilestoneSchema.safeParse({ title: "" });
      expect(result.success).toBe(false);
    });
  });
});
