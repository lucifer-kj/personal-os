import { describe, it, expect } from "vitest";
import {
  createInboxItemSchema,
  processInboxItemSchema,
} from "./schemas";

describe("Inbox Zod Schemas", () => {
  it("validates create inbox item with default type and source", () => {
    const valid = createInboxItemSchema.safeParse({
      title: "Read article about offline-first React",
    });

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.capture_type).toBe("idea");
      expect(valid.data.source).toBe("manual");
    }
  });

  it("validates URL or empty string correctly", () => {
    const withUrl = createInboxItemSchema.safeParse({
      title: "Check link",
      url: "https://news.ycombinator.com",
    });
    expect(withUrl.success).toBe(true);

    const withEmptyUrl = createInboxItemSchema.safeParse({
      title: "Check link",
      url: "",
    });
    expect(withEmptyUrl.success).toBe(true);

    const withBadUrl = createInboxItemSchema.safeParse({
      title: "Bad link",
      url: "not-a-valid-url",
    });
    expect(withBadUrl.success).toBe(false);
  });

  it("validates process schema into task with due date regex", () => {
    const validTask = processInboxItemSchema.safeParse({
      target_type: "task",
      priority: "urgent",
      due_date: "2026-11-20",
    });
    expect(validTask.success).toBe(true);

    const invalidDate = processInboxItemSchema.safeParse({
      target_type: "task",
      due_date: "invalid-date",
    });
    expect(invalidDate.success).toBe(false);
  });
});
