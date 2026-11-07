import { describe, it, expect, beforeEach } from "vitest";
import { CalendarService } from "./calendar.service";
import { InMemoryCalendarRepository } from "./calendar.repository";
import { InMemoryTaskRepository } from "../tasks/task.repository";

describe("CalendarService", () => {
  let calendarRepo: InMemoryCalendarRepository;
  let taskRepo: InMemoryTaskRepository;
  let service: CalendarService;
  const userId = "test-user-123";

  beforeEach(() => {
    calendarRepo = new InMemoryCalendarRepository();
    taskRepo = new InMemoryTaskRepository();
    service = new CalendarService(calendarRepo, taskRepo);
  });

  it("creates a calendar event and detects no conflict when isolated", async () => {
    const result = await service.createEvent(userId, {
      title: "Morning Planning",
      event_type: "personal",
      start_at: "2026-11-06T08:00:00Z",
      end_at: "2026-11-06T09:00:00Z",
      all_day: false,
    });

    expect(result.event.id).toBeDefined();
    expect(result.event.title).toBe("Morning Planning");
    expect(result.conflict_advisory.has_conflict).toBe(false);
    expect(result.conflict_advisory.conflicting_events).toHaveLength(0);
  });

  it("returns conflict advisory when overlapping event exists, without blocking creation", async () => {
    // 1. Existing event from 09:00 to 10:30
    await service.createEvent(userId, {
      title: "Standup & Sync",
      event_type: "meeting",
      start_at: "2026-11-06T09:00:00Z",
      end_at: "2026-11-06T10:30:00Z",
      all_day: false,
    });

    // 2. Overlapping proposed event from 10:00 to 11:00
    const result = await service.createEvent(userId, {
      title: "Focus Block",
      event_type: "focus",
      start_at: "2026-11-06T10:00:00Z",
      end_at: "2026-11-06T11:00:00Z",
      all_day: false,
    });

    expect(result.event.id).toBeDefined();
    expect(result.conflict_advisory.has_conflict).toBe(true);
    expect(result.conflict_advisory.conflicting_events).toHaveLength(1);
    expect(result.conflict_advisory.conflicting_events[0]?.title).toBe("Standup & Sync");
  });

  it("filters events within a requested date-time range", async () => {
    await service.createEvent(userId, {
      title: "Event Today",
      start_at: "2026-11-06T10:00:00Z",
      end_at: "2026-11-06T11:00:00Z",
    });

    await service.createEvent(userId, {
      title: "Event Next Week",
      start_at: "2026-11-13T10:00:00Z",
      end_at: "2026-11-13T11:00:00Z",
    });

    const todayEvents = await service.listEvents(userId, {
      from: "2026-11-06T00:00:00Z",
      to: "2026-11-06T23:59:59Z",
    });

    expect(todayEvents).toHaveLength(1);
    expect(todayEvents[0]?.title).toBe("Event Today");
  });

  it("schedules a task block and synchronizes scheduled times to the task", async () => {
    const task = await taskRepo.create(userId, {
      title: "Complete M6 documentation",
      priority: "high",
    });

    const result = await service.scheduleTaskBlock(
      userId,
      task.id,
      "2026-11-06T14:00:00Z",
      60,
      undefined,
      "focus"
    );

    expect(result.event.title).toBe("Complete M6 documentation");
    expect(result.event.event_type).toBe("focus");
    expect(result.event.task_id).toBe(task.id);
    expect(result.event.end_at).toBe("2026-11-06T15:00:00.000Z");

    const updatedTask = await taskRepo.findById(userId, task.id);
    expect(updatedTask?.scheduled_start_at).toBe("2026-11-06T14:00:00.000Z");
    expect(updatedTask?.scheduled_end_at).toBe("2026-11-06T15:00:00.000Z");
  });

  it("moves an event and updates task schedule if linked", async () => {
    const task = await taskRepo.create(userId, {
      title: "Review Sprint",
    });

    const { event } = await service.createEvent(userId, {
      title: "Sprint Review",
      start_at: "2026-11-06T15:00:00Z",
      end_at: "2026-11-06T16:00:00Z",
      task_id: task.id,
    });

    const moveResult = await service.moveEvent(userId, event.id, {
      start_at: "2026-11-06T16:30:00Z",
      end_at: "2026-11-06T17:30:00Z",
    });

    expect(moveResult.event.start_at).toBe("2026-11-06T16:30:00Z");
    const updatedTask = await taskRepo.findById(userId, task.id);
    expect(updatedTask?.scheduled_start_at).toBe("2026-11-06T16:30:00Z");
  });
});
