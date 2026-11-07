import { describe, it, expect } from "vitest";
import { CreateSocialPostSchema, PostFilterSchema } from "./schemas";

describe("Studio Schemas", () => {
  it("validates valid post creation data", () => {
    const res = CreateSocialPostSchema.safeParse({
      title: "Launch Thread",
      content: "Excited to share Personal OS today!",
      platform: "x",
      tags: ["buildinpublic", "nextjs"],
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.platform).toBe("x");
      expect(res.data.status).toBe("draft");
      expect(res.data.media_urls).toEqual([]);
    }
  });

  it("fails if content is empty", () => {
    const res = CreateSocialPostSchema.safeParse({
      content: "   ",
    });
    expect(res.success).toBe(false);
  });

  it("defaults platform to x and status to draft", () => {
    const res = CreateSocialPostSchema.safeParse({
      content: "Short thought for today",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.platform).toBe("x");
      expect(res.data.status).toBe("draft");
    }
  });

  it("parses filter schema with defaults", () => {
    const res = PostFilterSchema.safeParse({});
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.status).toBe("all");
      expect(res.data.platform).toBe("all");
    }
  });
});
