import { describe, it, expect } from "vitest";
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
  moveCalendarEventSchema,
  calendarQuerySchema,
  conflictQuerySchema,
} from "./schemas";

describe("Calendar Schemas", () => {
  describe("createCalendarEventSchema", () => {
    it("validates a standard calendar event", () => {
      const valid = {
        title: "Deep Work Sprint",
        description: "Focus on Calendar module M6",
        event_type: "focus",
        start_at: "2026-11-06T10:00:00Z",
        end_at: "2026-11-06T11:30:00Z",
        all_day: false,
        timezone: "America/Los_Angeles",
        location: "Home Office",
      };

      const result = createCalendarEventSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Deep Work Sprint");
        expect(result.data.event_type).toBe("focus");
      }
    });

    it("defaults event_type to personal and all_day to false", () => {
      const minimal = {
        title: "Lunch with Sarah",
        start_at: "2026-11-06T12:00:00Z",
        end_at: "2026-11-06T13:00:00Z",
      };

      const result = createCalendarEventSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.event_type).toBe("personal");
        expect(result.data.all_day).toBe(false);
        expect(result.data.timezone).toBe("UTC");
      }
    });

    it("rejects when end_at is before or equal to start_at", () => {
      const invalid = {
        title: "Time Machine Meeting",
        start_at: "2026-11-06T15:00:00Z",
        end_at: "2026-11-06T14:00:00Z",
      };

      const result = createCalendarEventSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("end_at must be strictly after start_at");
      }
    });

    it("rejects empty title", () => {
      const invalid = {
        title: "   ",
        start_at: "2026-11-06T10:00:00Z",
        end_at: "2026-11-06T11:00:00Z",
      };

      const result = createCalendarEventSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("updateCalendarEventSchema", () => {
    it("validates partial updates", () => {
      const valid = {
        title: "Updated Title",
        location: "New Room",
      };
      const result = updateCalendarEventSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("calendarQuerySchema", () => {
    it("validates query date filters", () => {
      const valid = {
        from: "2026-11-01T00:00:00Z",
        to: "2026-11-30T23:59:59Z",
        type: "meeting",
      };
      const result = calendarQuerySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("moveCalendarEventSchema", () => {
    it("validates move with chronological times", () => {
      const valid = {
        start_at: "2026-11-07T14:00:00Z",
        end_at: "2026-11-07T15:00:00Z",
      };

      const result = moveCalendarEventSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects inverted move times", () => {
      const invalid = {
        start_at: "2026-11-07T15:00:00Z",
        end_at: "2026-11-07T14:00:00Z",
      };

      const result = moveCalendarEventSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("conflictQuerySchema", () => {
    it("validates valid conflict check query", () => {
      const valid = {
        start_at: "2026-11-06T09:00:00Z",
        end_at: "2026-11-06T10:00:00Z",
        exclude_id: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = conflictQuerySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
