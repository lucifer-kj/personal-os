import { describe, it, expect, beforeEach } from "vitest";
import { InMemorySearchRepository } from "./search.repository";
import { SearchService } from "./search.service";

describe("SearchService", () => {
  let searchRepo: InMemorySearchRepository;
  let service: SearchService;
  const userId = "user-123";

  beforeEach(() => {
    searchRepo = new InMemorySearchRepository([
      {
        id: "task-1",
        userId,
        type: "task",
        title: "Deploy V1 Release",
        description: "Deploy production build and verify smoke tests",
        url: "/tasks?selected=task-1",
        status: "in_progress",
      },
      {
        id: "task-2",
        userId,
        type: "task",
        title: "Write API Documentation",
        description: "Document REST endpoints for developer portal",
        url: "/tasks?selected=task-2",
        status: "todo",
      },
      {
        id: "proj-1",
        userId,
        type: "project",
        title: "Product Launch Q4",
        description: "Coordinating all deliverables for Q4 launch",
        url: "/projects/proj-1",
        status: "active",
      },
      {
        id: "note-1",
        userId,
        type: "note",
        title: "Architecture Principles",
        description: "Deep dive into clean architecture and modular boundaries",
        url: "/notes?noteId=note-1",
      },
      {
        id: "habit-1",
        userId,
        type: "habit",
        title: "Morning Meditation",
        description: "15 minutes mindfulness breathing",
        url: "/habits",
      },
      {
        id: "inbox-1",
        userId,
        type: "inbox",
        title: "Check out new Turbopack release notes",
        description: "Check out new Turbopack release notes",
        url: "/inbox",
      },
      {
        id: "task-other",
        userId: "other-user",
        type: "task",
        title: "Private Secret Task",
        description: "Should never be visible to user-123",
        url: "/tasks?selected=task-other",
      },
    ]);

    service = new SearchService(searchRepo);
  });

  it("returns navigation and action defaults when search query is empty", async () => {
    const result = await service.searchAll(userId, { q: "" });
    expect(result.results).toHaveLength(0);
    expect(result.navigation.length).toBeGreaterThanOrEqual(8);
    expect(result.actions.length).toBeGreaterThanOrEqual(5);
  });

  it("searches across multiple domain types matching query", async () => {
    const result = await service.searchAll(userId, { q: "launch" });
    // Should match "Deploy V1 Release" (no), "Product Launch Q4" (yes in title), and "Deploy production build..." (in description)
    expect(result.results.length).toBeGreaterThanOrEqual(1);
    const project = result.results.find((r) => r.type === "project");
    expect(project).toBeDefined();
    expect(project?.title).toBe("Product Launch Q4");
  });

  it("strictly enforces owner boundary and ignores other users' data", async () => {
    const result = await service.searchAll(userId, { q: "Secret" });
    expect(result.results).toHaveLength(0);
  });

  it("filters navigation commands and quick actions matching query keywords", async () => {
    const result = await service.searchAll(userId, { q: "calendar" });
    expect(result.navigation.some((n) => n.url === "/calendar")).toBe(true);

    const taskActionResult = await service.searchAll(userId, { q: "create task" });
    expect(taskActionResult.actions.some((a) => a.actionId === "new-task")).toBe(true);
  });

  it("respects type filtering when specified", async () => {
    const result = await service.searchAll(userId, {
      q: "Architecture",
      types: ["note"],
    });
    expect(result.results.every((r) => r.type === "note")).toBe(true);
    expect(result.results[0].title).toBe("Architecture Principles");
  });
});
