import { describe, it, expect, beforeEach } from "vitest";
import { FocusService } from "./focus.service";
import { InMemoryFocusRepository } from "./focus.repository";
import { InMemoryTaskRepository } from "../tasks/task.repository";

describe("FocusService domain service", () => {
  let focusRepo: InMemoryFocusRepository;
  let taskRepo: InMemoryTaskRepository;
  let service: FocusService;
  const userId = "00000000-0000-0000-0000-000000000001";

  beforeEach(() => {
    focusRepo = new InMemoryFocusRepository();
    taskRepo = new InMemoryTaskRepository();
    service = new FocusService(focusRepo, taskRepo);
  });

  it("starts a focus session successfully", async () => {
    const active = await service.startSession({
      user_id: userId,
      session_mode: "deep_work",
      planned_duration_seconds: 1500, // 25m
      description: "Code review",
    });

    expect(active.session.status).toBe("running");
    expect(active.session.session_mode).toBe("deep_work");
    expect(active.remaining_seconds).toBe(1500);
    expect(active.timeEntry.ended_at).toBeNull();
  });

  it("prevents starting a second active session concurrently", async () => {
    await service.startSession({
      user_id: userId,
      planned_duration_seconds: 1800,
    });

    await expect(
      service.startSession({
        user_id: userId,
        planned_duration_seconds: 1800,
      })
    ).rejects.toThrow("An active focus session is already in progress");
  });

  it("pauses and resumes a session accurately tracking paused duration", async () => {
    const active = await service.startSession({
      user_id: userId,
      planned_duration_seconds: 1500,
    });

    const paused = await service.pauseSession(active.session.id, userId);
    expect(paused.session.status).toBe("paused");
    expect(paused.session.paused_at).not.toBeNull();

    const resumed = await service.resumeSession(active.session.id, userId);
    expect(resumed.session.status).toBe("running");
    expect(resumed.session.paused_at).toBeNull();
  });

  it("completes a session and rolls up minutes into the linked task", async () => {
    const task = await taskRepo.create(userId, {
      title: "Write documentation",
      actual_minutes: 10,
    });

    const active = await service.startSession({
      user_id: userId,
      task_id: task.id,
      planned_duration_seconds: 1200,
    });

    const result = await service.completeSession(active.session.id, userId, {
      session_rating: 5,
      notes: "Crushed it",
      mark_task_completed: true,
    });

    expect(result.session.status).toBe("completed");
    expect(result.session.session_rating).toBe(5);
    expect(result.timeEntry.ended_at).not.toBeNull();

    // Verify task rollup
    const updatedTask = await taskRepo.findById(userId, task.id);
    expect(updatedTask?.status).toBe("completed");
  });

  it("abandons a session cleanly without affecting task status", async () => {
    const task = await taskRepo.create(userId, {
      title: "Task in progress",
      status: "todo",
    });

    const active = await service.startSession({
      user_id: userId,
      task_id: task.id,
      planned_duration_seconds: 1800,
    });

    const result = await service.abandonSession(
      active.session.id,
      userId,
      "Urgent interruption"
    );

    expect(result.session.status).toBe("abandoned");
    expect(result.session.notes).toContain("Urgent interruption");

    const unchangedTask = await taskRepo.findById(userId, task.id);
    expect(unchangedTask?.status).toBe("todo");
  });
});
