import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getAuthenticatedUser, DEFAULT_DEV_USER_ID } from "./auth";

describe("getAuthenticatedUser Security & Environment Guard Tests", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("Production Environment (NODE_ENV === 'production')", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
    });

    it("fails closed and returns null when no Supabase session exists", async () => {
      const req = new Request("http://localhost:3000/api/v1/tasks");
      const user = await getAuthenticatedUser(req);
      expect(user).toBeNull();
    });

    it("fails closed when request is called without arguments", async () => {
      const user = await getAuthenticatedUser();
      expect(user).toBeNull();
    });

    it("strictly ignores x-test-user-id header in production (prevents impersonation)", async () => {
      const maliciousUserId = "99999999-9999-9999-9999-999999999999";
      const req = new Request("http://localhost:3000/api/v1/tasks", {
        headers: { "x-test-user-id": maliciousUserId },
      });

      const user = await getAuthenticatedUser(req);
      expect(user).toBeNull();
    });

    it("never returns default development identity in production", async () => {
      const req = new Request("http://localhost:3000/api/v1/notes");
      const user = await getAuthenticatedUser(req);
      expect(user).toBeNull();
      expect(user?.id).not.toBe(DEFAULT_DEV_USER_ID);
    });
  });

  describe("Test Environment (NODE_ENV === 'test')", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "test");
    });

    it("returns null when x-unauthenticated is true", async () => {
      const req = new Request("http://localhost:3000/api/v1/tasks", {
        headers: { "x-unauthenticated": "true" },
      });
      const user = await getAuthenticatedUser(req);
      expect(user).toBeNull();
    });

    it("accepts x-test-user-id in test environment for isolated test suites", async () => {
      const testId = "11111111-1111-1111-1111-111111111111";
      const req = new Request("http://localhost:3000/api/v1/tasks", {
        headers: { "x-test-user-id": testId },
      });
      const user = await getAuthenticatedUser(req);
      expect(user).not.toBeNull();
      expect(user?.id).toBe(testId);
      expect(user?.email).toBe("test@personal-os.local");
    });

    it("provides test identity fallback when running unit tests without headers", async () => {
      const req = new Request("http://localhost:3000/api/v1/tasks");
      const user = await getAuthenticatedUser(req);
      expect(user).not.toBeNull();
      expect(user?.id).toBe(DEFAULT_DEV_USER_ID);
    });
  });
});
