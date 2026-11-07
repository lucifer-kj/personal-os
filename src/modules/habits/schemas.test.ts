import { describe, it, expect } from "vitest";
import {
  CreateHabitSchema,
  UpdateHabitSchema,
  LogHabitSchema,
  HabitFilterSchema,
} from "./schemas";

describe("Habit Schemas", () => {
  describe("CreateHabitSchema", () => {
    it("validates valid habit payload with defaults", () => {
      const parsed = CreateHabitSchema.parse({
        name: "Morning Meditation",
      });

      expect(parsed.name).toBe("Morning Meditation");
      expect(parsed.frequency).toBe("daily");
      expect(parsed.target_days).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(parsed.target_count).toBe(1);
      expect(parsed.color).toBe("terracotta");
    });

    it("rejects empty name", () => {
      expect(() =>
        CreateHabitSchema.parse({
          name: "   ",
        })
      ).toThrow();
    });

    it("validates custom frequency and target days", () => {
      const parsed = CreateHabitSchema.parse({
        name: "Gym Workout",
        frequency: "custom",
        target_days: [1, 3, 5],
        target_count: 1,
        color: "sage",
      });

      expect(parsed.frequency).toBe("custom");
      expect(parsed.target_days).toEqual([1, 3, 5]);
    });
  });

  describe("UpdateHabitSchema", () => {
    it("allows partial updates", () => {
      const parsed = UpdateHabitSchema.parse({
        name: "Updated Meditation",
        is_archived: true,
      });

      expect(parsed.name).toBe("Updated Meditation");
      expect(parsed.is_archived).toBe(true);
    });
  });

  describe("LogHabitSchema", () => {
    it("validates valid log with defaults", () => {
      const parsed = LogHabitSchema.parse({
        date: "2026-11-06",
      });

      expect(parsed.date).toBe("2026-11-06");
      expect(parsed.completed).toBe(true);
      expect(parsed.count).toBe(1);
    });

    it("rejects invalid date format", () => {
      expect(() =>
        LogHabitSchema.parse({
          date: "11/06/2026",
        })
      ).toThrow();
    });
  });

  describe("HabitFilterSchema", () => {
    it("transforms string boolean to boolean", () => {
      const parsed = HabitFilterSchema.parse({
        is_archived: "true",
      });
      expect(parsed.is_archived).toBe(true);
    });
  });
});
