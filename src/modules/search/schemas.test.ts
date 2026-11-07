import { describe, it, expect } from "vitest";
import { SearchQuerySchema } from "./schemas";

describe("SearchQuerySchema", () => {
  it("validates valid search query string", () => {
    const result = SearchQuerySchema.safeParse({ q: "launch roadmap" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("launch roadmap");
      expect(result.data.limit).toBe(20);
    }
  });

  it("trims whitespace from query", () => {
    const result = SearchQuerySchema.safeParse({ q: "  meeting notes   " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("meeting notes");
    }
  });

  it("fails on empty query", () => {
    const result = SearchQuerySchema.safeParse({ q: "   " });
    expect(result.success).toBe(false);
  });

  it("fails on overly long query exceeding 100 characters", () => {
    const result = SearchQuerySchema.safeParse({ q: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("parses comma-separated types string", () => {
    const result = SearchQuerySchema.safeParse({
      q: "deep work",
      types: "task,note",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.types).toEqual(["task", "note"]);
    }
  });

  it("parses string limit to integer", () => {
    const result = SearchQuerySchema.safeParse({
      q: "deep work",
      limit: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(15);
    }
  });
});
