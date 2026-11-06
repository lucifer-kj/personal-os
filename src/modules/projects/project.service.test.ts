import { describe, it, expect, beforeEach } from "vitest";
import { ProjectService } from "./project.service";
import { getInMemoryProjectRepository } from "./project.repository";
import { getInMemoryTaskRepository } from "@/modules/tasks/task.repository";

describe("ProjectService domain logic, progress calculations & user isolation", () => {
  const projectRepo = getInMemoryProjectRepository();
  const taskRepo = getInMemoryTaskRepository();
  const service = new ProjectService(projectRepo, taskRepo);

  const USER_A = "00000000-0000-0000-0000-000000000001";
  const USER_B = "00000000-0000-0000-0000-000000000002";

  beforeEach(() => {
    projectRepo.clear();
    taskRepo.clear();
  });

  it("creates a project with default status and priority", async () => {
    const project = await service.createProject(USER_A, {
      name: "Personal OS Architecture",
      priority: "high",
    });

    expect(project.id).toBeDefined();
    expect(project.user_id).toBe(USER_A);
    expect(project.name).toBe("Personal OS Architecture");
    expect(project.status).toBe("active");
    expect(project.priority).toBe("high");
    expect(project.completed_at).toBeNull();
  });

  it("calculates progress percentage dynamically from attached tasks", async () => {
    const project = await service.createProject(USER_A, { name: "Web App" });

    // Initially 0% progress
    let details = await service.getProject(USER_A, project.id);
    expect(details?.stats.progress_percent).toBe(0);
    expect(details?.stats.total_tasks).toBe(0);

    // Attach 2 tasks to project (1 completed, 1 todo)
    await taskRepo.create(USER_A, {
      title: "Task 1",
      project_id: project.id,
      status: "completed",
    });
    await taskRepo.create(USER_A, {
      title: "Task 2",
      project_id: project.id,
      status: "todo",
    });

    // 1 out of 2 = 50% progress
    details = await service.getProject(USER_A, project.id);
    expect(details?.stats.total_tasks).toBe(2);
    expect(details?.stats.completed_tasks).toBe(1);
    expect(details?.stats.progress_percent).toBe(50);
  });

  it("manages milestones and computes milestone completion stats", async () => {
    const project = await service.createProject(USER_A, { name: "Milestone Test Project" });

    const m1 = await service.createMilestone(USER_A, project.id, {
      title: "M1: Schema Ready",
    });
    expect(m1.status).toBe("pending");

    const m2 = await service.createMilestone(USER_A, project.id, {
      title: "M2: APIs Live",
    });
    expect(m2.status).toBe("pending");

    // Toggle M1 to completed
    const toggled = await service.toggleMilestone(USER_A, project.id, m1.id);
    expect(toggled?.status).toBe("completed");
    expect(toggled?.completed_at).toBeDefined();

    const details = await service.getProject(USER_A, project.id);
    expect(details?.stats.total_milestones).toBe(2);
    expect(details?.stats.completed_milestones).toBe(1);
    expect(details?.milestones?.length).toBe(2);
  });

  it("enforces strict user isolation: User B cannot view or modify User A's project", async () => {
    const projectA = await service.createProject(USER_A, { name: "Secret Roadmap" });

    // User B tries to get project
    const readAttempt = await service.getProject(USER_B, projectA.id);
    expect(readAttempt).toBeNull();

    // User B tries to update project
    const updateAttempt = await service.updateProject(USER_B, projectA.id, { name: "Hacked" });
    expect(updateAttempt).toBeNull();

    // User B tries to delete project
    const deleteAttempt = await service.deleteProject(USER_B, projectA.id);
    expect(deleteAttempt).toBe(false);

    // User B tries to add milestone to project A
    await expect(
      service.createMilestone(USER_B, projectA.id, { title: "Malicious Milestone" })
    ).rejects.toThrow();
  });
});
