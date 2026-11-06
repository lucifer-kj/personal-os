import { describe, it, expect, beforeEach } from "vitest";
import { TaskService } from "./task.service";
import { getInMemoryTaskRepository } from "./task.repository";

describe("TaskService domain logic & ownership isolation", () => {
  const repo = getInMemoryTaskRepository();
  const service = new TaskService(repo);

  const USER_A = "00000000-0000-0000-0000-000000000001";
  const USER_B = "00000000-0000-0000-0000-000000000002";

  beforeEach(() => {
    repo.clear();
  });

  it("creates a task with correct defaults and user ownership", async () => {
    const task = await service.createTask(USER_A, {
      title: "Write design doc",
      priority: "high",
    });

    expect(task.id).toBeDefined();
    expect(task.user_id).toBe(USER_A);
    expect(task.title).toBe("Write design doc");
    expect(task.status).toBe("todo");
    expect(task.priority).toBe("high");
    expect(task.completed_at).toBeNull();
  });

  it("completes a task and records completed_at timestamp", async () => {
    const task = await service.createTask(USER_A, { title: "Draft budget" });
    expect(task.completed_at).toBeNull();

    const completed = await service.completeTask(USER_A, task.id);
    expect(completed).not.toBeNull();
    expect(completed?.status).toBe("completed");
    expect(completed?.completed_at).toBeDefined();
    expect(typeof completed?.completed_at).toBe("string");
  });

  it("reopens a completed task and clears completed_at", async () => {
    const task = await service.createTask(USER_A, { title: "Fix bug" });
    await service.completeTask(USER_A, task.id);

    const reopened = await service.reopenTask(USER_A, task.id);
    expect(reopened).not.toBeNull();
    expect(reopened?.status).toBe("todo");
    expect(reopened?.completed_at).toBeNull();
  });

  it("automatically synchronizes completed_at when status updated via updateTask", async () => {
    const task = await service.createTask(USER_A, { title: "Conduct interview" });

    // Update status to completed
    const updated = await service.updateTask(USER_A, task.id, { status: "completed" });
    expect(updated?.completed_at).not.toBeNull();

    // Update status back to in_progress
    const inProgress = await service.updateTask(USER_A, task.id, { status: "in_progress" });
    expect(inProgress?.completed_at).toBeNull();
  });

  it("enforces strict user isolation: User B cannot access or modify User A tasks", async () => {
    const taskA = await service.createTask(USER_A, { title: "User A Confidential Task" });

    // User B tries to read User A task
    const readAttempt = await service.getTask(USER_B, taskA.id);
    expect(readAttempt).toBeNull();

    // User B tries to complete User A task
    const completeAttempt = await service.completeTask(USER_B, taskA.id);
    expect(completeAttempt).toBeNull();

    // User B tries to delete User A task
    const deleteAttempt = await service.deleteTask(USER_B, taskA.id);
    expect(deleteAttempt).toBe(false);

    // Task still intact for User A
    const original = await service.getTask(USER_A, taskA.id);
    expect(original).not.toBeNull();
  });

  it("filters tasks correctly by status and priority", async () => {
    await service.createTask(USER_A, { title: "Task 1", priority: "low", status: "todo" });
    await service.createTask(USER_A, { title: "Task 2", priority: "urgent", status: "completed" });
    await service.createTask(USER_A, { title: "Task 3", priority: "high", status: "todo" });

    const urgentOnly = await service.listTasks(USER_A, { priority: "urgent" });
    expect(urgentOnly.total).toBe(1);
    expect(urgentOnly.tasks[0].title).toBe("Task 2");

    const activeOnly = await service.listTasks(USER_A, { status: "todo" });
    expect(activeOnly.total).toBe(2);
  });
});
