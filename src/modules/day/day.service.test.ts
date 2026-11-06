import { describe, it, expect, beforeEach } from "vitest";
import { DayService } from "./day.service";
import { InMemoryDayRepository } from "./day.repository";
import { getInMemoryTaskRepository } from "@/modules/tasks/task.repository";

describe("DayService", () => {
  let dayRepo: InMemoryDayRepository;
  let taskRepo = getInMemoryTaskRepository();
  let service: DayService;

  const USER_ID = "00000000-0000-0000-0000-000000000001";
  const TODAY = "2026-11-06";
  const YESTERDAY = "2026-11-05";

  beforeEach(() => {
    dayRepo = new InMemoryDayRepository();
    taskRepo = getInMemoryTaskRepository();
    dayRepo.clear();
    taskRepo.clear();
    service = new DayService(dayRepo, taskRepo);
  });

  it("returns day overview with empty agenda when no tasks exist", async () => {
    const overview = await service.getDayOverview(USER_ID, TODAY);
    expect(overview.date).toBe(TODAY);
    expect(overview.tasks_today).toEqual([]);
    expect(overview.overdue_tasks).toEqual([]);
    expect(overview.metrics.total_scheduled).toBe(0);
    expect(overview.intention).toBeNull();
  });

  it("correctly identifies tasks today and overdue tasks", async () => {
    // Task today
    await taskRepo.create(USER_ID, {
      title: "Today Task 1",
      due_date: TODAY,
      estimated_minutes: 45,
      status: "todo",
    });

    // Completed today task
    await taskRepo.create(USER_ID, {
      title: "Today Task 2 Completed",
      due_date: TODAY,
      estimated_minutes: 30,
      actual_minutes: 25,
      status: "completed",
    });

    // Overdue task (due yesterday, not completed)
    await taskRepo.create(USER_ID, {
      title: "Overdue Task",
      due_date: YESTERDAY,
      status: "todo",
    });

    // Future task (due tomorrow)
    await taskRepo.create(USER_ID, {
      title: "Future Task",
      due_date: "2026-11-07",
      status: "todo",
    });

    const overview = await service.getDayOverview(USER_ID, TODAY);
    expect(overview.tasks_today.length).toBe(2);
    expect(overview.overdue_tasks.length).toBe(1);
    expect(overview.overdue_tasks[0].title).toBe("Overdue Task");

    expect(overview.metrics.total_scheduled).toBe(2);
    expect(overview.metrics.completed_count).toBe(1);
    expect(overview.metrics.pending_count).toBe(1);
    expect(overview.metrics.estimated_minutes_total).toBe(75);
    expect(overview.metrics.actual_minutes_total).toBe(25);
  });

  it("sets and retrieves daily focus intention", async () => {
    await service.setIntention(USER_ID, TODAY, "Focus on deep architectural design");

    const overview = await service.getDayOverview(USER_ID, TODAY);
    expect(overview.intention).toBe("Focus on deep architectural design");
    expect(overview.plan?.intention).toBe("Focus on deep architectural design");
  });

  it("sets shutdown notes for day reflection", async () => {
    const updated = await service.setShutdownNotes(USER_ID, TODAY, "All goals met smoothly.");
    expect(updated.shutdown_notes).toBe("All goals met smoothly.");
  });
});
