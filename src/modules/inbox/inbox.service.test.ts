import { describe, it, expect, beforeEach } from "vitest";
import { InboxService } from "./inbox.service";
import { InMemoryInboxRepository } from "./inbox.repository";
import { InMemoryTaskRepository } from "../tasks/task.repository";

describe("InboxService domain service", () => {
  let inboxRepo: InMemoryInboxRepository;
  let taskRepo: InMemoryTaskRepository;
  let service: InboxService;
  const userId = "00000000-0000-0000-0000-000000000001";

  beforeEach(() => {
    inboxRepo = new InMemoryInboxRepository();
    taskRepo = new InMemoryTaskRepository();
    service = new InboxService(inboxRepo, taskRepo);
  });

  it("captures a new inbox item quickly", async () => {
    const item = await service.captureItem({
      user_id: userId,
      title: "Look into Tailwind v4 container queries",
      capture_type: "idea",
      url: "https://tailwindcss.com",
    });

    expect(item.id).toBeDefined();
    expect(item.status).toBe("unprocessed");
    expect(item.capture_type).toBe("idea");
    expect(item.url).toBe("https://tailwindcss.com");
  });

  it("lists unprocessed items by default", async () => {
    await service.captureItem({ user_id: userId, title: "Item 1" });
    await service.captureItem({ user_id: userId, title: "Item 2" });

    const { items, total } = await service.listItems(userId);
    expect(total).toBe(2);
    expect(items.length).toBe(2);
  });

  it("processes an inbox item into a task atomically", async () => {
    const item = await service.captureItem({
      user_id: userId,
      title: "Prepare presentation slides",
      content: "Cover Q4 roadmap and metrics",
      capture_type: "task",
    });

    const result = await service.processItem(userId, item.id, {
      target_type: "task",
      priority: "high",
      due_date: "2026-11-15",
    });

    expect(result.item.status).toBe("processed");
    expect(result.item.converted_entity_type).toBe("task");
    expect(result.item.converted_entity_id).toBeDefined();

    // Verify task created
    const createdTask = await taskRepo.findById(userId, result.created_entity_id);
    expect(createdTask).not.toBeNull();
    expect(createdTask?.title).toBe("Prepare presentation slides");
    expect(createdTask?.priority).toBe("high");
    expect(createdTask?.due_date).toBe("2026-11-15");
    expect(createdTask?.source_type).toBe("inbox");
  });

  it("dismisses an inbox item", async () => {
    const item = await service.captureItem({
      user_id: userId,
      title: "Irrelevant link",
    });

    const dismissed = await service.dismissItem(userId, item.id);
    expect(dismissed.status).toBe("dismissed");

    const { items } = await service.listItems(userId, { status: "unprocessed" });
    expect(items.find((i) => i.id === item.id)).toBeUndefined();
  });
});
