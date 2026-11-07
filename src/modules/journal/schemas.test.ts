import { describe, it, expect } from "vitest";
import {
  CreateJournalSchema,
  UpdateJournalSchema,
  JournalFilterSchema,
} from "./schemas";

describe("Journal Schemas", () => {
  describe("CreateJournalSchema", () => {
    it("validates valid entry with defaults", () => {
      const parsed = CreateJournalSchema.parse({
        entry_date: "2026-11-06",
        title: "Deep Work Friday",
        content: "Accomplished all sprint goals today.",
        mood: "great",
        energy_level: 5,
        gratitude: ["Good health", "Productive focus"],
      });

      expect(parsed.entry_date).toBe("2026-11-06");
      expect(parsed.title).toBe("Deep Work Friday");
      expect(parsed.mood).toBe("great");
      expect(parsed.energy_level).toBe(5);
      expect(parsed.gratitude).toHaveLength(2);
    });

    it("rejects invalid date format", () => {
      expect(() =>
        CreateJournalSchema.parse({
          entry_date: "invalid-date",
        })
      ).toThrow();
    });

    it("rejects energy level out of range", () => {
      expect(() =>
        CreateJournalSchema.parse({
          entry_date: "2026-11-06",
          energy_level: 6,
        })
      ).toThrow();
    });
  });

  describe("UpdateJournalSchema", () => {
    it("allows partial updates", () => {
      const parsed = UpdateJournalSchema.parse({
        reflection: "Weekly reflection on productivity and rest.",
      });

      expect(parsed.reflection).toBe("Weekly reflection on productivity and rest.");
    });
  });

  describe("JournalFilterSchema", () => {
    it("coerces limit and offset numbers", () => {
      const parsed = JournalFilterSchema.parse({
        limit: "15",
        offset: "30",
        mood: "good",
      });

      expect(parsed.limit).toBe(15);
      expect(parsed.offset).toBe(30);
      expect(parsed.mood).toBe("good");
    });
  });
});
