import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getRequestContext, DEFAULT_DEV_USER_ID } from "./context";

describe("getRequestContext Single-Pass Context & Security Guard Tests", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("Production Environment", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
    });

    it("returns null when no valid session is present", async () => {
      const req = new Request("http://localhost:3000/api/v1/tasks");
      const ctx = await getRequestContext(req);
      expect(ctx).toBeNull();
    });

    it("strictly rejects test headers and returns null", async () => {
      const req = new Request("http://localhost:3000/api/v1/tasks", {
        headers: { "x-test-user-id": "fake-admin-uuid" },
      });
      const ctx = await getRequestContext(req);
      expect(ctx).toBeNull();
    });
  });

  describe("Test Environment", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "test");
    });

    it("returns null when x-unauthenticated is true", async () => {
      const req = new Request("http://localhost:3000/api/v1/tasks", {
        headers: { "x-unauthenticated": "true" },
      });
      const ctx = await getRequestContext(req);
      expect(ctx).toBeNull();
    });

    it("returns test user identity when x-test-user-id header is supplied", async () => {
      const testId = "custom-test-uuid";
      const req = new Request("http://localhost:3000/api/v1/tasks", {
        headers: { "x-test-user-id": testId },
      });
      const ctx = await getRequestContext(req);
      expect(ctx).not.toBeNull();
      expect(ctx?.user.id).toBe(testId);
    });

    it("returns default test user when running in test mode without headers", async () => {
      const req = new Request("http://localhost:3000/api/v1/tasks");
      const ctx = await getRequestContext(req);
      expect(ctx).not.toBeNull();
      expect(ctx?.user.id).toBe(DEFAULT_DEV_USER_ID);
    });
  });
});
