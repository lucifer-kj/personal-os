import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createClient } from "./server";
import { ConfigurationError, InfrastructureError } from "@/lib/errors";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { getInboxRepository } from "@/modules/inbox/inbox.repository";
import { getNoteRepository } from "@/modules/notes/note.repository";
import { getProjectRepository } from "@/modules/projects/project.repository";
import { getCalendarRepository } from "@/modules/calendar/calendar.repository";
import { getFocusRepository } from "@/modules/focus/focus.repository";
import { getHabitRepository } from "@/modules/habits/habit.repository";
import { getJournalRepository } from "@/modules/journal/journal.repository";
import { getDayRepository } from "@/modules/day/day.repository";
import { getSearchRepository } from "@/modules/search/search.repository";
import { getRadarRepository } from "@/modules/radar/radar.repository";
import { getSocialPostRepository } from "@/modules/studio/studio.repository";

describe("Supabase Server Client & Repository Production Persistence Guards", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Server Client Configuration Guard", () => {
    it("throws ConfigurationError in production when Supabase URL or Key is missing", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

      await expect(createClient()).rejects.toThrow(ConfigurationError);
    });

    it("returns null in non-production environments when Supabase credentials are not set", async () => {
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

      const client = await createClient();
      expect(client).toBeNull();
    });
  });

  describe("Repository Factories Persistence Fallback Guard", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
    });

    it("throws InfrastructureError in production when task repository is called with null client", () => {
      expect(() => getTaskRepository(null)).toThrow(InfrastructureError);
      expect(() => getTaskRepository()).toThrow(InfrastructureError);
    });

    it("throws InfrastructureError in production for all core domain repository factories", () => {
      expect(() => getInboxRepository(null)).toThrow(InfrastructureError);
      expect(() => getNoteRepository(null)).toThrow(InfrastructureError);
      expect(() => getProjectRepository(null)).toThrow(InfrastructureError);
      expect(() => getCalendarRepository(null)).toThrow(InfrastructureError);
      expect(() => getFocusRepository(null)).toThrow(InfrastructureError);
      expect(() => getHabitRepository(null)).toThrow(InfrastructureError);
      expect(() => getJournalRepository(null)).toThrow(InfrastructureError);
      expect(() => getDayRepository(null)).toThrow(InfrastructureError);
      expect(() => getSearchRepository(null)).toThrow(InfrastructureError);
      expect(() => getRadarRepository(null)).toThrow(InfrastructureError);
      expect(() => getSocialPostRepository(null)).toThrow(InfrastructureError);
    });
  });

  describe("Repository Factories Test Fallback", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "test");
    });

    it("returns in-memory instances in test mode when client is null", () => {
      expect(getTaskRepository(null)).toBeDefined();
      expect(getInboxRepository(null)).toBeDefined();
      expect(getNoteRepository(null)).toBeDefined();
    });
  });
});
