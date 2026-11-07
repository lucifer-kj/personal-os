import { describe, it, expect, beforeEach } from "vitest";
import { HabitService } from "./habit.service";
import { InMemoryHabitRepository } from "./habit.repository";

describe("HabitService", () => {
  let repo: InMemoryHabitRepository;
  let service: HabitService;
  const userId = "test-user-123";

  beforeEach(() => {
    repo = new InMemoryHabitRepository();
    service = new HabitService(repo);
  });

  it("creates a habit and lists it with streak calculations", async () => {
    const habit = await service.createHabit(userId, {
      name: "Daily Reading",
      frequency: "daily",
    });

    expect(habit.id).toBeDefined();
    expect(habit.name).toBe("Daily Reading");

    const habits = await service.listHabits(userId, { date: "2026-11-06" });
    expect(habits).toHaveLength(1);
    expect(habits[0].current_streak).toBe(0);
    expect(habits[0].is_completed_today).toBe(false);
  });

  it("calculates consecutive streak correctly", async () => {
    const habit = await service.createHabit(userId, {
      name: "Hydration",
      frequency: "daily",
    });

    // Check-in yesterday and today
    await service.logCheckin(userId, habit.id, { date: "2026-11-05", completed: true });
    await service.logCheckin(userId, habit.id, { date: "2026-11-06", completed: true });

    const enriched = await service.getHabitById(userId, habit.id, "2026-11-06");
    expect(enriched).not.toBeNull();
    expect(enriched?.is_completed_today).toBe(true);
    expect(enriched?.current_streak).toBe(2);
    expect(enriched?.longest_streak).toBe(2);
  });

  it("maintains current streak when today is not yet completed but yesterday was", async () => {
    const habit = await service.createHabit(userId, {
      name: "Stretching",
      frequency: "daily",
    });

    // Completed 2026-11-04 and 2026-11-05
    await service.logCheckin(userId, habit.id, { date: "2026-11-04", completed: true });
    await service.logCheckin(userId, habit.id, { date: "2026-11-05", completed: true });

    // Checking on 2026-11-06 before check-in
    const enriched = await service.getHabitById(userId, habit.id, "2026-11-06");
    expect(enriched?.is_completed_today).toBe(false);
    expect(enriched?.current_streak).toBe(2); // Streak intact from yesterday
  });

  it("toggles checkin on and off cleanly", async () => {
    const habit = await service.createHabit(userId, {
      name: "Journaling",
    });

    const check1 = await service.toggleCheckin(userId, habit.id, "2026-11-06");
    expect(check1.completed).toBe(true);

    const check2 = await service.toggleCheckin(userId, habit.id, "2026-11-06");
    expect(check2.completed).toBe(false);
  });

  it("calculates overall summary stats", async () => {
    const habit1 = await service.createHabit(userId, { name: "Habit 1" });
    await service.createHabit(userId, { name: "Habit 2" });

    await service.logCheckin(userId, habit1.id, { date: "2026-11-06", completed: true });

    const stats = await service.getSummaryStats(userId, "2026-11-06");
    expect(stats.total_habits).toBe(2);
    expect(stats.completed_today).toBe(1);
    expect(stats.completion_rate_today).toBe(50);
  });
});
