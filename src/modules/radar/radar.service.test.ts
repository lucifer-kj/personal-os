import { describe, it, expect, beforeEach, vi } from "vitest";
import { RadarService } from "./radar.service";
import { InMemoryRadarRepository } from "./radar.repository";
import * as rssService from "./rss.service";
import { InMemoryNoteRepository } from "@/modules/notes/note.repository";
import { NoteService } from "@/modules/notes/note.service";
import { InMemoryTaskRepository } from "@/modules/tasks/task.repository";
import { InMemoryProjectRepository } from "@/modules/projects/project.repository";
import { InMemorySocialPostRepository } from "@/modules/studio/studio.repository";
import { SocialStudioService } from "@/modules/studio/studio.service";

describe("RadarService", () => {
  let repo: InMemoryRadarRepository;
  let service: RadarService;
  const userId = "test-user-1";

  beforeEach(() => {
    repo = new InMemoryRadarRepository();
    service = new RadarService(repo);
    vi.clearAllMocks();
  });

  it("subscribes to a feed and ingests initial articles", async () => {
    vi.spyOn(rssService, "fetchAndParseFeed").mockResolvedValueOnce({
      title: "Hacker News: Front Page",
      siteUrl: "https://news.ycombinator.com",
      items: [
        {
          title: "Personal OS launches locally",
          url: "https://news.ycombinator.com/item?id=123",
          author: "dang",
          summary: "A private single-user workstation",
          publishedAt: new Date().toISOString(),
        },
      ],
    });

    const feed = await service.subscribeFeed(userId, {
      url: "https://news.ycombinator.com/rss",
      category: "Tech",
    });

    expect(feed.id).toBeDefined();
    expect(feed.title).toBe("Hacker News: Front Page");
    expect(feed.category).toBe("Tech");

    const items = await service.listItems(userId);
    expect(items.length).toBe(1);
    expect(items[0].title).toBe("Personal OS launches locally");
    expect(items[0].is_read).toBe(false);
  });

  it("marks an item read and toggles starred", async () => {
    await repo.upsertItems(userId, "feed-1", [
      {
        title: "Deep Learning Breakthrough",
        url: "https://arxiv.org/abs/123",
        published_at: new Date().toISOString(),
      },
    ]);

    const items = await service.listItems(userId);
    const itemId = items[0].id;

    const read = await service.markItemRead(userId, itemId, true);
    expect(read?.is_read).toBe(true);

    const starred = await service.toggleItemStarred(userId, itemId);
    expect(starred?.is_starred).toBe(true);
  });

  it("promotes an item into a permanent Note", async () => {
    const noteRepo = new InMemoryNoteRepository();
    const taskRepo = new InMemoryTaskRepository();
    const projectRepo = new InMemoryProjectRepository();
    const noteService = new NoteService(noteRepo, projectRepo, taskRepo);

    await repo.upsertItems(userId, "feed-1", [
      {
        title: "Agentic Engineering Patterns",
        url: "https://deepmind.google/blog/agents",
        summary: "Autonomous workflows and harness patterns.",
        published_at: new Date().toISOString(),
      },
    ]);

    const items = await service.listItems(userId);
    const itemId = items[0].id;

    const note = await service.promoteToNote(userId, itemId, noteService, "My take on agents");
    expect(note.id).toBeDefined();
    expect(note.title).toBe("Agentic Engineering Patterns");
    expect(note.content).toContain("My take on agents");
    expect(note.tags).toContain("radar");

    const updatedItem = await service.getItem(userId, itemId);
    expect(updatedItem?.promoted_to_note_id).toBe(note.id);
    expect(updatedItem?.is_read).toBe(true);
  });

  it("promotes an item into a Social Studio Draft", async () => {
    const studioRepo = new InMemorySocialPostRepository();
    const studioService = new SocialStudioService(studioRepo);

    await repo.upsertItems(userId, "feed-1", [
      {
        title: "State of Next.js 16",
        url: "https://nextjs.org/blog/16",
        summary: "Turbopack is now default with Partial Prerendering.",
        published_at: new Date().toISOString(),
      },
    ]);

    const items = await service.listItems(userId);
    const itemId = items[0].id;

    const post = await service.promoteToSocialPost(userId, itemId, studioService, "x");
    expect(post.id).toBeDefined();
    expect(post.platform).toBe("x");
    expect(post.status).toBe("draft");
    expect(post.content).toContain("State of Next.js 16");

    const updatedItem = await service.getItem(userId, itemId);
    expect(updatedItem?.promoted_to_post_id).toBe(post.id);
  });
});
