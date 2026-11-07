import { describe, it, expect, beforeEach } from "vitest";
import {
  SocialStudioService,
  detectMediaType,
  validatePlatformCharacterLimit,
} from "./studio.service";
import { InMemorySocialPostRepository } from "./studio.repository";

describe("SocialStudioService & Utilities", () => {
  let repo: InMemorySocialPostRepository;
  let service: SocialStudioService;
  const userId = "test-user-123";

  beforeEach(() => {
    repo = new InMemorySocialPostRepository();
    service = new SocialStudioService(repo);
  });

  describe("detectMediaType", () => {
    it("returns 'none' for empty or missing urls", () => {
      expect(detectMediaType([])).toBe("none");
    });

    it("detects image files", () => {
      expect(detectMediaType(["https://domain.com/photo.png"])).toBe("image");
      expect(detectMediaType(["https://domain.com/photo.jpg?token=abc"])).toBe("image");
    });

    it("detects video files", () => {
      expect(detectMediaType(["https://domain.com/clip.mp4"])).toBe("video");
      expect(detectMediaType(["https://domain.com/clip.webm"])).toBe("video");
    });

    it("detects mixed media", () => {
      expect(
        detectMediaType([
          "https://domain.com/photo.jpg",
          "https://domain.com/clip.mp4",
        ])
      ).toBe("mixed");
    });
  });

  describe("validatePlatformCharacterLimit", () => {
    it("validates X (Twitter) 280 character limit", () => {
      const short = "Hello world";
      const long = "a".repeat(281);
      expect(validatePlatformCharacterLimit("x", short).valid).toBe(true);
      expect(validatePlatformCharacterLimit("x", long).valid).toBe(false);
      expect(validatePlatformCharacterLimit("x", long).max).toBe(280);
    });

    it("validates Threads 500 character limit", () => {
      const medium = "a".repeat(450);
      const long = "a".repeat(501);
      expect(validatePlatformCharacterLimit("threads", medium).valid).toBe(true);
      expect(validatePlatformCharacterLimit("threads", long).valid).toBe(false);
    });

    it("validates LinkedIn 3000 character limit", () => {
      const long = "a".repeat(2500);
      expect(validatePlatformCharacterLimit("linkedin", long).valid).toBe(true);
    });
  });

  describe("SocialStudioService CRUD", () => {
    it("creates a draft post with auto-detected title and media type", async () => {
      const post = await service.createPost(userId, {
        content: "Announcing our new feature!\nCheck this out.",
        platform: "x",
        media_urls: ["https://example.com/screenshot.png"],
      });

      expect(post.id).toBeDefined();
      expect(post.title).toBe("Announcing our new feature!");
      expect(post.platform).toBe("x");
      expect(post.media_type).toBe("image");
      expect(post.status).toBe("draft");
    });

    it("throws when post exceeds platform character limit", async () => {
      await expect(
        service.createPost(userId, {
          content: "x".repeat(300),
          platform: "x",
        })
      ).rejects.toThrow("Content exceeds character limit for X");
    });

    it("updates post content and manages published_at timestamp", async () => {
      const post = await service.createPost(userId, {
        content: "Drafting an update",
        platform: "linkedin",
      });

      const updated = await service.updatePost(userId, post.id, {
        content: "Updated draft content",
        status: "published",
      });

      expect(updated?.content).toBe("Updated draft content");
      expect(updated?.status).toBe("published");
      expect(updated?.published_at).toBeDefined();
    });

    it("schedules a post", async () => {
      const post = await service.createPost(userId, {
        content: "Scheduled drop for tomorrow morning",
        platform: "threads",
      });

      const scheduleTime = new Date(Date.now() + 86400000).toISOString();
      const scheduled = await service.schedulePost(userId, post.id, scheduleTime);

      expect(scheduled?.status).toBe("scheduled");
      expect(scheduled?.scheduled_at).toBe(scheduleTime);
    });

    it("deletes a post", async () => {
      const post = await service.createPost(userId, {
        content: "Temporary test post",
      });

      const deleted = await service.deletePost(userId, post.id);
      expect(deleted).toBe(true);

      const found = await service.getPost(userId, post.id);
      expect(found).toBeNull();
    });
  });
});
