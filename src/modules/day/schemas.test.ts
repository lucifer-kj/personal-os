import { describe, it, expect } from "vitest";
import {
  dateQuerySchema,
  updateIntentionSchema,
  updateShutdownNotesSchema,
} from "./schemas";

describe("Day module Zod Schemas", () => {
  describe("dateQuerySchema", () => {
    it("accepts undefined or omitted date", () => {
      const res = dateQuerySchema.safeParse({});
      expect(res.success).toBe(true);
    });

    it("accepts valid YYYY-MM-DD format", () => {
      const res = dateQuerySchema.safeParse({ date: "2026-11-06" });
      expect(res.success).toBe(true);
    });

    it("rejects invalid date format", () => {
      const res = dateQuerySchema.safeParse({ date: "06-11-2026" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain("YYYY-MM-DD");
      }
    });
  });

  describe("updateIntentionSchema", () => {
    it("accepts valid date and intention string", () => {
      const res = updateIntentionSchema.safeParse({
        date: "2026-11-06",
        intention: "Ship the Day Planner milestone with verified tests.",
      });
      expect(res.success).toBe(true);
    });

    it("rejects missing date", () => {
      const res = updateIntentionSchema.safeParse({
        intention: "Ship the Day Planner milestone",
      });
      expect(res.success).toBe(false);
    });

    it("rejects intention exceeding 500 characters", () => {
      const longText = "a".repeat(501);
      const res = updateIntentionSchema.safeParse({
        date: "2026-11-06",
        intention: longText,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain("500");
      }
    });
  });

  describe("updateShutdownNotesSchema", () => {
    it("accepts valid shutdown notes", () => {
      const res = updateShutdownNotesSchema.safeParse({
        date: "2026-11-06",
        shutdown_notes: "Completed all scheduled items and reviewed open issues.",
      });
      expect(res.success).toBe(true);
    });

    it("rejects shutdown notes exceeding 2000 characters", () => {
      const longText = "a".repeat(2001);
      const res = updateShutdownNotesSchema.safeParse({
        date: "2026-11-06",
        shutdown_notes: longText,
      });
      expect(res.success).toBe(false);
    });
  });
});
