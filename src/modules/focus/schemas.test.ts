import { describe, it, expect } from "vitest";
import {
  startFocusSessionSchema,
  completeFocusSessionSchema,
  abandonFocusSessionSchema,
} from "./schemas";

describe("Focus Zod Schemas", () => {
  it("validates valid start session input", () => {
    const valid = startFocusSessionSchema.safeParse({
      session_mode: "pomodoro",
      planned_duration_seconds: 1500,
      description: "Writing chapter 1",
    });

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.session_mode).toBe("pomodoro");
      expect(valid.data.planned_duration_seconds).toBe(1500);
    }
  });

  it("applies default mode and rejects negative duration", () => {
    const withDefaults = startFocusSessionSchema.safeParse({});
    expect(withDefaults.success).toBe(true);
    if (withDefaults.success) {
      expect(withDefaults.data.session_mode).toBe("deep_work");
    }

    const negative = startFocusSessionSchema.safeParse({
      planned_duration_seconds: -10,
    });
    expect(negative.success).toBe(false);
  });

  it("validates complete session schema with rating constraints (1-5)", () => {
    const valid = completeFocusSessionSchema.safeParse({
      session_rating: 4,
      notes: "Productive focus block",
      mark_task_completed: true,
    });
    expect(valid.success).toBe(true);

    const invalidRating = completeFocusSessionSchema.safeParse({
      session_rating: 6,
    });
    expect(invalidRating.success).toBe(false);

    const zeroRating = completeFocusSessionSchema.safeParse({
      session_rating: 0,
    });
    expect(zeroRating.success).toBe(false);
  });

  it("validates abandon session schema", () => {
    const valid = abandonFocusSessionSchema.safeParse({
      reason: "Unexpected team call",
    });
    expect(valid.success).toBe(true);
  });
});
