import { describe, it, expect, beforeEach } from "vitest";
import { JournalService } from "./journal.service";
import { InMemoryJournalRepository } from "./journal.repository";

describe("JournalService", () => {
  let repo: InMemoryJournalRepository;
  let service: JournalService;
  const userId = "test-user-journal";

  beforeEach(() => {
    repo = new InMemoryJournalRepository();
    service = new JournalService(repo);
  });

  it("saves and retrieves journal entry by date", async () => {
    const entry = await service.saveEntry(userId, {
      entry_date: "2026-11-06",
      title: "Evening Reflections",
      content: "A peaceful and deliberate day of building.",
      mood: "great",
      energy_level: 4,
      gratitude: ["Focus", "Coffee"],
    });

    expect(entry.id).toBeDefined();
    expect(entry.entry_date).toBe("2026-11-06");

    const fetched = await service.getEntryByDate(userId, "2026-11-06");
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe("Evening Reflections");
    expect(fetched?.gratitude).toEqual(["Focus", "Coffee"]);
  });

  it("upserts entry when saving for the same date", async () => {
    await service.saveEntry(userId, {
      entry_date: "2026-11-06",
      title: "Initial Title",
      content: "Initial Content",
    });

    const updated = await service.saveEntry(userId, {
      entry_date: "2026-11-06",
      title: "Updated Title",
      content: "Expanded Content",
      mood: "good",
    });

    expect(updated.title).toBe("Updated Title");
    expect(updated.content).toBe("Expanded Content");
    expect(updated.mood).toBe("good");

    const { total } = await service.listEntries(userId);
    expect(total).toBe(1); // One entry preserved
  });

  it("calculates mood trends and average energy", async () => {
    const today = new Date().toISOString().split("T")[0];

    await service.saveEntry(userId, {
      entry_date: today,
      mood: "great",
      energy_level: 5,
    });

    const trends = await service.getMoodTrends(userId, 7);
    expect(trends.entries_count).toBe(1);
    expect(trends.mood_counts.great).toBe(1);
    expect(trends.average_energy).toBe(5);
  });

  it("deletes entry cleanly", async () => {
    const entry = await service.saveEntry(userId, {
      entry_date: "2026-11-06",
      content: "To be deleted",
    });

    const success = await service.deleteEntry(userId, entry.id);
    expect(success).toBe(true);

    const check = await service.getEntryById(userId, entry.id);
    expect(check).toBeNull();
  });
});
